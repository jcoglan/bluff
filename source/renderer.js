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
  
  get_type_metrics: function(text) {
    var node = this._sized_text(this.pointsize, text);
    var size = this._element_size(node);
    document.body.removeChild(node);
    return size;
  },
  
  clear: function(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
    this._ctx.clearRect(0, 0, width, height);
  },
  
  push: function() {
    this._ctx.save();
  },
  
  pop: function() {
    this._ctx.restore();
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
    text.style.left = (pos.left + this._sx * x + this._left_adjustment(text, width)) + 'px';
    text.style.top = (pos.top + this._sy * y + this._top_adjustment(text, height)) + 'px';
    text.style.width = scaled_width + 'px';
    text.style.height = scaled_height + 'px';
  },
  
  circle: function(origin_x, origin_y, perim_x, perim_y, arc_start, arc_end) {
    var radius = Math.sqrt(Math.pow(perim_x - origin_x, 2) + Math.pow(perim_y - origin_y, 2));
    this._ctx.fillStyle = this.fill;
    this._ctx.beginPath();
    var alpha = (arc_start || 0) * Math.PI/180;
    var beta = (arc_end || 360) * Math.PI/180;
    if (arc_start !== undefined && arc_end !== undefined) {
      this._ctx.moveTo(this._sx * (origin_x + radius * Math.cos(beta)), this._sy * (origin_y + radius * Math.sin(beta)));
      this._ctx.lineTo(this._sx * origin_x, this._sy * origin_y);
      this._ctx.lineTo(this._sx * (origin_x + radius * Math.cos(alpha)), this._sy * (origin_y + radius * Math.sin(alpha)));
    }
    this._ctx.arc(this._sx * origin_x, this._sy * origin_y, this._sx * radius, alpha, beta, false);
    this._ctx.fill();
  },
  
  line: function(sx, sy, ex, ey) {
    this._ctx.strokeStyle = this.stroke;
    this._ctx.lineWidth = this.stroke_width;
    this._ctx.beginPath();
    this._ctx.moveTo(this._sx * sx, this._sy * sy);
    this._ctx.lineTo(this._sx * ex, this._sy * ey);
    this._ctx.stroke();
  },
  
  rectangle: function(ax, ay, bx, by) {
    this._ctx.fillStyle = this.fill;
    this._ctx.strokeStyle = this.stroke;
    this._ctx.strokeRect(this._sx * ax, this._sy * ay, this._sx * (bx-ax), this._sy * (by-ay));
    this._ctx.fillRect(this._sx * ax, this._sy * ay, this._sx * (bx-ax), this._sy * (by-ay));
  },
  
  _text_align: function() {
    switch (this.gravity) {
      case 'north': case 'south': case 'center':
        return 'center';
      case 'west':
        return 'left';
      case 'east':
        return 'right';
      default:
        return 'center';
    }
  },
  
  _left_adjustment: function(node, width) {
    var w = this._element_size(node).width;
    switch (this.gravity) {
      case 'west': case 'east': return 0;
      case 'north': case 'south': case 'center':
        return (width < w) ? (width - w) / 2 : 0;
    }
  },
  
  _top_adjustment: function(node, height) {
    var h = this._element_size(node).height;
    switch (this.gravity) {
      case 'north':   return 0;
      case 'south':   return height - h;
      case 'west': case 'east': case 'center':
        return (height - h) / 2;
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

