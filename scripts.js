// WebMidi.enable(function (err) {
//   if (err) {
//     console.log("WebMidi could not be enabled.", err);
//   } else {
//     console.log("WebMidi enabled");
//   }
// });
//
// WebMidi.enable(function (err){
//   console.log(WebMidi.inputs);
//   console.log(WebMidi.outputs);
// });
//
// var output = WebMidi.outputs[0];

// var context = new AudioContext();
//
// function playSound() {
//     var source = context.createBufferSource();
//     source.buffer = dogBarkingBuffer;
//     source.connect(context.destination);
//     source.start(0);
// }
// oscillator = audioContext.createOscillator();

// oscillator.start(audioContext.currentTime + 2)
// oscillator.stop(audioContext.currentTime + 4)



// var audioContext, osc, gain
//
// var startButton = document.querySelector('.start'),
//     stopButton = document.querySelector('.stop'),
//     waveformButtons = document.querySelector('.waveforms button'),
//     freqSlider = document.querySelector('.freq-slider'),
//     detuneSlider = document.querySelector('.detune-slider'),
//     gainSlider = document.querySelector('.gain-slider'),
//     gainDisplay = document.querySelector('.gain')
//     freqDisplay = document.querySelector('.freq')
//     detuneDisplay = document.querySelector('.detune');
// init();
//
// startButton.onclick = start;
// stopButton.onclick = stop;
//
// addEventListenerBySelector('.waveforms button', 'click', function (event) {
//   var type = event.target.dataset.waveform;
//   changeType(type);
// });
//
// addEventListenerBySelector('.notes button', 'click', function (event){
//   var note = event.target.dataset.note;
// });
//
// freqSlider.oninput = function () {
//     changeFreq(freqSlider.value);
// }
//
// detuneSlider.oninput = function () {
//   changeDetune(detuneSlider.value);
// }
//
// gainSlider.oninput = function () {
//   changeGain(gainSlider.value);
// }
//
// function init() {
//   audioContext = new(window.AudioContext || window.webkitAudioContext)();
//   gain = audioContext.createGain();
//   gain.gain.value = 1;
//   osc = audioContext.createOscillator();
//   osc.type = 'sine';
//   osc.frequency.value = 440;
//   osc.detune.value = 0;
//   osc.connect(gain);
//   osc.start(0);
// }
//
// function start() {
//   UI('start');
//   gain.connect(audioContext.destination);
// }
//
// function stop() {
//   UI('stop');
//   gain.disconnect(audioContext.destination);
// }
//
// function changeType(type) {
//   osc.type = type;
// }
//
// function changeFreq(freq) {
//     osc.frequency.value = freq;
//     freqDisplay.innerHTML = freq + 'Hz';
// }
// function changeDetune(cents) {
//   osc.detune.value = cents;
//   detuneDisplay.innerHTML = cents + 'cents';
// }
//
// function changeGain(volume) {
//   gain.gain.value = volume;
//   gainDisplay.innerHTML = volume;
// }
//
// function addEventListenerBySelector(selector, event, fn){
//   var list = document.querySelectorAll(selector);
//   for (var i = 0, len = list.length; i < len; i++) {
//     list[i].addEventListener(event, fn, false);
//   }
// }
//
// function UI(state) {
//   switch (state) {
//     case 'start':
//       startButton.disabled = true;
//       waveformButtons.disable = false;
//       stopButton.disabled = false;
//     break;
//     case 'stop':
//       startButton.disabled = false;
//       waveformButtons.disabled = true;
//       stopButton.disabled = true;
//     break;
//   }
// }


//this is the synth

var audioContext = new(window.AudioContext)

var vco = audioContext.createOscillator(),
    vca = audioContext.createGain(),
    master = audioContext.createGain();
    
var activeKeys = {};

var waveType = document.querySelector('.wavetype'),
    portamento = document.querySelector('.portamento'),
    enablePortamento = true,
    masterGain = document.querySelector('.master-gain'),
    masterGainDisplay = document.querySelector('.master-gain-display');


vco.connect(vca);
vca.connect(master);

master.connect(audioContext.destination);

vco.start(0);

vca.gain.value = 0;
master.gain.value = 1;

waveType.onchange = function () {
  changeWaveType(waveType.value);
}
portamento.onchange = function () {
  changeMaster(masterGain.value);
}

masterGain.oninput = function () {
  changeMaster(masterGain.value);
}
function changeWaveType(type) {
  vco.type = type
}

function changeMaster(vol) {
  master.gain.value = vol;
  masterGainDisplay.innerHTML = vol;
}
function frequencyFromNote(note) {
  return 440 * Math.pow(2, (note -69) / 12);
}

function isEmptyObj(obj) {
  return Object.keys(obj).length === 0;
}


//this is the MIDI

var midi, data, cmd, channel, type, note, velocity;
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
      sysex: false
    }).then(MIDISuccess, MIDIFailure);
}

function MIDISuccess(midi) {
  var inputs = midi.inputs,
    device = {};
  inputs.forEach(function (port){
    port.onmidimessage = onMIDIMessage;
  });
}

function MIDIFailure() {
  console.log('Your browser does not support Web MIDI');
}

function onMIDIMessage(message) {
  console.log('MIDI Message', message.data);
  data = message.data,
  cmd = data[0] >> 4,
  channel = data[0] & 0xf,
  type = data[0] & 0xf0,
  note =data[1],
  velocity = data[2];

  if (velocity == 0) {
    noteOff();
  } else {
    switch (type) {
      case 144:
          noteOn(note, velocity, type);
          break;
      case 128:
          noteOff();
          break;
      case 176:
          pressure(note, velocity);
          break;
      case 224:
          bend(note, velocity);
          break;
    }
  }
}

function noteOn(note, velocity, type) {
  var now = audioContext.currentTime;
  svgnote(type, note, velocity);
  activeKeys[note] = true;
  if (enablePortamento) {
    vco.frequency.cancelScheduledValues(0);
    vco.frequency.value = frequencyFromNote(note);
  } else {
    vco.frequency.cancelScheduledValues(0);
    vco.frequency.setValueAtTime(frequencyFromNote(note), now)
  }

  vca.gain.value = velocity / 127;

}


function noteOff() {
  var now = audioContext.currentTime;
  svgnote(type, note, velocity);
  delete activeKeys[note];

  vco.frequency.cancelScheduledValues(0);
  vco.frequency.setValueAtTime(frequencyFromNote(note), now);

  if (isEmptyObj(activeKeys)) {
    vca.gain.value = 0;
  }
}

function bend(note, velocity) {
  console.log('bend', note, velocity);
}

function pressure(note, velocity) {
  console.log('pressure', note, velocity);
}


//qwerty

var keyboard = document.getElementById('controller');
var k = document.getElementsByClassName('key');
keyboard.addEventListener('mousedown', keynote);
keyboard.addEventListener('mouseup', keynote);

function keynote(e) {
  if (e.target.classList[0] !='key') return;

  var keyClasses = e.target.classList,
      midiNote = keyClasses[searchIndex(keyClasses, "key[0-9]+")].replace('key', '');

      switch (e.type) {
        case 'mousedown':
            vco.frequency.setValueAtTime(frequencyFromNote(midiNote), 0);
            vca.gain.value = 0.9;
            keyClasses.add('active');
            break;
        case 'mouseup':
            vca.gain.value = 0;
            keyClasses.remove('active');
            break;
      }
}

//ignore note outside of Rectangle
function svgnote(type,midiNote, velocity) {
  if (midiNote >= 48 && midiNote <= 72) {
      var keyClass = "key" + midiNote,
          key = document.querySelector('.' + keyClass),
          keyClassList = key.classList;
      (type === 128 || type == 144 && velocity == 0) ? keyClassList.remove('active') : keyClassList.add('active');
      console.log('t', type, 'v', velocity);
  }
}

function searchIndex(list, value) {
  value =new RegExp(value);
  for (var i in list) {
    if (list[i].match(value)) {
      return i;
    }
  }
  return 0;
}
