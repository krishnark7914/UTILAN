"use client";

import { Habit } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface HabitCardProps {
    habit: Habit;
    onToggle: (id: string, date: string) => void;
    onDelete: (id: string) => void;
    todayString: string;
}

export function HabitCard({ habit, onToggle, onDelete, todayString }: HabitCardProps) {
    const todayCompletion = habit.completions.find((c) => c.date === todayString);
    const isCompletedToday = todayCompletion?.completed || false;

    // Calculate completion rate for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
    });

    const completedInLast7Days = last7Days.filter((date) => {
        const completion = habit.completions.find((c) => c.date === date);
        return completion?.completed;
    }).length;

    const completionRate = (completedInLast7Days / 7) * 100;

    return (
        <Card className="relative overflow-hidden">
            <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: habit.color }}
            />
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{habit.name}</CardTitle>
                        {habit.description && (
                            <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(habit.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`habit-${habit.id}`}
                            checked={isCompletedToday}
                            onCheckedChange={() => onToggle(habit.id, todayString)}
                        />
                        <label
                            htmlFor={`habit-${habit.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Complete today
                        </label>
                    </div>
                    {habit.streak > 0 && (
                        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                            <Flame className="h-4 w-4" />
                            <span className="text-sm font-bold">{habit.streak}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Last 7 days</span>
                        <span>{completedInLast7Days}/7</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                </div>

                <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded-md bg-muted capitalize">
                        {habit.frequency}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
