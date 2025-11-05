const URL = "https://khktch.github.io/phan-loai-rac/"; // model.json, metadata.json, weights.bin nằm cùng cấp
let model, webcamStream;
let currentFacingMode = "user"; // cam trước
const video = document.getElementById("webcam");
const statusText = document.getElementById("status");
const labelContainer = document.getElementById("label-container");

// 3 thùng rác
const bins = {
  Nhựa: document.getElementById("plasticBin"),
  "Kim loại": document.getElementById("metalBin"),
  "Giấy": document.getElementById("paperBin"),
};

async function init() {
  statusText.innerText = "⏳ Đang tải mô hình...";
  try {
    model = await tmImage.load(`${URL}model.json`, `${URL}metadata.json`);
    statusText.innerText = "✅ Mô hình đã sẵn sàng!";
    await setupCamera();
    predictLoop();
  } catch (err) {
    console.error(err);
    statusText.innerText = "❌ Lỗi khi tải mô hình. Kiểm tra console!";
  }
}

async function setupCamera() {
  if (webcamStream) webcamStream.getTracks().forEach(track => track.stop());
  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode },
    });
    video.srcObject = webcamStream;
    await video.play();
    statusText.innerText = "📸 Camera đang hoạt động!";
  } catch (err) {
    console.error("Không thể bật camera:", err);
    statusText.innerText = "⚠️ Không thể bật camera. Vui lòng cho phép truy cập.";
  }
}

async function switchCamera() {
  currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
  await setupCamera();
}

async function predictLoop() {
  while (true) {
    if (model && video.readyState === 4) {
      const prediction = await model.predict(video);
      displayPrediction(prediction);
    }
    await new Promise(r => setTimeout(r, 200));
  }
}

function displayPrediction(prediction) {
  labelContainer.innerHTML = "";

  // tìm nhãn có xác suất cao nhất
  let top = prediction.reduce((max, p) =>
    p.probability > max.probability ? p : max
  );

  prediction.forEach(p => {
    const percent = Math.round(p.probability * 100);
    const div = document.createElement("div");
    div.innerText = `${p.className}: ${percent}%`;
    labelContainer.appendChild(div);
  });

  // xóa hiệu ứng cũ
  Object.values(bins).forEach(bin => bin.classList.remove("shake"));

  // nếu xác suất > 80%, thùng tương ứng rung
  if (top.probability > 0.8 && bins[top.className]) {
    bins[top.className].classList.add("shake");
  }
}











