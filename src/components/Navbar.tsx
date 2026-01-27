"use client";

import Link from 'next/link';
import { useState } from 'react';

import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-[var(--navy)]/90 backdrop-blur-sm border-b border-foreground/10 text-foreground transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex flex-col items-center justify-center bg-black/30 rounded-lg p-2 hover:bg-black/50 transition-colors">
                            <div className="text-2xl font-bold leading-none tracking-tighter">
                                <span className="text-brand-orange">D</span>
                                <span className="text-foreground">T</span>
                                <span className="text-foreground">I</span>
                            </div>
                            <span className="text-[10px] tracking-widest uppercase mt-0.5">
                                <span className="text-brand-orange">Duyves</span>
                                <span className="text-foreground">TI</span>
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <Link href="/" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Inicio
                            </Link>
                            <Link href="#servicios" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Servicios
                            </Link>
                            <Link href="#contacto" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Contacto
                            </Link>
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-300 hover:text-white p-2"
                        >
                            <span className="sr-only">Open menu</span>
                            {isMenuOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>

                        <div className="ml-2 inline-block">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {
                isMenuOpen && (
                    <div className="md:hidden bg-[var(--navy)] border-t border-foreground/10">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link
                                href="/"
                                className="text-foreground/80 hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Inicio
                            </Link>
                            <Link
                                href="#servicios"
                                className="text-foreground/80 hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Servicios
                            </Link>
                            <Link
                                href="#contacto"
                                className="text-foreground/80 hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contacto
                            </Link>
                        </div>
                    </div>
                )
            }
        </nav >
    );
}
