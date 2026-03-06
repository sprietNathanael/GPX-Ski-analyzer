// A link to an external resource (Web page, digital photo, video clip, etc) with additional information.
export interface Link {
	href: string; // URL of hyperlink
	text?: string; // Text of hyperlink.
	type?: string; // Mime type of content (image/jpeg)
}

// From https://www.topografix.com/gpx_manual.asp#version
export interface GPX_1_1 {
	version: '1.1'; // GPX schema version used in file
	creator: string; // You must include the name or URL of the software that created your GPX document. This allows others to inform the creator of a GPX instance document that fails to validate.
	metadata: {
		name?: string; // The name of the GPX file
		desc?: string; // A description of the contents of the GPX file
		author?: {
			// A person or organization
			name?: string; // Name of person or organization
			email?: {
				// An email address. Broken into two parts (id and domain) to help prevent email harvesting.
				id: string; // id half of email address (billgates2004)
				domain: string; // domain half of email address (hotmail.com)
			};
		};
		link?: Link; // Link to Web site or other external information about person.
		time?: Date; // The creation date of the file
		keywords?: string; // Keywords associated with the file. Search engines or databases can use this information to classify the data
		bounds?: Bound; // Minimum and maximum coordinates which describe the extent of the coordinates in the file
		extensions?: Record<string, any>; // You can add extend GPX by adding your own elements from another schema here.
	};
	wpt?: Point[]; // A list of waypoints
	rte?: Route[]; // A list of Routes
	trk?: Track[]; // A list of Tracks
	extensions?: Record<string, any>; // You can add extend GPX by adding your own elements from another schema here.
}

// Two lat/lon pairs defining the extent of an element.
export interface Bound {
	minlat: number; // The minimum latitude
	minlon: number; // The minimum longitude
	maxlat: number; // The maximum latitude
	maxlon: number; // The maximum longitude
}

export type GPSFix =
	| 'none' // No Fix
	| '2d' // position only
	| '3d' // position and elevation
	| 'dgps' // DGPS
	| 'pps'; // Military signal used

// rte represents route - an ordered list of waypoints representing a series of turn points leading to a destination
export interface Route {
	name?: string; // GPS name of route
	cmt?: string; // GPS comment for route
	desc?: string; // Text description of route for user. Not sent to GPS
	src?: string; // Source of data. Included to give user some idea of reliability and accuracy of data
	link?: Link[]; // Links to external information about the route
	number?: number; // GPS route number
	type?: string; // Type (classification) of route
	rtept?: Point[]; // List of routepoints
	extensions?: Record<string, any>; // You can add extend GPX by adding your own elements from another schema here
}

// trk represents a track - an ordered list of points describing a path
export interface Track {
	name?: string; // GPS name of track
	cmt?: string; // GPS comment for track
	desc?: Date; // User description of track
	src?: string; // Source of data. Included to give user some idea of reliability and accuracy of data
	link?: Link[]; // Links to external information about track
	number?: number; // GPS track number
	type?: string; // Type (classification) of track
	trkseg?: TrackSegment[]; // A Track Segment holds a list of Track Points which are logically connected in order. To represent a single GPS track where GPS reception was lost, or the GPS receiver was turned off, start a new Track Segment for each continuous span of track data
	extensions?: Record<string, any>; // You can add extend GPX by adding your own elements from another schema here
}

export interface TrackSegment {
	trkpt: Point[];
}

export interface Point {
	lat?: number; // Latitude of the point.
	lon?: number; // Longitude of the point.
	// Optional Position Information:
	ele?: number; // Elevation (in meters) of the point
	time?: Date; // reation/modification timestamp for element. Date and time in are in Univeral Coordinated Time (UTC), not local time! Conforms to ISO 8601 specification for date/time representation. Fractional seconds are allowed for millisecond timing in tracklogs
	magvar?: number; // Magnetic variation (in degrees) at the point
	geoidheight?: number; // Height (in meters) of geoid (mean sea level) above WGS84 earth ellipsoid. As defined in NMEA GGA message
	// Optional Description Information:
	name?: string; // The GPS name of the point. This field will be transferred to and from the GPS. GPX does not place restrictions on the length of this field or the characters contained in it. It is up to the receiving application to validate the field before sending it to the GPS
	cmt?: string; // GPS point comment. Sent to GPS as comment
	desc?: string; // A text description of the element. Holds additional information about the element intended for the user, not the GPS
	src?: string; // Source of data. Included to give user some idea of reliability and accuracy of data. "Garmin eTrex", "USGS quad Boston North", e.g
	link?: Link[]; // Link to additional information about the point.
	sym?: string; // Text of GPS symbol name. For interchange with other programs, use the exact spelling of the symbol as displayed on the GPS. If the GPS abbreviates words, spell them out
	type?: string; // Type (classification) of the point
	// Optional Accuracy Information:
	fix?: GPSFix; // Type of GPS fix
	sat?: number; // Number of satellites used to calculate the GPX fix
	hdop?: number; // Horizontal dilution of precision
	vdop?: number; // Vertical dilution of precision
	pdop?: number; // Position dilution of precision
	ageofdgpsdata?: number; // Number of seconds since last DGPS update
	dgpsid?: number; // ID of DGPS station used in differential correction
}

export default GPX_1_1;

function pointFromJSON(data: Record<string, any>): Point {
	let res = data as Point & Record<string, any>;

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

	if (data.number) {
		res.number = Number.parseFloat(data.number);
	}
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

//! Todo parse extensions (like with Garmin)

export function fromJSON_1_1(data: Record<string, any>): GPX_1_1 {
	let res = data as GPX_1_1 & Record<string, any>;

	res.creator = data['@_creator'];
	res.version = data['@_version'];

	delete res['@_creator'];
	delete res['@_version'];

	if (data.metadata.bounds) {
		res.metadata.bounds = {
			maxlat: Number.parseFloat(data.metadata.bounds['@_maxlat']),
			minlat: Number.parseFloat(data.metadata.bounds['@_minlat']),
			maxlon: Number.parseFloat(data.metadata.bounds['@_maxlon']),
			minlon: Number.parseFloat(data.metadata.bounds['@_minlon']),
		};
	}

	if (res.metadata.time) {
		res.metadata.time = new Date(res.metadata.time);
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

	return res as GPX_1_1;
}
