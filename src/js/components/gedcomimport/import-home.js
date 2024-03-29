import React from 'react';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import { hashHistory } from 'react-router';

import { importPeopleAndEvents, importRelationships } from '../../actions/importActions';
import { fetchStagedPeople } from '../../actions/stagedPeopleActions';
import { fetchStagedEvents } from '../../actions/stagedEventActions';
import { clearStagedRecords } from '../../actions/importActions';

import config from '../../config.js';
import { getAxiosConfig } from '../../actions/actionFunctions';

@connect(
  (store, ownProps) => {
    return {
      stagedPeople: store.stagedPeople.stagedPeople,
      stagedEvents: store.stagedEvents.stagedEvents,
      stagedParentalRels: store.stagedParentalRels.stagedParentalRels,
      stagedPairBondRels: store.stagedPairBondRels.stagedPairBondRels,
      /*
       * peopleImported : store.stagedPeople.stagedPeople.filter(function(p) {
       *   return (p.ignore === true);
       * }),
       * peopleRemaining: store.stagedPeople.stagedPeople.filter(function(p) {
       *   return (!p.ignore);
       * }),
       *
       *
       * eventsImported: store.stagedEvents.stagedEvents.filter(function(e) {
       *   return (e.ignore ==t= true);
       * }),
       * eventsRemaining: store.stagedEvents.stagedEvents.filter(function(e) {
       *   return (!e.ignore);
       * }),
       * stagedParentalRels: store.stagedParentalRels.stagedParentalRels,
       * stagedPairbondRels: store.stagedPairbondRels.stagedPairbondRels,
       */
    }
  },
  (dispatch) => {
    return {
      importPeopleAndEvents: () => {
        dispatch(importPeopleAndEvents())
      },
      importRelationships: () => {
        dispatch(importRelationships())
      },
      fetchStagedPeople: () => {
        dispatch(fetchStagedPeople())
      },
      fetchStagedEvents: () => {
        dispatch(fetchStagedEvents())
      },
      clearStagedRecords: () => {
        dispatch(clearStagedRecords())
      }
    }
  }
)
export default class ImportDashboard extends React.Component {

  // the anonymous function passed into each newly created link should look similar to `<div onClick={() => {this.redirect('/')}}>CLICK</div>`
  redirect = (url) => {
    hashHistory.push(url);
  }

  checkIgnore = (stagedArray) => {
    let notIgnored = stagedArray.find((stagedItem) => {
      return stagedItem;
    })
    return (!!notIgnored);
  }

  // this is specifically for the gedcom file upload process
  xhr_post = (xhrToSend, url, formData) => {
      xhrToSend.open("POST", url, true);
      xhrToSend.setRequestHeader('x-access-token', getAxiosConfig().headers['x-access-token']);
      xhrToSend.send(formData);
  }

  checkIgnore = (stagedArray) => {
    let notIgnored = stagedArray.find((stagedItem) => {
      return stagedItem;
    })
    return (!!notIgnored);
  }

  onDrop = (files) => {

    const { stagedPeople, stagedEvents, stagedParentalRels, stagedPairBondRels } = this.props;
    const stagedArrays = [ stagedPeople, stagedEvents, stagedParentalRels, stagedPairBondRels ];

    let continue_ = true;
    for ( let stagedArray in stagedArrays ) {
      if (this.checkIgnore(stagedArrays[stagedArray])) {
        alert('You must clear your imported records before uploading a new file. \n Nothing will be uploaded at this time.');
        continue_ = false;
        break;
      }
    }

    if (continue_) {
      var formData = new FormData();
      var xhr = new XMLHttpRequest();
      formData.append('gedcom', files[0]);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            alert('File upload successful. You should now click Run Import.');
            // TODO reload the store after processes have completed
          } else {
            alert('File upload unsuccessful. Please contact support if you need assistance.');
          }
        }
      }
      this.xhr_post(xhr, config.api_url + '/uploads', formData)
    }
  }

  importPeopleAndEvents = () => {
    this.props.importPeopleAndEvents();
    alert('You have imported new documents. You should now review any duplicates before continuing.');
  }
  importRelationships = () => {
    this.props.importRelationships();
    alert('You have imported new relationships. You should now review them before continuing.');
  }

  clearDB = () => {
    var clear = confirm('This will delete all staged records. \n Make sure you have reviewed all records before continuing. \n Press "OK" to confirm.');
    if (clear) {
      this.props.clearStagedRecords();
    }
  }
  componentDidMount = () => {
    $(window).scrollTop(0);
  }

  render = () => {

    return (
    <div class="mainImport">
      <div class="header-div">
        <h1 class="family-header"> Import Dashboard </h1>
      </div>
      <div class='import-content'>
        <div class="import-row">
          <div class="import-step">
            <p>1</p>
          </div>
          <div class="import-step-content">
            <div class="step-instruction">
              <h3 class="step-header">Upload Your Gedcom File</h3>
            </div>
            <div class="step-action">
              <div class="gedCom">
                <Dropzone class="dropzone" onDrop={this.onDrop}>
                  <div>
                    <p>Drop a file or click to browse</p>
                    <p>This currently only accepts files from Ancestry.com</p>
                  </div>
                </Dropzone>
              </div>
            </div>
          </div>
        </div>
        <div class="import-row">
          <div class="import-step">
            <p>2</p>
          </div>
          <div class="import-step-content">
            <div class="step-instruction">
              <h3 class="step-header">Import Documents</h3>
            </div>
            <div class="step-action">
              <div class="action-content">
                <button class="btn button3" onClick={this.importPeopleAndEvents}> Run Import </button>
              </div>
            </div>
          </div>
        </div>
        <div class="import-row">
          <div class="import-step">
            <p>3</p>
          </div>
          <div class="import-step-content">
            <div class="step-instruction">
              <h3 class="step-header">Review People</h3>
            </div>
            <div class="step-action">
              <div class="action-content">
                {/*
                <div class="action-row">
                  <label> Ready to be Imported: </label>
                  <p class="actionItem">{this.props.peopleRemaining.length}</p>
                </div>
                <div class="action-row">
                  <label>  Already Imported: </label>
                  <p class="actionItem">{this.props.peopleImported.length}</p>
                </div>
                */}
                <button class="btn button3" onClick={() => {this.redirect('/stagedpeoplesearch/')}}>Review</button>
              </div>
            </div>
          </div>
        </div>
        {/*
        <div class="import-row">
          <div class="import-step">
            <p>4</p>
          </div>
          <div class="import-step-content">
            <div class="step-instruction">
              <h3 class="step-header">Review Events</h3>
            </div>
            <div class="step-action">
              <div class="action-content">

                {/*
                <div class="action-row">
                  <label> Ready to be Imported: </label>
                  <p class="actionItem">{this.props.eventsRemaining.length}</p>
                </div>
                <div class="action-row">
                  <label>  Already Imported: </label>
                  <p class="actionItem">{this.props.eventsImported.length}</p>
                </div>
                {/* // nested comment would not work here.

                <button class="btn button3" onClick={() => {this.redirect('/stagedeventsearch/')}}>Review</button>
              </div>
            </div>
          </div>
        </div>
        */}
        <div class="import-row">
          <div class="import-step">
            <p>4</p>
          </div>
          <div class="import-step-content">
            <div class="step-instruction">
              <h3 class="step-header">Import Relationships</h3>
            </div>
            <div class="step-action">
              <div class="action-content">
                {/*
                <div class="action-row">
                  <label> Ready to be Imported: </label>
                  <p class="actionItem">{this.props.eventsRemaining.length}</p>
                </div>
                <div class="action-row">
                  <label>  Already Imported: </label>
                  <p class="actionItem">{this.props.eventsImported.length}</p>
                </div>
                */}
                <button class="btn button3" onClick={this.importRelationships}> Run Import </button>
              </div>
            </div>
          </div>
        </div>

        <div class="import-row">
          <div class="import-step">
            <p>5</p>
          </div>
          <div class="import-step-content">
            <div class="step-instruction">
              <h3 class="step-header">Review Parents</h3>
            </div>
            <div class="step-action">
              <div class="action-content">
                <div class="action-row">
                {/*
                  <label> Ready to be Imported: </label>
                  <p class="actionItem">{this.props.eventsRemaining.length}</p>
                </div>
                <div class="action-row">
                  <label>  Already Imported: </label>
                  <p class="actionItem">{this.props.eventsImported.length}</p>
                */}
                </div>
                <button class="btn button3" onClick={() => {this.redirect('/stagedparentalrelsearch/')}}>Review</button>
              </div>
            </div>
          </div>
        </div>
        <div class="import-row">
          <div class="import-step">
            <p>6</p>
          </div>
          <div class="import-step-content">
            <div class="step-instruction">
              <h3 class="step-header">Review Pairbonds</h3>
            </div>
            <div class="step-action">
              <div class="action-content">
                <div class="action-row">
                {/*
                  <label> Ready to be Imported: </label>
                  <p class="actionItem">{this.props.eventsRemaining.length}</p>
                </div>
                <div class="action-row">
                  <label>  Already Imported: </label>
                  <p class="actionItem">{this.props.eventsImported.length}</p>
                */}
                </div>
                <button class="btn button3" onClick={() => {this.redirect('/stagedpairbondrelsearch/')}}>Review</button>
              </div>
            </div>
          </div>
        </div>
        <div class="import-row">
          <div class="import-step">
            <p>7</p>
          </div>
          <div class="import-step-content">
            <div class="step-instruction">
              <h3 class="step-header">Clear Imported Records</h3>
            </div>
            <div class="step-action">
              <div class="action-content">
                <button class="btn button3" onClick={this.clearDB}>Clear</button>
                <div class="action-row">
                  Make sure that you have completed your reviews before clearing the imported records.
                {/*
                  <label> Ready to be Imported: </label>
                  <p class="actionItem">{this.props.eventsRemaining.length}</p>
                </div>
                <div class="action-row">
                  <label>  Already Imported: </label>
                  <p class="actionItem">{this.props.eventsImported.length}</p>
                */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
  }
}
