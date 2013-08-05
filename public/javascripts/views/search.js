define(["services/search", "services/route"], function(SearchService, RouteService) {
  function Search(options) {
    this.$el = $(this.el = options.el);
    this.map = options.map;
    _.bindAll(this, "search", "_displaySearchResults", "directions", "_displayRoute");
  }

  Search.prototype = {
    render: function() {
      this.$el.find('form#search').submit(this.search);
      this.$el.find('form#directions').submit(this.directions);
      this.$el.find('.nav li').click(this._displayDirectionForm);
    }

    , search: function(evt) {
      evt.preventDefault();

      var $form = $(evt.target)
        , query = $form.find('input').val();
      SearchService.mapQuery(query).build().run().then(this._displaySearchResults);
    }

    , directions: function(evt) {
      evt.preventDefault();

      var $form = $(evt.target)
        , aStop = $form.find('[name="a"]').val()
        , bStop = $form.find('[name="b"]').val();

      RouteService.route(aStop, bStop).then(this._displayRoute);
    }

    , _displaySearchResults: function(results) {
      var places = this.$el.find('#searchResults').append(results);
      $.Topic("searchResults").publish(places);
    }

    , _displayDirectionForm: function(evt) {
      evt.preventDefault();

      var $tgt = $(evt.currentTarget);
      $tgt.addClass('active').closest('#searchBox').removeClass('search-mode');
      $('#directions [name="a"]').focus();
    }

    , _displayRoute: function(route) {
      route = this.$el.find('#searchResults').append(route);
      $.Topic('showRoute').publish(route);
    }
  };

  return Search;
});