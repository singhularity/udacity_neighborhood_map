/**
 * Created by ssingh on 8/5/15.
 */
//Consumer Key	bkU5fjhhuYk6O2rlD4D3kw
//Consumer Secret	aQQQvrwNair9f6zf0P53wMXK03I
//Token	AERZe0hs8wzP4ess1YbS7uZxfMzRrjDO
//Token Secret	6Xp3sZxmYuAYbtTmnH5tZFvfyJU

module.exports = {
    getSearchData: function (req, res) {
        return search(res);
    }
};

var yelp = require("yelp").createClient({
    consumer_key: "bkU5fjhhuYk6O2rlD4D3kw",
    consumer_secret: "aQQQvrwNair9f6zf0P53wMXK03I",
    token: "AERZe0hs8wzP4ess1YbS7uZxfMzRrjDO",
    token_secret: "6Xp3sZxmYuAYbtTmnH5tZFvfyJU"
});

// See http://www.yelp.com/developers/documentation/v2/search_api
var search = function(res){
    yelp.search({location: "45 Rockefeller Plaza, New York"}, function(error, data) {
        res.send({snippet_text: data['businesses'][0]['snippet_text']});
    });
};