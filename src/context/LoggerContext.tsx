import { ReactNode, createContext, useContext } from 'react';
import Logger from 'utils/logger';

const loggerContext = createContext<Logger | null>(null);

export function useLogger() {
	let logger = useContext(loggerContext);
	if (logger) {
		return logger;
	} else {
		throw new Error('Logger not initialized');
	}
}

export function withLogger(Children: React.ComponentType<any>) {
	return (props: any) => <Children {...props} {...useLogger()} />;
}

export type WithLogger = Logger;

interface LoggerProviderProps {
	children: ReactNode; // Type the children prop as ReactNode
}

export function LoggerProvider({ children }: Readonly<LoggerProviderProps>) {
	const logger = new Logger();
	logger.debug('Init Logger');

	return <loggerContext.Provider value={logger}>{children}</loggerContext.Provider>;
}
