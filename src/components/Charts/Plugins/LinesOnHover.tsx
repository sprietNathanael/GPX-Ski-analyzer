import { Plugin } from 'chart.js';

interface LineOption {
	width: number;
	style: CanvasFillStrokeStyles['strokeStyle'];
	lineDash?: Iterable<number>;
}

export interface LinesOnHoverOptions {
	vertical?: boolean;
	horizontal?: boolean;
	style: LineOption;
}

const LinesOnHover: Plugin<'line', LinesOnHoverOptions> = {
	id: 'linesOnHover',
	afterDraw: (chart, _args, options) => {
		const active = chart.tooltip?.getActiveElements();

		if (!active || active.length === 0 || (!options.vertical && !options.horizontal)) return;

		const ctx = chart.ctx;
		const { chartArea } = chart;

		const x = active[0].element.x;
		const y = active[0].element.y;
		ctx.save();
		ctx.beginPath();

		ctx.lineWidth = options.style.width;
		ctx.strokeStyle = options.style.style;
		if (options.style.lineDash) {
			ctx.setLineDash(options.style.lineDash);
		}

		if (options.vertical) {
			ctx.moveTo(x, chartArea.top);
			ctx.lineTo(x, chartArea.bottom);
		}

		if (options.horizontal) {
			ctx.moveTo(chartArea.left, y);
			ctx.lineTo(chartArea.right, y);
		}
		ctx.stroke();
		ctx.restore();
	},
};

export default LinesOnHover;
