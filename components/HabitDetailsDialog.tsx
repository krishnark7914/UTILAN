"use client";

import { Habit } from "@/lib/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Calendar, Flame, TrendingUp, Award } from "lucide-react";

interface HabitDetailsDialogProps {
    habit: Habit | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function HabitDetailsDialog({ habit, open, onOpenChange }: HabitDetailsDialogProps) {
    if (!habit) return null;

    // Calculate statistics
    const totalCompletions = habit.completions.filter(c => c.completed).length;
    const totalDays = habit.completions.length;
    const overallRate = totalDays > 0 ? (totalCompletions / totalDays) * 100 : 0;

    // Group completions by month
    const completionsByMonth = habit.completions.reduce((acc, completion) => {
        const date = new Date(completion.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) {
            acc[monthKey] = { completed: 0, total: 0 };
        }
        acc[monthKey].total++;
        if (completion.completed) {
            acc[monthKey].completed++;
        }
        return acc;
    }, {} as Record<string, { completed: number; total: number }>);

    // Sort months in descending order
    const sortedMonths = Object.keys(completionsByMonth).sort().reverse();

    // Get recent completions (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
    }).reverse();

    const formatMonthYear = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-1 h-12 rounded-full"
                            style={{ backgroundColor: habit.color }}
                        />
                        <div>
                            <DialogTitle className="text-2xl">{habit.name}</DialogTitle>
                            {habit.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {habit.description}
                                </p>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Key Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted rounded-lg p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Flame className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Streak</span>
                            </div>
                            <div className="text-2xl font-bold">{habit.streak}</div>
                            <div className="text-xs text-muted-foreground">days</div>
                        </div>

                        <div className="bg-muted rounded-lg p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Award className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Total</span>
                            </div>
                            <div className="text-2xl font-bold">{totalCompletions}</div>
                            <div className="text-xs text-muted-foreground">completions</div>
                        </div>

                        <div className="bg-muted rounded-lg p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Rate</span>
                            </div>
                            <div className="text-2xl font-bold">{Math.round(overallRate)}%</div>
                            <div className="text-xs text-muted-foreground">overall</div>
                        </div>

                        <div className="bg-muted rounded-lg p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Calendar className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Frequency</span>
                            </div>
                            <div className="text-lg font-bold capitalize">{habit.frequency}</div>
                        </div>
                    </div>

                    {/* Last 30 Days Calendar */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Last 30 Days</h3>
                        <div className="grid grid-cols-10 gap-1.5">
                            {last30Days.map((date) => {
                                const completion = habit.completions.find(c => c.date === date);
                                const isCompleted = completion?.completed || false;
                                const dayOfMonth = new Date(date).getDate();

                                return (
                                    <div
                                        key={date}
                                        className={`aspect-square rounded flex items-center justify-center text-xs font-medium transition-colors ${isCompleted
                                                ? 'text-white'
                                                : 'bg-muted text-muted-foreground'
                                            }`}
                                        style={isCompleted ? { backgroundColor: habit.color } : {}}
                                        title={date}
                                    >
                                        {dayOfMonth}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Monthly Breakdown */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Monthly History</h3>
                        <div className="space-y-3">
                            {sortedMonths.map((monthKey) => {
                                const stats = completionsByMonth[monthKey];
                                const rate = (stats.completed / stats.total) * 100;

                                return (
                                    <div key={monthKey} className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">
                                                {formatMonthYear(monthKey)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {stats.completed}/{stats.total} ({Math.round(rate)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all"
                                                style={{
                                                    width: `${rate}%`,
                                                    backgroundColor: habit.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
