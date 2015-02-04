(function() {

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  //http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object#answer-728694
  function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }

  var branch = function(someObj) {
    var newObj = clone(someObj);
    
    newObj.$commit = function(fn) {
      if (fn) fn(this);
      HEAD = clone(this);
      return this;
    };
    newObj.$merge = function(appliedTo, diff) {
      var changes = diff || objectDiff.diff(BASE, this);

      function _inspect(parent, currProp, obj) {
        switch(typeof obj) {
          case 'object':
            if (!obj) {
              break;
            }

            if(obj.changed === 'equal') {

            } else if (obj.changed === 'object change' &&  obj.value) {
              for (var prop in obj.value) {
                //Whatever?
                if (parent[currProp]) {
                  _inspect(parent[currProp], prop, obj.value[prop]);
                }
              }
            } else if (obj.changed === 'removed') {
              if (parent) {
                if (parent instanceof Array) {
                  if (parent.indexOf(obj.value) >= 0) {
                    parent.splice(parent.indexOf(obj.value), 1)
                  }
                } else {
                  delete parent[currProp];
                }
              }
            } else if (obj.changed === 'added') {
              if (parent instanceof Array) {
                parent.push(obj.value);
              } else {
                parent[currProp] = obj.value;
              }
            } else if (obj.changed === 'primitive change') {
              if (parent instanceof Array) {
                if (parent.indexOf(obj.removed) >= 0) {
                  parent.splice(parent.indexOf(obj.removed), 1)
                }
                parent.push(obj.added);
              } else {
                parent[currProp] = obj.added;
              }
            }

            break;
          case 'string':
            break;

          case 'undefined':
            break;

          default:
            break;
        }
      }

      _inspect({'appliedTo': appliedTo}, "appliedTo", changes);

      return this;
    };
    newObj.$revert = function() {
      this.$merge(this, objectDiff.diff(this, HEAD));
    };
    newObj.$hasChanges = function() {
      return objectDiff.diff(HEAD, this).changed === "object change";
    };
    newObj.$diff = function() {
      return objectDiff.diff(HEAD, this);
    };

    var BASE = clone(newObj);
    var HEAD = BASE;

    return newObj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `branch` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = branch;
    }
    exports.branch = branch;
  } else {
    root.branch = branch;
  }

}.call(this));
