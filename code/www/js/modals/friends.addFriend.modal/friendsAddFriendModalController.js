(function () {
  'use strict';
  angular
    .module('FriendsAddFriendModule')
    .controller('friendsAddFriendModalController', friendsAddFriendModalController);

    friendsAddFriendModalController.$inject = [
    '$scope',
    'FriendsAddFriendModal'
  ];

  function friendsAddFriendModalController(
    $scope,
    FriendsAddFriendModal
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

    vm.modalpage=1;
    vm.modalTitles = ["","Add a friend - Step 1","Add a friend - Step 2","Add a friend - Step 3","Add a friend - Step 4", "Add a friend - Step 5"];
    vm.modalTitle = "";

    vm.addFriendsModalNext= function(){
      //console.log("miss_____________________________________________ modal ="+vm.modalpage);
      vm.modalpage++;
      vm.addFriendsModalUpdater();

      if (vm.modalpage===3) {
        cordova.plugins.barcodeScanner.scan(
          function (result) {
            alert("We got a barcode\n" +
                  "Result: " + result.text + "\n" +
                  "Format: " + result.format + "\n" +
                  "Cancelled: " + result.cancelled);
            vm.addFriendsModalNext();
          },
          function (error) {
            alert("Scanning failed: " + error);
          },
          {
            preferFrontCamera : true, // iOS and Android
            //showFlipCameraButton : true, // iOS and Android
            showTorchButton : true, // iOS and Android
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



    vm.addFriendsModalUpdater=function(){
      vm.modalTitle = vm.modalTitles[vm.modalPage];

      if (vm.modalpage==1) {
/*        document.getElementById("addFriendsModalPrevButton").disabled=true;
        document.getElementById("addFriendsModalCancelButton").disabled=false;
        document.getElementById("addFriendsModalHeaderText").innerHTML="Add a friend - Step 1";
        document.getElementById("addFriendsModalBodyText").innerHTML="You're about to request connection to your friend. You can only do this when you are together. Ask your friends to show you their Gaddum app, at the Profile page";
        vm.showFinishbutton=false;*/
      } else if (vm.modalpage==2){
/*        document.getElementById("addFriendsModalPrevButton").disabled=false;
        document.getElementById("addFriendsModalCancelButton").disabled=false;
        document.getElementById("addFriendsModalHeaderText").innerHTML="Add a friend - Step 2";
        document.getElementById("addFriendsModalBodyText").innerHTML="You should be able to see your friend's Gaddum profile screen. Press Next, to start scanning QR code on their profile. This will begin your connection process.";
        vm.showFinishbutton=false;*/
      } else if (vm.modalpage==3){
        // @TODO: Fire up this: https://github.com/phonegap/phonegap-plugin-barcodescanner
        // might be a good idea to kick it off from the modal, and when
        // a scan calls back with success, go straight to vm.modalpage of 4



/*        document.getElementById("addFriendsModalBodyText").innerHTML="This is where the scanner goes";
      }else if (vm.modalpage==4){
        document.getElementById("addFriendsModalCancelButton").disabled=true;
        document.getElementById("addFriendsModalHeaderText").innerHTML="Add a friend - Step 4";
        document.getElementById("addFriendsModalBodyText").innerHTML="Got it. Your connection rewuest has beem sent. Ask your friend to allow it. They'll see it in their gaddum 'Messages' Tab. You can make as many requests as you like. Just go back to the scanner, by pressing 'Again'";
        vm.showFinishbutton=false;
        vm.showFinishbutton=false;*/
      }else if (vm.modalpage==5){
/*        document.getElementById("addFriendsModalCancelButton").disabled=true;
        document.getElementById("addFriendsModalHeaderText").innerHTML="Add a friend - Step 5";
        document.getElementById("addFriendsModalBodyText").innerHTML="all your connection requestis have been sent. You can see if they succeeded in your 'Messages' tab.";
        vm.showFinishbutton=true;
        console.log(vm.showFinishbutton);*/
      }
    };
    //vm.showFinishbutton=false;

    vm.addFriendsModalPrev=function(){
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
    vm.openQR = function(){
     FriendsAddFriendModal.callbackfail(); 
    }

    init();
  }
})();
