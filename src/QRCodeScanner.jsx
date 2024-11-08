import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";

const QRCodeScanner = () => {
  const videoRef = useRef(null); // To reference the video element
  const canvasRef = useRef(null); // To reference the canvas element
  const [qrResults, setQrResults] = useState(new Set()); // Set to store unique QR codes
  const [isScanning, setIsScanning] = useState(false); // If QR code is being scanned

  const playBeepSound = () => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const videoElement = videoRef.current;
        if (videoElement && !videoElement.srcObject) {
          videoElement.srcObject = stream;
          videoElement.setAttribute("playsinline", true);
          videoElement.onloadedmetadata = () => {
            scanQRCode();
          };
        }
      } catch (err) {
        console.error("Error accessing the camera: ", err);
      }
    };

    startCamera();

    return () => {
      const videoElement = videoRef.current;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const scanQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (video && canvas && context) {
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        return; // Early exit if video dimensions are invalid
      }

      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (code) {
        setIsScanning(true);

        setQrResults((prevResults) => {
          if (!prevResults.has(code.data)) {
            // Only play beep sound if new data is added
            playBeepSound();

            const newResults = new Set(prevResults);
            newResults.add(code.data);
            return newResults;
          }
          return prevResults;
        });
      } else {
        setIsScanning(false);
      }
    }

    requestAnimationFrame(scanQRCode);
  };

  return (
    <div>
      <div className=" border-2 rounded-md border-green-800">
        <video
          className=" border-2 rounded-md"
          ref={videoRef}
          width="400"
          height="300"
          autoPlay
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
      <div
        className="max-w-xs bg-white my-5 mx-auto flex justify-center items-center"
        role="alert"
        tabIndex="-1"
        aria-labelledby="hs-toast-success-example-label"
      >
        <div className="flex p-4">
          <div className="shrink-0">
            <svg
              className="shrink-0 size-4 text-teal-500 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"></path>
            </svg>
          </div>
          <div className="ms-3">
            <p
              id="hs-toast-success-example-label"
              className="text-sm font-medium text-gray-700"
            >
              Scaning QR Codes...
            </p>
          </div>
        </div>
      </div>
      <ul className="flex flex-col">
        {[...qrResults].map((result, index) => (
          <li
            key={index}
            className="inline-flex items-center gap-x-2 py-3 px-4 text-sm font-medium odd:bg-gray-100 bg-white border border-gray-200 text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg"
            onClick={() => navigator.clipboard.writeText(result)}
          >
            {index + 1 + ". " + result}
          </li>
        ))}
      </ul>
      <div
        style={{ marginTop: "20px" }}
        className="flex justify-center items-center"
      >
        <p>
          {isScanning ? (
            <div
              className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-green-700 rounded-full"
              role="status"
              aria-label="loading"
            >
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <div
              className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-red-700 rounded-full"
              role="status"
              aria-label="loading"
            >
              <span className="sr-only">Loading...</span>
            </div>
          )}
        </p>
      </div>
    </div>
  );
};

export default QRCodeScanner;
