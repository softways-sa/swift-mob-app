angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout, Favorites, $state) {

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
  
  $scope.total = Favorites.getTotalFavorites();
  if ($scope.total > 0) {
    $scope.show = true;
  }
  
  $scope.$watch(function () { return Favorites.getTotalFavorites(); }, 
  function (newVal, oldVal) {
    if (newVal !== oldVal) {
      $scope.total = Favorites.getTotalFavorites();
    }
  });
  
})

.factory('CategoryListing', function ($http, appConfig) {
  return {
    getCategories: function () {
      return $http({
        url: appConfig.apiUrl + '/categories.do',
        method: 'GET'
      });
    }
  };
})

.controller('HomeCtrl', function ($scope, CategoryListing, $state, appConfig) {
  $scope.appConfig = appConfig;
  
  $scope.goToTab = function(searchTerm) {
    $state.go('app.listing', {
      searchTerm: searchTerm
    });
  };
  
  $scope._list = [];
  CategoryListing.getCategories().success(function (data) {
    $scope._list = data.categories;
  });
})

.factory('ListingPage', function ($http, appConfig) {
  var BASE_URL = appConfig.apiUrl + "/products.do?action1=SEARCH&catId=";
  var SEARCH_BASE_URL = appConfig.apiUrl + "/products.do?action1=SEARCH&qid=";
	var items = [];
  
  return {
    getSubCategories: function (categoryId) {
      return $http({
        url: appConfig.apiUrl + '/categories.do?id=' + categoryId,
        method: 'GET'
      });
    },
    getProducts: function(categoryId, from){
      return $http.get(BASE_URL + categoryId + '&start=' + from).then(function(response){
        items = response.data.products;
        return items;
      });
    },
    getSearchProducts: function(searchTerm, from){
      return $http.get(SEARCH_BASE_URL + searchTerm + '&start=' + from).then(function(response){
        items = response.data.products;
        return items;
      });
    }
  };
})

.controller('ListingCtrl', function ($scope, $stateParams, ListingPage, appConfig, $state, $ionicHistory) {
  $scope.goHome = function() {
    $ionicHistory.nextViewOptions({
      disableBack: true,
      historyRoot: true
    });
  };
  
  $scope.state = $state;
  
  $scope.appConfig = appConfig;
  $scope.searchTerm = $stateParams.searchTerm;
  $scope.categoryId = $stateParams.categoryId;
  $scope.ListingCatalog = [];
  $scope.pathName = [];
  
  $scope.items = [];
  $scope.mikos = [];
  $scope.newItems = [];
  var from = 0;
  
  function loadData(items) {
    var itemsSize = items.length;
    
    $scope.items = $scope.items.concat(items);
    from = from + 24;
    if (itemsSize < 24) {
      $scope.noMoreItemsAvailable = true;
    }
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }
  
  if ($scope.searchTerm == null) {
    ListingPage.getSubCategories($scope.categoryId).success(function (data) {
      $scope.ListingCatalog = data.categories;
      $scope.pathName = data.parent.name;
    });
    
    $scope.loadMore = function() {
      ListingPage.getProducts($scope.categoryId,from).then(function(items) {loadData(items)});
    }
  }
  else if ($scope.searchTerm != null) {
    $scope.loadMore = function() {
      ListingPage.getSearchProducts($scope.searchTerm,from).then(function(items) {loadData(items)});
    }
  }
  
  $scope.loadMore();
})

.factory('ProductDetails', function ($http, appConfig) {
  return{
    getProductDetails: function (productId) {
      return $http({
        url: appConfig.apiUrl + '/products.do?id=' + productId,
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

.factory('Favorites', function ($localstorage, $state) {
  return {    
      searchFavorites: function (favoriteId,favoriteName,favoriteImage,favoriteDescription,favoritePrice) {
        var productId = favoriteId;
        var productName = favoriteName;
        var productImage = favoriteImage;
        var productDescription = favoriteDescription;
        var productPrice = favoritePrice;
        var favorites = (JSON.parse($localstorage.getItem('favorites')) || []);
        if (favorites.length === 0) {
          this.addToFavorites(productId,productName,productImage,productDescription,productPrice);
        }
        else{
          for (var i = 0; i < favorites.length; i++) {
            if (favorites[i].id === productId) {
              this.deleteFavorites(productId);
              break;
            }
            else if (favorites[i].id !== productId) {
              this.addToFavorites(productId,productName,productImage,productDescription,productPrice);
            }
          }
        }
      },
      addToFavorites: function (favoriteId,favoriteName,favoriteImage,favoriteDescription,favoritePrice) {
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
          if (favorites[i].id == productId) { 
            favorites.splice(i,1);
            $localstorage.setObject('favorites', favorites);
            break;
          }
        }
        //$state.go($state.current, {}, { reload: true });

      },
      clearFavorites: function () {  
        $localstorage.clear();
        $state.go($state.current, {}, { reload: true });
      },
      getFavorites: function () {  
        return $localstorage.getObject('favorites');
      },
      getTotalFavorites: function () {
        var total = this.getFavorites().length;
        return total;
      },
      getFavoriteId: function (favoriteId) {   
        var productId = favoriteId;   
        var isFavorite = false;
        var favorites = (JSON.parse($localstorage.getItem('favorites')) || []); 
        for (var i=0; i < favorites.length; i++) {
          if (favorites[i].id == productId) {
            isFavorite = true;
            break;
          }
        }
        return isFavorite;
      }
  };
})

.controller('ProductCtrl', function ($scope, $stateParams, ProductDetails, Favorites, $cordovaSocialSharing, $ionicHistory) {
  $scope.goHome = function() {
    $ionicHistory.nextViewOptions({
      disableBack: true,
      historyRoot: true
    });
  };

  ProductDetails.getProductDetails($stateParams.productId).success(function (data) {
    $scope.ProductInfo = data.product;
    $scope.pathName = data.product.name;
    $scope.description = data.product.description;
    $scope.shareImage = data.product.thumb;
    $scope.shareUrl = data.product.url;
  });  
  
  $scope.openURL = function() {
    try {
      var URL = $scope.shareUrl;
      window.open(URL, '_system', 'location=yes');
    } 
    catch (err) {
      alert(err);
    }
  };
  
  $scope.favoritesService = Favorites;
  
  $scope.$watch(function () { return Favorites.getFavoriteId($stateParams.productId); }, 
  function (newVal, oldVal) {
    if (typeof newVal !== 'undefined') {
      $scope.isFavorite = Favorites.getFavoriteId($stateParams.productId);
    }
  });
  
  $scope.shareAnywhere = function() {
    $cordovaSocialSharing.share("Swift-mob-App", "The smart application you need!", $scope.shareImage, $scope.shareUrl);
  };
})

.controller('FavoritesCtrl', function ($scope, Favorites) {
  $scope.favorites = Favorites.getFavorites();
  $scope.favoritesCount = Favorites.getFavorites().length;
  $scope.favoritesServices = Favorites;
  
  $scope.$watch(function () { return Favorites.getFavorites().length; }, 
  function (newVal, oldVal) {
  if (newVal !== oldVal) {
    $scope.favorites = Favorites.getFavorites();
  }
  });
})

.factory('ContactInfo', function ($http, appConfig) {
  return {
    getContactDetails: function () {
      return $http({
        url: appConfig.apiUrl + '/contact-info.do',
        method: 'GET'
      });
    }
  };
})
.controller('ContactCtrl', function ($scope, ContactInfo) {
  ContactInfo.getContactDetails().success(function(data) {
    $scope.contactInfo = data.contactInfo;
  });
})

.controller('MapCtrl', function ($scope, $state, $cordovaGeolocation, ContactInfo) {
  var options = {timeout: 10000, enableHighAccuracy: true};
  
  var contactInfo;
  
  ContactInfo.getContactDetails().success(function(data) {
    contactInfo = data.contactInfo;
  });
  
  $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
 
    var latLng = new google.maps.LatLng(contactInfo.lat,contactInfo.lng);
 
    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
 
    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    //Wait until the map is loaded
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){

      var marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });      

      var infoWindow = new google.maps.InfoWindow({
        content: "<strong>" + contactInfo.title + "</strong><br/>" 
               + contactInfo.address1 + "<br/>" + contactInfo.address2
               + "<br/>Τ.Κ. " + contactInfo.postalCode
               + "<br/>Τηλ. " + contactInfo.phone
               + "<br/>" + contactInfo.email
      });

      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open($scope.map, marker);
      });

    }); 

  }, function(error){
    console.log("Could not get location");
  });
});