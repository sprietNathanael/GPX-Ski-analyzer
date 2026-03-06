// From https://www.topografix.com/gpx_manual.asp#version
export interface GPX_1_0 extends Record<string, any> {
	version: '1.0'; // GPX schema version used in file
	creator: string; // Program used to create file
	name?: string; // Descriptive name of the GPX file
	desc?: string; // Description of the GPX file
	author?: string; // Name of the file's creator
	email?: string; // Email address of the file's creator
	url?: string; // URL associated with the file
	urlname?: string; // Text to display on the <url> hyperlink
	time?: Date; // Creation date/time of the GPX file
	keywords?: string; // Keywords for categorizing the GPX file in a database or search engine
	bounds?: Bound; // Bounding rectangle for the data in the file
	wpt?: Point[]; // Optional Waypoints
	rte?: Route[]; // Optional Routes
	trk?: Track[]; // Optional Tracks
}

export interface Bound {
	minlat: number;
	minlon: number;
	maxlat: number;
	maxlon: number;
}

export type GPSFix =
	| 'none' // No Fix
	| '2d' // position only
	| '3d' // position and elevation
	| 'dgps' // DGPS
	| 'pps'; // Military signal used

export interface Route extends Record<string, any> {
	name?: string; // GPS route name
	cmt?: string; // GPS route comment
	desc?: string; // Description of the route
	src?: string; // Source of the route data
	url?: string; // URL associated with the route
	urlname?: string; // Text to display on the <url> hyperlink
	number?: number; // GPS route number
	rtept?: Point[]; // List of routepoints
}

export interface Track extends Record<string, any> {
	name?: string; // GPS track name
	cmt?: string; // GPS track comment
	desc?: Date; // Description of the track
	src?: string; // Source of the track data
	url?: string; // URL associated with the track
	urlname?: string; // Text to display on the <url> hyperlink
	number?: number; // GPS track number
	trkseg?: TrackSegment[]; // List of track segments
}

export interface TrackSegment {
	trkpt: Point[];
}

export interface Point extends Record<string, any> {
	lat?: number; // Latitude of the point.
	lon?: number; // Longitude of the point.
	// Optional Position Information:
	ele?: number; // Elevation of the point.
	time?: Date; // Creation date/time of the point
	magvar?: number; // Magnetic variation of the point
	geoidheight?: number; // Geoid height of the point
	// Optional Description Information:
	name?: string; // GPS waypoint name of the point
	cmt?: string; // GPS comment of the point
	desc?: string; // Descriptive description of the point
	src?: string; // Source of the point data
	url?: string; // URL associated with the point
	urlname?: string; // Text to display on the url?: ; // hyperlink
	sym?: string; // point symbol
	type?: string; // Type (category) of point
	// Optional Accuracy Information:
	fix?: GPSFix; // Type of GPS fix
	sat?: number; // Number of satellites
	hdop?: number; // HDOP
	vdop?: number; // VDOP
	pdop?: number; // PDOP
	ageofdgpsdata?: number; // Time since last DGPS fix
	dgpsid?: number; // DGPS station ID
}

export default GPX_1_0;

function pointFromJSON(data: Record<string, any>): Point {
	let res = data as Point;

	res.lat = Number.parseFloat(data['@_lat']);
	res.lon = Number.parseFloat(data['@_lon']);

	delete res['@_lat'];
	delete res['@_lon'];

	if (res.time) {
		res.time = new Date(res.time);
	}
	if (data.ele) {
		res.ele = Number.parseFloat(data.ele);
	}
	if (data.magvar) {
		res.magvar = Number.parseFloat(data.magvar);
	}
	if (data.geoidheight) {
		res.geoidheight = Number.parseFloat(data.geoidheight);
	}
	if (data.sat) {
		res.sat = Number.parseFloat(data.sat);
	}
	if (data.hdop) {
		res.hdop = Number.parseFloat(data.hdop);
	}
	if (data.vdop) {
		res.vdop = Number.parseFloat(data.vdop);
	}
	if (data.pdop) {
		res.pdop = Number.parseFloat(data.pdop);
	}
	if (data.ageofdgpsdata) {
		res.ageofdgpsdata = Number.parseFloat(data.ageofdgpsdata);
	}
	if (data.dgpsid) {
		res.dgpsid = Number.parseFloat(data.dgpsid);
	}

	return res;
}

function routeFromJSON(data: Record<string, any>): Route {
	let res = data as Route;

	if (data.number) {
		res.number = Number.parseFloat(data.number);
	}

	if (res.rtept) {
		if (!Array.isArray(res.rtept)) {
			res.rtept = [res.rtept];
		}
		res.rtept = res.rtept.map((el) => pointFromJSON(el));
	}
	return res;
}

function trackFromJSON(data: Record<string, any>): Track {
	let res = data as Track;

	if (res.trkseg) {
		if (!Array.isArray(res.trkseg)) {
			res.trkseg = [res.trkseg];
		}
		res.trkseg = res.trkseg.map((seg) => {
			let resSeg = seg;
			if (!Array.isArray(resSeg.trkpt)) {
				resSeg.trkpt = [resSeg.trkpt];
			}
			resSeg.trkpt = resSeg.trkpt.map((el) => pointFromJSON(el));
			return resSeg;
		});
	}

	return res;
}

export function fromJSON_1_0(data: Record<string, any>): GPX_1_0 {
	let res = data as GPX_1_0;

	if (data.number) {
		res.number = Number.parseFloat(data.number);
	}

	res.creator = data['@_creator'];
	res.version = data['@_version'];

	delete res['@_creator'];
	delete res['@_version'];

	if (data.bounds) {
		res.bounds = {
			maxlat: Number.parseFloat(data.bounds['@_maxlat']),
			minlat: Number.parseFloat(data.bounds['@_minlat']),
			maxlon: Number.parseFloat(data.bounds['@_maxlon']),
			minlon: Number.parseFloat(data.bounds['@_minlon']),
		};
	}

	if (res.time) {
		res.time = new Date(res.time);
	}

	if (res.wpt) {
		if (!Array.isArray(res.wpt)) {
			res.wpt = [res.wpt];
		}
		res.wpt = res.wpt.map((el) => pointFromJSON(el));
	}

	if (res.rte) {
		if (!Array.isArray(res.rte)) {
			res.rte = [res.rte];
		}
		res.rte = res.rte.map((el) => routeFromJSON(el));
	}

	if (res.trk) {
		if (!Array.isArray(res.trk)) {
			res.trk = [res.trk];
		}
		res.trk = res.trk.map((el) => trackFromJSON(el));
	}

	return res;
}
