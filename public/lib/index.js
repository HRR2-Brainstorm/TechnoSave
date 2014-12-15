angular.module('App', ['ui.router'])

//*****  Route Config ******//
.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'partial-items.html'
    });
    // default router
    $urlRouterProvider.otherwise('/');
})

//*****  list-item directive ******//
.directive('listItem', function () {

  return {
    //restrict to element
    restrict: 'E',
    scope: {
      //directive has item property, expects to be an object with keys name, price, store, and productUrl
      item: '=item'
    },
    //replace directive element in rendered DOM for SEO
    replace: true,
    templateUrl: 'list-item.html'
  };

})

//*****  ItemList controller ******//
.controller('ItemListCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {

  //*****  post and get from API ******//
  $scope.addItem = function(type) {
    $http.post('/', {items: $scope.inputModel, type: type})
      .success(function(data){
        if(data.length === 0){
          $scope.empty = true;
          $scope.items = undefined;
          return;
        }else{
          $scope.empty = false;
        }
        $scope.items = [];
        // hide/show UPC button
        $scope.upcSearch = !!type;
        data.forEach(function(item){
          $scope.items.push(item);
        });
      });
  };

  // calculate total price in summary table
  $scope.calculateSum = function(){
    var sum = 0;
    for (var i = 0; i < $scope.cart.length; i++) {
      sum += $scope.cart[i].price;
    }
    $scope.total = sum;
  };

  //*****  Summary Table ******//

  //load from local storage if cart is defined
  var cartStr = window.localStorage.cart;
  if (cartStr) {
    //must parse the local storage since only strings can be stored
    $scope.cart = JSON.parse(cartStr);
    $scope.calculateSum();
  }

  $scope.getItemId = function (item) {
    $scope.cart = $scope.cart || [];
    //push item into cart
    $scope.cart.push(item);
    //add item to localStorage
    window.localStorage.cart = JSON.stringify($scope.cart);
    //calculate sum of product prices
    $scope.calculateSum();
  };

  // clear one item at a time
  $scope.clearItem = function(index){
    $scope.cart.splice(index, 1);
    //remove item from localStorage
    window.localStorage.cart = JSON.stringify($scope.cart);
    $scope.calculateSum();
  };

  // order by after grouping by upc
  //order by price, name, and then store
  $scope.price = ['price', 'name', 'store'];
  //order by name, price, and then store
  $scope.name = ['name', 'price', 'store'];
  //order by store, name, and then price
  $scope.store = ['store', 'name', 'price'];
  //order by price by default
  $scope.ordering = $scope.price;
  //group by upc by default
  $scope.grouping = 'upc';

  // order groups by the property they are grouped by
  $scope.arrayifyKey = function(group) {
    // arrayify key comes from arraify filter
    return group.__arrayify__;
  };

}])

//group elements in a collection by a common key
.filter('groupBy', function () {

  //memoize function to prevent infinite digest loop cycle
  var memoizer = {};

  return function (collection, property) {

    var result = {};
    var prop;

    //check if memoized already
    memoizer[property] = memoizer[property] || [];
    if (memoizer[property][1] !== collection){

      //check element
      var checkElm = function(elm) {
        //get element's value at property key
        prop = elm[property];

        //create empty array if prop value does not already exist
        if(!result[prop]) {
          result[prop] = [];
        }

        //push element into array
        result[prop].push(elm);
      };

      //handle both arrays and objects
      if (Array.isArray(collection)){
        for (var i = 0; i < collection.length; i++){
          checkElm(collection[i]);
        }
      } else {
        for (var item in collection){
          if (collection.hasOwnProperty(item)){
            checkElm(collection[item]);
          }
        }
      }

      //memoize result
      memoizer[property] = [result, collection];

    }

    //return memoized result
    return memoizer[property][0];

  };

})

//filter each group in a groups object
.filter('filterGroups', ['$filter', function ($filter) {

  //memoize function
  var memoizer = {};

  return function (groups, filter) {

    var result = {};
    var prop;

    //if no filter is passed in return groups as is
    if (!filter) return groups;

    //check if memoized already
    memoizer[filter] = memoizer[filter] || [];
    if (memoizer[filter][1] !== groups){

      //loop through each group in groups
      for (var key in groups){
        if (groups.hasOwnProperty(key)){

          //filter each group using angular filter
          var filteredGroup = $filter('filter')(groups[key], filter);

          //strip out empty arrays from results
          if (filteredGroup.length) result[key] = filteredGroup;

        }
      }

      //memoize result
      memoizer[filter] = [result, groups];

    }

    //return memoized result
    return memoizer[filter][0];

  };

}])

//convert an object into an array with each element possessing a key corresponding to its matching key when it was part of an object
.filter('arrayify', function () {

  //memoize result
  var mostRecent = [];

  return function (collection) {

    var result = [];
    var prop;

    //if already an array return collection
    if (Array.isArray(collection)) return collection;

    //check if memoized
    if (mostRecent[1] !== collection){

      //loop through properties of object
      for (var i in collection){
        if (collection.hasOwnProperty(i)){

          //attach key to each value at __arrayify__
          collection[i].__arrayify__ = i;

          //push value into array
          result.push(collection[i]);
        }
      }

      //memoize result
      mostRecent = [result, collection];

    }

    //return memoized result
    return mostRecent[0];

  };

});
