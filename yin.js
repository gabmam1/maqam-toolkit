// yin.js - pitch detection with the YIN algorithm (de Cheveigne & Kawahara, 2002).
//
// Idea: a periodic sound looks like itself when you shift a copy of it by exactly
// one period. So we compare the signal with shifted copies of itself, and look for
// the shift (the "lag", in samples) where the difference is smallest.
//
//   frequency = sampleRate / lag
//
// Example: at 48000 Hz, a lag of 109 samples gives 48000 / 109 = ~440 Hz.

const MIN_FREQ = 70;    // lowest pitch we want to find (Hz)
const MAX_FREQ = 1500;  // highest pitch we want to find (Hz)
const THRESHOLD = 0.15; // how "clearly periodic" a dip must be (lower = stricter)

// Step 1: difference function.
// d[tau] = sum over j of (x[j] - x[j + tau])^2
// Small d[tau] means the signal and its copy shifted by tau samples are alike.
// Compute for tau = 0 .. maxLag. Use a window of length (buffer.length - maxLag)
// for j so that j + tau never goes past the end of the buffer.
function differenceFunction(buffer, maxLag) {
  // TODO: your code here. Return an array d of length maxLag + 1.
}

// Step 2: cumulative mean normalized difference (CMND).
// d'[0] = 1
// d'[tau] = d[tau] / ( (1 / tau) * sum of d[1..tau] )
// Why? d[tau] is always tiny for small tau, so without this step the algorithm
// would pick lag ~0. Normalizing makes "how periodic" comparable across all lags.
function cumulativeMeanNormalizedDifference(d) {
  // TODO: your code here. Return an array of the same length as d.
}

// Step 3: absolute threshold.
// Walk from small tau to large and take the FIRST tau where cmnd[tau] < THRESHOLD,
// then keep moving forward while the value is still decreasing (go to the bottom
// of that dip). Return that tau, or -1 if no dip was found (noise / silence).
// Why the first dip and not the lowest? Multiples of the period (2*T, 3*T) are also
// dips, and picking one of them gives an octave error. The first one is the real one.
function absoluteThreshold(cmnd, minLag, maxLag) {
  // TODO: your code here.
}

// Step 4: parabolic interpolation.
// The best lag is rarely a whole number of samples. Fit a parabola through
// cmnd[tau-1], cmnd[tau], cmnd[tau+1] and return the x-position of its lowest point.
// This is what gets the error down to a few cents instead of tens of cents.
function parabolicInterpolation(cmnd, tau) {
  // TODO: your code here. Return a (fractional) lag.
}

// Glue: buffer of samples in, frequency in Hz out (or null if no pitch was found).
export function detectPitch(buffer, sampleRate) {
  const minLag = Math.floor(sampleRate / MAX_FREQ);
  const maxLag = Math.floor(sampleRate / MIN_FREQ);

  // Not enough samples to compare the signal with a shifted copy of itself.
  if (buffer.length < maxLag * 2) return null;

  const d = differenceFunction(buffer, maxLag);
  const cmnd = cumulativeMeanNormalizedDifference(d);
  const tau = absoluteThreshold(cmnd, minLag, maxLag);
  if (tau === -1) return null;

  const refinedLag = parabolicInterpolation(cmnd, tau);
  return sampleRate / refinedLag;
}
