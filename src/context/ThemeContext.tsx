"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
            {children}
        </NextThemesProvider>
    );
}

export function useTheme() {
    const { theme, setTheme } = useNextTheme();

    return {
        theme: (theme || 'light') as 'light' | 'dark',
        toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark')
    };
}
