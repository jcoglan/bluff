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
    TEXT_OFFSET_PERCENTAGE: 0.15
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
        
        // TODO
        
        prev_degrees += current_degrees;
      }
    }, this);
    
    // TODO debug a circle where the text is drawn...
  },
  
  _sums_for_pie: function() {
    var total_sum = 0;
    Bluff.each(this._data, function(data_row) {
      total_sum += data_row[this.klass.DATA_VALUES_INDEX][0];
    }, this);
    return total_sum;
  }
});

