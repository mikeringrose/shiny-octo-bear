require(["router", "views/map", "views/search", "views/place", "views/exit_marker", "services/route"], function(Router, Map, Search, Place, ExitMarker, RouteService) {
  var mapOptions = {
      el: $("#mapWrapper:first")[0]
      , zoom: 10
      , geo: {
        latitude: 39.743943
        , longitude: -105.020089
      }
    };

  var map = new Map(mapOptions).render();
  var search = new Search({el: $("#searchBox")[0], map: map}).render();

  $.Topic("searchResults").subscribe(function(results) {
    map.addPlaces(results);
  });

  $.Topic("showRoute").subscribe(function(route) {
    var $route = $(route).items("http://mapquest.com/Route")
      , sessionId = $route.properties('sessionId').itemValue()
      , shapePoints = $route.properties('shapePoints').itemValue().split(',');
    
    map.addRoute(route);

    RouteService.exits(sessionId)
      .then(function(exits) {
        new ExitMarker({map: map, exits: exits, shapePoints: shapePoints}).render();
      });
  });

  $.Topic("showSearchResult").subscribe(function(path, id) {
    var place = new Place({placeId: id, el: $("#place")[0]}).render();
  });

  Router.start();
});