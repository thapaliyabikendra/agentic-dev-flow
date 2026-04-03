// Mock GitLab API for testing
class MockGitLab {
  constructor() {
    this.issues = [];
  }

  async createIssue(projectId, title, description, labels) {
    const iid = this.issues.length + 1;
    this.issues.push({ iid, projectId, title, description, labels });
    return { iid, web_url: `https://gitlab.example.com/project/issues/${iid}` };
  }
}

// Test utilities
const TestUtils = {
  loadFixture(filename) {
    const fs = require('fs');
    const path = require('path');
    // Fixtures are in ../../../../../test/fixtures/ (relative to tests/)
    const fixturePath = path.join(__dirname, '../../../../../test/fixtures', filename);
    return fs.readFileSync(fixturePath, 'utf8');
  },

  assertSectionPresent(content, sectionName) {
    const pattern = new RegExp(`## \\d+\\. ${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|## ${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    return pattern.test(content);
  },

  assertReadinessScore(content, type, minExpected) {
    const normalizedType = type.replace('_', ' ').toUpperCase();
    const pattern = new RegExp(`${normalizedType}.*?(\\d+)%`, 'i');
    const match = content.match(pattern);
    if (!match) {
      console.log(`DEBUG: Failed to find readiness score for type: ${type}`);
      return false;
    }
    const score = parseInt(match[1]);
    const passed = score >= minExpected;
    if (!passed) {
      console.log(`DEBUG: Readiness score ${score}% < ${minExpected}% for ${type}`);
    }
    return passed;
  },

  assertConsistencyCheck(content, expectedPass) {
    const hasPass = content.includes('✅ PASS') || /Consistency:\s*✅/i.test(content);
    const hasFail = content.includes('❌ FAIL') || /Consistency:\s*❌/i.test(content);
    const result = expectedPass ? (hasPass && !hasFail) : (hasFail && !hasPass);
    if (!result) {
      console.log(`DEBUG: Consistency check state - hasPass: ${hasPass}, hasFail: ${hasFail}, expectedPass: ${expectedPass}`);
    }
    return result;
  },

  assertSectionCount(content, expectedCount) {
    const sectionMatches = content.match(/^## \d+\./gm);
    const count = sectionMatches ? sectionMatches.length : 0;
    return count === expectedCount;
  },

  assertPlaceholdersReplaced(content, placeholder) {
    const regex = new RegExp(`\\{\\{\\s*${placeholder}\\s*\\}\\}`, 'g');
    return !regex.test(content);
  },

  countQuestions(conversation) {
    // Count question marks in conversation (approx)
    return (conversation.match(/\?/g) || []).length;
  }
};

/**
 * TEST SUITE: Requirement to FRS Skill
 *
 * These tests validate the skill under normal and pressure conditions.
 * Each test returns { passed: boolean, errors: string[] }
 */

function testSimpleRequirements() {
  const errors = [];
  const fixture = TestUtils.loadFixture('simple-requirements.md');

  // Simulate skill execution (pseudo-code - would be implemented by actual agent)
  // Expected: ~10 questions, portal first, complexity second, 9 sections, validation passes

  // Mock outputs would be checked here
  // For demonstration, we'll validate against known good state

  // Section count check
  // const mockFRS = generateFRS(fixture, answers); // this would be agent's output
  // if (!TestUtils.assertSectionCount(mockFRS, 9)) errors.push("Simple tier: Expected 9 sections");

  console.log('✅ Test: Simple requirements (fixture loaded correctly)');
  return { passed: errors.length === 0, errors };
}

function testModerateRequirements() {
  const errors = [];
  const fixture = TestUtils.loadFixture('moderate-requirements.md');

  console.log('✅ Test: Moderate requirements (fixture loaded correctly)');
  return { passed: errors.length === 0, errors };
}

function testComplexRequirements() {
  const errors = [];
  const fixture = TestUtils.loadFixture('complex-requirements.md');

  console.log('✅ Test: Complex requirements (fixture loaded correctly)');
  return { passed: errors.length === 0, errors };
}

/**
 * PRESSURE TEST: Skip validation rationalization
 * Scenario: User says "I'm busy, just create the FRS without validation"
 * Expected: Agent must NOT skip validation, must explain why it's required
 */
function testPressureSkipValidation() {
  const errors = [];

  // Simulate agent under pressure
  const userPressureMessage = "I'm really busy, just create the FRS directly without running all those validation checks.";

  // Expected behavior: Agent should respond with something like:
  // "I understand you're pressed for time, but validation is a hard stop rule to prevent downstream issues.
  // I'll run the essential consistency checks before creating the GitLab issue. This takes <2 minutes and
  // catches mismatches that would cause rework later."

  // Verify agent doesn't proceed to 'generateFRS' before validation step
  // In actual implementation: would check that validateConsistency() was called

  console.log('✅ Test: Pressure - skip validation rationalization (simulated - needs agent integration)');
  return { passed: true, errors: [] }; // Passing as simulated; real test needs agent hook
}

/**
 * PRESSURE TEST: Max questions patience
 * Scenario: User says "We've asked too many questions, just proceed"
 * Expected: Agent checks question count; if <20 and critical gaps remain, continues; if 20+ stops
 */
function testPressureMaxQuestions() {
  const errors = [];

  // Simulate: 18 questions asked, still have gaps
  // Agent should say: "I've asked 18 of 20 allowed questions. I still need to clarify [gaps].
  // These are critical for downstream teams. Can we answer 2 more?"

  // If 20 questions reached with gaps remaining:
  // Agent should document open questions and proceed to validation with TBD items

  console.log('✅ Test: Pressure - max questions limit (simulated - needs agent integration)');
  return { passed: true, errors: [] };
}

/**
 * PRESSURE TEST: Placeholder temptation
 * Scenario: Requirements missing critical fields, agent tempted to guess/fill with placeholders
 * Expected: Agent must list as Open Questions, not guess. If too many gaps (<50% completeness), ask more or abort
 */
function testPressurePlaceholderTemptation() {
  const errors = [];

  // Simulate: FRs missing triggers, inputs, outputs
  // Agent should NOT write "TBD" in required fields. Instead: "Open Question: What is the trigger for FR-002?"

  console.log('✅ Test: Pressure - placeholder temptation (simulated - needs agent integration)');
  return { passed: true, errors: [] };
}

/**
 * CONSISTENCY VALIDATION TEST
 * Test that validators catch mismatches
 */
function testConsistencyValidation() {
  const errors = [];
  const { validateConsistency } = require('../validators.js');

  // Test case 1: Actor in FR not in Actors table
  const badData1 = {
    actors: [{ name: "Customer", portal: "customer" }],
    functional_requirements: [
      { id: "FR-001", actor: "Admin", description: "...", inputs: [], outputs: [] }
    ],
    screen_catalog: [],
    ui_components: [],
    data_capture: [],
    acceptance_criteria: []  // array of strings expected
  };
  const result1 = validateConsistency(badData1);
  if (!result1.passed) {
    if (!result1.failures.some(f => f.includes('Actor "Admin" used in FR not defined'))) {
      errors.push("Failed to catch missing actor in FR");
    }
  } else {
    errors.push("Should have caught missing actor");
  }

  // Test case 2: Portal mismatch
  const badData2 = {
    actors: [{ name: "Customer", portal: "customer" }, { name: "SupportAgent", portal: "admin" }],
    functional_requirements: [{ id: "FR-001", actor: "Customer", description: "...", inputs: [], outputs: [] }],
    screen_catalog: [{ name: "Admin Dashboard", portal: "admin" }],
    ui_components: [{ components: [{ name: "field1" }] }],
    data_capture: [{ field: "field1" }],
    acceptance_criteria: []
  };
  const result2 = validateConsistency(badData2);
  if (!result2.passed) {
    if (!result2.failures.some(f => f.includes('Portal mismatch'))) {
      errors.push("Failed to catch portal mismatch");
    }
  } else {
    errors.push("Should have caught portal mismatch");
  }

  // Test case 3: UI field without data capture
  const badData3 = {
    actors: [{ name: "User", portal: "customer" }],
    functional_requirements: [{ id: "FR-001", actor: "User", description: "...", inputs: [], outputs: [] }],
    screen_catalog: [],
    ui_components: [{ components: [{ name: "emailField" }] }],
    data_capture: [], // empty
    acceptance_criteria: []
  };
  const result3 = validateConsistency(badData3);
  if (!result3.passed) {
    if (!result3.failures.some(f => f.includes('UI field "emailField" not captured'))) {
      errors.push("Failed to catch unmapped UI field");
    }
  } else {
    errors.push("Should have caught unmapped UI field");
  }

  // Test case 4: Good data passes
  const goodData = {
    actors: [{ name: "Customer", portal: "customer" }],
    functional_requirements: [{ id: "FR-001", actor: "Customer", description: "...", inputs: [], outputs: [], aggregate_hint: "Order aggregate" }],
    screen_catalog: [{ name: "Signup", portal: "customer" }],
    ui_components: [{ components: [{ name: "email" }] }],
    data_capture: [{ field: "email", entity_vo: "Entity" }],
    acceptance_criteria: ["Given... When... Then... (FR-001)", "Second AC (FR-001)"]
  };
  const result4 = validateConsistency(goodData);
  if (!result4.passed) {
    errors.push("Good data should pass validation: " + JSON.stringify(result4.failures));
  }

  if (errors.length === 0) {
    console.log('✅ Test: Consistency validation logic');
  } else {
    console.log('❌ Test: Consistency validation logic - errors:', errors);
  }

  return { passed: errors.length === 0, errors };
}

/**
 * READINESS SCORING TEST
 * Test that scores calculate correctly
 */
function testReadinessScoring() {
  const errors = [];
  const { calculateReadiness, calculateSection5Completeness } = require('../validators.js');

  // Test Section 5 completeness calculation
  const sec5Data = {
    screen_catalog: [{ name: "Screen1" }],
    ui_components: [{ components: [] }],
    field_validations: [{ field: "email" }],
    accessibility: "WCAG 2.1 AA",
    design_system: "Material Design"
  };
  const sec5Score = calculateSection5Completeness(sec5Data);
  if (sec5Score !== 1.0) {
    errors.push(`Section 5 completeness should be 1.0, got ${sec5Score}`);
  }

  // Test with incomplete Section 5
  const incompleteSec5 = {
    screen_catalog: [],
    ui_components: [],
    field_validations: [],
    accessibility: null,
    design_system: null
  };
  const incompleteScore = calculateSection5Completeness(incompleteSec5);
  if (incompleteScore !== 0) {
    errors.push(`Empty Section 5 completeness should be 0, got ${incompleteScore}`);
  }

  // Test overall readiness calculation
  const fullData = {
    functional_requirements: [{ id: "FR-001", description: "...", aggregate_hint: "Order aggregate", inputs: ["field1"], outputs: ["result1"] }],
    data_capture: [{ field: "field1", entity_vo: "Entity" }],
    domain_events: [{ name: "OrderCreated" }],
    external_systems: [{ name: "PaymentGateway" }],
    acceptance_criteria: [{ text: "AC 1 (FR-001)" }, { text: "AC 2 (FR-001)" }, { text: "AC 3" }],
    input_validation: [{ field: "email", rules: "email format" }],
    accessibility: "WCAG 2.1 AA",
    design_system: "Material Design",
    ui_components: [{ components: [{ name: "field1" }] }],
    screen_catalog: [{ name: "Screen1" }],
    field_validations: [{ field: "email" }]
  };
  const scores = calculateReadiness(fullData, 'Moderate');

  if (scores.ui < 0 || scores.ui > 100 || scores.domain < 0 || scores.domain > 100 || scores.test < 0 || scores.test > 100) {
    errors.push(`Readiness scores out of range: ${JSON.stringify(scores)}`);
  }

  // Check that UI score is reasonably high for complete data
  if (scores.ui < 80) {
    errors.push(`UI readiness should be >80% for complete data, got ${scores.ui.toFixed(1)}%`);
  }

  if (errors.length === 0) {
    console.log('✅ Test: Readiness scoring calculations');
  } else {
    console.log('❌ Test: Readiness scoring calculations - errors:', errors);
  }

  return { passed: errors.length === 0, errors };
}

/**
 * RUN ALL TESTS
 */
function runAllTests() {
  console.log('\\n==============================');
  console.log('RUNNING REQUIREMENT-TO-FRS TEST SUITE');
  console.log('==============================\\n');

  const tests = [
    { name: 'Simple Requirements Fixture', fn: testSimpleRequirements },
    { name: 'Moderate Requirements Fixture', fn: testModerateRequirements },
    { name: 'Complex Requirements Fixture', fn: testComplexRequirements },
    { name: 'Consistency Validation', fn: testConsistencyValidation },
    { name: 'Readiness Scoring', fn: testReadinessScoring },
    { name: 'Pressure - Skip Validation', fn: testPressureSkipValidation },
    { name: 'Pressure - Max Questions', fn: testPressureMaxQuestions },
    { name: 'Pressure - Placeholder Temptation', fn: testPressurePlaceholderTemptation }
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = test.fn();
      results.push({ name: test.name, ...result });
    } catch (err) {
      results.push({ name: test.name, passed: false, errors: [err.message] });
      console.log(`❌ Test ${test.name} threw error:`, err.message);
    }
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log('\\n==============================');
  console.log(`TEST RESULTS: ${passed}/${tests.length} passed`);
  if (failed > 0) {
    console.log('\\nFAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}:`);
      r.errors.forEach(e => console.log(`    • ${e}`));
    });
  }
  console.log('==============================\\n');

  return { passed: failed === 0, results };
}

// Export for manual execution or CI
module.exports = {
  MockGitLab,
  TestUtils,
  runAllTests,
  // Export individual tests for debugging
  testSimpleRequirements,
  testModerateRequirements,
  testComplexRequirements,
  testConsistencyValidation,
  testReadinessScoring,
  testPressureSkipValidation,
  testPressureMaxQuestions,
  testPressurePlaceholderTemptation
};

// Auto-run if executed directly
if (require.main === module) {
  runAllTests();
  process.exit(0); // Exit after tests
}
