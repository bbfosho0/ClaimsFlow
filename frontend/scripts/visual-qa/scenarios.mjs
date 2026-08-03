const desktop = { width: 1440, height: 1180, mobile: false };
const mobile = { width: 390, height: 844, mobile: true };

export function createVisualQaScenarios(baseUrl, claimId) {
  const url = path => new URL(path, baseUrl).toString();
  const scenario = (name, filename, path, requiredText, viewport = desktop, options = {}) => ({
    name,
    filename,
    url: url(path),
    expectedPath: new URL(path, baseUrl).pathname,
    requiredText,
    forbiddenText: options.forbiddenText ?? ['We could not load', 'could not be loaded'],
    expectedQuery: options.expectedQuery ?? {},
    viewport,
    reducedMotion: options.reducedMotion ?? false,
  });

  return {
    beforeMutation: [
      scenario(
        'tour',
        'tour-1440x1180.png',
        '/tour',
        ['Understand the entire product through one claim.', 'What is actually implemented.'],
      ),
      scenario(
        'claimant-portal',
        'claimant-portal-1440x1180.png',
        `/portal/claims/${claimId}`,
        ['Claim status', 'Taylor Reed'],
      ),
      scenario(
        'adjuster-claim',
        'adjuster-claim-1440x1180.png',
        `/app/claims/${claimId}?role=adjuster`,
        ['Claim Workspace', 'Taylor Reed'],
        desktop,
        { expectedQuery: { role: 'adjuster' } },
      ),
      scenario(
        'manager-dashboard-baseline',
        'manager-dashboard-baseline-1440x1180.png',
        `/app/dashboard?role=manager&claimId=${claimId}`,
        ['Operations Overview', 'Updated'],
        desktop,
        { expectedQuery: { role: 'manager', claimId } },
      ),
      scenario(
        'manager-queue-sla-filtered',
        'manager-queue-sla-filtered-1440x1180.png',
        `/app/claims?role=manager&claimId=${claimId}&sort=slaDeadline%2Casc`,
        ['Claim Queue'],
        desktop,
        { expectedQuery: { role: 'manager', claimId, sort: 'slaDeadline,asc' } },
      ),
      scenario(
        'analytics-default',
        'analytics-default-1440x1180.png',
        '/app/analytics?role=manager',
        ['Operational Analytics', 'Estimated exposure'],
        desktop,
        { expectedQuery: { role: 'manager' } },
      ),
      scenario(
        'analytics-west-filtered',
        'analytics-west-filtered-1440x1180.png',
        '/app/analytics?role=manager&region=WEST',
        ['Operational Analytics', 'Volume and inventory'],
        desktop,
        { expectedQuery: { role: 'manager', region: 'WEST' } },
      ),
      scenario(
        'team-operations-default',
        'team-operations-default-1440x1180.png',
        '/app/team-ops?role=manager',
        ['Team Operations', 'Adjuster load matrix'],
        desktop,
        { expectedQuery: { role: 'manager' } },
      ),
      scenario(
        'team-operations-filtered',
        'team-operations-filtered-1440x1180.png',
        '/app/team-ops?role=manager&team=SIU%20Investigations',
        ['Team Operations', 'Integrity components'],
        desktop,
        { expectedQuery: { role: 'manager', team: 'SIU Investigations' } },
      ),
      scenario(
        'evidence-operations',
        'evidence-operations-1440x1180.png',
        `/app/documents?role=adjuster&selectedClaimId=${claimId}`,
        ['Evidence Operations', 'Evidence completeness matrix'],
        desktop,
        { expectedQuery: { role: 'adjuster', selectedClaimId: claimId } },
      ),
      scenario(
        'administrator-workflows',
        'administrator-workflows-1440x1180.png',
        `/app/workflows?role=admin&claimId=${claimId}`,
        ['Workflow Automation', 'Production workflow activation is not connected'],
        desktop,
        { expectedQuery: { role: 'admin', claimId } },
      ),
    ],
    afterMutation: [
      scenario(
        'manager-dashboard-after-evidence',
        'manager-dashboard-after-evidence-1440x1180.png',
        `/app/dashboard?role=manager&claimId=${claimId}`,
        ['Operations Overview', 'Updated'],
        desktop,
        { expectedQuery: { role: 'manager', claimId } },
      ),
      scenario(
        'evidence-operations-after-update',
        'evidence-operations-after-update-1440x1180.png',
        `/app/documents?role=adjuster&selectedClaimId=${claimId}`,
        ['Evidence Operations', 'Photos'],
        desktop,
        { expectedQuery: { role: 'adjuster', selectedClaimId: claimId } },
      ),
    ],
    stale: scenario(
      'manager-dashboard-stale',
      'manager-dashboard-stale-1440x1180.png',
      `/app/dashboard?role=manager&claimId=${claimId}`,
      ['Operations Overview', 'Showing the last successful update.'],
      desktop,
      {
        expectedQuery: { role: 'manager', claimId },
        forbiddenText: ['We could not load', 'Dashboard could not be loaded'],
      },
    ),
    reducedMotion: scenario(
      'manager-dashboard-reduced-motion',
      'manager-dashboard-reduced-motion-1440x1180.png',
      `/app/dashboard?role=manager&claimId=${claimId}`,
      ['Operations Overview', 'Updated'],
      desktop,
      { expectedQuery: { role: 'manager', claimId }, reducedMotion: true },
    ),
    mobile: [
      scenario(
        'claimant-portal-mobile',
        'claimant-portal-mobile-390x844.png',
        `/portal/claims/${claimId}`,
        ['Claim status', 'Taylor Reed'],
        mobile,
      ),
      scenario(
        'manager-dashboard-mobile',
        'manager-dashboard-mobile-390x844.png',
        `/app/dashboard?role=manager&claimId=${claimId}`,
        ['Operations Overview'],
        mobile,
        { expectedQuery: { role: 'manager', claimId } },
      ),
      scenario(
        'evidence-operations-mobile',
        'evidence-operations-mobile-390x844.png',
        `/app/documents?role=adjuster&selectedClaimId=${claimId}`,
        ['Evidence Operations'],
        mobile,
        { expectedQuery: { role: 'adjuster', selectedClaimId: claimId } },
      ),
    ],
  };
}
