/**
 * Mock Loading Simulator
 * 
 * Simulates realistic loading delays and progress tracking for testing
 * loading states and progress indicators in the UI.
 */

export interface LoadingProgress {
  loaded: number;
  total: number;
}

export interface LoadingConfig {
  delays: Map<string, number>;
  globalDelay: number;
  progressSteps: number;
  simulateProgress: boolean;
}

class LoadingSimulatorClass {
  private config: LoadingConfig = {
    delays: new Map(),
    globalDelay: 0,
    progressSteps: 5,
    simulateProgress: true,
  };

  public onProgressCallback: ((progress: LoadingProgress) => void) | null = null;

  /**
   * Set loading delay for specific operation
   */
  setDelay(operation: string, delayMs: number): void {
    this.config.delays.set(operation, Math.max(0, delayMs));
  }

  /**
   * Get loading delay for specific operation
   */
  getDelay(operation: string): number {
    return this.config.delays.get(operation) || this.config.globalDelay;
  }

  /**
   * Set global loading delay
   */
  setGlobalDelay(delayMs: number): void {
    this.config.globalDelay = Math.max(0, delayMs);
  }

  /**
   * Register progress callback
   */
  onProgress(callback: (progress: LoadingProgress) => void): void {
    this.onProgressCallback = callback;
  }

  /**
   * Clear progress callback
   */
  clearProgress(): void {
    this.onProgressCallback = null;
  }

  /**
   * Simulate loading with progress updates
   */
  async simulateLoadingWithProgress(
    operation: string,
    totalSteps: number = this.config.progressSteps
  ): Promise<void> {
    const delay = this.getDelay(operation) || 1000;
    const stepDelay = delay / totalSteps;

    if (this.onProgressCallback && this.config.simulateProgress) {
      // Start with 0% progress
      this.onProgressCallback({ loaded: 0, total: 100 });

      // Simulate incremental progress
      for (let step = 1; step <= totalSteps; step++) {
        await new Promise(resolve => setTimeout(resolve, stepDelay));
        const progress = Math.min(100, (step / totalSteps) * 100);
        this.onProgressCallback({ loaded: Math.floor(progress), total: 100 });
      }
    } else {
      // Simple delay without progress
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Simulate chunked data loading
   */
  async simulateChunkedLoading<T>(
    operation: string,
    data: T[],
    chunkSize: number = 10
  ): Promise<T[]> {
    const chunks = this.chunkArray(data, chunkSize);
    const result: T[] = [];
    const totalChunks = chunks.length;

    if (this.onProgressCallback && this.config.simulateProgress) {
      this.onProgressCallback({ loaded: 0, total: 100 });

      for (let i = 0; i < chunks.length; i++) {
        // Simulate delay between chunks
        const chunkDelay = (this.getDelay(operation) || 500) / totalChunks;
        await new Promise(resolve => setTimeout(resolve, chunkDelay));

        // Add chunk to result
        result.push(...chunks[i]);

        // Update progress
        const progress = ((i + 1) / totalChunks) * 100;
        this.onProgressCallback({ loaded: Math.floor(progress), total: 100 });
      }
    } else {
      // Return all data at once with simple delay
      const delay = this.getDelay(operation) || 500;
      await new Promise(resolve => setTimeout(resolve, delay));
      result.push(...data);
    }

    return result;
  }

  /**
   * Simulate file upload with progress
   */
  async simulateFileUpload(
    _fileName: string,
    fileSize: number,
    uploadSpeed: number = 1024 * 1024 // 1MB/s
  ): Promise<void> {
    const totalTime = (fileSize / uploadSpeed) * 1000; // Convert to milliseconds
    const steps = Math.min(20, Math.ceil(totalTime / 100)); // Max 20 steps, min 100ms per step
    const stepTime = totalTime / steps;

    if (this.onProgressCallback && this.config.simulateProgress) {
      this.onProgressCallback({ loaded: 0, total: 100 });

      for (let step = 1; step <= steps; step++) {
        await new Promise(resolve => setTimeout(resolve, stepTime));
        const progress = (step / steps) * 100;
        this.onProgressCallback({ loaded: Math.floor(progress), total: 100 });
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, totalTime));
    }
  }

  /**
   * Simulate batch processing with progress
   */
  async simulateBatchProcessing<T, R>(
    _operation: string,
    items: T[],
    processor: (item: T) => Promise<R> | R,
    concurrency: number = 3
  ): Promise<R[]> {
    const results: R[] = [];
    const batches = this.chunkArray(items, concurrency);
    const totalBatches = batches.length;

    if (this.onProgressCallback && this.config.simulateProgress) {
      this.onProgressCallback({ loaded: 0, total: 100 });

      for (let i = 0; i < batches.length; i++) {
        // Process batch concurrently
        const batchPromises = batches[i].map(processor);
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Update progress
        const progress = ((i + 1) / totalBatches) * 100;
        this.onProgressCallback({ loaded: Math.floor(progress), total: 100 });

        // Add small delay between batches
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    } else {
      // Process all items without progress tracking
      const allPromises = items.map(processor);
      const allResults = await Promise.all(allPromises);
      results.push(...allResults);
    }

    return results;
  }

  /**
   * Simulate network request with realistic timing
   */
  async simulateNetworkRequest(
    operation: string,
    payloadSize: number = 1024 // bytes
  ): Promise<void> {
    // Base delay + payload-dependent delay
    const baseDelay = this.getDelay(operation) || 200;
    const payloadDelay = Math.min(payloadSize / 1000, 500); // Max 500ms for payload
    const networkJitter = Math.random() * 100; // Random network jitter
    const totalDelay = baseDelay + payloadDelay + networkJitter;

    if (this.onProgressCallback && this.config.simulateProgress) {
      // Simulate different phases of network request
      const phases = [
        { name: 'Connecting', duration: 0.1 },
        { name: 'Sending', duration: 0.2 },
        { name: 'Waiting', duration: 0.4 },
        { name: 'Receiving', duration: 0.3 },
      ];

      this.onProgressCallback({ loaded: 0, total: 100 });

      let currentProgress = 0;
      for (const phase of phases) {
        const phaseDelay = totalDelay * phase.duration;
        await new Promise(resolve => setTimeout(resolve, phaseDelay));
        
        currentProgress += phase.duration * 100;
        this.onProgressCallback({ loaded: Math.floor(currentProgress), total: 100 });
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  /**
   * Enable/disable progress simulation
   */
  setProgressSimulation(enabled: boolean): void {
    this.config.simulateProgress = enabled;
  }

  /**
   * Set number of progress steps
   */
  setProgressSteps(steps: number): void {
    this.config.progressSteps = Math.max(1, steps);
  }

  /**
   * Reset all configurations
   */
  reset(): void {
    this.config.delays.clear();
    this.config.globalDelay = 0;
    this.config.progressSteps = 5;
    this.config.simulateProgress = true;
    this.onProgressCallback = null;
  }

  /**
   * Get current configuration
   */
  getConfig(): LoadingConfig {
    return {
      delays: new Map(this.config.delays),
      globalDelay: this.config.globalDelay,
      progressSteps: this.config.progressSteps,
      simulateProgress: this.config.simulateProgress,
    };
  }

  /**
   * Utility function to chunk array
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Simulate realistic loading patterns
   */
  enableRealisticMode(): void {
    this.setDelay('auth', 800);
    this.setDelay('dashboard', 1200);
    this.setDelay('reports', 2000);
    this.setDelay('analytics', 1500);
    this.setProgressSteps(8);
    this.setProgressSimulation(true);
  }

  /**
   * Simulate fast loading for testing
   */
  enableFastMode(): void {
    this.setGlobalDelay(100);
    this.setProgressSteps(3);
    this.setProgressSimulation(false);
  }
}

// Export singleton instance
export const MockLoadingSimulator = new LoadingSimulatorClass();

// Make it globally available for easy access in tests
if (typeof window !== 'undefined') {
  (window as any).MockLoadingSimulator = MockLoadingSimulator;
} else if (typeof global !== 'undefined') {
  (global as any).MockLoadingSimulator = MockLoadingSimulator;
}

// Export for both ES modules and CommonJS
export default MockLoadingSimulator;