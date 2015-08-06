/**
 * Created by ssingh on 8/5/15.
 */

module.exports = {
    getSearchData: function(req, res) {
        return search(req.query.address, res);
    }
};

var yelp = require("yelp").createClient({
    consumer_key: "bkU5fjhhuYk6O2rlD4D3kw",
    consumer_secret: "aQQQvrwNair9f6zf0P53wMXK03I",
    token: "AERZe0hs8wzP4ess1YbS7uZxfMzRrjDO",
    token_secret: "6Xp3sZxmYuAYbtTmnH5tZFvfyJU"
});

// See http://www.yelp.com/developers/documentation/v2/search_api
var search = function(address, res) {
    yelp.search({
        location: address
    }, function(error, data) {
        if (error === null) {
            var topChoice = data['businesses'][0];
            res.send({
                content: {
                    Summary: topChoice['snippet_text'],
                    Name: topChoice['name'],
                    Rating: topChoice['rating'],
                    Url: topChoice['url']
                }
            });
        } else
            res.send("");
    });
};