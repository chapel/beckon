var newless = require('newless');

function setNext(name, call) {
  if (typeof name === 'function') {
    call = name;
    name = '__next' + this.callStack.length;
  }

  this.callStack.push({
    name: name,
    fn: call
  });

  this.prototype[name] = function () {
    this.__private__.callStack = sliceStack(name, this.__private__.callStack);
    return call.apply(this, arguments);
  };

  return this;
}

function callNext() {
  var next = this.__private__.callStack.shift();
  return next.fn.apply(this, arguments);
}

function sliceStack(name, arr) {
  return arr.slice(indexOfName(name, arr));
}

function indexOfName(name, arr) {
  var index;
  for (var i = 0, len = arr.length; i < len; i += 1) {
    if (name === arr[i].name) {
      index = i;
      break;
    }
  }
  return index + 1;
}

function simpleBind(self, fn) {
  return function () {
    return fn.apply(self, arguments);
  };
}

function bindProto(self, proto) {
  var boundProto = {};
  for (var key in proto) {
    boundProto[key] = simpleBind(self, proto[key]);
  }
  return boundProto;
}

module.exports = function (start) {
  var Beckon = newless(function () {
    Object.defineProperty(this, '__private__', {
      enumerable: false,
      value: {}
    });

    this.__private__.callStack = Beckon.callStack.slice();

    this.__proto__ = bindProto(this, this.__proto__);

    start.apply(this, arguments);

    return this;
  });

  Beckon.callStack = [];

  Beckon.next = setNext;

  Beckon.prototype.next = callNext;

  return Beckon;
};
