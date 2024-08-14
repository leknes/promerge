# Promerge

*Promerge* is my first plugin, and I initially created it to simplify my workflow when documenting my game development.
It is able to merge multiple versions of an obsidian vault or folder into a single folder, where all the latest changes of a project can be observed.

## How to use

As this plugin provides a pretty simplified implementation of a versioning tool, a certain kind of organization has to be applied for the plugin to work nicely.
For every version of a project, that is documented in *Obsidian* a new folder should be created, with a name that includes the date, at which the version was created. 
Examples for such folder names are "2024.07.30" or "2025.01.12 - Version 0.1.2" or "2420.04.20 - Initial version". 

A merged folder can then be created, by either right-clicking a folder that contains multiple version folders, or by using the ribbon menu on the left, which will create a merged folder for the whole vault.
The default name of the merged folder, as well as whether the merged folder should automatically be updated, can be specified in the settings.

You should try to use the same folder structure inside a version folder. For instance, when you make a video game, and you have a note regarding status effects you might have a path, 
that goes like "2025.01.12 - Version 0.1.2/Game mechanics/Status effects.md". 
If you now decide to rewrite the system for status effects, you should create the appropriate note in a new version with the same name, like "2025.02.15 - Version 0.2.0/Game mechanics/Status effects.md".
This is, because when merging, for each relative path to the version folder, the most recent file is used in the final merged folder.

Here is an example for a folder layout that would work neat with *Promerge*:

- 	2025.01.12 - Version 0.1.2
	-	Mechanics
  		-	Status effects.md
    	-	Health.md
        -	Special attacks.md		   
-	2025.02.15 - Version 0.2.0
	-	Mechanics
  		-	Status effects.md
-	2027.03.24 - Version 0.3.2
	-	Mechanics
  		-	Health.md

The merged folder would now contain "Health.md" for the last version, "Status effects.md" from the second version and "Special attacks.md" from the first one.
And just by the way, this of course is not a representative timeline for versioning, I hope, at least.
