// src/components/gestionMagasin/hooks/useBoutiques.js

import { useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import useUserStore from '../stores/userStore';
import useBoutiqueStore from '../../stores/boutiqueStore';
import useResilientFetch from '../hooks/useResilientFetch';

const API_URL = import.meta.env.VITE_API_URL;

const createFormData = ({
  name,
  category,
  coverImage,
  address,
  location,
  activerParticipation,
  participationPourcent,
  contributionLivraisonPourcent,
  activerHoraires,
  horaires,
  fermetureExceptionnelle,
}) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("category", category);

  if (address) {
    formData.append("address", address);
  }

  if (coverImage) {
    formData.append("coverImage", coverImage);
  }

  if (location) {
    formData.append("location", JSON.stringify(location));
  }

  if (activerParticipation !== undefined) {
    formData.append("activerParticipation", activerParticipation);
  }

  if (participationPourcent !== undefined) {
    formData.append("participationPourcent", participationPourcent);
  }

  if (contributionLivraisonPourcent !== undefined) {
    formData.append("contributionLivraisonPourcent", contributionLivraisonPourcent);
  }

  if (activerHoraires !== undefined) {
    formData.append("activerHoraires", activerHoraires);
  }

  if (horaires !== undefined) {
    formData.append("horaires", JSON.stringify(horaires));
  }

  if (fermetureExceptionnelle !== undefined) {
    formData.append("fermetureExceptionnelle", fermetureExceptionnelle);
  }

  return formData;
};

export default function useBoutiques() {
  const { token, userData, loadingUser } = useUserStore();
  const isAuthenticated = !!userData;
  const boutiqueStore = useBoutiqueStore();
  const { boutiques, loading, error, setBoutiques, setLoading, setError } = boutiqueStore;
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const getHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  // Utilitaire pour fetch avec gestion du signal d'annulation, loading, error
  const fetchWithSignal = async (url, errorMessage) => {
    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await axios.get(url, {
        headers: getHeaders(),
        signal: abortControllerRef.current.signal,
      });
      return res.data;
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error(err);
        setError(errorMessage);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBoutiques = useCallback(async () => {
    const data = await fetchWithSignal(`${API_URL}/boutiques`, 'Erreur lors du chargement des boutiques.');
    if (data) setBoutiques(data);
  }, [token]);

  const fetchMyBoutiques = useCallback(async () => {
    if (loadingUser || !isAuthenticated || !token) return;
    const url = `${API_URL}/boutiques/mine`;
    const data = await fetchWithSignal(url, 'Erreur lors du chargement de vos boutiques.');
    if (data) setBoutiques(data);
  }, [token, isAuthenticated, loadingUser]);

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

  const allBoutiques = useResilientFetch(`${API_URL}/boutiques`, 'cachedBoutiques');
  return {
    boutiques,
    loading: loading || loadingUser,
    error,
    fetchAllBoutiques,
    fetchMyBoutiques,
    createBoutique,
    updateBoutique,
    deleteBoutique,
    saveBoutique,
  };
}