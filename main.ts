import { MenuItem, Notice, Plugin, TFile, TFolder, Vault, TAbstractFile } from 'obsidian';
import { PromergeSettingTab } from "./settings";


const ICON = "combine";
const TITLE = "Create merge";
 
interface Mergeable {
	create(path: string): Promise<void>
}

class MergeableFolder implements Mergeable {
	private readonly folders: { [name: string]: MergeableFolder } = {}
	private readonly files: { [name: string]: MergeableFile } = {}

	readonly vault: Vault

	constructor(vault: Vault) {
		this.vault = vault
	}

	addFolder(name: string, folder: MergeableFolder) {
		if (name in this.folders) {
			const subfolder = this.folders[name]
			for (const fileName in folder.files)
				subfolder.addFile(fileName, folder.files[fileName])
			for (const folderName in folder.folders)
				subfolder.addFolder(folderName, folder.folders[folderName])
		}
		else
			this.folders[name] = folder
	}

	addFile(name: string, file: MergeableFile) {
		this.files[name] = file
	}

	async create(path: string): Promise<void> {
		await this.vault.createFolder(path)
		for (const fileName in this.files)
			await this.files[fileName].create(path + "/" + fileName)
		for (const folderName in this.folders)
			await this.folders[folderName].create(path + "/" + folderName)
	}
}

class MergeableFile implements Mergeable {

	private readonly file: TFile
	constructor(file: TFile) {
		this.file = file
	}

	async create(path: string): Promise<void> {
		await this.file.vault.copy(this.file, path)
    }

}
 
export default class PromergePlugin extends Plugin {

	setItem(item: MenuItem) {
		item
			.setTitle(TITLE)
			.setIcon(ICON)
		return item;
	}

	formatBranchName(name: string) {
		const index = name.indexOf(' - ');
		if (index != -1)
			return name.substring(0, index);
		return name
	}

	getBranchDate(folder: TFolder): number {
		const name = this.formatBranchName(folder.name)
		return Date.parse(name);
	}

	isBranch(folder: TFolder) {
		return !isNaN(this.getBranchDate(folder))
	}

	tryAddBranch(branches: [number, TFolder][], folder: TFolder) {
	
		const date = this.getBranchDate(folder)

		if (isNaN(date))
			return false

		branches.push([date, folder])

		return true
	}

	async merge(folder: TFolder) {
		if (this.merging) {
			new Notice("Cannot create new merge while merging.")
			return
		}
	
		this.merging = true

		const branches = this.fetchBranches(folder)

		if (branches.length == 0) {
			new Notice("No branches to merge have been found.")
			return
		}

		await folder.children.forEach(async (child) => {
			if (child instanceof TFolder && child.name == this.settings.mergeName) {
				await this.app.vault.delete(child, true)
				return
			}
		})

		let folderPath = folder.path

		if (!folderPath.endsWith('/'))
			folderPath += '/'

		const path = `${folderPath}${this.settings.mergeName}`
	
		await this.createMerge(branches).create(path)

		this.merging = false
	}

	fetchBranches(folder: TFolder): [number, TFolder][] {
		const branches: [number, TFolder][] = []

		folder.children.forEach((child) => {
			if (child instanceof TFolder)
				this.tryAddBranch(branches, child)
		})

		return branches
	}

	createMerge(branches: [number, TFolder][]): MergeableFolder {
		
		branches.sort((a, b) => a[0] - b[0])

		const mergeableRootFolder = new MergeableFolder(this.app.vault)

		branches.forEach((branch) => {
			this.populateMerge(mergeableRootFolder, branch[1])
		})

		return mergeableRootFolder
	}

	populateMerge(mergeableFolder: MergeableFolder, folder: TFolder) {
		const branches: [number, TFolder][] = []

		folder.children.forEach((child) => {
			if (child instanceof TFolder) {
				if (!this.tryAddBranch(branches, child)) {
					const mergeableSubfolder = new MergeableFolder(mergeableFolder.vault)
					this.populateMerge(mergeableSubfolder, child)
					mergeableFolder.addFolder(child.name, mergeableSubfolder)
				}	
			}
			else if (child instanceof TFile) {
				mergeableFolder.addFile(child.name, new MergeableFile(child))
			}
		})

		if (branches.length != 0) {
			// const path = folder.path.substring(basePathLength) + '/' + this.settings.mergeName
			const mergeableSubfolder = this.createMerge(branches)
			mergeableFolder.addFolder(this.settings.mergeName, mergeableSubfolder)
		}
			
	}

	settings: PromergePluginSettings;

	merging: boolean

	async mergeAutomatically(abstractFile: TAbstractFile): Promise<void> {

		if (this.merging)
			return

		if (this.settings.mergeAutomatically == "no")
			return
		
		let mergeFolder: TFolder | null = null

		if (abstractFile instanceof TFolder) {
			if (this.isBranch(abstractFile))
				mergeFolder = abstractFile.parent
		}
	
		let parentFolder: TFolder | null = abstractFile.parent

		while (parentFolder != null) {
			if (this.isBranch(parentFolder))
				mergeFolder = parentFolder.parent
			parentFolder = parentFolder.parent
		}
	
		if (mergeFolder == null)
			return

		if (this.settings.mergeAutomatically == 'yes')
			new Notice("Updating merge...", 1000)
		
		return this.merge(mergeFolder)
	}

	async onload() {
		await this.loadSettings()

		new Notice(this.settings.mergeAutomatically)

		this.addSettingTab(new PromergeSettingTab(this.app, this));
	
		this.addRibbonIcon(ICON, TITLE, async () => {
			await this.merge(this.app.vault.getRoot())
		});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder)
					menu.addItem((item) => {
						this.setItem(item)
							.onClick(async () => {
								await this.merge(folder)
							});
					});
			})
		);

		this.registerEvent(this.app.vault.on("modify", async (abstractFile) => await this.mergeAutomatically(abstractFile)))
		this.registerEvent(this.app.vault.on("create", async (abstractFile) => await this.mergeAutomatically(abstractFile)))
		this.registerEvent(this.app.vault.on("rename", async (abstractFile) => await this.mergeAutomatically(abstractFile)))
		this.registerEvent(this.app.vault.on("delete", async (abstractFile) => await this.mergeAutomatically(abstractFile)))
	}

	async onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
interface PromergePluginSettings {
	mergeName: string
	mergeAutomatically: string
}

const DEFAULT_SETTINGS: PromergePluginSettings = {
	mergeName: "Merge",
	mergeAutomatically: "no"
};
