(function () {
  'use strict';

  angular
    .module('openMessageModalModule')
    .controller('openMessageModalController', openMessageModalController);

  openMessageModalController.$inject = [
    '$scope',
    'openMessageModal'

  ];

  function openMessageModalController(
    $scope,
    openMessageModal
  ) {
    var vm = angular.extend(this, {
      showGenres: false,
      messageType:"",
      params:[],
      true:true
    });
    
    function init() {
      vm.params = openMessageModal.getParams();
      console.log("params from modal",vm.params);
      vm.messageType=vm.params[0].message.message_type;
    };

    vm.connectionRequestClick=function(response){
      console.log(response);
    };

    vm.closeModal=function(){
      openMessageModal.close();
    };

    init();




  }
})();
