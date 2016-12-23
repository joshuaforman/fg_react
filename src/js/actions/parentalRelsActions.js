import axios from "axios";
import cookie from "react-cookie";

import config from "../config.js";

const fgtoken = cookie.load('fg-access-token');

var axiosConfig = {
	headers: {'x-access-token': fgtoken}
};

export function fetchParentalRels() {

	return function(dispatch) {
		dispatch({type: "FETCH_PARENTALRELS"});
		axios.get(config.api_url + "/api/v2/parentalrels", axiosConfig)
			.then((response) => {
				dispatch({type: "FETCH_PARENTALRELS_FULFILLED", payload: response.data})
			})
			.catch((err) => {
				dispatch({type: "FETCH_PARENTALRELS_REJECTED", payload: err})
			})
	}
}

export function updateParentalRel(_id, field, value) {
	const body = {
		object: {
			_id,
			field,
			value
		}
	};

	return (dispatch) => {
		dispatch({type: "UPDATE_PARENTALREL"});
		axios.post(config.api_url + "/api/v2/parentalrel/update", body, axiosConfig)
			.then((response) => {
				dispatch({type: "UPDATE_PARENTALREL_FULFILLED", payload: response.data})
			})
			.catch((err) => {
				dispatch({type: "UPDATE_PARENTALREL_REJECTED", payload: err})
			})
	}
}
