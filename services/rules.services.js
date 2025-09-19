function calculateRuleScore(lead, offer) {
  let score = 0;

  // Rule 1: Role Relevance
  const role = lead.role.toLowerCase();
  const decisionMakers = ['ceo', 'founder', 'vp', 'head of', 'director'];
  const influencers = ['manager', 'lead', 'senior'];
  if (decisionMakers.some(dm => role.includes(dm))) {
    score += 20;
  } else if (influencers.some(inf => role.includes(inf))) {
    score += 10;
  }

  // Rule 2: Industry Match
  const industry = lead.industry.toLowerCase();
  if (offer.ideal_use_cases.some(icp => industry.includes(icp.toLowerCase()))) {
    score += 20;
  }

  // Rule 3: Data Completeness (Corrected Logic)
  const requiredFields = ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'];
  const isComplete = requiredFields.every(field => {
    const value = lead[field];
    // Check if the value exists and, after converting to a string and trimming, is not empty.
    return value != null && String(value).trim() !== '';
  });

  if (isComplete) {
    score += 10;
  }

  return score;
}

module.exports = { calculateRuleScore };