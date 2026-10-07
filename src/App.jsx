import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Analyze from './pages/Analyze.jsx';
import Results from './pages/Results.jsx';
import About from './pages/About.jsx';
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (<>
    <Navbar />
    <main id="main">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/results" element={<Results />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </main>
    <footer className="foot"><div className="wrap">RetinaAI · Academic research prototype · Not for clinical diagnosis or treatment decisions.</div></footer>
  </>);
}
