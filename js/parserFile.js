var Promise = require('bluebird');
var api = require('./api-helper');

var walmart = {
  name: 'Walmart',
  makeUrl: function(item) {
    return 'http://api.walmartlabs.com/v1/search' + '?apiKey=4z8pkk2ycuvewyydr4mf3ha5&query=' + item;
  },
  parser: 'items'
};

var bestbuy = {
  name: 'BestBuy',
  makeUrl: function(item) {
    return 'http://api.remix.bestbuy.com/v1/products' + '(name=' + item + '*)?show=name,salePrice,upc&format=json' + '&apiKey=3fywvy298naxeed665ex82z5';
  },
  parser: 'products'
};

var stores = [walmart, bestbuy];

module.exports = {
  parser: function(req, res) {
    //create itemsList array of user inputs, whitespace sanitized and put in array
    var itemsList = req.body.items.replace(/ /g,'').split(',');
    var output = [];

    //go through itemsList array of user inputs and submit query to each store for each item
    for(var i = 0; i < itemsList.length; i++){
      for(var j = 0; j < stores.length; j++) {
        output.push(api({
          getURL: stores[j].makeUrl(itemsList[i]),
          store: stores[j].name,
          parser: stores[j].parser
        }));
      }
    }

    //parse results
    Promise.all(output).then(function (allOutputs) {

      var result = [];
      for (var i = 0; i < allOutputs.length; i++){
        result = result.concat(allOutputs[i]);
      }

      res.send(result);

    });

  }
};
