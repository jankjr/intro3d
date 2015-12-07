
// Functions for pushing sides data
function ZMSide ( page, i, o, x, y, z ) {
  page.set( i + 0, o, x + 0, y + 1, z + 0 );
  page.set( i + 1, o, x + 1, y + 1, z + 0 );
  page.set( i + 2, o, x + 0, y + 0, z + 0 );

  page.set( i + 3, o, x + 1, y + 0, z + 0 );
  page.set( i + 4, o, x + 0, y + 0, z + 0 );
  page.set( i + 5, o, x + 1, y + 1, z + 0 );
}
function ZPSide ( page, i, o, x, y, z ) {
  page.set( i + 0, o, x + 1, y + 1, z + 1 );
  page.set( i + 1, o, x + 0, y + 1, z + 1 );
  page.set( i + 2, o, x + 1, y + 0, z + 1 );

  page.set( i + 3, o, x + 0, y + 0, z + 1 );
  page.set( i + 4, o, x + 1, y + 0, z + 1 );
  page.set( i + 5, o, x + 0, y + 1, z + 1 );
}
function YMSide ( page, i, o, x, y, z ) {
  page.set( i + 0, o, x + 0, y + 0, z + 0 );
  page.set( i + 1, o, x + 1, y + 0, z + 0 );
  page.set( i + 2, o, x + 0, y + 0, z + 1 );

  page.set( i + 3, o, x + 1, y + 0, z + 1 );
  page.set( i + 4, o, x + 0, y + 0, z + 1 );
  page.set( i + 5, o, x + 1, y + 0, z + 0 );
}
function YPSide ( page, i, o, x, y, z ) {
  page.set( i + 0, o, x + 1, y + 1, z + 0 );
  page.set( i + 1, o, x + 0, y + 1, z + 0 );
  page.set( i + 2, o, x + 1, y + 1, z + 1 );

  page.set( i + 3, o, x + 0, y + 1, z + 1 );
  page.set( i + 4, o, x + 1, y + 1, z + 1 );
  page.set( i + 5, o, x + 0, y + 1, z + 0 );
}
function XMSide ( page, i, o, x, y, z ) {
  page.set( i + 0, o, x + 0, y + 1, z + 1 );
  page.set( i + 1, o, x + 0, y + 1, z + 0 );
  page.set( i + 2, o, x + 0, y + 0, z + 1 );

  page.set( i + 3, o, x + 0, y + 0, z + 0 );
  page.set( i + 4, o, x + 0, y + 0, z + 1 );
  page.set( i + 5, o, x + 0, y + 1, z + 0 );
}
function XPSide ( page, i, o, x, y, z ) {
  page.set( i + 0, o, x + 1, y + 1, z + 0 );
  page.set( i + 1, o, x + 1, y + 1, z + 1 );
  page.set( i + 2, o, x + 1, y + 0, z + 0 );

  page.set( i + 3, o, x + 1, y + 0, z + 1 );
  page.set( i + 4, o, x + 1, y + 0, z + 0 );
  page.set( i + 5, o, x + 1, y + 1, z + 1 );
}
// Pushes 'same' data to all vertices
function sameSide ( page, i, o, x, y, z ) {
  page.set( i + 0, o, x, y, z );
  page.set( i + 1, o, x, y, z );
  page.set( i + 2, o, x, y, z );

  page.set( i + 3, o, x, y, z );
  page.set( i + 4, o, x, y, z );
  page.set( i + 5, o, x, y, z );
}
function sameSide4 ( page, i, o, x, y, z, w ) {
  page.set( i + 0, o, x, y, z, w );
  page.set( i + 1, o, x, y, z, w );
  page.set( i + 2, o, x, y, z, w );

  page.set( i + 3, o, x, y, z, w );
  page.set( i + 4, o, x, y, z, w );
  page.set( i + 5, o, x, y, z, w );
}
function UVSide ( page, i, o, uvs ) {
  page.set( i + 0, o, uvs.u0, uvs.v0 );
  page.set( i + 1, o, uvs.u1, uvs.v0 );
  page.set( i + 2, o, uvs.u0, uvs.v1 );

  page.set( i + 3, o, uvs.u1, uvs.v1 );
  page.set( i + 4, o, uvs.u0, uvs.v1 );
  page.set( i + 5, o, uvs.u1, uvs.v0 );
}


function makeBlockGenerator ( def ) {
  return function( world, blockDef, sidesEncoding, page, x, y, z, i, xx, yy, zz ) {
    if( sidesEncoding & 1 )  def.xm( world, blockDef, page.alloc( 6 ), page, x, y, z, i, xx, yy, zz );
    if( sidesEncoding & 2 )  def.xp( world, blockDef, page.alloc( 6 ), page, x, y, z, i, xx, yy, zz );
    if( sidesEncoding & 4 )  def.ym( world, blockDef, page.alloc( 6 ), page, x, y, z, i, xx, yy, zz );
    if( sidesEncoding & 8 )  def.yp( world, blockDef, page.alloc( 6 ), page, x, y, z, i, xx, yy, zz );
    if( sidesEncoding & 16 ) def.zm( world, blockDef, page.alloc( 6 ), page, x, y, z, i, xx, yy, zz );
    if( sidesEncoding & 32 ) def.zp( world, blockDef, page.alloc( 6 ), page, x, y, z, i, xx, yy, zz );
  }
}