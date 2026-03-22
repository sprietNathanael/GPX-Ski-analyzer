import { CssBaseline, GlobalStyles, Grid } from '@mui/material';
import Header from 'components/Layout/Header';
import { ReactNode } from 'react';
import { Route, Routes } from 'react-router';
import mainRoutes from 'routes/mainRoutes';
import { makeStyles } from 'tss-react/mui';

export default function App() {
	//======================== Routes

	function switchRoutes(
		routes: {
			path: string;
			component: () => ReactNode;
		}[]
	): React.ReactElement {
		const toReturn = (
			<Routes>
				{routes.map((prop, key) => {
					return <Route key={key} path={prop.path} element={<prop.component />} />;
				})}
			</Routes>
		);
		return toReturn;
	}

	//======================= Page Render ========================

	const { classes } = useStyles();

	return (
		<div className={classes.app}>
			<CssBaseline />
			<GlobalStyles styles={{}} />

			<Grid container spacing={0} flexGrow={1} wrap='nowrap'>
				<Grid
					container
					direction='column'
					flexGrow={1}
					spacing={1}
					wrap='nowrap'
					sx={{ overflow: 'hidden', height: '100%', position: 'relative' }}
					className='slimScrollbar'
				>
					<Header />
					{switchRoutes(mainRoutes)}
				</Grid>
			</Grid>
		</div>
	);
}

const useStyles = makeStyles()((theme) => ({
	app: {
		backgroundColor: theme.palette.background.default,
		height: '100dvh',
		display: 'flex',
		flexDirection: 'column',
	},
	alertIcon: {
		padding: 0,
		fontSize: '18px',
	},
	alertMessage: {
		padding: 0,
	},
}));
