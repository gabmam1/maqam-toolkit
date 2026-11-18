// scales.js - maqam data and the cent maths used by the tuner.
//
// A scale is stored as a list of cents above the tonic.
// 100 cents = one semitone, 1200 cents = one octave, 50 cents = a quarter tone.

export const MAQAMS = {
  rast: {
    name: 'Rast',
    // The third (350) and seventh (1050) degrees are the quarter-tone ones.
    cents: [0, 200, 350, 500, 700, 900, 1050, 1200],
  },
  // TODO 1: add more maqamat (e.g. Bayati, Hijaz, Sikah).
  // Tunings differ between traditions, so choose the values you actually hear.
};

// Same formula as in drone.js. In step 4 we move this into one shared file.
export function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

// TODO 2: how many cents is `freq` above `refFreq`?
// Formula: cents = 1200 * log2(f / f_ref)
// Sanity checks: freq == refFreq -> 0, freq == 2 * refFreq -> 1200.
export function freqToCents(freq, refFreq) {
  // your code here
}

// TODO 3: find the scale degree closest to a note.
// Input:  `cents` = how far above the tonic the played note is (can be > 1200 or < 0),
//         `scaleCents` = the list from MAQAMS, e.g. [0, 200, 350, ...].
// Output: { index, targetCents, deviation } where deviation = cents - targetCents.
//
// Things to think about:
//  - The player might be in another octave than the tonic. How do you reduce
//    `cents` into the range 0..1200 and still report the right deviation?
//  - A note just below the tonic is actually close to the octave (1200), not to 0.
//    Which neighbours do you need to compare against?
export function nearestDegree(cents, scaleCents) {
  // your code here
}
