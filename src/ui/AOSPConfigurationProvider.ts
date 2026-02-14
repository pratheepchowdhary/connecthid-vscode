import * as vscode from 'vscode';

export class AOSPConfigurationProvider implements vscode.TreeDataProvider<AOSPConfigItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<AOSPConfigItem | undefined | void> = new vscode.EventEmitter<AOSPConfigItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<AOSPConfigItem | undefined | void> = this._onDidChangeTreeData.event;

    private configs: Config[] = [];

    getTreeItem(element: AOSPConfigItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: AOSPConfigItem): vscode.ProviderResult<AOSPConfigItem[]> {
        if (!element) {
            return this.configs.map(c => new AOSPConfigItem(c.name, vscode.TreeItemCollapsibleState.None, c));
        }
        return [];
    }

    addConfig(name: string, config: Config) {
        this.configs.push({ ...config, name });
        this._onDidChangeTreeData.fire();
    }
}

export interface Config {
    name: string;
    aospRoot: string;
    target: string;
    variant: string;
    device?: string;
}

export class AOSPConfigItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly config?: Config
    ) {
        super(label, collapsibleState);
        this.contextValue = 'aospConfig';
        this.tooltip = config ? `${config.target} (${config.variant}) at ${config.aospRoot}` : label;
    }
}
