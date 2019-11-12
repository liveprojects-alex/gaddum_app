(function() {
  'use strict';

  angular
    .module('gaddum.messages', [
      'ui.router',
      'ngAnimate'
    ])
    .config(function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('gaddum.messages', {
          url: '^/messages',
          cache: true,
          //          virtual: true,
          redirectTo: 'gaddum.messages.messageList'
        })
        .state('gaddum.messages.messageList', {
          cache: false,
          url: '^/messages/list',
          resolve: (['gaddumShortcutBarService',function(gaddumShortcutBarService){
            gaddumShortcutBarService.clearContextMenu();
          }]),
          views: {
            'messages@gaddum': {
              templateUrl: 'js/modules/messages/messages.list.html',
              controller: "messagesListController",
              controllerAs: "mlc"
            }
          }
        });
    });
})();
