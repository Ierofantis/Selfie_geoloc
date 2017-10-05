'use strict';

/**
 * @ngdoc function
 * @name qcApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the qcApp
 */

//bower ngstorage and not ngStorage!

angular.module('qcApp')
  .controller('MainCtrl', function($scope, $localStorage, $sessionStorage, mainServiceObj) {

    var place_id = '';
    var latitude = '';
    var longitude = '';
    var mapProp = {
      center: new google.maps.LatLng(51.508742, -0.120850),
      zoom: 15,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
    // Elements for taking the snapshot
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var video = document.getElementById('video');
      

    // // reload from localStorage

    // var img = new Image();
    // img.onload = function() {
    //   context.drawImage(img, 0, 0);
    // }
    // img.src = localStorage.getItem("canvas");

    // Get access to the camera!
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Not adding `{ audio: true }` since we only want video now
      navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
      });
    }

    $scope.rating = 'Sometimes there are no ratings for the area!';
    $scope.types = 'What type of place is this ? ';


    //html5 geolocation window when at home

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }

    function showPosition(position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    }

    //The function for finding place details

    $scope.qualityFunc = function() {
      //We are calling coordinates in order to use them on the 
      //second service.      
      context.drawImage(video, 0, 0, 200, 200);
      mainServiceObj.getCoordinates(latitude, longitude)
        .then(function(success) {
          place_id = success.data.results[0].place_id;

          //Configuring the map and refreshing with latitude and longitude  

          var mapProp = {
            center: new google.maps.LatLng(latitude, longitude),
            zoom: 15,
          };
          var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

          //Now we are calling the second service for having the data that we need

          mainServiceObj.getQuality(place_id)
            .then(function(success) {
              $scope.types = success.data.result.types[0];
              if (success.data.result.rating) {
                $scope.rating = success.data.result.rating;

              } else {
                $scope.rating = '' + success.data.result.name;
              }
            });
        });
    }

    //Local storage functionality

    $scope.list = []
    $scope.x = {}

    if ($localStorage.list) {
      $scope.$storage = $localStorage.list;
      $scope.list = $localStorage.list;
    }

    $scope.savePlaces = function(x) {

      localStorage.setItem("canvas", canvas.toDataURL());
      $scope.image = localStorage.getItem("canvas"); 
      $scope.x.types = $scope.types;
      $scope.x.rating = $scope.rating;
      $scope.x.image = $scope.image;


      $scope.list.push(x);
      $localStorage.list = $scope.list;
      $scope.$storage = $localStorage.list;

     
    }

    $scope.deletePlaces = function(x) {
      $localStorage.list.splice($localStorage.list.indexOf(x), 1);
    }
  });
