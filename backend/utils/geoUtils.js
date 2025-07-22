// utils/geoUtils.js
import haversine from 'haversine-distance';

export function isPointOnSegment(p, a, b, toleranceKm = 0.5) {
  const distAB = haversine(a, b) / 1000;
  const distAP = haversine(a, p) / 1000;
  const distPB = haversine(p, b) / 1000;
  const diff = Math.abs(distAB - (distAP + distPB));
  if (diff > toleranceKm) return false;
  return distAP <= distAB + toleranceKm;
}

export function isDirectionConsistent(boutique, client, depart, arrivee, angleToleranceDeg = 45) {
  const toRad = deg => (deg * Math.PI) / 180;
  const toDeg = rad => (rad * 180) / Math.PI;

  function vector(a, b) {
    return { x: b.longitude - a.longitude, y: b.latitude - a.latitude };
  }

  function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  const v1 = vector(depart, arrivee);
  const v2 = vector(boutique, client);

  const dot = dotProduct(v1, v2);
  const mag1 = magnitude(v1);
  const mag2 = magnitude(v2);

  if (mag1 === 0 || mag2 === 0) return false;

  const cosAngle = dot / (mag1 * mag2);
  const angle = toDeg(Math.acos(Math.min(Math.max(cosAngle, -1), 1)));

  return angle <= angleToleranceDeg;
}