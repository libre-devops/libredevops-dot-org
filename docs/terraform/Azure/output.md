---
layout: default
title: Azure
nav_order: 101
has_children: true
permalink: /terraform/azure/output
---

```hcl
output "test  {
  value = azurerm_resource_group.rg.name
}
```