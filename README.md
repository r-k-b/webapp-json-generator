# Webapp JSON Generator

An Open Platform app for Adobe Business Catalyst, that dumps the contents of a sites Web Apps to JSON files.

## How do I use it?

Each time you would like to refresh (or create) the JSON files, open the menu item 'Webapp JSON Generator'.
It will automatically begin dumping all webapp items.

## TODO:

* TESTS!
* Show progress indicators for individual webapps
* Report on # of webapp items saved
* Link to final json files (they're currently just dumped in the root, named by the webapp ID; e.g., `/12345.json`)
* Make instructions clearer
* Handle the case where there are no webapps in the site
* Warn when navigating away before the process is finished (with `window.onbeforeunload`?)