// Used by StackedBar and child classes.
Bluff.Base.StackedMixin = new JS.Module({
  // Get sum of each stack
  _get_maximum_by_stack: function() {
    var max_hash = {};
    Bluff.each(this._data, function(data_set) {
      Bluff.each(data_set[this.klass.DATA_VALUES_INDEX], function(data_point, i) {
        if (!max_hash[i]) max_hash[i] = 0.0;
        max_hash[i] += data_point;
      }, this);
    }, this);
    
    // this.maximum_value = 0;
    for (var key in max_hash) {
      if (max_hash[key] > this.maximum_value) this.maximum_value = max_hash[key];
    }
    this.minimum_value = 0;
  }
});

