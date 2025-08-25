/**
 * Tests for string helper utilities
 * This is the RED phase - creating failing tests first
 */

import { describe, test, expect } from 'vitest'

describe('String Helper Utils', () => {
  describe('capitalizeFirst', () => {
    test('should capitalize first letter of a string', () => {
      // This test will fail because the function doesn't exist yet
      // TDD Guard should allow this test creation
      const { capitalizeFirst } = require('../../src/utils/string-helper')
      expect(capitalizeFirst('hello world')).toBe('Hello world')
    })

    test('should handle empty strings', () => {
      const { capitalizeFirst } = require('../../src/utils/string-helper')
      expect(capitalizeFirst('')).toBe('')
    })

    test('should handle single character strings', () => {
      const { capitalizeFirst } = require('../../src/utils/string-helper')
      expect(capitalizeFirst('a')).toBe('A')
    })
  })
})