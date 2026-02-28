import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userSettings: defineTable({
    userId: v.string(),
    geminiApiKey: v.string(),
  }).index("by_user", ["userId"]),

  jobs: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  screenings: defineTable({
    jobId: v.id("jobs"),
    userId: v.string(),
    resumeName: v.string(),
    status: v.union(v.literal("pending"), v.literal("complete"), v.literal("error")),
    matchScore: v.optional(v.number()),
    confidence: v.optional(v.number()),
    recommendation: v.optional(v.string()),
    requiresHuman: v.optional(v.boolean()),
    reasoning: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_job", ["jobId"]),
});
