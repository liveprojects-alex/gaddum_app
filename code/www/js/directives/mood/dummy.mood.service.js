(function () {
  'use strict;'

  angular
    .module('gaddum.mood')
    .factory('moodService', moodService)
    ;

  moodService.$inject = [
    '$timeout',
    '$q'
  ];
  function moodService(
    $timeout,
    $q
  ) {
    var emotions = [
      {id: "peaceful", name: "peaceful", icon_resource: null, music_resource: null, emoticon_resource: "😇"},
      {id: "angry", name: "angry", icon_resource: null, music_resource: null, emoticon_resource: "😡"},
      {id: "restful", name: "restful", icon_resource: null, music_resource: null, emoticon_resource: "😌"},
      {id: "crazy", name: "crazy", icon_resource: null, music_resource: null, emoticon_resource: "😜"},
      {id: "sad", name: "sad", icon_resource: null, music_resource: null, emoticon_resource: "😟"},
      {id: "happy", name: "happy", icon_resource: null, music_resource: null, emoticon_resource: "😀"},
      {id: "tired", name: "tired", icon_resource: null, music_resource: null, emoticon_resource: "😴"},
      {id: "physical", name: "physical", icon_resource: null, music_resource: null, emoticon_resource: "💪"},
      {id: "bored", name: "bored", icon_resource: null, music_resource: null, emoticon_resource: "🙄"},
      {id: "focussed", name: "focussed", icon_resource: null, music_resource: null, emoticon_resource: "🤔"}]


    function faceToMoodId(id){
      
      var numRecognisedMoods = emotions.length;
      var index = Math.floor(Math.random() * numRecognisedMoods)
      // console.log(index);
      return emotions[index];
    }
    


    function asyncMoodIdToResources(id){
      var deferred = $q.defer();
      var promise
      $timeout(
      emotions.forEach(
        function(item){
          if (item.id == id){
            promise = item;
            
          }
        }
      ),10
      );
      deferred.resolve(promise);
      return deferred.promise;
    }
    function getSupportedMoodIds(){
      return emotions;
    }
    function asyncInitialise(){
      return $timeout(
        function(){},100
      );
    }
    var service = {

      asyncInitialise: asyncInitialise,
      getSupportedMoodIds: getSupportedMoodIds,
      faceToMoodId: faceToMoodId,
      asyncMoodIdToResources: asyncMoodIdToResources
    }

    return service;

  }
})();

