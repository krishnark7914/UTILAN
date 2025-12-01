"use client";

import { Habit } from "@/lib/types";
import { HabitCard } from "@/components/HabitCard";

interface HabitListProps {
    habits: Habit[];
    onToggle: (id: string, date: string) => void;
    onDelete: (id: string) => void;
    todayString: string;
}

export function HabitList({ habits, onToggle, onDelete, todayString }: HabitListProps) {
    if (habits.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                    <svg
                        className="h-12 w-12 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
                <p className="text-muted-foreground max-w-sm">
                    Get started by creating your first habit. Click the "Add Habit" button to begin your journey.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((habit) => (
                <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    todayString={todayString}
                />
            ))}
        </div>
    );
}
