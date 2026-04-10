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
    const msg = String(e?.message || e)
    if (
      e?.name === 'TimeoutError' ||
      msg.includes('ResourceRequest timed out') ||
      msg.includes('could not be acquired within') ||
      msg.includes('timeout')
    ) {
      console.error(`
Database connection timed out. Typical causes:
  • The BTP/managed Postgres endpoint is not reachable from this network (RDS is often restricted to SAP BTP / allowlisted IPs, not your laptop).
  • Firewall or VPN blocks outbound traffic to host:port from default-env.json.
  • Wrong host/port or credentials.

What to try:
  • Run the seed on BTP (e.g. cf run-task / job) where the app has binding access, or add your public IP to the DB allowlist if your operator supports it.
  • From your machine, test: nc -vz <hostname> <port>  (or telnet) — it must connect.
  • Set credentials.connectionTimeoutMillis in default-env.json to fail faster with a clearer error from the driver.
`)
    }
    process.exit(1)
  })
