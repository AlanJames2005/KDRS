import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  detectLocality,
  estimatePopulation,
  generateRequirements,
  type GeneratedRequirement,
  type PopulationEstimate,
  type PopulationPolygon,
} from "./api";

type IconName =
  | "alert"
  | "arrow"
  | "bell"
  | "box"
  | "check"
  | "chevron"
  | "download"
  | "droplet"
  | "food"
  | "layers"
  | "locate"
  | "map"
  | "medical"
  | "minus"
  | "polygon"
  | "plus"
  | "reset"
  | "sanitation"
  | "search"
  | "shelter"
  | "spark"
  | "user"
  | "water";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></>,
    arrow: <><path d="M5 12h14m-5-5 5 5-5 5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    box: <><path d="M4 8h16v12H4zM2 4h20v4H2z" /><path d="M10 12h4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    download: <><path d="M12 3v12m-4-4 4 4 4-4M5 21h14" /></>,
    droplet: <path d="M12 3S6 10 6 15a6 6 0 0 0 12 0c0-5-6-12-6-12Z" />,
    food: <><path d="M4 3v7a3 3 0 0 0 3 3V3m0 10v8M17 3v18m0-18c3 3 3 7 0 10" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5m-18 4 9 5 9-5" /></>,
    locate: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /><path d="M12 2V0m0 24v-2M2 12H0m24 0h-2" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15m6-12v15" /></>,
    medical: <><path d="M8 4h8v16H8zM4 8h16v8H4z" /></>,
    minus: <path d="M5 12h14" />,
    polygon: <><path d="m5 5 14 2-3 13-12-4 1-11Z" /><circle cx="5" cy="5" r="1.5" /><circle cx="19" cy="7" r="1.5" /><circle cx="16" cy="20" r="1.5" /></>,
    plus: <path d="M12 5v14m-7-7h14" />,
    reset: <><path d="M4 9a8 8 0 1 1 1 8" /><path d="M4 4v5h5" /></>,
    sanitation: <><path d="M7 3v7m10-7v7M4 10h16l-1 11H5L4 10Z" /><path d="M9 15h6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    shelter: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M10 21v-6h4v6" /></>,
    spark: <path d="m12 2 1.4 5.6L19 9l-5.6 1.4L12 16l-1.4-5.6L5 9l5.6-1.4L12 2Zm7 13 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    water: <path d="M12 3S6 10 6 15a6 6 0 0 0 12 0c0-5-6-12-6-12Z" />,
  };
  return <svg aria-hidden="true" className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function AppHeader({ screen }: { screen: "population" | "resources" }) {
  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"><span>MIPR</span><i /></div>
          <div>
            <strong>Mission-Oriented Intelligent Procurement and Resource Management</strong>
            <small>Mission Planning &amp; Resource Intelligence</small>
          </div>
        </div>
        <div className="header-actions">
          <div className="operational"><span className="pulse-dot" />Operational</div>
          <div className="sync"><span>Last synchronized</span><strong>Just now</strong></div>
          <button className="icon-button notification" aria-label="Notifications"><Icon name="bell" /><span /></button>
          <button className="profile" aria-label="Open profile menu"><span className="avatar">AN</span><span className="profile-name">Anjali Nair<small>Duty Officer</small></span><Icon name="chevron" size={14} /></button>
        </div>
      </header>
      <div className="context-bar">
        <span>Emergency Operations</span><Icon name="chevron" size={13} /><strong>{screen === "population" ? "Population Estimation" : "Resource Requirements"}</strong>
        <span className="context-id">Mission ID · MIPRM-2025-0814</span>
      </div>
    </>
  );
}

function ProgressStepper({ active }: { active: 1 | 2 }) {
  return (
    <div className="stepper" aria-label={`Step ${active} of 3`}>
      {["Population", "Resources", "Vendors"].map((label, index) => {
        const step = index + 1;
        return (
          <div className={`step ${step === active ? "active" : ""} ${step < active ? "done" : ""}`} key={label}>
            <span>{step < active ? <Icon name="check" size={13} /> : `0${step}`}</span>
            <strong>{label}</strong>
            {index < 2 && <i />}
          </div>
        );
      })}
    </div>
  );
}

function PageIntro({ screen }: { screen: "population" | "resources" }) {
  const resources = screen === "resources";
  return (
    <section className="page-intro">
      <div>
        <div className="eyebrow"><span>{resources ? "STEP 02" : "STEP 01"}</span> / {resources ? "RESOURCE PLANNING" : "AREA ASSESSMENT"}</div>
        <h1>{resources ? "Emergency Resource Requirements" : "Estimate the Affected Population"}</h1>
        <p>{resources ? "Recommended resource quantities based on the estimated affected population and disaster context." : "Mark the affected area on the map to estimate population exposure and prepare essential emergency resources."}</p>
      </div>
      <ProgressStepper active={resources ? 2 : 1} />
    </section>
  );
}

function DisasterDetailsCard({ priority, setPriority, disasterType, setDisasterType, location, setLocation, localityStatus }: {
  priority: string;
  setPriority: (v: string) => void;
  disasterType: string;
  setDisasterType: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  localityStatus: "idle" | "loading" | "detected" | "manual" | "error";
}) {
  return (
    <section className="card details-card">
      <div className="card-title"><span className="title-icon"><Icon name="alert" /></span><div><h2>Disaster Details</h2><p>Define the current emergency context.</p></div></div>
      <label className="field">
        <span>Disaster Type</span>
        <select value={disasterType} onChange={(event) => setDisasterType(event.target.value)}><option value="" disabled>Select disaster type</option><option>Flood</option><option>Landslide</option><option>Cyclone</option><option>Earthquake</option><option>Other</option></select>
      </label>
      <label className="field">
        <span>Locality / Place</span>
        <div className="input-wrap"><Icon name="search" size={16} /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder={localityStatus === "loading" ? "Detecting locality…" : "e.g. Chalakudy, Thrissur"} aria-busy={localityStatus === "loading"} /></div>
      </label>
      <fieldset className="field priority-field">
        <legend>Assessment Priority</legend>
        <div className="segmented">
          {["Routine", "Urgent", "Critical"].map((item) => <button type="button" key={item} className={priority === item ? "selected" : ""} onClick={() => setPriority(item)}>{item}</button>)}
        </div>
      </fieldset>
    </section>
  );
}

function KeralaMap({ geometry, onSelect, notify }: {
  geometry: PopulationPolygon | null;
  onSelect: (geometry: PopulationPolygon | null) => void;
  notify: (message: string) => void;
}) {
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const boundary = useRef<L.GeoJSON | null>(null);
  const selection = useRef<L.GeoJSON | null>(null);
  const preview = useRef<L.LayerGroup | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);
  const drawingMode = useRef<"polygon" | "rectangle" | null>(null);
  const drawingPoints = useRef<L.LatLng[]>([]);
  const finishPolygon = useRef<() => void>(() => {});
  const onSelectRef = useRef(onSelect);
  const notifyRef = useRef(notify);
  const [drawMode, setDrawMode] = useState<"polygon" | "rectangle" | null>(null);
  const [stateBounds, setStateBounds] = useState<L.LatLngBounds | null>(null);
  const [alternateTiles, setAlternateTiles] = useState(false);
  const selected = geometry !== null;

  useEffect(() => {
    onSelectRef.current = onSelect;
    notifyRef.current = notify;
  }, [notify, onSelect]);

  useEffect(() => {
    if (!mapElement.current) return;

    const boundaryRequest = new AbortController();
    const mapInstance = L.map(mapElement.current, {
      zoomControl: false,
      doubleClickZoom: false,
      attributionControl: true,
    });
    map.current = mapInstance;
    preview.current = L.layerGroup().addTo(mapInstance);
    const tileAttribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · <a href="https://www.geoboundaries.org/">geoBoundaries / DataMeet, CC BY 2.5 IN</a>';
    tileLayer.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: tileAttribution,
      maxZoom: 19,
    }).addTo(mapInstance);

    void fetch("/kerala-boundary.geojson", { signal: boundaryRequest.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Boundary request failed (${response.status}).`);
        return response.json();
      })
      .then((data: GeoJSON.GeoJsonObject) => {
        if (boundaryRequest.signal.aborted || map.current !== mapInstance) return;
        const layer = L.geoJSON(data, {
          style: {
            color: "#386e64",
            weight: 2,
            opacity: 0.95,
            fillColor: "#78a998",
            fillOpacity: 0.12,
          },
        }).addTo(mapInstance);
        const bounds = layer.getBounds();
        if (!bounds.isValid()) throw new Error("Kerala boundary data is invalid.");
        boundary.current = layer;
        setStateBounds(bounds);
        mapInstance.fitBounds(bounds.pad(0.08));
        mapInstance.setMaxBounds(bounds.pad(0.15));
      })
      .catch((error: unknown) => {
        if (!boundaryRequest.signal.aborted && map.current === mapInstance) {
          notifyRef.current(error instanceof Error ? error.message : "Could not load Kerala boundary data.");
        }
      });

    const drawStyle = { color: "#087f78", weight: 3, fillColor: "#089488", fillOpacity: 0.3 };
    const previewDrawing = (points: L.LatLng[]) => {
      preview.current?.clearLayers();
      if (points.length >= 2) L.polyline(points, drawStyle).addTo(preview.current!);
      points.forEach((point) => L.circleMarker(point, { radius: 4, color: "#087f78", fillColor: "#fff", fillOpacity: 1 }).addTo(preview.current!));
    };
    const finishDrawing = (points: L.LatLng[]) => {
      if (points.length < 3) return;
      const ring = points.map((point) => [point.lng, point.lat]);
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first);
      drawingMode.current = null;
      drawingPoints.current = [];
      setDrawMode(null);
      preview.current?.clearLayers();
      onSelectRef.current({ type: "Polygon", coordinates: [ring] });
    };
    finishPolygon.current = () => finishDrawing(drawingPoints.current);

    const handleMapClick = (event: L.LeafletMouseEvent) => {
      const mode = drawingMode.current;
      if (!mode) return;
      if (mode === "rectangle") {
        drawingPoints.current.push(event.latlng);
        if (drawingPoints.current.length === 1) {
          previewDrawing(drawingPoints.current);
          return;
        }
        const [start, end] = drawingPoints.current;
        finishDrawing([
          start,
          L.latLng(start.lat, end.lng),
          end,
          L.latLng(end.lat, start.lng),
        ]);
        return;
      }
      const previous = drawingPoints.current[drawingPoints.current.length - 1];
      if (!previous || !previous.equals(event.latlng)) drawingPoints.current.push(event.latlng);
      previewDrawing(drawingPoints.current);
    };
    const handlePolygonFinish = (event: L.LeafletMouseEvent) => {
      if (drawingMode.current !== "polygon") return;
      const points = drawingPoints.current;
      const last = points[points.length - 1];
      if (!last || !last.equals(event.latlng)) points.push(event.latlng);
      finishDrawing(points);
    };
    mapInstance.on("click", handleMapClick);
    mapInstance.on("dblclick", handlePolygonFinish);

    const stopMapPropagation = (selector: string) => {
      const element = mapElement.current?.parentElement?.querySelector<HTMLElement>(selector);
      if (element) L.DomEvent.disableClickPropagation(element);
    };
    [".map-topbar", ".map-controls", ".draw-toolbar", ".map-instruction", ".map-legend"].forEach(stopMapPropagation);

    return () => {
      boundaryRequest.abort();
      map.current = null;
      finishPolygon.current = () => {};
      mapInstance.off();
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    selection.current?.remove();
    selection.current = geometry
      ? L.geoJSON(geometry as GeoJSON.GeoJsonObject, {
          style: { color: "#007b70", weight: 3, dashArray: "8 4", fillColor: "#089488", fillOpacity: 0.38 },
          pointToLayer: (_feature, latlng) => L.circleMarker(latlng, {
            radius: 4,
            color: "#087f78",
            weight: 2,
            fillColor: "#fff",
            fillOpacity: 1,
          }),
        }).addTo(map.current)
      : null;
  }, [geometry]);

  useEffect(() => {
    map.current?.getContainer().classList.toggle("is-drawing", drawMode !== null);
    if (!drawMode) {
      drawingMode.current = null;
      drawingPoints.current = [];
      preview.current?.clearLayers();
    }
  }, [drawMode]);

  const startDrawing = (mode: "polygon" | "rectangle") => {
    drawingMode.current = mode;
    drawingPoints.current = [];
    preview.current?.clearLayers();
    if (geometry) onSelect(null);
    setDrawMode(mode);
  };
  const clearSelection = () => {
    drawingMode.current = null;
    drawingPoints.current = [];
    preview.current?.clearLayers();
    setDrawMode(null);
    onSelect(null);
  };
  const toggleBaseLayer = () => {
    if (!map.current || !tileLayer.current) return;
    tileLayer.current.remove();
    const next = !alternateTiles;
    const tileAttribution = next
      ? '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · © <a href="https://carto.com/attributions">CARTO</a> · <a href="https://www.geoboundaries.org/">geoBoundaries / DataMeet, CC BY 2.5 IN</a>'
      : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · <a href="https://www.geoboundaries.org/">geoBoundaries / DataMeet, CC BY 2.5 IN</a>';
    tileLayer.current = L.tileLayer(
      next
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: tileAttribution, maxZoom: 19 },
    ).addTo(map.current);
    setAlternateTiles(next);
  };

  return (
    <section className="map-card" aria-label="Interactive Kerala assessment map">
      <div className="map-topbar">
        <div><span className="live-dot" /> GIS operational layer</div>
        <span>Kerala · 10.1632° N, 76.6413° E</span>
      </div>
      <div className="map-canvas" ref={mapElement} role="application" aria-label="Interactive geographic map of Kerala" />
      <div className="map-controls">
        <button aria-label="Zoom in" onClick={() => map.current?.zoomIn()}><Icon name="plus" /></button><button aria-label="Zoom out" onClick={() => map.current?.zoomOut()}><Icon name="minus" /></button><button aria-label="Locate" onClick={() => map.current?.setView([10.3073, 76.3365], 12)}><Icon name="locate" /></button><button aria-label="Reset view" onClick={() => stateBounds && map.current?.fitBounds(stateBounds.pad(0.08))}><Icon name="reset" /></button><button aria-label={alternateTiles ? "Switch to street map" : "Switch map layers"} onClick={toggleBaseLayer}><Icon name="layers" /></button>
      </div>
      <div className="draw-toolbar">
        <span>Select affected area</span>
        <button className={drawMode === "polygon" ? "active" : ""} aria-pressed={drawMode === "polygon"} onClick={() => drawMode === "polygon" ? finishPolygon.current() : startDrawing("polygon")}><Icon name="polygon" size={16} /> Polygon</button>
        <button className={drawMode === "rectangle" ? "active" : ""} aria-pressed={drawMode === "rectangle"} onClick={() => startDrawing("rectangle")}><span className="rectangle-icon" /> Rectangle</button>
        <button className="clear" onClick={clearSelection}>{selected ? "Clear" : "Select"}</button>
      </div>
      <div className="map-instruction">
        <div className="instruction-icon"><Icon name={selected ? "check" : "polygon"} /></div>
        <div><strong>{selected ? "Affected area selected" : drawMode ? `Drawing ${drawMode}` : "Mark the affected area"}</strong><p>{selected ? "Boundary ready for population analysis." : drawMode === "polygon" ? "Click to add boundary points; double-click or select Polygon again to finish." : drawMode === "rectangle" ? "Click the map to set the opposite rectangle corners." : "Draw a polygon or rectangle around the disaster-affected region."}</p>{!selected && !drawMode && <small>Tip: Follow the affected boundary for a more accurate estimate.</small>}</div>
      </div>
      <div className="map-legend"><span><i className="river-key" />Major river</span><span><i className="boundary-key" />Kerala boundary</span><span><i className="area-key" />Affected area</span></div>
    </section>
  );
}

function AreaStatus({ selected, areaKm2, boundaryPoints }: {
  selected: boolean;
  areaKm2: number | null;
  boundaryPoints: number;
}) {
  return (
    <section className={`area-status ${selected ? "selected" : ""}`}>
      <div className="area-status-main"><span><Icon name={selected ? "check" : "map"} /></span><div><strong>{selected ? "Affected area selected" : "No area selected"}</strong><small>{selected ? "Boundary captured successfully" : "Use the map tools to mark a boundary"}</small></div></div>
      {selected && <div className="area-metrics"><div><span>Selected area</span><strong>{areaKm2 === null ? "Pending" : `${areaKm2.toLocaleString("en-IN")} km²`}</strong></div><div><span>Boundary points</span><strong>{boundaryPoints}</strong></div><div><span>Status</span><strong className="ready">{areaKm2 === null ? "Ready" : "Measured"}</strong></div></div>}
    </section>
  );
}

function PopulationResult({ population, areaKm2, onNext }: {
  population: number;
  areaKm2: number;
  onNext: () => void;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let animationFrame = 0;
    const tick = (now: number) => {
      start ??= now;
      const progress = Math.min(Math.max((now - start) / 800, 0), 1);
      setCount(Math.round(population * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [population]);
  return (
    <section className="result-card">
      <div className="result-head"><div><span className="success-mark"><Icon name="check" /></span><div><p>ESTIMATED AFFECTED POPULATION</p><h2>{count.toLocaleString("en-IN")}</h2><span>People within the selected affected area</span></div></div><span className="confidence-pill">High confidence</span></div>
      <div className="result-metrics"><div><span>Area</span><strong>{areaKm2.toLocaleString("en-IN")} <small>km²</small></strong></div><div><span>Population Density</span><strong>{Math.round(population / areaKm2).toLocaleString("en-IN")} <small>people/km²</small></strong></div><div><span>Confidence</span><strong>High</strong></div></div>
      <div className="exposure"><div className="exposure-label"><span>Population exposure</span><strong>High concentration</strong></div><div className="exposure-track"><i /></div><div className="exposure-scale"><span>Low</span><span>Moderate</span><span>High</span></div></div>
      <div className="result-footer"><span><Icon name="check" size={15} /> Population estimate generated successfully</span><button className="primary-button" onClick={onNext}>Generate Resource Requirements <Icon name="arrow" /></button></div>
    </section>
  );
}

function representativeCoordinate(geometry: PopulationPolygon): [number, number] {
  const ring = geometry.coordinates[0];
  let areaTwice = 0;
  let centroidLongitude = 0;
  let centroidLatitude = 0;
  let minLatitude = Infinity;
  let maxLatitude = -Infinity;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [longitude, latitude] = ring[index];
    const [nextLongitude, nextLatitude] = ring[index + 1];
    const cross = longitude * nextLatitude - nextLongitude * latitude;
    areaTwice += cross;
    centroidLongitude += (longitude + nextLongitude) * cross;
    centroidLatitude += (latitude + nextLatitude) * cross;
    minLatitude = Math.min(minLatitude, latitude);
    maxLatitude = Math.max(maxLatitude, latitude);
  }

  const contains = (longitude: number, latitude: number) => {
    let inside = false;
    for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
      const [currentLongitude, currentLatitude] = ring[index];
      const [previousLongitude, previousLatitude] = ring[previous];
      if (
        (currentLatitude > latitude) !== (previousLatitude > latitude) &&
        longitude < ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) /
          (previousLatitude - currentLatitude) + currentLongitude
      ) inside = !inside;
    }
    return inside;
  };

  if (Math.abs(areaTwice) > Number.EPSILON) {
    const longitude = centroidLongitude / (3 * areaTwice);
    const latitude = centroidLatitude / (3 * areaTwice);
    if (contains(longitude, latitude)) return [latitude, longitude];
  }

  let bestPoint: [number, number] | null = null;
  let bestWidth = 0;
  for (let sample = 1; sample < 100; sample += 1) {
    const latitude = minLatitude + (maxLatitude - minLatitude) * sample / 100;
    const intersections: number[] = [];
    for (let index = 0; index < ring.length - 1; index += 1) {
      const [longitude, firstLatitude] = ring[index];
      const [nextLongitude, nextLatitude] = ring[index + 1];
      if ((firstLatitude > latitude) !== (nextLatitude > latitude)) {
        intersections.push(longitude + (nextLongitude - longitude) *
          (latitude - firstLatitude) / (nextLatitude - firstLatitude));
      }
    }
    intersections.sort((first, second) => first - second);
    for (let index = 0; index + 1 < intersections.length; index += 2) {
      const width = intersections[index + 1] - intersections[index];
      const longitude = (intersections[index] + intersections[index + 1]) / 2;
      if (width > bestWidth && contains(longitude, latitude)) {
        bestPoint = [latitude, longitude];
        bestWidth = width;
      }
    }
  }

  if (bestPoint) return bestPoint;
  const [longitude, latitude] = ring[0];
  return [latitude, longitude];
}

function PopulationScreen({ onBack, onNext, onEstimated, notify }: {
  onBack: () => void;
  onNext: () => void;
  onEstimated: (estimate: PopulationEstimate | null) => void;
  notify: (s: string) => void;
}) {
  const [priority, setPriority] = useState("Urgent");
  const [selected, setSelected] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "validation">("idle");
  const [disasterType, setDisasterType] = useState("");
  const [location, setLocation] = useState("");
  const [localityStatus, setLocalityStatus] = useState<"idle" | "loading" | "detected" | "manual" | "error">("idle");
  const [geometry, setGeometry] = useState<PopulationPolygon | null>(null);
  const [estimate, setEstimate] = useState<PopulationEstimate | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const localityRequest = useRef<AbortController | null>(null);
  const locationEdited = useRef(false);
  const notifyRef = useRef(notify);
  notifyRef.current = notify;
  useEffect(() => {
    localityRequest.current?.abort();
    if (!geometry) {
      setLocalityStatus("idle");
      return;
    }

    const controller = new AbortController();
    localityRequest.current = controller;
    locationEdited.current = false;
    setLocation("");
    setLocalityStatus("loading");
    const [latitude, longitude] = representativeCoordinate(geometry);
    void detectLocality(latitude, longitude, controller.signal)
      .then((locality) => {
        if (controller.signal.aborted || locationEdited.current) return;
        setLocation(locality);
        setLocalityStatus("detected");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLocalityStatus("error");
        notifyRef.current(error instanceof Error ? error.message : "Unable to detect the selected locality.");
      });

    return () => {
      controller.abort();
      if (localityRequest.current === controller) localityRequest.current = null;
    };
  }, [geometry]);
  const selectGeometry = (nextGeometry: PopulationPolygon | null) => {
    localityRequest.current?.abort();
    locationEdited.current = false;
    setGeometry(nextGeometry);
    setSelected(nextGeometry !== null);
    setLocation("");
    setLocalityStatus(nextGeometry ? "loading" : "idle");
    setEstimate(null);
    onEstimated(null);
    setValidationMessage("");
    setState("idle");
  };
  const updateDisasterType = (value: string) => {
    setDisasterType(value);
    setEstimate(null);
    onEstimated(null);
    setValidationMessage("");
    setState("idle");
  };
  const updateLocation = (value: string) => {
    locationEdited.current = true;
    localityRequest.current?.abort();
    setLocation(value);
    setLocalityStatus("manual");
    setEstimate(null);
    onEstimated(null);
    setValidationMessage("");
    setState("idle");
  };
  const calculate = async () => {
    const trimmedLocation = location.trim();
    if (!disasterType || !trimmedLocation) {
      const message = !disasterType && !trimmedLocation
        ? "Select a disaster type and enter a locality before calculating."
        : !disasterType
          ? "Select a disaster type before calculating."
          : "Enter a locality before calculating.";
      setValidationMessage(message);
      setState("validation");
      notify(message);
      return;
    }
    if (!geometry) {
      const message = "Select an affected area to continue.";
      setValidationMessage(message);
      setState("validation");
      notify(message);
      return;
    }
    setValidationMessage("");
    setState("loading");
    try {
      const result = await estimatePopulation({
        disaster_type: disasterType,
        location: trimmedLocation,
        geometry,
      });
      const populationEstimate = { ...result, disasterType, location: trimmedLocation, geometry };
      setEstimate(populationEstimate);
      onEstimated(populationEstimate);
      setState("success");
      notify("Population estimate generated successfully.");
    } catch (error) {
      setState("idle");
      notify(error instanceof Error ? error.message : "Unable to calculate the population estimate.");
    }
  };
  return (
    <><AppHeader screen="population" /><main><PageIntro screen="population" />
      <button className="back-button" onClick={onBack}>← Back to landing page</button>
      <div className="workspace">
        <aside className="control-column"><DisasterDetailsCard priority={priority} setPriority={setPriority} disasterType={disasterType} setDisasterType={updateDisasterType} location={location} setLocation={updateLocation} localityStatus={localityStatus} /><AreaStatus selected={selected} areaKm2={estimate?.affectedAreaKm2 ?? null} boundaryPoints={geometry ? geometry.coordinates[0].length - 1 : 0} />
          {state === "validation" && <div className="inline-error"><Icon name="alert" size={16} />{validationMessage}</div>}
          <button className={`calculation-button ${state}`} onClick={calculate} disabled={state === "loading" || state === "success"}>
            {state === "loading" ? <><span className="spinner" /> Calculating population…</> : state === "success" ? <>Population Estimated <Icon name="check" /></> : <>Calculate Affected Population <Icon name="arrow" /></>}
          </button>
          <p className="api-note"><Icon name="spark" size={14} /> Secure API-powered population intelligence</p>
        </aside>
        <div className="map-column"><KeralaMap geometry={geometry} onSelect={selectGeometry} notify={notify} /></div>
      </div>
      {state === "success" && estimate && <PopulationResult population={estimate.affectedPopulation} areaKm2={estimate.affectedAreaKm2} onNext={onNext} />}
    </main></>
  );
}

type DisplayRequirement = {
  category: string;
  icon: IconName;
  name: string;
  quantity: string;
  unit: string;
  basis: string;
};

function formatRequirements(requirements: GeneratedRequirement[]): DisplayRequirement[] {
  return requirements.map((requirement) => {
    const resource = requirement.resource.toLowerCase();
    const category = resource.includes("water") ? "Water"
      : resource.includes("food") ? "Food"
        : resource.includes("medical") ? "Medical"
          : "Shelter";
    const icon: IconName = category === "Water" ? "water"
      : category === "Food" ? "food"
        : category === "Medical" ? "medical"
          : "shelter";

    return {
      category,
      icon,
      name: requirement.resource,
      quantity: requirement.quantity.toLocaleString("en-IN"),
      unit: requirement.unit,
      basis: requirement.planning_basis,
    };
  });
}

function KeralaThumbnail({ geometry }: { geometry: PopulationPolygon }) {
  const [boundary, setBoundary] = useState<KeralaBoundaryGeometry | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/kerala-boundary.geojson", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Kerala boundary request failed (${response.status}).`);
        return response.json() as Promise<{ features: Array<{ geometry: KeralaBoundaryGeometry }> }>;
      })
      .then((data) => {
        const geometry = data.features[0]?.geometry;
        if (!geometry || (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon")) {
          throw new Error("Kerala boundary data is unavailable.");
        }
        setBoundary(geometry);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.error("Unable to display the Kerala boundary in mission details.", error);
      });
    return () => controller.abort();
  }, []);
  const boundaryPath = boundary ? keralaBoundaryPath(boundary) : "";
  const selectionPath = boundary ? keralaBoundaryPath(geometry, boundary) : "";
  return (
    <div className="kerala-thumb">
      <svg viewBox="0 0 110 150" role="img" aria-label="Selected zone on the Kerala map">
        {boundaryPath && (
          <>
            <defs><clipPath id="mission-kerala-clip"><path d={boundaryPath} /></clipPath></defs>
            <path d={boundaryPath} fill="#c9ddd5" stroke="#488378" strokeWidth="1.2" />
            {selectionPath && (
              <path d={selectionPath} fill="#0f9488" fillOpacity=".7" stroke="#087a71" strokeWidth="1" clipPath="url(#mission-kerala-clip)" />
            )}
          </>
        )}
      </svg>
      <span>Selected zone</span>
    </div>
  );
}

function MissionDetails({ estimate }: { estimate: PopulationEstimate }) {
  return <section className="card mission-card"><div className="mission-info"><div className="card-title"><span className="title-icon"><Icon name="map" /></span><div><h2>Mission Details</h2><p>Verified assessment summary</p></div><span className="verified"><Icon name="check" size={13} /> Verified</span></div>
    <div className="mission-grid"><div><span>Disaster</span><strong>{estimate.disasterType}</strong></div><div><span>Location</span><strong>{estimate.location}</strong></div><div><span>Affected Population</span><strong className="number">{estimate.affectedPopulation.toLocaleString("en-IN")}</strong></div><div><span>Affected Area</span><strong>{estimate.affectedAreaKm2.toLocaleString("en-IN")} km²</strong></div><div><span>Assessment Status</span><strong className="status-text"><i /> Verified</strong></div></div>
  </div><KeralaThumbnail geometry={estimate.geometry} /></section>;
}

function RequirementGenerator({ state, generate }: { state: string; generate: () => void }) {
  return <section className={`generator-card ${state === "loading" ? "is-loading" : ""}`}>
    <div className="generator-copy"><span className="generator-icon"><Icon name="spark" /></span><div><h2>Generate Resource Requirements</h2><p>Generate planning quantities for essential emergency supplies based on the affected population.</p><small><Icon name="check" size={13} /> Powered by emergency planning rules &amp; population estimates</small></div></div>
    {state === "loading" ? <div className="generation-progress">{["Analyzing population", "Applying planning ratios", "Generating requirements"].map((s, i) => <div key={s} className={i === 0 ? "complete" : i === 1 ? "active" : ""}><span>{i === 0 ? <Icon name="check" size={12} /> : i + 1}</span>{s}<i /></div>)}</div> : <button className="primary-button light" onClick={generate}>{state === "success" ? "Regenerate Requirements" : "Generate Requirements"} <Icon name="arrow" /></button>}
  </section>;
}

function ResourceResults({ filter, setFilter, notify, resources }: {
  filter: string;
  setFilter: (s: string) => void;
  notify: (s: string) => void;
  resources: DisplayRequirement[];
}) {
  const filtered = filter === "All" ? resources : resources.filter((r) => r.category === filter);
  return <section className="card resources-card">
    <div className="resources-header"><div><div className="eyebrow"><span>GENERATED PLAN</span> / CURRENT MISSION</div><h2>Recommended Resources</h2><p>Planning quantities generated for the current mission.</p></div><div className="resource-actions"><button className="secondary-button" onClick={() => notify("Resource plan export prepared.")}><Icon name="download" size={16} /> Export Plan</button><button className="icon-button" aria-label="More options">•••</button></div></div>
    <div className="filter-row" role="tablist" aria-label="Resource category filters">{["All","Water","Food","Shelter","Medical","Sanitation"].map((item)=><button role="tab" aria-selected={filter===item} onClick={()=>setFilter(item)} className={filter===item ? "active":""} key={item}>{item}</button>)}</div>
    <div className="resource-table">
      <div className="table-head"><span>Resource</span><span>Quantity</span><span>Unit</span><span>Planning Basis</span></div>
      {filtered.map((r) => <div className="table-row" key={r.name}><div className="resource-name"><span><Icon name={r.icon} /></span><div><strong>{r.name}</strong><small>{r.category}</small></div></div><strong className="quantity">{r.quantity}</strong><span className="unit">{r.unit}</span><span className="basis">{r.basis}</span></div>)}
    </div>
  </section>;
}

function ResourcesScreen({ onBack, notify, estimate }: {
  onBack: () => void;
  notify: (s: string) => void;
  estimate: PopulationEstimate | null;
}) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [filter, setFilter] = useState("All");
  const [resources, setResources] = useState<DisplayRequirement[]>([]);
  const generate = async () => {
    if (!estimate) {
      notify("Calculate the affected population before generating resources.");
      return;
    }
    setState("loading");
    try {
      const requirements = await generateRequirements({
        disaster_type: estimate.disasterType,
        location: estimate.location,
        affected_population: estimate.affectedPopulation,
      });
      setResources(formatRequirements(requirements));
      setState("success");
      notify("Resource plan generated.");
    } catch (error) {
      setState("idle");
      notify(error instanceof Error ? error.message : "Unable to generate resource requirements.");
    }
  };
  return <><AppHeader screen="resources" /><main><PageIntro screen="resources" />
    <button className="back-button" onClick={onBack}>← Back to population assessment</button>
    {estimate && <MissionDetails estimate={estimate} />}<RequirementGenerator state={state} generate={generate} />
    {state === "idle" && <div className="empty-state"><span><Icon name="box" /></span><h2>No resource plan generated yet</h2><p>Generate a plan to view recommended emergency supplies.</p></div>}
    {state === "loading" && <div className="loading-card"><div className="skeleton-title" /><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /><span>Generating emergency requirements…</span></div>}
    {state === "success" && <><ResourceResults filter={filter} setFilter={setFilter} notify={notify} resources={resources} />
      <section className="planning-note"><span><Icon name="alert" /></span><div><strong>Planning Note</strong><p>These quantities are preliminary planning estimates intended to support emergency-response preparation. Final allocations should be validated against field conditions, available stock, and operational guidance.</p></div></section>
      <section className="future-card"><div className="future-copy"><span className="coming">COMING NEXT</span><h2>Continue to Vendor Comparison</h2><p>Compare available suppliers, pricing, delivery capacity, and availability for the generated resource plan.</p><button disabled>Vendor Comparison <Icon name="arrow" /></button><small>This capability is being prepared for a future release.</small></div><div className="vendor-preview"><div><span>Vendor</span><span>Availability</span><span>Price</span><span>Delivery</span><span>Rating</span></div>{["Kerala Water Supply Co.","ReliefMart Logistics","Southern Medical"].map((v,i)=><div key={v}><strong>{v}</strong><span className="avail">In stock</span><strong>₹{[42,185,790][i]}</strong><span>{[2,4,1][i]} days</span><span>4.{9-i}</span></div>)}<i /></div></section>
    </>}
  </main></>;
}

type KeralaBoundaryGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

function geometryRings(geometry: KeralaBoundaryGeometry | PopulationPolygon): number[][][] {
  return geometry.type === "Polygon" ? geometry.coordinates : geometry.coordinates.flat();
}

function keralaBoundaryPath(
  geometry: KeralaBoundaryGeometry | PopulationPolygon,
  boundsGeometry: KeralaBoundaryGeometry | PopulationPolygon = geometry,
): string {
  const rings = geometryRings(geometry);
  const boundsPoints = geometryRings(boundsGeometry).flat();
  const project = ([longitude, latitude]: number[]) => {
    const radians = latitude * Math.PI / 180;
    return {
      x: longitude * Math.PI / 180,
      y: Math.log(Math.tan(Math.PI / 4 + radians / 2)),
    };
  };
  const projectedBounds = boundsPoints.map(project);
  const minX = Math.min(...projectedBounds.map(({ x }) => x));
  const maxX = Math.max(...projectedBounds.map(({ x }) => x));
  const minY = Math.min(...projectedBounds.map(({ y }) => y));
  const maxY = Math.max(...projectedBounds.map(({ y }) => y));
  const scale = Math.min(82 / (maxX - minX), 140 / (maxY - minY));
  const offsetX = (110 - (maxX - minX) * scale) / 2;
  const offsetY = (150 - (maxY - minY) * scale) / 2;

  return rings.map((ring) => ring.map((coordinate, index) => {
    const point = project(coordinate);
    const x = offsetX + (point.x - minX) * scale;
    const y = offsetY + (maxY - point.y) * scale;
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ") + " Z").join(" ");
}

function LandingMap({ compact = false }: { compact?: boolean }) {
  const [outline, setOutline] = useState("");
  const nodes = [[26.3,17.39],[36.71,29.89],[48.52,42.38],[54.2,54.85],[63.1,67.3],[64.8,79.73],[73.4,92.15],[73.94,104.55],[76.68,116.94],[79.6,129.32],[83.63,141.68]];
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/kerala-boundary.geojson", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Kerala boundary request failed (${response.status}).`);
        return response.json() as Promise<{ features: Array<{ geometry: KeralaBoundaryGeometry }> }>;
      })
      .then((data) => {
        const geometry = data.features[0]?.geometry;
        if (!geometry || (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon")) {
          throw new Error("Kerala boundary data is unavailable.");
        }
        setOutline(keralaBoundaryPath(geometry));
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.error("Unable to display the Kerala boundary on the landing map.", error);
      });
    return () => controller.abort();
  }, []);
  return (
    <div className={`landing-map ${compact ? "compact" : ""}`} aria-label="Animated operational map of Kerala">
      <div className="map-orbit orbit-one" /><div className="map-orbit orbit-two" />
      <svg viewBox="0 0 110 150" role="img">
        <defs>
          <filter id={`mapGlow${compact ? "c" : "f"}`}><feGaussianBlur stdDeviation="1.4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id={`mapFill${compact ? "c" : "f"}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#123944" /><stop offset="1" stopColor="#0b2935" /></linearGradient>
          <pattern id={`heroGrid${compact ? "c" : "f"}`} width="7" height="7" patternUnits="userSpaceOnUse"><path d="M7 0H0V7" fill="none" stroke="#69c9c1" strokeOpacity=".08" strokeWidth=".25" /></pattern>
          <clipPath id={`keralaClip${compact ? "c" : "f"}`}><path d={outline} /></clipPath>
        </defs>
        <g className="hero-map-shape" filter={`url(#mapGlow${compact ? "c" : "f"})`}>
          <path className="kerala-outline" d={outline} pathLength={1} fill={`url(#mapFill${compact ? "c" : "f"})`} />
          <rect x="0" y="0" width="110" height="150" fill={`url(#heroGrid${compact ? "c" : "f"})`} clipPath={`url(#keralaClip${compact ? "c" : "f"})`} />
          <g className="hero-nodes">{nodes.map(([x,y],i)=><g key={i} className={`node node-${i%4}`}><circle className="node-pulse" cx={x} cy={y} r="3.5" /><circle cx={x} cy={y} r="1.25" /></g>)}</g>
        </g>
      </svg>
      {!compact && <>
        <div className="map-data data-one"><span />IDUKKI · AREA SIGNAL</div>
        <div className="map-data data-two"><span />THRISSUR · ACTIVE</div>
        <div className="map-data data-three"><span />ALAPPUZHA · MONITORING</div>
        <div className="map-coordinate">10.8505° N / 76.2711° E</div>
      </>}
    </div>
  );
}

function LandingNav({ onLaunch }: { onLaunch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);
  return <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
    <button className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <span className="brand-mark"><span>MIPR</span><i /></span>
      <span>Mission-Oriented Intelligent<br />Procurement and Resource Management</span>
    </button>
    <div className="landing-links"><a href="#overview">Overview</a><a href="#how-it-works">How It Works</a><a href="#capabilities">Capabilities</a></div>
    <div className="landing-nav-actions"><span className="landing-operational"><i /> Operational</span><button onClick={onLaunch}>Launch Platform <Icon name="arrow" size={15} /></button></div>
  </nav>;
}

function ProductPreview() {
  return <div className="product-window reveal-scale">
    <div className="window-bar"><div><i /><i /><i /></div><span>Population Estimation · MIPRM</span><strong><i /> Operational</strong></div>
    <div className="preview-shell">
      <div className="preview-sidebar">
        <div className="preview-title"><span><Icon name="alert" size={13} /></span><div><strong>Disaster Details</strong><small>Current assessment context</small></div></div>
        <label><span>DISASTER TYPE</span><strong>Flood <b>⌄</b></strong></label>
        <label><span>LOCALITY / PLACE</span><strong>Chalakudy, Thrissur</strong></label>
        <div className="preview-status"><Icon name="check" size={13} /><div><strong>Affected area selected</strong><small>24.8 km² · 18 boundary points</small></div></div>
        <div className="preview-result"><span>ESTIMATED POPULATION</span><strong className="preview-count">18,742</strong><small>people within affected area</small></div>
        <button>Generate Resource Requirements <Icon name="arrow" size={13} /></button>
      </div>
      <div className="preview-map">
        <div className="preview-map-label"><i /> GIS OPERATIONAL LAYER</div>
        <LandingMap compact />
        <div className="preview-polygon"><i /><i /><i /><i /><i /></div>
        <div className="preview-map-tools"><span>+</span><span>−</span><span>⌖</span></div>
        <div className="preview-map-card"><Icon name="check" size={13} /><div><strong>Affected area selected</strong><small>Ready for population analysis</small></div></div>
      </div>
    </div>
  </div>;
}

function LandingPage({ onLaunch }: { onLaunch: () => void }) {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in-view")), { threshold: .14 });
    document.querySelectorAll(".reveal,.reveal-scale").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const scrollToHow = () => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  const journey = [
    ["01","Identify","Mark the affected area","Draw the disaster-affected region directly on the Kerala map.","map"],
    ["02","Estimate","Understand the impact","Estimate the population affected within the selected region.","user"],
    ["03","Prepare","Calculate essential resources","Generate needs for water, food, shelter, medical supplies, and sanitation.","box"],
    ["04","Respond","Move toward action","Use the plan to support procurement and emergency coordination.","arrow"],
  ] as const;
  const features = [
    ["polygon","Area-Based Population Estimation","Select an affected region directly on the map and estimate population exposure."],
    ["spark","Intelligent Resource Planning","Convert population estimates into preliminary emergency resource requirements."],
    ["map","Map-Centric Operations","Keep geographic context at the center of disaster assessment."],
    ["layers","Scalable Response Workflow","Designed to extend toward vendors, procurement, and wider coordination."],
  ] as const;
  return <div className="landing">
    <LandingNav onLaunch={onLaunch} />
    <section className="landing-hero" id="overview">
      <div className="hero-grid" /><div className="hero-contours" />
      <div className="hero-copy">
        <div className="hero-badge"><i /> EMERGENCY RESPONSE INTELLIGENCE</div>
        <h1>Turning Disaster Data<br />Into <em>Faster Response.</em></h1>
        <p>Mission-Oriented Intelligent Procurement and Resource Management helps emergency teams transform affected-area data into actionable population estimates and essential resource requirements—enabling faster, more informed disaster response.</p>
        <div className="hero-actions"><button className="hero-primary" onClick={onLaunch}><span>Start Response Planning</span><Icon name="arrow" /></button><button className="hero-secondary" onClick={scrollToHow}>Explore How It Works <span>↓</span></button></div>
        <div className="hero-trust"><span><Icon name="check" size={13} /> Map-led assessment</span><span><Icon name="check" size={13} /> Explainable planning</span><span><Icon name="check" size={13} /> Human-centered response</span></div>
      </div>
      <div className="hero-visual"><LandingMap /><span className="visual-label">OPERATIONAL INTELLIGENCE LAYER</span></div>
      <div className="scroll-cue"><span>SCROLL TO EXPLORE</span><i /></div>
    </section>

    <div className="capability-strip">
      <div className="strip-label">PLATFORM<br />CAPABILITIES</div>
      <div><Icon name="map" /><span><strong>KERALA</strong><small>Area of operation</small></span></div>
      <div><span className="strip-number">14</span><span><strong>Districts</strong><small>Geographic coverage</small></span></div>
      <div><Icon name="polygon" /><span><strong>Area Assessment</strong><small>Geospatial workflow</small></span></div>
      <div><Icon name="user" /><span><strong>Population Estimation</strong><small>Impact intelligence</small></span></div>
      <div><Icon name="box" /><span><strong>Resource Planning</strong><small>Preparedness support</small></span></div>
    </div>

    <main className="landing-main">
      <section className="journey-section" id="how-it-works">
        <div className="section-kicker reveal">A CLEAR OPERATIONAL PATH</div>
        <div className="section-heading reveal"><h2>From Affected Area to<br />Actionable Plan</h2><p>Emergency response begins with understanding the scale of impact. Our platform simplifies that process into a clear operational workflow.</p></div>
        <div className="journey-grid">
          {journey.map(([number,label,title,copy,icon],i)=><article className="journey-step reveal" key={number}><div className="journey-number">{number}</div><div className="journey-icon"><Icon name={icon as IconName} /></div><span>{label}</span><h3>{title}</h3><p>{copy}</p>{i<3 && <div className="journey-arrow"><Icon name="arrow" /></div>}</article>)}
        </div>
      </section>

      <section className="product-section">
        <div className="product-section-copy reveal"><div className="section-kicker">THE MAP IS THE INTERFACE</div><h2>Built Around the Map</h2><p>Start with geography. End with an actionable resource plan. Every decision remains connected to the affected place and people.</p></div>
        <ProductPreview />
        <div className="preview-note reveal"><span><i /> ILLUSTRATIVE MISSION PREVIEW</span><p>From marked boundary to population estimate in one connected workspace.</p></div>
      </section>

      <section className="features-section" id="capabilities">
        <div className="section-heading centered reveal"><div className="section-kicker">PURPOSE-BUILT CAPABILITIES</div><h2>Designed for Emergency Decisions</h2><p>Focused tools that help teams move from uncertainty to a shared operational plan.</p></div>
        <div className="features-grid">{features.map(([icon,title,copy],i)=><article className="feature-card reveal" key={title}><span className="feature-index">0{i+1}</span><div className="feature-icon"><Icon name={icon as IconName} /></div><h3>{title}</h3><p>{copy}</p><i className="feature-line" /></article>)}</div>
      </section>

      <section className="pipeline-section">
        <div className="pipeline-bg" />
        <div className="section-heading centered light reveal"><div className="section-kicker">OPERATIONAL LOGIC</div><h2>From Data to Decision</h2><p>A transparent chain from geographic assessment to preliminary response planning.</p></div>
        <div className="pipeline reveal">
          <div className="pipeline-node"><span><Icon name="polygon" /></span><small>AREA</small><strong>24.8 km²</strong><p>Selected impact zone</p></div>
          <div className="pipeline-link"><i /><Icon name="arrow" /></div>
          <div className="pipeline-node"><span><Icon name="user" /></span><small>POPULATION</small><strong>18,742</strong><p>Affected people</p></div>
          <div className="pipeline-link"><i /><Icon name="arrow" /></div>
          <div className="pipeline-node"><span><Icon name="droplet" /></span><small>RESOURCES</small><strong>56,226 L</strong><p>Water per day</p></div>
          <div className="pipeline-link"><i /><Icon name="arrow" /></div>
          <div className="pipeline-node action"><span><Icon name="check" /></span><small>ACTION</small><strong>Resource Plan</strong><p>Ready for validation</p></div>
        </div>
        <p className="illustrative-note">Illustrative mission data shown for product demonstration.</p>
      </section>

      <section className="human-section">
        <div className="human-contours" /><div className="human-mark reveal"><span>“</span></div>
        <blockquote className="reveal">When every decision matters,<br /><em>clarity becomes critical.</em></blockquote>
        <p className="reveal">Disaster management teams need reliable information at the right time. This platform is designed to reduce complexity and help teams move from assessment to planning faster.</p>
      </section>

      <section className="roadmap-section">
        <div className="roadmap-copy reveal"><div className="section-kicker">FUTURE-READY PLATFORM</div><h2>Built to Grow<br />With the Response</h2><p>A focused foundation today, with a responsible path toward connected procurement and response coordination.</p></div>
        <div className="roadmap reveal">
          {[["Population Assessment","Current"],["Resource Planning","Current"],["Vendor Comparison","Coming Next"],["Procurement Intelligence","Future"],["Real-Time Response Coordination","Future"]].map(([title,status],i)=><div className={`roadmap-item ${status==="Current" ? "current" : ""}`} key={title}><span>{status==="Current" ? <Icon name="check" size={14} /> : i+1}</span><div><strong>{title}</strong><small>{status}</small></div></div>)}
        </div>
      </section>

      <section className="final-cta">
        <div className="final-rings" /><div className="reveal"><div className="section-kicker">BEGIN THE ASSESSMENT</div><h2>Ready to Plan the Response?</h2><p>Start by identifying the affected area.</p><button className="hero-primary" onClick={onLaunch}><span>Start Response Planning</span><Icon name="arrow" /></button><small>Population <i /> Resources <i /> Response</small></div>
      </section>
    </main>
    <footer className="landing-footer">
      <div className="footer-top"><div className="footer-brand"><span className="brand-mark"><span>MIPR</span><i /></span><div><strong>Mission-Oriented Intelligent Procurement and Resource Management</strong><small>Mission Planning &amp; Resource Intelligence</small></div></div><div className="footer-links"><a href="#overview">About</a><a href="#how-it-works">How It Works</a><a href="#capabilities">Platform</a><a href="mailto:response@kerala.gov.in">Contact</a></div></div>
      <div className="footer-bottom"><span>Designed for emergency planning and decision support. Kerala boundary: geoBoundaries / DataMeet, CC BY 2.5 IN.</span><span className="footer-status">Operational <i /></span></div>
    </footer>
  </div>;
}

function Toast({ message }: { message: string }) {
  return <div className="toast" role="status"><span><Icon name={message.includes("Select") ? "alert" : "check"} /></span><div><strong>{message.includes("Select") ? "Action needed" : "Update complete"}</strong><p>{message}</p></div></div>;
}

export default function App() {
  const [screen, setScreen] = useState<"landing" | "population" | "resources">("landing");
  const [estimate, setEstimate] = useState<PopulationEstimate | null>(null);
  const [toast, setToast] = useState("");
  const notify = (message: string) => { setToast(message); setTimeout(() => setToast(""), 3000); };
  const go = (next: "landing" | "population" | "resources") => { setScreen(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <div className="app-shell">{screen === "landing" ? <LandingPage onLaunch={() => go("population")} /> : screen === "population" ? <PopulationScreen onBack={() => { setEstimate(null); go("landing"); }} onNext={() => go("resources")} onEstimated={setEstimate} notify={notify} /> : <ResourcesScreen onBack={() => go("population")} estimate={estimate} notify={notify} />}{toast && <Toast message={toast} />}</div>;
}
