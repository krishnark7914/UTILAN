"use client";

import { HabitStats, Habit } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, CheckCircle2, ListTodo, Trophy, TrendingUp } from "lucide-react";

interface StatsTabProps {
    stats: HabitStats;
    habits: Habit[];
}

export function StatsTab({ stats, habits }: StatsTabProps) {
    const statCards = [
        {
            title: "Total Habits",
            value: stats.totalHabits,
            label: "Tracking",
            icon: ListTodo,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            title: "Completed Today",
            value: stats.completedToday,
            label: "Done",
            icon: CheckCircle2,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-500/10",
        },
        {
            title: "Current Streak",
            value: stats.currentStreak,
            label: "Days",
            icon: Flame,
            color: "text-orange-600 dark:text-orange-400",
            bg: "bg-orange-500/10",
        },
        {
            title: "Longest Streak",
            value: stats.longestStreak,
            label: "Best",
            icon: Trophy,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-500/10",
        },
    ];

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Stats Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 space-y-0 p-3 md:p-6">
                            <CardTitle className="text-[10px] md:text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.bg} ${stat.color} p-1.5 md:p-2 rounded-lg shrink-0`}>
                                <stat.icon className="h-3 w-3 md:h-4 md:w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 md:pt-0 md:p-6">
                            <div className="text-xl md:text-2xl font-black">{stat.value}</div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                                {stat.label}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Performance Card */}
                <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/50">
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Habit Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:pt-0 md:p-6">
                        <div className="space-y-5">
                            {habits.length > 0 ? (
                                habits.map((habit) => {
                                    const completions = habit.completions.filter(c => c.completed).length;
                                    const total = habit.completions.length;
                                    const percentage = total > 0 ? (completions / total) * 100 : 0;

                                    return (
                                        <div key={habit.id} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                                                    <span className="font-bold truncate">{habit.name}</span>
                                                </div>
                                                <span className="text-xs font-black tabular-nums">{Math.round(percentage)}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full transition-all duration-700 ease-out rounded-full"
                                                    style={{ width: `${percentage}%`, backgroundColor: habit.color }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm italic">
                                    No habits to track yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Insight Card */}
                <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Trophy className="h-32 w-32 rotate-12" />
                    </div>
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-lg md:text-xl font-bold">Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-primary opacity-40" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold">Consistency is Key</p>
                            <p className="text-sm text-muted-foreground max-w-[240px]">
                                You're doing great! Complete your habits daily to unlock more detailed insights.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
