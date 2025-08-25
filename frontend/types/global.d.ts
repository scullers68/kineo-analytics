// Global type definitions for Kineo Analytics Frontend

declare global {
  interface Window {
    // Customer analytics tracking
    kineoAnalytics?: {
      track: (event: string, properties?: Record<string, any>) => void
      identify: (userId: string, traits?: Record<string, any>) => void
      page: (name?: string, properties?: Record<string, any>) => void
    }
    
    // Global environment variables
    ENV?: {
      NODE_ENV: 'development' | 'test' | 'production'
      NEXT_PUBLIC_API_URL: string
      NEXT_PUBLIC_WEBSOCKET_URL: string
    }
  }

  // Next.js specific global types
  interface ProcessEnv {
    NODE_ENV: 'development' | 'test' | 'production'
    NEXT_PUBLIC_API_URL: string
    NEXT_PUBLIC_WEBSOCKET_URL: string
    DATABASE_URL: string
    JWT_SECRET: string
    REDIS_URL?: string
  }

  // D3.js chart integration types
  interface CustomD3Event extends Event {
    detail: {
      chartType: string
      data: any
      filters: Record<string, any>
    }
  }

  // Customer context types
  interface CustomerGlobals {
    customerId: string
    customerName: string
    customerSettings: {
      theme: 'light' | 'dark'
      timezone: string
      currency: string
      dateFormat: string
      locale: string
    }
  }

  // Learning analytics specific types
  namespace LearningAnalytics {
    interface MetricsEvent {
      type: 'course_completed' | 'certification_earned' | 'progress_updated'
      userId: string
      courseId?: string
      certificationId?: string
      progress?: number
      timestamp: string
    }
    
    interface FilterState {
      dateRange: { start: string; end: string }
      departments: string[]
      courseStatus: string[]
      userGroups: string[]
    }
  }
}

// Module declarations for non-TypeScript dependencies
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.ico' {
  const src: string
  export default src
}

declare module '*.bmp' {
  const src: string
  export default src
}

// CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.sass' {
  const classes: { [key: string]: string }
  export default classes
}

// TDD Guard jest reporter types
declare module 'tdd-guard-jest' {
  interface TddGuardConfig {
    hookUrl?: string
    enforcementLevel?: 'strict' | 'moderate' | 'lenient'
    ignorePatterns?: string[]
    projectRoot?: string
    testDirectory?: string
    sourceDirectory?: string
    extensions?: string[]
    testExtensions?: string[]
    requireTestsForNewCode?: boolean
    requireFailingTestFirst?: boolean
    preventOverImplementation?: boolean
    skipTddFor?: string[]
  }

  const TddGuardReporter: [string, TddGuardConfig]
  export = TddGuardReporter
}

export {}