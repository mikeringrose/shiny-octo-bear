define(['utils/math'], function(Util) {
  function ExitMarker(options) {
    this.mqa = options.map.map;
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
          , $html = $('<div><a class="prev" href="#prev">&#x25c0;</a><span>Exit ' + currentStop.number + '</span><a class="next" href="#next">&#x25BA;</a></div>');

        MQA.EventManager.addListener(exitMarker, 'click', self.move);
        exitMarker.setHtml($html.html());
        self.mqa.addShape(exitMarker);
      });
    }

    , move: function(evt) {
      var direction = $(evt.domEvent.target || evt.domEvent.srcElement).attr('href');

      if (direction === "#next") {
        this.next()
      }
      else if (direction === "#prev") {
        this.previous();
      }
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
            setTimeout(update, 1/30);
          }
          else {
            self.exitMarker.setHtml('<div><a class="prev" href="#prev">&#x25c0;</a><span>Exit ' + self.exitRibbon.currentStop().number + '</span><a class="next" href="#next">&#x25BA;</a></div>');
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
      return this.computeAnimatedPath(segs, .0025);
    }

    , computeAnimatedPath: function(segs, step) {
      var curr = {lat: segs[0], lng: segs[1]}
        , remaining = step
        , path = []
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
  };

  /* export me */
  return ExitMarker;
});