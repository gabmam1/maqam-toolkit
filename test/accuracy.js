// test/accuracy.js - measure how accurate our pitch detection is.
// Run with:  node test/accuracy.js
//
// We generate sounds with a KNOWN frequency, run them through detectPitch and
// compare. The error in cents is what goes into the README table.

import { detectPitch } from '../yin.js';
import { freqToCents } from '../scales.js';

const SAMPLE_RATE = 48000;
const BUFFER_SIZE = 2048;

// TODO 1: generate a test tone.
// Return a Float32Array of `length` samples of a sine wave at `freq`:
//   x[n] = sin(2 * PI * freq * n / sampleRate)
// Add `noiseLevel` * (Math.random() * 2 - 1) to each sample to simulate noise.
// Bonus: add a few overtones (2*freq, 3*freq, ...) with different amplitudes to
// mimic a violin whose overtone can be stronger than the fundamental.
function generateTone(freq, sampleRate, length, noiseLevel = 0) {
  // your code here
}

// TODO 2: for each test frequency and noise level:
//   - generate a tone, run detectPitch, compute the error in cents
//     (freqToCents(detected, freq)), and handle detected === null.
//   - collect rows like { target: 440, detected: 440.1, errorCents: 0.4, noise: 0 }
// Test frequencies to start with: the open violin strings 196.0, 293.7, 440, 659.3 Hz.
// Then add some in between and some quarter-tone values to see if it holds.
const TEST_FREQUENCIES = [196.0, 293.7, 440, 659.3];
const NOISE_LEVELS = [0, 0.1, 0.3];

function run() {
  const rows = [];
  // your code here
  console.table(rows);
}

run();
