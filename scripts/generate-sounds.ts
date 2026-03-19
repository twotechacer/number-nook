/**
 * Sound generator for Number Nook
 * Synthesizes simple WAV files using sine waves, noise, and envelopes.
 * Run: npx tsx scripts/generate-sounds.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const SAMPLE_RATE = 22050;
const OUTPUT_DIR = path.resolve(__dirname, '../assets/audio/sfx');

// ── WAV file writer ──────────────────────────────────────────
function writeWav(filename: string, samples: Float32Array) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);       // chunk size
  buffer.writeUInt16LE(1, 20);        // PCM
  buffer.writeUInt16LE(1, 22);        // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);        // block align
  buffer.writeUInt16LE(16, 34);       // bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`  ✓ ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// ── Synthesis primitives ─────────────────────────────────────
function sineWave(freq: number, duration: number, volume = 0.5): Float32Array {
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    samples[i] = Math.sin(2 * Math.PI * freq * i / SAMPLE_RATE) * volume;
  }
  return samples;
}

function whiteNoise(duration: number, volume = 0.3): Float32Array {
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    samples[i] = (Math.random() * 2 - 1) * volume;
  }
  return samples;
}

function applyEnvelope(samples: Float32Array, attack: number, decay: number): Float32Array {
  const result = new Float32Array(samples.length);
  const attackSamples = Math.floor(attack * SAMPLE_RATE);
  const decaySamples = Math.floor(decay * SAMPLE_RATE);
  const decayStart = samples.length - decaySamples;

  for (let i = 0; i < samples.length; i++) {
    let env = 1;
    if (i < attackSamples) env = i / attackSamples;
    if (i > decayStart) env = (samples.length - i) / decaySamples;
    result[i] = samples[i] * env;
  }
  return result;
}

function mix(...arrays: Float32Array[]): Float32Array {
  const maxLen = Math.max(...arrays.map(a => a.length));
  const result = new Float32Array(maxLen);
  for (const arr of arrays) {
    for (let i = 0; i < arr.length; i++) {
      result[i] += arr[i];
    }
  }
  // Normalize if clipping
  let peak = 0;
  for (let i = 0; i < result.length; i++) peak = Math.max(peak, Math.abs(result[i]));
  if (peak > 1) {
    for (let i = 0; i < result.length; i++) result[i] /= peak;
  }
  return result;
}

function concat(...arrays: Float32Array[]): Float32Array {
  const totalLen = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Float32Array(totalLen);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function freqSweep(startFreq: number, endFreq: number, duration: number, volume = 0.4): Float32Array {
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / len;
    const freq = startFreq + (endFreq - startFreq) * t;
    samples[i] = Math.sin(2 * Math.PI * freq * i / SAMPLE_RATE) * volume;
  }
  return samples;
}

// ── Sound definitions ────────────────────────────────────────

function objectTap(): Float32Array {
  // Soft pop: 800Hz sine with quick exponential decay
  const tone = sineWave(800, 0.2, 0.5);
  return applyEnvelope(tone, 0.005, 0.15);
}

function bubblePop(): Float32Array {
  // Bubbly: frequency sweep up + soft noise burst
  const sweep = freqSweep(600, 1200, 0.15, 0.4);
  const noise = applyEnvelope(whiteNoise(0.1, 0.15), 0.005, 0.08);
  return mix(applyEnvelope(sweep, 0.005, 0.1), noise);
}

function treatFeed(): Float32Array {
  // Soft crunch: short noise burst with quick decay
  const noise = whiteNoise(0.1, 0.35);
  return applyEnvelope(noise, 0.005, 0.07);
}

function correctAnswer(): Float32Array {
  // Cheerful chime: C5 → E5 → G5 ascending thirds
  const c5 = applyEnvelope(sineWave(523, 0.15, 0.4), 0.005, 0.1);
  const e5 = applyEnvelope(sineWave(659, 0.15, 0.4), 0.005, 0.1);
  const g5 = applyEnvelope(sineWave(784, 0.15, 0.5), 0.005, 0.12);
  return concat(c5, e5, g5);
}

function wrongAnswer(): Float32Array {
  // Gentle hmm: low tone with slow decay
  const tone = sineWave(300, 0.3, 0.3);
  return applyEnvelope(tone, 0.01, 0.25);
}

function starEarned(): Float32Array {
  // Sparkle fanfare: 5-note ascending arpeggio
  const notes = [523, 587, 659, 784, 1047]; // C5 D5 E5 G5 C6
  const parts = notes.map((freq, i) => {
    const vol = 0.3 + i * 0.04;
    const tone = sineWave(freq, 0.16, vol);
    // Add harmonic shimmer
    const harmonic = sineWave(freq * 2, 0.16, vol * 0.2);
    return applyEnvelope(mix(tone, harmonic), 0.005, 0.12);
  });
  return concat(...parts);
}

function tummyFull(): Float32Array {
  // Happy celebration: major chord resolving upward
  // C major chord → higher C
  const c = applyEnvelope(sineWave(523, 0.2, 0.3), 0.005, 0.15);
  const e = applyEnvelope(sineWave(659, 0.2, 0.25), 0.005, 0.15);
  const g = applyEnvelope(sineWave(784, 0.2, 0.25), 0.005, 0.15);
  const chord = mix(c, e, g);
  const resolve = applyEnvelope(sineWave(1047, 0.3, 0.4), 0.01, 0.25);
  // Add shimmer
  const shimmer = applyEnvelope(sineWave(2093, 0.3, 0.1), 0.01, 0.25);
  return concat(chord, mix(resolve, shimmer));
}

function unlock(): Float32Array {
  // Unlock jingle: 4 ascending tones with shimmer overlay
  const freqs = [440, 554, 659, 880]; // A4 C#5 E5 A5
  const parts = freqs.map((freq, i) => {
    const tone = sineWave(freq, 0.2, 0.35);
    const shimmer = sineWave(freq * 3, 0.2, 0.08);
    return applyEnvelope(mix(tone, shimmer), 0.005, 0.15);
  });
  return concat(...parts);
}

// ── Main ─────────────────────────────────────────────────────
console.log('Generating Number Nook SFX...\n');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

writeWav('object_tap.wav', objectTap());
writeWav('bubble_pop.wav', bubblePop());
writeWav('treat_feed.wav', treatFeed());
writeWav('correct_answer.wav', correctAnswer());
writeWav('wrong_answer.wav', wrongAnswer());
writeWav('star_earned.wav', starEarned());
writeWav('tummy_full.wav', tummyFull());
writeWav('unlock.wav', unlock());

console.log('\nDone! 8 sound files generated.');
