---
layout: default
title: Init Script Example
parent: Azure
grand_parent: utils
nav_order: 301
permalink: /utils/azure/init-script
---
# Info

Inside [Utils Repo](https://github.com/libre-devops/utils) you will find loads of handy utils.

One of which is the [Azure Init Script](https://github.com/libre-devops/utils/blob/dev/scripts/azure/cli/mgmt-init.sh)

This script:

- Makes a resource group
- Makes a user-assigned managed identity
- Makes a keyvault
- Make a storage account
- Sets owner permission on managed identity
- Makes storage account managed by key vault
- Sets permissions on key vault access policies