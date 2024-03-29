// this is just storing static values, so no need for actions
export default function reducer(
	state = {
		pairBondRelTypes: [
			{ value: 'Marriage', label: 'Marriage' },
			{ value: 'Mated', label: 'Mated' },
			{ value: 'Casual', label: 'Casual' },
			{ value: 'Extra-Marital', label: 'Extra-Marital' },
			{ value: 'Extra-Marital-Mated', label: 'Extra-Marital-Mated' },
			{ value: 'Stranger', label: 'Stranger' },
			{ value: 'Coersive', label: 'Coersive' },
			{ value: 'Restitution', label: 'Restitution' },
		],
		fetching: false,
		error: null,
	},
	action = ""
) {
	return state;
}
