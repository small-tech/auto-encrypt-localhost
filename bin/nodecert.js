#!/usr/bin/env node

//
// Usage: nodecert [domain1] [domain2] […]
//
// If additional domains are provided – e.g., for staging with ngrok (https://ngrok.com/) –
// they are added to the certificate alongside localhost, 127.0.0.1, and ::1.

const additionalDomainsIfAny = process.argv.splice(2)

require('../index.js').apply(null, [{domains: additionalDomainsIfAny}])
