[![Build Status](https://travis-ci.org/JasonStoltz/branch-js.svg)](https://travis-ci.org/JasonStoltz/branch-js)

## Branch.js

"branching" lets you make changes to an object without directly affecting the original object until you are ready to "merge" those changes back in. Similar to how you might "branch" a git repo, make some changes to it, then "merge" that branch back in.
ex.:
```javascript
var copy = branchjs(obj)
... Make a bunch of changes to copy here ...
copy.$commit().$merge(obj)
```

The most applicable use case for this is probably forms. 
- You can `branchjs` an object in order to 2-way bind to a form. 
- A successful form submission would trigger a `$merge` back to the original object
- a `$revert` could be triggered by a "clear" button, in order to remove all unsaved changes. 
- You could "pre-load" some form changes to the branched object by making an update and `$commit`ing  them before backing the form. That way, the change is preserved and will be applied on `$merge`, but won't be blown away on a `$revert` (which we probably have bound the clear button)
- Finally, in addition to just `$merge`ing back to your original object on a succesfull form submission ... since $merge ONLY applies the diff, you coud apply it to any number of objects that the changes might be applicable to.

## Usage
```javascript
var obj = {
  prop1: 'val1',
  prop2: ['val2']
}
```
### branchjs
```javascript
var branchedObj = branchjs(obj); //Create a 'branched' copy of the original object
```
### $hasChanges
```javascript
console.log(branchedObj.$hasChanges()) //false - no changes have been made to this object
branchedObj.prop1 = 'newval1';
console.log(branchedObj.$hasChanges()) //true - we've updated a property
```
### $commit
```javascript
branchedObj.$commit();
console.log(branchedObj.$hasChanges()) //false - changes are now "commited" to this branch
```
### $revert
```javascript
branchedObj.prop3 = 'val3';
branchedObj.$revert(); 
console.log(branchedObj.prop1) //newval1 - we've commited this change, so it is still there
console.log(branchedObj.prop3) //undefined - we reverted changes back to the last commit, so this is now `undefined` again
```
### $merge
```javascript
branchedObj.$merge(obj);
console.log(obj.prop1) //newval1 - we merged any commited changes back into our original object

branchedObj = branchjs(obj); //start over
branchedObj.prop2.push('val3');
branchedObj.prop2.push('val4');
branchedObj.$commit();

var anotherobject = {
  prop2: ['original']
}

var yetanotherobject = {
  prop2: ['test', 'values']
}

branchedObj
  .$merge(anotherobject)
  .$merge(yetanotherobject)

//This is important ... it ONLY applies the diff to the target objects
console.log(anotherobject.prop2); // ['original', 'val3', 'val4']
console.log(yetanotherobject.prop2); // ['test', 'values', 'val3', 'val4']
```
