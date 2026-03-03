import React from 'react';

interface ErrorBoudaryProps {
	children: React.ReactNode;
	errorCallback: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export default class ErrorBoudary extends React.Component<ErrorBoudaryProps> {
	constructor(props: ErrorBoudaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: any) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		this.props.errorCallback(error, errorInfo);
	}

	render(): React.ReactNode {
		return this.props.children;
	}
}
