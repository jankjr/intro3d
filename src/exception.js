function RuntimeException ( type, msg ) {
  this.type = type;
  this.msg = msg;
  this.toString = function () {
    return type + ': ' + msg;
  }
}