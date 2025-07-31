
import React, { useState } from 'react';
import '../styles/login.css';

export default function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (_e) => {
    _e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isRegister) {
        // Registro
        const res = await fetch('https://apiheroe.vercel.app/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error('Respuesta no JSON (registro):', text);
          throw new Error('Respuesta inesperada del servidor (registro): ' + text);
        }
        if (!res.ok) throw new Error(data.error || 'Error al registrar');
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setIsRegister(false);
      } else {
        // Login
        const res = await fetch('https://apiheroe.vercel.app/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error('Respuesta no JSON (login):', text);
          throw new Error('Respuesta inesperada del servidor (login): ' + text);
        }
        if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
        localStorage.setItem('token', data.token);
        onLogin();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bosque-bg">
      <div className="login-container">
        <h1>Bienvenido al Bosque de Héroes</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={isRegister ? 12 : 1}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : isRegister ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>
        {error && <div style={{ color: '#ffbaba', marginTop: 8 }}>{error}</div>}
        {success && <div style={{ color: '#b2e59e', marginTop: 8 }}>{success}</div>}
        <p className="login-register">
          {isRegister ? (
            <>
              ¿Ya tienes cuenta?{' '}
              <a href="#" onClick={_e => { _e.preventDefault(); setIsRegister(false); setError(''); setSuccess(''); }}>Inicia sesión</a>
            </>
          ) : (
            <>
              ¿No tienes cuenta?{' '}
              <a href="#" onClick={_e => { _e.preventDefault(); setIsRegister(true); setError(''); setSuccess(''); }}>Regístrate</a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
