(function () {
  'use strict;'

  angular
    .module('gaddum.playlists')
    .factory('playlistService', playlistService)
    ;

  playlistService.$inject = [
    'dataApiService',
    'PlaylistIdentifier',
    'GenericTrack',
    '$q',
    'gaddumMusicProviderService',
    '$timeout',
    'userProfilerService'
  ];
  function playlistService(
    dataApiService,
    PlaylistIdentifier,
    GenericTrack,
    $q,
    gaddumMusicProviderService,
    $timeout,
    userProfilerService

  ) {
    var isBusy = false;
    function getIsBusy() {
      return isBusy;
    }
    function asyncCreatePlaylist(name) {
      return dataApiService.asyncCreatePlaylist(name);
    }

    function asyncSeekPlaylists(searchName) {
      return dataApiService.asyncSeekPlaylists(searchName);
    }

    function asyncUpdatePlaylist(playlistIdentifier) {
      return dataApiService.asyncUpdatePlaylist(playlistIdentifier);
    }

    function asyncSetPlaylistTracks(playlistIdentifier, arrayGenericTracks) {
      isBusy = true;
      // console.log("tracks are ", arrayGenericTracks);
      return dataApiService.asyncSetGenericTracksInPlaylist(playlistIdentifier, arrayGenericTracks).then(function (result) {
        isBusy = false;
      });
    }

    function asyncGetPlaylistTracks(playlistIdentifier) {
      return dataApiService.asyncGetGenericTracksInPlaylist(playlistIdentifier);
    }

    function asyncRemovePlaylist(playlistIdentifier) {
      return dataApiService.asyncRemovePlaylist(playlistIdentifier);
    }
    function asyncImportPlaylist(playlistArray) {
      isBusy = true;
      return gaddumMusicProviderService.asyncImportPlaylists(playlistArray).then(function (result) {
        isBusy = false;
      });
    }
    function asyncImportTracks(trackInfoArray) {
      isBusy = true;
      return gaddumMusicProviderService.asyncImportTracks(trackInfoArray).then(function (result) {
        isBusy = false;
      });
    }

    function asyncPlay(moodedPlaylists) {

      var deferred = $q.defer();
      // console.log("async play MoodedPlaylist:", moodedPlaylists);
      $timeout(

        function () {

          if (moodedPlaylists) {
            userProfilerService.loader.asyncLoadMoodedPlaylists(moodedPlaylists);

            deferred.resolve();

          } else {
            deferred.reject();
          }


        }

      );


      return deferred.promise;

    }

    function asyncMakeTrackStatement(statementCriteria) {
      return userProfilerService.statement.asyncApplyStatement(statementCriteria);
    }


    var service = {
      asyncCreatePlaylist: asyncCreatePlaylist,
      asyncSeekPlaylists: asyncSeekPlaylists,
      asyncUpdatePlaylist: asyncUpdatePlaylist,
      asyncSetPlaylistTracks: asyncSetPlaylistTracks,
      asyncGetPlaylistTracks: asyncGetPlaylistTracks,
      asyncRemovePlaylist: asyncRemovePlaylist,
      getIsBusy: getIsBusy,
      asyncImportPlaylist: asyncImportPlaylist,
      asyncImportTracks: asyncImportTracks,
      asyncMakeTrackStatement: asyncMakeTrackStatement,
      asyncPlay: asyncPlay


    };

    return service;
  }
})();
