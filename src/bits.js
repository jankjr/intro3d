function Bits ( size ) {
  var data = new Int32Array( Math.floor( size / 4 ) );

  this.clear= function () {
    for(var i = 0 ; i < data.length ; i ++) data[i] = 0;
  }

  this.set = function ( bit, val ) {
    var mask  = ~( 1 << bit );
    var value = val << bit;
    var index = Math.floor( bit / 8 );

    var word = data[ index ];
    word = ( word & mask ) | value;
    data[ index ] = word;
  }

  this.get = function ( bit ) {
    var mask  = ~( 1 << bit );
    var index = Math.floor( bit / 4 );

    var word = data[ index ];
    var value = ( word & mask ) >> bit;
    return value;
  }
}