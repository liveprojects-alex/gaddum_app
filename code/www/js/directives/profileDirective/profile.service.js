(function () {
    'use strict';

    angular
        .module('gaddum.profileDirective')
        .factory('profileService', profileService);

    profileService.$inject = [
      'gaddumMusicProviderService',
      '$q',
      '$timeout',
      'dataApiService',
      'AvatarGraphic',
      'SettingIdentifier',
      'utilitiesService'
    ];

    function profileService(
      gaddumMusicProviderService,
      $q,
      $timeout,
      dataApiService,
      AvatarGraphic,
      SettingIdentifier,
      utilitiesService
    ) {

      var SETTINGS = {
        AVATAR_GRAPHIC: 'avatar_graphic',
        AVATAR_NAME: 'avatar_name',
        PROFILE_ID: 'profile_id',
        DEVICE_ID: 'push_device_id'
      };

      var VALID_TYPES = SettingIdentifier.VALID_TYPES;


        // var userProfile = {
        //     "profile": {
        //         "profile_id": "99999999-5500-4cf5-8d42-228864f4807a",
        //         "avatar_name": "Lemon Jelly",
        //         "avatar_graphic": [
        //             0,
        //             102,
        //             102,
        //             24,
        //             24,
        //             66,
        //             126,
        //             0
        //         ],
        //         device_id: "dJUr6sA28ZY:A9A91bH-chjJ8lcq61ofrjoHjak3q6nCFALPGytdEsLzh2DacCx7ihhZHxd6pPSXYMhtx4MlcQekn1rzjB7c809aNzivPFu5jhA-SR6FWbvzfBsO8ySo6um8DVA9dgOgokzz0QU5vbEf"
        //     }
        // };



        function asyncGetAllGenres() {
            return gaddumMusicProviderService.asyncGetSupportedGenres();
        };


        function asyncSetGenres(newGenres) {
            return gaddumMusicProviderService.asyncSetGenres(newGenres);
        };

        

        function asyncGetGenres() {
            return gaddumMusicProviderService.asyncGetGenres();
        };




        function asyncGetUserProfile() {

            var deferred = $q.defer();
            var promises = [];

            promises.push(asyncGetProfileId());
            promises.push(asyncGetAvatarName());
            promises.push(asyncGetAvatarGraphic());
            promises.push(asyncGetDeviceId());

            $q.all(promises).then(
                function onSuccess(results){
                    
                    var result = {};
                    result[SETTINGS.PROFILE_ID]=results[0];
                    result[SETTINGS.AVATAR_NAME]=results[1];
                    result[SETTINGS.AVATAR_GRAPHIC]=results[2]; 
                    result[SETTINGS.DEVICE_ID]=results[3];

                    deferred.resolve(result);

                },
                function onError(error){
                    deferred.reject(error);
                }
            )



            return deferred.promise;
        };

        function asyncGetDeviceId(){
            var deferred = $q.defer();

            $timeout(
              function(){
                //@TODO this should return an actual device id?!?
                    deferred.resolve("dJUr6sA28ZY:A9A91bH-chjJ8lcq61ofrjoHjak3q6nCFALPGytdEsLzh2DacCx7ihhZHxd6pPSXYMhtx4MlcQekn1rzjB7c809aNzivPFu5jhA-SR6FWbvzfBsO8ySo6um8DVA9dgOgokzz0QU5vbEf");
                }
            );


            return deferred.promise;
        }


        function asyncGetProfileId() {
          var deferred = $q.defer();

            dataApiService.asyncGetSetting(SETTINGS.PROFILE_ID).then(
                function onSuccess(profileId) {

                    if (profileId && profileId.length > 0) {
                        deferred.resolve(profileId);
                    } else {

                        dataApiService.asyncSetSetting(SETTINGS.PROFILE_ID, utilitiesService.createUuid(), VALID_TYPES.string).then(
                            function onSuccess(profileId) {// asyncSetSetting returns the value which was set, as a convenience.
                                deferred.resolve(profileId);
                            },
                            function onError(error) {
                                deferred.reject(error);
                            }
                        );
                    }

                },
                function onError(error) {
                    deferred.reject(error);
                }
            );
            return deferred.promise;
        }

        function asyncGetAvatarName() {
            return dataApiService.asyncGetSetting(SETTINGS.AVATAR_NAME);
        };

        function asyncSetAvatarName(name) {
            return dataApiService.asyncSetSetting(SETTINGS.AVATAR_NAME, name, VALID_TYPES.string);
        };

        function asyncGetAvatarGraphic() {
            var deferred = $q.defer();

            dataApiService.asyncGetSetting(SETTINGS.AVATAR_GRAPHIC).then(
                function onSuccess(candidate) {
                    deferred.resolve(AvatarGraphic.buildFromBlob(candidate));
                },
                function onFail(error) {
                    deferred.reject(error);
                }
            );

            return deferred.promise;
        };

        function asyncSetAvatarGraphic(candidate) {
            if (!(candidate instanceof AvatarGraphic)) throw ("candidate must be an AvatarGraphic");

            var value = candidate.toBlob();

            return dataApiService.asyncSetSetting(SETTINGS.AVATAR_GRAPHIC, value, VALID_TYPES.string);
        };

        var openModalFlag=false;
        function setModalOpenFlag(value){
            openModalFlag=value;
        };

        function getOpenModalFlag(){
            return openModalFlag;
        };

        var firstRunFlag=false;
        function setFirstRunFlag(value){
            firstRunFlag=value;
        };
        function getFirstRunFlag(){
            return firstRunFlag;
        };

      var service = {
            asyncGetUserProfile: asyncGetUserProfile,
            asyncGetProfileId: asyncGetProfileId,
            asyncGetDeviceId: asyncGetDeviceId,
            asyncSetAvatarGraphic: asyncSetAvatarGraphic,
            asyncGetAvatarGraphic: asyncGetAvatarGraphic,
            asyncSetAvatarName: asyncSetAvatarName,
            asyncGetAvatarName: asyncGetAvatarName,
            asyncGetGenres: asyncGetGenres,
            asyncSetGenres: asyncSetGenres,
            asyncGetAllGenres: asyncGetAllGenres,
            setModalOpenFlag: setModalOpenFlag,
            getOpenModalFlag: getOpenModalFlag,
            setFirstRunFlag: setFirstRunFlag,
          getFirstRunFlag: getFirstRunFlag,
          "SETTINGS": SETTINGS
        };



        return service;
    };
}
)()
    ;
