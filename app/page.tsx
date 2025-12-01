"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { HabitList } from "@/components/HabitList";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { useHabits, getTodayString } from "@/hooks/useHabits";
import { HabitStats } from "@/lib/types";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { habits, addHabit, deleteHabit, toggleHabitCompletion, isLoaded } = useHabits();
  const todayString = getTodayString();

  const stats: HabitStats = useMemo(() => {
    const totalHabits = habits.length;
    const completedToday = habits.filter((h) => {
      const todayCompletion = h.completions.find((c) => c.date === todayString);
      return todayCompletion?.completed;
    }).length;

    const currentStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

    // Calculate longest streak from all habits
    const longestStreak = habits.reduce((max, habit) => {
      let maxStreak = 0;
      let currentStreak = 0;

      const sortedCompletions = [...habit.completions]
        .filter((c) => c.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      for (let i = 0; i < sortedCompletions.length; i++) {
        if (i === 0) {
          currentStreak = 1;
        } else {
          const prevDate = new Date(sortedCompletions[i - 1].date);
          const currDate = new Date(sortedCompletions[i].date);
          const diff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diff === 1) {
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
          }
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);
      return Math.max(max, maxStreak);
    }, 0);

    return {
      totalHabits,
      completedToday,
      currentStreak,
      longestStreak,
    };
  }, [habits, todayString]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1">
        <Sidebar stats={stats} />
        <Sidebar stats={stats} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">My Habits</h2>
                <p className="text-muted-foreground mt-1">
                  Track your daily habits and build consistency
                </p>
              </div>
              <AddHabitDialog onAdd={addHabit} />
            </div>

            <HabitList
              habits={habits}
              onToggle={toggleHabitCompletion}
              onDelete={deleteHabit}
              todayString={todayString}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
