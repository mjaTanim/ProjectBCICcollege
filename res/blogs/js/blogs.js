
var mwPostEd = {
	
	/* ---- jQuery shortcuts ---- */	
	
	windowId		: 'wPostEd',			// Editor window ID
	window			: false,			// Editor window object
	
	postEdit		: false,			// Specal flag for Access Ping process
	
	dom			: {},				// Stores interesting window elements
	
	Defaults		: {
		
		is_news	: 0,
		
	},
	
	/* ---- Init ---------------------------------------------------------------------------------------------------------------- */
	
	initDom		: function () {
		
		var $this = this;
		
		// Creating shortcuts to window and it's body
		$this.window		= mwWindow($this.windowId);
		$this.dom.body		= $this.window.Body;
		
		// Defining complete element prefix
		var $pfx		= $this.windowId+'_';
		
		// Looking for special elements in entire window 
		$this.window.Window.find('[id^='+$pfx+']').each( function () {
			
			var $el		= jQuery(this);
			
			// Cutting element name from ID
			var $name	= this.id.substr($pfx.length); 

			// Adding class marker to these items
			$el.addClass($name);

			// Storing it as part of DOM set
			$this.dom[$name] = $el;
			
		}); //FUNC each.id
		
		// Reordering element for fast debug
		// For this - recreating object in order
		var $keys	= Object.keys($this.dom).sort();
		var $tmp	= {};
		
		for ( var $i in $keys )
			$tmp[ $keys[$i] ] = $this.dom[$keys[$i]];
		
		// Resaving back in dom
		$this.dom = $tmp;

		//___(this.dom);
		
	}, //FUNC initDom
	
	initDimensions		: function () {
		
		var $this = this;
		
		// Maximum content width. Browser width and some white space on sides
		var $maxWidth		= jQuery(window).width() - 80;
		
		// Setting body width
		$this.dom.body.width($maxWidth);
		
	}, //FUNC initDimensions
	
	init		: function () {

		var $this = this;
		
		//init counters once
		if ( !$this.meta_title_counter ) {
			
			$this.meta_title_counter = mwTextLengthCounter('#w_wPostEd [name=meta_title]', '#w_wPostEd .meta-title-counter');
			$this.meta_title_counter.min = 10;
			$this.meta_title_counter.max = 60;
			$this.meta_description_counter = mwTextLengthCounter('#w_wPostEd [name=meta_description]', '#w_wPostEd .meta-description-counter');
			$this.meta_description_counter.min = 100;
			$this.meta_description_counter.max = 160;
			
		}//init counters
		
		if ( $this.window ) return;
		
		$this.initDom();
		//$this.initDimensions();
		$this.hidePanel();
		
		$this.Form = jQuery('#mwPostEd_form');
		$this.TabsControl = jQuery('#mwPostEd_toolsRight');
		$this.PostContent = jQuery('.mwPostEd_PostContent');
		$this.Tabs = jQuery('.mwPostEd_Tabs');
		$this.hideTabsButton = this.TabsControl.find('td[rel=hideTabs]');
		$this.TagTitleInput = jQuery('#tagsFilterPostEd');
		
		if ( mwData.show_post_id ) {
			
			setTimeout(function(){ mwPostEd.edit(mwData.show_post_id); }, 500);
			
		}
		
		$this.Form.find('.datepicker_icon').click( function(event) {
			//___(this);
			//mwPostEd.Form.find('.name-published_date input').click();
			jQuery(this).closest('dd').find('input[type=text]').click();
			
		 } );
		
		jQuery('select[name=header_select]').change(function(e){
			
			var el = jQuery(this);
			if ( el.val() == 'none' ) {
				
				jQuery('.header-row').hide();
				
			} else if ( el.val() == 'single' ) {
				
				jQuery('.header-row').hide();
				jQuery('.header-row.single').show();
				
			} else if ( el.val() == 'gallery' ) {
				
				jQuery('.header-row').hide();
				jQuery('.header-row.gallery').show();
				
			}
			
		})
		
		
		
		return false;
		
		
	}, //FUNC init
	
	initAccessPing	: function() {
		___('initAccessPing');
		var $this = this;
		
		//check is access icon enabled
		if ( mwData.accessIcon && $this.ID ) {
			
			var doPing = function() {
				
				mwAjax('/site/ajax/blogs/accessPing/' + $this.ID, null, false )
					.go()
					.success( function($data) {
						//___($data);
						if ( typeof($data.content) != 'undefined' ) {
							
							
							//check is there are some other users in same post
							if ( $data.content.accessUsers ) {
								
								___('we have some users', $data.content.accessUsers);
								$this.accessInfo = $data.content.accessUsers;
								
								$this.showAccessInfo(false);
								
								jQuery('#accessIcon').css('background-image', "url('/res/blogs/images/block-user-red.svg')");
								
							}//there are other users in same post
							else {
								___('no access users');
								$this.accessInfo = [];
								
								//clean up messages
								mwState(false, 'wPostEd');
								
								jQuery('#accessIcon').css('background-image', "url('/res/blogs/images/block-user-grey.svg')");
								
							}//no users
							
							___($data.content);
							
						} else {
							
							___('no data');
							return false;
							
						}
					} );
				
			}//FUNC doPing
			
			//access icon config value should store period in seconds
			var timer = mwData.accessIcon;
			
			//do 1st ping without delay
			doPing();
			
			//loop function
			(function myLoop() {
				
				//prevent double run
				if ( $this.loopTimer ) clearTimeout($this.loopTimer);
				
				$this.loopTimer = setTimeout( function() {
					
					//make ping call
					doPing();
					
					//continue
					if ( $this.postEdit ) myLoop();
					
				}, timer * 1000)
				
			})(); 
			
		}//access icon enabled
		
	}, //FUNC initAccessPing
	
	showAccessInfo	: function(asPopup = false) {
		
		var $this = this;
		
		if ( $this.accessInfo.length ) {
			
			var spl = '';
			var t = '';
			for ( i in $this.accessInfo ) {
				
				t += spl + '<b>' + $this.accessInfo[i].email + '</b>';
				spl = ', ';
				
			}
			
			if ( !asPopup ) {
				
				//mwState( mwError('User(s) editing this post: ' + t), 'wPostEd')
				
			}
			else
				mwConfirmation( function() { mwWindow('systemConfirmation').hide(); }
				, 'User(s) viewing this post: ' + t);
			
		}
		
		
	}, //FUNC showAccessInfo
	
	showUsersInPost	: function(post_id = 0) {
		
		var $this = this;
		
		if ( !post_id ) return;
		
		mwAjax('/site/ajax/blogs/accessPing/' + post_id, null, false )
			.go()
			.success( function($data) {
				//___($data);
				if ( typeof($data.content) != 'undefined' ) {
					
					
					//check is there are some other users in same post
					if ( $data.content.accessUsers ) {
						
						___('we have some users', $data.content.accessUsers);
						$this.accessInfo = $data.content.accessUsers;
						
						$this.showAccessInfo(true);
						
						
						
					}//there are other users in same post
					else {
						___('no access users');
						$this.accessInfo = [{'email' : 'None! Update active User by <a href="">refreshing</a> the page.'}];
						
						$this.showAccessInfo(true);
						
					}//no users
					
					___($data.content);
					
				} else {
					
					___('no data');
					return false;
					
				}
			} );
		
	}, //FUNC showUsersInPost
	
	edit		: function (id, open_drafts = 0) {
		
		var $this = this;
		
		//clean up messages
		mwState(false, 'wPostEd');
		
		//clean up icon
		jQuery('#accessIcon').css('background-image', "url('/res/blogs/images/block-user.png')");
		
		$this.postEdit = true;
		
		$this.init();
		
		//init access ping script
		$this.initAccessPing();
		
		$this.hidePanel();
		
		$this.window.maximized = true;
		//___($this.window);
		$this.window.show();
		
		//?
		mwPostEd.Form.get(0).reset();
		
		// clear temporary selected tags
		mwPostEd.checked_tags = [];
		
		$this.tiny4_body = jQuery('.mwPostEd_PostContent iframe').off('keyup');
		$this.post_title = mwPostEd.Form.find('input[name=title]').off('keyup');
		
		$this.post_title.off('change').change( function(e) {
			
			if ( mwPostEd.Form.find('input[name=alias_custom]').val() != '1' )
				mwPostEd.Form.find('input[name=alias]').val( $this.post_title.val() )
			 
		} );
		
		$this.alias_input = mwPostEd.Form.find('input[name=alias]').off('keyup').keyup( function(e) {
			
			$this.post_title.off('change');
			mwPostEd.Form.find('input[name=alias_custom]').val('1');
			$this.checkAliasValid(this);
			
		} );
		
		$this.unpublish_start = false;
		
		jQuery('.publish-on-soc-button').show();
		jQuery('.publish-on-soc-success').hide();
		//jQuery('#mwPostEd_form .mce-tinymce').height(517);
		//jQuery('#mwPostEd_form #tinyPostEditor_ifr').height(453);
		jQuery('.socials-custom-wrapper').hide();
		
		delete mwData.temp_thumb_name; // remove temporary pictures names
		delete mwData.temp_banner_name;
		
		var slider_internal_option = jQuery('#mwPostEd_form select[name=slider_gallery] option#internal');
		
		//clear error hightlight for tabs controls
		mwPostEd.Form.find('.mwWinTabs .error').removeClass('error');
		
		//for kind select category for new and existing posts - hide categories section and rename tab to TAGS
		/*
		if ( mwData.kind_category_id ) {
			
			//$this.Tabs.find('#wPostEdCategories').hide();
			$this.TabsControl.find('td[rel=postCategoriesTags]').html('Tags');
			//make tags block full width
			//$this.Tabs.find('#wPostEdTags').removeClass('cell-even');
			
		} else {
			
			//$this.Tabs.find('#wPostEdCategories').show();
			$this.TabsControl.find('td[rel=postCategoriesTags]').html('Categories');
			//make tags block half width
			//$this.Tabs.find('#wPostEdTags').addClass('cell-even');
			
		}
		*/
		
		if ( !id ) {
			
			slider_internal_option.hide().val('none');
			
			mwPostEd.Form.fromArray(this.Defaults);
			mwWindow('wPostEd').Title('Add New Post').show(
				
				function() { mwPostEd.resetTabs(); }
				
			);
			this.ID = 0;
			mwPostEd.refreshCategoriesSelect();
			mwPostEd.refreshTagsSelect();
			mwPostEd.doDemoThumb();
			
			jQuery('td[rel=postHistory]').hide();
			
			if ( mwPostEd.live ) {
				
				var page = [];
				page['published'] = 1; // for live Ed new post published by default 
				mwPostEd.Form.fromArray(page);
				mwPostEd.publishSwitch(1, true);
				
			} else
				mwPostEd.publishSwitch(0);
			
			mwPostEd.unpublishSwitch();
			
			mwPostEd.secondarySwitch();
			
			//for kind select category by default for new post
			if ( mwData.kind_category_id ) {
				
				$this.Form.find('#postEdCategoriesList .item>input[value=' + mwData.kind_category_id + ']').click();
				
			}
			
			return false;
			
		}
		
		this.ID = id;
		
		//regualr load from cache
		//var page = mwData.Posts[id];
		
		//try to load from last loaded via ajax post
		if ( mwPostEd.lastAjaxPost )
			page = mwPostEd.lastAjaxPost
			
		//___(id, page);
		if ( !page ) { //page is not loaded
			
			mwAjax('/site/ajax/blogs/getPostListDB/' + id + '/0/0', null, true )
			.go()
			.success( function($data) {
				//___($data);
				if ( typeof($data.content) != 'undefined' ) {
					
					mwData.Posts[id] = $data.content[id];
					mwPostEd.lastAjaxPost = $data.content[id];
					mwPostEd.edit(id, open_drafts);
					
				} else {
					
					return false;
					
				}
			} );
			
			return false;
			
		}
		else { //page is loaded
			
			//we need to clear last ajax post
			mwPostEd.lastAjaxPost = false;
			
		} //page is loaded
		
		// set value for internal gallery (if exist)
		if ( page.slider_gallery_internal != 0 ) {
			
			slider_internal_option.show().val(page.slider_gallery_internal);
			
		} else {
			
			slider_internal_option.hide().val('none');
			
		}
		
		// Resetting form
		mwPostEd.Form.fromArray(page);
                
                // store prev custom values for marge on save - dont lose empty file inputs data
		mwPostEd.Form.find('input[name=prev_custom_fields]').val(JSON.stringify(mwData.Posts[id].custom_fields));
		//__(JSON.stringify(mwData.Posts[id].custom_fields));
                
		mwWindow('wPostEd').Title('Edit post (<span>' + page.title + '</span>)').show(
			
			function() { mwPostEd.resetTabs(id); /*mwWindow('wPostEd').adjustHeights(); mwWindow('wPostEd').align();*/ }
			
		); // mwWindow
		
		var show_current_unsaved = function(event) {
			
			if ( id ) { // dont run for new posts
			
				mwPostEd.CurrentUnsaved_text = mwPostEd.tiny4_body.contents().find('body').html();
				mwPostEd.CurrentUnsaved_title = mwPostEd.post_title.val();
				
				mwPostEd.doHistoryTab();
				
				if ( $this.CurrentUnsaved )
					if ( mwPostEd.CurrentUnsaved_text != mwData.Posts[id].content || mwPostEd.CurrentUnsaved_title != mwData.Posts[id].title  ) {
					
						$this.CurrentUnsaved.show();
						//$this.CurrentUnsaved.change();
						//jQuery('#postHistory div.Item').removeClass('Selected');
						//jQuery('#postHistory div.Item:has(input[value=edited])>div').addClass('Selected');
						//jQuery('#postHistory div.Item:has(input[value=edited])').mouseup();
						
					} else {
						
						$this.CurrentUnsaved.hide();
						//$this.LastSaved.show().change();
						//jQuery('#postHistory div.Item').removeClass('Selected');
						//jQuery('#postHistory div.Item:has(input[value=saved])>div').addClass('Selected');
						//jQuery('#postHistory div.Item:has(input[value=saved])').mouseup();
						
					}
			}
		};
		
		jQuery('td[rel=postHistory]').show();
		
		mwPostEd.CurrentUnsaved_text = mwData.Posts[id].content;
		mwPostEd.CurrentUnsaved_title = mwData.Posts[id].title;
		
		$this.tiny4_body.contents().find('body').keyup(show_current_unsaved);
		$this.post_title.keyup(show_current_unsaved);
		
		mwPostEd.refreshCategoriesSelect(id);
		mwPostEd.refreshTagsSelect(id);
		mwPostEd.doDemoThumb(id);
		mwPostEd.publishSwitch(mwData.Posts[id].published);
		
		mwPostEd.unpublishSwitch();
		
		mwPostEd.secondarySwitch();
		
		//reset counters
		$this.meta_title_counter.reset();
		$this.meta_description_counter.reset();
		
		//add href for links with same class as custom field name in custom tabs
		if ( typeof page.custom_fields != 'undefined') {
			
			for(var i in page.custom_fields) {
			
				mwPostEd.Form.find('#postCustom a.' + i).attr('href', page.custom_fields[i]);
			
			}
			
		}//loop custom fields
		
		//store last opened post data
		$this.post_data = page;
		
		//open drafts tab if requested
		if ( open_drafts ) mwPostEd.Form.find('[rel=postHistory]').click();
		
		return false;
		
	}, //FUNC edit
	
	showPanel	: function ($el) {
		
		var $this = this;
		
		$this.dom.panel.removeClass('hidden');
		
		if ( jQuery($el).attr('rel') == 'postHistory' )
			mwPostEd.doHistoryTab($this);
		
		mwSwitchTab($el, false, false);
		
	}, //FUNC showPanel
	
	hidePanel	: function () {
		
		var $this = this;
		
		$this.dom.panel.addClass('hidden');
		
		mwSwitchTab($this.dom.hidePanel, false, false);
		
	}, //FUNC showPanel
	
	deletePost	: function(id) {
		
		mwConfirmation( function() {
			
			var data = {};
			
			//check is current category exist (if no - there are no category filter, this means its filtered by kind)
			var cur_cat = mwCategoryEd.getCurrentFilterCategoryID();
			if ( cur_cat ) {
				
				data.filter_by_category_id = cur_cat;
				
			} else {
				
				data.filter_by_category_id = mwData.kind_category_id;
				data.kind_category_id = mwData.kind_category_id;
				
			}
			
			mwAjax( '/site/ajax/blogs/deletePostDB/' + id, data, 'systemConfirmation' )
			.content()
			.success( function($data) {
				
				mwPostEd.manualOrder_sort();
				mwWindow('systemConfirmation').hide();
				
			} );									
		}
		, 'Delete Post: ' + mwData.Posts[id]['title'] + '?');
		
	}, //FUNC deletePost
	
	open_gallery	: function(type, gallery_id) {
		
		var id = this.ID;
		var $this = this;
		
		var options = {}
		var show_selector = false;
		
		if ( type == 'thumb' || type == 'banner' ) {
			
			options = {
				
				'Apply' : {
				
				'class'  : 'hi',
				'action' : function ($file) {
							
						//__(type, $file);
						if ( isEmpty($file) ) return;
						
						jQuery('input[name=' + type + ']').val($file['id']);
						mwData['temp_' + type + '_name'] = $file['base'] + '.' + $file['ext'];
						mwPostEd.doDemoThumb(id);
						
					} //FUNC setActions.apply.action
				}
			}
			
			show_selector = true; // need to have selector on thumb/banner choosing
			
		}
		
		if ( type == 'og_image' ) {
			
			options = {
				
				'Apply' : {
				
				'class'  : 'Hi',
				'action' : function ($file) {
							
						//___(type, $file);
						if ( isEmpty($file) ) return;
						
						
						$this.Form.find('[name=og_image]').val( location.protocol + '//' + location.host + $file.__thumb); 
						
					} //FUNC setActions.apply.action
				}
			}
			
			show_selector = true;
			
		}
		
		//file id false by default
		var file_id = false;
		
		if ( !jQuery.isNumeric(gallery_id) ) {
			
			//for new post there are no post data
			if ( typeof $this.post_data == 'undefined' ) {
				
				gallery_id = false;
				
			}//new post
			else {//existing post
				
				//use internal post gallery as default
				gallery_id = $this.post_data.slider_gallery_internal;
				
			}//existing post
			
		}
		
		//not new post
		//post already have some file selected in some gallery
		if ( typeof $this.post_data != 'undefined' && jQuery.isNumeric($this.post_data.thumb) ) {
			
			//clean up gallery id - let gallery to find itself
			gallery_id = false;
			
			//provide gallery with selected file id
			var file_id = $this.post_data.thumb
			
		}
		
		//___('show_selector', show_selector);
		mwFilesEd.galleriesSelector = show_selector;
		mwFilesEd
		.setActions( options ) //OBJECT mwFilesEd.setActions.actions
		.load(gallery_id, file_id);
		//___('mwFilesEd.galleriesSelector', mwFilesEd.galleriesSelector);
	}, //FUNC open_gallery
	
	open_selected_gallery	: function() {
		
		var gallery_id = jQuery('select[name=slider_gallery]').val();
		
		this.open_gallery('', gallery_id);
		
	}, //FUNC open_selected_gallery
	
	savePost	: function () {
		
		if ( mwData.saveSecureValidation )
			
			//run save secure validation
			mwPostEd.validateSecureSave(mwPostEd.save);
			
		else {
			
			mwPostEd.save();
			
		}
			
	}, //FUNC savePost
	
	save	: function (dont_hide) {
		
		var $this = this;
		
		//post is closing
		$this.postEdit = false;
		___('save', $this.postEdit);
		mwPostEd.tags_temp = mwData.Tags;
		delete mwData.Tags;
		if ( mwPostEd.ID ) {
			
			delete mwData.Posts[mwPostEd.ID].tag_selected;
			mwPostEd.post_tags_temp = mwData.Posts[mwPostEd.ID].tag_selected;
		
		}
		
		if (mwData.Archive && mwData.Archive[mwPostEd.ID] === null) delete mwData.Archive[mwPostEd.ID];
		
		//check is current category exist (if no - there are no category filter, this means its filtered by kind)
		var cur_cat = mwCategoryEd.getCurrentFilterCategoryID();
		if ( cur_cat ) {
			
			mwPostEd.Form.find('input[name=filter_by_category_id]').val( cur_cat );
			
		} else {
			
			mwPostEd.Form.find('input[name=filter_by_category_id]').val( mwData.kind_category_id );
			mwPostEd.Form.find('input[name=kind_category_id]').val( mwData.kind_category_id );
			
		}
		
		var alias_new = jQuery('#mwPostEd_form').find('input[name=alias]').val();
		
		//clear error hightlight for tabs controls
		mwPostEd.Form.find('.mwWinTabs .error').removeClass('error');
		
		___('save start');
		mwAjax('/site/ajax/blogs/savePostDB', '#mwPostEd_form', 'wPostEd')
			.go()
			.success( function($data) {
				___('save success');
				if ( mwPostEd.live ) {
					
					var uri = window.location.pathname.split('/');
					var alias_old = uri[uri.length - 1];
					
					if ( alias_old == alias_new ) {
						
						mwPostEd.liveCallback($data.block);
						mwWindow('wPostEd').hide();
						
					} else {
						
						//___(alias_old, alias_new, window.location);
						var pre_slash = '/';
						if ( !uri[0] ) pre_slash = '';
						uri[uri.length - 1] = alias_new;
						var path = uri.join('/');
						var new_url = window.location.origin + pre_slash + path;
						window.location = new_url;
						
					}
					
				} else {

					//if ( $data.fb_publishing == 'fail' ) mwState( mwError('FB publishing fail!')); 
					
					if ( !dont_hide ) {
						
						mwPostEd.resetTabs();
						mwWindow('wPostEd').hide();
						
					} else {
						
						//jQuery('.publish-on-soc-button').hide();
						jQuery('.publish-on-soc-success').show();
						setTimeout( function() {mwState( mwSuccess('Social Posting Complete'), 'wPostEd' )}, 10);
						
					}
					
					mwPostEd.manualOrder_sort();
					
				}
			} )
			.error( function($data) {
			
				//___('save error', $data);
				
				mwData.Tags = mwPostEd.tags_temp;
				if ( mwPostEd.ID )
					mwData.Posts[mwPostEd.ID].tag_selected = mwPostEd.post_tags_temp;
				
				//check is data contain validation and post editor form
				if ( typeof $data._validations != 'undefined' && typeof $data._validations.mwPostEd_form != 'undefined' ) {
					
					//loop all validation items and highlight tabs
					for( var i in $data._validations.mwPostEd_form ) {
						
						//get the input tab id
						var tab_id = jQuery(mwPostEd.Form.find('[name=' + i + ']')).parents('.tabs-container').attr('id');
						
						//check is current input in some tab
						if ( tab_id != undefined ) {
							
							//add error class to highlight tab with validation error input
							mwPostEd.Form.find('.mwWinTabs [rel=' + tab_id + ']').addClass('error');
							
						}
					}
				}
				
			} )
		; // mwAjax
		___('save end');
	}, //FUNC save
	
	saveDraft	: function () {
		
		if ( mwData.saveSecureValidation )
			
			//run save secure validation
			mwPostEd.validateSecureSave(mwPostEd.saveDraft_origin);
			
		else {
			
			mwPostEd.saveDraft_origin();
			
		}
			
	}, //FUNC saveDraft
	
	saveDraft_origin : function () {
	
		//jQuery('#mwPostEd_form .published_now input').click();
		mwPostEd.Form.find('[name="publish_button"]').remove();
		mwPostEd.save(false);
		mwWindow('systemConfirmation').hide();
			
	}, //FUNC saveDraft
	
	PublishNow	: function (dont_hide) {
		
		if ( mwData.saveSecureValidation )
			
			//run save secure validation
			mwPostEd.validateSecureSave(mwPostEd.PublishNow_origin);
			
		else {
			
			mwPostEd.PublishNow_origin();
			
		}
		
	}, //FUNC PublishNow
	
	PublishNow_origin : function (dont_hide) {
		
		//jQuery('#mwPostEd_form .published_now input').click();
		mwPostEd.Form.append('<input type="hidden" name="publish_button" value="1"/>');
		mwPostEd.save(dont_hide);
		mwWindow('systemConfirmation').hide();
		
	}, //FUNC PublishNow
	
	validateSecureSave : function (callback) {
		
		var post_id = this.ID;
		
		//validate only existing post
		if ( post_id ) {
			
			___('validateSecureSave - post id: ' + post_id);
			
			mwAjax('/site/ajax/blogs/checkSaveSecureValidation/' + post_id, null, true )
				.go()
				.success( function($data) {
					//___($data);
					if ( typeof($data.content) != 'undefined' ) {
						
						//var current_data = $data.content[post_id];
						var current_data = $data.content;
						___('current_data', current_data.date, current_data.user_id);
						___('post data', mwData.Posts[post_id].date, mwData.Posts[post_id].user_id);
						
						//post saved by other user - warning!
						if ( current_data.date != mwData.Posts[post_id].date ) {
							
							___('post saved by other user - warning!');
							
							var $new_tab = '<a href="/site/blogs/" onclick="document.getElementById(\'open_post_in_new_tab\').submit(); return false;">view the latest saved post in a new tab.</a>';
							$new_tab += '<form target="_blank" action="/site/blogs/" method="post" id="open_post_in_new_tab"><input type="hidden" name="show_post_id" value="' + post_id + '"/></form>';
							
							mwConfirmation( function() { callback(); }
							//, ' Post Saved by other User at ' + current_data.date + ' (' + current_data.login + '|' + current_data.email + '): you may overwrite content! Proceed?');
							, ' Caution! The post was recently modified by ' + current_data.login + '|' + current_data.email + ' on '  + current_data.date +  '. If you continue, your changes will overwrite theirs. Click save to overwrite or ' + $new_tab);
							
						}
						else {//post safe to save
							
							callback();
							
						}
						
					} else {
						
						return false;
						
					}
					
				} );
				
		}//existing post
		else {//new post - ignore validation
		
			___('validateSecureSave - new post - ignore!');
			callback();
			
		}//new post
		
	}, //FUNC validateSecureSave
	
	closePost	: function() {
		
		var $this = this;
		
		//post is closing
		$this.postEdit = false;
		
	}, //FUNC closePost
	
	UnPublishNow	: function () {
		
		this.unpublish_start = true;
		mwPostEd.publishSwitch(0);
		mwPostEd.Form.find('.unpublished_now input').click();
		
	}, //FUNC UnPublishNow
	
	resetTabs	: function (id) {
		
		return false;
		
		/*
		this.tabsWidth = this.TabsControl.width();
		this.contentWidth = jQuery('#mwPostEd_toolsLeft').width();
		this.basePadding = this.TabsControl.outerWidth() - this.tabsWidth;
		___(this.tabsWidth, this.contentWidth, this.basePadding);
		
		mwSwitchTab(mwPostEd.hideTabsButton);
		// Total width: content min width (with scroll):700 + tabs:450
		mwPostEd.PostContent.css('margin-right', '0px').width( this.tabsWidth + this.contentWidth + this.basePadding * 1.5 ); //1145 1079
		mwPostEd.Tabs.width(0);
		//mwPostEd.hideTabsButton.hide();
		
		//mwWindow('wPostEd').Body.width(mwWindow('wPostEd').Body.width());
		*/
		
	}, //FUNC resetTabs
	
	refreshCategoriesSelect	: function (id) {
		
		var $sel = jQuery('.name-categories_list');
		
		//there are no categories list for kind posts
		if ( $sel.length > 0 ) {
			
			$o = {};
			$k = {};
			for ( var $i in mwData.Categories ) {
				
				if ( mwData.nav_list[ mwData.Categories[$i]['title'].toLowerCase() ] != undefined ) {
					
					$k[ mwData.Categories[$i].id ] = '* ' + mwData.Categories[$i].title;
			
				}
				else {
					$o[ mwData.Categories[$i].id ] = mwData.Categories[$i].title;
				}
			}
			
			$selected = null;
			if ( id ) $selected = mwData.Posts[id].category_selected
			
			//add 'id' prefix to selected list
			if ( $selected != null )
				for(var $i in $selected) $selected[$i] = 'id' + $selected[$i];
			
			//loop selected to move on top
			for (var $i in $selected) {
				
				//ignore some trash categories
				if ( typeof($o[$selected[$i]]) != 'undefined' ) {
					
					//add selected item to list
					$k[$selected[$i]] = $o[$selected[$i]];
					
					//remove selected item from list
					delete($o[$selected[$i]]);
					
				}//real category
				
			}//loop selected
			
			//apply all items to list
			for (var $i in $o) $k[$i] = $o[$i];
			
			//generate select ordered by title
			//___($sel, $o, $selected, $k, jQuery.extend({}, $k, $o));
			mwUpdateSelector($sel, $k, $selected);
			
			//remove id prefix from values
			jQuery('.name-categories_list .item input').each(function(i){
				
				var el = jQuery(this);
				el.val(el.val().substring(2));			
												
			});
									
			mwCategoryEd.doFilterCategories( mwCategoryEd.catInputPostEd, jQuery('#postEdCategoriesList .Item'), '.title' ); // add filter
			mwCategoryEd.catInputPostEd.keyup( function() { mwState(false, 'wPostEd'); jQuery('.name-categoriesFilterPostEd').removeClass('error'); } )
			
		}
		
	}, //FUNC refreshCategoriesSelect
	
	refreshTagsSelect	: function (id, selected) {
		
		/*
		$o = {};
		for ( var $i in mwData.Tags )
			$o[$i] = mwData.Tags[$i].title;
		
		$selected = null;
		if ( id ) $selected = mwData.Posts[id].tag_selected
		
		var $sel = jQuery('.name-tags_list');
		mwUpdateSelector($sel, $o, $selected);
		
		mwCategoryEd.doFilterCategories( mwPostEd.TagTitleInput, jQuery('#postEdTagsList .Item'), '.title' ); // add filter
		mwPostEd.TagTitleInput.keyup( function() { mwState(false, 'wPostEd'); jQuery('.name-tagsFilterPostEd').removeClass('error'); } )
		*/
		
		$selected = null;
		
		$o = {};
		
		if ( mwData.ShowAllTagsInPostEd ) {
			for ( var $i in mwData.Tags )
				$o[ mwData.Tags[$i].id ] = mwData.Tags[$i].title;
			
		}
		
		if ( id ) {
			//___(selected);
			if ( typeof(selected) != 'undefined' && selected.length > 0 )
				$selected = selected;
			else {
				
				$selected = mwData.Posts[id].tag_selected;
				//add 'id' prefix to selected list
				for(var $i in $selected) $selected[$i] = 'id' + $selected[$i];
				
			}
			
			//___('$selected', $selected);
			
			//$selected = jQuery.extend($selected, mwData.Posts[id].tag_selected);
			if ( typeof $selected[0] != 'undefined' ) //check is 1st element not empty string ""
				for ( var $i in $selected ) {
					//___($i, $selected[$i], mwData.Tags[$selected[$i]]);
					if ( typeof mwData.Tags[$selected[$i]] != 'undefined' )
						$o[$selected[$i]] = mwData.Tags[$selected[$i]].title;
					
				}
		}
		//___(jQuery('.name-tags_list'), $o, $selected);
		
		//new list
		var $new_o = [];
		
		//loop selected to move on top
		for (var $i in $selected) {
			
			//ignore some trash categories
			if ( typeof($o[$selected[$i]]) != 'undefined' ) {
				
				//add selected item to list
				$new_o[$selected[$i]] = $o[$selected[$i]];
				
				//remove selected item from list
				delete($o[$selected[$i]]);
				
			}//real category
			
		}//loop selected
		
		//apply all items to list
		for (var $i in $o) $new_o[$i] = $o[$i];
		
		mwUpdateSelector(jQuery('.name-tags_list'), $new_o, $selected);
		
		//mwCategoryEd.doFilterCategories( mwPostEd.TagTitleInput, jQuery('#postEdTagsList .Item'), '.title' ); // add filter
		//doFilterCategories	: function ( input, elements, searchSelector )
		
		var delay = (function(){
			var timer = 0;
			return function(callback, ms){
				clearTimeout (timer);
				timer = setTimeout(callback, ms);
			};
		})();
		
		mwPostEd.TagTitleInput.keyup( function(event) {
			
			var $this = this;
			
			delay( function() {
				
				$selected = [];
				//___('before', $selected);
				//___(jQuery('.name-tags_list').find(':checked'));
				jQuery('.name-tags_list').find(':checked').each(function() {
					$selected.push(jQuery(this).val());
				});
				//___('after', $selected);
				
				var text = jQuery($this).val();
				
				if (text.length >= mwData.minTagsFilterLength) {
					
					//$o_new = jQuery.extend({}, $o);
					$o_new = [];
					jQuery.each($selected, function(i) {
						$o_new[$selected[i]] = mwData.Tags['id' + $selected[i]].title;
						//___('selected add', $selected[i], mwData.Tags[$selected[i]].title);
					} );
					
					jQuery.each(mwData.Tags, function(i) {
						
						var reg = new RegExp(text, "gi");
						
						if ( reg.test(mwData.Tags[i].title) ) {
							
							//___('regexp add', i, mwData.Tags[i].title);
							$o_new[i] = mwData.Tags[i].title;
							
						}
					} );
					//___($o_new);
					mwUpdateSelector(jQuery('.name-tags_list'), $o_new, $selected);
					
				} else {
					
					$o_new = [];
					jQuery.each($selected, function(i) {
						$o_new[$selected[i]] = mwData.Tags[$selected[i]].title;
					} );
					
					mwUpdateSelector(jQuery('.name-tags_list'), $o_new, $selected);
					
				}
				
				cleanUpIds();
				
			}, 500);
				
		} );
		
		//remove id prefix from values
		var cleanUpIds = function() {
			
			jQuery('.name-tags_list .item input').each(function(i){
				
				var el = jQuery(this);
				var val = el.val();
				
				//clean up only ids
				if ( val.indexOf('id') != -1 )
					el.val(val.substring(2));			
				
			});
			 
		};//cleanUpIds 
		
		cleanUpIds();
		
		mwPostEd.TagTitleInput.keyup( function() { mwState(false, 'wPostEd'); jQuery('.name-tagsFilterPostEd').removeClass('error'); } )
		
	}, //FUNC refreshTagsSelect
	
	addTag	: function () {
		
		var $this = this;
		
		var data = {};
		data.id = 0;
		data.title = mwPostEd.TagTitleInput.val();
		
		var is_valid = true;
		
		if ( data.title.length == 0 ) {
			
			is_valid = false;
			mwState(mwError('Title is required'), 'wPostEd');
			
		} else {
			
			for ( var $i in mwData.Tags )
				if ( mwData.Tags[$i].title == data.title ) {
					
					is_valid = false;
					mwState(mwError('Title already exist'), 'wPostEd');
					
				}
		}
		
		//check is current category exist (if no - there are no category filter, this means its filtered by kind)
		var cur_cat = mwCategoryEd.getCurrentFilterCategoryID();
		if ( cur_cat ) {
			
			data.filter_by_category_id = cur_cat;
			
		} else {
			
			data.filter_by_category_id = mwData.kind_category_id;
			data.kind_category_id = mwData.kind_category_id;
			
		}
		
		if ( is_valid ) {
			
			mwState(false, 'wPostEd');
			jQuery('.name-tagsFilterPostEd').removeClass('error');
			
			mwAjax( '/site/ajax/blogs/saveTagDB', data )
				.content()
				.success( function() {
					
					$selected = [];
					jQuery('.name-tags_list').find(':checked').each(function() {
						$selected.push(jQuery(this).val());
					});
					
					mwPostEd.refreshTagsSelect($this.ID, $selected);
					mwPostEd.manualOrder_sort();
					mwPostEd.TagTitleInput.keyup();
					
				} );
				
		} else {
			
			jQuery('.name-tagsFilterPostEd').addClass('error');
			
		}
		
	}, //FUNC addTag
	
	publish	: function (id, published, published_date) {
		
		var phrase_start = 'Publish';
		if( !published ) phrase_start = 'Unpublish';
		
		mwConfirmation( function() {
			
			var data = {};
			
			data.id = id;
			data.published = published;
			if ( published_date ) data.published_date = published_date;
			
			//check is current category exist (if no - there are no category filter, this means its filtered by kind)
			var cur_cat = mwCategoryEd.getCurrentFilterCategoryID();
			if ( cur_cat ) {
				
				data.filter_by_category_id = cur_cat;
				
			} else {
				
				data.filter_by_category_id = mwData.kind_category_id;
				data.kind_category_id = mwData.kind_category_id;
				
			}
			
			mwAjax( '/site/ajax/blogs/doPublish', data, 'systemConfirmation' )
			.index('#categoriesListContent, #categoriesTreeContent')
			.success( function($data) { mwPostEd.manualOrder_sort(); } )
												
		}
		, phrase_start + ' Post: ' + mwData.Posts[id]['title'] + '?');
		
	}, //FUNC publish
	
	publishSwitch	: function (state, dont_hide) {
		
		var $this = this;
		
		var publish_tr = mwPostEd.Form.find('.post_publish_tr');
                var unpublish_tr = mwPostEd.Form.find('.post_unpublish_tr');
                var date_time_tr = mwPostEd.Form.find('.date_time_tr');
                var publish_button = jQuery('#publish_button_body');
                var save_button = jQuery('#save_button_body');
                var draft_button = jQuery('#draft_button_body');
		var input_published = mwPostEd.Form.find('input[name=published]');
		
		if ( state == 2 ) {
			
			date_time_tr.show();
			
		} else {
			
			date_time_tr.hide();
			
		}
		
                if ( state > 0 && !dont_hide ) {
			
			publish_tr.hide();
                	unpublish_tr.show();
                	date_time_tr.hide();
                	
                } else {
                	
                	publish_tr.show();
                	unpublish_tr.hide();
                	
                }
		
		if ( this.ID ) {
			
			if ( mwData.Posts[this.ID]['published_date'] != '' )
				jQuery('#published_date_span').html('Post Published by Schedule: ' + mwData.Posts[this.ID]['published_date_view']);
			else
				jQuery('#published_date_span').html('Post Published: ' + mwData.Posts[this.ID]['published_date_min']);
		
		}
		
		if ( typeof(mwData.Posts[this.ID]) == 'undefined' || mwData.Posts[this.ID]['published'] == 0 || this.unpublish_start ) {
			
			$this.dom.submitDraft.show();
			$this.dom.submitPublish.show();
			
			$this.dom.submitSave.hide();
			
			//publish_button.show();
			//draft_button.show();
			//save_button.removeClass('hi');
			//save_button.html('Save Draft');
			input_published.val(0);
			
		} else {
			
			$this.dom.submitDraft.hide();
			$this.dom.submitPublish.hide();
			
			$this.dom.submitSave.show();
			
			//publish_button.hide();
			//save_button.addClass('hi');
			//save_button.html('Save');
			input_published.val(state);
			
		}
		
	}, //FUNC publishSwitch
	
	unpublishSwitch	: function(state) {
		//___('unpublishSwitch', 111, state);
		var input_unpublish = mwPostEd.Form.find('input[name=unpublish]');
		var unpublish_tr = mwPostEd.Form.find('.unpublish_time_tr');
		var unpublished_flag = jQuery('input[name=unpublished_flag]');
		
		if ( typeof(state) == 'undefined' ) {
			
			state = input_unpublish.val() * 1;
			
		} else {
			
			state = input_unpublish.val() * 1;
			
			if ( state )
				state = 0;
			else
				state = 1;
			
			input_unpublish.val(state);
			
			//___('unpublishSwitch', 222, state);
			input_unpublish.val(state);
			
		}
		//___('unpublishSwitch', 333, state);
		if ( state ) {
			
			unpublish_tr.show();
			
		} else {
			
			unpublish_tr.hide();
			
		}
		
		/*
		if ( typeof(mwData.Posts[this.ID]) != 'undefined' && mwData.Posts[this.ID]['unpublished_date'] != '' ) {
			
			unpublish_status.show();
			jQuery('#unpublished_date_span').html('Post Unpublished by Schedule: ' + mwData.Posts[this.ID]['unpublished_date_view']);
			
			
		} else {
			
			unpublish_status.hide();
		
		}
		*/
		
	}, //FUNC unpublishSwitch
	
	secondarySwitch	: function(state) {
		
		setTimeout(function(){
			
			var tr = mwPostEd.Form.find('.secondary_time_tr');
			var input = mwPostEd.Form.find('[name=secondary_flag]');
			//___(state, tr, input);
			if ( typeof(state) == 'undefined' ) {
				
				if ( this.ID ) {
					
					state = mwData.Posts[this.ID]['secondary_flag'];
					
				} else {
					
					state = input.parent().find('.checked').length;
					
				}
			}
			//___(state);
			if ( state ) {
				
				tr.show();
				
			} else {
				
				tr.hide();
				
			}
			
		}, 1)
		
	}, //FUNC secondarySwitch
	
	doDemoThumb	: function (id) {
		
		/*if ( !id ) {
			
			jQuery('#demo_thumb_icon, #demo_banner_icon').hide();
			return false;
			
		} */
		
		if ( id ) {
			
			mwData.Posts[id].delete_thumb = false;
			mwData.Posts[id].delete_banner = false;
		
		}
		
		/*
		var del_pic_ajax = function(type) {
			
			var data = {};
			data.id = id;
			data.img_type = type;
			
			mwAjax( '/site/ajax/blogs/deletePicture', data )
				.content()
				.success( function($response) { mwPostEd.doDemoThumb(id); } );
			
		};
		*/
		
		var del_pic = function(type) {
			
			if ( type == 'thumb' ) {
				
				mwData.Posts[id].delete_thumb = true;
				delete mwData.Posts[id].temp_thumb_name;
				
			}
			
			if ( type == 'banner' ) {
				
				mwData.Posts[id].delete_banner = true;
				delete mwData.Posts[id].temp_banner_name;
				
			}
			
			var img_div = jQuery('#demo_' + type + '_icon');
			img_div.slideUp( function() {
				
				img_div.html('<input type="hidden" name="delete_' + type + '" value=""/>');
				
		 	} );
		 	//reinit_file_input( jQuery('#demo_' + type + '_icon_td') );
			
		};
		
		/*
		var reinit_file_input = function(name) {
			
			var wrapper = jQuery('#demo_' + name + '_icon_td span');
			if ( name == 'banner' ) name = 'header';
			wrapper.html('<input type="file" name="' + name + '_icon">');	
			styleDialog(wrapper);
			
		}
		*/
		
		/*
		var do_field = function(type, animate) {
			
			var pic = '';
			
			if ( type == 'thumb' && mwData.Posts[id].thumb && !mwData.Posts[id].delete_thumb )
				var pic = '<img src="/files/galleries/' + mwData.Posts[id].thumb + '">';
			
			if ( type == 'banner' && mwData.Posts[id].banner && !mwData.Posts[id].delete_banner )
				var pic = '<img src="/files/galleries/' + mwData.Posts[id].banner + '">';
			
			var img_div = jQuery('#demo_' + type + '_icon');
			
			if ( pic != '' )
				img_div.html(pic)
					.append('<div class="demo_delete"></div>')
					.show()
					.find('.demo_delete')
					.click( function(event) { del_pic(type); } );
			else
				img_div.html('').hide();
			
			//reinit_file_input(type);
			
		};
		*/
		
		var do_field = function(type) {
			
			//var pic_start = '<img src="/files/galleries/';
			var pic_start = '<img src="';
			var pic_end = '">';
			var pic = '';
			
			if ( type == 'thumb' ) {
				
				
				
				if ( mwData.temp_thumb_name ) {
					
					//add files/galleries folder in case images selected from gallery just right now
					if (mwData.temp_thumb_name.indexOf('/') == -1  )
						pic_start += '/files/galleries/';
					
					pic = pic_start + mwData.temp_thumb_name + pic_end;
					
				}
				else if ( id && mwData.Posts[id].thumb_file ) {
				
					pic = pic_start + mwData.Posts[id].thumb_file + pic_end;
					
				}
			
			}
			
			if ( type == 'banner' ) {
			
				if ( mwData.temp_banner_name ) {
					
					//add files/galleries folder in case images selected from gallery just right now
					if (mwData.temp_banner_name.indexOf('/') == -1  )
						pic_start += '/files/galleries/';
					
					pic = pic_start + mwData.temp_banner_name + pic_end;
				
				}
				else if ( id && mwData.Posts[id].banner_file ) {
				
					pic = pic_start + mwData.Posts[id].banner_file + pic_end;
					
				}
			
			}
			
			var img_div = jQuery('#demo_' + type + '_icon');
			//__(img_div, pic);
			if ( pic != '' ) {
				img_div.html(pic)
					.append('<div class="demo_delete"></div>')
					.show();
				
				jQuery('#demo_' + type + '_icon_td')
					.find('.demo_delete')
					.click( function(event) { del_pic(type); } );
			}
			else {
				img_div.html('').hide();
			}
			
		};
		
		do_field('thumb');
		do_field('banner');
		
	}, //FUNC doDemoThumb
	
	dataSocialsUpload	: function() {
		
		var form = mwPostEd.Form;
		
		var data = {};
		data.message = mwSocials().removeTags( form.find('textarea[name=content]').val() );
		data.picture = window.location.host + '/' + form.find('div#demo_thumb_icon img').attr('src');
		data.link = mwData.postPageURL + '/' + this.ID + '/' + mwData.Posts[this.ID].title_url;
		data.name = form.find('input[name=title]').val();
		data.description = form.find('textarea[name=description]').val();
		
		return data;
		
	}, //FUNC dataSocialsUpload
	
	postOnSocials	: function() {
		
		mwSocials().publishOnSoc(this.dataSocialsUpload());
		
	}, //FUNC postOnSocials
	
	manualOrderInit	: function() {
		
		jQuery('.sort_td').hide();
		
		mwPostEd.is_manually_sort = false;
		
		jQuery('#order_select').change( function(event) {
			
			var $el		= jQuery(this);
			var $val	= $el.val(); 
			
			// Special case for manual sorting
			mwPostEd.is_manually_sort = ($val == 'manual'); 
			
			// Sorting things
			mwPostEd.doSortTable($val); 
		} );
		
		mwPostEd.manualOrder_sort();
		
	}, //FUNC manualOrderInit
	
	manualOrder_sort : function() {
			
		mwPostEd.posts_list = jQuery('.mwIndexTable tbody');
		
		mwPostEd.posts_list.sortable( {
			
			handle			: '.manual_sort_handle',
			forceHelperSize		: true,
			forcePlaceholderSize	: true,
			placeholder		: 'Placeholder',
			errorClass		: 'PlaceholderErr',
			helper			: 'clone',
			appendTo		: 'parent',
			axis			: 'y',
			scroll			: false,
			forceHelperSize		: true,
			update			: function(event, ui) {
				
				var data = {};
				data.posts_list = mwPostEd.posts_list.sortable( "toArray" );
				
				mwAjax('/site/ajax/blogs/savePostsOrder', data, false)
				.index('#postListContent')
				.success( function($data) { mwPostEd.manualOrder_sort(); } )
				.error( function() { } )
				; // mwAjax
				
			},
			start			: function(event, ui) {
				
				var tds_helper = ui.helper.find('th, td');
				var tds_table = jQuery('.mwIndexTable thead').find('th, td');
				
				jQuery.each(tds_helper, function(i) {
					
					jQuery(this).attr('id', 'no_transition_width').width( jQuery(tds_table.get(i)).width() );
					
				} );
			}
		} );
		
		jQuery('#order_select').change();
		
		if ( typeof mwData.AjaxFilter == "undefined" ) {
			
			jQuery('#categories_filter').change();
			
		}
		
	}, //FUNC manualOrder_sort
				
	doSortTable	: function (sort_by) {
		
		sort_by_parts = sort_by.split('_');
		//___('sort_by', sort_by, sort_by_parts);
		
		var rows = mwPostEd.posts_list.find('tr');
		
		if ( mwPostEd.is_manually_sort ) sort_by = 'manual';
		
		if ( sort_by == 'default' ) sort_by = 'id';
		
		if ( sort_by == 'manual' )
			jQuery('.manual_sort_handle').show();
		else
			jQuery('.manual_sort_handle').hide();
		
		rows.sort( function(a, b){
			
			var compA = jQuery(a).attr(sort_by_parts[0]);
			var compB = jQuery(b).attr(sort_by_parts[0])
			
			//___(sort_by, compA, compB);
			
			if ( sort_by_parts[0] != 'alpha' ) {
				
				compA = parseInt(compA, 10);
				compB = parseInt(compB, 10);
				
				var intRegex = /^\d+$/;
				if( ! intRegex.test(compA) ) { compA = 0; }
				if( ! intRegex.test(compB) ) { compB = 0; }
				
				if ( sort_by_parts[1] == 'asc' )
					return (compA < compB) ? 1 : (compA > compB) ? -1 : 0;
				else
					return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
				
			} else {
				//___(compA, compB, compA.localeCompare(compB));
				//return compA.localeCompare(compB);
				
				compA = compA.toLocaleLowerCase();
				compB = compB.toLocaleLowerCase();				
				
				if ( sort_by_parts[1] == 'asc' )
					return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
				else
					return (compA < compB) ? 1 : (compA > compB) ? -1 : 0;
					
			}
			
			
		} );
		
		jQuery.each( rows, function(i) {
			
			mwPostEd.posts_list.append(this);
			
		} );
			
	}, //FUNC doSortTable
	
	doSortTableButton : function () {
		
		var rows = mwPostEd.posts_list.find('tr');
		
		if ( jQuery('.manual_sort_handle').is(':visible') ) {
			
			mwPostEd.is_manually_sort = false;
			mwPostEd.doSortTable( jQuery('#order_select').val() );
			
		} else {
			
			mwPostEd.is_manually_sort = true;
			mwPostEd.doSortTable( 'manual' );
			
		}
			
	}, //FUNC doSortTableButton
	
	doHistoryTab : function ($this) {
		
		var obj = this;
		
		var doIt = function() {
			
			//special check - bugfix
			//sometimes, rly rare mwData.Posts[obj.ID] doesnt exists
			if ( !mwData.Posts || !mwData.Posts[obj.ID] ) return;
			
			var tiny_content = obj.PostContent.find('textarea[name=content]');
			
			var post_title = jQuery('input[name=title]');
			
			var $o = {};
			$o['edited'] = 'Current Unsaved';
			$o['saved'] = 'Last Saved';
			
			var selected = 'saved';
			if ( mwPostEd.CurrentUnsaved_text != mwData.Posts[obj.ID].content || mwPostEd.CurrentUnsaved_title != mwData.Posts[obj.ID].title )
				selected = 'edited';
			
			for ( var $i in mwData.Archive[obj.ID] )
				$o[ 'id' + $i ] = mwData.Archive[obj.ID][$i].create_date + ' (' + mwData.Archive[obj.ID][$i].user_display_name + ')';
			
			var $sel = jQuery('.name-postEdHistoryList');
			mwUpdateSelector($sel, $o, selected);
			
			obj.CurrentUnsaved = jQuery('div.item:has(input[value=edited])');
			obj.LastSaved = jQuery('div.item:has(input[value=saved])');
			
			if ( selected != 'edited' ) obj.CurrentUnsaved.hide();
				
			jQuery('.name-postEdHistoryList').click( function(event) {
				
				var clicked_id = jQuery(event.target).val();
				
				//___(mwData.Archive[obj.ID], clicked_id, mwData.Archive[obj.ID][clicked_id] )
				
				if ( clicked_id )
					if ( clicked_id == 'saved' ) {
						
						tiny_content.val(mwData.Posts[obj.ID].content);
						post_title.val(mwData.Posts[obj.ID].title);
						
					} else if (clicked_id == 'edited') {
						
						tiny_content.val(mwPostEd.CurrentUnsaved_text);
						post_title.val(mwPostEd.CurrentUnsaved_title);
						
					} else {
						
						tiny_content.val(mwData.Archive[obj.ID][clicked_id.substring(2)].content);
						post_title.val(mwData.Archive[obj.ID][clicked_id.substring(2)].title);
						
					}
			});
			
			//mwSwitchTab($this);
			
		}
		
		if ( mwData.saveSecureValidation || !mwData.Archive || ( !mwData.Archive[obj.ID] && mwData.Archive[obj.ID] !== null ) )
			mwAjax( '/site/ajax/blogs/getHistorySelect', { 'ID' : obj.ID }, 'wPostEd' )
				.content()
				.success( function($data) { doIt(); } )
				.error( function() { } )
		else
			doIt();
		
	}, //FUNC doHistoryTab
	
	show_hide_soc_customs : function ($this) {
		
		var soc = jQuery($this).attr('rel');
		jQuery('.socials-custom-wrapper.' + soc).toggle(400);
			
	}, //FUNC show_hide_soc_customs
	
	isValidChr		: function(str){
		
		return !/[~`!#$%\^&*@()+=\[\]\\';,/{}\\":<>\?]/g.test(str);
		
	}, //FUNC isValidChr
	
	checkAliasValid		: function($this) {
		
		if ( !mwPostEd.isValidChr(jQuery($this).val()) ) {
			
			mwState(mwError('"-", "_", "|" are only special character allowed for alias, all other characters will be removed on save'), 'wPostEd');
			jQuery('.name-alias').addClass('error');
			
		} else {
			
			jQuery('.name-alias').removeClass('error');
			mwState(false, 'wPostEd');
			
		}
		
	}, //FUNC checkAliasValid
	
}; //CLASS mwPostEd

//---------------------------------------------------------------------------------------------------------------------------------------------------

var mwCategoryEd = {
	
	ID		: 0,		// Current category ID
	
	LastItem	: 0,		// last used item from list - dom object
	
	NewCounter	: 0,
	
	Defaults	: {		// Form defaults for resetting dialog
	
		id		: 0,
		parent_id	: 0,
		title		: '',
		comment		: '',
		is_news		: 0,
		no_index	: 0,
		no_follow	: 0,
		
	}, //OBJECT Defaults
	
	init	: function() {
		
		mwCategoryEd.updateCategories = {}; // array for updating existing categories on save
		mwCategoryEd.deleteCategories = []; // array for delete existing categories on save
		mwCategoryEd.newCategories = {}; // array for create new categories on save
		mwCategoryEd.ID = 0;
		mwCategoryEd.LastItem = 0;
		mwCategoryEd.NewCounter = 0;
		
		mwCategoryEd.form = jQuery('#saveCategory_form');
		mwCategoryEd.listContainer = jQuery('.categories_list_container');
		mwCategoryEd.catInputPostEd = jQuery('#categoriesFilterPostEd');
		
		//mwCategoryEd.buildCategoriesList();
		mwCategoryEd.buildCategoriesTree();
		mwCategoryEd.doCategoriesMainFilter();
		mwCategoryEd.doDraggableItems();
		mwCategoryEd.doFilterCategoriesTree( jQuery('#categoriesFilter'), jQuery('.categories_list li'), 'a span' );
		
	}, //FUNC init
	
	refreshCategoriesList	: function (id) { // this function using with special control (folders-like)
		
		this.ID = id;
		mwAjax( '/site/ajax/blogs/index', { 'categoryID' : this.ID } )
			.index('#categoriesListContent, #categoriesTreeContent');
		
	}, //FUNC refreshCategoriesList
	
	manageCategories	: function () {
		
		//this.init();
		
		//hide special (kind) categories
		for(var c in mwData.Categories) {
			
			if ( mwData.nav_list[ mwData.Categories[c]['title'].toLowerCase() ] != undefined ) {
				
				mwCategoryEd.listContainer.find('li#' + c).hide();
				
			}
		}
		
		mwWindow('wManageCategories').show();
		
		mwCategoryEd.editItemGrant = false; // this flag using for disable/enable change event on form fields
		this.form.hide().fromArray(this.Defaults);
		
		return false;
		
	}, //FUNC manageCategories
	
	saveCategoriesEd	: function () {
		
		var data = {};
		
		//check is current category exist (if no - there are no category filter, this means its filtered by kind)
		var cur_cat = mwCategoryEd.getCurrentFilterCategoryID();
		if ( cur_cat ) {
			
			data.filter_by_category_id = cur_cat;
			
		} else {
			
			data.filter_by_category_id = mwData.kind_category_id;
			data.kind_category_id = mwData.kind_category_id;
			
		}
		
		data.updateCategories = [];
		for ( var $i in this.updateCategories )
			data.updateCategories.push( this.updateCategories[$i] );
		
		data.deleteCategories = this.deleteCategories;
		
		data.newCategories = [];
		for ( var $i in this.newCategories )
			data.newCategories.push( this.newCategories[$i] );
		
		if ( mwCategoryEd.isSorted )
			data.orderCategories = mwCategoryEd.treeToArray();
		
		/*
		__('update',mwCategoryEd.updateCategories);
		__('delete',mwCategoryEd.deleteCategories);
		__('new',mwCategoryEd.newCategories);
		__('order',mwCategoryEd.orderCategories);
		*/
		
		mwCategoryEd.cat_temp = mwData.Categories;
		delete mwData.Categories;
		
		mwAjax('/site/ajax/blogs/saveCategoryDB', data, 'wManageCategories')
			.index('#categoriesListContent, #categoriesTreeContent')
			.success( function() {
				
				//mwCategoryEd.deleteCategories.forEach( function(value) { delete mwData.Categories[value]; } ); // remove all deleted categories from mwData (after succes)
				mwPostEd.refreshCategoriesSelect(mwPostEd.ID); // refresh categories list on postEd categories tab
				mwCategoryEd.init();
				mwPostEd.manualOrder_sort();
				
				//refresh categories on desktop
				mwCategoryEd.doCategoriesMainFilter();
				
			} )
			.error( function() {
				
				mwData.Categories = mwCategoryEd.cat_temp;
				
			} )
		;
		
	}, //FUNC save
	
	addCategory		: function () {
		
		var cat_data = {};
		cat_data.id = 0;
		cat_data.parent_id = 0;
		cat_data.title = jQuery('#categoriesFilterPostEd').val();
		
		var is_valid = true;
		
		if ( cat_data.title.length == 0 ) {
			
			is_valid = false;
			mwState(mwError('Title is required'), 'wPostEd');
			
		} else {
			
			for ( var $i in mwData.Categories )
				if ( mwData.Categories[$i].title == cat_data.title ) {
					
					is_valid = false;
					mwState(mwError('Title already exist'), 'wPostEd');
					
				}
		}
		___(is_valid);
		if ( is_valid ) {
			
			mwState(false, 'wPostEd');
			jQuery('.name-categoriesFilterPostEd').removeClass('error');
			
			var data = {};
			data.newCategories = [];
			data.newCategories.push( cat_data );
			
			//check is current category exist (if no - there are no category filter, this means its filtered by kind)
			var cur_cat = mwCategoryEd.getCurrentFilterCategoryID();
			if ( cur_cat ) {
				
				data.filter_by_category_id = cur_cat;
				
			} else {
				
				data.filter_by_category_id = mwData.kind_category_id;
				data.kind_category_id = mwData.kind_category_id;
				
			}
			___(data);
			mwAjax( '/site/ajax/blogs/saveCategoryDB', data )
				.content()
				.success( function() {
					
					mwPostEd.refreshCategoriesSelect(mwPostEd.ID);
					
					mwCategoryEd.doCategoriesMainFilter();
					
				} );
				
		} else {
			
			jQuery('.name-categoriesFilterPostEd').addClass('error');
			
		}
		
	}, //FUNC addCategory
	
	treeToArray		: function() {
		
		var cat_list = [];
		
		jQuery('.categories_list>ul').find('li[id]').each( function(i) {
			
			el = jQuery(this);
			var id = el.attr('id');
			var parent_id = el.parent().parent('li[id]').attr('id');
			if ( parent_id == undefined ) parent_id = 0;
			
			cat_list.push( { id : id, parent_id : parent_id } );
			
			//__(i + ' | id - ' + id + ' | parent_id - ' + parent_id + ' | ' + el.find('span').html());
			
		} );
		
		return cat_list;
		
	}, //FUNC toArray
	
	editItem	: function (id, $this) {
	//	___('EDIT START', id);
		if ( mwCategoryEd.ID != 0 ) // if there was already some edition of items - save changes (fix bug - click on sortable items after editing fields not trigger onchange)
			if ( ! mwCategoryEd.saveItem() ) return false; // if cant save - dont let edit new item
		
		mwCategoryEd.ID = id;
		mwCategoryEd.LastItem = $this;
		
		var page = mwCategoryEd.Defaults;
		
		id = id.substring(2); // remove "id" symbols
	//	___('page Defaults', page);
		if ( !isNaN(id-0) ) { // if ID numeric - its existing category, else - new
			
			id = 'id' + id;
			
			page = mwCategoryEd.updateCategories[id]; // try check category on update list (mb its already changed)
	//		___('!page start', !page, page);
			if ( !page ) page = mwData.Categories[id]; // if not changed then try default
	//		___('!page', !page, page);
			if ( !page ) { throw 'ERROR: wrong ID provided for mwCategoryEd.editItem()'; return false; }
	//		___('!page 2', !page, page);
		} else {
			
			id = 'ne' + id;
			page = jQuery.extend(true, {}, mwCategoryEd.newCategories[id]);
	//		___('else page', page);
		}
	//	___('final page', page);
		mwCategoryEd.form.fadeOut( 'fast', function() {
			
			setTimeout( function() {
			 	
			 	mwCategoryEd.editItemGrant = false;
			 	mwCategoryEd.form.fromArray(page)
				mwCategoryEd.form.find('input[name=title]').focus();
				mwCategoryEd.editItemGrant = true;
				 
			}, 1 ); // set focus on title input
			
		} ).fadeIn('fast', function() {
			
			
			
		} );
		jQuery('.categories_list').find('.Selected').removeClass('Selected');
		jQuery($this).parent().addClass('Selected');
		
		return false;
		
	}, //FUNC editItem
	
	saveItem	: function () {
		
		if ( mwCategoryEd.editItemGrant && ! mwCategoryEd.form.is(':animated') ) {
			
			var item = {};
			item.id = this.form.find('input[name=id]').val();
			item.parent_id = this.form.find('input[name=parent_id]').val();
			item.title = this.form.find('input[name=title]').val();
			item.comment = this.form.find('textarea[name=comment]').val();
			item.is_news = this.form.find('input[name=is_news]').is(':checked') ? 1 : 0;
			item.no_index = this.form.find('input[name=no_index]').is(':checked') ? 1 : 0;
			item.no_follow = this.form.find('input[name=no_follow]').is(':checked') ? 1 : 0;
			
			//___('save item', item);
			if ( ! mwCategoryEd.validateItem(item) ) return false;
			
			item.id = item.id.substring(2); // remove "id" symbols
			
			if ( !isNaN(item.id-0) ) { // if is numeric - its existing category, else - new
				
				item.id = 'id' + item.id;
				
				//if ( item.title == mwData.Categories[item.id].title && item.comment == mwData.Categories[item.id].comment && item.is_news == mwData.Categories[item.id].is_news ) {
					
				//	if ( mwCategoryEd.updateCategories[item.id] ) delete mwCategoryEd.updateCategories[item.id]; // if category changed back on default - remove it from update list
					
				//} else {
					
					mwCategoryEd.updateCategories[item.id] = item;
					
				//}
				
			} else {
				
				item.id = 'ne' + item.id;
				if ( mwCategoryEd.newCategories[item.id] ) // protection from click on droping new category
					mwCategoryEd.newCategories[item.id] = item;
				
			}
			
			jQuery(mwCategoryEd.LastItem).find('span').html(item.title);
			
		}
		
		return true;
		
	}, //FUNC saveItem
	
	validateItem	: function(item) {
		
		var is_valid = true;
		
		if ( item.title.length == 0 ) {
			
			is_valid = false;
			mwState(mwError('Title is required'), 'wManageCategories');
			
		} else {
			
			var items = jQuery.extend( {}, mwData.Categories, mwCategoryEd.updateCategories )
			
			mwCategoryEd.deleteCategories.forEach( function(value) { delete items[value]; } );
			
			delete items[item.id];
			
			for ( var $i in items )
				if ( items[$i].title == item.title ) {
					
					is_valid = false;
					mwState(mwError('Title already exist'), 'wManageCategories');
					
				}
		}
		
		if ( is_valid ) {
			
			mwState(false, 'wManageCategories');
			jQuery('#saveCategory_form .name-title').removeClass('error');
			
		} else {
			
			jQuery('#saveCategory_form .name-title').addClass('error');
			
		}
		
		return is_valid;
		
	}, //FUNC validateItem
	
	deleteItem	: function( event, ui ) {
		
		var el = jQuery(ui.draggable);
		
		var del_item = function(item) { // take jQuery wrapped item
			
			var id = item.attr('id');
			
			id = id.substring(2); // remove "id" symbols
			
			if ( !isNaN(id-0) ) { // if ID numeric - its existing category, else - new
				
				id = 'id' + id;
				delete mwCategoryEd.updateCategories[id]; // no need update category before delete it
				mwCategoryEd.deleteCategories.push( id );
				
			} else { // new category
				
				id = 'ne' + id;
				delete mwCategoryEd.newCategories[id];	
				
			}
			
		};
		
		mwConfirmation(
		
			function() {
				
				if ( el.attr('id') == mwCategoryEd.ID ) { // if delete selected item disable validation and hide inputs
					
					mwCategoryEd.ID = 0;
					mwCategoryEd.form.fadeOut('fast');
				
				}
				
				del_item(el);
				
				el.find('li[id]').each( function() {
				
					del_item(jQuery(this)); // delete all childrens
					 
				} );
				
				mwWindow('systemConfirmation').hide();
				el.remove();
				
				if( jQuery('.categories_list li').size() == 0)
					mwCategoryEd.listContainer.addClass('winBgHint');
				
			},
			'Delete Category "' + el.find('span').html() + '" and all child categories?'
			
		);
	}, //FUNC deleteItem
	
	addItem	: function() {
		
		mwCategoryEd.NewCounter += 1;
		
		jQuery('.categories_list #no_items').slideUp();
		
		var item = jQuery.extend(true, {}, mwCategoryEd.Defaults)
		//jQuery.extend(item, mwCategoryEd.Defaults);
		item.id = 'new' + mwCategoryEd.NewCounter;
		
		var el = mwCategoryEd.listContainer.find('.ui-draggable-new-category');
		el.removeClass('ui-draggable-new-category')
			.addClass('draggable_item')
			.attr('id', item.id);
		
		el = el.find('a')
			.click( function() { mwCategoryEd.editItem(item.id, el); } )
		;
		
		el.find('span').html(item.title);
		
		mwCategoryEd.newCategories[item.id] = item;
		
		el.click();
		
	}, //FUNC addItem
	
	buildCategoriesList	: function () {
		
		var html = '<div class="winSideTabs winContent thinpads categories_list">';
		html += '<ul class="ui-sortable-categories-list">';
		
		for ( var $i in mwData.Categories ) {
			
			var item = mwData.Categories[$i];
			html += '<li id="' + item.id + '" class="newItem draggable_item" title="' + item.comment + '">';
			html += '<a onclick="mwCategoryEd.editItem(\'' + item.id + '\', this);"><span class="Title">' + item.title + '</span></a>';
			html += '</li>';
			
		}
		
		html += '</ul>';
		html += '</div>';
		mwCategoryEd.listContainer.html(html);
			
	}, //FUNC buildCategoriesList
	
	buildCategoriesTree	: function () {
		
		var build_childrens = function (id) {
			
			var html = '';
			
			for ( var $i in mwData.Categories )
				if ( mwData.Categories[$i].parent_id == id ) {
					
					var item = mwData.Categories[$i];
					html += '<li id="' + item.id + '" class="newItem draggable_item dragItem">';
					html += '<a onclick="mwCategoryEd.editItem(\'' + item.id + '\', this);"><span class="Title">' + item.title + '</span></a>';
					html += build_childrens(item.id);
					html += '</li>';
					
				}
			
			if ( html != '' ) html = '<ul>' + html + '</ul>';
			
			return html;
			
		}
		
		var html = '<div class="categories_list">';
			
	 	html_items = build_childrens('id0');
	 	//html += '<ul>';
	 	//html += '<div id="no_items">No Categories. Drop New Category here.</div>';
	 	//___(html_items);
	 	if ( html_items == '' )
			mwCategoryEd.listContainer.addClass('winBgHint');
		else
			mwCategoryEd.listContainer.removeClass('winBgHint');
	 	
	 	if ( html_items == '' )
			html += '<ul></ul>';
		else
			html += html_items;
		
		//html += '</ul>';
		html += '</div>';
		mwCategoryEd.listContainer.html(html);
		
		//jQuery('.categories_list ul:first').append('<div id="no_items">No Categories. Drop New Category here.</div>');
		
	}, //FUNC buildCategoriesTree
	
	doCategoriesMainFilter	: function () {
		
		var html = '<option value="0">Filter</option>';
		html += '<option value="-1">no category</option>';
		for ( var $i in mwData.Categories ) {
			
			html +='<option ';
			html += 'value="' + mwData.Categories[$i].id + '">' + mwData.Categories[$i].title + '</option>'
			
			
			
		}
		
		var sel = jQuery('#categories_filter');
		
		sel.html(html);
		
		//get select parent
		var parent = sel.parent()
		
		//check is parent already generated select (skip this on page init)
		if ( parent.hasClass('mwDskSelect') ) {
			
			//move select to main panel
			parent.before(sel);
			
			//delete old one
			parent.remove();
			
			//regenerate it
			mwDskControls.Types['SELECT'](sel);
			
			//show generated select
			jQuery('.mwDskSelect .New').show();
			
		}
		
		sel.change(
			function(event) {
				
				var categoryID = jQuery(this).val();
				
				if ( categoryID.length > 2 )
					categoryID = categoryID.substring(2); // remove "id" symbols
				
				if ( typeof mwData.AjaxFilter !== "undefined" ) {
					
					mwCategoryEd.doAjaxFilter(categoryID);
					
				} else {
					
					if ( categoryID != 0 ) {
						
						jQuery('.tr_post').hide(); 
						jQuery( '.category' + categoryID ).show();
						
						if ( categoryID == -1 ) jQuery( '[class="tr_post "]' ).show();
						
					} else {
						
						jQuery('.tr_post').show();
						
					}
				}
			}
		);
			
	}, //FUNC doCategoriesMainFilter
	
	doAjaxFilter	: function (category_id) {
	
		//___('doAjaxFilter', category_id);
		var temp_posts = mwData.Posts;
		delete mwData.Posts;
		
		mwAjax('/site/ajax/blogs/index', { 'filter_by_category_id' : category_id })
			.go()
			.success( function($data) {
				
				mwPostEd.manualOrder_sort();
				delete temp_posts;
				
			} )
			.error( function() {
				
				mwData.Posts = temp_posts;
				
			} )
		; // mwAjax
			
	}, //FUNC doAjaxFilter
	
	getCurrentFilterCategoryID	: function () {
		
		if ( typeof(mwLiveEd) != 'undefined' ) return 0;
		
		var categoryID = jQuery('#categories_filter').val();
		
		if ( categoryID && categoryID.length > 2 )
			categoryID = categoryID.substring(2); // remove "id" symbols

		return categoryID;
		
	}, //FUNC getCurrentFilterCategoryID
	
	doDraggableItems	: function () {
		
		jQuery('.categories_list>ul').nestedSortable( {
			
			listType		: 'ul',
			items			: 'li',
			handle			: 'a',

			toleranceElement	: '> a',
			tolerance		: 'pointer',
			tabSize			: 20,

			maxLevels		: 0,
			disableNesting		: 'no-childs',
			
			opacity			: 0.5,

			forceHelperSize		: true,
			forcePlaceholderSize	: true,
			placeholder		: 'Placeholder',
			errorClass		: 'PlaceholderErr',
			
			receive			: function( event, ui ) { mwCategoryEd.addItem(); },
			update			: function(event, ui) { mwCategoryEd.isSorted = true; },
			
		} );
		
		
		jQuery('.ui-draggable-new-category').draggable( {
			
			connectToSortable	: '.categories_list>ul',
			helper			: 'clone',
			
		} )
		.disableSelection();
		
		jQuery('.cat_recycle_droppable' ).droppable( {
			
			activeClass	: "dragHover",
			hoverClass	: "drag",
			tolerance	: "pointer",
			drop		: mwCategoryEd.deleteItem,
			accept		: ".draggable_item",
			
		} );
			
	}, //FUNC doDraggableItems
	
	// input		- jQuery wrapped input for event
	// elements		- jQuery wrapped list of elements (for show/hide)
	// searchSelector	- jQuery selector for serch into elements filtered text
	
	doFilterCategories	: function ( input, elements, searchSelector ) {
		
		input.keyup( function(event) {
			
			var input = jQuery(this);
			
			elements.hide().each( function() {
				
				$this = jQuery(this);
				
				var reg = new RegExp(input.val(), "gi");
				
				if ( reg.test($this.find(searchSelector).html()) )
					$this.show();
					
			} )
			
		} );
		
	}, //FUNC doFilterCategories
	
	doFilterCategoriesTree	: function ( input, elements, searchSelector ) {
		
		input.keyup( function(event) {
			
			var input = jQuery(this);
			
			elements.hide().each( function() {
				
				$this = jQuery(this);
				
				var reg = new RegExp(input.val(), "gi");
				
				if ( reg.test($this.find(searchSelector).html()) ) {
					
					$this.show().parents().filter( function(index) {
						
						var res = false;
						if( jQuery.inArray(this, elements) >= 0 ) res = true; // if in elements list - no need remove
						
						return res;
						
					} ).show();
				}
			} )
		} );
		
	}, //FUNC doFilterCategoriesTree
	
}; //OBJECT mwCategoryEd

var mwBlogsOptionsEd = {
	
	ID	: 1,	// blog id (future options - possibility save more then 1 blog options)
	init	: function() {
		
	}, //FUNC init
	
	edit	: function (id) {
		
		this.ID = id;
		var page = mwData.BlogsOptions[id];
		if ( !page ) return false;
		
		page = mwBlogsOptionsEd.add_default_soc_page(page);
		
		// Resetting form
		jQuery('#mwBlogsOptions_form').fromArray(page);
		
		if ( !this.soc_inited ) {
			
			this.soc_inited = true;
			mwSocials().initConnectButtons(jQuery('#mwBlogsOptions_form tr td div[rel]'));
			
		}
		
		mwWindow('wBlogsOptions').Title('Blog Options <span>' + '' + '</span>').show(
			
			function() {}
			
		); // mwWindow
		
		//mwWindow().align()
		
		return false;
		
	}, //FUNC edit
	
	save	: function () {
		
		mwAjax('/site/ajax/blogs/saveBlogsOptionsDB', '#mwBlogsOptions_form', 'wBlogsOptions')
			.index()
			.success( function($data) {
				
				mwPostEd.manualOrder_sort();
				
			} )
		; // mwAjax

	}, //FUNC save
	
	add_default_soc_page : function(page) {
		
		for (key in mwData.BlogsOptions[1]['publish_socials'])
			page['publish_' + key] = mwData.BlogsOptions[1]['publish_socials'][key];
		
		return page;
		
	}, //FUNC add_default_soc_page
	
} // CLASS mwBlogsOptionsEd

var mwBlogsAjaxUpload = {
	
	uploading_doing	: false,
	
	slideDownSpeed	: 500,
	
	init		: function(posts_data, type) {
		
	//	__(type);
	//	__(posts_data);
		
		this.posts_data = posts_data;
		
		this.uploading_doing = false;
		this.load_pos = jQuery("#blogs_posts_list_ajax_position_" + this.posts_data.ID);
		this.loader = jQuery("#blogs_list_loader_" + this.posts_data.ID);
		
		if ( type == 1 ) this.doScrollAjax();
		if ( type == 2 ) this.doClickAjax();
		
	},
	
	doLoad		: function() {
	//	___('posts loading');
	//	___(this);
		
		if ( ! this.uploading_doing && this.posts_data.posts_limit > this.posts_data.posts_counter ) {
			
			this.uploading_doing = true;
			//___('indexAjax', this.posts_data);
			mwAjax("/ajax/blogs/indexAjax", this.posts_data)
			.start( function () {
				mwBlogsAjaxUpload.loader.slideDown();
			}) //FUNC mwAjax.success.callback
			.stop( function () {
			//	mwBlogsAjaxUpload.uploading_doing = false;
				setTimeout(function() { mwBlogsAjaxUpload.loader.slideUp(); }, 2000);
			}) //FUNC mwAjax.success.callback
			.success( function($data) {
					
					//__($data);
					if ( typeof $data.content !== "undefined" ) {
						
						if ( $data.content.length > 0 ) {
							
							//setTimeout(function() { mwBlogsAjaxUpload.loader.slideUp(); }, 3000);
							
							jQuery("<div>" + $data.content + "</div>")
								.hide().insertBefore(mwBlogsAjaxUpload.load_pos)
								.delay(2000)
								.slideDown(mwBlogsAjaxUpload.posts_data.posts_per_once * mwBlogsAjaxUpload.slideDownSpeed, function() {
									
									mwBlogsAjaxUpload.uploading_doing = false;
									jQuery(window).scroll();
									
								});
							
							mwBlogsAjaxUpload.posts_data.posts_counter = mwBlogsAjaxUpload.posts_data.posts_counter + mwBlogsAjaxUpload.posts_data.posts_per_once;
							
						}
					}
				}
			)
			.go();
			
		} else {
			
			mwBlogsAjaxUpload.uploading_doing = true; // stop uploading if there no more to upload
			 
		}		
	},						
	
	doScrollAjax	: function() {

		jQuery(window).scroll(
			function(event) {
				
				var block = jQuery(".blogs_posts_list_ajax_position").parent();
				//___(1, block.offset().top + block.height(), jQuery(window).scrollTop() + jQuery(window).height());
				//___(2, jQuery(window).scrollTop() + jQuery(window).height() - block.offset().top - block.height(), jQuery(window).height());
				//___('doScrollAjax - block', block);
				//if ( jQuery(document).height() - jQuery(window).height() <= jQuery(window).scrollTop() + 250 ) {
				if ( block.offset().top + block.height() < jQuery(window).scrollTop() + jQuery(window).height()
					&& jQuery(window).scrollTop() + jQuery(window).height() - block.offset().top - block.height() < jQuery(window).height() ) {	
					
					mwBlogsAjaxUpload.doLoad();
					
				}
				
			}
		);
	},
	
	doClickAjax	: function() {
		
		this.load_pos.after('<div class="blogs-show-more" onclick="mwBlogsAjaxUpload.doLoad();">Show More</div>');
		
	},
	
} //OBJECT mwBlogsAjaxUpload

mwTextLengthCounter = function(input, display){
	
	//counter object
	var counter = {
		
		min		: 10, //allowed text length minimum
		max		: 60, //allowed text length maximum
		input		: {}, //jQuery object of input to track text length
		display		: {}, //jQuery object of some element to display text length
		
		init		: function(input, display) {
			
			var $this = this;
			
			//expecting selector or jquery element
			$this.input = jQuery(input);
			
			//expecting selector or jquery element
			$this.display = jQuery(display); 
			
			$this.input.keyup(function(){
				
				var l = $this.input.val().length;
				var html = l;
				
				//length less minimum
				if ( l < $this.min ) {
					
					$this.display.addClass('counter-red');
					html += ' (+' + ($this.min - l) + ')';
					
				}//length more maximum
				else if ( l > $this.max ) {
					
					$this.display.addClass('counter-red');
					html += ' (-' + (l - $this.max) + ')';
					
				}//length match
				else {
					
					$this.display.removeClass('counter-red');
					
				}//length match range
				
				$this.display.html(html);
				
			});
			
		}, //FUNC init
		
		reset		: function() {
			
			var $this = this;
			
			$this.input.keyup();
			
		}, //FUNC reset
		
	}//counter object
	
	counter.init(input, display);
	
	//return initialized object
	return counter;
	
}//mwTextLengthCounter

jQuery( function () {
	
	//special function to overwrite in templates
	if ( typeof onBlogsPostAliasUpdate == 'undefined' ) onBlogsPostAliasUpdate = function(alias) {};
	
	if ( typeof mwData != "undefined" ) {
		
		//mwPostEd.init();
		mwCategoryEd.init();
		mwPostEd.manualOrderInit();
		
		//jQuery('#mwPostEd_form #published_date').datepicker();
		
	}
	//load without liveEd
	else {
		
		//prepare socials variable - its only stored once
		var socials = '';
		var soc_template = '';
		
		//load on scroll add
		if ( jQuery('.update-alias-on-scroll-bot').length > 0 ) {
			
			var update_alias = function(alias, title) {
				//___('alias', alias);
				//___('title', title);
				var path = location.pathname.split('/');
				//___(path);
				var url = location.origin;
				var current_alias = path[path.length - 1];
				//___('current_alias', current_alias);
				//update only if current alias is different
				if ( current_alias != alias ) {
					
					for ( var i in path ) {
						
						if ( path[i] && i < path.length - 1 ) url += '/' + path[i];
						
					}
					
					url += '/' + alias;
					
					//___(url);
					//___('update alias', url, alias);
					window.history.pushState( title, title, url );
					
					//call event-function for templates usage
					onBlogsPostAliasUpdate(alias);
					
				}
			};
			
			//special flag to prevent loads while load is on run
			var load_in_process = false;
			
			//loop reload waupoints on timer
			var loop_waypoints = function() {
				
				Waypoint.refreshAll();
				setTimeout(loop_waypoints, 1000);
				
			}
			loop_waypoints();
			
			var addLoadNewPostOnScroll = function(load_el_old) {
				
				//do nothing if load already on process
				if ( load_in_process ) return;
				___('run load');
				
				//set the load process flag
				load_in_process = true;
				
				var load_id = load_el_old.attr('post-id');
				var template = load_el_old.attr('post-template');
				var categories = JSON.parse(load_el_old.attr('post-categories'));
				var order = load_el_old.attr('post-order');
				
				if ( !socials ) socials = load_el_old.attr('post-socials-list');
				if ( !soc_template ) soc_template = load_el_old.attr('post-socials-template');
				
				mwAjax(
					'/ajax/blogs/renderPost/',
					{ 	'postID': load_id,
						'template': template, 
						'PostsCategoriesList': categories, 
						'PostsOrder': order, 
						'SocialsList': socials, 
						'SocialsTemplate' : soc_template
					})
					.go()
					.success( function(response) {
						
						___('next post load response', response);
						
						var PostData = response.content.PostData;
						
						//add new post content
						load_el_old.after(response.content.html);
						
						//no need to load again
						load_el_old.attr('post-do-load', 'no');
						
						//add waypoints
						addWaypoints();
						
						//set the load process flag
						load_in_process = false;
						
					});
				
			}; //FUNC addLoadNewPostOnScroll
			
			var addWaypoints = function() {
				
				jQuery('.update-alias-on-scroll-bot')
					.waypoint({
						handler: function(direction) {
						
							var el = jQuery(this.element);
							//___(el);
							___('scroll: ' + this.triggerPoint + ', direction: ' + direction);
							
							if (el.attr('post-do-load') == 'yes') {
								___('load', el.attr('post-alias'), el);
								addLoadNewPostOnScroll(el);
								
							}
							
						},
						offset: '100%'
					});
				
				jQuery('.update-alias-on-scroll-bot')
					.removeClass('update-alias-on-scroll-bot')
					.addClass('update-alias-on-scroll-bot-updated')
					.waypoint({
						handler: function(direction) {
						
							var el = jQuery(this.element);
							
							//update alias for current post
							if ( direction == 'down' ) {
								___('down', el.attr('post-alias'), el);
								update_alias(el.attr('post-alias'), el.attr('post-title'));
								
							}
							
						},
						offset: '100%'
					});
				
				jQuery('.update-alias-on-scroll-up')
					.removeClass('update-alias-on-scroll-up')
					.addClass('update-alias-on-scroll-up-updated')
					.waypoint({
						handler: function(direction) {
						
							var el = jQuery(this.element);
							
							//update alias for current post
							if ( direction == 'up' ) {
								___('up', el.attr('post-alias'), el);
								update_alias(el.attr('post-alias'), el.attr('post-title'));
								
							}
							
						},
						offset: '100%'
					});
				
			};
			
			addWaypoints();
			
		}
	}
	
});