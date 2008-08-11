// Makes a small pie graph suitable for display at 200px or even smaller.
//
Bluff.Mini.Pie = new JS.Class(Bluff.Pie, {
  include: Bluff.Mini.Legend,
  
  initialize_ivars: function() {
    this.callSuper();
    
    this.hide_legend = true;
    this.hide_title = true;
    this.hide_line_numbers = true;
    
    this.marker_font_size = 60.0;
    this.legend_font_size = 60.0;
  },
  
  draw: function() {
    this._expand_canvas_for_vertical_legend();
    
    this.callSuper();
    
    this._draw_vertical_legend();
  }
});

