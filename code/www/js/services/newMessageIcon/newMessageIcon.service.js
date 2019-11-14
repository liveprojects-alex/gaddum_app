(function () {
    'use strict;'
  
    angular
      .module('gaddum.newMessageIcon' )
      .factory('newMessageIconService', newMessageIconService)
      ;
  
      newMessageIconService.$inject = [
      
    ];
    function newMessageIconService(
     
    ) {
      
      var callbackFunction = null;
      function setCallbackFunction(callbackFun){
          callbackFunction = callbackFun;
      }
      function requestMessage(){
          callbackFunction("Request");
      }
      function responseMessage(){
          callbackFunction("Response");
      }
      function brokenMessage(){
        callbackFunction("Broken");
    }
    function musicMessage(){
        callbackFunction("Music");
    }
    function systemMessage(){
        callbackFunction("System");
    }
  
      var service = {
        setCallbackFunction:setCallbackFunction,
        requestMessage:requestMessage,
        responseMessage:responseMessage,
        brokenMessage:brokenMessage,
        musicMessage:musicMessage,
        systemMessage:systemMessage
      };
  
      return service;
    }
  })();
  