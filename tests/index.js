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
const scheduleTests = require("./scheduling.js");
const polyfillTests = require("./polyfills.js");
const taskTests = require("./task.js");
const appTests = require("./tasks.js");

const all = [];

const testWrapper = function (func, setup, teardown) {
    const wrapped = function () {
        try {
            if (typeof setup === "function") {
                setup();
            }
            func();
        } finally {
            if (typeof teardown === "function") {
                teardown();
            }
        }
    };

    Object.defineProperty(wrapped, "name", {
        get: function () {
            return func.name.replace("test", "");
        }
    });

    return wrapped;
};

[scheduleTests, polyfillTests, taskTests, appTests].forEach(function (group) {
    const tests = Object.keys(group.testCases).map((key) => group.testCases[key]);
    all.push(...tests.map((test) => testWrapper(test, group.setup, group.teardown)));
});

module.exports = {
    all
};
