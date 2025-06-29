const asciiChars = "@#S%?*+;:,.";
const imageInput = document.getElementById("imageInput");
const charWidthInput = document.getElementById("charWidth");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const canvas = document.getElementById("asciiCanvas");
const ctx = canvas.getContext("2d");
let asciiStr = ""; // so we can use it for copy if needed
function mapIntensityToChar(intensity) {
  const index = Math.floor((intensity / 255) * (asciiChars.length - 1));
  return asciiChars[index];
}
generateBtn.addEventListener("click", () => {
  const file = imageInput.files[0];
  if (!file) return alert("Please upload an image.");
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const charWidth = parseInt(charWidthInput.value);
      // Aspect ratio correction: divide by 2 since characters are taller than wide
      const charHeight = Math.round((charWidth * img.height) / img.width / 2);
      // Downscale image to ASCII grid
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = charWidth;
      tempCanvas.height = charHeight;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(img, 0, 0, charWidth, charHeight);
      asciiStr = "";
      for (let y = 0; y < charHeight; y++) {
        for (let x = 0; x < charWidth; x++) {
          const pixel = tempCtx.getImageData(x, y, 1, 1).data;
          const brightness =
            0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2];
          asciiStr += mapIntensityToChar(brightness);
        }
        asciiStr += "\n";
      }
      // Now: measure the actual pixel width of the longest line (not just charWidth * fontSize)
      // so we can crop all extra whitespace and have perfect fit.
      const lines = asciiStr.trimEnd().split("\n");
      const fontSize = 10;
      ctx.font = `${fontSize}px monospace`;
      // Find the max pixel width required (as rendered)
      let maxLineWidth = 0;
      lines.forEach((line) => {
        const lineWidth = ctx.measureText(line).width;
        if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
      });
      // Each line is fontSize px tall; total height = lines.length * fontSize
      const actualHeight = lines.length * fontSize;
      const actualWidth = Math.ceil(maxLineWidth);
      // Draw to main canvas with perfect fit, white background, black text
      canvas.width = actualWidth;
      canvas.height = actualHeight;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, actualWidth, actualHeight);
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = "black";
      ctx.textBaseline = "top";
      lines.forEach((line, index) => {
        ctx.fillText(line, 0, index * fontSize);
      });
      downloadBtn.classList.remove("hidden");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "ascii-art.png";
  link.href = canvas.toDataURL();
  link.click();
});
