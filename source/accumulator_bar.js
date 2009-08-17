// A special bar graph that shows a single dataset as a set of
// stacked bars. The bottom bar shows the running total and 
// the top bar shows the new value being added to the array.

Bluff.AccumulatorBar = new JS.Class(Bluff.StackedBar, {
  
  draw: function() {
    if (this._data.length !== 1) throw 'Incorrect number of datasets';
    
    var accumulator_array = [],
        index = 0,
        increment_array = [];
    
    Bluff.each(this._data[0][this.klass.DATA_VALUES_INDEX], function(value) {
      var max = -Infinity;
      Bluff.each(increment_array, function(x) { max = Math.max(max, x); });
      
      increment_array.push((index > 0) ? (value + max) : value);
      accumulator_array.push(increment_array[index] - value);
      index += 1;
    }, this);
    
    this.data("Accumulator", accumulator_array);
    
    this.callSuper();
  }
});

