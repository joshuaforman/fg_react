import React from 'react';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import moment from 'moment';
import { createPerson, deletePerson } from '../../actions/peopleActions';

import DateInput from '../date-input';

@connect(
	(store, ownProps) => {
		// console.log('in staged-peoplesearch-lineitem@connect with: ', store);
		return {}
	},
	(dispatch) => {
		return {
			createPerson: () => {
				dispatch(createPerson());
			},
			deletePerson: (_id) => {
				dispatch(deletePerson());
			}
		}
	}
)

export default class StagedPeopleSearchLineItem extends React.Component {

	addToRecords = () => {
		console.log(this.props)
		this.props.createPerson();
		this.props.deletePerson(this.props.stagedPerson._id);
	}

	openDetails = () => {
		hashHistory.push('/stagedpeopledetails/' + this.props.stagedPerson._id);
	}

	getUpdateDate = (field, displayDate, setDate) => {
		return (field, displayDate, setDate) => {
			console.log("In StagedPeopleSearchLineItem updateDate, with: ", field, displayDate, setDate);
		}
	}

	newDate = (date) => {
		try {
			var nDate = moment(date).format('MMM DD YYYY');
			if (nDate === 'Invalid date') {
				nDate = '';
			}
			return nDate
		}
		catch(TypeError) {
			return '';
		}
	}

	render = () => (
		<div class="row person-item">

			<div class="col-xs-2 custom-input">
				<input
					class="form-control"
					type="text"
					defaultValue={this.props.stagedPerson.fName}
				/>
			</div>

			<div class="col-xs-2 custom-input">
				<input
					class="form-control"
					type="text"
					defaultValue={this.props.stagedPerson.lName}
				/>
			</div>

			<div class="col-xs-1 custom-input">
				<input
					class="form-control"
					type="text"
					defaultValue={this.props.stagedPerson.sexAtBirth}
				/>
			</div>

			<div class="col-xs-2 custom-input">
				<DateInput defaultValue={this.newDate(this.props.stagedPerson.birthDate)} field="testDate" updateFunction={this.getUpdateDate().bind(this)} />
			</div>

			<div class="col-xs-2 custom-input">
				<DateInput defaultValue={this.newDate(this.props.stagedPerson.deathDate)} field="testDate" updateFunction={this.getUpdateDate().bind(this)} />
			</div>

			<div class="col-xs-1 custom-input">
				<button
					class="form-control"
					onClick={this.openDetails}
				>
					Import Details
				</button>
			</div>

			<div class="col-xs-1 custom-input">
				<button
					class="form-control"
					onClick={this.addToRecords}
				>
					Add To DB
				</button>
			</div>
		</div>
	);
}