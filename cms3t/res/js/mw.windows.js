/** //** ----= mwFade		 =-------------------------------------------------------------------------------------\**//** \
*
* 	Fades element using animation setting. Base function for mwShow()/mwHide() 
*	If no element specified, or element is invisible callback will be triggered immediately.
*
*	@param	bool	$state		- Set TRUE to show, FALSE otherwise.
*	@param	jQuery	$el		- jQuery element to fade.
*	@param	funtion	$callback	- Callback to call on finish.
*
*	@return	jQuery			- Given element, for chain calls.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwFade ($state, $el, $callback) {

	// Checking if callback given, and element happen to not exist
	if ( isFunction($callback) )
		if ( !$el || (isJQ($el) && $el.length == 0) )  {
			$callback();
			return $el;
		} //IF no item specified

	// Making sure dealing with jQuery
	// At this point element does exists
	// It's either directly DOM element, or non empty jQuery
	$el = _jq($el);

	// Checking visibility	
	var $visible	= $el.is(':visible'); 

	// Deciding animaiton depending on state and visiblity
	var $animate	= ( $state != $visible );

	// Defining speed
	var $speed	= 250; //<?=mwSkin('transition.speed')?>; 

	// Animating if necessary, othewise - just changing state
	if ( $animate ) {		

		// Stopping current animation (if any)
		// ToDo: stop or not to stop
		$el.stop(true);
		
		// Animating
		if ( $state )
			$el.fadeIn($speed);
		else
			$el.fadeOut($speed);

		// Calling callback via promise to avoid multiple callbacks.
		jQuery.when($el).done( function () {
	
			// Clearing opacity (fix for partial fade animation stop)
			jQuery(this).css('opacity', '');
	
			// Triggering callback
			if ( isFunction($callback)  )
				$callback();
	
		}); //jQuery.done.callback;

	} //IF animation
	else {  

		// Just toggling visibility
		if ( $state )
			$el.show();
		else
			$el.hide();
	
		// Triggering callback
		if ( isFunction($callback)  )
			$callback();

	} //IF static
	
	// Returning original element back
	return $el;
	
} //FUNC mwFade

/** //** ----= mwShow		 =-------------------------------------------------------------------------------------\**//** \
*
* 	Displays given element using animation setting. 
*	If no element specified, or element is invisible callback will be triggered immediately.
*
*	@param	jQuery	$el		- jQuery element to show.
*	@param	funtion	[$callback]	- Callback to call on finish.
*
*	@return	jQuery			- Given element, for chain calls.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwShow ($el, $callback) {

	// Just calling fade
	return mwFade(true, $el, $callback);

/*/

	if ( isFunction($callback) && (!$el || (isJQ($el) && $el.length == 0)) ) {
		$callback();
		return $el;
	} //IF no item specified

	$el = _jq($el);

	if ( !$el.is(':visible') ) {		

		// ToDo: stop or not to stop
		$el.stop(true).fadeIn(<?=mwSkin('transition.speed')?>);

		// Calling callback via promise to avoid multiple callbacks.
		jQuery.when($el).done( function () {
	
			// Clearing opacity (fix for partial animation stop on show)
			jQuery(this).css('opacity', '');
	
			if ( isFunction(callback)  )
				$callback();
	
		}); //jQuery.done.callback;

	} //IF animation
	else {  

		$el.show();
	
		if ( isFunction(callback)  )
			$callback();

	} //IF static
	
	return $el;
/**/
} //FUNC mwShow

/** //** ----= mwHide		 =-------------------------------------------------------------------------------------\**//** \
*
* 	Hides given element using animation setting.
*	If no element specified, or element is visible callback will be triggered immediately.
*
*	@param	jQuery	$el		- jQuery element to hide.
*	@param	funtion	[$callback]	- Callback to call on finish.
*
*	@return	jQuery			- Given element, for chain calls.
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwHide ($el, $callback) {

	// Just calling fade
	return mwFade(false, $el, $callback);

/*/
	el = _jq(el);
	
	___(el);
	
	if ( el.is(':visible') ) {		

		// ToDo: stop or not to stop
		el.stop(true).fadeOut(<?=mwSkin('transition.speed')?>);

		// Calling callback via promise to avoid multiple callbacks.
		jQuery.when(el).done(function () {
	
			// Clearing opacity (fix for partial animation stop on show)
			_jq(this).css('opacity', '');
	
			if ( callback )	callback();
	
		}); //jQuery.done.callback

	} else { //IF animation 

		el.hide();

		if ( callback )	callback();

	} //IF static
	
	return el;
/**/
} //FUNC mwHide

/** //** ----= CLASS mwWinManager	=------------------------------------------------------------------------------\**//** \
*
* 	Morweb windows manager class
*
* 	@package	VIT-Lib
* 	@subpackage	Tools
* 	@category	Helper
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
var mwWinManager = {

	Windows		: {},			// All windows are stored here.
	Layers		: [],			// Visible layers list.
	
	Overlay		: false,		// jQuery shortcut to overlay.
	OverlayZ	: 3000,			// Overlay z-index.
	
	Container	: false,		// Windows container

	/** //** ----= init	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Initiates manager, creates shortucts to usefull elements.
	*
	*	@return	SELF		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	init	: function () {
		
		var $this = this;
		
		// Checking if need to initiate at all
		if ( this.Container ) 
			return this;
			
		this.Container	= jQuery('#mwSectionWindows');
		this.Overlay	= jQuery('#mwWindowsOverlay');

		// Binding self to browser resize
		jQuery(window).resize( function () {
			$this.updatePoistions();
		}); //jQuery.onResize

		// Listening for escape button
		jQuery(window).keyup( function ($event) {

			// Esc			
			if ( $event.which == '27' ) {

				var $w = $this.getTop();
				
				if ( !$w || !$w.Visible || !$w.escClose )
					return;

				$w.hide();

			} //IF Esc pressed
			
		}); //jQuery.keyup

		return this;
	}, //FUNC init
		
	/** //** ----= updateOverlay	=------------------------------------------------------------------------------\**//** \
	*
	* 	Updates overlay, depending on visible layers state.
	*
	*	@return	SELF		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updateOverlay	: function () {

		// Making sure it is initiated
		// ToDo: need better way to call init only once, though it is fast already
		this.init();

	/*/
		// If overlay is not searched yet - it's right time to do so
		if ( !this.Overlay )
			this.Overlay = jQuery('#sysOverlay');
	/**/

		// Searching for modal windows in layers.
		var state = false;
		for ( var i = 0; i < this.Layers.length; i++ ) {
			if ( this.Layers[i].Modal ) {
				state = true;
				break;
			} //IF modal found
		} //FOR each layer

		// Showing or hiding, based on modals presence
		if ( state )
			mwShow( this.Overlay );
		else
			mwHide( this.Overlay );

		return this;
	}, //FUNC updateOverlay

	/** //** ----= updatePoistions	=------------------------------------------------------------------------------\**//** \
	*
	* 	Updates layers windows positions and dimensions.
	*
	*	@return	SELF		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updatePoistions	: function () {
		
		// If there are no layers - there is nothing to do
		if ( !this.Layers.length )
			return this;

		// Looping through layers and updating windows		
		for ( var i = 0; i < this.Layers.length; i++ ) {


			var wobj = this.Layers[i];	// Just shortcut

			// Ignoring werid items, and extensions
			if ( !wobj || isFunction(wobj) ) continue;

			// Making sure to work only with visible windows
			if ( !wobj.Visible ) continue;
			
			// Giving slight delay for windows to apply their math
			setTimeout( function () {
				wobj.align();
			}, 1);

		} //FOR each layer
		
		return this;
	}, //FUNC updatePoistions
	
	/** //** ----= addLayer	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Adds window to top of visible layers.
	*
	* 	@param	object(mwWindow)	window	- Window to add as visible.
	* 
	*	@return	SELF		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	addLayer	: function (window) {
		
		// Removing window from layers (if was there before), to move window on top
		this.removeLayer(window);

		this.Layers.push(window);
		
		return this;
	}, //FUNC addLayer

	/** //** ----= removeLayer	=------------------------------------------------------------------------------\**//** \
	*
	* 	Removes window from visible layers list.
	*
	* 	@param	object(mwWindow)	window	- Window to add as visible.
	* 
	*	@return	SELF		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	removeLayer	: function (window) {

		// Looking up for window in layers list
		var vp = this.Layers.indexOf(window);
		
		if ( vp >= 0 )
			this.Layers.splice(vp, 1);
		
		return this;
	}, //FUNC removeLayer

	/** //** ----= updateLayers	=------------------------------------------------------------------------------\**//** \
	*
	* 	Updates visible layers, setting proper z-index to each window.
	*
	*	@return	SELF		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updateLayers	: function () {
		
		// If somehow at this point there are no layers - nothing to do.
		if ( !this.Layers.length )
			return this;
		
		// Calcualting lowest layer z-index, which should be below overlay
		var top = this.OverlayZ - this.Layers.length;
		
		// Looping through all layers, setting z-index, decrementing it
		// Skipping top one, which will be above overlay in any case
		for ( var i = 0; i < this.Layers.length - 1; i++ ) {

			var wobj = this.Layers[i];	// Just shortcut

			// Ignoring werid items, and extensions
			if ( !wobj || isFunction(wobj) ) continue;

			// Setting z-index, top windows will be stick above overlay
			wobj.Window.css('z-index', wobj.AlwaysOnTop ? this.OverlayZ + 2 + i : top + i);
			
		} //FOR each layer

		// i should contain top layer index now, setting z-index to it 
		this.Layers[i].Window.css('z-index', this.OverlayZ + 1);
		
		return this;
	}, //FUNC updateLayers

	/** //** ----= getTop	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Returns top visible window.
	*
	*	@todo	Take always on top into account.
	*
	*	@param	bool	[$modal]	- Set TRUE to check only modals.
	*
	*	@return	object(mwWindow)	- Top window.		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	getTop	: function ($modal) {
		
	 	// If no active layers - returning nothing
	 	if ( !this.Layers.length )
	 		return false;
		
		// If modal is not required - returning just top
		if ( !$modal )
			return this.Layers[this.Layers.length - 1];
			
		// Need to loop through all windows to find top modal
		for ( var $i = this.Layers.length; $i > 0; $i-- ) {
			
			var $w = this.Layers[$i-1];
			
			// First modal found this way is what we need
			if ( $w.Modal )
				return $w;
			
		} //FOR each window
		
		// Nothing found, try next time
		return false;
	} //FUNC getTop

} //OBJECT mwWinManager

/** //** ----= mwWindow		 =----------------------------------------------\**//** \
*
* 	Returns window object. If specified window does not eixists, creates new one.
*
*	@param	string	id	- Window ID to return.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwWindow (id) {
	
	// Making sure winManager is initiated
	mwWinManager.init();

	if ( !mwWinManager.Windows[id] )
		mwWinManager.Windows[id] = new mwWindowObject(id);
	
	return mwWinManager.Windows[id];
} //FUNC mwWindow

/** //** ----= CLASS mwWindowObject	 =----------------------------------------------\**//** \
*
* 	Window manipulation class.
*
* 	@package	MorwebManager
* 	@subpackage	core
* 	@category	java-tools
*
\**//** --------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
var mwWindowObject = function (id) {
	if ( id ) this.ID = id;
} //CONSTRUCTOR mwWindowObject

mwWindowObject.prototype = {

// ---- Meta Options ----
	
	ID		: '',				// Internal Window ID

// ---- Common elements ----
	
	Window		: false,			// jQuery Window element, points to window element
	Body		: false,			// jQuery window body element. Usually source element.

	winHeader	: false,			// jQuery pointer to window header element.
	winFooter	: false,			// jQuery pointer to window footer element.

// ---- Appearance ----
	
	winClass	: 'mwWindow',			// Window class.
	winTitle	: '',				// Stores current window title.
	
	Modal		: true,				// Modal window (if TRUE will add overlay and prevent actions outside window)
	AlwaysOnTop	: false,			// Force this window to stay on top of others anyway. Useful for loaders/debug etc.
	escClose	: true,				// Allow or not closing window on escape
	
	addHedaer	: false,			// Specifies if need to add header elements.
	addControls	: true,				// Specifies if need to add window controls, like close button.
	addFooter	: true,				// Specifies if need to add footer elements.
	addFooterEx	: true,				// Specifies if need to add extra footer elements, like loader and status placeholder.

// ---- Auto align options ----

	AlignAt		: 'top-center',			// By default aligns at descktop center. For possible options see VIT-Lib align() function.
//	Margin		: 40,				// Whitespace to leave around window on align calculations.

	limitHeight	: 0,				// Allows to set height limit for window
	limitWidth	: true,				// Allows to set width limit for window according to screen size.
	minWidth	: true,				// Set FALSE or speciefic value to force window min width
	
	minFlexHeight	: 80,				// Minimal height allowed for scrollable containers (usually full height)
	
	maximized	: false,			// Toggles window initial size. Set TRUE for window to follow browser size.
	
// ---- Misc ----	
	
	Visible		: false,			// Visible indicator
	Concurrent	: {},				// Affected concurrent windows and their z-indexes
	updateTimer	: false,			// Timer used to collect update requests

	/** //** ----= WinID		 =----------------------------------------------\**//** \
	*
	* 	Returns ID of window element.
	*
	*	@return	string		- Window ID.
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	WinID	: function () {
		return 'w_' + this.ID;
	}, //FUNC WinID
	
// ==== INITIATION ==== 	

	/** //** ----= Source		 =----------------------------------------------\**//** \
	*
	* 	Sets up window using specified source. Can be either content or element.
	*
	*	@param	MIXED	s	- Valid content or element source.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	Source		: function (s) {
		
		// If nothing given - doing nothing
		if ( s === undefined ) return this;
		
		// If jQuery or DOM object - passing using as element
		if ( s instanceof jQuery ) return this.Element(s);
		if ( typeof(s) == 'object' ) return this.Element(s);
		
		// If contetns looks more like jQuery selector - still passing to set as element
		if ( typeof(s) == 'string' && (s.length < 50) && s.match(/[#\.]{1}[A-Za-z]{2,}/) ) return this.Element(s);
		
		// Otherwise this is just content, passing it to Content() which will make element from it.
		return this.Content(s);
	}, //FUNC Source
	
	/** //** ----= Content		 =----------------------------------------------\**//** \
	*
	* 	Sets up window using specified content.
	*
	*	@param	MIXED	c	- Content as HTML string or callback function to call 
	*				  content from.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	Content		: function (c) {
		
		if ( typeof(c) == 'function' ) c = c();
			
		var el = jQuery('<div class="winEl" id="' + this.ID + '">' + c + '</div>').appendTo(mwWinManager.Container);
		
		return this.Element(el);

	}, //FUNC Content
	
	/** //** ----= Element		 =----------------------------------------------\**//** \
	*
	* 	Sets up window using specified element.
	*
	*	@param	object	el	- jQuery selector, object or DOM element. 
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	Element		: function (el) {
		
		if ( !(el instanceof jQuery) )
			el = jQuery(el);
		
		this.Body = el;
		
		return this._create();
		
	}, //FUNC Element

	/** //** ----= _create		 =----------------------------------------------\**//** \
	*
	* 	Initiates window based on parameters set. Should not be called directly.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	_create	: function () {
		
		var id	= this.ID;
		var wid	= this.WinID();
		var el	= this.Body; 
		
		if ( !el ) throw 'Invalid window setup on initiation (' + this.ID + ')';

	// ---- Settings ----

		// Reading window settings
		var $sEl	= el.find('[data-settings]');
		if ( $sEl.length ) {
			
			// Parsing params using eval, to be less strict on format
			// Regualr object are easier to define/manage inline.
			var $set	= eval( '(' + $sEl.data('settings') + ')' );
			
			// Merging with defaults
			jQuery.extend(this, $set);
			
			$sEl.remove();
			
		} //IF settings found 

		// Initiating form elements anyway, just to ensure all elements are styled
		styleDialog(this.Body.find('.mwDialog'));

		// Checks if window is initiated already
		if ( el.hasClass('winBody') ) return this;

	// ---- BODY ----
	
		el.addClass('winBody');

		if ( !this.minWidth )
			el.css('min-width', 'auto');
		else if ( this.minWidth !== true )
			el.css('min-width', this.minWidth);

	// ---- TITLE ----
	
		var title = el.attr('title');

		if ( title ) {
			
			this.winTitle = title;
			
			el.removeAttr('title');
			
		} //IF title set

	// ---- WINDOW ----

		el.wrapAll('<div class="' + this.winClass + '" id="' + wid + '"></div>');
		el.show();
		
		var wnd = this.Window = jQuery('#'+wid);

		// Initiating window geometry
		this.initGeometry();

	// ---- HEADER ----
		
		// We need to have smth there to do not collapse title. Can be reassigned later anyway.
		if ( !this.winTitle )
			this.winTitle = '&nbsp;';

		// Searching for header
		// Need to move it on top of window
		var $header = el.find('.winHeader');

	/**/
		if ( $header.length )
			wnd.prepend($header);
		else if ( this.addHedaer )
			wnd.prepend('<div class="winHeader">' + this.winTitle + '</div>');
	/*/		
			
		if ( this.addHedaer && !$header.length )
			el.prepend('<div class="winHeader">' + this.winTitle + '</div>');
	/**/
		
		// Saving header element for future
		this.winHeader = wnd.find('.winHeader');
		
		if ( this.winHeader.length && wnd.draggable )
			wnd.draggable({ 
				handle	: '.winHeader',
				drag	: function () {
					if ( typeof(mwHelp) !== 'undefined' ) {
						if ( mwHelp.visible )
							mwHelp.update();
					} //IF help enabled
				} //FUNC draggable.drag
			}); //OBJECT draggable.options
		
	// ---- TABS ----
	
		// Initializing tabs
		mwInitTabs(el);

	// ---- FOOTER ----

		// Searching for footer
		// Need to move it on bottom of window
		var $footer = el.find('.winFooter');
	/**/
		if ( $footer.length )
			wnd.append($footer);
		else if ( this.addFooter )
			wnd.append('<div class="winFooter"><a class="winCloseClick">Close</a></div>');
	/*/		
		if ( this.addFooter && !$footer.length )
			el.append('<div class="winFooter"><a class="winCloseClick">Close</a></div>');
	/**/

		// Saving footer element for future
		this.winFooter = wnd.find('.winFooter');

		if ( this.addFooter && this.addFooterEx ) {
			
			var foot = this.winFooter;

			foot.children().wrapAll('<div class="winSubmit"></div>');
			
			foot.append('<div class="winStatus"></div>');
			foot.append('<div class="Clear"></div>');
			
			var loader = jQuery('<div class="winLoader"></div>').appendTo(foot);
			mwSkinLoader(loader); 
			
		} //IF adding extra

	// ---- CONTROLS ----
		
		if ( this.addControls ) {
			
			// Looking up for tools container, and creating new if none found
			var $tools = wnd.find('.winTools');
			if ( !$tools.length )
				$tools = jQuery('<div class="winTools"></div>').appendTo(wnd); 

			// Looking up for close button
			var $toolClose = wnd.find('.winTool.close');
			if ( !$toolClose.length )
				jQuery('<div class="winTool help winHelpClick"></div><div class="winTool close winCloseClick"></div>').prependTo($tools);
		/*/
			// Looking up for help button
			if ( mwHelp.Data[id] ) {
				var $toolHelp = wnd.find('.winHelp');
				if ( !$toolHelp.length )
					jQuery('<div class="winTool help winHelpClick"></div>').prependTo($tools);
			} //IF no help button
		/**/	
		} //IF need to add controls

		// Adding close click
		wnd.find('.winCloseClick')
			.off('click.winTool.close')
			.on('click.winTool.close', function () {
				
				// Any kind of help is closed if user decides to cancel
				if ( typeof(mwHelp) !== 'undefined' ) {
					mwHelp.hide();
				} //IF help is enabled
				
				mwWindow(id).hide();
			}); //FUNC onClick	

	// ---- Hints ----
	
	//	if ( window.setHintElements )
	//		setHintElements('#' + id + ' [title], #' + id + ' [hint], #' + id + ' [error]' , id);

		if ( window.mwWatchHints )
			mwWatchHints(el, wid);

	// ---- Help ----
	
		if ( typeof(mwHelp) !== 'undefined' ) {

			// Supporting simplified element syntax, so need to create standalone HTML copy, to wrap propertly with required elements (book/page)
			var $help_html = '';
			
			// All .winHelp and .winHelpPage immideate descedants are help hints
			// Difference is that all .winHelp hints are combined into first page of window book, 
			// but .winHelpPage elmeents are standalone pages
			// Marking all them with .helpHint
			el.find('.winHelp>*, .winHelpPage>*').addClass('helpHint');

			// Searching hints inside window	
			var $hints = el.find('.winHelp');
			$hints.each( function () {
				var $hel = jQuery(this);

				// Skipping ones, which are wrapped into pages already
				if ( $hel.parent().is('.helpPage, .winHelpPage') )
					return;
				
				$help_html += $hel.html();
			}); //jQuery.each

			// Wrapping hints with window default inline page
			if ( $help_html )
				$help_html = '<div class="helpPage" data-overlay="0">' + $help_html + '</div>';
			
			// Searching help pages
			var $pages = el.find('.winHelpPage');
			$pages.each( function () {
				var $pel = jQuery(this);
				
				// Pages should be marked so
				$pel.addClass('helpPage');
				
				// Not using overlay inside windows
				$pel.attr('data-overlay', '0');
			
				$help_html += getOuterHTML($pel.get(0));
			}); //jQuery.each

			// Wrapping all pages into a window inline book and initiating it

			if ( $help_html ) {
				
				// Adding wrapper div, becase .fromHtml() takes wrapper and searches withing.
				// Ideally window boddy should be passed, but in this case simplified syntax is used
				$help_html = '<div><div class="helpBook" data-type="inline" data-name="' + id + '">' + $help_html + '</div></div>';
				
				mwHelp.fromHtml($help_html);				

				// Adding help click
				wnd.append('<div class="winTool help winHelpClick"></div>');
			} //IF hints found

		} //IF help present

		// Initiating all help clicks, supporting custom ones
		wnd.find('.winHelpClick')
			.off('click.winTool.help')
			.on('click.winTool.help', function () {
				// Toggling help
				if ( mwHelp.visible )
					mwHelp.hide();
				else
					mwHelp.show('inline', id);
			}); //FUNC onClick	
		
		return this;
	}, //FUNC _create

	/** //** ----= _destory		 =----------------------------------------------\**//** \
	*
	* 	Inverts changes done by _create. I.E. Makes given element back as regular element.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	_destory	: function () {
		
		var id	= this.WinID();
		var el	= this.Body; 
		
	}, //FUNC _destory

	/** //** ----= init		 =----------------------------------------------\**//** \
	*
	* 	Takes set of options as parameters and initiates object based on them. Allows 
	*	setup with methods.
	*
	*	@param	object	options	- Options to support.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	init	: function (options) {

	// ---- Setting value parameters ----

		for ( var op in options ) {

			if ( this[op] === undefined ) continue;
			if ( typeof(this[op]) == 'function' ) continue;
			
			this[op] = options[op];

		} //FOR each option

	// ---- Calling function parameters ----
	
		// Calling manually each to force correct order.
		
		var m = ['Content', 'Element', 'Source', 'Title', 'Class'];
		
		for ( var op in m ) {
			
			var option = m[op];
			
			if ( options[option] )
				this[option](options[option]);
			
		} //FOR each allowed method

		return this;	
	}, //FUNC init

	/** //** ----= initGeometry	=------------------------------------------------------------------------------\**//** \
	*
	* 	Initiates geometry and adds necessary markup.
	*
	*	@return	SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initGeometry	: function ( $context ) {
		
		var $this	= this;
		var $context	= $context || this.Body;
		
		// First dialog of padded content should negate label margin (except wide)
		// Looking for non wide dialogs and checking closest content
		// Using js/jQuery to always match paddings rules defined in css
		// Selecting all dialogs, to make sure to clear shift on wide ones
		var $dialogs = $context.find('.mwDialog');
		
		// Looping through, and checking closest winContent top padding
		$dialogs.each( function () {
		
			var $el		= jQuery(this);
			
			// Checking if dialog is first in set
			// Can't use :first-child, because hidden inputs are allowed and should be ignored
			var $prev	= $el.prevAll(':not(input[type=hidden])');
			
			// Applied only to non wide dialogs that start up with label
			// Also shift applies only to modern layout
			if ( $prev.length !== 0 || !$el.children('dt:first-child, dd.formGroup:first-child').length ) {
				
				$el.removeClass('shiftUp');
				return;
				
			} //IF wide dialog
			
			var $cnt	= $el.closest('.winContent');
			var $pad	= parseInt( $cnt.css('padding-top') );
			
			// Checking parent on closest winContent and it's direct parent
			// Applied only if parent content is first of it's own parent
			if ( !$pad && $cnt.parent().is('.winContent') && $cnt.is(':first-child') )
				$pad		= parseInt( $cnt.parent().css('padding-top') );
			
			if ( $pad )
				$el.addClass('shiftUp');
				
		}); //for each dialog
		
		// Defining common containers for fast search
		var $containers	= '.winRow, .winContent, .winContainer, form';
		
		// Full Height containers are automatically flex
		$context.find($containers).filter('.full').addClass('flex');
		
		// Flex containers should have flex parents
		// Searching for all flex childs 
		// and making sure their parents have flex too, unless they are part of row
		$context.find($containers).filter('.flex').each( function () {
			
			var $flex	= jQuery(this);	
			var $parents	= $flex.parentsUntil(this.Body, $containers);
			
			// Checking each to be not children of row and adding flex class if not
			$parents.each( function () {
				var $p = jQuery(this);
				if ( !$p.parent().is('.winRow') )
					$p.addClass('flex');				
			}); //FOR each parent
			
		}); //FOR each flex

		// Cleaning flex/full markers from columns (winRow children)
		$context.find('.winRow>.flex, .winRow>.full').each( function () {
			
			var $flex	= jQuery(this);	
			
			// Transferring classes
			if ( $flex.hasClass('flex') )
				$flex.parent().addClass('flex'); 

			if ( $flex.hasClass('full') )
				$flex.parent().addClass('full'); 
			
			// Removing both from self
			$flex.removeClass('flex full');
			
		}); //FOR each flex column

		// AutoScroll containers apply autoscroll to parents
		$context.find('.autoScroll').each( function () {
			
			var $flex	= jQuery(this);	
			var $parents	= $flex.parentsUntil(this.Body, '.winContent, .winContainer');
			
			// Checking each to be not children of row and adding flex class if not
			$parents.each( function () {
				var $p = jQuery(this);
				$p.addClass('autoScroll');				
			}); //FOR each parent
			
		}); //FOR each flex

		// 100% inputs don't allows scroll fix (scroll is not applied with these anyway)
		// Looking for these and adding marker to their parent winContent
	 	$context.find('.mwInput.fullHeight').each( function () {
	 		
	 		var $el = jQuery(this);
	 		if ( $el.parent().is('.winContent') )
	 			$el.parent().addClass('noScrollFix');
	 		
	 	}); //each 100% inputs
		
		return this;
		
	}, //FUNC initGeometry	

// ==== MANIPULATION FUNCITONS ====
	
	/** //** ----= adjustFlexChilds	 =----------------------------------------------\**//** \
	*
	* 	Adjusts given row flexible childs heights.
	*
	*	@param	jQuery	row	- Content row to adjust
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	adjustFlexChilds	: function ($row) {

		var $this = this;

		// Limiting flex rows heights
		$row.find('.winRow.flex, .winContent.flex, .winContainer.flex, form.flex').each( function () {
			
			var $flex	= jQuery(this);
			var $full	= $flex.hasClass('full');

			// Calculating heights of neighbouring elements
			// ToDo: do smth with other flexes on same level (which is not recommended though)
			var $sibs	= $flex.siblings('HR, .winHDivider, .winContent, .winRow, .winContainer, .winTabs, form').not('.flex').filter(':visible');
			
			var $sHeight	= 0;
			$sibs.each( function () {
				$sHeight += jQuery(this).outerHeight(true);
			}); //jQuery each sibling
			
			// Getting max height: assuming parent conent, otherwise - getting from body.
			var $parent	= $flex.parent().closest('.winContent, .winContainer, form, .winBody');

			// Trying both max height and regular height, whichever present
			var $max	= parseInt( $parent.css('max-height') ) || parseInt( $parent.css('height') ); 
			
			// Calculating parent pads, to be added to total height
			var $pPads	= parseInt( $parent.css('padding-top') ) + parseInt( $parent.css('padding-bottom') );
			
			// Calculating final height
			var $height	= $max - $sHeight - $pPads;

			var adjustScrollHeight	= function ($height, $el) {

				// Checking if height is widthing allowed minimum
				if ( $height < $this.minFlexHeight )
					return '';

				// Testing content size
				if ( $height > $el.outerHeight(true) ) {
				
					// Allowing overflow for small contents	
					if ( $el.hasClass('autoScroll') )
						$el.addClass('visible');
						
				} //IF small content
				else {
					
					// Forscing scroll 
					if ( $el.hasClass('autoScroll') )
						$el.removeClass('visible');

					// Forcing autoheight for noscroll elements				
					if ( $el.hasClass('noScroll') )
						$height = '';
						
				} //IF scroll needed

				return $height;
				
			}; //FUNC adjustScrollHeight

			// Special case for row: it limits height to childrent instead of self
			if ( $flex.hasClass('winRow') ) {

				// Applying it children contents if row or self is content
				$flex.children('.winContent, .winContainer').each( function () {
					
					var $el		= jQuery(this);

					// Adjusting height depending on scroll settings
					$height = adjustScrollHeight($height, $el);
					
					if ( $full )
						$el.height( $height );

					$el.css('max-height', $height);

				}); //jQuery each child

			} else { //IF row

				// Adjusting height depending on scroll settings
				$height = adjustScrollHeight($height, $flex);

				// Correcting height for full height areas, those will always have full possible height
				// Setting height instead of min-height cuz of chrome 
				// Correction is for chrome: it does not handles max-height over height for childs with 100% height
				// Also making sure parent flex does not uses scrollFix
				if ( $full ) {
					
					$flex.height( $height );
					$parent.addClass('noScrollFix');
					
				} //IF full height

				// Limiting height of flex container
				$flex.css('max-height', $height);
						
			} //IF content

		}); //FUNC jQuery each flex row

		return this;
		
	}, //FUNC adjustFlexChilds
	
	/** //** ----= adjustColumns	 =----------------------------------------------\**//** \
	*
	* 	Adjusts floating columns to have same widths, for proper scrolling.
	*
	*	@param	jQuery	row	- Content row to adjust
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	adjustColumns	: function (row) {
	}, //FUNC adjustColumns
	
	/** //** ----= adjustHeights	 =----------------------------------------------\**//** \
	*
	* 	Adjusts window content heights based on window settings.
	*
	*	@param	jQuery	context	- Custom conxext to adjust. Allows partial 
	*				  heights adjustments.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	adjustHeights		: function (context) {

		var $this = this;
		
		context = context || this.Body; 

		// Aliases for callbacks
		var Body	= this.Body; 
		var Window	= this.Window;

	// ---- Scroll Tops ----
	
		// Quickly building list of scrolled elements
		// It could be contents or containers, and additionally - .scrollable
		// Checking which where scrolled, and storing those
		var $scrolls = [];
		context.find('.winContent, .winContainer, .scrollable').each( function () {
			
			var $el		= jQuery(this);
			
			var $top	= $el.scrollTop();
			
			// Skipping if not scrolled
			if ( !$top )
				return;
			
			$scrolls.push({
				el	: $el,
				top	: $top
			}); //push
			
		}); //FUNC each container
	
	// ---- Body ----

		// Generally limiting body height
		var screen	= screenSize();
		
		// Checking window margins and pads
		var mrg		= parseInt( Window.css('margin-top') ); 
		var pad		= parseInt( Window.css('padding-top') );
		
		// Calculating window position from offset and scroll
		var $offs	= Window.offset();
		var $scrl	= {
			top		: jQuery(window).scrollTop(),
			left		: jQuery(window).scrollLeft(),
		}; // $scrl

		var $top	= $offs.top - $scrl.top - mrg; 
		
		var wheight	= screen.height - $top - mrg*2 - pad*2 - this.winHeader.outerHeight() - this.winFooter.outerHeight();
		
		if ( this.limitHeight && this.limitHeight < wheight )
			wheight = this.limitHeight;
		
		Body.css('max-height', wheight);

	// ---- Clear ----
		
		// Before calculating dimensions have to remove all old values
		context.find('.winRow, .winContent, .winVDivider, .winContainer, form, .noScroll>.mwDialog, .noScroll>.mwDialog>dd').each( function () {
		
			var el	= jQuery(this);

			el.css('max-height', '');
			el.css('min-height', '');
			
			if ( el.is('.winRow') )
				el.css('min-width', '');

			el.css('height', '');
			
		}); //FUNC each container


	// ---- Flex ----
	
		this.adjustFlexChilds(context);
	
	// ---- Full Height dialogs ----
		
		// Supporting 100% sizes for inputs inside forms
		// Such form will get 100% min-height, input row will take 100% - siblings min-height
		// Very similar logic to fullHeight contents, 
		// but applied to forms and relies on parent containers defined height
		// Searching inputs inside modern forms. 
		// - Standalone inputs just have 100% height
		// - Classic forms do not support this behavior
		// Applying only to visible inputs
		context.find('dl.mwDialog .mwInput.fullHeight:visible').each( function () {
			
			// Defining elements
			var $input	= jQuery(this);
			var $row	= $input.parent();

			// Skipping if row already been calculated
			if ( $row.get(0).style.height )
				return;

			var $form	= $input.closest('.mwDialog');
			
			// Calculating siblings heights
			var $sHeight	= 0;
			var $siblings	= $row.siblings();
			
			$siblings.each( function () {
				$sHeight += jQuery(this).outerHeight(true);
			}); //FOR each sibling

			// Form can have top/bottom margins. Taking those into account.
			var $fMargin	= parseInt( $form.css('margin-top') );

			// Setting heights
			// Row and form attempts to take full space, but not less than current (default)
			$form.css('min-height', $form.height() );
			$form.css('height', 'calc(100% - ('+$fMargin+'px))');
			
			$row.css('min-height', $row.height() );
			$row.css('height', 'calc(100% - '+$sHeight+'px)');
			
			// Parent container should not have scrollFix
			$form.parent().addClass('noScrollFix');
			
		}); //each fullHeight input 
		
	// ---- Rows ----	
		
		context.find('.winRow').each( function () {
			
			var row = jQuery(this);
			
			// Forcing normal tabs on all sibling contents
			row.siblings('.winContent').addClass('normalpads');
			
			// Will collect widths necessary for columns
			var w = 0;
			
			// Now row have height and we can adjust child columns
			row.children('.winContent, .winVDivider, .winContainer, form').each( function () {
				
				var col		= jQuery(this);

				// Not counting if element is not visible
				if ( !col.is(':visible') )
					return;
				
				// Using border-box, so no need to count pads/borders, only margin
				var pads	= col.outerHeight(true) - col.outerHeight();
				
				var hgt		= row.height() - pads;
				var mhgt	= parseInt( col.css('max-height') );
				
				if ( mhgt && hgt > mhgt )
					hgt = mhgt;
				
				col.css('min-height', hgt);	
				
				w += col.outerWidth(true);
			}); //FUNC jQuery each child row
		
			// Fixing row width, to prevent collapsing if less space available
			// Not when row width is set to auto (in full size windows)
			if ( row.get(0).style['width'] !== 'auto' )
				row.css('min-width', w);
			
		}); //jQuery each row
	
	// ---- Scroll Tops ----

		// Returning scrolls back
		for ( var $i in $scrolls )
			$scrolls[$i].el.scrollTop( $scrolls[$i].top );
	
	// ---- Scrolls ----
	
		// Updating scroll with slight delay in case forms/heights are not updated just yet
		setTimeout( function () {
			mwUpdateScrolls();
		}, 1);
	
	}, //FUNC adjustHeights
	
	/** //** ----= align		 =----------------------------------------------\**//** \
	*
	* 	Positions window on screen according to properties set.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	align		: function () {

		var $this	= this;

		// No need adjust invisible window
		if ( !this.Visible ) return;

		if ( !this.Body || !this.Window ) return;

		// Adjusting heights in widnow
		// Checking if window needs to be maximized
		if ( this.maximized )
			this.Window.addClass('maximized');
		else
			this.Window.removeClass('maximized');

		// Using timer to avoid multiple sequent calls
		if ( this.updateTimer )
			clearTimeout(this.updateTimer);
		
	//	this.updateTimer = setTimeout( function () {
			
			$this.adjustHeights();

			if ( !$this.maximized && $this.AlignAt )
				$this.Window.align($this.AlignAt);
	
	//	}, 1);

		return this;
	}, //FUNC align
		
	/** //** ----= show		 =----------------------------------------------\**//** \
	*
	* 	Shows window.
	*
	*	@param	function	[callback]	- Callback to call on finish.	
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	show		: function (callback) {

		// No need to show twice
		if ( this.Visible ) return;

		if ( !this.Body || !this.Window ) return;

		var $this	= this;

		// Aliases for callbacks
		var Body	= this.Body; 
		var Window	= this.Window; 
		
		// Hiding help if it was open
		// Reinitiating dialog forms, to ensure new elements are styled
		// Safe and fast to call - styles elements will be skipped
		styleDialog(Body.find('.mwDialog'));

	// ---- Updating states and displaying ----

		this.Visible = true;

		// Adding self to visible layers
		mwWinManager.addLayer(this);
		
		// Updating layers
		mwWinManager.updateLayers();

		// Modals affect overlay
		if ( this.Modal ) {
			mwWinManager.updateOverlay();
		} //IF modal window
		
		// Resetting state
		this.State('');

	// ---- Displaying ----
	
		// Starting show before positioning to have all sizes calculatable	
		mwShow(Window);

	// ---- Positioning and adjusting ---

		setTimeout( function () {
			$this.align();	
		}, 1);

	// ---- Dialogs and forms ----
	
		// Adding autosubmit to forms in window	
		setFormsSubmit(Window);

		// Resetting validations
		setValidations(Body, {});		

	// ---- Correcting focus ---- 

		// Moving focus to marked input or to first input on form
		var def = Body.find('.defaultInput').find('INPUT, TEXTAREA, SELECT');
		if ( def.length )
			def.first().focus();
		else
			Body.find('INPUT, TEXTAREA, SELECT').not('[type=hidden]').first().focus();

	// ---- Issuing callback ----	
		
		// Giving small delay to allow browser to update all dimensions
		setTimeout( function () {
			
			// Checking if there is help page avaialble to show
		//	mwHelp.check($this.ID);
			
			if ( callback )	
				callback();
				
		}, 30);

	// ---- mwHelp ----
		
		if ( typeof(mwHelp) != 'undefined' ) {

			// Desiding what to do with help
			// ToDo: This should be implemented as help tools
			// No autoactions in tour
			if ( mwHelp.activeType != 'tour' ) {
			
				// Checking if inline is active and window book is available
				// If is - showing inline help, if not - hiding it finally
				if ( mwHelp.activeType == 'inline' && mwHelp.isBook('inline', this.ID) )
					mwHelp.inline();
				else
					mwHelp.hide();
					
			} //If not tour actions
			
		} //If help avaialbe
		
		return this;
	}, //FUNC show

	/** //** ----= hide		 =----------------------------------------------\**//** \
	*
	* 	Hides window
	*
	*	@param	function	[callback]	- Callback to call on finish.	
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	hide		: function (callback) {

		// No need to hide twice
		if ( !this.Visible ) return;

	// ---- Updating states ----

		this.Visible = false;

		// Adding self to visible layers
		mwWinManager.removeLayer(this);
		
		// Updating layers
		mwWinManager.updateLayers();

		// Modals affect overlay
		if ( this.Modal ) {
			mwWinManager.updateOverlay();
		} //IF modal window

		mwHide(this.Window, callback);

		// Making sure help closes too, if not in tour
		if ( typeof(mwHelp) != 'undefined' && mwHelp.activeType != 'tour' )
			mwHelp.hide();

		return this;
	}, //FUNC hide
	
// ==== MODIFICATION FUNCTIONS ====	
	
	/** //** ----= Class		 =----------------------------------------------\**//** \
	*
	* 	Applies given class to window.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	Class	: function (c) {

		if ( this.Window ) {

			var el = this.Window.get(0);
			if ( el ) {
				this.Window.addClass(c);
				this.winClass = el.className;
			} //IF element set

		} else { //IF initiated

			this.winClass += ' ' + c;

		} //IF not initiated yet
		
		return this;
	}, //FUNC Class
	
	/** //** ----= Title		 =----------------------------------------------\**//** \
	*
	* 	Applies new title to window.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	Title		: function (t) {

		this.winTitle = t;

		if ( this.Window )
			this.Window.find('.winHeader').html(t);

		return this;
	}, //FUNC Title

// ==== STATUS FUNCTIONS ====	

	/** //** ----= State		 =----------------------------------------------\**//** \
	*
	* 	Sets operation state using dialog status/loader elements.
	*
	*	@param	MIXED	state
	*		bool		- TRUE for loading indication, FALSE - idle.
	*		string		- Status message for idle state (usually operation result)
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	State		: function (s) {

		if ( !this.Window )
			return this;

		var footer	= this.Window.find('.winFooter'); 
		var loader	= footer.find('.winLoader');
		var status	= footer.find('.winStatus');

		if ( s === true ) {
			
		// ---- Displaying loader ----

			mwShow(loader);
			
			// Cleaning last state
			status.html('');
			
		} else { //IF loading
		
		// ---- Hiding loader ----
	
			mwHide(loader);

			// If s contains html it will be added to status
			status.html(s);

		/*/			
			// If there was textual status, we need to update heights to match.
			if ( s ) {
				// ToDo: make this more integrated and less tricky

				// First unfixing heights
				this.Body.css('margin-bottom', '');
				status.css('height', '');

				// Updating window footer placement to match multiline text (if any).
				this.Body.css('margin-bottom', footer.outerHeight());
				
				// Fixing footer height
				status.css('height', footer.height());
			} //IF text
		/**/		
						
		} //IF idle

		return this;
	} //FUNC State

} //CLASS mwWindowObject

/** //** ----= mwWizard		 =----------------------------------------------\**//** \
*
* 	Returns wizard object. If wizard does not eixists, creates new one.
*
*	@param	string	id	- Wizard ID to return.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
var mwWizards	= {
};

function mwWizard (id) {

	if ( !mwWizards[id] )
		mwWizards[id] = mwWizardObject(id);
	
	return mwWizards[id];
} //FUNC mwWizard

/** //** ----= OBJECT mwWizardObject	 =--------------------------------------\**//** \
*
* 	Object for wizard creation and handling.
*
*	@param	string	id	- Wizard system ID.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwWizardObject (_id) {

	// Creating basic object with events assigned
	return vEventObject(['onFinish'], {
	
		ID		: _id,				// Wizard id. Will be used to name internal resources.
		
		Steps		: {},				// Will store all information about steps.
		StepsIndex	: [],				// Steps index as array of ids.

		DefaultStep	: '',				// Step to show on load. 
		CurrentStep	: '',				// Current step pointer in Steps array. 
		  
		StepCaption	: false,			// jQuery pointer to current step title element.
		StepsControls	: false,			// jQuery pointer to steps control bar.

		Window		: false,			// Stores window used.

		/** //** ----= init	 =------------------------------------------------------\**//** \
		*
		* 	Initiates wizard.
		*	
		*	@param	object	options	- Object containg wizard steps parameters.
		*
		*	@return SELF  
		*
		\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
		init	: function (options) {
			
			this.Window		= mwWindow(this.ID);

			// Some aliases
			var self	= this;
			var body	= this.Window.Body;

			self.Steps	= {};
			self.StepsIndex	= [];

			// Looking for steps
			body.find('.wizardStep').each( function () {
				
				// Not named steps are not used
				var id = this.id;
				if ( !id ) return;
				
				var title	= this.title || '';
				this.title	= '';
				
				// Saving found
				self.Steps[id] = {
					'el'	: jQuery(this),
					'title' : title
				};
				
			}); //jQuery each step

			// Adding options
			jQuery.extend(true, self.Steps, options);

			// Adding head controls
			var head		= body.find('.winHeader');
			
			var cap 		= head.html();
			head.html('<div id="wizTitle" style="display: inline-block;">' + cap + '</div> ');
			
			self.StepCaption	= jQuery('<span class="wizCaption"></span>').appendTo(head);
			self.StepsControls	= jQuery('<div class="wizStepsControls"></div>').appendTo(head);
			
			// Adding step switch buttons and indexing steps
			for ( var i in self.Steps ) {
	
				// Indexing found steps for prev, next operations
				self.StepsIndex.push(i);
				
				// Creaating buttons
				var bttn = jQuery('<a class="wizStep" hint="' + self.Steps[i].title + '" rel="' + i + '" onclick="mwWizard(\'' + self.ID + '\').step(\'' + i + '\')"></a>');
				bttn.appendTo(self.StepsControls);
				
			} //FOR each step

			// Setting up footer controls
			body.find('.wizardNext').click( function () { self.next(); } );
			body.find('.wizardBack').click( function () { self.prev(); } );

			return self;
		}, //FUNC init

		/** //** ----= title	 =------------------------------------------------------\**//** \
		*
		* 	Sets new wizard title
		*	
		*	@param	string	t	- New title.
		*
		*	@return	SELF  
		*
		\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
		Title	: function (t) {
			
			this.Window.Body.find('#wizTitle').html(t);
			
			return this;
		}, //FUNC Title
		
		/** //** ----= show	 =------------------------------------------------------\**//** \
		*
		* 	Displays wizard dialog. Resetting it to first step.
		*	
		\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
		show	: function () {
			
			// Disabling animaitons while showing
			// ToDo: add animation options to system
			
			var anim = getCookie('G_Animate', 1);
			setCookie('G_Animate', 0);
			
			this.step( this.DefaultStep || this.StepsIndex[0] );
			
			setCookie('G_Animate', anim);
			
			this.Window.show();
			
		}, //FUNC show

		/** //** ----= step	 =------------------------------------------------------\**//** \
		*
		* 	Switches to step specified.
		*	
		*	@param	string	step	- Step ID to switch to.  
		*
		\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
		step	: function (step) {
			
			var self	= this;
			var body	= this.Window.Body;
			var doleave	= true;
			
			if ( !self.Steps[step] ) return;
			if ( self.CurrentStep == step ) return;
			
			if ( !self.CurrentStep ) {
			
				self.CurrentStep = this.DefaultStep || this.StepsIndex[0];
				
				doleave = false;		
			
			} //IF first enter

			// Calling beforeLeave, breaking if false returned
			if ( doleave && typeof(self.Steps[self.CurrentStep].beforeLeave) == 'function' 
				&& self.Steps[self.CurrentStep].beforeLeave() === false) 
					return false; 

			
			mwHide( body.find('.wizCaption') );
			mwHide( self.Steps[self.CurrentStep].el, function () {

			// ---- Callbacks ----

				// ToDo: less copy-paste on callbacks

				// Calling onLeave, breaking if false returned
				if ( doleave &&  typeof(self.Steps[self.CurrentStep].onLeave) == 'function' 
					&& self.Steps[self.CurrentStep].onLeave() === false) {
						
						// If false we shold show hidden elements back
						
						mwShow( body.find('.wizCaption') );
						mwShow( self.Steps[self.CurrentStep].el );
						
						return false;
					} //IF false returned

				// Calling beforeEnter, breaking if false returned
				if ( typeof(self.Steps[step].beforeEnter) == 'function' 
					&& self.Steps[step].beforeEnter() === false) {
						
						// If false we shold show hidden elements back
						
						mwShow( body.find('.wizCaption') );
						mwShow( self.Steps[self.CurrentStep].el );

						return false;
					} //IF false returned

			// ---- Checking final button ----

				istep = self.StepsIndex.indexOf(step);
				if ( istep == self.StepsIndex.length - 1 ) {
					
					body.find('.wizardNext').hide();
					body.find('.wizardFinish').show();
					
				} else { //IF last step
				
					body.find('.wizardNext').show();
					body.find('.wizardFinish').hide();
				
				} //IF not last
			
			// ---- Marking selected control ----
				
				self.StepsControls.find('.Selected').removeClass('Selected');
				self.StepsControls.find('[rel='+step+']').addClass('Selected');

			// ---- Setting caption ----	
				
				body.find('.wizCaption').html(self.Steps[step].title);
				mwShow( body.find('.wizCaption') );
				
			// ---- Showing step ----
				
				mwShow( self.Steps[step].el );

			// ---- Adjusting contents ----
				
				self.Window.adjustHeights();
				
			/**/ // ToDo: Werid behavior. Envistigate more and redo.	
			// ---- Realign step ----
			
				// Not all aligment was possible while step was hidden
				// Small timeout to allow animation start
				setTimeout( function () {
					
				// ---- Centering step contents ----
					
					var el	= self.Steps[step].el;
					
					if ( el.hasClass('valign') ) {

						// Cleaning old anyway
						el.css('padding-top', null);
						el.css('padding-bottom', null);
						
						var hgt		= el.height();
						var phgt	= el.parent().height();
	
						if ( phgt > hgt ) {
						
							var pad = Math.ceil( (phgt - hgt) / 2 );
							
							el.css('padding-top', pad - 1);
							el.css('padding-bottom', pad);
								
						} //IF height is less than parent 
							
					} //IF el should align childs	
					
					// Calling onEnter to allow post setup
					if ( typeof(self.Steps[step].onEnter) == 'function' ) 
						self.Steps[step].onEnter(); 

					self.CurrentStep = step;
				}, 1);	

			}); //FUNC mwHide.callback		

			return false;
		}, //FUNC step

		/** //** ----= next	 =------------------------------------------------------\**//** \
		*
		* 	Switches to next step.
		*	
		*	@param	jQuery	el	- Step button element.  
		*
		\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
		next	: function () {
			
			var istep = this.StepsIndex.indexOf( this.CurrentStep ) + 1;
			
			if ( istep > this.Steps.length - 1 ) return;
			
			this.step(this.StepsIndex[istep]);
		}, //FUNC step

		/** //** ----= next	 =------------------------------------------------------\**//** \
		*
		* 	Switches to next step.
		*	
		*	@param	jQuery	el	- Step button element.  
		*
		\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
		prev	: function () {
			
			var istep = this.StepsIndex.indexOf( this.CurrentStep ) - 1;
			
			if ( istep < 0 ) return;
			
			this.step(this.StepsIndex[istep]);
		} //FUNC step

	}); //OBJECT mwWizardObject

} //CONSTRUCTOR mwWizardObject

function mwInitTabs ($el) {
	
	// Searching winTabs, adding click events on them and initiating selected
	var $tabs = $el.find('.winTabs');
	
	// Proceeding each tabs group individually, to init defaults
	$tabs.each( function () {
		
		// Looking for children elements with rel attribute
		var $tab	= jQuery(this);
		
		var $sub	= $tab.find('[rel]')
			.on('click', function () {
				mwSwitchTab(this, false);
			}); 

		// Clicking on selected tabs
		var $sel = $sub.filter('.selected');
		
		$sel.trigger('click');

		// or clicking on first
		if ( !$sel.length )
			$sub.first().trigger('click');
					
	}); //each $tabs
	
} //FUNC mwInitTabs

function mwSwitchTab ($el, $align, $animate) {
	
	// Defaulting to use animations
	$animate		= isUndefined($animate) ? true : $animate;
	
	var $el			= _jq($el);
	var $context		= false;

	// Searching if in window
	var $body		= $el.closest('.winBody');
	if ( $body.length ) {

		var $wId		= $body.attr('id');
		var $win		= mwWindow($wId);  
		var $winEl		= $win.Window;

		// Defining window body as context
		$context		= $body;
		
	} //IF in window
	
// ---- Sellecting tab ----

	var $tabs		= $el.closest('.mwWinTabs, .winTabs');

	// Adding both classes for compatability
	$tabs.find('.Selected, .selected').removeClass('Selected selected');	
	$el.addClass('Selected selected');

// ---- Switching tab ----
	
	var $rel		= $el.attr('rel') || $el.attr('data-rel');
	
	// If no relate - just quit
	if ( !$rel )
		return false;
	
	// Looking for related content, using context if available to speedup search
	var $content		= jQuery('#' + $rel, $context);
	
	// If not found - nothing else to do
	if ( !$content.length )
		return false;

	// Defining container, to use for animations
	var $container		= $content.parent();

	// If container is winContent - it can't use scrollFix
	if ( $container.is('.winContent') )
		$container.addClass('noScrollFix');
	
	// Adding transition to container
	// Going to play with sticky heights for animations
	if ( $animate ) 
		$container.addClass('transition');
	
	// Also - making sure parents don't attempt to play scroll during animation, and untill window aligns
	if ( $win && $animate )
		$winEl.addClass('noScrollTmp');
	
	// Fixing parent content height, untill next tab starts showing
	var $oHeight		= $container.outerHeight();
	var $hPads		= $oHeight - $container.height();
	
	$container.css('height', $oHeight );
	
	// Preparing cleaning function. 
	// It will clear animations changes and update window geometry
	
	var $clear	= function () {

		// Clearing transitions and heights from container
		$container.removeClass('transition').css('height', '');
		
		if ( !$win )
			return;

		// Clearing transition on window, and reinitiating geometry 
		// Adding small tiemout to allow browser realise final dimensions
		$winEl.removeClass('transition');

		setTimeout( function () {

			if ( $align )
				$win.align();
			else
				$win.initGeometry().adjustHeights();

			// Clearing overflow fix on parents
			$winEl.removeClass('noScrollTmp');

		}, 1); // FUNC setTimeout.listener

	} //FUNC $clear
	
	// Hiding content siblings 
	// Also usefull for initiating tabs
	mwHide( $content.siblings(), function () {

		// After hided showing selected
		mwShow($content, function () {
			
			if ( $animate )
				$clear();

		}); //mwShow.callback 

		// If no need to animate - can cleanup now
		// Otherwise doing animation stuff
		if ( !$animate ) {
			
			$clear();
			
			return $content;
			
		} //IF no animation

		// Updating container height to match displaying content
		// Correcting cotent height to include negative margin of first child
		var $nHeight	= $content.outerHeight();
		var $mrg	= parseInt( $content.children(':first').css('margin-top') );
		
		if ( $mrg < 0 )
			$nHeight += $mrg; 

		$container.css('height', $nHeight + $hPads );
/*/
		// Currently unused, as windows are just top aligned
		// If inside window - need to update window positions to match changed heights
		if ( !$win )
			return;

		// Adding transition to window element
		$winEl.addClass('transition');

		// Calculating resulting difference in heights
		// And applying it to top of window
		var $delta	= Math.round( ($oHeight - $nHeight - $hPads) / 2 );
		var $top	= parseInt($winEl.css('top')); 
		
		if ( isNaN($top) || $delta == 0 )
			return;
		
		$winEl.css('top', $top + $delta);
/**/		
	}); //FUNC mwHide.callback

	return $content;
	
} //FUNC mwSwitchTab

function mwNotification ($html, $options) {
	
	var $window	= jQuery('#mwNotification');
	var $body	= $window.children('.body');
	
	// Defining animation duration
	// ToDo: read from skin instead
	var $delay	= 2000;
	
	// Setting up incoming html
	$body.html($html);

	// Displaying for period, and then hiding
	mwFadeIn($window, function () {
		
		setTimeout( function () {
			
			mwFadeOut($window);
			
		}, $delay);
		
	}); //mwFadeIn
	
} //FUNC mwNotification

function mwFadeIn ( $el, $callback ) {

	// Defining animation duration
	// ToDo: read from skin instead
	var $duration	= 250;
	
	$el.removeClass('hidden');

	setTimeout( function () {
		$el.addClass('visible');
	}, 1);

	if ( !isFunction($callback) )
		return;	

	setTimeout( function () {
		$callback();
	}, $duration);
	
} //FUNC mwFadeIn

function mwFadeOut ( $el, $callback ) {

	// Defining animation duration
	// ToDo: read from skin instead
	var $duration	= 250;
	
	$el.removeClass('visible');

	setTimeout( function () {
		$el.addClass('hidden');

		if ( !isFunction($callback) )
			return;	
	
		$callback();

	}, $duration + 1);

} //FUNC mwFadeOut
