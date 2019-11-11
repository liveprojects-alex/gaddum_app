(function () {
  'use strict';
  angular
    .module('FriendsAddFriendModule')
    .controller('friendsAddFriendModalController', friendsAddFriendModalController);

    friendsAddFriendModalController.$inject = [
    '$scope'
  ];

  function friendsAddFriendModalController(
    $scope
  ) {

    var vm = angular.extend(this, {
      params:null,
      playlist:[]
    });
    $scope.addToFriendModal = addToFriendModal;


    function init() {
      vm.params = addToFriendModal.getParams();
    };

    //copy paste will need a good look over

    vm.modalpage=1;
    vm.addFreindsModalNext= function(){
      //console.log("miss_____________________________________________ modal ="+vm.modalpage);
      vm.modalpage++;
      vm.addFriendsModalUpdater();
    };
    vm.addFriendsModalUpdater=function(){
      if (vm.modalpage==1) {
        document.getElementById("addFriendsModalPrevButton").disabled=true;
        document.getElementById("addFriendsModalCancelButton").disabled=false;
        document.getElementById("addFriendsModalHeaderText").innerHTML="Add a friend - Step 1";
        document.getElementById("addFriendsModalBodyText").innerHTML="You're about to request connection to your friend. You can only do this when you are together. Ask your friends to show you their Gaddum app, at the Profile page";
        vm.showFinishbutton=false;
      } else if (vm.modalpage==2){
        document.getElementById("addFriendsModalPrevButton").disabled=false;
        document.getElementById("addFriendsModalCancelButton").disabled=false;
        document.getElementById("addFriendsModalHeaderText").innerHTML="Add a friend - Step 2";
        document.getElementById("addFriendsModalBodyText").innerHTML="You should be able to see your friend's Gaddum profile screen. Press Next, to start scanning QR code on their profile. This will begin your connection process.";
        vm.showFinishbutton=false;
      } else if (vm.modalpage==3){
        document.getElementById("addFriendsModalBodyText").innerHTML="This is where the scanner goes";
      }else if (vm.modalpage==4){
        document.getElementById("addFriendsModalCancelButton").disabled=true;
        document.getElementById("addFriendsModalHeaderText").innerHTML="Add a friend - Step 4";
        document.getElementById("addFriendsModalBodyText").innerHTML="Got it. Your connection rewuest has beem sent. Ask your friend to allow it. They'll see it in their gaddum 'Messages' Tab. You can make as many requests as you like. Just go back to the scanner, by pressing 'Again'";
        vm.showFinishbutton=false;
        vm.showFinishbutton=false;
      }else if (vm.modalpage==5){
        document.getElementById("addFriendsModalCancelButton").disabled=true;
        document.getElementById("addFriendsModalHeaderText").innerHTML="Add a friend - Step 5";
        document.getElementById("addFriendsModalBodyText").innerHTML="all your connection requestis have been sent. You can see if they succeeded in your 'Messages' tab.";
        vm.showFinishbutton=true;
        console.log(vm.showFinishbutton);
      }
    };
    vm.showFinishbutton=false;

    vm.addFreindsModalPrev=function(){
      vm.modalpage--;
      vm.addFriendsModalUpdater();
    };

    vm.addFriendsModalClose=function(){
      vm.modalpage=1;
      vm.showFinishbutton=false;
      $scope.modal.remove()
      .then(function() {
        $scope.modal = null;
      });
    };

    init();
  }
})();
