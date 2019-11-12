(function(){
  'user strict';

  angular
    .module('gaddum.messages')
    .controller('messagesListDirectiveController', messagesListDirectiveController);

    messagesListDirectiveController.$inject = [
    '$state',
    '$stateParams',
    '$ionicSlideBoxDelegate',
    'messagesService'
  ];

  function messagesListDirectiveController(
    $state,
    $stateParams,
    $ionicSlideBoxDelegate,
    messagesService
  ) {
    var vm = angular.extend(this, {

    });

    vm.preventSlideBox = function preventSlideBox() {
      $ionicSlideBoxDelegate.enableSlide(false);
    };
    vm.allowSlideBox = function allowSlideBox(e) {
      $ionicSlideBoxDelegate.enableSlide(true);
    };
    
    // attaching these methods to ng-mousedown/up on ion-items
    // makes swiping the item not cause the slidebox to move
    vm.preventSlideBox = function preventSlideBox() {
      $ionicSlideBoxDelegate.enableSlide(false);
    };
    vm.allowSlideBox = function allowSlideBox(e) {
      $ionicSlideBoxDelegate.enableSlide(true);
    };

    vm.messagesList = messagesService.messagesList;

    vm.messages=[
    {"From":"Friend1","Content":"Hi from 1"},
    {"From":"Friend2","Content":"Hi from 2"},
    {"From":"Friend3","Content":"Hi from 3"},
    {"From":"Friend4","Content":"Hi from 4"},
    {"From":"Friend5","Content":"Hi from 5"},
    ];
  }

})();
