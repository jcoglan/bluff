Bluff = {
  // This is the version of Bluff you are using.
  VERSION: '0.3.2',
  
  array: function(list) {
    var ary = [], i = list.length;
    while (i--) ary[i] = list[i];
    return ary;
  },
  
  each: function(list, block, context) {
    for (var i = 0, n = list.length; i < n; i++) {
      block.call(context || null, list[i], i);
    }
  }
};

Bluff.Base = new JS.Class({
  extend: {
    // Draw extra lines showing where the margins and text centers are
    DEBUG: false,
    
    // Used for navigating the array of data to plot
    DATA_LABEL_INDEX: 0,
    DATA_VALUES_INDEX: 1,
    DATA_COLOR_INDEX: 2,

    // Space around text elements. Mostly used for vertical spacing
    LEGEND_MARGIN: 10,
    TITLE_MARGIN: 10,
    LABEL_MARGIN: 10,

    DEFAULT_TARGET_WIDTH:  800
  },
  
  // Blank space above the graph
  top_margin: null,

  // Blank space below the graph
  bottom_margin: null,

  // Blank space to the right of the graph
  right_margin: null,

  // Blank space to the left of the graph
  left_margin: null,

  // A hash of names for the individual columns, where the key is the array
  // index for the column this label represents.
  //
  // Not all columns need to be named.
  //
  // Example: {0: 2005, 3: 2006, 5: 2007, 7: 2008}
  labels: null,

  // Used internally for spacing.
  //
  // By default, labels are centered over the point they represent.
  center_labels_over_point: null,

  // Used internally for horizontal graph types.
  has_left_labels: null,

  // A label for the bottom of the graph
  x_axis_label: null,

  // A label for the left side of the graph
  y_axis_label: null,

  // x_axis_increment: null,

  // Manually set increment of the horizontal marking lines
  y_axis_increment: null,

  // Get or set the list of colors that will be used to draw the bars or lines.
  colors: null,

  // The large title of the graph displayed at the top
  title: null,

  // Font used for titles, labels, etc.
  font: null,

  font_color: null,

  // Prevent drawing of line markers
  hide_line_markers: null,

  // Prevent drawing of the legend
  hide_legend: null,

  // Prevent drawing of the title
  hide_title: null,

  // Prevent drawing of line numbers
  hide_line_numbers: null,

  // Message shown when there is no data. Fits up to 20 characters. Defaults
  // to "No Data."
  no_data_message: null,

  // The font size of the large title at the top of the graph
  title_font_size: null,

  // Optionally set the size of the font. Based on an 800x600px graph.
  // Default is 20.
  //
  // Will be scaled down if graph is smaller than 800px wide.
  legend_font_size: null,

  // The font size of the labels around the graph
  marker_font_size: null,

  // The color of the auxiliary lines
  marker_color: null,

  // The number of horizontal lines shown for reference
  marker_count: null,

  // You can manually set a minimum value instead of having the values
  // guessed for you.
  //
  // Set it after you have given all your data to the graph object.
  minimum_value: null,

  // You can manually set a maximum value, such as a percentage-based graph
  // that always goes to 100.
  //
  // If you use this, you must set it after you have given all your data to
  // the graph object.
  maximum_value: null,

  // Set to false if you don't want the data to be sorted with largest avg
  // values at the back.
  sort: null,

  // Experimental
  additional_line_values: null,

  // Experimental
  stacked: null,

  // Optionally set the size of the colored box by each item in the legend.
  // Default is 20.0
  //
  // Will be scaled down if graph is smaller than 800px wide.
  legend_box_size: null,
  
  // If one numerical argument is given, the graph is drawn at 4/3 ratio
  // according to the given width (800 results in 800x600, 400 gives 400x300,
  // etc.).
  //
  // Or, send a geometry string for other ratios ('800x400', '400x225').
  initialize: function(renderer, target_width) {
    this._d = new Bluff.Renderer(renderer);
    target_width = target_width || this.klass.DEFAULT_TARGET_WIDTH;
    
    this.top_margin = this.bottom_margin =
    this.left_margin = this.right_margin = 20;
    
    var geo;
    
    if (typeof target_width != 'number') {
      geo = target_width.split('x');
      this._columns = parseFloat(geo[0]);
      this._rows = parseFloat(geo[1]);
    } else {
      this._columns = parseFloat(target_width);
      this._rows = this._columns * 0.75;
    }
    
    this.initialize_ivars();
    
    this._reset_themes();
    this.theme_keynote();
  },
  
  // Set instance variables for this object.
  //
  // Subclasses can override this, call super, then set values separately.
  //
  // This makes it possible to set defaults in a subclass but still allow
  // developers to change this values in their program.
  initialize_ivars: function() {
    // Internal for calculations
    this._raw_columns = 800;
    this._raw_rows = 800 * (this._rows/this._columns);
    this._column_count = 0;
    this.marker_count = null;
    this.maximum_value = this.minimum_value = null;
    this._has_data = false;
    this._data = [];
    this.labels = {};
    this._labels_seen = {};
    this.sort = true;
    this.title = null;

    this._scale = this._columns / this._raw_columns;

    this.marker_font_size = 21.0;
    this.legend_font_size = 20.0;
    this.title_font_size = 36.0;
    
    this.legend_box_size = 20.0;

    this.no_data_message = "No Data";

    this.hide_line_markers = this.hide_legend = this.hide_title = this.hide_line_numbers = false;
    this.center_labels_over_point = true;
    this.has_left_labels = false;

    this.additional_line_values = [];
    this._additional_line_colors = [];
    this._theme_options = {};
    
    this.x_axis_label = this.y_axis_label = null;
    this.y_axis_increment = null;
    this.stacked = null;
    this._norm_data = null;
  },
  
  // Sets the top, bottom, left and right margins to +margin+.
  set_margins: function(margin) {
    this.top_margin = this.left_margin = this.right_margin = this.bottom_margin = margin;
  },

  // Sets the font for graph text to the font at +font_path+.
  set_font: function(font_path) {
    this.font = font_path;
    this._d.font = this.font;
  },

  // Add a color to the list of available colors for lines.
  //
  // Example:
  //  add_color('#c0e9d3')
  add_color: function(colorname) {
    this.colors.push(colorname);
  },

  // Replace the entire color list with a new array of colors. You need to
  // have one more color than the number of datasets you intend to draw. Also
  // aliased as the colors= setter method.
  //
  // Example:
  //  replace_colors ['#cc99cc', '#d9e043', '#34d8a2']
  replace_colors: function(color_list) {
    this.colors = color_list || [];
  },

  // You can set a theme manually. Assign a hash to this method before you
  // send your data.
  //
  //  graph.set_theme({
  //    colors: ['orange', 'purple', 'green', 'white', 'red'],
  //    marker_color: 'blue',
  //    background_colors: ['black', 'grey']
  //  })
  //
  // background_image: 'squirrel.png' is also possible.
  //
  // (Or hopefully something better looking than that.)
  //
  set_theme: function(options) {
    this._reset_themes()
    
    this._theme_options = {
      colors: ['black', 'white'],
      additional_line_colors: [],
      marker_color: 'white',
      font_color: 'black',
      background_colors: null,
      background_image: null
    };
    for (var key in options) this._theme_options[key] = options[key];

    this.colors = this._theme_options.colors;
    this.marker_color = this._theme_options.marker_color;
    this.font_color = this._theme_options.font_color || this.marker_color;
    this._additional_line_colors = this._theme_options.additional_line_colors;
    
    this._render_background();
  },

  // A color scheme similar to the popular presentation software.
  theme_keynote: function() {
    // Colors
    this._blue = '#6886B4';
    this._yellow = '#FDD84E';
    this._green = '#72AE6E';
    this._red = '#D1695E';
    this._purple = '#8A6EAF';
    this._orange = '#EFAA43';
    this._white = 'white';
    this.colors = [this._yellow, this._blue, this._green, this._red, this._purple, this._orange, this._white];

    this.set_theme({
      colors: this.colors,
      marker_color: 'white',
      font_color: 'white',
      background_colors: ['black', '#4a465a']
    });
  },

  // A color scheme plucked from the colors on the popular usability blog.
  theme_37signals: function() {
    // Colors
    this._green = '#339933';
    this._purple = '#cc99cc';
    this._blue = '#336699';
    this._yellow = '#FFF804';
    this._red = '#ff0000';
    this._orange = '#cf5910';
    this._black = 'black';
    this.colors = [this._yellow, this._blue, this._green, this._red, this._purple, this._orange, this._black];

    this.set_theme({
      colors: this.colors,
      marker_color: 'black',
      font_color: 'black',
      background_colors: ['#d1edf5', 'white']
    });
  },

  // A color scheme from the colors used on the 2005 Rails keynote
  // presentation at RubyConf.
  theme_rails_keynote: function() {
    // Colors
    this._green = '#00ff00';
    this._grey = '#333333';
    this._orange = '#ff5d00';
    this._red = '#f61100';
    this._white = 'white';
    this._light_grey = '#999999';
    this._black = 'black';
    this.colors = [this._green, this._grey, this._orange, this._red, this._white, this._light_grey, this._black];
    
    this.set_theme({
      colors: this.colors,
      marker_color: 'white',
      font_color: 'white',
      background_colors: ['#0083a3', '#0083a3']
    });
  },

  // A color scheme similar to that used on the popular podcast site.
  theme_odeo: function() {
    // Colors
    this._grey = '#202020';
    this._white = 'white';
    this._dark_pink = '#a21764';
    this._green = '#8ab438';
    this._light_grey = '#999999';
    this._dark_blue = '#3a5b87';
    this._black = 'black';
    this.colors = [this._grey, this._white, this._dark_blue, this._dark_pink, this._green, this._light_grey, this._black];
    
    this.set_theme({
      colors: this.colors,
      marker_color: 'white',
      font_color: 'white',
      background_colors: ['#ff47a4', '#ff1f81']
    });
  },

  // A pastel theme
  theme_pastel: function() {
    // Colors
    this.colors = [
        '#a9dada', // blue
        '#aedaa9', // green
        '#daaea9', // peach
        '#dadaa9', // yellow
        '#a9a9da', // dk purple
        '#daaeda', // purple
        '#dadada' // grey
      ];
    
    this.set_theme({
      colors: this.colors,
      marker_color: '#aea9a9', // Grey
      font_color: 'black',
      background_colors: 'white'
    });
  },

  // A greyscale theme
  theme_greyscale: function() {
    // Colors
    this.colors = [
        '#282828', // 
        '#383838', // 
        '#686868', // 
        '#989898', // 
        '#c8c8c8', // 
        '#e8e8e8' // 
      ];
    
    this.set_theme({
      colors: this.colors,
      marker_color: '#aea9a9', // Grey
      font_color: 'black',
      background_colors: 'white'
    });
  },
  
  // Parameters are an array where the first element is the name of the dataset
  // and the value is an array of values to plot.
  //
  // Can be called multiple times with different datasets for a multi-valued
  // graph.
  //
  // If the color argument is nil, the next color from the default theme will
  // be used.
  //
  // NOTE: If you want to use a preset theme, you must set it before calling
  // data().
  //
  // Example:
  //   data("Bart S.", [95, 45, 78, 89, 88, 76], '#ffcc00')
  data: function(name, data_points, color) {
    data_points = data_points || [];
    color = color || null;
    
    data_points = Bluff.array(data_points); // make sure it's an array
    this._data.push([name, data_points, (color || this._increment_color())]);
    // Set column count if this is larger than previous counts
    this._column_count = (data_points.length > this._column_count) ? data_points.length : this._column_count;

    // Pre-normalize
    Bluff.each(data_points, function(data_point, index) {
      if (!data_point) return;
      
      // Setup max/min so spread starts at the low end of the data points
      if (this.maximum_value === null && this.minimum_value === null)
        this.maximum_value = this.minimum_value = data_point;
      
      // TODO Doesn't work with stacked bar graphs
      // Original: @maximum_value = _larger_than_max?(data_point, index) ? max(data_point, index) : @maximum_value
      this.maximum_value = this._larger_than_max(data_point) ? data_point : this.maximum_value;
      if (this.maximum_value > 0) this._has_data = true;
      
      this.minimum_value = this._less_than_min(data_point) ? data_point : this.minimum_value;
      if (this.minimum_value < 0) this._has_data = true;
    }, this);
  },
  
  // Overridden by subclasses to do the actual plotting of the graph.
  //
  // Subclasses should start by calling super() for this method.
  draw: function() {
    if (this.stacked) this._make_stacked();
  },
  
  
  // Finds the best background to render based on the provided theme options.
  _render_background: function() {
    var colors = this._theme_options.background_colors;
    switch (true) {
      case colors instanceof Array:
        this._render_gradiated_background.apply(this, colors);
        break;
      case typeof colors == 'string':
        this._render_solid_background(colors);
        break;
      default:
        this._render_image_background(this._theme_options.background_image);
        break;
    }
  },
  
  // Make a new image at the current size with a solid +color+.
  _render_solid_background: function(color) {
    this._d.render_solid_background(this._columns, this._rows, color);
  },

  // Use with a theme definition method to draw a gradiated background.
  _render_gradiated_background: function(top_color, bottom_color) {
    this._d.render_gradiated_background(this._columns, this._rows, top_color, bottom_color);
  },

  // Use with a theme to use an image (800x600 original) background.
  _render_image_background: function(image_path) {
    // TODO
  },
  
  // Resets everything to defaults (except data).
  _reset_themes: function() {
    this._color_index = 0;
    this._labels_seen = {};
    this._theme_options = {};
    this._d.scale(this._scale, this._scale);
  },

  // Overridden by subclasses such as stacked bar.
  _larger_than_max: function(data_point, index) {
    return data_point > this.maximum_value;
  },

  _less_than_min: function(data_point, index) {
    return data_point < this.minimum_value;
  },

  // Overridden by subclasses that need it.
  _max: function(data_point, index) {
    return data_point;
  },

  // Overridden by subclasses that need it.
  _min: function(data_point, index) {
    return data_point;
  },
  
  _make_stacked: function() {
    var stacked_values = [], i = this._column_count;
    while (i--) stacked_values[i] = 0;
    Bluff.each(this._data, function(value_set) {
      Bluff.each(value_set[1], function(value, index) {
        stacked_values[index] += value;
      });
      value_set[1] = Bluff.array(stacked_values);
    });
  },
  
  _increment_color: function() {
    if (this._color_index == 0) {
      this._color_index += 1;
      return this.colors[0];
    } else {
      if (this._color_index < this.colors.length) {
        this._color_index += 1;
        return this.colors[this._color_index - 1];
      } else {
        // Start over
        this._color_index = 0;
        return this.colors[this.colors.length - 1];
      }
    }
  }
});

