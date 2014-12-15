"use strict";

describe('ItemListCtrl', function () {
  var $scope, $rootScope, createController, $location, $httpBackend, $controller, mockItem1, mockItem2;

  // using angular mocks, we can inject the injector
  // to retrieve our dependencies
  beforeEach(module('App'));
  beforeEach(inject(function ($injector) {

    // mock out our dependencies
    $rootScope = $injector.get('$rootScope');
    $httpBackend = $injector.get('$httpBackend');
    $location = $injector.get('$location');
    $scope = $rootScope.$new();
    $controller = $injector.get('$controller');

    // create mock items
    mockItem1 = {
      name: 'Playstation',
      price: 399,
      store: 'Wal-Mart'
    };
    mockItem2 = {
      name: 'Xbox',
      price: 349,
      store: 'Best Buy'
    };

    createController = function () {
      return $controller('ItemListCtrl', {
        $scope: $scope,
      });
    };
  }));

  it('should have addItem, calculateSum, getItemId, clearItem, and arrayifyKey functions', function () {
    createController();
    expect($scope.addItem).to.be.a('function');
    expect($scope.calculateSum).to.be.a('function');
    expect($scope.getItemId).to.be.a('function');
    expect($scope.clearItem).to.be.a('function');
    expect($scope.arrayifyKey).to.be.a('function');
  });

  it('should add an item to the shopping cart and calculate the sum', function () {
    createController();
    $scope.getItemId(mockItem1);
    expect($scope.cart).to.have.length(1);
    expect($scope.total).to.be.equal(399);

    $scope.getItemId(mockItem2);
    expect($scope.cart).to.have.length(2);
    expect($scope.total).to.be.equal(748);
  });

  it('should remove the specified item from the cart and update the total', function () {
    createController();
    $scope.getItemId(mockItem1);
    $scope.getItemId(mockItem2);
    expect($scope.total).to.be.equal(748);

    $scope.clearItem(0);
    expect($scope.total).to.be.equal(349);
  });

  it('should return items if search was successful', function () {
    createController();
    $httpBackend.expectPOST('/').respond([mockItem1, mockItem2]);
    $scope.addItem();
    $httpBackend.flush();

    expect($scope.items[0]).to.eql(mockItem1);
    expect($scope.items[1]).to.eql(mockItem2);
  });

  it('should set empty to true and items to undefined if no valid search results', function () {
    createController();
    $httpBackend.expectPOST('/').respond([]);
    $scope.addItem();
    $httpBackend.flush();

    expect($scope.empty).to.be.true;
    expect($scope.items).to.be.undefined();
  });

});
