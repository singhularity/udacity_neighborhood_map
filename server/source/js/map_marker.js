/**
 * Provides objects for Map and Map-markers
 */
/**
 *
 * @param propName Name of the property on which we want to filter the array
 * @param matchValue Value of the filter
 * @returns An array of elements matching the filter
 */
ko.observableArray.fn.filterByProperty = function(propName, matchValue) {
    var self = this;
    return ko.pureComputed(function() {
        var allItems = self(),
            matchingItems = [];
        for (var i = 0; i < allItems.length; i++) {
            var current = allItems[i];
            if (ko.unwrap(current[propName]) === matchValue)
                matchingItems.push(current);
        }
        return matchingItems;
    }, self);
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
    addMarkerOnMap: function(location, callback, type) {
        var service = this.searchService;
        var request = {
            query: location,
            type: type
        };
        if (Offline.state === "down") {
            alert("No network");
        } else {
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