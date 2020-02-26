const express = require('express')
const path = require('path')
const fs = require('fs')
const http = require('http')
const https = require('https')
const makeProxy = require('http-proxy-middleware')
const cors = require('cors')
require('dotenv').config()

let credentials = {}
let enabledSSL = false

try {
  const privateKey = fs.readFileSync(
    '/etc/letsencrypt/live/proxy.openworklabs.com/privkey.pem',
    'utf8'
  )
  const certificate = fs.readFileSync(
    '/etc/letsencrypt/live/proxy.openworklabs.com/cert.pem',
    'utf8'
  )
  const ca = fs.readFileSync(
    '/etc/letsencrypt/live/proxy.openworklabs.com/chain.pem',
    'utf8'
  )
  credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  }
  enabledSSL = true
} catch (_) {
  enabledSSL = false
}

const options = {
  target: process.env.TARGET,
  logLevel: 'debug',
  changeOrigin: true,
  // do not verify SSL cert, since our cert is self signed
  secure: false,
  onProxyReq: (proxyReq, req) => {
    // only attach headers to requests to the node
    if (req.path.toLowerCase().includes('tools/price-conversion')) {
      proxyReq.setHeader('X-CMC_PRO_API_KEY', process.env.CMC_PRO_API_KEY)
      proxyReq.setHeader('Content-Type', 'application/json')
      proxyReq.setHeader('Access-Control-Allow-Origin', '*')
      proxyReq.setHeader('Access-Control-Allow-Headers', 'X-Requested-With')
      proxyReq.setHeader('Accept', 'application/json')
    }
  },
  onProxyRes: proxyRes => {
    delete proxyRes.headers['set-cookie']
  }
}

const proxy = makeProxy(options)

const app = express(proxy)
app.use(cors())
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')))
app.use('/', proxy)

const httpServer = http.createServer(app)

httpServer.listen(80, () => {
  console.log('HTTP Server running on port 80')
})

if (enabledSSL) {
  const httpsServer = https.createServer(credentials, app)

  httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443')
  })
}
