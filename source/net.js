// Experimental!!! See also the Spider graph.
Bluff.Net = new JS.Class(Bluff.Base, {
  
  // Hide parts of the graph to fit more datapoints, or for a different appearance.
  hide_dots: null,
  
  initialize: function() {
    this.callSuper();
    
    this.hide_dots = false;
  },
  
  draw: function() {
    
    this.callSuper();
    
    if (!this._has_data) return;
    
    this._radius = this._graph_height / 2.0;
    this._center_x = this._graph_left + (this._graph_width / 2.0);
    this._center_y = this._graph_top + (this._graph_height / 2.0) - 10; // Move graph up a bit
    
    this._x_increment = this._graph_width / (this._column_count - 1);
    var circle_radius = this._clip_value_if_greater_than(this._columns / (this._norm_data[0][this.klass.DATA_VALUES_INDEX].length * 2.5), 7.0);
    
    this._d.stroke_opacity = 1.0;
    this._d.stroke_width = this._clip_value_if_greater_than(this._columns / (this._norm_data[0][this.klass.DATA_VALUES_INDEX].length * 4), 3.0);
    
    var level;
    
    if (this._norm_baseline !== undefined) {
      level = this._graph_top + (this._graph_height - this._norm_baseline * this._graph_height);
      this._d.push();
      this._d.stroke_color  = this.baseline_color;
      this._d.fill_opacity = 0.0;
      // this._d.stroke_dasharray(10, 20);
      this._d.stroke_width = 5;
      this._d.line(this._graph_left, level, this._graph_left + this._graph_width, level);
      this._d.pop();
    }
    
    Bluff.each(this._norm_data, function(data_row) {
      var prev_x = null, prev_y = null;
      
      Bluff.each(data_row[this.klass.DATA_VALUES_INDEX], function(data_point, index) {
        if (data_point === undefined) return;
        
        var rad_pos = index * Math.PI * 2 / this._column_count,
            point_distance = data_point * this._radius,
            start_x = this._center_x + Math.sin(rad_pos) * point_distance,
            start_y = this._center_y - Math.cos(rad_pos) * point_distance,
            
            next_index = (index + 1 < data_row[this.klass.DATA_VALUES_INDEX].length) ? index + 1 : 0,
            
            next_rad_pos = next_index * Math.PI * 2 / this._column_count,
            next_point_distance = data_row[this.klass.DATA_VALUES_INDEX][next_index] * this._radius,
            end_x = this._center_x + Math.sin(next_rad_pos) * next_point_distance,
            end_y = this._center_y - Math.cos(next_rad_pos) * next_point_distance;
        
        this._d.stroke = data_row[this.klass.DATA_COLOR_INDEX];
        this._d.fill = data_row[this.klass.DATA_COLOR_INDEX];
        this._d.line(start_x, start_y, end_x, end_y);
        
        if (!this.hide_dots) this._d.circle(start_x, start_y, start_x - circle_radius, start_y);
      }, this);
    
    }, this);
  },
  
  // the lines connecting in the center, with the first line vertical
  _draw_line_markers: function() {
    if (this.hide_line_markers) return;
    
    // have to do this here (AGAIN)... see draw() in this class
    // because this funtion is called before the @radius, @center_x and @center_y are set
    this._radius = this._graph_height / 2.0;
    this._center_x = this._graph_left + (this._graph_width / 2.0);
    this._center_y = this._graph_top + (this._graph_height / 2.0) - 10; // Move graph up a bit
    
    var rad_pos, marker_label;
    
    for (var index = 0, n = this._column_count; index < n; index++) {
      rad_pos = index * Math.PI * 2 / this._column_count;
      
      // Draw horizontal line markers and annotate with numbers
      this._d.stroke = this.marker_color;
      this._d.stroke_width = 1;
      
      this._d.line(this._center_x, this._center_y, this._center_x + Math.sin(rad_pos) * this._radius, this._center_y - Math.cos(rad_pos) * this._radius);
      
      marker_label = labels[index] ? labels[index] : '000';
      
      this._draw_label(this._center_x, this._center_y, rad_pos * 360 / (2 * Math.PI), this._radius, marker_label);
    }
  },
  
  _draw_label: function(center_x, center_y, angle, radius, amount) {
    var r_offset = 1.1,
        x_offset = center_x, // + 15 // The label points need to be tweaked slightly
        y_offset = center_y, // + 0  // This one doesn't though
        rad_pos = angle * Math.PI / 180,
        x = x_offset + (radius * r_offset * Math.sin(rad_pos)),
        y = y_offset - (radius * r_offset * Math.cos(rad_pos));
    
    // Draw label
    this._d.fill = this.marker_color;
    if (this.font) this._d.font = this.font;
    this._d.pointsize = this._scale_fontsize(20);
    this._d.stroke = 'transparent';
    this._d.font_weight = 'bold';
    var s = rad_pos / (2*Math.PI);
    switch (true) {
      case s >= 0.96 || s < 0.04  :   this._d.gravity = 'south';      break;
      case s >= 0.04 || s < 0.21  :   this._d.gravity = 'west';       break;  // southwest
      case s >= 0.21 || s < 0.29  :   this._d.gravity = 'west';       break;
      case s >= 0.29 || s < 0.46  :   this._d.gravity = 'west';       break;  // northwest
      case s >= 0.46 || s < 0.54  :   this._d.gravity = 'north';      break;
      case s >= 0.54 || s < 0.71  :   this._d.gravity = 'east';       break;  // northeast
      case s >= 0.71 || s < 0.79  :   this._d.gravity = 'east';       break;
      case s >= 0.79 || s < 0.96  :   this._d.gravity = 'east';       break;  // southest
    }
    this._d.annotate_scaled(0, 0, x, y, amount, this._scale);
  }
});

