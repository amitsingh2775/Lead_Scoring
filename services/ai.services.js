
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


async function getAiAnalysis(lead, offer) {
  // Select model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // Prepare the prompt text
  const prompt = `
    Analyze the following prospect based on our product offer.

    Our Product Offer:
    - Name: ${offer.name}
    - Value Propositions: ${offer.value_props.join(", ")}
    - Ideal Customer Profile: ${offer.ideal_use_cases.join(", ")}

    Prospect's Details:
    - Role: ${lead.role} at ${lead.company}
    - Industry: ${lead.industry}
    - LinkedIn Bio: ${lead.linkedin_bio}

    Your Task:
    1. Classify the prospect's buying intent as High, Medium, or Low.
    2. Give a short 1-2 sentence reasoning.
    3. Respond ONLY like this: 
       Intent: High | Reasoning: Your explanation
  `;

  try {
    // Get response from AI
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Example AI response: "Intent: High | Reasoning: Prospect is a CEO in target industry."
    let intent = "Low";
    let reasoning = "Not enough information";

    // Split response manually
    const parts = text.split("|");
    if (parts.length === 2) {
      // Extract intent
      const intentText = parts[0].replace("Intent:", "").trim();
      if (intentText === "High" || intentText === "Medium" || intentText === "Low") {
        intent = intentText;
      }
      // Extract reasoning
      reasoning = parts[1].replace("Reasoning:", "").trim();
    }

    // Map intent to points
    let aiPoints = 10; // default
    if (intent === "High") aiPoints = 50;
    else if (intent === "Medium") aiPoints = 30;
    else if (intent === "Low") aiPoints = 10;

    return { intent, aiPoints, reasoning };

  } catch (error) {
    console.error("AI Service Error:", error);
    return { intent: "Low", aiPoints: 10, reasoning: "AI analysis failed." };
  }
}

module.exports = { getAiAnalysis };
