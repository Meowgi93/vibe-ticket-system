import { useState, useEffect } from 'react';

export function useConcerts(id = null) {
  const [concerts, setConcerts] = useState([]);
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);
      try {
        const url = id ? `/api/concerts/${id}` : '/api/concerts';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (id) {
          setConcert(data);
        } else {
          setConcerts(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, [id]);

  return { concerts, concert, loading, error };
}
