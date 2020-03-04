(function () {
  'use strict';

  angular
    .module('gaddum.main_ui')
    .controller('settingsModalController', settingsModalController);

  settingsModalController.$inject = [
    'SettingsModal',
    '$scope',
    '$q',
    'userSettingsService',
    'SettingIdentifier'

  ];

  function settingsModalController(
    SettingsModal,
    $scope,
    $q,
    userSettingsService,
    SettingIdentifier
  ) {
    var sc = angular.extend(this, {

    });
    var first = true;
    sc.temp = false;

    // sc.showFriendlyDescription = true;
    function changed(id,value,type,friendlyDes,index) {
      if (first ===true){
        SettingsModal.initDict(sc.settings);
        first = false;
      }
      // userSettingsService.asyncSet(id, value, type);
      SettingsModal.addToDict(sc.settings[index],index);
      // sc.showFriendlyDescription = false;
      // sc.friendlyDescription = friendlyDes;

    }


    function asyncUpdateSettings(settings) {
      sc.settings = settings;
      var promises = [];
      var deferred = $q.defer();
      sc.settings.forEach(function (element) {

        // when the app is created, all user settings are at null.
        // we use userSettingsService.asyncGetNumUnset to tell if the user has visted the privacy settings yet.
        // when the settings dialog starts for the first time, it sets all user settings to their defaults
        promises.push(userSettingsService.asyncGet(element.id).then(
          function (value) {
            if (value == null) {
              element.value = element.default_value;
              userSettingsService.asyncSet(element.id,element.type, element.default_value);
            } else {
              element.value = value;
            }
          }
        ));
      }
      );

      $q.all(promises).then(
        function (results) {
          deferred.resolve(sc.settings);
        }
      );

      return deferred.promise;
    }

    $scope.SettingsModal = SettingsModal;
    function init() {
      userSettingsService.asyncGetSupportedSettings().then(
        function(settings){
          asyncUpdateSettings(settings).then(
            function(){
              // console.log("settings: updated");
            },
            function(error){
              // console.log("settings: error: " + error.message);
            }
          );
        },
        function(error){
          // console.log("error colecting settings")
        }
      );
      
    }
    init();
    function changeSet(index){
      if (first ===true){
        SettingsModal.initDict(sc.settings);
        first = false;
      }
      sc.settings[index].value = !sc.settings[index].value
    }
    sc.changed = changed;
    sc.changeSet = changeSet;
  }
})();