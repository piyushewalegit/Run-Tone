import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    // choose method
    const chooseSuccessSound =
    vscode.commands.registerCommand(
        'code-sound.chooseSuccessSound',
        async () => {

            const file = await vscode.window.showOpenDialog({
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
                .getConfiguration('codeSound')
                .update(
                    'successSound',
                    soundPath,
                    vscode.ConfigurationTarget.Global
                );

            vscode.window.showInformationMessage(
                'Code Sound: Success sound updated!'
            );
        }
    );


const chooseErrorSound =
    vscode.commands.registerCommand(
        'code-sound.chooseErrorSound',
        async () => {

            const file = await vscode.window.showOpenDialog({
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
                .getConfiguration('codeSound')
                .update(
                    'errorSound',
                    soundPath,
                    vscode.ConfigurationTarget.Global
                );

            vscode.window.showInformationMessage(
                'Code Sound: Error sound updated!'
            );
        }
    );

context.subscriptions.push(
    chooseSuccessSound,
    chooseErrorSound
);
//^ added choose method

    console.log('Code Sound extension is active.');

    const terminalListener =
    vscode.window.onDidEndTerminalShellExecution((event) => {

        const command = event.execution.commandLine.value;
        const exitCode = event.exitCode;

        console.log('--------------------------------');
        console.log(`Command finished: ${command}`);
        console.log(`Exit code: ${exitCode}`);

        // Ignore commands where VS Code could not provide an exit code
        if (exitCode === undefined) {
            return;
        }

        // Check whether the command contains a source-code file
        const activeEditor =
    vscode.window.activeTextEditor;

let isCodeExecution = false;

if (activeEditor) {

    const activeFileName =
        path.basename(activeEditor.document.fileName);

    if (activeFileName) {

        isCodeExecution =
            command
                .toLowerCase()
                .includes(activeFileName.toLowerCase());
    }
}

        if (!isCodeExecution) {

            console.log('Not a code execution. Ignoring.');
            console.log('--------------------------------');

            return;
        }

        console.log('Code execution detected.');

        // Successful execution
        if (exitCode === 0) {

            console.log('Code execution SUCCESS detected.');

            playSound(
                context,
                'success'
            );
        }

        // Failed execution
        else {

            console.log('Code execution ERROR detected.');

            playSound(
                context,
                'error'
            );
        }

        console.log('--------------------------------');
    });

}


/**
 * Plays a sound for a maximum of 8 seconds.
 */
function playSound(
    context: vscode.ExtensionContext,
    soundType: 'success' | 'error'
) {

    const config =
        vscode.workspace.getConfiguration('codeSound');

    const customSound =
        config.get<string>(
            soundType === 'success'
                ? 'successSound'
                : 'errorSound'
        );

    let soundPath: string;

    // Use custom sound if selected and still exists
    if (
        customSound &&
        fs.existsSync(customSound)
    ) {

        soundPath = customSound;

        console.log(
            `Using custom ${soundType} sound: ${soundPath}`
        );

    }

    // Otherwise use the default sound
    else {

        const defaultSound =
            soundType === 'success'
                ? 'success.wav'
                : 'error.wav';

        soundPath = path.join(
            context.extensionPath,
            'sounds',
            defaultSound
        );

        console.log(
            `Using default ${soundType} sound: ${soundPath}`
        );
    }

    if (!fs.existsSync(soundPath)) {

        console.error(
            `Sound file not found: ${soundPath}`
        );

        vscode.window.showErrorMessage(
            `Code Sound: Sound file not found.`
        );

        return;
    }

    const escapedPath =
        soundPath.replace(/'/g, "''");

    const powershellCommand =
        `Add-Type -AssemblyName presentationCore; ` +
        `$player = New-Object System.Media.SoundPlayer '${escapedPath}'; ` +
        `$player.Play(); ` +
        `Start-Sleep -Seconds 8; ` +
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

                return;
            }

            console.log(
                `Played ${soundType} sound`
            );
        }
    );
}


export function deactivate() {
    console.log('Code Sound extension deactivated.');
}