/**
 * Bluff - beautiful graphs in JavaScript
 * ======================================
 * 
 * Get the latest version and docs at http://bluff.jcoglan.com
 * Based on Gruff by Geoffrey Grosenbach: http://github.com/topfunky/gruff
 * 
 * Copyright (C) 2008-2010 James Coglan
 * 
 * Released under the MIT license and the GPL v2.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.txt
 **/

Bluff = {
  // This is the version of Bluff you are using.
  VERSION: '0.3.6',
  
  array: function(list) {
    if (list.length === undefined) return [list];
    var ary = [], i = list.length;
    while (i--) ary[i] = list[i];
    return ary;
  },
  
  array_new: function(length, filler) {
    var ary = [];
    while (length--) ary.push(filler);
    return ary;
  },
  
  each: function(list, block, context) {
    for (var i = 0, n = list.length; i < n; i++) {
      block.call(context || null, list[i], i);
    }
  },
  
  index: function(list, needle) {
    for (var i = 0, n = list.length; i < n; i++) {
      if (list[i] === needle) return i;
    }
    return -1;
  },
  
  keys: function(object) {
    var ary = [], key;
    for (key in object) ary.push(key);
    return ary;
  },
  
  map: function(list, block, context) {
    var results = [];
    this.each(list, function(item) {
      results.push(block.call(context || null, item));
    });
    return results;
  },
  
  reverse_each: function(list, block, context) {
    var i = list.length;
    while (i--) block.call(context || null, list[i], i);
  },
  
  sum: function(list) {
    var sum = 0, i = list.length;
    while (i--) sum += list[i];
    return sum;
  },
  
  Mini: {}
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
    LEGEND_MARGIN: 20,
    TITLE_MARGIN: 20,
    LABEL_MARGIN: 10,
    DEFAULT_MARGIN: 20,
    
    DEFAULT_TARGET_WIDTH:  800,
    
    THOUSAND_SEPARATOR: ','
  },
  
  // Blank space above the graph
  top_margin: null,
  
  // Blank space below the graph
  bottom_margin: null,
  
  // Blank space to the right of the graph
  right_margin: null,
  
  // Blank space to the left of the graph
  left_margin: null,
  
  // Blank space below the title
  title_margin: null,
  
  // Blank space below the legend
  legend_margin: null,
  
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
  
  // Set to true to enable tooltip displays
  tooltips: false,
  
  // If one numerical argument is given, the graph is drawn at 4/3 ratio
  // according to the given width (800 results in 800x600, 400 gives 400x300,
  // etc.).
  //
  // Or, send a geometry string for other ratios ('800x400', '400x225').
  initialize: function(renderer, target_width) {
    this._d = new Bluff.Renderer(renderer);
    target_width = target_width || this.klass.DEFAULT_TARGET_WIDTH;
    
    var geo;
    
    if (typeof target_width !== 'number') {
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
    
    this._listeners = {};
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
    
    this.top_margin = this.bottom_margin =
    this.left_margin = this.right_margin = this.klass.DEFAULT_MARGIN;
    
    this.legend_margin = this.klass.LEGEND_MARGIN;
    this.title_margin = this.klass.TITLE_MARGIN;
    
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
  
  // Replace the entire color list with a new array of colors. Also
  // aliased as the colors= setter method.
  //
  // If you specify fewer colors than the number of datasets you intend
  // to draw, 'increment_color' will cycle through the array, reusing
  // colors as needed.
  //
  // Note that (as with the 'set_theme' method), you should set up the color
  // list before you send your data (via the 'data' method). Calls to the
  // 'data' method made prior to this call will use whatever color scheme
  // was in place at the time data was called.
  //
  // Example:
  //  replace_colors ['#cc99cc', '#d9e043', '#34d8a2']
  replace_colors: function(color_list) {
    this.colors = color_list || [];
    this._color_index = 0;
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
    this._reset_themes();
    
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
  
  // Set just the background colors
  set_background: function(options) {
    if (options.colors)
      this._theme_options.background_colors = options.colors;
    if (options.image)
      this._theme_options.background_image = options.image;
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
    data_points = (data_points === undefined) ? [] : data_points;
    color = color || null;
    
    data_points = Bluff.array(data_points); // make sure it's an array
    this._data.push([name, data_points, (color || this._increment_color())]);
    // Set column count if this is larger than previous counts
    this._column_count = (data_points.length > this._column_count) ? data_points.length : this._column_count;
    
    // Pre-normalize
    Bluff.each(data_points, function(data_point, index) {
      if (data_point === undefined) return;
      
      // Setup max/min so spread starts at the low end of the data points
      if (this.maximum_value === null && this.minimum_value === null)
        this.maximum_value = this.minimum_value = data_point;
      
      // TODO Doesn't work with stacked bar graphs
      // Original: @maximum_value = _larger_than_max?(data_point, index) ? max(data_point, index) : @maximum_value
      this.maximum_value = this._larger_than_max(data_point) ? data_point : this.maximum_value;
      if (this.maximum_value >= 0) this._has_data = true;
      
      this.minimum_value = this._less_than_min(data_point) ? data_point : this.minimum_value;
      if (this.minimum_value < 0) this._has_data = true;
    }, this);
  },
  
  // Overridden by subclasses to do the actual plotting of the graph.
  //
  // Subclasses should start by calling super() for this method.
  draw: function() {
    if (this.stacked) this._make_stacked();
    this._setup_drawing();
    
    this._debug(function() {
      // Outer margin
      this._d.rectangle(this.left_margin, this.top_margin,
                        this._raw_columns - this.right_margin, this._raw_rows - this.bottom_margin);
      // Graph area box
      this._d.rectangle(this._graph_left, this._graph_top, this._graph_right, this._graph_bottom);
    });
  },
  
  clear: function() {
    this._render_background();
  },
  
  on: function(eventType, callback, context) {
    var list = this._listeners[eventType] = this._listeners[eventType] || [];
    list.push([callback, context]);
  },
  
  trigger: function(eventType, data) {
    var list = this._listeners[eventType];
    if (!list) return;
    Bluff.each(list, function(listener) {
      listener[0].call(listener[1], data);
    });
  },
  
  // Calculates size of drawable area and draws the decorations.
  //
  // * line markers
  // * legend
  // * title
  _setup_drawing: function() {
    // Maybe should be done in one of the following functions for more granularity.
    if (!this._has_data) return this._draw_no_data();
    
    this._normalize();
    this._setup_graph_measurements();
    if (this.sort) this._sort_norm_data();
    
    this._draw_legend();
    this._draw_line_markers();
    this._draw_axis_labels();
    this._draw_title();
  },
  
  // Make copy of data with values scaled between 0-100
  _normalize: function(force) {
    if (this._norm_data === null || force === true) {
      this._norm_data = [];
      if (!this._has_data) return;
      
      this._calculate_spread();
      
      Bluff.each(this._data, function(data_row) {
        var norm_data_points = [];
        Bluff.each(data_row[this.klass.DATA_VALUES_INDEX], function(data_point) {
          if (data_point === null || data_point === undefined)
            norm_data_points.push(null);
          else
            norm_data_points.push((data_point - this.minimum_value) / this._spread);
        }, this);
        this._norm_data.push([data_row[this.klass.DATA_LABEL_INDEX], norm_data_points, data_row[this.klass.DATA_COLOR_INDEX]]);
      }, this);
    }
  },
  
  _calculate_spread: function() {
    this._spread = this.maximum_value - this.minimum_value;
    this._spread = this._spread > 0 ? this._spread : 1;
    
    var power = Math.round(Math.LOG10E*Math.log(this._spread));
    this._significant_digits = Math.pow(10, 3 - power);
  },
  
  // Calculates size of drawable area, general font dimensions, etc.
  _setup_graph_measurements: function() {
    this._marker_caps_height = this.hide_line_markers ? 0 :
      this._calculate_caps_height(this.marker_font_size);
    this._title_caps_height = this.hide_title ? 0 :
      this._calculate_caps_height(this.title_font_size);
    this._legend_caps_height = this.hide_legend ? 0 :
      this._calculate_caps_height(this.legend_font_size);
    
    var longest_label,
        longest_left_label_width,
        line_number_width,
        last_label,
        extra_room_for_long_label,
        x_axis_label_height,
        key;
    
    if (this.hide_line_markers) {
      this._graph_left = this.left_margin;
      this._graph_right_margin = this.right_margin;
      this._graph_bottom_margin = this.bottom_margin;
    } else {
      longest_left_label_width = 0;
      if (this.has_left_labels) {
        longest_label = '';
        for (key in this.labels) {
          longest_label = longest_label.length > this.labels[key].length
              ? longest_label
              : this.labels[key];
        }
        longest_left_label_width = this._calculate_width(this.marker_font_size, longest_label) * 1.25;
      } else {
        longest_left_label_width = this._calculate_width(this.marker_font_size, this._label(this.maximum_value));
      }
      
      // Shift graph if left line numbers are hidden
      line_number_width = this.hide_line_numbers && !this.has_left_labels ?
      0.0 :
        longest_left_label_width + this.klass.LABEL_MARGIN * 2;
      
      this._graph_left = this.left_margin +
        line_number_width +
        (this.y_axis_label === null ? 0.0 : this._marker_caps_height + this.klass.LABEL_MARGIN * 2);
      
      // Make space for half the width of the rightmost column label.
      // Might be greater than the number of columns if between-style bar markers are used.
      last_label = -Infinity;
      for (key in this.labels)
        last_label = last_label > Number(key) ? last_label : Number(key);
      last_label = Math.round(last_label);
      extra_room_for_long_label = (last_label >= (this._column_count-1) && this.center_labels_over_point) ?
      this._calculate_width(this.marker_font_size, this.labels[last_label]) / 2 :
        0;
      this._graph_right_margin  = this.right_margin + extra_room_for_long_label;
      
      this._graph_bottom_margin = this.bottom_margin +
        this._marker_caps_height + this.klass.LABEL_MARGIN;
    }
    
    this._graph_right = this._raw_columns - this._graph_right_margin;
    this._graph_width = this._raw_columns - this._graph_left - this._graph_right_margin;
    
    // When hide_title, leave a title_margin space for aesthetics.
    // Same with hide_legend
    this._graph_top = this.top_margin +
      (this.hide_title  ? this.title_margin  : this._title_caps_height  + this.title_margin ) +
      (this.hide_legend ? this.legend_margin : this._legend_caps_height + this.legend_margin);
    
    x_axis_label_height = (this.x_axis_label === null) ? 0.0 :
      this._marker_caps_height + this.klass.LABEL_MARGIN;
    this._graph_bottom = this._raw_rows - this._graph_bottom_margin - x_axis_label_height;
    this._graph_height = this._graph_bottom - this._graph_top;
  },
  
  // Draw the optional labels for the x axis and y axis.
  _draw_axis_labels: function() {
    if (this.x_axis_label) {
      // X Axis
      // Centered vertically and horizontally by setting the
      // height to 1.0 and the width to the width of the graph.
      var x_axis_label_y_coordinate = this._graph_bottom + this.klass.LABEL_MARGIN * 2 + this._marker_caps_height;
      
      // TODO Center between graph area
      this._d.fill = this.font_color;
      if (this.font) this._d.font = this.font;
      this._d.stroke = 'transparent';
      this._d.pointsize = this._scale_fontsize(this.marker_font_size);
      this._d.gravity = 'north';
      this._d.annotate_scaled(
                              this._raw_columns, 1.0,
                              0.0, x_axis_label_y_coordinate,
                              this.x_axis_label, this._scale);
      this._debug(function() {
        this._d.line(0.0, x_axis_label_y_coordinate, this._raw_columns, x_axis_label_y_coordinate);
      });
    }
    
    // TODO Y label (not generally possible in browsers)
  },
  
  // Draws horizontal background lines and labels
  _draw_line_markers: function() {
    if (this.hide_line_markers) return;
    
    if (this.y_axis_increment === null) {
      // Try to use a number of horizontal lines that will come out even.
      //
      // TODO Do the same for larger numbers...100, 75, 50, 25
      if (this.marker_count === null) {
        Bluff.each([3,4,5,6,7], function(lines) {
          if (!this.marker_count && this._spread % lines === 0)
            this.marker_count = lines;
        }, this);
        this.marker_count = this.marker_count || 4;
      }
      this._increment = (this._spread > 0) ? this._significant(this._spread / this.marker_count) : 1;
    } else {
      // TODO Make this work for negative values
      this.maximum_value = Math.max(Math.ceil(this.maximum_value), this.y_axis_increment);
      this.minimum_value = Math.floor(this.minimum_value);
      this._calculate_spread();
      this._normalize(true);
      
      this.marker_count = Math.round(this._spread / this.y_axis_increment);
      this._increment = this.y_axis_increment;
    }
    this._increment_scaled = this._graph_height / (this._spread / this._increment);
    
    // Draw horizontal line markers and annotate with numbers
    var index, n, y, marker_label;
    for (index = 0, n = this.marker_count; index <= n; index++) {
      y = this._graph_top + this._graph_height - index * this._increment_scaled;
      
      this._d.stroke = this.marker_color;
      this._d.stroke_width = 1;
      this._d.line(this._graph_left, y, this._graph_right, y);
      
      marker_label = index * this._increment + this.minimum_value;
      
      if (!this.hide_line_numbers) {
        this._d.fill = this.font_color;
        if (this.font) this._d.font = this.font;
        this._d.font_weight = 'normal';
        this._d.stroke = 'transparent';
        this._d.pointsize = this._scale_fontsize(this.marker_font_size);
        this._d.gravity = 'east';
        
        // Vertically center with 1.0 for the height
        this._d.annotate_scaled(this._graph_left - this.klass.LABEL_MARGIN,
                                1.0, 0.0, y,
                                this._label(marker_label), this._scale);
      }
    }
  },
  
  _center: function(size) {
    return (this._raw_columns - size) / 2;
  },
  
  // Draws a legend with the names of the datasets matched to the colors used
  // to draw them.
  _draw_legend: function() {
    if (this.hide_legend) return;
    
    this._legend_labels = Bluff.map(this._data, function(item) {
      return item[this.klass.DATA_LABEL_INDEX];
    }, this);
    
    var legend_square_width = this.legend_box_size; // small square with color of this item
    
    // May fix legend drawing problem at small sizes
    if (this.font) this._d.font = this.font;
    this._d.pointsize = this.legend_font_size;
    
    var label_widths = [[]]; // Used to calculate line wrap
    Bluff.each(this._legend_labels, function(label) {
      var last = label_widths.length - 1;
      var metrics = this._d.get_type_metrics(label);
      var label_width = metrics.width + legend_square_width * 2.7;
      label_widths[last].push(label_width);
      
      if (Bluff.sum(label_widths[last]) > (this._raw_columns * 0.9))
        label_widths.push([label_widths[last].pop()]);
    }, this);
    
    var current_x_offset = this._center(Bluff.sum(label_widths[0]));
    var current_y_offset = this.hide_title ?
    this.top_margin + this.title_margin :
      this.top_margin + this.title_margin + this._title_caps_height;
    
    this._debug(function() {
      this._d.stroke_width = 1;
      this._d.line(0, current_y_offset, this._raw_columns, current_y_offset);
    });
    
    Bluff.each(this._legend_labels, function(legend_label, index) {
      
      // Draw label
      this._d.fill = this.font_color;
      if (this.font) this._d.font = this.font;
      this._d.pointsize = this._scale_fontsize(this.legend_font_size);
      this._d.stroke = 'transparent';
      this._d.font_weight = 'normal';
      this._d.gravity = 'west';
      this._d.annotate_scaled(this._raw_columns, 1.0,
                              current_x_offset + (legend_square_width * 1.7), current_y_offset,
                              legend_label, this._scale);
      
      // Now draw box with color of this dataset
      this._d.stroke = 'transparent';
      this._d.fill = this._data[index][this.klass.DATA_COLOR_INDEX];
      this._d.rectangle(current_x_offset,
                        current_y_offset - legend_square_width / 2.0,
                        current_x_offset + legend_square_width,
                        current_y_offset + legend_square_width / 2.0);
      
      this._d.pointsize = this.legend_font_size;
      var metrics = this._d.get_type_metrics(legend_label);
      var current_string_offset = metrics.width + (legend_square_width * 2.7),
          line_height;
      
      // Handle wrapping
      label_widths[0].shift();
      if (label_widths[0].length == 0) {
        this._debug(function() {
          this._d.line(0.0, current_y_offset, this._raw_columns, current_y_offset);
        });
        
        label_widths.shift();
        if (label_widths.length > 0) current_x_offset = this._center(Bluff.sum(label_widths[0]));
        line_height = Math.max(this._legend_caps_height, legend_square_width) + this.legend_margin;
        if (label_widths.length > 0) {
          // Wrap to next line and shrink available graph dimensions
          current_y_offset += line_height;
          this._graph_top += line_height;
          this._graph_height = this._graph_bottom - this._graph_top;
        }
      } else {
        current_x_offset += current_string_offset;
      }
    }, this);
    this._color_index = 0;
  },
  
  // Draws a title on the graph.
  _draw_title: function() {
    if (this.hide_title || !this.title) return;
    
    this._d.fill = this.font_color;
    if (this.font) this._d.font = this.font;
    this._d.pointsize = this._scale_fontsize(this.title_font_size);
    this._d.font_weight = 'bold';
    this._d.gravity = 'north';
    this._d.annotate_scaled(this._raw_columns, 1.0,
                            0, this.top_margin,
                            this.title, this._scale);
  },
  
  // Draws column labels below graph, centered over x_offset
  //--
  // TODO Allow WestGravity as an option
  _draw_label: function(x_offset, index) {
    if (this.hide_line_markers) return;
    
    var y_offset;
    
    if (this.labels[index] && !this._labels_seen[index]) {
      y_offset = this._graph_bottom + this.klass.LABEL_MARGIN;
      
      this._d.fill = this.font_color;
      if (this.font) this._d.font = this.font;
      this._d.stroke = 'transparent';
      this._d.font_weight = 'normal';
      this._d.pointsize = this._scale_fontsize(this.marker_font_size);
      this._d.gravity = 'north';
      this._d.annotate_scaled(1.0, 1.0,
                              x_offset, y_offset,
                              this.labels[index], this._scale);
      this._labels_seen[index] = true;
      
      this._debug(function() {
        this._d.stroke_width = 1;
        this._d.line(0.0, y_offset, this._raw_columns, y_offset);
      });
    }
  },
  
  // Creates a mouse hover target rectangle for tooltip displays
  _draw_tooltip: function(left, top, width, height, name, color, data, index) {
    if (!this.tooltips) return;
    var node = this._d.tooltip(left, top, width, height, name, color, data);
    
    Bluff.Event.observe(node, 'click', function() {
      var point = {
        series: name,
        label:  this.labels[index],
        value:  data,
        color:  color
      };
      this.trigger('click:datapoint', point);
    }, this);
  },
  
  // Shows an error message because you have no data.
  _draw_no_data: function() {
    this._d.fill = this.font_color;
    if (this.font) this._d.font = this.font;
    this._d.stroke = 'transparent';
    this._d.font_weight = 'normal';
    this._d.pointsize = this._scale_fontsize(80);
    this._d.gravity = 'center';
    this._d.annotate_scaled(this._raw_columns, this._raw_rows/2,
                            0, 10,
                            this.no_data_message, this._scale);
  },
  
  // Finds the best background to render based on the provided theme options.
  _render_background: function() {
    var colors = this._theme_options.background_colors;
    switch (true) {
      case colors instanceof Array:
        this._render_gradiated_background.apply(this, colors);
        break;
      case typeof colors === 'string':
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
  
  _scale_value: function(value) {
    return this._scale * value;
  },
  
  // Return a comparable fontsize for the current graph.
  _scale_fontsize: function(value) {
    var new_fontsize = value * this._scale;
    return new_fontsize;
  },
  
  _clip_value_if_greater_than: function(value, max_value) {
    return (value > max_value) ? max_value : value;
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
  
  _significant: function(inc) {
    if (inc == 0) return 1.0;
    var factor = 1.0;
    while (inc < 10) {
      inc *= 10;
      factor /= 10;
    }
    
    while (inc > 100) {
      inc /= 10;
      factor *= 10;
    }
    
    return Math.floor(inc) * factor;
  },
  
  // Sort with largest overall summed value at front of array so it shows up
  // correctly in the drawn graph.
  _sort_norm_data: function() {
    var sums = this._sums, index = this.klass.DATA_VALUES_INDEX;
    
    this._norm_data.sort(function(a,b) {
      return sums(b[index]) - sums(a[index]);
    });
    
    this._data.sort(function(a,b) {
      return sums(b[index]) - sums(a[index]);
    });
  },
  
  _sums: function(data_set) {
    var total_sum = 0;
    Bluff.each(data_set, function(num) { total_sum += (num || 0) });
    return total_sum;
  },
  
  _make_stacked: function() {
    var stacked_values = [], i = this._column_count;
    while (i--) stacked_values[i] = 0;
    Bluff.each(this._data, function(value_set) {
      Bluff.each(value_set[this.klass.DATA_VALUES_INDEX], function(value, index) {
        stacked_values[index] += value;
      }, this);
      value_set[this.klass.DATA_VALUES_INDEX] = Bluff.array(stacked_values);
    }, this);
  },
  
  // Takes a block and draws it if DEBUG is true.
  //
  // Example:
  //   debug { @d.rectangle x1, y1, x2, y2 }
  _debug: function(block) {
    if (this.klass.DEBUG) {
      this._d.fill = 'transparent';
      this._d.stroke = 'turquoise';
      block.call(this);
    }
  },
  
  // Returns the next color in your color list.
  _increment_color: function() {
    var offset = this._color_index;
    this._color_index = (this._color_index + 1) % this.colors.length;
    return this.colors[offset];
  },
  
  // Return a formatted string representing a number value that should be
  // printed as a label.
  _label: function(value) {
    var sep   = this.klass.THOUSAND_SEPARATOR,
        label = (this._spread % this.marker_count == 0 || this.y_axis_increment !== null)
        ? String(Math.round(value))
        : String(Math.floor(value * this._significant_digits)/this._significant_digits);
    
    var parts = label.split('.');
    parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + sep);
    return parts.join('.');
  },
  
  // Returns the height of the capital letter 'X' for the current font and
  // size.
  //
  // Not scaled since it deals with dimensions that the regular scaling will
  // handle.
  _calculate_caps_height: function(font_size) {
    return this._d.caps_height(font_size);
  },
  
  // Returns the width of a string at this pointsize.
  //
  // Not scaled since it deals with dimensions that the regular 
  // scaling will handle.
  _calculate_width: function(font_size, text) {
    return this._d.text_width(font_size, text);
  }
});

