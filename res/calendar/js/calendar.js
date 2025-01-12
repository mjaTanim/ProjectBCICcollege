jQuery.fn.mwCalendar = function ($options) {

        if ( !this.length )
                return;

        return this.data('mwCalendar').set($options);

} //func Calendar

var mwCalendar		= function ($el, $options) {

        return vEventObject(['onInit', 'onSubmit', 'onBeforeSubmit'], {

                dom			: {				// Set of interesting dom elements

                        container		: false,			// Calendar container
                        next                    : false,			//  button
                        current                 : false,			//  button
                        previous		: false,			//  button

                }, //dom

                source                  : '',				// Currently
                calendarDate            : '',				// Currently
                xtoken                  : '',				// Currently

                winId			: false,			// Main window ID
                window			: false,

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


                init		: function () {

                        var $this	= this;

                        $el = _jq($el);

                        $this.set($options);

                        $el.data('mwCalendar', $this);
                        // Looking for interesting elements on page
                        $this.dom.container	    = $el;

                        $this.initDom();
                        $this.initEvents();
                        $this.onInit($this);

                        return $this;

                }, //FUNC init
                
                initDom         : function () {

                        var $this	= this;

                        $this.dom.next          = $this.dom.container.find('.mwCalendar-next');
                        $this.dom.current       = $this.dom.container.find('.mwCalendar-current');
                        $this.dom.previous      = $this.dom.container.find('.mwCalendar-previous');

                }, // initDom

                initEvents      : function () {
                	
                        var $this	= this;

                        $this.dom.next
                                .on('click.calendar', function ($e) {

                                        $this.setNextDate();

                                        $this.getCalendar();

                                        return false;

                                }); //FUNC onClick next

                        $this.dom.current
                                .on('click.calendar', function ($e) {

                                        $this.setCurrentDate();

                                        $this.getCalendar();

                                        return false;

                                }); //FUNC onClick previous

                        $this.dom.previous
                                .on('click.calendar', function ($e) {

                                        $this.setPreviousDate();

                                        $this.getCalendar();

                                        return false;

                                }); //FUNC onClick previous

                }, // initEvents

                setNextDate     : function (){

                        var $this = this;

                        var $date = $this.calendarDate;

                        var $date = $date.slice(0,8) + '05';

                        var $newDate = new Date($date);

                        $newDate.setMonth($newDate.getMonth() + 1);

                        var $result = $newDate.toISOString().split('T')[0];

                        $this.calendarDate = $result;

                },

                setCurrentDate     : function (){

                        var $this = this;

                        var $newDate = new Date();

                        var $result = $newDate.toISOString();

                        var $result = $result.slice(0,10);

                        $this.calendarDate = $result;
                },

                setPreviousDate : function (){

                        var $this = this;

                        var $date = $this.calendarDate;

                        var $date = $date.slice(0,8) + '01';

                        var $newDate = new Date($date);

                        $newDate.setMonth($newDate.getMonth() - 1);

                        var $result = $newDate.toISOString();

                        var $result = $result.slice(0,10);

                        $this.calendarDate = $result;

                },

                getCalendar    : function () {

                        var $this	= this;

                        var $vars   =   {};

                        $vars.calendarDate      =   $this.calendarDate;
                        $vars.source            =   $this.source;
                        $vars.xtoken            =   $this.xtoken;

                        $this.onBeforeSubmit($vars); // trigger for before submit event logic

                        mwAjax('/ajax/calendar/getCalendar', $vars)

                                .success( function ($res) {

                                        $this.dom.container.html($res.content);

                                        $this.initDom();

                                        $this.initEvents();

                                }) //FUNC onSuccess

                                .error(function ($data) {

                                }) // func error

                                .index();

                        return false;

                },


        }).init();}; //CLASS



