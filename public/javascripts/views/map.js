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
      $.each($(places).find("li"), addPoi);
      this.map.addShapeCollection(pois);
      this.map.bestFit();
    }

    , addRoute: function(route) {
      var self = this
        , $route = $(route)
        , shapePoints = $route.find("[itemprop=shapePoints]").attr('content').split(',')
        , routeLocations = $route.find('[itemprop=location]');

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
    line.color = "#ff0000";
    line.colorAlpha = .7;
    line.borderWidth = 5;
    line.setShapePoints(shapePoints);
    return line;
  }

  function newLocation(loc) {
    var $loc = $(loc);
    return new MQA.Poi( {lat: $loc.find("[itemprop=latitude]").text(), lng: $loc.find("[itemprop=longitude]").text()});
  }

  function addPoiToCollection(pois, $place) {
    var $this = $(this);
    pois.add(new MQA.Poi({
      lat: $this.find("[itemprop=latitude]").text()
      , lng: $this.find("[itemprop=longitude]").text()
    }));
  }

  return Map;
});
