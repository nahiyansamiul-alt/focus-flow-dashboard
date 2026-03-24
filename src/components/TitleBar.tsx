const electron = (window as any).electron;

const TitleBar = () => {
  if (!electron?.isElectron) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-8 z-50 flex items-center justify-end select-none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          onClick={() => electron.windowMinimize()}
          className="h-8 w-12 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" />
          </svg>
        </button>
        <button
          onClick={() => electron.windowMaximize()}
          className="h-8 w-12 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Maximize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="9" height="9" />
          </svg>
        </button>
        <button
          onClick={() => electron.windowClose()}
          className="h-8 w-12 flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          title="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
            <line x1="0" y1="0" x2="10" y2="10" />
            <line x1="10" y1="0" x2="0" y2="10" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
