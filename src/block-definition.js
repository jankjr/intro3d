/** block types **/
var AIR  = 0;
var DIRT  = 1,
    GRASS = 2,
    STONE = 3,
    WOOD  = 4,
    LEAF  = 5;


function Color (r, g, b) {
  this.r = r;
  this.g = g;
  this.b = b;
}
function rgb (r, g, b) {
  return new Color( r / 256.0, g / 256.0, b / 256.0 );
}

/** Materials **/
var textured = new Material( 'textured', [  'vec3 aPosition',
                                            'vec3 aNormal',
                                            'vec2 aUV',
                                            'vec4 aID' ],

                                         [  'vec3 moonDir',
                                            'vec3 sunDir',
                                            'vec3 worldAmbientColor',
                                            'vec3 cameraPosition',

                                            'mat4 projectionMatrix',
                                            'mat4 modelviewMatrix',
                                            'mat4 normalMatrix',
                                            'sampler2D worldTexture' ] );


/** Generators **/
var simpleColoredBlockGen = makeBlockGenerator( {
  xm: function ( world, blockDef, vertex, page, x, y, z, inviewChunkId, innerx, innery, innez ) {
    XMSide( page, vertex, 0, x, y, z );
    sameSide( page, vertex, 3, -1, 0, 0 );
    UVSide( page, vertex, 6, blockDef.textureIds.xm );
    sameSide4( page, vertex, 8, inviewChunkId, innerx, innery, innez );
  },
  xp: function ( world, blockDef, vertex, page, x, y, z, inviewChunkId, innerx, innery, innez ) {
    XPSide( page, vertex, 0, x, y, z );
    sameSide( page, vertex, 3, 1, 0, 0 );
    UVSide( page, vertex, 6, blockDef.textureIds.xp );
    sameSide4( page, vertex, 8, inviewChunkId, innerx, innery, innez );
  },
  ym: function ( world, blockDef, vertex, page, x, y, z, inviewChunkId, innerx, innery, innez ) {
    YMSide( page, vertex, 0, x, y, z );
    sameSide( page, vertex, 3, 0, -1, 0 );
    UVSide( page, vertex, 6, blockDef.textureIds.ym );
    sameSide4( page, vertex, 8, inviewChunkId, innerx, innery, innez );
  },
  yp: function ( world, blockDef, vertex, page, x, y, z, inviewChunkId, innerx, innery, innez ) {
    YPSide( page, vertex, 0, x, y, z );
    sameSide( page, vertex, 3, 0, 1, 0 );
    UVSide( page, vertex, 6, blockDef.textureIds.yp );
    sameSide4( page, vertex, 8, inviewChunkId, innerx, innery, innez );
  },
  zm: function ( world, blockDef, vertex, page, x, y, z, inviewChunkId, innerx, innery, innez ) {
    ZMSide( page, vertex, 0, x, y, z );
    sameSide( page, vertex, 3, 0, 0, -1 );
    UVSide( page, vertex, 6, blockDef.textureIds.zm );
    sameSide4( page, vertex, 8, inviewChunkId, innerx, innery, innez );
  },
  zp: function ( world, blockDef, vertex, page, x, y, z, inviewChunkId, innerx, innery, innez ) {
    ZPSide( page, vertex, 0, x, y, z );
    sameSide( page, vertex, 3, 0, 0, 1 );
    UVSide( page, vertex, 6, blockDef.textureIds.zp );
    sameSide4( page, vertex, 8, inviewChunkId, innerx, innery, innez );
  }
} );

var nth = 1.0 / 16.0;
function idToUV ( ith ) {
  var row = Math.floor( ith / 16 ),
      col = ith % 16;
  return {
    u0 : col * nth,
    v0 : row * nth,
    u1 : col * nth + nth,
    v1 : row * nth + nth
  };
}

function generateMiniratureMeshVertices ( blockDef ) {
  var vertexSize = blockDef.material.components;
  var vertices = new Float32Array( vertexSize * 6 * 8 );

  function set ( i, o ) {
    for(var v = 2 ; v < arguments.length ; v ++ ){
      vertices[ i * vertexSize + v - 2 + o ] = arguments[v];
    }
  }
  var al = 0;
  var pageLike = {
    set : set,
    alloc : function () {
      var i = al;
      al += 6;
      return i;
    }
  };
  blockDef.geometryGenerator( null, blockDef,  63, pageLike, -0.5, -0.5, -0.5, 0, 0, 0, 0 );
  return vertices;
}

var blocks = [
  {
    id: DIRT,
    textureIds: {
      xm: idToUV( 2 ), xp: idToUV( 2 ),
      ym: idToUV( 2 ), yp: idToUV( 2 ),
      zm: idToUV( 2 ), zp: idToUV( 2 )
    },
    name: 'dirt',
    material: textured,
    geometryGenerator: simpleColoredBlockGen
  },
  {
    id: GRASS,
    textureIds: {
      xm: idToUV( 3 ), xp: idToUV( 3 ),
      ym: idToUV( 2 ), yp: idToUV( 145 ),
      zm: idToUV( 3 ), zp: idToUV( 3 )
    },
    name: 'grass',
    material: textured,
    geometryGenerator: simpleColoredBlockGen
  },
  {
    id: STONE,
    textureIds: {
      xm: idToUV( 1 ), xp: idToUV( 1 ),
      ym: idToUV( 1 ), yp: idToUV( 1 ),
      zm: idToUV( 1 ), zp: idToUV( 1 )
    },
    name: 'stone',
    material: textured,
    geometryGenerator: simpleColoredBlockGen
  },
  {
    id: WOOD,
    textureIds: {
      xm: idToUV( 20 ), xp: idToUV( 20 ),
      ym: idToUV( 21 ), yp: idToUV( 21 ),
      zm: idToUV( 20 ), zp: idToUV( 20 )
    },
    name: 'wood',
    material: textured,
    geometryGenerator: simpleColoredBlockGen
  },
  {
    id: LEAF,
    textureIds: {
      xm: idToUV( 145 ), xp: idToUV( 145 ),
      ym: idToUV( 145 ), yp: idToUV( 145 ),
      zm: idToUV( 145 ), zp: idToUV( 145 )
    },
    name: 'leaf',
    material: textured,
    geometryGenerator: simpleColoredBlockGen
  }
];

var blockIdLookup = {};
for(var i = 0 ; i < blocks.length ; i ++){
  var miniratureMsh = new InterleavedMesh();
  miniratureMsh.setVertices( generateMiniratureMeshVertices( blocks[i] ) );
  blocks[i].miniratureMesh = miniratureMsh;
  blockIdLookup[ blocks[i].id ] = blocks[i];
}