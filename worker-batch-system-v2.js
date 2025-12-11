// Cloudflare Worker - Batch System + Fast Conversion

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/proxy') {
      return handleProxy(request, corsHeaders);
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(getHTML(), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8', ...corsHeaders },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};

async function handleProxy(request, corsHeaders) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('URL required', { status: 400, headers: corsHeaders });
  }

  try {
    const targetOrigin = new URL(targetUrl).origin;
    
    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'VLC/3.0.20 LibVLC/3.0.20',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': targetOrigin + '/',
        'Origin': targetOrigin,
        'Connection': 'keep-alive',
      }
    });

    const contentType = resp.headers.get('Content-Type') || 'application/octet-stream';
    
    return new Response(resp.body, {
      status: resp.status,
      headers: { 'Content-Type': contentType, ...corsHeaders }
    });
  } catch (e) {
    return new Response('Proxy error: ' + e.message, { status: 500, headers: corsHeaders });
  }
}

function getHTML() {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Batch System - Smooth Player</title>
    <style>
        :root {
            --bg: #0a0a0f;
            --card: #12121a;
            --red: #ff3b3b;
            --cyan: #00f5ff;
            --green: #00ff88;
            --yellow: #ffcc00;
            --purple: #a855f7;
            --text: #e8e8e8;
            --dim: #888;
            --border: #2a2a3a;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: system-ui, sans-serif; 
            background: var(--bg); 
            color: var(--text); 
            min-height: 100vh; 
            padding: 20px;
        }
        .container { max-width: 1000px; margin: 0 auto; }
        
        h1 { 
            font-size: 1.8rem; 
            background: linear-gradient(135deg, var(--cyan), var(--purple)); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
            text-align: center; 
            margin-bottom: 10px; 
        }
        
        .subtitle { 
            color: var(--dim); 
            text-align: center; 
            font-size: 0.9rem; 
            margin-bottom: 20px; 
        }
        
        .badge {
            display: inline-block;
            background: var(--green);
            color: #000;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 8px;
        }
        
        .card { 
            background: var(--card); 
            border: 1px solid var(--border); 
            border-radius: 12px; 
            padding: 20px; 
            margin-bottom: 15px; 
        }
        
        .input-row { 
            display: flex; 
            gap: 10px; 
            margin-bottom: 15px; 
        }
        
        .url-input { 
            flex: 1; 
            background: var(--bg); 
            border: 1px solid var(--border); 
            border-radius: 8px; 
            padding: 12px; 
            color: var(--text); 
            font-size: 0.9rem; 
        }
        
        .url-input:focus { 
            outline: none; 
            border-color: var(--cyan); 
        }
        
        .btn { 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            font-weight: 600; 
            cursor: pointer; 
            font-size: 0.9rem; 
            transition: transform 0.2s;
        }
        
        .btn:active { transform: scale(0.95); }
        
        .btn-start { 
            background: linear-gradient(135deg, var(--cyan), var(--purple)); 
            color: #000; 
        }
        
        .btn-start:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .btn-stop { 
            background: var(--red); 
            color: #fff; 
        }
        
        .btn-stop:disabled { opacity: 0.3; cursor: not-allowed; }
        
        .settings { 
            display: flex; 
            gap: 15px; 
            margin-bottom: 15px; 
            flex-wrap: wrap; 
        }
        .setting { 
            display: flex; 
            align-items: center; 
            gap: 6px; 
            font-size: 0.8rem; 
        }
        .setting label { color: var(--dim); }
        .setting select { 
            background: var(--bg); 
            border: 1px solid var(--border); 
            border-radius: 4px; 
            padding: 6px; 
            color: var(--text); 
            font-size: 0.75rem; 
        }
        
        /* Batch Visualization */
        .batch-viz {
            margin: 20px 0;
            padding: 20px;
            background: var(--bg);
            border-radius: 10px;
        }
        
        .batch-title {
            font-size: 0.85rem;
            color: var(--dim);
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .batch-status {
            color: var(--cyan);
            font-weight: 600;
        }
        
        .batch-boxes {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .batch-box {
            background: var(--card);
            border: 2px solid var(--border);
            border-radius: 8px;
            padding: 15px 10px;
            text-align: center;
            transition: all 0.3s;
        }
        
        .batch-box .batch-label {
            font-size: 0.7rem;
            color: var(--dim);
            margin-bottom: 8px;
        }
        
        .batch-box .batch-count {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text);
        }
        
        .batch-box.downloading {
            background: linear-gradient(135deg, var(--yellow), var(--cyan));
            border-color: var(--yellow);
            animation: pulse 1s infinite;
        }
        
        .batch-box.downloading .batch-count {
            color: #000;
        }
        
        .batch-box.converting {
            background: linear-gradient(135deg, var(--purple), var(--cyan));
            border-color: var(--purple);
            animation: pulse 1s infinite;
        }
        
        .batch-box.converting .batch-count {
            color: #000;
        }
        
        .batch-box.ready {
            background: linear-gradient(135deg, var(--green), var(--cyan));
            border-color: var(--green);
        }
        
        .batch-box.ready .batch-count {
            color: #000;
        }
        
        .batch-box.playing {
            background: linear-gradient(135deg, var(--green), var(--cyan));
            border-color: var(--green);
            animation: glow 1.5s infinite;
        }
        
        .batch-box.playing .batch-count {
            color: #000;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(0.98); }
        }
        
        @keyframes glow {
            0%, 100% { box-shadow: 0 0 15px var(--green); }
            50% { box-shadow: 0 0 25px var(--green), 0 0 35px var(--cyan); }
        }
        
        .batch-info {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 15px;
        }
        
        .batch-info-item {
            background: var(--card);
            padding: 10px;
            border-radius: 6px;
            text-align: center;
        }
        
        .batch-info-label {
            font-size: 0.7rem;
            color: var(--dim);
            margin-bottom: 5px;
        }
        
        .batch-info-value {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--cyan);
        }
        
        /* Player */
        .player-wrapper {
            position: relative;
        }
        
        .player-box { 
            background: #000; 
            border-radius: 10px; 
            aspect-ratio: 16/9; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            overflow: hidden; 
            margin-bottom: 15px;
        }
        
        .player-box canvas { 
            width: 100%; 
            height: 100%; 
            object-fit: contain; 
        }
        
        .placeholder { 
            color: var(--dim); 
            text-align: center; 
        }
        
        .placeholder-icon { 
            font-size: 4rem; 
            margin-bottom: 15px; 
            opacity: 0.3; 
        }
        
        /* Player Controls */
        .player-controls {
            background: var(--card);
            border-radius: 10px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .ctrl-btn {
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text);
            transition: all 0.2s;
        }
        
        .ctrl-btn:hover {
            background: var(--border);
            border-color: var(--cyan);
            color: var(--cyan);
        }
        
        .ctrl-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }
        
        .ctrl-btn svg {
            width: 20px;
            height: 20px;
            fill: currentColor;
        }
        
        .volume-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .volume-slider {
            width: 100px;
            height: 4px;
            -webkit-appearance: none;
            background: var(--border);
            border-radius: 2px;
            cursor: pointer;
        }
        
        .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: var(--cyan);
            border-radius: 50%;
            cursor: pointer;
        }
        
        .volume-slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
            background: var(--cyan);
            border-radius: 50%;
            cursor: pointer;
            border: none;
        }
        
        .spacer { flex: 1; }
        
        .time-display {
            font-family: monospace;
            font-size: 0.85rem;
            color: var(--cyan);
            min-width: 80px;
            text-align: center;
        }
        
        /* Stats */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-top: 15px;
        }
        
        .stat-card {
            background: var(--bg);
            padding: 12px;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-label {
            font-size: 0.7rem;
            color: var(--dim);
            margin-bottom: 5px;
        }
        
        .stat-value {
            font-size: 1.3rem;
            font-weight: 600;
            color: var(--cyan);
        }
        
        .stat-value.green { color: var(--green); }
        .stat-value.yellow { color: var(--yellow); }
        .stat-value.purple { color: var(--purple); }
        
        /* Logs */
        .logs { 
            background: #080810; 
            border-radius: 8px; 
            padding: 15px; 
            font-family: monospace; 
            font-size: 0.7rem; 
            max-height: 200px; 
            overflow-y: auto; 
            margin-top: 15px;
        }
        
        .log { 
            padding: 3px 0; 
            border-bottom: 1px solid var(--border); 
        }
        
        .log:last-child { border: none; }
        
        .log-time { 
            color: var(--dim); 
            margin-right: 8px; 
        }
        
        .log-msg { color: var(--text); }
        .log-msg.info { color: var(--cyan); }
        .log-msg.success { color: var(--green); }
        .log-msg.warn { color: var(--yellow); }
        .log-msg.error { color: var(--red); }
        
        .status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.8rem;
            margin-top: 15px;
            padding: 10px 0;
        }
        
        .status {
            color: var(--dim);
        }
        
        .status.live {
            color: var(--green);
            font-weight: 600;
        }
        
        .status.error {
            color: var(--red);
        }
    </style>
</head>
<body>
<div class="container">
    <h1>🎬 Batch System Player<span class="badge">FAST</span></h1>
    <p class="subtitle">5 Segment Batch • No -re • Smooth Playback</p>
    
    <div class="card">
        <div class="input-row">
            <input type="text" class="url-input" id="urlInput" 
                value="https://tv100-live.daioncdn.net/tv100/tv100.m3u8" 
                placeholder="M3U8 URL">
            <button class="btn btn-start" id="startBtn">Başlat</button>
            <button class="btn btn-stop" id="stopBtn" disabled>Durdur</button>
        </div>
        
        <div class="settings">
            <div class="setting">
                <label>Batch Size:</label>
                <select id="batchSize">
                    <option value="3">3 segment</option>
                    <option value="5" selected>5 segment</option>
                    <option value="7">7 segment</option>
                </select>
            </div>
            <div class="setting">
                <label>Çözünürlük:</label>
                <select id="resolution">
                    <option value="480x270">480x270</option>
                    <option value="640x360" selected>640x360</option>
                    <option value="854x480">854x480</option>
                </select>
            </div>
            <div class="setting">
                <label>Bitrate:</label>
                <select id="bitrate">
                    <option value="400k">400k</option>
                    <option value="600k" selected>600k</option>
                    <option value="900k">900k</option>
                </select>
            </div>
        </div>
        
        <!-- Batch Visualization -->
        <div class="batch-viz">
            <div class="batch-title">
                <span>📦 Batch Queue (5 slots)</span>
                <span class="batch-status" id="batchStatus">0 / 5</span>
            </div>
            
            <div class="batch-boxes" id="batchBoxes">
                <!-- Will be generated dynamically -->
            </div>
            
            <div class="batch-info">
                <div class="batch-info-item">
                    <div class="batch-info-label">Current Batch</div>
                    <div class="batch-info-value" id="currentBatch">-</div>
                </div>
                <div class="batch-info-item">
                    <div class="batch-info-label">Segments/Batch</div>
                    <div class="batch-info-value" id="segmentsPerBatch">5</div>
                </div>
                <div class="batch-info-item">
                    <div class="batch-info-label">Conversion Speed</div>
                    <div class="batch-info-value green" id="conversionSpeed">~3s</div>
                </div>
            </div>
        </div>
        
        <!-- Player -->
        <div class="player-wrapper">
            <div class="player-box" id="playerBox">
                <div class="placeholder" id="placeholder">
                    <div class="placeholder-icon">📺</div>
                    <div>M3U8 URL girin ve Başlat tıklayın</div>
                    <div style="font-size: 0.75rem; margin-top: 10px; color: var(--dim);">
                        İlk batch dolunca otomatik başlar
                    </div>
                </div>
            </div>
            
            <!-- Player Controls -->
            <div class="player-controls">
                <button class="ctrl-btn" id="playPauseBtn" disabled title="Oynat/Duraklat">
                    <svg viewBox="0 0 24 24" id="playIcon">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg viewBox="0 0 24 24" id="pauseIcon" style="display:none">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                </button>
                
                <div class="volume-wrapper">
                    <button class="ctrl-btn" id="muteBtn" disabled title="Sessiz">
                        <svg viewBox="0 0 24 24" id="volumeIcon">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                        </svg>
                        <svg viewBox="0 0 24 24" id="muteIcon" style="display:none">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                    </button>
                    <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="80" title="Ses">
                </div>
                
                <div class="spacer"></div>
                
                <div class="time-display" id="timeDisplay">00:00:00</div>
            </div>
        </div>
        
        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Batches</div>
                <div class="stat-value purple" id="statBatches">0</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Queued</div>
                <div class="stat-value" id="statQueued">0</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Playing</div>
                <div class="stat-value yellow" id="statPlaying">-</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Avg Speed</div>
                <div class="stat-value green" id="statSpeed">0s</div>
            </div>
        </div>
        
        <div class="status-bar">
            <div class="status" id="status">Hazır</div>
        </div>
        
        <div class="logs" id="logs"></div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/fatihdeveci05-creator/jsmpeg@master/jsmpeg-player100.umd.min.js"></script>

<script>
(function(){
    const BATCH_QUEUE_SIZE = 5;  // 5 batch queue
    const POLL_INTERVAL = 1500;
    
    // ===== BATCH QUEUE SYSTEM =====
    class BatchQueue {
        constructor(size) {
            this.size = size;
            this.batches = new Array(size).fill(null);
            this.playingIndex = -1;
            this.totalBatches = 0;
        }
        
        getNextEmptySlot() {
            for(let i = 0; i < this.size; i++) {
                if(this.batches[i] === null) return i;
            }
            return -1;
        }
        
        add(batchData, batchIndex) {
            // ✅ Clear old batches with lower index
            for(let i = 0; i < this.size; i++) {
                if(this.batches[i] !== null) {
                    if(this.batches[i].batchIndex < batchIndex && i !== this.playingIndex) {
                        log(\`🗑️ Eski batch #\${this.batches[i].batchIndex} temizleniyor [slot \${i}]\`, "warn");
                        this.batches[i] = null;
                        updateBatchVisual(i, 'empty', null);
                    }
                }
            }
            
            const slotIndex = this.getNextEmptySlot();
            if(slotIndex === -1) {
                log("⚠️ Queue dolu, bekle...", "warn");
                return null;
            }
            
            this.batches[slotIndex] = {
                data: batchData,
                batchIndex: batchIndex,
                addedAt: Date.now()
            };
            
            updateBatchVisual(slotIndex, 'ready', batchIndex);
            log(\`✅ Batch #\${batchIndex} queue'ya eklendi [slot \${slotIndex}]\`, "success");
            
            return slotIndex;
        }
        
        getNext() {
            // ✅ Find next batch with HIGHER batchIndex (sequential)
            if(this.playingIndex === -1) {
                // First time: find earliest batch
                let earliestIdx = -1;
                let earliestBatchIdx = Infinity;
                
                for(let i = 0; i < this.size; i++) {
                    if(this.batches[i] !== null) {
                        if(this.batches[i].batchIndex < earliestBatchIdx) {
                            earliestBatchIdx = this.batches[i].batchIndex;
                            earliestIdx = i;
                        }
                    }
                }
                
                if(earliestIdx >= 0) {
                    this.playingIndex = earliestIdx;
                    return this.batches[earliestIdx];
                }
                return null;
            }
            
            // ✅ Find next batch with SEQUENTIAL index (no backwards!)
            const currentBatchIndex = this.batches[this.playingIndex].batchIndex;
            let nextIdx = -1;
            let nextBatchIdx = Infinity;
            
            for(let i = 0; i < this.size; i++) {
                if(this.batches[i] !== null && i !== this.playingIndex) {
                    const batchIdx = this.batches[i].batchIndex;
                    // ✅ Only consider batches with HIGHER index
                    if(batchIdx > currentBatchIndex && batchIdx < nextBatchIdx) {
                        nextBatchIdx = batchIdx;
                        nextIdx = i;
                    }
                }
            }
            
            if(nextIdx >= 0) {
                this.playingIndex = nextIdx;
                return this.batches[nextIdx];
            }
            
            return null;
        }
        
        clear(slotIndex) {
            if(this.batches[slotIndex] !== null) {
                const batchIdx = this.batches[slotIndex].batchIndex;
                this.batches[slotIndex] = null;
                
                setTimeout(() => {
                    updateBatchVisual(slotIndex, 'empty', null);
                }, 500);
                
                log(\`🗑️ Batch #\${batchIdx} temizlendi\`, "info");
            }
        }
        
        getFilledCount() {
            return this.batches.filter(b => b !== null).length;
        }
    }
    
    // ===== STATE =====
    const state = {
        ffmpeg: null,
        ffmpegReady: false,
        running: false,
        player: null,
        canvas: null,
        batchQueue: new BatchQueue(BATCH_QUEUE_SIZE),
        totalBatches: 0,
        processedSegments: {},
        isPlaying: false,
        isPaused: false,
        volume: 0.8,
        startTime: 0,
        conversionTimes: []
    };
    
    const $ = id => document.getElementById(id);
    const el = {
        urlInput: $("urlInput"),
        startBtn: $("startBtn"),
        stopBtn: $("stopBtn"),
        playerBox: $("playerBox"),
        placeholder: $("placeholder"),
        status: $("status"),
        logs: $("logs"),
        resolution: $("resolution"),
        bitrate: $("bitrate"),
        batchSize: $("batchSize"),
        // Batch viz
        batchBoxes: $("batchBoxes"),
        batchStatus: $("batchStatus"),
        currentBatch: $("currentBatch"),
        segmentsPerBatch: $("segmentsPerBatch"),
        conversionSpeed: $("conversionSpeed"),
        // Player controls
        playPauseBtn: $("playPauseBtn"),
        playIcon: $("playIcon"),
        pauseIcon: $("pauseIcon"),
        muteBtn: $("muteBtn"),
        volumeIcon: $("volumeIcon"),
        muteIcon: $("muteIcon"),
        volumeSlider: $("volumeSlider"),
        timeDisplay: $("timeDisplay"),
        // Stats
        statBatches: $("statBatches"),
        statQueued: $("statQueued"),
        statPlaying: $("statPlaying"),
        statSpeed: $("statSpeed")
    };
    
    // ===== LOGGING =====
    function log(msg, type = "info") {
        const t = new Date().toLocaleTimeString();
        const d = document.createElement("div");
        d.className = "log";
        d.innerHTML = \`<span class="log-time">[\${t}]</span><span class="log-msg \${type}">\${msg}</span>\`;
        el.logs.appendChild(d);
        el.logs.scrollTop = el.logs.scrollHeight;
        if(el.logs.children.length > 100) el.logs.removeChild(el.logs.firstChild);
        console.log(\`[\${type}]\`, msg);
    }
    
    function setStatus(txt, type = "") {
        el.status.textContent = txt;
        el.status.className = "status " + type;
    }
    
    function formatBytes(b) {
        if(b < 1024) return b + " B";
        if(b < 1048576) return (b/1024).toFixed(1) + " KB";
        return (b/1048576).toFixed(1) + " MB";
    }
    
    // ===== BATCH VISUALIZATION =====
    function initBatchBoxes() {
        el.batchBoxes.innerHTML = '';
        for(let i = 0; i < BATCH_QUEUE_SIZE; i++) {
            const box = document.createElement('div');
            box.className = 'batch-box empty';
            box.id = 'batch' + i;
            box.innerHTML = \`
                <div class="batch-label">Slot \${i+1}</div>
                <div class="batch-count">-</div>
            \`;
            el.batchBoxes.appendChild(box);
        }
        
        el.segmentsPerBatch.textContent = el.batchSize.value;
    }
    
    function updateBatchVisual(slotIndex, state, batchIndex) {
        const box = $('batch' + slotIndex);
        if(!box) return;
        
        box.className = 'batch-box ' + state;
        
        const count = box.querySelector('.batch-count');
        if(batchIndex !== null && batchIndex !== undefined) {
            count.textContent = '#' + batchIndex;
        } else {
            count.textContent = '-';
        }
    }
    
    function updateBatchStats() {
        const filled = state.batchQueue.getFilledCount();
        el.batchStatus.textContent = \`\${filled} / \${BATCH_QUEUE_SIZE}\`;
        el.statBatches.textContent = state.totalBatches;
        el.statQueued.textContent = filled;
        
        if(state.batchQueue.playingIndex >= 0) {
            const playing = state.batchQueue.batches[state.batchQueue.playingIndex];
            if(playing) {
                el.statPlaying.textContent = '#' + playing.batchIndex;
                el.currentBatch.textContent = '#' + playing.batchIndex;
            }
        } else {
            el.statPlaying.textContent = '-';
            el.currentBatch.textContent = '-';
        }
        
        // Average conversion speed
        if(state.conversionTimes.length > 0) {
            const avg = state.conversionTimes.reduce((a,b) => a+b, 0) / state.conversionTimes.length;
            el.statSpeed.textContent = (avg/1000).toFixed(1) + 's';
            el.conversionSpeed.textContent = '~' + (avg/1000).toFixed(1) + 's';
        }
        
        // ✅ Debug: Log queue contents
        const queueContents = [];
        for(let i = 0; i < BATCH_QUEUE_SIZE; i++) {
            if(state.batchQueue.batches[i] !== null) {
                queueContents.push(\`[\${i}]=#\${state.batchQueue.batches[i].batchIndex}\`);
            }
        }
        if(queueContents.length > 0) {
            console.log("📊 Queue:", queueContents.join(", "), "Playing:", state.batchQueue.playingIndex);
        }
    }
    
    // ===== FFMPEG =====
    async function initFFmpeg() {
        if(state.ffmpegReady) return;
        log("⚙️ FFmpeg yükleniyor (v0.11.6)...", "info");
        setStatus("FFmpeg yükleniyor...");
        
        try {
            state.ffmpeg = FFmpeg.createFFmpeg({
                log: false,
                corePath: "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js"
            });
            
            await state.ffmpeg.load();
            
            state.ffmpegReady = true;
            log("✅ FFmpeg hazır", "success");
        } catch(e) {
            log("❌ FFmpeg yüklenemedi: " + e.message, "error");
            throw e;
        }
    }
    
    function initCanvas() {
        if(state.canvas) return;
        el.placeholder.style.display = "none";
        state.canvas = document.createElement("canvas");
        state.canvas.width = 640;
        state.canvas.height = 360;
        el.playerBox.appendChild(state.canvas);
    }
    
    async function fetchText(url) {
        const resp = await fetch("/proxy?url=" + encodeURIComponent(url));
        if(!resp.ok) throw new Error("Fetch failed: " + resp.status);
        return await resp.text();
    }
    
    async function fetchBinary(url) {
        const resp = await fetch("/proxy?url=" + encodeURIComponent(url));
        if(!resp.ok) throw new Error("Fetch failed: " + resp.status);
        return new Uint8Array(await resp.arrayBuffer());
    }
    
    function parseM3U8(content, baseUrl) {
        const lines = content.split("\\n");
        const segments = [];
        const base = baseUrl.substring(0, baseUrl.lastIndexOf("/") + 1);
        let duration = 2.0;
        
        for(let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if(line.startsWith("#EXTINF:")) {
                const match = line.match(/#EXTINF:([0-9.]+)/);
                if(match) duration = parseFloat(match[1]);
            }
            
            if(line && !line.startsWith("#")) {
                let segUrl = line;
                if(!segUrl.startsWith("http")) {
                    segUrl = base + segUrl;
                }
                segments.push({ url: segUrl, duration: duration });
            }
        }
        return segments;
    }
    
    async function resolveM3U8(url) {
        const content = await fetchText(url);
        
        if(content.includes("#EXT-X-STREAM-INF")) {
            log("📋 Master playlist, varyant seçiliyor", "info");
            const lines = content.split("\\n");
            const base = url.substring(0, url.lastIndexOf("/") + 1);
            for(let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if(line && !line.startsWith("#")) {
                    const variantUrl = line.startsWith("http") ? line : base + line;
                    return await resolveM3U8(variantUrl);
                }
            }
        }
        
        return { content: content, url: url };
    }
    
    function combineBatches(dataArray) {
        let totalLen = 0;
        for(let d of dataArray) totalLen += d.length;
        
        const combined = new Uint8Array(totalLen);
        let offset = 0;
        for(let d of dataArray) {
            combined.set(d, offset);
            offset += d.length;
        }
        
        return combined;
    }
    
    async function convertBatch(batchData, idx, slotIndex) {
        const resolution = el.resolution.value;
        const bitrate = el.bitrate.value;
        const inputName = \`batch_\${idx}.ts\`;
        const outputName = \`output_\${idx}.ts\`;
        
        try {
            const startTime = Date.now();
            
            state.ffmpeg.FS("writeFile", inputName, batchData);
            
            // ✅ NO -re PARAMETER - Fast conversion!
            await state.ffmpeg.run(
                "-i", inputName,
                "-f", "mpegts",
                "-codec:v", "mpeg1video",
                "-s", resolution,
                "-b:v", bitrate,
                "-r", "25",
                "-bf", "0",
                "-q:v", "5",
                "-codec:a", "mp2",
                "-ar", "48000",
                "-ac", "2",
                "-b:a", "96k",
                outputName
            );
            
            const output = state.ffmpeg.FS("readFile", outputName);
            
            try { state.ffmpeg.FS("unlink", inputName); } catch(e){}
            try { state.ffmpeg.FS("unlink", outputName); } catch(e){}
            
            const convTime = Date.now() - startTime;
            state.conversionTimes.push(convTime);
            if(state.conversionTimes.length > 10) state.conversionTimes.shift();
            
            log(\`✅ Batch #\${idx} dönüştürüldü: \${formatBytes(output.length)} (\${(convTime/1000).toFixed(1)}s)\`, "success");
            updateBatchVisual(slotIndex, 'ready', idx);
            
            return output;
        } catch(err) {
            log(\`❌ FFmpeg hata: \${err.message}\`, "error");
            try { state.ffmpeg.FS("unlink", inputName); } catch(e){}
            return null;
        }
    }
    
    // ===== PLAYER =====
    const ManualSource = function(url, options) {
        this.streaming = true;
        this.completed = false;
        this.established = false;
        this.destination = null;
    };
    
    ManualSource.prototype.connect = function(destination) {
        this.destination = destination;
    };
    
    ManualSource.prototype.start = function() {};
    ManualSource.prototype.resume = function() {};
    ManualSource.prototype.destroy = function() { this.destination = null; };
    
    ManualSource.prototype.write = function(data) {
        if(!this.established) {
            this.established = true;
        }
        if(this.destination) {
            this.destination.write(data);
        }
    };
    
    async function createPlayer() {
        if(state.player) return;
        
        if(typeof JSMpeg === "undefined") {
            log("❌ JSMpeg yüklenmedi!", "error");
            return;
        }
        
        return new Promise((resolve) => {
            state.player = new JSMpeg.Player(null, {
                source: ManualSource,
                canvas: state.canvas,
                autoplay: true,
                audio: true,
                loop: false,
                pauseWhenHidden: false,
                videoBufferSize: 16*1024*1024,
                audioBufferSize: 2*1024*1024,
                streaming: true,
                targetAudioBuffer: 0.3,
                maxSyncDrift: 0.2,
                hardSyncLimit: 0.3,
                onSyncReset: function(info) {
                    log("🔄 Sync reset: " + info.reason, "warn");
                }
            });
            
            setTimeout(() => {
                if(state.player.audioOut) {
                    state.player.audioOut.gain.value = state.volume;
                }
                
                el.playPauseBtn.disabled = false;
                el.muteBtn.disabled = false;
                
                log("🎬 Player oluşturuldu", "success");
                resolve();
            }, 300);
        });
    }
    
    // ===== PLAYBACK LOOP =====
    async function playbackLoop() {
        log("▶️ Playback loop başladı", "success");
        
        let isFirstBatch = true;
        let lastPlayedBatchIndex = -1;
        let waitCount = 0;
        const MAX_WAIT_COUNT = 20;  // 20 * 500ms = 10 seconds max wait
        
        while(state.isPlaying && state.running) {
            const nextBatch = state.batchQueue.getNext();
            
            if(nextBatch) {
                const slotIdx = state.batchQueue.playingIndex;
                const batchIdx = nextBatch.batchIndex;
                
                // ✅ Sanity check: Batch index geriye gitmemeli
                if(lastPlayedBatchIndex >= 0 && batchIdx <= lastPlayedBatchIndex) {
                    log(\`⚠️ Batch index geriye gitti! Last: #\${lastPlayedBatchIndex}, Current: #\${batchIdx}\`, "error");
                    state.batchQueue.clear(slotIdx);
                    await sleep(500);
                    continue;
                }
                
                // ✅ Check for gaps in sequence
                if(lastPlayedBatchIndex >= 0 && batchIdx > lastPlayedBatchIndex + 1) {
                    const gap = batchIdx - lastPlayedBatchIndex - 1;
                    log(\`⚠️ Batch GAP tespit edildi! Missing batches: #\${lastPlayedBatchIndex + 1} to #\${batchIdx - 1} (\${gap} batch)\`, "warn");
                    // Continue anyway, but log the gap
                }
                
                updateBatchVisual(slotIdx, 'playing', batchIdx);
                updateBatchStats();
                
                log(\`▶️ Batch #\${batchIdx} oynatılıyor [slot \${slotIdx}]\`, "success");
                
                // Reset wait counter
                waitCount = 0;
                
                if(!state.player) {
                    await createPlayer();
                }
                
                if(state.player && state.player.source) {
                    if(isFirstBatch) {
                        log("🎬 İlk batch, decoder başlatılıyor...", "info");
                        state.player.source.write(nextBatch.data.buffer);
                        isFirstBatch = false;
                        await sleep(1000);
                    } else {
                        if(state.player.video && state.player.video.decoder) {
                            state.player.source.write(nextBatch.data.buffer);
                        } else {
                            log("⚠️ Decoder not ready, waiting...", "warn");
                            await sleep(500);
                            continue;
                        }
                    }
                    
                    // Update last played index
                    lastPlayedBatchIndex = batchIdx;
                    
                    // Batch duration estimate (5 segments * 2s = ~10s)
                    const batchSize = parseInt(el.batchSize.value);
                    const estimatedDuration = batchSize * 2000;
                    await sleep(estimatedDuration * 0.9);
                    
                    state.batchQueue.clear(slotIdx);
                    updateBatchStats();
                } else {
                    log("⚠️ Player not ready", "warn");
                    await sleep(500);
                }
                
            } else {
                // ✅ No next batch available
                waitCount++;
                
                if(state.batchQueue.getFilledCount() === 0) {
                    log(\`⏸️ Queue boş, dolması bekleniyor... (\${waitCount}/\${MAX_WAIT_COUNT})\`, "warn");
                } else {
                    // Queue'da batch var ama sequential değil
                    const queueContents = [];
                    for(let i = 0; i < BATCH_QUEUE_SIZE; i++) {
                        if(state.batchQueue.batches[i] !== null) {
                            queueContents.push(\`#\${state.batchQueue.batches[i].batchIndex}\`);
                        }
                    }
                    log(\`⏸️ Yeni sequential batch bekleniyor. Last: #\${lastPlayedBatchIndex}, Queue: [\${queueContents.join(', ')}]\`, "warn");
                }
                
                // ✅ Check if we've been waiting too long
                if(waitCount >= MAX_WAIT_COUNT) {
                    log(\`❌ Too long wait (\${waitCount} cycles), stopping playback\`, "error");
                    state.isPlaying = false;
                    setStatus("Playback timeout", "error");
                    break;
                }
                
                await sleep(500);
            }
        }
        
        log("⏹️ Playback loop durdu", "info");
    }
    
    // ===== DOWNLOAD LOOP =====
    async function downloadLoop(m3u8Url) {
        let initialLoad = true;
        let nextExpectedBatch = 0;  // ✅ Track expected batch number
        
        while(state.running) {
            try {
                const resolved = await resolveM3U8(m3u8Url);
                const segments = parseM3U8(resolved.content, resolved.url);
                
                if(segments.length === 0) {
                    log("⚠️ Segment bulunamadı", "warn");
                    await sleep(2000);
                    continue;
                }
                
                // Get last N segments
                const batchSize = parseInt(el.batchSize.value);
                const startIdx = Math.max(0, segments.length - batchSize);
                const currentSet = segments.slice(startIdx);
                
                // Filter new segments
                const newSegments = [];
                for(const seg of currentSet) {
                    const segKey = seg.url.split("/").pop().split("?")[0];
                    if(!state.processedSegments[segKey]) {
                        newSegments.push(seg);
                        state.processedSegments[segKey] = true;
                    }
                }
                
                if(newSegments.length > 0) {
                    if(initialLoad) {
                        log(\`🔄 İlk yükleme: \${newSegments.length} segment\`, "info");
                        initialLoad = false;
                    } else {
                        log(\`📥 Yeni \${newSegments.length} segment\`, "info");
                    }
                    
                    // ✅ Wait if queue is full
                    while(state.batchQueue.getFilledCount() >= BATCH_QUEUE_SIZE && state.running) {
                        log("⏸️ Queue dolu, bekle...", "warn");
                        await sleep(1000);
                    }
                    
                    // ✅ Check if we can create a batch
                    const currentBatchNumber = state.totalBatches;
                    
                    // ✅ Verify this batch doesn't already exist
                    let batchExists = false;
                    for(let i = 0; i < BATCH_QUEUE_SIZE; i++) {
                        if(state.batchQueue.batches[i] !== null) {
                            if(state.batchQueue.batches[i].batchIndex === currentBatchNumber) {
                                batchExists = true;
                                log(\`⚠️ Batch #\${currentBatchNumber} zaten var, atlanıyor\`, "warn");
                                break;
                            }
                        }
                    }
                    
                    if(batchExists) {
                        // Skip this batch, don't increment counter
                        await sleep(POLL_INTERVAL);
                        continue;
                    }
                    
                    // Find empty slot for visualization
                    const emptySlot = state.batchQueue.getNextEmptySlot();
                    if(emptySlot >= 0) {
                        updateBatchVisual(emptySlot, 'downloading', currentBatchNumber);
                    }
                    
                    // ✅ Download batch
                    const batchData = [];
                    for(let i = 0; i < newSegments.length; i++) {
                        if(!state.running) break;
                        try {
                            log(\`⬇️ İndiriliyor: Segment \${i+1}/\${newSegments.length}\`, "info");
                            const data = await fetchBinary(newSegments[i].url);
                            batchData.push(data);
                        } catch(e) {
                            log(\`❌ Segment hatası: \${e.message}\`, "warn");
                        }
                    }
                    
                    if(batchData.length > 0 && state.running) {
                        // ✅ Combine segments
                        log(\`📦 \${batchData.length} segment birleştiriliyor...\`, "info");
                        const combined = combineBatches(batchData);
                        
                        // Update visual
                        if(emptySlot >= 0) {
                            updateBatchVisual(emptySlot, 'converting', currentBatchNumber);
                        }
                        
                        // ✅ Convert batch (NO -re!)
                        log(\`⚙️ Batch #\${currentBatchNumber} dönüştürülüyor: \${formatBytes(combined.length)}\`, "info");
                        const mpegData = await convertBatch(combined, currentBatchNumber, emptySlot);
                        
                        if(mpegData && state.running) {
                            // ✅ Double-check batch doesn't exist (race condition)
                            let stillExists = false;
                            for(let i = 0; i < BATCH_QUEUE_SIZE; i++) {
                                if(state.batchQueue.batches[i] !== null) {
                                    if(state.batchQueue.batches[i].batchIndex === currentBatchNumber) {
                                        stillExists = true;
                                        log(\`⚠️ Batch #\${currentBatchNumber} race condition, atlanıyor\`, "warn");
                                        break;
                                    }
                                }
                            }
                            
                            if(!stillExists) {
                                // ✅ Add to queue
                                const added = state.batchQueue.add(mpegData, currentBatchNumber);
                                if(added !== null) {
                                    log(\`✅ Batch #\${currentBatchNumber} eklendi\`, "success");
                                    state.totalBatches++;  // ✅ Only increment on successful add
                                    nextExpectedBatch = state.totalBatches;
                                    updateBatchStats();
                                    
                                    // ✅ Start playback after first batch
                                    const filled = state.batchQueue.getFilledCount();
                                    if(filled >= 1 && !state.isPlaying) {
                                        log(\`🎬 İlk batch hazır, playback başlatılıyor...\`, "success");
                                        state.isPlaying = true;
                                        setStatus("CANLI", "live");
                                        
                                        await createPlayer();
                                        await sleep(200);
                                        playbackLoop();
                                    }
                                } else {
                                    log(\`❌ Batch #\${currentBatchNumber} queue'ya eklenemedi\`, "error");
                                }
                            } else {
                                // Duplicate, clean up visual
                                if(emptySlot >= 0) {
                                    updateBatchVisual(emptySlot, 'empty', null);
                                }
                            }
                        }
                    }
                }
                
                await sleep(POLL_INTERVAL);
                
            } catch(err) {
                log(\`❌ Download hata: \${err.message}\`, "error");
                await sleep(3000);
            }
        }
    }
    
    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
    
    // ===== PLAYER CONTROLS =====
    function togglePlayPause() {
        if(!state.player) return;
        
        if(state.isPaused) {
            if(state.player.play) state.player.play();
            el.playIcon.style.display = "none";
            el.pauseIcon.style.display = "block";
            state.isPaused = false;
            log("▶️ Oynatma devam etti", "info");
        } else {
            if(state.player.pause) state.player.pause();
            el.playIcon.style.display = "block";
            el.pauseIcon.style.display = "none";
            state.isPaused = true;
            log("⏸️ Oynatma duraklatıldı", "info");
        }
    }
    
    function toggleMute() {
        if(!state.player || !state.player.audioOut) return;
        
        if(state.volume > 0) {
            state.player.audioOut.gain.value = 0;
            el.volumeIcon.style.display = "none";
            el.muteIcon.style.display = "block";
            el.volumeSlider.value = 0;
            log("🔇 Ses kapatıldı", "info");
        } else {
            state.volume = 0.8;
            state.player.audioOut.gain.value = state.volume;
            el.volumeIcon.style.display = "block";
            el.muteIcon.style.display = "none";
            el.volumeSlider.value = 80;
            log("🔊 Ses açıldı", "info");
        }
    }
    
    function setVolume(value) {
        if(!state.player || !state.player.audioOut) return;
        
        state.volume = value / 100;
        state.player.audioOut.gain.value = state.volume;
        
        if(value === 0) {
            el.volumeIcon.style.display = "none";
            el.muteIcon.style.display = "block";
        } else {
            el.volumeIcon.style.display = "block";
            el.muteIcon.style.display = "none";
        }
    }
    
    function updateTimeDisplay() {
        if(state.startTime === 0) return;
        
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const h = Math.floor(elapsed / 3600);
        const m = Math.floor((elapsed % 3600) / 60);
        const s = elapsed % 60;
        
        el.timeDisplay.textContent = 
            String(h).padStart(2, "0") + ":" +
            String(m).padStart(2, "0") + ":" +
            String(s).padStart(2, "0");
    }
    
    // ===== CONTROL =====
    async function start() {
        const url = el.urlInput.value.trim();
        if(!url) {
            log("❌ URL girilmedi", "error");
            return;
        }
        
        state.running = true;
        state.totalBatches = 0;
        state.processedSegments = {};
        state.batchQueue = new BatchQueue(BATCH_QUEUE_SIZE);
        state.isPlaying = false;
        state.isPaused = false;
        state.startTime = Date.now();
        state.conversionTimes = [];
        
        el.startBtn.disabled = true;
        el.stopBtn.disabled = false;
        
        initBatchBoxes();
        updateBatchStats();
        
        try {
            await initFFmpeg();
            initCanvas();
            setStatus("İndiriliyor...");
            
            log(\`🚀 Batch system başlatıldı\`, "success");
            log(\`📦 Batch size: \${el.batchSize.value} segment, Queue: \${BATCH_QUEUE_SIZE} batch\`, "info");
            log(\`⚡ Fast conversion (NO -re)\`, "info");
            
            await downloadLoop(url);
            
        } catch(err) {
            log(\`❌ Kritik hata: \${err.message}\`, "error");
            setStatus("Hata: " + err.message, "error");
        }
        
        state.running = false;
        el.startBtn.disabled = false;
        el.stopBtn.disabled = true;
    }
    
    function stop() {
        log("🛑 Durduruluyor...", "warn");
        state.running = false;
        state.isPlaying = false;
        state.startTime = 0;
        
        if(state.player) {
            try { state.player.destroy(); } catch(e){}
            state.player = null;
        }
        
        el.playPauseBtn.disabled = true;
        el.muteBtn.disabled = true;
        
        setStatus("Durduruldu");
        updateBatchStats();
    }
    
    // ===== EVENTS =====
    el.startBtn.onclick = start;
    el.stopBtn.onclick = stop;
    el.urlInput.onkeypress = e => { if(e.key === "Enter") start(); };
    
    el.playPauseBtn.onclick = togglePlayPause;
    el.muteBtn.onclick = toggleMute;
    el.volumeSlider.oninput = function() { setVolume(this.value); };
    
    el.batchSize.onchange = function() {
        el.segmentsPerBatch.textContent = this.value;
    };
    
    // Time display update
    setInterval(updateTimeDisplay, 1000);
    
    // ===== INIT =====
    if(typeof JSMpeg !== "undefined") {
        log("✅ JSMpeg yüklendi", "success");
    } else {
        log("❌ JSMpeg yüklenemedi!", "error");
    }
    
    initBatchBoxes();
    log("🎬 Batch System hazır", "success");
    log(\`📦 Queue: \${BATCH_QUEUE_SIZE} batch • Fast conversion mode\`, "info");
})();
</script>
</body>
</html>`;
}
