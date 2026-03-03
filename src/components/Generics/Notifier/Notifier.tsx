import { Alert, Snackbar, Typography } from '@mui/material';
export type NotifierVariant = 'success' | 'warning' | 'error' | 'info';

interface ComponentProps {
	open: boolean;
	closeHandler: () => void;
	variant: NotifierVariant;
	message: string;
}

export default function Notifier(props: Readonly<ComponentProps>) {
	return (
		<Snackbar
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'left',
			}}
			open={props.open}
			autoHideDuration={3000}
			onClose={props.closeHandler}
		>
			<Alert severity={props.variant} variant='filled'>
				<Typography>{props.message}</Typography>
			</Alert>
		</Snackbar>
	);
}
