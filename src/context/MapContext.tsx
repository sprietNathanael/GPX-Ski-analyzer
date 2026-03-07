import maplibre from 'maplibre-gl';
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
				style: 'https://demotiles.maplibre.org/style.json',
				center: [2.35, 48.85],
				zoom: 5,
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
