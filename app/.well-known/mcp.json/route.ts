import { createMetadataHandler } from "../../../lib/packlegacy-mcp/metadata-routes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handler = createMetadataHandler("mcp-card");
export { handler as GET, handler as HEAD, handler as OPTIONS, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };

