/**
 * Test to verify TDD Guard blocks implementation without failing test
 */

import { describe, test, expect } from 'vitest'

describe('TDD Guard Blocking Test', () => {
  test('should have a greeting function', () => {
    // This test will fail because the function doesn't exist yet
    // TDD Guard should allow implementation only after this test fails
    const { greeting } = require('../src/greeting')
    expect(greeting()).toBe('Hello, TDD!')
  })
})