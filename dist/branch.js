(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["branchjs"] = factory();
	else
		root["branchjs"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var clone = __webpack_require__(1);

	/**
	 *
	 * @param srcObj Object to branch
	 * @returns branched Object
	 */

	exports['default'] = function (srcObj) {
	  var newObj = clone(srcObj);

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
	  newObj.$diff = function () {
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

	  function merge(appliedTo) {
	    var diff = arguments.length <= 1 || arguments[1] === undefined ? objectDiff.diff(BASE, this) : arguments[1];

	    inspect({ 'appliedTo': appliedTo }, "appliedTo", diff);
	    return this;
	  }

	  function inspect(parent, currProp, obj) {
	    switch (typeof obj) {
	      case 'object':
	        if (!obj) {
	          break;
	        }

	        if (obj.changed === 'equal') {} else if (obj.changed === 'object change' && obj.value) {
	          for (var prop in obj.value) {
	            if (parent[currProp]) {
	              inspect(parent[currProp], prop, obj.value[prop]);
	            }
	          }
	        } else if (obj.changed === 'removed') {
	          if (parent) {
	            if (parent instanceof Array) {
	              if (parent.indexOf(obj.value) >= 0) {
	                parent.splice(parent.indexOf(obj.value), 1);
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
	              parent.splice(parent.indexOf(obj.removed), 1);
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
	};

	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	//http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object#answer-728694
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = clone;

	function clone(obj) {

	  // Handle the 3 simple types, and null or undefined
	  if (null == obj || "object" != typeof obj) return obj;

	  // Handle Date
	  if (obj instanceof Date) {
	    var copy = new Date();
	    copy.setTime(obj.getTime());
	    return copy;
	  }

	  // Handle Array
	  if (obj instanceof Array) {
	    return obj.map(function (e) {
	      return clone(e);
	    });
	  }

	  // Handle Object
	  if (obj instanceof Object) {
	    var copy = {};
	    for (var attr in obj) {
	      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
	    }
	    return copy;
	  }

	  throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	module.exports = exports["default"];

/***/ }
/******/ ])
});
;