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
function setDataFromServer(url, marker, category, callback) {
    if (Offline.state === "down") {
        alert("No network");
    } else {
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            timeout: 5000,
            success: function(data) {
                callback(marker, data, category);
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
function setDataFromWikipedia(marker, category) {
    setDataFromServer('/wikiData?name=' + marker.name, marker, category, wikipediaDataCallback);
}

/**
 *
 * @param marker Makes the Ajax call to the server to get data from Yelp then calls the appropriate callback
 */
function setDataFromYelp(marker, category) {
    setDataFromServer('/yelpData?address=' + marker.name, marker, category, yelpDataCallback);
}

/**
 *
 * @param marker
 * @param data
 *
 * Serves as a callback function for formatting and adding data from Wikipedia
 */
function wikipediaDataCallback(marker, data, category) {
    var content = data.content;
    marker.setClickEvent('<div>' + content + '</div>');
    marker.infolink("https://en.wikipedia.org/wiki/" + marker.name);
    marker.category(category);
}

/**
 *
 * @param marker
 * @param data
 *
 * Serves as a callback function for formatting and adding data from Yelp
 */
function yelpDataCallback(marker, data, category) {
    var content = data.content;
    var htmlData = "<ul></ul>";

    htmlData = $(htmlData).html($("<li><strong>Name:&nbsp;</strong>" + content.Name + "</li><li><strong>Rating:&nbsp;</strong>" + content.Rating + "</li><li><strong>Summary/Comments:&nbsp;</strong>" + content.Summary + "</li><li><strong>Phone:&nbsp;</strong>" + content.Phone + "</li>"));

    marker.setClickEvent($(htmlData).html());
    marker.infolink(content.Url);
    marker.category(category);
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
    var businesses = ["27 W 24th St, New York, NY 10010", "4 Glen Rd, Rutherford, NJ 07070"];

    var landmarks = ["Grand Canyon", "Taj Mahal, India"];

    for (var loc in localities) {
        neighborhood.addMarkerWithInfo(localities[loc], "City");
    }

    for (var business in businesses) {
        neighborhood.addMarkerWithInfo(businesses[business], "Business");
    }

    for (var landmark in landmarks) {
        neighborhood.addMarkerWithInfo(landmarks[landmark], "Landmarks");
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