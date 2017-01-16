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
const path = require("path");
const fs = require("fs");
const scheduling = require("./scheduling.js");
const DATA_FILE = (typeof process.env.XDG_DATA_HOME === "undefined")
                  ? path.join(process.env.HOME, ".tasks.json")
                  : path.join(process.env.XDG_DATA_HOME, "tasks.json");

const Task = {
    objProto: {
        id: null,
        name: null,
        _due: null,
        get due() { return this._due; },
        set due(d) {
            if (d) {
                this._due = (typeof d === "object") ? d : new Date(d);
            }
        },
        recurs: false,
        schedule: null,
        completed: false,
        complete: function () {
            if (this.recurs && this.schedule) {
                this.due = scheduling.nextScheduled(this.schedule, this.due);
            } else {
                this.completed = true;
            }
        },
        tags: [],
        toJSON: function () {
            let ret = {
                id: this.id,
                name: this.name,
                recurs: this.recurs,
                completed: this.completed
            };

            if (this.due) {
                ret.due = this.due;
            }

            if (this.schedule) {
                ret.schedule = this.schedule;
            }

            if (this.tags.length > 0) {
                ret.tags = this.tags;
            }

            return ret;
        }
    },
    new: function (init = {}) {
        const t = Object.create(Task.objProto);
        t.id = 0;

        // set id to first unused id
        while (Task.registry.items.filter((item) => item.id === t.id).length > 0) {
            t.id++;
        }

        Object.assign(t, init);
        Task.registry.add(t);
        return t;
    },
    registry: {
        items: [],
        tags: new Set(),
        add: function (item) {
            this.items.push(item);
            item.tags.forEach((tag) => this.tags.add(tag));
        },
        save: function () {
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.items), { mode: 0o644 });
        },
        load: function () {
            let data = JSON.parse(fs.readFileSync(DATA_FILE));
            if (data && data.length) {
                data.forEach((item) => Task.new(item));
            }
        },
        remove: function (id) {
            const i = this.items.findIndex((item) => item.id === id);
            return this.items.splice(i, 1);
        },
        getById: function (id) {
            const tasks = this.items.filter((item) => item.id === id);
            return (tasks.length > 0) ? tasks[0] : null;
        }
    },
    displayList: function (items) {
        const maxLengths = {
            id:   Math.max(2, items.map((item) => item.id.toString(36).length).max()),
            name: Math.max(4, items.map((item) => item.name.length).max()),
            due:  Math.max(3, items.map((item) => (item.due) ? item.due.toDateString().length : 0).max()),
            tags: Math.max(4, items.map((item) => item.tags.join(", ").length).max()),
            sched: Math.max(8, items.map((item) => (item.schedule) ? item.schedule.length : 0).max())
        };

        const h = {
            id:    "id".padLeft(maxLengths.id),
            name:  "Task".padRight(maxLengths.name),
            due:   "Due".padRight(maxLengths.due),
            tags:  "Tags".padRight(maxLengths.tags),
            sched: "Schedule".padRight(maxLengths.sched)
        };

        const show = {
            due:   items.some((item) => !!item.due),
            tags:  items.some((item) => item.tags && item.tags.length > 0),
            sched: items.some((item) => !!item.schedule)
        };

        let header = `${h.id}  ${h.name}`;

        if (show.due) {
            header += `  ${h.due}`;
        }

        if (show.sched) {
            header += `  ${h.sched}`;
        }

        if (show.tags) {
            header += `  ${h.tags}`;
        }

        const output = [header];
        output.push("".padRight(header.length, "-"));

        items.forEach(function (item) {
            let id    = item.id.toString(36).padLeft(Math.max(h.id.length, maxLengths.id));
            let name  = item.name.padRight(maxLengths.name);
            let due   = ((item.due) ? item.due.toDateString() : "").padRight(maxLengths.due);
            let tags  = item.tags.sort().join(", ");
            let sched = ((item.schedule) ? item.schedule : "").padRight(maxLengths.sched);
            let line  = `${id}  ${name}`;

            if (show.due) {
                line += `  ${due}`;
            }

            if (show.sched) {
                line += `  ${sched}`;
            }

            if (show.tags) {
                line += `  ${tags}`;
            }

            output.push(line);
        });

        output.push("".padRight(header.length, "-"));
        output.push(`${items.length} total tasks`);
        return output.join("\n");
    }
};

module.exports = Task;
