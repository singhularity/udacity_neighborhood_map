/**
 * Implements utility functions and other operations
 */
/**
 *
 * @param url
 * @param marker
 * @param callback The callback function that actually adds content to markers
 *
 * Generic function to make AJax calls to the server.
 */
function setDataFromServer(url, marker, callback) {
    if (Offline.state == "down") {
        alert("No network");
    } else {
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            timeout: 5000,
            success: function(data) {
                callback(marker, data);
            },
            error: function() {
                marker.setClickEvent('Could not get additional information.');
            }
        });
    }
}

/**
 *
 * @param marker Makes the Ajax call to the server to get data from Wikipedia then calls the appropriate callback
 */
function setDataFromWikipedia(marker) {
    setDataFromServer('/wikiData?name=' + marker.name, marker, wikipediaDataCallback);
}

/**
 *
 * @param marker Makes the Ajax call to the server to get data from Yelp then calls the appropriate callback
 */
function setDataFromYelp(marker) {
    setDataFromServer('/yelpData?address=' + marker.name, marker, yelpDataCallback);
}

/**
 *
 * @param marker
 * @param data
 *
 * Serves as a callback function for formatting and adding data from Wikipedia
 */
function wikipediaDataCallback(marker, data) {
    var content = data.content;
    marker.setClickEvent(content);
    marker.infolink("https://en.wikipedia.org/wiki/" + marker.name);
}

/**
 *
 * @param marker
 * @param data
 *
 * Serves as a callback function for formatting and adding data from Yelp
 */
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

function initializeOfflineJs() {
    Offline.options = {
        // Should we check the connection status immediatly on page load.
        checkOnLoad: true,

        // Should we monitor AJAX requests to help decide if we have a connection.
        interceptRequests: true,

        requests: true,

        game: true,
        checks: {
            xhr: {
                url: '/heartbeat'
            }
        }
    };

    var run = function() {
        if (Offline.state === 'up') {
            Offline.check();
        }
    };
    setInterval(run, 5000);
}

/**
 *
 * @param neighborhood
 *
 *Initializes offline and a bunch of predefined markers
 */
function initialize(neighborhood) {

    initializeOfflineJs();

    var localities = [
        "New York, NY", "London, UK", "Mumbai, India", "Paris, France"
    ];
    var businesses = ["Rockefeller Center, New York", "Learning Tower, Pisa"];

    for (var loc in localities) {
        neighborhood.addMarkerWithInfo(localities[loc], "City");
    }

    for (var business in businesses) {
        neighborhood.addMarkerWithInfo(businesses[business], "Business");
    }
}

//Add a resize event to automatically resize map when window is resized.
$(window).resize(function() {
    google.maps.event.trigger(Map.getMap(), 'resize');
});

//Apply bindings for KnockoutJs
var neighbourHood = new NeighborhoodViewModel();
ko.applyBindings(neighbourHood);
initialize(neighbourHood);