import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiPost } from '../../../services/api'; // ajusta ruta si tu api helper está en otra carpeta

export default function useRecordPageView() {
  const location = useLocation();

  useEffect(() => {
    // no bloqueante, fire-and-forget
    const token = localStorage.getItem('token') || null;
    apiPost('/api/v1/analytics/record_page_view', { path: location.pathname }, token)
      .catch((err) => {
        // solo debug: no queremos romper render si falla
        // console.debug('record_page_view failed', err?.body || err.message || err);
      });
  }, [location]);
}