import LoadingDialog from 'components/Generics/Dialogs/LoadingDialog';
import LoadingScreen from 'components/Generics/LoadingScreen';
import Notifier, { NotifierVariant } from 'components/Generics/Notifier/Notifier';
import { ReactNode, createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

export interface NotifierUtility {
	info: (message: string) => void;
	warning: (message: string) => void;
	error: (message: string) => void;
	success: (message: string) => void;
}

export interface LoadingDialogUtility {
	open: () => void;
	close: () => void;
}

export interface LoadingScreenUtility {
	open: () => void;
	close: () => void;
}

export interface UtilityContextBase {
	notifier: NotifierUtility;
	processError: (error: any, withRedirection?: boolean, user_id?: string) => void;
	loadingDialog: LoadingDialogUtility;
	loadingScreen: LoadingScreenUtility;
}

const utilityContext = createContext<UtilityContextBase | null>(null);

export function useUtilities() {
	let utilities = useContext(utilityContext);
	if (utilities) {
		return utilities;
	} else {
		throw new Error('Utilities not initialized');
	}
}

export function withUtilities(Children: React.ComponentType<any>) {
	return (props: any) => <Children {...props} {...useUtilities()} />;
}

export type WithUtilities = UtilityContextBase;

interface UtilityProviderProps {
	children: ReactNode; // Type the children prop as ReactNode
}

export function UtilityProvider({ children }: Readonly<UtilityProviderProps>) {
	const [loadingDialog_state, setLoadingDialog_state] = useState(false);
	const [loadingScreen_state, setLoadingScreen_state] = useState(false);
	const [notificationMessage, setNotificationMessage] = useState('');
	const [notification_state, setNotification_state] = useState(false);
	const [notificationType, setNotificationType] = useState<NotifierVariant>('info');
	const location = useLocation();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const loadingDialog = {
		open: () => {
			setLoadingDialog_state(true);
		},
		close: () => {
			setLoadingDialog_state(false);
		},
	};

	const loadingScreen = {
		open: () => {
			setLoadingScreen_state(true);
		},
		close: () => {
			setLoadingScreen_state(false);
		},
	};

	const notifyOpen = (message: string, state: NotifierVariant) => {
		setNotificationMessage(message);
		setNotificationType(state);
		setNotification_state(true);
	};

	const closeNotification = () => {
		setNotification_state(false);
	};

	const notifier = {
		info: (message: string) => {
			notifyOpen(message, 'info');
		},
		warning: (message: string) => {
			notifyOpen(message, 'warning');
		},
		error: (message: string) => {
			notifyOpen(message, 'error');
		},
		success: (message: string) => {
			notifyOpen(message, 'success');
		},
	};

	function processError(error: any, withRedirection = false) {
		if (error.status === 500 || error.status === 501) {
			notifier.error(t('errors.appError'));
		} else if (error.status === 400) {
			notifier.error(t('errors.400Error'));
		} else if (error.status === 403 || error.status === 401) {
			notifier.error(t('errors.accessForbidden'));
			if (withRedirection) {
				navigate(-1);
			}
		} else if (error.status === 404) {
			notifier.error(t('errors.notFound'));
			if (withRedirection) {
				navigate('/404', { state: { prevPath: location.pathname } });
			}
		} else if (error.status === 409) {
			notifier.error(t('errors.alreadyTaken'));
		} else {
			notifier.error(t('notifier.error'));
		}
	}

	return (
		<utilityContext.Provider value={{ loadingScreen, loadingDialog, notifier, processError }}>
			<LoadingScreen open={loadingScreen_state} />
			<LoadingDialog open={loadingDialog_state} />
			<Notifier
				open={notification_state}
				message={notificationMessage}
				closeHandler={closeNotification}
				variant={notificationType}
			/>
			{children}
		</utilityContext.Provider>
	);
}
