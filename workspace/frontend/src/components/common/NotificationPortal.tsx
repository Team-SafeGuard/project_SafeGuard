import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface NotificationPortalProps {
    children: React.ReactNode;
}

export default function NotificationPortal({ children }: NotificationPortalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div
            id="notification-portal-root"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 999999,
                pointerEvents: "none",
            }}
        >
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {children}
            </div>
        </div>,
        document.body
    );
}
