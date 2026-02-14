import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class AOSPManager {
    static async validateAOSPRoot(rootPath: string): Promise<boolean> {
        return fs.existsSync(path.join(rootPath, 'build', 'envsetup.sh'));
    }

    static async getLunchTargets(rootPath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            // Running envsetup and lunch to get targets. 
            // Note: This might be slow and environment dependent.
            const command = `bash -c "source build/envsetup.sh && lunch list"`;
            cp.exec(command, { cwd: rootPath }, (error: Error | null, stdout: string, stderr: string) => {
                if (error) {
                    // Fallback to parsing something else if 'lunch list' is not available in older AOSP versions
                    return reject(error);
                }
                const targets = stdout.split('\n')
                    .map((line: string) => line.trim())
                    .filter((line: string) => line.length > 0 && !line.startsWith('Lunch menu'));
                resolve(targets);
            });
        });
    }
}
