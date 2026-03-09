import { ChartType } from 'chart.js';
import { LinesOnHoverOptions } from './LinesOnHover';

declare module 'chart.js' {
	interface PluginOptionsByType<TType extends ChartType> {
		linesOnHover?: LinesOnHoverOptions;
	}
}
