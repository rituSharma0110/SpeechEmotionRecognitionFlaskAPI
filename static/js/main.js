// const sanchiya = document.getElementById("textBoxContainer");
// const btn = document.getElementById("start-btn");
// const sbtn = document.getElementById("stop-btn");
// var toggle = false;

// var speechRecognition =
//   window.SpeechRecognition || window.webkitSpeechRecognition;
// var recognition = new webkitSpeechRecognition();
// var content = $("#content");
// var instructions = $("#instructions");
// var textcontent = "";

// recognition.continuous = true;

// recognition.onresult = function (event) {
//   var current = event.resultIndex;
//   var transcript = event.results[current][0].transcript;
//   const excessTextBox = document.getElementById("textBoxContainer");

//   excessTextBox.innerHTML = excessTextBox.innerHTML + transcript;
// };
// const ShowWave = () => {
//       sanchiya.innerText = "";
//       toggle = true;
//       ShowWaveFormProgress(toggle);
//       if (textcontent.length) {
//         textcontent += "";
//       }
//       recognition.start();
//   };
//   const showWave= async ()=>{
//       toggle = false;
//       ShowWaveFormProgress(toggle);
//       recognition.stop();
//   };

// const ShowWaveFormProgress = (toggle) => {
//   obj = {};
//   function init() {
//     obj.canvas = document.getElementById("canvas");
//     obj.ctx = obj.canvas.getContext("2d");
//     obj.width = window.innerWidth * 0.9;
//     obj.height = window.innerHeight * 0.9;
//     obj.canvas.width = obj.width * window.devicePixelRatio;
//     obj.canvas.height = obj.height * window.devicePixelRatio;
//     obj.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
//   }

//   function randomInteger(max = 256) {
//     return Math.floor(Math.random() * max);
//   }
//   let timeOffset = 100;
//   let now = parseInt(performance.now()) / timeOffset;

//   function loop() {
//     obj.ctx.clearRect(0, 0, obj.canvas.width, obj.canvas.height);
//     let max = 0;
//     if (toggle === true) {
//       if (parseInt(performance.now() / timeOffset) > now) {
//         now = parseInt(performance.now() / timeOffset);
//         obj.analyser.getFloatTimeDomainData(obj.frequencyArray);
//         for (var i = 0; i < obj.frequencyArray.length; i++) {
//           if (obj.frequencyArray[i] > max) {
//             max = obj.frequencyArray[i];
//           }
//         }

//         var freq = Math.floor(max * 650);

//         obj.bars.push({
//           x: obj.width,
//           y: obj.height / 2 - freq / 2,
//           height: freq,
//           width: 5,
//         });
//       }
//     }
//     draw();
//     requestAnimationFrame(loop);
//   }

//   obj.bars = [];

//   function draw() {
//     for (i = 0; i < obj.bars.length; i++) {
//       const bar = obj.bars[i];
//       obj.ctx.fillStyle = `#fff`;
//       obj.ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
//       bar.x = bar.x - 2;

//       if (bar.x < 1) {
//         obj.bars.splice(i, 1);
//       }
//     }
//   }
//   function soundAllowed(stream) {
//     var AudioContext = window.AudioContext || window.webkitAudioContext;
//     var audioContent = new AudioContext();
//     var streamSource = audioContent.createMediaStreamSource(stream);

//     obj.analyser = audioContent.createAnalyser();
//     streamSource.connect(obj.analyser);
//     obj.analyser.fftSize = 512;
//     obj.frequencyArray = new Float32Array(obj.analyser.fftSize);
//     init();
//     loop();
//   }

//   function soundNotAllowed() {}
//   navigator.mediaDevices
//     .getUserMedia({ audio: true })
//     .then(soundAllowed)
//     .catch(soundNotAllowed);
// };
