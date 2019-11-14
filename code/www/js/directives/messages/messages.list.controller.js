(function(){
  'user strict';

  angular
    .module('gaddum.messages')
    .controller('messagesListDirectiveController', messagesListDirectiveController);

    messagesListDirectiveController.$inject = [
    '$state',
    '$stateParams',
    '$ionicSlideBoxDelegate',
    'messagesService',
    'friendsService'
  ];

  function messagesListDirectiveController(
    $state,
    $stateParams,
    $ionicSlideBoxDelegate,
    messagesService,
    friendsService
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
    {"From":"11111111-5500-4cf5-8d42-228864f4807a","Content":"Sword 1","message_ID":"Aatrox"},
    {"From":"22222222-5500-4cf5-8d42-228864f4807a","Content":"Fox 2","message_ID":"Ahri"},
    {"From":"33333333-5500-4cf5-8d42-228864f4807a","Content":"Ninja 3","message_ID":"Akali"},
    {"From":"44444444-5500-4cf5-8d42-228864f4807a","Content":"Cow 4","message_ID":"Alistar"},
    {"From":"55555555-5500-4cf5-8d42-228864f4807a","Content":"Sad boi 5","message_ID":"Amumu"},
    //{"From":"66666666-5500-4cf5-8d42-228864f4807a","Content":"Egg 6","message_ID":"Anivia"},
    ];

    vm.friends=[

    ]

    vm.getMessageSender= function(currentMessageID){
      var sender=null;
      vm.messages.forEach(function(message) {
        if (message.message_ID==currentMessageID) {
          sender=message.From;
        }
      });
      console.log("sender/id"+sender,currentMessageID)
      vm.createMessageProfileGraphic(sender,currentMessageID);
    }
    var scale = 8;
    vm.createMessageProfileGraphic = function (friendID,messageid) {
      setTimeout(() => {
        console.log(messageid);
        var canvas = document.getElementById(messageid);
        console.log(canvas);
        
      //canvas = canvas[canvas.length - 1];
      var ctx = canvas.getContext('2d');
      var nx = Math.floor(canvas.width / scale);
      var ny = Math.floor(canvas.height / scale);
      var bin;
      var drawColour;

      friendsService.searchFriendsByID(friendID).then(function (friend) {
        console.log(friend);
        
        drawColour = friend.profile.avatar_graphic_colour;
        for (var j = 0; j < friend.profile.avatar_graphic.length; j++) {
          bin = friend.profile.avatar_graphic[j].toString(2);
          for (var x = bin.length; x < 8; x++) {
            bin = "0" + bin;
          }
          //console.log(bin);
          for (var k = 0; k < bin.length; k++) {
            if (bin[k] == "1") {
              rect(k, j, nx, ny, drawColour, ctx);
            } else {
              rect(k, j, nx, ny, '#ffffff', ctx);
            }
          }

        }

      },
        function () {
          console.log("couldn't find friend", friendID);
        }
      );







      }, 0);
      
    }
  ;

    function rect(x, y, w, h, fs, ctx) {
      ctx.fillStyle = fs;
      ctx.fillRect(x*w, y*h, (w), h);
    }

    var friendsDummy=[
      
      {"profile": {
        "profile_id": "11111111-5500-4cf5-8d42-228864f4807a",
        "avatar_name": "Pineapple Fruit-Butter",
        "avatar_graphic": [
          0,
          0,
          0,
          24,/* 60 */
          24,
          0,
          0,
          0
        ],
        device_id: "dJUr6sA28ZY:A1A91bH-chjJ8lcq61ofrjoHjak3q6nCFALPGytdEsLzh2DacCx7ihhZHxd6pPSXYMhtx4MlcQekn1rzjB7c809aNzivPFu5jhA-SR6FWbvzfBsO8ySo6um8DVA9dgOgokzz0QU5vbEf"
      }},
      {"profile": {
        "profile_id": "22222222-5500-4cf5-8d42-228864f4807a",
        "avatar_name": "Strawberry Jam",
        "avatar_graphic": [
          0,
          96,
          96,
          0,
          0,
          6,
          6,
          0,
          
          /* 0,
          102,
          102,
          24,
          24,
          66,
          126,
          0 */
        ],
        device_id: "dJUr6sA28ZY:A2A91bH-chjJ8lcq61ofrjoHjak3q6nCFALPGytdEsLzh2DacCx7ihhZHxd6pPSXYMhtx4MlcQekn1rzjB7c809aNzivPFu5jhA-SR6FWbvzfBsO8ySo6um8DVA9dgOgokzz0QU5vbEf"
      }},
      {"profile": {
        "profile_id": "33333333-5500-4cf5-8d42-228864f4807a",
        "avatar_name": "Raspberry Puree",
        "avatar_graphic": [
          0,
          96,
          96,
          24,
          24,
          6,
          6,
          0
        ],
        device_id: "dJUr6sA28ZY:A3A91bH-chjJ8lcq61ofrjoHjak3q6nCFALPGytdEsLzh2DacCx7ihhZHxd6pPSXYMhtx4MlcQekn1rzjB7c809aNzivPFu5jhA-SR6FWbvzfBsO8ySo6um8DVA9dgOgokzz0QU5vbEf"
      }},
      {"profile": {
        "profile_id": "44444444-5500-4cf5-8d42-228864f4807a",
        "avatar_name": "Apple Curd",
        "avatar_graphic": [
          0,
          102,
          102,
          0,
          0,
          102,
          102,
          0
        ],
        device_id: "dJUr6sA28ZY:A4A91bH-chjJ8lcq61ofrjoHjak3q6nCFALPGytdEsLzh2DacCx7ihhZHxd6pPSXYMhtx4MlcQekn1rzjB7c809aNzivPFu5jhA-SR6FWbvzfBsO8ySo6um8DVA9dgOgokzz0QU5vbEf"
      }},
      {"profile": {
        "profile_id": "55555555-5500-4cf5-8d42-228864f4807a",
        "avatar_name": "Banana Fruit-Spread",
        "avatar_graphic": [
          0,
          102,
          102,
          24,
          24,
          102,
          102,
          0
        ],
        device_id: "dJUr6sA28ZY:A5A91bH-chjJ8lcq61ofrjoHjak3q6nCFALPGytdEsLzh2DacCx7ihhZHxd6pPSXYMhtx4MlcQekn1rzjB7c809aNzivPFu5jhA-SR6FWbvzfBsO8ySo6um8DVA9dgOgokzz0QU5vbEf"
      }},
    ];


  }

})();
