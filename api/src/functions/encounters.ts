import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions'
import { v4 as uuidv4 } from 'uuid'
import { encountersContainer, presetsContainer } from '../lib/cosmosdb'
import { authenticate } from '../lib/auth'
import type { Creature, Encounter } from '../types'

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function json(body: unknown, status = 200): HttpResponseInit {
  return { status, jsonBody: body }
}
function err(message: string, status = 400): HttpResponseInit {
  return { status, jsonBody: { message } }
}

// Only allow https URLs pointing to our own Azure Blob Storage (prevents open-redirect / SSRF)
const BLOB_URL_RE = /^https:\/\/[a-z0-9]+\.blob\.core\.windows\.net\//i
function validateImageUrl(url: string | undefined): string | undefined {
  if (url === undefined || url === null || url === '') return undefined
  if (!BLOB_URL_RE.test(url)) throw Object.assign(new Error('Invalid image URL'), { status: 400 })
  return url
}

function sortCreatures(creatures: Creature[]): Creature[] {
  return [...creatures].sort((a, b) => b.initiative - a.initiative)
}

function advanceTurn(enc: Encounter, direction: 'next' | 'prev'): Pick<Encounter, 'currentTurn' | 'currentRound'> {
  const total = enc.creatures.length
  if (total === 0) return { currentTurn: 0, currentRound: enc.currentRound }

  if (direction === 'next') {
    const next = enc.currentTurn + 1
    if (next >= total) {
      return { currentTurn: 0, currentRound: enc.currentRound + 1 }
    }
    return { currentTurn: next, currentRound: enc.currentRound }
  } else {
    const prev = enc.currentTurn - 1
    if (prev < 0) {
      return {
        currentTurn: total - 1,
        currentRound: Math.max(1, enc.currentRound - 1),
      }
    }
    return { currentTurn: prev, currentRound: enc.currentRound }
  }
}

// â”€â”€â”€ GET /api/encounters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function listEncounters(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const container  = await encountersContainer()
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

// â”€â”€â”€ POST /api/encounters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function createEncounter(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const body = (await req.json()) as {
      title?: string; description?: string; backgroundImageUrl?: string; creatures?: Partial<Creature>[]
    }
    if (!body.title) return err('title is required')

    const now = new Date().toISOString()
    const rawCreatures = (body.creatures ?? []).map((c) => ({
      id:                  uuidv4(),
      name:                c.name ?? 'Unknown',
      initiative:          c.initiative ?? 10,
      initiativeImageUrl:  c.initiativeImageUrl,
      status:              c.status ?? 'alive',
      currentHp:           c.currentHp,
      maxHp:               c.maxHp,
      armorClass:          c.armorClass,
      notes:               c.notes,
      isPlayer:            c.isPlayer ?? false,
    }))

    const encounter: Encounter = {
      id:                 uuidv4(),
      userId,
      title:              body.title,
      description:        body.description,
      backgroundImageUrl: validateImageUrl(body.backgroundImageUrl),
      creatures:          sortCreatures(rawCreatures as Creature[]),
      currentTurn:        0,
      currentRound:       1,
      isActive:           true,
      createdAt:          now,
      updatedAt:          now,
    }

    const container = await encountersContainer()
    await container.items.create(encounter)
    return json(encounter, 201)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ POST /api/encounters/from-preset/{presetId} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function createFromPreset(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const presetId   = req.params.presetId
    if (!presetId) return err('presetId is required')

    const preContainer = await presetsContainer()
    const { resources } = await preContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.id = @id AND c.userId = @uid',
        parameters: [{ name: '@id', value: presetId }, { name: '@uid', value: userId }],
      })
      .fetchAll()
    if (!resources[0]) return err('Preset not found', 404)

    const preset = resources[0]
    const now    = new Date().toISOString()

    const creatures: Creature[] = preset.creatures.map((c: Creature) => ({
      ...c,
      id:        uuidv4(),
      currentHp: c.maxHp,  // Reset HP to max when launching
    }))

    const encounter: Encounter = {
      id:                 uuidv4(),
      userId,
      title:              preset.name,
      description:        preset.description,
      backgroundImageUrl: preset.backgroundImageUrl,
      creatures:          sortCreatures(creatures),
      currentTurn:        0,
      currentRound:       1,
      isActive:           true,
      createdAt:          now,
      updatedAt:          now,
    }

    const encContainer = await encountersContainer()
    await encContainer.items.create(encounter)
    return json(encounter, 201)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ GET /api/encounters/{id} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function getEncounter(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const id         = req.params.id
    const container  = await encountersContainer()
    const { resource } = await container.item(id, userId).read()
    if (!resource || resource.userId !== userId) return err('Not found', 404)
    return json(resource)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ PUT /api/encounters/{id} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function updateEncounter(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const id         = req.params.id
    const body       = (await req.json()) as Partial<Encounter>
    const container  = await encountersContainer()

    const { resource: existing } = await container.item(id, userId).read()
    if (!existing || existing.userId !== userId) return err('Not found', 404)

    const updated = {
      ...existing,
      title:              body.title              ?? existing.title,
      description:        body.description        ?? existing.description,
      backgroundImageUrl: validateImageUrl(body.backgroundImageUrl) ?? existing.backgroundImageUrl,
      updatedAt:          new Date().toISOString(),
    }
    await container.item(id, userId).replace(updated)
    return json(updated)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ DELETE /api/encounters/{id} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function deleteEncounter(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const id         = req.params.id
    const container  = await encountersContainer()
    const { resource } = await container.item(id, userId).read()
    if (!resource || resource.userId !== userId) return err('Not found', 404)
    await container.item(id, userId).delete()
    return { status: 204 }
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ POST /api/encounters/{id}/creatures â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function addCreature(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const id         = req.params.id
    const body       = (await req.json()) as Partial<Creature>
    if (!body.name) return err('name is required')

    const container = await encountersContainer()
    const { resource: enc } = await container.item(id, userId).read()
    if (!enc || enc.userId !== userId) return err('Not found', 404)

    const creature: Creature = {
      id:                 uuidv4(),
      name:               body.name,
      initiative:         body.initiative ?? 10,
      initiativeImageUrl: body.initiativeImageUrl,
      status:             body.status ?? 'alive',
      currentHp:          body.currentHp,
      maxHp:              body.maxHp,
      armorClass:         body.armorClass,
      notes:              body.notes,
      isPlayer:           body.isPlayer ?? false,
    }

    const updated = {
      ...enc,
      creatures: sortCreatures([...enc.creatures, creature]),
      updatedAt: new Date().toISOString(),
    }
    await container.item(id, userId).replace(updated)
    return json(updated)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ PUT /api/encounters/{id}/creatures/{creatureId} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function updateCreature(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId }   = authenticate(req)
    const id           = req.params.id
    const creatureId   = req.params.creatureId
    const body         = (await req.json()) as Partial<Creature>

    const container = await encountersContainer()
    const { resource: enc } = await container.item(id, userId).read()
    if (!enc || enc.userId !== userId) return err('Not found', 404)

    const cIdx = enc.creatures.findIndex((c: Creature) => c.id === creatureId)
    if (cIdx === -1) return err('Creature not found', 404)

    enc.creatures[cIdx] = { ...enc.creatures[cIdx], ...body, id: creatureId }
    const updated = {
      ...enc,
      creatures: sortCreatures(enc.creatures),
      updatedAt: new Date().toISOString(),
    }
    await container.item(id, userId).replace(updated)
    return json(updated)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ DELETE /api/encounters/{id}/creatures/{creatureId} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function deleteCreature(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId }  = authenticate(req)
    const id          = req.params.id
    const creatureId  = req.params.creatureId

    const container = await encountersContainer()
    const { resource: enc } = await container.item(id, userId).read()
    if (!enc || enc.userId !== userId) return err('Not found', 404)

    const before = enc.creatures.length
    let   newTurn = enc.currentTurn
    const creatures = enc.creatures.filter((c: Creature, i: number) => {
      if (c.id !== creatureId) return true
      // If removing the creature at or before currentTurn, shift turn back
      if (i <= enc.currentTurn && newTurn > 0) newTurn--
      return false
    })
    if (creatures.length === before) return err('Creature not found', 404)

    const updated = {
      ...enc,
      creatures: sortCreatures(creatures),
      currentTurn: Math.min(newTurn, Math.max(0, creatures.length - 1)),
      updatedAt: new Date().toISOString(),
    }
    await container.item(id, userId).replace(updated)
    return json(updated)
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ PUT /api/encounters/{id}/turn/next â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function nextTurn(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const id         = req.params.id
    const container  = await encountersContainer()
    const { resource: enc } = await container.item(id, userId).read()
    if (!enc || enc.userId !== userId) return err('Not found', 404)

    const turn = advanceTurn(enc, 'next')
    const updated = { ...enc, ...turn, updatedAt: new Date().toISOString() }
    await container.item(id, userId).replace(updated)
    return json({ currentTurn: updated.currentTurn, currentRound: updated.currentRound, creatures: updated.creatures })
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ PUT /api/encounters/{id}/turn/prev â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function prevTurn(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const { userId } = authenticate(req)
    const id         = req.params.id
    const container  = await encountersContainer()
    const { resource: enc } = await container.item(id, userId).read()
    if (!enc || enc.userId !== userId) return err('Not found', 404)

    const turn = advanceTurn(enc, 'prev')
    const updated = { ...enc, ...turn, updatedAt: new Date().toISOString() }
    await container.item(id, userId).replace(updated)
    return json({ currentTurn: updated.currentTurn, currentRound: updated.currentRound, creatures: updated.creatures })
  } catch (e: unknown) {
    return err((e instanceof Error ? e.message : 'Error'), (e as { status?: number }).status ?? 500)
  }
}

// â”€â”€â”€ Register functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.http('enc-list',           { methods: ['GET'],    route: 'encounters',                                    authLevel: 'anonymous', handler: listEncounters })
app.http('enc-create',         { methods: ['POST'],   route: 'encounters',                                    authLevel: 'anonymous', handler: createEncounter })
app.http('enc-from-preset',    { methods: ['POST'],   route: 'encounters/from-preset/{presetId}',             authLevel: 'anonymous', handler: createFromPreset })
app.http('enc-get',            { methods: ['GET'],    route: 'encounters/{id}',                               authLevel: 'anonymous', handler: getEncounter })
app.http('enc-update',         { methods: ['PUT'],    route: 'encounters/{id}',                               authLevel: 'anonymous', handler: updateEncounter })
app.http('enc-delete',         { methods: ['DELETE'], route: 'encounters/{id}',                               authLevel: 'anonymous', handler: deleteEncounter })
app.http('enc-creature-add',   { methods: ['POST'],   route: 'encounters/{id}/creatures',                     authLevel: 'anonymous', handler: addCreature })
app.http('enc-creature-update',{ methods: ['PUT'],    route: 'encounters/{id}/creatures/{creatureId}',        authLevel: 'anonymous', handler: updateCreature })
app.http('enc-creature-delete',{ methods: ['DELETE'], route: 'encounters/{id}/creatures/{creatureId}',        authLevel: 'anonymous', handler: deleteCreature })
app.http('enc-turn-next',      { methods: ['PUT'],    route: 'encounters/{id}/turn/next',                     authLevel: 'anonymous', handler: nextTurn })
app.http('enc-turn-prev',      { methods: ['PUT'],    route: 'encounters/{id}/turn/prev',                     authLevel: 'anonymous', handler: prevTurn })
