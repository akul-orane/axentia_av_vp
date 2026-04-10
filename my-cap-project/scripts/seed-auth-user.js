#!/usr/bin/env node
/**
 * One-time: insert default user (bcrypt hashed). Requires DB reachable (default-env.json).
 * Usage: SEED_USER=admin SEED_PASSWORD='YourPass' node scripts/seed-auth-user.js
 */
const cds = require('@sap/cds')
const bcrypt = require('bcryptjs')
const { SELECT, INSERT, UPDATE } = cds.ql

async function run() {
  cds.model = await cds.load('*')
  await cds.connect.to('db')
  const { AuthUser } = cds.db.entities
  const username = process.env.SEED_USER || 'admin'
  const plain = process.env.SEED_PASSWORD || 'changeme'
  const passwordHash = bcrypt.hashSync(plain, 10)
  const existing = await SELECT.one.from(AuthUser).where({ username })
  if (existing) {
    await UPDATE(AuthUser).set({ passwordHash, role: 'admin', active: true }).where({ username })
    console.log('Updated user:', username)
  } else {
    await INSERT.into(AuthUser).entries({
      username,
      passwordHash,
      role: 'admin',
      active: true,
    })
    console.log('Inserted user:', username, '(change password in production)')
  }
}

run()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
