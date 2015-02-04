describe("branch", function () {

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

  var originalObject;

  beforeEach(function () {

    originalObject = {
      extensions: ["original"],
      extension_ini: {
        apc: {
          label1: "value1",
          label2: {
            myword: "you"
          },
          label3: ["original"]
        }
      },
      php_ini: {
        label1: "value1"
      },
      something: "else"
    };
  });

  describe("#$revert", function () {
    var branchedObject, originalBranchedObject;

    beforeEach(function () {
      branchedObject = branch(originalObject);
      originalBranchedObject = clone(branchedObject);
    });

    it("should rollback changes to HEAD when head is BASE", function () {
      branchedObject.extension_ini.bpc = {
        "somelabel": "somevalue"
      };
      branchedObject.something = "another";
      delete branchedObject.extensions;

      branchedObject.$revert();

      expect(branchedObject).toEqual(originalBranchedObject);
    });

    it("should rollback changes to HEAD after a commit, not BASE", function () {
      branchedObject.newproperty = "newvalue";
      branchedObject.$commit();
      var headObject = clone(branchedObject);

      branchedObject.extension_ini.bpc = {
        "somelabel": "somevalue"
      };
      branchedObject.something = "another";
      delete branchedObject.extensions;

      branchedObject.$revert();

      expect(branchedObject).toEqual(headObject);
    });
  });

  describe("#$commit", function () {
    var branchedObject;

    beforeEach(function () {
      branchedObject = branch(originalObject);
    });

    it("it should moved HEAD forward, so that the current changes are no longer considered 'changes'", function () {
      branchedObject.extension_ini.bpc = {
        "somelabel": "somevalue"
      };

      expect(branchedObject.$hasChanges()).toBeTruthy();

      branchedObject.$commit();

      expect(branchedObject.$hasChanges()).toBeFalsy();

      branchedObject.extension_ini.bpc.anotherlable = "anothervalue";

      expect(branchedObject.$hasChanges()).toBeTruthy();

      branchedObject.$commit();

      expect(branchedObject.$hasChanges()).toBeFalsy();

      branchedObject.$merge(originalObject);
      expect(originalObject.extension_ini.bpc).toEqual({
        "somelabel": "somevalue",
        "anotherlable": "anothervalue"
      });
    });

  });

  describe("#$merge", function () {
    var branchedObject;

    beforeEach(function () {
      branchedObject = branch(originalObject);
    });

    afterEach(function () {
      //This needs to be accounted for with commit -- expect(branchedObject.$hasChanges()).toBeFalsy();
    });

    it("should not affect original object until merge", function () {
      branchedObject.extension_ini.apc.label2 = {
        "new": "object"
      };

      expect(originalObject.extension_ini.apc.label2).toEqual({
        myword: "you"
      });

      branchedObject.$commit().$merge(originalObject);

      expect(originalObject.extension_ini.apc.label2).toEqual({
        new: "object"
      });
    });

    it("should only merge the diff form base, i.e., just changes that were made since branching", function () {
      branchedObject.extension_ini.apc.label2 = {
        "new": "object"
      };

      var anotherObject = {
        extension_ini: {
          apc: {
            label1: "value1",
            label2: {
              myword: "you"
            }
          }
        }
      };

      branchedObject.$commit().$merge(originalObject);
      branchedObject.$commit().$merge(anotherObject);
      expect(originalObject.php_ini.label1).toEqual("value1");
      expect(anotherObject.php_ini).toBeUndefined();
    });

    describe("objects", function () {
      it("should merge a property delete", function () {
        delete branchedObject.extension_ini.apc;

        branchedObject.$commit().$merge(originalObject);
        expect(originalObject.extension_ini.apc).not.toBeDefined();

      });

      it("should ignore a deep property delete if that property is not there to delete", function () {
        delete branchedObject.extension_ini.apc.label3;

        var anotherObject = {
          something: ["existing"] //"extension_ini" doesn't exist at all, yet we are removing 'label3' from a child of it
        };

        branchedObject.$commit().$merge(anotherObject);
        expect(anotherObject).toEqual({
          something: ["existing"] //no changes were made
        });
      });

      it("should ignore a simple property delete if that property is not there to delete", function () {
        delete branchedObject.something;

        var anotherObject = {
          another: "value" //'extension_ini' doesn't exist at all, yet we are removing 'label3' from a child of it
        };

        branchedObject.$commit().$merge(anotherObject);
        expect(anotherObject).toEqual({
          another: "value" // no changes were made
        });
      });

      it("should merge an addition", function () {
        branchedObject.extension_ini.bpc = {
          "somelabel": "somevalue"
        };

        branchedObject.$commit().$merge(originalObject);
        expect(originalObject.extension_ini.bpc.somelabel).toEqual("somevalue");
      });

      it("should not merge an addition if that property is not there to add it to", function () {
        branchedObject.extension_ini.bpc = {
          "somelabel": "somevalue"
        };

        var anotherObject = {
          another: "value" //"extension_ini' doesn't exist at all, yet we are removing 'label3' from a child of it
        };

        branchedObject.$commit().$merge(anotherObject);
        expect(anotherObject).toEqual(anotherObject);
      });

      it("should merge a change", function () {
        branchedObject.extension_ini.apc.label1 = "newvalue";

        branchedObject.$commit().$merge(originalObject);
        expect(originalObject.extension_ini.apc.label1).toEqual("newvalue");
      });

      it("should merge a change, where the change adds an object where a string used to be", function () {
        branchedObject.extension_ini.apc.label2 = {
          "new": "object"
        };

        branchedObject.$commit().$merge(originalObject);
        expect(originalObject.extension_ini.apc.label2.new).toEqual("object");
      });
    });

    describe("arrays", function () {
      it("should merge an array addition by applying individual additions ", function () {
        branchedObject.extensions.push("new");

        var anotherObject = {
          extensions: ["existing"]
        };

        branchedObject.$commit().$merge(anotherObject);
        expect(anotherObject.extensions).toEqual(["existing", "new"]);

        branchedObject.$commit().$merge(originalObject);
        expect(originalObject.extensions).toEqual(["original", "new"]);
      });

      it("should merge an array deletion by applying individual deletions", function () {
        branchedObject.extensions.splice(branchedObject.extensions.indexOf("original", 1));

        var anotherObject = {
          extensions: ["existing", "original", "value"]
        };

        branchedObject.$commit().$merge(anotherObject);
        expect(anotherObject.extensions).toEqual(["existing", "value"]);

        branchedObject.$commit().$merge(originalObject);
        expect(originalObject.extensions).toEqual([]);
      });

      it("should merge multiple array additions by applying individual additions ", function () {
        branchedObject.extensions.push("new", "value");

        branchedObject.$commit().$merge(originalObject);
        expect(originalObject.extensions).toEqual(["original", "new", "value"]);
      });

      it("should merge additions and removals from an array by applying individual additions and removals", function () {
        branchedObject.extensions.push("new");
        branchedObject.extensions.splice("original", 1);

        branchedObject.$commit().$merge(originalObject);
        expect(originalObject.extensions).toEqual(["new"]);
      });

      it("should merge array replacement by calculating the diff between the original array and new array and applying changes", function () {
        branchedObject.extensions = ["new1", "new2"];

        var anotherObject = {
          extensions: ["original", "existing", "value"]
        };

        branchedObject.$commit().$merge(originalObject);
        expect(originalObject.extensions).toEqual(["new1", "new2"]);

        branchedObject.$commit().$merge(anotherObject);
        expect(anotherObject.extensions).toEqual(["existing", "value", "new1", "new2"]);
      });

      it("should ignore array deletion if that array element does not exist", function () {
        branchedObject.extensions.splice(branchedObject.extensions.indexOf("original", 1));

        var anotherObject = {
          extensions: ["existing", "value"]
        };

        branchedObject.$commit().$merge(anotherObject);
        expect(anotherObject.extensions).toEqual(["existing", "value"]);
      });

      it("should ignore an implicit element removal if that element does not exist", function () {
        branchedObject.extensions = ["new1", "new2"];

        var anotherObject = {
          extensions: ["existing", "value"] //"Original" is not in this list, but it was removed implicitly
        };

        branchedObject.$commit().$merge(anotherObject);
        expect(anotherObject.extensions).toEqual(["existing", "value", "new1", "new2"]);
      });

      it("should ignore an array element removal if that element does not exist", function () {

        branchedObject.extensions.splice(branchedObject.extensions.indexOf("original"), 1);

        var anotherObject = {
          something: ["existing"] //'extensions' doesn't exist at all, yet we are removing 'original' from it
        };

        branchedObject.$commit().$merge(anotherObject);
        expect(anotherObject).toEqual({
          something: ["existing"] //no changes were made
        });
      });

      it("should ignore a deep array element removal if that element does not exist", function () {

        branchedObject.extension_ini.apc.label3.splice(branchedObject.extension_ini.apc.label3.indexOf("original"), 1);

        var anotherObject = {
          something: ["existing"] //'extension_ini' doesn't exist at all, yet we are removing 'original' from a deep child of it
        };

        branchedObject.$commit().$merge(anotherObject);
        expect(anotherObject).toEqual({
          something: ["existing"] //no changes were made
        });
      });
    });
  });
});