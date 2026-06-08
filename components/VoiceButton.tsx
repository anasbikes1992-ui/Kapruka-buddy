"use client";

import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SimpleSpeechRecognitionResult {
  transcript?: string;
}

interface SimpleSpeechRecognitionEvent {
  results?: ArrayLike<ArrayLike<SimpleSpeechRecognitionResult>>;
}

interface SimpleSpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SimpleSpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SimpleSpeechRecognition;

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionCtor;
    SpeechRecognition?: SpeechRecognitionCtor;
  }
}

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
}

export function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const recognitionRef = useRef<SimpleSpeechRecognition | null>(null);

  const recognitionCtor = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
  }, []);

  useEffect(() => {
    if (!recognitionCtor) {
      return;
    }

    const recognition = new recognitionCtor();
    recognition.lang = "en-LK";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SimpleSpeechRecognitionEvent) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        onTranscript(transcript);
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [recognitionCtor, onTranscript]);

  if (!recognitionCtor) {
    return null;
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current.start();
    setIsListening(true);
  };

  return (
    <motion.div className="relative">
      {/* Listening pulse */}
      {isListening && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-full bg-orange-600/40"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}

      <motion.button
        type="button"
        onClick={toggleListening}
        whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.92 }}
        className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border font-medium transition-colors ${
          isListening
            ? "border-orange-600 bg-orange-600 text-white shadow-lg dark:border-orange-500 dark:bg-orange-600"
            : "border-stone-200 bg-white/80 text-stone-700 hover:bg-white dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-200 dark:hover:bg-stone-700"
        }`}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
        title={isListening ? "Listening..." : "Voice input"}
      >
        <motion.div
          animate={isListening && !prefersReducedMotion ? { scale: [1, 1.1, 1] } : {}}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
