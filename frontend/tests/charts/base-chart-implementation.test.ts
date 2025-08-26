import { describe, it, expect } from 'vitest'

describe('BaseChart Implementation', () => {
  it('should import BaseChart component successfully', async () => {
    const { BaseChart } = await import('../../src/components/charts/BaseChart')
    expect(BaseChart).toBeDefined()
  })
})