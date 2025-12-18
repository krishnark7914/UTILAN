"use client";

import { Home, TrendingUp, Settings, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    activeTab: 'habits' | 'stats' | 'settings';
    onTabChange: (tab: 'habits' | 'stats' | 'settings') => void;
}

export function Sidebar({ isOpen, onClose, activeTab, onTabChange }: SidebarProps) {
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { id: 'habits', icon: Home, label: "Habits" },
        { id: 'stats', icon: TrendingUp, label: "Statistics" },
        { id: 'settings', icon: Settings, label: "Settings" },
    ] as const;

    const sidebarContent = (
        <div className="flex flex-col h-full bg-sidebar no-scrollbar">
            <div className="p-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-primary-foreground font-bold text-lg">U</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight">UTILAN</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1.5 mt-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onTabChange(item.id);
                            onClose?.();
                        }}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                            activeTab === item.id
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <item.icon className={cn(
                            "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                            activeTab === item.id ? "text-primary-foreground" : "text-muted-foreground"
                        )} />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-sidebar-border bg-sidebar-accent/30">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-4 py-6 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                    onClick={toggleTheme}
                >
                    {theme === "light" ? (
                        <>
                            <Moon className="h-5 w-5" />
                            <span className="font-medium">Dark Mode</span>
                        </>
                    ) : (
                        <>
                            <Sun className="h-5 w-5" />
                            <span className="font-medium">Light Mode</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );

    // Mobile: render as Sheet
    if (isOpen !== undefined) {
        return (
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="left" className="p-0 w-72 border-r-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    {sidebarContent}
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop: render as fixed sidebar
    return (
        <aside className="hidden md:flex w-72 border-r bg-sidebar flex-col sticky top-0 h-screen">
            {sidebarContent}
        </aside>
    );
}
