// Makes a small bar graph suitable for display at 200px or even smaller.
//
Bluff.Mini.Bar = new JS.Class(Bluff.Bar, {
  include: Bluff.Mini.Legend,
  
  initialize_ivars: function() {
    this.callSuper();
    
    this.hide_legend = true;
    this.hide_title = true;
    this.hide_line_numbers = true;
    
    this.marker_font_size = 50.0;
    this.minimum_value = 0.0;
    this.maximum_value = 0.0;
    this.legend_font_size = 60.0;
  },
  
  draw: function() {
    this._expand_canvas_for_vertical_legend();
    
    this.callSuper();
    
    this._draw_vertical_legend();
  }
});

