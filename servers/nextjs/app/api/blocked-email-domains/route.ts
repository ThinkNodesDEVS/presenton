import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return NextResponse.json({ domains: [] }, { status: 200 });
    }

    const sql = neon(connectionString);
    const rows = await sql`SELECT domain FROM domain_blacklist`;
    const domains = (rows as { domain: string }[]).map((r) => r.domain.toLowerCase());

    return NextResponse.json({ domains }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ domains: [] }, { status: 200 });
  }
}


