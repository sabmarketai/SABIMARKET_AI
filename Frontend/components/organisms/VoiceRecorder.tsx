"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Check, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TransactionReceipt from "@/components/molecules/TransactionReceipt";
import { useVoiceTransaction } from "@/features/ai/hooks/useVoiceTransaction";
import { useDeleteTransaction } from "@/features/transactions/hooks/useDeleteTransaction";
import type { Transaction } from "@/features/transactions/types";

type RecordState = "idle" | "recording" | "processing" | "reviewing" | "error";

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm", "audio/ogg", "audio/mp4"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export default function VoiceRecorder() {
  const router = useRouter();
  const [state, setState] = useState<RecordState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [createdTxns, setCreatedTxns] = useState<Transaction[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const voiceTransactionMutation = useVoiceTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  const supportsRecording =
    typeof window !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  async function startRecording() {
    setErrorMessage(null);

    if (!supportsRecording) {
      setErrorMessage(
        "Voice recording isn't supported in this browser. Try a recent Chrome or Safari.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, {
          type: mimeType ?? "audio/webm",
        });
        submitRecording(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      setErrorMessage("Couldn't reach the microphone. Check permissions and try again.");
      setState("idle");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setState("processing");
  }

  async function submitRecording(blob: Blob) {
    try {
      const result = await voiceTransactionMutation.mutateAsync(blob);
      setTranscript(result.transcript);
      setCreatedTxns(result.transactions);
      setRemovedIds([]);
      setState("reviewing");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Couldn't process that recording. Try again.",
      );
      setState("error");
    }
  }

  async function removeTxn(id: string) {
    try {
      await deleteTransactionMutation.mutateAsync(id);
      setRemovedIds((prev) => [...prev, id]);
    } catch {
      // leave it in the list so the trader can retry
    }
  }

  function finish() {
    setState("idle");
    setTranscript("");
    setCreatedTxns([]);
    setRemovedIds([]);
    router.push("/dashboard");
  }

  function reset() {
    setState("idle");
    setErrorMessage(null);
    setTranscript("");
    setCreatedTxns([]);
    setRemovedIds([]);
  }

  const visibleTxns = createdTxns.filter((t) => !removedIds.includes(t.id));

  if (state === "reviewing") {
    return (
      <div className="px-5 pt-6">
        <p className="mb-1 font-display text-lg font-semibold text-indigo">
          Here&apos;s what I logged:
        </p>
        <p className="mb-4 rounded-lg bg-white p-3 text-sm italic text-indigo/70 shadow-card">
          &ldquo;{transcript}&rdquo;
        </p>

        {visibleTxns.length === 0 ? (
          <div className="rounded-card bg-white p-4 text-center text-sm text-indigo/60 shadow-card">
            No transactions left. Tap done to record another one.
          </div>
        ) : (
          <div className="space-y-3">
            {visibleTxns.map((txn) => (
              <div key={txn.id} className="relative">
                <TransactionReceipt txn={txn} />
                <button
                  onClick={() => removeTxn(txn.id)}
                  disabled={deleteTransactionMutation.isPending}
                  aria-label="Remove this transaction"
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-destructive shadow-card"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={finish}
          className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-full bg-primary py-3 text-sm font-semibold text-cream"
        >
          <Check size={16} /> Done
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-5 pt-6">
      <p className="mb-1 text-center font-display text-lg font-semibold text-indigo">
        {state === "recording"
          ? "I dey listen..."
          : state === "processing"
            ? "Processing your recording..."
            : "Tap to record a sale or purchase"}
      </p>
      <p className="mb-8 max-w-xs text-center text-sm text-indigo/50">
        {state === "recording"
          ? "Talk am like say you dey tell your friend. E.g. “I buy 50 oranges for 5k”"
          : state === "processing"
            ? "Sit tight, this takes a few seconds."
            : "Speak in English or Pidgin about a sale or purchase you just made."}
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
          disabled={state === "processing"}
          onClick={() => (state === "recording" ? stopRecording() : startRecording())}
          aria-label={state === "recording" ? "Stop recording" : "Start recording"}
          className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full shadow-card ${state !== "recording" && "bg-grey"}`}
        >
          {state === "processing" ? (
            <Loader2 size={30} className="animate-spin text-indigo" />
          ) : state === "recording" ? (
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

      {state === "recording" && (
        <button
          onClick={stopRecording}
          className="mt-6 rounded-full bg-indigo px-6 py-2.5 text-sm font-semibold text-cream"
        >
          Done talking
        </button>
      )}

      {errorMessage && (
        <div className="mt-6 flex max-w-xs items-start gap-2 rounded-lg bg-red/10 p-3 text-xs text-red">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {state === "error" && (
        <button
          onClick={reset}
          className="mt-4 rounded-full border border-indigo/20 px-6 py-2 text-sm font-semibold text-indigo"
        >
          Try again
        </button>
      )}
    </div>
  );
}
