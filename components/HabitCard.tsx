"use client";

import { useState } from "react";
import { Habit } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Flame, ChevronDown } from "lucide-react";

interface HabitCardProps {
    habit: Habit;
    onToggle: (id: string, date: string) => void;
    onDelete: (id: string) => void;
    onOpenDetails: (habit: Habit) => void;
    todayString: string;
}

export function HabitCard({ habit, onToggle, onDelete, onOpenDetails, todayString }: HabitCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate current week starting from Monday
    const getCurrentWeekDays = () => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday, go back 6 days, else go to Monday

        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            return date.toISOString().split("T")[0];
        });
    };

    const currentWeekDays = getCurrentWeekDays();
    const todayDate = new Date().toISOString().split("T")[0];

    return (
        <Card
            className="relative overflow-hidden"
            style={{ backgroundColor: `${habit.color}10` }}
        >
            <div
                className="absolute top-0 left-0 bottom-0 w-1"
                style={{ backgroundColor: habit.color }}
            />
            <CardContent className="p-3 pl-4">
                {/* Compact View */}
                <div className="flex items-center gap-3">
                    <div
                        className="flex-1 min-w-0 cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={() => onOpenDetails(habit)}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate">{habit.name}</span>
                            {habit.streak > 0 && (
                                <div className="flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 shrink-0">
                                    <Flame className="h-3.5 w-3.5" />
                                    <span className="text-xs font-bold">{habit.streak}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Week View - Current Week (Mon-Sun) */}
                    <div className="flex gap-2 shrink-0">
                        {currentWeekDays.map((date) => {
                            const completion = habit.completions.find((c) => c.date === date);
                            const isCompleted = completion?.completed || false;
                            const isToday = date === todayDate;
                            const isFuture = new Date(date) > new Date(todayDate);
                            const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short' })[0];

                            return (
                                <div key={date} className="flex flex-col items-center gap-0.5">
                                    <span
                                        className="text-[10px] font-medium"
                                        style={{ color: isToday ? habit.color : undefined }}
                                    >
                                        {dayLabel}
                                    </span>
                                    <Checkbox
                                        checked={isCompleted}
                                        onCheckedChange={() => onToggle(habit.id, date)}
                                        className="h-4 w-4"
                                        disabled={isFuture}
                                        style={
                                            isCompleted
                                                ? {
                                                    backgroundColor: habit.color,
                                                    borderColor: habit.color,
                                                }
                                                : {}
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''
                                }`}
                        />
                    </Button>
                </div>

                {/* Expanded Details - Month Calendar */}
                {isExpanded && (
                    <div className="mt-3 pt-3 border-t space-y-3">
                        {habit.description && (
                            <p className="text-xs text-muted-foreground">{habit.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded capitalize">
                                {habit.frequency}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(habit.id);
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                            </Button>
                        </div>

                        {/* Current Month Calendar */}
                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-muted-foreground">
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {/* Day headers */}
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                    <div key={i} className="text-center text-[10px] font-medium text-muted-foreground">
                                        {day}
                                    </div>
                                ))}

                                {/* Calendar days */}
                                {(() => {
                                    const today = new Date();
                                    const year = today.getFullYear();
                                    const month = today.getMonth();
                                    const firstDay = new Date(year, month, 1);
                                    const lastDay = new Date(year, month + 1, 0);
                                    const daysInMonth = lastDay.getDate();

                                    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
                                    let firstDayOfWeek = firstDay.getDay();
                                    // Convert to Monday = 0, Sunday = 6
                                    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

                                    const days = [];

                                    // Add empty cells for days before month starts
                                    for (let i = 0; i < firstDayOfWeek; i++) {
                                        days.push(<div key={`empty-${i}`} className="aspect-square" />);
                                    }

                                    // Add days of the month
                                    for (let day = 1; day <= daysInMonth; day++) {
                                        const date = new Date(year, month, day);
                                        const dateString = date.toISOString().split("T")[0];
                                        const completion = habit.completions.find((c) => c.date === dateString);
                                        const isCompleted = completion?.completed || false;
                                        const isToday = dateString === todayDate;

                                        days.push(
                                            <div
                                                key={day}
                                                className={`aspect-square rounded flex items-center justify-center text-[10px] font-medium transition-colors ${isCompleted
                                                    ? 'text-white'
                                                    : isToday
                                                        ? 'bg-muted'
                                                        : 'bg-muted/50 text-muted-foreground'
                                                    }`}
                                                style={
                                                    isCompleted
                                                        ? { backgroundColor: habit.color }
                                                        : isToday
                                                            ? { borderWidth: '1px', borderColor: habit.color }
                                                            : {}
                                                }
                                            >
                                                {day}
                                            </div>
                                        );
                                    }

                                    return days;
                                })()}
                            </div>

                            {/* Month stats */}
                            <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                                <span>This Month</span>
                                <span>
                                    {(() => {
                                        const today = new Date();
                                        const year = today.getFullYear();
                                        const month = today.getMonth();
                                        const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
                                        const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];

                                        const monthCompletions = habit.completions.filter((c) => {
                                            return c.date >= firstDay && c.date <= lastDay && c.completed;
                                        }).length;

                                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                                        const percentage = Math.round((monthCompletions / daysInMonth) * 100);

                                        return `${monthCompletions}/${daysInMonth} (${percentage}%)`;
                                    })()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
