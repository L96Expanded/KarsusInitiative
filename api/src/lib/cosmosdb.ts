import { CosmosClient, type Container } from '@azure/cosmos'

const databaseName = process.env.COSMOS_DATABASE_NAME ?? 'dndtracker'

let _client: CosmosClient | null = null
let _db: ReturnType<CosmosClient['database']> | null = null

function getClient() {
  if (!_client) {
    const connectionString = process.env.COSMOS_CONNECTION_STRING
    if (!connectionString) throw new Error('COSMOS_CONNECTION_STRING is required')
    _client = new CosmosClient(connectionString)
  }
  return _client
}

function db() {
  if (!_db) _db = getClient().database(databaseName)
  return _db
}

// Container accessors (lazy â€“ created on first use)
async function getContainer(containerId: string, partitionKey: string): Promise<Container> {
  const { container } = await db().containers.createIfNotExists({
    id: containerId,
    partitionKey: { paths: [partitionKey] },
  })
  return container
}

export async function usersContainer()     { return getContainer('users',     '/id') }
export async function encountersContainer(){ return getContainer('encounters', '/userId') }
export async function presetsContainer()   { return getContainer('presets',   '/userId') }
