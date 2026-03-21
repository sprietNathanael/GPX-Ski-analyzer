import { ChartType } from 'chart.js';
import { SelectionWindowOptions } from './SelectionWindow';

declare module 'chart.js' {
	interface PluginOptionsByType<TType extends ChartType> {
		selectionWindow?: SelectionWindowOptions;
	}
}
