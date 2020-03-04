

(function () {
  'use strict';

  angular
    .module('gaddum.playlists')
    .controller('importPlaylistWizardController', importPlaylistWizardController);

    importPlaylistWizardController.$inject = [
      'importPlaylistWizard',
      '$scope',
      '$timeout',
      '$q',
      'gaddumMusicProviderService',
      'ImportPlaylist',
      'alertModal'

  ];
  
  function importPlaylistWizardController(
    importPlaylistWizard,
    $scope,
    $timeout,
    $q,
    gaddumMusicProviderService,
    ImportPlaylist,
    alertModal
  ) {
    var moodIdDict = {};
    var count = 0;
    var offset = 0;
    var limit = 10;
    var mc = angular.extend(this, {
      itemSelected:false,
      emotionSelected: '',
      playlistArray:[],
      hideMore: false,
      hideSpinner:true,
      importButtonHide:false,
      Importtext:"Import",
      noPlaylist:false
    });
    $scope.importPlaylistWizard=importPlaylistWizard;
    function init() {
      mc.hideSpinner = false;
      mc.params =importPlaylistWizard.getParams();
      // console.log(mc.params);
      gaddumMusicProviderService.asyncGetProfilePlaylist(offset,limit).then(function(result){
        var count = 0;
        result.forEach(function(element) {
          // console.log(element);
          mc.playlistArray[count] = {"name":element.getName()};
          mc.playlistArray[count].display_name = element.getOwnerName();
          mc.playlistArray[count].id = element.getProviderPlaylistRef();
          mc.playlistArray[count].artwork = element.getProviderArtworkRef();
          mc.playlistArray[count].value = false;
          count = count+1;
        });
        if(count === 0){
          mc.noPlaylist = true;
          mc.hideMore = true;
        }
        offset = offset+count;
        mc.hideSpinner = true;
      });
      
      
    }
    init();
    function playlistSelected(index){
      // console.log("here",mc.playlistArray[index].value);
      mc.playlistArray[index].value = !mc.playlistArray[index].value;
      mc.itemSelected = false;
      mc.playlistArray.forEach(function(element){
        if(element.value){
          mc.itemSelected = true;
        }
        
      });
    }
    function more(){
      // console.log("more");
      mc.hideSpinner = false;
      gaddumMusicProviderService.asyncGetProfilePlaylist(offset,limit).then(function(result){
        if(result.length === 0){
          mc.hideMore = true;
        }
        var count = offset;
        result.forEach(function(element) {
          // console.log(count);
          mc.playlistArray[count] = {"name":element.getName()};
          mc.playlistArray[count].display_name = element.getOwnerName();
          mc.playlistArray[count].id = element.getProviderPlaylistRef();
          mc.playlistArray[count].artwork = element.getProviderArtworkRef();
          mc.playlistArray[count].value = false;
          // console.log("playlistArry",mc.playlistArray);
          count = count+1;
        });
        offset = offset+10;
        mc.hideSpinner = true;
      });
    }
    function importPlaylists(){
      mc.importButtonHide = true;
      var importArray = [];
      mc.playlistArray.forEach(function(element) {
        if (element.value === true) {
          importArray.push(ImportPlaylist.build(null, element.name,element.id,element.artwork,element.display_name));
        }
      });
      importPlaylistWizard.callback(importArray);
      
    }
    function close(){
      importPlaylistWizard.close();
    }
    mc.close = close;
    mc.more = more;
    mc.importPlaylists = importPlaylists;
    mc.playlistSelected = playlistSelected;

  }
})();