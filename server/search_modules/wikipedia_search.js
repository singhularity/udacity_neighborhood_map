/**
 * Created by ssingh on 8/5/15.
 */
var request = require('request');
var cheerio = require('cheerio');

module.exports = {
    getSearchData: function(req, res) {
        return search(req.query.name, res);
    }
};

function search(name, res) {
    request('https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=' + name, function(error, response, data) {
        if (!error && response.statusCode == 200) {
            var content;
            try {
                data = JSON.parse(data);
                var key = Object.keys(data.query.pages)[0];
                $ = cheerio.load(data.query.pages[key].extract);
                content = $('p').first().text();
            } catch (error) {
                content = 'Could not get additional information.';
            }
            res.send({
                content: content
            });
        }
    });
}