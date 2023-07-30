---
layout: default
title: Terraform Example Build
---

## Table of contents
{: .no_toc .text-delta }

1. TOC
   {:toc}

---

# Example Build
```hcl

terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      # Uncomment below to pin or use hcl.lck
      # version = "~> 2.68.0"
    }
  }
  
  backend "azurerm" {
    storage_account_name = "example"
    container_name       = "example"
    key                  = "example.terraform.tfstate"
    use_azuread_auth     = true
  }
}

provider "azurerm" {
  features {
    # Add provider features if needed
  }
}

data "azurerm_client_config" "current" {
  # Fetch Azure client configuration
}

variable "short" {
  description = "This is passed as an environment variable, it is for a shorthand name for the environment, for example hello-world = hw"
  type        = string
  default     = "ldo"
}

variable "env" {
  description = "This is passed as an environment variable, it is for the shorthand environment tag for resource.  For example, production = prod"
  type        = string
  default     = "dev"
}

variable "loc" {
  description = "The shorthand name of the Azure location, for example, for UK South, use uks.  For UK West, use ukw. Normally passed as TF_VAR in pipeline"
  type        = string
  default     = "euw"
}

variable "Regions" {
  type = map(string)
  default = {
    uks = "UK South"
    ukw = "UK West"
    eus = "East US"
    euw = "West Europe"
  }
  description = "Converts shorthand name to longhand name via lookup on map list"
}

locals {
  location = lookup(var.Regions, var.loc, "UK South")
  tags = {
    Environment = "${upper(terraform.workspace)}"
    ProjectName = "${upper(var.short)}"
    CostCentre  = "${title("67/1888")}"
  }
}

module "rg" {
  source = "registry.terraform.io/libre-devops/rg/azurerm"

  rg_name  = "rg-${var.short}-${var.loc}-${terraform.workspace}-vault"
  location = local.location
  tags     = local.tags

  # lock_level = "CanNotDelete" // Do not set this value to skip lock
}

resource "azurerm_user_assigned_identity" "managed_id" {
  resource_group_name = module.rg.rg_name
  tags                = module.rg.rg_tags
  location            = module.rg.rg_location
  name                = "${var.short}-${var.loc}-${terraform.workspace}-vault-id"
}

resource "azurerm_role_assignment" "mi_owner" {
  principal_id                     = azurerm_user_assigned_identity.managed_id.principal_id
  scope                            = format("/providers/Microsoft.Management/managementGroups/%s", data.azurerm_client_config.current.tenant_id)
  role_definition_name             = "Owner"
  skip_service_principal_aad_check = true
}

module "network" {
  source = "registry.terraform.io/libre-devops/network/azurerm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  vnet_name     = "vnet-${var.short}-${var.loc}-${terraform.workspace}-01"
  vnet_location = module.network.vnet_location

  address_space   = ["10.0.0.0/16"]
  subnet_prefixes = ["10.0.1.0/24"]
  subnet_names = [
    "sn1-${module.network.vnet_name}",
  ]
  subnet_service_endpoints = {
    "sn1-${module.network.vnet_name}" = ["Microsoft.Storage"]
  }
}

module "bastion" {
  source = "registry.terraform.io/libre-devops/bastion/azurerm"

  vnet_rg_name = module.network.vnet_rg_name
  vnet_name    = module.network.vnet_name

  bas_subnet_iprange = "10.0.4.0/26"

  bas_nsg_name     = "nsg-bas-${var.short}-${var.loc}-${terraform.workspace}-01"
  bas_nsg_location = module.rg.rg_location
  bas_nsg_rg_name  = module.rg.rg_name

  bas_pip_name              = "pip-bas-${var.short}-${var.loc}-${terraform.workspace}-01"
  bas_pip_location          = module.rg.rg_location
  bas_pip_rg_name           = module.rg.rg_name
  bas_pip_allocation_method = "Static"
  bas_pip_sku               = "Standard"

  bas_host_name          = "bas-${var.short}-${var.loc}-${terraform.workspace}-01"
  bas_host_location      = module.rg.rg_location
  bas_host_rg_name       = module.rg.rg_name
  bas_host_ipconfig_name = "bas-${var.short}-${var.loc}-${terraform.workspace}-01-ipconfig"

  tags = module.rg.rg_tags
}

module "nsg" {
  source = "registry.terraform.io/libre-devops/nsg/azurerm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  nsg_name  = "nsg-${var.short}-${var.loc}-${terraform.workspace}-01"
  subnet_id = element(values(module.network.subnets_ids), 0)
}

resource "azurerm_network_security_rule" "vault_inbound" {
  name                        = "AllowVault8200Inbound"
  priority                    = "148"
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "8200"
  source_address_prefix       = "VirtualNetwork"
  destination_address_prefix  = "VirtualNetwork"
  resource_group_name         = module.nsg.nsg_rg_name
  network_security_group_name = module.nsg.nsg_name
}

resource "azurerm_network_security_rule" "vnet_inbound" {
  name                        = "AllowVnetInbound"
  priority                    = "149"
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "*"
  source_address_prefix       = "VirtualNetwork"
  destination_address_prefix  = "VirtualNetwork"
  resource_group_name         = module.nsg.nsg_rg_name
  network_security_group_name = module.nsg.nsg_name
}

resource "azurerm_network_security_rule" "bastion_inbound" {
  name                        = "AllowSSHRDPInbound"
  priority                    = "150"
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_ranges     = ["22", "3389"]
  source_address_prefix       = "VirtualNetwork"
  destination_address_prefix  = "VirtualNetwork"
  resource_group_name         = module.nsg.nsg_rg_name
  network_security_group_name = module.nsg.nsg_name
}

resource "azurerm_network_security_rule" "https_inbound" {
  name                        = "AllowHttpsInbound"
  priority                    = "151"
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "443"
  source_address_prefix       = "VirtualNetwork"
  destination_address_prefix  = "VirtualNetwork"
  resource_group_name         = module.nsg.nsg_rg_name
  network_security_group_name = module.nsg.nsg_name
}

resource "azurerm_network_security_rule" "smb_inbound" {
  name                        = "AllowSmbInbound"
  priority                    = "152"
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "445"
  source_address_prefix       = "VirtualNetwork"
  destination_address_prefix  = "VirtualNetwork"
  resource_group_name         = module.nsg.nsg_rg_name
  network_security_group_name = module.nsg.nsg_name
}

# Create random string so soft-deleted key vaults don't conflict - consider removing for production
resource "random_string" "random" {
  length  = 6
  special = false
}

resource "random_password" "password" {
  length  = 21
  special = true
}

resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "azurerm_ssh_public_key" "public_ssh_key" {
  resource_group_name = module.rg.rg_name
  tags                = module.rg.rg_tags
  location            = module.rg.rg_location
  name                = "ssh-${var.short}-${var.loc}-${terraform.workspace}-pub-vault"
  public_key          = tls_private_key.ssh_key.public_key_openssh
}

module "keyvault" {
  source = "registry.terraform.io/libre-devops/keyvault/azurerm"

  depends_on = [
    module.roles,
    time_sleep.wait_120_seconds # Needed to allow RBAC time to propagate
  ]

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  kv_name                         = "kv-${var.short}-${var.loc}-${terraform.workspace}-01-${random_string.random.result}"
  use_current_client              = true
  give_current_client_full_access = false
  enable_rbac_authorization       = true
  purge_protection_enabled        = false
}

locals {
  secrets = {
    "${var.short}-${var.loc}-${terraform.workspace}-vault-ssh-key"  = tls_private_key.ssh_key.private_key_pem
    "${var.short}-${var.loc}-${terraform.workspace}-vault-password" = random_password.password.result
  }
}

resource "azurerm_key_vault_secret" "secrets" {
  depends_on   = [module.roles]
  for_each     = local.secrets
  key_vault_id = module.keyvault.kv_id
  name         = each.key
  value        = each.value
}

data "azurerm_role_definition" "key_vault_administrator" {
  name = "Key Vault Administrator"
}

module "roles" {
  source = "registry.terraform.io/libre-devops/custom-roles/azurerm"

  create_role = false
  assign_role = true

  roles = [
    {
      role_assignment_name                             = "SvpKvOwner"
      role_definition_id                               = format("/subscriptions/%s%s", data.azurerm_client_config.current.subscription_id, data.azurerm_role_definition.key_vault_administrator.role_definition_id)
      role_assignment_assignee_principal_id            = data.azurerm_client_config.current.object_id
      role_assignment_scope                            = format("/subscriptions/%s", data.azurerm_client_config.current.subscription_id)
      role_assignment_skip_service_principal_aad_check = true
    },
    {
      role_assignment_name                             = "MiKvOwner"
      role_definition_id                               = format("/subscriptions/%s%s", data.azurerm_client_config.current.subscription_id, data.azurerm_role_definition.key_vault_administrator.id)
      role_assignment_assignee_principal_id            = azurerm_user_assigned_identity.managed_id.principal_id
      role_assignment_scope                            = format("/subscriptions/%s", data.azurerm_client_config.current.subscription_id)
      role_assignment_skip_service_principal_aad_check = true
    }
  ]
}

# Add delay to allow key vault permissions time to propagate on IAM
resource "time_sleep" "wait_120_seconds" {
  depends_on = [
    module.roles
  ]

  create_duration = "120s"
}

module "sa" {
  source = "registry.terraform.io/libre-devops/storage-account/azurerm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  storage_account_name = lower("st${var.short}${var.loc}${terraform.workspace}01")
  access_tier          = "Hot"
  identity_type        = "SystemAssigned"

  storage_account_properties = {
    # Set this block to enable network rules
    network_rules = {
      default_action = "Allow"
      bypass         = ["AzureServices", "Metrics", "Logging"]
      ip_rules       = []
      subnet_ids     = []
    }

    blob_properties = {
      versioning_enabled       = false
      change_feed_enabled      = false
      default_service_version  = "2020-06-12"
      last_access_time_enabled = false

      deletion_retention_policies = {
        days = 10
      }

      container_delete_retention_policy = {
        days = 10
      }
    }

    routing = {
      publish_internet_endpoints  = false
      publish_microsoft_endpoints = true
      choice                      = "MicrosoftRouting"
    }
  }
}

resource "azurerm_storage_share" "share" {
  name                 = "share1"
  storage_account_name = module.sa.sa_name
  quota                = 50
}

locals {
  files = {
    "tls.cer"    = "tls.cer"
    "tls.key"    = "tls.key"
    "vault.hcl"  = "vault.hcl"
    "nginx.conf" = "nginx.conf"
  }
}

resource "azurerm_storage_share_file" "files" {
  for_each         = local.files
  name             = each.key
  storage_share_id = azurerm_storage_share.share.id
  source           = each.value
}

module "linux_vm" {
  source = "registry.terraform.io/libre-devops/linux-vm/azurerm"

  depends_on = [
    module.sa,
    azurerm_storage_share.share,
    azurerm_storage_share_file.files
  ]

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  vm_amount                  = 1
  vm_hostname                = "lnx${var.short}${var.loc}${terraform.workspace}"
  vm_size                    = "Standard_B4ms"
  use_simple_image_with_plan = false
  vm_os_simple               = "Ubuntu22.04"
  vm_os_disk_size_gb         = "127"

  custom_data = base64encode(<<-EOF
    #cloud-config
    package_upgrade: true
    package_update: true

    packages:
      - cifs-utils
      - lsof
      - gpg
      - curl
      - wget
      - jq
      - nano
      - apt-transport-https

    runcmd:
      - apt-get update
      - apt-get dist-upgrade
      - sh -c 'wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg'
      - sh -c 'echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list'
      - mkdir -p /etc/vault.d
      - adduser vault
      - adduser nginx
      - mkdir -p /etc/nginx
      - mkdir -p /etc/nginx/tls
      - apt-get update
      - apt-get install -y vault python3-pip nginx
      - pip3 install azure-cli
      - sh -c 'echo export VAULT_ADDR="http://127.0.0.1:8200" >> /etc/environment'
      - STORAGE_ACCOUNT_NAME=${module.sa.sa_name}
      - az login --identity
      - STORAGE_ACCOUNT_KEY=$(az storage account keys list --account-name $STORAGE_ACCOUNT_NAME --query "[0].value" --output tsv)
      - MNT_PATH="/mnt/${module.sa.sa_name}"
      - SMB_PATH="//$STORAGE_ACCOUNT_NAME.file.core.windows.net/${azurerm_storage_share.share.name}"
      - mkdir -p $MNT_PATH
      - mount -t cifs $SMB_PATH $MNT_PATH -o vers=3.0,username=$STORAGE_ACCOUNT_NAME,password=$STORAGE_ACCOUNT_KEY,serverino,nosharesock,actimeo=30,mfsymlinks
      - echo "$SMB_PATH $MNT_PATH cifs vers=3.0,username=$STORAGE_ACCOUNT_NAME,password=$STORAGE_ACCOUNT_KEY,serverino,nosharesock,actimeo=30,mfsymlinks 0 0" >> /etc/fstab
      - cp $MNT_PATH/vault.hcl /etc/vault.d/vault.hcl
      - cp $MNT_PATH/nginx.conf /etc/nginx/nginx.conf
      - cp $MNT_PATH/tls.cer /etc/nginx/tls/tls.cer
      - cp $MNT_PATH/tls.key /etc/nginx/tls/tls.key
      - chown vault:vault /etc/vault.d/vault.hcl
      - chown -R nginx:nginx /etc/nginx
      - ufw allow https
      - systemctl daemon-reload
      - systemctl start nginx
      - systemctl enable nginx
      - systemctl start vault
      - systemctl enable vault
    EOF
  )

  user_data = base64encode(data.azurerm_client_config.current.tenant_id)

  asg_name = "asg-${element(regexall("[a-z]+", element(module.linux_vm.vm_name, 0)), 0)}-${var.short}-${var.loc}-${terraform.workspace}-01" // Regex strips all numbers from string

  admin_username = "LibreDevOpsAdmin"
  admin_password = random_password.password.result
  ssh_public_key = azurerm_ssh_public_key.public_ssh_key.public_key

  subnet_id            = element(values(module.network.subnets_ids), 0)
  availability_zone    = "alternate"
  storage_account_type = "StandardSSD_LRS"
  identity_type        = "UserAssigned"
  identity_ids         = [azurerm_user_assigned_identity.managed_id.id]
}

locals {
  principal_id_map = {
    for k, v in element(module.linux_vm.vm_identity[*], 0) : k => v.principal_id
  }

  principal_id_string = element(values(local.principal_id_map), 0)
}

module "jmp_vm" {
  source = "registry.terraform.io/libre-devops/windows-vm/azurerm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  vm_amount          = 1
  vm_hostname        = "jmp${var.short}${var.loc}${terraform.workspace}"
  vm_size            = "Standard_B2ms"
  vm_os_simple       = "WindowsServer2022Gen2"
  vm_os_disk_size_gb = "127"

  asg_name = "asg-${element(regexall("[a-z]+", element(module.jmp_vm.vm_name, 0)), 0)}-${var.short}-${var.loc}-${terraform.workspace}-01" //Regex strips all numbers from string

  admin_username = "LibreDevOpsAdmin"
  admin_password = random_password.password.result // Created with the Libre DevOps Terraform Pre-Requisite script

  subnet_id            = element(values(module.network.subnets_ids), 0) // Places in sn1
  availability_zone    = "alternate"                                    // If more than 1 VM exists, places them in alterate zones, 1, 2, 3 then resetting.  If you want HA, use an availability set.
  storage_account_type = "StandardSSD_LRS"
  identity_type        = "UserAssigned"
  identity_ids         = [azurerm_user_assigned_identity.managed_id.id]
}

module "run_command_win" {
  source = "registry.terraform.io/libre-devops/run-vm-command/azurerm"

  depends_on = [module.jmp_vm] // fetches as a data reference so requires depends-on
  location   = module.rg.rg_location
  rg_name    = module.rg.rg_name
  vm_name    = element(module.jmp_vm.vm_name, 0)
  os_type    = "windows"
  tags       = module.rg.rg_tags

  command = "iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1')) ; choco install -y git microsoft-edge azure-cli powershell-core ; New-NetFirewallRule -DisplayName 'AllowPort445Inbound' -Direction Inbound -LocalPort 445 -Protocol TCP -Action Allow"
}

resource "azurerm_virtual_machine_extension" "mount" {
  depends_on = [
    module.run_command_win
  ]
  name                 = "${element(module.jmp_vm.vm_name, 0)}-MountFileShare-${title(module.sa.sa_name)}"
  virtual_machine_id   = element(module.jmp_vm.vm_ids, 0)
  publisher            = "Microsoft.Compute"
  type                 = "CustomScriptExtension"
  type_handler_version = "1.9"

  settings = <<SETTINGS
  {
    "fileUris": ["https://raw.githubusercontent.com/libre-devops/utils/dev/scripts/azure/powershell/Mount-AzShare.ps1"],
    "commandToExecute": "powershell -ExecutionPolicy Unrestricted -File Mount-AzShare.ps1 -storageAccountName ${module.sa.sa_name} -storageAccountKey ${module.sa.sa_primary_access_key} -fileShareName ${azurerm_storage_share.share.name}"
  }
  SETTINGS
}



```

Source: `{{ page.path }}`
