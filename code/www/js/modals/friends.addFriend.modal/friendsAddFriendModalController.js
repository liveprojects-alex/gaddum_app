(function () {
  'use strict';
  angular
    .module('FriendsAddFriendModule')
    .controller('friendsAddFriendModalController', friendsAddFriendModalController);

    friendsAddFriendModalController.$inject = [
      '$scope',
      'FriendsAddFriendModal',
      'messagingService',
      'userSettingsService'
  ];

  function friendsAddFriendModalController(
    $scope,
    FriendsAddFriendModal,
    messagingService,
    userSettingsService
  ) {

    var vm = angular.extend(this, {
      params:null,
      playlist:[],
      modalpage:1
    });
    $scope.FriendsAddFriendModal = FriendsAddFriendModal;

    function init() {
      vm.params = FriendsAddFriendModal.getParams();
      if(vm.params.pageNum){
        vm.modalpage = vm.params.pageNum;
      }
      if(vm.params.content){
        console.log(vm.params.content);
      }
      vm.addFriendsModalUpdater();
    };

    //copy paste will need a good look over

    vm.modalpage = 1;
    vm.modalTitles = { 0 : "",
                       1 : "Add a friend - Step 1",
                       2 : "Add a friend - Step 2",
                       3 : "Add a friend - Step 3",
                       4 : "Add a friend - Step 4",
                       5 : "Add a friend - Step 5" };

    vm.addFriendsModalNext = function(){
      //console.log("miss_____________________________________________ modal ="+vm.modalpage);
      vm.modalpage++;
      vm.addFriendsModalUpdater();
    };

    vm.addFriendsModalUpdater=function(){
      //vm.modalTitle = vm.modalTitles[vm.modalPage];
      if (vm.modalpage===3) {
        cordova.plugins.barcodeScanner.scan(
          function (result) {
            console.log("We got a barcode", result);
            userSettingsService.asyncGet(messagingService.deviceIdKey).then(function(devKey){
              messagingService.sendMessage(
                {
                  message_type: messagingService.message_type.CONNECTION_REQUEST,
                  destination_id: [
                    // TODO: How to get a user device key from this?
                    result.text
                  ],
                  sender_id: devKey,
                  payload: {
                    partyOneId: messagingService.__getDevKey(), //devKey, // only while asyncGet is returning null
                    partyTwoId: result.text
                  }
                },
                messagingService.message_type_endpoints[messagingService.message_type.CONNECTION_REQUEST]
              );
              vm.addFriendsModalNext();
            });
          },
          function (error) {
            alert("Scanning failed: " + error);
          },
          {
            preferFrontCamera : false, // iOS and Android
            //showFlipCameraButton : true, // iOS and Android
            showTorchButton : false, // iOS and Android
            //torchOn: true, // Android, launch with the torch switched on (if available)
            //saveHistory: true, // Android, save scan history (default false)
            //prompt : "Place a barcode inside the scan area", // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
            //orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
            //disableAnimations : true, // iOS
            disableSuccessBeep: false // iOS and Android
          }
        );
      }

    };
    //vm.showFinishbutton=false;

    vm.addFriendsModalPrev=function(){
      vm.modalpage--;
      if(vm.modalpage===3) {
        vm.modalpage = 2; // so if you have scanned, and pick prev, you go back to *before* the scanning
      }
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
    vm.openQR = function(){
     FriendsAddFriendModal.callbackfail(); 
    };

    init();
  }
})();
