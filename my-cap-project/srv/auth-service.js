const cds = require('@sap/cds')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = cds.service.impl(async function () {
  const { AuthUser } = cds.db.entities

  this.on('login', async req => {
    const { username, password } = req.data || {}
    if (!username?.trim() || !password) {
      return req.reject(400, 'username and password are required')
    }
    const name = username.trim()
    const row = await SELECT.one.from(AuthUser).where({ username: name, active: true })
    if (!row) {
      return req.reject(401, 'invalid credentials')
    }
    const match = await bcrypt.compare(password, row.passwordHash)
    if (!match) {
      return req.reject(401, 'invalid credentials')
    }
    const lastLogin = new Date()
    await UPDATE(AuthUser).set({ lastLogin }).where({ username: name })
    const secret = process.env.JWT_SECRET || 'dev-only-set-JWT_SECRET'
    const token = jwt.sign(
      { sub: name, role: row.role },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    )
    return {
      authenticated: true,
      username: name,
      role: row.role,
      token,
      message: 'ok',
    }
  })
})
