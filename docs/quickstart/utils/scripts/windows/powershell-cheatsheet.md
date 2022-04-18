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
Set-StrictMode -Version 2
```