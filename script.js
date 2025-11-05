let model, webcam, labelContainer, maxPredictions;

async function init() {
  const modelURL = "https://khktch.github.io/phan-loai-rac/model.json";
  const metadataURL = "https://khktch.github.io/phan-loai-rac/metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  const flip = true;
  webcam = new tmImage.Webcam(200, 200, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < model.getTotalClasses(); i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < prediction.length; i++) {
    labelContainer.childNodes[i].innerHTML =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
  }
}

