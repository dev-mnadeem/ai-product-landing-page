import { NextResponse } from "next/server";
import { loadConfig } from "@/lib/config";
import { TOTAL_SECTIONS } from "@/lib/workflow/navigation";

export const dynamic = "force-dynamic";

/**
 * Liveness plus the one piece of configuration worth knowing from outside:
 * which strategy provider the running instance resolved to. The key itself is
 * never echoed.
 */
export async function GET() {
  const config = loadConfig();
  return NextResponse.json({
    status: "ok",
    strategyProvider: config.providerName,
    sections: TOTAL_SECTIONS,
  });
}
