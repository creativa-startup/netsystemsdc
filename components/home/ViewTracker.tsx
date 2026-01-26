"use client";
import { useEffect } from 'react';
import { doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export default function ViewTracker() {
    useEffect(() => {
        const trackView = async () => {
            // guard to prevent multiple increments in same session
            if (typeof window !== 'undefined' && !sessionStorage.getItem('ns_view_tracked')) {
                try {
                    // 1. Fetch Location Data (IP Geolocation)
                    let city = 'Unknown';
                    try {
                        const res = await fetch('https://ipapi.co/json/');
                        if (res.ok) {
                            const data = await res.json();
                            city = data.city || 'Unknown';
                        }
                    } catch (err) {
                        console.warn("Geolocation service unavailable", err);
                    }

                    const statsRef = doc(db, 'settings', 'stats');
                    const snap = await getDoc(statsRef);

                    if (!snap.exists()) {
                        await setDoc(statsRef, {
                            totalViews: 1,
                            cities: { [city]: 1 }
                        });
                    } else {
                        await updateDoc(statsRef, {
                            totalViews: increment(1),
                            [`cities.${city}`]: increment(1)
                        });
                    }

                    // 2. Track Daily Stats
                    const todayStr = format(new Date(), 'yyyy-MM-dd');
                    const dailyRef = doc(db, 'analytics_daily', todayStr);
                    const dailySnap = await getDoc(dailyRef);

                    // Determine Traffic Source
                    let source = 'direct';
                    const referrer = document.referrer;
                    if (referrer) {
                        const url = new URL(referrer);
                        if (url.hostname.includes('google') ||
                            url.hostname.includes('bing') ||
                            url.hostname.includes('yahoo') ||
                            url.hostname.includes('duckduckgo')) {
                            source = 'organic';
                        } else if (url.hostname !== window.location.hostname) {
                            // Treat other external referrers as direct/other for this simple 2-card split
                            // or we could ignore them. For now, let's keep 'direct' as strictly empty referrer?
                            // User asked for "Direct" vs "Organic". 
                            // Usually "Direct" is empty referrer.
                            // Let's stick to: Search -> Organic, Empty -> Direct. 
                            // If it's a link from elsewhere (facebook, etc), it's technically Referral.
                            // But since we only have 2 cards, maybe we just track those specific ones.
                            // Let's assign 'direct' only if referrer is empty.
                            source = 'referral'; // usage not requested yet, but good to store?
                            // Actually, to make the cards meaningful, maybe we just default to 'direct' if not organic? 
                            // No, Direct has a specific meaning. 
                            // I'll stick to: 
                            // Organic = Search Engines
                            // Direct = Empty Referrer
                            // (Everything else is ignored for these 2 cards, or we classify 'referral' as 'direct' for "Non-Organic")
                        }
                    }

                    // Final decision for the requested cards:
                    // If referrer is empty -> Direct
                    // If referrer is search -> Organic
                    // If referrer is other -> (Do not increment Direct or Organic, just Total Views)

                    let updateData: any = { views: increment(1) };

                    if (!referrer || referrer.includes(window.location.hostname)) {
                        updateData.direct = increment(1);
                    } else if (referrer.match(/google|bing|yahoo|duckduckgo/i)) {
                        updateData.organic = increment(1);
                    }

                    if (!dailySnap.exists()) {
                        await setDoc(dailyRef, {
                            views: 1,
                            direct: (!referrer || referrer.includes(window.location.hostname)) ? 1 : 0,
                            organic: referrer.match(/google|bing|yahoo|duckduckgo/i) ? 1 : 0,
                            date: todayStr
                        });
                    } else {
                        await updateDoc(dailyRef, updateData);
                    }
                    sessionStorage.setItem('ns_view_tracked', 'true');
                } catch (e) {
                    console.error("View tracking error:", e);
                }
            }
        };
        trackView();
    }, []);

    return null;
}
