import { Point } from 'models';

const ZOOM = 15;
const TILE_SIZE = 256;

const tileCache = new Map<string, ImageData>();

async function loadTile(z: number, x: number, y: number): Promise<ImageData> {
	const key = `${z}/${x}/${y}`;

	if (tileCache.has(key)) {
		return tileCache.get(key)!;
	}

	const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${key}.png`;

	const img = new Image();
	img.crossOrigin = 'anonymous';
	img.src = url;

	await img.decode();

	const canvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Can not get context from canvas');
	}
	ctx?.drawImage(img, 0, 0);
	const data = ctx.getImageData(0, 0, TILE_SIZE, TILE_SIZE);

	if (data) {
		tileCache.set(key, data);
	}

	return data;
}

function latLonToTile([lon, lat]: [number, number]) {
	const n = Math.pow(2, ZOOM);

	const xtile = n * ((lon + 180) / 360);

	const latRad = (lat * Math.PI) / 180;
	const ytile = (n * (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)) / 2;

	return { xtile, ytile };
}

function elevationAt(pixels: Uint8ClampedArray, x: number, y: number) {
	const i = (y * TILE_SIZE + x) * 4;

	const R = pixels[i];
	const G = pixels[i + 1];
	const B = pixels[i + 2];
	return R * 256 + G + B / 256 - 32768;

	// If using a mapbox type DEM
	// return -10000 + (R * TILE_SIZE * TILE_SIZE + G * TILE_SIZE + B) * 0.1;
}

export async function getPointElevation([lon, lat]: [number, number]) {
	const { xtile, ytile } = latLonToTile([lon, lat]);

	const tileX = Math.floor(xtile);
	const tileY = Math.floor(ytile);

	const pixelX = Math.floor((xtile - tileX) * TILE_SIZE);
	const pixelY = Math.floor((ytile - tileY) * TILE_SIZE);

	const tile = await loadTile(ZOOM, tileX, tileY);

	return elevationAt(tile.data, pixelX, pixelY);
}

// Result is in m
export function haversineDistance([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]) {
	const R = 6371000; // meters

	const toRad = (d: number) => (d * Math.PI) / 180;

	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);

	const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}

export function getDist3D(previousPoint: Point, currentPoint: Point) {
	let distXY = haversineDistance(previousPoint.coords, currentPoint.coords);
	let distZ =
		(currentPoint.elevation || currentPoint.computedElevation) -
		(previousPoint.elevation || previousPoint.computedElevation);
	let dist3D = Math.sqrt(distXY ** 2 + distZ ** 2);
	return dist3D;
}

// Result is in m/s
export function getSpeed(previousPoint: Point, currentPoint: Point) {
	let dist3D = getDist3D(previousPoint, currentPoint);
	let deltaTime = (currentPoint.time.getTime() - previousPoint.time.getTime()) / 1000; // seconds

	return dist3D / deltaTime;
}
