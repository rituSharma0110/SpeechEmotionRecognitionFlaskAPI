window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
  realAudioInput = null,
  inputPoint = null,
  audioRecorder = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;
var toggle = false;
var speechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = new webkitSpeechRecognition();
var textcontent = "";
recognition.continuous = true;

recognition.onresult = function (event) {
  var current = event.resultIndex;
  var transcript = event.results[current][0].transcript;
  const excessTextBox = document.getElementById("textBoxContainer");

  excessTextBox.innerHTML = excessTextBox.innerHTML + transcript;
};

function gotBuffers(buffers) {
    audioRecorder.exportMonoWAV(doneEncoding);
}

function doneEncoding(soundBlob) {
    fetch("/predict", { method: "POST", body: soundBlob }).then((response) =>
    response.text().then((text) => {
        console.log(text);
        document.getElementById("result").style.display = "block";
        document.getElementById("contain").style.display = "none";
        document.getElementById("output").innerText = text;
    })
    );
    recIndex++;
}

function stopRecording() {
    // stop recording
    recognition.stop();
    audioRecorder.stop();
    document.getElementById("stop-btn").disabled = true;
    document.getElementById("start-btn").removeAttribute("disabled");
    audioRecorder.getBuffers(gotBuffers);
}

function startRecording() {
    const text = document.getElementById("textBoxContainer");
    text.innerText = "";
  toggle = true;
  ShowWaveFormProgress(toggle);
  if (textcontent.length) {
    textcontent += "";
  }
  recognition.start();
  // start recording
  if (!audioRecorder) return;
  document.getElementById("start-btn").disabled = true;
  document.getElementById("stop-btn").removeAttribute("disabled");
  audioRecorder.clear();
  audioRecorder.record();
}

// function convertToMono(input) {
//     var splitter = audioContext.createChannelSplitter(2);
//     var merger = audioContext.createChannelMerger(2);

//     input.connect(splitter);
//     splitter.connect(merger, 0, 0);
//     splitter.connect(merger, 0, 1);
//     return merger;
// }

function cancelAnalyserUpdates() {
  window.cancelAnimationFrame(rafID);
  rafID = null;
}

// function updateAnalysers(time) {
//     if (!analyserContext) {
//         var canvas = document.getElementById("analyser");
//         canvasWidth = canvas.width;
//         canvasHeight = canvas.height;
//         analyserContext = canvas.getContext('2d');
//     }

//     // analyzer draw code here
//     {
//         var SPACING = 3;
//         var BAR_WIDTH = 1;
//         var numBars = Math.round(canvasWidth / SPACING);
//         var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

//         analyserNode.getByteFrequencyData(freqByteData);

//         analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
//         analyserContext.fillStyle = '#F6D565';
//         analyserContext.lineCap = 'round';
//         var multiplier = analyserNode.frequencyBinCount / numBars;

//         // Draw rectangle for each frequency bin.
//         for (var i = 0; i < numBars; ++i) {
//             var magnitude = 0;
//             var offset = Math.floor(i * multiplier);
//             // gotta sum/average the block, or we miss narrow-bandwidth spikes
//             for (var j = 0; j < multiplier; j++)
//                 magnitude += freqByteData[offset + j];
//             magnitude = magnitude / multiplier;
//             var magnitude2 = freqByteData[i * multiplier];
//             analyserContext.fillStyle = "hsl( " + Math.round((i * 360) / numBars) + ", 100%, 50%)";
//             analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
//         }
//     }

//     rafID = window.requestAnimationFrame(updateAnalysers);
// }

function toggleMono() {
  if (audioInput != realAudioInput) {
    audioInput.disconnect();
    realAudioInput.disconnect();
    audioInput = realAudioInput;
  } else {
    realAudioInput.disconnect();
    audioInput = convertToMono(realAudioInput);
  }

  audioInput.connect(inputPoint);
}

function gotStream(stream) {
  document.getElementById("start-btn").removeAttribute("disabled");

  inputPoint = audioContext.createGain();

  // Create an AudioNode from the stream.
  realAudioInput = audioContext.createMediaStreamSource(stream);
  audioInput = realAudioInput;
  audioInput.connect(inputPoint);

  //    audioInput = convertToMono( input );

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 2048;
  inputPoint.connect(analyserNode);

  audioRecorder = new Recorder(inputPoint);

  zeroGain = audioContext.createGain();
  zeroGain.gain.value = 0.0;
  inputPoint.connect(zeroGain);
  zeroGain.connect(audioContext.destination);
  // updateAnalysers();
}

function initAudio() {
  if (!navigator.getUserMedia)
    navigator.getUserMedia =
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  if (!navigator.cancelAnimationFrame)
    navigator.cancelAnimationFrame =
      navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
  if (!navigator.requestAnimationFrame)
    navigator.requestAnimationFrame =
      navigator.webkitRequestAnimationFrame ||
      navigator.mozRequestAnimationFrame;

  navigator.getUserMedia(
    {
      audio: {
        mandatory: {
          googEchoCancellation: "false",
          googAutoGainControl: "false",
          googNoiseSuppression: "false",
          googHighpassFilter: "false",
        },
        optional: [],
      },
    },
    gotStream,
    function (e) {
      alert("Error getting audio");
      console.log(e);
    }
  );
}

window.addEventListener("load", initAudio);

function unpause() {
  document.getElementById("init").style.display = "none";
  audioContext.resume().then(() => {
    console.log("Playback resumed successfully");
  });
}

function ShowWaveFormProgress(toggle) {
  obj = {};
  function init() {
    obj.canvas = document.getElementById("canvas");
    obj.ctx = obj.canvas.getContext("2d");
    obj.width = window.innerWidth * 0.9;
    obj.height = window.innerHeight * 0.9;
    obj.canvas.width = obj.width * window.devicePixelRatio;
    obj.canvas.height = obj.height * window.devicePixelRatio;
    obj.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  //   function randomInteger(max = 256) {
  //     return Math.floor(Math.random() * max);
  //   }
  let timeOffset = 100;
  let now = parseInt(performance.now()) / timeOffset;

  function loop() {
    obj.ctx.clearRect(0, 0, obj.canvas.width, obj.canvas.height);
    let max = 0;
    if (toggle === true) {
      if (parseInt(performance.now() / timeOffset) > now) {
        now = parseInt(performance.now() / timeOffset);
        obj.analyser.getFloatTimeDomainData(obj.frequencyArray);
        for (var i = 0; i < obj.frequencyArray.length; i++) {
          if (obj.frequencyArray[i] > max) {
            max = obj.frequencyArray[i];
          }
        }

        var freq = Math.floor(max * 4000);

        obj.bars.push({
          x: obj.width,
          y: obj.height / 2 - freq / 2,
          height: freq,
          width: 5,
        });
      }
    }
    draw();
    requestAnimationFrame(loop);
  }

  obj.bars = [];

  function draw() {
    for (i = 0; i < obj.bars.length; i++) {
      const bar = obj.bars[i];
      obj.ctx.fillStyle = `#fff`;
      obj.ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
      bar.x = bar.x - 2;

      if (bar.x < 1) {
        obj.bars.splice(i, 1);
      }
    }
  }
  function soundAllowed(stream) {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContent = new AudioContext();
    var streamSource = audioContent.createMediaStreamSource(stream);

    obj.analyser = audioContent.createAnalyser();
    streamSource.connect(obj.analyser);
    obj.analyser.fftSize = 512;
    obj.frequencyArray = new Float32Array(obj.analyser.fftSize);
    init();
    loop();
  }

  function soundNotAllowed() {}
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(soundAllowed)
    .catch(soundNotAllowed);
}
