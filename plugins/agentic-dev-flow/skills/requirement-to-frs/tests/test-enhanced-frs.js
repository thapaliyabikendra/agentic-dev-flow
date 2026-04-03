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
    // Implementation for loading test fixtures
    const fs = require('fs');
    const path = require('path');
    const fixturePath = path.join(__dirname, '../../../../test/fixtures', filename);
    return fs.readFileSync(fixturePath, 'utf8');
  },

  assertSectionPresent(content, sectionName) {
    // Implementation for section presence assertion
    const pattern = new RegExp(`## \\d+\\. ${sectionName}|## ${sectionName}`);
    return pattern.test(content);
  },

  assertReadinessScore(content, type, minExpected) {
    // Implementation for readiness score assertion
    const pattern = new RegExp(`${type.replace('_', ' ').toUpperCase()}.*?(\\d+)%`, 'i');
    const match = content.match(pattern);
    if (!match) return false;
    return parseInt(match[1]) >= minExpected;
  },

  assertConsistencyCheck(content, expectedPass) {
    // Implementation for consistency check assertion
    const hasPass = content.includes('✅ PASS') || content.includes('Consistency: ✅');
    const hasFail = content.includes('❌ FAIL') || content.includes('Consistency: ❌');
    if (expectedPass) {
      return hasPass && !hasFail;
    } else {
      return hasFail && !hasPass;
    }
  }
};

// Test cases will be defined in subsequent tasks
module.exports = { MockGitLab, TestUtils };
