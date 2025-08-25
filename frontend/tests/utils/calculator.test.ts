import { describe, it, expect } from 'vitest';

// Test for a calculator module that doesn't exist yet
describe('Calculator', () => {
  it('should add two numbers', () => {
    const { add } = require('../../src/utils/calculator');
    expect(add(2, 3)).toBe(5);
  });
});