import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState<string>(''); 
  const [shortenedId, setShortenedId] = useState<string>(''); 
  const [result, setResult] = useState<string>(''); 
  const [exist, setExist] = useState<string>(''); 
  const [error, setError] = useState<string>(''); 
  const [warning, setWarning] = useState<string>('');
  const [expiration, setExpiration] = useState<string>('24h'); 
  const [expirationTime, setExpirationTime] = useState<string>(''); 
  const [bulkUrls, setBulkUrls] = useState<File | null>(null); 
  const [bulkUrlsResult, setBulkUrlsResult] = useState<any[]>(); 


  const dateFormat = (expiration:any)=>{
    const date = new Date(expiration);
     const formattedDate = date.toISOString().replace("T", " ").slice(0, 19);
     return formattedDate

  }

  const verifyUrl = (url: string) => {
    const regex = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\S*)$/i;
    return regex.test(url);
  };

  const verifyHttps = (url: string) => {
    return url.startsWith('http://');
  };

  // Handle URL shortening
  const handleUrlShorten = async () => {
    if (!url) {
      setError('Please provide a URL to shorten!');
      return;
    }

    if (!verifyUrl(url)) {
      setError('Please verify if the URL is valid');
      return;
    }

    if (verifyHttps(url)) {
      setWarning('This URL is not HTTPS!');
      setTimeout(() => {
        setWarning('');
      }, 3000);
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/shorten`, { 
        baseUrl: url,
        expiration // Send expiration to the backend
      });
      if (response.data.special) {
        setExist(response.data.message);
      } else {
        setExist('');
      }
      setResult(response.data.shortnedId);
      const newDate = dateFormat(response.data.expiration)
      setExpirationTime(newDate)


      setError('');
    } catch (err) {
      setError('Error shortening the URL!');
      setResult('');
    }
  };

  // Handle bulk URL shortening
  const handleBulkShorten = async () => {
    if (!bulkUrls) {
      setError('Please upload a CSV file!');
      return;
    }

    const formData = new FormData();
    formData.append('file', bulkUrls);
    formData.append('expiration', expiration); // Send expiration to the backend

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/bulk-shorten`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Bulk URLs shortened successfully!');
      setBulkUrlsResult(response.data.shortnedUrls)
      console.log(response.data); // Log the response (shortened URLs)
    } catch (err) {
      setError('Error shortening bulk URLs!');
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
      if (!response.data.baseUrl) {
        alert('There is no URL for this ID');
        return;
      }
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
        <select
          value={expiration}
          onChange={(e) => setExpiration(e.target.value)}
        >
          <option value="24h">24 Hours</option>
          <option value="48h">48 Hours</option>
          <option value="7d">7 Days</option>
        </select>
        <button onClick={handleUrlShorten} className="primary-btn">Shorten URL</button>
        {warning && <h4 style={{ color: 'pink' }}>{warning}</h4>}
        {result && (
          <div className="shortened-url">
            {exist && <h3>This URL was already shortened before</h3>}
             {expirationTime && <h5>Expiration Date: {expirationTime}</h5>}
            <p>Shortened URL:</p>
            <a href={result} target="_blank" rel="noopener noreferrer">{result}</a>
            <button onClick={handleCopy} className="secondary-btn">Copy URL</button>
          </div>
        )}
      </div>

      <div className="bulk-url-container">
        <h2>Bulk Shorten URLs</h2>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setBulkUrls(e.target.files ? e.target.files[0] : null)}
        />
        {bulkUrlsResult && (
          bulkUrlsResult.map((doc, index)=>(
            <div key={index}>
             <a href={result} target="_blank" rel="noopener noreferrer">{doc.shortenedId.shortenedId}</a>
             <button onClick={handleCopy} className="secondary-btn">Copy URL</button>
            </div>
        )))}
        <button onClick={handleBulkShorten} className="primary-btn">Shorten Bulk URLs</button>
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