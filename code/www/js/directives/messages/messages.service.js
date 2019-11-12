(function() {
  'use strict;'

  angular
    .module('gaddum.messages')
    .factory('messagesService', messagesService)
  ;

  messagesService.$inject = [
    '$http'
  ];
  function messagesService(
    $http
  ) {
    var service={};

    service.messagesList = {};

    // dummy some data
    angular.merge(service.messagesList, {
      "1":{sender:1,
           state:1,
           dateTime:0,
           body:"First Message"
          },
      "2":{sender:1,
           state:2,
           dateTime:1,
           body:"Second Message"
          },
      "3":{sender:2,
           state:3,
           dateTime:2,
           body:"Third Message"
          }
    });

    return service;
  }
})();
