const SERVER_ROOT = "https://gaddum.restlet.io:443"; // heroku service hides secret

(function() {
  'use strict';
  console.log("pushService executed");

  angular
    .module('push', [])
    .factory('pushService', pushService)
  ;

  pushService.$inject = [
    '$http',
    '$q'
  ];

  // (1) inject service
  // (2) setCallback(callbackHandler) <- set where inbound messages go
  // (3) initialisePush(signinCallbackHandler) <- confirmation of signin 

  // (a) subscribe(topic) <- set a subscription
  // (b) unsubscribe(topic)

  // (4) &callbackHandler(data) <- this is invoked on inbound data

  function pushService(
    $http,
    $q
  ) {
    console.log("pushService instantiated, part of push module");

    var service = {};

    service.SERVER_ROOT = SERVER_ROOT;

    service.push = undefined;
    service.registrationId = undefined;
    service.callbackHandler = undefined;

    service.subscribeCallbackHandler = undefined;
    service.timeoutMs = undefined;

	  service.setTimeout = function setTimeout(millis) {
		  service.timeoutMs = millis;
	  };

    service.initialise = function initialise(){
      var deferred = $q.defer();

      try{
        service.initialisePush( function(d){
          deferred.resolve( d.deviceId );
        } );
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;

    };

    service.initialisePush = function initialisePush( registeredCallback ) {
      service.push = PushNotification.init({
        android:{}
      });
      service.push.on('registration',function( data ){
        console.log("push.registration event, ", data);
        console.log("DEVICE ID: "+data.registrationId);
        service.registrationId = data.registrationId;
        if( registeredCallback !== undefined ) {
          //service.setCallback( registeredCallback );
          console.log( "- invoking callback for registration with ", data );
          registeredCallback( data );
        }
      });
      service.push.on('notification', function(data){
        console.log("push.notification event, ", data);
        if(data.hasOwnProperty("additionalData")) {
          if(data.additionalData.hasOwnProperty("payload")) {
            service.callbackHandler( data.additionalData );
          } else {
            console.log("inbound message missing an additionalData.payload property");
          }
        } else {
          console.log("inbound message missing an additionalData property");
        }
      });

      service.push.on('error', function (error) {
        console.log(error);
        throw(error);
      });
    };

    // get a connection UUID from the server
    service.getConnectionUUID = function getConnectionUUID(){
      $http.post(SERVER_ROOT+"/connections").then(
        function(d){
          console.log("getConnectionUUID - got back ",d);
        }
      );
    };

    // pass in a notification object in payload.notification
    // pass in recipient device in payload.recipient_id,
    //   or recipient topic as payload.recipient_id of "/topics/*YOUR_TOPIC*"
	  service.sendPayload = function sendPayload( payload ) {

      console.log( " → asked to send this payload:", payload );

      var sendRequest = { method: 'POST',
                          url: SERVER_ROOT + '/messages',
                          data: JSON.stringify(payload)
                         };

      if(service.timeoutMs!==undefined) {
      	sendRequest.timeout = service.timeoutMs;
      }
      console.log('push.service.sendPayload - using ',sendRequest );

      return $http( sendRequest ); // send back a promise
	  };

    service.setCallback = function setCallback( handler ) {
      service.callbackHandler = handler;
    };

    // subscription handling

    // there is no point keeping a log of topics that have been subscribed to
    service.subscribe = function subscribe( topic ) {
      service.push.subscribe( topic, function subscribeSuccess() {
        console.log("push.service - subscription to "+topic+"' successful!");

        service.push.on('registration', function (data) {
          //alert('registrationId:' + data.registrationId);
        });

        service.push.on('notification', function (data) {
          //alert('push:' + JSON.stringify(data));
        });

        service.push.on('error', function (e) {
          //alert('error: ' + e.message);
        });

      }, function subscribeFailure( err ){
        console.log("push.service - subscription to '"+topic+"' failed, error:", err);
        throw( err );
      });
    };

    service.unsubscribe = function unsubscribe( topic ) {
      service.push.unsubscribe( topic, function unsubscribeSuccess() {

      }, function unsubscribeFailure(err) {
        console.log("done screwed up unsubscribing from "+String(topic), err);
      });
    };

    return service;
  }

})();
