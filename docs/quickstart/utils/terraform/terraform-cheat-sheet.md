# Terraform Cheat Sheet

## Apply number padding

Convert `1` to `02`, `2` to `02` etc.

```hcl
resource "azurerm_application_security_group" "example_asg" {
  name                = "asg-${var.short}-${var.loc}-${terraform.workspace}-01"
  resource_group_name = azurerm_resource_group.example_rg.name
  location            = local.location
  tags                = local.tags
}

```

Source: `{{ page.path }}`