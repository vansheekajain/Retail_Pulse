import json
import sys
import math

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two coordinates"""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat/2)**2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(dlon/2)**2)
    return R * 2 * math.asin(math.sqrt(a))

def calculate_competitor_impact(store_location, competitors):
    """
    Calculate how much competitors impact demand.
    Returns impact factor between 0 (no impact) and 1 (high impact)
    """
    if not competitors:
        return { 'impact_factor': 0, 'analysis': [], 'recommendation': 'No competitors marked nearby.' }

    analysis = []
    total_impact = 0

    for comp in competitors:
        dist_km = haversine_distance(
            store_location['lat'], store_location['lng'],
            comp['lat'], comp['lng']
        )

        # Impact decreases with distance
        if dist_km < 0.5:
            impact = 0.8    # Very high impact
            level  = 'Critical'
        elif dist_km < 1.0:
            impact = 0.5
            level  = 'High'
        elif dist_km < 2.0:
            impact = 0.3
            level  = 'Medium'
        elif dist_km < 5.0:
            impact = 0.1
            level  = 'Low'
        else:
            impact = 0.0
            level  = 'Negligible'

        total_impact += impact
        analysis.append({
            'name':           comp.get('name', 'Competitor'),
            'distance_km':    round(dist_km, 2),
            'impact_level':   level,
            'impact_factor':  impact,
        })

    # Normalize total impact to 0-1
    total_impact = min(1.0, total_impact / len(competitors))

    # Generate recommendation
    if total_impact > 0.6:
        recommendation = 'High competitor pressure. Focus on pricing and loyalty programs.'
    elif total_impact > 0.3:
        recommendation = 'Moderate competition. Differentiate with product variety.'
    else:
        recommendation = 'Low competition nearby. Good market position.'

    return {
        'impact_factor':  round(total_impact, 3),
        'analysis':       sorted(analysis, key=lambda x: x['distance_km']),
        'recommendation': recommendation,
    }

if __name__ == '__main__':
    store_location = json.loads(sys.argv[1])
    competitors    = json.loads(sys.argv[2])
    result = calculate_competitor_impact(store_location, competitors)
    print(json.dumps(result))