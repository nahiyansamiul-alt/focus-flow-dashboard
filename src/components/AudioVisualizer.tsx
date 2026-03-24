import { useState, useRef, useEffect, useCallback } from "react";
import { Music, Mic, Monitor, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

const BAR_COUNT = 48;
type SourceType = "system" | "mic";

const AudioVisualizer = () => {
  const [isActive, setIsActive] = useState(false);
  const [source, setSource] = useState<SourceType>("system");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const barW = w / BAR_COUNT;
    const step = Math.floor(data.length / BAR_COUNT);

    const style = getComputedStyle(document.documentElement);
    const primary = style.getPropertyValue("--primary").trim();

    for (let i = 0; i < BAR_COUNT; i++) {
      const val = data[i * step] / 255;
      const barH = val * h * 0.85;
      const x = i * barW;
      const opacity = 0.3 + val * 0.7;
      ctx.fillStyle = `hsla(${primary}, ${opacity})`;
      ctx.fillRect(x + 1, h - barH, barW - 2, barH);
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, []);

  const connectStream = useCallback((stream: MediaStream) => {
    const audioCtx = new AudioContext();
    const src = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);

    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;
    streamRef.current = stream;
    setIsActive(true);

    stream.getAudioTracks()[0].onended = () => stop();
    animFrameRef.current = requestAnimationFrame(draw);
  }, [draw]);

  const startSystem = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      stream.getVideoTracks().forEach((t) => t.stop());
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      connectStream(new MediaStream(audioTracks));
    } catch {
      // User cancelled
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      connectStream(stream);
    } catch {
      // Permission denied or no mic
    }
  };

  const start = () => {
    if (source === "mic") startMic();
    else startSystem();
  };

  const stop = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    analyserRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    setIsActive(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(canvas);
    return () => {
      obs.disconnect();
      stop();
    };
  }, [stop]);

  return (
    <div className="border border-border p-6 bg-card h-[185px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
            Audio Visualizer
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!isActive && (
            <div className="flex items-center border border-border rounded overflow-hidden mr-1">
              <button
                onClick={() => setSource("system")}
                className={`p-1 transition-colors ${source === "system" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                title="System audio"
              >
                <Monitor className="h-3 w-3" />
              </button>
              <button
                onClick={() => setSource("mic")}
                className={`p-1 transition-colors ${source === "mic" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                title="Microphone"
              >
                <Mic className="h-3 w-3" />
              </button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={isActive ? stop : start}
            title={isActive ? "Stop" : "Start"}
          >
            {isActive ? (
              <Square className="h-3 w-3 text-destructive" />
            ) : (
              <Play className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-body text-xs text-muted-foreground">
              {source === "mic" ? "Click play to use microphone" : "Click play to capture system audio"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioVisualizer;
