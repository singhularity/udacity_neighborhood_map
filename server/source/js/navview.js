/**
 * Created by ssingh on 7/29/15.
 * Provides objects for Map and Map-markers
 * Implements the operations for adding Map, Map-markers and also for searching markers.
 */
/**
 *
 * @param propName Name of the property on which we want to filter the array
 * @param matchValue Value of the filter
 * @returns An array of elements matching the filter
 */
ko.observableArray.fn.filterByProperty = function(propName, matchValue) {
    return ko.pureComputed(function() {
        var allItems = this(),
            matchingItems = [];
        for (var i = 0; i < allItems.length; i++) {
            var current = allItems[i];
            if (ko.unwrap(current[propName]) === matchValue)
                matchingItems.push(current);
        }
        return matchingItems;
    }, this);
};

/**
 *
 * @type {{setMap: Function, getMap: Function, getSearchService: Function, getMapCenter: Function}}
 * Represents the Map on the page
 * -- Creates a new Map
 * -- Provides a search service for the Map
 */
var Map = {
    //Set the Map on page here
    setMap: function(valueAccessor, element) {
        var mapObj = ko.utils.unwrapObservable(valueAccessor());
        var latLng = new google.maps.LatLng(
            ko.utils.unwrapObservable(mapObj.lat),
            ko.utils.unwrapObservable(mapObj.lng));

        var options = {
            center: latLng,
            zoom: 13
        };
        this.map = new google.maps.Map(element, options);

        window.mapBounds = new google.maps.LatLngBounds();
        this.searchService = new google.maps.places.PlacesService(this.map);
        this.infoWindow = new google.maps.InfoWindow({
            content: ""
        });
    },
    getMap: function() {
        return this.map;
    },
    getMapCenter: function() {
        return {
            lat: ko.observable(40.7127),
            lng: ko.observable(-74.0059)
        };
    },
    getMapDimensions: function() {
        var aHeight = $('main').height() + 40;
        return {
            width: '100%',
            height: "" + aHeight + "px"
        };
    },
    setInfoWindow: function(content, googleMarker) {
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, googleMarker);
    },
    addMarkerOnMap: function(location, callback, type){
        var service = this.searchService;
        var request = {
            query: location,
            type: type
        };
        if (Offline.state == "down")
        {
            alert("No network");
        }
        else {
            service.textSearch(request, callback);
        }
    }
};

/**
 *
 * @param placeData
 * @param map
 * @constructor
 *
 * Represents the Marker
 * Allows creation of the Marker
 * Also provides an observable to toggle the visibility of the Marker
 * Allows adding a InfoWindow on the Marker
 */
var Marker = function(placeData, map) {
    var lat = placeData.geometry.location.lat(); // latitude from the place service
    var lon = placeData.geometry.location.lng(); // longitude from the place service
    var title = placeData.formatted_address; // name of the place from the place service
    var self = this;
    self.icon = {
        url: placeData.icon,
        size: new google.maps.Size(80, 80),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
    };
    self.title = ko.observable(title);
    self.name = placeData.name;
    self.content = ko.observable("");
    self.infolink = ko.observable("");

    //Create the Marker to be put on map here
    self.googleMarker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lon),
        animation: google.maps.Animation.DROP,
        icon: self.icon,
        map: map
    });

    //Set info window on Map Marker
    self.setClickEvent = function(content) {
        this.content(content);
        google.maps.event.addListener(self.googleMarker, 'click', function() {
            Map.setInfoWindow(content, self.googleMarker);
        });
    };

    //Controls the visibility of the marker on the map
    self.isVisible = ko.observable(false);

    self.isVisible.subscribe(function(visibility) {
        if (visibility) {
            self.googleMarker.setMap(map);
        } else {
            self.googleMarker.setMap(null);
        }
    });

    self.isVisible(true);

    //Set bounds of the Map to accomodate the new Marker
    var bounds = window.mapBounds;
    bounds.extend(new google.maps.LatLng(lat, lon));
    // fit the map to the new marker
    map.fitBounds(bounds);
    // center the map
    map.setCenter(bounds.getCenter());
};

/**
 *
 * @constructor
 * -- The boostrap point for KnockoutJS, it provides bindings needed to display Maps, Markers
 * and location list.
 * -- Maintains a list of current markers on the Map
 * -- Implements operations needed for toggling and searching Markers
 *
 */
function NeighborhoodViewModel() {
    var self = this;

    var infoFunctionsMap = {
        "City": {"google_name": "locality", func: addMarkerWithWikiInfo},
        "Business": {"google_name": "restaurant", func: addMarkerWithYelpInfo}
    };

    //Custom binding for the Map
    ko.bindingHandlers.mapBinder = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            Map.setMap(valueAccessor, element);
        }
    };

    self.centerMap = ko.observable(Map.getMapCenter());
    self.mapDimensions = ko.observable(Map.getMapDimensions());

    self.markers = ko.observableArray();
    self.locationLat = ko.observable("");
    self.availableTypes = ko.observableArray(["City", "Business"]);
    self.selectedType = ko.observable();

    //Add a new Marker usinf the Google Map Search Service
    self.addNewMarkerOnMap = function() {
        if (self.selectedType() === undefined)
        {
            alert("Please select the type of location!");
        }
        else{
            self.addMarkerWithInfo(self.locationLat(), self.selectedType());
        }
    };

    self.addMarkerWithInfo = function(location, type) {
        var callBackFunction = infoFunctionsMap[type].func;
        Map.addMarkerOnMap(location, callBackFunction, infoFunctionsMap[type].google_name);
    };

    function includeMarker(results, status) {
        var currentMap = Map.getMap();
        var newMarker = new Marker(results[0], currentMap);
        self.markers.push(newMarker);
        self.visibleMarkersCount(self.visibleMarkersCount() + 1);
        self.locationLat("");
        self.selectedType("");
        return newMarker;
    }

    //Callback that actually adds the Marker and also adds it to the list of Markers
    function addMarkerWithWikiInfo(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var newMarker = includeMarker(results, status);
            setDataFromWikipedia(newMarker);
        }
    }

    //Callback that actually adds the Marker and also adds it to the list of Markers
    function addMarkerWithYelpInfo(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var newMarker = includeMarker(results, status);
            setDataFromYelp(newMarker);
        }
    }

    self.toggle = ko.observable(true);
    self.titleSearch = ko.observable("");

    self.filteredMarkers = this.markers.filterByProperty("visible", true);
    self.visibleMarkersCount = ko.observable(0);

    //Keep track when there are no cards being displayed in the list
    self.showDummyCard = ko.computed(function() {
        return self.visibleMarkersCount() === 0 && self.toggle;
    });

    //Main function controlling the visibility of specific markers
    self.markerToggler = function(text) {
        self.visibleMarkersCount(0);
        for (var marker in self.markers()) {
            var markerObj = self.markers()[marker];
            markerObj.isVisible(markerObj.title().match(text) !== null);
            if (markerObj.isVisible())
                self.visibleMarkersCount(self.visibleMarkersCount() + 1);
        }
    };

    //Toggle to control all markers at once
    this.toggle.subscribe(function(newValue) {

        if (!newValue)
            self.markerToggler(null);
        else
            self.markerToggler("");
    });

    //Set visibility of markers based on search results
    this.toggleMarkersForSearch = function(value) {
        var text = new RegExp(value, 'i');
        self.markerToggler(text);
    };

    self.titleSearch.subscribe(self.toggleMarkersForSearch);
}

function initialize(neighborhood) {
    var localities = [
        "New York, NY", "London, UK", "Mumbai, India", "Paris, France"
    ];
    var businesses = ["Rockefeller Center, New York", "Learning Tower, Pisa"];

    for(var loc in localities) {
        neighborhood.addMarkerWithInfo(localities[loc], "City");
    }
    //for(var business in businesses) {
    //    neighborhood.addMarkerWithInfo(businesses[business], "Business");
    //}
}

function setDataFromWikipedia(marker){
    if (Offline.state == "down")
    {
        alert("No network");
    }
    else {
        $.ajax({
            url: '/wikiData?name=' + marker.name,
            type: 'GET',
            dataType: 'json',
            timeout: 5000,
            success: function (data) {
                var content = data.content;
                marker.setClickEvent(content);
                marker.infolink("https://en.wikipedia.org/wiki/" + marker.name);
            },
            error: function () {
                marker.setClickEvent('Could not get additional information.');
            }
        });
    }
}


function setDataFromYelp(marker){
    if (Offline.state == "down") {
        alert("No network");
    }
    else {
        $.ajax({
            url: '/yelpData?address=' + marker.name,
            type: 'GET',
            dataType: 'json',
            timeout: 5000,
            success: function (data) {
                var content;
                try {
                    content = "<ul><li id='summary'>" + data.Name + "</li></ul>";
                } catch (error) {
                    content = 'Could not get additional information.';
                }
                marker.setClickEvent(content);
                marker.infolink(data.url);
            },
            error: function () {
                marker.setClickEvent('Could not get additional information.');
            }
        });
    }
}


//Add a resize event to automatically resize map when window is resized.
$(window).resize(function() {
    google.maps.event.trigger(Map.getMap(), 'resize');
});

Offline.options = {
    // Should we check the connection status immediatly on page load.
    checkOnLoad: true,

    // Should we monitor AJAX requests to help decide if we have a connection.
    interceptRequests: true,

    requests: true,

    game: true
    //checks: {xhr: {url: '/heartbeat'}}
};

var run = function() {
    if (Offline.state === 'up') {
        Offline.check();
    }
};
setInterval(run, 5000);

var neighbourHood = new NeighborhoodViewModel();
ko.applyBindings(neighbourHood);
initialize(neighbourHood);