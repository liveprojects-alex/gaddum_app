(function(){

  var app = angular
      .module('gaddum.messages')
      .directive('messagesDirective', function(){
        return {
          restrict: 'E',
          scope:{
            firstTime: '@',
            enable: '@',
          },
          templateUrl: "js/directives/messages/messages.list.html",
          controller: 'messagesListDirectiveController',
          controllerAs: 'vm',
          bindToController: true
          //remember to do the index and name of directive stuff
        };
    });
}());
