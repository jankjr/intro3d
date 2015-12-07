var Input = (function () {
var nameToKeycodeMapping = {
  'backspace':8,
  'tab':9,
  'enter':13,
  'shift':16,
  'ctrl':17,
  'alt':18,
  'pause':19,
  'capsLock':20,
  'escape':27,
  'space':32,
  'pageUp':33,
  'pageDown':34,
  'end':35,
  'home':36,
  'leftArrow':37,
  'upArrow':38,
  'rightArrow':39,
  'downArrow':40,
  'insert':45,
  'delete':46,
  'zero':48,
  'one':49,
  'two':50,
  'three':51,
  'four':52,
  'five':53,
  'six':54,
  'seven':55,
  'eight':56,
  'nine':57,
  'a':65,
  'b':66,
  'c':67,
  'd':68,
  'e':69,
  'f':70,
  'g':71,
  'h':72,
  'i':73,
  'j':74,
  'k':75,
  'l':76,
  'm':77,
  'n':78,
  'o':79,
  'p':80,
  'q':81,
  'r':82,
  's':83,
  't':84,
  'u':85,
  'v':86,
  'w':87,
  'x':88,
  'y':89,
  'z':90,
  'leftWindowKey':91,
  'rightWindowKey':92,
  'selectKey':93,
  'numpad0':96,
  'numpad1':97,
  'numpad2':98,
  'numpad3':99,
  'numpad4':100,
  'numpad5':101,
  'numpad6':102,
  'numpad7':103,
  'numpad8':104,
  'numpad9':105,
  'multiply':106,
  'add':107,
  'subtract':109,
  'decimalPoint':110,
  'divide':111,
  'f1':112,
  'f2':113,
  'f3':114,
  'f4':115,
  'f5':116,
  'f6':117,
  'f7':118,
  'f8':119,
  'f9':120,
  'f10':121,
  'f11':122,
  'f12':123,
  'numLock':144,
  'scrollLock':145,
  'semiColon':186,
  'equalSign':187,
  'comma':188,
  'dash':189,
  'period':190,
  'forwardSlash':191,
  'graveAccent':192,
  'openBracket':219,
  'backSlash':220,
  'closeBraket':221,
  'singleQuote':222
};
var keyState = {};
function KeyState () {
  this.before = false;
  this.down = false;
}
window.onkeyup = function (ev) {
  var state = keyState[ ev.keyCode ];
  state.down = false;
}

window.onkeydown = function (ev) {
  var state = keyState[ ev.keyCode ];
  state.down = true;
};

var API = {};

var mouseState = null;
var moved      = false;
var mouseListeners = [ ];

window.onmousedown = function (ev) {
  if( mouseState !== null && ev.button === 0 ) mouseState.left = true;
}
window.onmouseup = function (ev) {
  if( mouseState !== null && ev.button === 0 ) mouseState.left = false;
}

window.onmousemove = function (ev) {
  if( mouseState === null ){
    mouseState = {
      before : false,
      left : false,
      x: ev.clientX,
      y: ev.clientY,
      oldx: ev.clientX,
      oldy: ev.clientY,
      dx: 0,
      dy: 0
    }
  } else {
    mouseState.oldx = mouseState.x;
    mouseState.oldy = mouseState.y;
    mouseState.x = ev.clientX;
    mouseState.y = ev.clientY;
    mouseState.dx = mouseState.oldx - mouseState.x;
    mouseState.dy = mouseState.oldy - mouseState.y;
  }
  moved = true;
};

var allListeners = [];
for( var name in nameToKeycodeMapping ){

  (function ( name ) {
    var code = nameToKeycodeMapping[ name ];
    keyState[ code ] = keyState[ code ] || new KeyState( code );
    var state = keyState[ code ];
    API[name] = {
      is : {
        down : function () {
          return keyState[ code ].down;
        },
        up : function () {
          return !keyState[ code ].down;
        }
      },
      while : {
        down : function (fn) {
          allListeners.push( function () {
            if( state.down ) fn();
          } );
        },
        up : function (fn) {
          allListeners.push( function () {
            if( !state.down ) fn();
          } );
        }
      },
      on : {
        down : function (fn) {
          allListeners.push( function () {
            if( !state.before && state.down ) fn();
          } );
        },
        up : function (fn) {
          allListeners.push( function () {
            if( state.before && !state.down ) fn();
          } );
        }
      },
      unregister : function (fn) {
        var id = allListeners.indexOf( fn );
        if( id !== -1 ) allListeners.splice( id, 1 );
      }
    }

  })( name );
}
API.mouse = {
  left: {
    while: {
      down: function (fn) {
        allListeners.push(function () {
          if(!mouseState)return null;
          if(mouseState.left)fn( API.mouse.x, API.mouse.y, API.mouse.dx, API.mouse.dy );
        })
      },
      up: function (fn) {
        allListeners.push(function () {
          if(!mouseState)return null;
          if(!mouseState.left)fn( API.mouse.x, API.mouse.y, API.mouse.dx, API.mouse.dy );
        })
      }
    },
    on: {
      down: function (fn) {
        allListeners.push(function () {
          if(!mouseState)return null;
          if(!mouseState.before && mouseState.left)fn( API.mouse.x, API.mouse.y, API.mouse.dx, API.mouse.dy );
        })
      },
      up: function (fn) {
        allListeners.push(function () {
          if(!mouseState)return null;
          if(mouseState.before && !mouseState.left)fn( API.mouse.x, API.mouse.y, API.mouse.dx, API.mouse.dy );
        })
      }
    }
  },
  on: {
    move: function (fn) {
      allListeners.push(function () {
        if(moved)fn( API.mouse.x, API.mouse.y, API.mouse.dx, API.mouse.dy );
      })
    }
  }
}
API.propagateKeyPresses = function () {
  if( mouseState !== null && moved ){
    API.mouse.x = mouseState.x;
    API.mouse.y = mouseState.y;
    API.mouse.dx = mouseState.dx;
    API.mouse.dy = mouseState.dy;
  }
  for (var i = 0; i < allListeners.length; i++) {
    allListeners[ i ]();
  };
  for(var keyCode in keyState ) {
    keyState[keyCode].before = keyState[keyCode].down;
  }
  API.mouse.dx = 0;
  API.mouse.dy = 0;
  if(mouseState !== null) {
    mouseState.before = mouseState.left;
  }
  moved = false;
}


return API;
})();