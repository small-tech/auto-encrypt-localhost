const nodecert = require('.')
const test = require('tape')
const fs = require('fs')
const path = require('path')
const os = require('os')

// Courtesy: https://gist.github.com/liangzan/807712#gistcomment-337828
function rmRFSync (dirPath) {
  try { var files = fs.readdirSync(dirPath) }
  catch(e) { return }
  if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i]
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath)
      else
        rmRFSync(filePath)
    }
  fs.rmdirSync(dirPath)
}

test('certificate creation', t => {
  t.plan(5)

  const nodecertDirectory = path.join(os.homedir(), '.nodecert')
  if (fs.existsSync(nodecertDirectory)) {
    // Clear the .nodecert directory if it already exists.
    rmRFSync(nodecertDirectory)
  }

  // Run nodecert.
  nodecert()

  t.ok(fs.existsSync(path.join(nodecertDirectory)), 'Main nodecert directory exists')
  t.ok(fs.existsSync(path.join(nodecertDirectory, 'rootCA.pem')), 'Local certificate authority exists')
  t.ok(fs.existsSync(path.join(nodecertDirectory, 'rootCA-key.pem')), 'Local certificate authority private key exists')
  t.ok(fs.existsSync(path.join(nodecertDirectory, 'localhost.pem')), 'Local certificate exists')
  t.ok(fs.existsSync(path.join(nodecertDirectory, 'localhost-key.pem')), 'Local certificate private key exists')

  t.end()
})
