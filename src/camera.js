
function Camera ( proj ) {
  var x = 0, y = 0, z = 0, rrx = 0, rry = 0, rrz = 0;
  var fx = 0, fy = 0, fz = -1;
  calcForward();

  var t = Mat4.mat4(),
      rx = Mat4.mat4(),
      ry = Mat4.mat4(),
      rz = Mat4.mat4(),
      tmp1 = Mat4.mat4(),
      tmp2 = Mat4.mat4(),
      tmp3 = Mat4.mat4(),
      view = Mat4.mat4(),
      norm = Mat4.mat4();
  function calcForward () {
    fx = -Math.sin( rry );
    fy = Math.sin( rrx );
    fz = -Math.cos( rry );
    var l = fx * fx + fy * fy + fz * fz;
    fx /= l; fy /= l; fz /= l;
  }
  this.fx = function(){ return fx; }
  this.fy = function(){ return fy; }
  this.fz = function(){ return fz; }
  this.x = function(){ return x; }
  this.y = function(){ return y; }
  this.z = function(){ return z; }

  this.rotate = function ( dx, dy ) {
    rry += dx;
    rrx += dy;
    calcForward();
  }
  this.translate = function (dx, dy, dz) {
    x += dx;
    y += dy;
    z += dz;
  }
  this.setTranslation = function (tx, ty, tz) {
    x = tx;
    y = ty;
    z = tz;
  }
  this.setRotation = function ( dx, dy ) {
    rry = dx;
    rrx = dy;
    calcForward();
  }

  this.calculateMatrices = function(){
    t  = Mat4.translate( x, y, z, t );
    rx = Mat4.rotate( -rrx, 1, 0, 0, rx );
    ry = Mat4.rotate( -rry, 0, 1, 0, ry );
    rz = Mat4.rotate( -rrz, 0, 0, 1, rz );

    tmp3 = Mat4.mm( [ rz, rx, ry, t ], tmp1, tmp2, tmp3 );
    norm.set(view);
    view = Mat4.inverse( tmp3, view );

  }

  this.modelview = function () {
    return view;
  }
  this.normal = function () {
    return norm;
  }
  this.projection = function () {
    return proj;
  }
}