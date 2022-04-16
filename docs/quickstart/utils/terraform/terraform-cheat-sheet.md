# Terraform Cheat Sheet

{% include list.liquid all=true %}

## Apply number padding

Convert `1` to `01`, `2` to `02` etc via `format("%02d", )`

```hcl
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

```shell
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

```hcl
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
```shell
Changes to Outputs:
  + location_output = "UK West"
```

## Perform conditional based on a match being found in a regex, if the condition is true, do something, if not, do nothing

```hcl
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
```shell
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

```hcl
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
```shell
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

```hcl
output "rg_name" {
  value = {
    for key, value in element(azurerm_resource_group.test_rg[*], 0) : key => value.name
  }
}
```

### Example Output in map(object({}))
```shell
rg_name  = {
      + key1 = "prd-vm"
      + key2 = "prd-biscuit
}
```

## Fetch the location key from the 2nd object in map(object({})), then get the value only to be used as an input

```hcl
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
```shell
  + asg_location    = "uksouth"
  + asg_rg_name     = "prd-vm"
```

## Access an inner object within a map with multiple elements
```hcl
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
```shell
  managed_identity_prinicpal_id  = {
      + fnc_app1 = "3ca56017-d384-4899-bbad-1066800809c0"
      + fnc_app2 = "0cca0226-011d-444d-8763-e210878ef4dc
}
```

Source: `{{ page.path }}`
