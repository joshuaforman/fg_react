import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Modal from 'react-modal';

import EventLineItem from './event-lineitem';
import PairBondRelLineItem from './pairbondrel-lineitem';
import ParentalRelLineItem from './parentalrel-lineitem';
import ParentalRelLineItemEdit from './parentalrel-lineitem-edit';
import PeopleDetailsLineItem from './peopledetails-lineitem';
import ChildLineItem from './child-lineitem';
import { createEvent } from '../../actions/eventsActions';
import { createPerson } from '../../actions/peopleActions';
import { createPairBondRel } from '../../actions/pairBondRelsActions';
import { createParentalRel } from '../../actions/parentalRelsActions';
import { closeModal, openModal} from '../../actions/modalActions';
import { updateHelpMessage } from '../../actions/helpMessageActions';

@connect(
	(store, ownProps) => {

		// this finds the children of the person whose page we are looking at. First it filters the parentalRel records to find all the places this person is the parent. Then it maps the children to the people collection to get their names and person ids
    	var children = store.parentalRels.parentalRels.filter((parentRel) => {
    		return (parentRel.parent_id === ownProps.params.star_id);
    	}).map((parentRel) => {
    		// do a search to get the other fields we need
    		var person = store.people.people.find(function(p) {
				return parentRel.child_id === p._id;
			 });
    		return person;
    	});

		return {
			star:
				store.people.people.find((p) => {
					return p._id === ownProps.params.star_id;
				}),
			events:
				store.events.events.filter((e) => {
					return e.person_id === ownProps.params.star_id;
				}),
			// get all pair bonds where the star of the page is either personOne or personTwo
			pairBondRels:
				store.pairBondRels.pairBondRels.filter((r) => {
					return (r.personOne_id === ownProps.params.star_id ||
						r.personTwo_id === ownProps.params.star_id);
				}),
			// only get the parental rels where the star of the page is the child in the relationship.
			parentalRels:
				store.parentalRels.parentalRels.filter((t) => {
					return (t.child_id === ownProps.params.star_id);
				}),
      		children:
        		children,
			modalIsOpen:
				store.modal.modalIsOpen,
		};
	},
	(dispatch) => {
		return {
			createEvent: (star_id) => {
				dispatch(createEvent("", null, star_id, "", "", "", "", ""));
			},
			createPairBondRel: (star_id) => {
				dispatch(createPairBondRel(star_id, null, "", "", "", "", ""));
			},
			createParentalRel: (star_id) => {
				dispatch(createParentalRel(star_id, null, "", "", "", "", "", ""));
			},
			createPerson: () => {
				dispatch(createPerson());
			},
			updateHelpMessage: (msg) => {
				dispatch(updateHelpMessage(msg));
			},
		}
	}
)
export default class PeopleDetails extends React.Component {
constructor(props) {
	super(props);
}

	updateHelpMessage = () => {
		this.props.updateHelpMessage('This is the people details page');
	}

	createPerson = () => {
		this.props.createPerson();
	}

	createPairBondRel = () => {
		this.props.createPairBondRel(this.props.star._id);
	}

	createParentalRel = () => {
		this.props.createParentalRel(this.props.star._id);
	}

	createEvent = () => {
		this.props.createEvent(this.props.star._id);
	}

	render = () => {

		const { star, events, pairBondRels, parentalRels, allDataIn, children, modalIsOpen } = this.props;

		const mappedEvents = events.map(event =>
			<EventLineItem event={event} key={event._id}/>
		);

		const mappedPairBondRels = pairBondRels.map(pairBondRel =>
			<PairBondRelLineItem pairBondRel={pairBondRel} key={pairBondRel._id} person={star}/>
		);

		const mappedParentalRels = parentalRels.map(parentalRel =>
			<ParentalRelLineItem parentalRel={parentalRel} key={parentalRel._id}/>
		);

    const mappedChildren = children.map(child =>
      <ChildLineItem child={child} key={child._id}/>
    );

		return (
		<div class="main-detail" ref={(ref) => this._div = ref}>
			<div class="header-div">
				<h1 class="family-header">Personal Connections</h1>
			</div>
			<div id="detail-name">
				<PeopleDetailsLineItem person={star} />
			</div>
			<div class="buffer-line">
			</div>
			<div class="outerContainer">
				<div class="detailRow">
					<div class="innerInfo">
						<div class="titleRow" onClick={this.createParentalRel}>
							<div class="blank-person-header">
							</div>
							<p class="detail-title">Parents</p>
							<div class="buttonSize">
								<i class="fa-plus-square fa plus">
								</i>
							</div>
						</div>
						<div class="buffer-div">
						</div>
						<div class="mappings">
							{mappedParentalRels}
						</div>
				</div>
				<div class="innerInfo">
					<div class="titleRow" onClick={this.createPairBondRel}>
						<div class="blank-person-header">
						</div>
						<p class="detail-title">Pair Bonds</p>
						<div class="buttonSize">
							<i class="fa-plus-square fa plus" ></i>
						</div>
					</div>
					<div class="buffer-div">
					</div>
					<div class="mappings">
						{mappedPairBondRels}
					</div>
				</div>
				</div>
				<div class="detailRow">
					<div class="innerInfo">
							<div class="titleRow">

								<p class="detail-title">Children</p>
							</div>
							<div class="mappings">
								{mappedChildren}
							</div>
					</div>
					<div class="innerInfo">
						<div class="titleRow" onClick={this.createEvent}>
							<div class="blank-person-header">
							</div>
							<p class="detail-title">Chronology</p>
							<div class="buttonSize">
								<i class="fa-plus-square fa plus"
								>
								</i>
							</div>
						</div>
						<div class="buffer-div">
						</div>
						<div class="mappings">
							{mappedEvents}
						</div>
					</div>
				</div>
			</div>
		</div>
		);
	}

	componentDidUpdate() {
		ReactDOM.findDOMNode(this).scrollIntoView();
	}

	componentDidMount() {
		this.props.updateHelpMessage('This is the people details page');
	}
}
