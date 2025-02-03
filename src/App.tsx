import { useState } from 'react';
import axios from 'axios';
import './App.css'

function App() {
  const [url, setUrl] = useState<string>(''); 
  const [shortnedId, setShortnedId] = useState<string>(''); 
  const [result, setResult] = useState<string>(''); 
  const [error, setError] = useState<string>(''); 

  // Handle URL shortening
  const handleUrlShorten = async () => {
    if (!url) {
      setError('Please provide a URL to shorten!');
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/shorten`, { baseUrl: url });
      setResult(response.data.message); // Assuming response contains the shortened URL in message
      setError('');
    } catch (err) {
      setError('Error shortening the URL!');
      setResult('');
    }
  };

  // Handle redirect with shortened URL
  const handleRedirect = async () => {
    if (!shortnedId) {
      setError('Please provide a shortened URL!');
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/${shortnedId}`);
      window.location.href = response.data.baseUrl; // Redirect the user to the base URL
      setError('');
    } catch (err) {
      setError('Shortened URL not found!');
      setResult('');
    }
  };

    return (
      <div className="container">
      <h1>URL Shortener</h1>
      <div className="url-input-container">
        <h2>Shorten Your URL</h2>
        <input
          type="text"
          placeholder="Enter URL to shorten"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={handleUrlShorten}>Shorten URL</button>
        {result && <p>Shortened URL: <a href={result} target="_blank" rel="noopener noreferrer">{result}</a></p>}
      </div>

      <div className="shortened-url-container">
        <h2>Redirect from Shortened URL</h2>
        <input
          type="text"
          placeholder="Enter shortened URL"
          value={shortnedId}
          onChange={(e) => setShortnedId(e.target.value)}
        />
        <button onClick={handleRedirect}>Go to Base URL</button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
    );
  };


export default App
