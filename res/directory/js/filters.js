/** //** ----= CLASS mwFilters	=--------------------------------------------------------------------------------------\**//** \
*
* 	Directory filters controller.
*
* 	@package	morweb
* 	@subpackage	directory
* 	@category	model
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
jQuery.fn.mwFilters = function ($options) {

	if ( !this.length )
		return;

	return this.data('mwFilters').set($options);

} //FUNC rmTabs

var mwFilters		= function ($el, $options) {

	return vEventObject(['onInit', 'onSubmit', 'onReset'], {

	dom			: {				// Set of interesting dom elements

		container		: false,			// Directory container
		forms			: false,			// List of filter forms

		hints			: false,			// Hints container. Used to react to events
		hintsWrap		: false,			// Parent element of hint item. Used to fill with hints
		hint			: false,			// Hint element. Used as template.

	}, //dom
	
	is			: {				// Set of object states
		init			: false,			// Init occurs during object init/reinit
		submit			: false,			// Submit occurs during filters sumit (including events)
		reset			: false,			// Reset occurs when reset is triggered (including events)
	}, //is

	inputs			: [],				// Collection of inputs as mwFilterInput objects

/* ==== SETUP =============================================================================================================== */

	/** //** ----= set	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Updates self properties with given values.
	*
	*	@param	MIXED	$option		- Option to set. Can be data object to setup several properties.
	*	@param	MIXED	[$value]	- Value to set. Not used if object passes as first parameter.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	set		: function ($option, $value) {

		var $this = this;

		// Values can come as object, or single value
		// Applying using object, for code unification below
		// Any variable are accepted, to allow custom data storage
		var $o = {};

		if ( arguments.length === 1 )
			$o = $option;
		else
			$o[$option] = $value;

	// ==== Events ====

		// Processing events, as those should be cleared before extending
		for ( var $i in $o ) {

			// Skipping non events and non funcitons
			if ( !this.__events[$i] || !isFunction($o[$i]) )
				continue;

			// Setting up event, and removing it from opitons
			this[$i]($o[$i]);
			delete($o[$i]);

		} //FOR each opiton

	// ==== Self ====

		jQuery.extend(this, $o);

		return this;

	}, //FUNC set

	/** //** ----= init	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Initiates dom and events.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	init			: function () {

		var $this	= this;
		$el		= _jq($el);

		$this.set($options);

		// Flagging init
		$this.is.init	= true;

	// ---- DOM ----

		// Storing self in container for later reuse
		$el.data('mwFilters', $this);

		$this.dom.container		= $el;
		$this.dom.forms			= $el.find('.mwFilter');


		// Initializing inputs and hints
		$this.initInputs(); 
		$this.initHints();

	// ---- Events ----

		// Adding switch stuff to buttons clicks
		$this.dom.container.find('.mwFilter-submit')
			.on('click.mwFilter', function ($e) {

				$this.submit();

			}); //FUNC onClick

		// Adding switch stuff to buttons clicks
		$this.dom.container.find('.mwFilter-reset')
			.on('click.mwFilter', function ($e) {

				// Calling onSubmit, passing current filters set
				$this.reset($this.dom.forms);

			}); //FUNC onClick

	// ---- States ----
	
		// Styling inputs in directory
		styleDialog($el);

		// Updating hints
		$this.updateHints();

		// Unflagging init
		$this.is.init	= false;

		return $this;

	}, //FUNC init

/* ==== Inputs ============================================================================================================== */

	/** //** ----= initInputs	=------------------------------------------------------------------------------\**//** \
	*
	*	Returns combined filters collected from all forms in container.
	*
	*	@return object		- Filters set
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initInputs	: function () {

		var $this		= this;
		
		var $res		= {};
		
		// Resetting storage
		$this.inputs	= [];

		// Looping through forms and creating mwFilterInput object for each, depending on type
		$this.dom.forms.find(':input').each( function () {

			var $jInput	= jQuery(this);

			// Skipping buttons in general
			// Also skipping directly hidden input (with class)
			if ( $jInput.is('button') || $jInput.is('.hidden') )
				return;

			var $name	= $jInput.attr('name');

			// Skipping if no name
			if ( !$jInput.attr('name') )
				return;

			// Looping through declared inputs and looking for matching model
			// LAST found will be used. Done to allow more intricate validation to be added later.
			var $model	= false;
			for ( var $i in mwFilters.inputs ) {

				// Trying to create object
				$model = mwFilters.inputs[$i]($jInput).init() || $model;

			} //FOR each input model

			// If found correct model - saving in self
			if ( $model )
				$this.inputs.push($model);

		}); //each.form

		// Done here
		return $this;
		
	}, //FUNC initInputs

/* ==== FILTERS ============================================================================================================= */

	/** //** ----= getFilters	=------------------------------------------------------------------------------\**//** \
	*
	*	Returns combined filters collected from all forms in container.
	*
	*	@return object		- Filters set
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	getFilters	: function () {

		var $this	= this;

		// Looping through forms and collecting values from each
		var $res	= {};
		$this.dom.forms.each( function () {

			// Reading inputs on form			
			var $f	= formToArray(this);
			
			// Since inputs names are already set correctly - just merging results
			jQuery.extend(true, $res, $f); 
			
		}); //each.form

		// Done here
		return $res;
		
	}, //FUNC getFilters

	/** //** ----= submit	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Triggering filters submit.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	submit		: function ($el) {

		var $this	= this;
		
		// Flagging submit
		$this.is.submit	= true;
		
		// Getting filters data
		$filters	= $this.getFilters(); 

		// Calling onSubmit, passing current filters set
		$this.onSubmit( $filters );

		// Unflagging submit
		$this.is.submit	= false;

		// Nothing else to do currently

		return $this;

	}, //FUNC submit

	/** //** ----= reset	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Clears all filters on selected form.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	reset		: function ($el) {

		var $this	= this;
		$el		= _jq($el);

		// Flagging reset
		$this.is.reset	= true;

		// Looping through forms and collecting values from each
		// Supporting multiple forms at once 
		$el.each( function () {

			var $jForm	= jQuery(this);

			// Tricky clearing: should clear only filter, but keep everything else
			// For this - reading form, replacing filter with empty object, and setting as values.
			var $data	= $jForm.asArray();	
		
			$data.filters	= {};
		
			$jForm.fromArray($data);
		
		}); //each.form

		// Updating hints
		$this.updateHints();

		// Resubmitting filter
		$this.submit();

		// Calling onReset
		$this.onReset( {} );

		// Unflagging reset
		$this.is.reset	= false;
		
		return $this;

	}, //FUNC reset

/* ==== HINTS =============================================================================================================== */

	/** //** ----= initHints	=------------------------------------------------------------------------------\**//** \
	*
	*	Initializes hints related dom.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initHints		: function () {

		var $this	= this;

	// ---- DOM ----

		// Looking for hint related elements
		// Containers first, then individual item, from which can get parent
		$this.dom.hints			= $el.find('.mwFilter-Hints');
		var $hint			= $this.dom.hints.find('.mwFilterHint');
		$this.dom.hintsWrap		= $hint.parent();

		// Can't do anything if no hints found
		if ( !$this.dom.hints.length || !$hint.length ) 
			return $this;

	// ---- Events ----

		// Adding event listeners
		// Need change on all inputs on forms, and cancel clicks from hints

		// Registering input events. Adding change and keyup - this will cover all main user interractions.
		$this.dom.forms.find(':input')
			.on('change.mwFilter keyup.mwFilter', function ($e) {

				var $jInput	= jQuery(this);

				// Skipping buttons in general
				if ( $jInput.is('button') )
					return;
			
				// Also skipping special states
				// Update will be called by respected methods
				if ( $this.is.init || $this.is.submit || $this.is.reset )
					return;

				// Updating hints
				$this.updateHints();

			}); //FUNC onClick

		// Registering cancel clicks on hi1nts
		// Using delegation on wrapper to catch dynamic elements 
		$this.dom.hints
			.on('click.mwFilter', '.mwFilterHint-cancel', $this.dom.hints, function ($e) {

				// Looking for parent hint, since it does contain information necessary for clearing
				var $jButton	= jQuery(this);
				var $jHint	= $jButton.closest('.mwFilterHint');

				// Getting model from hint element
				var $input	= $jHint.data('hintModel'); 
				
				// Canceling value
				$input.removeValue($jHint);
				
				// No need to remove element - just updating all hints
				// This will automatically clear actually removed hints
				// Also this will naturally support multiple hint containers if any happen
				$this.updateHints();

			}); //FUNC onClick
			
	// ---- Template ----

		// Preparing and clearing hint template
		// Can use only one as template, so using first found

		// Removing from DOM
		$hint.remove();

		// Unhiding
		$hint.css('display', '');

		// Saving as HTML to parse later
		$this.dom.hint			= $hint[0].outerHTML;	

		return $this;
	
	}, //FUNC initHints

	/** //** ----= updateHints	=------------------------------------------------------------------------------\**//** \
	*
	*	Collects hints from all inputs on all forms, and builds hints list.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updateHints	: function () {

		var $this = this;

		// Collecting elements into one set, which will be added all at once in the end
		var $res	= jQuery([]);

		// Looping through registered inputs and rendering hints
		jQuery.each( $this.inputs, function ($i) {
			
			// Shortcut to model
			$input	= this;
			
			// Rendering
			var $el	= $input.renderHint($this.dom.hint);
			
			// If success - adding to hints otherwise - skippint
			if ( !$el || !$el.length )
				return;

			// Adding link to mode
			$el.each( function () {
			
				$el.data('hintModel', $input);	
				
			}); //FOR each element
			
			$res = $res.add($el);
			
		}); //FOR each input

		// Replacing hints
		$this.dom.hintsWrap.empty().append($res);
		
	}, //FUNC updateHints

	test		: function () {
		
		var $this	= this;
		
	//	___($this.inputs);
		
	//	__($this.getFilters()['filters']);
		
		
	/*/	
		$this.dom.forms.find(':input').each( function () {

			var $jInput	= jQuery(this);

			___($jInput, $jInput.data('test') );

		}); //FUNC onClick
	/**/
		
	}, //FUNC test

/* ==== HELPERS ============================================================================================================= */

}).init();}; //CLASS mwFilters

// Defining custom input processors namespace and base model (JS extensions)
// Currently simple model with no general setter
mwFilters.inputs	= {};

/** //** ----= CLASS mwFilterInput	=------------------------------------------------------------------------------\**//** \
*
* 	Base filter input.
*
* 	@package	morweb
* 	@subpackage	directory
* 	@category	model
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
var mwFilterInput	= function ($el) {

	return vEventObject(['onInit', 'onChange'], {

	dom			: {				// Set of interesting dom elements
		input			: false,			// Input element
		hint			: false,			// Hint template
	},

	type			: 'text',			// Model type (class name) 
	parent			: false,			// Parent mwFilter model  

	/** //** ----= isMatch	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Checks if given input belongs should be managed with this object.
	*	Should be overwritten by descedants. 
	*
	*	@return bool		- Validation result
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	isMatch			: function ($el) {
	}, //FUNC isMatch

	/** //** ----= init	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Initiates dom and events.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	init			: function () {

		var $this		= this;
		$el			= _jq($el);

		// Validating input type
		if ( !$this.isMatch($el) )
			return false;

	// ---- DOM ----

		// Storing self in container for later reuse
		$el.data('mwFilterInput', $this);
		
		$this.dom.input		= $el;

		return $this;

	}, //FUNC init

	/** //** ----= renderHint	=------------------------------------------------------------------------------\**//** \
	*
	*	Renders hint element using template provided.
	*	Should be overwritten by descedants. 
	*
	*	@return jQuery		- Set of hint elements.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	renderHint		: function ($html) {
	}, //FUNC renderHint

	/** //** ----= removeValue	=------------------------------------------------------------------------------\**//** \
	*
	*	Clears corresponding value from input.
	*	Should be overwritten by descedants. 
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	removeValue		: function ($el, $val) {
	}, //FUNC removeValue

})}; //CLASS mwFilterInput

mwFilters.inputs.text	= function ($el) {

	var $parent		= mwFilterInput($el);
	return jQuery.extend({}, $parent, {

	type		: 'text', 

	/** //** ----= isMatch	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Checks if given input belongs should be managed with this object.
	*	Should be overwritten by descedants. 
	*
	*	@return bool		- Validation result
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	isMatch			: function ($el) {

		var $this		= this;
		$el			= _jq($el);

		return $el.is('input[type=text], input[type=search], input[type=number], input[type=tel], input[type=email], input[type=url]');

	}, //FUNC isMatch

	/** //** ----= renderHint	=------------------------------------------------------------------------------\**//** \
	*
	*	Renders hint element using template provided.
	*
	*	@return jQuery		- Set of hint elements.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	renderHint		: function ($html) {

		var $this	= this;
		
		// Getting value
		var $val	= $this.dom.input.val();
		
		// Nothing to do if empty
		if ( !$val )
			return false;
			
		// Rendering html into jQuery
		var $el		= jQuery (arrayToTemplate({'value' : $val}, $html, true) );
		
		// Storing source input, to reuse later
		$el.data('hintInput', $this.dom.input);
		
		return $el;
		
	}, //FUNC renderHint

	/** //** ----= removeValue	=------------------------------------------------------------------------------\**//** \
	*
	*	Clears corresponding value from input.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	removeValue		: function ($el) {
		
		// Getting source input
		var $jInput	= $el.data('hintInput'); 
		
		// Just setting empty value
		$jInput.val('');
		
		// Update will happen outside
		
	}, //FUNC removeValue

})}; //CLASS mwFilterInput_text

mwFilters.inputs.select	= function ($el) {

	var $parent		= mwFilterInput($el);
	return jQuery.extend({}, $parent, {

	type		: 'select', 

	/** //** ----= isMatch	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Checks if given input belongs should be managed with this object.
	*	Should be overwritten by descedants. 
	*
	*	@return bool		- Validation result
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	isMatch			: function ($el) {

		var $this		= this;
		$el			= _jq($el);

		return $el.is('select');

	}, //FUNC isMatch

	/** //** ----= renderHint	=------------------------------------------------------------------------------\**//** \
	*
	*	Renders hint element using template provided.
	*	Should be overwritten by descedants. 
	*
	*	@return jQuery		- Set of hint elements.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	renderHint		: function ($html) {

		var $this	= this;
		
		// Shortcut to input element
		var $input	= $this.dom.input;
		
		// Looping through options, checking which ones are selected
		// Generating hint for each with caption as value
		// Collecting results into set of elements
		var $res	= jQuery([]);
		$input.find('option').each( function () {
			
			var $jOption	= jQuery(this);
			
			// Doing nothing if not selected
			if ( !this.selected )
				return;
			
			// Checking value - skipping zeros
			if ( $jOption.val() === '' )
				return;
			
			var $cap	= $jOption.html();

			// Generating element
			var $el		= jQuery( arrayToTemplate({'value' : $cap}, $html, true) );	

			// Storing source input, to reuse later
			$el.data('hintInput', $jOption);
			
			// Now - generating hint into collection using caption as label
			$res	= $res.add( $el );
			
		}); //FOR each option

		// Returning resulting collection
		return $res;

	}, //FUNC renderHint

	/** //** ----= removeValue	=------------------------------------------------------------------------------\**//** \
	*
	*	Clears corresponding value from input.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	removeValue		: function ($el) {

		var $this	= this;
		
		// Getting source input
		var $jInput	= $el.data('hintInput'); 
		
		// Just unselecting
		$jInput.get(0).selected = false;

		// Triggering input change
		$this.dom.input.change();				
		
	}, //FUNC removeValue

		
})}; //CLASS mwFilterInput_select

mwFilters.inputs.checkbox	= function ($el) {

	var $parent		= mwFilterInput($el);
	return jQuery.extend({}, $parent, {

	type		: 'checkbox', 

	/** //** ----= isMatch	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Checks if given input belongs should be managed with this object.
	*	Should be overwritten by descedants. 
	*
	*	@return bool		- Validation result
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	isMatch			: function ($el) {

		var $this		= this;
		$el			= _jq($el);

		return $el.is('input[type=checkbox], input[type=radio]');

	}, //FUNC isMatch

	/** //** ----= renderHint	=------------------------------------------------------------------------------\**//** \
	*
	*	Renders hint element using template provided.
	*	Should be overwritten by descedants. 
	*
	*	@return jQuery		- Set of hint elements.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	renderHint		: function ($html) {

		var $this	= this;
		
		// Shortcut to input element
		var $input	= $this.dom.input;
		
		// Getting value if present, state and caption
		var $cap	= $input.attr('cap');
		var $val	= $input.attr('value');
		var $checked	= $input.get(0).checked;
		
		// Nothing to do if not checked
		if ( !$checked )
			return false;
			
		// Rendering html into jQuery
		var $el		= jQuery( arrayToTemplate({'value' : $cap}, $html, true) );	
		
		// Storing source input, to reuse later
		$el.data('hintInput', $this.dom.input);
		
		return $el;

	}, //FUNC renderHint

	/** //** ----= removeValue	=------------------------------------------------------------------------------\**//** \
	*
	*	Clears corresponding value from input.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	removeValue		: function ($el) {
		
		// Getting source input
		var $jInput	= $el.data('hintInput'); 
		
		// Just unchecking
		$jInput.get(0).checked = false;
		
		// Triggering change to ensure input update
		$jInput.trigger('change');
		
		// Update will happen outside
		
	}, //FUNC removeValue
		
})}; //CLASS mwFilterInput_checkbox
