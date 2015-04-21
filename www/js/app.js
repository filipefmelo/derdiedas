// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic'])

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
app.controller('MainController', function ($scope, $http, $window) {
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
            $scope.error.text = "Please wait...";
            $http.get("http://mymemory.translated.net/api/get?q=the%20" + $scope.request.word + "&langpair=en|de").success(function (response) {
                var result = {};
                result.raw = response.responseData.translatedText;
                result.splitted = result.raw.split(" ");
                if (result.splitted.length === 2) {
                    var derdiedas = result.splitted[0].toLowerCase();
                    if (allowedCases.indexOf(derdiedas) !== -1) {
                        $scope.result.article = derdiedas;
                        $scope.error.text = "";
                        $scope.result.full = result.raw;
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
    };

    $scope.openLink = function (link) {
        $window.open(link, '_blank', 'location=yes');
    };
});
