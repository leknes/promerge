# Promerge

*Promerge* is my first plugin, and I initially created it to simplify my workflow when documenting my game development.
The plugin is able to merge multiple folders into a single merge folder that only includes the latest files.

This can be really useful when working on a project that goes through multiple versions, where some features may be removed or overwritten, while others can last over multiple versions.

## How to use

The folders to merge are called branches and have to start with an appropriate date, like "2024.07.30". The name can be extended by adding a dash after the date, like "2024.08.02 - First version".

A global merge can be created by using the ribbon menu on the right, and a folder-scoped merge can be created by using the folder menu.

Then, for each branch, the files are copied into a merge folder. The catch is, however, that for instance, when there is a file with the path "2024.07.30/Some directory/Example file.md" and a file with the path "2024.08.02 - First version/Some directory/Example file.md", then only the latter will be copied into the merge folder since it is the most recent file.

The name of the merge folder, and if a merge should automatically be created when editing a branch, can also be configured in the settings.