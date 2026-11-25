import { createPackagingToolsApi } from "../../../lib/packlegacy-mcp/web-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const handler = createPackagingToolsApi();
export { handler as POST, handler as GET, handler as OPTIONS };
