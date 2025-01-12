function esSubmitFilter($el) {

	$el		= _jq($el);

	// DOM
	var $jForm	= $el;
	var $jWidget	= $el.closest('.mwPageBlock');
	var $jContents	= $el.closest('.blockContents');

	// Reloading entire widget
	mwAjax('/ajax/eshop/', $jForm, false)
	
		.content( $jContents )
		
		.success( function ($data) {

		/*/	
			// Tricky manual liveEd reinitialization. Currently not working properly.
			// ToDo: Should be properly implemented on liveEd side together with ajax reloader.
			if ( mwLiveEd ) {

				setTimeout( function () {
	
					var $el		= $jWidget;
					var $wgt	= mwLiveEd.getWidget($el); 
	
					$wgt.initBlock($el);
	
					mwPageArea.update($wgt.Area);
				
					// Initializing liveEd within contents
					mwLiveEd.init($el);
	
					mwResponsive.updateRowsData();
	
				}, 10 );

			} //IF liveEd present
		/**/	
				
		}) //FUNC mwAjax.success
		
	; //mwAjax

	return false;
	
} //FUNC esSubmitFilter

function esResetFilter($el) {
	
	// DOM
	var $jForm	= _jq($el);

	// Tricky clearing: should clear only filter, but keep everything else
	// For this - reading form, replacing filter with empty object, and setting as values.
	var $data	= $jForm.asArray();	

	$data.filter	= {};

	$jForm.fromArray($data);

	// Resubmitting filter
	esSubmitFilter($el);

	// Done

	return false;
	
} //FUNC esResetFilter