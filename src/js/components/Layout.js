import React from 'react';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import { logout } from '../actions/authActions';
import PeopleSearch from './peoplesearch/peoplesearch';

@connect(
	(store, ownProps) => {
		return store;
	}
)
export default class Layout extends React.Component {
	constructor (props) {
		super(props);

		// this variable will store whether the modal window is open or not
		this.state = {
			historyBarShowing: false,
			isLoggedIn: !!this.props.auth.userName,
		};
	}

	// the anonymous function passed into each newly created link should look similar to `<div onClick={() => {this.redirect('/')}}>CLICK</div>`
	redirect = (url) => {
		// only dispatch logout if we are trying to logout
		if (url === '/auth/logout') {
			this.props.dispatch(logout());
			hashHistory.push('/auth/login');
		} else {
			hashHistory.push(url);
		}
	}

	toggleSideBar = () => {
		if(this.state.historyBarShowing === false) {
			$("#allContent").css({"width": "80%"});
			$("#history").css({"display": "flex"});
			this.setState({historyBarShowing: true});
		}
		if (this.state.historyBarShowing === true) {
			$("#history").css({"display": "none"});
			$("#allContent").css({"width": "100%"});
			this.setState({historyBarShowing: false});
		}
	}

	componentDidUpdate = (prevProps, prevState) => {
		// if there is an update and there is now a userName in the store, than set the state so it triggers a rendering change.
		if (prevProps != this.props) {
			this.setState({
				isLoggedIn: !!this.props.auth.userName
			})
		}
	}

	render() {
		// if the user is logged in, then show all the menu options. Else show nothing
		let menu = null;
		if (this.state.isLoggedIn) {
			menu = <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
						<ul class="nav navbar-nav navbar-right">
							<li>
								<a class="navbarright" onClick={() => {this.redirect('/')}}>FAMILY LIST</a>
							</li>
							<li>
								<a class="navbarright" onClick={() => {this.redirect('/chronology/')}}> CHRONOLOGY </a>
							</li>
							<li class="dropdown">
								<a onClick={() => {this.redirect('/resetdatabase/')}}>IMPORT MENU</a>
							</li>
							<li class="dropdown">
								<a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><i class="fa fa-user-circle-o fa-lg" aria-hidden="true"></i>
									<span class="caret"></span>
								</a>
								<ul class="dropdown-menu">
									<li><a onClick={() => {this.redirect('/importhome')}}>Advanced Import</a></li>
									<li><a onClick={() => {this.redirect('/auth/login')}}>Log In</a></li>
									<li><a onClick={() => {this.redirect('/auth/logout')}}>Log Out</a></li>
								</ul>
							</li>
							<li>
								<a class="navbarright">
									<i class="fa fa-question-circle-o fa-lg question" aria-hidden="true" onClick={this.toggleSideBar}></i>
								</a>
							</li>
						</ul>
					</div>
		} else {
			menu = <div></div>
		}

		return (
		<div>
			<nav class="navbar navbar-default">
				<div class="container-fluid">
					<div class="navbar-header">
						<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
							<span class="sr-only">Toggle navigation</span>
							<span class="icon-bar"></span>
							<span class="icon-bar"></span>
							<span class="icon-bar"></span>
						</button>
						{/* for the redirect function to work, we need to call an anonymous function onClick to prevent the function from being called by default (causing a loop through the endpoints).*/}
						<a class="navbar-brand" onClick={() => {this.redirect('/')}}>
							Family Genie <sup>&trade;</sup>
						</a>
					</div>
					{menu}
				</div>
			</nav>
			<div class="layout">
				<div class="allContent" id="allContent">
					{this.props.children}
				</div>
				<div class="mainHistory" id="history">
				  <div class="help-menu">
					<div class="help-header">
					  <i class="fa fa-close fa-lg" aria-hidden="true" onClick={this.toggleSideBar}></i>
					  <h3 class="history-title-1">Help Menu</h3>
					</div>
					<div>
						{this.props.helpMessage.helpMessage}
					</div>
				  </div>
				  <div class="history-context">
					<h3 class="history-title-2">Your History</h3>
					<div class="histories">
					  <div class="history">
					  </div>
					  <div class="history">
					  </div>
					  <div class="history">
					  </div>
					</div>
				  </div>
				</div>
			</div>
			<footer class="footer navbar-fixed-bottom">
				&copy; 2017 PsychoGenealogical Research
			</footer>
		</div>
		);
	}
}
