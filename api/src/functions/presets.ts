import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions'
import { v4 as uuidv4 } from 'uuid'
import { presetsContainer } from '../lib/cosmosdb'
import { authenticate } from '../lib/auth'
import type { Creature, Preset } from '../types'

function json(body: unknown, status = 200): HttpResponseInit {
  return { status, jsonBody: body }
}
function err(message: string, status = 400): HttpResponseInit {
  return { status, jsonBody: { message } }
}

function sortCreatures(creatures: Creature[]): Creature[] {
  return [...creatures].sort((a, b) => b.initiative - a.initiative)
}

// â”€â”€â”€ GET /api/presets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function listPresets(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const container  = await presetsContainer()
    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.userId = @uid ORDER BY c.createdAt DESC',
        parameters: [{ name: '@uid', value: userId }],
      })
      .fetchAll()
    return json(resources)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ POST /api/presets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function createPreset(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const body = (await req.json()) as { name?: string; description?: string; backgroundImageUrl?: string; creatures?: Partial<Creature>[] }
    if (!body.name) return err('name is required')

    const now = new Date().toISOString()
    const rawCreatures = (body.creatures ?? []).map((c) => ({
      id:                 uuidv4(),
      name:               c.name ?? 'Unknown',
      initiative:         c.initiative ?? 10,
      initiativeImageUrl: c.initiativeImageUrl,
      statuses:            c.statuses ?? (c.status ? [c.status] : ['alive']),
      currentHp:          c.currentHp,
      maxHp:              c.maxHp,
      armorClass:         c.armorClass,
      notes:              c.notes,
      isPlayer:           c.isPlayer ?? false,
    }))

    const preset: Preset = {
      id:                 uuidv4(),
      userId,
      name:               body.name,
      description:        body.description,
      backgroundImageUrl: body.backgroundImageUrl,
      creatures:          sortCreatures(rawCreatures as Creature[]),
      createdAt:          now,
      updatedAt:          now,
    }

    const container = await presetsContainer()
    await container.items.create(preset)
    return json(preset, 201)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ GET /api/presets/{id} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function getPreset(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const id         = req.params.id
    const container  = await presetsContainer()
    const { resource } = await container.item(id, userId).read()
    if (!resource || resource.userId !== userId) return err('Not found', 404)
    return json(resource)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ PUT /api/presets/{id} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function updatePreset(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const id         = req.params.id
    const body       = (await req.json()) as Partial<Preset>
    const container  = await presetsContainer()
    const { resource: existing } = await container.item(id, userId).read()
    if (!existing || existing.userId !== userId) return err('Not found', 404)

    const updated = {
      ...existing,
      name:               body.name               ?? existing.name,
      description:        body.description        ?? existing.description,
      backgroundImageUrl: body.backgroundImageUrl ?? existing.backgroundImageUrl,
      updatedAt:          new Date().toISOString(),
    }
    await container.item(id, userId).replace(updated)
    return json(updated)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ DELETE /api/presets/{id} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function deletePreset(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const id         = req.params.id
    const container  = await presetsContainer()
    const { resource } = await container.item(id, userId).read()
    if (!resource || resource.userId !== userId) return err('Not found', 404)
    await container.item(id, userId).delete()
    return { status: 204 }
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ POST /api/presets/{id}/creatures â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function addCreature(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const id         = req.params.id
    const body       = (await req.json()) as Partial<Creature>
    if (!body.name) return err('name is required')

    const container = await presetsContainer()
    const { resource: pre } = await container.item(id, userId).read()
    if (!pre || pre.userId !== userId) return err('Not found', 404)

    const creature: Creature = {
      id:                 uuidv4(),
      name:               body.name,
      initiative:         body.initiative ?? 10,
      initiativeImageUrl: body.initiativeImageUrl,
      statuses:           body.statuses ?? (body.status ? [body.status] : ['alive']),
      currentHp:          body.currentHp,
      maxHp:              body.maxHp,
      armorClass:         body.armorClass,
      notes:              body.notes,
      isPlayer:           body.isPlayer ?? false,
    }

    const updated = {
      ...pre,
      creatures: sortCreatures([...pre.creatures, creature]),
      updatedAt: new Date().toISOString(),
    }
    await container.item(id, userId).replace(updated)
    return json(updated)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ PUT /api/presets/{id}/creatures/{creatureId} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function updateCreature(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId }  = authenticate(req)
    const id          = req.params.id
    const creatureId  = req.params.creatureId
    const body        = (await req.json()) as Partial<Creature>

    const container = await presetsContainer()
    const { resource: pre } = await container.item(id, userId).read()
    if (!pre || pre.userId !== userId) return err('Not found', 404)

    const cIdx = pre.creatures.findIndex((c: Creature) => c.id === creatureId)
    if (cIdx === -1) return err('Creature not found', 404)

    pre.creatures[cIdx] = { ...pre.creatures[cIdx], ...body, id: creatureId }
    const updated = {
      ...pre,
      creatures: sortCreatures(pre.creatures),
      updatedAt: new Date().toISOString(),
    }
    await container.item(id, userId).replace(updated)
    return json(updated)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ DELETE /api/presets/{id}/creatures/{creatureId} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function deleteCreature(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const id         = req.params.id
    const creatureId = req.params.creatureId

    const container = await presetsContainer()
    const { resource: pre } = await container.item(id, userId).read()
    if (!pre || pre.userId !== userId) return err('Not found', 404)

    const before   = pre.creatures.length
    const creatures = pre.creatures.filter((c: Creature) => c.id !== creatureId)
    if (creatures.length === before) return err('Creature not found', 404)

    const updated = { ...pre, creatures: sortCreatures(creatures), updatedAt: new Date().toISOString() }
    await container.item(id, userId).replace(updated)
    return json(updated)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ Register â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.http('pre-list',            { methods: ['GET'],    route: 'presets',                              authLevel: 'anonymous', handler: listPresets })
app.http('pre-create',          { methods: ['POST'],   route: 'presets',                              authLevel: 'anonymous', handler: createPreset })
app.http('pre-get',             { methods: ['GET'],    route: 'presets/{id}',                         authLevel: 'anonymous', handler: getPreset })
app.http('pre-update',          { methods: ['PUT'],    route: 'presets/{id}',                         authLevel: 'anonymous', handler: updatePreset })
app.http('pre-delete',          { methods: ['DELETE'], route: 'presets/{id}',                         authLevel: 'anonymous', handler: deletePreset })
app.http('pre-creature-add',    { methods: ['POST'],   route: 'presets/{id}/creatures',               authLevel: 'anonymous', handler: addCreature })
app.http('pre-creature-update', { methods: ['PUT'],    route: 'presets/{id}/creatures/{creatureId}',  authLevel: 'anonymous', handler: updateCreature })
app.http('pre-creature-delete', { methods: ['DELETE'], route: 'presets/{id}/creatures/{creatureId}',  authLevel: 'anonymous', handler: deleteCreature })
