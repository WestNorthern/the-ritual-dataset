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

  // playback + UI
  const [started, setStarted] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [tab, setTab] = useState<TabKey>("guide");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();
  const step = steps[i];

  // Immersive <html> class
  useEffect(() => {
    const root = document.documentElement;
    if (immersive) root.classList.add("immersive");
    else root.classList.remove("immersive");
    return () => root.classList.remove("immersive");
  }, [immersive]);

  // Auto-enable immersive once playback starts
  useEffect(() => {
    if (started) setImmersive(true);
  }, [started]);

  // advance on end if autoNext
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => {
      if (step?.autoNext) {
        if (i + 1 < steps.length) setI((x) => x + 1);
        else navigate("/app/survey"); // TODO
      }
    };
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, [i, step?.autoNext, steps.length, navigate]);

  // track buffering/playing
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => { setHasStartedPlayback(true); setIsBuffering(false); };
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

  // reset flags on step change
  useEffect(() => {
    setHasStartedPlayback(false);
    setIsBuffering(false);
  }, [step?.id]);

  // kick playback after first tap
  useEffect(() => {
    if (started) videoRef.current?.play().catch(() => { });
  }, [started, step?.id]);

  if (isLoading) return <div className="grid min-h-dvh place-items-center text-gray-500">Loading…</div>;
  if (!data || !step) return <div className="p-6">Session not found.</div>;

  const next = () => {
    if (i + 1 < steps.length) setI(i + 1);
    else navigate("/app/survey");
  };

  const reqs = (ritual?.requirements as string[] | undefined) ?? [];

  return (
    <div className="relative h-dvh overflow-hidden bg-black text-white">
      {/* background video */}
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

      {/* Exit immersive */}
      {immersive && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end p-3">
          <button
            type="button"
            className="pointer-events-auto rounded-xl bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur hover:bg-white/20"
            onClick={() => setImmersive(false)}
          >
            Exit immersive
          </button>
        </div>
      )}

      {/* Overlay */}
      <div
        className={`relative z-10 flex h-full flex-col items-center p-6 text-center ${!started ? "justify-center" : "justify-end"
          }`}
      >
        {!started ? (
          <>
            <button
              className="mb-6 rounded-2xl bg-white/10 px-6 py-4 font-semibold backdrop-blur hover:bg-white/20"
              onClick={() => setStarted(true)}
            >
              Tap to begin
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

        ) : !step.autoNext ? (
          <button
            className="mb-6 rounded-2xl bg-white/10 px-5 py-3 font-semibold backdrop-blur hover:bg-white/20"
            onClick={next}
          >
            Continue
          </button>
        ) : (
          started &&
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      className={`rounded-xl px-3 py-1 text-sm font-medium transition ${active ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
        }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
