import React from 'react';

export default function Page() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀 SkillThinker Unified OS</h1>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
        The Career Intelligence Agent is active and running.
      </p>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        border: '1px solid #334155', 
        borderRadius: '8px',
        backgroundColor: '#1e293b'
      }}>
        <p>🟢 WhatsApp Agent: <strong>Active</strong></p>
        <p>🟢 USSD Gateway: <strong>Connected</strong></p>
        <p>🟢 Hybrid AI: <strong>Groq + Gemini Flash</strong></p>
      </div>
      <footer style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#64748b' }}>
        SkillThinker &copy; 2026
      </footer>
    </div>
  );
}
