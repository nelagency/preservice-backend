export type OverviewDto = {
    kpi: {
        eventsTotal: number;
        serversActive: number;
        requestWaiting: number;
        revenue: number;
        avgRating: number;
    };
    recentEvents: Array<{
        id: string;
        title: string;
        date: string;
        guests: number;
        status: string;
        amount: number;
        tone: 'yellow' | 'red' | 'slate';
    }>;
    typeBreakdown: Array<{
        label: string;
        value: number;
    }>;
    revenuesMonthly: Array<{
        month: string;
        value: number;
    }>;
    recentActivity: Array<{
        id: string;
        type: 'new' | 'assign' | 'payment' | 'cancel';
        title: string;
        user: string;
        time: string;
        dot: 'green' | 'blue' | 'amber';
    }>;
    performance: Array<{
        label: string;
        value: string;
        delta: string;
    }>;
};
