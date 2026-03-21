import { Box, Button, Grid } from '@mui/material';
import {
	ActiveElement,
	ChartData,
	ChartDataset,
	ChartEvent,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	TimeScale,
	Tooltip,
} from 'chart.js';
import 'chartjs-adapter-dayjs-4';
import { Refresh } from 'mdi-material-ui';
import { Point } from 'models';
import GPSRecord from 'models/Record';
import { memo, useEffect, useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { makeStyles } from 'tss-react/mui';
import LinesOnHover from './Plugins/LinesOnHover';
import SelectionWindow from './Plugins/SelectionWindow';

declare module 'chart.js' {
	interface ChartDatasetProperties<TType, TData> {
		unit?: string;
	}
}

export type Selection = {
	from: number; // index
	to: number; // index
};

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale, LinesOnHover);

interface ComponentProps {
	gpsRecord: GPSRecord;
	onPointSelected: (pointDate?: Point) => void;
	subSelection: Selection | null;
	onSubSelection: (selection: Selection | null) => void;
}

function ChartContainer(props: ComponentProps) {
	const lastSelectedPointRef = useRef<number | undefined>(undefined);

	const allPoints = useMemo<Point[]>(() => {
		let res: Point[] = [];

		for (let track of props.gpsRecord.tracks) {
			res.push(...track.points);
		}

		return res;
	}, [props.gpsRecord]);

	const pointsToShow = useMemo<Point[]>(() => {
		let res: Point[] = allPoints;
		if (props.subSelection) {
			res = res.slice(props.subSelection.from, props.subSelection.to + 1);
		}

		return res;
	}, [allPoints, props.subSelection]);

	const data = useMemo<ChartData<'line'>>(() => {
		let res: ChartData<'line'> = {
			labels: [],
			datasets: [],
		};

		let labels: Date[] = [];

		let elevationPoints: number[] = [];
		let speedPoints: number[] = [];

		for (let point of pointsToShow) {
			labels.push(point.time);
			elevationPoints.push(point.computedElevation);
			speedPoints.push((point.speed || 0) * 3.6);
		}

		let elevationData: ChartDataset<'line', number[]> = {
			label: 'Elevation',
			borderColor: 'rgba(255,0,0)',
			backgroundColor: 'rgba(255,0,0)',
			data: elevationPoints,
			borderWidth: 1,
			pointRadius: 1,
			yAxisID: 'y',
			unit: 'm',
			order: 10,
		};

		let speedData: ChartDataset<'line', number[]> = {
			label: 'Speed',
			borderColor: 'rgba(0,120,255)',
			backgroundColor: 'rgba(0,120,255)',
			data: speedPoints,
			borderWidth: 1,
			pointRadius: 1,
			yAxisID: 'y1',
			unit: 'km/h',
			order: 1,
		};

		res.labels = labels;
		res.datasets.push(elevationData);
		res.datasets.push(speedData);

		return res;
	}, [pointsToShow]);

	function selectPoint(index?: number) {
		if (lastSelectedPointRef.current !== index) {
			lastSelectedPointRef.current = index;
			let point = allPoints[index === undefined ? -1 : index + (props.subSelection?.from || 0)];
			props.onPointSelected(point);
		}
	}

	function chartHover(event: ChartEvent, elements: ActiveElement[], chart: ChartJS) {
		if (elements.length > 0) {
			selectPoint(elements[0].index);
		}
	}

	useEffect(() => {
		console.log('props changed');
	}, [props.onPointSelected]);

	function onSelection(start: number, end: number) {
		lastSelectedPointRef.current = undefined;
		let fromIndex = allPoints.findIndex((el) => el.time.getTime() >= start);
		let toIndex = allPoints.findIndex((el) => el.time.getTime() >= end);
		props.onSubSelection({ from: fromIndex, to: toIndex });
	}

	function onSelectionReset() {
		lastSelectedPointRef.current = undefined;
		props.onSubSelection(null);
	}

	const { classes } = useStyles();

	return (
		<Grid container width={'100%'} spacing={1} flexDirection='column' flexWrap='nowrap'>
			<Grid container>
				<Box flexGrow={1} />
				{props.subSelection && (
					<Button
						onClick={onSelectionReset}
						variant='contained'
						size='small'
						sx={{ padding: '2px', minWidth: 0 }}
					>
						<Refresh sx={{ fontSize: '1.2rem' }} />
					</Button>
				)}
			</Grid>
			<Box sx={{ width: '100%', height: '200px' }}>
				<Line
					data={data}
					options={{
						events: [
							'mousemove',
							'dblclick',
							'mouseout',
							'click',
							'touchstart',
							'touchmove',
							'mousedown',
							'mouseup',
						],
						onHover: chartHover,
						scales: {
							x: { type: 'time' },
							y: {
								type: 'linear',
								display: true,
								position: 'left',
								ticks: {
									callback: (value) => `${value} m`,
								},
							},
							y1: {
								type: 'linear',
								display: true,
								position: 'right',
								ticks: {
									callback: (value) => `${value} km/h`,
								},
								// grid line settings
								grid: {
									drawOnChartArea: false, // only want the grid lines for one axis to show up
								},
							},
						},
						interaction: {
							mode: 'index',
							intersect: false,
						},
						plugins: {
							linesOnHover: {
								vertical: true,
								horizontal: true,
								style: {
									width: 2,
									style: '#999999',
									lineDash: [5, 3],
								},
							},
							selectionWindow: {
								onSelection: onSelection,
								onSelectionReset: onSelectionReset,
							},
							tooltip: {
								callbacks: {
									label: (context) => {
										const unit = context.dataset.unit || '';
										return `${context.dataset.label}: ${Number(context.parsed.y).toFixed(2)} ${unit}`;
									},
								},
							},
						},
						maintainAspectRatio: false,
					}}
					plugins={[LinesOnHover, SelectionWindow]}
					onMouseLeave={() => selectPoint(undefined)}
					width={100}
					height={100}
					className={classes.chartContainer}
				/>
			</Box>
		</Grid>
	);
}

export default memo(ChartContainer);

const useStyles = makeStyles()((theme) => ({
	chartContainer: {
		height: '300px',
	},
}));
