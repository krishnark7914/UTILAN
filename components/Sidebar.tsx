"use client";

import { Home, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitStats } from "@/lib/types";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

interface SidebarProps {
    stats: HabitStats;
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ stats, isOpen, onClose }: SidebarProps) {
    const navItems = [
        { icon: Home, label: "Dashboard", active: true },
        { icon: TrendingUp, label: "Statistics", active: false },
        { icon: Settings, label: "Settings", active: false },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Navigation</h2>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                            item.active
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Today's Stats</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm">Total Habits</span>
                        <span className="text-lg font-bold">{stats.totalHabits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm">Completed Today</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {stats.completedToday}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm">Current Streak</span>
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {stats.currentStreak}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    // Mobile: render as Sheet
    if (isOpen !== undefined) {
        return (
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="left" className="p-0 w-64">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    {sidebarContent}
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop: render as fixed sidebar
    return (
        <aside className="hidden md:flex w-64 border-r bg-background flex-col">
            {sidebarContent}
        </aside>
    );
}
