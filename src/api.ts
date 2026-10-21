export type PopulationPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export type PopulationEstimate = {
  disasterType: string;
  location: string;
  affectedPopulation: number;
  affectedAreaKm2: number;
  geometry: PopulationPolygon;
};

export type PopulationEstimateRequest = {
  disaster_type: string;
  location: string;
  geometry: PopulationPolygon;
};

export type RequirementRequest = {
  disaster_type: string;
  location: string;
  affected_population: number;
};

export type GeneratedRequirement = {
  resource: string;
  quantity: number;
  unit: string;
  planning_basis: string;
};

type PopulationResponse = {
  affected_population: number;
  affected_area_km2: number;
};

type RequirementsResponse = {
  success: boolean;
  requirements: GeneratedRequirement[];
};

type LocalityResponse = {
  locality: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function postJson<T>(path: string, body: object, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const text = await response.text();
  let payload: unknown;

  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`Backend returned an invalid response (${response.status}).`);
  }

  if (!isRecord(payload)) {
    throw new Error("Backend returned an unexpected response.");
  }

  if (!response.ok || payload.error || payload.success === false) {
    const message = payload.detail ?? payload.error ?? payload.message;
    throw new Error(typeof message === "string" ? message : `Backend request failed (${response.status}).`);
  }

  return payload as T;
}

export async function detectLocality(latitude: number, longitude: number, signal?: AbortSignal): Promise<string> {
  const response = await postJson<LocalityResponse>("/location/reverse", { latitude, longitude }, signal);
  if (typeof response.locality !== "string" || !response.locality.trim()) {
    throw new Error("Backend did not return a valid locality.");
  }
  return response.locality;
}

export async function estimatePopulation(request: PopulationEstimateRequest): Promise<{
  affectedPopulation: number;
  affectedAreaKm2: number;
}> {
  const response = await postJson<PopulationResponse>("/population/estimate", request);
  if (
    typeof response.affected_population !== "number" ||
    !Number.isFinite(response.affected_population) ||
    typeof response.affected_area_km2 !== "number" ||
    !Number.isFinite(response.affected_area_km2)
  ) {
    throw new Error("Backend did not return a valid population estimate and affected area.");
  }
  return {
    affectedPopulation: response.affected_population,
    affectedAreaKm2: response.affected_area_km2,
  };
}

export async function generateRequirements(request: RequirementRequest): Promise<GeneratedRequirement[]> {
  const response = await postJson<RequirementsResponse>("/requirements/generate", request);
  if (!Array.isArray(response.requirements)) {
    throw new Error("Backend did not return resource requirements.");
  }
  return response.requirements;
}
