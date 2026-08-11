import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  const variants = { default: "border-transparent bg-cyan-400/10 text-cyan-300", secondary: "border-transparent bg-white/[0.06] text-slate-300", outline: "border-white/10 text-slate-300", success: "border-transparent bg-emerald-400/10 text-emerald-300", warning: "border-transparent bg-amber-400/10 text-amber-300" };
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)} {...props} />;
}
