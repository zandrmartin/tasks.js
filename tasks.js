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
const scheduling = require("./scheduling.js");
const console = require("console");
const ACTIONS = ["add", "complete", "delete", "list", "status", "clean-cache", "postpone", "rename", "retag"];
const USAGE = `Usage: node tasks.js <action> <options>

<action> is one of ${ACTIONS.map((a) => `"${a}"`).sort().join(", ")}
<options> depend on action

Options:
  add "name of task" [<-d|--due> <date|day-of-week>]
                     [<-r|--recurs> [#] <day|week|month|year|day-of-week>]
                     [<-t|--tags> tag1 [tag2 tag3 ...]]
  clean-cache
  complete <id> [<id> <id> ...]
  delete <id> [<id> <id> ...]
  list [dated] ["search term"] [-c|--completed]
  postpone <date> <id> [<id> <id> ...]
  rename <id> <name>
  retag <id> [tag1 tag2 tag3 ...]
  status`;

Task.registry.load();

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

                    if (options.recurs.isNumeric()) {
                        // meaning something like `-r 3 weeks` instead of `-r monday,thursday`
                        options.recurs += " " + args.shift();
                    }

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
            options.list = {
                completed: false
            };

            const i = args.findIndex((arg) => ["-c", "--completed"].includes(arg.toLowerCase()));
            if (i > -1) {
                args.splice(i, 1);
                options.list.completed = true;
            }

            if (args.length === 0) {
                options.list.type = "all";
                return;
            }

            let arg = args.shift();

            if (arg.toLowerCase() === "dated" && args.length > 0) {
                options.list.type = "dated";
                options.list.search = args.shift();
            } else {
                options.list.type = "named";
                options.list.search = arg;
            }
        },
        postpone: function () {
            if (args.length < 2) {
                throw { name: "ArgumentError", message: "Postpone requires date and id(s)." };
            }

            options.due = args.shift();
            options.ids = args.map((id) => parseInt(id, 36));
        },
        rename: function () {
            if (args.length < 2) {
                throw { name: "ArgumentError", message: "Rename requires id and name." };
            }

            options.id = parseInt(args.shift(), 36);
            options.name = args.shift();
        },
        retag: function () {
            if (args.length < 1) {
                throw { name: "ArgumentError", message: "Retag requires id and (optional) tags." };
            }

            options.id = parseInt(args.shift(), 36);
            options.tags = args;
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
        id:   Math.max(2, items.map((item) => item.id.toString(36).length).max()),
        name: Math.max(4, items.map((item) => item.name.length).max()),
        due:  Math.max(3, items.map((item) => (item.due) ? item.due.toDateString().length : 0).max()),
        tags: Math.max(4, items.map((item) => item.tags.join(", ").length).max())
    };

    const h = {
        id:   "id".padLeft(maxLengths.id),
        name: "Task".padRight(maxLengths.name),
        due:  "Due".padRight(maxLengths.due),
        tags: "Tags".padRight(maxLengths.tags)
    };

    const showDueCol = items.some((item) => !!item.due);
    const showTagCol = items.some((item) => item.tags && item.tags.length > 0);

    let header = `${h.id}  ${h.name}`;

    if (showDueCol) {
        header += `  ${h.due}`;
    }

    if (showTagCol) {
        header += `  ${h.tags}`;
    }

    console.log(header);
    console.log("".padRight(header.length, "-"));

    items.forEach(function (item) {
        let id   = item.id.toString(36).padLeft(Math.max(h.id.length, maxLengths.id));
        let name = item.name.padRight(maxLengths.name);
        let due  = (item.due) ? item.due.toDateString().padRight(maxLengths.due) : "".padRight(maxLengths.due);
        let tags = item.tags.sort().join(", ");
        let line = `${id}  ${name}`;

        if (showDueCol) {
            line += `  ${due}`;
        }

        if (showTagCol) {
            line += `  ${tags}`;
        }

        console.log(line);
    });

    console.log("".padRight(header.length, "-"));
    console.log(`${items.length} total tasks`);
}

try {
    let options = parseArgs();
    switch (options.action) {
    case "add": {
        const attrs = { name: options.name };
        let task = Task.new(attrs);

        if (options.due) {
            task.due = scheduling.parseDueDate(options.due);

            if (options.recurs) {
                scheduling.nextScheduled(options.recurs); // just so we throw an error if it's wrong
                task.schedule = options.recurs;
                task.recurs = true;
            }
        }

        if (options.tags) {
            task.tags = options.tags;
        }

        console.log(`Added task ${task.name} (id ${task.id.toString(36)}).`);
        Task.registry.save();
        break;
    }

    case "delete": // fallthrough
    case "complete":
        Task.registry.items.filter((item) => options.ids.includes(item.id)).forEach(function (task) {
            if (options.action === "complete") {
                task.complete();
            } else {
                Task.registry.remove(task.id);
            }
            console.log(`Task ${task.id} (${task.name}) ${options.action}d.`);
        });
        Task.registry.save();
        break;

    case "status": {
        const today = new Date();
        let items = Task.registry.items.filter((t) => (t.due && t.due.isBeforeDate(today) && !t.completed));

        if (items.length > 0) {
            items.sort((a, b) => a.id - b.id);
            console.log(items.map((t) => `[${t.id.toString(36)}] ${t.name}`).join(" "));
        }

        break;
    }

    case "list": {
        let _items;
        const search = (options.list.search) ? options.list.search.toLowerCase() : "";

        switch (options.list.type) {
        case "dated": {
            let find = new Date(search);
            _items = Task.registry.items.filter((item) => (item.due && item.due.isSameDayAs(find)));
            break;
        }

        case "named":
            _items = Task.registry.items.filter(function (item) {
                return (
                    item.name.toLowerCase().includes(search) ||
                    item.tags.some((tag) => tag.toLowerCase().includes(search))
                );
            });

            break;

        case "all":
            _items = Task.registry.items;
            break;
        }

        _items.sort((a, b) => (a.due && b.due) ? b.due - a.due : (a.due) ? 1 : (b.due) ? -1 : 0);
        const items = _items.filter((item) => item.completed === options.list.completed);

        if (items.length > 0) {
            displayTasks(items);
        } else {
            console.log("No tasks found.");
        }

        break;
    }

    case "clean-cache":
        Task.registry.items.forEach(function (item) {
            if (item.completed) {
                Task.registry.remove(item.id);
                console.log(`Removing completed item ${item.name}.`);
            }
        });
        Task.registry.save();
        break;

    case "postpone":
        Task.registry.items.forEach(function (item) {
            if (options.ids.includes(item.id)) {
                item.due = scheduling.parseDueDate(options.due);
                console.log(`Postponed ${item.name} until ${item.due}.`);
            }
        });
        Task.registry.save();
        break;

    case "rename": {
        let task = Task.registry.getById(options.id);

        if (!task) {
            console.log(`Unable to find task with id ${options.id}.`);
            break;
        }

        const old = task.name;
        task.name = options.name;
        Task.registry.save();
        console.log(`Renamed task "${old}" to "${task.name}".`);

        break;
    }

    case "retag": {
        let task = Task.registry.getById(options.id);

        if (!task) {
            console.log(`Unable to find task with id ${options.id}.`);
            break;
        }

        const old = task.tags;
        task.tags = options.tags;
        Task.registry.save();
        console.log(`Retagged task ${task.name}; removed [${old.sort().join(", ")}], added [${task.tags.sort().join(", ")}].`);

        break;
    }
    }
} catch (error) {
    console.log(error.message);
}
