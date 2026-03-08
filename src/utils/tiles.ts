const ZOOM = 15;
const TILE_SIZE = 256;

const tileCache = new Map<string, ImageData>();

async function loadTile(z: number, x: number, y: number): Promise<ImageData> {
	const key = `${z}/${x}/${y}`;

	if (tileCache.has(key)) {
		return tileCache.get(key)!;
	}

	const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${key}.png`;
	console.log(`loading ${url}`);

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
