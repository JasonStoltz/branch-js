(function() {

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  var branch = function(someObj) {
    var newObj = clone(someObj);

    /**
     * Any outstanding changes are "committed". This means that they will still be applied
     * in a merge, but are not considered when checking "$hasChanges".
     *
     * @returns this - for chaining
     */
    newObj.$commit = commit;

    /**
     *
     * Merges all changes since branch was created to the supplied "appliedTo" object. It will
     * merge all changes, even changes that are uncommitted.
     *
     * @param appliedTo Object to apply changes to
     * @param diff (optional) If supplied, this diff will be applied instead of current changes
     * @returns this - for chaining
     */
    newObj.$merge = merge;

    /**
     * Reverts all changes since last commit
     *
     * @returns this - for chaining
     */
    newObj.$revert = revert;

    /**
     * Has the object changes since branching?
     */
    newObj.$hasChanges = hasChanges;

    /**
     * What are the current changes since the branch was created, or the last commit?
     *
     * @returns diff object (https://github.com/NV/objectDiff.js)
     */
    newObj.$diff = function() {
      return objectDiff.diff(HEAD, this);
    };

    /* This represents the object in it's original state at time of branching */
    var BASE = clone(newObj);

    /* This represents the object's current state at the point of last commit */
    var HEAD = BASE;

    return newObj;

    function hasChanges() {
      return objectDiff.diff(HEAD, this).changed === "object change";
    }

    function revert() {
      this.$merge(this, objectDiff.diff(this, HEAD));
    }


    function merge(appliedTo, diff) {
      var changes = diff || objectDiff.diff(BASE, this);

      inspect({'appliedTo': appliedTo}, "appliedTo", changes);

      return this;
    }

    function inspect(parent, currProp, obj) {
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
                inspect(parent[currProp], prop, obj.value[prop]);
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

    function commit(fn) {
      HEAD = clone(this);
      return this;
    }

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
  };

  // Export the branchjs object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `branchjs` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = branch;
    }
    exports.branchjs = branch;
  } else {
    root.branchjs = branch;
  }

}.call(this));
