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
const path = require("path");
const fs = require("fs");
const console = require("console");
const DATA_FILE = (typeof process.env.XDG_DATA_HOME === "undefined")
                  ? path.join(process.env.HOME, ".tasks.json")
                  : path.join(process.env.XDG_DATA_HOME, "tasks.json");
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const ACTIONS = ["add", "complete", "delete", "list", "status"];
const USAGE = `Usage: node tasks.js <action> <options>

  <action> is one of ${ACTIONS.map((a) => `"${a}"`).join(", ")}
  <options> depend on action

  Syntax: node tasks.js ...
    add "name/description of task" [flags]
    complete <id>
    delete <id>
    list [tagged|dated] "search term"
    status

  Flags:
    -d, --due <date|day-of-week>
    -r, --recurs <#> <day|week|month|year>
    -t, --tags tag1 [tag2 tag3 ...]`;

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

function Task(init = {}) {
    let ret = {
        id: Task.nextId(),
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
                // change due date here
            } else {
                this.completed = true;
            }
        },
        tags: []
    };

    Object.assign(ret, init);
    Task.registry.add(ret);
    return ret;
}

Task.nextId = function () {
    let ret = 0;

    while (Task.registry.items.filter((item) => item.id === ret).length > 0) {
        ret++;
    }

    return ret;
};

Task.registry = {
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
            data.forEach((t) => Task(t));
        }
    },
    remove: function (id) {
        let i = this.items.findIndex((t) => t.id === id);
        return this.items.splice(i, 1);
    }
};

Task.registry.load();

function nextScheduled(sched) {
    const pieces = sched.split(" ");
    if (pieces[0].isNumeric() && ["day", "week", "month", "year"].includes(pieces[1])) {
        DAYS;
    }
}

function parseDueDate(_dt) {
    const now = new Date();
    const dt = _dt.toLowerCase();
    let d = new Date(_dt);

    if (d.toDateString() !== "Invalid Date") {
        return d;
    }

    d = new Date();

    if (dt === "tomorrow") {
        d.setDate(now.getDate() + 1);
    } else if (DAYS.includes(dt)) {
        const dt = DAYS.findIndex((day) => day === dt);
        if (dt > now.getDay()) {
            d.setDate(now.getDate() + (dt - now.getDay()));
        } else {
            d.setDate(now.getDate() + (7 - now.getDay()) + dt);
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

function parseArgs() {
    let args = process.argv.slice(2);
    if (args.length < 1) {
        throw { name: "ArgumentError", message: USAGE };
    }

    let options = {};

    const argParsers = {
        add: function () {
            options.name = args.shift();
            let arg;

            while ((arg = args.shift())) {
                switch (arg.toLowerCase().replace(/^-*/, "")) {
                case "d": // fallthrough
                case "due":
                    options.due = args.shift();
                    break;

                case "r": // fallthrough
                case "recurs":
                    options.recurs = args.shift();

                    break;
                case "t": // fallthrough
                case "tags":
                    options.tags = args;
                    return;

                default:
                    break;
                }
            }
        },
        complete: function () {
            let arg;
            options.itemIds = [];
            while ((arg = args.shift())) {
                options.itemIds.push(parseInt(arg, 36));
            }
        },
        list: function () {
            if (args.length === 0) {
                options.listType = "all";
                return;
            }

            let arg = args.shift();

            if (["dated", "tagged"].includes(arg.toLowerCase()) && args.length > 0) {
                options.listType = arg.toLowerCase();
                options.listSearch = args.shift();
            } else {
                options.listType = "named";
                options.listSearch = arg;
            }
        }
    };
    argParsers.delete = argParsers.complete;

    options.action = args.shift().toLowerCase();

    if (!ACTIONS.includes(options.action)) {
        throw { name: "ArgumentError", message: `${options.action} is not a valid action.` };
    }

    if (options.action in argParsers) {
        argParsers[options.action].call();
    }

    return options;
}

function displayTasks(items) {
    function dueLength(a, b) {
        const aLength = (a.due) ? a.due.toDateString().length : 0;
        const bLength = (b.due) ? b.due.toDateString().length : 0;
        return Math.max(aLength, bLength);
    }

    const maxLengths = {
        id: items.reduce((a, b) => Math.max(a.id.toString().length, b.id.toString().length)),
        name: items.reduce((a, b) => Math.max(a.name.length, b.name.length)),
        due: items.reduce(dueLength),
        tags: items.reduce((a, b) => Math.max(a.tags.join(", ").length, b.tags.join(", ").length))
    };

    const h = {
        id: "id".padLeft(maxLengths.id),
        name: "Task".padRight(maxLengths.name),
        due: "Due".padRight(maxLengths.due),
        tags: "Tags".padRight(maxLengths.tags)
    };

    const header = `${h.id}  ${h.name}  ${h.due}  ${h.tags}`;
    console.log(header.length);

    console.log(header);
    console.log("".padRight(header.length, "-"));

    items.forEach(function (item) {
        let id = item.id.toString().padLeft(Math.max(h.id.length, maxLengths.id));
        let name = item.name.padRight(maxLengths.name);
        let due = (item.due) ? item.due.toDateString().padRight(maxLengths.due) : "".padRight(maxLengths.due);
        let tags = item.tags.join(", ");
        console.log(`${id}  ${name}  ${due}  ${tags}`);
    });
}

try {
    let options = parseArgs();
    switch (options.action) {
    case "add": {
        let attrs = { name: options.name };
        let task = Task(attrs);

        if (options.due) {
            task.due = parseDueDate(options.due);

            if (options.recurs) {
                nextScheduled(options.recurs); // just so we throw an error if it's wrong
                task.schedule = options.recurs;
                task.recurs = true;
            }
        }

        if (options.tags) {
            task.tags = options.tags;
        }

        console.log(`Added task ${task.name}!`);
        Task.registry.save();
        break;
    }
    case "delete": // fallthrough
    case "complete": {
        const tasks = Task.registry.items.filter((item) => options.itemIds.includes(item.id));
        tasks.forEach(function (task) {
            if (options.action === "complete") {
                task.complete();
            } else {
                Task.registry.remove(task.id);
            }
            console.log(`Task ${task.id} (${task.name}) ${options.action}d.`);
        });
        Task.registry.save();
        break;
    }
    case "status": {
        const now = Date.now();
        const items = Task.registry.items.filter((t) => (t.due && t.due < now && !t.completed));
        console.log(items.map((t) => `[${t.id.toString(36)}] ${t.name}`).join(" "));
        break;
    }
    case "list": {
        let items;
        const search = (options.listSearch) ? options.listSearch.toLowerCase() : "";

        switch (options.listType) {
        case "dated": {
            let find = new Date(search);
            items = Task.registry.items.filter((item) => (item.due && item.due.toDateString() === find.toDateString()));
            break;
        }

        case "tagged":
            items = Task.registry.items.filter((x) => x.tags.includes(search));
            break;

        case "named":
            items = Task.registry.items.filter((item) => item.name.toLowerCase().includes(search));
            break;

        case "all":
            items = Task.registry.items;
            break;
        }

        displayTasks(items.filter((item) => !item.completed));
    }
    }
} catch (error) {
    console.log(error.message);
}

