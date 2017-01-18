import { combineReducers } from 'redux'

import events from './eventsReducer'
import eventTypes from './eventTypesReducer'
import modal from './modalReducer'
import pairBondRels from './pairBondRelsReducer'
import parentalRels from './parentalRelsReducer'
import parentalRelTypes from './parentalRelTypesReducer'
import parentalRelSubTypes from './parentalRelSubTypesReducer'
import people from './peopleReducer'
import user from './userReducer'
import stagedPeople from './stagedPeopleReducer'
import importPeople from './importPeopleReducer'
import newPerson from './newPersonReducer'


export default combineReducers({
  events,
  eventTypes,
  modal,
  pairBondRels,
  parentalRels,
  parentalRelTypes,
  parentalRelSubTypes,
  people,
  user,
  stagedPeople,
  importPeople,
  newPerson,
})
