import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import MapContainer from 'components/Map/MapContainer';
import { MapProvider } from 'context/MapContext';
import { useUtilities } from 'context/UtilityContext';
import { Upload } from 'mdi-material-ui';
import { parseGPX } from 'models/GPX/utils';
import GPSRecord, { fromGPX } from 'models/Record';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';

function DashboardPage() {
	const { loadingDialog } = useUtilities();
	const { t } = useTranslation();

	const [gpsRecord, setGpsRecord] = useState<GPSRecord | undefined>(undefined);

	async function fileUploaded(event: ChangeEvent<HTMLInputElement>) {
		if (event.target.files?.length === 1) {
			loadingDialog.open();
			// setFileName(event.target.files[0].name);
			let reader = new FileReader();
			reader.onload = (data) => {
				event.target.value = '';
				uploadedFileRead(data);
			};
			reader.readAsText(event.target.files[0]);
		}
		event.target.files = null;
	}

	async function uploadedFileRead(rawFileContent: ProgressEvent<FileReader>) {
		let fileContent = rawFileContent.target?.result as string;
		let parsed = parseGPX(fileContent);
		if (parsed) {
			let newRecord = fromGPX(parsed);
			setGpsRecord(newRecord);
		}
		loadingDialog.close();
	}

	const { classes } = useStyles();

	return (
		<Container maxWidth='xl' sx={{ flexGrow: 1, paddingBottom: '10px', overflow: 'hidden' }}>
			<Grid container flexDirection='column' alignItems='center'>
				{gpsRecord ? (
					<Box height={'600px'} width={'100%'}>
						<MapContainer gpsRecord={gpsRecord} />
					</Box>
				) : (
					<Card sx={{ maxWidth: '400px' }}>
						<CardContent>
							<Grid container flexDirection='column' alignItems='center' spacing={2}>
								<Typography>{t('dashboard.uploadSection.title')}</Typography>
								<Button variant='contained' tabIndex={-1} component='label' role={undefined}>
									<Upload />
									<input type='file' className={classes.hiddenUploadInput} onChange={fileUploaded} />
								</Button>
							</Grid>
						</CardContent>
					</Card>
				)}
			</Grid>
		</Container>
	);
}

export default () => (
	<MapProvider>
		<DashboardPage />
	</MapProvider>
);

const useStyles = makeStyles()((theme) => ({
	hiddenUploadInput: {
		clip: 'rect(0 0 0 0)',
		clipPath: 'inset(50%)',
		height: 1,
		overflow: 'hidden',
		position: 'absolute',
		bottom: 0,
		left: 0,
		whiteSpace: 'nowrap',
		width: 1,
	},
}));
