// const LogLevel = {
// 	error: 3,
// 	warning: 4,
// 	info: 5,
// 	verbose: 6,
// 	debug: 7,
// };
enum LogLevel {
	error,
	warning,
	info,
	verbose,
	debug,
}

/**
 * Manages logging in web console
 *
 * @class      Logger (name)
 */
class Logger {
	private level: LogLevel;
	constructor() {
		this.level = LogLevel.debug;
	}

	private printLog = (
		f: (message?: any, ...optionalParams: any[]) => void,
		toLog: any,
		label: string,
		colorString: string
	) => {
		let time = new Date();
		let baseString = `%c${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}:${time.getMilliseconds()} - [${label}] `;
		if (typeof toLog === 'string') {
			f(`${baseString} ${toLog}`, colorString);
		} else {
			f(`${baseString} %o`, colorString, toLog);
		}
	};

	/**
	 * Logs debug
	 *
	 * @param      {Object}  toLog   The object, string or other, to log
	 */
	debug = (toLog: any) => {
		if (this.level >= LogLevel.debug) {
			// eslint-disable-next-line no-console
			this.printLog(console.debug, toLog, 'debug', 'color: #0000FF; background-color: #c8e2fd;');
		}
	};

	/**
	 * Logs informations
	 *
	 * @param      {Object}  toLog   The object, string or other, to log
	 */
	info = (toLog: any) => {
		if (this.level >= LogLevel.info) {
			// eslint-disable-next-line no-console
			this.printLog(console.info, toLog, 'info', 'color: #008000; background-color: #c8fdd1;');
		}
	};

	/**
	 * Logs verbose
	 *
	 * @param      {Object}  toLog   The object, string or other, to log
	 */
	verbose = (toLog: any) => {
		if (this.level >= LogLevel.verbose) {
			// eslint-disable-next-line no-console
			this.printLog(console.info, toLog, 'info', 'color: #800080; background-color: #E5CCE5;');
		}
	};
	/**
	 * Logs warning
	 *
	 * @param      {Object}  toLog   The object, string or other, to log
	 */
	warning = (toLog: any) => {
		if (this.level >= LogLevel.warning) {
			// eslint-disable-next-line no-console
			this.printLog(console.warn, toLog, 'info', 'color: #FFA500;');
		}
	};
	/**
	 * Logs error
	 *
	 * @param      {Object}  toLog   The object, string or other, to log
	 */
	error = (toLog: any) => {
		if (this.level >= LogLevel.error) {
			// eslint-disable-next-line no-console
			this.printLog(console.error, toLog, 'info', 'color: #FF0000;');
		}
	};
}

export default Logger;
