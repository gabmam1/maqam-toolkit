// tuner.js - microphone in, nearest maqam degree and cents deviation out.
//
// Signal chain:
//   microphone --> MediaStreamSource --> AnalyserNode --> (we read raw samples)
// Note: the analyser is NOT connected to the speakers. We only listen.

import { detectPitch } from './yin.js';
import { MAQAMS, midiToFreq, freqToCents, nearestDegree } from './scales.js';

// TODO 1: connect to the controls on the page (same idea as in drone.js)
const maqamSelect = document.getElementById('maqam');
const noteSelect = document.getElementById('note');
const octaveSelect = document.getElementById('octave');
const freqOutput = document.getElementById('freq');
const degreeOutput = document.getElementById('degree');
const centsOutput = document.getElementById('cents');
const toggleButton = document.getElementById('toggle');

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// TODO 2: fill the maqam, note and octave dropdowns.
// Hint: Object.entries(MAQAMS) gives you [key, maqam] pairs for the maqam menu.


// TODO 3: the tonic frequency, from the note + octave menus
// Hint: same calculation as getRootFreq() in drone.js.
function getTonicFreq() {
  // your code here
}

// TODO 4: start the microphone.
// - navigator.mediaDevices.getUserMedia({ audio: { ... } }) returns a Promise<MediaStream>.
// - Turn OFF echoCancellation, noiseSuppression and autoGainControl, otherwise the
//   browser "cleans" the sound and distorts the measurement.
// - Create an AudioContext, a MediaStreamSource from the stream and an AnalyserNode.
//   fftSize = 2048 gives you 2048 raw samples per read.
// - Remember: the browser only allows audio after a click, so call this from the
//   click handler.
let audioContext = null;
let analyser = null;
let stream = null;
let samples = null; // Float32Array we reuse every frame
let running = false;

async function startMicrophone() {
  // your code here
}

function stopMicrophone() {
  // TODO: stop the tracks of the stream and close the audio context.
}

// TODO 5: the measurement loop, ~60 times per second.
// Each frame:
//   1. analyser.getFloatTimeDomainData(samples)
//   2. freq = detectPitch(samples, audioContext.sampleRate)
//   3. if freq is null -> show "-" and skip
//   4. cents above the tonic = freqToCents(freq, getTonicFreq())
//   5. nearest degree = nearestDegree(cents, MAQAMS[maqamSelect.value].cents)
//   6. write freq, degree number and deviation (rounded) to the outputs
//   7. requestAnimationFrame(loop) again, as long as `running` is true
function loop() {
  // your code here
}

// TODO 6: Start / Stop button
async function toggle() {
  // your code here
}

toggleButton.addEventListener('click', toggle);
