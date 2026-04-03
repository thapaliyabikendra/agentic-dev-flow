/**
 * Validators and scorers for FRS completeness
 * These functions are imported by the requirement-to-frs skill during Step 5 validation.
 */

/**
 * Validate cross-section consistency checks
 * @param {Object} data - Structured FRS data object
 * @returns {{passed: boolean, failures: string[]}}
 */
function validateConsistency(data) {
  const failures = [];

  // 1. Actors in FRs must exist in Actors table
  const actorNames = data.actors?.map(a => a.name) || [];
  const frActors = new Set((data.functional_requirements || []).flatMap(fr => [fr.actor]));
  for (const frActor of frActors) {
    if (!actorNames.includes(frActor)) {
      failures.push(`Actor "${frActor}" used in FR not defined in Actors table`);
    }
  }

  // 2. Portal consistency across sections
  const allPortals = new Set();
  // Collect from Actors
  (data.actors || []).forEach(a => allPortals.add(a.portal));
  // Collect from Screens
  (data.screen_catalog || []).forEach(s => allPortals.add(s.portal));
  // Check consistency: if multiple portals, they must be "both" or explicitly covered
  if (allPortals.size > 1 && !allPortals.has('both')) {
    const actorPortals = [...(data.actors || []).map(a => a.portal)];
    const screenPortals = [...(data.screen_catalog || []).map(s => s.portal)];
    failures.push(`Portal mismatch: Actors use ${actorPortals.join(', ')}, Screens use ${screenPortals.join(', ')}`);
  }

  // 3. UI fields map to Data Handling fields
  const uiFieldNames = new Set((data.ui_components || []).flatMap(c => c.components?.map(comp => comp.name) || []));
  const dataFieldNames = new Set((data.data_capture || []).map(f => f.field));
  for (const uiField of uiFieldNames) {
    if (!dataFieldNames.has(uiField)) {
      failures.push(`UI field "${uiField}" not captured in Data Handling section`);
    }
  }

  // 4. Acceptance Criteria trace to FRs
  const frIds = new Set((data.functional_requirements || []).map(fr => fr.id));
  (data.acceptance_criteria || []).forEach(ac => {
    const mapsTo = extractFRRefs(ac); // parse "FR-001, FR-002" from AC text
    for (const ref of mapsTo) {
      if (!frIds.has(ref)) {
        failures.push(`Acceptance criterion references non-existent ${ref}`);
      }
    }
  });

  // 5. Terminology consistency (basic check for conflicting key terms)
  const termConflicts = detectTermConflicts(data);
  failures.push(...termConflicts);

  return { passed: failures.length === 0, failures };
}

/**
 * Extract FR references from acceptance criterion text
 * Looks for patterns like "FR-001", "FR-002", "FR-001 and FR-002"
 * @param {string} text
 * @returns {string[]}
 */
function extractFRRefs(text) {
  const matches = text.match(/(FR-\d{3})/g);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Detect terminology conflicts in the FRS data
 * Example: using "User" in some places and "Customer" in others to refer to same concept
 * @param {Object} data
 * @returns {string[]}
 */
function detectTermConflicts(data) {
  const conflicts = [];

  // Check for "User" vs "Customer" vs "Client" ambiguity in Actors and FRs
  const actorNames = data.actors?.map(a => a.name.toLowerCase()) || [];
  const userVariants = ['user', 'customer', 'client', 'member'];
  const foundVariants = userVariants.filter(variant =>
    actorNames.some(name => name.includes(variant)) ||
    (data.functional_requirements || []).some(fr =>
      fr.description.toLowerCase().includes(variant)
    )
  );

  if (foundVariants.length > 1) {
    conflicts.push(`Terminology conflict: Found multiple user referents (${foundVariants.join(', ')}). Standardize on one.`);
  }

  // Check for "system" vs "platform" vs "application" inconsistency
  const systemVariants = ['system', 'platform', 'application', 'app'];
  const foundSystemVariants = systemVariants.filter(variant =>
    (data.functional_requirements || []).some(fr =>
      fr.description.toLowerCase().includes(variant)
    )
  );
  if (foundSystemVariants.length > 1) {
    conflicts.push(`Terminology conflict: Inconsistent use of ${foundSystemVariants.join(', ')}. Pick one.`);
  }

  return conflicts;
}

/**
 * Calculate downstream readiness scores
 * @param {Object} data - Structured FRS data object
 * @param {string} complexity - Simple|Moderate|Complex
 * @returns {{ui: number, domain: number, test: number}}
 */
function calculateReadiness(data, complexity) {
  const scores = { ui: 0, domain: 0, test: 0 };

  // UI Prototype Readiness (0-100)
  // Weighted: Section5 completeness (40%) + Section16 accessibility (20%) + Section6 entities (20%) + Section14 traceability (20%)
  const section5Score = calculateSection5Completeness(data);
  const section16Score = (data.accessibility && data.accessibility.length > 0) ? 1 : 0;
  const section6HasEntities = (data.data_capture || []).some(f => f.entity_vo) ? 1 : 0;
  const section14Completeness = (data.acceptance_criteria && data.acceptance_criteria.length > 0) ? 1 : 0;
  scores.ui = (section5Score * 0.40 + section16Score * 0.20 + section6HasEntities * 0.20 + section14Completeness * 0.20) * 100;

  // Domain Model Readiness
  // Weighted: Section4 aggregates (40%) + Section6 entities (30%) + Section8 events (20%) + Section11 clarity (10%)
  const section4Aggregates = (data.functional_requirements || []).every(fr => fr.aggregate_hint) ? 1 : 0;
  const section6Entities = (data.data_capture || []).every(f => f.entity_vo) ? 1 : 0;
  const section8Events = (data.domain_events || []).length > 0 ? 1 : 0;
  const section11Clarity = (data.external_systems || []).length > 0 ? 1 : 0;
  scores.domain = (section4Aggregates * 0.40 + section6Entities * 0.30 + section8Events * 0.20 + section11Clarity * 0.10) * 100;

  // Test Plan Readiness
  // Weighted: Section14 coverage (50%) + Section4 testability (30%) + Section13 validation (20%)
  const section14Coverage = (data.acceptance_criteria || []).length >= 3 ? 1 : 0;
  const section4Testability = (data.functional_requirements || []).every(fr => fr.inputs && fr.outputs) ? 1 : 0;
  const section13Validation = (data.input_validation || []).length > 0 ? 1 : 0;
  scores.test = (section14Coverage * 0.50 + section4Testability * 0.30 + section13Validation * 0.20) * 100;

  return scores;
}

/**
 * Calculate Section 5 (UI Requirements) completeness
 * Returns 0-1 based on sub-sections populated
 * @param {Object} data
 * @returns {number}
 */
function calculateSection5Completeness(data) {
  const checks = [
    data.screen_catalog?.length > 0,
    data.ui_components?.length > 0,
    data.field_validations?.length > 0,
    data.accessibility && data.accessibility.length > 0,
    data.design_system && data.design_system.length > 0
  ];
  const completed = checks.filter(Boolean).length;
  return completed / checks.length;
}

module.exports = {
  validateConsistency,
  calculateReadiness,
  calculateSection5Completeness,
  extractFRRefs,
  detectTermConflicts
};
