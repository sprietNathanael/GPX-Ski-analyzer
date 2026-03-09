import {
	ChartData,
	ChartDataset,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	TimeScale,
	Tooltip,
} from 'chart.js';
import 'chartjs-adapter-dayjs-4';
import GPSRecord from 'models/Record';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import LinesOnHover from './Plugins/LinesOnHover';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale, LinesOnHover);

interface ComponentProps {
	gpsRecord: GPSRecord;
}

export function ChartContainer(props: ComponentProps) {
	const data = useMemo<ChartData<'line'>>(() => {
		let res: ChartData<'line'> = {
			labels: [],
			datasets: [],
		};

		let labels: Date[] = [];

		let elevationPoints: number[] = [];

		for (let track of props.gpsRecord.tracks) {
			for (let point of track.points) {
				labels.push(point.time);
				elevationPoints.push(point.computedElevation);
			}
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
	}, [props.gpsRecord]);

	return (
		<Line
			data={data}
			options={{
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
		/>
	);
}
