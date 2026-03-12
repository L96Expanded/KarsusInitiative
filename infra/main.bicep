targetScope = 'resourceGroup'

@description('Environment name (dev, prod)')
param environmentName string = 'prod'

@description('Azure region for most resources')
param location string = resourceGroup().location

@description('Azure region for Static Web App (must be one of: westus2, centralus, eastus2, westeurope, eastasia)')
param staticWebAppLocation string = 'eastus2'

@description('JWT secret - min 32 chars, store in Key Vault')
@secure()
param jwtSecret string

// --- Unique suffix from resource group ----------------------------------------
var suffix = take(uniqueString(resourceGroup().id), 8)
var prefix = 'karsus-${environmentName}'

// --- Modules ------------------------------------------------------------------
module cosmos 'modules/cosmos.bicep' = {
  name: 'cosmos'
  params: {
    accountName:  '${prefix}-cosmos-${suffix}'
    databaseName: 'dndtracker'
    location:     location
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    accountName:   'karsus${suffix}'
    containerName: 'images'
    location:      location
  }
}

module keyVault 'modules/keyvault.bicep' = {
  name: 'keyvault'
  params: {
    vaultName:              '${prefix}-kv-${suffix}'
    location:               location
    jwtSecret:              jwtSecret
    cosmosConnectionString: cosmos.outputs.connectionString
    blobConnectionString:   storage.outputs.connectionString
  }
}

module pubsub 'modules/pubsub.bicep' = {
  name: 'pubsub'
  params: {
    serviceName: '${prefix}-pubsub-${suffix}'
    location:    location
  }
}

module staticWebApp 'modules/staticwebapp.bicep' = {
  name: 'staticwebapp'
  params: {
    appName:                  '${prefix}-swa-${suffix}'
    location:                 staticWebAppLocation
    cosmosConnectionString:   cosmos.outputs.connectionString
    blobConnectionString:     storage.outputs.connectionString
    jwtSecret:                jwtSecret
    cosmosDatabaseName:       'dndtracker'
    blobContainerName:        'images'
    pubsubConnectionString:   pubsub.outputs.connectionString
  }
}

// --- Outputs ------------------------------------------------------------------
output storageAccountName   string = storage.outputs.accountName
output cosmosAccountName    string = cosmos.outputs.accountName
output staticWebAppName     string = staticWebApp.outputs.appName
output staticWebAppHostname string = staticWebApp.outputs.hostname
output staticWebAppUrl      string = staticWebApp.outputs.url
output pubsubEndpoint       string = pubsub.outputs.endpoint
