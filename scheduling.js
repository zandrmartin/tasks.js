// Copyright © 2016 Zandr Martin

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

function parseDueDate(_dt) {
    const now = new Date();
    const dt = _dt.toLowerCase();
    let d = new Date(_dt);

    if (d.toDateString() !== "Invalid Date") {
        return d;
    }

    d = new Date();

    if (dt === "today") {
        d.setDate(now.getDate());
    } else if (dt === "tomorrow") {
        d.setDate(now.getDate() + 1);
    } else if (DAYS.includes(dt)) {
        const day = DAYS.findIndex((item) => item === dt);
        if (day > now.getDay()) {
            d.setDate(now.getDate() + (day - now.getDay()));
        } else {
            d.setDate(now.getDate() + (7 - now.getDay()) + day);
        }
    } else if (dt.isNumeric()) {
        if (dt > now.getDate()) {
            d.setUTCMonth(now.getUTCMonth() + 1);
        }
        d.setDate(dt);
    } else {
        throw { name: "DueDateError", message: `${_dt} is not a valid date.` };
    }

    return d;
}

function nextScheduled(sched) {
    const [_num, time] = sched.split(" ");
    const number = parseInt(_num, 10);
    let d = new Date();

    if (!isNaN(number)) {
        switch (time) {
        case "day": // fallthrough
        case "days":
            d.setDate(d.getDate() + number);
            break;

        case "week": // fallthrough
        case "weeks":
            d.setDate(d.getDate() + (number * 7));
            break;

        case "month": // fallthrough
        case "months":
            d.setUTCMonth(d.getUTCMonth() + number);
            break;

        case "year": // fallthrough
        case "years":
            d.setYear(d.getYear() + number);
            break;

        default:
            throw { name: "ScheduleError", message: `${sched} is not a valid schedule.` };
        }
    } else {
        throw { name: "ScheduleError", message: `${sched} is not a valid schedule.` };
    }

    return d;
}

module.exports = {
    parseDueDate,
    nextScheduled
};
