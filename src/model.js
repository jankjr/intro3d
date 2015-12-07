function Model ( mesh, material, textures ) {
  var x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, scalex = 1, scaley = 1, scalez = 1;


  var tmp1 = mat4.Mat4(),
      tmp2 = mat4.Mat4(),
      tmp3 = mat4.Mat4();

  var mt = mat4.Mat4(), mrx = mat4.Mat4(), mry = mat4.Mat4(), mrz = mat4.Mat4(), ms = mat4.Mat4(), model = mat4.Mat4();

  function setupTransformation () {
    mt  = Mat4.translate( x, y, z, mt );
    mrx = Mat4.rotate( rx, 1, 0, 0, mrx );
    mry = Mat4.rotate( ry, 0, 1, 0, mry );
    mrz = Mat4.rotate( rz, 0, 0, 1, mrz );)
    ms = Mat4.scale( scalex, scaley, scalez, ms );
    model = mat4.mm( [ mry, mrz, mrz, ms, mt ], tmp1, tmp2, model );
  }

  this.render = function ( view ) {
    setupTransformation();
  }

}