import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const MAX_RECORDING_MS = 60_000;
const TARGET_SAMPLE_RATE = 16_000;

// Encode Float32 PCM chunks as a 16-bit mono WAV Blob
function encodeWav(chunks: Float32Array[], sampleRate: number): Blob {
  // Flatten
  let length = 0;
  for (const c of chunks) length += c.length;
  const merged = new Float32Array(length);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }

  // Downsample to 16 kHz
  const ratio = sampleRate / TARGET_SAMPLE_RATE;
  const outLength = Math.floor(merged.length / ratio);
  const downsampled = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    downsampled[i] = merged[Math.floor(i * ratio)];
  }

  // Convert to 16-bit PCM
  const buffer = new ArrayBuffer(44 + downsampled.length * 2);
  const view = new DataView(buffer);
  const writeStr = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + downsampled.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, TARGET_SAMPLE_RATE, true);
  view.setUint32(28, TARGET_SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, downsampled.length * 2, true);

  let pos = 44;
  for (let i = 0; i < downsampled.length; i++) {
    const s = Math.max(-1, Math.min(1, downsampled[i]));
    view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    pos += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

const VoiceInputButton = ({ onTranscript, disabled }: VoiceInputButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    ctxRef.current = null;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      chunksRef.current = [];
      processor.onaudioprocess = (e) => {
        const data = e.inputBuffer.getChannelData(0);
        chunksRef.current.push(new Float32Array(data));
      };
      source.connect(processor);
      processor.connect(ctx.destination);

      streamRef.current = stream;
      ctxRef.current = ctx;
      sourceRef.current = source;
      processorRef.current = processor;
      setIsRecording(true);

      timeoutRef.current = window.setTimeout(() => {
        void stopRecording();
      }, MAX_RECORDING_MS);
    } catch (err) {
      console.error("mic error:", err);
      toast({
        title: "无法访问麦克风",
        description: "请在浏览器中允许麦克风权限后重试。",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    if (!ctxRef.current) return;
    const sampleRate = ctxRef.current.sampleRate;
    const chunks = chunksRef.current;
    cleanup();
    setIsRecording(false);

    if (!chunks.length) {
      toast({ title: "没有录到声音", description: "请再试一次。" });
      return;
    }

    const blob = encodeWav(chunks, sampleRate);
    if (blob.size < 2048) {
      toast({ title: "录音太短", description: "请说话时间长一点再试。" });
      return;
    }

    setIsTranscribing(true);
    try {
      const form = new FormData();
      form.append("file", blob, "recording.wav");

      const { data, error } = await supabase.functions.invoke("transcribe-audio", {
        body: form,
      });

      if (error) throw error;
      const text = (data?.text || "").trim();
      if (!text) {
        toast({ title: "没听清", description: "请再试一次。" });
        return;
      }
      onTranscript(text);
    } catch (err) {
      console.error("transcribe error:", err);
      toast({
        title: "语音识别失败",
        description: "请稍后再试。",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleClick = () => {
    if (isTranscribing) return;
    if (isRecording) void stopRecording();
    else void startRecording();
  };

  const label = isRecording ? "停止录音" : isTranscribing ? "识别中" : "语音输入";

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isTranscribing}
      aria-label={label}
      title={label}
      className="self-end h-[52px] w-[52px] rounded-lg text-white shrink-0"
      style={{
        backgroundColor: isRecording ? "#DC2626" : "#4A7C59",
        borderColor: isRecording ? "#DC2626" : "#4A7C59",
      }}
    >
      {isTranscribing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isRecording ? (
        <Square className="w-5 h-5 animate-pulse" fill="currentColor" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </Button>
  );
};

export default VoiceInputButton;