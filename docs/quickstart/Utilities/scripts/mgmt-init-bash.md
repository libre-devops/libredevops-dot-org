# Chicken and the Egg - Azure CLI - Bash

source: `{{ page.path }}`


```bash
#!/usr/bin/env bash

########### Edit the below variables to use script ############

SUBSCRIPTION_ID="libredevops-sub"
SHORTHAND_NAME="lbdo"
SHORTHAND_ENV="dev"
SHORTHAND_LOCATION="uks"

########## Do not edit anything below unless you know what you are doing ############

set -xeuo pipefail

if [ "${SHORTHAND_LOCATION}" == "uks" ]; then

    LONGHAND_LOCATION="uksouth"

elif [ "${SHORTHAND_LOCATION}" == "euw" ]; then
    LONGHAND_LOCATION="uksouth"
fi

print_success() {
    lightcyan='\033[1;36m'
    nocolor='\033[0m'
    echo -e "${lightcyan}$1${nocolor}"
}

print_error() {
    lightred='\033[1;31m'
    nocolor='\033[0m'
    echo -e "${lightred}$1${nocolor}"
}

print_alert() {
    yellow='\033[1;33m'
    nocolor='\033[0m'
    echo -e "${yellow}$1${nocolor}"
}

title_case_convert() {
    sed 's/.*/\L&/; s/[a-z]*/\u&/g' <<<"$1"
}

upper_case_convert() {
    sed -e 's/\(.*\)/\L\1/' <<< "$1"
}

lower_case_convert() {
    sed -e 's/\(.*\)/\L\1/' <<< "$1"
}

clean_on_exit() {
    rm -rf "spoke_svp.json"
    az logout
    cat /dev/null > ~/.bash_history && history -c
}

lowerConvertedShorthandName="$(lower_case_convert $SHORTHAND_NAME)"
lowerConvertedShorthandEnv="$(lower_case_convert $SHORTHAND_ENV)"
lowerConvertedShorthandLocation="$(lower_case_convert $SHORTHAND_LOCATION)"

upperConvertedShorthandName="$(upper_case_convert $SHORTHAND_NAME)"
upperConvertedShorthandEnv="$(upper_case_convert $SHORTHAND_ENV)"
upperConvertedShorthandLocation="$(upper_case_convert $SHORTHAND_LOCATION)"

titleConvertedShorthandName="$(title_case_convert $SHORTHAND_NAME)"
titleConvertedShorthandEnv="$(title_case_convert $SHORTHAND_ENV)"
titleConvertedShorthandLocation="$(title_case_convert $SHORTHAND_LOCATION)"

#Without this, you have a chicken and an egg scenario, you need a storage account for terraform, you need an ARM template for ARM, or you can create in portal and terraform import, I prefer just using Azure-CLI and "one and done" it
print_alert "This script is intended to be ran in the Cloud Shell in Azure to setup your pre-requisite items in a fresh tenant" && sleep 3s && \

    #Checks if Azure-CLI is installed
if [[ ! $(command -v az) ]] ;

then
    print_error "You must install Azure CLI to use this script" && clean_on_exit && exit 1

else
    print_success "Azure-CLI is installed!, continuing" && sleep 2s

fi

#Checks if OpenSSL
if [[ ! $(command -v openssl) ]] ;

then
    print_error "You must install OpenSSL to use this script" && clean_on_exit && exit 1

else
    print_success "OpenSSL is installed!, continuing" && sleep 2s

fi

#Checks if jq is installed
if [[ ! $(command -v jq) ]] ;

then
    print_error "You must install jq to use this script" && clean_on_exit && exit 1

else
    print_success "jq is installed!, continuing" && sleep 2s

fi

if [ "$(az account show)" ]; then

    print_success "You are logged in!, continuing"
else
    print_error "You need to logged in to run this script"  && clean_on_exit && exit 1
fi

az config set extension.use_dynamic_install=yes_without_prompt
az account set --subscription "${SUBSCRIPTION_ID}" && \

    spokeSubId=$(az account show --query id -o tsv)
spokeSubName=$(az account show --query name -o tsv)

#Create Management Resource group and export its values
if

signedInUserUpn=$(az ad signed-in-user show \
    --query "userPrincipalName" -o tsv)

az group create \
    --name "rg-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt" \
    --location "${LONGHAND_LOCATION}" \
    --subscription ${SUBSCRIPTION_ID} && \

    spokeMgmtRgName=$(az group show \
        --resource-group "rg-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt" \
    --subscription ${SUBSCRIPTION_ID} --query "name" -o tsv)

then
    print_success "Management resource group made for spoke" && sleep 2s
else
    print_error "Something went wrong making the management resource group inside spoke" && clean_on_exit && exit 1
fi

#Create management keyvault, add rules to it and export values for later use
if

az keyvault create \
    --name "kv-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt-01" \
    --resource-group "${spokeMgmtRgName}" \
    --location "${LONGHAND_LOCATION}" \
    --subscription "${SUBSCRIPTION_ID}"

spokeKvName=$(az keyvault show \
        --name "kv-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt-01" \
        --resource-group "${spokeMgmtRgName}" \
        --subscription "${SUBSCRIPTION_ID}" \
    --query "name" -o tsv)

spokeKvId=$(az keyvault show \
        --name "kv-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt-01" \
        --resource-group "${spokeMgmtRgName}" \
        --subscription "${SUBSCRIPTION_ID}" \
    --query "id" -o tsv)

then
    print_success "Management keyvault made for spoke" && sleep 2s
else
    print_error "Something went wrong making the management keyvault." && clean_on_exit && exit 1
fi

if

export MSYS_NO_PATHCONV=1

az ad sp create-for-rbac \
    --name "svp-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt-01" \
    --role "Owner" \
    --scopes "/subscriptions/${spokeSubId}" > spoke_svp.json && \
    spokeSvpClientId=$(jq -r ".appId" spoke_svp.json) && \
    spokeSvpClientSecret=$(jq -r ".password" spoke_svp.json)
spokeSvpTenantId=$(jq -r ".tenant" spoke_svp.json)

spokeSvpObjectId=$(az ad sp show \
        --id "${spokeSvpClientId}" \
    --query "objectId" -o tsv)

az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "SpokeSubId" \
    --value "${spokeSubId}"

az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "SpokeSvpClientId" \
    --value "${spokeSvpClientId}"

az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "SpokeSvpObjectId" \
    --value "${spokeSvpObjectId}"

az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "SpokeSvpClientSecret" \
    --value "${spokeSvpClientSecret}"

az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "SpokeTenantId" \
    --value "${spokeSvpTenantId}"

az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "SpokeKvName" \
    --value "${spokeKvName}"

unset MSYS_NO_PATHCONV

then
    print_success "Management keyvault made for spoke" && sleep 2s
else
    print_error "Something went wrong making the management keyvault." && clean_on_exit && exit 1
fi

if
az identity create \
    --name "id-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt-01" \
    --resource-group "${spokeMgmtRgName}" \
    --location "${LONGHAND_LOCATION}" \
    --subscription "${SUBSCRIPTION_ID}"

spokeManagedIdentityId=$(az identity show \
        --name "id-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt-01" \
        --resource-group "${spokeMgmtRgName}" \
        --subscription "${SUBSCRIPTION_ID}" \
    --query "id" -o tsv)

spokeManagedIdentityClientId=$(az identity show \
        --name "id-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt-01" \
        --resource-group "${spokeMgmtRgName}" \
        --subscription "${SUBSCRIPTION_ID}" \
    --query "clientId" -o tsv)

spokeManagedIdentityPrincipalId=$(az identity show \
        --name "id-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt-01" \
        --resource-group "${spokeMgmtRgName}" \
        --subscription "${SUBSCRIPTION_ID}" \
    --query "principalId" -o tsv)

spokeManagedIdentityTenantId=$(az identity show \
        --name "id-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-mgt-01" \
        --resource-group "${spokeMgmtRgName}" \
        --subscription "${SUBSCRIPTION_ID}" \
    --query "tenantId" -o tsv)

az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "SpokeManagedIdentityClientId" \
    --value "${spokeManagedIdentityClientId}"

export MSYS_NO_PATHCONV=1

az role assignment create \
    --role "Owner" \
    --assignee "${spokeManagedIdentityClientId}" \
    --scope "/subscriptions/${spokeSubId}"

az keyvault set-policy \
    --name "${spokeKvName}" \
    --subscription "${spokeSubId}" \
    --object-id "${spokeManagedIdentityPrincipalId}" \
    --secret-permissions get list set delete recover backup restore \
    --certificate-permissions get list update create import delete recover backup restore \
    --key-permissions get list update create import delete recover backup restore decrypt encrypt verify sign

unset MSYS_NO_PATHCONV


then
    print_success "User Assigned Managed Identity Created" && sleep 2s
else
    print_error "Something went wrong making user-assigned managed identity." && clean_on_exit && exit 1
fi

#Create Keyvault secret for Local Admin in the Keyvault
if

spokeAdminSecret=$(openssl rand -base64 21) && \

    az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "Local${titleConvertedShorthandName}Admin${titleConvertedShorthandEnv}Pwd" \
    --value "${spokeAdminSecret}"

then
    print_success "Keyvault secret has been made for the Local Admin User" && sleep 2s
else
    print_error "Something has went wrong with creating the keyvault secret, check the logs." && clean_on_exit && exit 1

fi

#Create SSH Key for Linux boxes
if

mkdir -p "/tmp/${lowerConvertedShorthandName}-${lowerConvertedShorthandEnv}-ssh"
ssh-keygen -b 4096 -t rsa -f "/tmp/${lowerConvertedShorthandName}-${lowerConvertedShorthandEnv}-ssh/azureid_rsa.key" -q -N '' && \

    az sshkey create \
    --location "${LONGHAND_LOCATION}" \
    --public-key "@/tmp/${lowerConvertedShorthandName}-${lowerConvertedShorthandEnv}-ssh/azureid_rsa.key.pub" \
    --resource-group "${spokeMgmtRgName}" \
    --name "ssh-${lowerConvertedShorthandName}-${lowerConvertedShorthandLocation}-${lowerConvertedShorthandEnv}-pub-mgt" && \

    az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "Ssh${titleConvertedShorthandName}${titleConvertedShorthandLocation}${titleConvertedShorthandEnv}Key"  \
    --file "/tmp/${lowerConvertedShorthandName}-${lowerConvertedShorthandEnv}-ssh/azureid_rsa.key" && \

    rm -rf /tmp/${lowerConvertedShorthandName}-${lowerConvertedShorthandEnv}-ssh && echo "Keys created"

then
    print_success "SSH keys have been generated and stored appropriately" && sleep 2s


else
    print_error "Something has went wrong with creating the ssh keys check the logs." && clean_on_exit && exit 1

fi

#Create storage account for terraform, eliminate chicken and egg scenario
if

az storage account create \
    --location "${LONGHAND_LOCATION}" \
    --sku "Standard_LRS" \
    --access-tier "Hot" \
    --resource-group "${spokeMgmtRgName}" \
    --name "sa${lowerConvertedShorthandName}${lowerConvertedShorthandLocation}${lowerConvertedShorthandEnv}mgt01" && \

    az storage container create \
    --account-name "sa${lowerConvertedShorthandName}${lowerConvertedShorthandLocation}${lowerConvertedShorthandEnv}mgt01" \
    --public-access "off" \
    --resource-group "${spokeMgmtRgName}" \
    --name "blob${lowerConvertedShorthandName}${lowerConvertedShorthandLocation}${lowerConvertedShorthandEnv}tfm01"

spokeSaId=$(az storage account show \
        --name "sa${lowerConvertedShorthandName}${lowerConvertedShorthandLocation}${lowerConvertedShorthandEnv}mgt01" \
        --resource-group "${spokeMgmtRgName}" \
        --subscription "${SUBSCRIPTION_ID}" \
    --query "id" -o tsv)

spokeSaName=$(az storage account show \
        --name "sa${lowerConvertedShorthandName}${lowerConvertedShorthandLocation}${lowerConvertedShorthandEnv}mgt01" \
        --resource-group "${spokeMgmtRgName}" \
        --subscription "${SUBSCRIPTION_ID}" \
    --query "name" -o tsv)

spokeSaPrimaryKey=$(az storage account keys list \
        --resource-group "${spokeMgmtRgName}" \
        --account-name "${spokeSaName}" \
    --query "[0].value" -o tsv)

spokeSaSecondaryKey=$(az storage account keys list \
        --resource-group "${spokeMgmtRgName}" \
        --account-name "${spokeSaName}" \
    --query "[1].value" -o tsv)

az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "SpokeSaRgName" \
    --value "${spokeMgmtRgName}"

az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "SpokeSaName" \
    --value "${spokeSaName}"

az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "SpokeSaBlobContainerName" \
    --value "blob${lowerConvertedShorthandName}${lowerConvertedShorthandLocation}${lowerConvertedShorthandEnv}tfm01"

expiryDate=$(date --iso-8601 -d "+90 days")
az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "SpokeSaPrimaryKey" \
    --value "${spokeSaPrimaryKey}" \
    --expires "${expiryDate}"

az keyvault secret set \
    --vault-name "${spokeKvName}" \
    --name "SpokeSaSecondaryKey" \
    --value "${spokeSaSecondaryKey}"

then
    print_success "Storage account created" && sleep 2s


else
    print_error "Something has went wrong with creating the storage account  Error Code CLOUD05" && clean_on_exit && exit 1

fi

if

export MSYS_NO_PATHCONV=1

az role assignment create \
    --role "Storage Account Key Operator Service Role" \
    --assignee "https://vault.azure.net" \
    --scope "${spokeSaId}"

az keyvault set-policy \
    --name "${spokeKvName}" \
    --upn "${signedInUserUpn}" \
    --storage-permissions get list delete set update regeneratekey getsas listsas deletesas setsas recover backup restore purge

az keyvault set-policy \
    --name "${spokeKvName}" \
    --subscription "${spokeSubId}" \
    --object-id "${spokeSvpObjectId}" \
    --secret-permissions get list set delete recover backup restore purge \
    --certificate-permissions get list update create import delete recover backup restore purge \
    --key-permissions get list update create import delete recover backup restore decrypt encrypt verify sign purge

az keyvault storage add \
    --vault-name "${spokeKvName}" \
    -n "${spokeSaName}" \
    --active-key-name key1 \
    --auto-regenerate-key \
    --regeneration-period P90D \
    --resource-id "${spokeSaId}"

unset MSYS_NO_PATHCONV

then
    print_success "Storage account now being managed by keyvault" && sleep 2s

else

    print_error "Something has went wrong setting the storage account to be managed by keyvault  Error Code CLOUD06" && clean_on_exit && exit 1

fi

clean_on_exit
```