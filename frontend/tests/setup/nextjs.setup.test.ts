/**
 * TDD Tests for Next.js 13+ with TypeScript Setup
 * 
 * Starting with a single failing test to establish proper TDD discipline
 * RED Phase: This test will fail as no next.config.js exists yet
 */

import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Next.js 13+ Application Setup', () => {
  const frontendRoot = path.resolve(__dirname, '../../');
  
  describe('Configuration Files', () => {
    test('should have valid next.config.js with TypeScript support', () => {
      const configPath = path.join(frontendRoot, 'next.config.js');
      expect(fs.existsSync(configPath)).toBe(true);
      
      // This will fail initially - no next.config.js exists yet
      const config = require(configPath);
      expect(config).toBeDefined();
      expect(config.typescript).toBeDefined();
      expect(config.typescript.ignoreBuildErrors).toBe(false);
    });
  });
});