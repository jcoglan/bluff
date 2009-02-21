// DOM event module, adapted from Prototype
// Copyright (c) 2005-2008 Sam Stephenson

Bluff.Event = {
  _cache: [],
  
  observe: function(element, eventName, callback, scope) {
    var handlers = Bluff.map(this._handlersFor(element, eventName),
                      function(entry) { return entry._handler });
    if (Bluff.index(handlers, callback) != -1) return;
    
    var responder = function() {
      callback.call(scope || null, element);
    };
    this._cache.push({_node: element, _name: eventName,
                      _handler: callback, _responder: responder});
    
    if (element.addEventListener)
      element.addEventListener(eventName, responder, false);
    else
      element.attachEvent('on' + eventName, responder);
  },
  
  stopObserving: function(element) {
    var handlers = element ? this._handlersFor(element) : this._cache;
    Bluff.each(handlers, function(entry) {
      if (entry._node.removeEventListener)
        entry._node.removeEventListener(entry._name, entry._responder, false);
      else
        entry._node.detachEvent('on' + entry._name, entry._responder);
    });
  },
  
  _handlersFor: function(element, eventName) {
    var results = [];
    Bluff.each(this._cache, function(entry) {
      if (entry._node != element) return;
      if (eventName && entry._name != eventName) return;
      results.push(entry);
    });
    return results;
  }
};

if (window.attachEvent && navigator.userAgent.indexOf('Opera') === -1)
  window.attachEvent('onunload', function() {
    Bluff.Event.stopObserving();
    Bluff.Event._cache = null;
  });

if (navigator.userAgent.indexOf('AppleWebKit/') > -1)
  window.addEventListener('unload', function() {}, false);

