
// script.js
// --- chỉnh đường dẫn model nếu cần ---
const modelURL = "https://khktch.github.io/phan-loai-rac/model.json";
  const metadataURL = "https://khktch.github.io/phan-loai-rac/metadata.json";

let model, webcam, labelContainer, maxPredictions;
let lastLabel = null;
let facingMode = "user"; // 'user' = trước, 'environment' = sau
const THRESHOLD = 0.55;

// Bắt đầu camera
async function init() {
  try {
    document.getElementById("status").innerText = "Đang tải mô hình...";
    model = model || await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    document.getElementById("status").innerText = "Đang khởi động camera...";
    await setupWebcam();

    document.getElementById("status").innerText = "Camera hoạt động. Đang nhận diện...";
    window.requestAnimationFrame(loop);

    document.getElementById("switchBtn").disabled = false;
  } catch (err) {
    console.error("Lỗi:", err);
    document.getElementById("status").innerText = "Không thể khởi tạo. Xem console.";
  }
}

// Thiết lập webcam
async function setupWebcam() {
  if (webcam) {
    webcam.stop(); // dừng camera cũ nếu đang chạy
  }

  webcam = new tmImage.Webcam(220, 220, false);
  const constraints = {
    video: {
      facingMode: facingMode,
      width: 220,
      height: 220
    }
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  webcam.webcam.srcObject = stream;
  await webcam.play();

  const container = document.getElementById("webcam-container");
  container.innerHTML = "";
  container.appendChild(webcam.canvas);

  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = "";
  for (let i = 0; i < maxPredictions; i++) {
    const div = document.createElement("div");
    labelContainer.appendChild(div);
  }
}

// Dự đoán liên tục
async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < prediction.length; i++) {
    const pct = Math.round(prediction[i].probability * 100) + "%";
    labelContainer.childNodes[i].innerText = `${prediction[i].className}: ${pct}`;
  }

  let best = prediction.reduce((a, b) => a.probability > b.probability ? a : b);
  if (best.probability < THRESHOLD) {
    if (lastLabel !== null) {
      turnOffAllBins();
      lastLabel = null;
    }
    return;
  }

  const bestLabel = best.className.toLowerCase();
  if (bestLabel !== lastLabel) {
    turnOffAllBins();
    if (bestLabel.includes("nhựa") || bestLabel.includes("plastic"))
      document.getElementById("plasticBin").classList.add("open");
    else if (bestLabel.includes("kim") || bestLabel.includes("metal"))
      document.getElementById("metalBin").classList.add("open");
    else if (bestLabel.includes("giấy") || bestLabel.includes("paper"))
      document.getElementById("paperBin").classList.add("open");
    lastLabel = bestLabel;
  }
}

function turnOffAllBins() {
  document.querySelectorAll(".bin img").forEach(img => img.classList.remove("open"));
}

// Gắn sự kiện
document.getElementById("startBtn").addEventListener("click", init);
document.getElementById("switchBtn").addEventListener("click", async () => {
  facingMode = (facingMode === "user") ? "environment" : "user";
  document.getElementById("status").innerText = 
    (facingMode === "user") ? "Chuyển sang camera trước..." : "Chuyển sang camera sau...";
  await setupWebcam();
});








