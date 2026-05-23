import { createClient } from 'redis'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.DASHBOARD_PORT || 3030

const redis = createClient({
  socket: {
    host: process.env.DATABASE_REDIS_HOST || 'localhost',
    port: Number(process.env.DATABASE_REDIS_PORT) || 6379,
  },
  username: process.env.DATABASE_REDIS_USER || 'default',
  password: process.env.DATABASE_REDIS_PASSWORD,
})

redis.on('error', (err) => console.error('[Redis] error:', err))
await redis.connect()
console.log('[Redis] connected')

// ── helpers ──────────────────────────────────────────────────────────────────

function parseKeyGroup(keyGroup) {
  const parts = keyGroup.split('#')
  return {
    module:     parts[0] ?? '-',
    layoutCode: parts[1] ?? '-',
    cnpj:       parts[2] ?? '-',
    year:       parts[3] ?? '-',
    month:      parts[4] ?? '-',
  }
}

async function getOverview() {
  const indexKeys = await redis.keys('*#ENTRY_DATA#PACKAGE#INDEX')
  let totalGroups = indexKeys.length
  let totalPackages = 0
  let totalEvents = 0

  const groups = []
  for (const indexKey of indexKeys) {
    const keyGroup = indexKey.replace('#ENTRY_DATA#PACKAGE#INDEX', '')
    const packageIds = await redis.sMembers(indexKey)
    totalPackages += packageIds.length

    let groupEvents = 0
    for (const pkgId of packageIds) {
      const pkgKey = `${keyGroup}#ENTRY_DATA#PACKAGE#${pkgId}`
      const count = await redis.hLen(pkgKey)
      groupEvents += count
    }
    totalEvents += groupEvents

    groups.push({
      keyGroup,
      ...parseKeyGroup(keyGroup),
      packages: packageIds.length,
      events: groupEvents,
    })
  }

  groups.sort((a, b) => a.keyGroup.localeCompare(b.keyGroup))

  return { totalGroups, totalPackages, totalEvents, groups }
}

async function getGroupPackages(keyGroup) {
  const indexKey = `${keyGroup}#ENTRY_DATA#PACKAGE#INDEX`
  const packageIds = await redis.sMembers(indexKey)
  packageIds.sort((a, b) => Number(a) - Number(b))

  const packages = []
  for (const pkgId of packageIds) {
    const pkgKey = `${keyGroup}#ENTRY_DATA#PACKAGE#${pkgId}`
    const count = await redis.hLen(pkgKey)
    packages.push({ packageId: pkgId, key: pkgKey, events: count })
  }

  return { keyGroup, ...parseKeyGroup(keyGroup), packages }
}

async function getPackageEvents(keyGroup, packageId) {
  const pkgKey = `${keyGroup}#ENTRY_DATA#PACKAGE#${packageId}`
  const raw = await redis.hGetAll(pkgKey)

  const events = []
  for (const [eventId, data] of Object.entries(raw)) {
    let parsed = null
    try { parsed = JSON.parse(data) } catch (_) { parsed = data }
    events.push({ eventId, data: parsed })
  }

  events.sort((a, b) => a.eventId.localeCompare(b.eventId))
  return { keyGroup, packageId, key: pkgKey, events }
}

async function clearAll() {
  const keys = await redis.keys('*#ENTRY_DATA#PACKAGE*')
  if (keys.length === 0) return { deleted: 0 }
  await redis.del(keys)
  return { deleted: keys.length }
}

// ── router ───────────────────────────────────────────────────────────────────

async function handleApi(req, res, url) {
  res.setHeader('Content-Type', 'application/json')

  try {
    if (url.pathname === '/api/overview') {
      return res.end(JSON.stringify(await getOverview()))
    }

    if (url.pathname === '/api/group') {
      const keyGroup = url.searchParams.get('keyGroup')
      if (!keyGroup) return res.end(JSON.stringify({ error: 'keyGroup required' }))
      return res.end(JSON.stringify(await getGroupPackages(keyGroup)))
    }

    if (url.pathname === '/api/package') {
      const keyGroup  = url.searchParams.get('keyGroup')
      const packageId = url.searchParams.get('packageId')
      if (!keyGroup || !packageId) return res.end(JSON.stringify({ error: 'keyGroup and packageId required' }))
      return res.end(JSON.stringify(await getPackageEvents(keyGroup, packageId)))
    }

    if (url.pathname === '/api/clear' && req.method === 'POST') {
      return res.end(JSON.stringify(await clearAll()))
    }

    res.statusCode = 404
    res.end(JSON.stringify({ error: 'not found' }))
  } catch (err) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: err.message }))
  }
}

function serveStatic(req, res, url) {
  let filePath = path.join(__dirname, 'public', url.pathname === '/' ? 'index.html' : url.pathname)
  const ext = path.extname(filePath)
  const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404
      return res.end('Not found')
    }
    res.setHeader('Content-Type', mime[ext] || 'text/plain')
    res.end(data)
  })
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url)
  serveStatic(req, res, url)
}).listen(PORT, () => console.log(`[Dashboard] http://localhost:${PORT}`))
