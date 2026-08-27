import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Shannon Entropy Calculator ──────────────────────────────────────────────
function shannonEntropy(values) {
  if (!values || values.length < 2) return 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 0;
  const bins = new Array(10).fill(0);
  values.forEach(v => {
    const idx = Math.min(9, Math.floor(((v - min) / (max - min)) * 10));
    bins[idx]++;
  });
  let entropy = 0;
  const n = values.length;
  bins.forEach(count => {
    if (count > 0) {
      const p = count / n;
      entropy -= p * Math.log2(p);
    }
  });
  return entropy; // max ≈ 3.32
}

// ─── Canvas / WebGL / AudioContext Fingerprinting ────────────────────────────
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('VIBE Bot?', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('VIBE Bot?', 4, 17);
    return canvas.toDataURL().slice(-50);
  } catch { return 'canvas_blocked'; }
}

function getWebGLInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { vendor: 'none', renderer: 'none' };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    };
  } catch { return { vendor: 'error', renderer: 'error' }; }
}

async function getAudioFingerprint() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
    const oscillator = ctx.createOscillator();
    const analyser = ctx.createAnalyser();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    oscillator.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(0);
    const dataArr = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(dataArr);
    oscillator.stop();
    ctx.close();
    return dataArr.slice(0, 10).reduce((a, b) => a + b, 0).toFixed(4);
  } catch { return 'audio_blocked'; }
}

// ─── Advanced Headless Browser Detection (20+ checks) ────────────────────────
function getHeadlessSignals() {
  const signals = {};
  // Group 1: navigator
  signals.webdriver         = navigator.webdriver === true;
  signals.noPlugins         = navigator.plugins.length === 0;
  signals.noLanguages       = !navigator.languages || navigator.languages.length === 0;
  signals.headlessUA        = /HeadlessChrome|PhantomJS|Electron/i.test(navigator.userAgent);
  signals.missingAppVersion = navigator.appVersion === '';
  signals.noVendor          = navigator.vendor === '' && !/Firefox/.test(navigator.userAgent);
  // Group 2: window/screen
  signals.zeroScreen        = screen.width === 0 || screen.height === 0;
  signals.zeroOuter         = window.outerWidth === 0 || window.outerHeight === 0;
  signals.noColorDepth      = screen.colorDepth < 8;
  signals.windowLessOuter   = window.outerWidth < window.innerWidth;
  // Group 3: Chrome-specific
  const chrome = window.chrome;
  signals.noChrome          = typeof chrome === 'undefined';
  signals.noRuntime         = !chrome || !chrome.runtime;
  signals.hasCDPArtifacts   = !!(window.__nightmare || window._phantom || window.callPhantom);
  // Group 4: performance timing
  try {
    const timing = performance.timing || {};
    signals.zeroNavStart    = (timing.navigationStart || 0) === 0;
    signals.noConnectEnd    = (timing.connectEnd || 0) === 0 && (timing.navigationStart || 0) > 0;
  } catch { signals.timingError = true; }
  // Group 5: CSS media
  signals.noPointer         = !window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(pointer: coarse)').matches;
  signals.noHover           = !window.matchMedia('(hover: hover)').matches && !window.matchMedia('(hover: none)').matches;
  // Group 6: native function checks
  try {
    signals.nativeAlert     = window.alert.toString().indexOf('native code') === -1;
    signals.nativeOpen      = window.open.toString().indexOf('native code') === -1;
  } catch { signals.nativeFuncError = true; }

  const score = Object.values(signals).filter(Boolean).length;
  return { signals, score };
}

export function useBehaviorTracker() {
  const data = useRef({
    keystroke: {
      latencies: [],
      keyCount: 0,
      backspaceCount: 0,
      totalTime: 0,
      lastKeyPressTime: null,
      startTime: null,
      typingIntervals: [],
    },
    mouse: {
      totalDistance: 0,
      positions: [],
      hasMovement: false,
      startTime: null,
      lastMoveTime: null,
      speeds: [],
      angles: [],
    },
    dwell: { mountTime: Date.now() },
    scroll: {
      scrollCount: 0,
      maxDepth: 0,
      directionChanges: 0,
      lastY: 0,
      lastDirection: null,
      intervals: [],
      lastScrollTime: null,
      timeToFirstScroll: null,
      mountTime: Date.now(),
    },
    touch: { hasTouch: false, touchEventCount: 0 },
    fingerprint: { canvas: null, webgl: null, audio: null },
  });

  useEffect(() => {
    // Collect hardware fingerprints on mount
    const fp = data.current.fingerprint;
    fp.canvas = getCanvasFingerprint();
    fp.webgl  = getWebGLInfo();
    getAudioFingerprint().then(hash => { fp.audio = hash; });

    // Keystroke tracking
    const handleKeyDown = (e) => {
      const now = Date.now();
      const state = data.current.keystroke;
      if (!state.startTime) state.startTime = now;
      state.keyCount++;
      if (e.key === 'Backspace') state.backspaceCount++;
      if (state.lastKeyPressTime) {
        const interval = now - state.lastKeyPressTime;
        state.latencies.push(interval);
        state.typingIntervals.push(interval);
      }
      state.lastKeyPressTime = now;
      state.totalTime = now - state.startTime;
    };

    // Mouse tracking with speed + angle collection for entropy
    const handleMouseMove = (e) => {
      const now = Date.now();
      const state = data.current.mouse;
      if (!state.startTime) state.startTime = now;
      state.hasMovement = true;
      state.lastMoveTime = now;

      const pos = { x: e.clientX, y: e.clientY, t: now };
      if (state.positions.length > 0) {
        const last = state.positions[state.positions.length - 1];
        const dx = pos.x - last.x;
        const dy = pos.y - last.y;
        const dt = (pos.t - last.t) / 1000 || 0.001;
        const dist = Math.sqrt(dx * dx + dy * dy);
        state.totalDistance += dist;
        state.speeds.push(dist / dt);
        state.angles.push(Math.atan2(dy, dx) * (180 / Math.PI));
      }
      if (state.positions.length < 200) state.positions.push(pos);
    };

    // Scroll tracking with interval timing
    const handleScroll = () => {
      const now = Date.now();
      const state = data.current.scroll;
      state.scrollCount++;
      if (state.timeToFirstScroll === null) {
        state.timeToFirstScroll = now - state.mountTime;
      }
      if (state.lastScrollTime !== null) {
        state.intervals.push(now - state.lastScrollTime);
      }
      state.lastScrollTime = now;

      const depth = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
      state.maxDepth = Math.max(state.maxDepth, Math.min(1, depth));
      const direction = window.scrollY > state.lastY ? 'down' : 'up';
      if (state.lastDirection && direction !== state.lastDirection) state.directionChanges++;
      state.lastDirection = direction;
      state.lastY = window.scrollY;
    };

    const handleTouch = () => {
      data.current.touch.hasTouch = true;
      data.current.touch.touchEventCount++;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('touchstart', handleTouch);
    document.addEventListener('touchmove', handleTouch);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  const getData = useCallback(() => {
    const kState = data.current.keystroke;
    const mState = data.current.mouse;
    const dState = data.current.dwell;
    const sState = data.current.scroll;
    const fp     = data.current.fingerprint;
    const now    = Date.now();

    // Keystroke Stats
    let avgLatency = 0, stdDev = 0;
    if (kState.latencies.length > 0) {
      const sum = kState.latencies.reduce((a, b) => a + b, 0);
      avgLatency = sum / kState.latencies.length;
      const variance = kState.latencies.reduce((a, b) => a + Math.pow(b - avgLatency, 2), 0) / kState.latencies.length;
      stdDev = Math.sqrt(variance);
    }
    const typingRhythmEntropy = shannonEntropy(kState.typingIntervals);
    const backspaceRatio = kState.keyCount > 0 ? kState.backspaceCount / kState.keyCount : 0;

    // Mouse Stats
    let avgSpeed = 0, straightLineRatio = 0;
    const mouseTime = mState.lastMoveTime ? (mState.lastMoveTime - mState.startTime) / 1000 : 0;
    if (mouseTime > 0) avgSpeed = mState.totalDistance / mouseTime;
    if (mState.positions.length > 1) {
      const firstPos = mState.positions[0];
      const lastPos  = mState.positions[mState.positions.length - 1];
      const dx = lastPos.x - firstPos.x;
      const dy = lastPos.y - firstPos.y;
      const straightLineDist = Math.sqrt(dx * dx + dy * dy);
      straightLineRatio = mState.totalDistance > 0 ? straightLineDist / mState.totalDistance : 0;
    }
    const mouseSpeedEntropy = shannonEntropy(mState.speeds);
    const mouseAngleEntropy = shannonEntropy(mState.angles);

    // Scroll Stats
    let scrollIntervalVariance = 0;
    if (sState.intervals.length > 1) {
      const mean = sState.intervals.reduce((a, b) => a + b, 0) / sState.intervals.length;
      scrollIntervalVariance = sState.intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sState.intervals.length;
    }
    const scrollIntervalEntropy = shannonEntropy(sState.intervals);

    // Advanced Headless Signals
    const { signals, score } = getHeadlessSignals();

    return {
      keystroke: {
        avgLatency,
        stdDev,
        keyCount: kState.keyCount,
        totalTime: kState.totalTime,
        typingRhythmEntropy,  // NEW: low = robotic rhythm
        backspaceRatio,       // NEW: 0 = no typos = bot
      },
      mouse: {
        totalDistance: mState.totalDistance,
        avgSpeed,
        straightLineRatio,
        hasMovement: mState.hasMovement,
        speedEntropy: mouseSpeedEntropy,  // NEW: low = constant speed = bot
        angleEntropy: mouseAngleEntropy,  // NEW: low = straight lines = bot
      },
      dwell: {
        pageLoadToSubmit: now - dState.mountTime,
      },
      scroll: {
        scrollCount: sState.scrollCount,
        maxDepth: sState.maxDepth,
        directionChanges: sState.directionChanges,
        intervalVariance: scrollIntervalVariance,  // NEW: low = constant scroll = bot
        intervalEntropy: scrollIntervalEntropy,    // NEW: low entropy = bot
        timeToFirstScroll: sState.timeToFirstScroll, // NEW: < 500ms = suspicious
      },
      touch: {
        hasTouch: data.current.touch.hasTouch,
        touchEventCount: data.current.touch.touchEventCount,
      },
      device: {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      },
      automation: {
        automationSignals: signals,
        automationScore: score,  // now 0–20 (was 0–5)
      },
      fingerprint: {             // NEW: Hardware fingerprinting
        canvas: fp.canvas,
        webglVendor: fp.webgl?.vendor,
        webglRenderer: fp.webgl?.renderer,
        audioHash: fp.audio,
      },
    };
  }, []);

  return { getData };
}
