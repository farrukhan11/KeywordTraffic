import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", size = "default", asChild = false, ...props }) {
  const styles = {
    default: "bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-950/20 hover:bg-cyan-300",
    secondary: "bg-white/[0.06] text-slate-100 hover:bg-white/[0.1]",
    outline: "border border-white/10 bg-transparent text-slate-200 hover:bg-white/[0.06]",
    ghost: "text-slate-400 hover:bg-white/[0.06] hover:text-white",
    destructive: "bg-red-500 text-white hover:bg-red-400",
  };
  const sizes = { default: "h-10 px-4 py-2", sm: "h-8 rounded-md px-3 text-xs", lg: "h-11 rounded-xl px-6", icon: "h-10 w-10" };
  const classNameValue = cn("inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50 disabled:pointer-events-none disabled:opacity-50", styles[variant], sizes[size], className);
  if (asChild) return <span className={classNameValue} {...props} />;
  return <button className={classNameValue} {...props} />;
}
