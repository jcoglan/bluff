Bluff.TableReader = new JS.Class({
  
  NUMBER_FORMAT: /\-?(0|[1-9]\d*)(\.\d+)?(e[\+\-]?\d+)?/i,
  
  initialize: function(table, options) {
    this._options = options || {};
    this._orientation = this._options.orientation || 'auto';
    
    this._table = (typeof table === 'string')
        ? document.getElementById(table)
        : table;
  },
  
  // Get array of data series from the table
  get_data: function() {
    if (!this._data) this._read();
    return this._data;
  },
  
  // Get set of axis labels to use for the graph
  get_labels: function() {
    if (!this._labels) this._read();
    return this._labels;
  },
  
  // Get the title from the table's caption
  get_title: function() {
    return this._title;
  },
  
  // Return series number i
  get_series: function(i) {
    if (this._data[i]) return this._data[i];
    return this._data[i] = {points: []};
  },
  
  // Gather data by reading from the table
  _read: function() {
    this._row = this._col = 0;
    this._row_offset = this._col_offset = 0;
    this._data = [];
    this._labels = {};
    this._row_headings = [];
    this._col_headings = [];
    this._skip_rows = [];
    this._skip_cols = [];
    
    this._walk(this._table);
    this._cleanup();
    this._orient();
    
    Bluff.each(this._col_headings, function(heading, i) {
      this.get_series(i - this._col_offset).name = heading;
    }, this);
    
    Bluff.each(this._row_headings, function(heading, i) {
      this._labels[i - this._row_offset] = heading;
    }, this);
  },
  
  // Walk the table's DOM tree
  _walk: function(node) {
    this._visit(node);
    var i, children = node.childNodes, n = children.length;
    for (i = 0; i < n; i++) this._walk(children[i]);
  },
  
  // Read a single DOM node from the table
  _visit: function(node) {
    if (!node.tagName) return;
    var content = this._strip_tags(node.innerHTML), x, y;
    switch (node.tagName.toUpperCase()) {
    
      case 'TR':
        if (!this._has_data) this._row_offset = this._row;
        this._row += 1;
        this._col = 0;
        break;
      
      case 'TD':
        if (!this._has_data) this._col_offset = this._col;
        this._has_data = true;
        this._col += 1;
        content = content.match(this.NUMBER_FORMAT);
        if (content === null) {
          this.get_series(x).points[y] = null;
        } else {
          x = this._col - this._col_offset - 1;
          y = this._row - this._row_offset - 1;
          this.get_series(x).points[y] = parseFloat(content[0]);
        }
        break;
      
      case 'TH':
        this._col += 1;
        if (this._ignore(node)) {
          this._skip_cols.push(this._col);
          this._skip_rows.push(this._row);
        }
        if (this._col === 1 && this._row === 1)
          this._row_headings[0] = this._col_headings[0] = content;
        else if (node.scope === "row" || this._col === 1)
          this._row_headings[this._row - 1] = content;
        else
          this._col_headings[this._col - 1] = content;
        break;
      
      case 'CAPTION':
        this._title = content;
        break;
    }
  },
  
  _ignore: function(node) {
    if (!this._options.except) return false;
    
    var content = this._strip_tags(node.innerHTML),
        classes = (node.className || '').split(/\s+/),
        list = [].concat(this._options.except);
    
    if (Bluff.index(list, content) >= 0) return true;
    var i = classes.length;
    while (i--) {
      if (Bluff.index(list, classes[i]) >= 0) return true;
    }
    return false;
  },
  
  _cleanup: function() {
    var i = this._skip_cols.length, index;
    while (i--) {
      index = this._skip_cols[i];
      if (index <= this._col_offset) continue;
      this._col_headings.splice(index - 1, 1);
      if (index >= this._col_offset)
        this._data.splice(index - 1 - this._col_offset, 1);
    }
    
    var i = this._skip_rows.length, index;
    while (i--) {
      index = this._skip_rows[i];
      if (index <= this._row_offset) continue;
      this._row_headings.splice(index - 1, 1);
      Bluff.each(this._data, function(series) {
        if (index >= this._row_offset)
          series.points.splice(index - 1 - this._row_offset, 1);
      }, this);
    }
  },
  
  _orient: function() {
    switch (this._orientation) {
      case 'auto':
        if ((this._row_headings.length > 1 && this._col_headings.length === 1) ||
            this._row_headings.length < this._col_headings.length) {
          this._transpose();
        }
        break;
        
      case 'rows':
        this._transpose();
        break;
    }
  },
  
  // Transpose data in memory
  _transpose: function() {
    var data = this._data, tmp;
    this._data = [];
    
    Bluff.each(data, function(row, i) {
      Bluff.each(row.points, function(point, p) {
        this.get_series(p).points[i] = point;
      }, this);
    }, this);
    
    tmp = this._row_headings;
    this._row_headings = this._col_headings;
    this._col_headings = tmp;
    
    tmp = this._row_offset;
    this._row_offset = this._col_offset;
    this._col_offset = tmp;
  },
  
  // Remove HTML from a string
  _strip_tags: function(string) {
    return string.replace(/<\/?[^>]+>/gi, '');
  },
  
  extend: {
    Mixin: new JS.Module({
      data_from_table: function(table, options) {
        var reader    = new Bluff.TableReader(table, options),
            data_rows = reader.get_data();
        
        Bluff.each(data_rows, function(row) {
          this.data(row.name, row.points);
        }, this);
        
        this.labels = reader.get_labels();
        this.title  = reader.get_title() || this.title;
      }
    })
  }
});

Bluff.Base.include(Bluff.TableReader.Mixin);

