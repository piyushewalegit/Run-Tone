import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {

    // ---------------------------------------
    // Choose custom success sound
    // ---------------------------------------

    const chooseSuccessSound =
        vscode.commands.registerCommand(
            'RunTone.chooseSuccessSound',
            async () => {

                const file =
                    await vscode.window.showOpenDialog({
                        canSelectMany: false,
                        openLabel: 'Choose Success Sound',
                        filters: {
                            'WAV Audio': ['wav']
                        }
                    });

                if (!file || file.length === 0) {
                    return;
                }

                const soundPath = file[0].fsPath;

                await vscode.workspace
                    .getConfiguration('RunTone')
                    .update(
                        'successSound',
                        soundPath,
                        vscode.ConfigurationTarget.Global
                    );

                vscode.window.showInformationMessage(
                    'RunTone: Success sound updated!'
                );
            }
        );


    // ---------------------------------------
    // Choose custom error sound
    // ---------------------------------------

    const chooseErrorSound =
        vscode.commands.registerCommand(
            'RunTone.chooseErrorSound',
            async () => {

                const file =
                    await vscode.window.showOpenDialog({
                        canSelectMany: false,
                        openLabel: 'Choose Error Sound',
                        filters: {
                            'WAV Audio': ['wav']
                        }
                    });

                if (!file || file.length === 0) {
                    return;
                }

                const soundPath = file[0].fsPath;

                await vscode.workspace
                    .getConfiguration('RunTone')
                    .update(
                        'errorSound',
                        soundPath,
                        vscode.ConfigurationTarget.Global
                    );

                vscode.window.showInformationMessage(
                    'RunTone: Error sound updated!'
                );
            }
        );


    context.subscriptions.push(
        chooseSuccessSound,
        chooseErrorSound
    );


    // ---------------------------------------
    // Terminal execution listener
    // ---------------------------------------

    const terminalListener =
        vscode.window.onDidEndTerminalShellExecution(
            (event) => {

                const command =
                    event.execution.commandLine.value;

                const exitCode =
    event.exitCode;

// Check whether RunTone is enabled
const enabled =
    vscode.workspace
        .getConfiguration('RunTone')
        .get<boolean>('enabled', true);

if (!enabled) {
    return;
}

// Ignore executions without an exit code
if (exitCode === undefined) {
    return;
}

                // Get currently active file
                const activeEditor =
                    vscode.window.activeTextEditor;

                let isCodeExecution = false;

                if (activeEditor) {

                    const activeFileName =
                        path.basename(
                            activeEditor.document.fileName
                        );

                    if (activeFileName) {

                        isCodeExecution =
                            command
                                .toLowerCase()
                                .includes(
                                    activeFileName.toLowerCase()
                                );
                    }
                }

                // Ignore unrelated terminal commands
                if (!isCodeExecution) {
                    return;
                }

                // Code executed successfully
                if (exitCode === 0) {

                    playSound(
                        context,
                        'success'
                    );

                }

                // Code execution failed
                else {

                    playSound(
                        context,
                        'error'
                    );
                }
            }
        );


    context.subscriptions.push(
        terminalListener
    );
}


/**
 * Plays the selected sound for a maximum of 5 seconds.
 */
function playSound(
    context: vscode.ExtensionContext,
    soundType: 'success' | 'error'
) {

    const config =
        vscode.workspace.getConfiguration('RunTone');

    const settingName =
        soundType === 'success'
            ? 'successSound'
            : 'errorSound';

    const customSound =
        config.get<string>(settingName);

    let soundPath: string;

    // ---------------------------------------
    // Use custom sound if selected
    // ---------------------------------------

    if (
        customSound &&
        fs.existsSync(customSound)
    ) {

        soundPath = customSound;
    }

    // ---------------------------------------
    // Otherwise use default sound
    // ---------------------------------------

    else {

        const defaultSound =
            soundType === 'success'
                ? 'success.wav'
                : 'error.wav';

        soundPath =
            path.join(
                context.extensionPath,
                'sounds',
                defaultSound
            );
    }

    // ---------------------------------------
    // Check sound file
    // ---------------------------------------

    if (!fs.existsSync(soundPath)) {

        vscode.window.showErrorMessage(
            `RunTone: Sound file not found.`
        );

        return;
    }

    // Escape single quotes for PowerShell
    const escapedPath =
        soundPath.replace(/'/g, "''");

    // ---------------------------------------
    // Play sound for maximum 10 seconds
    // ---------------------------------------

    const powershellCommand =
        `Add-Type -AssemblyName presentationCore; ` +
        `$player = New-Object System.Media.SoundPlayer '${escapedPath}'; ` +
        `$player.Play(); ` +
        `Start-Sleep -Seconds 10; ` +
        `$player.Stop();`;

    const command =
        `powershell -NoProfile -Command "${powershellCommand}"`;

    exec(
        command,
        (error) => {

            if (error) {

                console.error(
                    `Could not play sound: ${error.message}`
                );
            }
        }
    );
}
export function deactivate() {
}