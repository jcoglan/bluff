//  This class perfoms the y coordinats conversion for the bar class.
//
//  There are three cases: 
//
//    1. Bars all go from zero in positive direction
//    2. Bars all go from zero to negative direction  
//    3. Bars either go from zero to positive or from zero to negative
//
Bluff.BarConversion = new JS.Class({
  mode:           null,
  zero:           null,
  graph_top:      null,
  graph_height:   null,
  minimum_value:  null,
  spread:         null,
  
  getLeftYRightYscaled: function(data_point, result) {
    var val;
    switch (this.mode) {
      case 1: // Case one
        // minimum value >= 0 ( only positiv values )
        result[0] = this.graph_top + this.graph_height*(1 - data_point) + 1;
        result[1] = this.graph_top + this.graph_height - 1;
        break;
      case 2:  // Case two
        // only negativ values
         result[0] = this.graph_top + 1;
        result[1] = this.graph_top + this.graph_height*(1 - data_point) - 1;
        break;
      case 3: // Case three
        // positiv and negativ values
        val = data_point-this.minimum_value/this.spread;
        if ( data_point >= this.zero ) {
          result[0] = this.graph_top + this.graph_height*(1 - (val-this.zero)) + 1;
          result[1] = this.graph_top + this.graph_height*(1 - this.zero) - 1;
        } else {
          result[0] = this.graph_top + this.graph_height*(1 - (val-this.zero)) + 1;
          result[1] = this.graph_top + this.graph_height*(1 - this.zero) - 1;
        }
        break;
      default:
        result[0] = 0.0;
        result[1] = 0.0;
    }        
  }  
  
});

