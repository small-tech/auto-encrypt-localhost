// Create an https server using locally-trusted certificates.

const https = require('https')
const autoEncryptLocalhost = require('../index')

const server = https.createServer(autoEncryptLocalhost(), (request, response) => {
  response.end('Hello, world!')
})

server.listen(() => {
  console.log('Web server is running at https://localhost')
})
