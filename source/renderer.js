Bluff.Renderer = new JS.Class({
  extend: {
    WRAPPER_CLASS:  'bluff-wrapper',
    TEXT_CLASS:     'bluff-text',
    TARGET_CLASS:   'bluff-tooltip-target'
  },

  font:     'Arial, Helvetica, Verdana, sans-serif',
  gravity:  'north',
  
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
    this._remove_node(X);
    return height;
  },
  
  text_width: function(font_size, text) {
    var element = this._sized_text(font_size, text);
    var width = this._element_size(element).width;
    this._remove_node(element);
    return width;
  },
  
  get_type_metrics: function(text) {
    var node = this._sized_text(this.pointsize, text);
    document.body.appendChild(node);
    var size = this._element_size(node);
    this._remove_node(node);
    return size;
  },
  
  clear: function(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
    this._ctx.clearRect(0, 0, width, height);
    var wrapper = this._text_container(), children = wrapper.childNodes, i = children.length;
    wrapper.style.width = width + 'px';
    wrapper.style.height = height + 'px';
    while (i--) {
      if (children[i].tagName.toLowerCase() !== 'canvas')
        this._remove_node(children[i]);
    }
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
    text.style.textAlign = 'center';
    text.style.left = (this._sx * x + this._left_adjustment(text, scaled_width)) + 'px';
    text.style.top = (this._sy * y + this._top_adjustment(text, scaled_height)) + 'px';
  },
  
  tooltip: function(left, top, width, height, name, color, data) {
    if (width < 0) left += width;
    if (height < 0) top += height;
    
    var wrapper = this._canvas.parentNode,
        target = document.createElement('div');
    target.className = this.klass.TARGET_CLASS;
    target.style.position = 'absolute';
    target.style.left = (this._sx * left - 3) + 'px';
    target.style.top = (this._sy * top - 3) + 'px';
    target.style.width = (this._sx * Math.abs(width) + 5) + 'px';
    target.style.height = (this._sy * Math.abs(height) + 5) + 'px';
    target.style.fontSize = 0;
    target.style.overflow = 'hidden';
    
    Bluff.Event.observe(target, 'mouseover', function(node) {
      Bluff.Tooltip.show(name, color, data);
    });
    Bluff.Event.observe(target, 'mouseout', function(node) {
      Bluff.Tooltip.hide();
    });
    
    wrapper.appendChild(target);
  },
  
  circle: function(origin_x, origin_y, perim_x, perim_y, arc_start, arc_end) {
    var radius = Math.sqrt(Math.pow(perim_x - origin_x, 2) + Math.pow(perim_y - origin_y, 2));
    var alpha = 0, beta = 2 * Math.PI; // radians to full circle
    
    this._ctx.fillStyle = this.fill;
    this._ctx.beginPath();
    
    if (arc_start !== undefined && arc_end !== undefined &&
        Math.abs(Math.floor(arc_end - arc_start)) !== 360) {
      alpha = arc_start * Math.PI/180;
      beta  = arc_end   * Math.PI/180;
      
      this._ctx.moveTo(this._sx * (origin_x + radius * Math.cos(beta)), this._sy * (origin_y + radius * Math.sin(beta)));
      this._ctx.lineTo(this._sx * origin_x, this._sy * origin_y);
      this._ctx.lineTo(this._sx * (origin_x + radius * Math.cos(alpha)), this._sy * (origin_y + radius * Math.sin(alpha)));
    }
    this._ctx.arc(this._sx * origin_x, this._sy * origin_y, this._sx * radius, alpha, beta, false); // draw it clockwise
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
  
  polyline: function(points) {
    this._ctx.fillStyle = this.fill;
    this._ctx.globalAlpha = this.fill_opacity || 1;
    try { this._ctx.strokeStyle = this.stroke; } catch (e) {}
    var x = points.shift(), y = points.shift();
    this._ctx.beginPath();
    this._ctx.moveTo(this._sx * x, this._sy * y);
    while (points.length > 0) {
      x = points.shift(); y = points.shift();
      this._ctx.lineTo(this._sx * x, this._sy * y);
    }
    this._ctx.fill();
  },
  
  rectangle: function(ax, ay, bx, by) {
    var temp;
    if (ax > bx) { temp = ax; ax = bx; bx = temp; }
    if (ay > by) { temp = ay; ay = by; by = temp; }
    try {
      this._ctx.fillStyle = this.fill;
      this._ctx.fillRect(this._sx * ax, this._sy * ay, this._sx * (bx-ax), this._sy * (by-ay));
    } catch (e) {}
    try {
      this._ctx.strokeStyle = this.stroke;
      if (this.stroke !== 'transparent')
        this._ctx.strokeRect(this._sx * ax, this._sy * ay, this._sx * (bx-ax), this._sy * (by-ay));
    } catch (e) {}
  },
  
  _left_adjustment: function(node, width) {
    var w = this._element_size(node).width;
    switch (this.gravity) {
      case 'west':    return 0;
      case 'east':    return width - w;
      case 'north': case 'south': case 'center':
        return (width - w) / 2;
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
  
  _text_container: function() {
    var wrapper = this._canvas.parentNode;
    if (wrapper.className === this.klass.WRAPPER_CLASS) return wrapper;
    wrapper = document.createElement('div');
    wrapper.className = this.klass.WRAPPER_CLASS;
    
    wrapper.style.position = 'relative';
    wrapper.style.border = 'none';
    wrapper.style.padding = '0 0 0 0';
    
    this._canvas.parentNode.insertBefore(wrapper, this._canvas);
    wrapper.appendChild(this._canvas);
    return wrapper;
  },
  
  _sized_text: function(size, content) {
    var text = this._text_node(content);
    text.style.fontFamily = this.font;
    text.style.fontSize = (typeof size === 'number') ? size + 'px' : size;
    return text;
  },
  
  _text_node: function(content) {
    var div = document.createElement('div');
    div.className = this.klass.TEXT_CLASS;
    div.style.position = 'absolute';
    div.appendChild(document.createTextNode(content));
    this._text_container().appendChild(div);
    return div;
  },
  
  _remove_node: function(node) {
    node.parentNode.removeChild(node);
    if (node.className === this.klass.TARGET_CLASS)
      Bluff.Event.stopObserving(node);
  },
  
  _element_size: function(element) {
    var display = element.style.display;
    return (display && display !== 'none')
        ? {width: element.offsetWidth, height: element.offsetHeight}
        : {width: element.clientWidth, height: element.clientHeight};
  }
});

