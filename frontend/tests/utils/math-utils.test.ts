/**
 * Tests for math utility functions
 * Following proper TDD - tests first, then implementation
 */

import { describe, test, expect } from 'vitest'

describe('Math Utils', () => {
  describe('add', () => {
    test('should add two positive numbers', () => {
      const { add } = require('../../src/utils/math-utils')
      expect(add(2, 3)).toBe(5)
    })

    test('should handle negative numbers', () => {
      const { add } = require('../../src/utils/math-utils')
      expect(add(-2, 3)).toBe(1)
      expect(add(-2, -3)).toBe(-5)
    })

    test('should handle zero', () => {
      const { add } = require('../../src/utils/math-utils')
      expect(add(0, 5)).toBe(5)
      expect(add(5, 0)).toBe(5)
    })
  })

  describe('divide', () => {
    test('should divide two numbers correctly', () => {
      const { divide } = require('../../src/utils/math-utils')
      expect(divide(10, 2)).toBe(5)
    })

    test('should throw error for division by zero', () => {
      const { divide } = require('../../src/utils/math-utils')
      expect(() => divide(10, 0)).toThrow('Division by zero')
    })

    test('should handle negative numbers', () => {
      const { divide } = require('../../src/utils/math-utils')
      expect(divide(-10, 2)).toBe(-5)
      expect(divide(10, -2)).toBe(-5)
    })
  })
})