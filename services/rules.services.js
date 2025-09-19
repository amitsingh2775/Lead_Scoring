

function calculateRuleScore(lead, offer) {
  let score = 0;

  // Convert role and industry to lowercase (for easy matching)
  const role = lead.role.toLowerCase();
  const industry = lead.industry.toLowerCase();

  // Rule 1: Role relevance
  const decisionMakers = ["ceo", "founder", "vp", "head of", "director"];
  const influencers = ["manager", "lead", "senior"];

  // Check if role includes decision maker
  for (let dm of decisionMakers) {
    if (role.includes(dm)) {
      score += 20;
      break; // no need to check further
    }
  }

  // If not decision maker, then check influencers
  if (score === 0) {
    for (let inf of influencers) {
      if (role.includes(inf)) {
        score += 10;
        break;
      }
    }
  }

  // Rule 2: Industry match
  for (let icp of offer.ideal_use_cases) {
    if (industry.includes(icp.toLowerCase())) {
      score += 20;
      break;
    }
  }

  // Rule 3: Data completeness (all fields filled)
  let allFilled = true;
  for (let key in lead) {
    if (!lead[key] || lead[key].trim() === "") {
      allFilled = false;
      break;
    }
  }
  if (allFilled) {
    score += 10;
  }

  return score;
}

module.exports = { calculateRuleScore };
