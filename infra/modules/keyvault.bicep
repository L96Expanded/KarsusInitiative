@description('Key Vault name (3-24 chars, globally unique)')
param vaultName string

@description('Azure region')
param location string

@description('Object ID of the identity that needs GET access to secrets')
param readerObjectId string = ''

@description('JWT signing secret')
@secure()
param jwtSecret string

@description('Cosmos DB primary connection string')
@secure()
param cosmosConnectionString string

@description('Azure Blob Storage connection string')
@secure()
param blobConnectionString string

// --- Key Vault ----------------------------------------------------------------
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name:     vaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name:   'standard'
    }
    tenantId:                    subscription().tenantId
    enableRbacAuthorization:     true
    enableSoftDelete:            true
    softDeleteRetentionInDays:   7
    enabledForTemplateDeployment: true
    publicNetworkAccess:         'Enabled'
  }
}

// --- Secrets ------------------------------------------------------------------
resource secretJwt 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name:   'JWT-SECRET'
  parent: keyVault
  properties: { value: jwtSecret }
}

resource secretCosmos 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name:   'COSMOS-CONNECTION-STRING'
  parent: keyVault
  properties: { value: cosmosConnectionString }
}

resource secretBlob 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name:   'BLOB-CONNECTION-STRING'
  parent: keyVault
  properties: { value: blobConnectionString }
}

// --- Optional RBAC: grant reader identity "Key Vault Secrets User" role -------
var kvSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(readerObjectId)) {
  name:  guid(keyVault.id, readerObjectId, kvSecretsUserRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', kvSecretsUserRoleId)
    principalId:      readerObjectId
    principalType:    'ServicePrincipal'
  }
}

// --- Outputs ------------------------------------------------------------------
output vaultName      string = keyVault.name
output vaultUri       string = keyVault.properties.vaultUri
output jwtSecretUri   string = secretJwt.properties.secretUri
output cosmosSecretUri string = secretCosmos.properties.secretUri
output blobSecretUri  string = secretBlob.properties.secretUri
