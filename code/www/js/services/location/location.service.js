(function () {
    'use strict';

    // console.log("HERE: locationService");

    angular
        .module('gaddum.location')
        .factory('locationService', locationService);

    locationService.$inject = [
        'ErrorIdentifier',
        'Location',
        '$q',
        '$timeout'
    ];

    function locationService(
        ErrorIdentifier,
        Location,
        $q,
        $timeout
    ) {


        // alert('Latitude: '          + m_position.coords.latitude          + '\n' +
        // 'Longitude: '         + m_position.coords.longitude         + '\n' +
        // 'Altitude: '          + m_position.coords.altitude          + '\n' +
        // 'Accuracy: '          + m_position.coords.accuracy          + '\n' +
        // 'Altitude Accuracy: ' + m_position.coords.altitudeAccuracy  + '\n' +
        // 'Heading: '           + m_position.coords.heading           + '\n' +
        // 'Speed: '             + m_position.coords.speed             + '\n' +
        // 'Timestamp: '         + m_position.timestamp                + '\n');
        var m_position = null;

        var m_watchId = null;

        



        function asyncReadLocationPlugin(){
            var deferred = $q.defer();
            navigator.geolocation.getCurrentPosition(
                function success(position){
                    m_position = position;
                    deferred.resolve(position);
                },
                function error(err){
                    deferred.reject(err);
                },
                { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true } 
            )
            return deferred.promise;
        }

        function onNewPosition(position){
            m_position = position;
        }

        function clearPosition(){
            m_position = null;
        }


        function enablePositionWatch(){
  
            if(m_watchId){
                throw("locationService: clear watch before enabling.");
            }else{
                m_watchId = navigator.geolocation.watchPosition(onNewPosition);
            }
            return m_watchId;
        }

        function clearPositionWatch(){

            if(m_watchId){
                navigator.geolocation.clearWatch(m_watchId);
                m_watchId = null;
            }
            return m_watchId;
        }

        function isWatchEnabled(){
            return (m_watchId != null);
        }


        function initialise(){
            clearPosition();
            clearPositionWatch();
        } 

        function asyncEnable(enable){
            if(enable){
                if(!isWatchEnabled()){
                    enablePositionWatch();
                }
            }else{
                if(isWatchEnabled()){
                    clearPositionWatch();
                }
            }
            return asyncGetImmediatePosition();
        }

        function asyncGetImmediateLocation(){
            var deferred = $q.defer();
            asyncReadLocationPlugin().then(
                function success(){
                    deferred.resolve(Location.build(m_position.coords.latitude, m_position.coords.longitude   ));
                },
                function error(err){
                    deferred.reject(err);
                }
            );

            return deferred.promise;
        }

        function getLastKnownLocation(){
            var result = null;
            if(m_position){
                result = Location.build(m_position.coords.latitude, m_position.coords.longitude   );
            }
           return result;
        }

        function asyncGetLocation(){
            var deferred = $q.defer();

            $timeout(
                function(){
                    var location = getLastKnownLocation();
                    if(!location){
                        asyncGetImmediateLocation().then(
                            function success(location){
                                deferred.resolve(location);
                            },
                            function error(err){
                                deferred.resolve(ErrorIdentifier.build(ErrorIdentifier.SYSTEM, "unable to obtain location."));
                            }
                        );
                    }else{
                        deferred.resolve(location);
                    }
                }
            );

            return deferred.promise;
        }



        var service = {
            initialise : initialise,
            asyncEnable: asyncEnable,
            isEnabled: isWatchEnabled,
            asyncGetImmediateLocation, asyncGetImmediateLocation,
            getLastKnownLocation, getLastKnownLocation,
            asyncGetLocation: asyncGetLocation
        };

        return service;
    }





})();