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

# Example .gitignore 
```
# Pycharm ignore
.idea/

# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
pip-wheel-metadata/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# PyInstaller
#  Usually these files are written by a python script from a template
#  before PyInstaller builds the exe, so as to inject date/other infos into it.
*.manifest
*.spec

# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/

# Translations
*.mo
*.pot

# Django stuff:
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal

# Flask stuff:
instance/
.webassets-cache

# Scrapy stuff:
.scrapy

# Sphinx documentation
docs/_build/

# PyBuilder
target/

# Jupyter Notebook
.ipynb_checkpoints

# IPython
profile_default/
ipython_config.py

# pyenv
.python-version

# pipenv
#   According to pypa/pipenv#598, it is recommended to include Pipfile.lock in version control.
#   However, in case of collaboration, if having platform-specific dependencies or dependencies
#   having no cross-platform support, pipenv may install dependencies that don't work, or not
#   install all needed dependencies.
#Pipfile.lock

# PEP 582; used by e.g. github.com/David-OConnor/pyflow
__pypackages__/

# Celery stuff
celerybeat-schedule
celerybeat.pid

# SageMath parsed files
*.sage.py

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# Spyder project settings
.spyderproject
.spyproject

# Rope project settings
.ropeproject

# mkdocs documentation
/site

# mypy
.mypy_cache/
.dmypy.json
dmypy.json

# Pyre type checker
.pyre/
.idea/
# Local .terraform directories
**/.terraform/*

# .tfstate files
*.tfstate
*.tfstate.*

# Crash log files
crash.log
crash.*.log

# Exclude all .tfvars files, which are likely to contain sensitive data, such as
# password, private keys, and other secrets. These should not be part of version 
# control as they are data points which are potentially sensitive and subject 
# to change depending on the environment.
*.tfvars
*.tfvars.json

# Ignore override files as they are usually used to override resources locally and so
# are not checked in
override.tf
override.tf.json
*_override.tf
*_override.tf.json

# Include override files you do wish to add to version control using negated pattern
# !example_override.tf

# Include tfplan files to ignore the plan output of command: terraform plan -out=tfplan
# example: *tfplan*

# Ignore CLI configuration files
.terraformrc
terraform.rc

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

## Configure Logging in your app
```python
import logging

# Set logging level. .DEBUG, .WARNING, .INFO etc
logging.basicConfig(level=logging.DEBUG)

# create a stream handler and set its level to logging.DEBUG
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)

# add the stream handler to the root logger
root_logger = logging.getLogger()
root_logger.addHandler(console_handler)

```
{% endraw  %}

Source: `{{ page.path }}`
