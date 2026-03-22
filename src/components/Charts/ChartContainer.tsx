import { Box, Button, Grid, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
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
import { Refresh, SquareRounded } from 'mdi-material-ui';
import { Point } from 'models';
import GPSRecord from 'models/Record';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
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

const dataType = ['speed', 'computedSpeed', 'elevation', 'computedElevation'] as const;
type DataType = (typeof dataType)[number];

const DATA_CONFIG: Record<DataType, { label: string; color: string }> = {
	speed: { label: 'Speed', color: 'rgba(0,120,255)' },
	computedSpeed: { label: 'Computed speed', color: 'rgba(78, 189, 222)' },
	elevation: { label: 'Elevation', color: 'rgba(207, 14, 14)' },
	computedElevation: { label: 'Computed elevation', color: 'rgba(235, 87, 87)' },
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
	const theme = useTheme();
	const [dataToShow, setDataToShow] = useState<DataType[]>(['computedSpeed', 'computedElevation']);

	const allPoints = useMemo<Point[]>(() => {
		let res: Point[] = [];

		for (let track of props.gpsRecord.tracks) {
			res.push(...track.points);
		}

		return res;
	}, [props.gpsRecord]);

	const hasSpeed = useMemo<boolean>(() => allPoints.find((el) => el.speed !== undefined) !== undefined, [allPoints]);
	const hasElevation = useMemo<boolean>(
		() => allPoints.find((el) => el.elevation !== undefined) !== undefined,
		[allPoints]
	);

	const possibleDataToShow = useMemo<DataType[]>(() => {
		let res: DataType[] = ['computedElevation', 'computedSpeed'];
		if (hasElevation) {
			res.push('elevation');
		}
		if (hasSpeed) {
			res.push('speed');
		}

		return res;
	}, [hasElevation, hasSpeed]);

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

		let computedElevationPoints: number[] = [];
		let computedSpeedPoints: number[] = [];
		let speedPoints: number[] = [];
		let elevationPoints: number[] = [];

		for (let point of pointsToShow) {
			labels.push(point.time);
			computedElevationPoints.push(point.computedElevation);
			computedSpeedPoints.push((point.computedSpeed || 0) * 3.6);
			elevationPoints.push(point.elevation || 0);
			speedPoints.push((point.speed || 0) * 3.6);
		}

		if (dataToShow.includes('elevation')) {
			let elevationData: ChartDataset<'line', number[]> = {
				label: DATA_CONFIG['elevation'].label,
				borderColor: DATA_CONFIG['elevation'].color,
				backgroundColor: DATA_CONFIG['elevation'].color,
				data: elevationPoints,
				borderWidth: 1,
				pointRadius: 1,
				yAxisID: 'y',
				unit: 'm',
				order: 10,
			};
			res.datasets.push(elevationData);
		}

		if (dataToShow.includes('speed')) {
			let speedData: ChartDataset<'line', number[]> = {
				label: DATA_CONFIG['speed'].label,
				borderColor: DATA_CONFIG['speed'].color,
				backgroundColor: DATA_CONFIG['speed'].color,
				data: speedPoints,
				borderWidth: 1,
				pointRadius: 1,
				yAxisID: 'y1',
				unit: 'km/h',
				order: 1,
			};
			res.datasets.push(speedData);
		}

		if (dataToShow.includes('computedElevation')) {
			let computedElevationData: ChartDataset<'line', number[]> = {
				label: DATA_CONFIG['computedElevation'].label,
				borderColor: DATA_CONFIG['computedElevation'].color,
				backgroundColor: DATA_CONFIG['computedElevation'].color,
				data: computedElevationPoints,
				borderWidth: 1,
				pointRadius: 1,
				yAxisID: 'y',
				unit: 'm',
				order: 10,
			};
			res.datasets.push(computedElevationData);
		}

		if (dataToShow.includes('computedSpeed')) {
			let computedSpeedData: ChartDataset<'line', number[]> = {
				label: DATA_CONFIG['computedSpeed'].label,
				borderColor: DATA_CONFIG['computedSpeed'].color,
				backgroundColor: DATA_CONFIG['computedSpeed'].color,
				data: computedSpeedPoints,
				borderWidth: 1,
				pointRadius: 1,
				yAxisID: 'y1',
				unit: 'km/h',
				order: 1,
			};
			res.datasets.push(computedSpeedData);
		}

		res.labels = labels;

		return res;
	}, [pointsToShow, dataToShow]);

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
				<ToggleButtonGroup value={dataToShow} onChange={(event, newData) => setDataToShow(newData)}>
					{possibleDataToShow.map((type) => (
						<ToggleButton
							key={`toggleButton-${type}`}
							value={type}
							sx={{ textTransform: 'none', padding: '5px' }}
						>
							{DATA_CONFIG[type].label}
							<SquareRounded
								sx={{
									color: dataToShow.includes(type)
										? DATA_CONFIG[type].color
										: theme.palette.text.disabled,
								}}
							/>
						</ToggleButton>
					))}
				</ToggleButtonGroup>

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
							legend: {
								display: false,
							},
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
