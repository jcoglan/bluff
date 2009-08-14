// DOM event module, adapted from Prototype
// Copyright (c) 2005-2008 Sam Stephenson

Bluff.Event = {
  _cache: [],
  
  _isIE: (window.attachEvent && navigator.userAgent.indexOf('Opera') === -1),
  
  observe: function(element, eventName, callback, scope) {
    var handlers = Bluff.map(this._handlersFor(element, eventName),
                      function(entry) { return entry._handler });
    if (Bluff.index(handlers, callback) != -1) return;
    
    var responder = function(event) {
      callback.call(scope || null, element, Bluff.Event._extend(event));
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
      if (element && entry._node != element) return;
      if (eventName && entry._name != eventName) return;
      results.push(entry);
    });
    return results;
  },
  
  _extend: function(event) {
    if (!this._isIE) return event;
    if (!event) return false;
    if (event._extendedByBluff) return event;
    event._extendedByBluff = true;
    
    var pointer = this._pointer(event);
    event.target = event.srcElement;
    event.pageX = pointer.x;
    event.pageY = pointer.y;
    
    return event;
  },
  
  _pointer: function(event) {
    var docElement = document.documentElement,
        body = document.body || { scrollLeft: 0, scrollTop: 0 };
    return {
      x: event.pageX || (event.clientX +
                        (docElement.scrollLeft || body.scrollLeft) -
                        (docElement.clientLeft || 0)),
      y: event.pageY || (event.clientY +
                        (docElement.scrollTop || body.scrollTop) -
                        (docElement.clientTop || 0))
    };
  }
};

if (Bluff.Event._isIE)
  window.attachEvent('onunload', function() {
    Bluff.Event.stopObserving();
    Bluff.Event._cache = null;
  });

if (navigator.userAgent.indexOf('AppleWebKit/') > -1)
  window.addEventListener('unload', function() {}, false);

