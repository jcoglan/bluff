// Graph with individual horizontal bars instead of vertical bars.

Bluff.SideBar = new JS.Class(Bluff.Base, {
  
  // Spacing factor applied between bars
  bar_spacing: 0.9,
  
  draw: function() {
    this.has_left_labels = true;
    this.callSuper();
    
    if (!this._has_data) return;
    
    this._bars_width       = this._graph_height / this._column_count;
    this._bar_width        = this._bars_width * this.bar_spacing / this._norm_data.length;
    this._d.stroke_opacity = 0.0;
    var height = Bluff.array_new(this._column_count, 0),
        length = Bluff.array_new(this._column_count, this._graph_left),
        padding = (this._bars_width * (1 - this.bar_spacing)) / 2;
    
    Bluff.each(this._norm_data, function(data_row, row_index) {
      var raw_data = this._data[row_index][this.klass.DATA_VALUES_INDEX];
      Bluff.each(data_row[this.klass.DATA_VALUES_INDEX], function(data_point, point_index) {
        
        // Using the original calcs from the stacked bar chart
        // to get the difference between
        // part of the bart chart we wish to stack.
        var temp1      = this._graph_left + (this._graph_width - data_point * this._graph_width - height[point_index]),
            temp2      = this._graph_left + this._graph_width - height[point_index],
            difference = temp2 - temp1,
        
            left_x     = length[point_index] - 1,
            left_y     = this._graph_top + (this._bars_width * point_index) + (this._bar_width * row_index) + padding,
            right_x    = left_x + difference,
            right_y    = left_y + this._bar_width;
        
        height[point_index] += (data_point * this._graph_width);
        
        this._d.stroke = 'transparent';
        this._d.fill = data_row[this.klass.DATA_COLOR_INDEX];
        this._d.rectangle(left_x, left_y, right_x, right_y);
        
        this._draw_tooltip(left_x, left_y,
                           right_x - left_x, right_y - left_y,
                           data_row[this.klass.DATA_LABEL_INDEX],
                           data_row[this.klass.DATA_COLOR_INDEX],
                           raw_data[point_index]);
        
        // Calculate center based on bar_width and current row
        var label_center = this._graph_top + (this._bars_width * point_index + this._bars_width / 2);
        this._draw_label(label_center, point_index);
      }, this)
      
    }, this);
  },
  
  // Instead of base class version, draws vertical background lines and label
  _draw_line_markers: function() {
    
    if (this.hide_line_markers) return;
    
    this._d.stroke_antialias = false;
    
    // Draw horizontal line markers and annotate with numbers
    this._d.stroke_width = 1;
    var number_of_lines = 5;
    
    // TODO Round maximum marker value to a round number like 100, 0.1, 0.5, etc.
    var increment = this._significant(this._spread / number_of_lines),
        line_diff, x, diff, marker_label;
    for (var index = 0; index <= number_of_lines; index++) {
      
      line_diff    = (this._graph_right - this._graph_left) / number_of_lines;
      x            = this._graph_right - (line_diff * index) - 1;
      diff         = index - number_of_lines;
      marker_label = Math.abs(diff) * increment + this.minimum_value;
      
      this._d.stroke = this.marker_color;
      this._d.line(x, this._graph_bottom, x, this._graph_top);
      
      if (!this.hide_line_numbers) {
        this._d.fill      = this.font_color;
        if (this.font) this._d.font = this.font;
        this._d.stroke    = 'transparent';
        this._d.pointsize = this._scale_fontsize(this.marker_font_size);
        this._d.gravity   = 'center';
        // TODO Center text over line
        this._d.annotate_scaled(
                          0, 0, // Width of box to draw text in
                          x, this._graph_bottom + (this.klass.LABEL_MARGIN * 2.0), // Coordinates of text
                          this._label(marker_label), this._scale);
      }
    }
  },
  
  // Draw on the Y axis instead of the X
  _draw_label: function(y_offset, index) {
    if (this.labels[index] && !this._labels_seen[index]) {
      this._d.fill             = this.font_color;
      if (this.font) this._d.font = this.font;
      this._d.stroke           = 'transparent';
      this._d.font_weight      = 'normal';
      this._d.pointsize        = this._scale_fontsize(this.marker_font_size);
      this._d.gravity          = 'east';
      this._d.annotate_scaled(1, 1,
                              this._graph_left - this.klass.LABEL_MARGIN * 2.0, y_offset,
                              this.labels[index], this._scale);
      this._labels_seen[index] = true;
    }
  }
});

