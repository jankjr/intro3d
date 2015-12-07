

function sphereMesh( hrings, vrings, radius ) {
  var mesh = new Mesh();
  var vertices = [],
      uvs      = [],
      indices  = [];

  var phiStart = 0;
  var phiLength = Math.PI * 2;
  var thetaStart = 0;
  var thetaLength = Math.PI;

  var i = 0;
  for ( var y = 0; y <= vrings; y ++ ) {
    for ( var x = 0; x <= hrings; x ++, i++ ) {
      var u = x / hrings;
      var v = y / vrings;


      var vx = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
      var vy =   radius * Math.cos( thetaStart + v * thetaLength );
      var vz =   radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

      if( y !== vrings && x !== vrings ){
        indices.push( i + 1 );
        indices.push( i );
        indices.push( i + vrings + 1 );

        indices.push( i + vrings + 1 );
        indices.push( i + vrings + 2 );
        indices.push( i + 1 );
      }

      uvs.push( u, v );
      vertices.push( vx, vy, vz );
    }
  }
  mesh.setVertices( new Float32Array( vertices ) );
  mesh.setUVs( new Float32Array( uvs ) );
  mesh.setIndices( new Uint16Array( indices ) );
  return mesh;
}