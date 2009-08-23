// Graph with dots and labels along a vertical access
// see: 'Creating More Effective Graphs' by Robbins

Bluff.Dot = new JS.Class(Bluff.Base, {
  
  draw: function() {
    this.has_left_labels = true;
    this.callSuper();
    
    if (!this._has_data) return;
    
    // Setup spacing.
    //
    var spacing_factor = 1.0;
    
    this._items_width = this._graph_height / this._column_count;
    this._item_width = this._items_width * spacing_factor / this._norm_data.length;
    this._d.stroke_opacity = 0.0;
    var height = Bluff.array_new(this._column_count, 0),
        length = Bluff.array_new(this._column_count, this._graph_left),
        padding = (this._items_width * (1 - spacing_factor)) / 2;
    
    Bluff.each(this._norm_data, function(data_row, row_index) {
      Bluff.each(data_row[this.klass.DATA_VALUES_INDEX], function(data_point, point_index) {
        
        var x_pos = this._graph_left + (data_point * this._graph_width) - Math.round(this._item_width/6.0);
        var y_pos = this._graph_top + (this._items_width * point_index) + padding + Math.round(this._item_width/2.0);
        
        if (row_index === 0) {
          this._d.stroke = this.marker_color;
          this._d.stroke_width = 1.0;
          this._d.opacity = 0.1;
          this._d.line(this._graph_left, y_pos, this._graph_left + this._graph_width, y_pos);
        }
        
        this._d.fill = data_row[this.klass.DATA_COLOR_INDEX];
        this._d.stroke = 'transparent';
        this._d.circle(x_pos, y_pos, x_pos + Math.round(this._item_width/3.0), y_pos);
        
        // Calculate center based on item_width and current row
        var label_center = this._graph_top + (this._items_width * point_index + this._items_width / 2) + padding;
        this._draw_label(label_center, point_index);
      }, this);
      
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
    var increment = this._significant(this.maximum_value / number_of_lines);
    for (var index = 0; index <= number_of_lines; index++) {
      
      var line_diff    = (this._graph_right - this._graph_left) / number_of_lines,
          x            = this._graph_right - (line_diff * index) - 1,
          diff         = index - number_of_lines,
          marker_label = Math.abs(diff) * increment;
      
      this._d.stroke = this.marker_color;
      this._d.line(x, this._graph_bottom, x, this._graph_bottom + 0.5 * this.klass.LABEL_MARGIN);
      
      if (!this.hide_line_numbers) {
        this._d.fill      = this.font_color;
        if (this.font) this._d.font = this.font;
        this._d.stroke    = 'transparent';
        this._d.pointsize = this._scale_fontsize(this.marker_font_size);
        this._d.gravity   = 'center';
        // TODO Center text over line
        this._d.annotate_scaled(0, 0, // Width of box to draw text in
                                x, this._graph_bottom + (this.klass.LABEL_MARGIN * 2.0), // Coordinates of text
                                marker_label, this._scale);
      }
      this._d.stroke_antialias = true;
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

