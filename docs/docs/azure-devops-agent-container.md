---
sort: 2
---

# Azure DevOps Agent Containers

Looking to run some Azure DevOps Agents in containers?  Libre DevOps have developed a solution to help you get started end to end :smile:

- Build containers using Windows or Linux
- All done via Azure DevOps
- Builds weekly
- Check the source files [here](https://github.com/libre-devops/azdo-agent-containers)

_This is an example, please ensure you read and accept all license terms regarding software used in these example builds_

## High-level info

- CI/CD with Azure DevOps :rocket:
    - Using easy, readable, script params instead of in-built Steps, Templates & Actions for easy migrations to other CI/CDs
- Container registry using GitHub Packages with Github Container Registry :sunglasses:
- Example scripts in Podman, CI/CD pipelines in Podman for Linux and Docker for Windows :whale:
- Linux Images used in the repo:
   - [RedHat 8 Universal Basic Image ](https://catalog.redhat.com/software/container-stacks/detail/5ec53f50ef29fd35586d9a56)
   - [Ubuntu 22.04 Jammy](https://hub.docker.com/_/ubuntu)
  
 - Windows Image used in the repo:
   - [Windows Server 2019/2022 LTSC](https://hub.docker.com/_/microsoft-windows-server/) 

# Quickstart

## Linux

```shell
docker run -it ghcr.io/libre-devops/azdo-agent-rhel:latest \
-e AZP_URL="${AZP_URL}" \
-e AZP_TOKEN="${AZP_TOKEN}" \
-e AZP_POOL="${AZP_POOL}" \
-e AZP_WORK="${AZP_WORK}"
```

Or using podman
```shell
podman run -it ghcr.io/libre-devops/azdo-agent-ubuntu:latest \
-e AZP_URL="https://dev.azure.com/yourorg" \
-e AZP_TOKEN="aaabbbcccdddeeeeffffggg" \
-e AZP_POOL="mypool" \
-e AZP_WORK="_work"
```


## Windows
```powershell
docker run -it ghcr.io/libre-devops/azdo-agent-winservercoreltsc2022:latest \
-e AZP_URL="${AZP_URL}" \
-e AZP_TOKEN="${AZP_TOKEN}" \
-e AZP_POOL="${AZP_POOL}" \
-e AZP_WORK="${AZP_WORK}"
```

Alteratnively, you can fork the repo and edit the pipelines to include your secrets as build args into the template!

## Info

  - On Linux:
     - Various packages and updates needed.
     - Python - Latest version with argument at pipeline level for roll-back options - This is for Azure-CLI which I wish to be part of ALL of my agents
     - Azure-CLI - Installed via global pip3
     - PowerShell 7 - With all Azure modules downloaded (these are around 2GB in size, which is why its part of the base)
     - The script which will execute on `CMD` in the container, which will fetch the latest Azure Pipelines agent on execution
       - **NOTE: The script is not intended to be ran by the base, but the agent, as it requires various build arguments to execute and connect to Azure DevOps** 

  - On Windows:
    - Chocolatey and Scoop installed
    - Python - Latest version from chocolatey
    - Azure-CLI - Latest version from chocolatey
    - Git - Latest from chocolatey (and will also install Bash)
    - 7-Zip
    - Scoop "extras" bucket
      - **NOTE: The script is not intended to be ran by the base, but the agent, as it requires various build arguments to execute and connect to Azure DevOps**

</br>

Some others notes:

We do not own or give any explicit license agreements which may be contained with the software in these images, but have given images for examples and published them to allow experiments :scientist:.  The images are as follows:

- Image - Standard Image with Python, PowerShell and Azure-CLI, examples in this repo:  `rhel`, `ubuntu`, `winseverltsc2019`, `winseverltsc2022`
- All images are tagged as latest and available in `ghcr.io/libre-devops`