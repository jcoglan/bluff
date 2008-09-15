Bluff.TableReader = new JS.Class({
  
  NUMBER_FORMAT: /\-?(0|[1-9]\d*)(\.\d+)?(e[\+\-]?\d+)?/i,
  
  initialize: function(table) {
    this._table = (typeof table == 'string')
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
  
  // Return series number i
  get_series: function(i) {
    if (this._data[i]) return this._data[i];
    return this._data[i] = {name: 'Series ' + (i+1), points: []};
  },
  
  // Gather data by reading from the table
  _read: function() {
    this._row = this._col = 0;
    this._row_offset = this._col_offset = 0;
    this._data = [];
    this._labels = {};
    this._row_headings = [];
    this._col_headings = [];
    
    this._walk(this._table);
    
    Bluff.each(this._col_headings, function(heading, i) {
      this.get_series(i - this._col_offset).name = heading;
    }, this);
    
    Bluff.each(this._row_headings, function(heading, i) {
      this._labels[i - this._row_offset] = heading;
    }, this);
  },
  
  // Walk the table's DOM tree
  _walk: function(node) {
    this._consume(node);
    var i, children = node.childNodes, n = children.length;
    for (i = 0; i < n; i++) this._walk(children[i]);
  },
  
  // Read a single DOM node from the table
  _consume: function(node) {
    if (!node.tagName) return;
    var content = this._strip_tags(node.innerHTML), list;
    switch (node.tagName.toUpperCase()) {
    
      case 'TR':
        if (!this._has_data) this._row_offset = this._row;
        this._row += 1;
        this._col = 0;
        break;
      
      case 'TD':
        if (!this._has_data) this._col_offset = this._col;
        content = parseFloat(content.match(this.NUMBER_FORMAT)[0]);
        if (typeof content == 'number') {
          this._has_data = true;
          this.get_series(this._col - this._col_offset).points.push(parseFloat(content));
        }
        this._col += 1;
        break;
      
      case 'TH':
        this._col += 1;
        if (this._col == 1 && this._row == 1)
          this._row_headings[0] = this._col_headings[0] = content;
        else if (node.scope == "row" || this._col == 1)
          this._row_headings[this._row - 1] = content;
        else
          this._col_headings[this._col - 1] = content;
        break;
    }
  },
  
  // Remove HTML from a string
  _strip_tags: function(string) {
    return string.replace(/<\/?[^>]+>/gi, '');
  },
  
  extend: {
    Mixin: new JS.Module({
      data_from_table: function(table) {
        var reader    = new Bluff.TableReader(table),
            data_rows = reader.get_data();
        
        Bluff.each(data_rows, function(row) {
          this.data(row.name, row.points);
        }, this);
        
        this.labels = reader.get_labels();
      }
    })
  }
});

Bluff.Base.include(Bluff.TableReader.Mixin);

