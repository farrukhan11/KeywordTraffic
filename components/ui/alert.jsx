import { cn } from "@/lib/utils";

export function Alert({ className, variant = "default", ...props }) { return <div role="alert" className={cn("relative w-full rounded-lg border p-4 text-sm", variant === "destructive" ? "border-red-400/20 bg-red-400/10 text-red-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200", className)} {...props} />; }
export function AlertTitle({ className, ...props }) { return <h5 className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props} />; }
export function AlertDescription({ className, ...props }) { return <div className={cn("text-sm opacity-90", className)} {...props} />; }
