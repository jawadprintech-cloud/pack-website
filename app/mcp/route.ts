import { createPackLegacyHandler } from "../../lib/packlegacy-mcp/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const handler = createPackLegacyHandler();
export { handler as POST, handler as GET, handler as DELETE, handler as OPTIONS };
