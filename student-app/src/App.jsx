import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { authenticator } from 'otplib';
import { io } from 'socket.io-client';
import { Menu, Bell, CheckCircle2, ShieldCheck, Home, History, User, Settings, ArrowLeft, Maximize, ScanLine } from 'lucide-react';
import { mockClassroom } from './data.js';

authenticator.options = { step: 30, window: 1 };
const SOCKET_SERVER_URL = 'http://localhost:5000'; 

// Extract student details
const student = mockClassroom.students.find(s => s.usn === '1AY25AI037');
const institution = mockClassroom.institutionDetails;
const STUDENT = {
  usn: student.usn,
  name: student.name.split(' ').slice(0,2).join(' '), // e.g. GOWTHAM GOWDA
  firstName: student.name.split(' ')[0].charAt(0) + student.name.split(' ')[0].slice(1).toLowerCase(), // e.g. Gowtham
  department: institution.department.split('(')[0].trim(), // e.g. AIML
  year: institution.semester.replace(' Semester BE', ''), // e.g. Second
  totpSecret: 'GZXQAYTLI5TEGVKU', // From our backend test
  profilePhotoUrl: 'https://i.pravatar.cc/300?img=60' // Mocked photo
};

function App() {
  const [token, setToken] = useState('');
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(30);
  const [verified, setVerified] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const generateToken = () => {
      setToken(authenticator.generate(STUDENT.totpSecret));
    };
    generateToken();

    const timerInterval = setInterval(() => {
      const epoch = Math.floor(Date.now() / 1000);
      const step = 30;
      const timeRemaining = step - (epoch % step);
      
      setTimeLeft(timeRemaining);
      setProgress((timeRemaining / step) * 100);

      if (timeRemaining === step || timeRemaining === step - 1) generateToken();
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);
    socket.on('scan_success', (data) => {
      if (data.usn === STUDENT.usn) {
        setVerified(true);
        setTimeout(() => setVerified(false), 5000);
      }
    });
    return () => socket.disconnect();
  }, []);

  if (isFullScreen) {
     return (
        <div className="flex flex-col min-h-screen bg-[#091841] text-white font-sans selection:bg-blue-500/30">
          {/* Header */}
          <div className="px-6 pt-12 pb-6 flex items-center justify-between">
            <button onClick={() => setIsFullScreen(false)} className="p-2 hover:bg-white/10 rounded-full transition"><ArrowLeft size={24} /></button>
            <h1 className="text-xl font-semibold">My QR ID</h1>
            <button className="p-2 bg-white/10 rounded-full"><ShieldCheck size={20} className="text-blue-400" /></button>
          </div>
          
          <div className="px-6 flex flex-col items-center flex-1">
             <p className="text-center font-medium mb-1 mt-4">Show this QR code at the entry gate</p>
             <p className="text-center text-sm text-slate-400 mb-8 max-w-xs">This code is valid for a short time and changes automatically.</p>

             <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl relative mb-8">
                <div className="flex justify-center mb-6">
                    <QRCodeSVG value={`${STUDENT.usn}:${token}`} size={260} bgColor="#ffffff" fgColor="#000000" level="H" 
                      imageSettings={{ src: "https://cdn-icons-png.flaticon.com/512/3039/3039981.png", x: undefined, y: undefined, height: 48, width: 48, excavate: true, }} />
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-sm font-semibold text-slate-500">
                  <span>Refreshes in</span>
                  <span className="text-blue-600">{timeLeft}s</span>
                </div>
             </div>

             <div className="bg-[#122345] border border-blue-900/50 rounded-2xl w-full max-w-sm py-4 flex items-center justify-center gap-2 text-sm font-medium text-blue-200 shadow-inner mb-6">
               <ShieldCheck size={18} className="text-blue-400" /> Secure • Dynamic • Verified
             </div>

             <div className="bg-white w-full max-w-sm rounded-[32px] p-6 mb-8 shadow-xl">
                <h3 className="text-sm font-semibold text-slate-500 text-center mb-6">Important Instructions</h3>
                <ul className="space-y-4 text-sm text-slate-600 font-medium">
                  <li className="flex items-start gap-3"><ShieldCheck size={18} className="text-blue-500 shrink-0 mt-0.5" /> Do not share your QR code with others.</li>
                  <li className="flex items-start gap-3"><History size={18} className="text-blue-500 shrink-0 mt-0.5" /> Each QR code is valid for 30 seconds only.</li>
                  <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" /> Keep your app updated for security.</li>
                </ul>
                <button className="mt-8 w-full border-2 border-blue-100 text-blue-600 font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-slate-50 transition">
                  <ScanLine size={20} /> SCAN HISTORY
                </button>
             </div>
          </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#091841] text-white font-sans selection:bg-blue-500/30 pb-24">
      {/* Top Navigation */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <button className="p-2 -ml-2 hover:bg-white/10 rounded-full transition"><Menu size={28} /></button>
        <button className="p-2 -mr-2 hover:bg-white/10 rounded-full transition"><Bell size={24} /></button>
      </div>

      {/* Greeting Section */}
      <div className="px-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold flex items-center gap-2 tracking-tight">
            Hello, {STUDENT.firstName} <span className="text-2xl animate-pulse">👋</span>
          </h1>
          <p className="text-slate-300 mt-1">Welcome back!</p>
        </div>
        <img src={STUDENT.profilePhotoUrl} alt="Profile" className="w-14 h-14 rounded-full border border-blue-400 object-cover shadow-lg" />
      </div>

      {/* Verified Status Card */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-6 shadow-[0_10px_30px_rgba(59,130,246,0.3)] flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
          <div className="bg-white/20 p-4 rounded-[20px] backdrop-blur-sm border border-white/20 shadow-inner">
             <ShieldCheck size={32} className="text-white drop-shadow-md" />
          </div>
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1 opacity-90">Your ID is</p>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">Verified <CheckCircle2 size={20} className="text-blue-200 fill-white/20" /></h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] animate-pulse shadow-[0_0_8px_#34d399]"></span>
              <span className="text-[11px] text-blue-100 font-semibold tracking-wider uppercase opacity-90">Status: Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Card */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-[32px] p-6 shadow-xl relative overflow-hidden">
          {verified && (
             <div className="absolute inset-0 z-20 bg-green-500 flex flex-col items-center justify-center text-white rounded-[32px] animate-in fade-in zoom-in duration-300">
               <CheckCircle2 size={80} className="mb-4 animate-bounce" />
               <h2 className="text-3xl font-bold">Verified</h2>
             </div>
          )}

          <div className="mb-5">
            <h3 className="text-slate-800 font-bold text-lg">Your QR ID</h3>
            <p className="text-[13px] text-slate-500 font-medium">This QR code refreshes every 30 seconds</p>
          </div>

          <div className="flex justify-center mb-5 border-2 border-slate-100 p-4 rounded-[28px]">
             <QRCodeSVG value={`${STUDENT.usn}:${token}`} size={240} bgColor="#ffffff" fgColor="#000000" level="H" 
               imageSettings={{ src: "https://cdn-icons-png.flaticon.com/512/3039/3039981.png", x: undefined, y: undefined, height: 48, width: 48, excavate: true, }} />
          </div>

          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
            <div className="bg-[#10b981] h-full rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-500 px-1">
            <span>Refreshes in</span>
            <span className="text-blue-600">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Student Information Card */}
      <div className="px-6 mb-8">
        <div className="bg-white rounded-[32px] p-7 shadow-xl">
           <h3 className="text-slate-800 font-bold mb-6 text-lg">Student Information</h3>
           
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3 text-slate-500">
                    <User size={18} className="text-blue-500" /> <span className="text-sm font-medium">USN</span>
                 </div>
                 <span className="text-slate-900 font-bold text-sm">{STUDENT.usn}</span>
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3 text-slate-500">
                    <User size={18} className="text-blue-500" /> <span className="text-sm font-medium">Name</span>
                 </div>
                 <span className="text-slate-900 font-bold text-sm uppercase text-right max-w-[150px] truncate">{STUDENT.name}</span>
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3 text-slate-500">
                    <ShieldCheck size={18} className="text-red-400" /> <span className="text-sm font-medium">Department</span>
                 </div>
                 <span className="text-slate-900 font-bold text-sm text-right">{STUDENT.department}</span>
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3 text-slate-500">
                    <History size={18} className="text-blue-400" /> <span className="text-sm font-medium">Year</span>
                 </div>
                 <span className="text-slate-900 font-bold text-sm text-right">{STUDENT.year} Year</span>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe pt-3 px-6 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] rounded-t-[32px] z-50">
         <div className="flex justify-between items-center h-16 pb-2">
            <button className="flex flex-col items-center gap-1.5 text-blue-600">
               <Home size={24} className="fill-current" />
               <span className="text-[11px] font-bold">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600 transition">
               <History size={24} />
               <span className="text-[11px] font-semibold">History</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600 transition">
               <User size={24} />
               <span className="text-[11px] font-semibold">Profile</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-600 transition">
               <Settings size={24} />
               <span className="text-[11px] font-semibold">Settings</span>
            </button>
         </div>
      </div>
    </div>
  );
}

export default App;
