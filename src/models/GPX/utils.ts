import { XMLParser } from 'fast-xml-parser';
import GPX_1_0, { fromJSON_1_0 } from './1_0';
import GPX_1_1, { fromJSON_1_1 } from './1_1';

export function parseGPX(rawXML: string) {
	const options = {
		ignoreAttributes: false,
		attributeNamePrefix: '@_',
	};
	let xmlParser = new XMLParser(options);
	let parsedXML = xmlParser.parse(rawXML);
	let res: GPX_1_0 | GPX_1_1 | undefined = undefined;
	if (parsedXML.gpx) {
		if (parsedXML.gpx['@_version'] === '1.0') {
			res = fromJSON_1_0(parsedXML.gpx);
		} else if (parsedXML.gpx['@_version'] === '1.1') {
			res = fromJSON_1_1(parsedXML.gpx);
		}
	}
	return res;
}
