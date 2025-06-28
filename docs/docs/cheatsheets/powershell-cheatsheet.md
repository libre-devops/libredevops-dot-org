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
