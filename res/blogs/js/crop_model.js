var mwCrop = {
	
	items_ids_list	: [], // array of ids to make img croppable
	
	init		: function() {
		
		var $this = this;
		
		//remove old images (for ajax load)
		jQuery('.blogs-post-crop-icon').remove();
		
		jQuery.each(this.items_ids_list, function(i){
			
			//var $i = jQuery('#' + $this.items_ids_list[i]);
			var $i = jQuery('[data-crop-sn=' + $this.items_ids_list[i] + ']');
			//___($i);
			var run_crop = function(e) {
				
				mwLiveEd.toggle(false);
				mwLiveEd.noResize = true;
				
				var $ed = mwImgEd($i, {
				//	'debug'		: true,
					'zoomValue'	: 1,
					'modal'		: true,
					'overlay'	: false,
					'resizeOn'	: 'y',
				//	'resizeOn'	: false,
				})
				.onSave( function () {
						
						//___(this.queryStr);
						//$this.Data.pwidth	= Math.round($this.Data.pwidth);
						//$this.Data.ewidth	= Math.round(this.x.wrapSize);
						//$this.Data.eheight	= Math.round(this.y.wrapSize);
						
						var $data = {};
						
						$data['id'] = $this.items_ids_list[i];
						$data['crop'] = this.queryStr;
						
						mwAjax('/site/ajax/blogs/cropcontroller/saveCropDB', $data, false)
							.go()
							.success( function($data) {
								
								___('imged crop save done');
								
							} )
							.error( function() {
								
								___('imged crop save error');	
								
							} )
						; // mwAjax
						
					}
				) //FUNC onSave
				.onAfterSave( function () {
	
						// Finalizing dimensions
						// ToDo: autodetect if necessary in imgEd
						this.onResize();
						
						mwLiveEd.toggle(true);
						mwLiveEd.noResize = false;
						
					}
				) //FUNC onAfterSave
				; // $ed
				
			};
			
			//check is current image local
			var isLocal = false;
			if ( $i.attr('src').indexOf('://') == -1 ) {
				
				//this is local url
				isLocal = true;
				
			}
			else {
				
				var url = new URL($i.attr('src'));
				
				//local url
				if ( location.host == url.host )
					isLocal = true;
				
			}
			
			//if local url
			if ( isLocal ) {
				
				var btn = jQuery('<div class="blogs-post-crop-icon"></div>'); 
				$i.before(btn);
				btn.click(run_crop);
				//setTimeout( function() { btn.css('left', $i.width() - 35); btn.css('top', 35); }, 100);
				$i.load( function() { btn.css('left', $i.width() - 35); btn.css('top', 35); } );
				
				$i.off('dblclick').on('dblclick', run_crop);
				
			}
			
		});
	},
	
	/** //** ----= add_items	=------------------------------------------------------------------------------\**//** \
	*
	*	Add ids of items to list
	* 			
	* 	@param	array	items	- items must be array of text ids
	* 
	*	@return	nothing
	*
	\**//** -------------------------------------------------------------------= by Alex @ Morad Media Inc. =------/** //**/
	
	add_items	: function(items) {
		
		jQuery.each(items, function(i){
			
			//___(this, i, items[i]);
			
			if ( mwCrop.items_ids_list.indexOf(items[i]) == -1 )
				mwCrop.items_ids_list.push(items[i]);
			
		});
	},
	
	
	
} // OBJ mwCrop

jQuery( function () {
	
	if ( typeof mwData != "undefined" ) {
		
		mwCrop.init();
		
	}
	
});