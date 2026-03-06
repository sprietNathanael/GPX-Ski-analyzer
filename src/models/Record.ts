import GPX_1_0, { Bound as Bound_1_0 } from './GPX/1_0';
import GPX_1_1, { Bound as Bound_1_1 } from './GPX/1_1';
import Track, { fromGPX as tracksFromGPX } from './Track';

export default interface Record {
	name?: string;
	boundingBox: [[number, number], [number, number]]; // [[minlon, minlat],[maxlon, maxlat]]
	tracks: Track[];
}

export function fromGPX(gpx: GPX_1_0 | GPX_1_1) {
	let res: Partial<Record> = {};
	let bound: Bound_1_0 | Bound_1_1 | undefined;
	if (gpx.version === '1.1') {
		res.name = gpx.metadata.name;
		bound = gpx.metadata.bounds;
	} else if (gpx.version === '1.0') {
		bound = gpx.bounds;
	}

	// let tracks =

	if (bound) {
		res.boundingBox = [
			[bound.minlon, bound.minlat],
			[bound.maxlon, bound.maxlat],
		];
	}

	res.tracks = tracksFromGPX(gpx);

	return res as Record;
}
