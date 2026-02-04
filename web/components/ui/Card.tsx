'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from './Button';

interface CardProps extends HTMLMotionProps<"div"> {
    glass?: boolean;
}

export function Card({ className, glass = false, children, ...props }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-2xl border p-6 shadow-sm",
                glass
                    ? "bg-white/50 dark:bg-black/50 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50"
                    : "bg-card text-card-foreground border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}
