function Texture ( image ) {
  var textureObject = gl.createTexture();
  gl.bindTexture( gl.TEXTURE_2D, textureObject );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array( 4 ) );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  image.onload = function () {
    gl.bindTexture( gl.TEXTURE_2D, textureObject );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );
  }

  this.bind = function () {
    gl.bindTexture( gl.TEXTURE_2D, textureObject );
  }
}

Texture.load = function loadFn ( src ) {
  var img = new Image();
  img.src = src;
  return new Texture( img );
}