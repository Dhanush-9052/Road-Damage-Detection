import React, { useState, useEffect, useRef } from 'react';
import {
  Video as VideoIcon,
  Sliders,
  Play,
  Download,
  RotateCcw,
  AlertCircle,
  FileSpreadsheet,
  Gauge,
  Film
} from 'lucide-react';

import { api } from '../services/api';
import type { Inspection, JobStatus } from '../types';
import { TimelineChart } from '../components/TimelineChart';
import { SeverityBadge } from '../components/SeverityBadge';
import { RiskGauge } from '../components/RiskGauge';

interface VideoInspectionPageProps {
  onSelectInspection: (id: string) => void;
}

export const VideoInspectionPage: React.FC<VideoInspectionPageProps> = ({
  onSelectInspection,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Settings
  const [confThreshold, setConfThreshold] = useState<number>(0.20);
  const [samplingStep, setSamplingStep] = useState<number>(2);
  const [emaAlpha, setEmaAlpha] = useState<number>(0.20);

  // Processing state
  const [, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [result, setResult] = useState<Inspection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<any>(null);

  const handleFileSelect = (file: File) => {
    const validExts = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExts.includes(fileExt)) {
      setError(`Unsupported video format: ${fileExt}. Supported formats: ${validExts.join(', ')}`);
      return;
    }
    if (file.size > 250 * 1024 * 1024) {
      setError('Video file exceeds the 250MB size limit.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
    setJobId(null);
    setJobStatus(null);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setSelectedFile(null);
    setVideoPreviewUrl(null);
    setJobId(null);
    setJobStatus(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startVideoAnalysis = async () => {
    if (!selectedFile) return;

    try {
      setError(null);
      setJobStatus(null);
      setResult(null);

      const resp = await api.predictVideo(
        selectedFile,
        confThreshold,
        0.45,
        samplingStep,
        emaAlpha
      );

      setJobId(resp.job_id);

      // Start polling job status
      pollingRef.current = setInterval(async () => {
        try {
          const status = await api.getJobStatus(resp.job_id);
          setJobStatus(status);

          if (status.status === 'completed' && status.inspection_id) {
            clearInterval(pollingRef.current);
            const insp = await api.getInspection(status.inspection_id);
            setResult(insp);
          } else if (status.status === 'failed') {
            clearInterval(pollingRef.current);
            setError(status.error_message || 'Video analysis encountered an unrecoverable failure.');
          }
        } catch (pollErr: any) {
          // Keep polling if temporary network glitch
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit video processing job.');
    }
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return (
    <div className="space-y-6 p-6">
      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Upload Dropzone */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-1">
                Upload Road Survey Video Stream
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Dashcam or drone inspection footage. Video frames will be sampled, analyzed via YOLO26, and rendered with real-time HUD telemetry.
              </p>

              {!videoPreviewUrl ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-700 bg-slate-950/40 hover:border-slate-500 hover:bg-slate-900/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp4,.avi,.mov,.mkv,.webm"
                    className="hidden"
                    onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
                  />
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 text-cyan-400 border border-slate-700 shadow-md">
                    <VideoIcon className="h-8 w-8" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Drag and drop road video file here
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    or click to browse local video files
                  </p>
                  <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-300 border border-slate-700">
                    MP4, AVI, MOV, WEBM (Max 250MB)
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-black max-h-[380px] flex items-center justify-center">
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="max-h-[360px] w-auto rounded-lg"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={handleReset}
                        className="rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/80 border border-slate-700 shadow-lg"
                      >
                        Remove Video
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <Film className="h-5 w-5 text-cyan-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {selectedFile?.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-cyan-400 font-semibold">
                      Ready for Telemetry Processing
                    </span>
                  </div>
                </div>
              )}

              {/* Job Progress Indicator */}
              {jobStatus && (
                <div className="mt-5 rounded-xl border border-cyan-800/50 bg-cyan-950/30 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-cyan-300 flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                      Status: {jobStatus.status.toUpperCase()}
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {jobStatus.progress.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 ease-out"
                      style={{ width: `${Math.max(3, jobStatus.progress)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      Processed: {jobStatus.current_frame} / {jobStatus.total_frames || 'Calculating...'} frames
                    </span>
                    <span>Asynchronous Background Pipeline</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Video Parameters Column */}
          <div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sliders className="h-4 w-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Video Telemetry Controls
                </h4>
              </div>

              {/* Confidence Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Confidence Threshold</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {(confThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.80"
                  step="0.05"
                  value={confThreshold}
                  onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Defect confidence filter for video frame detections.
                </p>
              </div>

              {/* Frame Sampling Step */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Frame Sampling Interval</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {samplingStep === 1 ? 'Every Frame (1x)' : `Every ${samplingStep}nd Frame (${samplingStep}x)`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 5, 10].map((step) => (
                    <button
                      key={step}
                      onClick={() => setSamplingStep(step)}
                      className={`rounded-lg py-1.5 text-xs font-mono font-bold transition-all border ${
                        samplingStep === step
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-xs'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {step}x
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Higher sampling (e.g. 2x, 5x) accelerates processing for long dashcam videos.
                </p>
              </div>

              {/* EMA Smoothing Alpha */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">EMA Smoothing Factor (α)</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {emaAlpha.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.05"
                  value={emaAlpha}
                  onChange={(e) => setEmaAlpha(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Formula: R_smooth = α·R(t) + (1-α)·R_prev. Prevents score flicker caused by vehicle vibration.
                </p>
              </div>

              {/* Process Button */}
              <button
                disabled={!selectedFile || (jobStatus !== null && jobStatus.status === 'processing')}
                onClick={startVideoAnalysis}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                  !selectedFile || (jobStatus !== null && jobStatus.status === 'processing')
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-slate-950 hover:brightness-110 shadow-cyan-500/25 active:scale-98'
                }`}
              >
                <Play className="h-4 w-4 fill-slate-950" />
                <span>Process Inspection Video</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Video Inspection Completed
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300 font-medium">
                  {result.original_filename}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Duration: {result.duration_sec?.toFixed(1)}s • Processed: {result.frames_processed} frames • Overall Risk: {result.risk.score.toFixed(1)}/100
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={result.annotated_url}
                download={`RoadVision_${result.id.slice(0, 8)}_hud.mp4`}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download Annotated Video</span>
              </a>

              {result.telemetry_csv_url && (
                <a
                  href={result.telemetry_csv_url}
                  download={`RoadVision_${result.id.slice(0, 8)}_telemetry.csv`}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  <span>Telemetry CSV</span>
                </a>
              )}

              <button
                onClick={() => onSelectInspection(result.id)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <span>Full Audit Record</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all ml-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Inspect Another</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Sampled-Frame Detections
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {result.total_detections}
              </span>
              <span className="text-[10px] text-slate-500">across {result.frames_processed} analyzed frames</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Peak Road Risk
              </span>
              <span className={`text-2xl font-black mt-1 block ${
                result.risk.score > 70 ? 'text-rose-400' : result.risk.score > 30 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {result.risk.score.toFixed(1)} / 100
              </span>
              <span className="text-[10px] text-slate-500">{result.risk.level}</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Highest Severity
              </span>
              <div className="mt-2">
                <SeverityBadge level={result.highest_severity} size="md" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Processing Speed
              </span>
              <span className="text-2xl font-black text-cyan-400 mt-1 block font-mono flex items-center gap-1">
                <Gauge className="h-5 w-5 text-cyan-500" />
                {result.fps ? `${result.fps.toFixed(1)} FPS` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500">telemetry render rate</span>
            </div>
          </div>

          {/* Important Scientific Disclaimer Banner */}
          <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 text-xs text-amber-200/90 leading-relaxed">
            <strong>Important Methodology Note:</strong> Detection counts in continuous video telemetry represent total object instances observed across processed frames. They reflect cumulative defect density rather than unique physical road defects. Multi-object tracking (MOT) across consecutive frames is distinguished from single-frame detection count.
          </div>

          {/* Video Player Display */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-2xl flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider self-start mb-2">
              Annotated Video Stream with Real-Time HUD Overlay
            </span>
            <video
              src={result.annotated_url}
              controls
              className="max-h-[520px] w-full rounded-lg bg-black"
            />
          </div>

          {/* Video Telemetry Timeline Chart */}
          {result.frame_timeline && (
            <TimelineChart timeline={result.frame_timeline} />
          )}

          {/* Overall Risk & Civil Advisory */}
          <RiskGauge risk={result.risk} defectCount={result.total_detections} />
        </div>
      )}
    </div>
  );
};
