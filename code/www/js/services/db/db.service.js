// see https://github.com/dpa99c/cordova-sqlite-porter-example-native-plugin
// see plugin https://github.com/dpa99c/cordova-sqlite-porter
// see plugin https://github.com/litehelpers/Cordova-sqlite-storage


(function () {
    'use strict';

    angular
        .module('app.db')
        .factory('dbService', dbService);

    dbService.$inject = [
        'utilitiesService'
    ];

    function dbService(
        utilitiesService
    ) {

        var service = {


        };


        var DB_NAME = "gaddum";
        var DB_LOCATION = "default";

        var DB = null;


        //PUBLIC
        service.isDBOpen = function () {
            return (DB);
        };

        //PUBLIC
        service.openDB = function (success, fail) {
            DB = window.sqlitePlugin.openDatabase(
                { name: DB_NAME, location: DB_LOCATION },
                function onOpenEnableForeignKeys() {
                    DB.executeSql("PRAGMA foreign_keys = on", [],
                        success,
                        fail)
                },
                fail);
        };

        //PUBLIC
        service.closeDB = function (success, fail) {
            var local = DB;
            DB = null;
            local.close(
                success,
                fail
            );
        };

        //PUBLIC
        service.deleteDB = function (success, fail) {
            DB = null;
            window.sqlitePlugin.deleteDatabase(
                { name: DB_NAME, location: DB_LOCATION },
                function () {
                    console.log("deleted DB.");
                    success();
                },
                function () {
                    console.log("could not delete DB");
                    fail();
                }
            );
        };

        //PUBLIC
        service.dumpDB = function (success) {
            cordova.plugins.sqlitePorter.exportDBToSql(
                DB,
                { successFn: success }
            );
        }

        //PUBLIC
        service.createDBFromApplicationDir = function (path, success, fail) {
            utilitiesService.readApplicationFileAsString(
                path,
                function (content) {
                    createDBFromSQL(
                        content,
                        success,
                        fail
                    );
                }
                ,
                fail
            );
        };

        //PUBLIC
        service.query = function (
            sql,
            params,
            success, // expect a result set 
            fail) {
            if (DB) {

                //console.log("QUERY: " + param);
                DB.executeSql(
                    sql,
                    params,
                    function (arg) {
                        //console.log("SUCCESS: " + JSON.stringify(arg));
                        success(arg);
                    },
                    function (err) {
                        //console.log("FAIL: " + JSON.stringify(err));
                        fail(err);
                    }
                );


            } else {
                fail("no database.");
            }
        }




        function createDBFromSQL(sql, success, fail) {
            window.sqlitePlugin.selfTest(
                function () {
                    DB = window.sqlitePlugin.openDatabase(
                        { name: DB_NAME, location: DB_LOCATION }
                    );
                    if (DB) {

                        console.log("turning OFF foreign keys");
                        DB.executeSql("PRAGMA foreign_keys = off", [],
                            function () {
                                var stripped = utilitiesService.removeComments(sql);

                                cordova.plugins.sqlitePorter.importSqlToDb(
                                    DB,
                                    stripped,
                                    {
                                        successFn: function () {
                                            console.log("turning ON foreign keys");
                                            DB.executeSql("PRAGMA foreign_keys = on", [],
                                                success,
                                                fail)
                                        },

                                        errorFn: function (error) {
                                            console.log("error importing DB: " + error.message);
                                            fail(error);
                                        }

                                    }
                                );
                            },
                            fail);
                    } else {
                        fail("database failure on open.");
                    }
                },
                function (error) {
                    fail("self-test failed: " + error);
                }
            );
        };




        service.transaction = function (arg, fnSuccess, fnFail) {

            DB.sqlBatch(
                arg,
                fnSuccess,
                function (error) {
                    console.log('SQL batch ERROR: ' + error.message);
                    fnFail(error);
                });

        }

        return service;
    }
})();






