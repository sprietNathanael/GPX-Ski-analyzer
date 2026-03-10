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
import { Point } from 'models';
import GPSRecord from 'models/Record';
import { memo, useEffect, useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import LinesOnHover from './Plugins/LinesOnHover';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale, LinesOnHover);

interface ComponentProps {
	gpsRecord: GPSRecord;
	onPointSelected: (pointDate?: Date) => void;
}

function ChartContainer(props: ComponentProps) {
	const lastSelectedPointRef = useRef<number | undefined>(undefined);

	const points = useMemo<Point[]>(() => {
		let res: Point[] = [];

		for (let track of props.gpsRecord.tracks) {
			res.push(...track.points);
		}

		return res;
	}, [props.gpsRecord]);

	const data = useMemo<ChartData<'line'>>(() => {
		let res: ChartData<'line'> = {
			labels: [],
			datasets: [],
		};

		let labels: Date[] = [];

		let elevationPoints: number[] = [];

		for (let point of points) {
			labels.push(point.time);
			elevationPoints.push(point.computedElevation);
		}

		let elevationData: ChartDataset<'line', number[]> = {
			label: 'Elevation',
			borderColor: 'rgba(255,0,0)',
			backgroundColor: 'rgba(255,0,0)',
			data: elevationPoints,
			borderWidth: 1,
			pointRadius: 1,
		};

		res.labels = labels;
		res.datasets.push(elevationData);

		return res;
	}, [points]);

	function selectPoint(index?: number) {
		if (lastSelectedPointRef.current !== index) {
			lastSelectedPointRef.current = index;
			props.onPointSelected(points[index ?? -1]?.time);
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

	console.log('Chart re-rendered');

	return (
		<Line
			data={data}
			options={{
				onHover: chartHover,
				scales: {
					x: { type: 'time' },
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
				},
			}}
			plugins={[LinesOnHover]}
			onMouseLeave={() => selectPoint(undefined)}
		/>
	);
}

export default memo(ChartContainer);
