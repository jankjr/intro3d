function InterleavedMesh () {
  var vertexBuffer = gl.createBuffer();
  function bind () {
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
  }
  var vertexCount = 0;
  this.setVertices = function (vertices) {
    if( vertexBuffer !== null ) gl.deleteBuffer( vertexBuffer );
    vertexBuffer = gl.createBuffer();
    bind();
    vertexCount = vertices.length;
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW );
  }

  this.draw = function ( material ) {
    bind();
    material.bindInterleavedVertexPointers();
    gl.drawArrays( gl.TRIANGLES, 0, vertexCount / material.components );
  }
}