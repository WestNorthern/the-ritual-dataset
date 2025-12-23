import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TabButton } from "./TabButton";

/** Step data as returned by the API (matches Prisma RitualStep select) */
type RitualStepView = {
  id: string;
  kind: string;
  order: number;
  title: string | null;
  videoUrl: string;
  posterUrl: string | null;
  autoNext: boolean;
  record: boolean;
};

export function RitualOverview({
  purposeMd,
  historyMd,
  requirements,
  steps,
  tab,
  setTab,
}: {
  purposeMd?: string | null;
  historyMd?: string | null;
  requirements?: string[] | null;
  steps: RitualStepView[];
  tab: "guide" | "history";
  setTab: (t: "guide" | "history") => void;
}) {
  const reqs = requirements ?? [];

  return (
    <div className="mt-4 w-full max-w-2xl rounded-xl border border-black/10 bg-white p-6 text-left shadow-[0_3px_8px_rgba(0,0,0,0.1)]">
      <div role="tablist" className="mb-4 flex gap-2">
        <TabButton active={tab === "guide"} onClick={() => setTab("guide")}>
          Guide
        </TabButton>
        <TabButton active={tab === "history"} onClick={() => setTab("history")}>
          History
        </TabButton>
      </div>

      {tab === "guide" ? (
        <div role="tabpanel" className="prose max-w-none text-gray-800">
          {purposeMd ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{purposeMd}</ReactMarkdown>
          ) : (
            <p>No guide available.</p>
          )}

          {reqs.length > 0 && (
            <>
              <h4>Requirements</h4>
              <ul className="list-disc pl-5">
                {reqs.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </>
          )}

          <h4>Steps</h4>
          <ol className="list-decimal pl-5">
            {steps.map((s) => (
              <li key={s.id}>
                {s.title ?? s.kind.replace(/_/g, " ").toLowerCase()}
                {s.record && (
                  <span className="ml-2 rounded bg-black text-white px-2 py-0.5 text-xs">
                    Recording
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div role="tabpanel" className="prose max-w-none text-gray-800">
          {historyMd ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{historyMd}</ReactMarkdown>
          ) : (
            <p>No history available.</p>
          )}
        </div>
      )}
    </div>
  );
}
