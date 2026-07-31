import { getAggregatedKnowledge } from "./lib/ask/knowledgeAggregator.js";
import { answerQuestion } from "./lib/ask/askEngine.js";
import fs from "fs";

const envContent = fs.readFileSync(".env", "utf-8");
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
});

async function main() {
  console.log("Testing getAggregatedKnowledge()...");
  const kb = await getAggregatedKnowledge();
  console.log("Projects count:", kb.projects?.length);
  console.log("Research papers count:", kb.researchPapers?.length);
  console.log("Skills count:", kb.skills?.length);
  console.log("Certifications count:", kb.certifications?.length);
  console.log("Experience count:", kb.experience?.length);
  console.log("Education count:", kb.education?.length);

  console.log("\nTesting AI Assistant Engine Queries:");
  const testQueries = [
    "Who is Vedaang?",
    "Tell me about Aegis Care.",
    "Tell me about Posture Sense.",
    "What research has he published?",
    "What backend technologies does he use?",
    "Certifications?"
  ];

  for (const q of testQueries) {
    console.log(`\n--- QUERY: "${q}" ---`);
    const ans = answerQuestion(q, kb);
    console.log(ans);
  }
}

main().catch(console.error);
