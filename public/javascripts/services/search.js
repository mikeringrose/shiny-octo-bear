define(["services/search/query"], function(Query) {
  return {
    mapQuery: function(query) {
      return new Query.Builder("/search", query);
    }
  };
});