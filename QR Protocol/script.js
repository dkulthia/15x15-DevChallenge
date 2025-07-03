let qrCode;

function generateQRCode() {
  const text = document.getElementById("text").value.trim();
  const fgColor = document.getElementById("fgColor").value;
  const bgColor = document.getElementById("bgColor").value;
  const size = parseInt(document.getElementById("size").value);
  const cornerStyle = document.getElementById("cornerStyle").value;
  const margin = parseInt(document.getElementById("margin").value);
  if (!text) {
    alert("Please enter some text or a URL");
    return;
  }

  document.getElementById("qrcode").innerHTML = "";
  qrCode = new QRCodeStyling({
    width: size,
    height: size,
    data: text,
    margin: margin,
    dotsOptions: {
      color: fgColor,
      type: cornerStyle
    },
    backgroundOptions: {
      color: bgColor
    }
  });
  qrCode.append(document.getElementById("qrcode"));
}

function downloadQRCode() {
  if (!qrCode) {
    alert("Please generate a QR code first.");
    return;
  }
  qrCode.download({
    name: "qr-code",
    extension: "png"
  });
}
