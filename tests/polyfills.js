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
require("../polyfills.js");

const testCases = {
    testStringIsNumericTrue: function () {
        const str = "10";
        assert.ok(str.isNumeric());
    },
    testStringIsNumericFalse: function () {
        const str = "foobar";
        assert.ok(!str.isNumeric());
    },
    testStringPadRightNormal: function () {
        const str = "abc";
        assert.equal(str.padRight(6), "abc   ");
    },
    testStringPadRightPadChar: function () {
        const str = "abc";
        assert.equal(str.padRight(6, "-"), "abc---");
    },
    testStringPadRightTooLong: function () {
        const str = "abcdef";
        assert.equal(str.padRight(5), "abcdef");
    },
    testStringPadLeftNormal: function () {
        const str = "abc";
        assert.equal(str.padLeft(6), "   abc");
    },
    testStringPadLeftPadChar: function () {
        const str = "abc";
        assert.equal(str.padLeft(6, "-"), "---abc");
    },
    testStringPadLeftTooLong: function () {
        const str = "abcdef";
        assert.equal(str.padLeft(5), "abcdef");
    },
    testArrayMaxSuccess: function () {
        const arr = [3,2,1,7,6,5,4];
        assert.equal(arr.max(), 7);
    },
    testArrayMaxFail: function () {
        const arr = [3,2,1,7,6,5,4];
        assert.notEqual(arr.max(), 2);
    },
    testDateIsBeforeDateSuccess: function () {
        const d1 = new Date("2017-01-30");
        const d2 = new Date("2017-01-25");
        assert.ok(d2.isBeforeDate(d1));
    },
    testDateIsBeforeDateFail: function () {
        const d1 = new Date("2017-01-25");
        const d2 = new Date("2017-01-30");
        assert.ok(!d2.isBeforeDate(d1));
    },
    testDateIsSameDayAsSuccess: function () {
        const d1 = new Date("2017-01-30");
        const d2 = new Date("2017-01-30");
        assert.ok(d1.isSameDayAs(d2));
    },
    testDateIsSameDayAsFail: function () {
        const d1 = new Date("2017-01-25");
        const d2 = new Date("2017-01-30");
        assert.ok(!d1.isSameDayAs(d2));
    },
};

module.exports = {
    testCases
};
