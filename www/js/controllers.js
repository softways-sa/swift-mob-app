angular
  .module('starter.controllers', [])

  .controller('AppCtrl', function ($scope, Favorites) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.total = Favorites.getTotalFavorites();
    $scope.show =  $scope.total > 0 ? true : false;
    
    $scope.$watchCollection(function() {return  Favorites.getFavorites()}, function(newCol) {
      $scope.total = newCol.length;
      
      $scope.show =  $scope.total > 0 ? true : false;
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
    $scope.loading = true;

    $scope.promo = appConfig.serverHost + "/images/mob-app-home-promo.jpg";

    $scope.goToTab = function(searchTerm) {
      $state.go('app.listing', {
        searchTerm: searchTerm
      });
    };

    $scope._list = [];
    CategoryListing.getCategories().success(function (data) {
      $scope._list = data.categories;
    })
    .finally(function () {
      // Hide loading spinner whether our call succeeded or failed.
      $scope.loading = false;
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
    $scope.pathName = "";

    $scope.items = [];
    $scope.newItems = [];
    var from = 0;

    $scope.catLoading = true;
    $scope.loading = true;

    function loadData(items) {
      var itemsSize = items.length;

      angular.forEach(items, function(value) {
        this.push(value);
      }, $scope.items);

      from = from + 24;
      if (itemsSize < 24) {
        $scope.noMoreItemsAvailable = true;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }

    if ($scope.searchTerm == null && $scope.categoryId.length != 0) {    
      ListingPage.getSubCategories($scope.categoryId)
      .success(function (data) {
        $scope.ListingCatalog = data.categories;
        $scope.pathName = data.parent.name;
      })
      .finally(function () {
        // Hide loading spinner whether our call succeeded or failed.
        $scope.catLoading = false;
      });

      $scope.loadMore = function() {
        ListingPage.getProducts($scope.categoryId,from).then(function(items) {$scope.loading = false; loadData(items)});
      }
    }
    else if ($scope.searchTerm != null) {
      $scope.loadMore = function() {
        ListingPage.getSearchProducts($scope.searchTerm,from).then(function(items) {$scope.loading = false; loadData(items)});
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

  .factory('Favorites', function ($localstorage) {
    var favorites = (JSON.parse($localstorage.getItem('favorites')) || []);
    
    return {
      toggle: function (ProductInfo) {
        var productId = ProductInfo.id;

        if (favorites.length === 0) {
          this.addToFavorites(ProductInfo);
        }
        else {
          var toggled = false;

          for (var i = 0; i < favorites.length; i++) {
            if (favorites[i].id === productId) {
              this.deleteFavorites(productId);
              toggled = true;
              break;
            }
          }

          if (toggled === false) this.addToFavorites(ProductInfo);
        }
      },
      addToFavorites: function (ProductInfo) {
        var productId = ProductInfo.id;
        var productName = ProductInfo.name;
        var productImage = ProductInfo.thumb;
        var productDescription = ProductInfo.description;
        var productPrice = ProductInfo.price;      

        var duplicate_favorite = false;
        for (var i=0; i < favorites.length; i++) {
          if (favorites[i].id === productId) {
            duplicate_favorite = true;
            break;
          }
        }
        if (duplicate_favorite === false) {
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

        for (var i=0; i < favorites.length; i++) {
          if (favorites[i].id == productId) {
            favorites.splice(i,1);
            $localstorage.setObject('favorites', favorites);
            break;
          }
        }
      },
      clearFavorites: function () {
        favorites.splice(0,favorites.length);
        $localstorage.setObject('favorites', favorites);
      },
      getFavorites: function () {
        return favorites;
      },
      getTotalFavorites: function () {
        return favorites.length;
      },
      isFavorite: function (favoriteId) {
        var productId = favoriteId;
        var isFavorite = false;

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

  .controller('ProductCtrl', function ($scope, $stateParams, ProductDetails, Favorites, $cordovaSocialSharing, $ionicHistory, appConfig) {
    $scope.goHome = function() {
      $ionicHistory.nextViewOptions({
        disableBack: true,
        historyRoot: true
      });
    };

    $scope.productLoading = true;

    ProductDetails.getProductDetails($stateParams.productId)
      .success(function (data) {
        $scope.ProductInfo = data.product;
        $scope.pathName = data.product.name;
        $scope.description = data.product.description;
        $scope.shareImage = data.product.thumb;
        $scope.shareUrl = data.product.url;
      })
      .finally(function () {
        $scope.productLoading = false;
      }
    );

    $scope.galleryOptions = {
      pagination: '.swiper-pagination',
      slidesPerView: 1,
      freeMode: false,
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
      paginationClickable: true,
      spaceBetween: 10
    };

    $scope.openURL = function() {
      try {
        window.open($scope.shareUrl, '_system', 'location=yes');
      }
      catch (err) {
        alert(err);
      }
    };

    $scope.favoritesService = Favorites;

    $scope.$watch(function () { return Favorites.isFavorite($stateParams.productId); },
      function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
          $scope.isFavorite = Favorites.isFavorite($stateParams.productId);
        }
      }
    );

    $scope.shareAnywhere = function() {
      $cordovaSocialSharing.share(appConfig.appName, "", $scope.shareImage, $scope.shareUrl);
    };
  })

  .controller('FavoritesCtrl', function ($scope, Favorites, appConfig, $ionicPopup) {
    $scope.appConfig = appConfig;
    $scope.favorites = Favorites.getFavorites();
    
    $scope.showClearBtn = Favorites.getTotalFavorites() > 0 ? true : false;
    
    $scope.showConfirm = function(id) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Διαγραφή Αγαπημένου',
        template: 'Είστε σίγουρος για την διαγραφή;'
      });
      confirmPopup.then(function(res) {
        if (res) {
          Favorites.deleteFavorites(id);
        }
      });
    };
    
    $scope.clearFavorites = function() {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Διαγραφή Αγαπημένων',
        template: 'Είστε σίγουρος για την διαγραφή;'
      });
      confirmPopup.then(function(res) {
        if (res) {
          Favorites.clearFavorites();
        }
      });
    };
    
    $scope.$watchCollection("favorites", function(newColl) {
      $scope.showClearBtn = newColl.length > 0 ? true : false;
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

  .controller('ContactCtrl', function ($scope, ContactInfo, appConfig) {
    $scope.appConfig = appConfig;

    ContactInfo.getContactDetails().success(function(data) {
      $scope.contactInfo = data.contactInfo;
    });
  })

  .controller('404Ctrl', function ($scope, appConfig) {
    $scope.appConfig = appConfig;
  })

  .controller('MapCtrl', function ($scope, ContactInfo, appConfig) {
    $scope.appConfig = appConfig;

    var contactInfo;

    ContactInfo.getContactDetails().success(function(data) {
      contactInfo = data.contactInfo;

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
    });
  });