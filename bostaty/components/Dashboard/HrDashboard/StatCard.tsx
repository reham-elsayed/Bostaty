import React from 'react';

export function StatCard({ label, value, icon: Icon, colorClass }: { label: string; value: string; icon: React.ElementType; colorClass: string }) {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}
