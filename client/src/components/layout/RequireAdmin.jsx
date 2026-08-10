import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminApi } from '../../services/api.js';

export default function RequireAdmin({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    adminApi
      .get('/admin/me')
      .then((data) => {
        if (data.success) setAuthed(true);
        else throw new Error();
      })
      .catch(() =>
        navigate('/admin/login', { replace: true, state: { from: location } })
      )
      .finally(() => setChecking(false));
  }, [navigate, location]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-noir-gold text-sm uppercase tracking-[0.3em]">
          Loading...
        </div>
      </div>
    );
  }

  return authed ? children : null;
}
