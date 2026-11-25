import { createToolPageHandler } from "../../../lib/packlegacy-mcp/web-routes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handler = createToolPageHandler("consolidate");
export { handler as GET, handler as HEAD };
