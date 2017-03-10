//Audio Context is the context in which the synthesizer exits. It controls both the creation of the AudioNodes and execution of the audio processing, or decoding
var audioContext = new AudioContext();

//The .creatOscillator AudioNode is a method called on audioContext to create the source of sound. I am creating three here to create a richer sound. "vco" is term used in synthesis as an abbreviation for Voltage Controlled Oscillator.
var vco = audioContext.createOscillator();
var vco2 = audioContext.createOscillator();
var vco3 = audioContext.createOscillator();

//.type will assign to the vcos the type of waveform that they will output
vco.type = 'sawtooth';
vco2.type = 'square';
vco3.type = 'sine';

//.detune shifts the frequency of the oscillator. With my knowledge of music theory, I selected these values to create a harmonically pleasing sound.
vco2.detune.value = 700;
vco3.detune.value = -1200;

//The .createGain AudioNodeis a method called on audioContext to control the volume of our sound. We will connect our oscillators to it. "vca" is term used in synthesis as an abbreviation for Voltage Controlled Amplifier.
var vca = audioContext.createGain();

//set the gain to 0 to control later
vca.gain.value = 0;

//The .createBiquadFilter AudioNode is a method called on audioContext that we will input our oscillators to and control the frequencies that are outputted to the speakers.
var filter = audioContext.createBiquadFilter();

//.type will assign to the filter the type of filter. I am using a lowpass filter that allows lower frequencies to pass to the output
filter.type = 'lowpass';



//The .connect method is used on the repsective AudioNodes to create a signal flow for the sound to follow. The way I have connected mine is to recreate the "East Coast Synthesis" style made famous by Bob Moog

vco.connect(filter);
vco2.connect(filter);
vco3.connect(filter);
filter.connect(vca);
vca.connect(audioContext.destination)

//.start is used to command the Oscillator AudioNode to begin making sound
vco.start();
vco2.start();
vco3.start();

// this if statement request to establish a MIDI connection between the browser and the MIDI device
if(navigator.requestMIDIAccess)
{
	navigator.requestMIDIAccess().then(onMIDIInit, onMIDIReject);
}
function onMIDIInit(midiAccess)
{
	var inputIter = midiAccess.inputs.values();
	for(var o = inputIter.next(); !o.done; o = inputIter.next())
	{
		o.value.onmidimessage = handleMIDIMessageEvent;
	}
}

function onMIDIReject() { alert('MIDI Rejected!'); }



// this function watches for MIDI data being transmitted
function handleMIDIMessageEvent(event)
{
	switch(event.data[0] & 0xF0)
	{
		case 0x90: //when the key is pressed
			if(event.data[2] != 0)
			{
				noteOn(event.data[1]);
				return;
			}

		case 0x80: //when the key is released
			noteOff(event.data[1]);
			return;

		case 0xB0: // when a knob is moved
			setFilter(event.data[2] / 127);
			return;
	}
}

//this function sets the frequency the filter is filtering. As I have personally expereinced, some higher frequencies can be harmful to ears and speakers so I set a max value to keep this from happening!
function setFilter(percent)
{
	filter.frequency.value = percent * MAX_FILTER_FREQ_HZ;
}
var MAX_FILTER_FREQ_HZ = 15000;


//this function takes the note being played and converts it into a Western Scale frequency
function frequencyFromNoteNumber( note )
{
	return 440 * Math.pow(2, (note - 69) / 12);
}
//this function takes the noteNumber being played by the keyboard at the time it is played and sends it to the vcos' to set the frequency being heard through the vca
function noteOn(noteNumber)
{
	var freq = frequencyFromNoteNumber(noteNumber);
	vco.frequency.setValueAtTime(freq, audioContext.currentTime);
	vco2.frequency.setValueAtTime(freq, audioContext.currentTime);
	vco3.frequency.setValueAtTime(freq, audioContext.currentTime);

	vca.gain.value = 1;
	vca.gain.setTargetAtTime(0, audioContext.currentTime, 0.2);
}


//this function turns that racket down, but for what?
function noteOff(noteNumber) { }



                           /////UI/////

    // var vcaGain = document.querySelector('.slider');




                           /////FRONT-END/////
// $('.dial').knob(
// {
//   'min':10,
//   'max':50,
//   'width':100,
//   'height':100,
//   'displayInput':true,
//   'fgColor':"#FF0000",
//   'release':function(v) {(v);}
// });




$( ".drum" )
  .mouseup(function() {
    $( this ).css("background-color","#CDD4D9");
  })
  .mousedown(function() {
    $( this ).css("background-color","white" );
  });

  $( ".keyT" )
  .mouseup(function() {
    $( this ).css("background-color","#BFC5C5");
  })
  .mousedown(function() {
    $( this ).css("background-color","white" );
  });
  $( ".keyB" )
  .mouseup(function() {
    $( this ).css("background-color","#404040");
  })
  .mousedown(function() {
    $( this ).css("background-color","white" );
  });
	$( ".xy" )
	  .mouseup(function() {
	    $( this ).css("background-color","#4a4a4a");
	  })
	  .mousedown(function() {
	    $( this ).css("background-color","#404040" );
	  });
