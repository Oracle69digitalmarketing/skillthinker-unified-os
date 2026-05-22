import { NextResponse } from 'next/server';
import { TiDBService } from '../../../../lib/tidb';

export async function GET() {
  try {
    const rows: any = await TiDBService.query(
      "SELECT id, whatsapp_number, current_goal, credit_score FROM users ORDER BY id DESC LIMIT 50", 
      []
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
