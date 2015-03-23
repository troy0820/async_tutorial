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
    request(urlBase + word, function (error, response, body) {
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

router.get('/:id', function(req, res) {

var phrase = 'What is the best language';
var key = "TZlKw4gd1qFQhA2CbMLa";
var urlBase = "http://thesaurus.altervista.org/service.php?language=en_US&output=json&key=" + key + "&word=";

var stuff = phrase.split(' ');

async.mapSeries(stuff, function (word, next) {
  request(urlBase + word, function (error, response, body) {
    if (error) return console.error(error);
    var list = JSON.parse(body).response;
    next(null, { word: word, list: list });
  })
}, //end of sencond argument
function (error, results) {
  var counts = _.map(_.compact(results), function (result) { // start of _.map function stored to counts
      var allwords = _.unique(_.reduce(result.list, function (all, response) {  //start of unique function stored to all words stil in map function
      var syns = response.list.synonyms.split('|');
      return all.concat(syns);
    },[ ])); // end of unique function stored in counts
      return {
        word: result.word,
        count: allwords.length
      };
    });//end of counts variable
    var sorted = _.sortBy(counts, function (result) {
      return 0 - result.count;
    });
    console.log('This is the word with the most synonyms', sorted[0].word, 'with', sorted[0].count, 'synonyms');
  }
);

router.get('/promise',function(req, res) {
  'use strict';

var bpromise = require('bluebird'),
    request = require('request'),
    _ = require('lodash');

/* fn takes a phrase  - may the force be with you
   which word has the most synonyms */

var key = "TZlKw4gd1qFQhA2CbMLa";
var urlBase = "http://thesaurus.altervista.org/service.php?language=en_US&output=json&key=" + key + "&word=";


function syncount(phrase) {
    var words = phrase.split(' ');

    return bpromise.map(words, function (word) {
        return new bpromise(function(resolve) {
            request.get(urlBase + word, function (err, res, payload) {
                payload = JSON.parse(payload);
                if (payload.response) {
                    var words = payload.response.reduce(function (words, item) {
                        return words.concat(item.list.synonyms.split('|'));
                    }, []);
                    words = _.uniq(words);
                    resolve(words.length);
                } else {
                    resolve(0);
                }
            }, {concurrecy: 1});
        })

    }).then(function (data) {
        var max = _.max(data);
        var index = _.findIndex(data, function (item) {
            return item === max;
        });

        console.log(words[index], max);

    })
}

syncount('may the force be with you');

})

});

module.exports = router;
