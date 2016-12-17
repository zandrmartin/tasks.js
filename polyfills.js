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
if (!String.prototype.isNumeric) {
    String.prototype.isNumeric = function () {
        return !isNaN(parseInt(this, 10));
    };
}

if (!String.prototype.padRight) {
    String.prototype.padRight = function (amount, pad = " ") {
        let newString = this.toString();
        while (newString.length < amount) {
            newString += pad;
        }
        return newString;
    };
}

if (!String.prototype.padLeft) {
    String.prototype.padLeft = function (amount, pad = " ") {
        let newString = this.toString();
        while (newString.length < amount) {
            newString = pad + newString;
        }
        return newString;
    };
}

if (!Array.prototype.max) {
    Array.prototype.max = function () {
        return Math.max(...this);
    };
}

if (!Date.prototype.isBeforeDate) {
    Date.prototype.isBeforeDate = function (d) {
        d.setHours(23);
        d.setMinutes(59);
        d.setSeconds(59);
        d.setMilliseconds(999);
        return this < d;
    };
}

if (!Date.prototype.isSameDayAs) {
    Date.prototype.isSameDayAs = function (d) {
        return this.toDateString() === d.toDateString();
    };
}
