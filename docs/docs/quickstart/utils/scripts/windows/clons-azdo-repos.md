# Clone all Azure DevOps repos script

{% include list.liquid all=true %}

```powershell
#!/usr/bin/env pwsh

$Org="https://dev.azure.com/your_org"
$Proj="your_proj"

if ($Org -notmatch '^https?://dev.azure.com/\w+') {
    $Org = "https://dev.azure.com/$Org"
}

# Make sure we are signed in to Azure
$AccountInfo = az account show 2>&1
try {
    $AccountInfo = $AccountInfo | ConvertFrom-Json -ErrorAction Stop
}
catch {
    az login --allow-no-subscriptions
}

# Make sure we have Azure DevOps extension installed
$DevOpsExtension = az extension list --query '[?name == ''azure-devops''].name' -o tsv
if ($null -eq $DevOpsExtension) {
    $null = az extension add --name 'azure-devops'
}

$Repos = az repos list --organization $Org --project $Proj | ConvertFrom-Json
foreach ($Repo in $Repos) {
    if(-not (Test-Path -Path $Repo.name -PathType Container)) {
        Write-Warning -Message "Cloning repo $Proj\$($Repo.Name)"
        git clone $Repo.webUrl
    }
}

```

Source: {{ page.path }}
