# Terraform Cheat Sheet

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

variable "Regions" {
  type = map(string)
  default = {
    uks = "UK South"
    ukw = "UK West"
    eus = "East US"
  }
  description = "Converts shorthand name to longhand name via lookup on map list"
}

locals {
  location = lookup(var.Regions, var.loc, "UK South")
}
```

### Example Output
```shell
Changes to Outputs:
  + location_output = "UK South"

```

Source: `{{ page.path }}`