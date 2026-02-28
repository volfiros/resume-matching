import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { userId: v.string(), title: v.string(), description: v.string() },
  handler: async (ctx, { userId, title, description }) => {
    return await ctx.db.insert("jobs", {
      userId,
      title,
      description,
      createdAt: Date.now(),
    });
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db.get(jobId);
  },
});
