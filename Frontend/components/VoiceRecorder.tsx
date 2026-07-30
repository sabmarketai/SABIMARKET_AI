"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Check, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ParsedClause, parseTranscript, clausesToTransactions } from "@/lib/parseTransaction";
import { useSabiMarketStore } from "@/lib/store";

type RecordState = "idle" | "recording" | "reviewing";

// Minimal shape of the (non-standard) SpeechRecognition API so this compiles
// without needing @types/dom-speech-recognition as a dependency.
interface SpeechRecognitionResultLike {
  transcript: string;
}
interface SpeechRecognitionEventLike extends Event {
  results: { [index: number]: { [index: number]: SpeechRecognitionResultLike; isFinal: boolean }; length: number };
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

const SAMPLE_TRANSCRIPTS = [
  "I buy 50 oranges for 5k, sell 2 for 200 naira today",
  "I sell one basket of tomatoes for 18000",
  "I buy 10 bags of pure water for 3500",
];

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition) as
    | (new () => SpeechRecognitionLike)
    | undefined
    ?? null;
}

export default function VoiceRecorder() {
  const [state, setState] = useState<RecordState>("idle");
  const [transcript, setTranscript] = useState("");
  const [clauses, setClauses] = useState<ParsedClause[]>([]);
  const [supportsSpeech, setSupportsSpeech] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const addTransactions = useSabiMarketStore((s) => s.addTransactions);

  useEffect(() => {
    setSupportsSpeech(!!getSpeechRecognition());
  }, []);

  function startRecording() {
    setMicError(null);
    setTranscript("");
    setState("recording");

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      // No Web Speech API (e.g. some Android WebViews / offline). We still
      // let the trader "record" for the demo and fall back to a sample
      // transcript so the flow can be shown end-to-end. Swap this for a
      // server-side transcription call (Whisper-style) once the backend
      // is wired up — see README.md.
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-NG";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    recognition.onerror = () => {
      setMicError("Couldn't reach the microphone. Check permissions and try again.");
      setState("idle");
    };
    recognition.onend = () => {
      // handled explicitly by stopRecording
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setMicError("Couldn't start recording. Try again.");
      setState("idle");
    }
  }

  function stopRecording(useSample = false) {
    recognitionRef.current?.stop();
    const finalTranscript =
      useSample || !transcript
        ? SAMPLE_TRANSCRIPTS[Math.floor(Math.random() * SAMPLE_TRANSCRIPTS.length)]
        : transcript;
    setTranscript(finalTranscript);
    setClauses(parseTranscript(finalTranscript));
    setState("reviewing");
  }

  function updateClause(index: number, patch: Partial<ParsedClause>) {
    setClauses((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function removeClause(index: number) {
    setClauses((prev) => prev.filter((_, i) => i !== index));
  }

  function confirmSave() {
    const txns = clausesToTransactions(clauses, "Current Market", transcript);
    addTransactions(txns);
    setState("idle");
    setTranscript("");
    setClauses([]);
  }

  function discard() {
    setState("idle");
    setTranscript("");
    setClauses([]);
  }

  return (
    <div className="flex flex-col items-center px-5 pt-6">
      {state !== "reviewing" && (
        <>
          <p className="mb-1 text-center font-display text-lg font-semibold text-indigo">
            {state === "recording" ? "I dey listen..." : "Tap to record a sale or purchase"}
          </p>
          <p className="mb-8 max-w-xs text-center text-sm text-indigo/50">
            {state === "recording"
              ? "Talk am like say you dey tell your friend. E.g. \u201cI buy 50 oranges for 5k\u201d"
              : "Speak in English or Pidgin. Works offline — it will sync once you have signal."}
          </p>

          <div className="relative flex h-40 w-40 items-center justify-center">
            <AnimatePresence>
              {state === "recording" && (
                <>
                  <span className="absolute h-full w-full animate-pulseRing rounded-full bg-secondary" />
                  <span
                    className="absolute h-full w-full animate-pulseRing rounded-full bg-secondary"
                    style={{ animationDelay: "0.6s" }}
                  />
                </>
              )}
            </AnimatePresence>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => (state === "recording" ? stopRecording() : startRecording())}
              aria-label={state === "recording" ? "Stop recording" : "Start recording"}
              className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full shadow-card ${state !== "recording" && "bg-grey"}`}
            >
              {state === "recording" ? (
                <Square size={30} className="text-indigo" fill="currentColor" />
              ) : (
                <Mic size={36} className="text-indigo" strokeWidth={2.2} />
              )}
            </motion.button>
          </div>

          {state === "recording" && (
            <div className="mt-8 flex h-8 items-end gap-1" aria-hidden>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span
                  key={i}
                  className="w-1.5 animate-wave rounded-full bg-indigo/40"
                  style={{ height: "100%", animationDelay: `${i * 0.09}s` }}
                />
              ))}
            </div>
          )}

          {state === "recording" && transcript && (
            <p className="mt-6 max-w-xs text-center text-sm text-foreground/70">&ldquo;{transcript}&rdquo;</p>
          )}

          {state === "recording" && (
            <button
              onClick={() => stopRecording(false)}
              className="mt-6 rounded-full bg-indigo px-6 py-2.5 text-sm font-semibold text-cream"
            >
              Done talking
            </button>
          )}

          {!supportsSpeech && state === "idle" && (
            <p className="mt-6 max-w-xs text-center text-xs text-indigo/40">
              Live transcription isn&rsquo;t supported in this browser. Recording will use a
              sample transcript so you can preview the flow.
            </p>
          )}
          {micError && (
            <p className="mt-4 max-w-xs text-center text-xs text-red">{micError}</p>
          )}
        </>
      )}

      {state === "reviewing" && (
        <div className="w-full">
          <p className="mb-1 font-display text-lg font-semibold text-indigo">
            I hear you say:
          </p>
          <p className="mb-4 rounded-lg bg-white p-3 text-sm italic text-indigo/70 shadow-card">
            &ldquo;{transcript}&rdquo;
          </p>

          {clauses.length === 0 ? (
            <div className="rounded-card bg-white p-4 text-center text-sm text-indigo/60 shadow-card">
              I no fully understand that one. Try again, or say something like
              &ldquo;I sell 2 oranges for 200 naira&rdquo;.
            </div>
          ) : (
            <div className="space-y-3">
              {clauses.map((clause, i) => (
                <div key={i} className="rounded-card bg-white p-4 shadow-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={
                        clause.kind === "sell"
                          ? "rounded-full bg-cassava/10 px-2 py-0.5 text-xs font-semibold text-cassava"
                          : "rounded-full bg-clay/10 px-2 py-0.5 text-xs font-semibold text-clay"
                      }
                    >
                      {clause.kind === "sell" ? "Sold" : "Bought"}
                    </span>
                    <button
                      onClick={() => removeClause(i)}
                      aria-label="Remove this line"
                      className="text-indigo/30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-indigo/40">Qty</span>
                      <input
                        type="number"
                        value={clause.quantity}
                        onChange={(e) => updateClause(i, { quantity: Number(e.target.value) })}
                        className="rounded-lg border border-indigo/15 px-2 py-1 font-mono"
                      />
                    </label>
                    <label className="col-span-2 flex flex-col gap-1">
                      <span className="text-[11px] text-indigo/40">Item</span>
                      <input
                        type="text"
                        value={clause.item}
                        onChange={(e) => updateClause(i, { item: e.target.value })}
                        className="rounded-lg border border-indigo/15 px-2 py-1"
                      />
                    </label>
                  </div>
                  <label className="mt-2 flex flex-col gap-1 text-sm">
                    <span className="text-[11px] text-indigo/40">Amount (₦)</span>
                    <input
                      type="number"
                      value={clause.amount}
                      onChange={(e) => updateClause(i, { amount: Number(e.target.value) })}
                      className="rounded-lg border border-indigo/15 px-2 py-1 font-mono"
                    />
                  </label>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={discard}
              className="flex-1 rounded-full border border-indigo/20 py-3 text-sm font-semibold text-primary-foreground bg-red"
            >
              Discard
            </button>
            <button
              onClick={confirmSave}
              disabled={clauses.length === 0}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold text-cream disabled:opacity-40"
            >
              <Check size={16} /> Save {clauses.length > 1 ? "all" : ""}
            </button>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-indigo/40">
            <Pencil size={12} /> Tap any field above to correct it before saving
          </p>
        </div>
      )}
    </div>
  );
}
