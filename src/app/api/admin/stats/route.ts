import { NextResponse } from 'next/server';
import { TiDBService } from '@/lib/tidb';

export async function GET() {
  try {
    const userCountRows: any = await TiDBService.query("SELECT COUNT(*) as count FROM users", []);
    const commissionRows: any = await TiDBService.query("SELECT SUM(amount_due) as total FROM commissions", []);
    const recommendationRows: any = await TiDBService.query("SELECT COUNT(*) as count FROM recommendations", []);
    const clickRows: any = await TiDBService.query("SELECT COUNT(*) as count FROM recommendations WHERE clicked = TRUE", []);

    return NextResponse.json({
      totalUsers: userCountRows[0].count,
      totalRevenue: commissionRows[0].total || 0,
      totalRecommendations: recommendationRows[0].count,
      totalClicks: clickRows[0].count,
      conversionRate: recommendationRows[0].count > 0 
        ? ((clickRows[0].count / recommendationRows[0].count) * 100).toFixed(2) 
        : 0
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
