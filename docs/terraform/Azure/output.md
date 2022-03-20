---
layout: default
title: Output
parent: Azure
nav_order: 101
has_children: false
permalink: /terraform/azure/output
---

```hcl
output "test  {
  value = azurerm_resource_group.rg.name
}
```