define(function() {
  var html = '<div class="exit-sign" style="width: 250px">'
              + '<div>'
              + ' <h4>Towards <%= towardInfo %></h5>'
              + ' <ul>'
              + '   <li>Lodging</li>'
              + '   <li>Food</li>'
              + '   <li>Fuel</li>'
              + ' </ul>'
              + '</div>'
              + '</div>'
    , template = _.template(html);

  function Exit(options) {
    var exit = this.exit = options.exit
      , poi = new MQA.Poi(exit.latLng)
      , icon = new MQA.Icon("http://dl.dropboxusercontent.com/u/4553248/exit_dot.png", 10, 10);

    this.poi = poi;
    this.map = options.map;
    this.latLng = this.exit.latLng;    

    poi.setShadow(null);
    poi.setClassName('exit');

    poi.setIcon(icon);
    poi.setIconOffset({x:-4, y:-8 })

    // if you dont instantiate the poi with some type of content, the toolkit will not fire infowindowopen/infowindowclose events
    // poi.setInfoTitleHTML('Exit ' + exit.number);
    // poi.setInfoContentHTML(template(_.defaults({}, this.exit, {towardInfo: 'N/A'})));    
    poi.setRolloverContent('Exit ' + this.exit.number);

    MQA.EventManager.addListener(poi, 'infowindowopen', this.onInfoWindowOpen, this);    
    MQA.EventManager.addListener(poi, 'click', function() { $(this).trigger('click', [this]) }, this);
  }

  Exit.prototype = {
    /**
     * Adds the exit to the map.
     * @return {Exit}
     */
    render: function() {
      this.map.addShape(this.poi);
      return this;
    }

    , onInfoWindowOpen: function() {
      $('.exit-sign').closest('.mqabasicwnd').addClass('exit-window');
    }
  };

  return Exit;
})