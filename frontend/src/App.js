import { useEffect } from "react";
import "@/App.css";

function App() {
  useEffect(() => {
    // Redirect to the static login page
    window.location.href = '/login.html';
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0a0e14',
      color: '#e6edf3',
      fontFamily: 'IBM Plex Sans, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '3px solid #21262d',
          borderTopColor: '#00d4aa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p>Redirecting to PayMFB Dashboard...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default App;
