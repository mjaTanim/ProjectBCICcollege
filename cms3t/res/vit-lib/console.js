/** ************************************************************************************************************************ **\
* 
*	Set of classes and functions that will help create debugging consoles.
* 
* 	@package	VIT-Lib
* 	@subpackage	Debug
*
* 	@license	MIT License
*			Permission  is  hereby  granted,  free  of  charge, to any person obtaining a copy of this software and
*			associated documentation files (the "Software"), to deal in the Software without restriction, including
*			without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*			copies  of  the  Software, and to permit persons to whom the Software is furnished to do so, subject to
*			the following conditions:
*			
*			The  above  copyright  notice and this permission notice shall be included in all copies or substantial
*			portions of the Software.
*			
*			THE  SOFTWARE  IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
*			LIMITED  TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
*			NO  EVENT  SHALL  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
*			WHETHER  IN  AN  ACTION  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
*			SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*	@author		Victor Denisenkov aka Mr.V!T
*	@copyright	Copyright (c) 2008+ Victor Denisenkov aka Mr.V!T
*	@version	1.0
* 
\** ************************************************************************************************************************ **/

/** //** ----= OBJECT vConsole	=--------------------------------------------------------------------------------------\**//** \
*
* 	Debug console.
*
* 	@package	VIT-Lib
* 	@subpackage	Debug
* 	@category	Helper
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function vConsole ($options) {

var $class = {

	enabled			: true,		// Working state. If disabled - doing nothing, untill it's manually enabled.

	width			: 600,		// Default widndow width
	zIndex			: 6000,		// zIndex to use for window

	panels			: {},		// Custom panels list and their properties/elements
	
	dom			: {		// Set of valuable elements as jQuery shortcuts and dom elements
		window			: false,	// Main window object
		panels			: false,	// Panels container (dumps watches)
		console			: false,	// Common console (manual dumps)
	}, //dom	

	autoupdate		: false,	// Set TRUE to enable watch timer. It will cause updates of watched elements in specified inteval.
	updateInterval		: 70,		// Autoupdate interval. Lower value - more lag, but more accurate readings.
	updateDelay		: 1,		// Delay in ms between nearest updates. Increase if updates cause lags.
						// Having even 1ms, causes another thread exec, and multiupdates filetering.

	interval		: false,	// Autoupdate interval object
	timer			: false,	// Update delay timer object
	
	dumper			: false,	// Variable dumper used to style debug

// ==== SET/GET ================================================================================================================

	/** //** ----= set	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Initiates self parameters from given options array.
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	set		: function ($name, $value) {
		
		// ToDo: .set() in basic class
		// ToDo: proper events extension support

		var $o = {};

		// Extending from object, so if pair given - forming object from there
		// Otherwise name is needed object
		if ( isStr($name) )
			$o[$name] = $value;
		else 		
			$o = $name;
			
		jQuery.extend(this, $o);
		
		// init/deinit
		if ( this.enabled )
			this.init();
		else
			this.deinit();
		
		return this;
	}, //FUNC set	

	/** //** ----= get	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Returns property.
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	get		: function ($name) {
		// ToDo: .get() in basic class with getters support
		// ToDo: proper events extension support
		return this[$name];
	}, //FUNC get	

	/** //** ----= toggle	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Toggles console.
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	toggle		: function ($state) {

		if ( isUndefined($state) )
			$state = !this.enabled;

		return this.set('enabled', $state);
	}, //FUNC toggle	

	/** //** ----= show	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Shows console.
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	show		: function () {
		return this.toggle(true);
	}, //FUNC show	

	/** //** ----= hide	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Hides console.
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	hide		: function () {
		return this.toggle(false);
	}, //FUNC hide	

// ==== INIT ===================================================================================================================

	/** //** ----= init	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Initiates console, creates panels and prepares for output.
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	init		: function () {
		
		// Setting up dumper
		if ( isEmpty(this.dumper) )
			this.dumper = vDump({
				'useHtml'	: true, 
				'dumpFunctions'	: false
			}); //vDump
			
		// Initiating elements
		this.initWindow();
		this.initPanels();

		// Initial update, which will also console with info
		this.update();

		// Triggering autoupdate if necessary
		this.setAutoupdate(this.autoupdate);
	}, //FUNC init	

	/** //** ----= deinit	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Deinitiates console, removes dom and stops timers.
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	deinit		: function () {

		// Removing dumper
		this.dumper = false;
		
		// Removing elements
		this.deinitPanels();
		this.deinitWindow();

		// Updating autoupdate :)
		this.setAutoupdate(this.autoupdate);
	}, //FUNC deinit

// ==== DOM ====================================================================================================================

	/** //** ----= initWindow	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates main window and common panel.
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	initWindow	: function () {
		
	 	// Checking if draggable available
	 	var $isDraggable = isFunction(jQuery().draggable);
		
		// Compiling window css (it is updated anyway)
		var $css = {
			'position'	: 'fixed',

			'left'		: 0,
			'top'		: 0,
			'width'		: this.width,

			'z-index'	: 6000,
			'cursor'	: $isDraggable ? 'move' : 'default',
		}; // $css

		// Creating window, or updating if created
		if ( this.dom.window ) {

			this.dom.window.css($css);

		} else {
	
			this.dom.window = jQuery('<div class="debug"></div>').css($css);
		
			// Creating common console wrapper
			this.dom.console = jQuery('<div></div>')
			//	.css({'overflow' : 'scroll'}) //css
				.appendTo(this.dom.window)
			; //jQuery.debug
			
			// Making window draggable if possible
			if ( $isDraggable )
				this.dom.window	
					.draggable('destroy')
					.draggable({});	
	
			this.dom.window.appendTo('body');
		} //IF new window
		
	}, //FUNC initWindow

	/** //** ----= deinitWindow	=------------------------------------------------------------------------------\**//** \
	*
	*	Deinitiates main window.
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	deinitWindow	: function () {

		// Nothing to do if removed already
		if ( !this.dom.window )
			return;

		// Destroying draggable
		if ( this.dom.window.is('.ui-draggable') )
			this.dom.window.draggable('destroy');
		
		// Removing window element
		this.dom.window.remove();
		
		// Cleaning self
		this.dom.window = false;

	}, //FUNC deinitWindow 

// ---- PANELS -----------------------------------------------------------------------------------------------------------------

	/** //** ----= initPanels	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates panels.
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	initPanels	: function () {
		
		// Creating panels wrapper
		if ( !this.dom.panels )
			this.dom.panels = jQuery('<div></div>')
			//	.css({}) //css
				.prependTo(this.dom.window)
			; //jQuery.debug
	
	 	// Adding/updating custom panels, converting ones which given as arrays
		for ( var $i in this.panels )
			if ( isArray(this.panels[$i]) )
				this.setPanel($i);
			else
				this.initPanel(this.panels[$i]);
		
	}, //FUNC initPanels

	/** //** ----= deinitPanels	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates panels.
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	deinitPanels	: function () {
	
		// Nothing to do if no panels already
		if ( !this.dom.panels )
			return;

		// Clearing panels
		for ( var $i in this.panels )
			this.deinitPanel(this.panels[$i]);
		
		// Removing element
		this.dom.panels.remove();
		
		// Cleaning self
		this.dom.panels = false;
		
	}, //FUNC deinitPanels

	/** //** ----= setPanel	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Adds named debug panel.
	*
	*	@param	string	$name		- Panel name to add.
	*	@param	int	[$size]		- Panel relative size (width) percentage.
	*	@param	object	[$watchObject]	- Object to watch in this panel.
	*	@param	array	[$watchProps]	- Watch only this properties from this object.
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	setPanel	: function ($name, $size, $watchObject, $watchProps) {

		// Checking for panel params
		var $panel = this.panels[$name] || {}; 	

		// Converting array
		if ( isArray($panel) ) {
			// Setting params from that array
			$size		= $size || $panel[0];
			$watchObject	= $watchObject || $panel[1];
			$watchProps	= $watchProps || $panel[2];
			
			// Making sure it's object now, and resetting
			$panel		= {};
		} //IF array given

		// Setting up
		$panel.name	= $name;
		$panel.title	= $name.capitalize();
		$panel.size	= $size || 100;
		$panel.watch	= $watchObject || false;
		$panel.props	= $watchProps || false;
		
		// Resaving panel back, in case it's new
		this.panels[$name] = $panel;
		
		// Done if not enabled
		if ( !this.enabled )
			return this;
		
		// Initiating panel
		this.initPanel($panel);
		
		return this;
	}, //FUNC setPanel	

	/** //** ----= removePanel	=------------------------------------------------------------------------------\**//** \
	*
	*	Removes specified panel from console.
	*
	*	@param	string	$panel	- Panel name to remove.
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	removePanel	: function ($panel) {
		
		if ( !this.panels[$panel] )
			return;
	
		// Deinitiating it first
		this.deinitPanel(this.panels[$panel]);
		
		// Removing from list
		delete(this.panels[$panel]);
		
		return this;
	}, //FUNC removePanel
	
	/** //** ----= initPanel	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates given panel dom and events.
	*
	*	@param	object	$panel		- Panel to init. Should be link from internal .panels list.
	*	
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	initPanel	: function ($panel) {

		// Checking if panel should take full size or it's floating
		var $isFull = $panel.size == 100;
		
		// Compiling css
		var $css = {
			'float'		: $isFull ? 'none' : 'left',
			'clear'		: $isFull ? 'both' : 'none',
			'width'		: $isFull ? 'auto' : $panel.size+'%',
			'overflow'	: 'hidden',
			'border-bottom' : '1px solid gray',
		} // $css
		
		// Creating or updating element
		if ( $panel.el ) {

			$panel.el.css($css);

		} else { //IF existing panel

			$panel.el = jQuery('<div></div>')
				.css($css) //css
				.appendTo(this.dom.panels)
			; //jQuery.$panel

		} //IF new panel
		
	}, //FUNC initPanel

	/** //** ----= deinitPanel	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates given panel dom and events.
	*
	*	@param	object	$panel		- Panel to deinit. Should be link from internal .panels list.
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	deinitPanel	: function ($panel) {

		if ( !$panel.el )
			return;

		// Removing panel from dom
		$panel.el.remove();
		
		// Cleaning panel element
		$panel.el = false;
		
	}, //FUNC deinitPanel

// ==== DUMP ===================================================================================================================

	/** //** ----= dumpTo	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Dumps given var into specified console panel (replaces contents). Uses delays to output.
	*	Precise output: no output delay.
	*
	*	@param	string	$panel	- Panel name to input into.
	*	@param	MIXED	$var	- Variable to dump
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dumpTo		: function ($panel, $var) {
		
		// Doing nothing if not enabled
		if ( !this.enabled )
			return this;

		// Panel can be ether string or object directly
		if ( isStr($panel) )
			$panel = this.panels[$panel];
			
		if ( !$panel || !$panel.el )
			return this;
		
		$panel.el.html( this.dumper.dumpCap($panel.title, $var) );
		
		return this;
	}, //FUNC dumpTo

	/** //** ----= dump	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Dumps given var into common console panel (adds at bottom).
	*	Precise output: no output delay.
	*
	*	@param	MIXED	$var	- Variable to dump
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dump		: function ($var) {

		// Doing nothing if not enabled
		if ( !this.enabled )
			return this;
		
		var $con = this.dom.console; 
		$con.html( $con.html() + this.dumper.dump($var) );

		return this;
	}, //FUNC dump

	/** //** ----= clear	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Clears common panel contents.
	*	Precise output: no output delay.
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	clear		: function () {

		// Doing nothing if not enabled
		if ( !this.enabled )
			return this;

		var $con = this.dom.console; 
		$con.html('');
		
		return this;
	}, //FUNC clear

// ---- UPDATES ----------------------------------------------------------------------------------------------------------------

	/** //** ----= updateNow	=------------------------------------------------------------------------------\**//** \
	*
	*	Imideately updates watched objects (no update delay).
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	updateNow	: function () {
		
		// Doing nothing if not enabled
		if ( !this.enabled )
			return this;
		
	 	// Checking panels, which can be updated
		for ( var $i in this.panels ) {
			var $panel = this.panels[$i];

			// Skipping if panel was not created somehow
			if ( !$panel.el )
				continue;
			
			// Skipping if not watchable
			if ( $panel.watch === false )
				continue;
				
			// Dumping whole object if no props specified
			if ( $panel.props === false ) {
				// Just dump into panel
				$panel.el.html( this.dumper.dumpCap($panel.title, $panel.watch) );
			} else { //IF whole object
				
				var $html = '';
				
				// Looping through all vars and compiling dump
				for ( var $j in $panel.props ) {
					
					var $p = $panel.props[$j];
					
					// Skipping functions
					if ( isFunction($p) )
						continue;
					
					$html += this.dumper.dumpCap($p.capitalize(), $panel.watch[$p]);
				} //FOR each $j
			
				$panel.el.html( $html );
			} //IF properties specified
			
		} //FOR each panel
		
		return this;
	}, //FUNC updateNow	

	/** //** ----= update	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Updates watched objects, with small delay (no lag update).
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	update	: function () {

		// Doing nothing if not enabled
		if ( !this.enabled )
			return this;
		
		var $this = this;
		
		// Clearing prev delay, avoiding double updates
		clearTimeout(this.timer);
		
		// Updating after small delay
		this.timer = setTimeout( function () {
			$this.updateNow();
		}, this.updateDelay);
		
		return this;
	}, //FUNC update

	/** //** ----= setAutoupdate	=------------------------------------------------------------------------------\**//** \
	*
	*	Enables or disables autoupdate timer. Always disables if console disabled
	*
	*	@param	bool	$state	- Set TRUE to enable, FALSE otherwise.
	*
	*	@return SELF
	*
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	setAutoupdate	: function ($state) {
		
		$state = !isEmpty($state);
		var $this = this;
		
		this.autoupdate = $state;

		// Clearing interval anyway, to be extra safe
		clearInterval(this.interval);
		
		// Nothing to do if no autoupdate
		if ( !this.enabled || !this.autoupdate )
			return this;
			
		// Making sure update interval is bigget that delay
		var $upd = this.updateInterval > this.updateDelay ? this.updateInterval : this.updateDelay + 5;
		
		// Setting up interval
		this.interval = setInterval( function () {
			$this.update();
		}, $upd);
			
		return this;
	}, //FUNC setAutoupdate

}; //CLASS mwImgEd

	// Applying options
	$class.set($options);
	
	// Adding events
	$class = vEventObject([], $class);

	return $class; 
} //CONSTRUCTOR vConsole
