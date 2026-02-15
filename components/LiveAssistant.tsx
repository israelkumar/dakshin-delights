
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { GeminiService } from '../geminiService';
import { useToast } from './Toast';

// Helper functions for audio processing
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const { showToast } = useToast();

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus trap for the panel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Cleanup function to properly dispose of all resources
  const cleanup = useCallback(() => {
    // Stop all playing audio sources
    for (const s of sourcesRef.current) {
      try { s.stop(); } catch (_) { /* already stopped */ }
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    // Close the Gemini Live session/WebSocket
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (_) {}
      sessionRef.current = null;
    }

    // Stop microphone capture
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close AudioContext instances
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (_) {}
      audioContextRef.current = null;
    }
    if (outputContextRef.current) {
      try { outputContextRef.current.close(); } catch (_) {}
      outputContextRef.current = null;
    }

    setIsActive(false);
    setStatus('idle');
  }, []);

  // Cleanup on unmount (if session is active when component unmounts)
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const startSession = async () => {
    setStatus('connecting');

    try {
      const apiKey = await GeminiService.getLiveApiKey();
      const ai = new GoogleGenAI({ apiKey });

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('listening');
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setStatus('speaking');
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContextRef.current!.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputContextRef.current!, 24000, 1);
              const source = outputContextRef.current!.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputContextRef.current!.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            showToast('Voice chat connection error. Please try again.', 'error');
          },
          onclose: () => {
            setIsActive(false);
            setStatus('idle');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: 'You are Chef Amara, the master chef of Dakshin Delights. You are friendly, knowledgeable about South Indian cuisine, and helpful. You suggest dishes based on user preferences and explain cultural traditions.',
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start Live session', err);
      showToast('Failed to start voice chat. Check microphone permissions.', 'error');
      setStatus('idle');
    }
  };

  const stopSession = () => {
    cleanup();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen && (
        <div
          ref={panelRef}
          className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-primary/20 w-80 mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          role="dialog"
          aria-label="Chef Amara Voice Assistant"
          aria-modal="true"
        >
          <div className="bg-primary p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="material-icons" aria-hidden="true">restaurant</span>
              <h3 className="font-bold">Ask Chef Amara</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-70" aria-label="Close voice assistant">
              <span className="material-icons" aria-hidden="true">close</span>
            </button>
          </div>

          <div className="p-8 flex flex-col items-center text-center">
            <div className={`relative mb-6 ${isActive ? 'scale-110' : ''} transition-transform`}>
              <div className={`absolute inset-0 bg-primary/20 rounded-full blur-xl ${isActive ? 'animate-pulse' : 'hidden'}`} aria-hidden="true"></div>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG3r10FnhMCepXvfOUvJeDvrM68LN-_g_AU_aC6l-KmywJT1ks71ipd0vV-SMGK_vJSJPw-iYlmBWa_ta1huwvsVkb9AwFe3lsDu6z5vCMAZwxQ7F4A8-6Bim-Hm8zvrhLFp8txQrTLrtYT8w0gOHczJV-VZckSW01iEJqnFMatNIRMWd3ew6ExaDDLafVxSpCegxLcI7eBR8dn60NYelqTn3JS8dymopHwbsB85_rbAMoOgEejPac_fYUy2M9zNIyJpndlPcJXc0"
                alt="Chef Amara"
                className="w-24 h-24 rounded-full border-4 border-primary object-cover relative z-10"
                loading="lazy"
                width="96"
                height="96"
              />
            </div>

            <p className="text-stone-600 dark:text-stone-400 text-sm mb-6" aria-live="polite">
              {status === 'idle' && "Chef Amara is ready to talk about recipes and traditions."}
              {status === 'connecting' && "Connecting to the kitchen..."}
              {status === 'listening' && "I'm listening... Tell me what you're craving!"}
              {status === 'speaking' && "Sharing a secret recipe..."}
            </p>

            {isActive ? (
              <button
                onClick={stopSession}
                className="bg-red-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <span className="material-icons" aria-hidden="true">mic_off</span> Stop Chatting
              </button>
            ) : (
              <button
                onClick={startSession}
                disabled={status === 'connecting'}
                className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {status === 'connecting' ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
                ) : (
                  <span className="material-icons" aria-hidden="true">mic</span>
                )}
                {status === 'connecting' ? 'Connecting...' : 'Start Voice Chat'}
              </button>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isOpen ? 'bg-stone-800 text-white rotate-90' : 'bg-primary text-white hover:scale-110'}`}
        aria-label={isOpen ? 'Close voice assistant' : 'Open voice assistant - Ask Chef Amara'}
        aria-expanded={isOpen}
      >
        <span className="material-icons text-3xl" aria-hidden="true">{isOpen ? 'close' : 'hearing'}</span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-accent-gold"></span>
          </span>
        )}
      </button>
    </div>
  );
};
