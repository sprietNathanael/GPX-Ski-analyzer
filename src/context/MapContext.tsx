import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { createContext, RefObject, useContext, useEffect, useRef, useState } from 'react';

export interface MapContext {
	map: maplibre.Map | null;
	registerContainer: (mapContainerRef: RefObject<HTMLElement | null>) => void;
}

const mapContext = createContext<MapContext | null>(null);

export function useMap() {
	let mapManagement = useContext(mapContext);
	if (mapManagement) {
		return mapManagement;
	} else {
		throw new Error('Map is not initialized');
	}
}

interface MapContextProps {
	children: React.ReactNode;
}

export function MapProvider(props: Readonly<MapContextProps>) {
	const [map, setMap] = useState<maplibre.Map | null>(null);
	const mapRef = useRef(map);

	function registerContainer(mapContainerRef: RefObject<HTMLElement | null>) {
		if (map === null && mapContainerRef !== null && mapContainerRef.current) {
			const newMap = new maplibre.Map({
				container: mapContainerRef.current,
				style: {
					projection: { type: 'globe' },
					version: 8,
					sources: {
						satellite: {
							type: 'raster',
							tiles: [
								'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
							],
							tileSize: 256,
							maxzoom: 19,
						},
						terrain: {
							type: 'raster-dem',
							tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
							maxzoom: 15,
							encoding: 'terrarium',
							attribution: "<a href='https://github.com/tilezen/joerd/tree/master'>Joerd</a>",
						},
					},
					terrain: {
						source: 'terrain',
						exaggeration: 1,
					},
					layers: [
						{
							id: 'satellite',
							type: 'raster',
							source: 'satellite',
						},
					],
				},
				center: [2.35, 48.85],
				zoom: 5,
				rollEnabled: true,
			});

			newMap.on('load', () => {
				setMap(newMap);
			});
		}
	}

	// This is solely used to clean the map at unmounting
	useEffect(() => {
		return () => {
			if (mapRef.current) {
				mapRef.current.remove();
			}
		};
	}, []);

	return <mapContext.Provider value={{ map, registerContainer }}>{props.children}</mapContext.Provider>;
}
