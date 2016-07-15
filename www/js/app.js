angular
  .module('starter', ['ionic', 'starter.controllers', 'ksSwiper', 'ngCordova'])

  .config(function ($ionicConfigProvider, $stateProvider, $urlRouterProvider) {
    $ionicConfigProvider.views.maxCache(3);

    $ionicConfigProvider.navBar.alignTitle('center');

    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'views/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.home', {
        url: '/home',
        views: {
          'menuContent': {
            templateUrl: 'views/home.html',
            controller: 'HomeCtrl'
          }
        }
      })

      .state('app.listing', {
        url: '/listing/:categoryId',
        views: {
          'menuContent': {
            templateUrl: 'views/listing_catalog.html',
            controller: 'ListingCtrl'
          }
        },
        params: { searchTerm: null }
      })

      .state('app.product', {
        url: '/product/:productId',
        views: {
          'menuContent': {
            templateUrl: 'views/product_details.html',
            controller: 'ProductCtrl'
          }
        }
      })

      .state('app.favorites', {
        url: '/favorites',
        views: {
          'menuContent': {
            templateUrl: 'views/favorites.html',
            controller: 'FavoritesCtrl'
          }
        }
      })

      .state('app.contact', {
        url: '/contact',
        views: {
          'menuContent': {
            templateUrl: 'views/contact.html',
            controller: 'ContactCtrl'
          }
        }
      })

      .state('app.map', {
        url: '/map',
        views: {
          'menuContent': {
            templateUrl: 'views/map.html',
            controller: 'MapCtrl'
          }
        }
      })

      .state('app.404', {
        url: '/404',
        views: {
          'menuContent': {
            templateUrl: 'views/404.html',
            controller: '404Ctrl'
          }
        }
      });
      
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
  })

  .run(function ($ionicPlatform, $ionicPopup, appConfig, $rootScope, $cordovaNetwork, $ionicHistory, $state) {
    $ionicPlatform.ready(function () {
      $rootScope.$on('$ionicView.beforeEnter', function(event, data) {
        if (ionic.Platform.isWebView() && $cordovaNetwork.isOffline()) {
          event.preventDefault();

          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $state.go("app.404");
        }
      });
      
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

      function initPushwoosh(ionicPopup, appConfig) {
        if (ionic.Platform.isAndroid()) {
          registerPushwooshAndroid(ionicPopup, appConfig);
        }

        if (ionic.Platform.isIOS() || ionic.Platform.isIPad()) {
          registerPushwooshIOS(ionicPopup, appConfig);
        }
      }
      
      initPushwoosh($ionicPopup, appConfig);
    });
  });