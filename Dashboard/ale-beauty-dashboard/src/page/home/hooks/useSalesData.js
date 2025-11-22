import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { getSalesBounds, getSalesData } from '../../../services/salesApi.js';

const MAX_RANGE_DAYS = 366;

export function useSalesData(initialMetric = 'products', initialLevel = 'category') {
  const [metric, setMetric] = useState(initialMetric);
  const [level, setLevel] = useState(initialLevel);
  const [startDate, setStartDate] = useState(dayjs().subtract(13, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [bounds, setBounds] = useState({ min: null, max: dayjs().endOf('day') });
  const [boundsLoading, setBoundsLoading] = useState(true);
  const [dateNote, setDateNote] = useState(null);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setBoundsLoading(true);
        const json = await getSalesBounds();
        const min = json.min_date ? dayjs(json.min_date) : null;
        const max = dayjs(json.max_date || dayjs().endOf('day'));
        setBounds({ min, max });
        if (min) {
          let s = startDate;
          let e = endDate;
          if (s.isBefore(min)) s = min;
          if (e.isAfter(max)) e = max;
          if (s.isAfter(e)) e = s;
          setStartDate(s);
          setEndDate(e);
        } else {
          setDateNote('Aún no hay compras registradas.');
        }
      } catch (e) {
        setDateNote(`No se pudieron obtener los límites: ${e.message}`);
      } finally {
        setBoundsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ajustes de rango
  useEffect(() => {
    if (!bounds.min || !bounds.max) return;
    let s = startDate;
    let e = endDate;
    let msg = null;
    if (s.isBefore(bounds.min)) { s = bounds.min; msg = 'Inicio ajustado al primer día con compras.'; }
    if (e.isAfter(bounds.max)) { e = bounds.max; msg = 'Fin ajustado a hoy.'; }
    if (s.isAfter(e)) { e = s; msg = 'Fin ajustado para no ser menor al inicio.'; }
    if (e.diff(s, 'day') + 1 > MAX_RANGE_DAYS) {
      e = s.add(MAX_RANGE_DAYS - 1, 'day');
      if (e.isAfter(bounds.max)) e = bounds.max;
      msg = `Rango limitado a ${MAX_RANGE_DAYS} días.`;
    }
    if (!s.isSame(startDate)) setStartDate(s);
    if (!e.isSame(endDate)) setEndDate(e);
    setDateNote(msg);
  }, [startDate, endDate, bounds.min, bounds.max]);

  // Cargar datos
  useEffect(() => {
    const load = async () => {
      if (!startDate || !endDate || boundsLoading) return;
      if (!bounds.min) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getSalesData({
          startDate,
          endDate,
          metric,
          level,
        });
        setRows(data);
        const total = data.reduce((a, c) => a + (Number(c.value) || 0), 0);
        setSummary({ total, start: startDate.toDate(), end: endDate.toDate() });
      } catch (e) {
        setError(e.message);
        setRows([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [metric, level, startDate, endDate, boundsLoading, bounds.min]);

  return {
    metric, setMetric,
    level, setLevel,
    startDate, setStartDate,
    endDate, setEndDate,
    bounds,
    boundsLoading,
    dateNote,
    rows,
    summary,
    loading,
    error,
  };
}