export function FlowDiagram() {
  return (
    <div className="my-8 overflow-x-auto border border-border bg-code p-6">
      <div className="mx-auto flex min-w-[520px] max-w-[600px] items-start justify-between gap-3">
        {/* Customer */}
        <div className="flex w-[140px] flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-[#1e1e2e]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Customer</p>
            <p className="text-xs text-muted">applies for financing on Allo</p>
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="flex flex-col items-center gap-1 pt-5">
          <svg width="48" height="16" viewBox="0 0 48 16">
            <line x1="0" y1="8" x2="40" y2="8" stroke="#593bce" strokeWidth="1.5" />
            <polygon points="40,3 48,8 40,13" fill="#593bce" />
          </svg>
        </div>

        {/* Allo */}
        <div className="flex w-[140px] flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent bg-accent/10">
            <span className="text-sm font-medium text-accent">Allo</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Allo server</p>
            <p className="text-xs text-muted">sends POST with phone number</p>
          </div>
        </div>

        {/* Arrow 2 - bidirectional */}
        <div className="flex flex-col items-center gap-1 pt-2">
          {/* Forward arrow */}
          <div className="flex flex-col items-center">
            <span className="mb-1 font-mono text-[10px] text-accent">POST</span>
            <svg width="48" height="12" viewBox="0 0 48 12">
              <line x1="0" y1="6" x2="40" y2="6" stroke="#593bce" strokeWidth="1.5" />
              <polygon points="40,2 48,6 40,10" fill="#593bce" />
            </svg>
          </div>
          {/* Return arrow */}
          <div className="flex flex-col items-center">
            <svg width="48" height="12" viewBox="0 0 48 12">
              <line x1="8" y1="6" x2="48" y2="6" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="4 3" />
              <polygon points="8,2 0,6 8,10" fill="#4ade80" />
            </svg>
            <span className="mt-1 font-mono text-[10px] text-green-400">JSON</span>
          </div>
        </div>

        {/* Partner */}
        <div className="flex w-[140px] flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-[#1e1e2e]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Your server</p>
            <p className="text-xs text-muted">checks driver, returns JSON</p>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-muted">
        One direction: Allo calls you. You never call Allo.
      </p>
    </div>
  );
}
