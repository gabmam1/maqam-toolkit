// scales.js - maqam data and the cent maths used by the tuner.
//
// A scale is stored as a list of cents above the tonic.
// 100 cents = one semitone, 1200 cents = one octave, 50 cents = a quarter tone.
const CENTS_PER_OCTAVE = 1200;

export const MAQAMS = {
  rast: {
    name: 'Rast',
    // The third (350) and seventh (1050) degrees are the quarter-tone ones.
    cents: [0, 200, 350, 500, 700, 900, 1050, 1200],
  },
  // TODO 1: add more maqamat (e.g. Bayati, Hijaz, Sikah).
  // Tunings differ between traditions, so choose the values you actually hear.
  bayat: {
    name: 'Bayati',
    cents: [0, 200, 350, 500, 700, 900, 1050, 1200], 
  },
  
  hijaz: {
    name: 'Hijaz',
    cents: [0, 100, 400, 500, 700, 800, 1000, 1200],
  },

};

// Same formula as in drone.js. In step 4 we move this into one shared file.
export function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

// TODO 2: how many cents is `freq` above `refFreq`?
// Formula: cents = 1200 * log2(f / f_ref)
// Sanity checks: freq == refFreq -> 0, freq == 2 * refFreq -> 1200.
// 1200  in CENTS_PER_OCTAVE because 12 halftones * 100 cent = 1200 cent per oktav
//export so other files can use it
export function freqToCents(freq, refFreq) {
  return CENTS_PER_OCTAVE * Math.log2(freq/refFreq); 
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
  // Reduce to the range 0..1200 and remember which octave we removed.
  const octaveOffset = Math.floor(cents / CENTS_PER_OCTAVE) * CENTS_PER_OCTAVE;
  const reduced = cents - octaveOffset;

  // Find the scale degree with the smallest distance.
  let bestIndex = 0;
  let bestDistance = Infinity; //just a beginning value
  for (let i = 0; i < scaleCents.length; i++) {
    const distance = Math.abs(reduced - scaleCents[i]);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  // Put the octave back so deviation is measured in the played octave.
  const targetCents = scaleCents[bestIndex] + octaveOffset;
  return { index: bestIndex, targetCents, deviation: cents - targetCents };
}
