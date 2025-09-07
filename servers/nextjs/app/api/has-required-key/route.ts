import { NextResponse } from "next/server";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  const userConfigPath = process.env.USER_CONFIG_PATH;

  let openaiKeyFromFile = "";
  let googleKeyFromFile = "";
  if (userConfigPath && fs.existsSync(userConfigPath)) {
    try {
      const raw = fs.readFileSync(userConfigPath, "utf-8");
      const cfg = JSON.parse(raw || "{}");
      openaiKeyFromFile = cfg?.OPENAI_API_KEY || "";
      googleKeyFromFile = cfg?.GOOGLE_API_KEY || "";
    } catch {}
  }

  const openaiKeyFromEnv = process.env.OPENAI_API_KEY || "";
  const googleKeyFromEnv = process.env.GOOGLE_API_KEY || "";
  const hasOpenAI = Boolean((openaiKeyFromFile || openaiKeyFromEnv).trim());
  const hasGoogle = Boolean((googleKeyFromFile || googleKeyFromEnv).trim());
  const hasKey = hasOpenAI || hasGoogle;

  return NextResponse.json({ hasKey });
} 