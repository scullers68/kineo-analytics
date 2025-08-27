/**
 * Documentation Testing Utilities
 * 
 * Provides utilities for validating TypeScript JSDoc comments, code examples,
 * API documentation completeness, and automated documentation generation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ReactElement } from 'react';

export interface DocumentationValidationConfig {
  requiredJSDocTags: string[];
  codeExampleValidation: boolean;
  typeScriptValidation: boolean;
  propDocumentation: boolean;
  usageExamples: boolean;
  accessibilityDocs: boolean;
}

export interface JSDocValidationResult {
  hasDescription: boolean;
  hasParams: boolean;
  hasReturnType: boolean;
  hasExamples: boolean;
  hasAccessibilityInfo: boolean;
  requiredTags: Array<{ tag: string; present: boolean }>;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
}

export interface CodeExampleValidation {
  compilable: boolean;
  syntaxValid: boolean;
  importsValid: boolean;
  propsValid: boolean;
  executionResult?: any;
  errors: string[];
}

export interface DocumentationCoverageReport {
  totalComponents: number;
  documentedComponents: number;
  coveragePercentage: number;
  missingDocumentation: string[];
  qualityByComponent: Record<string, JSDocValidationResult>;
}

export class DocumentationTestingUtils {
  private static readonly DEFAULT_CONFIG: DocumentationValidationConfig = {
    requiredJSDocTags: ['param', 'returns', 'example', 'since'],
    codeExampleValidation: true,
    typeScriptValidation: true,
    propDocumentation: true,
    usageExamples: true,
    accessibilityDocs: true
  };

  static validateJSDocComments(
    sourceCode: string,
    componentName: string,
    config: Partial<DocumentationValidationConfig> = {}
  ): JSDocValidationResult {
    const testConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Extract JSDoc comment for the component
    const jsDocRegex = /\/\*\*([\s\S]*?)\*\/\s*(?:export\s+)?(?:const|function|class)\s+(\w+)/g;
    const matches = Array.from(sourceCode.matchAll(jsDocRegex));
    
    const componentMatch = matches.find(match => match[2] === componentName);
    
    if (!componentMatch) {
      return {
        hasDescription: false,
        hasParams: false,
        hasReturnType: false,
        hasExamples: false,
        hasAccessibilityInfo: false,
        requiredTags: testConfig.requiredJSDocTags.map(tag => ({ tag, present: false })),
        quality: 'poor',
        score: 0
      };
    }

    const jsDocContent = componentMatch[1];
    
    // Analyze JSDoc content
    const hasDescription = !jsDocContent.trim().startsWith('@') && jsDocContent.includes('\n');
    const hasParams = jsDocContent.includes('@param');
    const hasReturnType = jsDocContent.includes('@returns') || jsDocContent.includes('@return');
    const hasExamples = jsDocContent.includes('@example');
    const hasAccessibilityInfo = jsDocContent.toLowerCase().includes('accessibility') ||
                                 jsDocContent.toLowerCase().includes('a11y') ||
                                 jsDocContent.toLowerCase().includes('aria');

    // Check for required tags
    const requiredTags = testConfig.requiredJSDocTags.map(tag => ({
      tag,
      present: jsDocContent.includes(`@${tag}`)
    }));

    // Calculate quality score
    const metrics = [
      hasDescription,
      hasParams,
      hasReturnType,
      hasExamples,
      hasAccessibilityInfo,
      ...requiredTags.map(t => t.present)
    ];
    
    const score = (metrics.filter(Boolean).length / metrics.length) * 100;
    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    
    if (score >= 90) quality = 'excellent';
    else if (score >= 75) quality = 'good';
    else if (score >= 50) quality = 'fair';
    else quality = 'poor';

    return {
      hasDescription,
      hasParams,
      hasReturnType,
      hasExamples,
      hasAccessibilityInfo,
      requiredTags,
      quality,
      score
    };
  }

  static validateCodeExamples(
    sourceCode: string,
    componentName: string
  ): CodeExampleValidation[] {
    const results: CodeExampleValidation[] = [];
    
    // Extract code examples from JSDoc comments
    const exampleRegex = /@example\s*```(?:tsx?|jsx?|javascript|typescript)?\s*([\s\S]*?)```/g;
    const examples = Array.from(sourceCode.matchAll(exampleRegex));

    for (const example of examples) {
      const codeExample = example[1].trim();
      
      const validation: CodeExampleValidation = {
        compilable: false,
        syntaxValid: false,
        importsValid: false,
        propsValid: false,
        errors: []
      };

      try {
        // Basic syntax validation
        validation.syntaxValid = this.validateSyntax(codeExample);
        
        // Import validation
        validation.importsValid = this.validateImports(codeExample, componentName);
        
        // Props validation
        validation.propsValid = this.validateProps(codeExample, componentName);
        
        // Compilation attempt (simulated)
        validation.compilable = validation.syntaxValid && 
                               validation.importsValid && 
                               validation.propsValid;

        if (validation.compilable) {
          validation.executionResult = this.simulateExecution(codeExample);
        }
      } catch (error) {
        validation.errors.push(error instanceof Error ? error.message : 'Unknown error');
      }

      results.push(validation);
    }

    return results;
  }

  static async generateDocumentationCoverage(
    sourceDirectory: string,
    config: Partial<DocumentationValidationConfig> = {}
  ): Promise<DocumentationCoverageReport> {
    const components = await this.discoverComponents(sourceDirectory);
    const qualityByComponent: Record<string, JSDocValidationResult> = {};
    const missingDocumentation: string[] = [];
    let documentedComponents = 0;

    for (const component of components) {
      try {
        const sourceCode = await this.readSourceFile(component.filePath);
        const validation = this.validateJSDocComments(
          sourceCode, 
          component.name, 
          config
        );
        
        qualityByComponent[component.name] = validation;
        
        if (validation.score > 0) {
          documentedComponents++;
        } else {
          missingDocumentation.push(component.name);
        }
      } catch (error) {
        missingDocumentation.push(component.name);
        qualityByComponent[component.name] = {
          hasDescription: false,
          hasParams: false,
          hasReturnType: false,
          hasExamples: false,
          hasAccessibilityInfo: false,
          requiredTags: [],
          quality: 'poor',
          score: 0
        };
      }
    }

    return {
      totalComponents: components.length,
      documentedComponents,
      coveragePercentage: (documentedComponents / components.length) * 100,
      missingDocumentation,
      qualityByComponent
    };
  }

  static validateTypeScriptDocumentation(
    sourceCode: string,
    componentName: string
  ) {
    const results = {
      hasTypeDefinitions: false,
      interfaceDocumented: false,
      propsDocumented: false,
      exportTypeDefinitions: false,
      genericConstraints: false,
      issues: [] as string[]
    };

    // Check for TypeScript interface definitions
    const interfaceRegex = new RegExp(`interface\\s+${componentName}Props\\s*{`, 'g');
    results.hasTypeDefinitions = interfaceRegex.test(sourceCode);

    if (!results.hasTypeDefinitions) {
      results.issues.push('Missing TypeScript interface definition for props');
    }

    // Check for prop documentation within interface
    const interfaceContentRegex = new RegExp(
      `interface\\s+${componentName}Props\\s*{([\\s\\S]*?)}`,
      'g'
    );
    const interfaceMatch = interfaceContentRegex.exec(sourceCode);

    if (interfaceMatch) {
      const interfaceContent = interfaceMatch[1];
      
      // Check for JSDoc comments within interface
      const hasDocComments = interfaceContent.includes('/**') || interfaceContent.includes('//');
      results.interfaceDocumented = hasDocComments;
      results.propsDocumented = hasDocComments;

      if (!hasDocComments) {
        results.issues.push('Interface properties are not documented');
      }
    }

    // Check for exported type definitions
    const exportTypeRegex = new RegExp(`export\\s+(?:type|interface)\\s+${componentName}`, 'g');
    results.exportTypeDefinitions = exportTypeRegex.test(sourceCode);

    // Check for generic constraints
    const genericRegex = new RegExp(`${componentName}<.*?extends.*?>`, 'g');
    results.genericConstraints = genericRegex.test(sourceCode);

    return results;
  }

  static validateAccessibilityDocumentation(sourceCode: string, componentName: string) {
    const results = {
      hasA11yDocumentation: false,
      hasKeyboardNavigation: false,
      hasScreenReaderInfo: false,
      hasAriaAttributes: false,
      hasColorAccessibility: false,
      score: 0,
      recommendations: [] as string[]
    };

    const lowerCaseSource = sourceCode.toLowerCase();
    
    // Check for accessibility-related documentation
    const a11yKeywords = [
      'accessibility', 'a11y', 'screen reader', 'keyboard navigation',
      'aria-label', 'aria-describedby', 'wcag', 'contrast', 'focus'
    ];

    const foundKeywords = a11yKeywords.filter(keyword => 
      lowerCaseSource.includes(keyword)
    );

    results.hasA11yDocumentation = foundKeywords.length > 0;
    results.hasKeyboardNavigation = lowerCaseSource.includes('keyboard') || 
                                   lowerCaseSource.includes('tab') ||
                                   lowerCaseSource.includes('arrow keys');
    results.hasScreenReaderInfo = lowerCaseSource.includes('screen reader') ||
                                 lowerCaseSource.includes('nvda') ||
                                 lowerCaseSource.includes('jaws');
    results.hasAriaAttributes = lowerCaseSource.includes('aria-') ||
                               lowerCaseSource.includes('role=');
    results.hasColorAccessibility = lowerCaseSource.includes('contrast') ||
                                   lowerCaseSource.includes('color blind');

    // Calculate score
    const metrics = [
      results.hasA11yDocumentation,
      results.hasKeyboardNavigation,
      results.hasScreenReaderInfo,
      results.hasAriaAttributes,
      results.hasColorAccessibility
    ];
    results.score = (metrics.filter(Boolean).length / metrics.length) * 100;

    // Generate recommendations
    if (!results.hasA11yDocumentation) {
      results.recommendations.push('Add accessibility documentation section');
    }
    if (!results.hasKeyboardNavigation) {
      results.recommendations.push('Document keyboard navigation support');
    }
    if (!results.hasScreenReaderInfo) {
      results.recommendations.push('Document screen reader compatibility');
    }
    if (!results.hasAriaAttributes) {
      results.recommendations.push('Document ARIA attributes usage');
    }
    if (!results.hasColorAccessibility) {
      results.recommendations.push('Document color accessibility considerations');
    }

    return results;
  }

  static generateDocumentationReport(
    coverageReport: DocumentationCoverageReport,
    accessibilityValidation: Record<string, any>,
    typeScriptValidation: Record<string, any>
  ) {
    const report = {
      overview: {
        totalComponents: coverageReport.totalComponents,
        coveragePercentage: coverageReport.coveragePercentage,
        qualityDistribution: this.calculateQualityDistribution(coverageReport.qualityByComponent),
        grade: this.calculateOverallGrade(coverageReport.coveragePercentage)
      },
      detailedResults: {
        excellentDocumentation: [] as string[],
        goodDocumentation: [] as string[],
        needsImprovement: [] as string[],
        missingDocumentation: coverageReport.missingDocumentation
      },
      recommendations: [] as string[],
      accessibility: {
        coverage: this.calculateAccessibilityCoverage(accessibilityValidation),
        issues: this.collectAccessibilityIssues(accessibilityValidation)
      },
      typeScript: {
        coverage: this.calculateTypeScriptCoverage(typeScriptValidation),
        issues: this.collectTypeScriptIssues(typeScriptValidation)
      }
    };

    // Categorize components by quality
    Object.entries(coverageReport.qualityByComponent).forEach(([componentName, validation]) => {
      switch (validation.quality) {
        case 'excellent':
          report.detailedResults.excellentDocumentation.push(componentName);
          break;
        case 'good':
          report.detailedResults.goodDocumentation.push(componentName);
          break;
        case 'fair':
        case 'poor':
          report.detailedResults.needsImprovement.push(componentName);
          break;
      }
    });

    // Generate recommendations
    if (coverageReport.coveragePercentage < 80) {
      report.recommendations.push('Increase documentation coverage above 80%');
    }
    if (report.accessibility.coverage < 70) {
      report.recommendations.push('Improve accessibility documentation coverage');
    }
    if (report.typeScript.coverage < 90) {
      report.recommendations.push('Add comprehensive TypeScript type documentation');
    }

    return report;
  }

  private static validateSyntax(code: string): boolean {
    try {
      // Basic syntax checks for common issues
      const openBraces = (code.match(/{/g) || []).length;
      const closeBraces = (code.match(/}/g) || []).length;
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      const openBrackets = (code.match(/\[/g) || []).length;
      const closeBrackets = (code.match(/\]/g) || []).length;

      return openBraces === closeBraces && 
             openParens === closeParens && 
             openBrackets === closeBrackets;
    } catch {
      return false;
    }
  }

  private static validateImports(code: string, componentName: string): boolean {
    // Check if the component import is present
    const importRegex = new RegExp(`import.*${componentName}.*from`, 'g');
    const hasComponentImport = importRegex.test(code);
    
    // Check for React import if JSX is used
    const hasJSX = /<[A-Z]/.test(code);
    const hasReactImport = code.includes("import React") || code.includes("import { React");
    
    return hasComponentImport && (!hasJSX || hasReactImport);
  }

  private static validateProps(code: string, componentName: string): boolean {
    // Look for component usage with props
    const componentUsageRegex = new RegExp(`<${componentName}\\s+[^>]*>`, 'g');
    const usageMatch = componentUsageRegex.exec(code);
    
    if (!usageMatch) {
      // Component used without props is valid
      return true;
    }
    
    // Basic prop syntax validation
    const propsSection = usageMatch[0];
    const hasValidPropSyntax = !propsSection.includes('=}') && 
                              !propsSection.includes('={=');
    
    return hasValidPropSyntax;
  }

  private static simulateExecution(code: string): any {
    // Simulate code execution result
    return {
      compiled: true,
      rendered: code.includes('<'),
      props: (code.match(/\w+=/g) || []).length,
      timestamp: Date.now()
    };
  }

  private static async discoverComponents(sourceDirectory: string): Promise<Array<{ name: string; filePath: string }>> {
    // Mock component discovery - in real implementation, would scan filesystem
    return [
      { name: 'BarChart', filePath: path.join(sourceDirectory, 'components/charts/BarChart.tsx') },
      { name: 'LineChart', filePath: path.join(sourceDirectory, 'components/charts/LineChart.tsx') },
      { name: 'PieChart', filePath: path.join(sourceDirectory, 'components/charts/PieChart.tsx') },
      { name: 'DonutChart', filePath: path.join(sourceDirectory, 'components/charts/DonutChart.tsx') }
    ];
  }

  private static async readSourceFile(filePath: string): Promise<string> {
    // Mock file reading - in real implementation, would use fs.readFile
    return `
    /**
     * Chart component for data visualization
     * @param data - Chart data array
     * @returns JSX element
     * @example
     * \`\`\`tsx
     * <BarChart data={chartData} />
     * \`\`\`
     */
    export const BarChart: React.FC<Props> = ({ data }) => {
      return <div>Chart</div>;
    };
    `;
  }

  private static calculateQualityDistribution(qualityByComponent: Record<string, JSDocValidationResult>) {
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
    
    Object.values(qualityByComponent).forEach(validation => {
      distribution[validation.quality]++;
    });
    
    return distribution;
  }

  private static calculateOverallGrade(coveragePercentage: number): string {
    if (coveragePercentage >= 95) return 'A+';
    if (coveragePercentage >= 90) return 'A';
    if (coveragePercentage >= 85) return 'B+';
    if (coveragePercentage >= 80) return 'B';
    if (coveragePercentage >= 75) return 'C+';
    if (coveragePercentage >= 70) return 'C';
    if (coveragePercentage >= 60) return 'D';
    return 'F';
  }

  private static calculateAccessibilityCoverage(accessibilityValidation: Record<string, any>): number {
    const scores = Object.values(accessibilityValidation).map((v: any) => v.score || 0);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  private static collectAccessibilityIssues(accessibilityValidation: Record<string, any>): string[] {
    const issues: string[] = [];
    
    Object.entries(accessibilityValidation).forEach(([component, validation]: [string, any]) => {
      if (validation.recommendations) {
        issues.push(...validation.recommendations.map((rec: string) => `${component}: ${rec}`));
      }
    });
    
    return issues;
  }

  private static calculateTypeScriptCoverage(typeScriptValidation: Record<string, any>): number {
    const components = Object.keys(typeScriptValidation);
    const documented = components.filter(component => 
      typeScriptValidation[component].hasTypeDefinitions
    ).length;
    
    return components.length > 0 ? (documented / components.length) * 100 : 0;
  }

  private static collectTypeScriptIssues(typeScriptValidation: Record<string, any>): string[] {
    const issues: string[] = [];
    
    Object.entries(typeScriptValidation).forEach(([component, validation]: [string, any]) => {
      if (validation.issues) {
        issues.push(...validation.issues.map((issue: string) => `${component}: ${issue}`));
      }
    });
    
    return issues;
  }
}

export default DocumentationTestingUtils;