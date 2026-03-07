import { Container } from '@mui/material';
import MapContainer from 'components/Map/MapContainer';
import { MapProvider } from 'context/MapContext';
import { useUtilities } from 'context/UtilityContext';
import { parseGPX } from 'models/GPX/utils';
import { ChangeEvent, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

function DashboardPage() {
	const { loadingDialog } = useUtilities();

	const [fileName, setFileName] = useState('');
	const [fileContent, setFileContent] = useState<string | null>(null);

	async function fileUploaded(event: ChangeEvent<HTMLInputElement>) {
		if (event.target.files?.length === 1) {
			loadingDialog.open();
			setFileName(event.target.files[0].name);
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
		loadingDialog.close();
		let fileContent = rawFileContent.target?.result as string;
		// console.log(fileContent);
		let parsed = parseGPX(fileContent);
		console.log(parsed);
		// setFileContent(fileContent);
	}

	const { classes } = useStyles();

	return (
		<Container maxWidth='xl' sx={{ flexGrow: 1, paddingBottom: '10px', overflow: 'hidden' }}>
			{/* <Button variant='contained' tabIndex={-1} component='label' role={undefined}>
				<Upload />
				<input type='file' className={classes.hiddenUploadInput} onChange={fileUploaded} />
			</Button> */}
			<MapContainer />
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
