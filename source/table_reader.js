Bluff.TableReader = new JS.Class({
  
  NUMBER_FORMAT: /\-?(0|[1-9]\d*)(\.\d+)?(e[\+\-]?\d+)?/i,
  
  initialize: function(table) {
    this._table = (typeof table == 'string')
        ? document.getElementById(table)
        : table;
  },
  
  get_data: function() {
    if (!this._data) this._read();
    return this._data;
  },
  
  get_series: function(i) {
    if (this._data[i]) return this._data[i];
    return this._data[i] = {name: 'Series ' + (i+1), points: []};
  },
  
  _read: function() {
    this._row = this._col = 0;
    this._row_offset = this._col_offset = 0;
    this._data = [];
    this._walk(this._table);
  },
  
  _walk: function(node) {
    this._consume(node);
    var i, children = node.childNodes, n = children.length;
    for (i = 0; i < n; i++) this._walk(children[i]);
  },
  
  _consume: function(node) {
    if (!node.tagName) return;
    var content = this._strip_tags(node.innerHTML);
    switch (node.tagName.toUpperCase()) {
    
      case 'TR':
        this._row += 1;
        this._col = 0;
        break;
      
      case 'TD':
        content = parseFloat(content.match(this.NUMBER_FORMAT)[0]);
        if (typeof content == 'number')
          this.get_series(this._col).points.push(parseFloat(content));
        this._col += 1;
        break;
      
      case 'TH':
        this.get_series(this._col).name = content;
        this._col += 1;
        break;
    }
  },
  
  _strip_tags: function(string) {
    return string.replace(/<\/?[^>]+>/gi, '');
  },
  
  extend: {
    Mixin: new JS.Module({
      data_from_table: function(table) {
        var data_rows = new Bluff.TableReader(table).get_data();
        Bluff.each(data_rows, function(row) {
          this.data(row.name, row.points);
        }, this);
      }
    })
  }
});

Bluff.Base.include(Bluff.TableReader.Mixin);

