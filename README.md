# Karsus Initiative - D&D Initiative Tracker

## Project Overview
Full-stack D&D initiative tracker web application deployed on Azure Static Web Apps with Azure Functions API, Cosmos DB, and Blob Storage.

**Live URL**: https://karsusinitiative.com

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **API**: Azure Functions v4 (Node.js/TypeScript)
- **Database**: Azure Cosmos DB (NoSQL)
- **Storage**: Azure Blob Storage (images)
- **Auth**: JWT (RS256)
- **Hosting**: Azure Static Web Apps
- **IaC**: Bicep + Azure Developer CLI (azd)

## Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [Azure Developer CLI (azd)](https://aka.ms/azd-install)
- [Azure Functions Core Tools v4](https://docs.microsoft.com/azure/azure-functions/functions-run-local)
- An Azure subscription

## Local Development

### 1. Install dependencies
```bash
npm install
cd api && npm install && cd ..
```

### 2. Configure local API settings
```bash
cp api/local.settings.example.json api/local.settings.json
```
Fill in your Cosmos DB connection string, Blob Storage connection string, and JWT secret in `api/local.settings.json`.

### 3. Start the API (Azure Functions)
```bash
cd api && npm run start
```

### 4. Start the frontend (Vite dev server)
```bash
npm run dev
```

The frontend dev server proxies `/api/*` to `http://localhost:7071`.

## Deploy to Azure

### First-time setup
```bash
# Login
azd auth login

# Provision infrastructure + deploy
azd up
```

This will:
1. Create a Resource Group
2. Deploy Azure Static Web Apps (with integrated Functions)
3. Deploy Azure Cosmos DB
4. Deploy Azure Blob Storage
5. Deploy Azure Key Vault
6. Set all required app settings
7. Build and deploy the frontend + API

### Subsequent deploys
```bash
azd deploy
```

## Custom Domain (karsusinitiative.com)
After deploying, configure the custom domain in the Azure Portal:
1. Navigate to your Static Web App resource
2. Go to **Custom domains** → **Add**
3. Follow the CNAME verification process with your DNS provider
4. Point `karsusinitiative.com` CNAME to the generated `*.azurestaticapps.net` URL

## Project Structure
```
.
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/              # Route pages
│   ├── contexts/           # React contexts (auth, etc.)
│   ├── hooks/              # Custom hooks
│   ├── api/                # API client functions
│   └── types/              # TypeScript types
├── api/                    # Azure Functions API
│   └── src/
│       ├── functions/      # Individual function endpoints
│       └── lib/            # Shared utilities (DB, auth, storage)
├── infra/                  # Bicep IaC templates
│   └── modules/            # Reusable Bicep modules
├── public/                 # Static assets
├── azure.yaml              # Azure Developer CLI config
├── staticwebapp.config.json # SWA routing & headers
└── vite.config.ts          # Vite build config
```

## Environment Variables

### API (Azure Functions)
| Variable | Description |
|---|---|
| `COSMOS_CONNECTION_STRING` | Azure Cosmos DB connection string |
| `COSMOS_DATABASE_NAME` | Cosmos DB database name (default: `dndtracker`) |
| `BLOB_CONNECTION_STRING` | Azure Blob Storage connection string |
| `BLOB_CONTAINER_NAME` | Blob container name (default: `images`) |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | Token expiry (default: `7d`) |

## Data Model

### User
- `id`, `email`, `passwordHash`, `username`, `createdAt`

### Encounter
- `id`, `userId`, `title`, `description`, `backgroundImageUrl`
- `creatures[]`, `currentTurn`, `currentRound`, `createdAt`, `updatedAt`

### Preset
- `id`, `userId`, `name`, `description`, `backgroundImageUrl`
- `creatures[]`, `createdAt`, `updatedAt`

### Creature (embedded)
- `id`, `name`, `initiative`, `initiativeImageUrl`, `status`
- `currentHp`, `maxHp`, `notes`
