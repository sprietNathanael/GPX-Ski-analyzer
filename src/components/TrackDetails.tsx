import { Box, Card, CardContent, Tab, Tabs, Typography } from '@mui/material';
import classnames from 'classnames';
import { Selection } from 'components/Charts/ChartContainer';
import { Point } from 'models';
import GPSRecord from 'models/Record';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { getDist3D, haversineDistance } from 'utils/gps';
import { milliSecondsToHoursString } from 'utils/time';

const tabTypes = ['speed', 'elevation', 'misc'] as const;
type TabTypes = (typeof tabTypes)[number];

interface ComponentProps {
	gpsRecord: GPSRecord;
	activeSelection: Selection | null;
}

interface DataToDisplay {
	speedMax: number;
	speedMin: number;
	speedAvg: number;
	computedSpeedMax: number;
	computedSpeedMin: number;
	computedSpeedAvg: number;
	elevationMin: number;
	elevationMax: number;
	elevationAvg: number;
	computedElevationMin: number;
	computedElevationMax: number;
	computedElevationAvg: number;
	length2D: number;
	length3D: number;
	duration: number;
	movingDuration: number;
	downhillDist: number;
	uphillDist: number;
}

export default function TrackDetails(props: ComponentProps) {
	const { t } = useTranslation();

	const [currentTab, setCurrentTab] = useState<TabTypes>('speed');

	const allPoints = useMemo<Point[]>(() => {
		let res: Point[] = [];

		for (let track of props.gpsRecord.tracks) {
			res.push(...track.points);
		}

		return res;
	}, [props.gpsRecord]);

	const dataToDisplay = useMemo<DataToDisplay>(() => {
		let pointsToCompute: Point[] = allPoints;
		if (props.activeSelection) {
			pointsToCompute = pointsToCompute.slice(props.activeSelection.from, props.activeSelection.to + 1);
		}

		let speedCount = 0;
		let speedSum = 0;
		let speedMax = -Infinity;
		let speedMin = +Infinity;
		let computedSpeedCount = 0;
		let computedSpeedSum = 0;
		let computedSpeedMax = -Infinity;
		let computedSpeedMin = +Infinity;
		let elevationCount = 0;
		let elevationSum = 0;
		let elevationMax = -Infinity;
		let elevationMin = +Infinity;
		let computedElevationCount = 0;
		let computedElevationSum = 0;
		let computedElevationMax = -Infinity;
		let computedElevationMin = +Infinity;
		let movingTime = 0;
		let length2D = 0;
		let length3D = 0;
		let downhillDist = 0;
		let uphillDist = 0;
		pointsToCompute.forEach((point, index) => {
			let previousPoint: Point | undefined;

			if (index > 0) {
				previousPoint = pointsToCompute[index - 1];
			}

			if (previousPoint) {
				// Moving
				if (point.computedSpeed !== undefined && point.computedSpeed > 0.2 && index > 0) {
					movingTime += point.time.getTime() - previousPoint.time.getTime();
				}
				length2D += haversineDistance(previousPoint.coords, point.coords);
				length3D += getDist3D(previousPoint, point);
				let elevationDelta = 0;
				if (previousPoint.elevation !== undefined && point.elevation !== undefined) {
					elevationDelta = previousPoint.elevation - point.elevation;
				} else {
					elevationDelta = previousPoint.computedElevation - point.computedElevation;
				}
				if (elevationDelta > 0) {
					downhillDist += elevationDelta;
					// } else if (elevationDelta < 0) {
				} else {
					uphillDist += Math.abs(elevationDelta);
				}
			}

			computedElevationCount++;
			computedElevationSum += point.computedElevation;
			computedElevationMax = Math.max(computedElevationMax, point.computedElevation);
			computedElevationMin = Math.min(computedElevationMin, point.computedElevation);
			if (point.computedSpeed !== undefined && point.computedSpeed > 0.2) {
				computedSpeedCount++;
				computedSpeedSum += point.computedSpeed;
				computedSpeedMax = Math.max(computedSpeedMax, point.computedSpeed);
				computedSpeedMin = Math.min(computedSpeedMin, point.computedSpeed);
			}
			if (point.speed !== undefined && point.speed > 0.2) {
				speedCount++;
				speedSum += point.speed;
				speedMax = Math.max(speedMax, point.speed);
				speedMin = Math.min(speedMin, point.speed);
			}
			if (point.elevation !== undefined) {
				elevationCount++;
				elevationSum += point.elevation;
				elevationMax = Math.max(elevationMax, point.elevation);
				elevationMin = Math.min(elevationMin, point.elevation);
			}
		});

		let res: DataToDisplay = {
			speedAvg: (speedSum / speedCount) * 3.6,
			speedMax: speedMax * 3.6,
			speedMin: speedMin * 3.6,
			computedSpeedAvg: (computedSpeedSum / computedSpeedCount) * 3.6,
			computedSpeedMax: computedSpeedMax * 3.6,
			computedSpeedMin: computedSpeedMin * 3.6,
			computedElevationAvg: computedElevationSum / computedElevationCount,
			computedElevationMax,
			computedElevationMin,
			elevationAvg: elevationSum / elevationCount,
			elevationMax,
			elevationMin,
			movingDuration: movingTime,
			duration: pointsToCompute[pointsToCompute.length - 1].time.getTime() - pointsToCompute[0].time.getTime(),
			length2D,
			length3D,
			downhillDist,
			uphillDist,
		};
		return res;
	}, [allPoints, props.activeSelection]);

	const { classes } = useStyles();

	return (
		<Card sx={{ width: '100%' }}>
			<CardContent>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: '1fr auto',
					}}
				>
					<Typography fontSize={'1.2em'} sx={{ gridColumn: 'span 2' }}>
						{t('trackAnalyzer.title')}
					</Typography>
					<Box sx={{ gridColumn: 'span 2', marginBottom: '5px' }}>
						<Tabs value={currentTab} onChange={(event, value) => setCurrentTab(value)}>
							{tabTypes.map((type) => (
								<Tab
									sx={{ fontSize: '0.8rem' }}
									key={`tab-${type}`}
									label={t(`trackAnalyzer.tabs.${type}`)}
									value={type}
								/>
							))}
						</Tabs>
					</Box>
					{currentTab === 'speed' && (
						<>
							{dataToDisplay.speedAvg > 0 && (
								<>
									<Typography className={classes.dataLine}>
										{t('trackAnalyzer.speedAverage')}
									</Typography>
									<Typography className={classnames(classes.dataLine, classes.dataValue)}>
										{dataToDisplay.speedAvg.toFixed(2)}km/h
									</Typography>
								</>
							)}
							{dataToDisplay.computedSpeedAvg > 0 && (
								<>
									<Typography
										className={
											dataToDisplay.speedAvg > 0 ? classes.extraDataLine : classes.dataLine
										}
									>
										{t('trackAnalyzer.computedSpeedAverage')}
									</Typography>
									<Typography
										className={classnames(
											dataToDisplay.speedAvg > 0 ? classes.extraDataLine : classes.dataLine,
											classes.dataValue
										)}
									>
										{dataToDisplay.computedSpeedAvg.toFixed(2)}km/h
									</Typography>
								</>
							)}
							{dataToDisplay.speedMax > 0 && (
								<>
									<Typography className={classes.dataLine}>{t('trackAnalyzer.speedMax')}</Typography>
									<Typography className={classnames(classes.dataLine, classes.dataValue)}>
										{dataToDisplay.speedMax.toFixed(2)}km/h
									</Typography>
								</>
							)}
							{dataToDisplay.computedSpeedMax > 0 && (
								<>
									<Typography
										className={
											dataToDisplay.speedMax > 0 ? classes.extraDataLine : classes.dataLine
										}
									>
										{t('trackAnalyzer.computedSpeedMax')}
									</Typography>
									<Typography
										className={classnames(
											dataToDisplay.speedMax > 0 ? classes.extraDataLine : classes.dataLine,
											classes.dataValue
										)}
									>
										{dataToDisplay.computedSpeedMax.toFixed(2)}km/h
									</Typography>
								</>
							)}
							{dataToDisplay.speedMin > 0 && (
								<>
									<Typography className={classes.dataLine}>{t('trackAnalyzer.speedMin')}</Typography>
									<Typography className={classnames(classes.dataLine, classes.dataValue)}>
										{dataToDisplay.speedMin.toFixed(2)}km/h
									</Typography>
								</>
							)}
							{dataToDisplay.computedSpeedMin > 0 && (
								<>
									<Typography
										className={
											dataToDisplay.speedMin > 0 ? classes.extraDataLine : classes.dataLine
										}
									>
										{t('trackAnalyzer.computedSpeedMin')}
									</Typography>
									<Typography
										className={classnames(
											dataToDisplay.speedMin > 0 ? classes.extraDataLine : classes.dataLine,
											classes.dataValue
										)}
									>
										{dataToDisplay.computedSpeedMin.toFixed(2)}km/h
									</Typography>
								</>
							)}
						</>
					)}
					{currentTab === 'elevation' && (
						<>
							{dataToDisplay.elevationAvg > 0 && (
								<>
									<Typography className={classes.dataLine}>
										{t('trackAnalyzer.elevationAverage')}
									</Typography>
									<Typography className={classnames(classes.dataLine, classes.dataValue)}>
										{dataToDisplay.elevationAvg.toFixed(0)}m
									</Typography>
								</>
							)}
							{dataToDisplay.computedElevationAvg > 0 && (
								<>
									<Typography
										className={
											dataToDisplay.elevationAvg > 0 ? classes.extraDataLine : classes.dataLine
										}
									>
										{t('trackAnalyzer.computedElevationAverage')}
									</Typography>
									<Typography
										className={classnames(
											dataToDisplay.elevationAvg > 0 ? classes.extraDataLine : classes.dataLine,
											classes.dataValue
										)}
									>
										{dataToDisplay.computedElevationAvg.toFixed(0)}m
									</Typography>
								</>
							)}
							{dataToDisplay.elevationMax > 0 && (
								<>
									<Typography className={classes.dataLine}>
										{t('trackAnalyzer.elevationMax')}
									</Typography>
									<Typography className={classnames(classes.dataLine, classes.dataValue)}>
										{dataToDisplay.elevationMax.toFixed(0)}m
									</Typography>
								</>
							)}
							{dataToDisplay.computedElevationMax > 0 && (
								<>
									<Typography
										className={
											dataToDisplay.elevationMax > 0 ? classes.extraDataLine : classes.dataLine
										}
									>
										{t('trackAnalyzer.computedElevationMax')}
									</Typography>
									<Typography
										className={classnames(
											dataToDisplay.elevationMax > 0 ? classes.extraDataLine : classes.dataLine,
											classes.dataValue
										)}
									>
										{dataToDisplay.computedElevationMax.toFixed(0)}m
									</Typography>
								</>
							)}
							{dataToDisplay.elevationMin > 0 && (
								<>
									<Typography className={classes.dataLine}>
										{t('trackAnalyzer.elevationMin')}
									</Typography>
									<Typography className={classnames(classes.dataLine, classes.dataValue)}>
										{dataToDisplay.elevationMin.toFixed(0)}m
									</Typography>
								</>
							)}
							{dataToDisplay.computedElevationMin > 0 && (
								<>
									<Typography
										className={
											dataToDisplay.elevationMin > 0 ? classes.extraDataLine : classes.dataLine
										}
									>
										{t('trackAnalyzer.computedElevationMin')}
									</Typography>
									<Typography
										className={classnames(
											dataToDisplay.elevationMin > 0 ? classes.extraDataLine : classes.dataLine,
											classes.dataValue
										)}
									>
										{dataToDisplay.computedElevationMin.toFixed(0)}m
									</Typography>
								</>
							)}
						</>
					)}
					{currentTab === 'misc' && (
						<>
							<Typography className={classes.dataLine}>{t('trackAnalyzer.duration')}</Typography>
							<Typography className={classnames(classes.dataLine, classes.dataValue)}>
								{milliSecondsToHoursString(dataToDisplay.duration)}
							</Typography>
							<Typography className={classes.extraDataLine}>
								{t('trackAnalyzer.movingDuration')}
							</Typography>
							<Typography className={classnames(classes.extraDataLine, classes.dataValue)}>
								{milliSecondsToHoursString(dataToDisplay.movingDuration)}
							</Typography>
							<Typography className={classes.dataLine}>{t('trackAnalyzer.length')}</Typography>
							<Typography className={classnames(classes.dataLine, classes.dataValue)}>
								{dataToDisplay.length3D.toFixed(0)}m
							</Typography>
							<Typography className={classes.extraDataLine}>{t('trackAnalyzer.2Dlength')}</Typography>
							<Typography className={classnames(classes.extraDataLine, classes.dataValue)}>
								{dataToDisplay.length2D.toFixed(0)}m
							</Typography>
							<Typography className={classes.dataLine}>{t('trackAnalyzer.downhill')}</Typography>
							<Typography className={classnames(classes.dataLine, classes.dataValue)}>
								{dataToDisplay.downhillDist.toFixed(0)}m
							</Typography>
							<Typography className={classes.dataLine}>{t('trackAnalyzer.uphill')}</Typography>
							<Typography className={classnames(classes.dataLine, classes.dataValue)}>
								{dataToDisplay.uphillDist.toFixed(0)}m
							</Typography>
						</>
					)}
				</Box>
			</CardContent>
		</Card>
	);
}

const useStyles = makeStyles()((theme) => ({
	dataLine: {
		fontSize: '1rem',
	},
	extraDataLine: {
		fontSize: '0.8rem',
		fontStyle: 'italic',
	},
	dataValue: {
		justifySelf: 'end',
	},
}));
