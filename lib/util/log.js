function log(...args) {
  if (process.env.QUIET) {
    return
  }
  console.log(...args)
}

// Write to stdout without a newline
function print(str) {
  if (process.env.QUIET) {
    return
  }
  process.stdout.write(str)
}

module.exports = {
  log,
  print
}
