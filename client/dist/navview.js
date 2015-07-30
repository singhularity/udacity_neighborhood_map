/**
 * Created by ssingh on 7/29/15.
 */

ko.bindingHandlers.map = {

    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        this.mapObj = ko.utils.unwrapObservable(valueAccessor());
        var latLng = new google.maps.LatLng(
            ko.utils.unwrapObservable(mapObj.lat),
            ko.utils.unwrapObservable(mapObj.lng));
        var options = { center: latLng,zoom: 5};

        this.mapObj.googleMap = new google.maps.Map(element, options);
        window.mapBounds = new google.maps.LatLngBounds();
    }

};

function MapViewModel() {
    var self = this;
    self.centerMap = ko.observable({
        lat: ko.observable(55),
        lng: ko.observable(11)});

    this.markers = ko.observableArray([]);

    this.locationLat = ko.observable("");

    this.mapSearch = function(){
        var service = new google.maps.places.PlacesService(this.mapObj.googleMap);
        var request = {
            query: this.locationLat()
        };
        service.textSearch(request, callback);
    };

    var Marker = function(placeData, map) {
        var googleMarker;

        var lat = placeData.geometry.location.lat();  // latitude from the place service
        var lon = placeData.geometry.location.lng();  // longitude from the place service
        var name = placeData.formatted_address;   // name of the place from the place service

        this.title = ko.observable(name);
        this.lat  = ko.observable(lat);
        this.lon  = ko.observable(lon);

        googleMarker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            animation: google.maps.Animation.DROP,
            map: map
        });

        this.isVisible = ko.observable(false);

        this.isVisible.subscribe(function(visibility) {
            if (visibility) {
                googleMarker.setMap(map)
            } else {
                googleMarker.setMap(null);
            }
        });

        this.isVisible(true);
        return this;
    };

    this.callback = function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var pin = new Marker(results[0], this.mapObj.googleMap);
            this.markers.push(pin);
        }
    };

    this.toggle = ko.observable(true);
    this.titleSearch = ko.observable("");

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

    this.filteredMarkers = this.markers.filterByProperty("visible", true);

    this.markerToggler = function(text) {
        for(var marker in this.markers())
        {
            var markerObj = this.markers()[marker];
            markerObj.isVisible(markerObj.title().match(text) != null);
        }
    };

    this.toggleMarkers = function() {
        this.toggle(!this.toggle());
        if(!this.toggle())
            this.markerToggler(null);
        else
            this.markerToggler("");
    };

    this.toggleMarkersForSearch = function() {
        var val = $('#searchCrit').val();
        var text = new RegExp(val, 'i');
        this.markerToggler(text);
    };

    this.filterMarkers = function() {
        this.titleSearch($('#searchCrit').val());
    };
}



ko.applyBindings(MapViewModel);