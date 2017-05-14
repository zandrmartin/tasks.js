// Copyright © 2016-2017 Zandr Martin

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
"use strict";
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function parseDueDate(_dt, _start) {
    const start = _start || new Date();
    const dt = _dt.toLowerCase();
    let d = new Date(_dt);

    if (d.toDateString() !== "Invalid Date") {
        return d;
    }

    d = new Date();

    if (dt === "today") {
        d.setDate(start.getDate());
    } else if (dt === "tomorrow") {
        d.setDate(start.getDate() + 1);
    } else if (DAYS.includes(dt)) {
        const day = DAYS.findIndex((item) => item === dt);
        if (day > start.getDay()) {
            d.setDate(start.getDate() + (day - start.getDay()));
        } else {
            d.setDate(start.getDate() + (7 - start.getDay()) + day);
        }
    } else if (dt.isNumeric()) {
        if (parseInt(dt) < start.getDate()) {
            d.setMonth(start.getMonth() + 1);
        }
        d.setDate(dt);
    } else {
        throw { name: "DueDateError", message: `${_dt} is not a valid date.` };
    }

    return d;
}

function nextScheduled(sched, _start) {
    const [_num, time] = sched.split(" ");
    const number = parseInt(_num, 10);
    const d = _start || new Date();
    const start = _start || new Date();

    if (!isNaN(number)) {
        switch (time) {
        case "day": // fallthrough
        case "days":
            d.setDate(start.getDate() + number);
            break;

        case "week": // fallthrough
        case "weeks":
            d.setDate(start.getDate() + (number * 7));
            break;

        case "month": // fallthrough
        case "months":
            d.setMonth(start.getMonth() + number);
            break;

        case "year": // fallthrough
        case "years":
            d.setFullYear(start.getFullYear() + number);
            break;

        default:
            throw { name: "ScheduleError", message: `${sched} is not a valid schedule.` };
        }
    } else if (DAYS.some((day) => sched.toLowerCase().includes(day))) {
        return new Date(Math.min(...sched.split(",").map((d) => parseDueDate(d, start))));
    } else {
        throw { name: "ScheduleError", message: `${sched} is not a valid schedule.` };
    }

    return d;
}

module.exports = {
    parseDueDate,
    nextScheduled
};
