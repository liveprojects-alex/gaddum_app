(function () {
    'use strict';

    angular
        .module('app.startup', ['ionic'])
        .factory('startupSrvc', startupSrvc);

    startupSrvc.$inject = [
        '$q',
        'utilitiesService',
        'firstTimeSrvc',
        'dbService',
        'mappingService',
        'moodService'
    ];

    function startupSrvc(
        $q,
        utilitiesService,
        firstTimeSrvc,
        dbService,
        mappingService,
        moodService
    ) {

        var FILE_LIST_DB_LOCATION = "www/data/file_list.json";
        var FILE_LIST_MAPPING_DIR = "www/sql";
        var DEFAULT_FILE_SPEC = 0;


        function initialiseDb(fnSuccess, fnFail) {

            var createDb = function (fnSuccess, fnFail) {

                // create a database which can be populated.

                // get the list of supported databases.
                utilitiesService.readFileToJSONArray(
                    FILE_LIST_DB_LOCATION,
                    function (fileSpecs) {

                        // get the default database.
                        var fileSpec = fileSpecs[DEFAULT_FILE_SPEC];
                        console.log("looking for DB at: " + fileSpec.path);
                        dbService.createDBFromApplicationDir(
                            fileSpec.path,
                            function () {
                                mappingService.initialise(
                                    FILE_LIST_MAPPING_DIR,
                                    fnSuccess,
                                    function (error) {
                                        console.log(JSON.stringify(error));
                                        fnFail("couldn't set up the database.");
                                    });
                            },
                            function (error) {
                                console.log(JSON.stringify(error));
                                fnFail("couldn't open the database from its definition: " + fileSpec.name);
                            });
                    },
                    function (error) {
                        console.log(JSON.stringify(error));
                        fnFail("couldn't find the database locations file.");
                    });


            };

            var openDb = function (fnSuccess, fnFail) {
                dbService.openDB(
                    function () {
                        mappingService.initialise(
                            FILE_LIST_MAPPING_DIR,
                            fnSuccess,
                            function (error) {
                                console.log(JSON.stringify(error));
                                fnFail("couldn't set up the database.");
                            });
                    }
                    ,
                    fnFail);
            };



            var fnOnDBOpen = function () {
                firstTimeSrvc.clearFirstTime();
                fnSuccess();
            };

            var fnOnDBFail = function (error) {
                firstTimeSrvc.setFirstTime();
                fnFail(error);
            };

            if (firstTimeSrvc.isFirstTime()) {
                createDb(
                    fnOnDBOpen,
                    fnOnDBFail
                );

            } else {
                openDb(
                    fnOnDBOpen,
                    fnOnDBFail
                );
            }

        }


        function asyncInitialiseDb() {
            console.log("initialising DB...");
            var d = $q.defer();
            initialiseDb(function (res) { d.resolve(res); }, function (err) { d.reject(err); });
            return d.promise;
        }




        function asyncInitialise() {
            return asyncInitialiseDb();
        }


        var service = {
            errors: {
                NOT_FOUND: -2,
                DATABASE_CREATION: -3,
                TABLE_INSERT: -4,
            },

            asyncInitialise: asyncInitialise

        };





        return service;
    }
})();





