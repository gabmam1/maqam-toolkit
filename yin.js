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
  const d = new Array(maxLag + 1).fill(0);
  const windowLength = buffer.length - maxLag;

  if (windowLength < 1) {
    throw new Error(
      `differenceFunction: buffer too short (${buffer.length} samples) for maxLag ${maxLag}`
    );
  }

  for (let tau = 1; tau <= maxLag; tau++) { // tau is the lag; d[0] is always 0, so start at 1

    let sum = 0;
    for (let j = 0; j < windowLength; j++) {
      const diff = buffer[j] - buffer[j + tau]; //original minus the shifted copy
      sum += diff * diff;
    }
    if (!Number.isFinite(sum)) {
      throw new Error(
        `differenceFunction: d[${tau}] is not a finite number (${sum}). Does the buffer contain NaN?`
      );
    }
    d[tau] = sum;
  }
  return d
}

// Step 2: cumulative mean normalized difference (CMND).
// d'[0] = 1
// d'[tau] = d[tau] / ( (1 / tau) * sum of d[1..tau] )
// Why? d[tau] is always tiny for small tau, so without this step the algorithm
// would pick lag ~0. Normalizing makes "how periodic" comparable across all lags.
function cumulativeMeanNormalizedDifference (d) {
  if (!d || d.length < 2) {
    throw new Error("cumulativeMeanNormalizedDifference: d must have at least 2 elements");
  }

  const cmnd = new Array(d.length).fill(0);
  cmnd[0] = 1;

  let runningSum = 0;
  for (let tau = 0; tau < d.length; tau++) {
    if (!Number.isFinite(d[tau]) || d[tau] < 0) {
      throw new Error(
        `cumulativeMeanNormalizedDifference: d[${tau}] must be a finite number >= 0, got ${d[tau]}`
      );  
    }
    runningSum += d[tau];
    // Guard against silence: if every d so far is 0, we would divide 0 by 0
    cmnd[tau] = runningSum === 0 ? 1: (d[tau]* tau) / runningSum;
  }
  return cmnd;
}

// Step 3: absolute threshold.
// Walk from small tau to large and take the FIRST tau where cmnd[tau] < THRESHOLD,
// then keep moving forward while the value is still decreasing (go to the bottom
// of that dip). Return that tau, or -1 if no dip was found (noise / silence).
// Why the first dip and not the lowest? Multiples of the period (2*T, 3*T) are also
// dips, and picking one of them gives an octave error. The first one is the real one.
function absoluteThreshold(cmnd, minLag, maxLag) {
  if (minLag < 1 || minLag > maxLag || maxLag >= cmnd.length){
    throw new Error(
      `absoluteThreshold: invalid lag range ${minLag}..${maxLag} for cmnd of length ${cmnd.length}`

    );
  }

  for (let tau = minLag; tau <= maxLag; tau++) {
    if (cmnd[tau] < THRESHOLD) { //below THRESHOLD the lag counts as "clearly periodic" 
      let bottom = tau;
      while (bottom +1 <= maxLag && cmnd[bottom +1] < cmnd[bottom]) {
        bottom++;
      }
      return bottom;
    }
  }
  return -1;
}

// Step 4: parabolic interpolation.
// The best lag is rarely a whole number of samples. Fit a parabola through
// cmnd[tau-1], cmnd[tau], cmnd[tau+1] and return the x-position of its lowest point.
// This is what gets the error down to a few cents instead of tens of cents.
function parabolicInterpolation(cmnd, tau) {
   if (!Number.isInteger(tau) || tau < 0 || tau >= cmnd.length) {
    throw new Error(
      `parabolicInterpolation: tau ${tau} is outside cmnd (length ${cmnd.length})`
    );
  }

  // At the very edges there is no neighbour on one side, so we cannot fit a parabola.
  if (tau === 0 || tau === cmnd.length - 1) return tau;

  const left = cmnd[tau - 1];
  const middle = cmnd[tau];
  const right = cmnd[tau + 1];

  const denominator = left - 2 * middle + right;
  if (denominator === 0) return tau; // three points on a straight line: no bottom to find

  const offset = (left - right) / (2 * denominator);
  return tau + offset;

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
