// https://stackoverflow.com/questions/53446020/how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
import { EffectCallback, useEffect, useRef } from 'react';

export default function usePreviousValue<T>(value: T) {
	const ref = useRef<T>(undefined);
	useEffect(() => {
		ref.current = value;
	});
	return ref.current;
}

export function useEffectDebugger(effectHook: EffectCallback, dependencies: any) {
	const previousDeps = usePreviousValue(dependencies);

	const changedDeps = dependencies.reduce((accum: any, dependency: any, index: number) => {
		if (previousDeps && dependency !== previousDeps[index]) {
			const keyName = index;
			return {
				...accum,
				[keyName]: {
					before: previousDeps[index],
					after: dependency,
				},
			};
		}

		return accum;
	}, {});

	useEffect(effectHook, dependencies);
}
