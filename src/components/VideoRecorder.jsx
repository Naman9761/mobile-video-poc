import React, { useState, useRef, useEffect } from 'react';
import { Camera, StopCircle, Loader2, AlertCircle } from 'lucide-react';
import { saveVideo } from '../db/indexedDb';
import { cn } from '../lib/utils';

export default function VideoRecorder({ onRecordingComplete }) {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(0);
    const timerIntervalRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }, // Prefer back camera on mobile
                audio: true
            });
            setStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setError(null);
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Could not access camera. Please ensure permissions are granted.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const startRecording = () => {
        if (!stream) return;

        chunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onstop = async () => {
            setIsSaving(true);
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            try {
                await saveVideo(blob);
                if (onRecordingComplete) onRecordingComplete();
            } catch (err) {
                console.error("Failed to save video", err);
                setError("Failed to save recording.");
            } finally {
                setIsSaving(false);
            }
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);

        // Timer
        setTimer(0);
        timerIntervalRef.current = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerIntervalRef.current);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-xl p-4 text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                <p className="text-red-700 font-medium">{error}</p>
                <button
                    onClick={startCamera}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                    Retry Camera
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-[9/16] md:aspect-video shadow-lg ring-1 ring-black/10">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />

                {/* Overlays */}
                <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    <p className={cn("font-mono font-medium text-sm", isRecording ? "text-red-500" : "text-white")}>
                        {isRecording ? "REC" : "LIVE"} {isRecording && formatTime(timer)}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-center pb-4">
                {isSaving ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        <span className="text-sm text-gray-500 mt-2">Saving to Device...</span>
                    </div>
                ) : (
                    !isRecording ? (
                        <button
                            onClick={startRecording}
                            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition-all shadow-xl hover:scale-105 active:scale-95"
                        >
                            <div className="absolute inset-0 rounded-full border-4 border-red-200 opacity-30 group-hover:opacity-50 transition-opacity" />
                            <Camera className="w-8 h-8 text-white" />
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-red-500 transition-all shadow-xl hover:bg-red-50 active:scale-95"
                        >
                            <div className="w-8 h-8 bg-red-500 rounded-sm" />
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
