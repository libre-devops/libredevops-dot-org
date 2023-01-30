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

credential = ManagedIdentityCredential() # Gets managed id stuff
no_proxy = os.environ["NO_PROXY"] = "*" # determines no proxy at host level
url = "http://169.254.169.254/metadata/instance?api-version=2021-02-01" # azure metadata service
headers = {"Metadata": "true"} # the extra headers needed

r = requests.get(url=url, headers=headers) # requst url with extra headers

parsed_json = json.loads(r.content) # load the url request as json

pretty_json = json.dumps(parsed_json, indent=2) # parse the json so it looks better

print(pretty_json) # print the pretty json

subscription_id = parsed_json["compute"]["subscriptionId"] # query the metadata service and get the subscription id

resource_id = parsed_json["compute"]["resourceId"] # also get the resource id

segments = resource_id.split("/") # split the / of the resource id as a delimiter, then query the results

print(segments) # shows resuts in dict

segement_subscription_id = segments[2] # get second element after split, in this case the already known sub id
segement_resource_group_name = segments[4]  # get the fourth element, which is the rg_name
segement_provider = segments[6]  # get the provider, in this case its Microsoft.Compute as querys are running from a VM
segement_resource_type = segments[7] # get the resource type from the split, in this case, its virtualmachine
segement_resource_name = segments[8] # get resource name

print(
    f"The subscription id is {segement_subscription_id}\n"
    f"The resource group name is {segement_resource_group_name}\n"
    f"The provider name is {segement_provider}\n"
    f"The resource type is {segement_resource_type}\n"
    f"The resource name is {segement_resource_name}\n"
)

```

{% endraw  %}

Source: `{{ page.path }}`
