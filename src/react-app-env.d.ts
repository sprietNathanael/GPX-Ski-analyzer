/// <reference types="react-scripts" />

export {};
declare global {
	interface ErrorConstructor {
		captureStackTrace(error: Error, errorConstructor: Function);
	}
}
