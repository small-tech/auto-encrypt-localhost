export function log(...args) {
  if (process.env.QUIET) {
    return
  }
  console.log(...args)
}

// Write to stdout without a newline
export function print(str) {
  if (process.env.QUIET) {
    return
  }
  process.stdout.write(str)
}
