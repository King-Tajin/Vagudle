export const playSadTrombone = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const r = () => Math.random();

    const reverbDuration = 2.8;
    const reverbBuffer = ctx.createBuffer(
      2,
      ctx.sampleRate * reverbDuration,
      ctx.sampleRate
    );
    for (let ch = 0; ch < 2; ch++) {
      const data = reverbBuffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        data[i] =
          (r() * 2 - 1) *
          Math.pow(1 - i / data.length, 2.2 + r() * 0.4) *
          Math.exp((-i / ctx.sampleRate) * (2.6 + r() * 0.5));
      }
    }
    const reverb = ctx.createConvolver();
    reverb.buffer = reverbBuffer;

    const saturation = ctx.createWaveShaper();
    const curveLen = 512;
    const curve = new Float32Array(curveLen);
    for (let i = 0; i < curveLen; i++) {
      const x = (i * 2) / curveLen - 1;
      curve[i] = ((Math.PI + 38) * x) / (Math.PI + 38 * Math.abs(x));
    }
    saturation.curve = curve;
    saturation.oversample = "4x";

    const real = new Float32Array([
      0, 1, 0.65, 0.52, 0.28, 0.22, 0.14, 0.09, 0.06, 0.04,
    ]);
    const imag = new Float32Array(real.length);
    const brassWave = ctx.createPeriodicWave(real, imag, {
      disableNormalization: false,
    });

    const dryGain = ctx.createGain();
    dryGain.gain.setValueAtTime(0.22, ctx.currentTime);
    const wetGain = ctx.createGain();
    wetGain.gain.setValueAtTime(0.32, ctx.currentTime);

    saturation.connect(dryGain);
    saturation.connect(reverb);
    reverb.connect(wetGain);
    dryGain.connect(ctx.destination);
    wetGain.connect(ctx.destination);

    const notes = [
      { freq: 392, start: 0.0, dur: 0.65 },
      { freq: 349, start: 0.58, dur: 0.65 },
      { freq: 311, start: 1.16, dur: 0.65 },
      { freq: 261, start: 1.74, dur: 2.4 },
    ];

    notes.forEach(({ freq, start, dur }, i) => {
      const isLast = i === notes.length - 1;
      const timeJitter = i === 0 ? 0 : (r() - 0.5) * 0.04;
      const pitchJitter = 1 + (r() - 0.5) * 0.008;
      const t = start + timeJitter;

      const noiseBuffer = ctx.createBuffer(
        1,
        ctx.sampleRate * 0.09,
        ctx.sampleRate
      );
      const noiseData = noiseBuffer.getChannelData(0);
      for (let s = 0; s < noiseData.length; s++) noiseData[s] = r() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = freq * (1.4 + r() * 0.2);
      noiseFilter.Q.value = 0.7 + r() * 0.3;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0, ctx.currentTime + t);
      noiseGain.gain.linearRampToValueAtTime(
        0.03 + r() * 0.015,
        ctx.currentTime + t + 0.012
      );
      noiseGain.gain.linearRampToValueAtTime(
        0.0,
        ctx.currentTime + t + 0.08 + r() * 0.02
      );
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(saturation);
      noise.start(ctx.currentTime + t);

      const makeVoice = (detuneCents: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.setPeriodicWave(brassWave);
        const detunedFreq =
          freq * pitchJitter * Math.pow(2, detuneCents / 1200);
        osc.frequency.setValueAtTime(detunedFreq, ctx.currentTime + t);

        if (isLast) {
          osc.frequency.linearRampToValueAtTime(
            detunedFreq * (0.91 + r() * 0.015),
            ctx.currentTime + t + dur
          );
          const vibratoLfo = ctx.createOscillator();
          const vibratoGain = ctx.createGain();
          vibratoLfo.type = "sine";
          vibratoLfo.frequency.setValueAtTime(
            3.8 + r() * 0.8,
            ctx.currentTime + t
          );
          vibratoGain.gain.setValueAtTime(0.0, ctx.currentTime + t);
          vibratoGain.gain.linearRampToValueAtTime(
            detunedFreq * (0.007 + r() * 0.003),
            ctx.currentTime + t + 0.7
          );
          vibratoLfo.connect(vibratoGain);
          vibratoGain.connect(osc.frequency);
          vibratoLfo.start(ctx.currentTime + t);
          vibratoLfo.stop(ctx.currentTime + t + dur + 0.1);
        } else {
          osc.frequency.linearRampToValueAtTime(
            detunedFreq * (0.965 + r() * 0.01),
            ctx.currentTime + t + dur
          );
        }

        const noteGain = 0.1 + r() * 0.02;
        gain.gain.setValueAtTime(0.0, ctx.currentTime + t);
        gain.gain.linearRampToValueAtTime(
          noteGain,
          ctx.currentTime + t + 0.08 + r() * 0.02
        );
        gain.gain.setValueAtTime(noteGain, ctx.currentTime + t + dur - 0.14);
        gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + t + dur);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000 + r() * 200, ctx.currentTime + t);
        filter.frequency.linearRampToValueAtTime(
          isLast ? 360 + r() * 60 : 500 + r() * 80,
          ctx.currentTime + t + dur
        );
        filter.Q.setValueAtTime(1.6 + r() * 0.5, ctx.currentTime + t);

        if (isLast) {
          const tremolo = ctx.createGain();
          const lfo = ctx.createOscillator();
          lfo.type = "sine";
          lfo.frequency.setValueAtTime(2.8 + r() * 0.9, ctx.currentTime + t);
          const lfoGain = ctx.createGain();
          lfoGain.gain.setValueAtTime(0.0, ctx.currentTime + t);
          lfoGain.gain.linearRampToValueAtTime(
            0.11 + r() * 0.04,
            ctx.currentTime + t + 0.6
          );
          lfo.connect(lfoGain);
          lfoGain.connect(tremolo.gain);
          tremolo.gain.setValueAtTime(1.0, ctx.currentTime + t);
          lfo.start(ctx.currentTime + t);
          lfo.stop(ctx.currentTime + t + dur + 0.1);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(tremolo);
          tremolo.connect(saturation);
        } else {
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(saturation);
        }

        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + dur + 0.1);
      };

      makeVoice(0);
      makeVoice(10);
    });

    const totalDur = 1.74 + 2.4 + 0.2;
    dryGain.gain.setValueAtTime(0.22, ctx.currentTime + totalDur - 0.4);
    dryGain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + totalDur);
    wetGain.gain.setValueAtTime(0.32, ctx.currentTime + totalDur - 0.4);
    wetGain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + totalDur + 1.4);

    setTimeout(
      () => {
        try {
          void ctx.close();
        } catch {}
      },
      (totalDur + 2.5) * 1000
    );
  } catch {}
};

export const playRattle = (progress: number) => {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const t = ctx.currentTime;

    const bufferSize = Math.floor(ctx.sampleRate * 0.06);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 700 + progress * 1400;
    noiseFilter.Q.value = 1.1;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, t);
    noiseGain.gain.linearRampToValueAtTime(0.1 + progress * 0.12, t + 0.006);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.06);

    const knock = ctx.createOscillator();
    const knockGain = ctx.createGain();
    knock.type = "triangle";
    knock.frequency.setValueAtTime(85 + progress * 35, t);
    knock.frequency.exponentialRampToValueAtTime(55, t + 0.05);
    knockGain.gain.setValueAtTime(0.0001, t);
    knockGain.gain.linearRampToValueAtTime(0.09 + progress * 0.06, t + 0.008);
    knockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    knock.connect(knockGain).connect(ctx.destination);
    knock.start(t);
    knock.stop(t + 0.07);

    setTimeout(() => {
      try {
        void ctx.close();
      } catch {}
    }, 200);
  } catch {}
};

export const playBurstSound = () => {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const t = ctx.currentTime;

    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = "sine";
    boom.frequency.setValueAtTime(110, t);
    boom.frequency.exponentialRampToValueAtTime(35, t + 0.35);
    boomGain.gain.setValueAtTime(0.0001, t);
    boomGain.gain.linearRampToValueAtTime(0.45, t + 0.03);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    boom.connect(boomGain).connect(ctx.destination);
    boom.start(t);
    boom.stop(t + 0.42);

    const creak = ctx.createOscillator();
    const creakGain = ctx.createGain();
    creak.type = "sawtooth";
    creak.frequency.setValueAtTime(180, t);
    creak.frequency.exponentialRampToValueAtTime(90, t + 0.22);
    creakGain.gain.setValueAtTime(0.0001, t);
    creakGain.gain.linearRampToValueAtTime(0.1, t + 0.02);
    creakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    creak.connect(creakGain).connect(ctx.destination);
    creak.start(t);
    creak.stop(t + 0.27);

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, i) => {
      const start = t + 0.28 + i * 0.08;
      const dur = i === notes.length - 1 ? 0.6 : 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(6000, start);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.17, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain).connect(filter).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    });

    setTimeout(() => {
      try {
        void ctx.close();
      } catch {}
    }, 1200);
  } catch {}
};

export const playWinSound = () => {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    const playTone = (freq: number, start: number, dur: number, vol = 0.18) => {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const g = ctx.createGain();
      const g2 = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(4000, start);
      filter.frequency.exponentialRampToValueAtTime(1800, start + dur);
      filter.Q.setValueAtTime(0.4, start);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 2, start);

      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.03);
      g.gain.setValueAtTime(vol * 0.6, start + dur * 0.35);
      g.gain.exponentialRampToValueAtTime(0.001, start + dur);

      g2.gain.setValueAtTime(0, start);
      g2.gain.linearRampToValueAtTime(vol * 0.12, start + 0.03);
      g2.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(g).connect(filter).connect(ctx.destination);
      osc2.connect(g2).connect(filter);
      osc.start(start);
      osc.stop(start + dur);
      osc2.start(start);
      osc2.stop(start + dur);
    };

    const t = ctx.currentTime;
    playTone(523.25, t, 0.17);
    playTone(659.25, t + 0.14, 0.17);
    playTone(783.99, t + 0.28, 0.17);
    playTone(1046.5, t + 0.43, 0.65, 0.22);
    playTone(783.99, t + 0.43, 0.65, 0.1);
    playTone(659.25, t + 0.43, 0.65, 0.06);

    setTimeout(() => {
      try {
        void ctx.close();
      } catch {}
    }, 2500);
  } catch {}
};
