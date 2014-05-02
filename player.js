baseLength = 50000;
length = 11025;
sequencer = {};
instrument = {empty:true};
typesOfMod = ["distortion", "delay", "ring", "reverb", "flanger", "decimator"];
mods = [];

function init( ) {
    Gibberish.init();
    Gibberish.Time.export();
    Gibberish.Binops.export();
    $("#freq").simpleSlider();
    $("#freq").simpleSlider("setValue", (11025/50000.0)*1.05);
    $("#freq").bind("slider:changed", function (event, data) {
	length = baseLength * (data.value+0.05);
	sequencer.durations = [length];
//	sequencer.durations.push(length);
    });

    mods["distortion"] = addDistortion;
    mods["delay"] = addDelay;
    mods["ring"] = addRingModulation;
    mods["reverb"] = addReverb;
    mods["flanger"] = addFlanger;
    mods["decimator"] = addDecimator;
    if(instrument.empty) {
	instrument = makePWM();
    }
}


function lengthMode( ) {
    if(document.getElementById("duration").checked) {
	$("#freq").bind("slider:changed", function (event, data) {
	    length = baseLength * (data.value+0.05);
	    var val = data.value;
	    sequencer.durations.push(baseLength * (val+0.05));
	    console.log(sequencer.durations);
	});
	console.log("Changed the duration thingy");
    } else {
	$("#freq").bind("slider:changed", function (event, data) {
	    length = baseLength * (data.value+0.05);
	    sequencer.durations = [length];
	});
    }
}

function play( ) {

    for(var i = 0; i < typesOfMod.length; i++) {
	if(document.getElementById(typesOfMod[i]).checked) {
	    mods[typesOfMod[i]](instrument);
	}
    }

    sequence();
}

function off( ) {
    Gibberish.clear();
}

function setInstrument(instr) {
    switch(instr) {
	case 0:
	    instrument = makeSine();
	break;
	case 1:
	    instrument = makePWM();
	break;
        default:
	    instrument = makeSaw();
	break;
    }
}

function setMods() {

    if(sequencer != undefined) {
	sequencer.stop();
	play();
    }
}

//----------------BEGIN METHODS-----------------


function addDelay(a) {
    b = new Gibberish.Delay(a).connect( Gibberish.out );
}

function makeSaw() {
    a = new Gibberish.Saw3()
    return a;
}

function addFlanger(a) {
    b = new Gibberish.Flanger({input:a, feedback:.5}).connect();
}

function addRingModulation(a) {
    b = new Gibberish.RingModulation({
	input:a, 
	frequency: Add( 1016, new Gibberish.Sine(.05, 500) ),
	amp:1,
	mix:1
    }).connect()
}

function makeSine() {
    a = new Gibberish.Sine(440, .5);
    return a;
}

function addDistortion(a) {
    b = new Gibberish.Distortion(a, 100).connect();
}

function addReverb(a) {
    e = new Gibberish.Reverb(a).connect();
}

function sequence() {
    sequencer = new Gibberish.Sequencer({
	target:instrument, key:'frequency',
	values:[ Gibberish.Rndf(200,1000) ],
	durations:[ length ]
    }).start();
}

function makePWM() {
    a = new Gibberish.PWM({ 
	pulsewidth: Add( .5, new Gibberish.Sine(.1, .49) ) 
    });
    return a;
}

function addDecimator(a) {
    b = new Gibberish.Decimator(a, 2, .2).connect( Gibberish.out );
}

function twoOscsOneMod() {
    mod = new Gibberish.Sine(4, 20);
    a = new Gibberish.Sine( Add(440, mod), .5).connect();
    b = new Gibberish.Sine( Add(880, mod), .25).connect();
}
