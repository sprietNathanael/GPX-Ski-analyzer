import { Backdrop, LinearProgress } from '@mui/material';
interface ComponentProps {
	open: boolean;
}

export default function LoadingScreen(props: Readonly<ComponentProps>) {
	return (
		<Backdrop
			sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
			open={props.open}
		>
			<LinearProgress sx={{ width: '30vw', height: '8px', borderRadius: '5px' }} color='primary' />
		</Backdrop>
	);
}
