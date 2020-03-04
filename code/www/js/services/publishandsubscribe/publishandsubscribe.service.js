(function () {
    'use strict';

    // console.log("HERE: pubsubService");

    angular
        .module('gaddum.publishandsubscribe')
        .factory('pubsubService', pubsubService);

    pubsubService.$inject = [
        '$q',
        '$timeout',
        'utilitiesService'
    ];

    function pubsubService(
        $q,
        $timeout,
        utilitiesService
    ) {

        var DICT_SUBSCRIBERS = {};
        var DICT_REFERENCES = {};


        function asyncCallFunction(fnOnEvent, payload) {

            var deferred = $q.defer();

            $timeout(
                function () {

                    $q.when(
                        fnOnEvent(payload)).then(
                        deferred.resolve,
                        function () {
                            console.log("pubsubService: asyncCallFunction: warning: delegate function barfed. Ignoring.");
                            deferred.resolve();
                        }
                    );

                }
            );

            return deferred.promise;

        }

        function subscribe(eventName, fnOnEvent) {

            var referenceId = utilitiesService.createUuid();

            if (DICT_SUBSCRIBERS[eventName] == null) {
                DICT_SUBSCRIBERS[eventName] = {};
            }

            DICT_SUBSCRIBERS[eventName][referenceId] = fnOnEvent;

            DICT_REFERENCES[referenceId] = eventName;

            return referenceId;
        }


        function unsubscribe(referenceId) {
            try {
                var eventName = DICT_REFERENCES[referenceId];
                var subscribers = DICT_SUBSCRIBERS[eventName];
                delete subscribers[eventName];
            } catch (e) {
                console.log("pubsubService: unsubscribe: error (ignored) trying to unsubscribe : " + referenceId);
            }
        }

        function asyncPublish(eventName, payload) {
            var deferred = $q.defer();
            var subscribers = DICT_SUBSCRIBERS[eventName];
            var promises = [];
            Object.keys(subscribers).forEach(
                function (key) {
                    var referenceId = key;
                    promises.push(asyncCallFunction(subscribers[referenceId], payload));
                }
            );
            $q.all(promises).then(
                deferred.resolve,
                deferred.resolve
            );

            return deferred.promise;
        }


        var service = {
            // do intialise to update settings from DB
            asyncPublish: asyncPublish,
            subscribe: subscribe,
            unsubscribe: unsubscribe
        };

        return service;
    }





})();