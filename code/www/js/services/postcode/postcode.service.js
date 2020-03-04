//module definition
(function () {
    'use strict';

    // console.log("HERE: postcodeservice");

    angular
        .module('gaddum.postcode', [
        ])
        .factory('postcodeService', postcodeService);

    postcodeService.$inject = [
        '$q',
        '$http',
        '$timeout',
        'Location',
        'ErrorIdentifier',
        'Postcode'

    ];
    function postcodeService(
        $q,
        $http,
        $timeout,
        Location,
        ErrorIdentifier,
        Postcode
    ) {


        var POSTCODE_SEARCH_RADIUS = 50; // less than this risks a result of 'null'.
        var POSTCODE_SEARCH_LIMIT = 1;


        // location: an object with a 'latitude' and 'longitude' property
        // radius: integer specifying radius (optional)
        // limit: maximum result count (optional)
        // after promise: returns a list of postcode objects
        function asyncGetPostcode(location, requested_radius, requested_limit) {
            var defer = $q.defer();
            $timeout(
                function () {

                    var limit = Math.min(requested_limit, 99); // API sets maximum 99 as limit
                    var radius = Math.min(requested_radius, 1999); // API sets maximum radius of 1999

                    var requestUrl = "";
                    if (angular.isObject(location) === true) {
                        var lat = location.getLat();
                        var lon = location.getLon();
                        
                        requestUrl = "https://api.postcodes.io/postcodes?lon=" + lon + "&lat=" + lat;
                        
                        if ((angular.isDefined(radius) === true) && (Number.isInteger(radius) === true)) {
                            requestUrl = requestUrl + "&radius=" + radius;
                        }
                        if ((angular.isDefined(limit) === true) && (Number.isInteger(limit) === true)) {
                            requestUrl = requestUrl + "&limit=" + limit;
                        }
                    }
                    if (requestUrl !== "") {
                        $http.get(requestUrl)
                            .then(
                                function success(data, status, headers, config) {
                                    defer.resolve(data);
                                },
                                function error(data, status, headers, config) {
                                    deferred.reject(new Error(status));
                                });

                    };
                });
            return defer.promise;
        };

        function getPostcodesFromPartial(partial) {
            var defer = $q.defer();

            $timeout(function(){

                if (partial.length > 0) {
                    var requestUrl = "https://api.postcodes.io/postcodes?q=" + partial;
                    $http.get(requestUrl).then(
                        function getPostcodeFromPartialResponse(data) {
                            defer.resolve(data.data.result);
                        },
                        function getPostcodeFromPartialResponseError(error) {
                            defer.reject(new Error("there was an error calling the online postcode service."));
                        }
                    );
                } else {
                   defer.resolve(partial);
                }

            });


            return defer.promise;
        };

        // postcode: a string
        // after promise: returns a location object (with latitude and longitude properties)
        function asyncGetLocation(postcode) {
            var defer = $q.defer();

            $timeout(
                function(){

                    var requestUrl = "";
                    if (angular.isDefined(postcode)) {
                        requestUrl = "https://api.postcodes.io/postcodes/" + postcode;
                    }
                    if (requestUrl !== "") {
                        $http.get(requestUrl)
                            .then(
                                function success(data, status, headers, config) {
                                    //console.log( "postcodeService.asyncGetLocation:", data );
                                    defer.resolve(data)
                                },
                                function error(data, status, headers, config) {
                                    defer.reject(new Error("there was an error calling the online postcode service."));
                                });
                        
                    }else{
                        defer.reject(new Error("no postcode."));
                    }
                }
            );

            return defer.promise;

        };


        function asyncPostcodeToLocation(postcode) {
            var deferred = $q.defer();

            asyncGetLocation(postcode).then(
                function onSuccess(coords) {
                    var result = Location.build(coords.latitude, coords.longitude);
                    deferred.resolve(result);
                },
                function onError(err) {
                    var error = ErrorIdentifier.build(ErrorIdentifier.SYSTEM, "problem contacting postcode service");
                    deferred.reject(error);
                }
            );

            return deferred.promise;
        }



        function asyncLocationToPostcode(location) {
            var deferred = $q.defer();

            asyncGetPostcode(location, POSTCODE_SEARCH_RADIUS, POSTCODE_SEARCH_LIMIT).then(
                function(response){
                    var result = null;
                    try{
                        var strPostcode = response.data.result[0].postcode;
                        result = Postcode.build(strPostcode);
                    }catch(e){
                        console.log("postcodeService: asyncLocationToPostcode: warning: returning null.");
                    }
                    deferred.resolve(result);
                },
                deferred.reject
            );



            return deferred.promise;
        }


        function asyncAutocompletePostcode(partial) {
            return getPostcodesFromPartial(partial)
        }

        var service = {
            asyncLocationToPostcode: asyncLocationToPostcode,
            asyncPostcodeTolocation: asyncPostcodeToLocation,
            asyncAutocompletePostcode: asyncAutocompletePostcode
        };






        return service;
    }
})();