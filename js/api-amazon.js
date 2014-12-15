'use strict';

var Promise = require('bluebird');
var OperationHelper = require('apac').OperationHelper;
Promise.promisifyAll(OperationHelper.prototype);

var opHelper = new OperationHelper({
      awsId: 'AKIAJSQYXFG2KXKSQNLA', assocId: 'technosave-20',
      awsSecret: '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'
});

// execute(operation, params, callback)
// operation: select from http://docs.aws.amazon.com/AWSECommerceService/latest/DG/SummaryofA2SOperations.html
// params: parameters for operation (optional)
// callback(err, parsed, raw): callback function handling results.
// err = potential errors raised from xml2js.parseString() or http.request().
// parsed = xml2js parsed response. raw = raw xml response.

module.exports = function(searchQuery) {
  var products = [];
  var product;

  return opHelper.executeAsync('ItemSearch', {
    'SearchIndex': 'Electronics',
    'Keywords': searchQuery,
    'ResponseGroup': 'ItemAttributes, Offers'
  }).then(function(results) {
      if(results[0].ItemSearchResponse) {
        var items = results[0].ItemSearchResponse.Items[0].Item;
        if(items) {
          for(var i = 0; i < items.length; i++) {
            var availablePrice = items[i].OfferSummary[0]; //base for price data
            availablePrice = availablePrice.LowestNewPrice || availablePrice.LowestUsedPrice; //used if !new

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
