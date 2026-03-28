import React, { useState } from 'react';
import UploadPage    from './pages/UploadPage';
import VerdictPage   from './pages/VerdictPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [screen, setScreen] = useState('upload');
  const [data,   setData]   = useState(null);

  const onResult   = (d) => { setData(d);   setScreen('verdict');   };
  const onContinue = ()  => {               setScreen('dashboard'); };
  const onReset    = ()  => { setData(null); setScreen('upload');    };

  if (screen === 'upload')    return <UploadPage    onResult={onResult} />;
  if (screen === 'verdict')   return <VerdictPage   data={data} onContinue={onContinue} />;
  if (screen === 'dashboard') return <DashboardPage data={data} onReset={onReset} />;
  return null;
}
