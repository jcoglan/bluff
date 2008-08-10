Bluff.Renderer = new JS.Class({
  font: null,
  
  initialize: function(canvasId) {
    this._canvas = document.getElementById(canvasId);
    this._ctx = this._canvas.getContext('2d');
  },
  
  scale: function(sx, sy) {
    this._sx = sx;
    this._sy = sy || sx;
  },
  
  clear: function(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
    this._ctx.clearRect(0, 0, width, height);
  },
  
  render_gradiated_background: function(width, height, top_color, bottom_color) {
    this.clear(width, height);
    var gradient = this._ctx.createLinearGradient(0,0, 0,height);
    gradient.addColorStop(0, top_color);
    gradient.addColorStop(1, bottom_color);
    this._ctx.fillStyle = gradient;
    this._ctx.fillRect(0, 0, width, height);
  },
  
  render_solid_background: function(width, height, color) {
    this.clear(width, height);
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, width, height);
  }
});

