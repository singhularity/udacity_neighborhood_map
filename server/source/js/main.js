/**
 * Created by ssingh on 8/5/15.
 */

function setDataFromServer(url, marker, callback) {
    if (Offline.state == "down")
    {
        alert("No network");
    }
    else {
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            timeout: 5000,
            success: function (data) {
                callback(marker, data);
            },
            error: function () {
                marker.setClickEvent('Could not get additional information.');
            }
        });
    }
}

function setDataFromWikipedia(marker){
    setDataFromServer('/wikiData?name=' + marker.name, marker, wikipediaDataCallback);
}

function setDataFromYelp(marker){
    setDataFromServer('/yelpData?address=' + marker.name, marker, yelpDataCallback);
}

function wikipediaDataCallback(marker, data) {
    var content = data.content;
    marker.setClickEvent(content);
    marker.infolink("https://en.wikipedia.org/wiki/" + marker.name);
}

function yelpDataCallback(marker, data) {
    var content = data.content;
    try {
        content = "<ul><li id='summary'>" + content.Name + "</li></ul>";
    } catch (error) {
        content = 'Could not get additional information.';
    }
    marker.setClickEvent(content);
    marker.infolink(data.url);
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

    game: true,
    checks: {xhr: {url: '/heartbeat'}}
};

var run = function() {
    if (Offline.state === 'up') {
        Offline.check();
    }
};
setInterval(run, 5000);

function initialize(neighborhood) {
    var localities = [
        "New York, NY", "London, UK", "Mumbai, India", "Paris, France"
    ];
    var businesses = ["Rockefeller Center, New York", "Learning Tower, Pisa"];

    for(var loc in localities) {
        neighborhood.addMarkerWithInfo(localities[loc], "City");
    }

    for(var business in businesses) {
        neighborhood.addMarkerWithInfo(businesses[business], "Business");
    }
}

var neighbourHood = new NeighborhoodViewModel();
ko.applyBindings(neighbourHood);
initialize(neighbourHood);