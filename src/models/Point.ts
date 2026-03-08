import { getPointElevation } from 'utils/tiles';
import { Point as Point_1_0 } from './GPX/1_0';
import { Point as Point_1_1 } from './GPX/1_1';

export default interface Point {
	coords: [number, number]; // lon, lat
	elevation?: number;
	computedElevation: number;
	name?: string;
	satNumber?: number;
	speed?: number;
	computedSpeed?: number;
}

export async function fromGPX(point: Point_1_0 | Point_1_1) {
	let res: Partial<Point> = {};

	if (!point.lat || !point.lon) {
		return null;
	}
	let coords: Point['coords'] = [point.lon, point.lat];
	res = {
		coords: coords,
		elevation: point.ele,
		name: point.name,
		satNumber: point.sat,
		speed: Number.parseFloat((point as Point_1_0).speed),
	};

	let computedElevation = await getPointElevation(coords);
	res.computedElevation = computedElevation;
	//! Todo compute elevation
	// let computedElevation =

	//! Todo speed will be computed from tracks
	return res as Point;
}
