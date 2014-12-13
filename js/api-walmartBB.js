'use strict';

var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var stores = {};

stores.walmart = {
  name: 'Walmart',
  makeUrl: function(item) {
    return 'http://api.walmartlabs.com/v1/search' + '?apiKey=4z8pkk2ycuvewyydr4mf3ha5&query=' + item;
  },
  parser: 'items',
  productUrl: 'productUrl'
};

stores.bestbuy = {
  name: 'Best Buy',
  makeUrl: function(item) {
    return 'http://api.remix.bestbuy.com/v1/products' + '(name=' + item + '*)?show=name,salePrice,upc,mobileUrl&format=json' + '&apiKey=3fywvy298naxeed665ex82z5';
  },
  parser: 'products',
  productUrl: 'mobileUrl'
};

module.exports = function(searchQuery, storeName) {
  var store = stores[storeName];

  return request(store.makeUrl(searchQuery))
    //async callback to parse data
    .then(function(data){
      var apiItemsList = [];
      var items = JSON.parse(data[0].body)[store.parser];

      if(items) {
        items.forEach(function(item) {
          //construct new item object
          var apiItem = {};

          //get price, upc, and name
          //if salePrice does not exist, default to MSRP
          apiItem.price = item.salePrice || item.msrp;
          apiItem.upc = item.upc;
          apiItem.name = item.name;
          apiItem.store = store.name;
          apiItem.productUrl = item[store.productUrl];

          //store item info obj (that is a possible match) into the output
          apiItemsList.push(apiItem);
        });
      }

      return apiItemsList;
    });

};

