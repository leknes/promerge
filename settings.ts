import ExamplePlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class PromergeSettingTab extends PluginSettingTab {
	plugin: ExamplePlugin;

	constructor(app: App, plugin: ExamplePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty();

		new Setting(containerEl)
			.setName("Merge name")
			.setDesc("The default name of a newly created merge.")
			.addText((text) =>
				text
					.setPlaceholder("Merge")
					.setValue(this.plugin.settings.mergeName)
					.onChange(async (value) => {
						this.plugin.settings.mergeName = value;
						await this.plugin.saveSettings();
					})
		);

		new Setting(containerEl)
			.setName("Merge automatically")
			.setDesc("Whether a merge should automatically be created when a branch is modified.")
			.addDropdown((dropdown) => {
				dropdown
					.addOption("yes", "Yes")
					.addOption("silently", "Silently")
					.addOption("no", "No")
					.setValue(this.plugin.settings.mergeAutomatically)
					.onChange(async (value) => {
						this.plugin.settings.mergeAutomatically = value
						await this.plugin.saveSettings()
					})
			})
	}
} 
