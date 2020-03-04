(function () {
    'use strict';
    
    angular
        .module('gaddum.main_ui')
        .factory('SettingsModal', SettingsModal);//rename genModal
    SettingsModal.$inject = ['$ionicModal', '$rootScope','userSettingsService','$timeout'];
    function SettingsModal($ionicModal, $rootScope,userSettingsService, $timeout) {
        var $scope = $rootScope.$new(),
            myModalInstanceOptions = {
                scope: null,
                focusFirstInput: true,
                controller: 'settingsModalController as sc',
                
            };
        $scope.$on("modal.hidden", function (modal) {
            
            close();
            
        });
        var modalSave = null;
        var parameter = null;
        var dict = {};

        var myModal = {
            open: open,
            close: close,
            getParams:getParams,
            initDict:initDict,
            addToDict:addToDict
        };
        return myModal;

        function open(params, fnCallbackOk, fnCallbackCancel) {
            var service = this;

            parameter = params;
            $scope.fnCallbackOk = fnCallbackOk;
            $scope.fnCallbackCancel=fnCallbackCancel;
            $ionicModal.fromTemplateUrl(
                'js/directives/main_menu/settings.modal/settings.modal.html',
                myModalInstanceOptions
            ).then(function (modalInstance) {
                modalSave = modalInstance;
                service.close = function () {
                    closeAndRemove(modalInstance);
                    $scope.fnCallbackOk();
                };
                service.modalInstance = modalInstance;
                return service.modalInstance.show();
            });
            
        }
        function getParams(){
            return parameter;

            
        }
        function initDict(settings){
            dict = settings;
        }
        function addToDict(setting,index){
            dict[index] = setting;
            // console.log(dict);
        }
        function close() {
            if(modalSave){
                if(!modalSave._isShown){
                    if(dict.length >=1){
                        dict.forEach(function(element) {
                            userSettingsService.asyncSet(element.id, element.value, element.type);
                        });
                    }
                    $timeout(function(){
                        modalSave.remove();
                        modalSave = null;
                        $scope.fnCallbackCancel();
                    },500);
                }
            }
            
        }
        function closeAndRemove(modalInstance) {
            return modalInstance.hide()
                .then(function () {
                    return modalInstance.remove();
                });
        };
    }
})();

