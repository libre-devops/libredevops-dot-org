---
layout: default
title: Terraform Cheatsheet
parent: Cheatsheets
---

# Terraform Cheat Sheet

{% include list.liquid all=true %}

## Apply number padding

Convert `1` to `01`, `2` to `02` etc via `format("%02d", )`

```
resource "azurerm_application_security_group" "with_pad" {
  count               = 4
  name                = "asg-${var.short}-${var.loc}-${terraform.workspace}-web-${format("%02d", count.index + 1)}"
  location            = local.location
  resource_group_name = azurerm_resource_group.example_rg.name
  tags                = local.tags
}

resource "azurerm_application_security_group" "without_pad" {
  count               = 4
  name                = "asg-${var.short}-${var.loc}-${terraform.workspace}-web-${count.index + 1}"
  location            = local.location
  resource_group_name = azurerm_resource_group.example_rg.name
  tags                = local.tags
}

```
### Example Output

```
Changes to Outputs:

  + asg_with_pad_output    = [
      + "asg-lbdo-euw-tst-web-01",
      + "asg-lbdo-euw-tst-web-02",
      + "asg-lbdo-euw-tst-web-03",
      + "asg-lbdo-euw-tst-web-04",
    ]
  + asg_without_pad_output = [
      + "asg-lbdo-euw-tst-web-1",
      + "asg-lbdo-euw-tst-web-2",
      + "asg-lbdo-euw-tst-web-3",
      + "asg-lbdo-euw-tst-web-4",
    ]
```

## Perform longhand conversion for inconsistent naming

Convert longhand name `uksouth` to shorthand `uks` or perform any other match on a key value

```
variable "loc" {
  description = "The shorthand name of the Azure location, for example, for UK South, use uks.  For UK West, use ukw. Normally passed as TF_VAR in pipeline"
  type        = string
  default     = "ukw"
}

variable "regions" {
  type = map(string)
  default = {
    uks = "UK South"
    ukw = "UK West"
    eus = "East US"
  }
  description = "Converts shorthand name to longhand name via lookup on map list"
}

locals {
  location = lookup(var.regions, var.loc, "UK South")
}
```

### Example Output
```
Changes to Outputs:
  + location_output = "UK West"
```

## Perform conditional based on a match being found in a regex, if the condition is true, do something, if not, do nothing

```
variable "environment" {
  default     = "prd"
  type        = string
  description = "Used as an alternative to terraform.workspace"
}

locals {

  names = {
    key0 = var.environment         // prd
    key1 = "${var.environment}-vm" // prd-vm
    key2 = "prd-biscuit"
    key3 = "tst_pizza"
  }
}

resource "azurerm_resource_group" "test_rg" {
  for_each = {
  for key, value in local.names : key => value
    if length(regexall("${var.environment}-", value)) > 0 // Checks the values of the map called local.names, if the any value of that map contains the name "prd-" followed by anything else, then make a resource group for it, with that value of the map as the name of the resource group.  If no match is found, do nothing.
  }
  location = local.location
  name     = each.value // makes 2 rgs, prd-vm and prd-biscuit
}
```

### Example Output
```
# azurerm_resource_group.test_rg["key1"] will be created
  + resource "azurerm_resource_group" "test_rg" {
      + id       = (known after apply)
      + location = "uksouth"
      + name     = "prd-vm"
    }

  # azurerm_resource_group.test_rg["key2"] will be created
  + resource "azurerm_resource_group" "test_rg" {
      + id       = (known after apply)
      + location = "uksouth"
      + name     = "prd-biscuit"

```

# Various Type Conversions

## Example - Full Code

```
variable "environment" {
  default     = "prd"
  type        = string
  description = "Used as an alternative to terraform.workspace"
}

locals {

  names = {
    key0 = var.environment         // prd
    key1 = "${var.environment}-vm" // prd-vm
    key2 = "prd-biscuit"
    key3 = "tst_pizza"
  }
}

resource "azurerm_resource_group" "test_rg" {
  for_each = {
  for key, value in local.names : key => value
    if length(regexall("${var.environment}-", value)) > 0 // Checks the values of the map called local.names, if the any value of that map contains the name "prd-" followed by anything else, then make a resource group for it, with that value of the map as the name of the resource group.  If no match is found, do nothing.
  }
  location = local.location
  name     = each.value // makes 2 rgs, prd-vm and prd-biscuit
}

output "rg_name" {
  value = element(azurerm_resource_group.test_rg[*], 0)
}

```

### Example Output - Full Rg_name - list(map(object({})))
```
# Outputs in list(map(object({})))
 rg_name         = [
      + {
          + key1 = {
              + id       = (known after apply)
              + location = "uksouth"
              + name     = "prd-vm"
              + tags     = null
              + timeouts = null
            }
          + key2 = {
              + id       = (known after apply)
              + location = "uksouth"
              + name     = "prd-biscuit"
              + tags     = null
              + timeouts = null
            }
        },
    ]


```

## Get specific key value from map(object({}))

```
output "rg_name" {
  value = {
    for key, value in element(azurerm_resource_group.test_rg[*], 0) : key => value.name
  }
}
```

### Example Output in map(object({}))
```
rg_name  = {
      + key1 = "prd-vm"
      + key2 = "prd-biscuit
}
```

## Fetch the location key from the 2nd object in map(object({})), then get the value only to be used as an input

```
variable "environment" {
  default     = "prd"
  type        = string
  description = "Used as an alternative to terraform.workspace"
}

locals {

  names = {
    key0 = var.environment         // prd
    key1 = "${var.environment}-vm" // prd-vm
    key2 = "prd-biscuit"
    key3 = "tst_pizza"
  }
}

resource "azurerm_resource_group" "test_rg" {
  for_each = {
  for key, value in local.names : key => value
    if length(regexall("${var.environment}-", value)) > 0 // Checks the values of the map called local.names, if the any value of that map contains the name "prd-" followed by anything else, then make a resource group for it, with that value of the map as the name of the resource group.  If no match is found, do nothing.
  }
  location = local.location
  name     = each.value // makes 2 rgs, prd-vm and prd-biscuit
}

// Use local or output from within a module to keep tidy, you could do this in-line but its a bad idea
locals {
  resource_group_locations = {
  for key, value in element(azurerm_resource_group.test_rg[*], 0) : key => value.location
  }
  /*
  Outputs:
  location  = {
      + key1 = "uksouth"
      + key2 = "uksouth
}
  */

  resource_group_name = {
  for key, value in element(azurerm_resource_group.test_rg[*], 0) : key => value.name
  }
  /*
  Outputs:
  rg_name  = {
      + key1 = "prd-vm"
      + key2 = "prd-biscuit
}
  */
}

resource "azurerm_application_security_group" "example" {
  name                = "libre-devops-asg"
  location            = element(values(local.resource_group_locations) , 0) // filters first element and gets value = uksouth
  resource_group_name = element(values(local.resource_group_name) , 0) // filters second element and gets value = prd-biscuit

  tags = {
    Hello = "World"
  }
}

output "asg_location" {
  value = azurerm_application_security_group.example.location
}

output "asg_rg_name" {
  value = azurerm_application_security_group.example.resource_group_name
}

```

### Example Output in map(object({}))
```
  + asg_location    = "uksouth"
  + asg_rg_name     = "prd-vm"
```

## Access an inner object within a map with multiple elements
```
locals {
  fnc_apps = {
    fnc_app1 = {
      name = "fnc_app1"
      ... // Not complete code
    },
    
    fnc_app2 = {
      name = "fnc_app2"
      ... // Not complete code
    }
  }
}

resource "azurerm_function_app" "fnc" {

  for_each = local.fnc_apps

  identity {
    type = each.value.identity
  }
  ... //Not complete code
}

output "managed_identity_prinicpal_id" {
  value = {
    for key, value in element(azurerm_function_app.fnc[*], 0) : key => element(value.identity, 0).principal_id
  }
}

```
### Example Output in map(object({}))
```
  managed_identity_prinicpal_id  = {
      + fnc_app1 = "3ca56017-d384-4899-bbad-1066800809c0"
      + fnc_app2 = "0cca0226-011d-444d-8763-e210878ef4dc
}
```
## Fetch your Outbound IP from terraform

```
// If running locally, running this block will fetch your outbound public IP of your home/office/ISP/VPN and add it.  It will add the hosted agent etc if running from Microsoft/GitLab
data "http" "user_ip" {
  url = "https://ipv4.icanhazip.com"
}

data "http" "user_ip_from_aws" {
 url = "https://checkip.amazonaws.com"
}

output "my_ip" {
  value = data.http.user_ip.body
}

// You will want to chomp to get rid of the heredoc response
output "chomp_my_ip" {
  value = chomp(data.http.user_ip.body)
}
```

### Example Output

```
  + my_ip           = <<-EOT
        20.108.154.139
    EOT
  + my_ip_chomp     = "20.108.154.139"

```

## Viurtual Machine Scale Set Agent Extension Block

```
 extension {
           auto_upgrade_minor_version = false
           automatic_upgrade_enabled  = false
           name                       = "Microsoft.Azure.DevOps.Pipelines.Agent"
           provision_after_extensions = []
           publisher                  = "Microsoft.VisualStudio.Services"
           settings                   = jsonencode(
                {
                   agentDownloadUrl        = "https://vstsagentpackage.azureedge.net/agent/2.209.0/vsts-agent-linux-x64-2.209.0.tar.gz"
                   agentFolder             = "/agent"
                   enableScriptDownloadUrl = "https://vstsagenttools.blob.core.windows.net/tools/ElasticPools/Linux/13/enableagent.sh"
                   isPipelinesAgent        = true
                }
            )
           type                       = "TeamServicesAgentLinux"
           type_handler_version       = "1.22"
        }
```

## Multiple options for nested blocks with Dynamic

```
dynamic "identity" {
    for_each = length(var.identity_ids) == 0 && var.identity_type == "SystemAssigned" ? [var.identity_type] : []
    content {
      type = var.identity_type
    }
  }

  dynamic "identity" {
    for_each = length(var.identity_ids) > 0 || var.identity_type == "UserAssigned" ? [var.identity_type] : []
    content {
      type         = var.identity_type
      identity_ids = length(var.identity_ids) > 0 ? var.identity_ids : []
    }
  }

  dynamic "identity" {
    for_each = length(var.identity_ids) > 0 || var.identity_type == "SystemAssigned, UserAssigned" ? [var.identity_type] : []
    content {
      type         = var.identity_type
      identity_ids = length(var.identity_ids) > 0 ? var.identity_ids : []
    }
  }
  ```
  
  ## Remove `-` and spaces from a string and title it
  ```
  replace(replace(title("rg-craig-test"), "-", ""), " ", "")
  RgCraigTest
  ```
  
  ##Make override.tf for local dev
  ```
terraform {
  #Use the latest by default, uncomment below to pin or use hcl.lck
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      #      configuration_aliases = [azurerm.default-provider]
      #      version = "~> 2.68.0"
    }
  }
  backend "azurerm" {
    subscription_id      = "blah"
    storage_account_name = "blah"
    container_name       = "blah"
    key                  = "blah.terraform.tfstate"
  }
}
  ```
  
## Create complex data structures from nested list of objects and dynamic blocks
```
```
  
### Determine your OS with terraform
  
First, add this to your repo and call it `printf.cmd`:
```bat
:: This is a hack for terraform to consider whether an OS is Linux or Windows.
@echo off
echo {"os": "Windows"}
```
Then in terraform:
```hcl
data "external" "os" {
  working_dir = path.module
  program = ["printf", "{\"os\": \"Linux\"}"]
}

locals {
  os = data.external.os.result.os
  check = local.os == "Windows" ? "We are on Windows" : "We are on Linux"
}

output "os" {
  value = local.os
}
```
## Local workflow
```
terraform_run() {

rm -rf .terraform tfplan* terraform.lock.hcl

    if command -v tfenv &> /dev/null && \
        command -v terraform &> /dev/null && \
        command -v terraform-compliance &> /dev/null && \
        command -v tfsec &> /dev/null && \
        command -v checkov &> /dev/null; then
        echo "All packages are installed"
    else
        echo "Packages needed to run are not installed, exiting" && return 1
    fi


    # Environment Variables
    terraform_workspace="prd"
    checkov_skipped_tests=""
    terraform_compliance_policy_path="git:https://github.com/libre-devops/azure-naming-convention.git//?ref=main"
    terraform_version="1.5.5"

    # Setup Tfenv and Install terraform
    setup_tfenv() {
        if [ -z "${terraform_version}" ]; then
            echo "terraform_version is empty or not set., setting to latest" && export terraform_version="latest"

        else
            echo "terraform_version is set, installing terraform version ${terraform_version}"
        fi

        tfenv install ${terraform_version} && tfenv use ${terraform_version}
    }

    # Terraform Init, Validate & Plan
    terraform_plan() {
        terraform init && \
            terraform workspace new ${terraform_workspace} || terraform workspace select $terraform_workspace
        terraform validate && \
            terraform fmt -recursive && \
            terraform plan -out "$(pwd)/tfplan.plan"
	    terraform show -json tfplan.plan | tee tfplan.json >/dev/null
    }

    # Terraform-Compliance Check
    terraform_compliance_check() {
        terraform-compliance -p "$(pwd)/tfplan.json" -f ${terraform_compliance_policy_path}
    }
0
    # TFSec Check
    tfsec_check() {
        tfsec . --force-all-dirs
    }

    # CheckOv Check
    checkov_check() {
        checkov -f tfplan.json --skip-check "${checkov_skipped_test}"
    }

    # Cleanup tfplan
    cleanup_tfplan() {
        rm -rf "$(pwd)/tfplan" && rm -rf "$(pwd)/tfplan.json"
    }

    # Call the functions in sequence
    setup_tfenv && \
    terraform_plan && \
    terraform_compliance_check && \
    tfsec_check && \
    checkov_check
    cleanup_tfplan
}
```

# Terraform state force-unlock one-liner

```powershell
$lockId = (terraform plan 2>&1 | Select-String -Pattern 'ID:\s+([\w-]+)' | ForEach-Object { $_.Matches.Groups[1].Value }); terraform force-unlock -force $lockId
```

```bash
lockId=$(terraform plan 2>&1 | grep -oP 'ID:\s+\K[\w-]+') && terraform force-unlock -force $lockId
```

# Generate timestamp tags without terraform function (not known until apply issue)

```
data "external" "detect_os" {
  working_dir = path.module
  program = ["printf", "{\"os\": \"Linux\"}"]
}

data "external" "generate_timestamp" {
  program = data.external.detect_os.result.os == "Linux" ? ["${path.module}/timestamp.sh"] : ["powershell", "${path.module}/timestamp.ps1"]
}

locals {
  dynamic_tags = {
    "LastUpdated" = data.external.generate_timestamp.result["timestamp"]
    "Environment" = terraform.workspace
  }

  tags = merge(var.static_tags, local.dynamic_tags)
}

variable "static_tags" {
  type        = map(string)
  description = "The tags variable"
  default = {
    "CostCentre"  = "671888"
    "ManagedBy"   = "Terraform"
    "Contact"     = "help@libredevops.org"
  }
}

```
### timestamp.sh
```
#!/usr/bin/env bash

DATE=$(date '+%d-%m-%Y:%H:%M')
echo "{\"timestamp\": \"$DATE\"}"

```

### timestamp.ps1
```
#!/usr/bin/env pwsh

# Generate the current timestamp in the required format
$date = Get-Date -Format "dd-MM-yyyy:HH:mm"

# Convert it to a JSON output for Terraform's external data source
$jsonOutput = @{
    timestamp = $date
} | ConvertTo-Json

# Print the JSON output
Write-Output $jsonOutput

```

### timestamp.py
```
import datetime

# Get current time
now = datetime.datetime.now()

# Format the time
timestamp = now.strftime("%d-%m-%Y:%H:%M")

# Print as JSON
print("{\"timestamp\": \"" + timestamp + "\"}")
```
Source: `{{ page.path }}`

