(function(){

    var app = angular
        .module('gaddum.permissions')
        .directive('permissionsDirective', function(){

        return {
            restrict: 'E',
            scope:{
            },
            templateUrl: "js/modules/permissions/permissions.html",
            controller: 'permissionsDirectiveController',
            controllerAs: 'vm',
            bindToController: true

        };
    });
}());

