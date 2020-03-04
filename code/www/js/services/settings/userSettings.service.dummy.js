(function () {
  'use strict';
  angular
    .module('gaddum.settings')
    .factory('userSettingsService', userSettingsService);

  userSettingsService.$inject = [
    'SettingIdentifier',
    '$timeout',
    '$q'
  ];
  
  function userSettingsService(
    SettingIdentifier,
    $timeout,
    $q
  ) {

    // console.log("here");  
  

      var dict = {
          collection_play_history:{
            
            friendly_name: "Collect play history",
            friendly_description :"Collect and store the tracks you play, and when you play them. On the device only.",
            value_type: "boolean",
            value: null,
            default_value: "false"

          },
          collection_location_history:{
            
            friendly_name: "Collect location history",
            friendly_description: "When collecting and storing the tracks you play, add where you played them. Stored on device only.",
            value_type: "boolean",
            value: null,
            default_value: "false"
          },
          collection_mood_history:{
            
            friendly_name: "Collect mood history",
            friendly_description : "When collecting and storing the tracks you play, add the mood you were in when you played them. Stored on device only.",
            value_type: "boolean",
            value: null,
            default_value: "false"
          },
          sharing_play_history:{
            
            friendly_name: "Share play history",
            friendly_description: "When sharing a track, also share when you have played it.",
            value_type: "boolean",
            value: null,
            default_value: "false"
          },
          sharing_location_history:{
            
            friendly_name: "Sharing location history",
            friendly_description:"When sharing a track, also share where you have played it.",
            value_type: "boolean",
            value: null,
            default_value: "false"
          },
          sharing_mood_history:{
            
            friendly_name: "Sharing mood history",
            friendly_description: "When sharing a track, also share the mood you were in when you played it, and if you played all the track.",
            value_type: "boolean",
            value: null,
            default_value: "false"
          },
          first_time_help:{
            
            friendly_name: "First time help",
            friendly_description: "Switch this on again, if you want to be reminded of how things work.",
            value_type: "boolean",
            value: null,
            default_value: "false"
          }

      };
      
      function getSupportedSettings(){
          var result = [];
          var keys = Object.keys(dict);
          keys.forEach(
            function(key){
              var setting = dict[key];
              result.push(SettingIdentifier.build(
                key,
                setting.friendly_name,
                setting.friendly_description,
                setting.value_type,
                setting.default_value
              ));
            }
          ); 
          return result;         
      }


      function getSupportedInputTypes(){
        return(
          ['boolean','string','integer']
        );
      }


      function set(id,value){
          dict[id].value=value;
      }
      function get(id){
          return dict[id].value;
      }
      function getDefault(id){
        return dict[id].default_value;
      }


      function getNumUnsetSettings(){

        var keys = Object.keys(dict);
        var count = 0;

        keys.forEach(function(item){
          if(dict[key].value == null){
            count++;
          }
        });

        return count;

      }

      var promiseToDeliver = function(delivery){
        var deferred = $q.defer();
        
        $timeout(
            function(){
                
                deferred.resolve(delivery);
            }
        );            
        
        
        return deferred.promise;
    }
      


      function asyncGetSupportedSettings(){
        return promiseToDeliver(getSupportedSettings());
      }
  
      function asyncGetSupportedInputTypes(){
        return promiseToDeliver(getSupportedInputTypes());
      }
  
      function asyncGetNumUnset(){
        return promiseToDeliver(getNumUnsetSettings());
      }
  
      function asyncGet(id){
        return promiseToDeliver(get(id));
      }
  
      function asyncSet(id, value){
        return promiseToDeliver(set(id,value));
      }
  
  
  
  
      var service = {
          asyncGetSupportedSettings:asyncGetSupportedSettings,
          asyncGetSupportedInputTypes: asyncGetSupportedInputTypes,
          asyncGet: asyncGet,
          asyncSet: asyncSet,
          asyncGetNumUnset: asyncGetNumUnset
      };

    return service;
  }
})();
