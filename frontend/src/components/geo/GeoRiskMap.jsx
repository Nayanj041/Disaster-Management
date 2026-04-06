import { useEffect, useMemo, useState } from "react";

const INDIA_BOUNDS = {
  minLat: 6,
  maxLat: 38,
  minLng: 68,
  maxLng: 97,
};

const DISTRICT_GEOJSON_URLS = [
  import.meta.env.VITE_DISTRICT_GEOJSON_URL,
  "https://raw.githubusercontent.com/datameet/maps/main/website/docs/data/geojson/dists11.geojson",
  "https://raw.githubusercontent.com/datameet/maps/main/website/data/geojson/dists11.geojson",
].filter(Boolean);

const toPercent = (lat, lng) => {
  const x = ((lng - INDIA_BOUNDS.minLng) / (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng)) * 100;
  const y = (1 - (lat - INDIA_BOUNDS.minLat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) * 100;
  return {
    left: `${Math.min(99, Math.max(1, x))}%`,
    top: `${Math.min(99, Math.max(1, y))}%`,
  };
};

const bandColor = (band, active) => {
  if (band === "critical") {
    return active ? "fill-red-600 stroke-red-950" : "fill-red-500/70 stroke-red-700";
  }
  if (band === "high") {
    return active ? "fill-orange-500 stroke-orange-950" : "fill-orange-400/70 stroke-orange-700";
  }
  if (band === "moderate") {
    return active ? "fill-amber-500 stroke-amber-950" : "fill-amber-400/75 stroke-amber-700";
  }
  return active ? "fill-emerald-600 stroke-emerald-950" : "fill-emerald-500/70 stroke-emerald-700";
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const geometryToPathList = (geometry) => {
  if (!geometry) return [];

  const polygonToPath = (polygon) =>
    polygon
      .map((ring) => {
        if (!Array.isArray(ring) || ring.length === 0) return "";
        const commands = ring
          .map(([lng, lat], index) => {
            const point = toPercent(lat, lng);
            const prefix = index === 0 ? "M" : "L";
            return `${prefix}${point.left.replace("%", "")},${point.top.replace("%", "")}`;
          })
          .join(" ");
        return `${commands} Z`;
      })
      .filter(Boolean)
      .join(" ");

  if (geometry.type === "Polygon") {
    return [polygonToPath(geometry.coordinates)];
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((polygon) => polygonToPath(polygon)).filter(Boolean);
  }

  return [];
};

const pathBounds = (geometry) => {
  const coords = [];
  const pushCoords = (points) => {
    for (const point of points) {
      if (Array.isArray(point[0])) {
        pushCoords(point);
      } else if (Number.isFinite(point[0]) && Number.isFinite(point[1])) {
        coords.push(point);
      }
    }
  };

  if (geometry?.type === "Polygon") {
    pushCoords(geometry.coordinates);
  } else if (geometry?.type === "MultiPolygon") {
    pushCoords(geometry.coordinates);
  }

  if (!coords.length) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  return { minLng, minLat, maxLng, maxLat };
};

const joinBounds = (boundsList) => {
  if (!boundsList.length) return null;

  return boundsList.reduce(
    (acc, bounds) => ({
      minLng: Math.min(acc.minLng, bounds.minLng),
      minLat: Math.min(acc.minLat, bounds.minLat),
      maxLng: Math.max(acc.maxLng, bounds.maxLng),
      maxLat: Math.max(acc.maxLat, bounds.maxLat),
    }),
    { ...boundsList[0] }
  );
};

const dotClassByBand = (band) => {
  if (band === "critical") return "bg-red-600";
  if (band === "high") return "bg-orange-500";
  if (band === "moderate") return "bg-amber-500";
  return "bg-emerald-500";
};

const GeoRiskMap = ({ zones = [], selectedRegion, onSelectRegion }) => {
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const [districtGeoJson, setDistrictGeoJson] = useState(null);
  const [geoError, setGeoError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDistrictGeoJson = async () => {
      for (const source of DISTRICT_GEOJSON_URLS) {
        try {
          const response = await fetch(source);
          if (!response.ok) continue;
          const data = await response.json();
          if (!cancelled && Array.isArray(data?.features)) {
            setDistrictGeoJson(data);
            setGeoError("");
            return;
          }
        } catch (_error) {
          // Try the next source.
        }
      }

      if (!cancelled) {
        setDistrictGeoJson(null);
        setGeoError("District GeoJSON unavailable; showing marker fallback.");
      }
    };

    loadDistrictGeoJson();

    return () => {
      cancelled = true;
    };
  }, []);

  const districtFeatures = useMemo(() => districtGeoJson?.features || [], [districtGeoJson]);

  const districtFeaturesByRegion = useMemo(() => {
    const grouped = new Map();

    for (const feature of districtFeatures) {
      const districtName = normalizeText(feature?.properties?.DISTRICT);
      const stateName = normalizeText(feature?.properties?.ST_NM);

      if (!grouped.has(districtName)) grouped.set(districtName, []);
      grouped.get(districtName).push(feature);

      if (!grouped.has(stateName)) grouped.set(stateName, []);
      grouped.get(stateName).push(feature);
    }

    return grouped;
  }, [districtFeatures]);

  const renderableZoneMap = useMemo(() => {
    const map = new Map();

    for (const zone of zones) {
      const key = normalizeText(zone.region);
      const matches = districtFeaturesByRegion.get(key) || [];
      map.set(key, matches);
    }

    return map;
  }, [districtFeaturesByRegion, zones]);

  const allDistrictBounds = useMemo(
    () => districtFeatures.map((feature) => pathBounds(feature?.geometry)).filter(Boolean),
    [districtFeatures]
  );

  const mapBounds = useMemo(() => joinBounds(allDistrictBounds), [allDistrictBounds]);

  const mapBackground = useMemo(() => {
    if (!mapboxToken) return null;
    const centerLng = 78.5;
    const centerLat = 22.5;
    const zoom = 3.4;
    return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${centerLng},${centerLat},${zoom},0/1200x650?access_token=${mapboxToken}`;
  }, [mapboxToken]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Interactive Risk Map</h3>
        {!mapboxToken && (
          <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
            Add VITE_MAPBOX_TOKEN for Mapbox base layer
          </span>
        )}
      </div>

      {geoError && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {geoError}
        </div>
      )}

      <div className="relative h-[360px] overflow-hidden rounded-lg border border-gray-200">
        {mapBackground ? (
          <img src={mapBackground} alt="Mapbox India map" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-sky-100 via-blue-50 to-emerald-100" />
        )}

        {districtFeatures.length > 0 && mapBounds && (
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label="District choropleth risk map"
          >
            <defs>
              <filter id="district-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.12" />
              </filter>
            </defs>

            {districtFeatures.map((feature, index) => {
              const paths = geometryToPathList(feature?.geometry);
              if (!paths.length) return null;

              return paths.map((d, pathIndex) => (
                <path
                  key={`district-base-${index}-${pathIndex}`}
                  d={d}
                  fill="rgba(255,255,255,0.1)"
                  stroke="rgba(15,23,42,0.25)"
                  strokeWidth="0.18"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#district-shadow)"
                />
              ));
            })}

            {zones.map((zone) => {
              const key = normalizeText(zone.region);
              const matches = renderableZoneMap.get(key) || [];
              if (!matches.length) return null;

              const isSelected = normalizeText(selectedRegion) === key;
              return matches.flatMap((feature, featureIndex) => {
                const paths = geometryToPathList(feature?.geometry);
                return paths.map((d, pathIndex) => (
                  <path
                    key={`zone-${key}-${featureIndex}-${pathIndex}`}
                    d={d}
                    className={`cursor-pointer stroke-[0.35] transition-opacity hover:opacity-95 ${bandColor(zone.riskBand, isSelected)}`}
                    fillRule="evenodd"
                    vectorEffect="non-scaling-stroke"
                    onClick={() => onSelectRegion(zone.region)}
                  >
                    <title>{`${zone.region}: risk ${zone.averageRisk}, preparedness ${zone.preparednessScore}`}</title>
                  </path>
                ));
              });
            })}
          </svg>
        )}

        <div className="absolute inset-0">
          {zones
            .filter((zone) => !(renderableZoneMap.get(normalizeText(zone.region)) || []).length)
            .map((zone) => {
            const lat = Number(zone?.coordinates?.latitude);
            const lng = Number(zone?.coordinates?.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

            const pos = toPercent(lat, lng);
            const isSelected = selectedRegion === zone.region;
            return (
              <button
                key={`marker-${zone.region}`}
                type="button"
                onClick={() => onSelectRegion(zone.region)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 ${
                  isSelected ? "scale-110 ring-2 ring-gray-900" : ""
                } ${dotClassByBand(zone.riskBand)} h-4 w-4`}
                style={{ left: pos.left, top: pos.top }}
                title={`${zone.region}: ${zone.averageRisk}`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span className="font-medium text-gray-700">Choropleth Legend:</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500" />Critical</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" />High</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Moderate</span>
        <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Low</span>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Click any district polygon to open risk drilldown and recommendations.
      </p>
    </div>
  );
};

export default GeoRiskMap;
