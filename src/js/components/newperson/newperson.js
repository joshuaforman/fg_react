import React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import DateInput from '../date-input';
// import { updatePerson, updateEvent } from '../../actions/peopleActions';
import { updateParentalRel } from '../../actions/parentalRelsActions';
import { closeNewPersonModal } from '../../actions/modalActions';
import { createNewPerson } from '../../actions/createNewPersonActions';
// import { resetModalEvent } from '../../actions/modalActions';

/* the following is the code that needs to be inserted into the parent component render method where you will call this modal to open.
You can look in the peoplesearch component for an example of a component that calls this component

  <Modal
        isOpen={modalIsOpen}
        contentLabel="Modal"
        style={modalStyle}
      >
        <NewPerson/>
      </Modal>

*/

@connect(
  (store, ownProps) => {
    return {
      ...ownProps,
      peopleArray:
          store.people.people.map(function(person) {
            var newObj = {};
            var label = person.fName + ' ' + person.lName;
            var value = person._id;
            newObj["value"] = value;
            newObj["label"] = label;
            return newObj;
          }),
      eventTypes:
        store.eventTypes.eventTypes,
      parentalRelTypes:
          store.parentalRelTypes.parentalRelTypes,
      parentalRelSubTypes:
          store.parentalRelSubTypes.parentalRelSubTypes,
    };
  },
  (dispatch) => {
    return {
      closeNewPersonModal: () => {
        dispatch(closeNewPersonModal());
      },
      createNewPerson: (person, event, parentRel1, parentRel2) => {
        dispatch(createNewPerson(person, event, parentRel1, parentRel2));
      },
    }
  }
)

export default class NewPerson extends React.Component {
  constructor(props) {
  	super(props);
  	console.log("in new Person State", this.props);

  	this.state = {
      // set all initial values for the new person modal.
      personFName: '',
      personMName: '',
      personLName: '',
      personSexAtBirth: '',
  		eventDate: '',
  		eventDateUser: '',
      // We are suggesting to the end user that they enter a birth date
  		eventType: 'Birth',
  		eventPlace: '',
      parent_id1: '',
      // We suggest they enter a biological mother
      relationshipType1: 'Mother',
      subType1: 'Biological',
			parentStartDate1: '',
			parentStartDateUser1: '',
			parentEndDate1: '',
			parentEndDateUser1: '',
      parent_id2: '',
      // We suggest they enter a biological father
      relationshipType2: 'Father',
      subType2: 'Biological',
      parentStartDate2: '',
      parentStartDateUser2: '',
      parentEndDate2: '',
      parentEndDateUser2: '',
  	};
  }

  tempEventDate = (parsedDate, userDate) => {
    this.setState({
      eventDateUser: userDate,
      eventDate: parsedDate
    });
  }
  tempEventType = (evt) => {
    this.setState({eventType: evt.value});
    // console.log(this.state, "inside eventType");
  }
  tempEventPlace = (evt) => {
    this.setState({eventPlace: evt.target.value});
  }
  tempSubTypeChange1 = (evt) => {
		this.setState({subType1: evt.value});
    // console.log(this.state, "inside tempsubtypechange1");

	}
 	tempParentChange1 = (evt) => {
		this.setState({parent_id1: evt.value});
    // console.log(this.state, "inside tempParentchange1");
	}
	tempRelTypeChange1 = (evt) => {
		this.setState({relationshipType1: evt.value});
    // console.log(this.state, "inside tempReltypechange1");
	}
  tempParentStartDate1 = (parsedDate, userDate) => {
    this.setState({
      parentStartDateUser1: userDate,
      parentStartDate1: parsedDate
    });
  }
  tempParentEndDate1 = (parsedDate, userDate) => {
    this.setState({
      parentEndDateUser1: userDate,
      parentEndDate1: parsedDate
    });
  }

  tempSubTypeChange2 = (evt) => {
		this.setState({subType2: evt.value})
	}
 	tempParentChange2 = (evt) => {
		this.setState({parent_id2: evt.value});
	}
	tempRelTypeChange2 = (evt) => {
		this.setState({relationshipType2: evt.value});
	}
  tempParentStartDate2 = (parsedDate, userDate) => {
		this.setState({
			parentStartDateUser2: userDate,
			parentStartDate2: parsedDate
		});
	}
	tempParentEndDate2 = (parsedDate, userDate) => {
		this.setState({
			parentEndDateUser2: userDate,
			parentEndDate2: parsedDate
		});
	}
  tempFName = (evt) => {
    // console.log('in tempChange: ', evt.target.value);
    this.setState({personFName: evt.target.value});
  }
  tempMName = (evt) => {
    // console.log("inside eventPlace ", evt.target.value);
    this.setState({personMName: evt.target.value});
  }
  tempLName = (evt) => {
    // console.log("inside eventPlace ", evt.target.value);
    this.setState({personLName: evt.target.value});
  }
  tempSexAtBirth = (evt) => {
    // console.log("inside eventPlace ", evt.target.value);
    this.setState({personSexAtBirth: evt.target.value});
  }

  closeModal = () => {
    this.props.closeNewPersonModal();
  }
  cancelButton = () => {
    this.props.closeNewPersonModal();
  }

  savePerson = () => {
    console.log("State: ", this.state);
    // first, check to make sure all the data that is needed is valid
    if (!this.state.personFName) {
      alert('Must enter a valid first name');
      return;
    }
    if (!this.state.eventDate) {
      alert('Must enter a valid birth date');
      return;
    }
    if (this.state.eventType !== 'Birth') {
      alert("Must enter a birth date, please make sure the event type is set to Birth");
      return;
    }

    var person = {
      fName: this.state.personFName,
      mName: this.state.personMName,
      lName: this.state.personLName,
      sexAtBirth: this.state.personSexAtBirth
    };

    var birthEvent = {
      eventType: this.state.eventType,
      eventPlace: this.state.eventPlace,
      eventDate: this.state.eventDate,
      eventDateUser: this.state.eventDateUser,

    }

    var parentalRel1 = {
      parent_id: this.state.parent_id1,
      relationshipType: this.state.relationshipType1,
      subType: this.state.subType1,
      startDate: this.state.parentStartDate1,
      startDateUser: this.state.parentStartDateUser1,
      endDate: this.state.parentEndDate1,
      endDateUser: this.state.parentEndDateUser1,
    }

    var parentalRel2 = {
      parent_id: this.state.parent_id2,
      relationshipType: this.state.relationshipType2,
      subType: this.state.subType2,
      startDate: this.state.parentStartDate2,
      startDateUser: this.state.parentStartDateUser2,
      endDate: this.state.parentEndDate2,
      endDateUser: this.state.parentEndDateUser2,
    }
    this.props.createNewPerson(person, birthEvent, parentalRel1, parentalRel2);

  }

  render = () => {

      return(
      <div>
        <div class="modalClose2">
          <i class="fa fa-window-close-o fa-2x" aria-hidden="true" onClick={this.closeModal}></i>
        </div>
        <div class="modalH">
            New Person
        </div>
        <div class="buffer-modal">
        </div>
        {/*<CompactPeopleDetails person={this.props.person} key={this.props.person._id}/>*/}
          <div class="compactPerson">
    				<div class="personDetails">
    					<div class="pDetail">
    						<input
    							class="form-control"
    							type="text"
    							placeholder="Enter First Name"
                  value={this.state.personFName}
    							onChange={this.tempFName}
    						/>
    						<input
    							class="form-control detail-input"
    							type="text"
    							placeholder="Enter Middle Name"
                  value={this.state.personMName}
                  onChange={this.tempMName}
    						/>
    				</div>
    				<div class="pDetail">
    					<input
    						class="form-control detail-input"
    						type="text"
    						placeholder="Enter Last Name"
    						value={this.state.personLName}
                onChange={this.tempLName}
    					/>
    					<input
    						class="form-control detail-input"
    						type="text"
    						placeholder="Enter Gender At Birth"
    						value={this.state.personSexAtBirth}
                onChange={this.tempSexAtBirth}
    					/>
    				</div>
    			</div>
    			<div class="buffer-modal">
    			</div>
    		</div>
        <div class="event-main">
          <div class="event-row">
            <div class="PR-div">
              <div class="PR-title">
                Date
              </div>
              <div class="PR-drop-1">
                <DateInput
                  onNewDate={this.tempEventDate}
                  initialValue={this.state.eventDateUser}
                  field="eventDate"
                />
              </div>
            </div>
          </div>
          <div class="event-row">
            <div class="PR-div">
              <div class="PR-title">
                Type
              </div>
              <div class="PR-drop-1">
                <Select
                  options={this.props.eventTypes}
                  onChange={this.tempEventType}
                  value={this.state.eventType}
                />
              </div>
            </div>
            <div class="PR-div">
              <div class="PR-title">
                Place
              </div>
              <div class="PR-drop-1">
                <input
                    class="form-control"
                    type="text"
                    value={this.state.eventPlace}
                    onChange={this.tempEventPlace}
                />
              </div>
            </div>
          </div>
        </div>
        <div class="bufferModal2">
				</div>
        <div>
          <div class="PR-main">
					<div class="PR-row-1">
						<div class="PR-div">
							<div class="PR-title">
								Parent Name
							</div>
							<div class="PR-drop-name">
								<Select
									options={this.props.peopleArray}
									onChange={this.tempParentChange1}
									value={this.state.parent_id1}
								/>
							</div>
						</div>
					</div>
					<div class="PR-row-2">
						<div class="PR-sub-div">
							<div class="PR-div">
								<div class="PR-title">
									Relationship
								</div>
								<div class="PR-drops">
									<div class="PR-drop-2">
										<Select
											options={this.props.parentalRelTypes}
											onChange={this.tempRelTypeChange1}
											value={this.state.relationshipType1}
										/>
									</div>
								</div>
							</div>
							<div class="PR-div">
								<div class="PR-title">
									Sub Type
								</div>
								<div class="PR-drops">
									<div class="PR-drop-2">
										<Select
											options={this.props.parentalRelSubTypes}
											onChange={this.tempSubTypeChange1}
											value={this.state.subType1}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="PR-row-3">
						<div class="PR-date-div">
							<div class="PR-title">
							Start Date
							</div>
							<div class="PR-sDate">
								<DateInput
									initialValue={this.state.parentStartDateUser1}
									onNewDate={this.tempParentStartDate1}
									field="startDate"
								/>
							</div>
						</div>
						<div class="PR-date-div">
							<div class="PR-title">
							End Date
							</div>
							<div class="PR-eDate">
								<DateInput
									initialValue={this.state.parentEndDateUser1}
									onNewDate={this.tempParentEndDate1}
									field="endDate"
								/>
							</div>
						</div>
					</div>
					<div class="buffer-modal">
					</div>
				</div>
        <div class="PR-main">
					<div class="PR-row-1">
						<div class="PR-div">
							<div class="PR-title">
								Parent Name
							</div>
							<div class="PR-drop-name">
								<Select
									options={this.props.peopleArray}
									onChange={this.tempParentChange2}
									value={this.state.parent_id2}
								/>
							</div>
						</div>
					</div>
					<div class="PR-row-2">
						<div class="PR-sub-div">
							<div class="PR-div">
								<div class="PR-title">
									Relationship
								</div>
								<div class="PR-drops">
									<div class="PR-drop-2">
										<Select
											options={this.props.parentalRelTypes}
											onChange={this.tempRelTypeChange2}
											value={this.state.relationshipType2}
										/>
									</div>
								</div>
							</div>
							<div class="PR-div">
								<div class="PR-title">
									Sub Type
								</div>
								<div class="PR-drops">
									<div class="PR-drop-2">
										<Select
											options={this.props.parentalRelSubTypes}
											onChange={this.tempSubTypeChange2}
											value={this.state.subType2}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="PR-row-3">
						<div class="PR-date-div">
							<div class="PR-title">
							Start Date
							</div>
							<div class="PR-sDate">
								<DateInput
									initialValue={this.state.parentStartDateUser2}
									onNewDate={this.tempParentStartDate2}
									field="startDate"
								/>
							</div>
						</div>
						<div class="PR-date-div">
							<div class="PR-title">
							End Date
							</div>
							<div class="PR-eDate">
								<DateInput
									initialValue={this.state.parentEndDateUser2}
									onNewDate={this.tempParentEndDate2}
									field="endDate"
								/>
							</div>
						</div>
					</div>
					<div class="buffer-modal">
					</div>
				</div>
        </div>
        <div class="event-delete-modal">
					<button
						type="button"
						class="btn btn-default modal-delete"
						onClick={this.savePerson}
					>
						Save
					</button>
					<button
						type="button"
						class="btn btn-default modal-delete"
						onClick={this.cancelButton}
					>
						Cancel
					</button>
				</div>
      </div>);
  }
}