import React from 'react';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import Modal from 'react-modal';
import AlertContainer from 'react-alert';
import { createPerson } from '../../actions/peopleActions';

import PeopleSearchLineItem from './peoplesearch-lineitem';
import NewPerson from '../newperson';
import { newPerson } from '../../actions/createNewPersonActions';
import { closeNewPersonModal } from '../../actions/modalActions';

@connect((store, ownProps) => {
  return {
    user: store.user.user,
    userFetched: store.user.fetched,
    people: store.people.people,
    modalIsOpen: store.modal.newPerson.modalIsOpen,
    store,
  };
},
(dispatch) => {
  return {
    createNewPerson: () => {
      dispatch(newPerson());
    },
  }
}
)
export default class PeopleSearch extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      sidebarOpen: true,
    };
  }
  onSetSidebarOpen = (open) => {
    this.setState({sidebarOpen: open});
  }

  // for the history bar showing or not
  componentWillMount = () => {
    var mql = window.matchMedia('(min-width: 800px)');
    mql.addListener(this.mediaQueryChanged);
    this.setState({mql: mql, sidebarDocked: mql.matches});
  }

  // for the history bar showing or not
  componentWillUnmount = () => {
    this.state.mql.removeListener(this.mediaQueryChanged);
  }
  // for the history bar showing or not
  mediaQueryChanged = () => {
    this.setState({sidebarDocked: this.state.mql.matches});
  }

  alertOptions = {
      offset: 15,
      position: 'bottom-left',
      theme: 'light',
      time: 0,
      transition: 'scale'
    };

  createNewPerson = () => {
    this.props.createNewPerson();
  }

	render = () => {
    const { people, modalIsOpen } = this.props;

    const mappedPeople = people.map(person =>
        <PeopleSearchLineItem person={person} key={person._id}/>
    );


    var modalStyle = {
      overlay: {
      position: 'fixed',
      top: 50,
      left: 50,
      width: '90vw',
      height: '80vh',
      // right: 100,
      // bottom: 100,
      }
    };

        return (
      <div id="outer-search">
    		<div class="header-div">
          <h1 class="family-header">Family List</h1>
        </div>
        <div id="family-content">
          <div id="people-info">
          </div>
          <div id="family">
            <div id="add-family">
              <div class="blank-person-header">
  						</div>
      				<p class="add">
      					Family Members
      				</p>
              <i class="fa fa-plus-square" id="create-person" aria-hidden="true" onClick={this.createNewPerson}>
              </i>
            </div>
            <div id="buffer-div">
            </div>
          	{mappedPeople}
          </div>
        </div>
      <Modal
        isOpen={modalIsOpen}
        contentLabel="Modal"
        style={modalStyle}
      >
        <NewPerson/>
      </Modal>

      <AlertContainer ref={(a) => global.msg = a} {...this.alertOptions} />
        <div id="below-family">
        </div>
      </div>);
    }
}
