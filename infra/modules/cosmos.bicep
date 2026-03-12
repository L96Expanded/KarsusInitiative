@description('Cosmos DB account name')
param accountName string

@description('Database name')
param databaseName string

@description('Azure region')
param location string

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name:     accountName
  location: location
  kind:     'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName:     location
        failoverPriority: 0
        isZoneRedundant:  false
      }
    ]
    capabilities: [
      { name: 'EnableServerless' }
    ]
    enableFreeTier:       false
    publicNetworkAccess:  'Enabled'
  }
}

resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  name:   databaseName
  parent: cosmosAccount
  properties: {
    resource: { id: databaseName }
  }
}

var containers = [
  { name: 'users',      partitionKey: '/id'     }
  { name: 'encounters', partitionKey: '/userId' }
  { name: 'presets',    partitionKey: '/userId' }
]

@batchSize(1)
resource cosmosContainers 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = [for c in containers: {
  name:   c.name
  parent: cosmosDatabase
  properties: {
    resource: {
      id:           c.name
      partitionKey: {
        paths: [ c.partitionKey ]
        kind:  'Hash'
      }
      indexingPolicy: {
        automatic:    true
        indexingMode: 'consistent'
      }
    }
  }
}]

// --- Outputs ------------------------------------------------------------------
output accountName string = cosmosAccount.name
output accountId   string = cosmosAccount.id

@description('Primary read-write connection string (sensitive)')
output connectionString string = cosmosAccount.listConnectionStrings().connectionStrings[0].connectionString
