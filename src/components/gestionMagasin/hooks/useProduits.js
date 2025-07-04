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

  const getHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  // 🔒 Récupérer tous les produits de mes boutiques
  const fetchMyProduits = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/produits/mine`, {
        headers: getHeaders(),
      });

      if (res.data.success) {
        setProduits(res.data.produits);
      } else {
        setError(res.data.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur réseau lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  // 🌐 Récupérer les produits publics d’une boutique
  const fetchProduitsByBoutique = useCallback(async (boutiqueId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/produits/boutique/${boutiqueId}`);
      if (res.data.success) {
        setProduits(res.data.produits);
      } else {
        setError(res.data.error || 'Erreur chargement produits');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur réseau lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, []);

  // 📥 Créer un nouveau produit
  const createProduit = async (formData) => {
    const res = await axios.post(`${API_URL}/produits`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data.success) {
      setProduits((prev) => [...prev, res.data.produit]);
      return res.data.produit;
    } else {
      throw new Error(res.data.error || 'Erreur lors de la création');
    }
  };

  // ✏️ Modifier un produit
  const updateProduit = async (id, formData) => {
    const res = await axios.put(`${API_URL}/produits/${id}`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data.success) {
      setProduits((prev) =>
        prev.map((p) => (p._id === id ? res.data.produit : p))
      );
      return res.data.produit;
    } else {
      throw new Error(res.data.error || 'Erreur lors de la modification');
    }
  };

  // 🗑️ Supprimer un produit
  const deleteProduit = async (id) => {
    const res = await axios.delete(`${API_URL}/produits/${id}`, {
      headers: getHeaders(),
    });

    if (res.data.success) {
      setProduits((prev) => prev.filter((p) => p._id !== id));
    } else {
      throw new Error(res.data.error || 'Erreur lors de la suppression');
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