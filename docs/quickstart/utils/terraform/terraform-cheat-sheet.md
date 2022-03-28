# Terraform Cheat Sheet

## Apply number padding

Convert `1` to `02`, `2` to `02` etc via `format("%02d", )`

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

### Example output
```

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

Source: `{{ page.path }}`