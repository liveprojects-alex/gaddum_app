(function () {
    'use strict';

    // console.log("HERE: observerService");

    angular
        .module('gaddum.observer')
        .factory('observerService', observerService);

    observerService.$inject = [
        '$q',
        'ErrorIdentifier',
        'GenericTrack',
        'MoodedPlaylist',
        'StatementCriteria',
        'dataApiService',
        'utilitiesService',
        'Location',
        'locationService',
        'Postcode',
        'postcodeService',
        'TimeSlot',
        'timeService',
        '$timeout',
        'Observation',
        'RawObservation'

    ];

    function observerService(
        $q,
        ErrorIdentifier,
        GenericTrack,
        MoodedPlaylist,
        StatementCriteria,
        dataApiService,
        utilitiesService,
        Location,
        locationService,
        Postcode,
        postcodeService,
        TimeSlot,
        timeService,
        $timeout,
        Observation,
        RawObservation
    ) {

        var SETTINGS = {
            PRIVACY: {
                COLLECT_LOCATION_HISTORY: {
                    id: "collection_location_history",
                    value: false
                },
                COLLECT_MOOD_HISTORY: {
                    id: "collection_mood_history",
                    value: false
                },
                COLLECT_PLAY_HISTORY: {
                    id: "collection_play_history",
                    value: false
                }
            },

            DATA: {
                LIMIT_MLTS:{
                    id: "track_selector_mood_location_timeslot_suitability_limit",
                    value: 2
                },
                LIMIT_MTS:{
                    id: "track_selector_mood_timeslot_suitability_limit",
                    value: 2
                },
                LIMIT_MLS:{
                    id: "track_selector_mood_location_suitability_limit",
                    value: 2
                },
                LIMIT_MS:{
                    id: "track_selector_mood_suitability_limit",
                    value: 2
                },
                LIMIT_TS:{
                    id: "track_selector_timeslot_suitability_limit",
                    value: 2
                },
                LIMIT_MUS:{
                    id: "track_selector_mood_unsuitable_limit",
                    value: 2
                }
            }
        };

        function asyncInitialiseSettings() {
            var deferred = $q.defer();

            var promises = [];

            promises.push(dataApiService.asyncGetSetting(SETTINGS.PRIVACY.COLLECT_LOCATION_HISTORY.id));
            promises.push(dataApiService.asyncGetSetting(SETTINGS.PRIVACY.COLLECT_MOOD_HISTORY.id));
            promises.push(dataApiService.asyncGetSetting(SETTINGS.PRIVACY.COLLECT_PLAY_HISTORY.id));
            promises.push(dataApiService.asyncGetSetting(SETTINGS.DATA.LIMIT_MLTS.id));
            promises.push(dataApiService.asyncGetSetting(SETTINGS.DATA.LIMIT_MTS.id));
            promises.push(dataApiService.asyncGetSetting(SETTINGS.DATA.LIMIT_MLS.id));
            promises.push(dataApiService.asyncGetSetting(SETTINGS.DATA.LIMIT_MS.id));
            promises.push(dataApiService.asyncGetSetting(SETTINGS.DATA.LIMIT_TS.id));
            promises.push(dataApiService.asyncGetSetting(SETTINGS.DATA.LIMIT_MUS.id));            


            $q.all(promises).then(
                function (result) {
                    SETTINGS.PRIVACY.COLLECT_LOCATION_HISTORY.value = result[0];
                    SETTINGS.PRIVACY.COLLECT_MOOD_HISTORY.value = result[1];
                    SETTINGS.PRIVACY.COLLECT_PLAY_HISTORY.value = result[2];
                    SETTINGS.DATA.LIMIT_MLTS.value = result[3];
                    SETTINGS.DATA.LIMIT_MTS.value = result[4];
                    SETTINGS.DATA.LIMIT_MLS.value = result[5];
                    SETTINGS.DATA.LIMIT_MS.value = result[6];
                    SETTINGS.DATA.LIMIT_TS.value = result[7];
                    SETTINGS.DATA.LIMIT_MUS.value = result[8];

                    deferred.resolve(result);
                },
                function (error) {
                    deferred.reject(error);
                }
            );

            return deferred.promise;
        }




        function asyncInitialise() {
            return asyncInitialiseSettings();
        }




        function gateMood(container, mood) {

            if (SETTINGS.PRIVACY.COLLECT_MOOD_HISTORY.value) {
                container.mood = mood;
            }
            return container;
        }

        function gateGenericTrack(container, genericTrack) {

            if (SETTINGS.PRIVACY.COLLECT_PLAY_HISTORY.value) {
                container.genericTrack = genericTrack;
            }
            return container;
        }




        function asyncGatelocation(container) {
            var deferred = $q.defer();

            $timeout(

                function () {
                    if (SETTINGS.PRIVACY.COLLECT_LOCATION_HISTORY.value) {

                        locationService.asyncGetLocation().then(
                            function (location) {
                                container.location = location;
                                postcodeService.asyncLocationToPostcode(location).then(
                                    function (postcode) {
                                        container.postcode = postcode;
                                        deferred.resolve(container);
                                    },
                                    function (error) {
                                        deferred.reject(error);
                                    }
                                );
                            },
                            function (error) {
                                deferred.reject(error);
                            }
                        );
                    } else {
                        deferred.resolve(container);
                    }
                }

            );

            return deferred.promise;
        }




        function asyncCreateConditionalObservation(mood, moodSuitable, trackPercent, numRepeats, genericTrack) {
            var deferred = $q.defer();

            $timeout(
                function(){




                    var result = {
                        id: utilitiesService.createUuid(),
                        timeStamp: timeService.getTimeStamp(),
                        timeSlot: timeService.getCurrentTimeSlot(),
                        moodSuitable: moodSuitable,
                        trackPercent: trackPercent,
                        numRepeats: numRepeats
                    }
        
                    function buildFromResult(result) {
                        return Observation.build(
                            result.id,
                            result.timeStamp,
                            result.mood,
                            result.timeSlot,
                            result.location,
                            result.postcode,
                            result.trackPercent,
                            result.numRepeats,
                            result.moodSuitable,
                            result.genericTrack
                        );
                    }
        
                    gateMood(result, mood);
                    gateGenericTrack(result, genericTrack);
                    asyncGatelocation(result).then(
                        function onSuccess(result) {
                            var observation = buildFromResult(result);
                            deferred.resolve(observation);
                        },
                        function onError(error) {
                            deferred.reject(error, buildFromResult(result));
                        }
                    );
        
                }
            );
 
            return deferred.promise;
        }

        function asyncAddObservation(observation) {
            var deferred = $q.defer();
            
            Observation.dumpItems([observation]);

            dataApiService.asyncAddObservation(observation).then(
                deferred.resolve,
                deferred.reject
            );



            return deferred.promise;
        }





        function asyncSeekObservations(mood, timeStamp, location) {

            var deferred = $q.defer();

            $timeout(
                function () {

                    var timeSlot = timeService.findTimeSlot(timeStamp);

                    postcodeService.asyncLocationToPostcode(location).then(
                        function (postCode) {
                            dataApiService.asyncSeekObservations(
                                mood, 
                                timeSlot, 
                                postCode, 
                                location,
                                SETTINGS.DATA.LIMIT_MLTS.value,
                                SETTINGS.DATA.LIMIT_MTS.value,
                                SETTINGS.DATA.LIMIT_MLS.value,
                                SETTINGS.DATA.LIMIT_MS.value,
                                SETTINGS.DATA.LIMIT_TS.value,
                                SETTINGS.DATA.LIMIT_MUS.value).then(
                                function (results) {
                                    var rawObservations = [];
                                    results.forEach(
                                        function (result) {
                                            rawObservations.push(RawObservation.buildFromObject(result));
                                        }
                                    );
                                    deferred.resolve(rawObservations);
                                },
                                deferred.reject
                            );
                        },
                        deferred.reject
                    );
                }
            );

            return deferred.promise;

        }


        function asyncCreateObservation(mood, moodSuitable, trackPercent, numRepeats, genericTrack) {
            var deferred = $q.defer();
            asyncCreateConditionalObservation(mood, moodSuitable, trackPercent, numRepeats, genericTrack).then(

                function onCreateObservation(observation) {
                    
                    asyncAddObservation(observation).then(
                        function onWriteObservation() {
                            deferred.resolve(observation);
                        },
                        function (err) {
                            console.log("error on observation: ");
                            console.log(JSON.stringify(observation, null, 2));
                            deferred.reject(err);
                        }
                    );
                },
                function (err) {
                    deferred.resolve(err);
                }

            );
            return deferred.promise;
        }

        function asyncGetObservations(){
            return dataApiService.asyncGetObservations();
        }


        var service = {
            // do intialise to update settings from DB
            asyncInitialise: asyncInitialise,
            asyncUpdateFromSettings: asyncInitialiseSettings,
            asyncCreateObservation: asyncCreateObservation,
            asyncSeekObservations: asyncSeekObservations,
            asyncGetObservations: asyncGetObservations
        };

        return service;
    }





})();