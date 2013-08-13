define(['utils/math'], function(Util) {
  var html = '<div id="exit-marker">'
              + '<div class="route-pin">'
              + ' <p class="inventory-level"><span></span> Hotels</p>'
              + ' <p class="min-price">From <span></span></p>'
              + '</div>'
              + '<div class="handle"></div>'
              + '</div>'
    , template = _.template(html);

  function ExitMarker(options) {
    this.mqa = options.map;
    this.exits = options.exits;
    this.shapePoints = options.shapePoints;
    this.exitRibbon = new ExitRibbon(this.shapePoints, this.exits);

    _.bindAll(this, 'move');
  }

  ExitMarker.prototype = {
    /**
     * Renders this view on to the map.
     * @return {ExitMarker}
     */
    render: function() {
      var self = this;

      MQA.withModule('htmlpoi', function() {
        var currentStop = self.exitRibbon.currentStop()
          , exitMarker = self.exitMarker = new MQA.HtmlPoi(currentStop.latLng)
          , $html = $(template());

        _.bindAll(self, 'movePin', 'unmove');

        $('body').on('mouseup', self.unmove);
        MQA.EventManager.addListener(exitMarker, 'mousedown', self.move, self);
        exitMarker.setHtml($html.html(), -23, -60, 'exit-marker');
        self.mqa.addShape(exitMarker);
      });
    }

    , move: function(evt) {
      var isHandle = $(evt.domEvent.target || evt.domEvent.srcElement).hasClass('handle');

      if (isHandle) {
        this.previousPosition = [evt.domEvent.pageX, evt.domEvent.pageY];
        $('#mapWrapper').on('mousemove', this.movePin);
      }
    }

    , unmove: function(evt) {
      $('#mapWrapper').off('mousemove', this.movePin);
      var closest = this.exitRibbon.closestExit(this.exitMarker.latLng);
      this.exitMarker.setLatLng(closest.latLng);
    } 

    , movePin: function(evt) {
      var newLatLng = this.mqa.pixToLL({x: (evt.pageX - 500), y: (evt.pageY - 70)});
      this.exitMarker.setLatLng(newLatLng);     
    }

    , moveTo: function(exit) {
      var path = this.exitRibbon.moveTo(exit);
      this.animate(path);
    }

    , previous: function() {
      var path = this.exitRibbon.previous();
      this.animate(path);
    }

    , next: function() {
      var path = this.exitRibbon.next();
      this.animate(path);
    }

    , animate: function(path) {
      var self = this
        , idx = 0
        , update = function() {
          self.exitMarker.setLatLng(path[idx]);
          idx += 1;

          if (idx < path.length) {
            setTimeout(update, 30);
          }
        };
      update();
    }
  };

  function ExitRibbon(route, stops, current) {
    this.route = _.map(route, parseFloat);
    this.stops = stops;
    this.current = current || 0;
  }

  ExitRibbon.prototype = {
    /**
     * Returns our first stop.
     * @return {Object} lat, lng pair object
     */
    currentStop: function() {
      return this.stops[this.current];
    }

    , moveTo: function(exit) {
      var currStop = this.currentStop()
        , nextIndex = _.indexOf(this.stops, exit)
        , nextStop, path;

      nextStop = this.stops[nextIndex];

      if (nextIndex > this.current) {
        path = this.computePath(currStop, nextStop);
      }
      else {
        path = this.computePath(nextStop, currStop).reverse();
      }

      this.current = nextIndex;

      return path;
    }

    /**
     * Returns the pre-computed path to the next stop. 
     * @return {Array}
     */
    , next: function() {
      var currStop = this.stops[this.current++]
        , nextStop = this.stops[this.current];
      return this.computePath(currStop, nextStop);
    }

    , previous: function() {
      var currStop = this.stops[this.current--]
        , nextStop = this.stops[this.current];
      return this.computePath(nextStop, currStop).reverse();
    }

    , computePath: function(currStop, nextStop) {
      var start = this.getSegment(currStop)
        , stop = this.getSegment(nextStop)
        , segs = this.route.slice(start, stop + 2);

      //- bit hacky but our start and stops should be our exit
      segs[0] = currStop.latLng.lat;
      segs[1] = currStop.latLng.lng;
      segs[segs.length - 2] = nextStop.latLng.lat;
      segs[segs.length - 1] = nextStop.latLng.lng;

      return this.computeAnimatedPath(segs, .005);
    }

    , computeAnimatedPath: function(segs, step) {
      var curr = {lat: segs[0], lng: segs[1]}
        , remaining = step
        , path = [curr]
        , dist, pct, uv;

      for (var i = 2; i < segs.length;) {
        next = {lat: segs[i], lng: segs[i+1]};
        dist = Util.distance(curr, next);

        if (step > dist) {
          remaining -= dist;
          curr = next;
          i+=2;
        }
        else {
          uv = Util.toUnitVector(curr, next);
          curr = {lat: (curr.lat + uv.lat * step), lng: (curr.lng + uv.lng * step)};
          path.push(next);
          remaining = step;
        }
      };

      return path;
    }

    , getSegment: function(stop) {
      var curr = {lat: this.route[0], lng: this.route[1]}
        , distances = []
        , next, intersection, slope, yIntercept, otherSlope, otherYIntercept;

      for (var i = 2; i < this.route.length; i += 2) {
        next = {lat: this.route[i], lng: this.route[i + 1]};

        //- right now i don't want to deal with horizontal lines
        if (curr.lng == next.lng) {
          next.lng += .000001;
        }

        //- see above but for vertical lines
        if (curr.lat == next.lat) {
          next.lat += .000001;
        }

        //- route segment
        slope = Util.slope(next, curr);
        yIntercept = curr.lat - curr.lng * slope;

        //- stop segment
        otherSlope = -1/slope;
        otherYIntercept = stop.latLng.lat - stop.latLng.lng * otherSlope;

        //- where do we intersect?
        intersection = {lng: ((yIntercept - otherYIntercept) / (otherSlope - slope))};
        intersection.lat = (slope * intersection.lng) + yIntercept;

        //- distance
        if(intersection.lat > Math.min(curr.lat, next.lat) && intersection.lat < Math.max(curr.lat, next.lat)
            && intersection.lng > Math.min(curr.lng, next.lng) && intersection.lng < Math.max(curr.lng, next.lng)) {
          distances.push({index: i, distance: Util.distance(stop.latLng, intersection)});
        }

        curr = next;
      }

      return _.min(distances, function(distance) { return distance.distance; }).index;      
    }

    , closestExit: function(latLng) {
      var distances = _.map(this.stops, function(stop, index) {
        return { stop: stop, distance: Util.distance(stop.latLng, latLng) };
      });

      return _.min(distances, function(distance) { return distance.distance; }).stop;
    }
  };

  /* export me */
  return ExitMarker;
});