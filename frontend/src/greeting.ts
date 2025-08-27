export function greeting() {
  return 'Hello, TDD!'
}

// CommonJS export for require() compatibility in test
module.exports = { greeting };