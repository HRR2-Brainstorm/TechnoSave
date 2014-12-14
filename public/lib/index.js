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
    restrict: 'E',
    scope: {
      item: '=item'
    },
    replace: true,
    templateUrl: 'list-item.html'
  };

})

//*****  ItemList controller ******//
.controller('ItemListCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {

  var animateSummary = function(){
    $('.summaryTable').animate({
      marginRight: "60%",
      width: '50%'
      }, 1000 );
  };
  //*****  end of animation ******//

  //*****  post and get from API ******//
  $scope.addItem = function() {
    $http.post('/', {items: $scope.inputModel})
      .success(function(data){
        if(data.length === 0){
          $scope.empty = true;
          $scope.items = undefined;
          return;
        }else{
          $scope.empty = false;
        }
        $scope.items = [];
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
      $scope.total = sum;
    }
  };

  //*****  Summary Table ******//
  $scope.getItemId = function (item) {
    $scope.cart = $scope.cart || [];
    $scope.cart.push(item);
    $scope.calculateSum();
  };

  // clear one item at a time
  $scope.clearItem = function(index){
    $scope.cart.splice(index, 1);
    $scope.calculateSum();
  };

  //*****  Compare Table ******//
  var diff;
  $scope.moveToCompare = function(name, price, store) {
    animateSummary();
    $scope.compare =  $scope.compare || [];
    var item = {
                  name: name,
                  price: price,
                  store: store
                }
    if ($scope.compare.length < 2) {
      $scope.compare.push(item);
    }

    if ($scope.compare.length === 2) {
      diff = Math.abs($scope.compare[0].price - $scope.compare[1].price);
      $scope.diff = diff;
    }
  };
  // clear the compare list
  $scope.clear = function() {
    $scope.compare = [];
    $scope.diff = [];
  };

  // order by after grouping by upc
  $scope.price = ['price', 'name', 'store'];
  $scope.name = ['name', 'price', 'store'];
  $scope.sotre = ['store', 'name', 'price'];
  $scope.ordering = $scope.price;
  $scope.grouping = 'upc';

  $scope.arrayifyKey = function(group) {
    return group.__arrayify__;
  };

}])

.filter('groupBy', function () {

  var memoizer = {};

  return function (collection, property) {

    var result = {};
    var prop;

    memoizer[property] = memoizer[property] || [];

    if (memoizer[property][1] !== collection){

      var checkElm = function(elm) {
        prop = elm[property];

        if(!result[prop]) {
          result[prop] = [];
        }
        result[prop].push(elm);
      };

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

      memoizer[property] = [result, collection];

    }

    return memoizer[property][0];

  };

})

.filter('filterGroups', ['$filter', function ($filter) {

  var memoizer = {};

  return function (groups, filter) {

    var result = {};
    var prop;

    if (!filter) return groups;

    memoizer[filter] = memoizer[filter] || [];

    if (memoizer[filter][1] !== groups){

      for (var key in groups){
        if (groups.hasOwnProperty(key)){

          var filteredGroup = $filter('filter')(groups[key], filter);

          if (filteredGroup.length) result[key] = filteredGroup;

        }
      }

      memoizer[filter] = [result, groups];

    }

    return memoizer[filter][0];

  };

}])

.filter('arrayify', function () {

  var mostRecent = [];

  return function (collection) {

    var result = [];
    var prop;

    if (Array.isArray(collection)) return collection;

    if (mostRecent[1] !== collection){

      for (var i in collection){

        if (collection.hasOwnProperty(i)){

          collection[i].__arrayify__ = i;

          result.push(collection[i]);
        }
      }

      mostRecent = [result, collection];

    }

    return mostRecent[0];

  };

})
