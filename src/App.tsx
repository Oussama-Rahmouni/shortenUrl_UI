import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState<string>(''); 
  const [shortenedId, setShortenedId] = useState<string>(''); 
  const [result, setResult] = useState<string>(''); //list of shortned urls
  const [exist, setExist] = useState<string>(''); //old shortned url if exist
  const [error, setError] = useState<string>(''); 
  const [warning, setWarning] = useState<string>('');
  const [expiration, setExpiration] = useState<string>('24h'); 
  const [expirationTime, setExpirationTime] = useState<string>(''); 
  const [bulkUrls, setBulkUrls] = useState<File | null>(null); 
  const [bulkUrlsResult, setBulkUrlsResult] = useState<any[]>(); //if you upload file of already shortned urls
  const [submited, setSubmited] = useState<any>(null);



  // change date format to display
  const dateFormat = (expiration:any)=>{
    const date = new Date(expiration);
     const formattedDate = date.toISOString().replace("T", " ").slice(0, 19);
     return formattedDate

  }

  // verify Url validity 
  const verifyUrl = (url: string) => {
    const regex = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\S*)$/i;
    return regex.test(url);
  };

  //verify if the used protocol is HTTPS 
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
      setError('Url Not Valid, verify Your Url !');
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
        expiration 
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
    formData.append('expiration', expiration);

    try {
      setSubmited(true)
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/bulk-shorten`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Bulk URLs shortened successfully!');
      setBulkUrlsResult(response.data.shortenedUrls)
    } catch (err) {
      setError('Error shortening bulk URLs!');
    }finally{
      setSubmited(false)
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

  //copy single url
  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert('Shortened URL copied to clipboard!');
    }
  };

  //copy multple urls
  const handleBulkCopy = (shortenedId: string) => {
    navigator.clipboard.writeText(shortenedId);
    alert('Shortened URL copied to clipboard!');
  };

  useEffect(()=>{
  },[bulkUrlsResult])

  return (
    <div className="container">
      <h1 className="title">URL Shortener</h1>

      {/* Shortend single url */}
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
        <button onClick={handleUrlShorten} disabled={submited} className="primary-btn">Shorten URL</button>
        {warning && <h4 style={{ color: 'pink' }}>{warning}</h4>}
        {result && (
          <div className="shortened-url">
            {exist && <h3>This URL has been shortened before !</h3>}
             {expirationTime && <h5>Expiration Date: {expirationTime}</h5>}
            <p>Shortened URL:</p>
            <a href={result} target="_blank" rel="noopener noreferrer">{result}</a>
            <button onClick={handleCopy} className="secondary-btn">Copy URL</button>
          </div>
        )}
      </div>

      {/* Shortend file of  urls */}
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
             <p>shortenUrl: <strong>{doc.shortenedId}</strong></p>
             <button onClick={()=>handleBulkCopy(doc.shortenedId)} className="secondary-btn">Copy URL</button>
            </div>
        )))}
        <button onClick={handleBulkShorten} disabled={submited}  className="primary-btn" >{submited ? "Submiting request ...": "Shorten a groupe of urls"}</button>
      </div>

        {/* go back to the original base URL */}
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