define(function() {
  'use strict';

  return {
    route: function(from, to) {
      return $.get('/route', {
        to: to
        , from: from
      });
    }

    , exits: function(sessionId) {
      return $.getJSON('/exits/' + sessionId);
    }
  };
});