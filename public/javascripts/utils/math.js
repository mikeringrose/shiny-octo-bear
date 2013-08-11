define(function() {
  var util = {
    slope: function(p1, p2) {
      return (p2.lat - p1.lat) / (p2.lng - p1.lng);
    }

    , distance: function(p1, p2) {
      return Math.sqrt(Math.pow((p2.lng - p1.lng), 2) + Math.pow((p2.lat - p1.lat), 2));
    }

    , toUnitVector: function(p1, p2) {
      var length = util.distance(p1, p2)
        , lat = p2.lat - p1.lat
        , lng = p2.lng - p1.lng;
      return {lat: lat/length, lng: lng/length};
    }
  };

  return util;
});