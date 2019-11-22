(function () {
  'use strict';

  angular
    .module('gaddum.models')
    .factory('TimeSlot', TimeSlot);

  TimeSlot.$inject = [
    'moment'
  ];


  function TimeSlot(
    moment
  ) {
    function TimeSlot() {

      this.id = null;
      this.start_time = null;
      this.end_time = null;


      this.getId = function () {
        return this.id;
      }

      this.getStartTime = function(){
        return moment(this.start_time, 'HH:mm:ss').toDate();
      }

      this.getEndTime = function(){
        return moment(this.end_time, 'HH:mm:ss').toDate();
      }
      
      this.isDateWithinTimeSlot = function (date) {
        var result = false;

        
        var result = moment(date).isBetween(
          moment(this.start_time, 'HH:mm:ss'), 
          moment(this.end_time, 'HH:mm:ss'));


        return result;

      }

    }

    


    /** 
     * Static method, assigned to class
     * Instance ('this') is not available in static context
     */
    TimeSlot.buildFromObject = function (candidate) {

      var result = new TimeSlot();

      result = angular.merge(result, candidate);


      return result;


    };




    /**
     * Return the constructor function
     */
    return TimeSlot;
  };


})();
