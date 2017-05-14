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
const scheduling = require("../scheduling.js");

const setup = function () {
    class MockDate extends Date {
        // the mock's "today" is june 15, 2017 at 6:00:00.000AM which is a
        // thursday
        constructor(_args = false) {
            if (_args) {
                super(_args);
                return;
            }
            super();

            this.setFullYear(2017);
            this.setMonth(5);
            this.setDate(15);
            this.setHours(6);
            this.setMinutes(0);
            this.setSeconds(0);
            this.setMilliseconds(0);
        }
    }

    global._oldDate = Date;
    global.Date = MockDate;
};

const teardown = function () {
    global.Date = global._oldDate;
    delete global._oldDate;
};

const testCases = {
    testNextScheduledDayNoStart: function () {
        const schedule = "3 days";
        const expected = new Date();
        expected.setDate(18);
        assert.deepEqual(expected, scheduling.nextScheduled(schedule));
    },
    testNextScheduledDayWithStart: function () {
        const schedule = "3 days";
        const startDate = new Date();
        startDate.setDate(20);
        const expected = new Date();
        expected.setDate(23);
        assert.deepEqual(expected, scheduling.nextScheduled(schedule, startDate));
    },
    testNextScheduledWeekNoStart: function () {
        const schedule = "3 weeks";
        const expected = new Date();
        expected.setMonth(6);
        expected.setDate(6);
        assert.deepEqual(expected, scheduling.nextScheduled(schedule));
    },
    testNextScheduledWeekWithStart: function () {
        const schedule = "3 weeks";
        const startDate = new Date();
        startDate.setDate(20);
        const expected = new Date();
        expected.setMonth(6);
        expected.setDate(11);
        assert.deepEqual(expected, scheduling.nextScheduled(schedule, startDate));
    },
    testNextScheduledMonthNoStart: function () {
        const schedule = "3 months";
        const expected = new Date();
        expected.setMonth(8);
        assert.deepEqual(expected, scheduling.nextScheduled(schedule));
    },
    testNextScheduledMonthWithStart: function () {
        const schedule = "3 months";
        const startDate = new Date();
        startDate.setDate(20);
        const expected = new Date();
        expected.setDate(20);
        expected.setMonth(8);
        assert.deepEqual(expected, scheduling.nextScheduled(schedule, startDate));
    },
    testNextScheduledYearNoStart: function () {
        const schedule = "3 years";
        const expected = new Date();
        expected.setFullYear(2020);
        assert.deepEqual(expected, scheduling.nextScheduled(schedule));
    },
    testNextScheduledYearWithStart: function () {
        const schedule = "3 years";
        const startDate = new Date();
        startDate.setFullYear(2018);
        const expected = new Date();
        expected.setFullYear(2021);
        assert.deepEqual(expected, scheduling.nextScheduled(schedule, startDate));
    },
    testNextScheduledSingleDayNoStart: function () {
        const schedule = "monday";
        const expected = new Date();
        expected.setDate(19);
        assert.deepEqual(expected, scheduling.nextScheduled(schedule));
    },
    testNextScheduledSingleDayWithStart: function () {
        const schedule = "monday";
        const startDate = new Date();
        startDate.setDate(20);
        const expected = new Date();
        expected.setDate(26);
        assert.deepEqual(expected, scheduling.nextScheduled(schedule, startDate));
    },
    testNextScheduledMultipleDaysNoStart: function () {
        const schedule = "monday,thursday";
        const expected = new Date();
        expected.setDate(19);
        assert.deepEqual(expected, scheduling.nextScheduled(schedule));
    },
    testNextScheduledMultipleDaysWithStart: function () {
        const schedule = "monday,thursday";
        const startDate = new Date();
        startDate.setDate(20);
        const expected = new Date();
        expected.setDate(22);
        assert.deepEqual(expected, scheduling.nextScheduled(schedule, startDate));
    },
    testNextScheduledGibberish: function () {
        const testFunc = function () {
            scheduling.nextScheduled("hkasljdhaksjdh");
        };
        assert.throws(testFunc);
    },
    testParseDueDateTodayNoStart: function () {
        const expected = new Date();
        assert.deepEqual(expected, scheduling.parseDueDate("today"));
    },
    testParseDueDateTodayWithStart: function () {
        const startDate = new Date();
        startDate.setDate(27);
        const expected = new Date();
        expected.setDate(27);
        assert.deepEqual(expected, scheduling.parseDueDate("today", startDate));
    },
    testParseDueDateTomorrowNoStart: function () {
        const expected = new Date();
        expected.setDate(16);
        assert.deepEqual(expected, scheduling.parseDueDate("tomorrow"));
    },
    testParseDueDateTomorrowWithStart: function () {
        const startDate = new Date();
        startDate.setDate(27);
        const expected = new Date();
        expected.setDate(28);
        assert.deepEqual(expected, scheduling.parseDueDate("tomorrow", startDate));
    },
    testParseDueDateWeekdayAfterNoStart: function () {
        const expected = new Date();
        expected.setDate(16);
        assert.deepEqual(expected, scheduling.parseDueDate("friday"));
    },
    testParseDueDateWeekdayAfterWithStart: function () {
        const startDate = new Date();
        startDate.setDate(20);
        const expected = new Date();
        expected.setDate(23);
        assert.deepEqual(expected, scheduling.parseDueDate("friday", startDate));
    },
    testParseDueDateWeekdayBeforeNoStart: function () {
        const expected = new Date();
        expected.setDate(20);
        assert.deepEqual(expected, scheduling.parseDueDate("tuesday"));
    },
    testParseDueDateWeekdayBeforeWithStart: function () {
        const startDate = new Date();
        startDate.setDate(22);
        const expected = new Date();
        expected.setDate(27);
        assert.deepEqual(expected, scheduling.parseDueDate("tuesday", startDate));
    },
    testParseDueDateNumericBeforeNoStart: function () {
        const expected = new Date();
        expected.setDate(13);
        expected.setMonth(6);
        assert.deepEqual(expected, scheduling.parseDueDate("13"));
    },
    testParseDueDateNumericBeforeWithStart: function () {
        const startDate = new Date();
        startDate.setDate(20);
        const expected = new Date();
        expected.setMonth(6);
        expected.setDate(15);
        assert.deepEqual(expected, scheduling.parseDueDate("15", startDate));
    },
    testParseDueDateNumericAfterNoStart: function () {
        const expected = new Date();
        expected.setDate(20);
        assert.deepEqual(expected, scheduling.parseDueDate("20"));
    },
    testParseDueDateNumericAfterWithStart: function () {
        const startDate = new Date();
        startDate.setDate(20);
        const expected = new Date();
        expected.setDate(22);
        assert.deepEqual(expected, scheduling.parseDueDate("22", startDate));
    },
    testParseDueDateGibberish: function () {
        const testFunc = function () {
            scheduling.parseDueDate("alskjdaklsjda");
        };
        assert.throws(testFunc);
    }
};

module.exports = {
    setup,
    teardown,
    testCases
};
