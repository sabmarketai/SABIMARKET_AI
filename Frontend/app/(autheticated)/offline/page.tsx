import { CloudOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center px-8 pt-20 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo/10 text-indigo">
        <CloudOff size={28} />
      </span>
      <h1 className="font-display text-xl font-semibold text-indigo">No connection right now</h1>
      <p className="mt-2 text-sm text-indigo/50">
        No wahala — pages you&rsquo;ve already opened, and any sales you record, are saved on
        your phone and will sync once you&rsquo;re back online.
      </p>
    </div>
  );
}
