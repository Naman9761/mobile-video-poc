import React, { useState, useEffect } from 'react';
import { getAllVideos, updateVideoStatus } from '../db/indexedDb';
import { Play, UploadCloud, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function VideoList({ pulse }) {
    const [videos, setVideos] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        loadVideos();
    }, [pulse]); // Reload when 'pulse' prop changes (e.g. after recording)

    const loadVideos = async () => {
        const list = await getAllVideos();
        setVideos(list);
    };

    const handleUpload = async (video) => {
        // Optimistic update
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, isUploading: true } : v));

        try {
            // Mock upload delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // MOCK FAILURE CONDITION
            // Randomly fail to demonstrate retry logic, or just fail always as per spec?
            // Spec says: "Simulate an upload using fetch. Intentionally fail the upload."

            throw new Error("Simulated Upload Failure");

        } catch (err) {
            await updateVideoStatus(video.id, 'failed');
            console.error("Upload failed (expected)", err);
        } finally {
            // Refresh list to show final status
            loadVideos();
        }
    };

    // Allow explicit success retry for demo purposes if user wants?
    // The spec says "Allow retry upload later", but also "Demonstrable upload failure".
    // I will make the retry button ALSO fail initially, but maybe add a secret shift-click to succeed?
    // Or just keep it failing to prove persistence. 
    // Just complying with spec: "Intentionally fail... Allow retry". Retry failing again is fine, proves it's still there.

    return (
        <div className="space-y-4 pb-20">
            <h2 className="text-xl font-bold text-gray-800 px-1">Saved Recordings</h2>

            {videos.length === 0 && (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No recordings yet.
                </div>
            )}

            {videos.map(video => (
                <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transform transition-all hover:shadow-md">
                    <div className="p-3 flex items-start gap-4">

                        {/* Thumbnail / Video Preview Area */}
                        <div
                            className="relative w-24 h-24 bg-black rounded-lg flex-shrink-0 cursor-pointer overflow-hidden group"
                            onClick={() => setActiveVideo(activeVideo === video.id ? null : video.id)}
                        >
                            {activeVideo === video.id ? (
                                <video
                                    src={URL.createObjectURL(video.blob)}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <>
                                    {/* Hacky thumbnail generation or just a placeholder if we don't want to process blob to image */}
                                    <video
                                        src={URL.createObjectURL(video.blob)}
                                        className="w-full h-full object-cover opacity-80"
                                        onLoadedData={(e) => e.target.currentTime = 0.5} // Seek a bit to show frame
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                                            <Play className="w-5 h-5 text-white fill-current" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-xs text-gray-400 font-mono">
                                        {new Date(video.createdAt).toLocaleString()}
                                    </p>
                                    <p className="text-sm font-medium text-gray-700 truncate">
                                        Recording_{video.id.slice(0, 6)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {(video.blob.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>

                                {/* Status Badge */}
                                <StatusBadge status={video.status} />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end mt-2">
                                {video.status !== 'uploaded' && (
                                    <button
                                        onClick={() => handleUpload(video)}
                                        disabled={video.isUploading}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                            video.status === 'failed'
                                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        )}
                                    >
                                        {video.isUploading ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                {video.status === 'failed' ? <RefreshCw className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                                                {video.status === 'failed' ? "Retry Upload" : "Upload"}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function StatusBadge({ status }) {
    if (status === 'uploaded') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-200">
                <CheckCircle2 className="w-3 h-3" /> Uploaded
            </span>
        );
    }
    if (status === 'failed') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium border border-red-200">
                <XCircle className="w-3 h-3" /> Failed
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
            <Clock className="w-3 h-3" /> Pending
        </span>
    );
}
