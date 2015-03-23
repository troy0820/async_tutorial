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
