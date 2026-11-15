// drone.js - drone generator for maqam-toolkit, built on the Web Audio API.
//
// Signal chain (how the sound flows):
//   rootOsc --------------------> masterGain --> speakers
//   fifthOsc --> fifthGain -----> masterGain

// TODO 1: connect to the controls on the page
const noteSelect = document.getElementById('note');
const octaveSelect = document.getElementById('octave');
const waveSelect = document.getElementById('wave');
const volumeSlider = document.getElementById('volume');
const fifthCheckbox = document.getElementById('fifth');
const toggleButton = document.getElementById('toggle');

// TODO 2: fill the note and octave dropdowns
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const DEFAULT_NOTE = 'D';
const DEFAULT_OCTAVE = 3;


NOTE_NAMES.forEach((name, index) => {
    const isDefault = name === DEFAULT_NOTE;
    noteSelect.add(new Option(name, index, isDefault, isDefault));
});

[2,3,4].forEach((octave) => {
    const isDefault = octave === DEFAULT_OCTAVE;
    octaveSelect.add(new Option(octave ,octave , isDefault, isDefault));
    
});


// TODO 3: convert a note to a frequency
function midiToFreq(midi){
    // semitones count C4=60, C#4=61 and it increases by 1... semitone
    return 440 * 2 ** ((midi-69) / 12); //A4 = 440 Hz and every semiton up multiplies the freq by 2^(1/12)
}

function getRootFreq(){
    const noteIndex = Number(noteSelect.value);
    const octave = Number(octaveSelect.value);
    return midiToFreq(12 * (octave + 1) + noteIndex);
}

// TODO 4: create the audio graph (oscillators and gain nodes)
//create the sound motor
const audioContext = new AudioContext();
const rootOsc = audioContext.createOscillator();

rootOsc.frequency.value = getRootFreq();
rootOsc.type = waveSelect.value;

//creates gainNode --< amplify/dampen sound
const masterGain = audioContext.createGain();
masterGain.gain.value = Number(volumeSlider.value);

rootOsc.connect(masterGain);
masterGain.connect(audioContext.destination);

const fifthOsc = audioContext.createOscillator();

const INTERVALS = {
    UNISON: 0,
    MINOR_THIRD: 3,
    MAJOR_THIRD: 4,
    PERFECT_FIFTH: 7,
    OCTAVE: 12
};


function transpose(freq, semitones){
    return freq * 2 **(semitones/12);
}

fifthOsc.frequency.value = transpose(getRootFreq(), INTERVALS.PERFECT_FIFTH);
fifthOsc.type =rootOsc.type;

const fifthGain = audioContext.createGain();

fifthGain.gain.value = 0;
fifthOsc.connect(fifthGain);
fifthGain.connect(masterGain);

rootOsc.start();
fifthOsc.start();
masterGain.gain.value = 0;
// TODO 5: apply the controls' settings to the sound
const FIFTH_LEVEL = 0.6; // how loud the fifth is compared to the root
let isPlaying = false;

function applySettings(){
    const now = audioContext.currentTime; //sound's motor clock

    //pith: the root follows thr note/octave menus, thr fifth sits 7 semitone above it
    const rootFreq = getRootFreq();
    rootOsc.frequency.setTargetAtTime(rootFreq, now, 0.03);
    fifthOsc.frequency.setTargetAtTime(transpose(rootFreq, INTERVALS.PERFECT_FIFTH), now, 0.03);

    rootOsc.type = waveSelect.value;
    fifthOsc.type = waveSelect.value;

    //Fifth on/off.
    fifthGain.gain.setTargetAtTime(fifthCheckbox.checked ? FIFTH_LEVEL : 0, now, 0.05);
    
    //Volume is silent unless thr drone is playing
    const volume = isPlaying? Number(volumeSlider.value) : 0;
    masterGain.gain.setTargetAtTime(volume, now, 0.15);
}

// TODO 6: Start / Stop and event listeners
async function toggle() {
  isPlaying = !isPlaying;
  //waith untill the sound motor began before moving forward
  if (isPlaying) await audioContext.resume();
  applySettings();

  toggleButton.textContent = isPlaying ? 'Stop' : 'Start';
  toggleButton.setAttribute('aria-pressed', String(isPlaying));
}

toggleButton.addEventListener('click', toggle);

[noteSelect, octaveSelect, waveSelect, volumeSlider, fifthCheckbox].forEach((control) => {
  control.addEventListener('input', applySettings); //the event that is sent when changing a menu
});