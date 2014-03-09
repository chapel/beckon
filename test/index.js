var Lab = require('lab');
var Beckon = require('../');

// Test shortcuts
var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;

function noop() {}

describe('Beckon', function () {

  describe('constructor', function () {

    it('returns a function', function (done) {

      var callback = Beckon(noop);

      expect(typeof callback).to.equal('function');
      done();
    });

    it('returns a function that wraps the provided function', function (done) {

      var testVal = 'foo';

      var callback = Beckon(function (val) {
        expect(val).to.equal(testVal);
        done();
      });

      callback(testVal);
    });
  });

  describe('next creator', function () {

    it('returns this', function (done) {
      var callback = Beckon(noop);

      expect(callback.next(noop)).to.equal(callback);
      done();
    });

    it('adds the provided function to the prototype', function (done) {
      var testVal = 'foo';

      var callback = Beckon(function () {
        this.__next0(testVal);
      });

      callback.next(function (val) {
        expect(val).to.equal(testVal);
        done();
      });

      callback();
    });

    it('accepts a name as an optional argument', function (done) {
      var testVal = 'foo';

      var callback = Beckon(function () {
        this.bar(testVal);
      });

      callback.next('bar', function (val) {
        expect(val).to.equal(testVal);
        done();
      });

      callback();
    });

    it('can chain next functions', function (done) {
      var callback = Beckon(noop).next(noop);

      expect(callback.next(noop).next(noop).next(noop)).to.equal(callback);
      done();
    });
  });

  describe('next iterator', function () {

    it('calls the next defined function', function (done) {
      var testVal = 'foo';

      var callback = Beckon(function () {
        this.next(testVal);
      });

      callback.next(function (val) {
        expect(val).to.equal(testVal);
        done();
      });

      callback();
    });

    it('goes through the callStack', function (done) {

      var callback = Beckon(function (val) {
        expect(val).to.equal(1);
        this.next(val + 1);
      })
        .next(function (val) {
          expect(val).to.equal(2);
          this.next(val + 1);
        })
        .next(function (val) {
          expect(val).to.equal(3);
          this.next(val + 1);
        })
        .next(function (val) {
          expect(val).to.equal(4);
          done();
        });

      callback(1);
    });
  });

  describe('direct calls', function () {

    it('slices the callstack', function (done) {

      var callback = Beckon(function (val) {
        expect(val).to.equal(1);
        this.done(val + 1);
      })
        .next(function (val) {
          throw new Error('Expected this function to be skipped');
        })
        .next('done', function (val) {
          expect(val).to.equal(2);
          this.next(val + 1);
        })
        .next(function (val) {
          expect(val).to.equal(3);
          done();
        });

      callback(1);
    });
  });

  describe('flow', function () {

    it('provides same context', function (done) {

      var testVal = 'foo';

      var callback = Beckon(function (val) {
        this.val = val;
        this.next();
      })
        .next(function () {
          expect(this.val).to.equal(testVal);
          done();
        });

      callback(testVal);
    });

    it('only has user assigned keys on context', function (done) {

      var callback = Beckon(function () {
        this.foo = 'bar';
        this.test = 1;
        this.next();
      })
        .next(function () {
          expect(JSON.stringify(this)).to.equal(JSON.stringify({foo: 'bar', test: 1}));
          done();
        });

      callback();
    });
  });

  describe('arguments', function () {

    it('passes all arguments to each function in flow', function (done) {

      var callback = Beckon(function (arg1) {
        expect(arg1).to.equal(1);
        this.next(2, 3, 4);
      })
        .next(function (arg1, arg2, arg3) {
          expect(arg1).to.equal(2);
          expect(arg2).to.equal(3);
          expect(arg3).to.equal(4);
          done();
        });

      callback(1);
    });
  });

  describe('async', function () {

    it('binds functions so they keep the same context', function (done) {

      var callback = Beckon(function () {
        this.foo = 'bar';
        setTimeout(this.next, 0);
      })
        .next(function () {
          expect(this.foo).to.equal('bar');
          done();
        });

      callback();
    });

    it('binds named functions so they keep the same context', function (done) {

      var callback = Beckon(function () {
        this.foo = 'bar';
        setTimeout(this.test, 0);
      })
        .next('test', function () {
          expect(this.foo).to.equal('bar');
          done();
        });

      callback();
    });
  });

  describe('unique flows', function () {

    it('creates unique callback flows', function (done) {

      var callbackOne = Beckon(noop).next(noop);
      var callbackTwo = Beckon(noop).next('foo', noop);

      expect(callbackOne.prototype).to.not.equal(callbackTwo.prototype);
      done();
    });

    it('should have unique contexts', function (done) {

      var callback = Beckon(function (val, fn) {
        expect(this.val).to.not.exist;
        expect(this.test).to.not.exist;
        this.val = val;
        this.fn = fn;
        this.next(val);
      })
        .next(function (val) {
          expect(this.val).to.equal(val);
          expect(this.test).to.not.exist;
          this.test = 'foo';
          this.fn(this);
        });

      callback(1, function (contextOne) {
        callback(2, function (contextTwo) {
          expect(contextOne).to.not.equal(contextTwo);
          expect(contextOne.val).to.equal(1);
          expect(contextTwo.val).to.equal(2);
          expect(contextOne.test).to.equal(contextTwo.test);
          done();
        });
      });

    });
  });
});
