require(["router", "views/map", "views/search", "views/place"], function(Router, Map, Search, Place) {
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
    map.addRoute(route);
  });

  $.Topic("showSearchResult").subscribe(function(path, id) {
    var place = new Place({placeId: id, el: $("#place")[0]}).render();
  });

  Router.start();
});