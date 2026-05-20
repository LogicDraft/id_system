import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, UserCheck, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isScanning) return;

    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    scannerRef.current = scanner;

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText) {
      // Pause scanning
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      setIsScanning(false);
      handleVerification(decodedText);
    }

    function onScanFailure(error) {
      // ignore frame errors
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [isScanning]);

  const handleVerification = async (qrData) => {
    try {
      const [usn, token] = qrData.split(':');
      
      if (!usn || !token) {
        throw new Error('Invalid QR Format');
      }

      const response = await axios.post(`${API_URL}/verify`, { usn, token });
      
      if (response.data && response.data.student) {
        setScanResult(response.data.student);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setScanResult(null);
      setError(err.response?.data?.error || err.message || 'Verification Failed');
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setIsScanning(true);
  };

  if (scanResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-600 text-white p-6">
        <UserCheck size={80} className="mb-4" />
        <h1 className="text-4xl font-bold mb-8">Access Granted</h1>
        
        <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          <img 
            src={scanResult.profilePhotoUrl} 
            alt="Student Profile" 
            className="w-48 h-48 rounded-full object-cover shadow-md mb-6 border-4 border-green-500"
          />
          <h2 className="text-3xl font-bold mb-2">{scanResult.name}</h2>
          <p className="text-green-600 font-semibold mb-8 flex items-center gap-2">
            <ShieldCheck size={24} /> Verified Student
          </p>
          
          <button 
            onClick={resetScanner}
            className="w-full bg-slate-900 text-white font-bold py-4 px-8 rounded-full hover:bg-slate-800 transition shadow-lg text-lg"
          >
            Clear / Next Scan
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-600 text-white p-6">
        <ShieldAlert size={80} className="mb-4" />
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        
        <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center max-w-sm w-full">
          <XCircle size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid or Expired ID</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          
          <button 
            onClick={resetScanner}
            className="w-full bg-slate-900 text-white font-bold py-4 px-8 rounded-full hover:bg-slate-800 transition shadow-lg text-lg"
          >
            Scan Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-100 text-slate-900 p-6 pt-12">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <ShieldCheck className="text-blue-600" size={36} />
        Gate Security Scanner
      </h1>
      
      <div className="w-full max-w-md bg-white p-4 rounded-3xl shadow-xl border border-slate-200">
        <div id="reader" className="w-full rounded-2xl overflow-hidden"></div>
      </div>
      
      <p className="mt-8 text-slate-500 text-center max-w-sm">
        Point the camera at the student's ID screen. The scanner will automatically read the dynamic QR code.
      </p>
    </div>
  );
}

export default App;
