(function(){
  'use strict';

  angular
    .module('push')
    .factory('messagingService', messagingService)
  ;

  messagingService.$inject = [
    '$rootScope',
    'pushService',
    'pubsubService',
    'userSettingsService',
    '$q'
  ];
  function messagingService(
    $rootScope,
    pushService,
    pubsubService,
    userSettingsService,
    $q
  ) {

    var service = {
      callbacks: { },
      deviceIdKey: "push_device_id"
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
          userSettingsService.asyncSet(service.deviceIdKey, message.registrationId, "string" );
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

    service.subscribe = pushService.subscribe;

    service.unsubscribe = pushService.unsubscribe;

    service.getDeviceId = function getDeviceId() {
      return(
        userSettingsService.asyncGet( service.deviceIdKey )
      );
    };

    service.requestConnection = function requestConnection(cUUID) {
      return(
        pushService.getConnectionUUID()
      );
    };

    service.requestDisconnection = function requestDisconnection() {
      userSettingsService.asyncGet("push_device_id").then(function(cUUID){
        pushService.disconnect(cUUID).then(function(){
          service.deviceId = null;
          userSettingsService.asyncSet(service.deviceIdKey, "", "string");
        });
      });
    };

    service.handleInboundDisconnection = function handleInboundDisconnection( message ) {
      // the subscriber PushNotificationService recognises the connection_teardown.
      // the subscriber PushNotificationService calls unsubscribe() on the PushProviderPlugin, using the PushMessage senderId.
      // The connection is now no longer accessible, and the 2 devices cannot communicate, without re-establishing the connection.
      // PushNotificationService passes the message to the inboundMessageCallback (out to the rest of the app)

    }

    service.addInboundMessageCallback = function addInboundMessageCallback(id, fnCallback) {
      service.callbacks[ id ] = fnCallback;
    };

    service.removeInboundMessageCallback = function removeInboundMessageCallback(id) {
      if(service.callbacks.hasOwnProperty( id ) === true ) {
        delete service.callbacks.id;
      }
    };

    service.inboundHandler = function inboundHandler( message ) {
      var eventName = "message."+message.payload.hasOwnProperty("message_type")?
          message.payload.message_type:
          service.message_type.NONE;
      // message_type is one of NONE, CONNECTION_REQUEST, CONNECTION_RESPONSE, CONNECTION_TEARDOWN, SYSTEM_MESSAGE, MESSAGE

      // using the pubsubService:
      // pubsubService.asyncPublish( eventName, message );

      // using angularjs broadcast system:
      //$rootScope.$broadcast(eventName, message );
      //  usage:
      //      $scope.$on('message.CONNECTION_REQUEST', function(e, data){
      //        // handle message
      //     });

      // handle teardown - https://trello.com/c/G1eEO92o/20-pushnotificationservice
      if(message.payload.hasOwnProperty("message_type")) {
        if( message.payload.message_type === service.message_type.CONNECTION_TEARDOWN ) {
          pushService.unsubscribe( message.sender_id );
        }
      }

      for(var key in service.callbacks) {
        service.callbacks[key]( message );
      }

    };

    service.sendMessage = function sendMessage(p) {
      if(p.payload.hasOwnProperty("dateStamp")===false){
        p.payload.dateStamp = new Date().getTime();
      }
      if(p.payload.hasOwnProperty("uuid")===false) {
        function makeUUID() { // thanks https://stackoverflow.com/a/2117523
          return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(
            /[018]/g, function(c){
              (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).
                toString(16);
            }
          );
        };
        p.payload.uuid = makeUUID();
      }
      if(p.payload.hasOwnProperty("message_type")===false) {
        p.payload.message_type = service.message_type.MESSAGE;
      }
      pushService.sendPayload(p);
    };

    return service;
  }

})();
