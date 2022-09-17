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

## Get Az Policy Assignments
```
#!/usr/bin/env pwsh
$definitions = Get-AzPolicyDefinition
$assignments = Get-AzPolicyAssignment -IncludeDescendent
$result = @()

foreach($item in $definitions){

[array]$matchingAssignments = ($assignments | Where-Object {$_.Properties.PolicyDefinitionId -eq $item.PolicyDefinitionId}).PolicyAssignmentId

if($matchingAssignments){

    $result += @{

        DefinitionName = $item.Properties.DisplayName
        DefinitionId = $item.PolicyDefinitionId
        Assignments = $matchingAssignments

        }
    }
}

foreach($item in $result){

$item.DefinitionName

$item.Assignments
}
```
