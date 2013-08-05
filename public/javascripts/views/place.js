define(function() {
  function Place(options) {
    this.$el = $(this.el = options.el);
    this.placeId = options.placeId;

    if (!this.el) throw new Error("El is required");
    if (!this.placeId) throw new Error("Place Id is required");

    _.bindAll(this, "showPlace");
  }

  Place.prototype = {
    render: function() {
      $.get("/map/" + this.placeId).then(this.showPlace);
    }

    , showPlace: function(place) {
      this.$el.show();
      var offset = this.$el.offset();      
      this.$el.html(place);
      $(window).scrollTop(offset.top - 300);
    }
  };

  return Place;
});