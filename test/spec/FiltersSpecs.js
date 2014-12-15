'use strict';

describe('Filters', function () {
  var $filter, mockItem1, mockItem2, mockItem3, mockItem4, mockItem5, mockItem6, mockInput, groupedItems;

  beforeEach(module('App'));
  beforeEach(inject( function ($injector) {
    $filter = $injector.get('$filter');

    // create mock items and a mock input for testing filters
    mockItem1 = {
      name: 'Xbox',
      price: 349,
      store: 'Amazon'
    };
    mockItem2 = {
      name: 'iPhone',
      price: 299,
      store: 'Amazon'
    };
    mockItem3 = {
      name: 'Xbox',
      price: 369,
      store: 'Wal-Mart'
    };
    mockItem4 = {
      name: 'iPhone',
      price: 199,
      store: 'Wal-Mart'
    };
    mockItem5 = {
      name: 'Xbox',
      price: 399,
      store: 'Best Buy'
    };
    mockItem6 = {
      name: 'iPhone',
      price: 349,
      store: 'Best Buy'
    };
    mockInput = [mockItem2, mockItem5, mockItem4, mockItem3, mockItem6, mockItem1];

    // group collection by store
    groupedItems = $filter('groupBy')(mockInput, 'store');
  }));

  describe('groupBy', function () {

    it('should group stores by provided key', function () {
      var mockResult = {
        'Amazon': [mockItem2, mockItem1],
        'Wal-Mart': [mockItem4, mockItem3],
        'Best Buy': [mockItem5, mockItem6]
      };

      expect($filter('groupBy')(mockInput, 'store')).to.eql(mockResult);
    });

    it('should group all items with a key of undefined if the specified key doesn\'t exist', function () {
      var mockResult = {
        undefined: [mockItem2, mockItem5, mockItem4, mockItem3, mockItem6, mockItem1]
      };

      expect($filter('groupBy')(mockInput)).to.eql(mockResult);
    });

  });

  describe('filterGroups', function () {

    it('should filter groups by provided input', function () {
      var mockResult = {
        'Amazon': [mockItem1],
        'Wal-Mart': [mockItem3],
        'Best Buy': [mockItem5]
      };

      expect($filter('filterGroups')(groupedItems, 'Xb')).to.eql(mockResult);
    });

    it('should filter groups by provided input remove properties that do not have a match from results', function () {
      var mockResult = { 'Wal-Mart': [mockItem4] };

      expect($filter('filterGroups')(groupedItems, 19)).to.eql(mockResult);
    });

    it('should return the input groups unchanged if no filter string provided', function () {
      expect($filter('filterGroups')(groupedItems)).to.eql(groupedItems);
    });

    it('should return an empty object if there are not matches for the filter string', function () {
      expect($filter('filterGroups')(groupedItems, 'DFET')).to.eql({});
    });

  });

  describe('arrayify', function () {

    it('should convert an object into an arrayified version', function () {
      var mockResult = [[mockItem2, mockItem1], [mockItem5, mockItem6], [mockItem4, mockItem3]];
      mockResult[0].__arrayify__ = 'Amazon';
      mockResult[1].__arrayify__ = 'Best Buy';
      mockResult[2].__arrayify__ = 'Wal-Mart';

      expect($filter('arrayify')(groupedItems)).to.eql(mockResult);
    });

    it('should return the collection unchanged if already an array', function () {
      expect($filter('arrayify')(mockInput)[0].__arrayify__).to.be.undefined();
    });

  });

});
