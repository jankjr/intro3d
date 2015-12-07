var Vec3 = (function () {

function vec3 () {
  var vec = new Float32Array(3);
  for(var i = 0 ; i < arguments.length ; i ++){
    vec[i] = arguments[i];
  }
  return vec;
}

function sub(v1, v2, r){
  r = r || vec3();
  r[0] = v1[0] - v2[0];
  r[1] = v1[1] - v2[1];
  r[2] = v1[2] - v2[2];
  return r;
}
function add(v1, v2, r){
  r = r || vec3();
  r[0] = v1[0] + v2[0];
  r[1] = v1[1] + v2[1];
  r[2] = v1[2] + v2[2];
  return r;
}
function mul(v1, v2, r){
  r = r || vec3();
  r[0] = v1[0] * v2[0];
  r[1] = v1[1] * v2[1];
  r[2] = v1[2] * v2[2];
  return r;
}
function dot(v1, v2){
  return v1[0] * v2[0] +
         v1[1] * v2[1] +
         v1[2] * v2[2];
}
function cross (v1, v2, r) {
  r = r || vec3();
  r[0] = v1[1] * v2[2] - v1[2] * v2[1];
  r[1] = v1[2] * v2[0] - v1[0] * v2[2];
  r[2] = v1[0] * v2[1] - v1[1] * v2[0];
  return r;
}

function length (v) {
  return Math.sqrt( dot(v, v) );
}

function normalize (v, r) {
  r = r || vec3();
  var l = length( v );
  r[0] = v[0] / l;
  r[1] = v[1] / l;
  r[2] = v[2] / l;
  return r;
}

return {
  vec3: vec3,
  sub: sub,
  add: add,
  mul: mul,
  dot: dot,
  cross: cross,
  length: length,
  normalize: normalize
};
})();