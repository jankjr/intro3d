 var Mat4 = (function(){
var ii = 0;
function mat4 () {
  var m = new Float32Array(16);
  for(var i = 0 ; i < arguments.length ; i++) m[i] = arguments[i];
    return m;
}

function transpose(m, r) {
  r = r || mat4();
  r[0] = m[0]; r[1] = m[4]; r[2] = m[8]; r[3] = m[12];
  r[4] = m[1]; r[5] = m[5]; r[6] = m[9]; r[7] = m[13];
  r[8] = m[2]; r[9] = m[6]; r[10] = m[10]; r[11] = m[14];
  r[12] = m[3]; r[13] = m[7]; r[14] = m[11]; r[15] = m[15];
  return r;
};

function inverse(m, r) {
  r = r || mat4();
  r[0] = m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10];
  r[1] = -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10];
  r[2] = m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6];
  r[3] = -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6];

  r[4] = -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10];
  r[5] = m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10];
  r[6] = -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6];
  r[7] = m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6];

  r[8] = m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9];
  r[9] = -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9];
  r[10] = m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5];
  r[11] = -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5];

  r[12] = -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9];
  r[13] = m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9];
  r[14] = -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5];
  r[15] = m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5];

  var det = m[0]*r[0] + m[1]*r[4] + m[2]*r[8] + m[3]*r[12];
  for (var i = 0; i < 16; i++) r[i] /= det;
  return r;
};

function mult(a, b, r) {
  r = r || mat4();

  r[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
  r[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
  r[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
  r[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

  r[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
  r[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
  r[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
  r[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

  r[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
  r[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
  r[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
  r[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

  r[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
  r[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
  r[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
  r[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

  return r;
};

function mm ( matrices, o1, o2, r ) {
  o1 = o1 || mat4();
  o2 = o2 || mat4();
  mult( matrices[0], matrices[1], o1 );
  var o = o1;
  for(var i = 2 ; i < matrices.length ; i ++){
    if( i % 2 === 0 ){
      mult(o1, matrices[i], o2);
      o = o2;
    } else {
      mult(o2, matrices[i], o1);
      o = o1;
    }
  }
  r.set( o );
  return r;
}

function iden( r ){
  r = r || mat4();
  r[0] = r[5] = r[10] = r[15] = 1;
  r[1] = r[2] = r[3] = r[4] = r[6] = r[7] = r[8] = r[9] = r[11] = r[12] = r[13] = r[14] = 0;
  return r;
}

function persp(fov, aspect, near, far, m) {
  m = m || mat4();
  var ylm = near * Math.tan( fov );
  var a = -( far + near ) / ( far - near );
  var b = -2 * far * near / ( far - near );
  var c = (2 * near) / ( (ylm * aspect) * 2 );
  var d = (2 * near) / ( ylm * 2 );

  m[0] = c;
  m[1] = 0.0;
  m[2] = 0.0;
  m[3] = 0.0;

  m[4] = 0.0;
  m[5] = d;
  m[6] = 0.0;
  m[7] = 0.0;

  m[8] = 0.0;
  m[9] = 0.0;
  m[10] = a;
  m[11] = -1.0;

  m[12] = 0;
  m[13] = 0;
  m[14] = b;
  m[15] = 0;
  return m;
};

function frustum (l, r, b, t, n, f, m) {
  m = m || mat4();
  m[0] = 2 * n / (r - l);
  m[1] = 0;
  m[2] = (r + l) / (r - l);
  m[3] = 0;

  m[4] = 0;
  m[5] = 2 * n / (t - b);
  m[6] = (t + b) / (t - b);
  m[7] = 0;

  m[8] = 0;
  m[9] = 0;
  m[10] = -(f + n) / (f - n);
  m[11] = -2 * f * n / (f - n);

  m[12] = 0;
  m[13] = 0;
  m[14] = -1;
  m[15] = 0;
  return m;
};
function ortho(l, r, b, t, n, f, m) {
  var m = m || mat4();

  m[0] = 2 / (r - l);
  m[1] = 0;
  m[2] = 0;
  m[3] = -(r + l) / (r - l);

  m[4] = 0;
  m[5] = 2 / (t - b);
  m[6] = 0;
  m[7] = -(t + b) / (t - b);

  m[8] = 0;
  m[9] = 0;
  m[10] = -2 / (f - n);
  m[11] = -(f + n) / (f - n);

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return m;
};
function scale(x, y, z, m) {
  m = m || mat4();
  m[0] = x;
  m[1] = 0;
  m[2] = 0;
  m[3] = 0;

  m[4] = 0;
  m[5] = y;
  m[6] = 0;
  m[7] = 0;

  m[8] = 0;
  m[9] = 0;
  m[10] = z;
  m[11] = 0;

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return m;
};

function translate(x, y, z, m) {
  m = m || mat4();
  m[0] = 1;
  m[1] = 0;
  m[2] = 0;
  m[3] = 0;

  m[4] = 0;
  m[5] = 1;
  m[6] = 0;
  m[7] = 0;

  m[8] = 0;
  m[9] = 0;
  m[10] = 1;
  m[11] = 0;

  m[12] = x;
  m[13] = y;
  m[14] = z;
  m[15] = 1;

  return m;
};

function rotate(a, x, y, z, m) {
  if (!a || (!x && !y && !z)) {
    return iden(m);
  }

  m = m || mat4();

  var d = Math.sqrt(x*x + y*y + z*z);
  x /= d; y /= d; z /= d;
  var c = Math.cos(a), s = Math.sin(a), t = 1 - c;

  m[0] = x * x * t + c;
  m[1] = x * y * t - z * s;
  m[2] = x * z * t + y * s;
  m[3] = 0;

  m[4] = y * x * t + z * s;
  m[5] = y * y * t + c;
  m[6] = y * z * t - x * s;
  m[7] = 0;

  m[8] = z * x * t - y * s;
  m[9] = z * y * t + x * s;
  m[10] = z * z * t + c;
  m[11] = 0;

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  return m;
};
function print (m) {
  return '| ' + m[0].toFixed(2) + ', ' + m[1].toFixed(2) + ', ' + m[2].toFixed(2) + ', ' + m[3].toFixed(2) + ' |\n' +
         '| ' + m[4].toFixed(2) + ', ' + m[5].toFixed(2) + ', ' + m[6].toFixed(2) + ', ' + m[7].toFixed(2) + ' |\n' +
         '| ' + m[8].toFixed(2) + ', ' + m[9].toFixed(2) + ', ' + m[10].toFixed(2) + ', ' + m[11].toFixed(2) + ' |\n' +
         '| ' + m[12].toFixed(2) + ', ' + m[13].toFixed(2) + ', ' + m[14].toFixed(2) + ', ' + m[15].toFixed(2) + ' |';
}
function lookat(ex, ey, ez, cx, cy, cz, ux, uy, uz, m) {
  m = m || mat4();

  var pos = Vec3.vec3( ex, ey, ez );

  var zAxis = Vec3.vec3( cx - ex, cy - ey, cz - ez );
  zAxis = Vec3.normalize( zAxis );

  var xAxis = Vec3.cross( Vec3.vec3( ux, uy, uz ), zAxis );
  xAxis = Vec3.normalize( xAxis );

  var yAxis = Vec3.cross( xAxis, zAxis );
  yAxis = Vec3.normalize( yAxis );

  m[0]  = xAxis[0];
  m[4]  = xAxis[1];
  m[8]  = xAxis[2];
  m[12] = -Vec3.dot( xAxis, pos );


  m[1]  = yAxis[0];
  m[5]  = yAxis[1];
  m[9]  = yAxis[2];
  m[13] = -Vec3.dot( yAxis, pos );


  m[2]  = zAxis[0];
  m[6]  = zAxis[1];
  m[10] = zAxis[2];
  m[14] = Vec3.dot( zAxis, pos );

  m[3]  = 0.0;
  m[7]  = 0.0;
  m[11]  = 0.0;
  m[15] = 1.0;

  console.log( print(m ));
  return m;
};

return {
  mm : mm,
  mat4: mat4,
  transpose: transpose,
  inverse: inverse,
  mult: mult,
  iden: iden,
  persp: persp,
  frustum: frustum,
  ortho: ortho,
  scale: scale,
  translate: translate,
  rotate: rotate,
  lookat: lookat
};
})();
