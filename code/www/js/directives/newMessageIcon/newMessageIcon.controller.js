
(function () {
    'use strict';
  
    angular
      .module('gaddum.newMessageIcon')
      .controller('newMessageIconController', newMessageIconController);
  
      newMessageIconController.$inject = [
      'newMessageIconService',
      '$state'
  
    ];
  
    function newMessageIconController(
      newMessageIconService,
      $state
    ) {
      var vm = angular.extend(this, {
        icon: false,
        show: false
      });
      function init(){
        newMessageIconService.setCallbackFunction(changeIcon);
      }
      init();
      function changeIcon(iconType){
        vm.icon = iconType;
        vm.show = true;
      }
      function hide(){
        vm.show = false;
      }
      vm.redirect = function(){
        $state.go('gaddum.messages');
        hide();
      }
      
    }
  })();
  