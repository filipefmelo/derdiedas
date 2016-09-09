// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngResource', 'angulartics', 'angulartics.google.analytics', 'angulartics.google.analytics.cordova'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    });

app.config(function(googleAnalyticsCordovaProvider) {
    googleAnalyticsCordovaProvider.trackingId = 'UA-62317022-1';
    googleAnalyticsCordovaProvider.period = 20; // default: 10 (in seconds)
    googleAnalyticsCordovaProvider.debug = false; // default: false
});


app.directive('browseTo', function ($ionicGesture) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attrs) {
            var handleTap = function (e) {
                var inAppBrowser = window.open(encodeURI($attrs.browseTo), '_system');
            };
            var tapGesture = $ionicGesture.on('tap', handleTap, $element);
            $scope.$on('$destroy', function () {
                $ionicGesture.off(tapGesture, 'tap', handleTap);
            });
        }
    }
});

//UA-62317022-1

app.controller('MainController', function ($scope, $http, $window, $analytics) {
    var allowedCases = ["der", "die", "das"];
    $scope.result = {};
    $scope.error = {};
    $scope.request = {};

    $scope.submitQuery = function (e) {
        var parts = $scope.request.word.split(" ");
        if (parts.length >= 2) {
            $scope.request.word = parts[0];
        }

        if (e.keyCode === 13) {
            if (!$scope.request.word) {
                $scope.error.text = "Please enter a single word";
                return;
            }
            $analytics.eventTrack('API call', {  category: 'word', label: $scope.request.word });
            $scope.error.text = "Please wait...";
            $http.get("http://mymemory.translated.net/api/get?q=the%20" + $scope.request.word + "&langpair=en|de&key=ed575c9f1fe4febeb85f&de=filipefmelo@gmail.com").success(function (response) {
                var result = {};
                result.raw = response.responseData.translatedText;
                result.splitted = result.raw.split(" ");
                if (result.splitted.length === 2) {
                    var derdiedas = result.splitted[0].toLowerCase();
                    if (allowedCases.indexOf(derdiedas) !== -1) {
                        $http.get('https://api.iconfinder.com/v2/icons/search?query=' + $scope.request.word + '&count=1&style=&vector=all&premium=all').then(function (response) {
                            if (response.data.icons[0]) {
                                var icons = response.data.icons[0].raster_sizes;
                                angular.forEach(icons, function (icon) {
                                    if (icon.size == 128) {
                                        $scope.icon = icon.formats[0].preview_url;
                                    }
                                });
                            }
                        });
                        $scope.result.article = derdiedas;
                        $scope.error.text = "";
                        $scope.result.full = result.raw;
                    } else {
                        $scope.error.text = "Your request has not returned any results";
                    }
                } else {
                    $scope.error.text = "Your request has not returned any results";
                }
            });
        }
    };

    $scope.speak = function () {
        $scope.error.text = "Say the noun...";
        var recognition = new SpeechRecognition();
        recognition.onresult = function (event) {
            if (event.results.length > 0) {
                $scope.request.word = event.results[0][0].transcript;
                $scope.submitQuery({keyCode: 13});
            }
        }
        recognition.start();
    };

    $scope.clearEntry = function () {
        $scope.request.word = "";
        $scope.result = {};
        $scope.error = {};
        $scope.icon = null;
    };

    $scope.openLink = function (link) {
        $window.open(link, '_blank', 'location=yes');
    };
});
