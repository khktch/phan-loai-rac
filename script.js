
// script.js
// --- chỉnh đường dẫn model nếu cần ---
const modelURL = "https://khktch.github.io/phan-loai-rac/model.json";
  const metadataURL = "https://khktch.github.io/phan-loai-rac/metadata.json";

let model, webcam, labelContainer, maxPredictions;
let lastLabel = null;
const THRESHOLD = 0.55; // ngưỡng tin cậy (cô điều chỉnh được)

async function init() {
  try {
    document.getElementById("status").innerText = "Đang tải mô hình...";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    document.getElementById("status").innerText = "Mô hình tải xong. Yêu cầu quyền camera...";

    // tạo webcam (flip = true cho giống gương)
    const flip = true;
    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup(); // yêu cầu quyền
    await webcam.play();

    // gắn canvas webcam vào DOM
    const container = document.getElementById("webcam-container");
    container.innerHTML = ""; // clear
    container.appendChild(webcam.canvas);

    // chuẩn bị label container
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
      const d = document.createElement("div");
      d.innerText = "";
      labelContainer.appendChild(d);
    }

    document.getElementById("status").innerText = "Camera hoạt động. Bắt đầu nhận diện.";
    window.requestAnimationFrame(loop);
  } catch (err) {
    console.error("Lỗi khi init:", err);
    document.getElementById("status").innerText = "Lỗi: không thể tải mô hình hoặc truy cập camera. Xem console.";
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

function normalizeLabel(s) {
  if (!s) return s;
  return s.trim().toLowerCase();
}

async function predict() {
  try {
    const prediction = await model.predict(webcam.canvas);

    // cập nhật hiển thị phần trăm (tròn)
    for (let i = 0; i < prediction.length; i++) {
      const pct = Math.round(prediction[i].probability * 100) + "%";
      labelContainer.childNodes[i].innerText = `${prediction[i].className}: ${pct}`;
    }

    // tìm nhãn tốt nhất
    let best = prediction.reduce((a, b) => a.probability > b.probability ? a : b);

    // nếu xác suất dưới ngưỡng -> tắt tất cả
    if (best.probability < THRESHOLD) {
      if (lastLabel !== null) {
        turnOffAllBins();
        lastLabel = null;
      }
      return;
    }

    // chỉ đổi khi nhãn khác
    const bestLabel = normalizeLabel(best.className);

    if (bestLabel !== normalizeLabel(lastLabel)) {
      // reset trước
      turnOffAllBins();

      // bật thùng tương ứng (kết hợp tiếng Việt/Anh)
      if (bestLabel.includes("nhựa") || bestLabel.includes("plastic")) {
        document.getElementById("plasticBin").classList.add("open");
      } else if (bestLabel.includes("kim") || bestLabel.includes("metal")) {
        document.getElementById("metalBin").classList.add("open");
      } else if (bestLabel.includes("giấy") || bestLabel.includes("paper")) {
        document.getElementById("paperBin").classList.add("open");
      } else {
        // nếu label khác (ví dụ tên tiếng Anh khác) -> không làm gì
        console.log("Nhận nhãn không khớp:", best.className);
      }

      lastLabel = best.className;
    }
  } catch (err) {
    console.error("Lỗi predict:", err);
    document.getElementById("status").innerText = "Lỗi khi dự đoán (xem console).";
  }
}

function turnOffAllBins() {
  document.getElementById("plasticBin").classList.remove("open");
  document.getElementById("metalBin").classList.remove("open");
  document.getElementById("paperBin").classList.remove("open");
}

// Gắn sự kiện nút
document.getElementById("startBtn").addEventListener("click", function() {
  // khởi tạo chỉ một lần
  if (!model) init();
});






