
(function () {
    'use strict';

    angular
        .module('gaddum.userprofiler')
        .factory('userProfilerService', userProfilerService);

    userProfilerService.$inject = [
        '$q',
        'ErrorIdentifier',
        'GenericTrack',
        'MoodedPlaylist',
        'StatementCriteria',
        'dataApiService',
        'allSettingsService',
        '$timeout',
        'observerService',
        'EventIdentifier',
        'MoodedSearchCriteria'

    ];

    function userProfilerService(
        $q,
        ErrorIdentifier,
        GenericTrack,
        MoodedPlaylist,
        StatementCriteria,
        dataApiService,
        allSettingsService,
        $timeout,
        observerService,
        MoodedSearchCriteria


    ) {



        var SETTINGS = {
            MAX_SKIP_COUNT: {
                id: 'track_selector_max_skips',
                value: 0
            },
            MAX_TRACK_DURATION_FOR_SKIP_S: {
                id: 'track_selector_max_track_duration_for_skip_s',
                value: 0
            },
            UNOBSERVED_TRACKS_LIMIT: {
                id: "track_selector_unobserved_tracks_limit",
                value: 5
            }
        };




        var g_firstBegin = true;
        var g_arrayMoodedPlaylists = [];
        var g_currentPlaylist = null;
        var g_dictMoodedPlaylists = {};
        var g_arrayTrackHistory = [];
        var g_trackStartTime_ms = null;
        var g_numSkips = 0;
        var g_fnOnChange = null;


        function notifyChange() {
            if (g_fnOnChange) {
                g_fnOnChange();
            }
        }









        function asyncObserveCurrentTrack(moodSuitable) {

            var deferred = $q.defer();

            $timeout(
                function () {
                    if (g_currentPlaylist != null) {
                        var genericTrack = g_currentPlaylist.getGenericTracks()[g_currentPlaylist.currentTrackIndex];

                        if (genericTrack != null) {

                            var currentTime = new Date().getTime();
                            var trackTime_ms = currentTime - g_trackStartTime_ms;
                            var mood = g_currentPlaylist.getMoodId();

                            var trackDuration_ms = genericTrack.getDuration_ms();
                            var numRepeats = genericTrack.numRepeats; //  we added this in prepareMoodedPlaylists

                            var trackPercent = 100;
                            if (trackTime_ms < trackDuration_ms) {
                                trackPercent = (trackTime_ms * 100 / trackDuration_ms);
                            }
                            observerService.asyncCreateObservation(mood, moodSuitable, trackPercent, numRepeats, genericTrack).then(
                                // function (rawObservation) {
                                //     observerService.asyncGetObservations().then(
                                //         function (observations) {
                                //             Observation.dumpItems(observations);
                                //             deferred.resolve();
                                //         },
                                //         deferred.reject
                                //     );
                                // }
                                deferred.resolve
                                ,
                                deferred.reject
                            );
                        } else {
                            deferred.resolve();
                        }
                    } else {
                        deferred.resolve();
                    }
                }
            );

            return deferred.promise;

        }


        function asyncUpdateFromSettings(){
            var deferred = $q.defer();
            var promises = [];

            $timeout(

                function () {

                    promises.push(allSettingsService.asyncGet(SETTINGS.MAX_SKIP_COUNT.id));
                    promises.push(allSettingsService.asyncGet(SETTINGS.MAX_TRACK_DURATION_FOR_SKIP_S.id));
                    promises.push(allSettingsService.asyncGet(SETTINGS.UNOBSERVED_TRACKS_LIMIT.id));
                    



                    $q.all(promises).then(
                        function (results) {
                            SETTINGS.MAX_SKIP_COUNT.value = results[0];
                            SETTINGS.MAX_TRACK_DURATION_FOR_SKIP_S.value = results[1];
                            SETTINGS.UNOBSERVED_TRACKS_LIMIT.value = results[2];
                            
                        },
                        deferred.reject
                    );

                    deferred.resolve();

                }

            );


            return deferred.promise; 
        }



        function asyncInitialise(fnOnChange) {

            g_fnOnChange = fnOnChange;

            return asyncUpdateFromSettings();

        }

        function flipMoodedPlaylists() {
            if (g_arrayMoodedPlaylists.length > 1) {
                if (g_currentPlaylist) {
                    try {
                        g_currentPlaylist = g_dictMoodedPlaylists[g_currentPlaylist.getMoodId().getIdAnti()];
                    } catch (e) {
                        console.log("userProfilerService.flipMoodedPlaylists: warning: expect anti-mood, but found error");
                    }
                }
            }
        }



        function markRepeat() {
            var genericTrack = g_currentPlaylist[g_currentPlaylist.currentTrackIndex];
            genericTrack.numRepeats += 1; // we added this in prepareMoodedPlaylists
        }

        function setNextTrack(increment) {
            var result = null;

            if (increment == null) {
                increment = 1;
            }

            try {
                g_trackStartTime_ms = new Date().getTime();
                g_currentPlaylist.currentTrackIndex += increment;
                var genericTrack = g_currentPlaylist.getGenericTracks()[g_currentPlaylist.currentTrackIndex];
                result = genericTrack;
            } catch (e) { } // no-op

            return result; // null if end.
        }


        function asyncOnTrackSkippedNext() {
            var deferred = $q.defer();
            $timeout(
                function () {
                    g_numSkips += 1;
                    asyncObserveCurrentTrack(false).then(
                        function () {
                            if (g_numSkips > SETTINGS.MAX_SKIP_COUNT) {
                                flipMoodedPlaylists();
                                g_numSkips = 0;
                            }
                            deferred.resolve(setNextTrack());
                        },
                        deferred.reject
                    );
                });
            return deferred.promise;
        }


        function asyncOnNextTrack() {
            var deferred = $q.defer();
            $timeout(
                function () {
                    asyncObserveCurrentTrack(true).then(
                        function () {
                            deferred.resolve(setNextTrack());
                        },
                        deferred.reject
                    );
                });
            return deferred.promise;
        }





        function asyncOnTrackSkippedPrev() {
            var deferred = $q.defer();
            $timeout(
                function () {
                    g_numSkips += 1;
                    asyncObserveCurrentTrack(false).then(
                        function () {
                            if (g_numSkips > SETTINGS.MAX_SKIP_COUNT) {
                                flipMoodedPlaylists();
                                g_numSkips = 0;
                            }
                            deferred.resolve(setNextTrack(-1));
                        },
                        deferred.reject
                    );
                });
            return deferred.promise;
        }


        function asyncOnPrevTrack() {
            var deferred = $q.defer();
            $timeout(
                function () {
                    asyncObserveCurrentTrack(true).then(
                        function () {
                            deferred.resolve(setNextTrack(-1));
                        },
                        deferred.reject
                    );
                });
            return deferred.promise;
        }



        // --- player

        function isTrackSkipped() {
            var result = false;
            if (g_trackStartTime_ms == null) {
                var message = "userProfilerService.asyncNext: use asyncBegin on a new playlist";
                console.log(message);
                throw (message);
            } else {
                var currentTime_ms = new Date().getTime();
                var diff_ms = currentTime_ms - g_trackStartTime_ms;
                var threshold_ms = SETTINGS.MAX_TRACK_DURATION_FOR_SKIP_S.value * 1000;
                if (diff_ms < threshold_ms) {
                    result = true;
                }
            }
            return result;
        }





        // use next to go to the next track, while playing, or when the current track has completed. You need to have used begin at least once first.
        function asyncNext() {

            if (isTrackSkipped()) {
                return asyncOnTrackSkippedNext();
            } else {
                return asyncOnNextTrack();
            }



        }

        // use previous to go to the previous track, while playling, or when the current track has completed. You need to have used begin at least once first.
        function asyncPrev() {
            if (isTrackSkipped()) {
                return asyncOnTrackSkippedPrev();
            } else {
                return asyncOnPrevTrack();
            }

        }



        // use begin to start a playlist, or go to the begining of a track whilst playing (is a repeat)
        function asyncBegin() {

            var deferred = $q.defer();
            $timeout(
                function () {
                    if (g_firstBegin) {
                        g_firstBegin = false;
                    } else {
                        markRepeat();
                    }
                    deferred.resolve(setNextTrack(0)); // increment as zero
                }
            );
            return deferred.promise;
        }

        // the current track is unplayable
        // mark it as bad, and recommend another
        function asyncTrackIsBadGetAnother() {
            var deferred = $q.defer();
            $timeout(
                function () {
                    var tracks = g_currentPlaylist.getGenericTracks();
                    tracks.splice(g_currentPlaylist.currentTrackIndex, 1);

                    deferred.resolve(setNextTrack(0)); // increment as zero
                }
            );
            return deferred.promise;
        }


        // --- Finder



        function rawObservationsToTrackIds(rawObservations) {
            var container = {};
            var result = [];

            rawObservations.forEach(
                // extract and deduplicate track ids, while retaining their priority.
                function (rawObservation) {
                    var trackId = rawObservation.getTrackId();
                    var priority = rawObservation.getPriority();

                    if (trackId) {
                        // deduplicate the trackid, and make sure we get the correct priority for the track (1 is best)
                        if (container[priority] == null) {
                            container[priority] = {};
                        }
                        container[priority][trackId] = {};
                    }
                }
            );

            // container is now a dictionary of tracks and associated priorities.
            // push into intermediate array in order of priority. Lowest index: highest priority
            var priorityOrder = [];
            Object.keys(container).forEach(
                function (priority) {
                    //rely on order of priority, not insertion, since these keys are integers
                    Object.keys(container[priority]).forEach(
                        function (trackId) {
                            priorityOrder.push(trackId);
                        }
                    );

                }
            );
            // tracks are now ordered in the array according to priority.
            // deduplicate, by adding each trackId to a dictionary, in order
            var dedupe = {};
            priorityOrder.forEach(
                function (trackId) {
                    dedupe[trackId] = trackId;
                }
            );

            // now output the deduped track ids into the results
            Object.keys(dedupe).forEach(
                function (trackId) {
                    // keys are now in order of insertion, which is priority order. Highest priority has lowest index.
                    result.push(trackId);
                }
            );


            return result;



        }


        function asyncLookupTrackIds(trackIds) {

            var deferred = $q.defer();

            var promises = [];

            trackIds.forEach(
                function (trackId) {
                    promises.push(dataApiService.asyncGetTrackFromId(trackId));
                }
            );

            $q.all(promises).then(
                function(results){
                    deferred.resolve(results);
                }
                ,
                deferred.reject
            );

            return deferred.promise;

        }





        function asyncFindPlaylistFromUnobservedTracks(moodId) {
            
            var deferred = $q.defer();

            dataApiService.asyncGetUnobservedTracks(SETTINGS.UNOBSERVED_TRACKS_LIMIT.value).then(
                function (genericTracks) {
                    var result = MoodedPlaylist.build(moodId, genericTracks);
                    // console.log("asyncFindPlaylistFromUnobservedTracks:")
                    MoodedPlaylist.dumpItems([result]);
                    deferred.resolve(result);
                },
                deferred.reject
            );

            return deferred.promise;

        }

        function asyncFindPlaylistByObservation(moodId, timeStamp, location) {
            var deferred = $q.defer();
            observerService.asyncSeekObservations(moodId, timeStamp, location).then(
                function (rawObservations) {
                    var trackIds = rawObservationsToTrackIds(rawObservations);
                    asyncLookupTrackIds(trackIds).then(
                        function (genericTracks) {
                            var result = MoodedPlaylist.build(moodId, genericTracks);
                            // console.log("asyncFindPlaylistByObservation:")
                            MoodedPlaylist.dumpItems([result]);
                            deferred.resolve(result);
                        },
                        deferred.reject
                    );

                },
                deferred.reject

            );
            return deferred.promise;
        }



        function asyncFindPlaylist(moodId, timeStamp, location){

            var deferred = $q.defer();

            var promises = [];

            promises.push(
                asyncFindPlaylistByObservation(moodId, timeStamp, location)
            );
            promises.push(
                asyncFindPlaylistFromUnobservedTracks(moodId)
            );

            $q.all(promises).then(
                function(results){
                    var result = MoodedPlaylist.build(moodId, []);
                    results.forEach(
                        function(candidate){
                            result.add(candidate);
                        }
                    );
                    deferred.resolve(result);
                },
                deferred.reject
            );

            return deferred.promise;

        }


        function asyncFindPlaylists(moodedSearchCriteria) {
            var deferred = $q.defer();


            $timeout(

                function () {

                    var promises = [];
                    var moodIds = moodedSearchCriteria.getMoodIds();
                    var timeStamp = moodedSearchCriteria.getTimestamp();
                    var location = moodedSearchCriteria.getLocation();

                    moodIds.forEach(
                        function (moodId) {
                            promises.push(
                                asyncFindPlaylist(moodId, timeStamp, location)
                            );
                        }
                    );
                    $q.all(promises).then(
                        function(results){
                            deferred.resolve(results);
                        }
                        ,
                        deferred.reject
                    );
                }
            );

            return deferred.promise;
        }

        function prepareMoodedPlaylists(arrayMoodedPlaylists) {
            arrayMoodedPlaylists.forEach(
                function (moodedPlaylist) {
                    moodedPlaylist.currentTrackIndex = 0; // we're adding this attribute

                    var genericTracks = moodedPlaylist.getGenericTracks();
                    if (genericTracks) {

                        genericTracks.forEach(
                            function (genericTrack) {
                                genericTrack.numRepeats = 0; // we're adding this attribute
                            }
                        );

                    }


                }
            );
        }

        function buildPlaylistDictionary(dictionary, arrayMoodedPlaylists) {
            if (arrayMoodedPlaylists) {
                if (dictionary) {
                    arrayMoodedPlaylists.forEach(
                        function (moodedPlaylist) {
                            var mood_id = moodedPlaylist.getMoodId().getId();
                            if (!dictionary[mood_id]) {
                                dictionary[mood_id] = moodedPlaylist;
                            } else {
                                console.log("userProfiler:buildPlaylistDictionary: warning: duplicated playlist?");
                                dictionary[mood_id].add(moodedPlaylist);
                            }
                        }
                    );
                } else {
                    throw ("userProfiler:buildPlaylistDictionary: no dictionary");
                }

            } else {
                console.log("userProfiler:buildPlaylistDictionary: warning: no playlists");
            }
        }

        function initialisePlaylists(arrayMoodedPlaylists) {

            g_firstBegin = true;
            g_arrayMoodedPlaylists = [];
            g_arrayTrackHistory = [];
            g_dictMoodedPlaylists = {};
            g_currentPlaylist = null;

            g_arrayMoodedPlaylists = arrayMoodedPlaylists;
            if (arrayMoodedPlaylists && arrayMoodedPlaylists.length > 0) {
                prepareMoodedPlaylists(arrayMoodedPlaylists);
                buildPlaylistDictionary(g_dictMoodedPlaylists, g_arrayMoodedPlaylists);
                g_currentPlaylist = arrayMoodedPlaylists[0];
            }
        }



        function initialiseCounters() {
            g_trackStartTime_ms = null;
            g_numSkips = 0;
        }



        // --- Loader

        function asyncLoadMoodedPlaylists(arrayMoodedPlaylists) {
            var deferred = $q.defer();

            $timeout(
                function () {

                    var moodSuitable = false;

                    try {
                        moodSuitable = !isTrackSkipped();
                    } catch (e) { } // ignore. Following observation will fail for the same reason



                    asyncObserveCurrentTrack(moodSuitable).then(
                        function () {

                            initialisePlaylists(arrayMoodedPlaylists);
                            initialiseCounters();
                            notifyChange();
                            
                            deferred.resolve();
                        },
                        deferred.reject
                    );

                }

            );


            return deferred.promise;
        }

        // --- Statement

        function asyncApplyStatement(statementCriteria) {
            var mood = null;
            var genericTrack = null;
            try {
                mood = statementCriteria.getMoodId();
                genericTrack = statementCriteria.getGenericTrack();
            } catch (e) {
                throw ("asyncApplyStatement: unexpected parameters: needs a MoodIdentifier and a GenericTrack.");
            }

            return observerService.asyncCreateObservation(mood, true, 0, 0, genericTrack);

        }

        var service = {
            asyncInitialise: asyncInitialise,
            asyncUpdateFromSettings: asyncUpdateFromSettings,
            player: {
                asyncBegin: asyncBegin,
                asyncNext: asyncNext,
                asyncPrev: asyncPrev,
                asyncTrackIsBadGetAnother, asyncTrackIsBadGetAnother
            },
            finder: {
                asyncFindPlaylists: asyncFindPlaylists
            },
            loader: {
                asyncLoadMoodedPlaylists: asyncLoadMoodedPlaylists
            },
            statement: {
                asyncApplyStatement: asyncApplyStatement
            }

        };

        return service;
    }





})();