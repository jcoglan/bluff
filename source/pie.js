// Here's how to make a Pie graph:
//
//   g = new Bluff.Pie('canvasId');
//   g.title = "Visual Pie Graph Test";
//   g.data('Fries', 20);
//   g.data('Hamburgers', 50);
//   g.draw();
//
// To control where the pie chart starts creating slices, use #zero_degree.

Bluff.Pie = new JS.Class(Bluff.Base, {
  extend: {
    TEXT_OFFSET_PERCENTAGE: 0.08
  },
  
  // Can be used to make the pie start cutting slices at the top (-90.0)
  // or at another angle. Default is 0.0, which starts at 3 o'clock.
  zero_degreee: null,
  
  initialize_ivars: function() {
    this.callSuper();
    this.zero_degree = 0.0;
  },
  
  draw: function() {
    this.hide_line_markers = true;
    
    this.callSuper();
    
    if (!this._has_data) return;
    
    var diameter = this._graph_height,
        radius = (Math.min(this._graph_width, this._graph_height) / 2) * 0.8,
        top_x = this._graph_left + (this._graph_width - diameter) / 2,
        center_x = this._graph_left + (this._graph_width / 2),
        center_y = this._graph_top + (this._graph_height / 2) - 10, // Move graph up a bit
        total_sum = this._sums_for_pie(),
        prev_degrees = this.zero_degree,
        index = this.klass.DATA_VALUES_INDEX;
    
    // Use full data since we can easily calculate percentages
    if (this.sort) this._data.sort(function(a,b) { return a[index][0] - b[index][0]; });
    Bluff.each(this._data, function(data_row, i) {
      if (data_row[this.klass.DATA_VALUES_INDEX][0] > 0) {
        this._d.fill = data_row[this.klass.DATA_COLOR_INDEX];
        
        var current_degrees = (data_row[this.klass.DATA_VALUES_INDEX][0] / total_sum) * 360;
        
        // Gruff uses ellipse() here, but canvas doesn't seem to support it.
        // circle() is fine for our purposes here.
        this._d.circle(center_x, center_y,
                    center_x + radius, center_y,
                    prev_degrees, prev_degrees + current_degrees + 0.5); // <= +0.5 'fudge factor' gets rid of the ugly gaps
        
        var half_angle = prev_degrees + ((prev_degrees + current_degrees) - prev_degrees) / 2;
        
        var label_string = this._label(data_row[this.klass.DATA_VALUES_INDEX][0]);
        this._draw_label(center_x, center_y, half_angle,
                          radius + (radius * this.klass.TEXT_OFFSET_PERCENTAGE),
                          label_string);
        
        prev_degrees += current_degrees;
      }
    }, this);
    
    // TODO debug a circle where the text is drawn...
  },
  
  // Labels are drawn around a slightly wider ellipse to give room for 
  // labels on the left and right.
  _draw_label: function(center_x, center_y, angle, radius, amount) {
    // TODO Don't use so many hard-coded numbers
    var r_offset = 20.0,      // The distance out from the center of the pie to get point
        x_offset = center_x,  // + 15.0 # The label points need to be tweaked slightly
        y_offset = center_y,  // This one doesn't though
        radius_offset = radius + r_offset,
        ellipse_factor = radius_offset * 0.15,
        x = x_offset + ((radius_offset + ellipse_factor) * Math.cos(angle * Math.PI/180)),
        y = y_offset + (radius_offset * Math.sin(angle * Math.PI/180));
    
    // Draw label
    this._d.fill = this.font_color;
    if (this.font) this._d.font = this.font;
    this._d.pointsize = this._scale_fontsize(this.marker_font_size);
    this._d.font_weight = 'bold';
    this._d.gravity = 'center';
    this._d.annotate_scaled(0,0, x,y, amount, this._scale);
  },
  
  _sums_for_pie: function() {
    var total_sum = 0;
    Bluff.each(this._data, function(data_row) {
      total_sum += data_row[this.klass.DATA_VALUES_INDEX][0];
    }, this);
    return total_sum;
  }
});

