Bluff.Area = new JS.Class(Bluff.Base, {
  
  draw: function() {
    this.callSuper();
    
    if (!this._has_data) return;
    
    this._x_increment = this._graph_width / (this._column_count - 1);
    this._d.stroke = 'transparent';
    
    Bluff.each(this._norm_data, function(data_row) {
      var poly_points = [],
          prev_x = 0.0,
          prev_y = 0.0;
      
      Bluff.each(data_row[this.klass.DATA_VALUES_INDEX], function(data_point, index) {
        // Use incremented x and scaled y
        var new_x = this._graph_left + (this._x_increment * index);
        var new_y = this._graph_top + (this._graph_height - data_point * this._graph_height);
        
        if (prev_x > 0 && prev_y > 0) {
          poly_points.push(new_x);
          poly_points.push(new_y);
          
          // this._d.polyline(prev_x, prev_y, new_x, new_y);
        } else {
          poly_points.push(this._graph_left);
          poly_points.push(this._graph_bottom - 1);
          poly_points.push(new_x);
          poly_points.push(new_y);
          
          // this._d.polyline(this._graph_left, this._graph_bottom, new_x, new_y);
        }
        
        this._draw_label(new_x, index);
        
        prev_x = new_x;
        prev_y = new_y;
      }, this);
      
      // Add closing points, draw polygon
      poly_points.push(this._graph_right);
      poly_points.push(this._graph_bottom - 1);
      poly_points.push(this._graph_left);
      poly_points.push(this._graph_bottom - 1);
      
      this._d.fill = data_row[this.klass.DATA_COLOR_INDEX];
      this._d.polyline(poly_points);
      
    }, this);
  }
});

