import { Grid, Theme, Typography, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';

function Page404() {
	const { t } = useTranslation();

	const isUpSm = useMediaQuery<Theme>((theme) => theme.breakpoints.up('sm'), { noSsr: true });
	const isUpMd = useMediaQuery<Theme>((theme) => theme.breakpoints.up('md'), { noSsr: true });
	return (
		<Grid container spacing={0} justifyContent='center' flexGrow={1}>
			<Grid container spacing={0} justifyContent='center' direction='column' sx={{ width: 'unset' }}>
				<Typography align='center' fontSize={isUpMd ? '20em' : isUpSm ? '15em' : '5em'}>
					{t('pageError.title')}
				</Typography>
				<Typography align='center' fontSize='2em'>
					{t('page404.text')}
				</Typography>
			</Grid>
		</Grid>
	);
}

export default Page404;
