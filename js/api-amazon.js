'use strict';

var Promise = require('bluebird');
var OperationHelper = require('apac').OperationHelper;
Promise.promisifyAll(OperationHelper.prototype);

var opHelper = new OperationHelper({
      awsId: process.env.AMAZON_ID, assocId: process.env.AMAZON_ASSOC_ID,
      awsSecret: process.env.AMAZON_SECRET
});

// execute(operation, params, callback)
// operation: select from http://docs.aws.amazon.com/AWSECommerceService/latest/DG/SummaryofA2SOperations.html
// params: parameters for operation (optional)
// callback(err, parsed, raw): callback function handling results.
// err = potential errors raised from xml2js.parseString() or http.request().
// parsed = xml2js parsed response. raw = raw xml response.

module.exports = function(searchQuery, type) {
  // default params for all searches
  var params = {
    ResponseGroup: 'ItemAttributes, Offers'
  };

  if(type === 'UPC') {
    type = 'ItemLookup';
    params.SearchIndex = 'All';
    params.IdType = 'UPC';
    params.ItemId = searchQuery;
  } else {
    type = 'ItemSearch';
    params.SearchIndex = 'Electronics';
    params.Keywords = searchQuery;
  }

  var products = [];
  var product;

  return opHelper.executeAsync(type, params)
    .then(function(results) {
      results = results[0][type + 'Response']
      if(results) {
        var items = results.Items[0].Item;
        if(items) {
          for(var i = 0; i < items.length; i++) {
            //base object for price data
            var availablePrice = items[i].OfferSummary[0];
            //fall back to used price when there is no new product available
            availablePrice = availablePrice.LowestNewPrice || availablePrice.LowestUsedPrice;

            product = {};
            product.store = 'Amazon';
            product.price = parseFloat(availablePrice[0].Amount) / 100;
            product.upc = items[i].ItemAttributes[0].UPC + '';
            product.name = items[i].ItemAttributes[0].Title + '';
            product.productUrl = 'http://www.amazon.com/gp/product/' + items[i].ASIN;
            products.push(product);
          }
          return products;
        }
      }
  }).catch(function(err) {
    console.log(err);
  });

};
