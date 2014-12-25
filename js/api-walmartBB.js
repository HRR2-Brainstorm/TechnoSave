'use strict';

var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var stores = {};

stores.walmart = {
  name: 'Walmart',
  makeUrl: function(item) {
    // this works for keyword as well as UPC
    return 'http://api.walmartlabs.com/v1/search' + '?apiKey=' + process.env.WALMART_KEY + '&query=' + item;
  },
  parser: 'items',
  productUrl: 'productUrl'
};

stores.bestbuy = {
  name: 'BestBuy',
  makeUrl: function(item, type) {
    // default type is 'name'
    type = type || 'name';
    return 'http://api.remix.bestbuy.com/v1/products(' + type + '=' + item + '*)?show=name,salePrice,upc,mobileUrl&format=json&apiKey=' + process.env.BESTBUY_KEY;
  },
  parser: 'products',
  productUrl: 'mobileUrl'
};

module.exports = function(searchQuery, storeName, type) {
  var store = stores[storeName];

  return request(store.makeUrl(searchQuery, type))
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

