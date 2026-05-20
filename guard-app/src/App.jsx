import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, UserCheck, XCircle, Scan, Fingerprint, Camera } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  const handleVerification = async (qrData) => {
    try {
      const decodedText = qrData[0]?.rawValue || qrData; // handles different versions of the lib
      if (!decodedText) return;
      
      const [usn, token] = decodedText.split(':');
      
      if (!usn || !token) {
        throw new Error('Invalid QR Format. Ensure it is a valid Student ID.');
      }

      setIsScanning(false);

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
      <div className="flex flex-col min-h-screen bg-[#091841] text-white p-6 justify-center">
         <div className="w-full max-w-md mx-auto">
            <div className="flex justify-center mb-8">
               <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_#22c55e]">
                     <UserCheck size={36} className="text-white" />
                  </div>
               </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center mb-8 text-green-400">Access Granted</h1>
            
            <div className="bg-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-500/10 to-transparent"></div>
               
               <div className="flex flex-col items-center relative z-10">
                  <img 
                    src={scanResult.profilePhotoUrl || 'https://i.pravatar.cc/300?img=60'} 
                    alt="Student Profile" 
                    className="w-36 h-36 rounded-full object-cover shadow-xl mb-6 border-4 border-white ring-4 ring-green-100"
                  />
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">{scanResult.name}</h2>
                  <p className="text-slate-500 font-medium mb-6">{scanResult.usn}</p>
                  
                  <div className="w-full bg-green-50 rounded-2xl p-4 flex items-center justify-center gap-3 mb-8 border border-green-200">
                    <ShieldCheck size={24} className="text-green-600" /> 
                    <span className="text-green-700 font-bold text-lg tracking-wide uppercase">Verified Student</span>
                  </div>
                  
                  <button 
                    onClick={resetScanner}
                    className="w-full bg-[#091841] text-white font-bold py-4 px-8 rounded-2xl hover:bg-blue-900 transition shadow-lg text-lg flex items-center justify-center gap-2"
                  >
                    <Scan size={24} /> Next Scan
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#091841] text-white p-6 justify-center">
         <div className="w-full max-w-md mx-auto">
            <div className="flex justify-center mb-8">
               <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_#ef4444]">
                     <ShieldAlert size={36} className="text-white" />
                  </div>
               </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center mb-8 text-red-400">Access Denied</h1>
            
            <div className="bg-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-500/10 to-transparent"></div>
               
               <div className="flex flex-col items-center relative z-10 text-center">
                  <XCircle size={64} className="text-red-500 mb-6 drop-shadow-md" />
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Security Alert</h2>
                  <p className="text-slate-500 font-medium mb-8 bg-red-50 px-4 py-3 rounded-xl border border-red-100 text-red-600 w-full">{error}</p>
                  
                  <button 
                    onClick={resetScanner}
                    className="w-full bg-[#091841] text-white font-bold py-4 px-8 rounded-2xl hover:bg-blue-900 transition shadow-lg text-lg flex items-center justify-center gap-2"
                  >
                    <Scan size={24} /> Scan Again
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#091841] text-white selection:bg-blue-500/30">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between shadow-sm bg-white/5 backdrop-blur-md border-b border-white/10 z-10 relative">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-500/20 rounded-xl">
             <ShieldCheck className="text-blue-400" size={28} />
           </div>
           <div>
             <h1 className="text-xl font-bold tracking-wide">Gate Security</h1>
             <p className="text-xs text-blue-300 font-medium uppercase tracking-wider">Active Scanner</p>
           </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition"><Fingerprint size={24} className="text-slate-300" /></button>
      </div>
      
      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="w-full max-w-md relative z-10">
           <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Ready to Scan</h2>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">Point the camera at the student's dynamic QR screen to verify identity.</p>
           </div>
           
           <div className="bg-white/5 p-4 rounded-[40px] shadow-2xl border border-white/10 backdrop-blur-xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 opacity-50"></div>
             
             <div className="rounded-[32px] overflow-hidden bg-black aspect-square relative shadow-inner border-4 border-[#091841]">
               {isScanning ? (
                 <Scanner 
                   onScan={handleVerification}
                   onError={(e) => console.log('Scanner error:', e)}
                   components={{
                     audio: false,
                     finder: false
                   }}
                   styles={{
                     container: { width: '100%', height: '100%' },
                     video: { objectFit: 'cover' }
                   }}
                 />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                   <Camera size={48} className="animate-pulse opacity-50" />
                   <p className="font-medium tracking-wide">Processing...</p>
                 </div>
               )}
               
               {/* Custom Reticle Overlay */}
               {isScanning && (
                 <div className="absolute inset-0 pointer-events-none border-[30px] border-black/40 flex items-center justify-center">
                    <div className="w-full h-full border-2 border-dashed border-white/40 rounded-3xl relative overflow-hidden">
                       <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
                       <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
                       <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
                       <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
                       
                       {/* Animated Scan Line */}
                       <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/80 shadow-[0_0_10px_#3b82f6] animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>
      
      {/* Add custom CSS for the scan animation directly inline for simplicity */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}

export default App;
