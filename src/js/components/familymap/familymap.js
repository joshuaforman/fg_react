import React from 'react';
import { connect } from "react-redux"
import { hashHistory } from 'react-router'
import moment from 'moment';

@connect(
	(store, ownProps) => {
		// console.log("in familymap @connect, with: ", store);
			return {
				star_id:
					ownProps.params.star_id,
				people:
					store.people.people,
				pairBondRelationships:
					store.pairBondRels.pairBondRels,
				parentalRelationships:
					store.parentalRels.parentalRels,
			};
		// }
	},
)
export default class FamilyMap extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// store this state value for display purposes
			dateFilterString: "",
		};
	}

	starAge;
	star_id = this.props.star_id;
	parents = [];
	parentRels = [];
	children = [];
	pairBonds = [];
	alreadyDrawn = [];
	drawnCoords = [];
	dateFilterString;
	firstChildYDistance = 0;
	firstChildYWithAdoptions = 0;
	textLineSpacing = 18;
	textSize = '.9em';
	fullName;

	subtractYear = () => {
		this.dateFilterString = moment(this.dateFilterString).subtract(1,'year').format('YYYY-MM-DD');
		// also set the state variable
		this.setState({dateFilterString: this.dateFilterString});
		this.componentDidMount();
	}

	addYear = () => {
		this.dateFilterString = moment(this.dateFilterString).add(1,'year').format('YYYY-MM-DD');
		// also set the state variable
		this.setState({dateFilterString: this.dateFilterString});
		this.componentDidMount();
	}

	render = () => {
		// console.log("in Family Map Render, with state: ", this.state);

		if (this.props.people) {
			return (<div>
				<div class="container">
					<h1>Family Map</h1>
					<div>
						Date: {this.state.dateFilterString}
					</div>
					<div>
						Star's Age: {this.starAge}
						<i class="fa fa-arrow-circle-down buttonSize" onClick={this.subtractYear.bind(this)}></i>
						<i class="fa fa-arrow-circle-up buttonSize" onClick={this.addYear}></i>
					</div>
					<div>
					</div>
				</div>
				<svg class="svg-map">
				</svg>
			</div>)
		}
	}

	componentDidMount = () => {
		// there are some constants at the top of the component class definition as well.
		// these constants determine where to start drawing the map
		const startX = 775;
		const startY = 200;
		const parentDistance = 220;
		const childDistance = 120;

		// I can't get setState to work here. Setting the dateFilterString to a value for testing purposes
		// this.setState({dateFilterString: "1947-08-29"});
		// this.dateFilterString = '1990-08-27';


		this.initializeVariables();
		// this.drawTicks();
		// this function removes all the keys from the objects that contain information that is generated while creating the map. Clearing it all here because during Family Time Lapse, we want to be able to start a new map fresh without having to refresh the data from the database (so that it is faster).
		this.clearMapData();

		// push the star onto the empty children array, because we know they will be a child on the map
		this.children.push(this.getPersonById(this.star_id));

		// call function to find all the parents for children that are in the children array. If it returns false, there was an error and the map should not be drawn. An erros alert was already displayed to the end user.
		if ( !this.getAllParentsOfChildren() ) {
			hashHistory.push('/');
			return;
		}
		console.log("After getAllParents: ", this.parents);

		if (this.parents.length === 0) {
			alert("No parents for this person, map will not be drawn.");
			hashHistory.push('/');
			return;
		}

		this.getAllChildrenOfParents();
		console.log("children:", this.children);

		// then call getAllParents of Children again to get all the parents of all the children, not just parents of the star. If it returns false, there was an error and the map should not be drawn. An erros alert was already displayed to the end user.
		if ( !this.getAllParentsOfChildren() ) {
			hashHistory.push('/');
			return;
		}
		console.log("After getAllParents second call: ", this.parents);

		// need some looping here: get parents, get children, get parents, get children, etc... until all parents that were found are the same as the last time all parents were found (because then there are no more to find)

		if ( !this.getAllPairBonds() ) {
			alert("There was an error in drawing the map. You are being re-directed to the FamilyList page. You should have seen an error message previous to this to assist with the problem. If not, please contact support.");
			hashHistory.push('/');
			return;
		}
		console.log("all pair bonds:", this.pairBonds);

		// this includes drawing the parents in the pair bonds. this currently
		// if neither parent is biological or step, then draw both parents down a level vertically
		 if ( !this.drawAllPairBonds(startX, startY, parentDistance) ) {
			 alert("There was an error in drawing the map. You are being re-directid to the FamilyList page. You should have seen an error message previous to this to assist with the problem. If not, please contact support.");
			hashHistory.push('/');
			return;
		 }

		 // this function also draws the relationship lines to Biological parents
		this.drawAllChildren (startY, childDistance);

		this.drawNonBioParentLines();

		// the parental lines may be drawn over the children, so now draw them again so they come to the front.
		this.bringAllChildrenToFront();

		// Last, we need to see about resizing the drawing
	}

	drawAllChildren (startY, childDistance): void {
		// note that we are assuming that each kid will have one and only one biological mother and one and only one biological father. Need to eventually accomodate for this not being true (like don't have some bio parent info)
		let nextChildY = startY + childDistance + this.firstChildYDistance;
		let mom, momRel, dad, dadRel;
		let momRels = [];
		let dadRels = [];
		let xPos: number;

		// console.log("in drawAllChildren", this.children);

		// sort children by birthdate
		this.children.sort(birthDateCompare);

		for (let child of this.children) {
			// get mom relationship record

			// find biological mother relationship
			momRel = this.props.parentalRelationships.find(function(parentRel){
				// the following line is to accomodate for the fact that the angular dropdown in parentalrelationship.component is making this value have a number in front of it.
				return /[Mm]other/.test(parentRel.relationshipType) &&
					/[Bb]iological/.test(parentRel.subType) &&
					parentRel.child_id === child._id;
			});

			// find biological dad relationship record
			dadRel = this.props.parentalRelationships.find(function(parentRel){
				// the following line is to accomodate for the fact that the angular dropdown in parentalrelationship.component is making this value have a number in front of it.
				return /[Ff]ather/.test(parentRel.relationshipType) &&
					/[Bb]iological/.test(parentRel.subType) &&
					parentRel.child_id === child._id;
			});

			// if we found both bio mom and bio dad, draw child halfway between them
			if ( momRel && dadRel ) {
				mom = this.parents.find(function(parent){
					return parent._id === momRel.parent_id;
				});
				dad = this.parents.find(function(parent){
					return parent._id === dadRel.parent_id;
				});

				// calculate xPos of child
				// find the amount that is halfway between the two parents
				xPos = Math.abs(mom.mapXPos - dad.mapXPos) / 2;
				// whichever parent is further left, add the amount to their xPos to get xPos for child
				xPos = (mom.mapXPos < dad.mapXPos) ? mom.mapXPos + xPos : dad.mapXPos + xPos;

				// console.log("in drawAllChildren:", child, mom, dad, xPos);
				// set x and y values inside of child object, they are used by the drawParentalLine functions
				child.mapXPos = xPos;
				child.mapYPos = nextChildY;

				// draw parental lines first, so the circle and text goes on top of the lines
				child.d3MomLine = this.drawParentalLine(mom, child, "mom", "0. Biological");
				// if there is an endDate of the mother relationship, draw hash marks in the middle of it
				if ((momRel.endDate ? momRel.endDate.substr(0,10) : '9999-99-99') <= this.dateFilterString) {
					this.drawParentRightHash (child, mom, 'blue');
				}

				child.d3DadLine = this.drawParentalLine(dad, child, "dad", "0. Biological");
				// if there is an endDate of the father relationship, draw hash marks in the middle of it
				if ((dadRel.endDate ? dadRel.endDate.substr(0,10) : '9999-99-99') <= this.dateFilterString) {
					this.drawParentLeftHash (child, dad, 'blue');
				}

				child.d3Circle = this.drawCircle(child);
				if ((child.deathDate ? child.deathDate.substr(0,10) : '9999-99-99') <= this.dateFilterString) {
					this.drawCircleHash(child);
				}

				if (child.sexAtBirth === "M") {
					child.d3Symbol = this.drawMaleSymbol(xPos, nextChildY);
				} else if (child.sexAtBirth === "F") {
					child.d3Symbol = this.drawFemaleSymbol(xPos, nextChildY);
				}
				// check to see if this is the star of the map. If so, draw the star inside of circle
				if (child._id === this.star_id) {
					child.d3Star = this.drawStar(xPos, nextChildY, child);
				}
				child.d3TextBox = this.drawTextBox(xPos, nextChildY);
				child.d3Text = this.drawCircleText(xPos + 50, nextChildY - 25, child);

				nextChildY += childDistance;

			} else {
				// if not both a mom and or a dad, print error message.
				alert("Missing biological father and/or mother record for this child:" + child.fName + " " + child.lName + ". Every child must have that information to show on a map. Even if one or both biological parents are simply sperm donors. This child will not show on the map.");
			}
		} // end of let child of this.children

		// this function is used to sort the children by birthDate
		function birthDateCompare(a, b) {
			if (a.birthDate < b.birthDate)
				return -1;
			if (a.birthDate > b.birthDate)
				return 1;
			return 0;
		}
	}

	drawAllPairBonds (startX, startY, parentDistance): boolean {
		let mom;
		let dad;
		let momRel, dadRel;
		let parent;
		let nextMaleX = startX - Math.floor(parentDistance / 3 * 2);
		let nextFemaleX = startX + Math.floor(parentDistance / 3 * 2);
		let colorArray = ["black", "green", "purple", "orange", "deeppink", "orchid", "orangered", "navy", "olivedrab"];
		let colorIndex: number = 0;
		let YPos;

		// sort pair bonds by start date
		this.pairBonds.sort(startDateCompare);
		// next, put the pair bonds where both parents are adopted at the end of the array, so they are drawn last, outside the other pair bonds
		this.pairBonds.sort(subTypeCompare);

		for (let pairBond of this.pairBonds) {

			parent = this.getPersonById(pairBond.personOne_id);
			// console.log("parent is ", parent, parent.sexAtBirth);

			if (parent.sexAtBirth === "M") {
				dad = parent;
			} else if ( parent.sexAtBirth === "F" ) {
				mom = parent;
			}

			parent = this.getPersonById(pairBond.personTwo_id);

			if (parent.sexAtBirth === "M") {
				dad = parent;
			} else if ( parent.sexAtBirth === "F" ) {
				mom = parent;
			}

			// console.log("mom and dad pair bond", mom, dad);

			if ( !(mom && dad) ) {
				alert("Pair bond record does not have a mom and dad (or maybe either mom or dad does not have Birth Gender set to M or F). Application does not yet support this");
				return false;
			}

			// if this is a pair bond that has been determined to go on the horizontal line with the adoptive parents, then set the YPos to be further down the page
			if ( /[Aa]dopted/.test(pairBond.subTypeToStar) ) {
				YPos = startY + 150;
			} else {
				YPos = startY;
			}

			// if dad is not yet drawn, then draw and add to alreadyDrawn
			if ( dad && !this.alreadyDrawn.includes(dad) ) {
				// The following two variables are stored in the array object, and don't go back to the database.
				dad.mapXPos = nextMaleX;
				dad.mapYPos = YPos;
				dad.d3Circle = this.drawCircle(dad);
				// if there is a deathDate and it is less than the date the map is being drawn for, then draw the CircleHash
				if (dad.deathDate) {
					if (dad.deathDate.substr(0,10) <= this.dateFilterString) {
						this.drawCircleHash(dad);
					}
				}
				dad.d3Symbol = this.drawMaleSymbol(nextMaleX, YPos);
				dad.d3Text = this.drawCircleText(nextMaleX - 170, YPos - 25, dad);
				nextMaleX -= parentDistance;
				this.alreadyDrawn.push(dad);
			} else if ( !dad ) {
				// throw error
				console.log("no dad in this pairbond to draw:", pairBond);
			}

			// if mom is not yet drawn, then draw and add to alreadyDrawn
			if ( mom && !this.alreadyDrawn.includes(mom) ) {
				// The following two variables are stored in the array object, and don't go back to the database.
				mom.mapXPos = nextFemaleX;
				mom.mapYPos = YPos;
				mom.d3Circle = this.drawCircle(mom);
				// if there is a deathDate and it is less than the date the map is being drawn for, then draw the CircleHash
				if (mom.deathDate) {
					if (mom.deathDate.substr(0,10) <= this.dateFilterString) {
						this.drawCircleHash(mom);
					}
				}
				mom.d3Symbol = this.drawFemaleSymbol(nextFemaleX, YPos);
				mom.d3Text = this.drawCircleText(nextFemaleX + 45, YPos - 25, mom);
				nextFemaleX += parentDistance;
				this.alreadyDrawn.push(mom);
			} else if ( !mom ) {
				// throw error
				console.log("no mom in this pairbond to draw:", pairBond);
			}

			if (mom && dad) {
				// draw a relationship line
				// first, check to see if a relationship with these two people has already been drawn (for example, they may have been living together before they got married). If so, we need the color of that line, and make this line and text about this relationship the same color.
				// the checkForExistingRel function returns the color of the existing relationship if it is found
				pairBond.color = checkForExistingRel(pairBond, this.pairBonds);
				if ( !pairBond.color ) {
					// if there is no existing relationship, then set the color to the next color in the color index
					pairBond.color = colorArray[colorIndex];
				}

				// next, check to see if it is an adoptive relationship, because we'll draw the relationship line differently
				if ( /[Aa]dopted/.test(pairBond.subTypeToStar) ) {
					this.drawAdoptiveRelLine(mom, dad, pairBond.color, pairBond.relationshipType);
					this.drawRelText(mom, dad, pairBond);
					// if there is an endDate, then use it to compare to the dateFilterString. If there is not an end date, then the relationship did not end, and we want to put in "9999-99-99" so that it will always be greater than dateFilterString, thus returning false, and not drawing the hash marks
					if ((pairBond.endDate ? pairBond.endDate.substr(0,10) : "9999-99-99") <= this.dateFilterString) {
						this.drawAdoptiveRelHash(mom, dad, pairBond, pairBond.color);
					}
				} else {
					// this is not adopted parents to the star
					this.drawRelLine(mom, dad, pairBond.color, pairBond.relationshipType);
					this.drawRelText(mom, dad, pairBond);
					// if there is an endDate, then use it to compare to the dateFilterString. If there is not an end date, then the relationship did not end, and we want to put in "9999-99-99" so that it will always be greater than dateFilterString, thus returning false, and not drawing the hash marks
					if ((pairBond.endDate ? pairBond.endDate.substr(0,10) : "9999-99-99") <= this.dateFilterString) {
						this.drawRelHash(mom, dad, pairBond, pairBond.color);
					}
				}

				// move to next color in the color array.
				colorIndex++;
				// if beyond the array, then go back to 0
				if (colorIndex === colorArray.length) {
					colorIndex = 0;
				}
			}
		}  // end let pairBond of this.pairBonds

		// if we got here, everything was executed successfully, so return true so map drawing can continue.
		return true;

		// this function is used to sort the pairbonds by startdate
		function startDateCompare(a, b) {
			if (a.startDate < b.startDate)
				return -1;
			if (a.startDate > b.startDate)
				return 1;
			return 0;
		}

		// this function is used to put the adopted pair bonds at the end of the array
		function subTypeCompare(a, b) {
			if (a.subTypeToStar === "Adopted" && b.subTypeToStar !== "Adopted")
				return 1;
			if (b.subTypeToStar === "Adopted" && a.subTypeToStar !== "Adopted")
				return -1;
			return 0;
		}

		function checkForExistingRel(pairBond, pairBonds): string {
			// find all pairBonds that are not this pair bond AND do include the same two people
			let foundPairBonds = pairBonds.filter( function(pB) {
				return (pB.personOne_id === pairBond.personOne_id &&
				pB.personTwo_id === pairBond.personTwo_id &&
				pB._id !== pairBond._id)
				||
				(pB.personOne_id === pairBond.personTwo_id &&
				pB.personTwo_id === pairBond.personOne_id);
			});
			if ( foundPairBonds ) {
				// loop through each record found
				for (let pBFound of foundPairBonds) {
					// if there is a color already associated with it, the return that color
					if (pBFound.color ) {
						return pBFound.color;
					}
				}
				// if we get here, there were no colors assigned yet to any of the pair bond records, so return empty string
				return "";
			} else {
				// no records found, so return empty string
				return "";
			}
		} // end function checkForExistingRel
	} // end function drawAllPairBonds

	getAllPairBonds(): boolean {
		let pairBondTemp = [];
		let oneRel, twoRel;

		// for each parent
		for (let parentObj of this.parents) {
			// get all pair bonds
			pairBondTemp = this.props.pairBondRelationships.filter(
				function(pairBond) {
					return (pairBond.personOne_id === parentObj._id ||
						pairBond.personTwo_id === parentObj._id) &&
						// if there is a startDate, then return the substr of it. If not, put in null, and then this test condition will evaluate true (null less than a string will evaluate to true), which is what we want. If the user did not put in a pairBond start date, then do show that relationship on the map
						(pairBond.startDate ? pairBond.startDate.substr(0,10) : null) <= this.dateFilterString;
				}.bind(this)
			);

			// for each pair bond of each parent
			for (let pairBond of pairBondTemp) {
				// check to see if both parents are adoptive parents of the star, if so, specify them as an adoptive pair bond, so they can be drawn appropriately
				// if both parents are adopted parents, then modify the Y position
				// first, get the mom Relationship and the dad relationship
				oneRel = this.parentRels.find(
					function(parentRel) {
					return parentRel.parent_id === pairBond.personOne_id &&
					parentRel.child_id === this.star_id;
					}.bind(this)
				);
				twoRel = this.parentRels.find(
					function (parentRel) {
					return parentRel.parent_id === pairBond.personTwo_id &&
					parentRel.child_id === this.star_id;
					}.bind(this)
				);

				// now, test to see if both the mom and dad in this pair bond are parents of the star (they may be parents of the star's half or step parents).
				if (oneRel && twoRel) {
					// if they are parents of the star, then check to see if they are both adoptive parents. If so, mark the pairBond record as adoptive and also modify the Y position of where the first child will be drawn so there is room for the adoptive parents to be drawn lower that the biological and step parents
					if ( /[Aa]dopted/.test(oneRel.subType) && /[Aa]dopted/.test(twoRel.subType) ) {
						pairBond.subTypeToStar = "Adopted";
						// if there is an adoptive parent, then move the first child drawn further down the map so there is room for the adoptive relationship to be below the other relationships
						this.firstChildYDistance = this.firstChildYWithAdoptions;
					}
				} else if (!oneRel && !twoRel) {
					// neither is a parent, this means that this is a pair bond that only has parental relationships with some of the children on the star's map, but not the star.
					// do nothing for now.
				} else if ( oneRel && !twoRel ) {
					// if only one in the pair is a parent of the star (and we wouldn't get here unless that is the case)
					// then if the one parent is an adopted parent, go on the adopted line. Also, since there is a parent on the adoptive line, move the first child drawn down.

					if ( /[Aa]dopted/.test(oneRel.subType) ) {
						pairBond.subTypeToStar = "Adopted";
						this.firstChildYDistance = this.firstChildYWithAdoptions;
					}
				} else if ( !oneRel && twoRel ) {
					// if only one in the pair is a parent of the star (and we wouldn't get here unless that is the case)
					// then if the one parent is an adopted parent, go on the adopted line. Also, since there is a parent on the adoptive line, move the first child drawn down.

					if ( /[Aa]dopted/.test(twoRel.subType) ) {
						pairBond.subTypeToStar = "Adopted";
						this.firstChildYDistance = this.firstChildYWithAdoptions;
					}
				}

				// put the pairBond into the array, if it doesn't yet exist
				// this.pairBonds = this.dataService.addToArray(this.pairBonds, pairBond);
				if (!this.pairBonds.includes(pairBond)) {
					this.pairBonds.push(pairBond);
				}
			} // end for pairbond
		} // end for parentObj

		if (!this.pairBonds.length) {
			let star = this.getPersonById(this.star_id);
			alert("There are no pair bonds among the parents of " + star.fName + " " + star.lName + ". Please fix and re-draw map. Fix by going to " + star.fName + " " + star.lName + "'s detail page, click on their parents to get to the parent's detail page, and make sure there is at least one pair bond among them.");
			return false;
		}

		// if we got here, everything was executed successfully, so return true so map drawing can continue.
		return true;
	} // end function getAllPairBonds

	getAllParentsOfChildren = () => {
		let parentalRelTemp = [];

		// for each child
		for (let child of this.children) {
			// get all parental relationships. if there is no start date, then make value null, so that the test will return true. This way, if the user did not enter a startDate for the parental relationship, this relationship will show up on the map.
			parentalRelTemp = this.props.parentalRelationships.filter(
				function(parentalRel) {
					return parentalRel.child_id === child._id &&
					(parentalRel.startDate ? parentalRel.startDate.substr(0,10) : null) <= this.dateFilterString;
				}.bind(this)
			);
			// console.log("in getAllParents, parentalRelTemp: ", parentalRelTemp);
			// for each parental relationship of each child
			for (let parentRel of parentalRelTemp) {
				// first, push parentRel onto array of relationships to track
				// this.parentRels = this.addToArray(this.parentRels, parentRel);
				if (!this.parentRels.includes(parentRel)) {
						this.parentRels.push(parentRel);
					}
				// find the parent
				let parent = this.getPersonById(parentRel.parent_id);
				// if there is no parent, that means that the parentalRel record has a parent_id that does not exist (Perhaps that parent has been deleted and the parentalRel record was not). So, give an error message and exit.
				if ( !parent ) {
					alert("The child " + child.fName + " " + child.lName + " has a parent record, but that parent has been removed. Go to this child's detail page and review the parental records. If there is an empty record, delete it. If there is not an empty record, please contact support.");
					return false;
				}
				// put the parent into the parents array, if they don't yet exist
				// this.parents = this.dataService.addToArray(this.parents, parent);
				if (!this.parents.includes(parent)) {
						this.parents.push(parent);
					}
			}
		}
		// if we made it here, there were no errors, so return true
		return true;
	}

	getAllChildrenOfParents = () => {

		// console.log("in getAllChildrenOfStarParents", this.state, this.props);
		let parentalRelTemp = [];

		// for each parent of star
		for (let parent of this.parents) {
			// find every parental relationship (including those that do not have the star as child)
			parentalRelTemp = this.props.parentalRelationships.filter(
				function(parentalRel) {
					return parentalRel.parent_id === parent._id &&
					(parentalRel.startDate ? parentalRel.startDate.substr(0,10) : null) <= this.dateFilterString;
				}.bind(this)
			);

			// console.log("Parent & ParentalRelTemp: ", parent, parentalRelTemp);
			// for every parental relationship of each parent
			for (let parentRel of parentalRelTemp) {
				// find the child
				let child = this.getPersonById(parentRel.child_id);
				// console.log("Child Found: ", child);
				// if child was born on or before the dateFilter
				if ((child.birthDate ? child.birthDate.substr(0,10) : null) <= this.dateFilterString) {
					// console.log("Child Found with birthdate: ", child);
					// if child does not yet exist in children array, push onto it
					// this.children = addToArray(this.children, child);
					if (!this.children.includes(child)) {
						this.children.push(child);
					}
				}
			}
		}
	}

	clearMapData = () => {
		// this function removes all the keys from the objects that contain information that is generated while creating the map. Clearing it all here because during Family Time Lapse, we want to be able to start a new map fresh without having to refresh the data from the database (so that it is faster).
		for (let person of this.props.people) {
			delete person["d3CircleHash1"];
			delete person["d3CircleHash2"];
			delete person["d3CircleHash3"];
			delete person["d3CircleHash4"];
			delete person["mapXPos"];
			delete person["mapYPos"];
			delete person["d3Circle"];
			delete person["d3Symbol"];
			delete person["d3Text"];
			delete person["d3TextBox"];
			delete person["d3DadLine"];
			delete person["d3MomLine"];
			delete person["d3Star"];
		}

		for (let pairBond of this.props.pairBondRelationships) {
			delete pairBond["subTypeToStar"];
			delete pairBond["color"];
		}
	}

	initializeVariables = () => {
		// do we need to initialize the xPos and yPos of each person?
		// remove d3 drawn objects
		d3.select("svg").selectAll("*").remove();
		this.parents = [];
		this.parentRels = [];
		this.children = [];
		this.pairBonds = [];
		this.alreadyDrawn = [];
		this.drawnCoords = [];
		// this stores how far below the parents the first child is drawn. This number gets bigger if there is an adoptive parent pair on the map.
		this.firstChildYDistance = 20;
		this.firstChildYWithAdoptions = 130;
		// console.log("in initializeVariables", this.state.star_id);
		var star = this.getPersonById(this.star_id);
		console.log("star: ", star);
		this.fullName = star.fName + " " + star.lName;
		// if dateFilter not yet set, set it to Star's 18th birthday
		console.log("date to draw: ", this.dateFilterString);
		if (!this.dateFilterString) {
			this.starAge = 18;
			this.dateFilterString = moment(star.birthDate).add(18,'y').format('YYYY-MM-DD');
		}
		// update the display as well
		this.setState({dateFilterString: this.dateFilterString});
	}

	getPersonById = (_id) => {
		return this.props.people.find(function(person){
			return person._id === _id;
		});
	}

	drawCircle(person) {
		// console.log("in draw circle for:", person);
		let circle = d3.select("svg")
			.append("svg:a")
			.attr("xlink:href", "/#/peopledetails/" + person._id)
			.append("circle")
			.attr("cx", person.mapXPos)
			.attr("cy", person.mapYPos)
			.attr("r", 40)
			.attr("id", person._id)
			.attr("class", "can-click")
			.style("stroke", "black")
			.style("stroke-width", 3)
			.style("fill", "white");

		return circle;
	}

	drawCircleText(cx, cy, person) {
		let textData = [];
		// only include death info if there is a deathDate
		if (person.deathDate) {
			textData = [
				// name
				{"x": cx, "y": cy, "txt": person.fName + " " + person.lName},
				// birth info
				{"x": cx, "y": cy + this.textLineSpacing, "txt": "DOB: " + moment(person.birthDate).format("MM/DD/YYYY")},
				{"x": cx, "y": cy + (this.textLineSpacing * 2), "txt": person.birthPlace},
				// death info
				{"x": cx, "y": cy + (this.textLineSpacing * 3), "txt": "DOD: " + moment(person.deathDate).format("MM/DD/YYYY")},
				{"x": cx, "y": cy + (this.textLineSpacing * 4), "txt": person.deathPlace}
			];
		} else {
			textData = [
				// name
				{"x": cx, "y": cy, "txt": person.fName + " " + person.lName},
				// birth info
				{"x": cx, "y": cy + this.textLineSpacing, "txt": "DOB: " + moment(person.birthDate).format("MM/DD/YYYY")},
				{"x": cx, "y": cy + (this.textLineSpacing * 2), "txt": person.birthPlace}
			];
		}

		// append the person_id so that the text we are appending is unique and
		// doesn't prevent any other text to be written

		 return d3.select("svg").selectAll("text" + person._id)
			.data(textData)
			.enter()
			.append("text")
			.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y; })
			.text(function(d)     { return d.txt; })
			.attr("font-family", "sans-serif")
			.attr("font-size", this.textSize)
			.attr("fill", "black")
			.attr("font-weight", "600");
	}

	drawMaleSymbol(cx, cy) {
		let lineData = [
			{"x": cx + 28, "y": cy - 28}, {"x": cx + 40, "y": cy - 40},
			{"x": cx + 30, "y": cy - 40}, {"x": cx + 40, "y": cy - 40},
			{"x": cx + 40, "y": cy - 30}
		];

		let lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		return d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", "black")
			.attr("stroke-width", 3)
			.attr("fill", "none");
	}

	drawTextBox(cx, cy) {
		let lineData = [
			{"x": cx + 45, "y": cy - 45}, {"x": cx + 175, "y": cy - 45},
			{"x": cx + 175, "y": cy + 20}, {"x": cx + 45, "y": cy + 20},
			{"x": cx + 45, "y": cy - 45}
		];

		let lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		return d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", "black")
			.attr("stroke-width", 0)
			.attr("fill", "white");
	}

	drawRelText(mom, dad, pairBondRel) {
		let prefix;
		let endPrefix;
		let textData = [];
		let cx, cy;

		// xPos is halfway between mom and dad, and then minus a few pixels for rough centering
		cx = (mom.mapXPos - dad.mapXPos) / 2 + dad.mapXPos - 45;

		// if this pair bond shows up on the adopted line, the curve is different, so calculate the y position differently
		if (pairBondRel.subTypeToStar === "Adopted") {
			cy = (mom.mapYPos) - 30;
		} else {
			// yPos needs to account for the curve of the rel line
			// cy = (mom.mapYPos - 40) / 2 - 5;
			cy = (mom.mapYPos - 160);
		}

		// check to see if there is already a text box drawn near here
		let coord = this.drawnCoords.find(
				function(coord) {
					return Math.abs(cx - coord.x) < 120 && Math.abs(cy - coord.y) < 25;
				}
			);
		// until there is not a text box here, continue to push the text box until there is room for it
		while ( coord ) {
			cx += 1;
			coord = this.drawnCoords.find(
				function(coord) {
					return Math.abs(cx - coord.x) < 120 && Math.abs(cy - coord.y) < 25;
				}
			);
		}

		// only include divorce info if there is a divorce
		if ( pairBondRel.endDate ) {
			textData = [
				// together info
				{
					"x": cx,
					"y": cy,
					"txt": this.getRelTextPrefix(pairBondRel.relationshipType) +
					moment(pairBondRel.startDate).format("MM/DD/YYYY")
				},
				// apart info
				{
					"x": cx + 3,
					"y": cy + this.textLineSpacing,
					"txt": this.getRelTextEndPrefix(pairBondRel.relationshipType) +
					moment(pairBondRel.endDate).format("MM/DD/YYYY")
				},
			];
		} else {
			textData = [
				// together info
				{
					"x": cx,
					"y": cy,
					"txt": this.getRelTextPrefix(pairBondRel.relationshipType) +
					moment(pairBondRel.startDate).format("MM/DD/YYYY")
				}
			];
		}

		// push the box coordinates that will be drawn
		this.drawnCoords.push(
			{
				x: cx,
				y: cy
			}
		);

		// console.log("in draw rel text box, drawnCoords:", this.drawnCoords);
		// append the pairBond ID so that the text we are appending is unique and
		// doesn't prevent any other text to be written
		 return d3.select("svg").selectAll("text" + pairBondRel._id)
			.data(textData)
			.enter()
			.append("text")
			.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y; })
			.text(function(d)     { return d.txt; })
			.attr("font-family", "sans-serif")
			.attr("font-size", this.textSize)
			.attr("fill", pairBondRel.color)
			.attr("font-weight", "600");
	}

	getRelTextPrefix(relType) {
		if ( /[Mm]arriage/.test(relType) ) {
			return "m: ";
		} else if ( /[In]formal/.test(relType) ) {
			return "i: ";
		} else if ( /[Ll]iving [Tt]ogether/.test(relType) ) {
			return "l: ";
		}
		return "";
	}

	getRelTextEndPrefix(relType) {
		if ( /[Mm]arriage/.test(relType) ) {
			return "d: ";
		} else if ( /[In]formal/.test(relType) ) {
			return "e: ";
		} else if ( /[Ll]iving [Tt]ogether/.test(relType) ) {
			return "e: ";
		}
		return "";
	}

	drawFemaleSymbol(cx, cy) {
		let lineData = [
			{"x": cx, "y": cy + 40}, {"x": cx, "y": cy + 50},
			{"x": cx - 8, "y": cy + 50}, {"x": cx + 8, "y": cy + 50},
			{"x": cx, "y": cy + 50}, {"x": cx, "y": cy + 60}
		];

		let lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		return d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", "black")
			.attr("stroke-width", 3)
			.attr("fill", "none");
	}

	drawCircleHash (person) {
		let lineData = [
			{"x": person.mapXPos + 25, "y": person.mapYPos - 33},
			{"x": person.mapXPos - 33, "y": person.mapYPos + 25},
		];

		let lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		person.d3CircleHash1 = d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", "black")
			.attr("stroke-width", 2)
			.attr("fill", "black");

		lineData = [
			{"x": person.mapXPos + 33, "y": person.mapYPos - 25},
			{"x": person.mapXPos - 25, "y": person.mapYPos + 33},
		];

		lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		person.d3CircleHash2 = d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", "black")
			.attr("stroke-width", 2)
			.attr("fill", "black");

		// draw second hash mark
		lineData = [
			{"x": person.mapXPos - 25, "y": person.mapYPos - 33},
			{"x": person.mapXPos + 33, "y": person.mapYPos + 25},
		];

		lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		person.d3CircleHash3 = d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", "black")
			.attr("stroke-width", 2)
			.attr("fill", "black");

		lineData = [
			{"x": person.mapXPos - 33, "y": person.mapYPos - 25},
			{"x": person.mapXPos + 25, "y": person.mapYPos + 33},
		];

		lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		person.d3CircleHash4 = d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", "black")
			.attr("stroke-width", 2)
			.attr("fill", "black");
	}

	drawRelLine(mom, dad, color, relType) {
		let lineStrArr = [];
		let yControlPoint: number;
		let line;

		lineStrArr.push("M");
		lineStrArr.push(dad.mapXPos);
		lineStrArr.push(dad.mapYPos - 40);
		lineStrArr.push("C");
		// the smaller the Y coordinate of the control point, the higher the control point is on the map, and thus the more arc in the line
		// console.log("momYPos, momXPos, dadXPos: ", mom.mapYPos, mom.mapXPos, dad.mapXPos);
		yControlPoint = (mom.mapYPos - 60) / ((mom.mapXPos - dad.mapXPos) / 250);
		lineStrArr.push((mom.mapXPos - dad.mapXPos) / 8 * 2 + dad.mapXPos);
		lineStrArr.push( yControlPoint + ",");
		lineStrArr.push((mom.mapXPos - dad.mapXPos) / 8 * 6 + dad.mapXPos);
		lineStrArr.push( yControlPoint + ",");
		// this is the ending point of the line
		lineStrArr.push(mom.mapXPos);
		lineStrArr.push(mom.mapYPos - 40);

		line = d3.select("svg")
		.append("path")
		.attr("d", lineStrArr.join(" "))
		.attr("fill", "transparent")
		.attr("stroke", color)
		.attr("stroke-width", 2);

		if ( /[Mm]arriage/.test(relType) ) {
			// leave the line as is
		} else {
			line = line.style("stroke-dasharray", ("4,8"));
		}

		return line;
	}

	drawAdoptiveRelLine(mom, dad, color, relType) {
		let lineStrArr = [];
		let line;
		let yControlPoint: number;

		// yControlPoint is the control point of the Bezier curve that connects the adoptive parents. The higher it is on the map, the higher the arc of the curve.
		// yControlPoint = 225;
		// the bigger I make 200,000 - the lower the arc.
		// yControlPoint = 190000 / (mom.mapXPos - dad.mapXPos);
		yControlPoint = 625 / Math.log10((mom.mapXPos - dad.mapXPos) / 2);
		lineStrArr.push("M");
		// This is the beginning of the line, at the top of dad
		lineStrArr.push(dad.mapXPos + 0);
		lineStrArr.push(dad.mapYPos - 40);
		lineStrArr.push("C");

		lineStrArr.push((mom.mapXPos - dad.mapXPos) / 8 * 2 + dad.mapXPos);
		lineStrArr.push(yControlPoint);

		lineStrArr.push((mom.mapXPos - dad.mapXPos) / 8 * 6 + dad.mapXPos);
		lineStrArr.push(yControlPoint);

		// This is the end point of the line, at the top of mom
		lineStrArr.push(mom.mapXPos - 0);
		lineStrArr.push(mom.mapYPos - 40);

		line = d3.select("svg")
		.append("path")
		.attr("d", lineStrArr.join(" "))
		.attr("fill", "transparent")
		.attr("stroke", color)
		.attr("stroke-width", 2);

		if ( /[Mm]arriage/.test(relType) ) {
			// leave the line as is
		} else {
			line = line.style("stroke-dasharray", ("4,8"));
		}

		// draw the line
		return line;
	}

	drawParentalLine(parent, child, momOrDad, subType) {
		let lineData = [];

		if (momOrDad === "mom") {
			lineData = [
				{"x": parent.mapXPos, "y": parent.mapYPos + 40},
				{"x": child.mapXPos + 40, "y": child.mapYPos},
			];
		} else if (momOrDad === "dad") {
			lineData = [
				{"x": parent.mapXPos, "y": parent.mapYPos + 40},
				{"x": child.mapXPos - 40, "y": child.mapYPos},
			];
		}

		let lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		// I don't understand why, but the Angular dropdown is putting in either "0." or "0:" in front of the database value, so using a regex to check relationship type
		if ( /[Bb]iological/.test(subType) ) {
			return d3.select("svg")
				.append("path")
				.attr("d", lineFunction(lineData))
				.attr("stroke", "blue")
				.attr("stroke-width", 2)
				.attr("fill", "none");
		} else if ( /[Ss]tep/.test(subType) ) {
			return d3.select("svg")
				.append("path")
				.attr("d", lineFunction(lineData))
				.attr("stroke", "blue")
				.attr("stroke-width", 2)
				.style("stroke-dasharray", ("12,8"))
				.attr("fill", "none");
		} else if ( /[Aa]dopted/.test(subType) ) {
			return d3.select("svg")
				.append("path")
				.attr("d", lineFunction(lineData))
				.attr("stroke", "blue")
				.attr("stroke-width", 2)
				.style("stroke-dasharray", ("4,8"))
				.attr("fill", "none");
		} else {
			alert("Parental subtype does not have type of line defined to draw: " + subType + ". This is for the parental relationship between: " + parent.fName + " " + parent.lName + " and " + child.fName + " " + child.lName);
		}
	}

	drawNonBioParentLines(): void {
		let momRels = [];
		let dadRels = [];
		let mom, dad, momRel, dadRel;

		for (let child of this.children) {
			// find parents that are not biological parents and draw those relationship lines
			// find non-biological mother relationships
			// momRels = this.dataService.parentalRelationships.filter(function(parentRel){
			momRels = this.parentRels.filter(function(parentRel){
			   return /[Mm]other/.test(parentRel.relationshipType) &&
					!/[Bb]iological/.test(parentRel.subType) &&
					parentRel.child_id === child._id;
			});

			// for each mom relationship, draw parental line
			for (momRel of momRels) {
				mom = this.getPersonById(momRel.parent_id);
				// draw parental line only if the mom in the relationship has been drawn. Sometimes, if the mom has not been drawn, then give a warning to the user
				if ( this.alreadyDrawn.includes(mom) ) {
					this.drawParentalLine(mom, child, "mom", momRel.subType);
					// if the relationship has an end date, and the relationship has an end date <= the filterDate, put hash mark on line
					if ((momRel.endDate ? momRel.endDate.substr(0,10) : '9999-99-99') <= this.dateFilterString) {
						this.drawParentRightHash (child, mom, "blue");
					}
				} else {
					// mom is not drawn, so tell the user there is something fishy, and continue
					alert("There may be a problem with the parental relationship between " + child.fName + " " + child.lName + " and " + mom.fName + " " + mom.lName + ". This might be caused by " + mom.fName + " " + mom.lName + " not being in a pair bond with another parent of " + child.fName + " " + child.lName + ". It may also be that the start date of the parental relationship is before the start date of a pair bond between the parent and another parent for the child. Perhaps there is an informal relationship between " + mom.fName + " " + mom.lName + " that did start before the parenal relationship with " + child.fName + " " + child.lName + ". If so, please create that informal relationship.");
				}
			}

			// find non-bio father relationships
			// dadRels = this.dataService.parentalRelationships.filter(function(parentRel){
			dadRels = this.parentRels.filter(function(parentRel){
				return /[Ff]ather/.test(parentRel.relationshipType) &&
					!/[Bb]iological/.test(parentRel.subType) &&
					parentRel.child_id === child._id;
			});
			// for each mom relationship, draw parental line
			for (dadRel of dadRels) {
				dad = this.getPersonById(dadRel.parent_id);
				// draw parental line only if the mom in the relationship has been drawn. Sometimes, if the mom has not been drawn, then give a warning to the user
				if ( this.alreadyDrawn.includes(dad) ) {
					this.drawParentalLine(dad, child, "dad", dadRel.subType);
					// if the relationship has an end date, and the relationship has an end date <= the filterDate, put hash mark on line
					if ((dadRel.endDate ? dadRel.endDate.substr(0,10) : '9999-99-99') <= this.dateFilterString) {
						this.drawParentRightHash (child, dad, "blue");
					}
				} else {
					// dad is not drawn, so tell the user there is something fishy, and continue
					 alert("There may be a problem with the parental relationship between " + child.fName + " " + child.lName + " and " + dad.fName + " " + dad.lName + ". This might be caused by " + dad.fName + " " + dad.lName + " not being in a pair bond with another parent of " + child.fName + " " + child.lName + ". It may also be that the start date of the parental relationship is before the start date of a pair bond between the parent and another parent for the child. Perhaps there is an informal relationship between " + dad.fName + " " + dad.lName + " that did start before the parenal relationship with " + child.fName + " " + child.lName + ". If so, please create that informal relationship.");
				}
			}
		}
	}

	drawRelHash (mom, dad, pairBondRel, color) {
		// xPos is halfway between mom and dad, and then minus a few pixels for rough centering
		let cx = (mom.mapXPos - dad.mapXPos) / 2 + dad.mapXPos;

		// yPos needs to account for the curve of the rel line
		// controlPoint is the controlPoint of the Bezier line that is drawn between the male and female of the relationship. I use it to calculate the y coordinate to draw the relationship hash. It was very experimental to figure out the equation that works
		// const yControlPoint = (mom.mapYPos - 60) / (768 / dad.mapXPos);
		const yControlPoint = (mom.mapYPos - 60) / ((mom.mapXPos - dad.mapXPos) / 250);
		// dad.mapYPos - 40 is the Y position of where the relationship line begins and ends.
		// What I do is take the control point and then push the hash mark down a little. Push it down by taking the amount of space between the control point and the beginning of the line and then take a fraction of that.
		let cy = yControlPoint + ( (dad.mapYPos - 40) - yControlPoint ) / 4;
		let lineData = [
			{"x": cx - 7, "y": cy + 5}, {"x": cx + 7, "y": cy - 5},
		];

		let lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", color)
			.attr("stroke-width", 2)
			.attr("fill", color);

		// draw second hash mark
		lineData = [
			{"x": cx + 2, "y": cy + 5}, {"x": cx + 16, "y": cy - 5},
		];

		lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", color)
			.attr("stroke-width", 2)
			.attr("fill", color);
	}

	drawAdoptiveRelHash (mom, dad, pairBondRel, color) {
		// xPos is halfway between mom and dad, and then minus a few pixels for rough centering
		const cx = (mom.mapXPos - dad.mapXPos) / 2 + dad.mapXPos;

		// yPos needs to account for the curve of the rel line
		// let cy = mom.mapYPos - 65;
		// yPos needs to account for the curve of the rel line
		// controlPoint is the controlPoint of the Bezier line that is drawn between the male and female of the relationship. I use it to calculate the y coordinate to draw the relationship hash. It was very experimental to figure out the equation that works
		// const yControlPoint = 225;
		const yControlPoint = 625 / Math.log10((mom.mapXPos - dad.mapXPos) / 2);
		// dad.mapYPos - 40 is the Y position of where the relationship line begins and ends.
		// What I do is take the control point and then push the hash mark down a little. Push it down by taking the amount of space between the control point and the beginning of the line and then take a fraction of that.
		let cy = yControlPoint + ( (dad.mapYPos - 40) - yControlPoint ) / 4;

		let lineData = [
			{"x": cx - 7, "y": cy + 5}, {"x": cx + 7, "y": cy - 5},
		];

		let lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", color)
			.attr("stroke-width", 2)
			.attr("fill", color);

		// draw second hash mark
		lineData = [
			{"x": cx + 2, "y": cy + 5}, {"x": cx + 16, "y": cy - 5},
		];

		lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", color)
			.attr("stroke-width", 2)
			.attr("fill", color);
	}

	drawParentLeftHash (child, parent, color) {
		let cx, cy: number;

		// check to see if the child is to the right or left of the parent, and then accomodate for the fact that the relationship line ends on the child away from the child's mapXPos by a length equal to the radius of the circle.
		if (child.mapXPos > parent.mapXPos) {
			cx = (child.mapXPos - 40 + parent.mapXPos) / 2;
		} else {
			cx = (child.mapXPos + 40 + parent.mapXPos) / 2;
		}

		// yPos
		cy = (child.mapYPos + parent.mapYPos + 40) / 2;

		let lineData = [
			{"x": cx - 7, "y": cy + 5}, {"x": cx + 7, "y": cy - 5},
		];

		let lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", color)
			.attr("stroke-width", 1)
			.attr("fill", color);

		// draw second hash mark
		lineData = [
			{"x": cx - 5, "y": cy + 8}, {"x": cx + 9, "y": cy - 2},
		];

		lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", color)
			.attr("stroke-width", 1)
			.attr("fill", color);
	}

	drawParentRightHash (child, parent, color) {
		let cx, cy: number;

		// check to see if the child is to the right or left of the parent, and then accomodate for the fact that the relationship line ends on the child away from the child's mapXPos by a length equal to the radius of the circle.
		if (child.mapXPos > parent.mapXPos) {
			cx = (child.mapXPos - 40 + parent.mapXPos) / 2;
		} else {
			cx = (child.mapXPos + 40 + parent.mapXPos) / 2;
		}

		// yPos
		cy = (child.mapYPos + parent.mapYPos + 40) / 2;

		let lineData = [
			{"x": cx + 7, "y": cy + 5}, {"x": cx - 7, "y": cy - 5},
		];

		let lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", color)
			.attr("stroke-width", 1)
			.attr("fill", color);

		// draw second hash mark
		lineData = [
			{"x": cx + 5, "y": cy + 8}, {"x": cx - 9, "y": cy - 2},
		];

		lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		d3.select("svg")
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("stroke", color)
			.attr("stroke-width", 1)
			.attr("fill", color);
	}

	drawStar (cx, cy, person) {
		let lineData = [
			{"x": cx - 35, "y": cy - 15}, {"x": cx + 33, "y": cy - 13},
			{"x": cx - 25, "y": cy + 25}, {"x": cx, "y": cy - 35},
			{"x": cx + 25, "y": cy + 25}, {"x": cx - 35, "y": cy - 15}
		];

		let lineFunction = d3.line()
							.x(function(d) {return d.x; })
							.y(function(d) {return d.y; });

		return d3.select("svg")
			.append("svg:a")
			.attr("xlink:href", "/#/peopledetails/" + person._id)
			.append("path")
			.attr("d", lineFunction(lineData))
			.attr("id", person._id)
			.attr("class", "can-click")
			.attr("stroke", "gray")
			.attr("stroke-width", 3)
			.attr("fill", "gray");
	}

	bringAllChildrenToFront (): void {

		// this is needed to move d3 elements to the front of the drawing. Found here: http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
		d3.selection.prototype.moveToFront = function() {
		    return this.each(function(){
		        this.parentNode.appendChild(this);
		    });
		};

		for (let child of this.children) {
			// console.log("bring to front", child);
			// bringing the circle to front is not working, so going to draw it again
			if (child.mapXPos && child.mapYPos) {
				this.drawCircle(child);
				if ((child.deathDate ? child.deathDate.substr(0,10) : '9999-99-99') <= this.dateFilterString) {
					this.drawCircleHash(child);
				}
				if (child.d3Symbol) { child.d3Symbol.moveToFront(); }
				// bringing Star to the front did not work with it being a hyper-link, so re-drawing it
				if (child._id === this.star_id) { this.drawStar(child.mapXPos, child.mapYPos, child); }
				child.d3TextBox.moveToFront();
				child.d3Text.moveToFront();
			}
		}
	}

	drawTick (cx, cy, tickText) {
		var textData;
		textData = [
			// text
			{"x": cx, "y": cy, "txt": tickText}
		];

		// append the person_id so that the text we are appending is unique and
		// doesn't prevent any other text to be written
		let text = d3.select("svg").selectAll("text" + tickText)
			.data(textData)
			.enter()
			.append("text");

		text
			.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y; })
			.text(function(d)     { return d.txt; })
			.attr("font-family", "sans-serif")
			.attr("font-size", ".75em")
			.attr("fill", "black");
	}

	drawTicks() {
		this.drawTick(100, 20, "100");
		this.drawTick(200, 20, "200");
		this.drawTick(300, 20, "300");
		this.drawTick(400, 20, "400");
		this.drawTick(500, 20, "500");
		this.drawTick(600, 20, "600");
		this.drawTick(700, 20, "700");
		this.drawTick(800, 20, "800");
		this.drawTick(900, 20, "900");
		this.drawTick(1000, 20, "1000");
	}
}