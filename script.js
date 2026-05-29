const form = document.getElementById("generatorForm");
const childNameInput = document.getElementById("childName");
const genderInput = document.getElementById("gender");

const loader = document.getElementById("loader");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const resultSection = document.getElementById("resultSection");
const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");

const downloadPngBtn = document.getElementById("downloadPng");
const downloadPdfBtn = document.getElementById("downloadPdf");

let finalImageData = null;

const templates = {
  girl: "assets/girl-template.png",
  boy: "assets/boy-template.png"
};

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = childNameInput.value.trim();
  const gender = genderInput.value;

  if (!name || !gender) return;

  resultSection.classList.add("hidden");
  loader.classList.remove("hidden");
  progressBar.style.width = "0%";
  progressText.textContent = "0%";

  try {
    await fakeProgress();
    await createBirthdayImage(name, gender);

    loader.classList.add("hidden");
    resultSection.classList.remove("hidden");
  } catch (error) {
    loader.classList.add("hidden");
    alert("Could not load the template. Please check that the image files are inside the assets folder and named correctly.");
    console.error(error);
  }
});

function fakeProgress() {
  return new Promise((resolve) => {
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 5;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(resolve, 250);
      }

      progressBar.style.width = progress + "%";
      progressText.textContent = progress + "%";
    }, 160);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function createBirthdayImage(name, gender) {
  await document.fonts.ready;

  const template = await loadImage(templates[gender]);

  canvas.width = template.width;
  canvas.height = template.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

  const isGirl = gender === "girl";

  const fontSize = Math.round(canvas.width * 0.145);
  const nameY = Math.round(canvas.height * 0.545);
  const maxWidth = canvas.width * 0.78;

  ctx.save();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${fontSize}px "Imperial Script", "Great Vibes", cursive`;

  ctx.shadowColor = isGirl
    ? "rgba(255, 150, 190, 0.38)"
    : "rgba(80, 160, 230, 0.38)";

  ctx.shadowBlur = Math.round(canvas.width * 0.015);
  ctx.shadowOffsetY = Math.round(canvas.width * 0.006);

  ctx.fillStyle = isGirl ? "#f191bf" : "#6aaee8";

  fitText(ctx, name, canvas.width / 2, nameY, maxWidth, fontSize);

  ctx.restore();

  finalImageData = canvas.toDataURL("image/png");
}

function fitText(context, text, x, y, maxWidth, startingFontSize) {
  let fontSize = startingFontSize;

  while (context.measureText(text).width > maxWidth && fontSize > 40) {
    fontSize -= 4;
    context.font = `${fontSize}px "Imperial Script", "Great Vibes", cursive`;
  }

  context.fillText(text, x, y);
}

downloadPngBtn.addEventListener("click", function () {
  if (!finalImageData) return;

  const link = document.createElement("a");
  link.download = "birthday-sign.png";
  link.href = finalImageData;
  link.click();
});

downloadPdfBtn.addEventListener("click", function () {
  if (!finalImageData) return;

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(finalImageData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save("birthday-sign.pdf");
});
