

var Chunk = ( function () {
var GEOM_CHUNK_SIZE = 16;

// Use this for even more s
// Keeps track of 16 by 16 by 16 chunks of geometry for subchunk
function GeometryChunk ( chunk, innerOffsetX, innerOffsetY, innerOffsetZ ) {
  var materialPages = {};
  var t = this;
  t.dirty = false;

  // Frees all pages associated with this subchunk
  t.free = function () {
    for( var materialId in materialPages ){
      if( materialPages[ materialId ] !== undefined ) {
        t.dirty = true;
        materialPages[ materialId ].free();
      }
      materialPages[ materialId ] = undefined;
    }
  }

  function getPageForMaterial ( renderer, material ) {
    if( materialPages[ material ] === undefined ){
      materialPages[ material ] = renderer.getVertexMemoryForMaterial( material ).allocPage();
    }
    return materialPages[ material ];
  }

  t.generate = function( chunk, renderer, world, worldX, worldY, worldZ ){
    if( t.dirty === false ) {
      return;
    }
    t.dirty = false;
    t.free();
    for(var z = 0 ; z < GEOM_CHUNK_SIZE ; z++ ){
      for(var x = 0 ; x < GEOM_CHUNK_SIZE ; x++ ){
        for(var y = 0 ; y < GEOM_CHUNK_SIZE ; y++ ){
          var xPos = worldX + innerOffsetX + x, yPos = worldY + innerOffsetY + y, zPos = worldZ + innerOffsetZ + z;
          var xb = innerOffsetX + x, yb = innerOffsetY + y, zb = innerOffsetZ + z;
          var block = world.getBlockAt( xPos, yPos, zPos );
          if( block === 0 ) {
            continue;
          }

          var blockSides = world.getBlockSidesAt( xPos, yPos, zPos );
          if( blockSides === 0 ) {
            continue;
          }
          var blockDefinition = blockIdLookup[ block ],
              page = getPageForMaterial( renderer, block );
          blockDefinition.geometryGenerator( world, blockDefinition, blockSides, page,
                                                              xPos, yPos, zPos,
                                                              chunk.inviewChunkId / 255.0, xb / 255.0, yb / 255.0, zb / 255.0 );
        }
      }
    }
  }
}
function geomChunkCoord (v) {
  return Math.floor( v / GEOM_CHUNK_SIZE );
}

var chunkId = 0;
return function Chunk ( world, xpos, zpos ) {
  var geomChunksX = geomChunkCoord( CHUNK_SIZE );
  var geomChunksY = geomChunkCoord( CHUNK_HEIGHT );
  var geomChunksZ = geomChunkCoord( CHUNK_SIZE );
  var geomChunks = new Array( geomChunksX * geomChunksY * geomChunksZ );
  var t = this;
  for(var z = 0 ; z < geomChunksZ ; z++ ){
    for(var x = 0 ; x < geomChunksX ; x++ ){
      for(var y = 0 ; y < geomChunksY ; y++ ){
        geomChunks[y + x * geomChunksY + z * geomChunksX * geomChunksY] = new GeometryChunk( t, x * GEOM_CHUNK_SIZE,
                                                                                                y * GEOM_CHUNK_SIZE,
                                                                                                z * GEOM_CHUNK_SIZE ) ;
      }
    }
  }
  function getGeomChunk (x, y, z) {
    var index = geomChunkCoord( y ) + geomChunkCoord(x) * geomChunksY + geomChunkCoord( z ) * geomChunksX * geomChunksY;
    return geomChunks[ index ];
  }
  var data = new Int32Array( CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT );
  this.id = chunkId++;
  this.loaded = false;
  var dirty  = true;

  // Frees all pages associated with this chunk,
  // removing it from the scene
  this.free = function () {
    for( var i = 0 ; i < geomChunks.length ; i ++){
      geomChunks[i].free();
    }
    this.loaded = false;
    dirty = true;
  }
  this.alloc = function () {
    this.loaded = true;
    dirty = true;
  }

  this.xpos = xpos * CHUNK_SIZE;
  this.zpos = zpos * CHUNK_SIZE;

  this.get = function ( x, y, z ) {
    return data[ y + x * CHUNK_HEIGHT + z * CHUNK_HEIGHT * CHUNK_SIZE ];
  };

  function dirtyNearby ( x, y, z ) {
    var left = getGeomChunk( x - 1, y, z );
    var right = getGeomChunk( x + 1, y, z );
    var down = getGeomChunk( x, y - 1, z );
    var up = getGeomChunk( x, y + 1, z );
    var back = getGeomChunk( x, y, z - 1 );
    var forward = getGeomChunk( x , y, z + 1 );
    if(left !== undefined) left.dirty = true;
    if(right !== undefined) right.dirty = true;
    if(down !== undefined) down.dirty = true;
    if(up !== undefined) up.dirty = true;
    if(back !== undefined) back.dirty = true;
    if(forward !== undefined) forward.dirty = true;
  }
  this.set = function ( x, y, z, v ) {
    var changed     = data[ y + x * CHUNK_HEIGHT + z * CHUNK_HEIGHT * CHUNK_SIZE ] !== v;
    var geomChunk   = getGeomChunk( x, y, z );
    if( changed ){
      dirty           = true;
      geomChunk.dirty = true;
      dirtyNearby( x, y, z );
    }
    data[ y + x * CHUNK_HEIGHT + z * CHUNK_HEIGHT * CHUNK_SIZE ] = v;
  };

  this.update = function ( renderer, world ) {
    if( dirty === false ) {
      return;
    }
    for( var i = 0 ; i < geomChunks.length ; i ++){
      if(geomChunks[ i ].dirty){
        geomChunks[ i ].generate( this, renderer, world, xpos * CHUNK_SIZE, 0, zpos * CHUNK_SIZE );
        return;
      }
    }
    dirty = false;
  };
}
} )();
