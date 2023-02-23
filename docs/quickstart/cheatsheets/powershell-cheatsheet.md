# PowerShell Cheat Sheet

- May also work on Linux

## Convert string to "SecureString" format, needed for things such as keyvault etc

```
#!/usr/bin/env pwsh
$SubId = $(Get-AzContext | Select-Object -ExpandProperty Subscription)
$spokeSubId = ConvertTo-SecureString "$SubId" -AsPlainText -Force
```

## Set Strict Mode

```
#!/usr/bin/env pwsh
Set-StrictMode -Version 2
Set-PSDebug -Trace 2
```


## Set a requires parameter in powershell to prevent scripts from running which don't meet version constraints

```
#Requires -Version 7.2
#Requires -Modules @{ ModuleName="Az"; ModuleVersion="7.5.0"}
#Requires -Modules @{ ModuleName="Microsoft.Graph"; ModuleVersion="1.9.6"}
```

## Install starship
```
choco install -y startship ; `
@"
# Set command timeout higher
command_timeout = 10000 

# Get editor completions based on the config schema
`"$schema`" = `"https://starship.rs/config-schema.json`"

# Config Azure
[azure]
disabled = false
format = 'on [$symbol($subscription)]($style) '
symbol = '$'
style = 'blue bold'

# Inserts a blank line between shell prompts
add_newline = true

# Replace the '❯' symbol in the prompt with '➜'
[character]
success_symbol = '[➜](bold green)'

# Disable the package module, hiding it from the prompt completely
[package]
disabled = true
"@ | Set-Content -Path "$env:APPDATA\starship.toml" ; `
Add-Content $PROFILE "`nInvoke-Expression (& starship init powershell)`"
```