@description('Storage account name (must be globally unique, 3-24 lowercase alphanumeric)')
param accountName string

@description('Name of the blob container for images')
param containerName string

@description('Azure region')
param location string

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name:     accountName
  location: location
  kind:     'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    accessTier:               'Hot'
    allowBlobPublicAccess:    true
    minimumTlsVersion:        'TLS1_2'
    supportsHttpsTrafficOnly: true
    publicNetworkAccess:      'Enabled'
    allowSharedKeyAccess:     true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  name:   'default'
  parent: storageAccount
}

resource imagesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name:   containerName
  parent: blobService
  properties: {
    publicAccess: 'Blob'
  }
}

// --- Outputs ------------------------------------------------------------------
output accountName string = storageAccount.name
output accountId   string = storageAccount.id

@description('Primary blob storage connection string (sensitive)')
@secure()
output connectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
