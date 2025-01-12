jQuery.fn.mwDirectory = function ($options) {

	if ( !this.length )
		return;

	return this.data('mwDirectory').set($options);

} //func mwDirectory

var mwDirectory		= function ($el, $options) {

return vEventObject(['onInit', 'onSubmit', 'onAfterSubmit', 'onUpdate'], {

	dom			: {					// Set of interesting dom elements

		container		: false,			//  Directory container

	}, //dom

	options				: '',				// Options pass through
	subFilters			: {},				// Filters to apply on directory list
	xtoken				: '',				// Security token

	set     : function ($option, $value) {

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


	init			: function () {

		var $this	= this;

		$el = _jq($el);

		$this.set($options);

		$el.data('mwDirectory', $this);

		// Looking for interesting elements on page
		$this.dom.container	= $el;

		$this.initDom();
		$this.initEvents();

		// Initializing filters

		if ( typeof mwFilters != 'undefined' && mwFilters )
			mwFilters($el, {
				onSubmit	: function ( $filters ) {

					// Storing filters in self
					$this.subFilters	= $filters;

					// Issuing directory update
					$this.update();

				}, //submit
			});

		// Calling events
		$this.onInit($this);

		return $this;

	}, //FUNC init

	initDom		: function () {

		var $this	= this;

		//	$this.dom.refresh       = $this.dom.container.find('.mwDirectory-refresh');

	}, // initDom

	initEvents	: function () {

		var $this	= this;

		$this.dom.container.find('.mwDirectory-update')
			.on('click.directory', function ($e) {

				$this.update();

				return false;

			}); //FUNC onClick update

	}, // initEvents

	initDom		: function () {

		var $this	= this;

		//	$this.dom.refresh       = $this.dom.container.find('.mwDirectory-refresh');

	}, // initDom

	update		: function () {

		var $this		= this;

		var $vars		= {};

		$vars.options		= $this.options;
		$vars.xtoken		= $this.xtoken;
		$vars.subFilters	= $this.subFilters;

		//triggering event - allow to cancel base update
		if ( $this.onUpdate($vars) === false )
			return false;

		$this.submit($vars);

		return false;

	}, //FUNC update

	submit		: function ($vars) {

		var $this		= this;

		//triggering event - allow to cancel base submit
		if ( $this.onSubmit($vars) === false )
			return false;

		mwAjax('/ajax/directory/update', $vars)

			.success( function ($res) {

				/*/

		var newContent = jQuery($res.content);
		newContent.find('.mwMapDummy').replaceWith(jQuery('.mwDirectoryMap'));

		//find doesnt work in newContent
		console.log(newContent, newContent.find('.mwMapDummy'));

		//replace existing container with new (prevent double ajax request)
		$this.dom.container.html(newContent);

	    /*/

				//is map on page somewhere
				if (jQuery('.mwDirectoryMap').length > 0) {

					//store existing map to temporary variable
					// how to store exact map ???? there couple be multiple maps theoretically ????
					var tmpDirectoryMap = jQuery('.mwDirectoryMap');

					//store map global object
					//var tmpDirectoryMapData = tmpDirectoryMap.mwGoogleMap();
					var tmpDirectoryMapData = jQuery('.mwDirectoryMap').data('mwGoogleMap');

				}//map on page

				// replace existing container with new (prevent double ajax request)
				$this.dom.container.html($res.content);

				/**/

				//is map on page somewhere
				if (typeof tmpDirectoryMapData != 'undefined') {

					//update map with new markers data
					var $markersData = JSON.parse(jQuery('.mwMapDummy').html());

					//replace dummy div to existing map
					jQuery('.mwMapDummy').replaceWith(tmpDirectoryMap);

					//readd google map global object
					//jQuery('.mwDirectoryMap').data('mwGoogleMap', tmpDirectoryMapObj);
					jQuery('.mwDirectoryMap').data('mwGoogleMap', tmpDirectoryMapData);

					//update markers data
					jQuery('.mwDirectoryMap').mwGoogleMap().data = $markersData;

					//update map with new markers
					jQuery('.mwDirectoryMap').mwGoogleMap().updateMarkers();

				}//map on page

				/**/
				//should we do reinit instead ????
				$this.init();

				/**/

				/*
	    $this.initDom();

	    $this.initEvents();
	    */

				$this.onAfterSubmit($res);

			}) //FUNC onSuccess

			.error(function ($data) {

			}) // func error

			.go();

		return false;

	}, //FUNC submit

}).init();}; //CLASS



