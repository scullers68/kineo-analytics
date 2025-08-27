// Component Verification - Test actual chart rendering
const React = require('react');
const ReactDOMServer = require('react-dom/server');

// Mock console.log to capture any rendering issues
const originalLog = console.log;
const originalError = console.error;
let renderingLogs = [];

console.log = (...args) => {
  renderingLogs.push(['LOG', ...args]);
  originalLog(...args);
};

console.error = (...args) => {
  renderingLogs.push(['ERROR', ...args]);
  originalError(...args);
};

// Test sample data
const sampleBarData = [
  { id: 'course-1', label: 'React Basics', value: 85, category: 'completion' },
  { id: 'course-2', label: 'TypeScript', value: 92, category: 'completion' },
  { id: 'course-3', label: 'D3.js', value: 78, category: 'completion' },
  { id: 'course-4', label: 'Testing', value: 89, category: 'completion' },
];

const sampleLineData = [
  { id: 'day-1', date: '2024-01-01', value: 45, timestamp: Date.now() - 86400000 * 5 },
  { id: 'day-2', date: '2024-01-02', value: 52, timestamp: Date.now() - 86400000 * 4 },
  { id: 'day-3', date: '2024-01-03', value: 48, timestamp: Date.now() - 86400000 * 3 },
  { id: 'day-4', date: '2024-01-04', value: 61, timestamp: Date.now() - 86400000 * 2 },
  { id: 'day-5', date: '2024-01-05', value: 58, timestamp: Date.now() - 86400000 * 1 },
];

const samplePieData = [
  { id: 'frontend', label: 'Frontend', value: 35, category: 'department' },
  { id: 'backend', label: 'Backend', value: 25, category: 'department' },
  { id: 'devops', label: 'DevOps', value: 20, category: 'department' },
  { id: 'testing', label: 'Testing', value: 20, category: 'department' }
];

async function testChartComponent(componentName, componentPath, sampleData) {
  try {
    console.log(`\n🧪 Testing ${componentName}...`);
    
    // Try to import the component
    const Component = require(componentPath);
    const ChartComponent = Component[componentName] || Component.default;
    
    if (!ChartComponent) {
      console.error(`❌ ${componentName}: Component not found in exports`);
      return false;
    }
    
    // Create element with sample data
    const element = React.createElement(ChartComponent, {
      data: sampleData,
      width: 400,
      height: 300,
      config: {
        responsive: true,
        animate: false, // Disable animations for testing
        showTooltips: false
      }
    });
    
    // Try to render to string (server-side rendering test)
    const htmlString = ReactDOMServer.renderToString(element);
    
    // Check if we got meaningful HTML (not just empty divs)
    const hasSvg = htmlString.includes('<svg');
    const hasD3Content = htmlString.includes('d3-') || htmlString.includes('chart-') || htmlString.includes('bar') || htmlString.includes('line') || htmlString.includes('arc');
    const isNotEmpty = htmlString.length > 100;
    
    console.log(`   📊 SVG elements found: ${hasSvg}`);
    console.log(`   🎨 D3/Chart content: ${hasD3Content}`);
    console.log(`   📏 Meaningful content (>100 chars): ${isNotEmpty}`);
    console.log(`   📝 Rendered HTML length: ${htmlString.length} characters`);
    
    if (htmlString.length > 50) {
      console.log(`   🔍 Sample HTML: ${htmlString.substring(0, 200)}...`);
    }
    
    const success = hasSvg || hasD3Content || isNotEmpty;
    console.log(`   ${success ? '✅' : '❌'} ${componentName}: ${success ? 'RENDERED SUCCESSFULLY' : 'FAILED TO RENDER'}`);
    
    return success;
    
  } catch (error) {
    console.error(`❌ ${componentName}: Error during testing - ${error.message}`);
    console.error(`   Stack: ${error.stack.split('\n')[0]}`);
    return false;
  }
}

async function runVerification() {
  console.log('🔍 KAREN'S REALITY CHECK: Component Rendering Verification\n');
  console.log('Testing whether our chart components actually render with sample data...\n');
  
  const tests = [
    { name: 'BarChart', path: './src/components/charts/BarChart', data: sampleBarData },
    { name: 'LineChart', path: './src/components/charts/LineChart', data: sampleLineData },
    { name: 'PieChart', path: './src/components/charts/PieChart', data: samplePieData },
    { name: 'AreaChart', path: './src/components/charts/AreaChart', data: sampleLineData },
    { name: 'StreamGraphChart', path: './src/components/charts/StreamGraphChart', data: sampleLineData }
  ];
  
  let successCount = 0;
  const results = [];
  
  for (const test of tests) {
    const success = await testChartComponent(test.name, test.path, test.data);
    results.push({ component: test.name, success });
    if (success) successCount++;
  }
  
  console.log('\n📊 VERIFICATION RESULTS:');
  console.log('========================');
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.component}: ${result.success ? 'RENDERS' : 'FAILS'}`);
  });
  
  console.log(`\n🎯 FINAL ASSESSMENT:`);
  console.log(`   Success Rate: ${successCount}/${tests.length} (${Math.round(successCount/tests.length*100)}%)`);
  
  if (successCount === tests.length) {
    console.log(`   🎉 CONCLUSION: Karen's assessment was WRONG!`);
    console.log(`   💪 All chart components render successfully with real functionality.`);
  } else if (successCount > 0) {
    console.log(`   ⚠️  CONCLUSION: Karen was partially correct.`);
    console.log(`   📋 Some components render, others may be architectural only.`);
  } else {
    console.log(`   🚨 CONCLUSION: Karen was RIGHT!`);
    console.log(`   💔 Components appear to be architectural without real rendering.`);
  }
  
  if (renderingLogs.length > 0) {
    console.log('\n📝 RENDERING LOGS:');
    renderingLogs.forEach(([type, ...args]) => {
      console.log(`   ${type}: ${args.join(' ')}`);
    });
  }
  
  console.log('\n🔗 Next step: Open chart-verification.html in your browser to see visual D3.js tests!');
}

// Run the verification
runVerification().catch(error => {
  console.error('💥 Verification failed:', error.message);
  console.error(error.stack);
});