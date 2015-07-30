/**
 * Created by ssingh on 7/30/15.
 */

function createInfoWindow (content, map, marker) {
    // infoWindows are the little helper windows that open when you click
    // or hover over a pin on a map. They usually contain more information
    // about a location.
    var infoWindow = new google.maps.InfoWindow({
        content: content
    });

    // hmmmm, I wonder what this is about...
    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(map,marker);
    });
}