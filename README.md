[![Build Status](https://travis-ci.org/JasonStoltz/branch-js.svg)](https://travis-ci.org/JasonStoltz/branch-js)


## Usage
```
var obj = {
  prop1: 'val1',
  prop2: ['val2']
}
```
### branchjs
```
var branchedObj = branchjs(obj); //Create a 'branched' copy of the original object
```
### $hasChanges
```
console.log(branchedObj.$hasChanges()) //false - no changes have been made to this object
branchedObj.prop1 = 'newval1';
console.log(branchedObj.$hasChanges()) //true - we've updated a property
```
### $commit
```
branchedObj.$commit();
console.log(branchedObj.$hasChanges()) //false - changes are now "commited" to this branch
```
### $revert
```
branchedObj.prop3 = 'val3';
branchedObj.$revert(); 
console.log(branchedObj.prop1) //newval1 - we've commited this change, so it is still there
console.log(branchedObj.prop3) //undefined - we reverted changes back to the last commit, so this is now `undefined` again
```
### $merge
```
branchedObj.$merge(obj);
console.log(obj.prop1) //val1 - we merged any commited changes back into our original object

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
