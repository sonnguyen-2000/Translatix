'use client';

import { useTheme } from '@/contexts/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggleButton() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="fixed top-6 right-6 z-50">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-surface-1/80 backdrop-blur-sm border border-default hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-secondary" />
                ) : (
                    <Moon className="h-5 w-5 text-secondary" />
                )}
            </button>
        </div>
    );
}