---
layout: default
title: Python Cheatsheet
parent: Cheatsheets
---

# Python Cheat Sheet

{% raw  %}

## Activate a venv with handy functions
```shell
#!/usr/bin/env bash

# Define the mkvenv function
function mkvenv() {
  local curdir=$(basename $(pwd))
  mkdir -p ~/.virtualenvs
  python3 -m venv ~/.virtualenvs/${curdir}
  echo "Virtual environment for ${curdir} created"
}

# Define the avenv function
function avenv() {
  local curdir=$(basename $(pwd))
  if [ -d ~/.virtualenvs/${curdir} ]; then
    source ~/.virtualenvs/${curdir}/bin/activate
    echo "Virtual environment for ${curdir} activated"
  else
    echo "Error: No virtual environment found for ${curdir}"
  fi
}

# Append the functions to your .bashrc file
echo "Appending functions to .bashrc"
echo "" >> ~/.bashrc
echo "# Define mkvenv function" >> ~/.bashrc
declare -f mkvenv >> ~/.bashrc
echo "" >> ~/.bashrc
echo "# Define avenv function" >> ~/.bashrc
declare -f avenv >> ~/.bashrc
echo "" >> ~/.bashrc

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

## Example Python Function app using a Managed Identity
```python
from azure.identity import DefaultAzureCredential
from azure.mgmt.resource import ResourceManagementClient
import azure.functions as func
import os
import logging
import datetime

# Use ManagedIdentityCredential to log into Azure
subscription_id = os.environ["ARM_SUBSCRIPTION_ID"]
tenant_id = os.environ["ARM_TENANT_ID"]
client_id = os.environ["ARM_CLIENT_ID"]
function_app_name = os.environ["FUNCTION_APP_NAME"]
resource_group_name = os.environ["RESOURCE_GROUP_NAME"]

def main(getazureinfo: func.TimerRequest) -> None:
    utc_timestamp = datetime.datetime.utcnow().replace(
        tzinfo=datetime.timezone.utc).isoformat()

    credential = DefaultAzureCredential(managed_identity_client_id=client_id)  # User assigned Managed Identity
    # credential = DefaultAzureCredential() # system-assigned identity

    # Create a ResourceManagementClient using the authenticated credential
    client = ResourceManagementClient(credential, subscription_id)

    # Get the current resource group
    resource_group = client.resource_groups.get(resource_group_name)

    # List all resources in the resource group
    resources = client.resources.list_by_resource_group(resource_group.name)

    # Print the id of each resource
    for resource in resources:
        logging.info(f"The resources within {resource_group_name}: {resource.id}")

    logging.info('Python timer trigger function ran at %s', utc_timestamp)

```

## Upgrade all Outdated pip packages
### Windows
```
python3 -m pip install --upgrade pip ; pip freeze | %{$_.split('==')[0]} | %{pip install --upgrade $_} # Windows
```
### Linux
```
pip3 list -o | cut -f1 -d' ' | tr " " "\n" | awk '{if(NR>=3)print}' | cut -d' ' -f1 | xargs -n1 pip3 install -U 
```

## Various Python Utils and code examples
```python
import logging
import requests
import time
import os
from pathlib import Path
from urllib.parse import urljoin


class CustomFormatter(logging.Formatter):
    """Logging Formatter to add colors"""

    lightcyan = "\033[1;36m"
    lightred = "\033[1;31m"
    yellow = "\033[1;33m"
    nocolor = "\033[0m"
    purple = "\033[0;35m"
    format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    FORMATS = {
        logging.DEBUG: lightcyan + format + nocolor,
        logging.INFO: purple + format + nocolor,
        logging.WARNING: yellow + format + nocolor,
        logging.ERROR: lightred + format + nocolor,
        logging.CRITICAL: lightred + format + nocolor,
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)


# Create logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Console handler with custom formatter
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
ch.setFormatter(CustomFormatter())

# Add handlers to logger
logger.addHandler(ch)


def print_success(message):
    lightcyan = "\033[1;36m"
    nocolor = "\033[0m"
    print(f"{lightcyan}{message}{nocolor}")


def print_error(message):
    lightred = "\033[1;31m"
    nocolor = "\033[0m"
    print(f"{lightred}{message}{nocolor}")


def print_alert(message):
    yellow = "\033[1;33m"
    nocolor = "\033[0m"
    print(f"{yellow}{message}{nocolor}")


def handle_download_error(arch):
    print_error(
        f"- Failed to download {arch} providers, it is possible the providers in question do not have a release for that platform e.g, no windows_amd64 release but has a darwin and linux release. Another factor could be the proxy interfering with the download or a general failure has occurred\n"
    )


def get_provider_data_with_retry(url, retries=3, backoff_in_seconds=1):
    for n in range(retries):
        try:
            logger.debug("Attempting to get provider data")
            return requests.get(url).json()
        except Exception as e:
            if n == retries - 1:  # This was the last attempt
                logger.error(f"An error as occurred: {e}")
                raise
            else:
                print_error(
                    f"Failed to fetch provider data, attempt {n+1} of {retries}. Retrying in {backoff_in_seconds} seconds."
                )
                time.sleep(backoff_in_seconds)
                backoff_in_seconds *= 2  # Exponential backoff


def get_latest_terraform_version():
    response = requests.get("https://checkpoint-api.hashicorp.com/v1/check/terraform")
    data = response.json()
    print(f"Current version: {data['current_version']}")
    return data["current_version"]


def check_terraform_version_and_get_url(version):
    base_url = (
        "https://releases.hashicorp.com/terraform/{}/terraform_{}_linux_amd64.zip"
    )
    response = requests.head(base_url.format(version, version))
    if response.status_code == 200:
        return base_url.format(version, version)
    else:
        return None


def download_terraform_zip(
    url,
    version,
    destination_path,
    os_names={"linux", "darwin", "windows"},
    retries=3,
    backoff_in_seconds=1,
):
    for n in range(retries):
        for os_name in os_names:
            try:
                response = requests.get(url)
                file_path = os.path.join(
                    destination_path, f"terraform_{version}_{os_name}_amd64.zip"
                )

                # Create the destination directory if it does not exist
                os.makedirs(os.path.dirname(file_path), exist_ok=True)

                with open(file_path, "wb") as f:
                    f.write(response.content)
                logger.debug(f"Downloaded {url} to {file_path}")
            except Exception as e:
                logger.error(f"An error has occurred during the download: {e}")
                if n == retries - 1:  # This was the last attempt
                    logger.error(f"An error has occurred: {e}")
                    raise
                else:
                    logger.debug(
                        f"Failed to fetch provider data, attempt {n + 1} of {retries}. Retrying in {backoff_in_seconds} seconds."
                    )
                    time.sleep(backoff_in_seconds)
                    backoff_in_seconds *= 2  # Exponential backoff
```
{% endraw  %}

Source: `{{ page.path }}`
