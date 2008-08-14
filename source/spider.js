// Experimental!!! See also the Net graph.
//
// Submitted by Kevin Clark http://glu.ttono.us/
Bluff.Spider = new JS.Class(Bluff.Base, {
  
  // Hide all text
  hide_text: null,
  hide_axes: null,
  transparent_background: null,
  
  initialize: function(renderer, max_value, target_width) {
    this.callSuper(renderer, target_width);
    this._max_value = max_value;
    this.hide_legend = true;
  },
  
  draw: function() {
    this.hide_line_markers = true;
    
    this.callSuper();

    if (!this._has_data) return;
    
    // Setup basic positioning
    var diameter = this._graph_height,
        radius = this._graph_height / 2.0,
        top_x = this._graph_left + (this._graph_width - diameter) / 2.0,
        center_x = this._graph_left + (this._graph_width / 2.0),
        center_y = this._graph_top + (this._graph_height / 2.0) - 25; // Move graph up a bit
    
    this._unit_length = radius / this._max_value;
    
    var total_sum = this._sums_for_spider(),
        prev_degrees = 0.0,
        additive_angle = (2 * Math.PI) / this._data.length,
        
        current_angle = 0.0;
    
    // Draw axes
    if (!this.hide_axes) this._draw_axes(center_x, center_y, radius, additive_angle);
    
    // Draw polygon
    this._draw_polygon(center_x, center_y, additive_angle);
  },
  
  _normalize_points: function(value) {
    return value * this._unit_length;
  },
  
  _draw_label: function(center_x, center_y, angle, radius, amount) {
    var r_offset = 50,            // The distance out from the center of the pie to get point
        x_offset = center_x,      // The label points need to be tweaked slightly
        y_offset = center_y + 0,  // This one doesn't though
        x = x_offset + ((radius + r_offset) * Math.cos(angle)),
        y = y_offset + ((radius + r_offset) * Math.sin(angle));
    
    // Draw label
    this._d.fill = this.marker_color;
    if (this.font) this._d.font = this.font;
    this._d.pointsize = this._scale_fontsize(this.legend_font_size);
    this._d.stroke = 'transparent';
    this._d.font_weight = 'bold';
    this._d.gravity = 'center';
    this._d.annotate_scaled(
                      0, 0,
                      x, y, 
                      amount, this._scale);
  },
  
  _draw_axes: function(center_x, center_y, radius, additive_angle, line_color) {
    if (this.hide_axes) return;
    
    var current_angle = 0.0;
    
    Bluff.each(this._data, function(data_row) {
      this._d.stroke = line_color || data_row[this.klass.DATA_COLOR_INDEX];
      this._d.stroke_width = 5.0;
      
      var x_offset = radius * Math.cos(current_angle);
      var y_offset = radius * Math.sin(current_angle);
      
      this._d.line(center_x, center_y,
              center_x + x_offset,
              center_y + y_offset);
      
      if (!this.hide_text) this._draw_label(center_x, center_y, current_angle, radius, data_row[this.klass.DATA_LABEL_INDEX]);
      
      current_angle += additive_angle;
    }, this);
  },
  
  _draw_polygon: function(center_x, center_y, additive_angle, color) {
    var points = [],
        current_angle = 0.0;
    Bluff.each(this._data, function(data_row) {
      points.push(center_x + this._normalize_points(data_row[this.klass.DATA_VALUES_INDEX][0]) * Math.cos(current_angle));
      points.push(center_y + this._normalize_points(data_row[this.klass.DATA_VALUES_INDEX][0]) * Math.sin(current_angle));
      current_angle += additive_angle;
    }, this);
    
    this._d.stroke_width = 1.0;
    this._d.stroke = color || this.marker_color;
    this._d.fill = color || this.marker_color;
    this._d.fill_opacity = 0.4;
    this._d.polyline(points);
  },
  
  _sums_for_spider: function() {
    var sum = 0.0;
    Bluff.each(this._data, function(data_row) {
      sum += data_row[this.klass.DATA_VALUES_INDEX][0];
    }, this);
    return sum;
  }
});

