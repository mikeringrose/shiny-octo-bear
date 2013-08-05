define(function() {
  'use strict';

  var url = "http://www.mapquestapi.com/directions/v1/route?key=YOUR_KEY_HERE&from=Lancaster,PA&to=York,PA&callback=renderNarrative";

  return {
    route: function(from, to) {
      return $.get("/route", {
        to: to
        , from: from
      });
    }
  };
});