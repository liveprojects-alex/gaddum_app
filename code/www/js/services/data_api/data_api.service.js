(function () {
    'use strict';

    angular
        .module('dataapijs')
        .factory('dataApiService', dataApiService);

    dataApiService.$inject = [
        '$q',
        '$timeout',
        'mappingService',
        'utilitiesService',
        'PlaylistIdentifier',
        'GenericTrack',
        'GenericImportTrack',
        'TrackReference',
        'TrackInfo',
        'CachedImage',
        'MusicProviderIdentifier',
        'Observation',
        'RawObservation'
    ];

    function dataApiService(
        $q,
        $timeout,
        mappingService,
        utilitiesService,
        PlaylistIdentifier,
        GenericTrack,
        GenericImportTrack,
        TrackReference,
        TrackInfo,
        CachedImage,
        MusicProviderIdentifier,
        Observation,
        RawObservation
    ) {




        var asyncGetSupportedMusicProviders = function () {
            var deferred = $q.defer();

            mappingService.query("get_supported_music_providers", [],
                function (result) {
                    var rows = mappingService.getResponses(result.rows);
                    if (rows.length > 0) {

                        var results = [];
                        rows.forEach(function (row) {
                            results.push(MusicProviderIdentifier.buildFromObject(row));
                        });
                        deferred.resolve(results);

                    } else {
                        deferred.reject(ErrorIdentifier.build(ErrorIdentifier.SYSTEM, "no music providers found."));
                    }
                }
                ,
                deferred.reject
            );



            return deferred.promise;
        };


        function asyncGetSelectedMusicProvider() {
            var deferred = $q.defer();
            mappingService.query(
                "get_selected_music_provider",
                [],
                function (result) {
                    var rows = mappingService.getResponses(result.rows);
                    if (rows.length > 0) {
                        deferred.resolve(MusicProviderIdentifier.buildFromObject(rows[0]));
                    } else {
                        deferred.resolve(null);
                    }
                }
                ,
                function (error) {
                    deferred.reject(ErrorIdentifier.build(ErrorIdentifier.SYSTEM, "asyncGetSelectedMusicProvider: problem accessing db: " + error.message));
                }
            );

            return deferred.promise;
        }

        function asyncSetSelectedMusicProvider(musicProviderIdentifier) {
            if (musicProviderIdentifier) {
                return asyncSetSetting('music_provider_id', musicProviderIdentifier.getId(), 'string');
            } else {
                return asyncClearSetting('music_provider_id', 'string');
            }
        }

        var getBase64Resource = function (resource_id, success, fail) {
            if (resource_id) {
                mappingService.query("base64_resource", [resource_id],
                    function (result) {
                        var rows = mappingService.getResponses(result.rows);
                        if (rows.length > 0) {
                            success(rows[0])
                        } else {
                            fail("no resource for id");
                        }
                    }
                    , fail);
            } else {
                success(null);
            }
        }


        function getSupportedMoodIds(fnSuccess, fnFail) {

            mappingService.query("get_supported_mood_ids", [],
                function (response) {

                    var rows = mappingService.getResponses(response.rows);
                    if (rows.length > 0) {
                        fnSuccess(rows);
                    } else {
                        fnFail("no supported moods!");
                    }
                }
                , fnFail);
        }



        function asyncGetSupportedMoodIds() {
            var d = $q.defer();
            getSupportedMoodIds(
                function (res) {
                    d.resolve(res);
                },
                function (err) {
                    d.reject(err);
                });
            return d.promise;
        }


        function getSupportedTimeSlots(fnSuccess, fnFail) {

            mappingService.query("get_supported_time_slots", [],
                function (response) {
                    var result = [];
                    var rows = mappingService.getResponses(response.rows);
                    if (rows.length > 0) {
                        fnSuccess(rows);
                    } else {
                        fnFail("no supported time slots!");
                    }
                }
                , fnFail);
        }



        function asyncGetSupportedTimeSlots() {
            var d = $q.defer();
            getSupportedTimeSlots(
                function (res) {
                    d.resolve(res);
                },
                function (err) {
                    d.reject(err);
                });
            return d.promise;
        }



        function asyncGetMoodDetectionParameters(mood_id) {
            var d = $q.defer();
            getMoodDetectionParameters(mood_id, function (res) { d.resolve(res); }, function (err) { d.reject(err); });
            return d.promise;
        }


        function getMoodDetectionParameters(mood_id, fnSuccess, fnFail) {
            mappingService.query("get_mood_detection_parameters", [mood_id],
                function (response) {
                    var result = {};
                    var rows = mappingService.getResponses(response.rows);

                    // returns us a row from the database which we will assume contains at least the columns:
                    // mood
                    // criteria
                    // anything else we will just pass stright through to the client, as parameters.

                    if (rows.length > 0) {
                        // we have parameters associated with the mood


                        rows.forEach(function (row) {
                            result[row.criteria] = row; // put all the row data into an attribute for the parameter. client gets everything.
                        });

                    } else {
                        console.log("WARN: no parameters for the mood. It won't be detected. id: " + mood_id);
                    }
                    fnSuccess(result);
                }
                , fnFail);
        }


        function moodIdToResources(id, fnSuccess, fnFail) {

            mappingService.query("mood_id_to_resources", [id],
                function (result) {
                    var rows = mappingService.getResponses(result.rows);
                    if (rows.length == 1) {
                        fnSuccess(rows[0]);
                    } else {
                        fnFail("mood not found!");
                    }
                }
                , fnFail);
        }



        function asyncMoodIdToResources(id) {
            var d = $q.defer();
            moodIdToResources(id, function (res) { d.resolve(res); }, function (err) { d.reject(err); });
            return d.promise;
        }


        function getUserSettings(fnSuccess, fnFail) {

            mappingService.query("get_user_settings", [],
                function (result) {
                    var rows = mappingService.getResponses(result.rows);
                    if (rows.length > 0) {
                        fnSuccess(rows);
                    } else {
                        fnFail("no supported user settings!");
                    }
                }
                , fnFail);
        }



        function asyncGetUserSettings() {
            var d = $q.defer();
            getUserSettings(function (res) { d.resolve(res); }, function (err) { d.reject(err); });
            return d.promise;
        }


        function getAllSettings() {
            mappingService.query("get_settings", [],
                function (result) {
                    var rows = mappingService.getResponses(result.rows);
                    if (rows.length > 0) {
                        fnSuccess(rows);
                    } else {
                        fnFail("no supported settings!");
                    }
                }
                , fnFail);
        }

        function asyncGetAllSettings() {
            var d = $q.defer();
            getAllSettings(function (res) { d.resolve(res); }, function (err) { d.reject(err); });
            return d.promise;
        }

        function getSetting(id, fnSuccess, fnFail) {
            console.log("dataApiService: getSetting: " + id);
            mappingService.query("get_setting", [id],
                function (result) {
                    var rows = mappingService.getResponses(result.rows);
                    if (rows.length == 1) {

                        var candidate = rows[0];
                        var value = candidate.value; // default is 'string'
                        if (candidate.value_type === 'integer') {
                            value = parseInt(candidate.value);
                        } else if (candidate.value_type == 'boolean') {
                            if (candidate.value == 'true') {
                                value = true;
                            } else {
                                value = false;
                            }
                        }


                        fnSuccess(value);
                    } else {
                        fnFail("setting not found: " + id);
                    }
                }
                , fnFail);
        }

        function asyncGetSetting(id) {
            var d = $q.defer();
            getSetting(id,
                function (res) {
                    d.resolve(res);
                },
                function (err) {
                    d.reject(err);
                });
            return d.promise;
        }




        function asyncSetSetting(id, value, type) {


            var deferred = $q.defer();


            var queries =
                [
                    {
                        function: "set_setting_1",
                        params: [id, value]
                    },
                    {
                        function: "set_setting_2",
                        params: [id, value, type]
                    }
                ];


            mappingService.transaction(
                queries,
                function (result) {
                    deferred.resolve(
                        [id, value, type]
                    );
                },
                deferred.reject
            );

            return deferred.promise;

        }

        function clearSetting(id, type, fnSuccess, fnFail) {

            mappingService.query(
                "clear_setting",
                [id, type],
                fnSuccess,
                fnFail);
        }


        function asyncClearSetting(id, type) {
            var d = $q.defer();
            clearSetting(id, type, function (res) { d.resolve(res); }, function (err) { d.reject(err); });
            return d.promise;
        }


        function asyncGetProviderMoodAttributes(provider_id, mood_id) {
            var deferred = $q.defer();

            mappingService.query(
                "get_provider_mood_to_attributes",

                [provider_id, mood_id],
                function (response) {
                    var rows = mappingService.getResponses(response.rows);

                    var attributes = [];

                    rows.forEach(

                        function (candidate) {
                            try {
                                var value = candidate.value; // default is 'string'
                                if (candidate.value_type === 'float') {
                                    value = parseFloat(candidate.value);
                                } else if (candidate.value_type === 'integer') {
                                    value = parseInt(candidate.value);
                                } else if (candidate.value_type == 'boolean') {
                                    if (candidate.value == 'true') {
                                        value = true;
                                    } else {
                                        value = false;
                                    }
                                }
                                candidate.value = value;
                                attributes.push(candidate);

                            } catch (e) {
                                console.log("dataApiService: asyncGetProviderMoodAttributes: warning: unparsable attribute: " + candidate.attribute);
                            }
                        }
                    );
                    deferred.resolve(attributes);
                }
                ,
                function (error) {
                    deferred.reject(ErrorIdentifier.build(ErrorIdentifier.SYSTEM, "asyncGetProviderMoodAttributes: problem accessing db: " + error.message));
                }
            );
            return deferred.promise;
        }


        function asyncGetProviderSetting(provider_id, setting_id) {
            var deferred = $q.defer();

            mappingService.query(
                "get_provider_setting",
                [provider_id, setting_id],
                function (result) {
                    var rows = mappingService.getResponses(result.rows);
                    if (rows.length == 1) {
                        var candidate = rows[0];
                        var value = candidate.value; // default is 'string'
                        if (candidate.value_type === 'integer') {
                            value = parseInt(candidate.value);
                        } else if (candidate.value_type == 'boolean') {
                            if (candidate.value == 'true') {
                                value = true;
                            } else {
                                value = false;
                            }
                        }
                        deferred.resolve(value);
                    } else {
                        deferred.reject(ErrorIdentifier.build(ErrorIdentifier.SYSTEM, "asyncGetProviderSetting: setting not found!"));
                    }
                }
                ,
                function (error) {
                    deferred.reject(ErrorIdentifier.build(ErrorIdentifier.SYSTEM, "asyncGetProviderSetting: problem accessing db: " + error.message));
                }
            );
            return deferred.promise;
        }

        function asyncSetProviderSetting(provider_id, setting_id, value) {
            var deferred = $q.defer();

            mappingService.query(
                "set_provider_setting",
                [provider_id,
                    setting_id,
                    value
                ],
                deferred.resolve,
                function (error) {
                    deferred.reject(ErrorIdentifier.build(ErrorIdentifier.SYSTEM, "asyncSetProviderSetting: problem accessing db: " + error.message));
                }
            );
            return deferred.promise;
        }

        function asyncClearProviderSetting(provider_id, setting_id) {
            var deferred = $q.defer();

            mappingService.query(
                "clear_provider_setting",
                [provider_id,
                    setting_id
                ],
                deferred.resolve
                ,
                function (error) {
                    deferred.reject(ErrorIdentifier.build(ErrorIdentifier.SYSTEM, "clearProviderSetting: problem accessing db: " + error.message));
                }
            );
            return deferred.promise;
        }



        function getSupportedInputTypes(fnSuccess, fnFail) {

            mappingService.query("get_supported_input_types", [],
                function (result) {
                    var rows = mappingService.getResponses(result.rows);
                    if (rows.length > 0) {
                        fnSuccess(rows);
                    } else {
                        fnFail("no supported input types!");
                    }
                }
                , fnFail);
        }



        function asyncGetSupportedInputTypes() {
            var d = $q.defer();
            getSupportedInputTypes(function (res) { d.resolve(res); }, function (err) { d.reject(err); });
            return d.promise;
        }


        function getNumUnsetUserSettings(fnSuccess) {

            mappingService.query("get_num_unset_user_settings", [],
                function (result) {

                    var rows = mappingService.getResponses(result.rows);
                    if (rows.length > 0) {
                        fnSuccess(rows[0]);
                    } else {
                        fnSuccess(0);
                    }
                }
                , function (error) {
                    console.log("warning: getNumUnsetUserSettings threw error: " + JSON.stringify(error));
                    fnSuccess(0);
                });
        }



        function asyncGetNumUnsetUserSettings() {
            var d = $q.defer();
            getNumUnsetUserSettings(function (res) { d.resolve(res); }, function (err) { d.reject(err); });
            return d.promise;
        }



        function asyncSeekTracks(name, album, artist, id) {
            var deferred = $q.defer();

            mappingService.query(
                "seek_tracks",
                [
                    name,
                    album,
                    artist,
                    id
                ],
                function (response) {
                    var items = mappingService.getResponses(response.rows);
                    var results = [];
                    if (items) {
                        items.forEach(
                            function (item) {
                                results.push(GenericTrack.buildFromObject(item));
                            }
                        );
                    }
                    deferred.resolve(results);
                },
                deferred.reject
            );

            return deferred.promise;

        }





        function asyncGetTracks(genericTrack) {
            var deferred = $q.defer();

            mappingService.query(
                "get_tracks",
                [
                    genericTrack.getName(),
                    genericTrack.getAlbum(),
                    genericTrack.getArtist(),
                    genericTrack.getDuration_ms(),
                    genericTrack.getId()
                ],
                function (response) {
                    var items = mappingService.getResponses(response.rows);
                    var results = [];
                    if (items) {
                        items.forEach(
                            function (item) {
                                results.push(GenericTrack.buildFromObject(item));
                            }
                        );
                    }
                    deferred.resolve(results);
                },
                deferred.reject
            );

            return deferred.promise;

        }

        function asyncGetTrackInfos(genericTrack, musicProvider) {
            var deferred = $q.defer();

            mappingService.query(
                "get_track_infos",
                [
                    genericTrack.getName(),
                    genericTrack.getAlbum(),
                    genericTrack.getArtist(),
                    genericTrack.getDuration_ms(),
                    genericTrack.getId(),
                    musicProvider.getId()
                ],
                function (response) {
                    var items = mappingService.getResponses(response.rows);
                    var results = [];
                    if (items) {
                        items.forEach(
                            function (item) {
                                results.push(TrackInfo.buildFromObject(item));
                            }
                        );
                    }
                    deferred.resolve(results);
                },
                deferred.reject
            );

            return deferred.promise;

        }

        function asyncGetTrackFromId(trackId) {
            var deferred = $q.defer();

            mappingService.query(
                "get_track",
                [
                    trackId
                ],
                function (response) {
                    var items = mappingService.getResponses(response.rows);
                    var result = null;
                    if (items) {
                        result = GenericTrack.buildFromObject(items[0]);
                    }
                    deferred.resolve(result);
                },
                deferred.reject
            );

            return deferred.promise;

        }


        function asyncSeekPlaylists(name, id) {
            var deferred = $q.defer();

            var name = '%' + name + '%'; // SQL search term
            console.log("----------");
            console.log("looking for playlist: " + " name: " + name + " id: " + id);



            mappingService.query(
                "seek_playlists",
                [
                    name,
                    id
                ],
                function (response) {
                    var items = mappingService.getResponses(response.rows);
                    var results = [];
                    if (items) {
                        items.forEach(
                            function (item) {
                                results.push(PlaylistIdentifier.buildFromObject(item));
                            }
                        );
                    }
                    deferred.resolve(results);
                },
                deferred.reject
            );

            return deferred.promise;

        }


        function asyncGetPlaylists(name, id) {
            var deferred = $q.defer();

            mappingService.query(
                "get_playlists",
                [
                    name,
                    id
                ],
                function (response) {
                    var items = mappingService.getResponses(response.rows);
                    if (items) {
                        items.forEach(
                            function (item) {
                                results.push(PlaylistIdentifier.buildFromObject(item));
                            }
                        );
                    }
                    deferred.resolve(results);
                },
                deferred.reject
            );

            return deferred.promise;

        }




        function asyncCreatePlaylist(name) {


            var playlist = PlaylistIdentifier.build(
                utilitiesService.createUuid(),
                name,
                null,
                null);
            return asyncUpdatePlaylist(
                playlist
            );
        }




        function asyncDoImportGenericTrack(genericTrack) {

            var deferred = $q.defer();
            var queries =
                [
                    {
                        function: "import_generic_track_1",
                        params: [

                            genericTrack.getName(),
                            genericTrack.getAlbum(),
                            genericTrack.getArtist(),
                            genericTrack.getDuration_ms()
                        ]
                    },
                    {
                        function: "import_generic_track_2",
                        params: [
                            genericTrack.getId(),
                            genericTrack.getName(),
                            genericTrack.getAlbum(),
                            genericTrack.getArtist(),
                            genericTrack.getDuration_ms()
                        ]
                    }
                ];


            mappingService.transaction(
                queries,
                function (result) {
                    deferred.resolve(genericTrack);
                },
                deferred.reject
            );

            return deferred.promise;

        }




        // pushes a generic track object into the DB
        // - ignores its Id
        // - searches comprehensively for an exact match on name, artist, album, duration_ms 
        function asyncImportGenericTrack(genericTrack) {
            var deferred = $q.defer();
            // do we already have this track?

            asyncGetTracks(genericTrack).then(
                function (results) {
                    var incumbent = null;
                    if (results && results.length > 0) {
                        var incumbent = results[0];
                    }
                    if (incumbent) {
                        genericTrack.id = incumbent.getId();
                    } else {
                        genericTrack.id = utilitiesService.createUuid();
                    }
                    // this allows us to replace any extra data other than what we searched on.  
                    asyncDoImportGenericTrack(genericTrack).then(
                        deferred.resolve,
                        deferred.reject
                    );

                },
                deferred.reject
            )
            return deferred.promise;

        }

        function asyncGetTrackReferences(trackReference) {
            var deferred = $q.defer();

            mappingService.query(
                "get_track_references",
                [
                    trackReference.getId(),
                    trackReference.getProviderId(),
                    trackReference.getTrackId()
                ],
                function (response) {
                    var items = mappingService.getResponses(response.rows);
                    var results = [];
                    if (items) {
                        items.forEach(
                            function (item) {
                                results.push(TrackReference.buildFromObject(item));
                            }
                        );
                    }
                    deferred.resolve(results);
                },
                deferred.reject
            );

            return deferred.promise;

        }

        function asyncDoImportTrackReference(trackReference) {

            var deferred = $q.defer();

            var queries =
                [
                    {
                        function: "import_track_reference_1",
                        params: [
                            trackReference.getWebUri(),
                            trackReference.getPlayerUri(),
                            trackReference.getThumbnailUri(),
                            trackReference.getTrackId(),
                            trackReference.getProviderId()
                        ]
                    },
                    {
                        function: "import_track_reference_2",
                        params: [
                            trackReference.getId(),
                            trackReference.getWebUri(),
                            trackReference.getPlayerUri(),
                            trackReference.getThumbnailUri(),
                            trackReference.getTrackId(),
                            trackReference.getProviderId()
                        ]
                    }
                ];


            mappingService.transaction(
                queries,
                function (result) {
                    deferred.resolve(trackReference);
                },
                deferred.reject
            );



            return deferred.promise;
        }

        // pushes a track reference object into the DB
        // ignores its Id
        // searches comprehensivly for an exact match to GenericTrackId and musicServiceProvider 
        function asyncImportTrackReference(trackReference) {

            var deferred = $q.defer();
            // do we already have this track reference?

            asyncGetTrackReferences(trackReference).then(
                function (results) {
                    var incumbent = null;
                    if (results && results.length > 0) {
                        var incumbent = results[0];
                    }
                    if (incumbent) {
                        trackReference.id = incumbent.getId();
                    } else {
                        trackReference.id = utilitiesService.createUuid();
                    }
                    // this allows us to replace any extra data other than what we searched on.  
                    asyncDoImportTrackReference(trackReference).then(
                        deferred.resolve,
                        deferred.reject
                    );

                },
                deferred.reject
            )
            return deferred.promise;
        }


        function asyncGetArtwork(url) {
            var deferred = $q.defer();

            mappingService.query("get_artwork",
                [
                    url
                ],
                function (response) {
                    var cachedImage = null;
                    var items = mappingService.getResponses(response.rows);

                    if (items && items.length > 0) {
                        cachedImage = CachedImage.buildFromObject(items[0]);
                    }
                    deferred.resolve(cachedImage);
                },
                deferred.reject
            );

            return deferred.promise;
        }

        function asyncImportArtwork(cachedImage) {

            var deferred = $q.defer();

            var params = [
                cachedImage.getWebUri(),
                cachedImage.getBase64Image()
            ];


            var queries =
                [
                    {
                        function: "import_artwork_1",
                        params: params
                    },
                    {
                        function: "import_artwork_2",
                        params: params
                    }
                ];


            mappingService.transaction(
                queries,
                function (result) {
                    deferred.resolve(cachedImage);
                },
                deferred.reject
            );



            return deferred.promise;


        }


        // beware! creates a generic track ready for inclusion in DB. It has no Id
        function toGenericTrack(trackInfo) {
            var result = null;
            if (trackInfo) {
                result = GenericTrack.build(
                    null,
                    trackInfo.getName(),
                    trackInfo.getAlbum(),
                    trackInfo.getArtist(),
                    trackInfo.getDuration_ms()
                );
            }
            return result;
        }

        // beware! must use a generic track from the DB. This will have an Id.
        // beware! creates a TrackReference ready for inclusion in DB. It has no id.
        function toTrackReference(genericTrack, trackInfo) {
            var result = null;
            if (genericTrack && trackInfo) {
                if (!genericTrack.id) {
                    throw ("toTrackReference: generic track without id");
                }
                result = TrackReference.build(
                    null,
                    trackInfo.getWebUri(),
                    trackInfo.getPlayerUri(),
                    trackInfo.getArtworkUri(),
                    trackInfo.getServiceProvider(),
                    genericTrack.getId());
            } else {
                throw ("toTrackReference: parameters are missing.");
            }
            return result;
        }


        function toGenericImportTrack(genericTrack, trackReference) {
            var result = null;
            if (genericTrack && trackReference) {
                result = GenericImportTrack.build(
                    genericTrack.getId(),
                    genericTrack.getName(),
                    genericTrack.getAlbum(),
                    genericTrack.getArtist(),
                    genericTrack.getDuration_ms(),
                    trackReference.getPlayerUri(),
                    trackReference.getThumbnailUri());
            } else {
                throw ("toGenericImportTrack: parameters are missing.");
            }

            return result;
        }


        // imports the track info object associated with the music provider.
        // optionally associates a thumbnail image if one is included in the track info.
        // returns a GenericImportTrack.
        function asyncImportTrackInfo(trackInfo, base64EncodedThumbnail) {

            var deferred = $q.defer();

            $timeout(
                function () {
                    if (trackInfo) {

                        var genericTrack = toGenericTrack(trackInfo);

                        asyncImportGenericTrack(genericTrack).then(
                            function (storedGenericTrack) {
                                var trackReference = toTrackReference(
                                    storedGenericTrack,
                                    trackInfo
                                );
                                asyncImportTrackReference(trackReference).then(
                                    function (storedTrackReference) {
                                        var genericImportTrack = toGenericImportTrack(storedGenericTrack, storedTrackReference);
                                        var thumbnailUrl = trackInfo.getArtworkUri();
                                        if (base64EncodedThumbnail && thumbnailUrl) {
                                            asyncImportArtwork(CachedImage.build(thumbnailUrl, base64EncodedThumbnail)).then(
                                                function (cachedImage) {
                                                    deferred.resolve(genericImportTrack);
                                                },
                                                deferred.reject
                                            )

                                        } else {
                                            deferred.resolve(genericImportTrack);
                                        }
                                    },
                                    function (error) {
                                        deferred.resolve(null);
                                    } // TODO: better handling of rejected import. ignore the error - we want to complete a set of promises.
                                )

                            },
                            function () {
                                deferred.resolve(null);
                            } // TODO: better handling of rejected import. ignore the error - we want to complete a set of promises.
                        );


                    } else {
                        deferred.reject(ErrorIdentifier.build(ErrorIdentifier.SYSTEM, "asyncImportTrackInfo: parameters are missing."));
                    }

                }


            );







            return deferred.promise;

        }

        function asyncGetGenericTracksInPlaylist(playlistIdentifier) {
            var deferred = $q.defer();
            console.log("----------");
            console.log("looking for playlist: " + playlistIdentifier.getId());
            mappingService.query(
                "get_tracks_in_playlist",
                [
                    playlistIdentifier.getId()
                ],
                function (response) {
                    var items = mappingService.getResponses(response.rows);
                    var results = [];
                    if (items) {
                        items.forEach(
                            function (item) {
                                results.push(GenericTrack.buildFromObject(item));
                            }
                        );
                    }
                    deferred.resolve(results);
                },
                deferred.reject
            );

            return deferred.promise;
        }


        function asyncAssociatePlaylistAndTrack(namedIdentifierPlaylist, namedIdentifierTrack, order) {
            var deferred = $q.defer();

            console.log("----------");
            console.log("associating: " + namedIdentifierPlaylist.getId() + " with: " + namedIdentifierTrack.getId() + " at order: " + order);

            var args = [
                utilitiesService.createUuid(),
                namedIdentifierPlaylist.getId(),
                namedIdentifierTrack.getId(),
                order
            ];

            mappingService.query("associate_playlist_track",
                args,
                function () {
                    deferred.resolve(
                        args
                    );
                },
                function (error) {
                    deferred.reject(error);//TODO: Better handling of this, without stopping parallel promise chain
                }

            );

            return deferred.promise;
        }

        function asyncAssociatePlaylistAndTracks(namedIdentifierPlaylist, namedIdentifierTracks) {
            var deferred = $q.defer();
            var promises = [];
            $timeout(
                function () {
                    if (namedIdentifierPlaylist && namedIdentifierTracks && namedIdentifierTracks.length > 0) {

                        for (var i = 0; i < namedIdentifierTracks.length; i++) {
                            var namedIdTrack = namedIdentifierTracks[i];
                            promises.push(asyncAssociatePlaylistAndTrack(namedIdentifierPlaylist, namedIdTrack, i));
                        }

                        $q.all(promises).then(
                            deferred.resolve,
                            deferred.reject
                        );
                    } else {
                        deferred.resolve(null);
                    }

                });

            return deferred.promise;
        }



        function asyncRemovePlaylist(playlistIdentifier) {
            console.log("----------");
            console.log("removing playlist: " + playlistIdentifier.getId());
            var deferred = $q.defer();

            $timeout(
                function () {

                    if (playlistIdentifier) {
                        mappingService.query(
                            "remove_playlist",
                            [
                                playlistIdentifier.getId()
                            ],
                            deferred.resolve,
                            deferred.reject
                        );
                    } else {
                        deferred.resolve();
                    }

                }
            );



            return deferred.promise;

        }


        function asyncUpdatePlaylist(playlistIdentifier) {
            var deferred = $q.defer();
            console.log("----------");
            console.log("updating playlist: " + playlistIdentifier.getId() + " name: " + playlistIdentifier.getName());
            $timeout(

                function () {


                    if (playlistIdentifier && (playlistIdentifier.getName() != null) && (playlistIdentifier.getId() != null)) {

                        var params = [
                            playlistIdentifier.getId(),
                            playlistIdentifier.getName()
                        ];

                        var queries =
                            [
                                {
                                    function: "set_playlist_1",
                                    params: params
                                },
                                {
                                    function: "set_playlist_2",
                                    params: params
                                }
                            ];


                        mappingService.transaction(
                            queries,
                            function (result) {
                                deferred.resolve(
                                    playlistIdentifier
                                );
                            },
                            deferred.reject
                        );

                    } else {
                        deferred.resolve(playlistIdentifier);
                    }

                }

            );


            return deferred.promise;



        }

        function asyncSetGenericTracksInPlaylist(playlistIdentifier, arrayGenericTracks) {

            var deferred = $q.defer();

            $timeout(
                function () {
                    if (playlistIdentifier && arrayGenericTracks && arrayGenericTracks.length > 0) {
                        asyncRemovePlaylist(playlistIdentifier).then(
                            function () {
                                asyncUpdatePlaylist(playlistIdentifier).then( // take advantage of upsert-type function here
                                    function () {
                                        asyncAssociatePlaylistAndTracks(playlistIdentifier, arrayGenericTracks).then(
                                            function () {
                                                deferred.resolve(playlistIdentifier);
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
                            },
                            function (error) {
                                deferred.reject(error);
                            }
                        );

                    } else {
                        deferred.resolve(playlistIdentifier)
                    }
                }

            );




            return deferred.promise;

        }








        // "id": "82fb1b6e-cca0-4ff5-b85a-a8d708fb8d7c",
        // "timestamp_ms": "1565165883",
        // "mood_id" : "physical",// MAY BE NULL
        // "timeslot": 3,
        // "location_lat" : 53.5041, // MAY BE NULL
        // "location_lon": -2.1910,// MAY BE NULL
        // "location_code" : "M1 5GD", // MAY BE NULL
        // "track_percent" : 68,
        // "num_repeats" : 4,
        // "mood_suitable" : true,
        // "track": "467f79eb-969d-4ab0-8869-b915a9491c0d" // MAY BE NULL


        function addObservation(
            id,
            timestamp_ms,
            mood_id,
            timeslot,
            location_lat,
            location_lon,
            location_code,
            track_percent,
            num_repeats,
            mood_suitable,
            track,
            fnSuccess,
            fnFail
        ) {
            mappingService.query(
                "add_observation",
                [
                    id,
                    timestamp_ms,
                    mood_id,
                    timeslot,
                    location_lat,
                    location_lon,
                    location_code,
                    track_percent,
                    num_repeats,
                    mood_suitable,
                    track
                ],
                function (result) {
                    fnSuccess(result);
                }
                ,
                function (error) {
                    fnFail(error);
                }
            );
        }

        function asyncAddObservation(observation) {
            var deferred = $q.defer();

            $timeout(
                function () {
                    if (observation) {
                        var id = observation.getId();
                        var timestamp_ms = observation.getTimeStamp().getJavaEpocMS();
                        var mood = observation.getMood();
                        var mood_id = mood ? mood.getId() : null;
                        var timeSlot = observation.getTimeSlot().getId();

                        var location = observation.getLocation();
                        var location_lat = location ? location.getLat() : null;
                        var location_lon = location ? location.getLon() : null;

                        var postcode = observation.getPostcode();
                        var location_code = postcode ? postcode.getPostcode() : null;

                        var track_percent = observation.getTrackPercent();
                        var num_repeats = observation.getNumRepeats();
                        var mood_suitable = observation.isMoodSuitable();

                        var genericTrack = observation.getTrack();
                        var track = genericTrack ? genericTrack.getId() : null;

                        addObservation(
                            id,
                            timestamp_ms,
                            mood_id,
                            timeSlot,
                            location_lat,
                            location_lon,
                            location_code,
                            track_percent,
                            num_repeats,
                            mood_suitable,
                            track,
                            function fnOnSuccess() {
                                deferred.resolve(observation)
                            },
                            function fnOnError(error) {
                                deferred.reject(error)
                            }
                        )


                    } else {
                        deferred.resolve(null);
                    }
                }

            );

            return deferred.promise;
        }


        function asyncSeekObservations(
            moodIdentifier,
            timeSlot,
            postCode,
            location,
            limit_m_l_t_s,
            limit_m_t_s,
            limit_m_l_s,
            limit_m_s,
            limit_t_s,
            limit_m_u_s
        ) {

            var deferred = $q.defer();
            console.log("----------");
            console.log("seeking observations");
            $timeout(

                function () {

                    var mood_id = "";
                    var timeslot_id = "";
                    var postcode_id = "";
                    var lat = 0.0;
                    var lon = 0.0;


                    if (moodIdentifier) {
                        mood_id = moodIdentifier.getId();
                    }

                    if (timeSlot) {
                        timeslot_id = timeSlot.getId();
                    }

                    if (postCode) {
                        postcode_id = postCode.getPostcode();
                    }

                    if (location) {
                        lat = location.getLat();
                        lon = location.getLon();
                    }


                    mappingService.query(
                        "seek_observations",
                        [
                            mood_id,
                            timeslot_id,
                            postcode_id,
                            lat,
                            lon,
                            limit_m_l_t_s,
                            limit_m_t_s,
                            limit_m_l_s,
                            limit_m_s,
                            limit_t_s,
                            limit_m_u_s
                        ],
                        function (response) {
                            var items = mappingService.getResponses(response.rows);
                            var results = [];
                            if (items) {
                                items.forEach(
                                    function (item) {
                                        results.push(RawObservation.buildFromObject(item));
                                    }
                                );
                            }
                            deferred.resolve(results);
                        },
                        deferred.reject
                    );



                }

            );


            return deferred.promise;

        }


        function asyncGetUnfilteredTracks(limit) {

            var deferred = $q.defer();

            mappingService.query(
                "get_tracks_limited",
                [
                    limit
                ],
                function (response) {
                    var items = mappingService.getResponses(response.rows);
                    var results = [];
                    if (items) {
                        items.forEach(
                            function (item) {
                                results.push(GenericTrack.buildFromObject(item));
                            }
                        );
                    }
                    deferred.resolve(results);

                },
                deferred.reject
            );

            return deferred.promise;

        }




        function asyncGetObservations() {

            var deferred = $q.defer();

            mappingService.query("get_observations", [],
                function (response) {
                    var items = mappingService.getResponses(response.rows);
                    var results = [];
                    if (items) {
                        items.forEach(
                            function (item) {
                                results.push(RawObservation.buildFromObject(item));
                            }
                        );
                    }
                    deferred.resolve(results);

                },
                deferred.reject
            );

            return deferred.promise;

        }

        function asyncGetUnobservedTracks(limit) {

            var deferred = $q.defer();

            mappingService.query(
                "get_unobserved_tracks",
                [
                    limit
                ],
                function (response) {
                    var items = mappingService.getResponses(response.rows);
                    var results = [];
                    if (items) {
                        items.forEach(
                            function (item) {
                                results.push(GenericTrack.buildFromObject(item));
                            }
                        );
                    }
                    deferred.resolve(results);

                },
                deferred.reject
            );

            return deferred.promise;

        }




        var service = {
            asyncGetSupportedMusicProviders: asyncGetSupportedMusicProviders,
            asyncGetSelectedMusicProvider: asyncGetSelectedMusicProvider,
            asyncSetSelectedMusicProvider: asyncSetSelectedMusicProvider,

            asyncGetSupportedTimeSlots: asyncGetSupportedTimeSlots,
            asyncGetSupportedMoodIds: asyncGetSupportedMoodIds,
            asyncGetMoodDetectionParameters: asyncGetMoodDetectionParameters,
            asyncMoodIdToResources: asyncMoodIdToResources,
            asyncGetSupportedInputTypes: asyncGetSupportedInputTypes,

            asyncGetUserSettings: asyncGetUserSettings,
            asyncGetNumUnsetUserSettings: asyncGetNumUnsetUserSettings,
            asyncGetAllSettings: asyncGetAllSettings,

            asyncSetSetting: asyncSetSetting,
            asyncGetSetting: asyncGetSetting,
            asyncClearSetting: asyncClearSetting,


            asyncGetProviderMoodAttributes: asyncGetProviderMoodAttributes,


            asyncGetProviderSetting: asyncGetProviderSetting,
            asyncSetProviderSetting: asyncSetProviderSetting,
            asyncClearProviderSetting: asyncClearProviderSetting,


            asyncAddObservation: asyncAddObservation,
            asyncSeekObservations: asyncSeekObservations,
            asyncGetObservations: asyncGetObservations,
            asyncGetUnobservedTracks: asyncGetUnobservedTracks,


            asyncSeekTracks: asyncSeekTracks,
            asyncGetTracks: asyncGetTracks,
            asyncGetUnfilteredTracks: asyncGetUnfilteredTracks,
            asyncGetTrackInfos: asyncGetTrackInfos,
            asyncGetTrackFromId: asyncGetTrackFromId,

            asyncAssociatePlaylistAndTracks: asyncAssociatePlaylistAndTracks,


            asyncImportTrackInfo: asyncImportTrackInfo,
            asyncImportTrackReference: asyncImportTrackReference,
            asyncGetArtwork: asyncGetArtwork,

            asyncCreatePlaylist: asyncCreatePlaylist,
            asyncUpdatePlaylist: asyncUpdatePlaylist,
            asyncRemovePlaylist: asyncRemovePlaylist,
            asyncSeekPlaylists: asyncSeekPlaylists,
            asyncGetGenericTracksInPlaylist: asyncGetGenericTracksInPlaylist,
            asyncSetGenericTracksInPlaylist: asyncSetGenericTracksInPlaylist,


            utilities:
            {
                toTrackReference: toTrackReference
            }


        };


        return service;
    }





})();






