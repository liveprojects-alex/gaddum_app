(function() {
  'use strict';

  angular
    .module('gaddum.mood')
    .factory('emotionReaderService', emotionReaderService);

  emotionReaderService.$inject = [];

  function emotionReaderService( ) {

    var nncPath = 'lib/external/js/jeeliz/';

    var service = {};

    var listener = null;

    service.face = {
      detected: false
    };

    service.isReady = false;
    service.isRunning = false;
    service.isSleeping = false;
    service.cameraError = false;
    service.face.criteria = {};
    service.recognisedState = "-";

    service.setListener = function(fn){
      listener = fn;
    };

    var jft = JEEFACETRANSFERAPI;
    var _morphFactorsArr;
    var _morphFactorsDict={
      smileRight: 0,          //0
      smileLeft: 0,           //1
      eyeBrowLeftDown: 0,     //2
      eyeBrowRightDown: 0,    //3
      eyeBrowLeftUp: 0,       //4
      eyeBrowRightUp: 0,      //5
      mouthOpen: 0,           //6
      mouthRound: 0,          //7
      eyeRightClose: 0,       //8
      eyeLeftClose: 0,        //9
      mouthNasty: 0           //10
  };

  var _morphIndexToName=Object.keys(_morphFactorsDict);

  var _rotation = [0,0,0];

  function greaterOf(arg1,arg2){
    var result = arg2; 
    if(arg1 > arg2){
      result = arg1;
     }
     return result;
   }

   // returns the difference between the two values
   // we know the values are both conformant to the range  0 - 1
   function normalised_difference(arg1, arg2){
    var result = Math.abs(arg1 - arg2);
    return result;
   }
   service.get_videoFeed =  function(){
     var vid = jft.get_video();
     return vid;
   }

   function average(arg1, arg2){
    var result = (arg1 + arg2)/2;
    return result;
   }

    service.initialise = function initialise(w,h,videoSettings) {
      //console.log("initialising!", service.isReady);
      //console.log("using these parameters to start jeeliz:", videoSettings);

      service.face.criteria = {};
      if( service.isReady === false ) {
        jft.set_size( w,h );
        jft.set_audio( false );
        jft.onWebcamAsk = service._onWebcamAskCallback;
        jft.onWebcamGet = service._onWebcamGet;
        jft.onContextLost = service._onContentLost;

        angular.merge( videoSettings, {
          NNCpath: nncPath,
          callbackReady: service._callbackReady,
        });

        //console.log("starting jft with these video params",videoSettings);

        jft.init( videoSettings );
      }
    };

    service.setSleep = function setSleep(newState) {
      if(jft.hasOwnProperty("switch_sleep")) {
        jft.switch_sleep(Boolean(newState));
      }
      service.isRunning = Boolean(!newState);
      service.face.criteria = {};
    };

    service._onWebcamGet = function _onWebcamGet(e) {
      //console.log("!!! _onWebcamGet called", e);
    };

    service._onWebcamAskCallback = function _onWebcamAskCallback(e) {
      //console.log("onWebcamAskCallback - ",e);
 
    };
    service._onWebcamGetCallback = function _onWebcamGetCallback(e) {
      //console.log("onWebcamGetCallback - ",e);

    };
    service._onContextLostCallback = function _onContentLostCallback(e) {
      //console.log("onContentLostCallback - ",e);

    };

    service._onMorphUpdate = function(quality, benchmarkCoeff){
      var criteria = {};
      _morphIndexToName.forEach(function(morphKey, morphIndex){
          _morphFactorsDict[morphKey]=_morphFactorsArr[morphIndex];
          criteria[morphKey] = _morphFactorsArr[morphIndex];
      });

      var rx= _rotation[0]; //head angle : rotation around X (look up/down)
      var ry= _rotation[1];//rotation around Y : look right/left
      var rz= _rotation[2]; //rotation around Z : head bending

      criteria.rx = rx;
      criteria.ry = ry;
      criteria.rz = rz;

      criteria.head_cocked = Math.abs(rz);
      criteria.any_eyes_closed = greaterOf(criteria.eyeLeftClose, criteria.eyeRightClose);
      criteria.any_eyebrows_up = greaterOf(criteria.eyeBrowLeftUp, criteria.eyeBrowRightUp);
      criteria.any_eyebrows_down = greaterOf(criteria.eyeBrowLeftDown, criteria.eyeBrowRightDown);

      criteria.both_eyes_closed = average(criteria.eyeLeftClose, criteria.eyeRightClose);
      criteria.both_eyebrows_up = average(criteria.eyeBrowLeftUp, criteria.eyeBrowRightUp);
      criteria.both_eyebrows_down = average(criteria.eyeBrowLeftDown, criteria.eyeBrowRightDown);
      criteria.smile = average(criteria.smileLeft, criteria.smileRight);

      criteria.lopsided_smile = normalised_difference(criteria.smileLeft, criteria.smileRight);
      criteria.cocked_eybrow = normalised_difference(criteria.eyeBrowLeftUp, criteria.eyeBrowRightUp);
      criteria.wink = normalised_difference(criteria.eyeLeftClose, criteria.eyeRightClose);
      service.face.criteria = criteria;
    };

    service._callbackReady = function _callbackReady(e) {
      //console.log("^^ jeeliz._callbackReady, error: ", e);
      service.isReady = true;
      service.isRunning = true;
      service.face.criteria = {};
      if( ( e === false ) || ( e === undefined) ) {
        //console.log('JEEFACETRANSFERAPI READY');
        service.isRunning = true;
        
        _morphFactorsArr=jft.get_morphTargetInfluencesStabilized();   
        _rotation=jft.get_rotationStabilized();
        jft.set_morphUpdateCallback(service._onMorphUpdate);
        jft.on_detect(service.onDetect);
      } else {
        //console.log("emotionReaderService._callbackReady - error starting, ",e);
        service.isRunning = service.isReady = false;
        service.cameraError = true;
      }

      if(listener){
        listener();
      }

    };

    service.onDetect = function onDetect(detected) {
      //console.log("!!! onDetect", detected);
      var olddetected = service.face.detected;
      service.face.detected = detected;
    };

    return service;

  }
})();
