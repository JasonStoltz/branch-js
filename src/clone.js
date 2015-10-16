//http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object#answer-728694
export default function clone(obj) {

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    let copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    return obj.map(e => clone(e));
  }

  // Handle Object
  if (obj instanceof Object) {
    let copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}