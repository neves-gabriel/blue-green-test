function App() {
  // Access the environment variable; default to blue if not set
  const color = import.meta.env.VITE_COLOR || 'blue';

  return (
    <div
      style={{
        backgroundColor: color,
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1 style={{ color: 'white', fontSize: '3rem' }}>
        {color.charAt(0).toUpperCase() + color.slice(1)} Deployment
      </h1>
    </div>
  );
}

export default App;
