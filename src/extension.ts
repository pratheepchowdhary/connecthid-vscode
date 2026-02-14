import * as vscode from 'vscode';
import { AOSPConfigurationProvider, AOSPConfigItem } from './ui/AOSPConfigurationProvider';
import { AOSPTaskProvider } from './tasks/AOSPTaskProvider';
import { AOSPManager } from './aosp/AOSPManager';
import { ADBManager } from './adb/ADBManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('ConnectHID AOSP Build extension is now active');

    const aospConfigProvider = new AOSPConfigurationProvider();
    vscode.window.registerTreeDataProvider('aosp-configurations', aospConfigProvider);

    const aospTaskProvider = vscode.tasks.registerTaskProvider(AOSPTaskProvider.AOSPType, new AOSPTaskProvider());
    context.subscriptions.push(aospTaskProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand('connecthid.addConfiguration', async () => {
            const rootPath = await vscode.window.showInputBox({
                prompt: 'Enter AOSP Root Path',
                placeHolder: '/path/to/aosp'
            });

            if (!rootPath) return;

            const isValid = await AOSPManager.validateAOSPRoot(rootPath);
            if (!isValid) {
                vscode.window.showErrorMessage('Invalid AOSP Root Path: build/envsetup.sh not found');
                return;
            }

            const targets = await AOSPManager.getLunchTargets(rootPath);
            const target = await vscode.window.showQuickPick(targets, {
                placeHolder: 'Select Lunch Target'
            });

            if (!target) return;

            const variants = ['user', 'userdebug', 'eng'];
            const variant = await vscode.window.showQuickPick(variants, {
                placeHolder: 'Select Build Variant'
            });

            if (!variant) return;

            const devices = await ADBManager.getDevices();
            let device = 'None';
            if (devices.length > 0) {
                const selectedDevice = await vscode.window.showQuickPick(['None', ...devices], {
                    placeHolder: 'Select Device (Optional)'
                });
                device = selectedDevice || 'None';
            } else if (vscode.env.remoteName === 'ssh') {
                const setupTunnel = 'Show ADB Tunnel Guide';
                const selection = await vscode.window.showWarningMessage('No local devices detected. Do you need to setup an ADB tunnel?', setupTunnel);
                if (selection === setupTunnel) {
                    vscode.commands.executeCommand('connecthid.showAdbTunnelGuide');
                }
            }

            const name = await vscode.window.showInputBox({
                prompt: 'Enter Configuration Name',
                value: `${target}-${variant}${device !== 'None' ? '-' + device : ''}`
            });

            if (name) {
                aospConfigProvider.addConfig(name, {
                    name,
                    aospRoot: rootPath,
                    target,
                    variant,
                    device
                });
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('connecthid.showAdbTunnelGuide', () => {
            const panel = vscode.window.createWebviewPanel(
                'adbTunnelGuide',
                'ConnectHID: ADB Tunneling Guide',
                vscode.ViewColumn.One,
                {}
            );

            panel.webview.html = `
                <h1>ADB Tunneling for Remote-SSH</h1>
                <p>To use local devices while building on a remote server, you must forward the ADB port (5037).</p>
                <h2>Method 1: VS Code Native Port Forwarding</h2>
                <ol>
                    <li>Open the <b>Ports</b> view in the bottom panel.</li>
                    <li>Click <b>Forward a Port</b>.</li>
                    <li>Enter <b>5037</b>.</li>
                    <li>Ensure the <b>Local Address</b> is <code>localhost:5037</code>.</li>
                </ol>
                <h2>Method 2: SSH Command</h2>
                <pre>ssh -R 5037:localhost:5037 your-remote-server</pre>
                <p>After forwarding, your local devices will appear in the "Select Device" dropdown.</p>
            `;
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('connecthid.build', (node: AOSPConfigItem) => {
            if (node) {
                vscode.window.showInformationMessage(`Building AOSP for ${node.label}...`);
                // Trigger task
                vscode.tasks.executeTask(new vscode.Task(
                    { type: 'aosp', target: node.config?.target, aospRoot: node.config?.aospRoot, variant: node.config?.variant },
                    vscode.TaskScope.Workspace,
                    `build ${node.label}`,
                    'aosp',
                    new vscode.ShellExecution(`source build/envsetup.sh && lunch ${node.config?.target}-${node.config?.variant} && m`, { cwd: node.config?.aospRoot })
                ));
            }
        })
    );
}

export function deactivate() { }
