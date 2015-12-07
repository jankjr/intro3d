function Mesh () {

  var posBuffer = null, colBuffer = null, norBuffer = null, uvsBuffer = null, indBuffer = null;

  var posBufferVertices = 0;
  var idBufferVertices = 0;

  function bindIndices () {
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indBuffer );
  }

  function bindPosition () {
    gl.bindBuffer( gl.ARRAY_BUFFER, posBuffer );
  }

  function bindColors () {
    gl.bindBuffer( gl.ARRAY_BUFFER, colBuffer );
  }

  function bindNormals () {
    gl.bindBuffer( gl.ARRAY_BUFFER, norBuffer );
  }

  function bindUvs () {
    gl.bindBuffer( gl.ARRAY_BUFFER, uvsBuffer );
  }

  function deleteIfExists ( buffer ) {
    if( buffer ) gl.deleteBuffer( buffer );
  }

  function setIndices (indices) {
    deleteIfExists( indBuffer );
    if( arguments[0] === null ) return;
    idBufferVertices = indices.length;
    indBuffer = gl.createBuffer( gl.ELEMENT_ARRAY_BUFFER );
    bindIndices();
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW );
  }

  function setVertices (vertices) {
    deleteIfExists( posBuffer );
    if( arguments[0] === null ) return;
    posBufferVertices = vertices.length;
    posBuffer = gl.createBuffer( gl.ARRAY_BUFFER );
    bindPosition();
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );
  }

  function setColors (colors) {
    deleteIfExists( colBuffer );
    if( arguments[0] === null ) return;
    colBuffer = gl.createBuffer( gl.ARRAY_BUFFER );
    bindColors();
    gl.bufferData( gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW );
  }

  function setNormals (normals) {
    deleteIfExists( norBuffer );
    if( arguments[0] === null ) return;
    norBuffer = gl.createBuffer( gl.ARRAY_BUFFER );
    bindNormals();
    gl.bufferData( gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW );
  }

  function setUVs (uvs) {
    deleteIfExists( uvsBuffer );
    if( arguments[0] === null ) return;
    uvsBuffer = gl.createBuffer( gl.ARRAY_BUFFER );
    bindUvs();
    gl.bufferData( gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW );
  }

  function draw () {
    if( indBuffer !== null ){
      bindIndices();
      gl.drawElements( gl.TRIANGLES, idBufferVertices, gl.UNSIGNED_SHORT, 0 );
    } else {
      gl.drawArrays( gl.TRIANGLES, 0, posBufferVertices / 3 );
    }
  }

  this.vertexCount = function () {
    if( indBuffer !== null ){
      return idBufferVertices;
    } else {
      return posBufferVertices;
    }
  }

  this.hasNormals = function () {
    return norBuffer !== null;
  }
  this.hasColor = function () {
    return colBuffer !== null;
  }
  this.hasUVs = function () {
    return uvsBuffer !== null;
  }

  this.setIndices = setIndices;
  this.bindPosition = bindPosition;
  this.bindColors = bindColors;
  this.bindNormals = bindNormals;
  this.bindUvs = bindUvs;
  this.setVertices = setVertices;
  this.setColors = setColors;
  this.setNormals = setNormals;
  this.setUVs = setUVs;
  this.draw = draw;
}