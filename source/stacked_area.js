Bluff.StackedArea = new JS.Class(Bluff.Base, {
  include: Bluff.Base.StackedMixin,
  last_series_goes_on_bottom: null,
  
  draw: function() {
    this._get_maximum_by_stack();
    this.callSuper();
    
    if (!this._has_data) return;
    
    this._x_increment = this._graph_width / (this._column_count - 1);
    this._d.stroke = 'transparent';
    
    var height = [], i = this._column_count;
    while (i--) height.push(0);
    
    var data_points = null;
    var iterator = this.last_series_goes_on_bottom ? 'reverse_each' : 'each';
    Bluff[iterator](this._norm_data, function(data_row) {
      var prev_data_points = data_points;
      data_points = [];
      
      Bluff.each(data_row[this.klass.DATA_VALUES_INDEX], function(data_point, index) {
        // Use incremented x and scaled y
        var new_x = this._graph_left + (this._x_increment * index);
        var new_y = this._graph_top + (this._graph_height - data_point * this._graph_height - height[index]);
        
        height[index] += (data_point * this._graph_height);
        
        data_points.push(new_x);
        data_points.push(new_y);
        
        this._draw_label(new_x, index);
      }, this);
      
      var poly_points, i, n;
      
      if (prev_data_points) {
        poly_points = Bluff.array(data_points);
        for (i = prev_data_points.length/2 - 1; i >= 0; i--) {
          poly_points.push(prev_data_points[2*i]);
          poly_points.push(prev_data_points[2*i+1]);
        }
        poly_points.push(data_points[0]);
        poly_points.push(data_points[1]);
      } else {
        poly_points = Bluff.array(data_points);
        poly_points.push(this._graph_right);
        poly_points.push(this._graph_bottom - 1);
        poly_points.push(this._graph_left);
        poly_points.push(this._graph_bottom - 1);
        poly_points.push(data_points[0]);
        poly_points.push(data_points[1]);
      }
      this._d.fill = data_row[this.klass.DATA_COLOR_INDEX];
      this._d.polyline(poly_points);
    }, this);
  }
});

