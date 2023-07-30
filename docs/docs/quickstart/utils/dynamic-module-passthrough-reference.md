---
layout: default
title: Terraform Dynamic Module Passthrough Reference
parent: Utils
grand_parent: Quickstart
---

## Table of contents
{: .no_toc .text-delta }

1. TOC
   {:toc}

---

# Dynamic Block Passthrough

```hcl
resource "azurerm_redis_cache" "redis" {
  name                          = var.redis_name
  location                      = var.location
  resource_group_name           = var.rg_name
  capacity                      = var.capacity
  family                        = title(var.family)
  sku_name                      = title(var.sku)
  enable_non_ssl_port           = var.enable_non_ssl_port
  minimum_tls_version           = try(var.minimum_tls_version, "1.2")
  private_static_ip_address     = try(var.private_static_ip_address, null)
  subnet_id                     = var.private_static_ip_address != null ? try(var.subnet_id, null) : null
  public_network_access_enabled = try(var.public_network_access_enabled, null)
  replicas_per_master           = try(var.replicas_per_master, null)
  replicas_per_primary          = var.replicas_per_master != null ? try(var.replicas_per_master, var.replicas_per_primary, null) : null
  redis_version                 = try(var.redis_version, 6)
  shard_count                   = var.sku != "Premium" ? null : try(var.shard_count, null)
  zones                         = try(var.zones, null)
  tags                          = var.tags


  dynamic "redis_configuration" {
    for_each = var.redis_configuration != null ? [1] : []
    content {

      aof_backup_enabled              = try(var.redis_configuration["aof_backup_enabled"], null)
      aof_storage_connection_string_0 = try(var.redis_configuration["aof_storage_connection_string_0"], null)
      aof_storage_connection_string_1 = try(var.redis_configuration["aof_storage_connection_string_1"], null)
      enable_authentication           = var.subnet_id != null ? try(var.redis_configuration["enable_authentication"], true) : null
      maxmemory_reserved              = try(var.redis_configuration["maxmemory_reserved"], null)
      maxmemory_delta                 = try(var.redis_configuration["maxmemory_delta"], null)
      maxmemory_policy                = try(var.redis_configuration["maxmemory_policy"], null)
      maxfragmentationmemory_reserved = try(var.redis_configuration["maxfragmentationmemory_reserved"], null)
      rdb_backup_enabled              = try(var.redis_configuration["rdp_backup_enabled"], null)
      rdb_backup_frequency            = try(var.redis_configuration["rdb_backup_frequency"], null)
      rdb_backup_max_snapshot_count   = try(var.redis_configuration["rdb_backup_max_snapshot_count"], null)
      rdb_storage_connection_string   = try(var.redis_configuration["rdb_storage_connection_string"], null)
      notify_keyspace_events          = try(var.redis_configuration["notify_keyspace_events"], null)
    }
  }

  dynamic "patch_schedule" {
    for_each = var.patch_schedule != null ? [1] : []
    content {
      day_of_week        = try(var.patch_schedule["day_of_week"], null)
      start_hour_utc     = try(var.patch_schedule["start_hour_utc"], null)
      maintenance_window = try(var.patch_schedule["maintenance_windows"], null)
    }
  }

  dynamic "identity" {
    for_each = length(var.identity_ids) == 0 && var.identity_type == "SystemAssigned" ? [var.identity_type] : []
    content {
      type = var.identity_type
    }
  }

  dynamic "identity" {
    for_each = length(var.identity_ids) == 0 && var.identity_type == "SystemAssigned, UserAssigned" ? [var.identity_type] : []
    content {
      type         = var.identity_type
      identity_ids = length(var.identity_ids) > 0 ? var.identity_ids : []
    }
  }

  dynamic "identity" {
    for_each = length(var.identity_ids) > 0 || var.identity_type == "UserAssigned" ? [var.identity_type] : []
    content {
      type         = var.identity_type
      identity_ids = length(var.identity_ids) > 0 ? var.identity_ids : []
    }
  }
}
```

```
variable "redis_configuration" {
  description = "The redis configuration block"
  type        = any
  default     = null
}

```

Source: `{{ page.path }}`
