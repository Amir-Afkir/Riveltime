// src/components/gestionMagasin/hooks/useBoutiques.js

import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';

const API_URL = import.meta.env.VITE_API_URL;

const createFormData = ({ name, category, coverImage, location }) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("category", category);
  if (coverImage) {
    formData.append("coverImage", coverImage);
  }
  if (location) {
    formData.append("location", JSON.stringify(location));
  }
  return formData;
};

export default function useBoutiques() {
  const { token, isAuthenticated } = useUser(); // ✅ utilisé ici
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const getHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const fetchAllBoutiques = useCallback(async () => {
    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await axios.get(`${API_URL}/boutiques`, {
        headers: getHeaders(),
        signal: abortControllerRef.current.signal,
      });
      setBoutiques(res.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error(err);
        setError('Erreur lors du chargement des boutiques.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMyBoutiques = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await axios.get(`${API_URL}/boutiques/mine`, {
        headers: getHeaders(),
        signal: abortControllerRef.current.signal,
      });
      setBoutiques(res.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error(err);
        setError('Erreur lors du chargement de vos boutiques.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  const createBoutique = async (boutiqueData) => {
    const formData = createFormData(boutiqueData);
    const res = await axios.post(`${API_URL}/boutiques`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    setBoutiques((prev) => [...prev, res.data.boutique]);
    return res.data.boutique;
  };

  const updateBoutique = async (id, boutiqueData) => {
    const formData = createFormData(boutiqueData);
    const res = await axios.put(`${API_URL}/boutiques/${id}`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    setBoutiques((prev) =>
      prev.map((b) => (b._id === id ? res.data.boutique : b))
    );
    return res.data.boutique;
  };

  const deleteBoutique = async (id) => {
    await axios.delete(`${API_URL}/boutiques/${id}`, {
      headers: getHeaders(),
    });
    setBoutiques((prev) => prev.filter((b) => b._id !== id));
  };

  const saveBoutique = async (boutiqueForm) => {
    return boutiqueForm._id
      ? await updateBoutique(boutiqueForm._id, boutiqueForm)
      : await createBoutique(boutiqueForm);
  };

  return {
    boutiques,
    loading,
    error,
    fetchAllBoutiques,
    fetchMyBoutiques,
    createBoutique,
    updateBoutique,
    deleteBoutique,
    saveBoutique,
  };
}