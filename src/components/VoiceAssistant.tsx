import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Volume2, VolumeX, Loader2, Bot, AlertCircle, Key } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isOpen, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      nextStartTimeRef.current = audioContextRef.current.currentTime;

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are ADAM AI voice assistant. Always provide your response in both English and Arabic. Be concise and conversational.",
        },
        callbacks: {
          onopen: async () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            try {
              // Start capturing audio
              streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
              const source = audioContextRef.current!.createMediaStreamSource(streamRef.current);
              const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
              
              source.connect(processor);
              processor.connect(audioContextRef.current!.destination);
              
              processor.onaudioprocess = (e) => {
                if (isMuted) return;
                
                const inputData = e.inputBuffer.getChannelData(0);
                // Convert to 16-bit PCM
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                  pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
                }
                
                // Convert to base64 safely
                try {
                  const uint8Array = new Uint8Array(pcmData.buffer);
                  let binary = '';
                  const chunkSize = 0x8000; // 32k chunks to avoid stack limits
                  for (let i = 0; i < uint8Array.length; i += chunkSize) {
                    binary += String.fromCharCode.apply(null, Array.from(uint8Array.subarray(i, i + chunkSize)));
                  }
                  const base64Data = btoa(binary);

                  sessionPromise.then((session) => {
                    session.sendRealtimeInput({
                      audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                    });
                  }).catch(err => console.error("Error sending audio:", err));
                } catch (b64Err) {
                  console.error("Base64 conversion error:", b64Err);
                }
              };
            } catch (err) {
              console.error("Microphone access error:", err);
              setError("Microphone access denied. Please check your permissions.");
              stopSession();
            }
          },
          onmessage: async (message) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              setIsAiSpeaking(true);
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              const pcmData = new Int16Array(bytes.buffer);
              const floatData = new Float32Array(pcmData.length);
              for (let i = 0; i < pcmData.length; i++) {
                floatData[i] = pcmData[i] / 0x7FFF;
              }
              
              if (audioContextRef.current) {
                const buffer = audioContextRef.current.createBuffer(1, floatData.length, 16000);
                buffer.getChannelData(0).set(floatData);
                
                const source = audioContextRef.current.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContextRef.current.destination);
                
                const startTime = Math.max(audioContextRef.current.currentTime, nextStartTimeRef.current);
                source.start(startTime);
                nextStartTimeRef.current = startTime + buffer.duration;
                
                source.onended = () => {
                  if (audioContextRef.current && audioContextRef.current.currentTime >= nextStartTimeRef.current - 0.1) {
                    setIsAiSpeaking(false);
                  }
                  source.disconnect();
                };
              }
            }
            
            if (message.serverContent?.interrupted) {
              // Stop current playback
              if (audioContextRef.current) {
                nextStartTimeRef.current = audioContextRef.current.currentTime;
              }
              setIsAiSpeaking(false);
            }
          },
          onclose: () => {
            stopSession();
          },
          onerror: (error) => {
            console.error("Live API Error:", error);
            const errorMessage = error?.message || "";
            if (errorMessage.includes("API key not valid") || errorMessage.includes("INVALID_ARGUMENT")) {
              setError("API key is invalid. Please select a valid key to continue.");
            } else {
              setError("Connection error. Please try again.");
            }
            stopSession();
          }
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error("Failed to start voice session:", error);
      setError("Failed to connect to AI. Please check your internet.");
      stopSession();
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    sessionRef.current = null;
    
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    
    audioContextRef.current?.close();
    audioContextRef.current = null;
    
    setIsConnected(false);
    setIsConnecting(false);
    setIsAiSpeaking(false);
  };

  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      startSession();
    }
    return () => {
      if (isConnected) stopSession();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl flex flex-col items-center p-10 text-center relative border border-white/10"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>

          <div className="mb-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/20 mx-auto mb-4">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white">Live Voice Chat</h2>
            <p className="text-gray-400 text-sm mt-1">Talk to ADAM AI in real-time</p>
          </div>

          <div className="relative w-48 h-48 flex items-center justify-center mb-10">
            {/* Visualizer Rings */}
            <AnimatePresence>
              {(isConnected || isConnecting) && (
                <>
                  <motion.div
                    animate={{ 
                      scale: isAiSpeaking ? [1, 1.4, 1] : 1,
                      opacity: isAiSpeaking ? [0.3, 0.1, 0.3] : 0.2
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 border-2 border-indigo-500 rounded-full"
                  />
                  <motion.div
                    animate={{ 
                      scale: isAiSpeaking ? [1, 1.8, 1] : 1,
                      opacity: isAiSpeaking ? [0.2, 0, 0.2] : 0.1
                    }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="absolute inset-0 border-2 border-indigo-400 rounded-full"
                  />
                </>
              )}
            </AnimatePresence>

            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
              isConnecting ? 'bg-white/5' : isAiSpeaking ? 'bg-indigo-600' : 'bg-white/10'
            }`}>
              {isConnecting ? (
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              ) : isMuted ? (
                <MicOff className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => setIsMuted(!isMuted)}
              disabled={!isConnected}
              className={`flex-1 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${
                isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
            >
              End Call
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col gap-3 text-red-400">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-medium text-left">{error}</p>
              </div>
              {error.includes("API key") && (
                <button
                  // @ts-ignore
                  onClick={() => window.aistudio?.openSelectKey().then(() => window.location.reload())}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Key className="w-3 h-3" />
                  Select Valid Key
                </button>
              )}
            </div>
          )}

          {!isConnected && !isConnecting && !error && (
            <p className="mt-6 text-xs text-red-400 font-medium">Connection lost. Reconnecting...</p>
          )}
          
          {isConnected && (
            <div className="mt-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Connection Active</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
