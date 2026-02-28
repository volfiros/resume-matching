import { StateGraph, END } from "@langchain/langgraph";
import { AgentState } from "./state";
import { skillExtractorNode } from "./nodes/skillExtractor";
import { jobAnalyzerNode } from "./nodes/jobAnalyzer";
import { matcherNode } from "./nodes/matcher";
import { decisionMakerNode } from "./nodes/decisionMaker";

function shouldSkipMatching(state: typeof AgentState.State): "matcher" | "decisionMaker" {
  return state.jobRequirements.isVague ? "decisionMaker" : "matcher";
}

const workflow = new StateGraph(AgentState)
  .addNode("skillExtractor", skillExtractorNode)
  .addNode("jobAnalyzer", jobAnalyzerNode)
  .addNode("matcher", matcherNode)
  .addNode("decisionMaker", decisionMakerNode)
  .addEdge("__start__", "skillExtractor")
  .addEdge("__start__", "jobAnalyzer")
  .addConditionalEdges("jobAnalyzer", shouldSkipMatching, {
    matcher: "matcher",
    decisionMaker: "decisionMaker",
  })
  .addEdge("matcher", "decisionMaker")
  .addEdge("decisionMaker", END);

export const siftGraph = workflow.compile();
