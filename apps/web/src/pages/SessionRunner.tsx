import { useParams, useNavigate } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { useEffect, useRef, useState } from "react";

export function SessionRunner() {
  const { sessionId } = useParams();
  const { data, isLoading } = trpc.sessions.getRunner.useQuery({ sessionId: sessionId! });
  const steps = data?.ritual.steps ?? [];
  const [i, setI] = useState(0);
  const [started, setStarted] = useState(false);

  // playback state
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();

  const step = steps[i];

  // advance on end if autoNext
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => {
      if (step?.autoNext) {
        if (i + 1 < steps.length) setI((x) => x + 1);
        else navigate("/app/survey"); // TODO: survey route
      }
    };
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, [i, step?.autoNext, steps.length, navigate]);

  // track buffering/playing so we can hide any notice once playback begins
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setHasStartedPlayback(true);
      setIsBuffering(false);
    };
    const onPause = () => setIsBuffering(false);

    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);

    return () => {
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
    };
  }, [step?.id]);

  // when step changes, reset playback flags
  useEffect(() => {
    setHasStartedPlayback(false);
    setIsBuffering(false);
  }, [step?.id]);

  // kick playback after first tap
  useEffect(() => {
    if (started) videoRef.current?.play().catch(() => {});
  }, [started, step?.id]);

  if (isLoading)
    return <div className="grid min-h-dvh place-items-center text-gray-500">Loading…</div>;
  if (!data || !step) return <div className="p-6">Session not found.</div>;

  const next = () => {
    if (i + 1 < steps.length) setI(i + 1);
    else navigate("/app/survey");
  };

  return (
    <div className="relative h-dvh overflow-hidden bg-black text-white">
      <video
        key={step.id}
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-80"
        src={step.videoUrl}
        poster={step.posterUrl ?? undefined}
        playsInline
        muted={!started}
        autoPlay={started}
        controls={false}
        preload="auto"
      />

      {/* Center when not started; bottom-aligned after start */}
      <div
        className={`relative z-10 flex h-full flex-col items-center p-6 text-center ${
          !started ? "justify-center" : "justify-end"
        }`}
      >
        {!started ? (
          <button
            className="rounded-2xl bg-white/10 px-6 py-4 font-semibold backdrop-blur hover:bg-white/20"
            onClick={() => setStarted(true)}
          >
            Tap to begin
          </button>
        ) : !step.autoNext ? (
          <button
            className="mb-6 rounded-2xl bg-white/10 px-5 py-3 font-semibold backdrop-blur hover:bg-white/20"
            onClick={next}
          >
            Continue
          </button>
        ) : (
          // Only show a tiny notice while buffering *before* we’ve started playing.
          !hasStartedPlayback &&
          isBuffering && (
            <div className="mb-6 text-xs text-white/60" aria-live="polite">
              Loading…
            </div>
          )
        )}
      </div>
    </div>
  );
}
