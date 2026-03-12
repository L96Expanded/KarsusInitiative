@description('Azure Web PubSub service name')

























output endpoint         string = 'https://${webPubSub.properties.externalIP}'output connectionString string = webPubSub.listKeys().primaryConnectionString// ── Outputs ──────────────────────────────────────────────────────────────────}  }    disableLocalAuth: false  properties: {  }    capacity: 1    tier:     'Free'    name:     'Free_F1'  sku: {  location: location  name:     serviceNameresource webPubSub 'Microsoft.SignalRService/webPubSub@2023-02-01' = {// Upgrade to Standard_S1 if you need more capacity.// Free_F1: 20 concurrent connections, 20K messages/day — sufficient for personal use.// ── Azure Web PubSub ─────────────────────────────────────────────────────────param location string@description('Azure region')param serviceName string
