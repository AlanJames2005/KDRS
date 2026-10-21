import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org"
HEADERS = {"User-Agent": "MissionProcurementProject/1.0"}


def geocode_location(location):
    params = {
        "q": location,
        "format": "jsonv2",
        "limit": 1,
        "addressdetails": 1
    }

    response = requests.get(
        f"{NOMINATIM_URL}/search",
        params=params,
        headers=HEADERS,
        timeout=10
    )

    response.raise_for_status()

    data = response.json()

    if not data:
        return None

    return {
        "latitude": float(data[0]["lat"]),
        "longitude": float(data[0]["lon"]),
        "display_name": data[0]["display_name"]
    }


def reverse_geocode_locality(latitude, longitude):
    response = requests.get(
        f"{NOMINATIM_URL}/reverse",
        params={
            "lat": latitude,
            "lon": longitude,
            "format": "jsonv2",
            "addressdetails": 1
        },
        headers=HEADERS,
        timeout=10
    )
    response.raise_for_status()
    data = response.json()
    if not isinstance(data, dict):
        return None

    address = data.get("address")
    if not isinstance(address, dict):
        return None

    locality = next(
        (
            address[key]
            for key in ("neighbourhood", "suburb", "village", "hamlet", "town", "city", "municipality")
            if isinstance(address.get(key), str) and address[key].strip()
        ),
        None
    )
    district = address.get("state_district") or address.get("county")
    if locality and isinstance(district, str) and district.strip() and district.casefold() != locality.casefold():
        return f"{locality}, {district}"
    if locality:
        return locality
    if isinstance(district, str) and district.strip():
        return district
    return None