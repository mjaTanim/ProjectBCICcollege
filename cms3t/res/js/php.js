function parse_str(str, array) {
  //       discuss at: http://phpjs.org/functions/parse_str/
  //      original by: Cagri Ekin
  //      improved by: Michael White (http://getsprink.com)
  //      improved by: Jack
  //      improved by: Brett Zamir (http://brett-zamir.me)
  //      bugfixed by: Onno Marsman
  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
  //      bugfixed by: stag019
  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
  //      bugfixed by: MIO_KODUKI (http://mio-koduki.blogspot.com/)
  // reimplemented by: stag019
  //         input by: Dreamer
  //         input by: Zaide (http://zaidesthings.com/)
  //         input by: David Pesta (http://davidpesta.com/)
  //         input by: jeicquest
  //             note: When no argument is specified, will put variables in global scope.
  //             note: When a particular argument has been passed, and the returned value is different parse_str of PHP. For example, a=b=c&d====c
  //             test: skip
  //        example 1: var arr = {};
  //        example 1: parse_str('first=foo&second=bar', arr);
  //        example 1: $result = arr
  //        returns 1: { first: 'foo', second: 'bar' }
  //        example 2: var arr = {};
  //        example 2: parse_str('str_a=Jack+and+Jill+didn%27t+see+the+well.', arr);
  //        example 2: $result = arr
  //        returns 2: { str_a: "Jack and Jill didn't see the well." }
  //        example 3: var abc = {3:'a'};
  //        example 3: parse_str('abc[a][b]["c"]=def&abc[q]=t+5');
  //        returns 3: {"3":"a","a":{"b":{"c":"def"}},"q":"t 5"}

  var strArr = String(str)
    .replace(/^&/, '')
    .replace(/&$/, '')
    .split('&'),
    sal = strArr.length,
    i, j, ct, p, lastObj, obj, lastIter, undef, chr, tmp, key, value,
    postLeftBracketPos, keys, keysLen,
    fixStr = function(str) {
      return decodeURIComponent(str.replace(/\+/g, '%20'));
    };

  if (!array) {
    array = this.window;
  }

  for (i = 0; i < sal; i++) {
    tmp = strArr[i].split('=');
    key = fixStr(tmp[0]);
    value = (tmp.length < 2) ? '' : fixStr(tmp[1]);

    while (key.charAt(0) === ' ') {
      key = key.slice(1);
    }
    if (key.indexOf('\x00') > -1) {
      key = key.slice(0, key.indexOf('\x00'));
    }
    if (key && key.charAt(0) !== '[') {
      keys = [];
      postLeftBracketPos = 0;
      for (j = 0; j < key.length; j++) {
        if (key.charAt(j) === '[' && !postLeftBracketPos) {
          postLeftBracketPos = j + 1;
        } else if (key.charAt(j) === ']') {
          if (postLeftBracketPos) {
            if (!keys.length) {
              keys.push(key.slice(0, postLeftBracketPos - 1));
            }
            keys.push(key.substr(postLeftBracketPos, j - postLeftBracketPos));
            postLeftBracketPos = 0;
            if (key.charAt(j + 1) !== '[') {
              break;
            }
          }
        }
      }
      if (!keys.length) {
        keys = [key];
      }
      for (j = 0; j < keys[0].length; j++) {
        chr = keys[0].charAt(j);
        if (chr === ' ' || chr === '.' || chr === '[') {
          keys[0] = keys[0].substr(0, j) + '_' + keys[0].substr(j + 1);
        }
        if (chr === '[') {
          break;
        }
      }

      obj = array;
      for (j = 0, keysLen = keys.length; j < keysLen; j++) {
        key = keys[j].replace(/^['"]/, '')
          .replace(/['"]$/, '');
        lastIter = j !== keys.length - 1;
        lastObj = obj;
        if ((key !== '' && key !== ' ') || j === 0) {
          if (obj[key] === undef) {
            obj[key] = {};
          }
          obj = obj[key];
        } else { // To insert new dimension
          ct = -1;
          for (p in obj) {
            if (obj.hasOwnProperty(p)) {
              if (+p > ct && p.match(/^\d+$/g)) {
                ct = +p;
              }
            }
          }
          key = ct + 1;
        }
      }
      lastObj[key] = value;
    }
  }
}

function http_build_query(formdata, numeric_prefix, arg_separator) {
  //  discuss at: http://phpjs.org/functions/http_build_query/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Legaev Andrey
  // improved by: Michael White (http://getsprink.com)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Brett Zamir (http://brett-zamir.me)
  //  revised by: stag019
  //    input by: Dreamer
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  // bugfixed by: MIO_KODUKI (http://mio-koduki.blogspot.com/)
  //        note: If the value is null, key and value are skipped in the http_build_query of PHP while in phpjs they are not.
  //  depends on: urlencode
  //   example 1: http_build_query({foo: 'bar', php: 'hypertext processor', baz: 'boom', cow: 'milk'}, '', '&amp;');
  //   returns 1: 'foo=bar&amp;php=hypertext+processor&amp;baz=boom&amp;cow=milk'
  //   example 2: http_build_query({'php': 'hypertext processor', 0: 'foo', 1: 'bar', 2: 'baz', 3: 'boom', 'cow': 'milk'}, 'myvar_');
  //   returns 2: 'myvar_0=foo&myvar_1=bar&myvar_2=baz&myvar_3=boom&php=hypertext+processor&cow=milk'

  var value, key, tmp = [],
    that = this;

  var _http_build_query_helper = function(key, val, arg_separator) {
    var k, tmp = [];
    if (val === true) {
      val = '1';
    } else if (val === false) {
      val = '0';
    }
    if (val != null) {
      if (typeof val === 'object') {
        for (k in val) {
          if (val[k] != null) {
            tmp.push(_http_build_query_helper(key + '[' + k + ']', val[k], arg_separator));
          }
        }
        return tmp.join(arg_separator);
      } else if (typeof val !== 'function') {
        return that.urlencode(key) + '=' + that.urlencode(val);
      } else {
        throw new Error('There was an error processing for http_build_query().');
      }
    } else {
      return '';
    }
  };

  if (!arg_separator) {
    arg_separator = '&';
  }
  for (key in formdata) {
    value = formdata[key];
    if (numeric_prefix && !isNaN(key)) {
      key = String(numeric_prefix) + key;
    }
    var query = _http_build_query_helper(key, value, arg_separator);
    if (query !== '') {
      tmp.push(query);
    }
  }

  return tmp.join(arg_separator);
}