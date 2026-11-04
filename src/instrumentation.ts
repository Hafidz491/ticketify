/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts up.
 * We use this to pre-warm the MongoDB connection so the first
 * user request doesn't pay the cold-start connection penalty (~800ms).
 */
export async function register() {
  // Only run on the Node.js server runtime, not the Edge runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { default: connectToDatabase } = await import('@/lib/mongodb');
      await connectToDatabase();
      console.log('[Ticketify] ✅ MongoDB connection pre-warmed on startup');
    } catch (err) {
      // Non-fatal — app will still work via file-based fallback
      console.warn('[Ticketify] ⚠️  MongoDB pre-warm failed (will use fallback):', err);
    }
  }
}
