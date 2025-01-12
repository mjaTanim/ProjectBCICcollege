/** //** ----= mwRawDump	=--------------------------------------------------------------------------------------\**//** \
*
*	Dumps given variables dump into specified debug window area. Shows debug window if necessary.
*
*	@param		jQuery	$el	- Element to dump into.
*	@param		string	$dump	- Dump HTML.	
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function mwRawDump ($el, $dump) {

	$el = _jq($el);

	$el.append($dump);
	
	if ( mwWindow('systemDebug').Window )
		mwWindow('systemDebug').show();
	else
		jQuery('BODY').append($dump);
	
} //FUNC mwRawDump

/** //** ----= mwDumpClear	=--------------------------------------------------------------------------------------\**//** \
*
*	Clears specifed dump area and dumps given variables dump into it. Shows debug window if necessary.
*
*	@param		jQuery	$el	- Element to dump into.
*	@param		string	[$dump]	- Dump HTML.	
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function mwDumpClear ($el, $dump) {
	
	$el = _jq($el);
	
	$el.html('');
	
	if ( $dump )
		mwRawDump($dump);
	
} //FUNC mwDumpClear

/** //** ----= mwDump	=----------------------------------------------------------------------------------------------\**//** \
*
*	Simple variables dumper. Uses system debug window for output. Uses mwDebug window to output.
*
*	@param		jQuery	$el		- Element to dump into.
*	@param		array	$vars		- Array with variables to dump. Usually wrapper arguments are passed here.
*	@param		object	[$options]	- Options to pass into vDump.
*
\**//** ----------------------------------------------------------------------------------------------= by Mr.V!T =----/** //**/
function mwDump ($el, $vars, $options) {

	$el = _jq($el);

	$options = $options || {};
	
	var $d = vDump($options);

	// Running vDump, passing own argument as dumper arguments	
	var $res = $d.dump.apply($d, $vars);

	mwRawDump($el, $res);

} //FUNC mwDump
