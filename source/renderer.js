Bluff.Renderer = new JS.Class({
  font: 'Arial, Helvetica, Verdana, sans-serif',
  gravity: 'north',
  
  initialize: function(canvasId) {
    this._canvas = document.getElementById(canvasId);
    this._ctx = this._canvas.getContext('2d');
  },
  
  scale: function(sx, sy) {
    this._sx = sx;
    this._sy = sy || sx;
  },
  
  caps_height: function(font_size) {
    var X = this._sized_text(font_size, 'X'),
        height = this._element_size(X).height;
    document.body.removeChild(X);
    return height;
  },
  
  text_width: function(font_size, text) {
    var element = this._sized_text(font_size, text);
    var width = this._element_size(element).width;
    document.body.removeChild(element);
    return width;
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
  },
  
  annotate_scaled: function(width, height, x, y, text, scale) {
    var scaled_width = (width * scale) >= 1 ? (width * scale) : 1;
    var scaled_height = (height * scale) >= 1 ? (height * scale) : 1;
    var text = this._sized_text(this.pointsize, text);
    text.style.color = this.fill;
    text.style.fontWeight = this.font_weight;
    text.style.textAlign = this._text_align();
    var pos = this._offset(this._canvas);
    text.style.left = (pos.left + this._sx * x) + 'px';
    text.style.top = (pos.top + this._sy * y + this._height_adjustment(text, height)) + 'px';
    text.style.width = scaled_width + 'px';
    text.style.height = scaled_height + 'px';
  },
  
  line: function(sx, sy, ex, ey) {
    this._ctx.strokeStyle = this.stroke;
    this._ctx.lineWidth = this.stroke_width;
    this._ctx.beginPath();
    this._ctx.moveTo(this._sx * sx, this._sy * sy);
    this._ctx.lineTo(this._sx * ex, this._sy * ey);
    this._ctx.stroke();
  },
  
  _text_align: function() {
    switch (this.gravity) {
      case 'north': case 'south':
        return 'center';
      case 'west':
        return 'left';
      case 'east':
        return 'right';
      default:
        return 'center';
    }
  },
  
  _height_adjustment: function(node, height) {
    var h = this._element_size(node).height;
    switch (this.gravity) {
      case 'north':   return 0;
      case 'south':   return height - h;
      case 'west': case 'east':
        return height - h/2;
    }
  },
  
  _sized_text: function(size, content) {
    var text = this._text_node(content);
    text.style.fontFamily = this.font;
    text.style.fontSize = (typeof size == 'number') ? size + 'px' : size;
    return text;
  },
  
  _text_node: function(content) {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.appendChild(document.createTextNode(content));
    document.body.appendChild(div);
    return div;
  },
  
  _element_size: function(element) {
    var display = element.style.display;
    return (display && display != 'none')
        ? {width: element.offsetWidth, height: element.offsetHeight}
        : {width: element.clientWidth, height: element.clientHeight};
  },
  
  _offset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return {left: valueL, top: valueT};
  }
});

