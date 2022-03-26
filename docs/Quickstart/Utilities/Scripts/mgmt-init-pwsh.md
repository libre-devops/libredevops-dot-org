# "Chicken and the Egg" - Azure PowerShell - PowerShell

- Purpose:
   - You want to use Terraform in Azure
   - You have read the official documentation
   - You want to get running quickly
   - You want to do things securely
   - This script is an example of how to get going!
   - It solves the "Chicken and the Egg" as this script will come first before Terraform can be started :wink:


- Pre-Requisites:
  - You need to be have permissions similar to `Owner` and `Global Administrator` for this to work
  - You will need access PowerShell (ideally `pwsh` or PowerShell 7), with some utilities installed:
     - Azure-PowerShell
     - OpenSSH (default on Windows 11/Server 2022)

- Why?
  - You can't use Terraform without some things, this script creates them.
    - "Management" Resource group - `rg-${ShorthandName}-${ShorthandLocation}-${ShorthandEnv}-mgt`
    - Service Principal, assigned as Owner to subscription specified in `${SubscriptionId}` - `svp-${SHORTHAND_NAME}-${ShorthandLocation}-${ShorthandEnv}-mgt-01`- _You may want to change this based on IAM design_
    - User-Assigned Managed Identity, assigned as Owner to subscription specified in `${SubscriptionId}` - `id-${ShorthandName}-${ShorthandLocation}-${ShorthandEnv}-mgt-01` - _You may want to change this based on IAM design_
    - SSH Key - `ssh-${ShorthandName}-${ShorthandLocation}-${ShorthandEnv}-pub-mgt`
    - Storage Account - `sa${ShorthandName}${ShorthandLocation}${ShorthandEnv}mgt01`
    - Blob Container - `blob${ShorthandName}${ShorthandLocation}${ShorthandEnv}mgt01`
    - Sets Key Vault Managed Storage account to regenerate Primary Access Key in 90-day period
    - Stores all information such as client secrets, client IDs etc. within Azure Keyvault
    - Does some basic smoke testing on naming length, case sensitivity etc
    - **This is just an example, you should read this in entirety before running it :smile:**

```powershell
#!/usr/bin/env pwsh

[Diagnostics.CodeAnalysis.SuppressMessage("PSAvoidUsingInvokeExpression","")]
[CmdletBinding()]
[OutputType([System.Object[]])]
param(

  [switch]$Help
)

Set-StrictMode -Version Latest

########### Edit the below variables to use script ############

$SubscriptionId = "libredevops-sub"
$ShorthandName = "ldo"
$ShorthandEnv = "ppd3"
$ShorthandLocation = "uks"

########## Do not edit anything below unless you know what you are doing ############

if ($ShorthandLocation = "uks")
{
  $LonghandLocation = "uksouth"
}
elseif ($ShorthandLocation = "ukw")
{
  $LonghandLocation = "ukwest"
}
elseif ($ShorthandLocation = "euw")
{
  $LonghandLocation = "westeurope"
}
elseif ($ShorthandLocation = "eun")
{
  $LonghandLocation = "northeurope"
}
elseif ($ShorthandLocation = "use")
{
  $LonghandLocation = "eastus"
}
elseif ($ShorthandLocation = "use2")
{
  $LonghandLocation = "eastus2"
}

# Set-PSDebug -Trace 1 // Basically the same as set -x in Bash


$lowerConvertedShorthandName = $ShorthandName.ToLower()
$lowerConvertedShorthandEnv = $ShorthandEnv.ToLower()
$lowerConvertedShorthandLocation = $ShorthandLocation.ToLower()

$upperConvertedShorthandName = $ShorthandName.ToUpper()
$upperConvertedShorthandEnv = $ShorthandEnv.ToUpper()
$upperConvertedShorthandLocation = $ShorthandLocation.ToUpper()

$TextInfo = (Get-Culture).TextInfo
$titleConvertedShorthandName = $TextInfo.ToTitleCase($ShorthandName)
$titleConvertedShorthandEnv = $TextInfo.ToTitleCase($ShorthandEnv)
$titleConvertedShorthandLocation = $TextInfo.ToTitleCase($ShorthandLocation)

$ResourceGroupName = "rg-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt"
$KeyvaultName = "kv-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt-01"
$ServicePrincipalName = "svp-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt-01"
$ManagedIdentityName = "id-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt-01"
$PublicSshKeyName = "ssh-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-pub-mgt"
$PrivateSshKeyName = "Ssh${titleConvertedShorthandName}${titleConvertedShorthandLocation}${titleConvertedShorthandEnv}Key"
$StorageAccountName = "sa${lowerConvertedShorthandName}${lowerConvertedShorthandLocation}${lowerConvertedShorthandEnv}mgt01"
$BlobContainerName = "blob${lowerConvertedShorthandName}${lowerConvertedShorthandLocation}${lowerConvertedShorthandEnv}mgt01"

Write-Host "This script is intended to be ran in the Cloud Shell in Azure to setup your pre-requisite items in a fresh tenant, to setup management resources for terraform.  This is just an example!" -ForegroundColor Black -BackgroundColor Yellow; Start-Sleep -Seconds 3

$TestCommands = @(
  'Get-AzContext',
  'Set-AzContext',
  'New-AzResourceGroup',
  'New-AzKeyVault',
  'Get-AzKeyvault',
  'Set-AzKeyVaultAccessPolicy',
  'Set-AzKeyVaultSecret',
  'Get-AzADUser',
  'Get-AzADServicePrincipal',
  'New-AzADServicePrincipal',
  'Get-AzUserAssignedIdentity',
  'New-AzSshKey',
  'New-AzStorageAccount',
  'New-AzStorageContainer',
  'Add-AzKeyVaultManagedStorageAccount'
)

foreach ($command in $TestCommands)
{
  # Sets up command testing as Az modules seem to be inconsitently installed
  if (-not (Get-Command $command))
  {
    Write-Host "${command} doesn't exist, it requires to be installed for this script to continue, try - Install-Module -Name Az.Accounts -AllowClobber or pwsh -Command Install-Module -Name Az -Force -AllowClobber -Scope AllUsers -Repository PSGallery or something similar.  - Exit Code - AZ_CMDS_NOT_INSTALLED" -ForegroundColor Black -BackgroundColor Yellow; exit 1
  }
}

# Checks for logged in data, if the API responds with Null, you aren't logged in
$LoggedIn = Get-AzContext
if ($null -eq $LoggedIn)
{
  Write-Host "You need to login to Azure to run this script" -ForegroundColor Black -BackgroundColor Red; exit 1
}
elseif ($null -ne $LoggedIn)
{
  Write-Host "Already logged in, continuing..." -ForegroundColor Black -BackgroundColor Green
}

if (-not ($ShorthandName.Length -le 5 -and $ShorthandName.Length -ge 1))
{
  Write-Host "You can't have a shorthand greater than 5, edit the variables and retry" -ForegroundColor Black -BackgroundColor Red; exit 1
}
else
{
  Write-Host "${lowerConvertedShorthandName} shorthand name is less than 5 and greater than 1, thus is permissible, continuing" -ForegroundColor Black -BackgroundColor Green
}

# Set subscription
Set-AzContext -Subscription $SubscriptionId

$SubId = $(Get-AzContext | Select-Object -ExpandProperty Subscription)
$spokeSubId = ConvertTo-SecureString "$SubId" -AsPlainText -Force

$signedInUserUpn = $(Get-AzADUser -SignedIn | Select-Object -ExpandProperty Id)

# Create Resource Group
$spokeMgmtRgName = $(New-AzResourceGroup `
     -Name $ResourceGroupName `
     -Location $LonghandLocation -Force | Select-Object -ExpandProperty ResourceGroupName)

Write-Host "Resource Group created!" -ForegroundColor Black -BackgroundColor Green

# Create Keyvault
$KeyvaultExists = $(Get-AzKeyVault -VaultName $KeyvaultName)

if ($null -eq $KeyvaultExists)
{
  Write-Host "Keyvault doesn't exist, creating it" -ForegroundColor Black -BackgroundColor Yellow

  New-AzKeyVault `
     -Name $KeyvaultName `
     -ResourceGroupName $spokeMgmtRgName `
     -Location $LonghandLocation
}
elseif ($null -ne $KeyvaultExists)
{
  Write-Host "Keyvault already exists, fetching info" -ForegroundColor Black -BackgroundColor Yellow
}

$KvOutput = $(Get-AzKeyVault -VaultName $KeyvaultName)

$spokeKvId = $($KvOutput | Select-Object -ExpandProperty ResourceId)
$spokeKvName = ConvertTo-SecureString "$KeyvaultName" -AsPlainText -Force

Set-AzKeyVaultSecret `
   -VaultName $KeyvaultName `
   -Name "SpokeKvname" `
   -SecretValue $spokeKvName

Set-AzKeyVaultSecret `
   -VaultName $KeyvaultName `
   -Name "SpokeSubId" `
   -SecretValue $spokeSubId

Write-Host "Keyvault Setup Complete" -ForegroundColor Black -BackgroundColor Green

Write-Host "Creating new service principal now, be advised, this script will generate a new client secret if the service principal exists, you have 5 seconds to cancel the script now." -ForegroundColor Black -BackgroundColor Yellow; Start-Sleep -Seconds 5

$SubId = $(Get-AzSubscription -SubscriptionName $SubscriptionId | Select-Object -ExpandProperty SubscriptionId)

$AzSvpExistsOutput = $(Get-AzADServicePrincipal `
     -DisplayName $ServicePrincipalName)


if ($null -eq $AzSvpExistsOutput)
{
  Write-Host "Service Principal does not yet exist, creating now" -ForegroundColor Black -BackgroundColor Yellow;

  $AzSvpExistsOutput = $null
  $AzSvpExistsOutput = $(New-AzADServicePrincipal `
       -DisplayName $ServicePrincipalName)

  $spokeSvpClientId = $null
  $spokeSvpId = $null
  $spokeTenantId = $null

  $SvpClientId = $null
  $SvpId = $null
  $SvpTenantId = $null

  $SvpClientId = $AzSvpExistsOutput | Select-Object -ExpandProperty AppId
  $SvpClientSecret = $AzSvpExistsOutput | Select-Object -ExpandProperty PasswordCredentials | Select-Object -First 1 | Select-Object -ExpandProperty SecretText
  $SvpId = $AzSvpExistsOutput | Select-Object -ExpandProperty Id
  $SvpTenantId = $AzSvpExistsOutput | Select-Object -ExpandProperty AppOwnerOrganizationId

  $spokeSvpClientId = ConvertTo-SecureString "$SvpClientId" -AsPlainText -Force
  $spokeSvpClientSecret = ConvertTo-SecureString "$SvpClientSecret" -AsPlainText -Force
  $spokeSvpId = ConvertTo-SecureString "$SvpId" -AsPlainText -Force
  $spokeTenantId = ConvertTo-SecureString "$SvpTenantId" -AsPlainText -Force

  Write-Host "New Service Principal Created!" -ForegroundColor Black -BackgroundColor Green
}
elseif ($null -ne $AzSvpExistsOutput)
{
  # Set conditional output so variables are the same between both conditions
  $AzSvpExistsOutput = $null
  $AzSvpExistsOutput = $(Get-AzADServicePrincipal -DisplayName $ServicePrincipalName)

  Write-Host "Service Principal exists, fetching output and generating new secret" -ForegroundColor Black -BackgroundColor Green; `

  $spokeSvpClientId = $null
  $spokeSvpId = $null
  $spokeTenantId = $null

  $SvpClientId = $null
  $SvpId = $null
  $SvpTenantId = $null

  $SvpClientId = $AzSvpExistsOutput | Select-Object -ExpandProperty AppId
  $SvpClientSecret = $AzSvpExistsOutput | New-AzADSpCredential | Select-Object -ExpandProperty SecretText
  $SvpId = $AzSvpExistsOutput | Select-Object -ExpandProperty Id
  $SvpTenantId = $AzSvpExistsOutput | Select-Object -ExpandProperty AppOwnerOrganizationId

  $spokeSvpClientId = ConvertTo-SecureString "$SvpClientId" -AsPlainText -Force
  $spokeSvpClientSecret = ConvertTo-SecureString "$SvpClientSecret" -AsPlainText -Force
  $spokeSvpId = ConvertTo-SecureString "$SvpId" -AsPlainText -Force
  $spokeTenantId = ConvertTo-SecureString "$SvpTenantId" -AsPlainText -Force

  Write-Host "Existing Service Principal updated!" -ForegroundColor Black -BackgroundColor Green
}

Set-AzKeyVaultSecret `
   -VaultName $KeyvaultName `
   -Name "SpokeSvpClientId" `
   -SecretValue $spokeSvpClientId

Set-AzKeyVaultSecret `
   -VaultName $KeyvaultName `
   -Name "SpokeSvpObjectId" `
   -SecretValue $spokeSvpId

Set-AzKeyVaultSecret `
   -VaultName $KeyvaultName `
   -Name "SpokeSvpClientSecret" `
   -SecretValue $spokeSvpClientSecret

Set-AzKeyVaultSecret `
   -VaultName $KeyvaultName `
   -Name "SpokeTenantId" `
   -SecretValue $spokeTenantId

$SvpRoleAssignmentExists = $(Get-AzRoleAssignment -Scope "/subscriptions/${SubId}" | Where-Object { $_.RoleDefinitionName -eq 'Owner' } | Select-Object -Property DisplayName | Where-Object { $_.DisplayName -eq $ServicePrincipalName })

if ($null -ne $SvpRoleAssignmentExists)
{
  Write-Host "Service Principal Owner Role exists, skipping" -ForegroundColor Black -BackgroundColor Yellow

}
elseif ($null -eq $SvpRoleAssignmentExists)
{
  Write-Host "Managed Identity Owner Role does not exist, creating now" -ForegroundColor Black -BackgroundColor Yellow

  New-AzRoleAssignment `
     -ApplicationId $SvpClientId `
     -RoleDefinitionName "Owner" `
     -Scope "/subscriptions/${SubId}"

  Write-Host "Owner Role Assigned to Svp" -ForegroundColor Black -BackgroundColor Green
}

if (-not (Get-AzUserAssignedIdentity -ResourceGroup $ResourceGroupName -Name $ManagedIdentityName -ErrorAction SilentlyContinue))
{
  Write-Host "Managed Identity does not exist, creating it" -ForegroundColor Black -BackgroundColor Yellow
  $AzManagedIdOutput = $null
  $AzManagedIdOutput = $(New-AzUserAssignedIdentity `
       -ResourceGroupName $ResourceGroupName `
       -Name $ManagedIdentityName)

  Write-Host "Managed Identity Created, Sleeping 30s while we await API catching up" -ForegroundColor Black -BackgroundColor Yellow; Start-Sleep -Seconds 30

  $spokeManagedIdentityId = $null
  $spokeManagedIdentityClientId = $null
  $spokeManagedIdentityPrincipalId = $null

  $SpokeMiId = $($AzManagedIdOutput | Select-Object -ExpandProperty Id)
  $SpokeMiClientId = $(Get-AzUserAssignedIdentity -ResourceGroup $ResourceGroupName -Name $ManagedIdentityName | Select-Object -ExpandProperty ClientId)
  $spokeManagedIdentityPrincipalId = $($AzManagedIdOutput | Select-Object -ExpandProperty PrincipalId)

  Set-AzKeyVaultAccessPolicy `
     -VaultName $KeyvaultName `
     -ResourceGroupName $ResourceGroupName `
     -ServicePrincipalName $SpokeMiClientId `
     -PermissionsToSecrets get,list,set,recover,backup,restore `
     -PermissionsToCertificates get,list,update,create,import,delete,recover,backup,restore `
     -PermissionsToKeys get,list,update,create,import,delete,recover,backup,restore,decrypt,encrypt,verify,sign
}
else
{
  Write-Host "Managed Identity already exists, Exporting values" -ForegroundColor Black -BackgroundColor Yellow
  $AzManagedIdOutput = $null
  $AzManagedIdOutput = $(Get-AzUserAssignedIdentity `
       -ResourceGroup $ResourceGroupName `
       -Name $ManagedIdentityName)

  $spokeManagedIdentityId = $null
  $spokeManagedIdentityClientId = $null
  $spokeManagedIdentityPrincipalId = $null

  $SpokeMiId = $($AzManagedIdOutput | Select-Object -ExpandProperty Id)
  $SpokeMiClientId = $(Get-AzUserAssignedIdentity -ResourceGroup $ResourceGroupName -Name $ManagedIdentityName | Select-Object -ExpandProperty ClientId)
  $spokeManagedIdentityPrincipalId = $($AzManagedIdOutput | Select-Object -ExpandProperty PrincipalId)

  Set-AzKeyVaultAccessPolicy `
     -VaultName $KeyvaultName `
     -ResourceGroupName $ResourceGroupName `
     -ServicePrincipalName $SpokeMiClientId `
     -PermissionsToSecrets get,list,set,recover,backup,restore `
     -PermissionsToCertificates get,list,update,create,import,delete,recover,backup,restore `
     -PermissionsToKeys get,list,update,create,import,delete,recover,backup,restore,decrypt,encrypt,verify,sign
}

$spokeManagedIdentityClientId = ConvertTo-SecureString "$SpokeMiClientId" -AsPlainText -Force

Set-AzKeyVaultSecret `
   -VaultName $KeyvaultName `
   -Name "SpokeManagedIdentityClientId" `
   -SecretValue $spokeManagedIdentityClientId

Write-Host "Managed Identity Created! and given rights to keyvault and subscription!" -ForegroundColor Black -BackgroundColor Green

$MiRoleAssignmentExists = $(Get-AzRoleAssignment -Scope "/subscriptions/$SubId" | Where-Object { $_.RoleDefinitionName  -eq 'Owner' } | Select-Object -Property DisplayName | Where-Object { $_.DisplayName -eq $ManagedIdentityName})

if ($null -ne $MiRoleAssignmentExists)
{
  Write-Host "Managed Identity Owner Role exists already, skipping" -ForegroundColor Black -BackgroundColor Yellow

}
elseif ($null -eq $MiRoleAssignmentExists)
{
  Write-Host "Managed Identity Owner Role does not exist, creating now" -ForegroundColor Black -BackgroundColor Yellow

  New-AzRoleAssignment `
     -ApplicationId $SpokeMiClientId `
     -RoleDefinitionName "Owner" `
     -Scope "/subscriptions/$SubId"

  Write-Host "Managed Identity Role Assignment Done!" -ForegroundColor Black -BackgroundColor Green
}

$PasswordGenerator = $(-join (((48..57) + (65..90) + (97..122)) * 80 | Get-Random -Count 25 | ForEach-Object { [char]$_ }))
$spokeAdminSecret = ConvertTo-SecureString "$PasswordGenerator" -AsPlainText -Force

Set-AzKeyVaultSecret `
   -VaultName $KeyvaultName `
   -Name "Local${titleConvertedShorthandName}Admin${titleConvertedShorthandEnv}Pwd" `
   -SecretValue $spokeAdminSecret

Write-Host "Admin Secret made in keyvault" -ForegroundColor Black -BackgroundColor Green

if (Get-Command ssh-keygen -ErrorAction SilentlyContinue)
{
  Write-Host "ssh-keygen exists! Attempting to generate SSH key now" -ForegroundColor Black -BackgroundColor Green

  #Gets current time tag in fractions of seconds to ensure running the same script twice is unlikely to exit with residue fodler

  ssh-keygen -b 4096 -t rsa -f "${lowerConvertedShorthandName}-${lowerConvertedShorthandEnv}-ssh-azureid_rsa.key" -q -N '""'

  $PublicKey = Get-Content "${lowerConvertedShorthandName}-${lowerConvertedShorthandEnv}-ssh-azureid_rsa.key.pub" -Raw
  $RawPrivateKey = Get-Content "${lowerConvertedShorthandName}-${lowerConvertedShorthandEnv}-ssh-azureid_rsa.key" -Raw
  $PrivateKey = ConvertTo-SecureString -String $RawPrivateKey -AsPlainText -Force

  New-AzSshKey `
     -ResourceGroupName $ResourceGroupName `
     -Name $PublicSshKeyName `
     -PublicKey $PublicKey

  Set-AzKeyVaultSecret `
     -VaultName $KeyvaultName `
     -Name $PrivateSshKeyName `
     -SecretValue $PrivateKey

  Remove-Item -Force "${lowerConvertedShorthandName}-${lowerConvertedShorthandEnv}-ssh-azureid_rsa.key.pub"
  Remove-Item -Force "${lowerConvertedShorthandName}-${lowerConvertedShorthandEnv}-ssh-azureid_rsa.key"
}
else
{
  Write-Host "SSH Keygen does not exist, skipping SSH key generation" -ForegroundColor Black -BackgroundColor Yellow
}

# Creates storage account and blob container for terraform

if (-not (Get-AzStorageAccount -ResourceGroupName $ResourceGroupName -Name $StorageAccountName -ErrorAction SilentlyContinue))
{

  Write-Host "Storage account doesn't exist, creating it" -ForegroundColor Black -BackgroundColor Yellow
  $StorageAccountOutput = $null

  $StorageAccountOutput = $(New-AzStorageAccount `
       -ResourceGroupName $ResourceGroupName `
       -AccountName $StorageAccountName `
       -Location $LonghandLocation `
       -SkuName "Standard_LRS" `
       -AccessTier "Hot")

  if (-not ($StorageAccountOutput | Get-AzStorageContainer -Name $BlobContainerName -ErrorAction SilentlyContinue))
  {
    Write-Host "Storage Container doesn't exist" -ForegroundColor Black -BackgroundColor Yellow

    $BlobContainerOutput = $null
    $BlobContainerOutput = $($StorageAccountOutput | New-AzStorageContainer -Name $BlobContainerName -Permission "off")
  }
  elseif ($StorageAccountOutput | Get-AzStorageContainer -Name $BlobContainerName)
  {
    Write-Host "Storage Container Created!" -ForegroundColor Black -BackgroundColor Green

    $BlobContainerOutput = $null
    $BlobContainerOutput = $($StorageAccountOutput | Get-AzStorageContainer -Name $BlobContainerName)
  }

  Write-Host "New Storage Account and Blob Created" -ForegroundColor Black -BackgroundColor Green
}
else
{
  Write-Host "Storage Account already exists" -ForegroundColor Black -BackgroundColor Yellow
  $StorageAccountOutput = $null
  $StorageAccountOutput = $(Get-AzStorageAccount `
       -ResourceGroupName $ResourceGroupName `
       -Name $StorageAccountName)

  if (-not ($StorageAccountOutput | Get-AzStorageContainer -Name $BlobContainerName))
  {
    Write-Host "Storage Container doesn't exist" -ForegroundColor Black -BackgroundColor Yellow

    $BlobContainerOutput = $null
    $BlobContainerOutput = $($StorageAccountOutput | New-AzStorageContainer -Name $BlobContainerName -Permission "off")
  }
  elseif ($StorageAccountOutput | Get-AzStorageContainer -Name $BlobContainerName)
  {
    Write-Host "Storage Container already exists" -ForegroundColor Black -BackgroundColor Yellow

    $BlobContainerOutput = $null
    $BlobContainerOutput = $($StorageAccountOutput | Get-AzStorageContainer -Name $BlobContainerName)
  }
  Write-Host "New Storage Account and Blob setup correctly!" -ForegroundColor Black -BackgroundColor Green
}

$SaRgName = $($StorageAccountOutput | Select-Object -ExpandProperty ResourceGroupName)
$StorageKey1 = $(Get-AzStorageAccountKey -ResourceGroupName $ResourceGroupName -AccountName $StorageAccountName | Select-Object -ExpandProperty Value | Select-Object -First 1)
$StorageKey2 = $(Get-AzStorageAccountKey -ResourceGroupName $ResourceGroupName -AccountName $StorageAccountName | Select-Object -ExpandProperty Value | Select-Object -Last 1)

$spokeSaId = $($StorageAccountOutput | Select-Object -ExpandProperty Id)
$spokeSaRgName = ConvertTo-SecureString "$SaRgName" -AsPlainText -Force
$spokeSaName = ConvertTo-SecureString "$StorageAccountName" -AsPlainText -Force
$spokeSaPrimaryKey = ConvertTo-SecureString "$StorageKey1" -AsPlainText -Force
$spokeSaSecondarykey = ConvertTo-SecureString "$StorageKey2" -AsPlainText -Force

Set-AzKeyVaultSecret `
   -VaultName $KeyvaultName `
   -Name "SpokeSaRgName" `
   -SecretValue $spokeSaRgName

Set-AzKeyVaultSecret `
   -VaultName $KeyvaultName `
   -Name "SpokeSaName" `
   -SecretValue $spokeSaName

$KeyExpiryDate = (Get-Date).AddMonths(3).ToUniversalTime()
Set-AzKeyVaultSecret `
   -VaultName $KeyvaultName `
   -Name "SpokeSaPrimaryKey" `
   -SecretValue $spokeSaPrimaryKey `
   -Expires $KeyExpiryDate

Set-AzKeyVaultSecret `
   -VaultName $KeyvaultName `
   -Name "SpokeSaSecondaryKey" `
   -SecretValue $spokeSaSecondarykey

Write-Host "Various Keyvault secrets have been set!" -ForegroundColor Black -BackgroundColor Green

# This value is set and managed by Azure, do not change
$AzureKeyvaultObjectId = "cfa8b339-82a2-471a-a3c9-0fc0be7a4093"
$SaRoleAssignmentExists = $(Get-AzRoleAssignment -Scope $spokeSaId | Where-Object { $_.RoleDefinitionName -eq 'Storage Account Key Operator Service Role'})

if ($null -ne $SaRoleAssignmentExists)
{
  Write-Host "Managed Keyvault Assignment already exists, skipping" -ForegroundColor Black -BackgroundColor Yellow

}
elseif ($null -eq $SaRoleAssignmentExists)
{
  Write-Host "Managed Keyvault Assignment does not exist, creating now" -ForegroundColor Black -BackgroundColor Yellow

  # Sets up Keyvault to managed regen of Storage key1 every 90 days
  New-AzRoleAssignment `
     -ApplicationId $AzureKeyvaultObjectId `
     -RoleDefinitionName "Storage Account Key Operator Service Role" `
     -Scope $spokeSaId

  Write-Host "Managed keyvault role created!, sleeping for 30 seconds to allow API to catchup" -ForegroundColor Black -BackgroundColor Green; Start-Sleep -Seconds 30

}

Set-AzKeyVaultAccessPolicy `
   -VaultName $KeyvaultName `
   -UserPrincipalName $signedInUserUpn `
   -PermissionsToStorage get,list,delete,set,update,regeneratekey,getsas,listsas,deletesas,setsas,recover,backup,restore,purge

$RegenerationPeriod = [System.TimeSpan]::FromDays(90)

Add-AzKeyVaultManagedStorageAccount `
   -VaultName $keyVaultName `
   -AccountName $StorageAccountName `
   -AccountResourceId $spokeSaId `
   -ActiveKeyName "key1" `
   -RegenerationPeriod $RegenerationPeriod

Write-Host "Storage Account is now being managed by keyvault" -ForegroundColor Black -BackgroundColor Green

```

source: `{{ page.path }}`