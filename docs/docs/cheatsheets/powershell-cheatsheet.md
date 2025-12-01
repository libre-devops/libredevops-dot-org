---
layout: default
title: PowerShell Cheatsheet
parent: Cheatsheets
---

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
choco install -y starship ; `
@"
# Set command timeout higher
command_timeout = 10000 

# Get editor completions based on the config schema
`"$schema`" = `"https://starship.rs/config-schema.json`"

# Config Azure
[azure]
disabled = false
format = 'on [$symbol($subscription)]($style) '
symbol = '# '
style = 'blue bold'

# Inserts a blank line between shell prompts
add_newline = true

# Replace the '❯' symbol in the prompt with '➜'
[character]
success_symbol = '[➜](bold green)'

# Disable the package module, hiding it from the prompt completely
[package]
disabled = true
"@ | Set-Content -Path "$env:APPDATA\starship.toml"

# You must now run `notepad $PROFILE` and add `Invoke-Expression (&starship init powershell)`

```
# Various functions
```
param (
    [Parameter(Mandatory)]
    [string]$ApplicationId,

    [Parameter(Mandatory)]
    [string]$TenantId,

    [Parameter(Mandatory)]
    [string]$Secret,

    [string]$SubscriptionId
)

# Ensure the Az module is installed
if (-not(Get-Module -ListAvailable -Name Az))
{
    Write-Error "This script requires the Az module. Please install it using 'Install-Module -Name Az -AllowClobber -Scope CurrentUser' and then re-run this script."
    exit
}

function Connect-AzAccountWithServicePrincipal
{
    param (
        [string]$ApplicationId,
        [string]$TenantId,
        [string]$Secret,
        [string]$SubscriptionId
    )

    try
    {
        $SecureSecret = $Secret | ConvertTo-SecureString -AsPlainText -Force
        $Credential = New-Object System.Management.Automation.PSCredential ($ApplicationId, $SecureSecret)
        Connect-AzAccount -ServicePrincipal -Credential $Credential -Tenant $TenantId -ErrorAction Stop

        if (-not [string]::IsNullOrEmpty($SubscriptionId))
        {
            Set-AzContext -SubscriptionId $SubscriptionId
        }

        Write-Host "Successfully logged in to Azure." -ForegroundColor Cyan
    }
    catch
    {
        Write-Error "Failed to log in to Azure with the provided service principal details: $_"
        throw $_
    }
}

function Register-ResourceProviderIfNecessary
{
    param (
        [string]$ProviderNamespace
    )

    $provider = Get-AzResourceProvider -ProviderNamespace $ProviderNamespace

    if ($provider.RegistrationState -ne "Registered")
    {
        Write-Host "Registering the '$ProviderNamespace' resource provider..." -ForegroundColor Yellow
        Register-AzResourceProvider -ProviderNamespace $ProviderNamespace | Out-Null

        # Wait for the registration to complete
        do
        {
            Start-Sleep -Seconds 10
            $provider = Get-AzResourceProvider -ProviderNamespace $ProviderNamespace
        }
        while ($provider.RegistrationState -ne "Registered")

        Write-Host "The '$ProviderNamespace' resource provider has been registered." -ForegroundColor Green
    }
    else
    {
        Write-Host "The '$ProviderNamespace' resource provider is already registered." -ForegroundColor Green
    }
}
```

## Run-AzTerraform.ps1 $PROFILE alias

```powershell

#Run-AzTerraform.ps1 	- 	https://github.com/libre-devops/terraform-module-template/blob/main/Run-AzTerraform.ps1
#LibreDevOpsModules 	- 	https://github.com/libre-devops/powershell-helpers
# PSGallery	   	-	https://www.powershellgallery.com/packages/LibreDevOpsHelpers/1.0.0

function tfbuild {
    param(
        # override any of these defaults at the call-site like:
        #   tfbuild -TerraformWorkspace staging -TerraformPlan true
        [string]$TerraformCodeLocation			= 'examples',
        [string]$TerraformWorkspace		    	= 'dev',
        [string]$TerraformStackToRunJson		= '["module-development"]',
        [string]$RunTerraformInit		    	= 'true',
        [string]$RunTerraformValidate			= 'true',
        [string]$RunTerraformPlan		    	= 'true',
        [string]$RunTerraformPlanDestroy		= 'false',
        [string]$RunTerraformDestroy			= 'false',
        [string]$RunTerraformApply		    	= 'true',
        [string]$TerraformInitExtraArgsJson		= '["-reconfigure","-upgrade"]',
        [string]$DebugMode			        = 'false',
        [string]$InstallCheckov			    	= 'false'
    )

	$workingDirectory = $(Get-Location).Path

    & pwsh -File "$workingDirectory\Run-AzTerraform.ps1" `
        -TerraformCodeLocation				$TerraformCodeLocation `
        -TerraformWorkspace		    		$TerraformWorkspace `
        -TerraformStackToRunJson			$TerraformStackToRunJson `
        -RunTerraformInit		    		$RunTerraformInit `
        -RunTerraformValidate				$RunTerraformValidate `
        -RunTerraformPlan		    		$RunTerraformPlan `
        -RunTerraformPlanDestroy			$RunTerraformPlanDestroy `
	-RunTerraformDestroy				$RunTerraformDestroy `
	-RunTerraformApply		    		$RunTerraformApply `
        -TerraformInitExtraArgsJson			$TerraformInitExtraArgsJson `
        -DebugMode			        	$DebugMode `
	-InstallCheckov			    		$InstallCheckov
}

function tfdestroy {
    param(
        # override any of these defaults at the call-site like:
        #   tfbuild -TerraformWorkspace staging -TerraformPlan true
        [string]$TerraformCodeLocation		= 'examples',
        [string]$TerraformWorkspace		= 'dev',
        [string]$TerraformStackToRunJson	= '["module-development"]',
        [string]$RunTerraformInit		= 'true',
        [string]$RunTerraformValidate		= 'true',
        [string]$RunTerraformPlan		= 'false',
        [string]$RunTerraformPlanDestroy	= 'true',
        [string]$RunTerraformDestroy		= 'true',
        [string]$RunTerraformApply		= 'false',
        [string]$TerraformInitExtraArgsJson	= '["-reconfigure","-upgrade"]',
        [string]$DebugMode			= 'false',
        [string]$InstallCheckov			= 'false'
    )

	$workingDirectory = $(Get-Location).Path

    & pwsh -File "$workingDirectory\Run-AzTerraform.ps1" `
        -TerraformCodeLocation			$TerraformCodeLocation `
        -TerraformWorkspace		    	$TerraformWorkspace `
        -TerraformStackToRunJson		$TerraformStackToRunJson `
        -RunTerraformInit		    	$RunTerraformInit `
        -RunTerraformValidate			$RunTerraformValidate `
        -RunTerraformPlan		    	$RunTerraformPlan `
        -RunTerraformPlanDestroy		$RunTerraformPlanDestroy `
	-RunTerraformDestroy			$RunTerraformDestroy `
	-RunTerraformApply		    	$RunTerraformApply `
        -TerraformInitExtraArgsJson		$TerraformInitExtraArgsJson `
        -DebugMode			        $DebugMode `
	-InstallCheckov			    	$InstallCheckov
}

```

## Install Modules 1 liner

```powershell
Install-Module -Name @("Microsoft.Graph", "Az", "Pester", "LibreDevOpsHelpers", "Microsoft.PowerShell.PSResourceGet") -Force -AllowClobber -Scope CurrentUser -Repository PSGallery 
```

## Format Terraform

```powershell
param(
    [string]$VariablesInFile = "./variables.tf",
    [string]$VariablesOutFile = "./variables.tf",
    [string]$OutputsInFile = "./outputs.tf",
    [string]$OutputsOutFile = "./outputs.tf",
    [bool]$SortInputs = $true,
    [bool]$SortOutputs = $true,
    [bool]$FormatTerraform = $true,
    [bool]$GenerateNewReadme = $true,
    [bool]$RunModuleDevelopmentCommands = $true
)

$CurrentDirectory = (Get-Location).Path
$ErrorOccurred = $false

function Fail {
    param([string]$Message)
    Write-Error $Message
    $Global:ErrorOccurred = $true
}

function Format-Terraform {
    try {
        $terraformPath = Get-Command terraform -ErrorAction Stop
        Write-Host "Terraform found at: $($terraformPath.Source)" -ForegroundColor Green
        terraform fmt -recursive -error-on-changes
        Write-Host "Terraform formatting finished" -ForegroundColor Green
    }
    catch {
        Fail "Terraform formatting failed: $($_.Exception.Message)"
    }
}

function Read-TerraformFile {
    param ([string]$Filename)

    if (-not (Test-Path $Filename)) {
        Fail "File not found: $Filename"
        return $null
    }

    try {
        return Get-Content $Filename -Raw -ErrorAction Stop
    }
    catch {
        Fail "Error reading file '$Filename': $($_.Exception.Message)"
        return $null
    }
}

function Write-TerraformFile {
    param(
        [string]$Filename,
        [string]$FileContent
    )

    if ([string]::IsNullOrWhiteSpace($FileContent)) {
        Fail "Empty or null content passed for writing to $Filename"
        return
    }

    try {
        $FileContent | Set-Content $Filename -ErrorAction Stop
    }
    catch {
        Fail "Error writing file '$Filename': $($_.Exception.Message)"
    }
}

function Sort-TerraformOutputs {
    param ([string]$OutputsContent)

    try {
        $pattern = 'output\s+"[^"]+"\s+\{[\s\S]*?\n\}'
        $outputs = [regex]::Matches($OutputsContent, $pattern) | ForEach-Object { $_.Value }

        if ($outputs.Count -eq 0) {
            Write-Warning "No output blocks found. Skipping sort."
            return $OutputsContent
        }

        return ($outputs | Sort-Object { [regex]::Match($_, 'output\s+"([^"]+)"').Groups[1].Value }) -join "`n`n"
    }
    catch {
        Fail "Error sorting Terraform outputs: $($_.Exception.Message)"
        return $null
    }
}

function Sort-TerraformVariables {
    param ([string]$VariablesContent)

    try {
        $pattern = 'variable\s+"[^"]+"\s+\{[\s\S]*?\n\}'
        $vars = [regex]::Matches($VariablesContent, $pattern) | ForEach-Object { $_.Value }

        if ($vars.Count -eq 0) {
            Write-Warning "No variable blocks found. Skipping sort."
            return $VariablesContent
        }

        return ($vars | Sort-Object { [regex]::Match($_, 'variable\s+"([^"]+)"').Groups[1].Value }) -join "`n`n"
    }
    catch {
        Fail "Error sorting Terraform variables: $($_.Exception.Message)"
        return $null
    }
}

function Update-ReadmeWithTerraformDocs {

    try {
        $terraformDocsPath = Get-Command terraform-docs -ErrorAction Stop
        Write-Host "terraform-docs found at: $($terraformDocsPath.Source)" -ForegroundColor Green
    }
    catch {
        Write-Warning "terraform-docs not installed. Skipping README generation."
        return
    }

    $buildFile = ""
    if (Test-Path "./build.tf") {
        $buildFile = "./build.tf"
    } elseif (Test-Path "./main.tf") {
        $buildFile = "./main.tf"
    } else {
        Write-Warning "No build.tf or main.tf found; cannot generate README"
        return
    }

    try {
        Set-Content "README.md" -Value '```hcl'
        Get-Content $buildFile | Add-Content "README.md"
        Add-Content "README.md" -Value '```'

        $terraformDocs = terraform-docs markdown . 2>&1
        if ($LASTEXITCODE -ne 0) {
            Fail "terraform-docs failed: $terraformDocs"
        } else {
            $terraformDocs | Add-Content "README.md"
        }
    }
    catch {
        Fail "Error generating README: $($_.Exception.Message)"
    }
}

function Run-ModuleDevelopmentCommands {
    param (
        [bool]$FormatTerraform,
        [bool]$SortInputs,
        [bool]$SortOutputs,
        [bool]$GenerateNewReadme,
        [string]$VariablesInFile,
        [string]$VariablesOutFile,
        [string]$OutputsInFile,
        [string]$OutputsOutFile
    )

    try {
        Set-Location "./examples/module-dev"
    }
    catch {
        Fail "Failed to change directory to ./examples/module-dev: $($_.Exception.Message)"
        return
    }

    Write-Host "Running commands in /examples/module-dev" -ForegroundColor Green

    if ($FormatTerraform) { Format-Terraform }

    if ($SortInputs) {
        $content = Read-TerraformFile $VariablesInFile
        $sorted = Sort-TerraformVariables $content
        if ($sorted) { Write-TerraformFile $VariablesOutFile $sorted }
    }

    if ($SortOutputs) {
        $content = Read-TerraformFile $OutputsInFile
        $sorted = Sort-TerraformOutputs $content
        if ($sorted) { Write-TerraformFile $OutputsOutFile $sorted }
    }

    if ($GenerateNewReadme) {
        Update-ReadmeWithTerraformDocs
    }

    Set-Location $CurrentDirectory
}

# -------------------------
# Main Execution Flow
# -------------------------

if ($RunModuleDevelopmentCommands) {
    Run-ModuleDevelopmentCommands -FormatTerraform $FormatTerraform -SortInputs $SortInputs -SortOutputs $SortOutputs -GenerateNewReadme $GenerateNewReadme -VariablesInFile $VariablesInFile -VariablesOutFile $VariablesOutFile -OutputsInFile $OutputsInFile -OutputsOutFile $OutputsOutFile
}

if ($FormatTerraform) { Format-Terraform }

if ($SortInputs) {
    $content = Read-TerraformFile $VariablesInFile
    $sorted = Sort-TerraformVariables $content
    if ($sorted) { Write-TerraformFile $VariablesOutFile $sorted }
}

if ($SortOutputs) {
    $content = Read-TerraformFile $OutputsInFile
    $sorted = Sort-TerraformOutputs $content
    if ($sorted) { Write-TerraformFile $OutputsOutFile $sorted }
}

if ($GenerateNewReadme) { Update-ReadmeWithTerraformDocs }

if ($ErrorOccurred) {
    Write-Host "The script completed with ERRORS." -ForegroundColor Red
    exit 1
}

Write-Host "Success: Script completed successfully." -ForegroundColor Green
exit 0
```
