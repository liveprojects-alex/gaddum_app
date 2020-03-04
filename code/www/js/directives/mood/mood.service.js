(function () {
  'use strict;'

  angular
    .module('gaddum.mood')
    .factory('moodService', moodService)
    ;

  moodService.$inject = [
    'dataApiService',
    '$q',
    '$timeout',
    'allSettingsService',
    'MoodIdentifier',
    'userProfilerService',
    'locationService',
    'TimeStamp',
    'MoodedSearchCriteria',
    'gaddumMusicProviderService',
    'MoodedPlaylist'

  ];
  function moodService(
    dataApiService,
    $q,
    $timeout,
    allSettingsService,
    MoodIdentifier,
    userProfilerService,
    locationService,
    TimeStamp,
    MoodedSearchCriteria,
    gaddumMusicProviderService,
    MoodedPlaylist
  ) {





    var g_dictMoodExpressionDetectionCriteria = {};

    var g_arraySupportedMoodIds = [];

    var g_dictSupportedMoodIds = {};



    var SETTINGS = {
      SUGGESTED_TRACKS_LIMIT: {
        id: "track_selector_provider_suggestion_limit",
        value: 5
      }
    };


    function asyncUpdateFromSettings() {
      var deferred = $q.defer();
      var promises = [];

      $timeout(

        function () {

          promises.push(allSettingsService.asyncGet(SETTINGS.SUGGESTED_TRACKS_LIMIT.id));




          $q.all(promises).then(
            function (results) {
              SETTINGS.SUGGESTED_TRACKS_LIMIT.value = results[0];
            },
            deferred.reject
          );

          deferred.resolve();

        }

      );


      return deferred.promise;
    }


    function asyncGetSupportedMoodIds() {
      var deferred = $q.defer();


      dataApiService.asyncGetSupportedMoodIds().then(
        function (arrayItems) {
          g_arraySupportedMoodIds = arrayItems;
          arrayItems.forEach(function (item) {
            var moodId = MoodIdentifier.buildFromObject(item);
            g_dictSupportedMoodIds[moodId.id] = moodId;
          });

          deferred.resolve(g_arraySupportedMoodIds);
        }
        ,
        deferred.reject
      );


      return deferred.promise;
    }


    function lookupMoodId(id) {

      return g_dictSupportedMoodIds[id];

    }

    function asyncGetMoodDetectionParameters(moodId, dictResult) {

      var deferred = $q.defer();


      dataApiService.asyncGetMoodDetectionParameters(moodId, dictResult).then(
        function (dictParameters) {
          //console.log("adding parameters to: " + moodId);
          dictResult[moodId] = dictParameters;
          deferred.resolve(dictResult);
        }
        ,
        deferred.reject
      );

      return deferred.promise;
    }


    function asyncGetAllMoodDetectionParameters(arrayMoodIds, dictContainer) {
      var deferred = $q.defer();
      var arrayPromises = [];
      arrayMoodIds.forEach(function (moodId) {
        //console.log("getting detection parameters for:  " + moodId.id);
        var promise = asyncGetMoodDetectionParameters(moodId.id, dictContainer);
        arrayPromises.push(promise);
      });

      $q.all(arrayPromises).then(
        function (arrayDictContainer) {
          // all of the entries are a reference to the same object, so:
          deferred.resolve(arrayDictContainer[0]);
        }, function (error) {
          //console.log("WTF???: " + JSON.stringify(error));
        });


      return deferred.promise;
    }

    function asyncInitialise() {
      var deferred = $q.defer();
      asyncUpdateFromSettings()
        .then(
          function () {
            asyncGetSupportedMoodIds()
              .then(
                function (arrayMoodIds) {
                  var dictContainer = {};
                  return asyncGetAllMoodDetectionParameters(arrayMoodIds, dictContainer)
                    .then(function (dictContainer) {
                      g_dictMoodExpressionDetectionCriteria = dictContainer;
                      deferred.resolve();
                    });
                },
                deferred.reject
              );
          },
          deferred.reject
        );
      return deferred.promise;
    }

    function getSupportedMoodIds() {
      return g_arraySupportedMoodIds;
    }


    function faceToMoodId(dictCandidateCriteria) {
      var result = null; // can be null if no moods recognised
      var arrayRecognisedMoods = [];
      var arrayMoodIds = Object.keys(g_dictMoodExpressionDetectionCriteria);



      // for each mood
      arrayMoodIds.forEach(function (mood_id) {
        //console.log("   "+ mood_id + ":")
        // get the mood's expression criteria
        // eg smile, leftEyeBrowUp
        var dictMoodExpCriteria = g_dictMoodExpressionDetectionCriteria[mood_id];
        var arrayMoodExpCriteria = Object.keys(dictMoodExpCriteria);

        var numCriteriaForMood = arrayMoodExpCriteria.length;

        if (numCriteriaForMood) {

          var countDetectedCriteria = 0;

          // for each expression criterion, smile, leftEeyeBrowUp. etc:
          arrayMoodExpCriteria.forEach(function (detectionCriterion) {

            // detection params for expression criteria: trigger_min, trigger_max
            var detectionParams = dictMoodExpCriteria[detectionCriterion];

            // candidate value e.g. value for 'smile' or 'leftEyeBrowUp'
            var value = dictCandidateCriteria[detectionCriterion];


            // do we actually have some parameters to check against?
            if (detectionParams != null) {// checks for both null and undefined

              var trigMax = parseFloat(detectionParams.trigger_max);
              var trigMin = parseFloat(detectionParams.trigger_min);

              var detected = 0;
              // do we have a value we can check?
              if (value != null) { // checks for both null and undefined

                var fValue = parseFloat(value);
                if (isNaN(fValue)) {
                  //do nothing - can't check the value
                } else {

                  if (isNaN(trigMax) && isNaN(trigMin)) {
                    // do nothing - can't check against non-existent thresholds
                  } else if (isNaN(trigMax)) {
                    // no maxmimum value, so just check min
                    if (fValue >= trigMin) {
                      detected = 1;
                    }
                  } else if (isNaN(trigMin)) {
                    // no minimum value, just check max
                    if (fValue <= trigMax) {
                      detected = 1;
                    }
                  } else {
                    // we have a range - check both
                    if ((fValue >= trigMin) && (fValue <= trigMax)) {
                      detected = 1;
                    }
                  }
                }
              }
              if (detected) {
                countDetectedCriteria += 1;
                //console.log("      "  + detectionCriterion + " : " + countDetectedCriteria + " of " + numCriteriaForMood);
              }
            }
          });
          if (countDetectedCriteria == numCriteriaForMood) {
            // All comparisons passed. This mood has been recognised!
            //console.log("recognised: " + mood_id);
            arrayRecognisedMoods.push(mood_id);
          } else {
            //console.log("none recognised");
          }
        }
      });


      var numRecognisedMoods = arrayRecognisedMoods.length;

      if (numRecognisedMoods > 0) {
        // if more than one mood recognised, pick on at random
        var index = Math.floor(Math.random() * numRecognisedMoods); // returns ramdom integer from 0 to numRecognisedMoods - 1
        id = arrayRecognisedMoods[index];

        // convert to a proper moodIdentifier (contains name)
        result = g_dictSupportedMoodIds[id];
      }

      if (result) {
        //console.log("recognised: " + result.id);
      }
      return result;

    }


    function asyncMoodIdToResources(id) {
      return dataApiService.asyncMoodIdToResources(id);
    }




    function pickRandomNumber(max) {
      return Math.floor(Math.random() * max);

    }

    function pickRandomElement(array) {
      var result = null;
      if (array) {
        var index = Math.floor(Math.random() * array.length);
        result = array[index];
      }
      return result;
    }



    function asyncSuggestAPlaylist(genre, moodId) {
      var deferred = $q.defer();
      gaddumMusicProviderService.asyncSuggestTracks(genre, moodId, SETTINGS.SUGGESTED_TRACKS_LIMIT.value).then(
        function (trackInfos) {
          // import the suggstions - we need them in the database, to be able to observe them.
          gaddumMusicProviderService.asyncImportTracks(trackInfos).then(
            function (genericTracks) { // actually, GenericImportTracks, but same thing really :-)
              deferred.resolve(MoodedPlaylist.build(moodId, genericTracks));
            }
          );
        },
        deferred.reject
      );
      return deferred.promise;
    }


    function asyncGetGenres() {
      var deferred = $q.defer();
      gaddumMusicProviderService.asyncGetGenres().then( // user-selected
        function (genres) {
          if (!genres || genres.length == 0) { // catch-all
            gaddumMusicProviderService.asyncGetSupportedGenres().then(
              deferred.resolve,
              deferred.reject
            );
          } else {
            deferred.resolve(genres);
          }
        },
        deferred.reject
      );

      return deferred.promise;

    }





    function dumpTracks(items) {
      // console.log("---- tracks ----");
      items.forEach(
        function (item) {
          // console.log(JSON.stringify(item, null, 2));
        }
      );
      // console.log("----     end    ----");
    }

    function asyncSuggestPlaylists(moodedSearchCriteria) {

      var deferred = $q.defer();

      // get the user's preferred genres - or all generes if the user has selected none.
      asyncGetGenres().then(
        function (genres) {

          // pick ONE genre
          var genre = pickRandomElement(genres);

          var promises = [];
          moodedSearchCriteria.getMoodIds().forEach(
            function (moodId) {
              promises.push(asyncSuggestAPlaylist([genre], moodId));
            }
          );

          $q.all(promises).then(
            function (playlists) {
              // console.log("asyncSuggestPlaylists:");
              MoodedPlaylist.dumpItems(playlists);
              deferred.resolve(playlists);
            },
            deferred.reject
          );

        },
        deferred.reject
      );

      return deferred.promise;
    }


    function asyncNotifyNewMood(mood_id) {
      var deferred = $q.defer();

      dataApiService.asyncGetUnfilteredTracks(50).then(
        dumpTracks,
        dumpTracks

      );
      locationService.asyncGetImmediateLocation().then(
        function (location) {

          var mood = g_dictSupportedMoodIds[mood_id];

          var antiMood = g_dictSupportedMoodIds[mood.getIdAnti()];
          var timeStamp = TimeStamp.build(new Date());
          var criteria = MoodedSearchCriteria.build([mood, antiMood], timeStamp, location);
          userProfilerService.finder.asyncFindPlaylists(criteria).then(
            function (internalPlaylists) {
              asyncSuggestPlaylists(criteria).then(
                function (externalPlaylists) {
                  var resultPlaylists = MoodedPlaylist.combinePlaylists(internalPlaylists, externalPlaylists);
                  userProfilerService.loader.asyncLoadMoodedPlaylists(resultPlaylists).then(
                    deferred.resolve,
                    deferred.reject
                  );
                },
                deferred.reject
              );
            },
            deferred.reject
          );
        },
        deferred.reject
      );

      return deferred.promise;

    }
    var onOff = true;
    function turnOff() {
      onOff = false;
    }

    function turnOn() {
      onOff = true;
    }
    function onOrOff() {
      return onOff;
    }


    var service = {
      turnOff: turnOff,
      turnOn: turnOn,
      onOrOff: onOrOff,
      asyncInitialise: asyncInitialise,
      asyncUpdateFromSettings: asyncUpdateFromSettings,
      asyncGetSupportedMoodIds: asyncGetSupportedMoodIds,
      lookupMoodId: lookupMoodId,
      faceToMoodId: faceToMoodId,
      asyncMoodIdToResources: asyncMoodIdToResources,
      asyncNotifyNewMood: asyncNotifyNewMood
    };

    return service;
  }
})();
