export default function reducer(state={
  stagedPeople : [],
  fetched : false,
  fetching : false,
  error : null,
}, action) {

  switch(action.type) {
    case "FETCH_STAGINGPEOPLE": {
      return {...state, fetching: true}
    }
    case "FETCH_STAGINGPEOPLE_REJECTED": {
      return {...state, fetching: false, error: action.payload}
    }
    case "FETCH_STAGINGPEOPLE_FULFILLED": {
      console.log('fulfilled fetching', action.payload)
      return {...state, fetching: false, stagedPeople: action.payload}
    }
  }
  return state

}