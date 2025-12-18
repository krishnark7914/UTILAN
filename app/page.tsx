"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { HabitList } from "@/components/HabitList";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { StatsTab } from "@/components/StatsTab";
import { useHabits, getTodayString } from "@/hooks/useHabits";
import { HabitStats } from "@/lib/types";

import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'habits' | 'stats' | 'settings'>('habits');
  const { user } = useAuth();
  const { habits, addHabit, deleteHabit, toggleHabitCompletion, isLoaded } = useHabits(user?.email);
  const todayString = getTodayString();

  const stats: HabitStats = useMemo(() => {
    const totalHabits = habits.length;
    const completedToday = habits.filter((h) => {
      const todayCompletion = h.completions.find((c) => c.date === todayString);
      return todayCompletion?.completed;
    }).length;

    const currentStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary animate-pulse flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">H</span>
          </div>
          <div className="text-muted-foreground font-medium">Loading your journey...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex flex-1 flex-col transition-all duration-300">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'habits' && (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-extrabold tracking-tight">Daily Habits</h2>
                    <p className="text-muted-foreground mt-2 text-lg">
                      Small steps lead to big changes. Keep it up!
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
              </>
            )}

            {activeTab === 'stats' && (
              <>
                <div className="flex flex-col gap-2">
                  <h2 className="text-4xl font-extrabold tracking-tight">Success Stats</h2>
                  <p className="text-muted-foreground text-lg">
                    Track your progress and celebrate your wins.
                  </p>
                </div>
                <StatsTab stats={stats} habits={habits} />
              </>
            )}

            {activeTab === 'settings' && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-muted-foreground max-w-md">
                  Settings are being polished. Soon you'll be able to customize notifications, export data, and more.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
