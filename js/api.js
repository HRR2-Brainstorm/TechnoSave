var Promise = require('bluebird');
var amazon = require('./api-amazon');
var wmBB = require('./api-walmartBB');

module.exports = function(req, res) {
  var searchQuery = req.body.items;

  var apiCalls = [
    amazon(searchQuery),
    wmBB(searchQuery, 'walmart'),
    wmBB(searchQuery, 'bestbuy')
  ];

  Promise.all(apiCalls).then(function(allOutputs) {
    console.log('products ->>>>>', allOutputs);
    var result = [];
    for (var i = 0; i < allOutputs.length; i++){
      if(allOutputs[i] !== undefined) {
        result = result.concat(allOutputs[i]);
      }
    }
    res.send(result);
  });

};
