beckon
======

Callback based program flow with built in context. Use like a callback, but with the power of flow like programming (similar to promises).

Usage
-----

```js
var Beckon = require('beckon');

var callback = Beckon(function (arg) {
  this.arg = arg;
  setTimeout(this.next, 0);
});

callback.next(function () {
  console.log(this.arg);
});

callback('foo');

// => 'foo'
```

Methods
-------

Beckon(fn)

Creates the callback flow, exposing ```callback.next``` which can be used to define the functions in the flow.

callback.next([name], fn)

Adds provided function to the callbacks prototype. Pass in an optional name that can be used to call the function directly bypassing any functions between the named function and the one calling it.

```js
var Beckon = require('beckon');

var fileName = 'file.json';

var data = {
  foo: 'bar'
};

var callback = Beckon(function (err, file) {
  if (err || !file) {
    return createFile(fileName, data, this.done);
  }

  validateFile(file, data, this.next);
});

// Not called if the file does not exist, goes to done instead
callback.next(function (err) {
  if (err) {
    return updateFile(file, data, this.next);
  }

  this.next();
});

callback.next('done', function () {
  console.log('File updated');
});

openFile(file, callback);
```

callback([args])

Starts the callback flow, by first calling the initial function passed into Beckon, and flowing through as ```this.next``` or ```this.functionName``` is called.

this.next([arguments])

Is used to call the next function in the callback flow, even named functions are included in the flow.
