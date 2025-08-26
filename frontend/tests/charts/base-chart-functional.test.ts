import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'

describe('BaseChart Functionality', () => {
  it('should render BaseChart component', async () => {
    const { BaseChart } = await import('../../src/components/charts/BaseChart')
    
    const { container } = render(React.createElement(BaseChart))
    expect(container).toBeDefined()
  })
})