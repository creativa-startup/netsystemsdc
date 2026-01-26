"use client";

import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DynamicBackground() {
    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'settings', 'landing'), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.page_bg) {
                    document.body.style.backgroundColor = data.page_bg;
                    // Also set color? Usually pages have their own text color strategies.
                    // But if page_bg is dark, we might want to default text to white.
                    // Tailwind 'dark' class usually handles this via 'dark:bg-black dark:text-white'.
                    // If we override bg, we should perhaps respect the mode or just let sections handle it.
                    // For now, just setting background color as requested.
                }
            }
        });
        return () => unsub();
    }, []);

    return null; // No UI
}
