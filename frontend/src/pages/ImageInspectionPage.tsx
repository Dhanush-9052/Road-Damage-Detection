import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  Sliders,
  Sparkles,
  Download,
  FileText,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

import { api } from '../services/api';
import type { Inspection } from '../types';
import { SplitImageViewer } from '../components/SplitImageViewer';
import { RiskGauge } from '../components/RiskGauge';
import { DetectionTable } from '../components/DetectionTable';
import { SeverityBadge } from '../components/SeverityBadge';

export const ImageInspectionPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Settings
  const [confThreshold, setConfThreshold] = useState<number>(0.20);
  const [iouThreshold, setIouThreshold] = useState<number>(0.45);
  const [imgSize, setImgSize] = useState<number>(640);

  // Status
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<Inspection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError(`Unsupported file type: ${file.type}. Please upload a JPG, PNG, or WebP image.`);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB limit.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setAnalyzing(true);
      setError(null);
      const inspectionResult = await api.predictImage(
        selectedFile,
        confThreshold,
        iouThreshold,
        imgSize
      );
      setResult(inspectionResult);
    } catch (err: any) {
      setError(err.message || 'Inference failed on the selected image.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Upload & Controls Panel */}
      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dropzone Column */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-1">
                Upload Road Surface Image
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Supports drone aerial captures and smartphone vehicular dashcam photos (JPG, PNG, WebP up to 25MB)
              </p>

              {!previewUrl ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
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
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
                  />
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 text-cyan-400 border border-slate-700 shadow-md">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Drag and drop your road photo here
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    or click to browse local filesystem
                  </p>
                  <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-300 border border-slate-700">
                    JPG, JPEG, PNG, WEBP (Max 25MB)
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center max-h-[380px]">
                    <img
                      src={previewUrl}
                      alt="Selected upload"
                      className="max-h-[360px] w-auto object-contain rounded-lg p-2"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={handleReset}
                        className="rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/80 border border-slate-700 shadow-lg"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <FileImage className="h-5 w-5 text-cyan-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {selectedFile?.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Ready for Inference
                    </span>
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

          {/* Inference Settings Column */}
          <div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sliders className="h-4 w-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Inference Parameters
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
                  max="0.90"
                  step="0.05"
                  value={confThreshold}
                  onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Filters weak detections. Notebook baseline: 0.20 (20%).
                </p>
              </div>

              {/* IOU Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">NMS IOU Threshold</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {(iouThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.80"
                  step="0.05"
                  value={iouThreshold}
                  onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Non-Maximum Suppression overlap threshold. Baseline: 0.45.
                </p>
              </div>

              {/* Image Size Selection */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Inference Resolution (imgsz)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[640, 800, 1024].map((size) => (
                    <button
                      key={size}
                      onClick={() => setImgSize(size)}
                      className={`rounded-lg py-2 text-xs font-mono font-bold transition-all border ${
                        imgSize === size
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-xs'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {size}×{size}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  640px is standard native YOLO26 training dimension.
                </p>
              </div>

              {/* Analyze Button */}
              <button
                disabled={!selectedFile || analyzing}
                onClick={handleAnalyze}
                className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-colors ${
                  !selectedFile || analyzing
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-cyan-600 text-white hover:bg-cyan-500'
                }`}
              >
                {analyzing ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Processing Image...</span>
                  </>
                ) : (
                  <span>Analyze Image</span>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          {/* Top Results Header Banner with Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-cyan-400">
                  Inspection ID: {result.id.slice(0, 8)}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-200 font-medium">
                  {result.original_filename}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Resolution: {result.width}×{result.height} • Latency: {result.inference_time_ms} ms
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={result.annotated_url}
                download={`RoadVision_${result.id.slice(0, 8)}_annotated.jpg`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                <span>Annotated Image</span>
              </a>

              <a
                href={api.getReportPdfUrl(result.id)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>PDF Report</span>
              </a>

              <a
                href={api.getExportDataUrl(result.id, 'csv')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                title="Export CSV"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span>CSV</span>
              </a>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Inspect Another</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Defects
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {result.total_detections}
              </span>
              <span className="text-[11px] text-slate-500">instances localized</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Road Risk Score
              </span>
              <span className={`text-2xl font-black mt-1 block ${
                result.risk.score > 70 ? 'text-rose-400' : result.risk.score > 30 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {result.risk.score.toFixed(1)} / 100
              </span>
              <span className="text-[11px] text-slate-500">{result.risk.level}</span>
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
                Inference Speed
              </span>
              <span className="text-2xl font-black text-cyan-400 mt-1 block flex items-center gap-1 font-mono">
                <Clock className="h-5 w-5 text-cyan-500" />
                {result.inference_time_ms} ms
              </span>
              <span className="text-[11px] text-slate-500">YOLO26 forward pass</span>
            </div>
          </div>

          {/* Visual Defect Map & Split Comparison Viewer */}
          <SplitImageViewer
            originalUrl={result.original_url}
            annotatedUrl={result.annotated_url}
            filename={result.filename}
          />

          {/* Risk Gauge & Civil Advisory */}
          <RiskGauge risk={result.risk} defectCount={result.total_detections} />

          {/* Class breakdown pills */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Defect Category Breakdown:
            </span>
            <div className="flex flex-wrap gap-2.5">
              {Object.entries(result.class_counts).map(([cls, cnt]) => (
                <div
                  key={cls}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    cnt > 0
                      ? 'border-cyan-800/60 bg-cyan-950/40 text-cyan-300'
                      : 'border-slate-800 bg-slate-950/40 text-slate-500'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>{cls}:</span>
                  <span className="font-mono font-bold text-white">{cnt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Detection Table */}
          {result.detections.length > 0 ? (
            <DetectionTable detections={result.detections} />
          ) : (
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
              <h4 className="text-base font-bold text-emerald-300 mb-1">
                Pavement Surface Clear — Zero Defects Detected
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No surface cracks, potholes, rutting, abscissions, or heaves were identified above the {confThreshold * 100}% confidence threshold.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
