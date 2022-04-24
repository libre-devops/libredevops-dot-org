# Azure Modules Example

```
module "rg" {
  source = "registry.terraform.io/libre-devops/rg/azurerm"

  rg_name  = "rg-${var.short}-${var.loc}-${terraform.workspace}-build" // rg-ldo-euw-dev-build
  location = local.location                                            // compares var.loc with the var.regions var to match a long-hand name, in this case, "euw", so "westeurope"
  tags     = local.tags

  #  lock_level = "CanNotDelete" // Do not set this value to skip lock
}

module "network" {
  source = "registry.terraform.io/libre-devops/network/azurerm"

  rg_name  = module.rg.rg_name // rg-ldo-euw-dev-build
  location = module.rg.rg_location
  tags     = local.tags

  vnet_name     = "vnet-${var.short}-${var.loc}-${terraform.workspace}-01" // vnet-ldo-euw-dev-01
  vnet_location = module.network.vnet_location

  address_space   = ["10.0.0.0/16"]
  subnet_prefixes = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  subnet_names    = ["sn1-${module.network.vnet_name}", "sn2-${module.network.vnet_name}", "sn3-${module.network.vnet_name}"] //sn1-vnet-ldo-euw-dev-01
  subnet_service_endpoints = {
    "sn1-${module.network.vnet_name}" = ["Microsoft.Storage"]                   // Adds extra subnet endpoints to sn1-vnet-ldo-euw-dev-01
    "sn2-${module.network.vnet_name}" = ["Microsoft.Storage", "Microsoft.Sql"], // Adds extra subnet endpoints to sn2-vnet-ldo-euw-dev-01
    "sn3-${module.network.vnet_name}" = ["Microsoft.AzureActiveDirectory"]      // Adds extra subnet endpoints to sn3-vnet-ldo-euw-dev-01
  }
}

module "nsg" {
  source = "registry.terraform.io/libre-devops/nsg/azurerm"

  for_each = {
    for key, value in module.network.subnets_ids : key => value // Creates a key-value pair of subnet_ids with the keys being the subnet name and value being the id, creates a default NSG and assigns to each
  }

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  nsg_name  = "nsg-${each.key}" // nsg-sn*-vnet-ldo-euw-dev-01
  subnet_id = each.value        // Adds NSG to all subnets
}

// This module does not consider for CMKs and allows the users to manually set bypasses
#checkov:skip=CKV2_AZURE_1:CMKs are not considered in this module
#checkov:skip=CKV2_AZURE_18:CMKs are not considered in this module
#checkov:skip=CKV_AZURE_33:Storage logging is not configured by default in this module
#tfsec:ignore:azure-storage-queue-services-logging-enabled tfsec:ignore:azure-storage-allow-microsoft-service-bypass
module "sa" {
  source = "registry.terraform.io/libre-devops/storage-account/azurerm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  storage_account_name = "st${var.short}${var.loc}${terraform.workspace}01"
  access_tier          = "Hot"
  identity_type = "SystemAssigned"

  storage_account_properties = {

    // Set this block to enable network rules
    network_rules = {
      default_action = "Deny"
      bypass         = ["AzureServices", "Metrics", "Logging"]
      ip_rules       = [chomp(data.http.user_ip.body)]
      subnet_ids     = [element(values(module.network.subnets_ids), 0)]

      private_link_access = {
        endpoint_resource_id = element(values(module.network.subnets_ids), 0)
        endpoint_tenant_id   = data.azurerm_client_config.current_creds.tenant_id
      }
    }

    custom_domain = {
      name          = "libredevops.org"
      use_subdomain = false
    }

    blob_properties = {
      versioning_eabled        = false
      change_feed_enabled      = false
      default_service_version  = "2020-06-12"
      last_access_time_enabled = false

      deletion_retention_polcies = {
        days = 10
      }

      container_delete_retention_policy = {
        days = 10
      }

      cors_rule = {
        allowed_headers    = ["*"]
        allowed_methods    = ["GET", "DELETE"]
        allowed_origins    = ["*"]
        exposed_headers    = ["*"]
        max_age_in_seconds = 5
      }
    }

    share_properties = {

      versioning_enabled       = true
      change_feed_enabled      = true
      default_service_version  = true
      last_access_time_enabled = true

      cors_rule = {
        allowed_headers    = ["*"]
        allowed_methods    = ["GET", "DELETE"]
        allowed_origins    = ["*"]
        exposed_headers    = ["*"]
        max_age_in_seconds = 5
      }

      smb = {
        versions                        = ["SMB3.1.1"]
        authentication_types            = ["Kerberos"]
        kerberos_ticket_encryption_type = ["AES-256"]
        channel_encryption_type         = ["AES-256-GCM"]
      }

      retention_policy = {
        days = 10
      }
    }

    // Enabling this without a queue will cause an error
    queue_properties = {
      logging = {
        delete                = true
        read                  = true
        write                 = true
        version               = "1.0"
        retention_policy_days = 10
      }

      cors_rule = {
        allowed_headers    = ["*"]
        allowed_methods    = ["GET", "DELETE"]
        allowed_origins    = ["*"]
        exposed_headers    = ["*"]
        max_age_in_seconds = 5
      }

      minute_metrics = {
        enabled               = true
        version               = "1.0.0"
        include_apis          = true
        retention_policy_days = 10
      }

      hour_metrics = {
        enabled               = true
        version               = "1.0.0"
        include_apis          = true
        retention_policy_days = 10
      }
    }

    static_website = {
      index_document     = null
      error_404_document = null
    }

    azure_files_authentication = {
      directory_type = "AD"

      activte_directory = {
        storage_sid  = "12345"
        domain_name  = "libredevops.org"
        domain_sid   = "4567343"
        domain_guid  = "aaaa-bbbb-ccc-ddd"
        forest_naem  = "libredevops.org"
        netbios_name = "libredevops.org"
      }
    }

    // You must have a managed key for this to work
        customer_managed_key = {
          key_vault_key_id          = data.azurerm_key_vault.mgmt_kv.id
          user_assigned_identity_id = data.azurerm_user_assigned_identity.mgmt_user_assigned_id.id
        }

    routing = {
      publish_internet_endpoints  = false
      publish_microsoft_endpoints = true
      choice                      = "MicrosoftRouting"
    }
  }
}

module "public_lb" {
  source = "registry.terraform.io/libre-devops/public-lb/azurerm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  pip_name          = "pip-lbe-${var.short}-${var.loc}-${terraform.workspace}-01"
  pip_sku           = "Standard"
  availability_zone = ["1"]

  lb_name                  = "lbe-${var.short}-${var.loc}-${terraform.workspace}-01" // lbe-ldo-euw-dev-01
  lb_bpool_name            = "bpool-${module.public_lb.lb_name}"
  lb_ip_configuration_name = "lbe-${var.short}-${var.loc}-${terraform.workspace}-01-ipconfig"

  enable_outbound_rule     = true // Condtionally creates an outbound rule
  outbound_rule_name       = "rule-out-${module.public_lb.lb_name}"
  outbound_protocol        = "Tcp"
  allocated_outbound_ports = 1024
}

module "private_lb" {
  source = "registry.terraform.io/libre-devops/private-lb/azurerm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  lb_frontend_ip_configurations = {
    "lbi-${var.short}-${var.loc}-${terraform.workspace}-01-ipconfig" = {
      subnet_id                     = element(values(module.network.subnets_ids), 2),
      private_ip_address_allocation = "Dynamic"
    },
  }

  lb_name                  = "lbi-${var.short}-${var.loc}-${terraform.workspace}-01" // lbi-ldo-euw-dev-01
  lb_bpool_name            = "bpool-${module.public_lb.lb_name}"
}

// Fix error which causes security errors to be flagged by TFSec, public egress is needed for Azure Bastion to function, its kind of the point :)
#tfsec:ignore:azure-network-no-public-egress
module "bastion" {
  source = "registry.terraform.io/libre-devops/bastion/azurerm"

  vnet_rg_name = module.network.vnet_rg_name
  vnet_name    = module.network.vnet_name
  tags         = module.rg.rg_tags

  bas_subnet_iprange = "10.0.4.0/28"

  bas_nsg_name     = "nsg-bas-${var.short}-${var.loc}-${terraform.workspace}-01" // nsg-bas-ldo-euw-dev-01
  bas_nsg_location = module.rg.rg_location
  bas_nsg_rg_name  = module.rg.rg_name

  bas_pip_name              = "pip-bas-${var.short}-${var.loc}-${terraform.workspace}-01" //pip-bas-ldo-euw-dev-01
  bas_pip_location          = module.rg.rg_location
  bas_pip_rg_name           = module.rg.rg_name
  bas_pip_allocation_method = "Static"
  bas_pip_sku               = "Standard"

  bas_host_name          = "bas-${var.short}-${var.loc}-${terraform.workspace}-01" // bas-ldo-euw-dev-01
  bas_host_location      = module.rg.rg_location
  bas_host_rg_name       = module.rg.rg_name
  bas_host_ipconfig_name = "bas-${var.short}-${var.loc}-${terraform.workspace}-01-ipconfig" // bas-ldo-euw-dev-01-ipconfig
}

// This module does not consider for log analytics oms agent, but tfsec warns anyway.  Code exists to enable it should you wish by check is tabled
#tfsec:ignore:azure-container-logging
module "aks" {
  source = "registry.terraform.io/libre-devops/aks/azurerm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  aks_name                = "aks-${var.short}-${var.loc}-${terraform.workspace}-01" // aks-ldo-euw-dev-01
  admin_username          = "LibreDevOpsAdmin"
  ssh_public_key          = data.azurerm_ssh_public_key.mgmt_ssh_key.public_key // Created with Libre DevOps PreRequisite Script
  kubernetes_version      = "1.22.6"
  dns_prefix              = "ldo"
  sku_tier                = "Free"
  private_cluster_enabled = true
  enable_rbac             = true

  default_node_enable_auto_scaling  = false
  default_node_orchestrator_version = "1.22.6"
  default_node_pool_name            = "lbdopool"
  default_node_vm_size              = "Standard_B2ms"
  default_node_os_disk_size_gb      = "127"
  default_node_subnet_id            = element(values(module.network.subnets_ids), 2) // places in sn3-vnet-ldo-euw-dev-01
  default_node_availability_zones   = ["1"]
  default_node_count                = "1"
  default_node_agents_min_count     = null
  default_node_agents_max_count     = null

  identity_type = "UserAssigned" // Created with Libre DevOps PreRequisite Script
  identity_ids  = [data.azurerm_user_assigned_identity.mgmt_user_assigned_id.id]

  network_plugin                 = "azure"
  network_policy                 = "azure"
  net_profile_service_cidr       = "10.0.5.0/24"
  net_profile_dns_service_ip     = "10.0.5.10"
  net_profile_docker_bridge_cidr = "172.17.0.1/16"
}

module "win_vm" {
  source = "registry.terraform.io/libre-devops/windows-vm/azurerm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  vm_amount          = 3
  vm_hostname        = "win${var.short}${var.loc}${terraform.workspace}" // winldoeuwdev01 & winldoeuwdev02 & winldoeuwdev03
  vm_size            = "Standard_B2ms"
  vm_os_simple       = "CISWindowsServer2019L1"
  vm_os_disk_size_gb = "127"

  asg_name = "asg-${element(regexall("[a-z]+", element(module.win_vm.vm_name, 0)), 0)}-${var.short}-${var.loc}-${terraform.workspace}-01" //asg-vmldoeuwdev-ldo-euw-dev-01 - Regex strips all numbers from string

  admin_username = "LibreDevOpsAdmin"
  admin_password = data.azurerm_key_vault_secret.mgmt_local_admin_pwd.value // Created with the Libre DevOps Terraform Pre-Requisite script

  subnet_id            = element(values(module.network.subnets_ids), 0) // Places in sn1-vnet-ldo-euw-dev-01
  availability_zone    = "alternate"                                    // If more than 1 VM exists, places them in alterate zones, 1, 2, 3 then resetting.  If you want HA, use an availability set.
  storage_account_type = "Standard_LRS"
  identity_type        = "SystemAssigned"
}

module "run_command_win" {
  source = "registry.terraform.io/libre-devops/run-vm-command/azurerm"

  depends_on = [module.win_vm] // fetches as a data reference so requires depends-on
  location   = module.rg.rg_location
  rg_name    = module.rg.rg_name
  tags       = module.rg.rg_tags

  vm_name = element(module.win_vm.vm_name, 0)
  os_type = "windows"

  command = "iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1')) ; choco install -y git" // Runs this commands on winldoeuwdev01
}

module "lnx_vm" {
  source = "registry.terraform.io/libre-devops/linux-vm/azurerm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  vm_amount          = 2
  vm_hostname        = "lnx${var.short}${var.loc}${terraform.workspace}" // lmxldoeuwdev01 & lmxldoeuwdev02
  vm_size            = "Standard_B2ms"
  vm_os_simple       = "CISUbuntu20.04L1"
  vm_os_disk_size_gb = "127"

  asg_name = "asg-${element(regexall("[a-z]+", element(module.lnx_vm.vm_name, 0)), 0)}-${var.short}-${var.loc}-${terraform.workspace}-01" //asg-lnxldoeuwdev-ldo-euw-dev-01 - Regex strips all numbers from string

  admin_username = "LibreDevOpsAdmin"
  admin_password = data.azurerm_key_vault_secret.mgmt_local_admin_pwd.value
  ssh_public_key = data.azurerm_ssh_public_key.mgmt_ssh_key.public_key // Created with the Libre DevOps Terraform Pre-Requisite Script

  subnet_id            = element(values(module.network.subnets_ids), 0)
  availability_zone    = "alternate"
  storage_account_type = "Standard_LRS"
  identity_type        = "SystemAssigned"
}

module "run_command_lnx" {
  source = "registry.terraform.io/libre-devops/run-vm-command/azurerm"

  for_each = {
    for key, value in module.lnx_vm.vm_name : key => value // Gets all VM names created by Linux VM module
  }

  depends_on = [module.lnx_vm] // fetches as a data reference so requires depends-on
  location   = module.rg.rg_location
  rg_name    = module.rg.rg_name
  tags       = module.rg.rg_tags

  vm_name = each.value
  os_type = "linux"

  command = "echo hello > /home/libre-devops.txt" // Runs this commands on all Linux VMs
}

// Allow Inbound Access from Bastion to the entire virtual network
resource "azurerm_network_security_rule" "AllowSSHRDPInboundFromBasSubnet" {
  name                         = "AllowBasSSHRDPInbound"
  priority                     = 400
  direction                    = "Inbound"
  access                       = "Allow"
  protocol                     = "Tcp"
  source_port_range            = "*"
  destination_port_ranges      = ["22", "3389"]
  source_address_prefixes      = module.bastion.bas_subnet_ip_range
  destination_address_prefixes = module.network.vnet_address_space
  resource_group_name          = module.rg.rg_name
  network_security_group_name  = module.nsg.nsg_name
}

data "http" "user_ip" {
  url = "https://ipv4.icanhazip.com" // If running locally, running this block will fetch your outbound public IP of your home/office/ISP/VPN and add it.  It will add the hosted agent etc if running from Microsoft/GitLab
}


// Allow Inbound Access from your hypothetical home IP - you may not want this.
resource "azurerm_network_security_rule" "AllowSSHRDPInboundFromHomeSubnet" {
  name                         = "AllowBasSSHRDPFromHomeInbound"
  priority                     = 405
  direction                    = "Inbound"
  access                       = "Allow"
  protocol                     = "Tcp"
  source_port_range            = "*"
  destination_port_ranges      = ["22", "3389"]
  source_address_prefixes      = [chomp(data.http.user_ip.body)] // Chomp function removes a heredoc response from http user ip response
  destination_address_prefixes = module.network.vnet_address_space
  resource_group_name          = module.rg.rg_name
  network_security_group_name  = module.nsg.nsg_name
}
```

Source: `{{ page.path }}`
