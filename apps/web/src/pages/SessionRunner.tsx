import { useParams, useNavigate } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { useEffect, useRef, useState } from "react";
import { RitualOverview } from "../components/RitualOverview";

type TabKey = "guide" | "history";

export function SessionRunner() {
  const { sessionId } = useParams();
  const { data, isLoading } = trpc.sessions.getRunner.useQuery({ sessionId: sessionId! });

  const steps = data?.ritual.steps ?? [];
  const ritual = data?.ritual;
  const [i, setI] = useState(0);
  const step = steps[i];

  // playback + UI
  const [started, setStarted] = useState(false);
  const [immersive, setImmersive] = useState(false);

  // video state
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [hasFinishedPlayback, setHasFinishedPlayback] = useState(false);

  // tabs
  const [tab, setTab] = useState<TabKey>("guide");

  // auto-hide controls
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<number | null>(null);
  const HIDE_MS = 2500;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };
  const kickHideTimer = () => {
    clearHideTimer();
    if (hasStartedPlayback && !isBuffering && !hasFinishedPlayback) {
      hideTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
        hideTimerRef.current = null;
      }, HIDE_MS);
    }
  };
  const revealAndMaybeHide = () => {
    setShowControls(true);
    kickHideTimer();
  };
  const next = () => {
    clearHideTimer();
    setShowControls(true);
    if (i + 1 < steps.length) setI(i + 1);
    else navigate("/app/survey");
  };

  // add/remove immersive class to <html>
  useEffect(() => {
    const root = document.documentElement;
    immersive ? root.classList.add("immersive") : root.classList.remove("immersive");
    return () => root.classList.remove("immersive");
  }, [immersive]);

  useEffect(() => {
    if (started) setImmersive(true);
  }, [started]);

  // video events
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onEnded = () => {
      setHasFinishedPlayback(true);
      setShowControls(true);
      clearHideTimer();
    };
    const onWaiting = () => {
      setIsBuffering(true);
      setShowControls(true);
      clearHideTimer();
    };
    const onPlaying = () => {
      setHasStartedPlayback(true);
      setIsBuffering(false);
      kickHideTimer();
    };
    const onPause = () => {
      setIsBuffering(false);
      setShowControls(true);
      clearHideTimer();
    };

    v.addEventListener("ended", onEnded);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
    };
  }, [step?.id, hasStartedPlayback, isBuffering, hasFinishedPlayback]);

  // reset per-step + autoplay on start
  useEffect(() => {
    setHasStartedPlayback(false);
    setIsBuffering(false);
    setHasFinishedPlayback(false);
    setShowControls(true);
    clearHideTimer();
    if (started) videoRef.current?.play().catch(() => {});
  }, [started, step?.id]);

  // global inputs (hotkeys + pointer)
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowright" || k === "n") {
        e.preventDefault();
        next();
      } else {
        revealAndMaybeHide();
      }
    };
    const onPointer = () => revealAndMaybeHide();
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousemove", onPointer);
    window.addEventListener("pointerup", onPointer);
    window.addEventListener("touchstart", onPointer, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousemove", onPointer);
      window.removeEventListener("pointerup", onPointer);
      window.removeEventListener("touchstart", onPointer);
    };
  }, [started, i, steps.length]);

  if (isLoading) return <div className="grid min-h-full place-items-center text-gray-500">Loading…</div>;
  if (!data || !step) return <div className="p-6">Session not found.</div>;

  const controlsHidden =
    started && hasStartedPlayback && !isBuffering && !hasFinishedPlayback && !showControls;

  return (
    <div className={`relative h-full transition-colors duration-700 ${immersive ? "bg-black text-white" : "bg-white text-black"}`}>
      {/* Absolute stage fills MAIN; fixes top gap and centers content */}
      <div className="absolute inset-0">
        {/* Background video stays mounted; just fades when not immersive */}
        <video
          key={step.id}
          ref={videoRef}
          className={[
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            immersive ? "opacity-80" : "opacity-0 pointer-events-none",
          ].join(" ")}
          src={step.videoUrl}
          poster={step.posterUrl ?? undefined}
          playsInline
          muted={!started}
          autoPlay={started}
          controls={false}
          preload="auto"
          aria-hidden={!immersive}
        />

        {/* Exit immersive button (fixed at top-right within stage) */}
        {immersive && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end p-3">
            <button
              type="button"
              className="pointer-events-auto rounded-xl bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur hover:bg-white/20"
              onClick={() => {
                setImmersive(false);     // video remains mounted & playing (just fades out)
                setShowControls(true);
                clearHideTimer();
              }}
            >
              Exit immersive
            </button>
          </div>
        )}

        {/* Overlay content — centered when immersive, normal when not */}
        <div
          className={[
            "relative z-10 flex h-full flex-col items-center p-6 text-center",
            started ? "justify-end" : "justify-center",
            immersive ? "items-center" : "",
          ].join(" ")}
        >
          {!started ? (
            <>
              <button
                className="mb-8 rounded-xl bg-black px-6 py-3 font-medium text-white shadow-[0_3px_8px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition-transform focus:outline-none focus:ring-2 focus:ring-black"
                onClick={() => setStarted(true)}
              >
                Begin Ritual
              </button>

              <RitualOverview
                purposeMd={ritual?.purposeMd}
                historyMd={ritual?.historyMd}
                requirements={ritual?.requirements as string[] | undefined}
                steps={steps}
                tab={tab}
                setTab={setTab}
              />
            </>
          ) : (
            <>
              {!hasStartedPlayback && isBuffering && (
                <div className="mb-3 text-xs opacity-80" aria-live="polite">
                  Loading…
                </div>
              )}

              <div
                className={[
                  "mb-6 transition-opacity duration-300",
                  controlsHidden ? "opacity-0 pointer-events-none" : "opacity-100",
                ].join(" ")}
              >
                <button
                  className="rounded-xl bg-white/10 px-5 py-3 font-semibold backdrop-blur hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                  onClick={next}
                  onFocus={() => {
                    setShowControls(true);
                    clearHideTimer();
                  }}
                  onBlur={() => kickHideTimer()}
                  aria-label={hasFinishedPlayback ? "Next step" : "Skip to next step"}
                >
                  {hasFinishedPlayback ? "Next" : "Next (Skip)"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
