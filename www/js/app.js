// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

function initPushwoosh(ionicPopup, appConfig) {
  if (device.platform == "Android") {
    registerPushwooshAndroid(ionicPopup, appConfig);
  }

  if (device.platform == "iPhone" || device.platform == "iOS") {
    registerPushwooshIOS(ionicPopup, appConfig);
  }
	
  //if (device.platform == "Win32NT") {
    //registerPushwooshWP();
  //}
}

angular.module('starter', ['ionic', 'starter.controllers', 'ksSwiper', 'ngCordova'])
.config(function( $ionicConfigProvider) {
  $ionicConfigProvider.navBar.alignTitle('center');
})

.constant('appConfig', {
  appName: 'Softways',
  serverHost: 'http://www.yourdomain.gr',
  apiUrl: 'http://www.yourdomain.gr/api/v1',
  googleProjectId: "GOOGLE_PROJECT_ID",
  pushwooshAppId: "PUSHWOOSH_APP_ID"
})

.run(function ($ionicPlatform, $ionicPopup, appConfig, $rootScope, ConnectivityMonitor, $ionicHistory, $state) {
  $ionicPlatform.ready(function () {
		$rootScope.$on('$ionicView.enter', function(event, data) {
			if (data.stateId !== 'app.favorites') {
				if (ConnectivityMonitor.isOffline() === true) {
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go("app.404");
				}
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
		
    initPushwoosh($ionicPopup, appConfig);
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
      cache: false,
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
      })
    
    .state('app.404', {
        url: '/404',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'views/404.html',
            controller: '404Ctrl'
          }
        }
      });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
