import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TabButton } from "./TabButton";

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
  steps: Step[];
  tab: "guide" | "history";
  setTab: (t: "guide" | "history") => void;
}) {
  const reqs = requirements ?? [];

  return (
    <div className="mt-2 w-full max-w-2xl rounded-2xl border border-gray-200 bg-white/70 p-5 text-left shadow backdrop-blur">
      <div role="tablist" className="mb-3 flex gap-2">
        <TabButton active={tab === "guide"} onClick={() => setTab("guide")}>Guide</TabButton>
        <TabButton active={tab === "history"} onClick={() => setTab("history")}>History</TabButton>
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
                {s.title ?? s.kind.replaceAll("_", " ").toLowerCase()}
                {s.record && (
                  <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs">Recording</span>
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
