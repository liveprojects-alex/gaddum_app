/**
 * Service to handle Camera, Location and FileStorage permission checks and requests.
 * * using the plugin: cordova.plugins.diagnostic
 */

(function () {
  'use strict';

  angular
    .module('gaddum.permissions')
    .factory('permissionsService', permissionsService);

  permissionsService.$inject = [
    '$q',
    '$ionicPlatform'
  ];
  function permissionsService(
    $q,
    $ionicPlatform
  ) {
    var service = {
      permissions : {
        "hasAllRequiredPermissions": true,
/*        "storage": {
          "Android": {
            "check": "isCameraAuthorized",
            "get": "getCameraAuthorizationStatus",
            "request": "requestExternalStorageAuthorization"
          },
          "reason": "This app requires access to storage because android is a car crash and google run with scissors.",
          "hasPermission" : false,
          "deniedAlways": false
        },*/
        "camera": {
          "Android": {
            "check": "isCameraAuthorized",
            "get": "getCameraAuthorizationStatus",
            "request": "requestCameraAuthorization"
          },
          "iOS": {
            "check": "isCameraAuthorized",
            "get": "getCameraAuthorizationStatus",
            "request": "requestCameraAuthorization"
          },
          "reason": "This app requires access to the camera to determine your mood from your face.",
          "hasPermission" : false,
          "deniedAlways": false
        },
        "location": {
          "Android": {
            "check": "isLocationAuthorized",
            "get": "getLocationAuthorizationStatus",
            "request": "requestLocationAuthorization"
          },
          "iOS": {
            "check": "isLocationAuthorized",
            "get": "getLocationAuthorizationStatus",
            "request": "requestLocationAuthorization"
          },
          "reason": "This app requires access to location and GPS services to help recommend music",
          "hasPermission" : false,
          "deniedAlways": false
        }/* ,
            "write_storage": {
            "Android": {
            "check": "isExternalStorageAuthorized",
            "get": "getExternalStorageAuthorizationStatus",
            "request": "requestExternalStorageAuthorization"
            },
            "iOS": {
            "check": "isCameraRollAuthorized",
            "get": "getCameraRollAuthorizationStatus",
            "request": "requestCameraRollAuthorization"
            },
            "reason": "This app requires permission to save files to storage, This is used to store your personal music prefences ",
            "hasPermission" : false,
            "deniedAlways": false
            }*/
      }
    };

    var permissions = undefined; //set to permissions plugin
    $ionicPlatform.ready(function() {
      if(window.hasOwnProperty('cordova')===true) {
        permissions = cordova.plugins.diagnostic;
      }
    });

    var permissionsMap = [ 'camera', 'location' /*, 'write_storage' */ ];

    var permissionCodes = {
      "Android": {
        "GRANTED": "GRANTED",
        "DENIED_ALWAYS": "DENIED_ALWAYS"
      },
      "iOS": {
        "GRANTED": "authorized",
        "DENIED_ALWAYS": "denied"
      }
    };

    service.returnPermissions = function() {
      var waitForAllPermissions = $q.defer()
      var hasPermissions = {};

      service.permissions.hasAllRequiredPermissions = true;
      getAllPermissions(0, waitForAllPermissions);

      return waitForAllPermissions.promise;
    };
    service.returnPermissionStates = function() {
      var waitForAllPermissions = $q.defer()
      var hasPermissions = {};

      if(window.hasOwnProperty('cordova')===false) {
        waitForAllPermissions.resolve({hasAllRequiredPermissions: true});
      } else {
        service.permissions.hasAllRequiredPermissions = true;
        getAllPermissionStates(0, waitForAllPermissions);
      }

      return waitForAllPermissions.promise
    };

    var getAllPermissions = function(index, promise) {
      if(permissionsMap[index] == "camera") {
        permissions[ service.permissions[ permissionsMap[index] ][device.platform].check](
          function(result) {
            if(result == false){service.permissions.hasAllRequiredPermissions = false; }

            service.permissions[permissionsMap[index]].hasPermission = result;
            if(index < permissionsMap.length -1){
              getAllPermissions(++index, promise);
            } else {
              promise.resolve(service.permissions);
            }
          },
          function(){},
          {
            externalStorage: false
          }
        );
      } else {
        permissions[ service.permissions[ permissionsMap[index] ][device.platform].check](
          function(result) {
            if(result == false){service.permissions.hasAllRequiredPermissions = false; }

            service.permissions[permissionsMap[index]].hasPermission = result;
            if(index < permissionsMap.length -1){
              getAllPermissions(++index, promise);
            } else {
              promise.resolve(service.permissions);
            }
          },
          function(){}
        );
      }
    };

    var getAllPermissionStates = function(index, promise) {
      if(permissionsMap[index] != "camera") {
        permissions[ service.permissions[ permissionsMap[index] ][device.platform].get](
          function(status) {

            if(status.includes(permissionCodes[device.platform].GRANTED)){ //includes due to iOS location status = "authorized_when_in_use"
              service.permissions[permissionsMap[index]].hasPermission = true;
              service.permissions[permissionsMap[index]].deniedAlways = false;
            }
            else if(status == permissionCodes[device.platform].DENIED_ALWAYS){
              service.permissions[permissionsMap[index]].hasPermission = false;
              service.permissions[permissionsMap[index]].deniedAlways = true;
              service.permissions.hasAllRequiredPermissions = false;
            } else {
              service.permissions[permissionsMap[index]].hasPermission = false;
              service.permissions[permissionsMap[index]].deniedAlways = false;
              service.permissions.hasAllRequiredPermissions = false;
            }

            if(index < permissionsMap.length -1){
              getAllPermissionStates(++index, promise);
            } else {
              promise.resolve(service.permissions);
            }
          },
          function(){}
        );
      } else {
        permissions[ service.permissions[ permissionsMap[index] ][device.platform].get](
          function(status) {
            if(status == permissionCodes[device.platform].GRANTED){
              service.permissions[permissionsMap[index]].hasPermission = true;
              service.permissions[permissionsMap[index]].deniedAlways = false;
            }
            else if(status == permissionCodes[device.platform].DENIED_ALWAYS){
              service.permissions[permissionsMap[index]].hasPermission = false;
              service.permissions[permissionsMap[index]].deniedAlways = true;
              service.permissions.hasAllRequiredPermissions = false;
            } else {
              service.permissions[permissionsMap[index]].hasPermission = false;
              service.permissions[permissionsMap[index]].deniedAlways = false;
              service.permissions.hasAllRequiredPermissions = false;
            }
            if(index < permissionsMap.length -1){
              getAllPermissionStates(++index, promise);
            } else {
              promise.resolve(service.permissions);
            }
          },
          function(){},
          {
            externalStorage: false
          }
        );
      }
    };

    service.requestPermission = function(permissionType){
      var requestPermissionWait = $q.defer();

      if(permissionType != "camera") {
        permissions[ service.permissions[ permissionType ][device.platform].request](
          function(status){
            if(status == permissionCodes[device.platform].GRANTED){
              service.permissions[permissionType].hasPermission = true;
              service.permissions[permissionType].deniedAlways = false;
            }
            else if(status == permissionCodes[device.platform].DENIED_ALWAYS){
              service.permissions[permissionType].hasPermission = false;
              service.permissions[permissionType].deniedAlways = true;
              service.permissions.hasAllRequiredPermissions = false;
            } else {
              service.permissions[permissionType].hasPermission = false;
              service.permissions[permissionType].deniedAlways = false;
              service.permissions.hasAllRequiredPermissions = false;
            }
            requestPermissionWait.resolve();
          },
          function(){
            //console.log("error");
            requestPermissionWait.reject();
          }
        );
      } else {
        permissions[ service.permissions[ permissionType ][device.platform].request](
          function(status){
            // console.log(permissionType + " permission: "+ status);
            if(status.includes(permissionCodes[device.platform].GRANTED)){ //includes due to iOS location status = "authorized_when_in_use"
              service.permissions[permissionType].hasPermission = true;
              service.permissions[permissionType].deniedAlways = false;
            }
            else if(status == permissionCodes[device.platform].DENIED_ALWAYS){
              service.permissions[permissionType].hasPermission = false;
              service.permissions[permissionType].deniedAlways = true;
              service.permissions.hasAllRequiredPermissions = false;
            } else {
              service.permissions[permissionType].hasPermission = false;
              service.permissions[permissionType].deniedAlways = false;
              service.permissions.hasAllRequiredPermissions = false;
            }
            requestPermissionWait.resolve();
          },
          function(){
            //console.log("error");
            requestPermissionWait.reject();
          },
          {
            externalStorage: false
          }
        );
      }
      return requestPermissionWait.promise;
    };

    return service;
  }
})();
