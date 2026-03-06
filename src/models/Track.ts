import GPX_1_0 from './GPX/1_0';
import GPX_1_1 from './GPX/1_1';
import Point, { fromGPX as pointFromGPX } from './Point';

export default interface Track {
	name?: string;
	points: Point[];
}

export function fromGPX(gpx: GPX_1_0 | GPX_1_1) {
	let res: Track[] = [];

	if (gpx.wpt) {
		let points = gpx.wpt.map(pointFromGPX).filter((el) => el !== null);
		res.push({
			points,
		});
	}

	if (gpx.rte) {
		for (let route of gpx.rte) {
			if (route.rtept) {
				let points = route.rtept.map(pointFromGPX).filter((el) => el !== null);
				res.push({
					name: route.name,
					points,
				});
			}
		}
	}

	if (gpx.trk) {
		for (let track of gpx.trk) {
			if (track.trkseg) {
				let points: Point[] = [];
				for (let segment of track.trkseg) {
					if (segment.trkpt) {
						points.push(...segment.trkpt.map(pointFromGPX).filter((el) => el !== null));
					}
				}
				res.push({
					name: track.name,
					points,
				});
			}
		}
	}

	//! Todo compute speed between points
	return res;
}
