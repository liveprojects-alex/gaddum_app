(function () {
  'use strict';

  angular
    .module('gaddum.settings')
    .factory('allSettingsService', allSettingsService)
    ;

  allSettingsService.$inject = [
    'SettingIdentifier',
    '$timeout',
    '$q'
  ];

  function allSettingsService(
    SettingIdentifier,
    $timeout,
    $q
  ) {

    var dict = {
      collection_play_history: null,
      collection_location_history: null,
      collection_mood_history: false,
      sharing_play_history: false,
      sharing_location_history: false,
      sharing_mood_history: false,
      first_time_help: false

    };

    function getSupportedSettings() {

      var keys = Object.keys(dict);
      keys.forEach(
        function (key) {
          var setting = dict[key];
          arrayOfSettings.push(SettingIdentifier.buildMinimal(
            setting.id, 'boolean'
          ));
        }
      );
    }


    function set(id, value) {
      dict[id] = value;
    }
    function get(id) {
      return dict[id];
    }

    var promiseToDeliver = function (delivery) {
      var deferred = $q.defer();

      $timeout(
        function () {
          deferred.resolve(delivery);
        }
      );
      return deferred.promise;
    };



    function asyncGetSupportedSettings() {
      return promiseToDeliver(getSupportedSettings());
    }



    function asyncGet(id) {
      return promiseToDeliver(get(id));
    }

    function asyncSet(id, value) {
      return promiseToDeliver(set(id, value));
    }

    var service = {
      asyncGetSupportedSettings: asyncGetSupportedSettings,
      asyncGet: asyncGet,
      asyncSet: asyncSet
    };

    return service;
  }
})();
