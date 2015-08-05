/**
 * Created by ssingh on 7/29/15.
 * Provides objects for Map and Map-markers
 * Implements the operations for adding Map, Map-markers and also for searching markers.
 */

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
        if(results !== undefined && results.length > 0) {
            var currentMap = Map.getMap();
            var newMarker = new Marker(results[0], currentMap);
            self.markers.push(newMarker);
            self.visibleMarkersCount(self.visibleMarkersCount() + 1);
            self.locationLat("");
            self.selectedType("");
            return newMarker;
        }
        else{
            alert("No matching location found!");
        }
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

    self.filteredMarkers = self.markers.filterByProperty("visible", true);
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