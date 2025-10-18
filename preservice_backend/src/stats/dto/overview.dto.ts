// src/stats/dto/overview.dto.ts
export type OverviewDto = {
    kpi: {
        eventsTotal: number;
        serversActive: number;
        requestWaiting: number;
        revenue: number;        // en EUR
        avgRating: number;      // 1..5
    };
    recentEvents: Array<{
        id: string;
        title: string;
        date: string;           // ISO
        guests: number;
        status: string;         // ex: confirme | en_attente | ...
        amount: number;         // si absent côté Event => 0
        tone: 'yellow' | 'red' | 'slate';
    }>;
    typeBreakdown: Array<{ label: string; value: number }>;
    revenuesMonthly: Array<{ month: string; value: number }>; // ex {month:"2025-01", value: 4500}
    recentActivity: Array<{ id: string; type: 'new' | 'assign' | 'payment' | 'cancel'; title: string; user: string; time: string; dot: 'green' | 'blue' | 'amber' }>;
    performance: Array<{ label: string; value: string; delta: string }>;
};