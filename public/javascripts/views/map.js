define(function() {
  function Map(options) {
    this.el = options.el;
    this.zoom = options.zoom;
    this.geo = options.geo;
  }

  Map.prototype = {
    render: function() {
      var self = this;

      self.map = new MQA.TileMap({
        elt: self.el
        , zoom: 10
        , latLng: {
          lat: self.geo.latitude
          , lng: self.geo.longitude
        }
        , bestFitMargin: 20
        , bufferSize: 2
      });

      MQA.withModule('smallzoom', function () {
        self.map.addControl(
          new MQA.SmallZoom()
          , new MQA.MapCornerPlacement(MQA.MapCorner.TOP_RIGHT, new MQA.Size(5,5))
        );
      }); 

      return self;     
    }

    , addPlaces: function(places) {
      var pois = new MQA.ShapeCollection()
        , addPoi = _.partial(addPoiToCollection, pois);
      $.each($(places).items('http://schema.org/Place'), addPoi);
      this.map.addShapeCollection(pois);
      this.map.bestFit();
    }

    , addRoute: function(route) {
      var self = this
        , $route = $(route).items("http://mapquest.com/Route")
        , shapePoints = $route.properties('shapePoints').itemValue().split(',')
        , routeLocations = $route.properties('location');

      MQA.withModule('shapes', function() {
        var line = newRouteRibbon(shapePoints);
        self.map.addShape(line);
        $.each(routeLocations, function() {
          self.map.addShape(newLocation(this));
        });
        self.map.bestFit();
      });
    }
  };

  function newRouteRibbon(shapePoints) {
    var line = new MQA.LineOverlay();
    line.color = "#1E90FF";
    line.colorAlpha = .9;
    line.borderWidth = 5;
    line.setShapePoints(shapePoints);
    return line;
  }

  function newLocation(loc) {
    var $geo = $(loc).properties("geo");
    return new MQA.Poi( {lat: $geo.properties('latitude').itemValue(), lng: $geo.properties('longitude').text()});
  }

  function addPoiToCollection(pois) {
    var $geo = $(this).properties('geo');
    pois.add(new MQA.Poi({
      lat: $geo.properties('latitude').itemValue()
      , lng: $geo.properties('longitude').itemValue()
    }));
  }

  return Map;
});
