import { Chart, Plugin } from 'chart.js';

const selectionState = new WeakMap<Chart, SelectionState>();

export type SelectionState = {
	startX: number | null;
	endX: number | null;
	dragging: boolean;
};

export interface SelectionWindowOptions {
	onSelection?: (start: number, end: number) => void;
	onSelectionReset?: () => void;
}

const SelectionWindow: Plugin<'line', SelectionWindowOptions> = {
	id: 'selectionWindow',
	afterDraw: (chart) => {
		const currentSelction = selectionState.get(chart);
		if (!currentSelction || currentSelction.startX === null || currentSelction.endX === null) return;

		const { ctx, chartArea } = chart;

		const left = Math.min(currentSelction.startX, currentSelction.endX);
		const right = Math.max(currentSelction.startX, currentSelction.endX);

		ctx.save();

		ctx.fillStyle = 'rgba(100,150,255,0.2)';
		ctx.fillRect(left, chartArea.top, right - left, chartArea.bottom - chartArea.top);

		ctx.restore();
	},
	afterEvent: (chart, args, options) => {
		const event = args.event;
		if (!selectionState.has(chart)) {
			selectionState.set(chart, {
				startX: null,
				endX: null,
				dragging: false,
			});
		}
		const currentSelection = selectionState.get(chart)!;

		if (event.type === 'dblclick' && options.onSelectionReset) {
			options.onSelectionReset();
		} else if (event.type === 'mousedown') {
			currentSelection.startX = event.x;
			currentSelection.endX = event.x;
			currentSelection.dragging = true;
			args.changed = true;
		} else if (event.type === 'mouseup' || event.type === 'mouseout') {
			if (
				options.onSelection &&
				currentSelection.startX !== null &&
				currentSelection.endX !== null &&
				currentSelection.startX !== currentSelection.endX
			) {
				const from = Math.min(currentSelection.startX, currentSelection.endX);
				const to = Math.max(currentSelection.startX, currentSelection.endX);
				const xScale = chart.scales.x;
				let start = xScale.getValueForPixel(from);
				let end = xScale.getValueForPixel(to);

				if (start !== undefined && end !== undefined) {
					options.onSelection(start, end);
				}
			}

			currentSelection.dragging = false;
			currentSelection.startX = null;
			currentSelection.endX = null;
			args.changed = true;
		} else if (event.type === 'mousemove' && currentSelection.dragging) {
			currentSelection.endX = event.x;
			args.changed = true;
		}
	},
};

export default SelectionWindow;
