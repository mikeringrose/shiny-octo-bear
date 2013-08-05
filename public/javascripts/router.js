define(function() {

  var Router = {

    routes: {
      "/place/(\\d+)": "showSearchResult"
    }

    , start: function() {
      $(window).on("hashchange", Router.route);
    }

    , route: function() {
      var hash = window.location.hash.substring(1)
        , routes = Router.routes;

      for (var r in routes) {
        var regex = new RegExp(r)
          , matches;

        if (matches = hash.match(regex)) {
          $.Topic(routes[r]).publish.apply(this, matches);
          break;
        }
      }
    }
  };

  return Router;
}) ;