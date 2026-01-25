import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    tenure: '',
    monthlyCharges: '',
    contract: '0'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
      }

      const data = await res.json();
      setResult(data.probability);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Predicción de Churn</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left', backgroundColor: '#111', padding: '30px', borderRadius: '15px', border: '1px solid #333' }}>
        <label>Meses de Antigüedad:
          <input type="number" value={formData.tenure} onChange={(e) => setFormData({...formData, tenure: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#222', color: 'white' }} />
        </label>
        <label>Cargos Mensuales:
          <input type="number" step="0.01" value={formData.monthlyCharges} onChange={(e) => setFormData({...formData, monthlyCharges: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#222', color: 'white' }} />
        </label>
        <label>Contrato:
          <select value={formData.contract} onChange={(e) => setFormData({...formData, contract: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#222', color: 'white' }}>
            <option value="0">Mes a mes</option>
            <option value="1">Un año</option>
            <option value="2">Dos años</option>
          </select>
        </label>
        <button type="submit" disabled={loading} style={{ backgroundColor: '#0070f3', color: 'white', padding: '15px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? 'Calculando...' : 'Predecir Riesgo'}
        </button>
      </form>
      {result !== null && (
        <div style={{ marginTop: '30px', padding: '20px', borderRadius: '15px', backgroundColor: result > 50 ? '#441111' : '#114411', border: '1px solid white', maxWidth: '400px', margin: '30px auto' }}>
          <h2>Probabilidad: {result}%</h2>
          <p>{result > 50 ? "ALTO RIESGO" : "CLIENTE FIEL"}</p>
        </div>
      )}
    </div>
  );
}