(function () {
  'use strict';
  angular
    .module('playlistEditModule')
    .controller('playlistEditModalController', playlistEditModalController);

  playlistEditModalController.$inject = [
    '$scope',
    'playlistEditModal'
    

  ];

  function playlistEditModalController(
    $scope,
    playlistEditModal
    
  ) {
    var vm = angular.extend(this, {
      params:null,
      playlist:[],
      showDelete:false,
      showReorder:false,
      disableOk:false
    });
    $scope.playlistEditModal = playlistEditModal;
    function init() {
      vm.params = playlistEditModal.getParams();
      vm.showDelete=true;
      vm.showReorder=true;
      // console.log("params22!",vm.params);
    };
    init();
    

    vm.returnData = function () {
      playlistEditModal.callback();
    };
    vm.cancel = function(){
      playlistEditModal.cancel();
    }

    vm.reorderlog=function(song, fromIndex,toIndex){
      // console.log(song, fromIndex,toIndex);
      vm.params.tracks.splice(fromIndex, 1);
      vm.params.tracks.splice(toIndex, 0, song);
      playlistEditModal.trackData(vm.params.tracks);
      // console.log(vm.params.tracks);
    };
    var name = null;
    vm.textChange = function(){
      name = vm.params.playlist.getName();
      if(name.length === 0){
        vm.disableOk = true;
      }
      else{
        vm.disableOk = false;
      }
      playlistEditModal.nameData(vm.params.playlist.getName());
    }

    vm.deleteSong=function(index){
      vm.params.tracks.splice(index,1);
      playlistEditModal.trackData(vm.params.tracks);
    }

    vm.showDeleteToggle=function(){
      vm.showDelete=!vm.showDelete;
    }
    vm.showReorderToggle=function(){
      vm.showReorder=!vm.showReorder;
    }






    

    
  }
})();