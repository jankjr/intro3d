
function compileShader ( type, str ) {
  var shader = gl.createShader( type );
  gl.shaderSource( shader, str );
  gl.compileShader( shader );
  if( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ){
    console.error( gl.getShaderInfoLog( shader ));
    alert( 'Could not compile shader, see console for error log!' );
    throw new RuntimeException( 'ShaderCompilation', 'Could not compile shader, see console for error log!' );
  }
  return shader;
}

function createProgram ( vertexShader, fragmentShader ) {
  var program = gl.createProgram();
  gl.attachShader( program, vertexShader );
  gl.attachShader( program, fragmentShader );
  gl.linkProgram( program );
  if( !gl.getProgramParameter( program, gl.LINK_STATUS ) ){
    console.error( gl.getProgramInfoLog( program ));
    alert( 'Could not link program, see console for error log!' );
    throw new RuntimeException( 'ProgramLink', 'Could not link program, see console for error log!' );
  }
  gl.validateProgram( program );
  if( !gl.getProgramParameter( program, gl.VALIDATE_STATUS ) ){
    console.error( gl.getProgramInfoLog( program ));
    alert( 'Could not validate program, see console for error log!' );
    throw new RuntimeException( 'ProgramValidation', 'Could not validate program, see console for error log!' );
  }
  return program;
}