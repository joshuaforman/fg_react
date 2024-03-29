import axios from 'axios';

import config from '../config.js';
import { getAxiosConfig } from './actionFunctions';


export function fetchStagedPeople() {

  return function(dispatch) {
    dispatch({type: 'FETCH_STAGINGPEOPLE'});
    axios.get(config.api_url + '/api/v2/staging/people', getAxiosConfig())
      .then((response) => {
        dispatch({type: 'FETCH_STAGINGPEOPLE_FULFILLED', payload: response.data})
      })
      .catch((err) => {
        dispatch({type: 'FETCH_STAGINGPEOPLE_REJECTED', payload: err})
      })
  }
}

export function updateStagedPerson(_id, field, value) {

  const body = {
    object : {
      _id,
      field,
      value
    }
  };

  return function(dispatch) {
    dispatch({type: 'UPDATE_STAGINGPERSON'});
    axios.post(config.api_url + '/api/v2/staging/person/update', body, getAxiosConfig())
      .then((response) => {
        dispatch({type: 'UPDATE_STAGINGPERSON_FULFILLED', payload: response.data})
      })
      .catch((err) => {
        dispatch({type: 'UPDATE_STAGINGPERSON_REJECTED', payload: err})
      })
  }
}
