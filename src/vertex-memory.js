// Observation:
//    Objects are made up of quads,
//    this means each allocation is of a 'fixed' size.

// Observation:
//    This means, if a chunk contained a list of all allocated quads.
//    This means chunks could keep lists of allocated quads that we could easily free / allocate

// Problem:
//     If chunks are 32 by 128 by 32, we potentially have a LOT of quads
//     We need a granular way of allocating and keeping track of memory

// Solution:
//    Allocate larger 'pages' instead singular quads. Pages are objects that act as buffers.
//    Pages can allocate space for quads within the page, and most importantly, are linked lists that allocate
//    more linked pages when one page runs out of memory.

// Why is this awesome?
//    Chunks will allocate pages on demand, and deallocate them all when used up.

// Problem:
//    chunks are still big, and they need to be updated. Since we will not keep track of
//    which block belong to which page (The whole reason we dropped individual blocks),
//    we will have to drop the whole chain of pages each time.

// Solution:
//    Furhter divide chunk rendering/geometry into subchunks. Subchunks will each manage their own pages.
//    Modifying a block will at most drop the pages associated with a subchunk.

// To recap:
// VertexMemoryManager is an object that allows allocating pages. Pages are spread out over vertexbuffers.
// Pages act as objects that allow for fast and grandular memory allocation/deallocation.


var VertexMemory = (function () {
var PAGE_SIZE = 16 * 16 * 6;
var PAGES_PR_BUFFER = 256;

function VertexPage ( mgr, vb, vertexSize, position, pageId ) {
  var data = vb.allData.subarray( position * vertexSize * PAGE_SIZE, ( position + 1 ) * vertexSize * PAGE_SIZE ),
      next = null,
      used = 0,
      dirty = true;

  var obj = this;
  obj.vb = vb;
  obj.pageId =pageId;
  obj.alive = false;

  this.set = function (i, off) {
    if( i >= PAGE_SIZE ) {
      if( next === null ){
        next = mgr.allocPage();
      }
      arguments[0] -= PAGE_SIZE;
      return next.set.apply( null, arguments );
    }
    dirty = true;
    for(var v = 2 ; v < arguments.length ; v ++){
      data[ i * vertexSize + off + v - 2 ] = arguments[ v ];
    }
  }

  this.alloc = function ( n ) {
    if( used + n > data.length ){
      if( next === null ){
        next = mgr.allocPage();
      }
      return next.alloc.apply(null, arguments) + used;
    }
    var pos = used;
    used += n;
    return pos;
  }

  this.update = function () {
    if( dirty ) {
      pageUpdates += 1;
      gl.bufferSubData( gl.ARRAY_BUFFER, position * vertexSize * PAGE_SIZE * 4, data );
    }
    dirty = false;
  }
  this.free = function () {
    if(next !== null){
      next.free();
    }
    mgr.free( obj );
    next = null;
    dirty = true;
    used = 0;
    alive = false;
    obj.vb.numberAlive --;
    for(var i = 0 ; i < vertexSize * PAGE_SIZE ; i ++ ){
      data[ i ] = 0.0;
    }
  }
}
function VertexBuffer ( vb, allData, id ) {
  this.id          = id;
  this.vb          = vb;
  this.pages       = [];
  this.numberAlive = 0;
  this.allData     = allData;
  this.update      = function () {
    if( this.numberAlive === 0 ) {
      return;
    }
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vb );
    for (var i = 0; i < this.pages.length; i++) {
      this.pages[i].update();
    };
  }
}
function VertexMemoryManager ( sizeOfVertex ) {
  var vertexBuffers  = [ ],
      freeList       = [ ], // list of current free pages
      currentBuffer  = null,
      numberOfPages  = 0;

  function addAnotherBuffer () {
    var buff = gl.createBuffer();
    var allData = new Float32Array( PAGES_PR_BUFFER * PAGE_SIZE * sizeOfVertex );
    currentBuffer = new VertexBuffer( buff, allData, vertexBuffers.length );
    gl.bindBuffer( gl.ARRAY_BUFFER, buff );
    gl.bufferData( gl.ARRAY_BUFFER, allData, gl.STREAM_DRAW );
    vertexBuffers.push( currentBuffer );
  }
  addAnotherBuffer();

  var totalNumberOfpages = 0;
  this.allocPage = function() {
    if( freeList.length ) {
      var page = freeList.pop();
      page.alive = true;
      page.vb.numberAlive++;
      pagesAllocated++;
      return page;
    }
    if( currentBuffer.pages.length >= PAGES_PR_BUFFER ){
      addAnotherBuffer();
    }
    var page = new VertexPage( this, currentBuffer, sizeOfVertex, currentBuffer.pages.length, numberOfPages++ );
    page.alive = true;
    currentBuffer.pages.push( page );
    currentBuffer.numberAlive++;
    pagesAllocated++;
    return page;
  };

  this.free = function( page ) {
    freeList.push( page );
    pagesAllocated--;
    page.alive = false;
  };

  this.update = function () {
    for(var i = 0 ; i < vertexBuffers.length ; i ++) {
      vertexBuffers[ i ].update();
    }
  };

  this.render = function ( material ) {
    for(var i = 0 ; i < vertexBuffers.length ; i ++ ){
      var toRender = vertexBuffers[i];
      if(toRender.numberAlive === 0) {
        continue;
      }
      gl.bindBuffer( gl.ARRAY_BUFFER, toRender.vb );
      material.bindInterleavedVertexPointers();
      this.update();

      var from = 0;
      while( !toRender.pages[ from ].alive ) from++;
      for(var ii = from ; ii < toRender.pages.length ; ii ++){
        var page = toRender.pages[ii];
        if( !page.alive ) {
          if( ( ii - from ) >= 1 ) {
            drawCalls++;
            gl.drawArrays( gl.TRIANGLES, from * PAGE_SIZE, ( ii - from ) * PAGE_SIZE );
          }
          from = ii;
        }
      }
      if( from < toRender.pages.length ) {
        var difference = ( toRender.pages.length - from );
        drawCalls++;
        gl.drawArrays( gl.TRIANGLES, from * PAGE_SIZE, difference * PAGE_SIZE );
      }
    }
  };
}

return VertexMemoryManager;

})();