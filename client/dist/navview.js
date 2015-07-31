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
        var allItems = this(), matchingItems = [];
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
    setMap: function(valueAccessor, element)
    {
        var mapObj = ko.utils.unwrapObservable(valueAccessor());
        var latLng = new google.maps.LatLng(
            ko.utils.unwrapObservable(mapObj.lat),
            ko.utils.unwrapObservable(mapObj.lng));

        var options = { center: latLng,zoom: 5};
        this.map = new google.maps.Map(element, options);
        window.mapBounds = new google.maps.LatLngBounds();
        this.searchService = new google.maps.places.PlacesService(this.map);
    },
    getMap: function(){
        return this.map;
    },
    getSearchService: function(){
        return this.searchService;
    },
    getMapCenter: function() {
        return {
            lat: ko.observable(55),
            lng: ko.observable(11)
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
    var googleMarker;
    var lat = placeData.geometry.location.lat();  // latitude from the place service
    var lon = placeData.geometry.location.lng();  // longitude from the place service
    var title = placeData.formatted_address;   // name of the place from the place service
    var self = this;
    self.title = ko.observable(title);
    self.name = placeData.name;

    self.googleMarker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lon),
        animation: google.maps.Animation.DROP,
        map: map
    });

    self.setInfoWindow = function (content) {
        // infoWindows are the little helper windows that open when you click
        // or hover over a pin on a map. They usually contain more information
        // about a location.
        var infoWindow = new google.maps.InfoWindow({
            content: self.title()
        });

        google.maps.event.addListener(self.googleMarker, 'click', function() {
            $.ajax({

                url: 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=' + self.name,
                type: 'GET',
                crossDomain: true,
                dataType: 'jsonp',
                success: function(data) {
                    var key = Object.keys(data.query.pages)[0];
                    infoWindow.content = $(data.query.pages[key].extract)[0].innerHTML;
                    infoWindow.open(map,self.googleMarker);
                },
                error: function() { alert('Failed!'); },
            });

        });
    };

    self.isVisible = ko.observable(false);

    self.isVisible.subscribe(function (visibility) {
        if (visibility) {
            self.googleMarker.setMap(map)
        } else {
            self.googleMarker.setMap(null);
        }
    });

    self.isVisible(true);
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

    ko.bindingHandlers.mapBinder = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            Map.setMap(valueAccessor, element);
        }
    };

    self.centerMap = ko.observable(Map.getMapCenter());

    self.markers = ko.observableArray([]);
    self.locationLat = ko.observable("");

    self.addMarkerOnMap = function(){
        var service = Map.getSearchService();
        var request = {
            query: self.locationLat()
        };
        service.textSearch(request, addMarkerCallback);
    };

    function addMarkerCallback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var currentMap = Map.getMap();
            var newMarker = new Marker(results[0], currentMap);
            newMarker.setInfoWindow(newMarker.title);
            self.markers.push(newMarker);
        }
    }

    self.toggle = ko.observable(true);
    self.titleSearch = ko.observable("");

    self.filteredMarkers = this.markers.filterByProperty("visible", true);

    self.markerToggler = function(text) {
        for(var marker in self.markers())
        {
            var markerObj = self.markers()[marker];
            markerObj.isVisible(markerObj.title().match(text) != null);
        }
    };

    self.toggleAllMarkers = function() {
        self.toggle(!this.toggle());
        if(!self.toggle())
            self.markerToggler(null);
        else
            self.markerToggler("");
    };

    this.toggleMarkersForSearch = function(value) {
        var text = new RegExp(value, 'i');
        self.markerToggler(text);
    };

    self.titleSearch.subscribe(self.toggleMarkersForSearch);
}

ko.applyBindings(NeighborhoodViewModel);
