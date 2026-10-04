# RunTone

RunTone is a VS Code extension that plays a sound when your code finishes executing.

## Features

- 🔊 Success sound when code executes successfully
- ❌ Error sound when code execution fails
- 🎵 Choose your own `.wav` success and error sounds
- ⏱️ Sounds play for a maximum of 5 seconds
- 🌍 Works with multiple programming languages
- 🔘 Enable or disable RunTone from VS Code Settings
- 🚫 Ignores unrelated terminal commands such as `npm install`, `git pull`, etc.

## Custom Sounds

You can choose your own `.wav` files using the Command Palette:

- `RunTone: Choose Success Sound`
- `RunTone: Choose Error Sound`

If no custom sound is selected, RunTone uses the default sounds included with the extension.

## Enable / Disable


RunTone can be enabled or disabled from:

**Settings → Extensions → RunTone**

Setting:

```text
codeSound.enabled


## Requirements

RunTone uses VS Code Terminal Shell Integration to detect completed code execution.

Make sure this setting is enabled:

terminal.integrated.shellIntegration.enabled
Supported Audio

Custom sounds currently support:

.wav
Playback Duration

Sounds automatically stop after a maximum of 5 seconds.

## How It Works

RunTone monitors completed terminal executions and checks whether the executed command corresponds to the currently active source file.

It then plays:

✅ Success sound → exit code 0
❌ Error sound → non-zero exit code
## Attribution

RunTone is created by Piyush Shewale.

You are free to use, modify, and distribute this project under the MIT License.

If you use or modify RunTone in another project, attribution to the original project and author is appreciated.

Original project:

https://github.com/piyushewalegit/Run-Tone




## License
MIT License