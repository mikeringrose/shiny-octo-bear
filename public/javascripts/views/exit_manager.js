define(['views/exit', 'views/exit_marker'], function(Exit, ExitMarker) {
  /**
   * Manages our exits and exit marker.
   * @param {Object} options must contain shapePoints, exits, and map
   */
  function ExitManager(options) {
    _.bindAll(this, 'moveTo');
    this.mqa = options.map.map;
    this.exits = options.exits;
    this.shapePoints = options.shapePoints;
    this.exitPois = _.map(this.exits, this.createExit, this);
    this.exitMarker = new ExitMarker({map: this.mqa, exits: this.exitPois, shapePoints: this.shapePoints});
  }

  ExitManager.prototype = {
    /**
     * Renders our exits and our exit marker.
     * @return {ExitManager}
     */
    render: function() {
      //- render each of our pois
      _.invoke(this.exitPois, 'render');

      //- render our marker
      this.exitMarker.render();      

      return this;
    }

    , createExit: function(exit) {
      var exit = new Exit({map: this.mqa, exit: exit});
      $(exit).on('click', this.moveTo);
      return exit;
    }

    , moveTo: function(evt, exit) {
      this.exitMarker.moveTo(exit);
    }
  };

  return ExitManager;
});