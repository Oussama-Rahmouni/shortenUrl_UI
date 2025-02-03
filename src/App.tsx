import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState<string>(''); 
  const [shortenedId, setShortenedId] = useState<string>(''); 
  const [result, setResult] = useState<string>(''); 
  const [exist, setExist] = useState<string>(''); 
  const [error, setError] = useState<string>(''); 

  // Handle URL shortening
  const handleUrlShorten = async () => {
    if (!url) {
      setError('Please provide a URL to shorten!');
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/shorten`, { baseUrl: url });
      console.log(response)
      if(response.data.special){
        setExist(response.data.message)
      }else{
        setExist('')
      }
      
      setResult(response.data.shortnedId); 
      
      setError('');
    } catch (err) {
      setError('Error shortening the URL!');
      setResult('');
    }
  };

  // Handle redirect with shortened URL
  const handleRedirect = async () => {
    if (!shortenedId) {
      setError('Please provide a shortened URL!');
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/${shortenedId}`);
      window.location.href = response.data.baseUrl; // Redirect the user to the base URL
      setError('');
    } catch (err) {
      setError('Shortened URL not found!');
      setResult('');
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert('Shortened URL copied to clipboard!');
    }
  };

  useEffect(()=>{

  }, [result])

  return (
    <div className="container">
      <h1 className="title">URL Shortener</h1>

      <div className="url-input-container">
        <h2>Shorten Your URL</h2>
        <input
          type="text"
          placeholder="Enter URL to shorten"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={handleUrlShorten} className="primary-btn">Shorten URL</button>

        {result && (
          <div className="shortened-url">
            {exist && <h3>This url already shortned before</h3>}
            <p>Shortened URL:</p>
            <a href={result} target="_blank" rel="noopener noreferrer">{result}</a>
            <button onClick={handleCopy} className="secondary-btn">Copy URL</button>
          </div>
        )}
      </div>

      <div className="shortened-url-container">
        <h2>Redirect from Shortened URL</h2>
        <input
          type="text"
          placeholder="Enter shortened URL"
          value={shortenedId}
          onChange={(e) => setShortenedId(e.target.value)}
        />
        <button onClick={handleRedirect} className="primary-btn">Go to Base URL</button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default App;
