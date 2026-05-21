import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'system-ui, sans-serif', 
        backgroundColor: '#0f172a', 
        color: 'white' 
      }}>
        {children}
      </body>
    </html>
  );
}
