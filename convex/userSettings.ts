import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getApiKey = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return settings?.geminiApiKey ?? null;
  },
});

export const saveApiKey = mutation({
  args: { userId: v.string(), geminiApiKey: v.string() },
  handler: async (ctx, { userId, geminiApiKey }) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { geminiApiKey });
    } else {
      await ctx.db.insert("userSettings", { userId, geminiApiKey });
    }
  },
});
