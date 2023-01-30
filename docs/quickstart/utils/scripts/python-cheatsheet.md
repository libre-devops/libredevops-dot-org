# Python Cheat Sheet

{% raw  %}

## Activate a venv
```python
python3 -m venv myvenv
currentdir=${PWD##*/} # Get name of currentdir

alias mkvenv="currentdir=${PWD##*/} && python3 -m venv ${currentdir}"
```

## Authenticate to Azure using environment variables
```python
import os
from azure.identity import ClientSecretCredential

def azure_authenticate():
    client_id = os.environ["ARM_CLIENT_ID"]
    client_secret = os.environ["ARM_CLIENT_SECRET"]
    tenant_id = os.environ["ARM_TENANT_ID"]
    credentials = ClientSecretCredential(
        client_id=client_id, client_secret=client_secret, tenant_id=tenant_id
    )
    return credentials
```
## Authenticate to Azure, setup a class, instantiate the class and get a resource id
```python
import os
from azure.identity import ClientSecretCredential
from azure.mgmt.resource import ResourceManagementClient


def azure_authenticate():
    client_id = os.environ["ARM_CLIENT_ID"]
    client_secret = os.environ["ARM_CLIENT_SECRET"]
    tenant_id = os.environ["ARM_TENANT_ID"]
    credentials = ClientSecretCredential(
        client_id=client_id, client_secret=client_secret, tenant_id=tenant_id
    )
    return credentials


class CheckAzure:
    @staticmethod
    def check_resources():
        subscription_id = os.environ["ARM_SUBSCRIPTION_ID"]
        resource_group_name = "rg-ldo-euw-dev-mgt"
        resource_type = "Microsoft.KeyVault/vaults"
        arm_client = ResourceManagementClient(azure_authenticate(), subscription_id)
        api_version = "2022-11-01"

        # Set resources to empty list, then list all objects if they made the resource type
        resources = []
        for resource in arm_client.resources.list_by_resource_group(
            resource_group_name
        ):
            if resource_type in resource.type:
                resources.append(resource)
                if resources:
                    print(
                        f"The resource group {resource_group_name} contains the following resources of {resource_type}:"
                    )
                    # For every returned every resource
                    for resource in resources:
                        print(f" - {resource.name}")
                        resource_name = resource.name
                        resource_id = resource.id
                        get_each_id = arm_client.resources.get_by_id(
                            resource_id, api_version=api_version
                        )
                        print(get_each_id.properties["vaultUri"])
                else:
                    print(
                        f"The resource group {resource_group_name} "
                        f"does not contain any resources of {resource_type}, skipping..."
                    )


# Instantiate the class
obj = CheckAzure()
obj.check_resources()

```

## Using the Azure metadata service, query some properties of your VM
```python
import os
from azure.identity import ManagedIdentityCredential
import requests
import json

credential = ManagedIdentityCredential()
no_proxy = os.environ["NO_PROXY"] = "*"
url = "http://169.254.169.254/metadata/instance?api-version=2021-02-01"
headers = {"Metadata": "true"}

r = requests.get(url=url, headers=headers)

parsed_json = json.loads(r.content)
pretty_json = json.dumps(parsed_json, indent=2)

print(pretty_json)
subscription_id = parsed_json["compute"]["subscriptionId"]
resource_id = parsed_json["compute"]["resourceId"]
segments = resource_id.split("/")
print(segments)
segement_subscription_id = segments[2]
segement_resource_group_name = segments[4]
segement_provider = segments[6]
segement_resource_type = segments[7]
segement_resource_name = segments[8]
print(
    f"The subscription id is {segement_subscription_id}"
    f"The resource group name is {segement_resource_group_name}"
    f"The provider name is {segement_provider}"
    f"The resource type is {segement_resource_type}"
    f"The resource name is {segement_resource_name}"
)

```

{% endraw  %}

Source: `{{ page.path }}`
