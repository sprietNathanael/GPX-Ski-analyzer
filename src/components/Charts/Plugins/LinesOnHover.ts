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
		const activeElements = chart.tooltip?.getActiveElements();

		if (!activeElements || activeElements.length === 0 || (!options.vertical && !options.horizontal)) return;

		let datasets = chart.data.datasets;
		let axes = chart.scales;

		const ctx = chart.ctx;
		const { chartArea } = chart;

		ctx.save();
		ctx.beginPath();

		ctx.lineWidth = options.style.width;
		ctx.strokeStyle = options.style.style;
		if (options.style.lineDash) {
			ctx.setLineDash(options.style.lineDash);
		}

		if (options.vertical) {
			ctx.moveTo(activeElements[0].element.x, chartArea.top);
			ctx.lineTo(activeElements[0].element.x, chartArea.bottom);
		}

		if (options.horizontal) {
			for (let element of activeElements) {
				let dataset = datasets[element.datasetIndex];
				if (dataset && dataset.yAxisID && axes[dataset.yAxisID]) {
					let axis = axes[dataset.yAxisID];
					if (axis.position === 'left') {
						ctx.moveTo(chartArea.left, element.element.y);
						ctx.lineTo(element.element.x, element.element.y);
					} else {
						ctx.moveTo(element.element.x, element.element.y);
						ctx.lineTo(chartArea.right, element.element.y);
					}
				} else {
					ctx.moveTo(chartArea.left, element.element.y);
					ctx.lineTo(chartArea.right, element.element.y);
				}
			}
		}
		ctx.stroke();
		ctx.restore();
	},
};

export default LinesOnHover;
