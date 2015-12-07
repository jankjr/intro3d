var World = (function () {






function encodePosition ( x, y ) {
  // v8 has about 30 bits pr integer before promoting to float
  // this means we can encode three coordinates within 30 bits.
  // 2^15 = 32.768 or -16.384 to 16.384 chunks are addressable in the world
  if( x < -16384 || x > 16384 ) throw new RuntimeException( 'Out of bound', 'x ' + x + ' coordinate is out of bounds, cannot encode position!');
  if( y < -16384 || y > 16384 ) throw new RuntimeException( 'Out of bound', 'y ' + y + ' coordinate is out of bounds, cannot encode position!');
  return ( ( x + 16.384 ) << 15 ) | ( y + 16.384 );
}
function chunkCoord (x) {
  return Math.floor( x / CHUNK_SIZE )
}

function conv(x) {
  return x < 0 ? ( CHUNK_SIZE - 1 ) - ( Math.abs( x + 1 ) % CHUNK_SIZE ) : x % CHUNK_SIZE;
}
function World ( worldGenerator, blocks ) {
  var t = this;
  var worldChunks = {};
  var worldRenderer = new WorldRenderer( blocks );

  function createMinirate ( x, y, z, s ) {
    var blockDef = blockIdLookup[ s ] ;
    worldRenderer.miniratures.push( {
      x: x + Math.random(),
      y: y + 0.5,
      z: z + Math.random(),
      r: Math.random() * Math.PI * 2.0,
      mesh: blockDef.miniratureMesh
    } );
  }

  function requestChunkByIndex( index, x, z ) {
    var chunk = worldChunks[ index ] || worldGenerator( t, new Chunk( world, x, z ), x * CHUNK_SIZE, z * CHUNK_SIZE );
    worldChunks[ index ] = chunk;
    return chunk;
  }

  function isAllocated( x, y, z ) {
    if( y < 0 || y >= CHUNK_HEIGHT ) return false;
    var xb = chunkCoord( x ), zb = chunkCoord( z );
    var chunkId = encodePosition( xb, zb );
    if( worldChunks[ chunkId ] === undefined ) return false;
    return true;
  }

  function getBlockAt( x, y, z ) {
    if( y < 0 || y >= CHUNK_HEIGHT ) return 0;
    var xb = chunkCoord( x ),
        zb = chunkCoord( z );
    var chunkId = encodePosition( xb, zb );
    var chunk = requestChunkByIndex( chunkId, xb, zb );
    var b = chunk.get( conv( x ), y, conv( z ) );
    return b;
  }

  function setBlockAt ( x, y, z, v ) {
    var xb = chunkCoord( x ), zb = chunkCoord( z );
    var chunkId = encodePosition( xb, zb );
    var chunk = requestChunkByIndex( chunkId, xb, zb );

    var old = getBlockAt( x, y, z );
    chunk.set( conv( x ) , y, conv( z ), v );
    if( v === 0 && old !== 0 ){
      createMinirate( x, y, z, old );
    }
  }
  function needSide ( x, y, z ) {
    if( y < 0 || y >= CHUNK_HEIGHT ) return false;
    var xb = chunkCoord( x ), zb = chunkCoord( z );
    var chunkId = encodePosition( xb, zb );
    if( worldChunks[ chunkId ] === undefined ) return false;
    var chunk = worldChunks[ chunkId ];
    return chunk.get( conv( x ), y, conv( z ) ) === 0;
  }

  function getBlockSidesAt(x, y, z) {
    var out = 0;
    if ( needSide( x - 1, y, z )  ) out += 1;
    if ( needSide( x + 1, y, z )  ) out += 2;
    if ( needSide( x , y - 1, z ) ) out += 4;
    if ( needSide( x , y + 1, z ) ) out += 8;
    if ( needSide( x , y, z - 1 ) ) out += 16;
    if ( needSide( x , y, z + 1 ) ) out += 32;
    return out;
  }

  this.getBlockAt = getBlockAt;
  this.setBlockAt = setBlockAt;
  this.getBlockSidesAt = getBlockSidesAt;

  var nearbyChunks = [],
      chunksCurrentlyInView = [];

  var hdist = 2;
  function chunksNear ( x, z ) {
    nearbyChunks.length = 0;
    var xb = chunkCoord( Math.floor( x ) ),
        zb = chunkCoord( Math.floor( z ) );
    for(var cx = xb - hdist ; cx <= xb + hdist ; cx ++ ){
      for(var cz = zb - hdist ; cz <= zb + hdist ; cz ++ ){
        var encodedPosition = encodePosition( cx, cz );
        var chunk = requestChunkByIndex( encodedPosition, cx, cz );
        nearbyChunks.push( chunk );
      }
    }
  }
  this.pickBlock = function (x, y) {
    var s = worldRenderer.readBlock( x, y );
    var chunk = inviewLookup[s.x];
    if(chunk === undefined) return;
    return {
      x : chunk.xpos + s.y,
      y : s.z,
      z : chunk.zpos + s.w
    }
  }
  function sign (v) {
    return v === 0 ? 0 : v < 0 ? -1 : 1;
  }
  this.pickNormal = function (x, y) {
    var s = worldRenderer.readNormal( x, y );
    return {
      x : sign( ( s.x / 256.0 ) * 2.0 - 1.0 ),
      y : sign( ( s.y / 256.0 ) * 2.0 - 1.0 ),
      z : sign( ( s.z / 256.0 ) * 2.0 - 1.0 )
    }
  }

  var inviewId = 0;
  var inviewLookup = {}
  this.update = function ( view ) {
    chunksNear( view.x(), view.z() );
    for (var i = 0; i < nearbyChunks.length; i++) {
      if( chunksCurrentlyInView.indexOf( nearbyChunks[i] ) === -1){
        var iid = inviewId++;
        inviewLookup[iid] = nearbyChunks[i];
        nearbyChunks[i].inviewChunkId = iid;
        inviewId = inviewId % 255;

        nearbyChunks[i].alloc();
        chunksCurrentlyInView.push( nearbyChunks[i] );
        break;
      }
    };

    for (var i = 0; i < chunksCurrentlyInView.length; i++) {
      if( nearbyChunks.indexOf( chunksCurrentlyInView[i] ) === -1 ){
        chunksCurrentlyInView[i].free();
        chunksCurrentlyInView.splice( i, 1 );
        break;
      }
    };

    for(var i = 0 ; i < chunksCurrentlyInView.length ; i ++){
      chunksCurrentlyInView[i].update( worldRenderer, this );
    }
  }

  this.render = function ( view ) {
    worldRenderer.render( view );
  }
}
World.wrap = conv;

return World;
})();