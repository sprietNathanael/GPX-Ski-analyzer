import { AppBar, Toolbar, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

interface ComponentProps {}

export default function Header(props: ComponentProps) {
	const { classes } = useStyles();
	return (
		<AppBar position='static' className={classes.appBar}>
			<Toolbar sx={{ minHeight: '0px!important', height: '32px', overflow: 'hidden' }}>
				<Typography>Track-analyzer</Typography>
			</Toolbar>
		</AppBar>
	);
}

const useStyles = makeStyles()((theme) => ({
	appBar: {
		zIndex: 800,
		boxShadow: 'none',
		backgroundImage: 'none',
		position: 'sticky',
		top: 0,
		backdropFilter: 'blur(4px)',
	},
}));
