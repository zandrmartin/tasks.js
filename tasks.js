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
require("./polyfills.js");
const Task = require("./task.js");
const console = require("console");
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

Task.registry.load();

function nextScheduled(sched) {
    const pieces = sched.split(" ");
    if (pieces[0].isNumeric() && ["day", "week", "month", "year"].includes(pieces[1])) {
        DAYS; // to silence warnings; this is not done yet
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
            options.ids = args.map((id) => parseInt(id, 36));
        },
        list: function () {
            options.list = {};
            if (args.length === 0) {
                options.list.type = "all";
                return;
            }

            let arg = args.shift();

            if (["dated", "tagged"].includes(arg.toLowerCase()) && args.length > 0) {
                options.list.type = arg.toLowerCase();
                options.list.search = args.shift();
            } else {
                options.list.type = "named";
                options.list.search = arg;
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
    const maxLengths = {
        id:   items.map((item) => item.id.toString().length).max(),
        name: items.map((item) => item.name.length).max(),
        due:  items.map((item) => (item.due) ? item.due.toDateString().length : 0).max(),
        tags: items.map((item) => item.tags.join(", ").length).max(),
    };

    const h = {
        id:   "id".padLeft(maxLengths.id),
        name: "Task".padRight(maxLengths.name),
        due:  "Due".padRight(maxLengths.due),
        tags: "Tags".padRight(maxLengths.tags)
    };

    const header = `${h.id}  ${h.name}  ${h.due}  ${h.tags}`;

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
        let task = Task.new(attrs);

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

        console.log(`Added task ${task.name}.`);
        Task.registry.save();
        break;
    }
    case "delete": // fallthrough
    case "complete": {
        const tasks = Task.registry.items.filter((item) => options.ids.includes(item.id));
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
        let today = new Date();
        today.setHours(23);
        today.setMinutes(59);
        today.setSeconds(59);
        today.setMilliseconds(999);
        let items = Task.registry.items.filter((t) => (t.due && t.due < today && !t.completed));
        items.sort((a, b) => a.id > b.id);
        console.log(items.map((t) => `[${t.id.toString(36)}] ${t.name}`).join(" "));
        break;
    }
    case "list": {
        let items;
        const search = (options.list.search) ? options.list.search.toLowerCase() : "";

        switch (options.list.type) {
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

        items.sort((a, b) => a.id > b.id);
        displayTasks(items.filter((item) => !item.completed));
    }
    }
} catch (error) {
    console.log(error.message);
}
