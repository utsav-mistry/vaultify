import { useEffect } from 'react';

export default function useScrollLock(enabled) {
    useEffect(() => {
        if (!enabled) {
            document.body.style.setProperty('position', '', 'important');
            document.body.style.setProperty('top', '', 'important');
            document.body.style.setProperty('width', '', 'important');
            document.body.style.setProperty('overflow-y', '', 'important');
            window.scrollTo(0, parseInt(document.body.dataset.scrollY || '0', 10));
            return;
        }

        const scrollY = window.scrollY;
        document.body.dataset.scrollY = scrollY;
        document.body.style.setProperty('position', 'fixed', 'important');
        document.body.style.setProperty('top', `-${scrollY}px`, 'important');
        document.body.style.setProperty('width', '100%', 'important');
        document.body.style.setProperty('overflow-y', 'hidden', 'important');
    }, [enabled]);
} 