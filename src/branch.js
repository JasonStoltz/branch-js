let clone = require('./clone');

/**
 *
 * @param srcObj Object to branch
 * @returns branched Object
 */
export default function(srcObj) {
  let newObj = clone(srcObj);

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
   * Has the object changed since branching?
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
  let BASE = clone(newObj);

  /* This represents the object's current state at the point of last commit */
  let HEAD = BASE;

  return newObj;

  function hasChanges() {
    return objectDiff.diff(HEAD, this).changed === "object change";
  }

  function revert() {
    this.$merge(this, objectDiff.diff(this, HEAD));
  }


  function merge(appliedTo, diff = objectDiff.diff(BASE, this)) {
    inspect({'appliedTo': appliedTo}, "appliedTo", diff);
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

      case 'string': break;
      case 'undefined': break;
      default: break;
    }
  }

  function commit(fn) {
    HEAD = clone(this);
    return this;
  }
}
