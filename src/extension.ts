import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {

    console.log('Code Sound extension is active!');

    const terminalListener =
        vscode.window.onDidEndTerminalShellExecution((event) => {

            const command =
                event.execution.commandLine.value;

            console.log('Command finished:', command);
            console.log('Exit code:', event.exitCode);

            // Only react to Python commands
            if (
                command.includes('python') ||
                command.includes('python.exe')
            ) {

                // Successful Python execution
                if (event.exitCode === 0) {

                    console.log(
                        'Python SUCCESS detected.'
                    );

                    playSound(
                        context,
                        'success.wav'
                    );

                }

                // Failed Python execution
                else {

                    console.log(
                        'Python ERROR detected.'
                    );

                    playSound(
                        context,
                        'error.wav'
                    );
                }
            }
        });

    context.subscriptions.push(
        terminalListener
    );
}


function playSound(
    context: vscode.ExtensionContext,
    soundFile: string
) {

    const soundPath = path.join(
        context.extensionPath,
        'sounds',
        soundFile
    );

    if (!fs.existsSync(soundPath)) {

        vscode.window.showErrorMessage(
            `Sound file not found: ${soundFile}`
        );

        return;
    }

    const escapedPath =
        soundPath.replace(/'/g, "''");

    const command =
        `powershell -NoProfile -Command ` +
        `"Add-Type -AssemblyName presentationCore; ` +
        `$player = New-Object System.Media.SoundPlayer '${escapedPath}'; ` +
        `$player.Play(); ` +
        `Start-Sleep -Seconds 5; ` +
        `$player.Stop()"`;

    exec(command);
}
export function deactivate() {}