// Create an https server using locally-trusted certificates.

import AutoEncryptLocalhost from '../index.js'

const server = AutoEncryptLocalhost.https.createServer((request, response) => {
  response.end('Hello, world!')
})

server.listen(443, () => {
  console.log('\n   🎉    ❨Example❩ Web server is running at https://localhost\n')
})
