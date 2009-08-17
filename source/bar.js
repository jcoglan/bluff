Bluff.Bar = new JS.Class(Bluff.Base, {
  
  draw: function() {
    // Labels will be centered over the left of the bar if
    // there are more labels than columns. This is basically the same 
    // as where it would be for a line graph.
    var labels = 0, key;
    for (key in this.labels) labels += 1;
    this.center_labels_over_point = (labels > this._column_count);
    
    this.callSuper();
    if (!this._has_data) return;
    
    this._draw_bars();
  },
  
  _draw_bars: function() {
    // Setup spacing.
    //
    // Columns sit side-by-side.
    var spacing_factor = 0.9; // space between the bars
    this._bar_width = this._graph_width / (this._column_count * this._data.length);
    var padding = (this._bar_width * (1 - spacing_factor)) / 2;
    
    this._d.stroke_opacity = 0.0;
    
    // Setup the BarConversion Object
    var conversion = new Bluff.BarConversion();
    conversion.graph_height = this._graph_height;
    conversion.graph_top = this._graph_top;
    
    // Set up the right mode [1,2,3] see BarConversion for further explanation
    if (this.minimum_value >= 0) {
      // all bars go from zero to positiv
      conversion.mode = 1;
    } else {
      // all bars go from 0 to negativ
      if (this.maximum_value <= 0) {
        conversion.mode = 2;
      } else {
        // bars either go from zero to negativ or to positiv
        conversion.mode = 3;
        conversion.spread = this._spread;
        conversion.minimum_value = this.minimum_value;
        conversion.zero = -this.minimum_value/this._spread;
      }
    }
    
    // iterate over all normalised data
    Bluff.each(this._norm_data, function(data_row, row_index) {
      var raw_data = this._data[row_index][this.klass.DATA_VALUES_INDEX];
      
      Bluff.each(data_row[this.klass.DATA_VALUES_INDEX], function(data_point, point_index) {
        // Use incremented x and scaled y
        // x
        var left_x = this._graph_left + (this._bar_width * (row_index + point_index + ((this._data.length - 1) * point_index))) + padding;
        var right_x = left_x + this._bar_width * spacing_factor;
        // y
        var conv = [];
        conversion.getLeftYRightYscaled(data_point, conv);
        
        // create new bar
        this._d.fill = data_row[this.klass.DATA_COLOR_INDEX];
        this._d.stroke = 'transparent';
        this._d.rectangle(left_x, conv[0], right_x, conv[1]);
        
        // create tooltip target
        this._draw_tooltip(left_x, conv[0],
                           right_x - left_x, conv[1] - conv[0],
                           data_row[this.klass.DATA_LABEL_INDEX],
                           data_row[this.klass.DATA_COLOR_INDEX],
                           raw_data[point_index]);
        
        // Calculate center based on bar_width and current row
        var label_center = this._graph_left + 
                          (this._data.length * this._bar_width * point_index) + 
                          (this._data.length * this._bar_width / 2.0) +
                          padding;
        // Subtract half a bar width to center left if requested
        this._draw_label(label_center - (this.center_labels_over_point ? this._bar_width / 2.0 : 0.0), point_index);
      }, this);
    
    }, this);
    
    // Draw the last label if requested
    if (this.center_labels_over_point)
      this._draw_label(this._graph_right, this._column_count);
  }
});

