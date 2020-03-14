(function () {
  'use strict';

  angular
    .module('gaddum.mood')
    .controller('moodDirectiveController', moodDirectiveController);

  moodDirectiveController.$inject = [
    '$state',
    '$timeout',
    '$q',
    'emotionReaderService',
    'moodService',
    '$ionicModal',
    '$scope',
    'moodSelectModal',
    'gaddumShortcutBarService',
    'spinnerService'
  ];

  function moodDirectiveController(
    $state,
    $timeout,
    $q,
    emotionReaderService,
    moodService,
    $ionicModal,
    $scope,
    moodSelectModal,
    gaddumShortcutBarService,
    spinnerService
  ) {
    var vm = angular.extend(this, {
      debugging: false,
      allEmotions: null,
      selectedMoodId: null,
      cameraError: false,
      isRunning: false,
      faceDetected: false,
      moodDisplay: {},
      detecting: true,
      helpTips: null,  //this shows/hides the speech boxes 
      disableButton: false,
      emotionSelected: false,
      lookAtTheCameraText: false,
      bang: false,
      throbbing: false,
      cameraErrorString: 'Whoops! No Camera!',
      isFirstTime: true
    });

    var _interval_ms = 100;
    var enabled = true;
    var lastMoodId = null;
    var detecting = false;
    var moodIdDict = {};


    function beginInitialiseCapture(fnCallback) {

      var elementId = "canvas";
      var canvas = document.getElementById(elementId);
      var ctx = canvas.getContext("webgl1");


      CanvasCamera.initialize(canvas);
      var options = {
        cameraFacing: 'front',
        fps: 30,
        width: 140,
        height: 140,
        canvas: {
          width: 140,
          height: 140,
        },
        capture: {
          width: 140,
          height: 140
        },
        onAfterDraw: function (frame) {
          if (vm.isFirstTime) {
            vm.isFirstTime = false;
            // We init Weboji here otherwise the size of the video canvas is wrong.
            vm.initWeboji(canvas);
          }
        }
      };
      //console.log("££ Starting CanvasCamera with ",options);
      CanvasCamera.start(options);

      emotionReaderService.setListener(fnCallback);

    }

    vm.initWeboji = function initWeboji(canvas) {
      //console.log("!! initWeboji called");
      emotionReaderService.initialise(
        canvas.width, canvas.height, {
        canvasId: "jeefacetransferCanvas",
        videoSettings: {
          idealWidth: 32,
          idealHeight: 24,
          minWidth: 32,
          maxWidth: 24,
          minHeight: 32,
          maxHeight: 32,
          videoElement: canvas
        }
      }
      );
    };

    function defaultDisplay() {
      vm.moodDisplay.name = 'No Mood!';
      vm.moodDisplay.id = 'No Mood!';
    }


    function updateDisplay(moodId) {
      if (moodId) {
        //console.log("mood", moodId, "moodDict", moodIdDict, "mooddis", vm.moodDisplay);
        vm.moodDisplay.name = moodIdDict[moodId].name;
        vm.moodDisplay.emoji = moodIdDict[moodId].emoji;
        vm.moodDisplay.id = moodId;
        vm.emotionSelected = true;
      } else {
        defaultDisplay();

      }
      setSelectedItem(moodId);
    }


    function setMoodId(moodId) {

      lastMoodId = moodId;
      updateDisplay(moodId);
    }


    function updateMoodId(moodId) {
      if (moodId) {
        moodId = moodId.id;

        if (moodId == lastMoodId) {
          sleep();
          updateDisplay(moodId);
        } else {
          lastMoodId = moodId;
        }
      }

    }

    function doUpdate() {
      var deferred = $q.defer();
      vm.cameraError = emotionReaderService.cameraError;
      $timeout(

        function () {
          if (vm.detecting) {
            //console.log("*** doUpdate, emotionReaderService:", emotionReaderService);

            vm.cameraError = emotionReaderService.cameraError;
            vm.isRunning = emotionReaderService.isRunning;
            vm.faceDetected = emotionReaderService.face.detected;
            vm.faceDictionary = emotionReaderService.face.criteria;
            if (window.device == { platform: 'Browser' }) {
              vm.isRunning = true;
            }

            var moodId = null;
            if (vm.faceDetected) {
              moodId = moodService.faceToMoodId(vm.faceDictionary);
            }
            updateMoodId(moodId);

            if (vm.isRunning == true) {
              if (vm.enable === false) {
                sleep();
                vm.enable = "";
              }
              else if (vm.enable === true) {
                wake();
                vm.enable = "";
              }
            }
          }

          deferred.resolve();
        },
        _interval_ms
      );

      return deferred.promise;
    }

    function update() {
      doUpdate().then(function () {
        if (moodService.onOrOff()) {

          update();
        }
      });

    }




    function asyncPopulateMoodResourceDict(moodIds, candidate) {
      var deferred = $q.defer();
      var promiseArray = [];

      moodIds.forEach(

        function (item) {
          var id = item.id;

          var promise = moodService.asyncMoodIdToResources(id).then(
            function (resources) {
              //console.log("asyncPopulateMoodResourceDict:", resources);
              candidate[id] = {
                name: resources.name,
                emoji: resources.emoticon_resource
              };
            }
          );
          promiseArray.push(promise);
        }
      );
      $q.all(promiseArray).then(
        function (results) {
          deferred.resolve(candidate);
        }
      );


      return deferred.promise;
    }


    function init() {
      vm.emotionSelected = false;
      vm.faceDetected = true;
      //console.log("first: ", vm.firstTime);
      //console.log("moodidDict: ", moodIdDict);
      vm.detecting = false;
      spinnerService.spinnerOn();
      vm.disableButton = true;
      if (vm.firstTime === true) {
        vm.helpTips = true;
      }
      else {
        vm.helpTips = false;
      }
      defaultDisplay();
      moodService.asyncGetSupportedMoodIds().then(function (result) {
        vm.allEmotions = result;
        if (emotionReaderService.isReady === false) {
          beginInitialiseCapture(function () {
            asyncPopulateMoodResourceDict(vm.allEmotions, moodIdDict).then(function () {
              spinnerService.spinnerOff();
              sleep();
              vm.disableButton = false;
              update();
            });
          });
        }
        else {
          //getCamera();
          asyncPopulateMoodResourceDict(vm.allEmotions, moodIdDict).then(function () {
            spinnerService.spinnerOff();
            vm.disableButton = false;
            sleep();
            update();
          });



        }
      });


    }

    function removeHelpTips() {
      vm.helpTips = true;
    }


    function onItemSelected() {
      sleep();
      setMoodId(vm.selectedMoodId.id);
    }
    function onItemSelect(id) {
      sleep();
      setMoodId(id);
    }

    function setSelectedItem(moodId) {
      vm.allEmotions.forEach(
        function (item) {
          if (item.id == moodId) {
            vm.selectedMoodId = item;
          }
        }
      );
    }
    var isSleeping = true;
    function sleep() {
      $timeout(function () {
        if (emotionReaderService.isRunning) {
          emotionReaderService.setSleep(true);
          vm.detecting = false;
          spinnerService.spinnerOff();
          isSleeping = true;
        }
        else {
          if (!isSleeping) {
            sleep();
          }
          else {
            vm.detecting = false;
            spinnerService.spinnerOff();
          }

        }
      }, 100);


    }
    function wakeUpCamera() {
      vm.lookAtTheCameraText = true;
      vm.faceDetected = false;
      wake();
      vm.emotionSelected = false;
      // defaultDisplay();
      $timeout(function () {
        vm.lookAtTheCameraText = false;
      }, 2500);
    }
    function wake() {
      if (!emotionReaderService.isRunning) {
        emotionReaderService.setSleep(false);
        vm.detecting = true;
        isSleeping = false;
        spinnerService.spinnerOn();
      }
    }

    function selectModal() {
      sleep();

      moodSelectModal.open(vm.allEmotions, fnCallbackOk, fnCallbackCancel);
    }
    function fnCallbackOk(emotion) {
      onItemSelect(emotion);
    }
    function fnCallbackCancel() {
      //console.log("modal canceled");
    }

    function playMood() {
      var deferred = $q.defer();
      vm.bang = true;
      $timeout(function () {
        vm.throbbing = true;
      }, 500);
      spinnerService.spinnerOn();

      //console.log("Getting Tracks for: " + lastMoodId);

      moodService.asyncNotifyNewMood(lastMoodId).then(
        function () {
          spinnerService.spinnerOff();
          var explosion = document.getElementById("explosion");
          vm.throbbing = false;
          explosion.classList.add("moodExplosionLeave");
          $timeout(function () {
            vm.bang = false;
            explosion.classList.remove("moodExplosionLeave");
          }, 250);
        },
        function (errorIdentifier) {
          //console.log("moodController: playMood: warning: " + errorIdentifier.message);
          spinnerService.spinnerOff();

        }
      );



      return deferred.promise;

    }
    vm.onItemSelect = onItemSelect;
    vm.selectModal = selectModal;
    vm.wakeUpCamera = wakeUpCamera;
    vm.wake = wake;
    vm.sleep = sleep;
    vm.onItemSelected = onItemSelected;
    vm.removeHelpTips = removeHelpTips;
    vm.playMood = playMood;

    init();
    // function DialogController($scope, $mdDialog) {
    //   $scope.hide = function() {
    //     $mdDialog.hide();
    //   };

    //   // $scope.cancel = function() {
    //   //   $mdDialog.cancel();
    //   // };

    //   // $scope.answer = function(answer) {
    //   //   $mdDialog.hide(answer);
    //   // };
    // }
  }
})();
