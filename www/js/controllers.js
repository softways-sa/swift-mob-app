angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  //$scope.loginData = {};

  // Create the login modal that we will use later
  //$ionicModal.fromTemplateUrl('templates/login.html', {
  //scope: $scope
  //}).then(function(modal) {
  //$scope.modal = modal;
  //});

  // Triggered in the login modal to close it
  //$scope.closeLogin = function() {
  //$scope.modal.hide();
  //};

  // Open the login modal
  //$scope.login = function() {
  //$scope.modal.show();
  //};

  // Perform the login action when the user submits the login form
  //$scope.doLogin = function() {
  //console.log('Doing login', $scope.loginData);

  // Simulate a login delay. Remove this and replace with your login
  // code if using a login system
  //$timeout(function() {
  //$scope.closeLogin();
  //}, 1000);
  //};
})



.factory('CategoryListing', function ($http) {
  return{
    getCategories: function (from, limit) {
      return $http({
        url: 'http://www.webaction.gr/demo/request/swift_home.php?offset=' + from + '&limit=' + limit + '',
        method: 'GET'
      });
    }
  };
})

.controller('HomeCtrl', function ($scope, CategoryListing) {

  $scope.CategoryList = [];
  $scope.list = [];
  var from = 0;

  $scope.populateList = function () {
    populateLists();
  };
  $scope.canWeLoadMoreContent = function () {
    return ($scope.CategoryList.length > $scope.list.length) ? false : true;
  };
  populateLists();

  function populateLists() {
    var limit = from + 9;
    CategoryListing.getCategories(from, limit).success(function (data) {
      $scope.list = data.categories;
      for (var i = from; i <= limit; i++) {
        $scope.CategoryList.push({
          id: $scope.list[i].id,
          image: $scope.list[i].image,
          name: $scope.list[i].name,
          description: $scope.list[i].description
        });
        from = i + 1;
      }
    });
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }
})

.factory('ListingPage', function ($http) {
  return{
    getSubCategories: function (categoryId) {
      return $http({
        url: 'http://www.webaction.gr/demo/request/swift_listing.php?category_id=' + categoryId,
        method: 'GET'
      });
    },
    getProducts: function (categoryId, from, limit) {
      return $http({
        url: 'http://www.webaction.gr/demo/request/swift_products.php?category_id=' + categoryId + '&offset=' + from + '&limit=' + limit + '',
        method: 'GET'
      });
    }
  };
})

.controller('ListingCtrl', function ($scope, $stateParams, ListingPage) {

  $scope.categoryId = $stateParams.categoryId;
  $scope.ListingCatalog = [];
  ListingPage.getSubCategories($scope.categoryId).success(function (data) {
    $scope.ListingCatalog = data.subcategories;
    $scope.pathName = data.pathname[0].name;
  });

  $scope.ListingProducts = [];
  $scope.list = [];
  var from = 0;

  $scope.populateList = function () {
    populateLists();
  };
  $scope.canWeLoadMoreContent = function () {
    return ($scope.ListingProducts.length > $scope.list.length) ? false : true;
  };
  populateLists();

  function populateLists() {
    var limit = from + 9;
    ListingPage.getProducts($scope.categoryId, from, limit).success(function (data) {
      $scope.list = data.products;
      for (var i = from; i <= limit; i++) {
        $scope.ListingProducts.push({
          id: $scope.list[i].id,
          image: $scope.list[i].image,
          name: $scope.list[i].name,
          price: $scope.list[i].price,
          description: $scope.list[i].description
        });
        from = i + 1;
      }
    });
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }
})

.factory('ProductDetails', function ($http) {
  return{
    getProductDetails: function (productId) {
      return $http({
        url: 'http://www.webaction.gr/demo/request/swift_product.php?product_id=' + productId,
        method: 'GET'
      });
    }
  };
})
.factory('$localstorage', ['$window', function ($window) {
    return {
      set: function (key, value) {
        $window.localStorage[key] = value;
      },
      get: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function (key) {
        return JSON.parse( $window.localStorage[key] || '{}' );
      },
      clear: function () {
        $window.localStorage.clear();
      },
      setItem: function (key, value) {
        $window.localStorage.setItem(key,value);
      },
      getItem: function (key) {
        return $window.localStorage.getItem(key);
      }
    };
  }])

.factory('Favorites', function ($localstorage) {
  return {    
      addToFavorites: function (favoriteId,favoriteName,favoriteImage,favoriteDescription,favoritePrice) {
        //$localstorage.clear();
        var productId = favoriteId;
        var productName = favoriteName;
        var productImage = favoriteImage;
        var productDescription = favoriteDescription;
        var productPrice = favoritePrice;
        var favorites = (JSON.parse($localstorage.getItem('favorites')) || []);        
        var duplicate_favorite = false;
        for (var i=0; i < favorites.length; i++) {
            if (favorites[i].id === productId) {
                duplicate_favorite = true;
                break;
            }
        }
        if (duplicate_favorite === false){
          var new_item = {"id" : productId,
            "name" : productName,
            "image" : productImage,
            "description" : productDescription,
            "price" : productPrice
          };
          favorites.push(new_item);
          $localstorage.setObject('favorites', favorites);
        }
      },
      deleteFavorites: function (favoriteId) {  
        var productId = favoriteId;   
        var favorites = (JSON.parse($localstorage.getItem('favorites')) || []); 
        for (var i=0; i < favorites.length; i++) {
            if (favorites[i].id === productId) {
              console.log(i);
                favorites.splice(i,1);
                $localstorage.setObject('favorites', favorites);
                break;
            }
        }
      },
      getFavorites: function () {  
        return $localstorage.getObject('favorites');
      }
  };
})
.controller('ProductCtrl', function ($scope, $stateParams, ProductDetails, Favorites) {

  ProductDetails.getProductDetails($stateParams.productId).success(function (data) {
    $scope.ProductInfo = data.product_details;
    $scope.pathName = data.product_details[0].name;
  });  
  $scope.favoritesService = Favorites;
})

.controller('FavoritesCtrl', function ($scope, Favorites) {
  $scope.favorites = Favorites.getFavorites();
});