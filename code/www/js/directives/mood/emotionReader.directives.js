(function(){
  'use strict';

  angular
    .module('gaddum.mood')
    .directive('emotionReaderFeedback', emotionReaderFeedback)
    .directive('emotionReaderCameraState', emotionReaderCameraState)
    .directive('emotionReaderResultMenu', emotionReaderResultMenu);

  emotionReaderFeedback.$inject = [ 'emotionReaderService' ];

  function emotionReaderFeedback( emotionReaderService ) {
    return{
      restrict: 'E',
      scope: {},
      link: function(scope, element, attrs) {

        element.append('<canvas id="emotionReaderFeedback"></div>');

        var elementHandle = 'emotionReaderFeedback';
        var $element = $(element);
        var $canvas = $element.find('canvas#'+elementHandle);

        var canvasWidth = parseInt( $canvas.width() );
        var canvasHeight = parseInt( $canvas.height() );

        if( emotionReaderService.isReady === false ) {
          emotionReaderService.initialise( canvasWidth, canvasHeight,
                                           {
                                             canvasId: elementHandle,
                                             videoSettings: {
                                               // not overriding defaults
                                             }
                                           });
        }

        scope.$watch( function(x) {

        });
      }
    };
  }

  emotionReaderCameraState.$inject = [ 'emotionReaderService' ];

  function emotionReaderCameraState(emotionReaderService) {
    return{
      restrict: 'E',
      scope: { },
      replace: true,
      templateUrl: 'js/directives/mood/emotionReader.partials/emotionReaderCameraState.html',
      link: function(scope, element, attrs) {
        scope.running = emotionReaderService;
        scope.face = emotionReaderService.face;
        if(scope.cameraError===true) {
          alert("camera error");
        }
      }
    };
  }

  emotionReaderResultMenu.$inject = [ 'moodService' ];

  function emotionReaderResultMenu(moodSrvc) {
    return{
      restrict: 'E',
      replace: true,
      scope: {
        emotionChosen: '=',
        currentEmotion: '='
      },
      templateUrl: 'js/directives/mood/emotionReader.partials/emotionReaderResultMenu.html',
      link: function(scope, element, attrs) {
        // console.log("inside");
        scope.emotions = moodService.EMOTIONS;
        if(moodService.emotionChosen===true) {
          scope.emotionChosen = moodSrvc.emotionChosen;
          scope.currentEmotion = moodSrvc.currentEmotion;
        }
      }
    };
  }

})();
