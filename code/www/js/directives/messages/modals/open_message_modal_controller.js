(function () {
  'use strict';

  angular
    .module('openMessageModalModule')
    .controller('openMessageModalController', openMessageModalController);

  openMessageModalController.$inject = [
    '$scope',
    'openMessageModal',
    'friendsService'

  ];

  function openMessageModalController(
    $scope,
    openMessageModal,
    friendsService
  ) {
    var vm = angular.extend(this, {
      showGenres: false,
      messageType:"",
      params:[],
      true:true
    });
    var friendGraphic;
    function init() {
      vm.params = openMessageModal.getParams();
      console.log("params from modal",vm.params);
      vm.messageType=vm.params[0].message.message_type;
      friendGraphic= vm.params[1].graphic;
      //var canvas= document.getElementById('TESTCANVAS');
      
      setTimeout(function() {
        console.log("finding canvas");
        console.time('canvasFinding');
        while (document.getElementById('OpenMessageModalConnectionRequestAvatarImage')==null) {
        }
        var canvas= document.getElementById('OpenMessageModalConnectionRequestAvatarImage');
        console.timeEnd('canvasFinding');
        vm.createMessageProfileGraphic('OpenMessageModalConnectionRequestAvatarImage');
      }, 0);
      
    };

    vm.connectionRequestClick=function(response){
      console.log(response);
    };

    vm.closeModal=function(){
      openMessageModal.close();
    };

    var scale = 8;
    vm.createMessageProfileGraphic = function (canvasId) {
      setTimeout(function()  {
        console.log("messageid=", friendGraphic, "canvas", canvasId);
        var canvas = document.getElementById(canvasId);
        //console.log("canvas=",canvas);

        //canvas = canvas[canvas.length - 1];
        var ctx = canvas.getContext('2d');
        var nx = Math.floor(canvas.width / scale);
        var ny = Math.floor(canvas.height / scale);
        var bin;
        var drawColour;

        /* friendsService.searchFriendsByID(friendID).then(function (friend) { */
          console.log("friendGraphic", friendGraphic);

          drawColour = friendGraphic.colour;
          for (var j = 0; j < friendGraphic.values.length; j++) {
            bin = friendGraphic.values[j].toString(2);
            for (var x = bin.length; x < 8; x++) {
              bin = "0" + bin;
            }
            console.log("drawing",bin,"colour",drawColour);
            for (var k = 0; k < bin.length; k++) {
              if (bin[k] == "1") {
                rect(k, j, nx, ny, drawColour, ctx);
              } else {
                rect(k, j, nx, ny, '#ffffff', ctx);
              }
            }

          }

        /* },
          function () {
            console.log("couldn't find friend", friendID);
          } 
        );*/







      }, 1);

    };

    function rect(x, y, w, h, fs, ctx) {
      ctx.fillStyle = fs;
      ctx.fillRect(x * w, y * h, (w), h);
    }

    init();




  }
})();
