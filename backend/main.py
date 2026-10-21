import json
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rasterio.warp import transform_geom
from requests.exceptions import RequestException
from shapely.geometry import Point, shape
from typing import Any, Dict

from .services.geocoding_service import reverse_geocode_locality
from .services.requirement_service import generate_requirements

from .services.populationservices import calculate_affected_population


app = FastAPI(
    title="Disaster Population Estimation API"
)

KERALA_BOUNDARY_FILE = (
    Path(__file__).resolve().parents[1]
    / "public"
    / "kerala-boundary.geojson"
)


@lru_cache(maxsize=1)
def load_kerala_boundary():
    with KERALA_BOUNDARY_FILE.open(encoding="utf-8") as boundary_file:
        boundary_data = json.load(boundary_file)

    return shape(boundary_data["features"][0]["geometry"])


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request model
# --------------------------------------------------

class PopulationRequest(BaseModel):
    disaster_type: str
    location: str = ""
    geometry: Dict[str, Any]


class ReverseGeocodeRequest(BaseModel):
    latitude: float
    longitude: float


# --------------------------------------------------
# Home route
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Disaster Population Estimation API is running"
    }


@app.post("/location/reverse")
def detect_locality(request: ReverseGeocodeRequest):
    if not -90 <= request.latitude <= 90 or not -180 <= request.longitude <= 180:
        raise HTTPException(status_code=422, detail="The selected coordinates are invalid.")
    point = Point(request.longitude, request.latitude)
    if not load_kerala_boundary().covers(point):
        raise HTTPException(status_code=422, detail="The selected point must be inside Kerala.")

    try:
        locality = reverse_geocode_locality(request.latitude, request.longitude)
    except RequestException as error:
        raise HTTPException(
            status_code=502,
            detail="Locality lookup is temporarily unavailable. Enter the locality manually."
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=502,
            detail="Locality lookup returned an invalid response. Enter the locality manually."
        ) from error

    if not locality:
        raise HTTPException(
            status_code=404,
            detail="No locality was found for the selected area. Enter it manually."
        )
    return {"locality": locality}


# --------------------------------------------------
# Population estimation
# --------------------------------------------------

@app.post("/population/estimate")
def estimate_population(request: PopulationRequest):

    # Check geometry type
    if request.geometry.get("type") != "Polygon":
        return {
            "error": "Only Polygon geometry is supported"
        }

    # Check coordinates
    coordinates = request.geometry.get("coordinates")

    if not coordinates:
        return {
            "error": "Polygon coordinates are missing"
        }

    try:

        # Validate the drawn boundary against Kerala's administrative outline.
        polygon = shape(request.geometry)
        if not polygon.is_valid or polygon.area <= 0:
            return {
                "error": "The affected area must be a valid polygon with a non-zero area"
            }

        clipped_polygon = polygon.intersection(load_kerala_boundary())
        if clipped_polygon.is_empty or clipped_polygon.area <= 0:
            return {
                "error": "The selected area does not overlap Kerala"
            }

        disaster_geometry = clipped_polygon.__geo_interface__

        # Sum the raster pixels inside the clipped affected area.
        affected_population = calculate_affected_population(
            disaster_geometry
        )
        equal_area_geometry = transform_geom(
            "EPSG:4326",
            "EPSG:6933",
            disaster_geometry
        )
        affected_area_km2 = shape(equal_area_geometry).area / 1_000_000

        return {
            "disaster_type": request.disaster_type,
            "location": request.location,
            "affected_population": affected_population,
            "affected_area_km2": round(affected_area_km2, 2)
        }

    except Exception as e:

        return {
            "error": str(e)
        }
class RequirementRequest(BaseModel):
    disaster_type: str
    location: str
    affected_population: int
@app.post("/requirements/generate")
def generate_resource_requirements(request: RequirementRequest):

    if request.affected_population <= 0:
        return {
            "success": False,
            "message": "Affected population must be greater than 0"
        }

    requirements = generate_requirements(
        request.affected_population
    )

    return {
        "success": True,
        "disaster_type": request.disaster_type,
        "location": request.location,
        "affected_population": request.affected_population,
        "requirements": requirements
    }