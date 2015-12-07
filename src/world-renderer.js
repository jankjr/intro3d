var worldTexture = Texture.load( 'res/textures.png' );
var sphereGeometry = sphereMesh( 32, 32, 1 );
var sunMoonMat = new Material( 'sunMoon', [ 'vec3 aPosition',
                                            'vec2 aUV' ],
                                          [ 'mat4 projectionMatrix',
                                            'mat4 modelviewMatrix',
                                            'mat4 normalMatrix',
                                            'mat4 modelMatrix',
                                            'sampler2D objectTexture' ] );


var modelMatrix = Mat4.mat4();



var blockPicker = new Material( 'blockPicker', [  'vec3 aPosition',
                                            'vec3 aNormal',
                                            'vec2 aUV',
                                            'vec4 aID' ],
                                          [ 'mat4 projectionMatrix',
                                            'mat4 modelviewMatrix',
                                            'vec3 cameraPosition' ] );

var normalPicker = new Material( 'normalPicker', [  'vec3 aPosition',
                                                    'vec3 aNormal',
                                                    'vec2 aUV',
                                                    'vec4 aID' ],
                                                  [ 'mat4 projectionMatrix',
                                                    'mat4 modelviewMatrix',
                                                    'vec3 cameraPosition' ] );


var moonTexture = Texture.load( 'res/moon.jpg' );
var sunTexture = Texture.load( 'res/sun.jpg' );



function WorldRenderer ( blockDescriptions ) {
  var materials = { },
      memory = [];

  var offsideScreen = new Uint8Array( 4 );
  // Prepare buffer
  var rttFramebuffer = gl.createFramebuffer();
  var rttTexture = gl.createTexture();
  var renderbuffer = gl.createRenderbuffer();
  canvas.onresize = resize;
  function resize () {
    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
    rttFramebuffer.width = canvas.width;
    rttFramebuffer.height = canvas.height;
    gl.bindTexture(gl.TEXTURE_2D, rttTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer.width, rttFramebuffer.height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  }
  resize();

  var sunDir = Vec3.normalize( Vec3.vec3( -1, 1, -1 ) );
  var moonDir = Vec3.normalize( Vec3.vec3( 1, 1, -1 ) );
  var timeOfDay = 0.0;

  var worldAmbience = [ 0.1, 0.1, 0.1 ];

  for (var i = 0; i < blockDescriptions.length; i++) {
    var blockDesc = blockDescriptions[i];
    if( materials[ blockDesc.id ] === undefined ){
      var mem = new VertexMemory( blockDesc.material.components );
      materials[ blockDesc.id ] = {
        memory: mem,
        material: blockDesc.material
      };
      memory.push( mem );
    }
  }

  var tmp1 = Mat4.mat4(),
      tmp2 = Mat4.mat4(),
      tmp3 = Mat4.mat4(),
      ry  = Mat4.mat4(),
      s   = Mat4.mat4(),
      translation   = Mat4.mat4(),
      miniratures = [];

  this.miniratures = miniratures;
  function renderMiniratures () {
    textured.use();

    // bind camera transform 'n stuff
    textured.projectionMatrix( viewpoint.projection() );
    textured.normalMatrix( viewpoint.normal() );
    textured.worldTexture( worldTexture );
    textured.cameraPosition( [ viewpoint.x(), viewpoint.y(), viewpoint.z() ] );
    textured.worldAmbientColor( worldAmbience );
    textured.sunDir( sunDir );
    textured.moonDir( moonDir );

    // calcuate proper viewpoints
    for (var i = 0; i < miniratures.length; i++) {
      var mini = miniratures[i];
      mini.r += 0.1;
      Mat4.scale( 0.25, 0.25, 0.25, s );
      Mat4.rotate( mini.r, 0, 1, 0, ry );
      Mat4.translate( mini.x, mini.y, mini.z, translation );
      tmp3 = Mat4.mm( [ s, ry, translation, viewpoint.modelview() ], tmp1, tmp2, tmp3 );
      textured.modelviewMatrix( tmp3 );
      textured.setUniforms();
      mini.mesh.draw( textured );
    };
  }
  this.readBlock = function (x, y) {
    return this.readBlockInfoAt( x, y, blockPicker );
  }

  this.readNormal = function (x, y) {
    return this.readBlockInfoAt( x, y, normalPicker );
  }

  this.readBlockInfoAt = function (x, y, picker) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    picker.use();
    for (var i in materials ) {
      var memory = materials[ i ].memory;
      picker.modelviewMatrix( viewpoint.modelview() );
      picker.projectionMatrix( viewpoint.projection() );
      picker.cameraPosition( [ viewpoint.x(), viewpoint.y(), viewpoint.z() ] );
      picker.setUniforms();
      memory.render( picker );
    };
    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
    gl.readPixels( x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, offsideScreen );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { x: offsideScreen[0], y: offsideScreen[1], z: offsideScreen[2], w: offsideScreen[3] }
  }

  this.getVertexMemoryForMaterial = function (id) {
    return materials[ id ].memory;
  }
  this.render = function ( viewpoint ) {
    timeOfDay += 0.001;



    // render sun and moon
    sunMoonMat.use();
    sunMoonMat.modelviewMatrix( perspectiveCamera.modelview() );
    sunMoonMat.projectionMatrix( perspectiveCamera.projection() );
    sunMoonMat.normalMatrix( perspectiveCamera.normal() );
    sphereGeometry.bindPosition();
    sunMoonMat.aPosition();

    sphereGeometry.bindUvs();
    sunMoonMat.aUV();

    gl.disable( gl.DEPTH_TEST );
    var moonx = Math.sin( timeOfDay ) * 16;
    var moony = Math.cos( timeOfDay ) * 16;
    moonDir = Vec3.normalize( Vec3.vec3( moonx, moony, 16 ) );
    Mat4.translate( perspectiveCamera.x() +  moonx, perspectiveCamera.y() +  moony, perspectiveCamera.z() + 16, modelMatrix );

    sunMoonMat.modelMatrix( modelMatrix );
    sunMoonMat.objectTexture( moonTexture );
    sunMoonMat.setUniforms();
    sphereGeometry.draw();

    var sunx = Math.cos( timeOfDay ) * 16;
    var suny = Math.sin( timeOfDay ) * 16;
    sunDir = Vec3.normalize( Vec3.vec3( sunx, suny, -16 ) );
    Mat4.translate( perspectiveCamera.x() +  sunx, perspectiveCamera.y() +  suny, perspectiveCamera.z() - 16, modelMatrix );

    sunMoonMat.modelMatrix( modelMatrix );
    sunMoonMat.objectTexture( sunTexture );
    sunMoonMat.setUniforms();
    sphereGeometry.draw();
    gl.enable( gl.DEPTH_TEST );

    renderMiniratures();
    for (var i in materials ) {
      var material = materials[ i ].material;
      var memory = materials[ i ].memory;
      material.use();

      // bind camera transform 'n stuff
      material.modelviewMatrix( viewpoint.modelview() );
      material.projectionMatrix( viewpoint.projection() );
      material.normalMatrix( viewpoint.normal() );
      material.worldTexture( worldTexture );
      material.cameraPosition( [ viewpoint.x(), viewpoint.y(), viewpoint.z() ] );
      material.worldAmbientColor( worldAmbience );

      material.sunDir( sunDir );
      material.moonDir( moonDir );

      material.setUniforms();

      memory.render( material );
    };
  }
}