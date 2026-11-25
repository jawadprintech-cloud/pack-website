import { healthHandler as handler } from "../../lib/packlegacy-mcp/metadata-routes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export { handler as GET, handler as HEAD, handler as OPTIONS, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };

