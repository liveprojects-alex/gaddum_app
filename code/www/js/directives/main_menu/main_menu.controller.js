(function () {
  'use strict';

  angular
    .module('gaddum.main_ui')
    .controller('mainMenuController', mainMenuController);

    mainMenuController.$inject = [
    '$state',
    '$stateParams',
    '$ionicSlideBoxDelegate',
    '$timeout',
    'mainMenuModal',
    
    
    '$ionicModal',
    '$scope',
    /* 'friend_connectionSrvc' */

  ];

  function mainMenuController(
    $state,
    $stateParams,
    $ionicSlideBoxDelegate,
    $timeout,
    mainMenuModal,

    
   
    $ionicModal,
    

    $scope
  ) {
    var vm = angular.extend(this, {
      
    });
    vm.params = null;
    function mainMenuModalOpen(){
      mainMenuModal.open(vm.params,fnCallbackOk,fnCallbackCancel)
      
    }
    function fnCallbackOk(){
      // console.log("modal ok");
    }
    function fnCallbackCancel(){
      // console.log("modal cancel");
    }

    
   
    vm.mainMenuModalOpen = mainMenuModalOpen;
  }
})();
