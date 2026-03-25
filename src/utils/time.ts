export function milliSecondsToHoursString(duration: number, minLevel = 2) {
	let temp = duration;
	let hours = Math.floor(temp / 3600000);
	let minutes = Math.floor((temp %= 3600000) / 60000);
	let seconds = Math.floor((temp %= 60000)) / 1000;
	let milliseconds = temp % 1000;

	let res: string[] = [];
	let takenLevel = 0;
	if (hours > 0) {
		res.push(`${hours} h`);
		takenLevel++;
	}
	if (takenLevel <= minLevel) {
		if (minutes > 0) {
			res.push(`${minutes} min`);
		}
		takenLevel++;
	}
	if (takenLevel < minLevel) {
		if (seconds > 0) {
			res.push(`${seconds} s`);
		}
		takenLevel++;
	}
	if (takenLevel < minLevel) {
		if (milliseconds > 0) {
			res.push(`${milliseconds} ms`);
		}
		takenLevel++;
	}
	return res.join(' ');
}
