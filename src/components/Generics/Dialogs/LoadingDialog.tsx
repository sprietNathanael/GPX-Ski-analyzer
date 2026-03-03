import { CircularProgress, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
interface ComponentProps {
	classes?: any;
	open: boolean;
}

export default function LoadingDialog(props: Readonly<ComponentProps>) {
	const { t } = useTranslation();
	return (
		<Dialog open={props.open} onClose={() => false} disableEscapeKeyDown={true}>
			<DialogTitle>
				<Typography variant='h3' component='span'>
					{t('generics.dialogs.loadingDialog.loading')}
				</Typography>
			</DialogTitle>
			<DialogContent className='textAlignCenter'>
				<CircularProgress color='primary' />
			</DialogContent>
		</Dialog>
	);
}
