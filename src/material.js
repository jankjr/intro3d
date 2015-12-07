

var Material = (function(){
  var materialId = 0;
  return function Material ( shaderId, attributes, uniforms ) {
    var source = document.getElementById( shaderId ).text;
    source = source.split( '#FS:' );
    var vertexSource   = source[0];
    var fragmentSource = source[1];


    var sattributes = attributes.map(function (a) {
      return 'attribute ' + a;
    });
    var suniforms = uniforms.map(function (a) {
      return 'uniform ' + a;
    });

    vertexSource   = sattributes.join(';\n') + ';\n' +
                     suniforms.join(';\n') + ';' +
                     vertexSource;

    fragmentSource = 'precision highp float;' +
                     suniforms.join(';\n') + ';\n' +
                     fragmentSource;
    var vertexShader   = compileShader( gl.VERTEX_SHADER, vertexSource );
    var fragmentShader = compileShader( gl.FRAGMENT_SHADER,fragmentSource );

    var program        = createProgram( vertexShader, fragmentShader );

    this.use = function () {
      gl.useProgram( program );
    }

    this.use();
    this.id = materialId++;
    function splitTypeName (str) {
      var typeName = str.split(' ');
      return {
        type : typeName[0],
        name : typeName[1]
      }
    }
    uniforms = uniforms.map( splitTypeName );
    var samplers = 0;
    var o = this;
    uniforms.forEach( function (uniform) {
      uniform.location = gl.getUniformLocation( program, uniform.name );
      uniform.data = null;
      o[ uniform.name ] = function (d) {
        uniform.data = d;
      }
      if( uniform.type === 'sampler2D' ){
        uniform.textureIndex = ( samplers ++ );
      }
      uniform.set = {
        vec3 : function () {
          if( uniform.data === null )return;
          gl.uniform3fv( uniform.location, uniform.data );
        },
        mat4 : function () {
          if( uniform.data === null )return;
          gl.uniformMatrix4fv( uniform.location, false, uniform.data );
        },
        sampler2D: function () {
          if( uniform.data === null )return;
          gl.activeTexture( gl.TEXTURE0 + uniform.textureIndex );
          uniform.data.bind();
          gl.uniform1i( uniform.location, uniform.textureIndex );
        }
      }[ uniform.type ]

      if( !uniform.set ) throw new RuntimeException( 'NotImplemented', 'Uniform Type ' + uniform.type );
    } );
    attributes = attributes.map( splitTypeName );
    var vertexAttributes = [], offset = 0;
    var components = 0;
    attributes.forEach( function (attribute) {
      var loc = gl.getAttribLocation( program, attribute.name );
      attribute.location = loc;
      attribute.offset = offset;

      // Used for binding individual vertex buffers
      o[ attribute.name ] = function () {
        gl.enableVertexAttribArray( attribute.location );
        gl.vertexAttribPointer( attribute.location, attribute.components, gl.FLOAT, false, 0, 0 );
      }

      attribute.components = {
        'float' : 1,
        vec2 : 2,
        vec3 : 3,
        vec4 : 4
      }[ attribute.type ]
      if( !attribute.components ) throw new RuntimeException( 'NotImplemented', 'Attribute Type ' + attribute.type );
      offset += attribute.components * 4;
      components += attribute.components;
      if( loc >= 0 ){
        vertexAttributes.push( attribute );
      }
    } );
    var stride = offset;
    this.components = components;
    this.vertexSize = stride;
    this.bindInterleavedVertexPointers = function ( ) {
      vertexAttributes.forEach( function ( a ) {
        gl.enableVertexAttribArray( a.location );
        gl.vertexAttribPointer( a.location, a.components, gl.FLOAT, false, stride, a.offset );
      } );
    }
    this.setUniforms = function () {
      for (var i = 0; i < uniforms.length; i++) {
        uniforms[i].set();
      };
    }
    this.unbindVertexPointers = function () {
      vertexAttributes.forEach( function (a) {
        gl.disableVertexAttribArray( a.location );
      });
    }
  }
})();