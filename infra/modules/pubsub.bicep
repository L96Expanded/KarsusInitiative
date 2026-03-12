@description('Azure Web PubSub service name')
param serviceName string

@description('Azure region')
param location string

// -- Azure Web PubSub ---------------------------------------------------------
// Free_F1: 20 concurrent connections, 20K messages/day — sufficient for personal use.
// Upgrade to Standard_S1 if you need more capacity.
resource webPubSub 'Microsoft.SignalRService/webPubSub@2023-02-01' = {
  name:     serviceName
  location: location
  sku: {
    name:     'Free_F1'
    tier:     'Free'
    capacity: 1
  }
  properties: {
    disableLocalAuth: false
  }
}

// -- Outputs ------------------------------------------------------------------
@secure()
output connectionString string = webPubSub.listKeys().primaryConnectionString
output endpoint         string = 'https://${webPubSub.properties.hostName}'
