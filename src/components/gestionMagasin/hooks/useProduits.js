// src/components/gestionMagasin/hooks/useProduits.js

import { useState, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../../../context/UserContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function useProduits() {
  const { token, isAuthenticated } = useUser();

  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const handleAxiosError = (err, defaultMsg) => {
    console.error(err);
    setError(err?.response?.data?.error || defaultMsg);
  };

  const fetchMyProduits = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/produits/mine`, { headers });
      setProduits(res.data.success ? res.data.produits : []);
      if (!res.data.success) setError(res.data.error || 'Erreur lors du chargement');
    } catch (err) {
      handleAxiosError(err, 'Erreur réseau lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  const fetchProduitsByBoutique = useCallback(async (boutiqueId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/produits/boutique/${boutiqueId}`);
      setProduits(res.data.success ? res.data.produits : []);
      if (!res.data.success) setError(res.data.error || 'Erreur chargement produits');
    } catch (err) {
      handleAxiosError(err, 'Erreur réseau lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduit = async (formData) => {
    try {
      const res = await axios.post(`${API_URL}/produits`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setProduits((prev) => [...prev, res.data.produit]);
        return res.data.produit;
      } else {
        throw new Error(res.data.error);
      }
    } catch (err) {
      handleAxiosError(err, 'Erreur lors de la création');
      throw err;
    }
  };

  const updateProduit = async (id, formData) => {
    try {
      const res = await axios.put(`${API_URL}/produits/${id}`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setProduits((prev) =>
          prev.map((p) => (p._id === id ? res.data.produit : p))
        );
        return res.data.produit;
      } else {
        throw new Error(res.data.error);
      }
    } catch (err) {
      handleAxiosError(err, 'Erreur lors de la modification');
      throw err;
    }
  };

  const deleteProduit = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/produits/${id}`, { headers });
      if (res.data.success) {
        setProduits((prev) => prev.filter((p) => p._id !== id));
      } else {
        throw new Error(res.data.error);
      }
    } catch (err) {
      handleAxiosError(err, 'Erreur lors de la suppression');
      throw err;
    }
  };

  return {
    produits,
    loading,
    error,
    fetchMyProduits,
    fetchProduitsByBoutique,
    createProduit,
    updateProduit,
    deleteProduit,
  };
}