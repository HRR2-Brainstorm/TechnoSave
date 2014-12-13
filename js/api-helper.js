var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

module.exports = function (req) {

  return request(req.getURL)
  //async callback to parse data
    .then(function(data){
      var apiItemsList = [];
      var items = JSON.parse(data[0].body)[req.parser];

      if(items !== undefined){
        items.forEach(function(itemObj){
          //construct new item object
          var apiItem = {};

          //get price, upc, and name
          //if salePrice does not exist, default to MSRP
          apiItem.price = itemObj.salePrice || itemObj.msrp;
          apiItem.upc = itemObj.upc;
          apiItem.name = itemObj.name;
          apiItem.store = req.store;
          apiItem.productUrl = itemObj[req.productUrl];

          //store item info obj (that is a possible match) into the output
          apiItemsList.push(apiItem);
        });
      }

      return apiItemsList;

    });

};
