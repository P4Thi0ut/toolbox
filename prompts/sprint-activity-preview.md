I need to create a module for team members sprint activity preview to give a heads up on team occupation.
The main focus is being able to track spent time, and detect parasite requests that might plumber activity.

# Features

## Team visualisation in a gantt like chart

### Glossary :

- team member : name
- project : a list of project
- task : attached to a project, has a type [DEV, SPEC, MEET, QA, DEPLOY], has a label and a workload
- workload : time to be done, counted in days , increment step 0.25.

### Principle

I have a set of team members.
For each, a set of tasks.
A task can be assign to multiple team members
    - Either the task workload is duplicated for each associated team member
    - Either it's split in repartition, for instance
        - For a task with 2 days workload
        - Member A is assigned 0.5 days
        - Member B is assigned 1.5 days
        - With an option to dispatch equally on each members by default
The project list is built from the labels inputed within tasks.
When you create a task you can select the attached project based on previous input or create a new one.

### Visualization

Between GANTT and Timeline.
Basically I need to visualize a two-weeks span of activity to see time spent by members.
Principle being each member should be staffed 100%.
I don't care about date start and date end of tasks, I just care about task order and durations in days.
The timeline should visually have a two-weeks span without weekend days and for each day, have 4 slots (because minimum task workload is 0.25 day).

Columns : day slot scale
Lines : one line per member
and the display of tasks in a gantt like or timeline like fashion.
(Sprints in our org is two weeks but this can be configurable)
On hover on task see task details.

Of course I need all the classic, edit, remove, reorder lines to work on the visual timeline.

# General behaviour

As being a front-only app, no API and no persistent storage.
I need a way to export data from a visualisation.
As I will want to do followups on several sprint I need prior to build for current sprint to load previous sprint data.

I should be able to load data with a JSON.

- Each sprint visualisation would be stored in an ordered table in the json
- Prior to create a new sprint, name it so that on UI you can navigate on past sprints.
- Have a set of referential data cross-sprints to be loaded, for instance, members, projects to not have to recreate those for each sprint

And of course being able to donwload this JSON "database" to keep the progress on my local computer for next time.