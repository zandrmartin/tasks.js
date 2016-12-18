# tasks.js

task.js is a simple CLI todo list application that I wrote mostly as an excuse to learn JavaScript. In the process I've
learned to love the language, but not the ecosystem. tasks.js has no external dependencies.

## Usage

`node tasks.js <action> <options>`

`<action>` is one of `add`, `clean-cache`, `complete`, `delete`, `list`, `postpone`, `rename`, `retag`, `status`

`<options>` depend on action:

- `add "name of task" [<-d|--due> <date|day-of-week>] [<-r|--recurs> [#] <day|week|month|year|day-of-week>] [<-t|--tags> tag1 [tag2 tag3 ...]]`
- `complete <id> [<id> <id> ...]`
- `delete <id> [<id> <id> ...]`
- `list [dated] ["search term"]`
- `postpone <date> <id> [<id> <id> ...]`
- `rename <id> <name>`
- `retag <id> [tag1 tag2 tag3 ...]`

## Examples

I'd recommend setting up an alias in your shell. Something like `alias task='node tasks.js'`.

- Add a task due on Tuesday: `task add "do that thing" -d tuesday`
- Change that task to be due Wednesday: `task postpone wednesday <id>`
- Add a task due the 17th of every other month: `task add "do the monthly thing" -d 1-17-2017 -r 2 month`
- Rename that task: `task rename <id> "do the bi-monthly thing"`
- Add a task with some tags: `task add "take care of that stuff" -t stuff "take care"
- Change those tags: `task retag <id> stuff things`
- Add a task due on Mondays and Thursdays: `task add "biweekly stuttered thing" -d monday -r monday,thursday`
- See all tasks that are not completed: `task list`
- See all the tasks that contain the word `foobar` in the name or the tags: `task list foobar`
- See all tasks due on a particular day: `task list dated 8-12-2042`

## Explanation of actions

- `add` adds a task
- `clean-cache` deletes all completed tasks from the storage file
- `complete` completes a task, either by marking it completed, or rescheduling it for its next occurrence
- `delete` deletes a task. There is no recovery.
- `list` list tasks, optionally narrowed by some search criteria
- `postpone` reschedule a specific task
- `rename` rename a specific task
- `retag` change the tags on a specific task. You have to provide _all_ of the new tags, even ones that the task
  already has.
- `status` a special command to list all tasks due today (or in the past) joined into a single string, for use in
  status bars e.g. [Lemonbar](https://github.com/LemonBoy/bar) etc.
