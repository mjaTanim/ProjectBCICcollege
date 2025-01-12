/** //** ----= CLASS mwImgEd	=--------------------------------------------------------------------------------------\**//** \
*
* 	Morweb express image editor. Used to fast edit images inside <img>.
*
* 	@package	MorwebManager
* 	@subpackage	Core
* 	@category	editor
*
*	@param		jQuery	$img	- Image to edit
*	@param		object	[$o]	- Initial options.
*
*	@todo		Implement disabled moving and/or resizing.		
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwImgEd ($img, $options) {

	if ( !$img )
		throw( 'Image unspecified' );
	
	$img	= _jq($img);
	
	// Checking if editor was cached in element
	// Not using currently to do not bother with unbinds
//	var $class = $img.data('mwImgEd') || {
	var $class = {

// ==== PROPERTIES =============================================================================================================

	url		: '',			// Source image url
	query		: {},			// Stores parsed query of image
	queryStr	: '',			// Stores string version of size query
	view		: '',			// Resized image url, used to do not load full image for editing (slightly bigger than current viewport)
	viewFactor	: 2,			// View image size, comparing to current viewport
	viewLimit	: 1920,			// Mximum size of fiew in result

	aspectRatio	: 0,			// Stores original aspect ratio.
	resizeOn	: 'xy',			// Allowed resize axis 

	angle		: 0,			// Current rotation angle

	zoomMin		: 1,			// Minimal zoom allowed during edit session		
	zoomValue	: 1,			// Current zoom against original image		
	zoomMax		: 4,			// Maximum zoom allowed during edit session		
	zoomStep	: 0.1,			// Zoom size change step
	zoomButtonStep	: 0.05,			// Zoom size change step using buttons

	mouseRepeatTime	: 10,			// Mouse action repeat
	mouseTimer	: false,		// Stores mouseDown timer

	maxWidth	: 0,			// |
	maxHeight	: 0,			// |- Maximum allowed dimensions for image 
	minWidth	: 125,			// |
	minHeight	: 50,			// |- Minimum allowed dimensions for image 
	zIndex		: 5000,			// Z-Index to use for editor positioning (affects overlay too)
	modal		: true,			// Set FALSE to do not use overlay and "click-out"
	overlay		: true,			// Set FALSE to create hidden overlay, but still have "click-out"
	forcePosition	: false,		// Set TRUE to force position style on parent element. Used to make sure it's not changed outside
	updateOnly	: false,		// Set TRUE to init only math for update

	history		: [],			// Stores changes history, for undo operations					
	historyLock	: false,		// Indicated history save lock					
	historyDelay	: 500,			// Delay between history steps, to do not save too often operations
	historyTimer	: false,		// History saving timer
	isUndo		: false,		// Undo flag to prevent history updates	

	x		: {			// Current math values for X axis
		originSize	: 0,			// Original image size (used to indicate relative change)

		imageSize	: 0,			// Image size
		imagePos	: 0,			// Image position relative to viewport (for crop)
		imageOff	: 0,			// Image offset

		wrapSize	: 0,			// Wrapper size (viewport)
		wrapPos		: 0,			// Wrapper position
		wrapOff		: 0,			// Wrapper offset
		 
		pageMouse	: 0,			// Cursor position relative to document
		wrapMouse	: 0,			// Cursor position relative to wrapper
		imageMouse	: 0,			// Cursor position relative to image
		
		flip		: false,		// Axis flip marker
	}, //x		
	y		: {},			// Current math values for Y axis (same structure as is, will be set in .init() )
	
	dom		: {			// Set of valuable elements as jQuery shortcuts
		parent		: false,		// Image parent box
		source		: $img,			// Initial image being edited
		wrap		: false,		// Viewport div, main editor wrapper
		image		: false,		// Viewed image, used to show changed
		overlay		: false,		// Editor overlay
		
		tools		: false,		// Main tools bar
	
		dummy		: false,		// Tools dummy used to trick tolls position around slider (slider on center when visible)
		slider		: false,		// Slider element
		
		zoomIn		: false,		// |
		zoomOut		: false,		// |- Zoom controls
		
		rotateL		: false,		// | 
		rotateR		: false,		// |- Rotate controls
		
		flipH		: false,		// | 
		flipV		: false,		// |- Flip controls

		undo		: false,		// Undo control 
		reset		: false,		// Reset control

		debug		: false,		// Debug tools
	}, //dom
	
	origin		: {			// Stores changes made by editor, to be able to revert those
		url		: '',			// Original url
		width		: 0,			// |		
		height		: 0, 			// |- Original dimensions
	}, // origin	

	responsive	: {				// Describes set of responsive classes to be applied on resizing. No rotation set
		'no-dummy'	: 600,
		'no-reset'	: 500,
		'no-slider'	: 450,
		'no-flip'	: 150,
		'no-zoom'	: 125,
	}, //responsive

	responsiveY	: 65,				// Minimal height untill tools are hidden

	debug		: false,			// Set TRUE to enable realtime debug console
	con		: false,			// Will store console object

	loaderState	: false,			// Indicates loading state 
	loaderDelay	: 200,				// If loading process happens faster than this value - loader will not even show
	loaderTimer	: false,			// Used to prevent flicker (or what seems to look like flicker ;) ) 

	resizable	: {},				// Initial resizable settings. If set to FALSE, will disable manual resizing
	draggable	: {},				// Initial draggable settings. If set to FALSE, will disable manual dragging

// ==== INIT ===================================================================================================================

	/** //** ----= set	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Initiates self parameters from given options array.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	set		: function ($o) {
		
		// ToDo: .set() in basic class
		// ToDo: proper events extension support
		$o = $o || {};
		jQuery.extend(this, $o);
		return this;
		
	}, //FUNC set	

	/** //** ----= edit	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Initiates editing of image.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	edit		: function () {
		
		var $this = this;
		
		// If failed to init - that might be caused by rare crome onLoad/render bug
		// Trying again bit later (giving crome time to deal with it's caches)
		if ( this.init() === false )
			setTimeout( function () {
				$this.init();				
			}, 100); //FUNC setTimeout
		
		return this;
		
	}, //FUNC edit	

	/** //** ----= save	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Stops editing and saves changes.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	save		: function () {

		var $this = this;

		this.onBeforeSave();

	// ---- URL ----

		var $query = '';

		// Compiling url, to load into image
		// Using width resize, to make sure aspect is preserved
		$query = 'resize=' + Math.round(this.x.imageSize);
		
		// Checking if crop needed
		if ( 
			(this.x.imageSize != this.x.wrapSize) 
			|| (this.y.imageSize != this.y.wrapSize) 
		) {
	
			$query += '&crop=' + Math.round(this.x.wrapSize) + 'x' + Math.round(this.y.wrapSize);

			// Checking if crop moved (inverting values)
			// Need to spciefy 0x0 anyway, othewise crop will be just centered
		//	if ( this.x.imagePos != 0 || this.y.imagePos != 0 )
				$query += ',' + Math.round(this.x.imagePos)*-1 + 'x' + Math.round(this.y.imagePos)*-1;

		} //IF crop used

		var $flip = [];
		// Checking if flip used
		if ( this.x.flip )
			$flip.push('vrt');
			
		if ( this.y.flip )
			$flip.push('hor');

		if ( $flip.length )
			$query += '&flip=' + $flip.join();

		var $url = this.url + '?' + $query;

		this.queryStr = $query;

	// ---- IMAGE ----

		// Loading updated image
		this.state(true);

		// Saving origin dimensions (saving here, to allow dynamic updates from callee)
		this.origin.width	= this.dom.source.get(0).style.width;
		this.origin.height	= this.dom.source.get(0).style.height;

		// Sticking source box dimensions to be same as wrapper
		this.dom.source.css({
			'width'		: this.x.wrapSize,
			'height'	: this.y.wrapSize,
		}); //source.css

		// Resetting src, to be prepared for next load
		// Firefox needs this mostly, but it does not heart anyway
		$this.dom.source.attr('src', '');
		
		// Removing self only after resized image was loaded (for smoother transaction)
		// Setting load event before setting src (to make sure that even cache hit was captured)
		this.dom.source
			.imagesLoaded()
			.always( function () {

				// Getting original image back visible
				// And returning original dimensions
				$this.dom.source.css({
					'width'		: $this.origin.width,
					'height'	: $this.origin.height,
					'visibility'	: '',
					
				});
	
				// Done loading
				$this.state(false);
	
				// Removing self
				$this.deinit();

				// Calling event	
				$this.onAfterSave();
	
			}); //source.onLoad

		this.dom.source.attr('src', $url);

	// ---- TOOLS ----

		// Partially deinitiating before load
		$this.deinitTools();
		$this.deinitMouse();

	// ---- DONE ----

		// Triggering event
		this.onSave();

		return this;
				
	}, //FUNC save	

	/** //** ----= cancel	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Stops editing and reverts changes.
	*
	*	@return SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	cancel		: function () {

		this.onCancel();

		return this;		
	}, //FUNC cancel	

	/** //** ----= init	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Initiates self properties. Adds editor elements.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	init		: function () {
		
		var $this = this;
		
		// X and Y axis data have same initial structure
		this.y = jQuery.extend({}, this.x);
	
	// ---- DOM ---
		
		// Initiating main elements
		if ( this.initEssentials() === false )
			return false;
		
		// Attaching editor into document
		this.dom.wrap.insertAfter(this.dom.source);

		// Optionally adding overlay and disabling events around
		// Update mode - forces non-modal init
		
		if ( this.updateOnly )
			this.modal = false;
		
		if ( this.modal ) {
			
			jQuery('BODY').addClass('scroll-off');
			this.initOverlay();
			
		} //IF modal		
		
		// Debug is always initiated, but not always enabled
		if ( !this.updateOnly )
			this.initDebug();

	// ---- Tools ----

		// Tools and buttons are initiated only after image was really loaded.
		this.dom.image.on('load', function () {
			
			// Once image is loaded - can get real ratio now
			// Using naturalWidth/Height to ensure correct ratio is returned
			// Ofc using those only of available, else falling back to css width/height
			// Fallback is safe as height is not forced, thus ratio is normally kept
			var $img	= $this.dom.image.get(0);
			
			// Getting natural dims
			var $nWidth	= $img.naturalWidth; 
			var $nHeight	= $img.naturalHeight;
			
			// Faling back to css ones
			if ( !$nWidth || !$nHeight ) {
				$nWidth = $this.dom.image.width();
				$nHeight = $this.dom.image.height();
			} //IF no natural dims

			// If got some - can recalc ratio
			if ( $nWidth && $nHeight )			
				$this.aspectRatio = $nWidth / $nHeight;
			
			// Tools and button controls
			if ( !$this.updateOnly ) {

				$this.initTools();
				$this.initMouse();
				
			} //IF normal edit

			// Updating math and main css
			$this.updatePositionsCss();

			// After all init - can update UI, to be extra safe
			// This will update positions and sizes of visual controls
			if ( !$this.updateOnly ) {
				
				$this.updateUI();
				
			} //IF normal edit

			$this.onEdit();

		}); //image.onLoad

		// Updating transition css right away, to avoid blink
		$this.updatePositionsCss();
		$this.updateFlipRotateCss();
		
	}, //FUNC init	

	/** //** ----= deinit	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Removes self element from pages, and finalizes editing.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	deinit		: function () {

		// Removing main elements
		if ( this.modal ) 
			this.dom.overlay.remove();
		
		this.dom.wrap.remove();

		// Restoring events handling
		jQuery('BODY').removeClass('scroll-off');

		// Can safely return position now
		if ( this.forcePosition ) {
			this.dom.source.parent().css('position', '');
			this.dom.source.parent().css('display', '');
		} //IF positioning corrected
			
		this.deinitDebug();
	}, //FUNC deinit

	/** //** ----= initEssentials	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates main DOM elements.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initEssentials	: function () {
		
		var $src	= this.dom.source;
		var $this	= this;

	// ---- SCALE ----
	
		// Image might be scaled, so have to correct all values by that scale
		// Scale can be determined on crop (that's actually when it matters)
		var $scale = 1;
		
		// Calculating scale by comparing original image real dimensions and wrap size
		var $img	= $src.get(0);
		var $nWidth	= $img.naturalWidth;
		var $sWidth	= $src.width();
	
		if ( $nWidth ) {
			$scale = $nWidth / $sWidth;
		} //IF natural size given

	// ---- POSITION ----

		// Forcing position to make sure that it will not change (with events?)
		if ( this.forcePosition ) {

			var $parent = $src.parent();

			if ( $parent.css('position') == 'static' ) 
				$parent.css('position', 'relative');

			if ( $parent.css('display') == 'inline' ) 
				$parent.css('display', 'block');
			
		} //IF position udpate
		
	// ---- AXIS ----
		
		// Getting initial dimensions/positions
		var $p		= this.realPosition($src, true);
		var $o		= $src.offset();
		
		// Most of sizes are same initially, but are corrected on url parsing
		
		// X
		this.x.originSize	= $src.width();

		this.x.wrapSize		= this.x.originSize;
		this.x.wrapPos		= $p.left;
		this.x.wrapOff		= $o.left;
		
		this.x.imageSize	= this.x.originSize;
		this.x.imagePos		= 0;
		this.x.imageOff		= $o.left;
		
		//Y
		this.y.originSize	= $src.height();
		
		this.y.wrapSize		= this.y.originSize;
		this.y.wrapPos		= $p.top;
		this.y.wrapOff		= $o.top;
		
		this.y.imageSize	= this.y.originSize;
		this.y.imagePos		= 0;
		this.y.imageOff		= $o.top;

		// In some rare cases chrome triggers onLoad faster then img loads
		// Attempting to detect this
		if ( this.y.originSize == 0 )
			return false;

		// Calculating aspect ratio for dimensions corrections
		// Optinally, cuz this might be provided by caller already
		if ( !this.aspectRatio )
			this.aspectRatio = this.x.originSize / this.y.originSize;

	// ---- URL ----	
		
		// Parsing source image url and composing view url
		// View should be slighly bigger than current viewport
		// Resizing by width

		var $srcUrl	= this.origin.url = this.url || $src.attr('src');
		
		this.url	= $srcUrl;
		this.query	= {};
		this.queryStr	= '';
		this.view	= $srcUrl;

		// Splitting query from url (if it's present)
		var $qpos	= $srcUrl.indexOf('?');
		if ( $qpos > -1 ) {
			
			// Correcting starting values, reading them from url
			this.url	= $srcUrl.substring(0, $qpos); 
			this.queryStr	= $srcUrl.substring($qpos+1)
			var $query	= this.queryStr;
			
			parse_str($query, this.query);

		// ---- CROP ----	
	
			if ( this.query['crop'] ) {
				var $tmp	= this.query['crop'].split(',');
				var $size	= getDimensions($tmp[0]);
				var $from	= isSet($tmp[1]) ? getDimensions($tmp[1], true) : false;
				
				// Proceeding only if correct size given
				if ( $size ) {

					// Not really necessary, but doing to be consistant
					this.x.wrapSize = $size['x'] / $scale;
					this.y.wrapSize = $size['y'] / $scale;
					
					// And position if set
					if ( $from ) {
						// Inverting values as it's viewport
						this.x.imagePos = $from['x'] * -1 / $scale;
						this.y.imagePos = $from['y'] * -1 / $scale;
					} //IF position set
					
				} //If size given
			
			} //IF crop set

		// ---- RESIZE ----

			if ( this.query['resize'] ) {
				
				var $size	= getDimensions(this.query['resize']);
				
				// If shorthand resize given - calculating second side by side given
				// Preffering width, assuming at least one is given (otherwise it's failed image anyway)
				if ( !isEmpty($size['x']) ) {
					this.x.imageSize = $size['x'] / $scale;
					this.y.imageSize = Math.round($size['x'] / this.aspectRatio / $scale);
				} //IF width given
				else {
					this.y.imageSize = $size['y'] / $scale;
					this.x.imageSize = Math.round($size['y'] * this.aspectRatio / $scale);
				} //IF height given
				
			} //IF resize set

		// ---- FLIP ----	
			
			if ( this.query['flip'] ) {

				// Fast checking for keywords. Image with invalid params is impossible to edit anyway (it will just not load)
				if ( this.query['flip'].indexOf('vrt') != -1 )
					this.x.flip = true;				

				if ( this.query['flip'].indexOf('hor') != -1 )
					this.y.flip = true;				
				
			} //IF flip is set

		// ---- ROTATE ----	
			
			// ToDo: complete rotate support
				
	
		} //IF ? found
		
		var $viewX	= Math.floor(this.x.imageSize * this.viewFactor);
		if ( $viewX > this.viewLimit )
			$viewX = this.viewLimit;
		
		this.view	= this.url + '?' + $viewX;

	// ---- WRAP ----	

		this.dom.parent	= $src.parent();

		// Creating main container, will be attached last after all init is complete
		// By default editor it's in loading state, which will be cleared once view loaded
		this.dom.wrap	= jQuery('<div class="mwImgEd"></div>')
			.css({
				'position'	: 'absolute',
	
				'left'		: this.x.wrapPos,
				'top'		: this.y.wrapPos,
	
				'width'		: this.x.wrapSize,
				'height'	: this.y.wrapSize,
				
				'overflow'	: 'hidden',
				'z-index'	: this.zIndex + 1, 
			}) //css
		; //jQuery.wrap

		this.dom.wrap.disableSelection();

	// ---- VIEW ----	

		// Loading view might take time
		this.state(true);

		// Creating view image, setting initial params, to make sure it have correct box while loading
		// Creating invisible image initially, and setting visibility only after load
		// This allows to avoid initial blinking when swapping images and applying correcting css
		this.dom.image	= jQuery('<img src="' + this.view + '" />')
			.css({
				'position'	: 'absolute',
				'border'	: 'none',
				'visibility'	: 'hidden',
				
				'left'		: this.x.imagePos,
				'top'		: this.y.imagePos,

				'width'		: this.x.imageSize,
				'height'	: this.y.imageSize,

				'cursor'	: 'move',
			}) //css
			.appendTo(this.dom.wrap)
		; //jQuery.image

		// Completing image initiation once loaded
	//	this.dom.image.on('load', function () {
		imagesLoaded( this.dom.image, function () {
			
			// Hiding original image, after view loads, giving small pause, to do not blink
			setTimeout( function () {
				
				// And hiding to avoid artifacts,
				if ( !$this.debug && !$this.updateOnly )
					$this.dom.source.css('visibility', 'hidden');
			}, 1);
			
			// Showing view image
			$this.dom.image.css('visibility', 'visible');
			
			// Done loading
			$this.state(false);
			
		}); //image.onLoad

	}, //FUNC initEssentials	

	/** //** ----= initOverlay	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates overlay element
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initOverlay	: function () {
		
		var $this = this;

		// Preventing parent clicks during editing
		this.dom.wrap.click( function ($e) { 
			$e.stopPropagation(); 
			return false; 
		}); //FUNC onClick
		
		this.dom.overlay = jQuery('<div class="mwImgEdOverlay ' + (this.overlay ? '' : 'invisible') + '"></div>')
			.css({
				'z-index'	: this.zIndex, 
			}) //css
			.insertAfter(this.dom.wrap)
			.on('click', function ($e) {
				
				// On overlay click - saving changes
				$this.save();
				
				$e.stopPropagation(); 
				return false; 
			}) //FUNC onClick
		; //jQuery.image
		
	}, //FUNC initOverlay	

// ==== DEBUG ==================================================================================================================

	/** //** ----= initDebug	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates debug elements.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initDebug	: function () {

		var $this = this;

		// Console always exists to do not cause errors
		this.con = vConsole({
			'enabled'	: this.debug && isDebug(),
			'width'		: 500,
		//	'autoupdate'	: true,
			'panels'	: {
				'main'		: [100, this, ['view', 'aspectRatio', 'angle', 'zoomValue', 'maxWidth']],
				'x'		: [50, this.x],
				'y'		: [50, this.y],
			}
		}); //con

		// Debug should be possible
		if ( !isDebug() )
			return;
		
		// Creating debug button
		this.dom.debug = jQuery('<div class="button debug"></div>')
			.css({
				'position'	: 'absolute',
				'left'		: 10,
				'top'		: 10,
			}) //css
			.appendTo(this.dom.wrap)
			.on('click', function () {
				$this.debug = !$this.debug 
				$this.con.toggle();
			}) //FUNC onClick
		; //jQuery.image

	}, //FUNC initDebug	

	/** //** ----= deinitDebug	=------------------------------------------------------------------------------\**//** \
	*
	*	Deinitiates debug console.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	deinitDebug	: function () {
		
		// Removing button
		if ( this.dom.debug )
			this.dom.debug.remove();
		
		// And console
		if ( this.con )
			this.con.deinit();	
		
	}, //FUNC deinitDebug

// ---- TOOLS ------------------------------------------------------------------------------------------------------------------

	/** //** ----= initTools	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates visual tools and button controls.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initTools	: function () {

		var $this = this;
		
		// Creating main bar
		this.dom.tools = jQuery('<div class="main tools"></div>');
		
		// Creating tools
		this.initSlider();
		this.initRotate();
		this.initFlip();
		this.initReset();
		
		// Attaching toolbar into editor
		this.dom.tools.appendTo(this.dom.wrap);
		
		// Global mouse repeat cancel on mouseUP
		// This enables simple way to create mouseRepeat events
		// ToDo: Unbind on destroy
		jQuery(document).on('mouseup', function () {
			
			// Doing nothing if not interval (to do not interferee with other events)
			if ( !$this.mouseTimer ) return;
			
			// Clearing interval, to stop action
			clearInterval($this.mouseTimer);
			
			// Canceling current event
			return false;
		}); //FUNC onMouseup
		
	}, //FUNC initTools	

	/** //** ----= deinitTools	=------------------------------------------------------------------------------\**//** \
	*
	*	Removes mouse control.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	deinitTools	: function () {

		// Removing tools bar
		if ( this.dom.tools )
			this.dom.tools.remove();		
		
	}, //FUNC deinitTools

	/** //** ----= initSlider	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates zoom slider and it's buttons. Also adds centering dummy.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initSlider	: function () {

		var $this = this;

	// ---- DOM ----

		this.dom.dummy		= jQuery('<div class="dummy"></div>').appendTo(this.dom.tools);
		this.dom.slider		= jQuery('<div class="slider"></div>').appendTo(this.dom.tools);

		this.dom.zoomOut	= jQuery('<div class="button zoom out"></div>').insertBefore(this.dom.slider);
		this.dom.zoomIn		= jQuery('<div class="button zoom in"></div>').insertAfter(this.dom.slider);

	// ---- CONTROLS: slider ----

		this.dom.slider.slider({
			min	: $this.zoomMin,
			max	: $this.zoomMax,
			step	: 0.01,
			value	: $this.zoomValue,
			slide	: function ($e, $ui) {
				$this.zoom($ui.value, 'wrap');
			} //FUNC slide
		}); //jQuery.slider		

	// ---- CONTROLS: buttons ----

		this.dom.zoomIn.on('mousedown', function () {

			// Enabling mouse repeating action
			$this.mouseTimer = setInterval( function () {
				$this.zoom($this.zoomValue + $this.zoomButtonStep, 'wrap');
			}, $this.mouseRepeatTime); //FUNC mouseTimer.callback

		}); //FUNC zoomIn.onClick

		this.dom.zoomOut.on('mousedown', function () {
	
			// Enabling mouse repeating action
			$this.mouseTimer = setInterval( function () {
				$this.zoom($this.zoomValue - $this.zoomButtonStep, 'wrap');
			}, $this.mouseRepeatTime); //FUNC mouseTimer.callback
	
		}); //FUNC zoomOut.onClick

	}, //FUNC initSlider	

	/** //** ----= initRotate	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates rotate controls.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initRotate	: function () {

		// Not using currently, cuz buggy
		return;

		var $this = this;

	// ---- DOM ----

		// Adding visual divider
		jQuery('<div class="rotate divider"></div>').appendTo(this.dom.tools);
		
		this.dom.rotateL	= jQuery('<div class="button rotate left"></div>').appendTo(this.dom.tools);
		this.dom.rotateR	= jQuery('<div class="button rotate right"></div>').appendTo(this.dom.tools);

	// ---- CONTROLS ----

		this.dom.rotateL.on('click', function () {
			$this.rotate('l');
		}); //FUNC rotateL.onClick	

		this.dom.rotateR.on('click', function () {
			$this.rotate('r');
		}); //FUNC rotateR.onClick	


	}, //FUNC initRotate	

	/** //** ----= initReset	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates reset and undo controls.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initReset	: function () {

		var $this = this;

	// ---- DOM ----

		// Adding visual divider
		jQuery('<div class="rst divider"></div>').appendTo(this.dom.tools);
		
		this.dom.undo	= jQuery('<div class="button rst undo"></div>').appendTo(this.dom.tools);
		this.dom.reset	= jQuery('<div class="button rst reset"></div>').appendTo(this.dom.tools);

	// ---- CONTROLS ----

		this.dom.undo.on('click', function () {
			$this.undo();
		}); //FUNC rotateL.onClick	

		this.dom.reset.on('click', function () {
			$this.reset();
		}); //FUNC rotateR.onClick	


	}, //FUNC initReset	

	/** //** ----= initFlip	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Initiates flip controls.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initFlip	: function () {

		var $this = this;

	// ---- DOM ----

		jQuery('<div class="flip divider"></div>').appendTo(this.dom.tools);

		this.dom.flipH	= jQuery('<div class="button flip hor"></div>').appendTo(this.dom.tools);
		this.dom.flipV	= jQuery('<div class="button flip ver"></div>').appendTo(this.dom.tools);

	// ---- CONTROLS ----

		this.dom.flipH.on('click', function () {
			$this.flip('y');
		}); //FUNC flipH.onClick	

		this.dom.flipV.on('click', function () {
			$this.flip('x');
		}); //FUNC flipV.onClick	

	}, //FUNC initFlip	

	/** //** ----= updateUI	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Updates UI elements visibility and positions.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updateUI	: function () {
		
		// Checking viewport size agains set of responsive classes, 
		// applying onces that needed, removing ones that are not
		
		// Checking if height is too small, and disabling visual tools completely in this case
		if ( this.y.wrapSize <= this.responsiveY )
			this.dom.wrap.addClass('no-tools');
		else
			this.dom.wrap.removeClass('no-tools');
		
		for ( var $i in this.responsive ) {
			var $r = this.responsive[$i];
			
			// Adding if less than border value, removing othewise
			if ( this.x.wrapSize <= $r )
				this.dom.wrap.addClass($i);
			else
				this.dom.wrap.removeClass($i);
			
		} //FOR each responsive class
		
	}, //FUNC updateUI	

// ---- MOUSE ------------------------------------------------------------------------------------------------------------------

	/** //** ----= initMouse	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates mouse controls, like drag/zoom/resize
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initMouse	: function () {
		
		var $this = this;

	// ---- CURSOR ----
		
		// Tracking mouse cursor
		this.dom.wrap.on('mousemove', function ($e) {
			
			$this.x.pageMouse	= $e.pageX;
			$this.x.wrapMouse	= $e.pageX - $this.x.wrapOff;
			$this.x.imageMouse	= $e.pageX - $this.x.imageOff;

			$this.y.pageMouse	= $e.pageY;
			$this.y.wrapMouse	= $e.pageY - $this.y.wrapOff;
			$this.y.imageMouse	= $e.pageY - $this.y.imageOff;

			if ( $this.con )
				$this.con.update();
		
		}); //wrap.onMousemove
		
	// ---- CONTROLS ----	
		
		this.initResize();
		this.initZoom();
		this.initDrag();

	}, //FUNC initMouse	

	/** //** ----= deinitMouse	=------------------------------------------------------------------------------\**//** \
	*
	*	Removes mouse control.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	deinitMouse	: function () {
		
		// Stop zoom
		this.dom.wrap.off('mousewheel');
		
		// Stop drag
		this.dom.image.draggable('destroy');		

		// Stop resize
		this.dom.wrap.resizable('destroy');		
		
	}, //FUNC deinitMouse

	/** //** ----= initZoom	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Initiates mouse zoom.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initZoom	: function () {
		
		var $this = this;
	
		this.dom.wrap.on('mousewheel', function ($e) {
			$this.zoom($this.zoomValue + $this.zoomStep * $e.deltaY, 'mouse');
		}); //img.onMousewheel
		
	}, //FUNC initZoom	
	
	/** //** ----= initDrag	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Initiates image dragging.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initDrag	: function () {
		
		var $this = this;
		
		// Setting up
		var $res = this.setupJQ(this.draggable, {
			start			: function ($event, $ui) {

				// Saving current state in history
				$this.saveHistory();

			}, //start

			drag		: function ($e, $ui) {
				// Getting actual position, and updating image data
				var $p = $this.dom.image.position();
				$this.move($p.left, $p.top);
			} //onDrag
		}); //$res
		
		// Init
		this.dom.image
			.draggable('destroy')
			.draggable($res);

	}, //FUNC initDrag	

	/** //** ----= initResize	=------------------------------------------------------------------------------\**//** \
	*
	*	Initiates resizable viewport.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	initResize	: function () {
		
		var $this = this;
		
		// Setting up
		var $res = this.setupJQ(this.resizable, {
			minWidth	: this.minWidth,
			minHeight	: this.minHeight,
			maxWidth	: this.maxWidth,
			maxHeight	: this.maxHeight,

			start			: function ($event, $ui) {

				// Saving current state in history
				$this.saveHistory();

				// Adding size hint to show dimensions while resizing
				this.h = jQuery('<div class="mwSizeHint bottom right"></div>').appendTo($this.dom.wrap);
				
			}, //start

			stop			: function ($event, $ui) {
				// Removing size hint
				this.h.remove();
			}, //stop

			resize		: function ($event, $ui) {
				
				// Updating wrapper sizes and math
				$this.setWrapSize($this.dom.wrap.width(), $this.dom.wrap.height());
				
			// ---- HINT ----
			
				// Updating info on size hint
				this.h.html($this.x.wrapSize + 'px x ' + $this.y.wrapSize + 'px');
		
			// ---- DONE ----
				
				// Updatin UI to make sure controls look right
				$this.updateUI();
			 
			 	if ( $this.con )
					$this.con.update();

				$this.onResize();
				$this.updatePositionsCss();

			} //FUNC resize
		});

		if ( $res === false ) return;
		
	 	// Initiating handles (if none set already)
	 	if ( !$res['handles'] ) {
	 		
	 		switch ( this.resizeOn ) {
 				case 'x':
 					$res['handles'] = 'e';
 					break;
				case 'y': 
 					$res['handles'] = 's';
 					break;
				case 'xy' :
 					$res['handles'] = 's, e, se';
 					break;
				case 'no' :
				default	:
					return;
	 		} //SWITCH resizeOn
	 		
	 	} //IF no handles specified
		
		// Init
		this.dom.wrap
			.resizable('destroy')
			.resizable($res);

	}, //FUNC initResize	

// ==== MATH ===================================================================================================================

// ==== TRANSFORM ==============================================================================================================

	/** //** ----= setWrapSize	=------------------------------------------------------------------------------\**//** \
	*
	*	Applies new wrap size.
	*
	*	@param	int	$width	- New width
	*	@param	int	$height	- New height
	*	
	*	@return	SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	setWrapSize		: function ($width, $height) {

		// Updating wrapper math
		this.x.wrapSize	= $width;
		this.y.wrapSize	= $height;

		// Updating original image, and it's data
		this.x.originSize = this.x.wrapSize;
		this.y.originSize = this.y.wrapSize;
		
		this.dom.source.css({
			'width'		: this.x.originSize,
			'height'	: this.y.originSize,
		}); //css

		this.dom.wrap.css({
			'width'		: $width,
			'height'	: $height,
		});

		// Updating wrap position
		this.updateWrapPos();

		return this;		
	}, //FUNC setWrapSize	

	/** //** ----= updateWrapPos 	=------------------------------------------------------------------------------\**//** \
	*
	*	Updates wrap positioning against source image (in case it was centered/margined)
	*
	*	@return	SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updateWrapPos		: function () {

		// Making sure we are positioned correctly still
		// Need to update position in case image was centered originally
		var $src	= this.dom.source;
		
		// Getting initial dimensions/positions
		var $p		= this.realPosition($src, true);

		this.dom.wrap.css({
			'left'		: $p.left,
			'top'		: $p.top
		});

		// Getting updated offset back
		var $o = this.dom.wrap.offset(); 

		// Updating wrap offset values
		this.x.wrapOff = $o.left;
		this.y.wrapOff = $o.top;

	}, //FUNC updateWrapPos
	
	/** //** ----= resize	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Resize image to new dimensions.
	*	WARNING: Dimensions are set strictly, no aspect preserve used.
	*
	*	@param	int	$width	- New width
	*	@param	int	$height	- New height
	*	
	*	@return	SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	resize		: function ($width, $height) {

		if ( $width < this.x.wrapSize )
			return;

		if ( $height < this.y.wrapSize )
			return;

		this.x.imageSize = $width;
		this.y.imageSize = $height;
	/*/
		var $maxWidth	= this.maxWidth ? Math.min(this.x.imageSize, this.maxWidth) : this.x.imageSize;
		var $maxHeight	= this.maxHeight ? Math.min(this.y.imageSize, this.maxHeight) : this.y.imageSize;
	/*/
		var $maxWidth	= this.maxWidth ? this.maxWidth : this.x.imageSize;
		var $maxHeight	= this.maxHeight ? this.maxHeight : this.y.imageSize;
	/**/
		this.dom.wrap.resizable('option', 'maxWidth', $maxWidth );
		this.dom.wrap.resizable('option', 'maxHeight', $maxHeight );

	//	this.onResize($width, $height);
	//	this.con.update();
	//	this.updatePositionsCss();
		
	}, //FUNC resize	

	/** //** ----= move	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Moves image to given position.
	*
	*	@param	int	$left	- New horisontal position
	*	@param	int	$top	- New vertical position
	*	
	*	@return	SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	move		: function ($left, $top) {

		// Saving distance
		var $deltaX 		= this.x.imagePos - $left;
		var $deltaY 		= this.y.imagePos - $top;
		
		// Updating image position and offset
		this.x.imagePos 	= $left;
		this.y.imagePos 	= $top;

		this.x.imageOff 	-= $deltaX;
		this.y.imageOff 	-= $deltaY;

		// Updating mouse positions (to ensure fresh values without actual cursor moving)
		this.x.imageMouse	+= $deltaX; 
		this.y.imageMouse	+= $deltaY; 

	//	this.onMove();

	//	this.con.update();
		
	//	this.updatePositionsCss();
		
	}, //FUNC move	

	/** //** ----= zoom	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Zooms image to given value. Zoom is counted against original image.
	*	Essencially zoom is combination or resize and move. Updates image position durin resize to keep 
	*	point specified on screen.
	*
	*	@param	float	$zoom		- New zoom level to set.
	*	@param	string	[$position] 	- Center point to position against.
	*					  Possible values: 
	*					    'wrap'	- positions against viewport center.
	*					    'image'	- positions against image center (default).
	*					    'mouse'	- positions against mouse cursor.
	*					    'zero'	- positions agains top left corner of image (no move).
	* 
	*	@return	SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	zoom		: function ($zoom, $position) {

		var $this = this;

	// ---- Validating values ----
	
		if ( !$position || !isIn($position, ['wrap', 'image', 'mouse', 'zero']) )
			$position = 'image';
		
		if ( $zoom > this.zoomMax )
			return;

		if ( $zoom < this.zoomMin )
			return;

		// Saving history
		this.saveHistory();

		// Saving value
		this.zoomValue = $zoom;

	// ---- Zooming ----

		// Using math helper for each axis
		// It does all math and saves results into axis data as subarray

		var zoomAxis = function ($axis, $size) {
			
			// Cleaning prev results if any, and creating shortcut
			var $ax = $axis.ex = {};
			
		// ---- SIZE ----
			
			$ax.newSize	= $size || ($axis.wrapSize * $zoom);

		// ---- POSITION ----
		
			$ax.center = 0;
		
			// Calculating central point based on params given
			switch ( $position ) {
				case 'zero' :	// Top left of image
					$ax.center = 0; 
					break;

				case 'image' :	// Center of image (delta == 0.5)
					$ax.center = $axis.imageSize / 2;
					break;

				case 'mouse' :	// Mouse cursor position
					$ax.center = $axis.imageMouse;
					break;

				case 'wrap' :	// Center of viewport
				default :
					$ax.center = ($axis.wrapSize / 2) - $axis.imagePos;
			} //SWITCH $position

			// Calculating move proportions, commenting as simple questions to show logic

			// How much image size was changed?
			$ax.sizeDelta	= $ax.newSize - $axis.imageSize;
			
			// How close zoom point was to one side?
			$ax.centerDelta	= $ax.center / $axis.imageSize;
			
			// Correcting position based on central point proportion
			$ax.posAdd	= $ax.sizeDelta * $ax.centerDelta;
			
			// Have new position now
			$ax.newPos	= $axis.imagePos - $ax.posAdd;

		} //FUNC zoomAxis

		// Calculating zoom (resize and move)
		// Making sure ratio is still correct (with X as priority)
		zoomAxis(this.x);
		zoomAxis(this.y, this.x.ex.newSize / this.aspectRatio);

		// Resizing and moving
		this.resize(this.x.ex.newSize, this.y.ex.newSize);
		this.move(this.x.ex.newPos, this.y.ex.newPos);

	// ---- DONE ----

		// Calling event, given possibility to do smth
		this.onZoom($zoom);

		// Updating slider, css and debug
	//	this.dom.slider.slider('option', 'value', $zoom);
		
		this.con.update();
		
		this.updatePositionsCss();
		
		return this;
	}, //FUNC zoom	

	/** //** ----= flip	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Flips image by given axis.
	*
	*	@param	string	[$axis]	- Axis to flip by. If omited - just updates image css.
	*				  Valid values are 'x' or 'y'.	
	*
	*	@return	SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	flip		: function ($axis) {

		// Saving history
		this.saveHistory();

		// Flip cancels rotation and opposite flip currently
		// ToDo: Simultanious support for both in resizer
		this.angle = 0;

		// If axis specified - inverting that one
		if ( $axis == 'x' || $axis == 'y' )
			this[$axis].flip = !this[$axis].flip;

		this.updateFlipRotateCss();

		this.con.update();

		this.onFlip($axis);

		return this;
	}, //FUNC flip	

	/** //** ----= rotate	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Rotates image in direction specified.
	*
	*	@param	string	[$direction]	- Axis to flip by. If omited - just updates image css.
	*				  	Valid values are 'l' or 'r'.	
	*
	*	@return	SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	rotate		: function ($direction) {
		
		// Flip cancels flip currently
		// ToDo: Simultanious support for both in resizer
		this.x.flip = false;
		this.y.flip = false;
		
		// Updating angle depending on direction
		if ( $direction == 'r' )
			this.angle += 90;
		
		if ( $direction == 'l' )
			this.angle -= 90;
			
		// Correcting if necessary
		// Safe to check exact values, cuz steps are exactly 90
		if ( this.angle == 360 )
			this.angle = 0;
			
		if ( this.angle == -90 )
			this.angle = 270;
		
		// Setting up css
		this.updateFlipRotateCss();

		this.con.update();
		
		this.onRotate(this.angle);

		return this;
	}, //FUNC rotate	

	/** //** ----= saveHistory	=------------------------------------------------------------------------------\**//** \
	*
	*	Saves current math state as undo step.
	*
	*	@return	SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	saveHistory		: function () {

		var $this = this;
		
		// Not saving history while doing undo
		if ( this.isUndo )
			return;
		
		if ( this.historyTimer ) 
			clearTimeout($this.historyTimer);

		this.historyTimer = setTimeout( function () {
			$this.historyLock = false;
		}, this.historyDelay);

		if ( this.historyLock )
			return;

		this.historyLock = true;

		var $state = {
			x	: jQuery.extend({}, this.x),
			y	: jQuery.extend({}, this.y),
			zoom	: this.zoomValue,
		}; //$state
		
		this.history.push($state);

	}, //FUNC saveHistory

	/** //** ----= undo	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Reverts changes done to image since last undo state.
	*
	*	@return	SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	undo		: function () {

		// Checking for last step, and removing it from history
		if ( !this.history.length )
			return this;

		// Flagging undo to prevent history updates
		this.isUndo = true;

		var $state = this.history.pop(); 

		// Resizing wrapper (this will also resize source)
		this.setWrapSize($state.x.wrapSize, $state.y.wrapSize);

		// Resetting positions and zoom
		this.move($state.x.imagePos, $state.y.imagePos);
		this.resize($state.x.imageSize, $state.y.imageSize);

		// Issuing zoom events
		this.onMove($state.x.imagePos, $state.y.imagePos);
		this.onResize($state.x.imageSize, $state.y.imageSize);
		this.onZoom($state.zoom);

		// Checking flip
		if ( $state.x.flip !== this.x.flip )
			this.flip('x');		

		if ( $state.y.flip !== this.y.flip )
			this.flip('y');		
		
		this.con.update();
		this.updatePositionsCss();

		// Unflagging undo
		this.isUndo = false;

	}, //FUNC undo	

	/** //** ----= reset	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Reverts any changes done to image, setting it's original dimensions and zoom.
	*
	*	@return	SELF
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	reset		: function () {

		// Defaulting to parent element width, as in 99% cases image is responsive and takes whole width of parent
		// Calculating height from aspectRatio
		// ToDo: envestigate, mb better to resize against current wrap width, or have optional (no width resize - using wrap size then)
		
		var $isResize	= this.resizeOn && this.resizeOn != 'no'; 
		
		if ( $isResize ) {
	 		switch ( this.resizeOn ) {
 				case 'x':
 					// Resizing to parent width, keeping height
					this.setWrapSize(this.dom.parent.width(), this.y.wrapSize);
 					break;
				case 'y': 
					// Resizing to proportional height, keeping width
					this.setWrapSize(this.x.wrapSize, this.x.wrapSize / this.aspectRatio);
 					break;
				case 'xy' :
					this.setWrapSize(this.dom.parent.width(), this.dom.parent.width() / this.aspectRatio);
 					break;
	 		} //SWITCH resizeOn
			
		} //IF resizing enabled
		
		// Calculating width/height from wrapper size, to propertly resize/center
		var $wrapRatio	= this.x.wrapSize / this.y.wrapSize;
		
		if ( $wrapRatio > this.aspectRatio ) {
			var $width	= this.x.wrapSize;
			var $height	= $width / this.aspectRatio;
			
			var $top	= Math.round((this.y.wrapSize - $height) / 2);
			var $left	= 0; 
		} //IF loose height
		else if ( $wrapRatio < this.aspectRatio ) {
			var $height	= this.y.wrapSize;
			var $width	= $height * this.aspectRatio;
			
			var $top	= 0;
			var $left	= Math.round((this.x.wrapSize - $width) / 2); 
		} //IF loose width
		else {
			var $width	= this.x.wrapSize;
			var $height	= this.y.wrapSize;
			
			var $top	= 0;
			var $left	= 0; 
		} //IF exactly same
		
		// Resetting positions and zoom, centering image
		this.move($left, $top);
		this.resize($width, $height);

		this.onMove($left, $top);
		this.onResize($width, $height);
		this.onZoom(this.zoomValue);
		
		this.con.update();
		this.updatePositionsCss();
		
	}, //FUNC reset	

// ==== CSS ====================================================================================================================

	/** //** ----= refresh	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Refreshes positins and sizes from current css.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	refresh		: function ($width, $height) {

		// Getting fresh dimensions/positions
		var $p			= this.dom.image.position();
		var $o			= this.dom.image.offset();

		this.x.imageSize	= this.dom.image.width();
		this.x.imagePos		= $p.left;
		this.x.imageOff		= $o.left;

		this.y.imageSize	= this.dom.image.height();
		this.y.imagePos		= $p.left;
		this.y.imageOff		= $o.top;

	}, //FUNC refresh	

	/** //** ----= updatePositionsCss	=----------------------------------------------------------------------\**//** \
	*
	*	Validates current image properties, corrects them and updates css.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updatePositionsCss		: function () {
		
		var $this = this;
		
		// Validating positions
		// Using math helper for each axis
		var checkAxis = function ( $axis ) {

			// Cleaning prev results if any, and creating shortcut
			// Making sure structure is set
			var $a = $axis.ex = {
				newSize		: $axis.imageSize, 
				newPos		: $axis.imagePos, 	
				deltaPos	: 0,	
			}; // $a
			
		// ---- Size ----	
			
			// Image can't be smaller than viewport
			if ( $a.newSize < $axis.wrapSize )
				$a.newSize = $axis.wrapSize;
			
			// Calculating axis value here, then will check for both same time outside
			$a.zoomValue = $a.newSize / $axis.wrapSize;

		// ---- Position ----	
			
			// No positive positions (left/top gap)
			if ( $a.newPos > 0 )
				$a.newPos = 0;
				
			// Checking right/bottom gap, calculating position difference
			$a.deltaPos = $axis.wrapSize - $a.newSize - $a.newPos;

			// No positive value, correcting if necessary
			if ( $a.deltaPos > 0 )
				$a.newPos = $a.newPos + $a.deltaPos; 

		} //FUNC checkAxis
		
		// Checking both axis
		checkAxis(this.x);
		checkAxis(this.y);

		// Making sure resulting ratio if correct. Checking to bigger size

		var $newY = this.x.ex.newSize / this.aspectRatio;
		if ( $newY > this.y.ex.newSize )
			this.y.ex.newSize = $newY;

		var $newX = this.y.ex.newSize * this.aspectRatio;
		if ( $newX > this.x.ex.newSize )
			this.x.ex.newSize = $newX;

		// Updating zoom value - it's proportion of wrap size to image size (using x Axis)
		// Need to check if that is too big (might happen during resizing + zooming)
		// Sticking to max zoom in this case
		// Updating zoom value. Using X axis, it's anyway proportional at this point
		this.zoomValue = this.x.imageSize / this.x.wrapSize;
		if ( this.zoomValue > this.zoomMax ) {
			
			// Decreasing both axis by zoom delta
			var $zoomDelta = this.zoomValue - this.zoomMax;  
			
			this.x.ex.newSize -= this.x.ex.newSize * $zoomDelta;  
			this.y.ex.newSize -= this.y.ex.newSize * $zoomDelta;  
			
			// Correcting zoom			
			this.zoomValue = this.zoomMax;
		} //IF zoom happend to be too big
		
		// Resizing and moving
		this.resize(this.x.ex.newSize, this.y.ex.newSize);
		this.move(this.x.ex.newPos, this.y.ex.newPos);

		this.dom.image.css({
			'left'		: this.x.imagePos,
			'top'		: this.y.imagePos,
			
			'width'		: this.x.imageSize,
			'max-width'	: 'none',
		//	'height'	: this.y.imageSize,
			'height'	: '',
		}); //css

		if ( this.dom.slider )
			// Updating slider position
			this.dom.slider.slider('option', 'value', this.zoomValue);
		
		// Updating draggable, setting image containment
		// Box selected such way that it can fit corners in all directions
		
		// Getting difference in box and image size, and adding those around wrap box as containment
		var $dx = this.x.imageSize - this.x.wrapSize;
		var $dy = this.y.imageSize - this.y.wrapSize;
		
		// Using original offset as base
		var $cnt = [this.x.wrapOff - $dx, this.y.wrapOff - $dy, this.x.wrapOff, this.y.wrapOff];

		this.dom.image.draggable('option', 'containment', $cnt );
		
	}, //FUNC updatePositionsCss	

	/** //** ----= updateFlipRotateCss	=----------------------------------------------------------------------\**//** \
	*
	*	Update image transform css.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updateFlipRotateCss	: function () {
		
		var $tr = '';
		
		// Adding scale only if specified, othewise - cleaning it
		if ( this.x.flip || this.y.flip ) 
			$tr += ' scale(' + (this.y.flip ? '-1' : '1') + ', ' + (this.x.flip ? '-1' : '1') + ')'

		// Adding rotation only if specified, othewise - cleaning it
		if ( this.angle != 0 )
			$tr += ' rotate(' + this.angle + 'deg)';

		// Updating css
		this.dom.image.css({
			'transform'	: $tr,
		}); //css
		
	}, //FUNC updateFlipRotateCss	

// ==== HELPERS ================================================================================================================

	/** //** ----= realPosition	=------------------------------------------------------------------------------\**//** \
	*
	*	Returns real element position, counting parent scrolls.
	*	Based on fact that jQuery fails to get correct element position if one of parents was scrolled.
	*
	*	@todo	More testing required. BOSY and immideate parent might be counted correctly already by jQuery. 
	*
	*	@param	jQuery	$el	- Element to count posititon for.
	*
	*	@return object		- Element relative position in jQuery native format { left: 0, top: 0 } 
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	realPosition	: function ($el, $countMargin) {

		var $pos = $el.position();
		
		// Who's scrolled?!
		// Looping through all parents and checking scoll values.
		// Using those to correct position of element, cuz jQuery fails to return proper posiiton for scrolled elements
		var $parents 	= $el.parents();
		var $scrollX	= 0;
		var $scrollY	= 0;
		 
		$parents.each( function () {
			var $p = jQuery(this);
			
			// Skipping body
			if ( $p.is('BODY, HTML') )
				return;
			
			// Adding scroll values (for non scrolled that will be 0 anyway)
			$scrollX += $p.scrollLeft();
			$scrollY += $p.scrollTop();
		}); //jQuery(parents).each

		// For now fixing using summared scroll
		// ToDo: Test more and see if that's working good
		// ToDo: Test with document scroll and immediate parent scroll (those might be propertly counted by jQuery)
		
		$pos.left	+= $scrollX;
		$pos.top	+= $scrollY;

		// Might need to count margins
		if ( $countMargin ) {
			
			$pos.left	+= parseInt($el.css('margin-left'));
			$pos.top	+= parseInt($el.css('margin-top'));
	
		} //IF margins matter
		
		return $pos;
	}, //FUNC realPosition	

	/** //** ----= setupJQ	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Helps validate/initiate jQuery.ui settings. Takes initial settings and extesion object and mixes all together.
	*	Allows FALSE as initial setting, to cancel process.
	*
	*	@param	object	$settings	- Initial settings to validate
	*	@param	object	$ex		- Extention settings to add.	
	*
	*	@return object			- jQuery.ui setup object, or FALSE if cancel.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	setupJQ		: function ($settings, $ex) {
		
		// Canceling if set so
		if ( $settings === false )
			return false;
		
		// If not canceled - need to make sure it's object
		if ( !isObject($settings) )
			$settings = {};
		
		// Creating setup object
		return jQuery.extend({}, $settings, $ex);
	}, //FUNC setupJQ	

	/** //** ----= state	=--------------------------------------------------------------------------------------\**//** \
	*
	*	Sets loading state (on/off). Uses slight delay, to prevent flicker.
	*
	*	@param	bool	$state	- Current loading state.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	state		: function ($state) {
		
		var $this = this;
		
		this.loaderState = $state;
		
		if ( $state === true ) {

			// Delaying show
			this.loaderTimer = setTimeout( function () {
				$this.dom.wrap.addClass('loading');
			}, this.loaderDelay);
		
		} else { //IF loading
		
			// Clearing loader timer if any happen
			clearTimeout(this.loaderTimer);

			$this.dom.wrap.removeClass('loading');
		} //IF not loading
		
	}, //FUNC state	

// ==== ENDofOBJECT ============================================================================================================
		
	}; //CLASS mwImgEd
	
	// Applying options
	$class.set($options);
	
	// Adding events
	$class = vEventObject(['onInit', 'onEdit', 'onBeforeSave', 'onSave', 'onAfterSave', 'onCancel', 'onDone', 'onChange', 'onZoom', 'onResize', 'onMove', 'onRotate', 'onFlip', 'onReset', 'onUndo'], $class);
	
	// Storing class as data in image element
	$img.data('mwImgEd', $class);

	// Autorun if options set
	if ( !isEmpty($options) )
		$class.edit();
	
	return $class; 
	
} //CONSTRUCTOR mwImgEd
