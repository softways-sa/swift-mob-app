// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ksSwiper', 'ngCordova'])
.config(function( $ionicConfigProvider) {
       $ionicConfigProvider.navBar.alignTitle('center');
})

.constant('appConfig', {
  appName: 'INOXDOBROS',
  apiUrl: 'http://www2.sw.inoxdobros.gr/api/v1'
})

.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function ($stateProvider, $urlRouterProvider) {
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
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'views/product_details.html',
          controller: 'ProductCtrl'
        }
      }
    })

    .state('app.favorites', {
      url: '/favorites',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'views/favorites.html',
          controller: 'FavoritesCtrl'
        }
      }
    })
    
    .state('app.contact', {
        url: '/contact',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'views/contact.html',
            controller: 'ContactCtrl'
          }
        }
      })
    
    .state('app.map', {
        url: '/map',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'views/map.html',
            controller: 'MapCtrl'
          }
        }
      });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
