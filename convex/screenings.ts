import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
    resumeName: v.string(),
  },
  handler: async (ctx, { jobId, userId, resumeName }) => {
    return await ctx.db.insert("screenings", {
      jobId,
      userId,
      resumeName,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const complete = mutation({
  args: {
    screeningId: v.id("screenings"),
    matchScore: v.number(),
    confidence: v.number(),
    recommendation: v.string(),
    requiresHuman: v.boolean(),
    reasoning: v.string(),
  },
  handler: async (ctx, { screeningId, ...result }) => {
    await ctx.db.patch(screeningId, { status: "complete", ...result });
  },
});

export const fail = mutation({
  args: { screeningId: v.id("screenings") },
  handler: async (ctx, { screeningId }) => {
    await ctx.db.patch(screeningId, { status: "error" });
  },
});

export const listByJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db
      .query("screenings")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .order("desc")
      .collect();
  },
});
