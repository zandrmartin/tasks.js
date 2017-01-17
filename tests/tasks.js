// Copyright © 2017 Zandr Martin

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"use strict";

const assert = require("assert");
const tasks = require("../tasks.js");

const setup = function () {
};

const teardown = function () {
};

const testCases = {
    testParseArgsNoArgs: function () {
        const testFunc = function () {
            tasks.parseArgs([]);
        };
        assert.throws(testFunc);
    },
    testParseArgsGibberish: function () {
        const testFunc = function () {
            tasks.parseArgs(["ajsldkjalskjdalsjdk", "ajsldlakjseial"]);
        };
        assert.throws(testFunc);
    },
    testParseArgsAddNoArgs: function () {
        const testFunc = function () {
            tasks.parseArgs(["add"]);
        };
        assert.throws(testFunc);
    },
    testParseArgsAdd: function () {
        const args = ["add", "foobar"];
        const expected = {
            action: "add",
            name: "foobar"
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsAddDatedNoDate: function () {
        const testFunc = function () {
            const args = ["add", "foobar", "-d"];
            tasks.parseArgs(args);
        };
        assert.throws(testFunc);
    },
    testParseArgsAddDated: function () {
        const args = ["add", "foobar", "-d", "2017-07-05"];
        const expected = {
            action: "add",
            name: "foobar",
            due: "2017-07-05"
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsAddRecursNoDueDate: function () {
        const testFunc = function () {
            const args = ["add", "foobar", "-r", "1", "week"];
            tasks.parseArgs(args);
        };
        assert.throws(testFunc);
    },
    testParseArgsAddRecursNoSchedule: function () {
        const testFunc = function () {
            const args = ["add", "foobar", "-d", "today", "-r"];
            tasks.parseArgs(args);
        };
        assert.throws(testFunc);
    },
    testParseArgsAddRecursNoTime: function () {
        const testFunc = function () {
            const args = ["add", "foobar","-d", "today",  "-r", "1"];
            tasks.parseArgs(args);
        };
        assert.throws(testFunc);
    },
    testParseArgsAddRecurs: function () {
        const args = ["add", "foobar", "-d", "today", "-r", "1", "week"];
        const expected = {
            action: "add",
            name: "foobar",
            due: "today",
            recurs: "1 week"
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsAddRecursNonNumeric: function () {
        const args = ["add", "foobar", "-d", "today", "-r", "monday"];
        const expected = {
            action: "add",
            name: "foobar",
            due: "today",
            recurs: "monday"
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsAddTagsNoArgs: function () {
        const args = ["add", "foobar", "-t"];
        const expected = {
            action: "add",
            name: "foobar",
            tags: []
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsAddTags: function () {
        const args = ["add", "foobar", "-t", "foo", "bar", "baz"];
        const expected = {
            action: "add",
            name: "foobar",
            tags: ["foo", "bar", "baz"]
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsCompleteNoArgs: function () {
        const testFunc = function () {
            tasks.parseArgs(["complete"]);
        };
        assert.throws(testFunc);
    },
    testParseArgsComplete: function () {
        const args = ["complete", 1, 2, "z"];
        const expected = {
            action: "complete",
            ids: [1, 2, 35]
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsDeleteNoArgs: function () {
        const testFunc = function () {
            tasks.parseArgs(["delete"]);
        };
        assert.throws(testFunc);
    },
    testParseArgsDelete: function () {
        const args = ["delete", 1, 2, 3];
        const expected = {
            action: "delete",
            ids: [1, 2, 3]
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsListNoArgs: function () {
        const args = ["list"];
        const expected = {
            action: "list",
            list: {
                completed: false,
                hideRecurring: false,
                type: "all"
            }
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseListArgsCompleted: function () {
        const args = ["list", "-c"];
        const expected = {
            action: "list",
            list: {
                completed: true,
                hideRecurring: false,
                type: "all"
            }
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsListNoRecurring: function () {
        const args = ["list", "-n"];
        const expected = {
            action: "list",
            list: {
                completed: false,
                hideRecurring: true,
                type: "all"
            }
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsListNamedSearch: function () {
        const args = ["list", "foobar"];
        const expected = {
            action: "list",
            list: {
                completed: false,
                hideRecurring: false,
                type: "named",
                search: "foobar"
            }
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsListDatedSearch: function () {
        const args = ["list", "dated", "2017-07-05"];
        const expected = {
            action: "list",
            list: {
                completed: false,
                hideRecurring: false,
                type: "dated",
                search: "2017-07-05"
            }
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsPostponeNoArgs: function () {
        const testFunc = function () {
            tasks.parseArgs(["postpone"]);
        };
        assert.throws(testFunc);
    },
    testParseArgsPostpone: function () {
        const args = ["postpone", "2017-07-05", 1, 2, 3];
        const expected = {
            action: "postpone",
            due: "2017-07-05",
            ids: [1, 2, 3]
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsRenameNoArgs: function () {
        const testFunc = function () {
            tasks.parseArgs(["rename"]);
        };
        assert.throws(testFunc);
    },
    testParseArgsRename: function () {
        const args = ["rename", 1, "foobar"];
        const expected = {
            action: "rename",
            id: 1,
            name: "foobar"
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
    testParseArgsRetagNoArgs: function () {
        const testFunc = function () {
            tasks.parseArgs(["retag"]);
        };
        assert.throws(testFunc);
    },
    testParseArgsRetag: function () {
        const args = ["retag", 1, "abc", "def"];
        const expected = {
            action: "retag",
            id: 1,
            tags: ["abc", "def"]
        };
        assert.deepEqual(expected, tasks.parseArgs(args));
    },
};

module.exports = {
    setup,
    teardown,
    testCases
};
