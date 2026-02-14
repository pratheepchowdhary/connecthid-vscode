import * as vscode from 'vscode';
import * as path from 'path';

export class AOSPTaskProvider implements vscode.TaskProvider {
    static AOSPType = 'aosp';

    provideTasks(token?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task[]> {
        return [];
    }

    resolveTask(_task: vscode.Task, token?: vscode.CancellationToken): vscode.Task | undefined {
        const definition = _task.definition;
        if (definition.type !== AOSPTaskProvider.AOSPType) {
            return undefined;
        }

        const aospRoot = definition.aospRoot || '.';
        const target = definition.target;
        const buildType = definition.buildType || 'incremental';
        const buildVariant = definition.variant || 'eng';

        let buildCommand = `source build/envsetup.sh && lunch ${target}`;

        if (buildType === 'clean') {
            buildCommand += ' && make clean';
        }

        buildCommand += ' && m';

        return new vscode.Task(
            definition,
            _task.scope || vscode.TaskScope.Workspace,
            `build ${target}`,
            AOSPTaskProvider.AOSPType,
            new vscode.ShellExecution(buildCommand, { cwd: aospRoot })
        );
    }
}
