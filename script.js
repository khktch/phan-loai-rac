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
  // reset trạng thái
  document.getElementById("plasticBin").classList.remove("open");
  document.getElementById("metalBin").classList.remove("open");
  document.getElementById("paperBin").classList.remove("open");

  // tìm lớp có xác suất cao nhất
  let best = prediction.reduce((a, b) => a.probability > b.probability ? a : b);

  if (best.className === "Nhựa") {
    document.getElementById("plasticBin").classList.add("open");
  } else if (best.className === "Kim loại") {
    document.getElementById("metalBin").classList.add("open");
  } else if (best.className === "Giấy") {
    document.getElementById("paperBin").classList.add("open");
  }
}



