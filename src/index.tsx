import { SupportedColorScheme } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import App from 'App';
import { LoggerProvider } from 'context/LoggerContext';
import { UserManagementProvider } from 'context/UserManagementContext';
import { UtilityProvider } from 'context/UtilityContext';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, useNavigate } from 'react-router';
import ErrorBoudary from 'utils/ErrorBoundary';
import globalTheme from './globalTheme';
import './i18n';
import './index.css';

function MainApp() {
	const [locale, setLocale] = useState<string>('en');
	const [theme, setTheme] = useState<SupportedColorScheme>('light');

	return (
		<MuiThemeProvider theme={globalTheme(theme, locale)}>
			<UtilityProvider>
				<UserManagementProvider localeChangedCallback={setLocale} themeChangedCallback={setTheme}>
					<App />
				</UserManagementProvider>
			</UtilityProvider>
		</MuiThemeProvider>
	);
}

MainApp.whyDidYouRender = true;

function EnclosingComponents() {
	const navigate = useNavigate();

	function errorCallback(error: Error, errorInfo: React.ErrorInfo) {
		// eslint-disable-next-line no-console
		console.log(error);

		// eslint-disable-next-line no-console
		console.log(errorInfo);
		navigate('/Error', { state: { prevPath: location.pathname } });
	}

	return (
		<ErrorBoudary errorCallback={errorCallback}>
			<LoggerProvider>
				<MainApp />
			</LoggerProvider>
		</ErrorBoudary>
	);
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const router = createBrowserRouter(createRoutesFromElements(<Route path='*' element={<EnclosingComponents />} />));

root.render(
	// <Profiler>
	// <StrictMode>
	<RouterProvider router={router} />
	// </StrictMode>
	// </Profiler>
);
