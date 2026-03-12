@description('Static Web App name')
param appName string

@description('Azure region (SWA is available in a limited set; eastus2 or centralus are reliable)')
param location string

@secure()
param cosmosConnectionString string

@secure()
param blobConnectionString string

@secure()
param jwtSecret string

@secure()
param pubsubConnectionString string

param cosmosDatabaseName string
param blobContainerName  string

// --- Static Web App -----------------------------------------------------------
resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name:     appName
  location: location
  tags: {
    'azd-service-name': 'web'
  }
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    buildProperties: {
      appLocation:                        '/'
      outputLocation:                     'dist'
      apiLocation:                        'api'
      skipGithubActionWorkflowGeneration: false
    }
  }
}

// --- Application settings for the integrated Functions API --------------------
resource appSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  name:   'appsettings'
  parent: staticWebApp
  properties: {
    COSMOS_CONNECTION_STRING:  cosmosConnectionString
    COSMOS_DATABASE_NAME:      cosmosDatabaseName
    BLOB_CONNECTION_STRING:    blobConnectionString
    BLOB_CONTAINER_NAME:       blobContainerName
    JWT_SECRET:                jwtSecret
    JWT_EXPIRES_IN:            '7d'
    PUBSUB_CONNECTION_STRING:  pubsubConnectionString
  }
}

// --- Outputs ------------------------------------------------------------------
output appName        string = staticWebApp.name
output hostname       string = staticWebApp.properties.defaultHostname
output url            string = 'https://${staticWebApp.properties.defaultHostname}'
output staticWebAppId string = staticWebApp.id
