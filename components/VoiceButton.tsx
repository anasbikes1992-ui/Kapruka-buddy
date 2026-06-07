"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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
    <button
      type="button"
      onClick={toggleListening}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
        isListening ? "bg-orange-600 text-white" : "bg-white/80 text-stone-700 hover:bg-white"
      }`}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
      title={isListening ? "Listening..." : "Voice input"}
    >
      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </button>
  );
}
