/** //** ----= ___	=----------------------------------------------------------------------------------------------\**//** \
*
*	Shortcut to console.log()
*
*	@param		MIXED	*	- Variables to dump.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function ___() {
	
	console.log.apply(console, arguments);
	
} //FUNC ___

function mwError (msg) {
	return '<div class="status error">' + msg + '</div>';
} //FUNC mwError

function mwSuccess (msg) {
	return '<div class="status success">' + msg + '</div>';
} //FUNC mwSuccess

function mwHint (msg) {
	return '<div class="status hint">' + msg + '</div>';
} //FUNC mwHint

function mwWarning (msg) {
	return '<div class="status warning">' + msg + '</div>';
} //FUNC mwWarning

function mwFormToggle ($form, $target, $state) {
	
	// Makikng sure it's jQuery
	$form = _jq($form);
	
	// One of form elements can be provided instead of form itself
	// Checking if that's the case.
	if ( !$form.is('form') )
		$form = $form.closest('form');
	
	// Searching target on form
	var $tEl = $form.find($target);
	
	// Toggling
	if ( !isEmpty($state) )
		$tEl.show();
	else
		$tEl.hide();
	
} //FUNC mwFormToggle

/*--------------------------------------------------------------------------------*\
|	updateDimensions
|----------------------------------------------------------------------------------
| Updates current dimensions setting for future use.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		NONE
|	Return:
|		NULL
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function updateDimensions () {

	var wnd			= screenSize();
	var desktop_height	= wnd.height - jQuery('#HintBarContainer').height() - jQuery('#NavigationContainer').height(); 

	setCookie('mwWorkSpaceWidth', wnd.width);
	setCookie('mwWorkSpaceHeight', desktop_height);

} //FUNC updateDimensions
/*/
function initLTRows () {
	jQuery('.ListingTable TR:even').addClass('Even');
} //FUNC initLTRows
/**/

/*--------------------------------------------------------------------------------*\
|	pulseAncor
|----------------------------------------------------------------------------------
| Pulsates given block.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		ancor	string	- Block name to pulsate.
|	Return:
|			bool	- Always FALSE.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function pulseAncor (ancor) {

	// DEPRECATED, left just as dummy
	return false;
	
	if ( !ancor ) 
		return false;

	jQuery('A[name='+ancor+']').effect('pulsate');
	
	return false;
} //FUNC pulseAncor

/*--------------------------------------------------------------------------------*\
|	initDatePicker
|----------------------------------------------------------------------------------
| Initiates DatePickers on page.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		NONE
|	Return:
|		bool	- Always false.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function initDatePicker () {
	
	Date.format = 'yyyy-mm-dd';
	
	jQuery('INPUT.Date').each( function () {

		var el = jQuery(this);

		el.datePicker({clickInput:true, createButton:false, startDate: '2000-01-01'});
	//	el.dpSetSelected(el.val());
		
	}); //jQuery each 
	
	return false;
} //FUNC initDatePicker

/*--------------------------------------------------------------------------------*\
|	updateAjaxLinks
|----------------------------------------------------------------------------------
| Updates page links wich should be loaded using AJAX.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		NONE
|	Return:
|		bool	- Always FALSE.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function updateAjaxLinks () {
	jQuery('A.ajax').each( function () {
		this.onload	= this.onclick;
		this.onclick	= '';
	});
	jQuery('A.ajax').unbind('click');
	jQuery('A.ajax').click( function() {
		return pageAjax(this);
	}); //FUNC click
	
} //FUNC updateAjaxLinks

var mwPerson = {
	
	/** //** ----= getTitle	 	 =----------------------------------------------\**//** \
	*
	* 	Attempts to retrieve person title name to show in dialogs.
	*
	*	@param	object	person		- Person data object.
	*	@param	string	[template]	- Custom template to use.
	*
	*	@return string			- Contact title.
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	getTitle		: function (person, template) {
		
		template = template || '{name} {first_name} {last_name} {firstname} {lastname}';
		
		return parseVariables(template, person).multiClean().trim();
	}, //FUNC getName

	/** //** ----= getEmail	 	 =----------------------------------------------\**//** \
	*
	* 	Attempts to retrieve person email to show in dialogs.
	*
	*	@param	object	person		- Person data object.
	*
	*	@return string			- Contact title.
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	getEmail	: function (person) {
		return arraySelectValue(person, ['email', 'mail'], '').trim();
	} //FUNC getName
	
} //OBJECT mwPerson
