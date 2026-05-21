// Web Audio API Synthesizer for Utily Meditation Timer
// Programmatic audio guarantees zero dependencies on external files or URLs.

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGainNode = null;
    this.ambientOscillators = [];
    this.ambientLFOs = [];
  }

  // Lazy initialization of AudioContext on first user interaction
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play meditation start/end/interval sound alerts
  playAlert(type) {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    if (type === 'bowl') {
      // Tibetan Singing Bowl
      // Synthesized using a rich blend of resonant frequencies (harmonics)
      const baseFreq = 220; // A3 pitch
      const partials = [
        { ratio: 1.0, volume: 1.0, decay: 8.0 },
        { ratio: 1.5, volume: 0.5, decay: 6.0 }, // fifth
        { ratio: 2.0, volume: 0.3, decay: 5.0 }, // octave
        { ratio: 2.61, volume: 0.25, decay: 4.0 }, // minor seventh-ish partial
        { ratio: 3.0, volume: 0.15, decay: 3.0 }, // octave+fifth
        { ratio: 4.13, volume: 0.1, decay: 2.0 }
      ];

      partials.forEach(partial => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * partial.ratio, now);
        
        // Add tiny detune vibrato to simulate real bowl thickness variation
        osc.frequency.linearRampToValueAtTime(baseFreq * partial.ratio + 2, now + 2);
        osc.frequency.linearRampToValueAtTime(baseFreq * partial.ratio - 2, now + 4);
        osc.frequency.linearRampToValueAtTime(baseFreq * partial.ratio, now + partial.decay);

        // Amplitude Envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(partial.volume * 0.15, now + 0.15); // gentle attack
        gain.gain.exponentialRampToValueAtTime(0.0001, now + partial.decay); // slow exponential decay

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + partial.decay + 0.5);
      });

    } else if (type === 'gong') {
      // Deep Meditation Gong
      const baseFreq = 100;
      // Inharmonic frequencies recreate the metallic complexity of a gong
      const partials = [
        { ratio: 1.0, volume: 1.0, decay: 10.0 },
        { ratio: 1.45, volume: 0.8, decay: 8.0 },
        { ratio: 1.91, volume: 0.6, decay: 7.0 },
        { ratio: 2.33, volume: 0.4, decay: 5.0 },
        { ratio: 3.12, volume: 0.2, decay: 3.0 },
        { ratio: 4.51, volume: 0.1, decay: 2.0 }
      ];

      // Deep rumble filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 6);
      filter.connect(this.ctx.destination);

      partials.forEach(partial => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Combine saw and sine waves for metallic rasp
        osc.type = partial.ratio > 2 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(baseFreq * partial.ratio, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(partial.volume * 0.12, now + 0.05); // sharp strike
        gain.gain.exponentialRampToValueAtTime(0.0001, now + partial.decay);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(now);
        osc.stop(now + partial.decay + 0.5);
      });

    } else if (type === 'chime') {
      // Soft Wind Chime (high frequency, pure, quick decay)
      const baseFreq = 1200;
      const partials = [
        { ratio: 1.0, volume: 0.8, decay: 3.0 },
        { ratio: 1.5, volume: 0.4, decay: 2.2 },
        { ratio: 1.96, volume: 0.2, decay: 1.5 }
      ];

      partials.forEach(partial => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * partial.ratio, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(partial.volume * 0.08, now + 0.01); // instantaneous strike
        gain.gain.exponentialRampToValueAtTime(0.0001, now + partial.decay);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + partial.decay + 0.5);
      });
    }
  }

  // Generates white noise buffer (reused for Rain & Ocean)
  createNoiseBuffer() {
    const bufferSize = 4 * this.ctx.sampleRate; // 4 seconds buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Start looping ambient background sounds
  startAmbient(type, volume = 0.5) {
    this.init();
    this.stopAmbient();
    if (!this.ctx) return;

    this.ambientGainNode = this.ctx.createGain();
    this.ambientGainNode.gain.setValueAtTime(0, this.ctx.currentTime); // fade-in start
    this.ambientGainNode.gain.linearRampToValueAtTime(volume * 0.25, this.ctx.currentTime + 1.5); // 1.5s fade-in
    this.ambientGainNode.connect(this.ctx.destination);

    const now = this.ctx.currentTime;

    if (type === 'rain') {
      // White noise generator
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      noise.loop = true;

      // Heavy lowpass filter to make it sound like deep rain falling
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(450, now);

      // Highpass filter to cut sub-bass rumble
      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(80, now);

      // Dynamic filter crackles (simulating random rain droplets hitting close by)
      const filterLFO = this.ctx.createOscillator();
      const filterLFOgain = this.ctx.createGain();
      filterLFO.frequency.value = 8; // 8Hz flutter
      filterLFO.type = 'sawtooth';
      filterLFOgain.gain.value = 35; // flutter range +/- 35Hz

      filterLFO.connect(filterLFOgain);
      filterLFOgain.connect(lowpass.frequency);

      noise.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(this.ambientGainNode);

      filterLFO.start(now);
      noise.start(now);

      this.ambientSource = noise;
      this.ambientOscillators = [filterLFO];

    } else if (type === 'ocean') {
      // Ocean Waves: modulated noise simulating rolling surf
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      noise.loop = true;

      // Filter settings
      const waveFilter = this.ctx.createBiquadFilter();
      waveFilter.type = 'bandpass';
      waveFilter.frequency.setValueAtTime(300, now);
      waveFilter.Q.setValueAtTime(1.0, now);

      // Low frequency oscillator (LFO) to swell the filter and volume
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, now); // ~12 seconds per wave cycle (inhale/exhale of tide)
      lfo.type = 'sine';

      // Wave volume swell
      const lfoGainVol = this.ctx.createGain();
      lfoGainVol.gain.setValueAtTime(0.3, now); // base gain modulation depth

      // Connect LFO to filter frequency to make it swell brighter as it gets louder
      const lfoGainFreq = this.ctx.createGain();
      lfoGainFreq.gain.setValueAtTime(150, now); // freq modulation depth

      // Dynamic gain node for the ocean wave swell
      const swellGain = this.ctx.createGain();
      swellGain.gain.setValueAtTime(0.3, now);

      // Wire LFO
      lfo.connect(lfoGainFreq);
      lfoGainFreq.connect(waveFilter.frequency);

      lfo.connect(lfoGainVol);
      lfoGainVol.connect(swellGain.gain);

      noise.connect(waveFilter);
      waveFilter.connect(swellGain);
      swellGain.connect(this.ambientGainNode);

      lfo.start(now);
      noise.start(now);

      this.ambientSource = noise;
      this.ambientOscillators = [lfo];

    } else if (type === 'forest') {
      // Deep Forest Drone: harmonic multi-oscillator hum
      const pitches = [65.4, 98.0, 130.8, 196.0]; // C2, G2, C3, G3
      this.ambientOscillators = [];
      this.ambientLFOs = [];

      pitches.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + Math.random() * 0.5, now);

        // Low frequency oscillator for organic volume waving
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.05 + idx * 0.02, now); // slightly different speeds

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(0.12, now);

        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);

        // Base volume
        oscGain.gain.setValueAtTime(0.04, now);

        osc.connect(oscGain);
        oscGain.connect(this.ambientGainNode);

        lfo.start(now);
        osc.start(now);

        this.ambientOscillators.push(osc);
        this.ambientLFOs.push(lfo);
      });
    }
  }

  // Adjust volume dynamically while playing
  setAmbientVolume(volume) {
    if (this.ambientGainNode && this.ctx) {
      this.ambientGainNode.gain.linearRampToValueAtTime(
        volume * 0.25,
        this.ctx.currentTime + 0.2
      );
    }
  }

  // Stop current ambient loops
  stopAmbient() {
    const fadeOutTime = 0.8;
    if (this.ambientGainNode && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        this.ambientGainNode.gain.cancelScheduledValues(now);
        this.ambientGainNode.gain.setValueAtTime(this.ambientGainNode.gain.value, now);
        this.ambientGainNode.gain.linearRampToValueAtTime(0.0001, now + fadeOutTime);
      } catch (e) {
        console.warn(e);
      }
    }

    setTimeout(() => {
      if (this.ambientSource) {
        try {
          this.ambientSource.stop();
        } catch (e) {}
        this.ambientSource = null;
      }
      if (this.ambientOscillators.length) {
        this.ambientOscillators.forEach(osc => {
          try { osc.stop(); } catch (e) {}
        });
        this.ambientOscillators = [];
      }
      if (this.ambientLFOs.length) {
        this.ambientLFOs.forEach(lfo => {
          try { lfo.stop(); } catch (e) {}
        });
        this.ambientLFOs = [];
      }
      if (this.ambientGainNode) {
        try { this.ambientGainNode.disconnect(); } catch (e) {}
        this.ambientGainNode = null;
      }
    }, fadeOutTime * 1000 + 50);
  }
}

const audioEngineInstance = new AudioEngine();
export default audioEngineInstance;
