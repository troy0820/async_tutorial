var express = require('express');
var router = express.Router();
var async = require('async');
var _ = require('lodash');
var request = require('request');


/* GET home page. */
router.get('/', function(req, res) {
  
var phrase = 'may the force be with you';
var key = "TZlKw4gd1qFQhA2CbMLa";
var urlBase = "http://thesaurus.altervista.org/service.php?language=en_US&output=json&key=" + key + "&word=";

var stuff = phrase.split(' ');
async.mapSeries(stuff, function (word, next) {
    console.log('word', word);
    request(urlBase + word, function(error, response, body) {
      if (error) return console.error(error);
      var list = JSON.parse(body).response;
      next(null, { word: word, list: list });
    })
  }, 
  function (error, results) {
    console.log('results', results);
    var counts = _.map(_.compact(results), function (result) {
      console.log('result', result);
      var allwords = _.unique(_.reduce(result.list, function (all, response) {
        console.log('response', response);
        var syns = response.list.synonyms.split('|');
        return all.concat(syns);
      }, [ ]));
      console.log('allwords', allwords);
      return {
        word: result.word,
        count: allwords.length
      };
    });
    var sorted = _.sortBy(counts, function (result) {
      return 0 - result.count;
    });
    console.log('the winner is', sorted[0].word, 'with', sorted[0].count, 'synonyms');
  }
);

});

module.exports = router;
