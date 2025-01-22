---
layout: default
title: Azure Cheatsheet
parent: Cheatsheets
---

# Azure Cheat Sheet

{% raw  %}

## Generic

## Powershell

### Login to Azure (Azure Powershell)

```powershell
param(
    [Parameter(Mandatory = $false)]
    [bool]$UseServicePrincipal = $false,

    [Parameter(Mandatory = $false)]
    [string]$ClientId,

    [Parameter(Mandatory = $false)]
    [string]$TenantId,

    [Parameter(Mandatory = $false)]
    [string]$ClientSecret,

    [Parameter(Mandatory = $false)]
    [string]$SubscriptionId = $null,

    [Parameter(Mandatory = $false)]
    [switch]$IsDebugMode
)

if ($IsDebugMode)
{
    $IsDebugMode = $true
}
else
{
    $IsDebugMode = $false
}

function _LogMessage
{
    param(
        [string]$Level,
        [string]$Message,
        [string]$InvocationName
    )
    $timestamp = Get-Date -Format "HH:mm:ss"

    if ($Level -eq "DEBUG" -and -not $IsDebugMode)
    {
        return
    }

    switch ($Level)
    {
        "INFO"    {
            Write-Host "$( $Level ): $timestamp - [$InvocationName] $Message" -ForegroundColor Cyan
        }
        "DEBUG"   {
            Write-Host "$( $Level ): $timestamp - [$InvocationName] $Message" -ForegroundColor Yellow
        }
        "WARNING" {
            Write-Host "$( $Level ): $timestamp - [$InvocationName] $Message" -ForegroundColor DarkYellow
        }
        "ERROR"   {
            Write-Host "$( $Level ): $timestamp - [$InvocationName] $Message" -ForegroundColor Red
        }
        default   {
            Write-Host "$( $Level ): $timestamp - [$InvocationName] $Message"
        }
    }
}

#region Auth Functions

function Connect-AzureUser
{
    try
    {
        $context = Get-AzContext
        if ($null -eq $context -or $null -eq $context.Account)
        {
            _LogMessage -Level "INFO" -Message "No existing Azure context found. Authenticating to Azure..." -InvocationName $MyInvocation.MyCommand.Name
            Connect-AzAccount -ErrorAction Stop
            _LogMessage -Level "INFO" -Message "Authentication successful." -InvocationName $MyInvocation.MyCommand.Name

            if ($SubscriptionId)
            {
                _LogMessage -Level "INFO" -Message "Setting subscription to $SubscriptionId..." -InvocationName $MyInvocation.MyCommand.Name
                Set-AzContext -Subscription $SubscriptionId
            }
        }
        else
        {
            _LogMessage -Level "INFO" -Message "Already authenticated to Azure as $( $context.Account.Id )." -InvocationName $MyInvocation.MyCommand.Name
        }
    }
    catch
    {
        _LogMessage -Level "ERROR" -Message "Authentication failed. $( $_.Exception.Message )" -InvocationName $MyInvocation.MyCommand.Name
        throw
    }
}

function Connect-ToAzureSpn
{
    param(
        [bool]$UseSPN,
        [string]$ClientId,
        [string]$TenantId,
        [string]$ClientSecret
    )

    if ($UseSPN -eq $true)
    {
        _LogMessage -Level "INFO" -Message "Connecting with Service Principal (Client Secret flow)..." -InvocationName $MyInvocation.MyCommand.Name
        $securePassword = ConvertTo-SecureString $ClientSecret -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($ClientId, $securePassword)
        Connect-AzAccount -ServicePrincipal -Tenant $TenantId -Credential $credential

        if ($SubscriptionId)
        {
            _LogMessage -Level "INFO" -Message "Setting subscription to $SubscriptionId..." -InvocationName $MyInvocation.MyCommand.Name
            Set-AzContext -Subscription $SubscriptionId
        }
    }
    elseif ($UseSPN -eq $false)
    {
        Connect-AzureUser
    }
    else
    {
        _LogMessage -Level "ERROR" -Message "Invalid authentication combination. Check parameters." -InvocationName $MyInvocation.MyCommand.Name
        throw "Invalid authentication method. Use SPN w/ Secret or Interactive User."
    }
}

try
{
    _LogMessage -Level "INFO" -Message "Starting script..." -InvocationName $MyInvocation.MyCommand.Name

    # 1. Connect to Azure
    Connect-ToAzureSpn `
        -UseSPN $UseServicePrincipal `
        -ClientId $ClientId `
        -TenantId $TenantId `
        -ClientSecret $ClientSecret
}
catch
{
    _LogMessage -Level "ERROR" -Message "A terminating error occurred: $( $_.Exception.Message )" -InvocationName $MyInvocation.MyCommand.Name
    exit 1
}

```

### Connect to Azure (Azure-CLI)

```powershell
param(
    [Parameter(Mandatory = $false)]
    [bool]$UseServicePrincipal = $false,

    [Parameter(Mandatory = $false)]
    [string]$ClientId,

    [Parameter(Mandatory = $false)]
    [string]$TenantId,

    [Parameter(Mandatory = $false)]
    [string]$ClientSecret,

    [Parameter(Mandatory = $false)]
    [string]$SubscriptionId = $null,

    [Parameter(Mandatory = $false)]
    [string]$FedToken,  # Unused, but left here if you plan to do federated login in future

    [Parameter(Mandatory = $false)]
    [switch]$IsDebugMode
)

if ($IsDebugMode)
{
    $IsDebugMode = $true
}
else
{
    $IsDebugMode = $false
}

function _LogMessage
{
    param(
        [string]$Level,
        [string]$Message,
        [string]$InvocationName
    )
    $timestamp = Get-Date -Format "HH:mm:ss"

    if ($Level -eq "DEBUG" -and -not $IsDebugMode)
    {
        return
    }

    switch ($Level)
    {
        "INFO"    {
            Write-Host "$( $Level ): $timestamp - [$InvocationName] $Message" -ForegroundColor Cyan
        }
        "DEBUG"   {
            Write-Host "$( $Level ): $timestamp - [$InvocationName] $Message" -ForegroundColor Yellow
        }
        "WARNING" {
            Write-Host "$( $Level ): $timestamp - [$InvocationName] $Message" -ForegroundColor DarkYellow
        }
        "ERROR"   {
            Write-Host "$( $Level ): $timestamp - [$InvocationName] $Message" -ForegroundColor Red
        }
        default   {
            Write-Host "$( $Level ): $timestamp - [$InvocationName] $Message"
        }
    }
}

#region Auth Functions

function Connect-AzureUser
{
    <#
      Checks if you’re already logged in by calling:
         az account show --output json
      If this fails, we assume no existing context and prompt interactive login.
    #>
    try
    {
        $azContext = $null
        try
        {
            # Attempt to retrieve current context
            $azJson = az account show --output json 2>$null
            if ($LASTEXITCODE -eq 0 -and $azJson)
            {
                $azContext = $azJson | ConvertFrom-Json
            }
        }
        catch
        {
            # Means not currently logged in, so just fall through
        }

        if ($null -eq $azContext)
        {
            _LogMessage -Level "INFO" -Message "No existing Azure CLI login found. Authenticating to Azure (interactive)..." -InvocationName $MyInvocation.MyCommand.Name

            # Interactive login
            $output = az login 2>&1
            if ($LASTEXITCODE -ne 0)
            {
                _LogMessage -Level "ERROR" -Message "Authentication failed: $output" -InvocationName $MyInvocation.MyCommand.Name
                throw "Azure CLI interactive login failed."
            }
            else
            {
                _LogMessage -Level "INFO" -Message "Authentication successful." -InvocationName $MyInvocation.MyCommand.Name
            }

            if ($SubscriptionId)
            {
                _LogMessage -Level "INFO" -Message "Setting subscription to $SubscriptionId..." -InvocationName $MyInvocation.MyCommand.Name
                $output = az account set --subscription $SubscriptionId 2>&1
                if ($LASTEXITCODE -ne 0)
                {
                    _LogMessage -Level "ERROR" -Message "Subscription set failed: $output" -InvocationName $MyInvocation.MyCommand.Name
                    throw "Failed to set subscription."
                }
            }
        }
        else
        {
            # Already logged in – optionally set the subscription
            _LogMessage -Level "INFO" -Message "Already authenticated to Azure CLI as $($azContext.user.name)." -InvocationName $MyInvocation.MyCommand.Name
        }
    }
    catch
    {
        _LogMessage -Level "ERROR" -Message "Authentication failed. $($_.Exception.Message)" -InvocationName $MyInvocation.MyCommand.Name
        throw
    }
}

function Connect-ToAzureSpn
{
    param(
        [bool]$UseSPN,
        [string]$ClientId,
        [string]$TenantId,
        [string]$ClientSecret,
        [string]$FedToken
    )

    if ($UseSPN -eq $true)
    {
        _LogMessage -Level "INFO" -Message "Connecting with Service Principal (Client Secret flow)..." -InvocationName $MyInvocation.MyCommand.Name

        # Perform SP login using Azure CLI
        $output = az login --service-principal --username $ClientId --password $ClientSecret --tenant $TenantId 2>&1
        if ($LASTEXITCODE -ne 0)
        {
            _LogMessage -Level "ERROR" -Message "Service principal authentication failed: $output" -InvocationName $MyInvocation.MyCommand.Name
            throw "Azure CLI SPN login failed."
        }

        if ($SubscriptionId)
        {
            _LogMessage -Level "INFO" -Message "Setting subscription to $SubscriptionId..." -InvocationName $MyInvocation.MyCommand.Name
            $output = az account set --subscription $SubscriptionId 2>&1
            if ($LASTEXITCODE -ne 0)
            {
                _LogMessage -Level "ERROR" -Message "Subscription set failed: $output" -InvocationName $MyInvocation.MyCommand.Name
                throw "Failed to set subscription."
            }
        }
    }
    elseif ($UseSPN -eq $false)
    {
        Connect-AzureUser
    }
    else
    {
        _LogMessage -Level "ERROR" -Message "Invalid authentication combination. Check parameters." -InvocationName $MyInvocation.MyCommand.Name
        throw "Invalid authentication method. Use SPN w/ Secret or Interactive User."
    }
}

#endregion

try
{
    _LogMessage -Level "INFO" -Message "Starting script..." -InvocationName $MyInvocation.MyCommand.Name

    # 1. Connect to Azure using Azure CLI
    Connect-ToAzureSpn `
        -UseSPN $UseServicePrincipal `
        -ClientId $ClientId `
        -TenantId $TenantId `
        -ClientSecret $ClientSecret
}
catch
{
    _LogMessage -Level "ERROR" -Message "A terminating error occurred: $( $_.Exception.Message )" -InvocationName $MyInvocation.MyCommand.Name
    exit 1
}

```

### Get Az Policy Assignments
```
$TenantId = "01b9e453-84bc-4dc5-88de-a97a1fd42455"
$CurrentDir = $(Get-Location).Path
$PolicyFile = "$($CurrentDir)\Policy_Definitions_Assignment.csv"

if(Test-Path $PolicyFile){Remove-Item $PolicyFile -Force}
"PolicyAssignmentName,PolicyDefinitionId" | Out-File $PolicyFile -append -encoding ASCII

function Get-AllPolicyDefinitionAssignments {
    param (
        [CmdletBinding()]
        [ValidateNotNullOrEmpty()]
        [Parameter(Mandatory=$true)]
        [String]$TenantId = $TenantId
    )

    Begin {
        $PolicyAssignment = $PolicyDefinitionId = ""
        Set-AzContext -TenantId $TenantId -Verbose | Out-Null
        $allSubscriptions = @()
        $allManagementGroups = @()
        $allMgAssignments = @()
        $allSubAssignments = @()

        $allSubscriptions = Get-AzSubscription -TenantId $TenantId -Verbose
        $allManagementGroups = Get-AzManagementGroup -Verbose

        foreach($item in $allManagementGroups){
            $allMgAssignments += @{
                Name = $item.DisplayName
                Id = $item.Id
                Assignments = Get-AzPolicyAssignment -Scope $item.Id -WarningAction SilentlyContinue -Verbose
            }
        }

        foreach($item in $allSubscriptions){
            Select-AzSubscription $item -WarningAction SilentlyContinue -Verbose | Set-AzContext -Verbose | Out-Null
            $allSubAssignments += @{
                Name = $item.Name
                Id = $item.Id
                Assignments = Get-AzPolicyAssignment -Scope "/subscriptions/$($item.Id)" -IncludeDescendent -WarningAction SilentlyContinue -Verbose
            }
        }
    }
    Process {
        foreach ($item in $allMgAssignments){
            foreach($assignment in $item.Assignments){
                [array]$allAssignedDefinitions += $assignment.Properties.PolicyDefinitionId
            }
            [array]$allAssignedMgDefinitions += @{
                Name = $item.Name
                Id = $item.Id
                Definitions = $allAssignedDefinitions | Select-Object -Unique
            }
        }

        foreach ($item in $allSubAssignments){
            $allAssignedDefinitions = @()
            foreach($assignment in $item.Assignments){
                [array]$allAssignedDefinitions += $assignment.Properties.PolicyDefinitionId
            }
            [array]$allAssignedSubDefinitions += @{
                Name = $item.Name
                Id = $item.Id
                Definitions = $allAssignedDefinitions | Select-Object -Unique
            }
        }

        foreach($item in $allAssignedMgDefinitions){
            $assignments = ($allMgAssignments | Where-Object {$_.Id -eq $item.Id}).Assignments
            $matchingAssignments = @()
            foreach($definitionId in $item.Definitions){
                $matchingAssignments += @{
                    DefinitionId = $definitionId
                    Assignments = @(($assignments | Where-Object {$_.Properties.PolicyDefinitionId -eq $definitionId}).ResourceId)
                }
            }

            [array]$mgResults += @{
                Name = $item.Name
                Id = $item.Id
                Policies = $matchingAssignments
            }
        }

        foreach($item in $allAssignedSubDefinitions){
            $assignments = ($allSubAssignments | Where-Object {$_.Id -eq $item.Id}).Assignments
            $matchingAssignments = @()
            foreach($definitionId in $item.Definitions){
                    $matchingAssignments += @{
                        DefinitionId = $definitionId
                        Assignments = @(($assignments | Where-Object {$_.Properties.PolicyDefinitionId -eq $definitionId}).ResourceId)
                    }
                }

            [array]$subResults += @{
                Name = $item.Name
                Id = $item.Id
                Policies = $matchingAssignments
            }
        }
    }
    End {

        foreach($item in $mgResults){
            $definitionCount = $item.Policies.Count
            $assignmentCount = 0
            foreach($policy in $item.Policies){
                $assignmentCount += $policy.Assignments.Count
                Write-Verbose "[DefinitionId] $($policy.DefinitionId)"
                foreach($assignment in $policy.Assignments){
                    Write-Verbose "[AssignmentId] $($assignment)"
                }
            }
            Write-Verbose "Found '$definitionCount' unique definitions with an active assignmentin Management Group '$($item.Name)' with Id '$($item.Id)'"
            Write-Verbose "Found '$assignmentCount' total assignments in Management Group '$($item.Name)' with Id '$($item.Id)'"
        }

        foreach($item in $subResults){
            $definitionCount = $item.Policies.Count
            $assignmentCount = 0
            foreach($policy in $item.Policies){
                $assignmentCount += $policy.Assignments.Count
                Write-Verbose "[DefinitionId] $($policy.DefinitionId)"
                foreach($assignment in $policy.Assignments){
                    Write-Verbose "[AssignmentId] $($assignment)"
                }
            }
            Write-Verbose "Found '$definitionCount' unique definitions with an active assignment in Subscription '$($item.Name)' with Id '$($item.Id)'"
            Write-Verbose "Found '$assignmentCount' total assignments in Subscription '$($item.Name)' with Id '$($item.Id)'"
        }

        return @{
            managementGroups = $mgResults
            subscriptions = $subResults
        }
    }
}


Connect-AzAccount
$TenantId = $TenantId
$Result = Get-AllPolicyDefinitionAssignments -TenantId $TenantId -Verbose

```

## Bash

### Login to Azure (Azure CLI)

```shell
#!/usr/bin/env bash

##############################################################################
# Set safe defaults
##############################################################################
set -euo pipefail

##############################################################################
# Default parameter values
##############################################################################
UseServicePrincipal=false
ClientId=""
TenantId=""
ClientSecret=""
SubscriptionId=""
FedToken=""       # Not used in current logic, but included for completeness
IsDebugMode=false

##############################################################################
# CLI argument parsing
#   You can supply:
#     --use-service-principal (true|false)
#     --client-id <string>
#     --tenant-id <string>
#     --client-secret <string>
#     --subscription-id <string>
#     --fed-token <string>
#     --debug (true|false)
##############################################################################
while [[ $# -gt 0 ]]; do
  case $1 in
    --use-service-principal)
      UseServicePrincipal="$2"
      shift 2
      ;;
    --client-id)
      ClientId="$2"
      shift 2
      ;;
    --tenant-id)
      TenantId="$2"
      shift 2
      ;;
    --client-secret)
      ClientSecret="$2"
      shift 2
      ;;
    --subscription-id)
      SubscriptionId="$2"
      shift 2
      ;;
    --fed-token)
      FedToken="$2"
      shift 2
      ;;
    --debug)
      IsDebugMode="$2"
      shift 2
      ;;
    *)
      echo "Unknown parameter: $1"
      exit 1
      ;;
  esac
done

##############################################################################
# Simple colour definitions for console output
##############################################################################
COLOUR_RED='\033[0;31m'
COLOUR_YELLOW='\033[0;33m'
COLOUR_CYAN='\033[0;36m'
COLOUR_RESET='\033[0m'

##############################################################################
# _LogMessage function
#   Usage: _LogMessage "DEBUG|INFO|WARNING|ERROR" "Message text" "InvocationName"
##############################################################################
_LogMessage() {
  local Level="$1"
  local Message="$2"
  local InvocationName="$3"
  local timestamp
  timestamp="$(date +"%H:%M:%S")"

  # If it's a DEBUG message but debug mode is off, skip
  if [[ "$Level" == "DEBUG" && "$IsDebugMode" != "true" ]]; then
    return
  fi

  local prefix="${Level}: ${timestamp} - [${InvocationName}]"

  case "$Level" in
    "INFO")
      echo -e "${COLOUR_CYAN}${prefix} ${Message}${COLOUR_RESET}"
      ;;
    "DEBUG")
      echo -e "${COLOUR_YELLOW}${prefix} ${Message}${COLOUR_RESET}"
      ;;
    "WARNING")
      echo -e "${COLOUR_YELLOW}${prefix} ${Message}${COLOUR_RESET}"
      ;;
    "ERROR")
      echo -e "${COLOUR_RED}${prefix} ${Message}${COLOUR_RESET}"
      ;;
    *)
      echo -e "${prefix} ${Message}"
      ;;
  esac
}

##############################################################################
# Connect-AzureUser
#   1. Check if already logged in (az account show).
#   2. If not, do az login (interactive).
#   3. If SubscriptionId is set, do az account set.
##############################################################################
Connect-AzureUser() {
  local InvocationName="Connect-AzureUser"

  # Try to see if we have an existing login
  if ! az account show --output json &>/dev/null; then
    # Not logged in; do interactive login
    _LogMessage "INFO" "No existing Azure CLI login found. Authenticating (interactive)..." "$InvocationName"
    if ! output=$(az login 2>&1); then
      _LogMessage "ERROR" "Authentication failed: $output" "$InvocationName"
      return 1
    fi
    _LogMessage "INFO" "Authentication successful." "$InvocationName"

    if [[ -n "$SubscriptionId" ]]; then
      _LogMessage "INFO" "Setting subscription to $SubscriptionId..." "$InvocationName"
      if ! sub_output=$(az account set --subscription "$SubscriptionId" 2>&1); then
        _LogMessage "ERROR" "Subscription set failed: $sub_output" "$InvocationName"
        return 1
      fi
    fi
  else
    # Already logged in
    local currentUser
    currentUser=$(az account show --output tsv --query user.name 2>/dev/null || echo "")
    _LogMessage "INFO" "Already authenticated to Azure CLI as $currentUser." "$InvocationName"
  fi
}

##############################################################################
# Connect-ToAzureSpn
#   1. If UseServicePrincipal == true, do az login --service-principal.
#   2. Otherwise, call Connect-AzureUser for interactive approach.
#   3. If SubscriptionId is set, do az account set.
##############################################################################
Connect-ToAzureSpn() {
  local UseSPN="$1"
  local ClientId="$2"
  local TenantId="$3"
  local ClientSecret="$4"
  local FedToken="$5"    # not used, but we keep for structure
  local InvocationName="Connect-ToAzureSpn"

  if [[ "$UseSPN" == "true" ]]; then
    _LogMessage "INFO" "Connecting with Service Principal (Client Secret flow)..." "$InvocationName"
    if ! spn_output=$(az login \
      --service-principal \
      --username "$ClientId" \
      --password "$ClientSecret" \
      --tenant "$TenantId" 2>&1); then
      _LogMessage "ERROR" "Service principal authentication failed: $spn_output" "$InvocationName"
      return 1
    fi

    if [[ -n "$SubscriptionId" ]]; then
      _LogMessage "INFO" "Setting subscription to $SubscriptionId..." "$InvocationName"
      if ! sub_output=$(az account set --subscription "$SubscriptionId" 2>&1); then
        _LogMessage "ERROR" "Subscription set failed: $sub_output" "$InvocationName"
        return 1
      fi
    fi

  elif [[ "$UseSPN" == "false" ]]; then
    Connect-AzureUser
  else
    _LogMessage "ERROR" "Invalid authentication combination. Check parameters." "$InvocationName"
    return 1
  fi
}

##############################################################################
# Main Logic
##############################################################################
main() {
  local InvocationName="main"
  _LogMessage "INFO" "Starting script..." "$InvocationName"

  # 1. Connect to Azure using Azure CLI
  if ! Connect-ToAzureSpn "$UseServicePrincipal" "$ClientId" "$TenantId" "$ClientSecret" "$FedToken"; then
    _LogMessage "ERROR" "A terminating error occurred during Connect-ToAzureSpn." "$InvocationName"
    exit 1
  fi
}

main "$@"


```

```bash

{% endraw  %}

Source: `{{ page.path }}`
