/** ************************************************************************************************************************ **\
* 
*	Set of classes and functions that will help debug code and dump variables.
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
*	@copyright	Copyright (c) 2008 - 2012 Victor Denisenkov aka Mr.V!T
*	@version	1.0
* 
\** ************************************************************************************************************************ **/

/** //** ----= OBJECT vDump	=--------------------------------------------------------------------------------------\**//** \
*
* 	Variable dumper with highlighter.
*
* 	@package	VIT-Lib
* 	@subpackage	Debug
* 	@category	Helper
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function vDump ($options) {

return setObjectOptions({
	
	useHtml		: true,		// Allows to use highlight html, 
					// otherwise will compile plain strings for alert()
					
	br		: '\n',		// Line break sequence
		
	dumpFunctions	: true,		// Whether or not dump functions in objects
	dumpTypes	: true,		// Allow or not add types to dump
	autoTypes	: true,		// If set to TRUE - force types dumping, otherwise will be dumped only when necessary
	
	recursionLevel	: 0,		// Current recursion level
	maxRecursion	: 10,		// Maximum level of recursion allowed
	collapseLevel	: 2,		// Level starting from where non-scalar variables will collapse dumps
	
	limitStrings	: 100,		// String will be collapsed if longer than this limit (either to limit or first line break)
			
// ==== Wrappers ===============================================================================================================

	/** //** ----= getStyles	=------------------------------------------------------------------------------\**//** \
	*
	* 	Returns class styles, to use in force styles mod. Wraps with style="" attribute if found.
	* 	Relies on own styles sheet, to be intependent from searate css. I.E. Allows colored dumping without 
	* 	attaching any extenral css sheet.
	*
	*	@param	string	$class		- Class to seek.
	* 	@param	string	[$styles]	- Additional styles to add.
	* 
	*	@return string			- Set of class styles.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	getStyles	: function ($class, $styles) {
		
		$styles = $styles || '';
		
		// Defining classes
		var $Classes	= {
			'TABLE'	: [
				'border-collapse: collapse'
			],
			
			'TH'	: [
				'min-width: 100px',
				'text-align: left',
				'vertical-align: top'
			],

			'TD'	: [
				'text-align: left',
				'vertical-align: top'
			]
		}; //OBJECT $classes
		
		// Trimming possible semicolons, will add own anyway
		// Doing this to do not require semicolons
		if ( $styles )
			$styles = $styles.trim('; ') + '; ';
		
		// Checking class styles if necessary
		if ( $Classes[$class] )
			$styles += $Classes[$class].join('; ');
		
		// Wrapping as attribute if got smth
		if ( $styles )
			$styles = ' style="' + $styles + '"';
		
		return $styles;
	}, //FUNC getStyles

	/** //** ----= wrap	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Wraps given code with certain class.
	*
	*	@param	string	$code		- Code to wrap.
	*	@param	string	$class		- Class to apply to wrapping tag.
	*	@param	string	[$styles]	- Styles to use.
	*	@param	string	[$tag]		- Tag to use for wrapping.
	* 
	*	@return string			- HTML code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	wrap	: function ($code, $class, $styles, $tag) {

		if ( !this.useHtml )
			return $code;
		
		$styles	= $styles || '';
		$tag	= $tag || 'span';

		if ( $styles )
			$styles = ' style="' + $styles + '"';

		return '<' + $tag + ' class="' + $class + '"' + $styles + '>' + $code + '</' + $tag + '>';		
	}, //FUNC wrap
	
	/** //** ----= wrapType	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Special case of wrap. Common type wrapper.
	*
	*	@param	string	$type	- Type to wrap.
	*	@param	string	[$sub]	- Subtype to wrap (e.g. length for array, or object instance).
	* 
	*	@return string		- Wrapped type code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	wrapType	: function ($type, $sub) {
		
		var $res = '';
		
		if ( !this.dumpTypes )
			return '';
		
		if ( $sub !== undefined && $sub !== '' )
			$res = this.wrap($sub+'', isInt($sub)? 'Type' : 'Type' );

		if ( this.autoTypes && !$res )
			return '';

		// Fancy space
		if ( !this.autoTypes && $res )
			$res = ' ' + $res;

		if ( !this.autoTypes )
			$res	= this.wrap($type, 'Type') + $res;

		if ( !$res )
			return '';

		return this.wrap(' (' + $res + ')', 'Symbol');		
	}, //FUNC wrapType

	/** //** ----= wrapSpoiler	=------------------------------------------------------------------------------\**//** \
	*
	* 	Wraps given code with spoiler.
	*
	*	@param	string	$code		- Code to wrap.
	*	@param	string	$head		- Spoiler header.
	*	@param	bool	[$expanded]	- Set TRUE to be expanded by default.
	* 
	*	@return string			- Final code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	wrapSpoiler	: function ($code, $head, $expanded) {
		
		if ( !this.useHtml )
			return $head + $code;
		
	 	var $sn = 'S' + randomString();
	 	
		// Drawing spoiler button
		var $res = '<span class="spoilerButton" id="sb_' + $sn + '" onclick="vDumpToggle(\'' + $sn + '\')">' + ($expanded ? '-' : '+') + '</span>';
		
		// Head is always visible
		$res += ' ' + $head;
		
		// Using negative margin trick, to save space for deep levels
		var $style = ''; 
		
		$style += (this.recursionLevel > 0 ? 'margin-left: -60px;' : '');
		$style += ($expanded ? '' : ' display: none;');
		
		if ( $style )
			$style = ' style="' + $style + '"';
		
		// Wrapping code with spoiler div
		$res += '<div id="splr_' + $sn + '"' + $style + '>' + $code + '</div>';
		
		return $res;
	}, //FUNC wrapSpoiler
	
	/** //** ----= wrapRoot	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Special case of wrap. Does final wrap for whole dump.
	*
	*	@param	string	$code	- Code to wrap.
	* 
	*	@return string		- Final code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	wrapRoot	: function ($code) {
		return this.wrap($code, 'vSyntax', '', 'code');
	}, //FUNC wrapRoot

// ==== Type Dumpers ===========================================================================================================

	/** //** ----= dumpVar	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Generates dump code for given variable, depending on variable types.
	*
	*	@param	MIXED	$var	- Variable to dump.
	* 
	*	@return string		- Dump code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dumpVar	: function ($var) {
		
		var $type = typeof($var);
		var $func = 'dump' + $type.toLowerCase().ucfirst();

	// ---- Special types ----

		var $res = this.dumpSpecials($var);
		if ( $res )
			return $res;

	// ---- Common types ----
		
		// Checking for type dumper
		if ( this[$func] )
			return this[$func]($var);
			
		// If no proper dumper - that's smth unusual
		// Trying to dump using native stringify

		// Determining instance name
		$stype = instanceName($var);
		
		return this.wrap($var + '', 'Error') + this.wrapType($type, $stype);
	}, //FUNC dumpVar

	/** //** ----= dumpTable	=------------------------------------------------------------------------------\**//** \
	*
	* 	Generates table view to any enumerable variable type. Used as helper for arrays/ojects dumps.
	*	Does not uses recursion protection, though count recursion levels. Can wrap with spoiler if header provided.
	*
	*	@param	MIXED	$var	- Variable to dump.
	*	@param	string	[$head]	- Header to use for spoiler.
	* 
	*	@return string		- Dump code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dumpTable	: function ($var, $head) {
		
		$head = $head || '';
		
		// Going deep, so should increase recursion level
		this.recursionLevel++;
		
		var $body = '';
		
		var $th = this.getStyles('TH');
		var $td = this.getStyles('TD');
		
		for ( var $i in $var ) {
			
			// Skipping functions at all if don't need them 
			if ( !this.dumpFunctions && isFunction($var[$i]) )
				continue;
			
			if ( this.useHtml ) {
			
				$body += '<tr>';
				
				$body += '<th' + $th + '>[' + this.wrap($i, 'Property') + ']</th>';
				$body += '<td' + $td + '>&nbsp;=&nbsp;</td>';
				$body += '<td' + $td + '>' + this.dumpVar($var[$i]) + '</td>';
				
				$body += '</tr>';
			
			} else { //IF html allowed
			
				// Padding with tabs
				$body += strRepeat('\t', this.recursionLevel) + '[' + $i + ']\t= ' + this.dumpVar($var[$i]) + this.br;
				
			} //IF plain echo
			
		} //FOR each property
		
		$body = $body.trim(this.br);
		
		// Finalizing body
		$body = this.wrap($body, 'Symbol', 'border-collapse: collapse', 'table');

		// Returning recursion level
		this.recursionLevel--;

		if ( !$head )
			return $body;

		return this.wrapSpoiler($body, $head, this.recursionLevel < this.collapseLevel);
	}, //FUNC dumpTable
	
	/** //** ----= dumpSpecials	=------------------------------------------------------------------------------\**//** \
	*
	* 	Returns special variables dump. Checks for DOM objects, jQuery and such. 
	*	If none matched - returns empty string.
	*
	*	@param	string	$var	- Variable to dump.
	* 
	*	@return string		- Dump code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dumpSpecials	: function ($var) {
		
		if ( isObject($var) ) {
		
			// jQuery, showing selector and length
			if ( isJQ($var) ) {
				return this.wrap( this.wrap('jQuery', 'Identifier') + '(' + this.wrap($var.selector || "''", 'String') + ', ' + this.wrap($var.length, 'Type') + ')', 'Symbol');
			} //IF jQuery object
	
			// Input descedants - nodeName.type and name/ID/class
			if ( $var instanceof HTMLInputElement ) {
				
				// Supressing types to dump input value
				var $dt = this.dumpTypes;
				this.dumpTypes = false;
				
				var $res = this.wrap( this.wrap(instanceName($var), 'Identifier') + '(' + this.wrap($var.nodeName + '.' + $var.type , 'String') + ': ' + this.wrap($var.name || $var.id || $var.className, 'String') + ', ' + this.dumpVar($var.value) + ')', 'Symbol'); 
	
				// Restoring dumpTypes state
				this.dumpTypes = $dt;
	
				return $res;
			} //If input descedant
	
			// DOMNode descedants - nodeName and ID/name/class if set
			if ( $var instanceof Node ) {
				return this.wrap( this.wrap(instanceName($var), 'Identifier') + '(' + this.wrap($var.nodeName , 'String') + ': ' + this.wrap($var.id || $var.className || $var.name, 'String') + ')', 'Symbol'); 
			} //If node descedant

		} //IF object given
		
		return '';
	}, //FUNC dumpSpecials
	
	/** //** ----= dumpUndefined	=------------------------------------------------------------------------------\**//** \
	*
	* 	Returns undefined variable dump.
	*
	*	@param	string	$var	- Variable to dump.
	* 
	*	@return string		- Dump code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dumpUndefined	: function ($var) {
		return this.wrap($var + '', 'Error') + this.wrapType('undefined');
	}, //FUNC dumpUndefined
	
	/** //** ----= dumpString	=------------------------------------------------------------------------------\**//** \
	*
	* 	Returns string variable dump.
	*
	*	@param	string	$var	- Variable to dump.
	* 
	*	@return string		- Dump code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dumpString	: function ($var) {

		var $limit = this.limitStrings;
		
		// Regular dump for short strings, collapsed for long strings
		if ( !this.useHtml || $var.length <= $limit || this.recursionLevel == 0 ) {

			var $res = '';
			$res += this.wrap("'" + (this.useHtml ? escapeHtmlTags($var) : $var) + "'", 'String');
			$res += this.wrapType('string', $var.length);

			return $res;
	
		} //IF short string

		// Computing head, but first line break or just limit
		var $pos = $var.indexOf('\n');
		if ( $pos != -1 && $pos < $limit )
			$limit = $pos;
		
		var $head = ''; 

		$head = $var.limit($limit+2, '...').trim();
		$head = escapeHtmlTags($head);
		$head = this.wrap("'" + $head + "'", 'String') + this.wrapType('string', $var.length);
		 
		return this.wrapSpoiler( this.wrap("'" + escapeHtmlTags($var) + "'", 'String'), $head, false);		
	}, //FUNC dumpString

	/** //** ----= dumpBoolean	=------------------------------------------------------------------------------\**//** \
	*
	* 	Returns boolean variable dump.
	*
	*	@param	string	$var	- Variable to dump.
	* 
	*	@return string		- Dump code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dumpBoolean	: function ($var) {
		return this.wrap($var + '', 'Boolean') + this.wrapType('boolean');
	}, //FUNC dumpBoolean

	/** //** ----= dumpNumber	=------------------------------------------------------------------------------\**//** \
	*
	* 	Returns number variable dump.
	*
	*	@param	string	$var	- Variable to dump.
	* 
	*	@return string		- Dump code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dumpNumber	: function ($var) {
		
		var $type = '';
		
		if ( isInt($var) )
			$type = 'integer';
		else if ( isFloat($var) )
			$type = 'float';
		else
			$type = 'number';
		
		return this.wrap($var + '', isFloat($var)? 'Float' : 'Numeric') + this.wrapType($type);
	}, //FUNC dumpNumber

	/** //** ----= dumpFunction	=------------------------------------------------------------------------------\**//** \
	*
	* 	Returns function variable dump.
	*
	*	@param	string	$var	- Variable to dump.
	* 
	*	@return string		- Dump code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dumpFunction	: function ($var) {
		
		if ( !this.dumpFunctions )
			return '';
		
		// Listing arguments
		var $f		= $var.toString();
		
		// Looking for opening body bracket
		var $bodypos	= $f.indexOf('{');

		// Arguments will be all before it
		var $args	= $f.substr(0, $bodypos);

		// Function body starts with bracket		
		$body		= escapeHtmlTags($f.substr($bodypos));
		$body		= this.wrap($body, 'Identifier', '', 'pre');

		// Coloring things 
		$args		= $args.replace('function ', this.wrap('function ', 'Keyword'));
		$args		= $args.replace('(', this.wrap('(', 'Symbol'));
		$args		= $args.replace(')', this.wrap(')', 'Symbol'));
		$args		= $args.replace(/,/g, this.wrap(',', 'Symbol'));

		$args		= this.wrap($args, 'Identifier');

		return this.wrapSpoiler($body, $args, false);
	}, //FUNC dumpFunction

	/** //** ----= dumpArray, dumpObject	=----------------------------------------------------------------------\**//** \
	*
	* 	Returns array/object variable dump.
	*
	*	@param	string	$var	- Variable to dump.
	* 
	*	@return string		- Dump code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dumpArray	: function ($var) { return this.dumpObject($var); },
	dumpObject	: function ($var) {
	
	// ---- NULL ----
		
		// Fast check for NULLs
		if ( $var === null )
			return this.wrap(($var + '').toUpperCase(), 'Null') + this.wrapType('NULL');

		// Saving items count		
		var $ln = isArray($var) ? $var.length : Object.keys($var).length;

	// ---- Scalar arrays ----

		// Special case for non-empty scalar arrays if no need to dump types
		if ( $ln && (!this.dumpTypes || this.autoTypes) && isScalarArray($var, true) ) {

			// Supressing types inside array Dump, for readability
			var $dt = this.dumpTypes;
			this.dumpTypes = false;

			// Going to collect all variables into result			
			var $res = [];
			for ( var $i = 0; $i < $var.length; $i++ )
				$res.push(this.dumpVar($var[$i]));
				
			// Restoring dumpTypes state
			this.dumpTypes = $dt;
				
			return this.wrap('[' + $res.join(', ') + ']', 'Symbol') + this.wrapType('array', $var.length);
		} //IF scalar array given

	// ---- Object Table Head ----

		// Compiling title header
		var $head = '';
		
		if ( isArray($var) ) {
		
			$head = this.wrap('array', 'Keyword') + '(' + this.wrap($var.length, 'Type') + ')'; 
			
		} else { //IF array given
		
			// Checking instanceName, to do not output basic object name
			var $instance = instanceName($var);
			if ( $instance == 'Object' )
				$instance = '';
			else
				$instance = this.wrap($instance, 'Identifier') + ', ';

			$head = this.wrap('object', 'Specials') + '(' + $instance + this.wrap(Object.keys($var).length, 'Type') + ')'; 
			
		} //IF object given
		
		$head = this.wrap($head, 'Symbol') + this.br;

		// If can't go deeper - only head shown
		// Adding spoiler dummy to lineup contents
		if ( !$ln || this.recursionLevel > this.maxRecursion )
			if ( this.useHtml )
				return '<span class="spoilerButton"> </span> ' + $head;
			else
				return $head;

	// ---- Object Table Body ----

		return this.dumpTable($var, $head);

	}, //FUNC dumpObject

// ==== Dumpers ================================================================================================================

	/** //** ----= _dump	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	General dumper helper. Dumps multiple variables passed as array. Usefull to call with func_get_args() 
	* 	from wrappers.
	*
	*	@param	array	$vars		- Variables to dump.
	* 	@param	bool	[$inline]	- Set TRUE for inline mode, will avoid adding line breaks where possible.
	* 					  Types are not dumped for inline mode.
	* 
	*	@return string			- HTML code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	_dump : function ($vars, $inline) {

		$vars = $vars || {};

		// Resetting recursion level, and saving dumpTypes setting
		this.recursionLevel = 0;
		var $dt = this.dumpTypes;
		
		// Types are disabled for inline mode
		if ( $inline )
			this.dumpTypes = false;

		// Compiling result
		var $res	= [];
		for ( var $i in $vars ) {
			$res.push( this.dumpVar($vars[$i]) );
		} //FOR each argument
		
		// Imploding with separator
		$res = $res.join($inline ? ', ' : this.br);

		// Restoring types setting
		this.dumpTypes = $dt;

		return this.wrap($res, 'Symbol');
	}, //FUNC _dump

	/** //** ----= dump	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Generates dump code for given variables, depending on variables types.
	*
	*	@param	MIXED	*	- Variables to dump.
	* 
	*	@return string		- HTML code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dump	: function () {
		return this.wrapRoot( this._dump(arguments) );
	}, //FUNC dump

	/** //** ----= dumpCap	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Generates inline dump code for given variables, precending with given caption.
	*
	*	@param	string	$cap	- Caption to use.
	*	@param	MIXED	*	- Variables to dump.
	* 
	*	@return string		- HTML code.
	* 
	\**//** --------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
	dumpCap	: function ($cap) {

		// Unsetting first argument to do not dump cap		
		delete(arguments[0]);

		var $res = this.wrap($cap + ':\t', 'Property') + this._dump(arguments, true) + this.br;

		return this.wrapRoot($res);
	} //FUNC dumpCap
	
}, $options); //OBJECT vDump

} //FUNC CONSTRUCTOR

/** //** ----= vDumpToggle	=--------------------------------------------------------------------------------------\**//** \
*
* 	vDumo spoiler toggle helper.
*
*	@param	string	$sn	- Spoiler SN.
* 
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function vDumpToggle ($sn) {

	// Getting spoiler state
	var $state = document.getElementById('splr_' + $sn).style.display == 'none';
	
	if ( $state ) {
		document.getElementById('splr_' + $sn).style.display = 'block';
		document.getElementById('sb_' + $sn).firstChild.nodeValue = '-';
	} else { //IF closed
		document.getElementById('splr_' + $sn).style.display = 'none';
		document.getElementById('sb_' + $sn).firstChild.nodeValue = '+';
	} //IF opened

} //FUNC vDumpToggle

/** //** ----= __	=----------------------------------------------------------------------------------------------\**//** \
*
*	Dumps given variables depending on their types.
*
*	@param		MIXED	*	- Variables to dump.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function __() {
	
	var $d = vDump({'useHtml' : false, 'dumpFunctions' : false});

	// Running vDump, passing own argument as dumper arguments	
	var $res = $d.dump.apply($d, arguments);
	
	alert($res);
	
} //FUNC __

/** //** ----= __i	=----------------------------------------------------------------------------------------------\**//** \
*
*	Shortcut to console.info()
*
*	@param		MIXED	*	- Variables to dump.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function __i() {
	
	for ( var $i = 0, $l = arguments.length; $i < $l; $i++)
		console.info(arguments[$i]);
	
} //FUNC __i

/** //** ----= __w	=----------------------------------------------------------------------------------------------\**//** \
*
*	Shortcut to console.warn()
*
*	@param		MIXED	*	- Variables to dump.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function __w() {
	
	for ( var $i = 0, $l = arguments.length; $i < $l; $i++)
		console.warn(arguments[$i]);
	
} //FUNC __w

/** //** ----= __e	=----------------------------------------------------------------------------------------------\**//** \
*
*	Shortcut to console.error()
*
*	@param		MIXED	*	- Variables to dump.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function __e() {
	
	for ( var $i = 0, $l = arguments.length; $i < $l; $i++)
		console.error(arguments[$i]);
	
} //FUNC __e

