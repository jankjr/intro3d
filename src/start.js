'use strict';
var CHUNK_SIZE = 32;
var CHUNK_HEIGHT = 128;

var canvas = document.createElement('canvas');
document.body.appendChild( canvas );
document.body.onresize = resize;
var gl = canvas.getContext( 'webgl' );
gl.enable( gl.CULL_FACE );
gl.enable( gl.DEPTH_TEST );


var pagesAllocated = 0;
var pageUpdates = 0;
var drawCalls = 0;

var overlay = document.createElement('div');

overlay.style.position = 'absolute';
overlay.style.left = '0';
overlay.style.top = '0';
overlay.style.width = '100%';
overlay.style.height = '100%';

document.body.appendChild( overlay );

function resize () {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  gl.viewport( 0, 0, canvas.width, canvas.height );
}
resize();


gl.clearColor(0.0,0.0,0.0,1.0);