---
sort: 2
---

# Usinf Libre DevOps TF Modules Example

```
module "rg" {
  source = "registry.terraform.io/libre-devops/rg/azurerm"

  rg_name    = "rg-${var.short}-${var.loc}-${terraform.workspace}-build"
  location   = local.location
  lock_level = "CanNotDelete"
  tags       = local.tags
}

module "network" {
  source = "registry.terraform.io/libre-devops/network/azurerm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location

  vnet_name     = "vnet-${var.short}-${var.loc}-${terraform.workspace}-01"
  vnet_location = module.network.vnet_location

  address_space   = ["10.0.0.0/16"]
  subnet_prefixes = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  subnet_names    = ["sn1-${module.network.vnet_name}", "sn2-${module.network.vnet_name}", "sn3-${module.network.vnet_name}"]

  subnet_service_endpoints = {
    subnet2 = ["Microsoft.Storage", "Microsoft.Sql"],
    subnet3 = ["Microsoft.AzureActiveDirectory"]
  }

  tags = local.tags
}

module "nsg" {
  source = "registry.terraform.io/libre-devops/nsg/azurerm"

  rg_name   = module.rg.rg_name
  location  = module.rg.rg_location
  nsg_name  = "nsg-build-${var.short}-${var.loc}-${terraform.workspace}-01"
  subnet_id = element(values(module.network.subnets_ids), 0)

  tags = module.rg.rg_tags
}

locals {
  vm_amount = 1
}

module "win_vm" {
  source = "github.com/libre-devops/terraform-azurerm-windows-vm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location

  vm_amount          = local.vm_amount
  vm_hostname        = "vm${var.short}${var.loc}${terraform.workspace}"
  vm_size            = "Standard_B2ms"
  vm_os_simple       = "WindowsServer2019"
  vm_os_disk_size_gb = "127"

  admin_username = "LibreDevOpsAdmin"
  admin_password = data.azurerm_key_vault_secret.mgmt_local_admin_pwd.value

  subnet_id            = element(values(module.network.subnets_ids), 0)
  availability_zone    = "alternate"
  storage_account_type = "Standard_LRS"
  identity_type        = "SystemAssigned"

  tags = module.rg.rg_tags
}
```

Source: `{{ page.path }}`
