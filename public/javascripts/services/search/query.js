define(function() {
  /**
   * Constructor.
   * @param {Query.Builder} builder
   */
  function Query(builder) {
    this._url = builder._url;
    this._options = _.extend({}, builder._options);
  }

  Query.prototype = {
    /**
     * Runs the query.
     * @return {Promise}
     */
    run: function() {
      return $.get(this._url, this._options);
    }
  };

  /**
   * Query builder.
   * @param  {String} url   
   * @param  {String} query 
   */
  Query.Builder = function(url, query) {
    this._url = url;
    this._options = {};
    this._options.query = query;
  }

  Query.Builder.prototype = {
    /**
     * Builds a new Query object
     * @return {Query}
     */
    build: function() {
      return new Query(this);
    }
  };

  return Query;
});