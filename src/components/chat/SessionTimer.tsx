import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionTimerProps {
    startTime: string | Date;
    duration: number; // in milliseconds
    onExpire: () => void;
    className?: string;
}

export function SessionTimer({ startTime, duration, onExpire, className }: SessionTimerProps) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const start = new Date(startTime).getTime();
        const end = start + duration;

        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, end - now);
            setTimeLeft(remaining);

            if (remaining === 0) {
                onExpire();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [startTime, duration, onExpire]);

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    const isLowTime = timeLeft < 60000; // Less than 1 minute

    return (
        <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
            isLowTime ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-gold/10 text-gold border border-gold/20",
            className
        )}>
            <Clock className={cn("w-3 h-3", isLowTime && "animate-pulse")} />
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
    );
}




