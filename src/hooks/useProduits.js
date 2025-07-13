// src/components/gestionMagasin/hooks/useProduits.js

import { useState, useCallback } from 'react';
import axios from 'axios';
import useUserStore from '../stores/userStore';

const API_URL = import.meta.env.VITE_API_URL;

export default function useProduits() {
  const { token, userData, loadingUser } = useUserStore();
  const isAuthenticated = !!userData;

  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const handleAxiosError = (err, defaultMsg) => {
    console.error(err);
    setError(err?.response?.data?.error || defaultMsg);
  };

  const fetchProduitsFrom = async (url, errorMsg) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(url, { headers });
      if (res.data.success) {
        setProduits(res.data.produits);
      } else {
        setError(res.data.error || errorMsg);
      }
    } catch (err) {
      handleAxiosError(err, errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProduits = useCallback(async () => {
    if (loadingUser || !isAuthenticated || !token) return;
    await fetchProduitsFrom(`${API_URL}/produits/mine`, 'Erreur lors du chargement');
  }, [token, isAuthenticated, loadingUser]);

  const fetchProduitsByBoutique = useCallback(async (boutiqueId) => {
    await fetchProduitsFrom(`${API_URL}/produits/boutique/${boutiqueId}`, 'Erreur chargement produits');
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
    loading: loading || loadingUser,
    error,
    fetchMyProduits,
    fetchProduitsByBoutique,
    createProduit,
    updateProduit,
    deleteProduit,
  };
}