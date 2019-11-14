(function(){

    var app = angular.module('gaddum.newMessageIcon',[]).directive('newMessageIconDirective', function(){
        
        return {
            restrict: 'E',
            replace: true,
            scope:{ 
                
            },
            templateUrl: "js/directives/newMessageIcon/newMessageIcon.directive.html",
            controller: 'newMessageIconController',
            controllerAs: 'vm',
            bindToController: true
            //remember to do the index and name of directive stuff
        };
    });
  }());