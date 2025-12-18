"use client";

import { useState, useEffect, useMemo } from "react";
import { Habit, HabitCompletion } from "@/lib/types";

export function useHabits(userEmail?: string) {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Dynamic storage key based on user email
    const storageKey = useMemo(() => {
        return userEmail ? `utilan-data-${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : "utilan-data-guest";
    }, [userEmail]);

    // Load habits from localStorage whenever the storageKey changes
    useEffect(() => {
        setIsLoaded(false);
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setHabits(parsed);
            } catch (error) {
                console.error("Failed to parse habits from localStorage:", error);
                setHabits([]);
            }
        } else {
            setHabits([]);
        }
        setIsLoaded(true);
    }, [storageKey]);

    // Save habits to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(storageKey, JSON.stringify(habits));
        }
    }, [habits, isLoaded, storageKey]);

    const addHabit = (habit: Omit<Habit, "id" | "createdAt" | "streak" | "completions">) => {
        const newHabit: Habit = {
            ...habit,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            streak: 0,
            completions: [],
        };
        setHabits((prev) => [...prev, newHabit]);
    };

    const deleteHabit = (id: string) => {
        setHabits((prev) => prev.filter((h) => h.id !== id));
    };

    const toggleHabitCompletion = (id: string, date: string) => {
        setHabits((prev) =>
            prev.map((habit) => {
                if (habit.id !== id) return habit;

                const existingCompletion = habit.completions.find((c) => c.date === date);
                let newCompletions: HabitCompletion[];

                if (existingCompletion) {
                    // Toggle existing completion
                    newCompletions = habit.completions.map((c) =>
                        c.date === date ? { ...c, completed: !c.completed } : c
                    );
                } else {
                    // Add new completion
                    newCompletions = [...habit.completions, { date, completed: true }];
                }

                // Calculate streak
                const streak = calculateStreak(newCompletions);

                return {
                    ...habit,
                    completions: newCompletions,
                    streak,
                };
            })
        );
    };

    const updateHabit = (id: string, updates: Partial<Habit>) => {
        setHabits((prev) =>
            prev.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit))
        );
    };

    return {
        habits,
        addHabit,
        deleteHabit,
        toggleHabitCompletion,
        updateHabit,
        isLoaded,
    };
}

function calculateStreak(completions: HabitCompletion[]): number {
    if (completions.length === 0) return 0;

    // Sort completions by date descending
    const sorted = [...completions]
        .filter((c) => c.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sorted.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the most recent completion is today or yesterday
    const mostRecent = new Date(sorted[0].date);
    mostRecent.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) return 0; // Streak broken

    // Count consecutive days
    for (let i = 0; i < sorted.length; i++) {
        const currentDate = new Date(sorted[i].date);
        currentDate.setHours(0, 0, 0, 0);

        if (i === 0) {
            streak = 1;
        } else {
            const prevDate = new Date(sorted[i - 1].date);
            prevDate.setHours(0, 0, 0, 0);
            const diff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diff === 1) {
                streak++;
            } else {
                break;
            }
        }
    }

    return streak;
}

export function getTodayString(): string {
    const today = new Date();
    return today.toISOString().split("T")[0];
}
