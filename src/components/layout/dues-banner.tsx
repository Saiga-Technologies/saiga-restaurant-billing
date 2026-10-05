import { AlertTriangle } from "lucide-react";

/** Red warning stripe shown across the top of every billing page. */
export function DuesBanner() {
  return (
    <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium text-center">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        Due to non-payment of dues, the billing system will stop functioning
        shortly.
      </span>
    </div>
  );
}
