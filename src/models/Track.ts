import { getSpeed } from 'utils/gps';
import GPX_1_0 from './GPX/1_0';
import GPX_1_1 from './GPX/1_1';
import Point, { fromGPX as pointFromGPX } from './Point';

export default interface Track {
	name?: string;
	points: Point[];
}

export async function fromGPX(gpx: GPX_1_0 | GPX_1_1) {
	let res: Track[] = [];

	if (gpx.wpt) {
		let points: Point[] = [];
		for (let point of gpx.wpt) {
			let newPoint = await pointFromGPX(point);
			if (newPoint) {
				points.push(newPoint);
			}
		}
		res.push({ points });
	}

	if (gpx.rte) {
		for (let route of gpx.rte) {
			if (route.rtept) {
				let points: Point[] = [];
				for (let point of route.rtept) {
					let newPoint = await pointFromGPX(point);
					if (newPoint) {
						points.push(newPoint);
					}
				}
				res.push({ points });
			}
		}
	}

	if (gpx.trk) {
		for (let track of gpx.trk) {
			if (track.trkseg) {
				let points: Point[] = [];
				for (let segment of track.trkseg) {
					for (let point of segment.trkpt) {
						let newPoint = await pointFromGPX(point);
						if (newPoint) {
							points.push(newPoint);
							if (points.length > 1) {
								let speed = getSpeed(points[points.length - 2], points[points.length - 1]);
								newPoint.computedSpeed = speed;
							}
						}
					}
					res.push({
						name: track.name,
						points,
					});
				}
			}
		}
	}

	//! Todo compute speed between points
	return res;
}
