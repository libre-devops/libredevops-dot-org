---
layout: default
title: Output
parent: Azure
grand_parent: Terraform
nav_order: 101
permalink: /terraform/azure/output
---

```hcl
output "test  {
  value = azurerm_resource_group.rg.name
}
```