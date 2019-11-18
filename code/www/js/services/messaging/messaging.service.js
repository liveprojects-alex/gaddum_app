(function(){
  'use strict';

  angular
    .module('push')
    .factory('messagingService', messagingService)
  ;

  messagingService.$inject = [
    '$rootScope',
    'pushService',
    'userSettingsService',
    '$q'
  ];
  function messagingService(
    $rootScope,
    pushService,
    userSettingsService,
    $q
  ) {

    var service = {
      deviceId: null
    };

    service.message_type = {
      "NONE":                0,
      "CONNECTION_REQUEST":  1,
      "CONNECTION_RESPONSE": 2,
      "CONNECTION_TEARDOWN": 3,
      "SYSTEM_MESSAGE":      4,
      "MESSAGE":             5
    };

    service.initialise = function initialise() {
      var deferred = $q.defer();
      try {
        pushService.initialisePush( function pushInitialisedCompletely( message ) {
          console.log( "push signed in, got registration message ", message );
          service.deviceId = message.registrationId;
          userSettingsService.asyncSet("deviceId", message.deviceId, "STRING" /* this last parameter is a guess - check @todo */ );
          console.log("deviceID is now ",message.registrationId);
          pushService.setCallback(service.inboundHandler);
          deferred.resolve( message );
        });
      } catch (err) {
        console.log( "Error starting up messagingService - " , err );
        throw( "error starting messagingService - " , err );
        deferred.reject(err);
      }
      return deferred.promise;
    };

    service.getDeviceId = function getDeviceId() {
      if(service.deviceId !== null) {
        var deferred = $q.defer;
        deferred.resolve(service.deviceId);
        return deferred.promise;
      } else {
        return(
          pushService.initialise()
        );
      }return deferred.promise;
    };

    service.requestConnection = function requestConnection(cUUID) {
      pushService.getConnectionUUID().then(function(d){
        console.log("requestConnection - got ",d);
      });
    };

    service.requestDisconnection = function requestDisconnection(cUUID) {
      var deferred = $q.defer();

    };


    service.makeUUID = function makeUUID() {
      // thanks https://stackoverflow.com/a/2117523
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(
        /[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).
          toString(16)
      );
    };

    service.inboundHandler = function inboundHandler( message ) {
      var eventName = "message."+message.payload.hasOwnProperty("message_type")?
          message.payload.message_type:service.message_type.NONE;

      $rootScope.$broadcast(eventName, message.payload );
//
      //      NONE, CONNECTION_REQUEST, CONNECTION_RESPONSE, CONNECTION_TEARDOWN, SYSTEM_MESSAGE, MESSAGE
//  usage:
//      $scope.$on('message.CONNECTION_REQUEST', function(e, data){
//        // handle message
//     });
    };

    service.send = function send(p) {
      if(p.payload.hasOwnProperty("dateStamp")===false){
        p.payload.dateStamp = new Date().getTime();
      }
      if(p.payload.hasOwnProperty("uuid")===false) {
        p.payload.uuid = service.makeUUID();

      }
      if(p.payload.hasOwnProperty("message_type")===false) {
        p.payload.message_type = service.message_type.MESSAGE;
      }
      pushService.sendPayload(p);
    };

    service.subscribe = pushService.subscribe;

    service.unsubscribe = pushService.unsubscribe;

    return service;
  }

})();
