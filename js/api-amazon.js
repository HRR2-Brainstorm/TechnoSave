var util = require('util');
var OperationHelper = require('apac').OperationHelper;

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

module.exports = function(keywords) {
  var products = {};

  opHelper.execute('ItemSearch', {
    'SearchIndex': 'Electronics',
    'Keywords': keywords,
    'ResponseGroup': 'ItemAttributes, Offers'
  }, function(err, results) {
      var items = results.ItemSearchResponse.Items[0]['Item'];
      if(items) {
        for(var i = 0; i < items.length; i++) {
          products.store = 'Amazon',
          products.price = items[i].OfferSummary[0].LowestNewPrice[0].FormattedPrice + '',
          products.upc = items[i].ItemAttributes[0].UPC + '',
          products.name = items[i].ItemAttributes[0].Title + '',
          products.productUrl = 'http://www.amazon.com/gp/product/' + items[i].ASIN
        }
      }
  });

  return products;
};
