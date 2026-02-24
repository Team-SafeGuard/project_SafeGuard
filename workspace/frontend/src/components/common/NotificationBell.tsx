import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getToken } from '../../utils/api';
import NotificationPortal from './NotificationPortal';
import './NotificationBell.css';

/**
 * Local API Definition
 */
const notificationAPI = {
    getList: async () => {
        const token = getToken();
        if (!token) return { notifications: [], unreadCount: 0 };
        const res = await fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return res.json();
    },
    markAsRead: async (id: number) => {
        const token = getToken();
        if (!token) return;
        await fetch(`/api/notifications/${id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
};

interface Notification {
    notificationId: number;
    type: 'STATUS' | 'ANSWER' | 'MANAGER' | 'success' | 'info' | 'warning';
    message: string;
    isRead: boolean;
    createdAt: string | number; // Support number timestamp
    complaintNo?: number;
    action?: string; // For distinguishing create/update
    event?: string;
    status?: string; // New field for robust mapping
    newStatus?: string; // New field for robust mapping
    data?: any; // New field for robust mapping
}

const mapStatusToKorean = (raw: unknown): string => {
    const normalized = String(raw ?? '')
        .toUpperCase()
        .replace(/[^A-Z_]/g, ' ')   // Remove all non-alphabets/underscore
        .trim();

    // Use tokens (e.g., "STATUS IN_PROGRESS" -> we want "IN_PROGRESS")
    const tokens = normalized.split(/\s+/).filter(Boolean);

    // Prioritize known keys
    const pick =
        tokens.find(t => ['UNPROCESSED', 'PENDING', 'RECEIVED', 'REPORTED', 'SUBMITTED', 'PROCESSING', 'IN_PROGRESS', 'INPROGRESS', 'COMPLETED', 'DONE', 'RESOLVED'].includes(t))
        || tokens[0]
        || '';

    // Normalize variations
    const key = pick === 'INPROGRESS' ? 'IN_PROGRESS' : pick;

    switch (key) {
        case 'UNPROCESSED': return '미처리';
        case 'PENDING': return '미처리';
        case 'RECEIVED': return '미처리';
        case 'REPORTED': return '미처리';
        case 'SUBMITTED': return '미처리';

        case 'PROCESSING': return '처리중';
        case 'IN_PROGRESS': return '처리중';

        case 'COMPLETED': return '처리완료';
        case 'DONE': return '처리완료';
        case 'RESOLVED': return '처리완료';

        // Direct Korean fallback if regex failed initially (less likely here but safe)
        case '미처리': return '미처리';
        case '처리중': return '처리중';
        case '처리완료': return '처리완료';

        default: return '';
    }
};

const getTitleAndDesc = (notif: Notification) => {
    let title = "";
    // FORCE notif.message for NON-STATUS if needed, but here we reset it
    let description = "";

    // Robust Detection: Check type OR content pattern
    const isStatusType =
        notif.type === 'STATUS' ||
        (notif.message && notif.message.includes("민원 상태가")) ||
        (notif.message && /'(UNPROCESSED|PENDING|PROCESSING|IN_PROGRESS|COMPLETED|DONE)'/.test(notif.message));

    if (isStatusType) {
        let koreanStatus = "";

        // 1. Try explicit fields first
        const potentialStatus =
            notif.newStatus ||
            notif.status ||
            notif.data?.newStatus ||
            notif.data?.status;

        let mapped = mapStatusToKorean(potentialStatus);

        // 2. If no direct field, try extracting from message with expanded regex
        if (!mapped) {
            const msgObj = (notif.message || "").toUpperCase();
            // Expanded regex for robustness
            const match = msgObj.match(/(UNPROCESSED|PENDING|RECEIVED|REPORTED|SUBMITTED|PROCESSING|IN_PROGRESS|INPROGRESS|COMPLETED|DONE|RESOLVED)/i);
            if (match) {
                mapped = mapStatusToKorean(match[0]);
            }
        }

        // 3. Fallback: If still nothing mapped, use raw message normalization
        if (!mapped) {
            mapped = mapStatusToKorean(notif.message);
        }

        // 4. Final check: If success, use it. If failed, force "상태 변경".
        if (mapped) {
            koreanStatus = mapped;
        } else {
            koreanStatus = "상태 변경";
        }

        title = `민원 상태가 "${koreanStatus}"로 변경되었습니다`;
        description = "담당 기관에서 민원 상태를 업데이트했습니다.";

    } else if (notif.type === 'ANSWER') {
        const content = (notif.message || "").toLowerCase();
        const action = notif.action || notif.event;

        const isUpdate =
            content.includes("수정") ||
            content.includes("update") ||
            content.includes("modify") ||
            (action && (String(action).toUpperCase().includes("UPDATE") || String(action).toUpperCase().includes("EDIT")));

        if (isUpdate) {
            title = '답변이 수정되었습니다';
            description = "민원에 대한 담당자 답변이 수정되었습니다.";
        } else {
            title = '답변이 등록되었습니다';
            description = "민원에 대한 담당자 답변이 등록되었습니다.";
        }

    } else if (notif.type === 'MANAGER') {
        title = '담당자가 배정되었습니다';
        description = `담당자: ${notif.message.replace(/^.*:/, '').trim()}`;
        if (description === "담당자: " + notif.message.trim()) {
            description = `담당자: ${notif.message}`;
        }
    } else {
        // For other types, use message but ensure it's not empty
        title = notif.message || "알림";
        description = "";
    }

    return { title, description };
};

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotif, setShowNotif] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;

    // Toast State
    const [toast, setToast] = useState<{ open: boolean; title: string; desc: string; type: string } | null>(null);

    // Context / Refs
    const coordsState = useState({ top: 0, left: 0 });
    const [coords, setCoords] = coordsState; // keeping original name

    // UI State for Portal Positioning
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null); // For scroll reset

    const token = getToken();
    const navigate = useNavigate();

    // Persist Key Helper
    const getStorageKey = () => {
        const uid = localStorage.getItem('userId');
        return uid ? `mm_notifications_v1_${uid}` : null;
    };

    // 0. Load from LocalStorage on Mount
    useEffect(() => {
        const key = getStorageKey();
        if (!key) return;

        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    const now = Date.now();
                    const threeDays = 3 * 24 * 60 * 60 * 1000;

                    // Filter expired & Deduplicate by ID
                    const validMap = new Map();

                    parsed.forEach((n: any) => {
                        const d = new Date(n.createdAt);
                        const time = d.getTime();
                        if (!isNaN(time) && (now - time < threeDays)) {
                            validMap.set(n.notificationId, n);
                        }
                    });

                    const valid = Array.from(validMap.values()).sort((a: any, b: any) => {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    });

                    if (valid.length > 0) {
                        setNotifications(valid as Notification[]);
                    }
                }
            }
        } catch (e) {
            console.error("Failed to load notifications", e);
        }
    }, []);

    // 0.5 Save and update Unread Count correctly on Change
    useEffect(() => {
        // Recalculate unread count strictly
        const realUnread = notifications.filter(n => !n.isRead).length;
        setUnreadCount(realUnread);

        const key = getStorageKey();
        if (key) {
            localStorage.setItem(key, JSON.stringify(notifications));
        }

        // Page Correction
        const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));
        if (page > totalPages) setPage(totalPages);

    }, [notifications]);

    const showToastMessage = (notif: Notification) => {
        const { title, description } = getTitleAndDesc(notif);
        setToast({ open: true, title, desc: description, type: notif.type });

        // Auto hide after 2s
        setTimeout(() => {
            setToast(null);
        }, 2000);
    };

    // 1. Calculate Custom Position Logic
    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Panel Width from CSS is 380px
            const panelWidth = 380;
            const gap = 12;

            const top = rect.bottom + gap;
            // Align nicely to the right of the button but within viewport
            // Try to align the right edge of panel with right edge of button (offset by a bit)
            const rightEdgePreferred = rect.right + 10;
            let left = rightEdgePreferred - panelWidth;

            // Boundary checks
            const maxLeft = window.innerWidth - panelWidth - 20; // 20px padding from right window edge
            if (left > maxLeft) left = maxLeft;
            if (left < 10) left = 10;

            setCoords({ top, left });
        }
    };

    useLayoutEffect(() => {
        if (showNotif) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
        }
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [showNotif]);

    // 2. Click Outside Logic
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
                return;
            }
            if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
                return;
            }
            setShowNotif(false);
        };

        if (showNotif) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showNotif]);

    // 3. SSE Connection
    // 3. SSE Connection
    useEffect(() => {
        if (!token) return;
        const sourceUrl = `/api/notifications/subscribe?token=${token}`;
        const eventSource = new EventSource(sourceUrl);

        eventSource.onopen = () => console.log("SSE Connected");

        // We ignore 'unreadCount' event from server because it might be wrong/stale.
        // We calculate it locally.
        // eventSource.addEventListener('unreadCount', ...); 

        eventSource.addEventListener('notification', (e: MessageEvent) => {
            try {
                const newNotif = JSON.parse(e.data);

                // FORCE: Always accept statuses, even if unknown
                // Deduplicate by ID just in case
                setNotifications((prev) => {
                    if (prev.some(n => n.notificationId === newNotif.notificationId)) return prev;
                    return [newNotif, ...prev];
                });

                // Unread count is updated by useEffect listener on notifications change

                // Show toast
                showToastMessage(newNotif);
            } catch (err) { console.error(err); }
        });

        return () => {
            eventSource.close();
        };
    }, [token]);

    // 4. Handlers
    const toggleNotif = async () => {
        if (!showNotif) {
            updatePosition();
            setPage(1); // Reset page on open
            try {
                const data = await notificationAPI.getList();
                if (data.notifications && Array.isArray(data.notifications)) {
                    // Creating Map for easy deduplication merging
                    setNotifications(prev => {
                        const mergedMap = new Map();
                        // Add existing (local newest)
                        prev.forEach(n => mergedMap.set(n.notificationId, n));
                        // Add server (might overwrite, that's fine for sync)
                        data.notifications.forEach((n: any) => mergedMap.set(n.notificationId, n));

                        return Array.from(mergedMap.values()).sort((a: any, b: any) => {
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        }) as Notification[];
                    });
                }
                // We calculate unread count from this merged list in useEffect
            } catch (e) { console.error(e); }
        }
        setShowNotif(!showNotif);
    };

    const handleRead = async (notif: Notification) => {
        if (!notif.isRead) {
            try {
                await notificationAPI.markAsRead(notif.notificationId);
                setNotifications(prev => prev.map(n => n.notificationId === notif.notificationId ? { ...n, isRead: true } : n));
            } catch (e) { console.error(e); }
        }
        if (notif.complaintNo) {
            navigate(`/reports/${notif.complaintNo}`);
            setShowNotif(false);
        }
    };

    const handleReadAll = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.notificationId);
        if (unreadIds.length === 0) return;

        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

        try { await Promise.all(unreadIds.map(id => notificationAPI.markAsRead(id))); }
        catch (e) { console.error(e); }
    };

    const handleDelete = async (e: React.MouseEvent, notifId: number) => {
        e.stopPropagation();
        try {
            await notificationAPI.markAsRead(notifId);
            setNotifications(prev => prev.filter(n => n.notificationId !== notifId));
        } catch (e) { console.error(e); }
    };

    const scrollToTop = () => {
        if (listRef.current) listRef.current.scrollTop = 0;
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(p => p - 1);
            scrollToTop();
        }
    };

    const handleNextPage = () => {
        const totalPages = Math.ceil(notifications.length / PAGE_SIZE);
        if (page < totalPages) {
            setPage(p => p + 1);
            scrollToTop();
        }
    };

    // 5. Helpers (Formatters)

    // Safe Date Parsing
    const parseNotificationDate = (timestamp: string | number): Date | null => {
        if (!timestamp) return null;

        // 1. Check if it seems like a number (timestamp)
        // Convert to string first to be safe, then check format
        const strVal = String(timestamp);

        // If it's a pure number or numeric string
        if (!isNaN(Number(strVal))) {
            const num = Number(strVal);
            // 10 digits (billions) = seconds (e.g. 1700000000) -> * 1000
            // 13 digits (trillions) = milliseconds (e.g. 1700000000000) -> use as is
            if (num < 10000000000) {
                return new Date(num * 1000);
            }
            return new Date(num);
        }

        // 2. Try standard Date constructor for ISO strings
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return null;

        return date;
    };

    const formatTime = (dateStr: string | number) => {
        const date = parseNotificationDate(dateStr);
        if (!date) return '방금 전'; // Fallback for invalid date

        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

        if (diff < 60) return '방금 전';
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;

        // YYYY.MM.DD format
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    const getDotColorClass = (notif: Notification) => {
        // Robust check for STATUS type by content as well
        if (notif.type === 'STATUS' ||
            (notif.message && notif.message.includes("민원 상태가")) ||
            (notif.message && /'(UNPROCESSED|PENDING|PROCESSING|IN_PROGRESS|COMPLETED|DONE)'/.test(notif.message))) {
            return 'green';
        }

        switch (notif.type) {
            case 'success': return 'green';
            case 'ANSWER': case 'info': return 'blue';
            case 'MANAGER': case 'warning': return 'orange';
            default: return 'blue';
        }
    };



    if (!token) return null;

    // Pagination Calculation
    const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));
    const currentItems = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <>
            {/* Toast Notification (Fixed Overlay) */}
            {toast && toast.open && (
                <div className="nb-toast">
                    <div className="nb-toast-icon">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div className="nb-toast-content">
                        <div className="nb-toast-title">{toast.title}</div>
                        <div className="nb-toast-desc">{toast.desc}</div>
                    </div>
                </div>
            )}

            {/* --- Bell Button --- */}
            <button
                ref={buttonRef}
                onClick={toggleNotif}
                className="nb-bell-btn"
                aria-label="알림"
            >
                <Bell className="nb-bell-icon" />
                {unreadCount > 0 && (
                    <div className="nb-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </button>

            {/* --- Portal & Panel --- */}
            {showNotif && (
                <NotificationPortal>
                    <div
                        ref={dropdownRef}
                        className="nb-dropdown-panel"
                        style={{
                            position: 'fixed',
                            top: coords.top,
                            left: coords.left
                        }}
                    >
                        {/* Header */}
                        <div className="nb-header">
                            <div className="nb-header-title">알림</div>
                            <div className="nb-header-actions">
                                {unreadCount > 0 && (
                                    <button onClick={handleReadAll} className="nb-btn-readall">
                                        모두 읽음
                                    </button>
                                )}
                                <button onClick={() => setShowNotif(false)} className="nb-btn-close">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="nb-list" ref={listRef}>
                            {notifications.length === 0 ? (
                                <div className="nb-empty">
                                    <Bell className="nb-empty-icon" />
                                    <span className="nb-empty-text">새로운 알림이 없습니다</span>
                                </div>
                            ) : (
                                <>
                                    {currentItems.map((notif) => {
                                        const { title, description } = getTitleAndDesc(notif);
                                        const dotColor = getDotColorClass(notif);
                                        const readClass = notif.isRead ? 'read' : 'unread';

                                        return (
                                            <div
                                                key={notif.notificationId}
                                                onClick={() => handleRead(notif)}
                                                className={`nb-item ${readClass}`}
                                            >
                                                {/* Status Dot */}
                                                <div className={`nb-dot ${dotColor}`} />

                                                {/* Content */}
                                                <div className="nb-item-content">
                                                    <h4 className="nb-item-title">{title}</h4>
                                                    <p className="nb-item-desc">{description}</p>
                                                    <span className="nb-item-time">{formatTime(notif.createdAt)}</span>
                                                </div>

                                                {/* Delete Button (visible on hover) */}
                                                <button
                                                    onClick={(e) => handleDelete(e, notif.notificationId)}
                                                    className="nb-btn-delete"
                                                    title="삭제"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        {/* Pagination */}
                        {notifications.length > 0 && (
                            <div className="nb-pagination">
                                <button
                                    className="nb-page-btn"
                                    onClick={handlePrevPage}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="nb-page-info">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    className="nb-page-btn"
                                    onClick={handleNextPage}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </NotificationPortal>
            )}
        </>
    );
}
