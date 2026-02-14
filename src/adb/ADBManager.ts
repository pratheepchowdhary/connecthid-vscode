import * as cp from 'child_process';
import * as vscode from 'vscode';

export class ADBManager {
    static async getDevices(): Promise<string[]> {
        const config = vscode.workspace.getConfiguration('connecthid');
        const adbHost = config.get<string>('adbHost') || '127.0.0.1';

        return new Promise((resolve) => {
            const env = { ...process.env, ADBHOST: adbHost };
            cp.exec('adb devices', { env }, (error: Error | null, stdout: string, stderr: string) => {
                if (error) {
                    return resolve([]); // ADB might not be in path or no devices
                }
                const lines = stdout.split('\n');
                const devices = lines
                    .slice(1) // skip "List of devices attached"
                    .map((line: string) => line.trim())
                    .filter((line: string) => line.length > 0 && line.includes('\tdevice'))
                    .map((line: string) => line.split('\t')[0]);
                resolve(devices);
            });
        });
    }
}
