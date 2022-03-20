---
layout: default
title: Output
nav_order: 101
has_children: false
permalink: /terraform/azure/output
---

```hcl
output "test  {
  value = azurerm_resource_group.rg.name
}
```