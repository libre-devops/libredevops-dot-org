# AWS Cheat Sheet

{% raw  %}

## Generic

## Powershell

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

## Azure-CLI

{% endraw  %}

Source: `{{ page.path }}`
