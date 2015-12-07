

var seed = 1;
function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

var OCTAVES = 3;
function terrain ( x, y ) {
  var effect = 1.0, size = 0.01;
  var value = 0.0;
  for (var i = 0; i < OCTAVES; i++) {
    value += noise.simplex2( x * size, y * size ) * effect;
    effect *= 0.25;
    size *= 4.0;
  };
  return value * 0.5 + 0.5;
}


var tunels = [], worms = [];

function updateWorms ( x, z ) {
  for(var i = 0 ; i < Math.floor( random() * 3 ) ; i ++){
    var xstart = x + ( random() * 2.0 - 1.0 ) * 16;
    var zstart = z + ( random() * 2.0 - 1.0 ) * 16;
    worms.push({
      p: random() * 100,
      s: 2 + random() * 4,
      x: xstart,
      y: 16 + ( random() * 2.0 - 1.0 ) * 16,
      z: zstart
    });
  }
  for( var count = 0 ; count < 100 ; count++){
    for (var i = 0; i < worms.length; i++) {
      var worm = worms[i];
      var x = worm.x,
          y = worm.y,
          z = worm.z,
          s = worm.s;

      worm.s += noise.simplex2( x, y ) * 0.1;
      worm.s *= 0.99;
      worm.x += noise.simplex2( x + 13, y - 437 ) * worm.s * 2;
      worm.y += noise.simplex2( x - 12312, y + 132 )* worm.s * 2;
      worm.z += noise.simplex2( x - 123, y - 237 )* worm.s * 2;

      tunels.push( {
        x : Math.floor( x ), y : Math.floor( y ), z : Math.floor( z ), s : Math.floor( s )
      } );
    };
  }
  worms = worms.filter( function (w) {
    return w.s >= 1;
  })
}

var planeWorldGen = function ( world, c, wx, wz ) {
  for(var x = 0 ; x < CHUNK_SIZE ; x ++){
    for(var z = 0 ; z < CHUNK_SIZE ; z ++) {
      var height = terrain( ( x + wx ), ( z + wz ) ) * 0.5 + 0.5;
      height = Math.floor( height * CHUNK_HEIGHT / 2 );
      for(var y = height - 1 - 16 ; y < height - 1 ; y ++ ) {
        if( noise.simplex3( ( x + wx ) * 0.1, y * 0.1, ( z + wz + 10024 ) * 0.1 ) > 0.25){
          c.set( x, y, z, 3 );
        } else {
          c.set( x, y, z, 1 );
        }
      }
      for(var y = 0 ; y < height - 1 - 16 ; y ++ ) {
        if( noise.simplex3( ( x + wx ) * 0.1, y * 0.1, ( z + wz + 10024 ) * 0.1 ) > 0.4){
          c.set( x, y, z, 1 );
        } else {
          c.set( x, y, z, 3 );
        }
      }
      c.set( x, height - 1, z, 2);
      if( x >= 5 && x < CHUNK_SIZE - 4 &&
          z >= 5 && z < CHUNK_SIZE - 4 &&
          height + 10 < CHUNK_HEIGHT && noise.simplex2( x * 2, z * 2 ) > 0.98 ){
        for(var y = height ; y < height + 10 ; y ++ ) {
          c.set( x, y, z, 4 );
        }
        for(var xx = -3 ; xx <= 3 ; xx++ )
        for(var yy = -3 ; yy <= 3 ; yy++ )
        for(var zz = -3 ; zz <= 3 ; zz++ ) {
          if( xx * xx + yy * yy + zz * zz < 15 ){
            c.set( x + xx, height + 6 + yy, z + zz, 5 );
          }
        }
      }
    }
  }
  for (var i = 0; i < tunels.length; i++) {
    var tunel = tunels[i];
    var s = Math.floor( tunel.s );
    if( wx <= tunel.x - s && tunel.x + s < wx + CHUNK_SIZE &&
        wz <= tunel.z - s && tunel.z + s < wz + CHUNK_SIZE &&
        tunel.y - s >= 0 && tunel.y + s < CHUNK_HEIGHT ){
      var x = World.wrap( tunel.x );
      var z = World.wrap( tunel.z );

      for(var xx = -s ; xx <= s ; xx++ )
      for(var yy = -s ; yy <= s ; yy++ )
      for(var zz = -s ; zz <= s ; zz++ ) {
        if( xx * xx + yy * yy + zz * zz < tunel.s * tunel.s ){
          c.set( x + xx, tunel.y + yy, z + zz, 0 );
        }
      }
    }
  };

  return c;
};

var cw = ( canvas.width / 32 );
var ch = ( canvas.height / 32 );
var perspectiveCamera = new Camera( Mat4.persp( Math.PI * 0.25, canvas.width / canvas.height, 0.001, 1000.0 ) ),
    orthoCamera       = new Camera( Mat4.transpose( Mat4.ortho( -cw, cw, -ch, ch, 0.1, 100.0 ) ) );

orthoCamera.setTranslation( 0, 64, 0 );
orthoCamera.setRotation( 0, -Math.PI * 0.5 );

var viewpoint = perspectiveCamera;
var mode = 0;

Input.m.on.down( function () {
  if(mode === 0) {
    viewpoint = orthoCamera;
    mouseIsOverSpan.textContent = 'Orthographic';
    mode = 1;
    return;
  }
  if( mode === 1 ){
    mode = 0;
    mouseIsOverSpan.textContent = 'Perspective';
    viewpoint = perspectiveCamera;
    return;
  }
});

var world = new World( planeWorldGen, blocks );

var sensitivity = 0.003;
var speed = 0.1;

Input.mouse.left.while.down( function (x, y, dx, dy) {
  perspectiveCamera.rotate( dx * sensitivity, dy * sensitivity );
});
Input.shift.while.down( function () {
  speed = 1;
});
Input.shift.while.up( function () {
  speed = 0.1;
});


var currentBlock, currentNormal;
Input.mouse.on.move( function (x, y) {
  currentBlock  = world.pickBlock( x, canvas.height - y );
  currentNormal = world.pickNormal( x, canvas.height - y );

  mouseInfoSpan.textContent = 'Coordinate: ' + currentBlock.x + ', ' + currentBlock.y + ', ' + currentBlock.z + ' Normal: '
                                                   + currentNormal.x + ', ' + currentNormal.y + ', ' + currentNormal.z;

});

Input.q.on.down(function () {
  world.setBlockAt( currentBlock.x, currentBlock.y, currentBlock.z, 0 );
});

var currentSelectedBlock = 1;
Input.one.on.down(function () {
  currentSelectedBlock = 1;
});
Input.two.on.down(function () {
  currentSelectedBlock = 2;
});
Input.three.on.down(function () {
  currentSelectedBlock = 3;
});
Input.four.on.down(function () {
  currentSelectedBlock = 4;
});
Input.five.on.down(function () {
  currentSelectedBlock = 5;
});


Input.e.on.down(function () {
  world.setBlockAt( currentBlock.x + currentNormal.x, currentBlock.y + currentNormal.y, currentBlock.z + currentNormal.z, currentSelectedBlock );
});

Input.w.while.down(function () {
  if( mode === 1){
    return viewpoint.translate( 0,0,speed);
  }
  viewpoint.translate( viewpoint.fx() * speed,
                       viewpoint.fy() * speed,
                       viewpoint.fz() * speed );
});

Input.s.while.down(function () {
  if( mode === 1){
    return viewpoint.translate( 0,0,-speed);
  }
  viewpoint.translate( -viewpoint.fx() * speed,
                       -viewpoint.fy() * speed,
                       -viewpoint.fz() * speed );
});

Input.a.while.down(function () {
  if( mode === 1){
    return viewpoint.translate( speed,0,0);
  }
  viewpoint.translate( viewpoint.fz() * speed, 0.0, -viewpoint.fx() * speed );
});

Input.d.while.down(function () {
  if( mode === 1){
    return viewpoint.translate( -speed,0,0);
  }
  viewpoint.translate( -viewpoint.fz() * speed, 0.0, viewpoint.fx() * speed );
});




perspectiveCamera.setTranslation( 0, 50, 0 );
perspectiveCamera.setRotation( 0, 0 );


var mouseIsOver = document.createElement('p');
mouseIsOver.textContent = 'Current view (m to change): ';
var mouseIsOverSpan = document.createElement('span');
mouseIsOver.appendChild( mouseIsOverSpan );
mouseIsOverSpan.textContent = 'Perspective';
overlay.appendChild( mouseIsOver );


var position = document.createElement('p');
position.textContent = 'Position (WASD to move): ';
var positionSpan = document.createElement('span');
position.appendChild( positionSpan );
positionSpan.textContent = 'Perspective';
overlay.appendChild( position );


var pageUpdatesE = document.createElement('p');
pageUpdatesE.textContent = 'World rendering info: ';
var pageUpdatesESpan = document.createElement('span');
pageUpdatesE.appendChild( pageUpdatesESpan );
pageUpdatesESpan.textContent = '0';
overlay.appendChild( pageUpdatesE );

var mouseInfo = document.createElement('p');
mouseInfo.textContent = 'Mouse is over: ';
var mouseInfoSpan = document.createElement('span');
mouseInfo.appendChild( mouseInfoSpan );
mouseInfoSpan.textContent = '0';
overlay.appendChild( mouseInfo );


var handInfo = document.createElement('p');
handInfo.textContent = 'Current block selected (use 1..5 to select, and "e" to place, "q" to remove): ';
var handInfoSpan = document.createElement('span');
handInfo.appendChild( handInfoSpan );
handInfoSpan.textContent = '0';
overlay.appendChild( handInfo );


var wf = new Material( 'wireframe', [  'vec3 aPosition' ],
                                    [ 'mat4 projectionMatrix',
                                      'mat4 modelviewMatrix' ] );



function updateWireFrameLine ( i, x0, y0, z0, x1, y1, z1 ) {
  wireframe[ i * 6 + 0 ] = x0;
  wireframe[ i * 6 + 1 ] = y0;
  wireframe[ i * 6 + 2 ] = z0;
  wireframe[ i * 6 + 3 ] = x1;
  wireframe[ i * 6 + 4 ] = y1;
  wireframe[ i * 6 + 5 ] = z1;

}
function updateWireFrame(){
  if(currentBlock === undefined)return;
  if(currentNormal === undefined)return;
  var x = currentBlock.x + currentNormal.x,
      y = currentBlock.y + currentNormal.y,
      z = currentBlock.z + currentNormal.z;

  updateWireFrameLine( 0, x + 0, y + 0, z + 0, x + 0, y + 1, z + 0 );
  updateWireFrameLine( 1, x + 1, y + 0, z + 0, x + 1, y + 1, z + 0 );
  updateWireFrameLine( 2, x + 0, y + 0, z + 1, x + 0, y + 1, z + 1 );
  updateWireFrameLine( 3, x + 1, y + 0, z + 1, x + 1, y + 1, z + 1 );

  updateWireFrameLine( 4, x + 0, y + 0, z + 0, x + 1, y + 0, z + 0 );
  updateWireFrameLine( 5, x + 1, y + 0, z + 0, x + 1, y + 0, z + 1 );
  updateWireFrameLine( 6, x + 1, y + 0, z + 1, x + 0, y + 0, z + 1 );
  updateWireFrameLine( 7, x + 0, y + 0, z + 1, x + 0, y + 0, z + 0 );

  updateWireFrameLine( 8, x + 0, y + 1, z + 0, x + 1, y + 1, z + 0 );
  updateWireFrameLine( 9, x + 1, y + 1, z + 0, x + 1, y + 1, z + 1 );
  updateWireFrameLine( 10, x + 1, y + 1, z + 1, x + 0, y + 1, z + 1 );
  updateWireFrameLine( 11, x + 0, y + 1, z + 1, x + 0, y + 1, z + 0 );
}
var wfbuffer = gl.createBuffer(),
    wireframe = new Float32Array( 12 * 2 * 3 );

function loop () {
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
  // key events in the DOM happen at different times than
  // event loop runs in application.
  // So, we capture keys at all times. But inside the application inputs
  // happen NOW.
  Input.propagateKeyPresses();
  viewpoint.calculateMatrices();


  positionSpan.textContent = viewpoint.x().toFixed(2) + ', ' + viewpoint.y().toFixed(2) + ', ' + viewpoint.z().toFixed(2);
  pageUpdatesESpan.textContent = 'Updates:' + pageUpdates + ', Allocated: ' + pagesAllocated + ', draw calls:' + drawCalls;
  handInfoSpan.textContent = blockIdLookup[ currentSelectedBlock ].name;

  drawCalls = 0;
  pageUpdates = 0;

  wf.use();
  wf.modelviewMatrix( viewpoint.modelview() );
  wf.projectionMatrix( viewpoint.projection() );
  wf.setUniforms();

  updateWireFrame();
  gl.bindBuffer( gl.ARRAY_BUFFER, wfbuffer );
  gl.bufferData( gl.ARRAY_BUFFER, wireframe, gl.DYNAMIC_DRAW );
  wf.aPosition();
  gl.lineWidth( 2.0 );
  gl.drawArrays( gl.LINES, 0, wireframe.length / 3 );
  gl.lineWidth( 1.0 );

  // Render terrain on top
  world.update( viewpoint );
  world.render( viewpoint );

  window.requestAnimationFrame( loop );
}
loop();
