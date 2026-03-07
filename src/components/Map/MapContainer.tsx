import { Box } from '@mui/material';
import { useMap } from 'context/MapContext';
import { useEffect, useRef } from 'react';

interface ContainerProps {}

export default function MapContainer(props: ContainerProps) {
	const { registerContainer } = useMap();
	const mapContainer = useRef<HTMLElement>(null);

	useEffect(() => {
		if (mapContainer && mapContainer.current) {
			registerContainer(mapContainer);
		}
	}, [mapContainer]);

	return <Box sx={{ height: '100%', width: '100%' }} ref={mapContainer} />;
}
