# Azure Modules Example

```
module "sa" {
  source = "registry.terraform.io/libre-devops/storage-account/azurerm"

  rg_name  = module.rg.rg_name
  location = module.rg.rg_location
  tags     = module.rg.rg_tags

  storage_account_name = "st${var.short}${var.loc}${terraform.workspace}01"
  access_tier          = "Hot"
  identity_type        = "SystemAssigned"

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

      active_directory = {
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
```

Source: `{{ page.path }}`
