Bluff.Tooltip = new JS.Singleton({
  LEFT_OFFSET:  20,
  TOP_OFFSET:   -6,
  DATA_LENGTH:  8,
  
  CLASS_NAME:   'bluff-tooltip',
  
  setup: function() {
    this._tip = document.createElement('div');
    this._tip.className = this.CLASS_NAME;
    this._tip.style.position = 'absolute';
    this.hide();
    document.body.appendChild(this._tip);
    
    Bluff.Event.observe(document.body, 'mousemove', function(body, event) {
      this._tip.style.left = (event.pageX + this.LEFT_OFFSET) + 'px';
      this._tip.style.top = (event.pageY + this.TOP_OFFSET) + 'px';
    }, this);
  },
  
  show: function(data) {
    this._tip.innerHTML = Number(String(data).substr(0, this.DATA_LENGTH));
    this._tip.style.display = '';
  },
  
  hide: function() {
    this._tip.style.display = 'none';
  }
});

Bluff.Event.observe(window, 'load', Bluff.Tooltip.method('setup'));

