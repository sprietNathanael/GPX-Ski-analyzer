import { Box, Card, CardContent } from '@mui/material';
import { useMap } from 'context/MapContext';
import { LngLatBoundsLike } from 'maplibre-gl';
import GPSRecord from 'models/Record';
import { useEffect, useRef, useState } from 'react';

const BOUNDS_OFFSET = 0.01;

interface ContainerProps {
	gpsRecord: GPSRecord;
}

export default function MapContainer(props: ContainerProps) {
	const { registerContainer, map } = useMap();
	const [containerInit, setContainerInit] = useState(false);
	const mapContainer = useRef<HTMLElement>(null);

	useEffect(() => {
		if (mapContainer && mapContainer.current) {
			registerContainer(mapContainer);
		}
	}, [mapContainer]);

	useEffect(() => {
		if (map && !containerInit) {
			setContainerInit(true);
			let offesetedBounds = props.gpsRecord.boundingBox.map((el, index) => [
				el[0] + (index === 0 ? -1 : 1) * BOUNDS_OFFSET,
				el[1] + (index === 0 ? -1 : 1) * BOUNDS_OFFSET,
			]) as LngLatBoundsLike;
			map.fitBounds(offesetedBounds);
			//! Todo : diverse colors for multiple tracks
			for (let trackIndex = 0; trackIndex < props.gpsRecord.tracks.length; trackIndex++) {
				let track = props.gpsRecord.tracks[trackIndex];
				map.addSource(`track-${trackIndex}`, {
					type: 'geojson',
					data: {
						type: 'Feature',
						geometry: {
							type: 'LineString',
							coordinates: track.points.map((el) => el.coords),
						},
						properties: {},
					},
				});
				map.addLayer({
					id: `track-${trackIndex}`,
					type: 'line',
					source: `track-${trackIndex}`,
					layout: {
						'line-join': 'round',
						'line-cap': 'round',
					},
					paint: {
						'line-color': '#d50e0e',
						'line-width': 1,
					},
				});
			}
		}
	}, [map, containerInit, props.gpsRecord]);

	return (
		<Card sx={{ width: '100%', height: '100%' }}>
			<CardContent sx={{ height: '100%', padding: '0', paddingBottom: '0px!important' }}>
				<Box sx={{ height: '100%', width: '100%' }} ref={mapContainer} />;
			</CardContent>
		</Card>
	);
}
