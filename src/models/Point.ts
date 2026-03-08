import { getPointElevation } from 'utils/gps';
import { Point as Point_1_0 } from './GPX/1_0';
import { Point as Point_1_1 } from './GPX/1_1';

export default interface Point {
	coords: [number, number]; // lon, lat
	time: Date;
	elevation?: number;
	computedElevation: number;
	name?: string;
	satNumber?: number;
	speed?: number;
	computedSpeed?: number;
}

export async function fromGPX(point: Point_1_0 | Point_1_1) {
	let res: Partial<Point> = {};

	if (!point.lat || !point.lon || !point.time) {
		return null;
	}
	let coords: Point['coords'] = [point.lon, point.lat];
	res = {
		coords: coords,
		time: point.time,
		elevation: point.ele,
		name: point.name,
		satNumber: point.sat,
	};
	if ((point as Point_1_0).speed) {
		res.speed = Number.parseFloat((point as Point_1_0).speed);
	}

	let computedElevation = await getPointElevation(coords);
	res.computedElevation = computedElevation;

	return res as Point;
}
