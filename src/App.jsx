import { useState } from "react";
import QRCodeScanner from "./QRCodeScanner";

function App() {
  const [start, setStart] = useState(false)

  return (
    <>
      <div className="mx-auto">
        <div className="p-4 md:p-5 mb-5">
          <h3 className="text-2xl text-center font-bold text-gray-800">
            Simple QR Code Scanner
          </h3>
          <div className="flex flex-col items-center justify-center">
            <p className="mt-1 text-gray-500">
              Scan QR code in real time and see the data
            </p>
            <a
              className="mt-6 py-2 px-10 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => setStart(!start)}
            >
              {!start ? "Scan" : "Stop"}
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mx-auto p-5">
          {start && <QRCodeScanner/>}
        </div>
      </div>
    </>
  );
}

export default App
