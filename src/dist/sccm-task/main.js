/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 16);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var os = __webpack_require__(3);
var fs = __webpack_require__(0);
var _ls = __webpack_require__(4);

// Module globals
var config = {
  silent: false,
  fatal: false
};
exports.config = config;

var state = {
  error: null,
  currentCmd: 'shell.js',
  tempDir: null
};
exports.state = state;

var platform = os.type().match(/^Win/) ? 'win' : 'unix';
exports.platform = platform;

function log() {
  if (!config.silent)
    console.log.apply(this, arguments);
}
exports.log = log;

// Shows error message. Throws unless _continue or config.fatal are true
function error(msg, _continue) {
  if (state.error === null)
    state.error = '';
  state.error += state.currentCmd + ': ' + msg + '\n';

  if (msg.length > 0)
    log(state.error);

  if (config.fatal)
    process.exit(1);

  if (!_continue)
    throw '';
}
exports.error = error;

// In the future, when Proxies are default, we can add methods like `.to()` to primitive strings.
// For now, this is a dummy function to bookmark places we need such strings
function ShellString(str) {
  return str;
}
exports.ShellString = ShellString;

// Returns {'alice': true, 'bob': false} when passed a dictionary, e.g.:
//   parseOptions('-a', {'a':'alice', 'b':'bob'});
function parseOptions(str, map) {
  if (!map)
    error('parseOptions() internal error: no map given');

  // All options are false by default
  var options = {};
  for (var letter in map)
    options[map[letter]] = false;

  if (!str)
    return options; // defaults

  if (typeof str !== 'string')
    error('parseOptions() internal error: wrong str');

  // e.g. match[1] = 'Rf' for str = '-Rf'
  var match = str.match(/^\-(.+)/);
  if (!match)
    return options;

  // e.g. chars = ['R', 'f']
  var chars = match[1].split('');

  chars.forEach(function(c) {
    if (c in map)
      options[map[c]] = true;
    else
      error('option not recognized: '+c);
  });

  return options;
}
exports.parseOptions = parseOptions;

// Expands wildcards with matching (ie. existing) file names.
// For example:
//   expand(['file*.js']) = ['file1.js', 'file2.js', ...]
//   (if the files 'file1.js', 'file2.js', etc, exist in the current dir)
function expand(list) {
  var expanded = [];
  list.forEach(function(listEl) {
    // Wildcard present on directory names ?
    if(listEl.search(/\*[^\/]*\//) > -1 || listEl.search(/\*\*[^\/]*\//) > -1) {
      var match = listEl.match(/^([^*]+\/|)(.*)/);
      var root = match[1];
      var rest = match[2];
      var restRegex = rest.replace(/\*\*/g, ".*").replace(/\*/g, "[^\\/]*");
      restRegex = new RegExp(restRegex);
      
      _ls('-R', root).filter(function (e) {
        return restRegex.test(e);
      }).forEach(function(file) {
        expanded.push(file);
      });
    }
    // Wildcard present on file names ?
    else if (listEl.search(/\*/) > -1) {
      _ls('', listEl).forEach(function(file) {
        expanded.push(file);
      });
    } else {
      expanded.push(listEl);
    }
  });
  return expanded;
}
exports.expand = expand;

// Normalizes _unlinkSync() across platforms to match Unix behavior, i.e.
// file can be unlinked even if it's read-only, see https://github.com/joyent/node/issues/3006
function unlinkSync(file) {
  try {
    fs.unlinkSync(file);
  } catch(e) {
    // Try to override file permission
    if (e.code === 'EPERM') {
      fs.chmodSync(file, '0666');
      fs.unlinkSync(file);
    } else {
      throw e;
    }
  }
}
exports.unlinkSync = unlinkSync;

// e.g. 'shelljs_a5f185d0443ca...'
function randomFileName() {
  function randomHash(count) {
    if (count === 1)
      return parseInt(16*Math.random(), 10).toString(16);
    else {
      var hash = '';
      for (var i=0; i<count; i++)
        hash += randomHash(1);
      return hash;
    }
  }

  return 'shelljs_'+randomHash(20);
}
exports.randomFileName = randomFileName;

// extend(target_obj, source_obj1 [, source_obj2 ...])
// Shallow extend, e.g.:
//    extend({A:1}, {b:2}, {c:3}) returns {A:1, b:2, c:3}
function extend(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function(source) {
    for (var key in source)
      target[key] = source[key];
  });

  return target;
}
exports.extend = extend;

// Common wrapper for all Unix-like commands
function wrap(cmd, fn, options) {
  return function() {
    var retValue = null;

    state.currentCmd = cmd;
    state.error = null;

    try {
      var args = [].slice.call(arguments, 0);

      if (options && options.notUnix) {
        retValue = fn.apply(this, args);
      } else {
        if (args.length === 0 || typeof args[0] !== 'string' || args[0][0] !== '-')
          args.unshift(''); // only add dummy option if '-option' not already present
        retValue = fn.apply(this, args);
      }
    } catch (e) {
      if (!state.error) {
        // If state.error hasn't been set it's an error thrown by Node, not us - probably a bug...
        console.log('shell.js: internal error');
        console.log(e.stack || e);
        process.exit(1);
      }
      if (config.fatal)
        throw e;
    }

    state.currentCmd = 'shell.js';
    return retValue;
  };
} // wrap
exports.wrap = wrap;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(2);
var fs = __webpack_require__(0);
var common = __webpack_require__(1);
var _cd = __webpack_require__(5);
var _pwd = __webpack_require__(6);

//@
//@ ### ls([options ,] path [,path ...])
//@ ### ls([options ,] path_array)
//@ Available options:
//@
//@ + `-R`: recursive
//@ + `-A`: all files (include files beginning with `.`, except for `.` and `..`)
//@
//@ Examples:
//@
//@ ```javascript
//@ ls('projs/*.js');
//@ ls('-R', '/users/me', '/tmp');
//@ ls('-R', ['/users/me', '/tmp']); // same as above
//@ ```
//@
//@ Returns array of files in the given path, or in current directory if no path provided.
function _ls(options, paths) {
  options = common.parseOptions(options, {
    'R': 'recursive',
    'A': 'all',
    'a': 'all_deprecated'
  });

  if (options.all_deprecated) {
    // We won't support the -a option as it's hard to image why it's useful
    // (it includes '.' and '..' in addition to '.*' files)
    // For backwards compatibility we'll dump a deprecated message and proceed as before
    common.log('ls: Option -a is deprecated. Use -A instead');
    options.all = true;
  }

  if (!paths)
    paths = ['.'];
  else if (typeof paths === 'object')
    paths = paths; // assume array
  else if (typeof paths === 'string')
    paths = [].slice.call(arguments, 1);

  var list = [];

  // Conditionally pushes file to list - returns true if pushed, false otherwise
  // (e.g. prevents hidden files to be included unless explicitly told so)
  function pushFile(file, query) {
    // hidden file?
    if (path.basename(file)[0] === '.') {
      // not explicitly asking for hidden files?
      if (!options.all && !(path.basename(query)[0] === '.' && path.basename(query).length > 1))
        return false;
    }

    if (common.platform === 'win')
      file = file.replace(/\\/g, '/');

    list.push(file);
    return true;
  }

  paths.forEach(function(p) {
    if (fs.existsSync(p)) {
      var stats = fs.statSync(p);
      // Simple file?
      if (stats.isFile()) {
        pushFile(p, p);
        return; // continue
      }

      // Simple dir?
      if (stats.isDirectory()) {
        // Iterate over p contents
        fs.readdirSync(p).forEach(function(file) {
          if (!pushFile(file, p))
            return;

          // Recursive?
          if (options.recursive) {
            var oldDir = _pwd();
            _cd('', p);
            if (fs.statSync(file).isDirectory())
              list = list.concat(_ls('-R'+(options.all?'A':''), file+'/*'));
            _cd('', oldDir);
          }
        });
        return; // continue
      }
    }

    // p does not exist - possible wildcard present

    var basename = path.basename(p);
    var dirname = path.dirname(p);
    // Wildcard present on an existing dir? (e.g. '/tmp/*.js')
    if (basename.search(/\*/) > -1 && fs.existsSync(dirname) && fs.statSync(dirname).isDirectory) {
      // Escape special regular expression chars
      var regexp = basename.replace(/(\^|\$|\(|\)|<|>|\[|\]|\{|\}|\.|\+|\?)/g, '\\$1');
      // Translates wildcard into regex
      regexp = '^' + regexp.replace(/\*/g, '.*') + '$';
      // Iterate over directory contents
      fs.readdirSync(dirname).forEach(function(file) {
        if (file.match(new RegExp(regexp))) {
          if (!pushFile(path.normalize(dirname+'/'+file), basename))
            return;

          // Recursive?
          if (options.recursive) {
            var pp = dirname + '/' + file;
            if (fs.lstatSync(pp).isDirectory())
              list = list.concat(_ls('-R'+(options.all?'A':''), pp+'/*'));
          } // recursive
        } // if file matches
      }); // forEach
      return;
    }

    common.error('no such file or directory: ' + p, true);
  });

  return list;
}
module.exports = _ls;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var fs = __webpack_require__(0);
var common = __webpack_require__(1);

//@
//@ ### cd('dir')
//@ Changes to directory `dir` for the duration of the script
function _cd(options, dir) {
  if (!dir)
    common.error('directory not specified');

  if (!fs.existsSync(dir))
    common.error('no such file or directory: ' + dir);

  if (!fs.statSync(dir).isDirectory())
    common.error('not a directory: ' + dir);

  process.chdir(dir);
}
module.exports = _cd;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(2);
var common = __webpack_require__(1);

//@
//@ ### pwd()
//@ Returns the current directory.
function _pwd(options) {
  var pwd = path.resolve(process.cwd());
  return common.ShellString(pwd);
}
module.exports = _pwd;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var _cd = __webpack_require__(5);
var path = __webpack_require__(2);

// Pushd/popd/dirs internals
var _dirStack = [];

function _isStackIndex(index) {
  return (/^[\-+]\d+$/).test(index);
}

function _parseStackIndex(index) {
  if (_isStackIndex(index)) {
    if (Math.abs(index) < _dirStack.length + 1) { // +1 for pwd
      return (/^-/).test(index) ? Number(index) - 1 : Number(index);
    } else {
      common.error(index + ': directory stack index out of range');
    }
  } else {
    common.error(index + ': invalid number');
  }
}

function _actualDirStack() {
  return [process.cwd()].concat(_dirStack);
}

//@
//@ ### pushd([options,] [dir | '-N' | '+N'])
//@
//@ Available options:
//@
//@ + `-n`: Suppresses the normal change of directory when adding directories to the stack, so that only the stack is manipulated.
//@
//@ Arguments:
//@
//@ + `dir`: Makes the current working directory be the top of the stack, and then executes the equivalent of `cd dir`.
//@ + `+N`: Brings the Nth directory (counting from the left of the list printed by dirs, starting with zero) to the top of the list by rotating the stack.
//@ + `-N`: Brings the Nth directory (counting from the right of the list printed by dirs, starting with zero) to the top of the list by rotating the stack.
//@
//@ Examples:
//@
//@ ```javascript
//@ // process.cwd() === '/usr'
//@ pushd('/etc'); // Returns /etc /usr
//@ pushd('+1');   // Returns /usr /etc
//@ ```
//@
//@ Save the current directory on the top of the directory stack and then cd to `dir`. With no arguments, pushd exchanges the top two directories. Returns an array of paths in the stack.
function _pushd(options, dir) {
  if (_isStackIndex(options)) {
    dir = options;
    options = '';
  }

  options = common.parseOptions(options, {
    'n' : 'no-cd'
  });

  var dirs = _actualDirStack();

  if (dir === '+0') {
    return dirs; // +0 is a noop
  } else if (!dir) {
    if (dirs.length > 1) {
      dirs = dirs.splice(1, 1).concat(dirs);
    } else {
      return common.error('no other directory');
    }
  } else if (_isStackIndex(dir)) {
    var n = _parseStackIndex(dir);
    dirs = dirs.slice(n).concat(dirs.slice(0, n));
  } else {
    if (options['no-cd']) {
      dirs.splice(1, 0, dir);
    } else {
      dirs.unshift(dir);
    }
  }

  if (options['no-cd']) {
    dirs = dirs.slice(1);
  } else {
    dir = path.resolve(dirs.shift());
    _cd('', dir);
  }

  _dirStack = dirs;
  return _dirs('');
}
exports.pushd = _pushd;

//@
//@ ### popd([options,] ['-N' | '+N'])
//@
//@ Available options:
//@
//@ + `-n`: Suppresses the normal change of directory when removing directories from the stack, so that only the stack is manipulated.
//@
//@ Arguments:
//@
//@ + `+N`: Removes the Nth directory (counting from the left of the list printed by dirs), starting with zero.
//@ + `-N`: Removes the Nth directory (counting from the right of the list printed by dirs), starting with zero.
//@
//@ Examples:
//@
//@ ```javascript
//@ echo(process.cwd()); // '/usr'
//@ pushd('/etc');       // '/etc /usr'
//@ echo(process.cwd()); // '/etc'
//@ popd();              // '/usr'
//@ echo(process.cwd()); // '/usr'
//@ ```
//@
//@ When no arguments are given, popd removes the top directory from the stack and performs a cd to the new top directory. The elements are numbered from 0 starting at the first directory listed with dirs; i.e., popd is equivalent to popd +0. Returns an array of paths in the stack.
function _popd(options, index) {
  if (_isStackIndex(options)) {
    index = options;
    options = '';
  }

  options = common.parseOptions(options, {
    'n' : 'no-cd'
  });

  if (!_dirStack.length) {
    return common.error('directory stack empty');
  }

  index = _parseStackIndex(index || '+0');

  if (options['no-cd'] || index > 0 || _dirStack.length + index === 0) {
    index = index > 0 ? index - 1 : index;
    _dirStack.splice(index, 1);
  } else {
    var dir = path.resolve(_dirStack.shift());
    _cd('', dir);
  }

  return _dirs('');
}
exports.popd = _popd;

//@
//@ ### dirs([options | '+N' | '-N'])
//@
//@ Available options:
//@
//@ + `-c`: Clears the directory stack by deleting all of the elements.
//@
//@ Arguments:
//@
//@ + `+N`: Displays the Nth directory (counting from the left of the list printed by dirs when invoked without options), starting with zero.
//@ + `-N`: Displays the Nth directory (counting from the right of the list printed by dirs when invoked without options), starting with zero.
//@
//@ Display the list of currently remembered directories. Returns an array of paths in the stack, or a single path if +N or -N was specified.
//@
//@ See also: pushd, popd
function _dirs(options, index) {
  if (_isStackIndex(options)) {
    index = options;
    options = '';
  }

  options = common.parseOptions(options, {
    'c' : 'clear'
  });

  if (options['clear']) {
    _dirStack = [];
    return _dirStack;
  }

  var stack = _actualDirStack();

  if (index) {
    index = _parseStackIndex(index);

    if (index < 0) {
      index = stack.length + index;
    }

    common.log(stack[index]);
    return stack[index];
  }

  common.log(stack.join(' '));

  return stack;
}
exports.dirs = _dirs;


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var os = __webpack_require__(3);
var fs = __webpack_require__(0);

// Returns false if 'dir' is not a writeable directory, 'dir' otherwise
function writeableDir(dir) {
  if (!dir || !fs.existsSync(dir))
    return false;

  if (!fs.statSync(dir).isDirectory())
    return false;

  var testFile = dir+'/'+common.randomFileName();
  try {
    fs.writeFileSync(testFile, ' ');
    common.unlinkSync(testFile);
    return dir;
  } catch (e) {
    return false;
  }
}


//@
//@ ### tempdir()
//@
//@ Examples:
//@
//@ ```javascript
//@ var tmp = tempdir(); // "/tmp" for most *nix platforms
//@ ```
//@
//@ Searches and returns string containing a writeable, platform-dependent temporary directory.
//@ Follows Python's [tempfile algorithm](http://docs.python.org/library/tempfile.html#tempfile.tempdir).
function _tempDir() {
  var state = common.state;
  if (state.tempDir)
    return state.tempDir; // from cache

  state.tempDir = writeableDir(os.tempDir && os.tempDir()) || // node 0.8+
                  writeableDir(process.env['TMPDIR']) ||
                  writeableDir(process.env['TEMP']) ||
                  writeableDir(process.env['TMP']) ||
                  writeableDir(process.env['Wimp$ScrapDir']) || // RiscOS
                  writeableDir('C:\\TEMP') || // Windows
                  writeableDir('C:\\TMP') || // Windows
                  writeableDir('\\TEMP') || // Windows
                  writeableDir('\\TMP') || // Windows
                  writeableDir('/tmp') ||
                  writeableDir('/var/tmp') ||
                  writeableDir('/usr/tmp') ||
                  writeableDir('.'); // last resort

  return state.tempDir;
}
module.exports = _tempDir;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = minimatch
minimatch.Minimatch = Minimatch

var path = { sep: '/' }
try {
  path = __webpack_require__(2)
} catch (er) {}

var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
var expand = __webpack_require__(36)

var plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
}

// any single thing other than /
// don't need to escape / when using new RegExp()
var qmark = '[^/]'

// * => any number of characters
var star = qmark + '*?'

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?'

// characters that need to be escaped in RegExp.
var reSpecials = charSet('().*{}+?[]^$\\!')

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/

minimatch.filter = filter
function filter (pattern, options) {
  options = options || {}
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  a = a || {}
  b = b || {}
  var t = {}
  Object.keys(b).forEach(function (k) {
    t[k] = b[k]
  })
  Object.keys(a).forEach(function (k) {
    t[k] = a[k]
  })
  return t
}

minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return minimatch

  var orig = minimatch

  var m = function minimatch (p, pattern, options) {
    return orig.minimatch(p, pattern, ext(def, options))
  }

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  }

  return m
}

Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return Minimatch
  return minimatch.defaults(def).Minimatch
}

function minimatch (p, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false
  }

  // "" only matches ""
  if (pattern.trim() === '') return p === ''

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options)
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}
  pattern = pattern.trim()

  // windows support: need to use /, not \
  if (path.sep !== '/') {
    pattern = pattern.split(path.sep).join('/')
  }

  this.options = options
  this.set = []
  this.pattern = pattern
  this.regexp = null
  this.negate = false
  this.comment = false
  this.empty = false

  // make the set of regexps etc.
  this.make()
}

Minimatch.prototype.debug = function () {}

Minimatch.prototype.make = make
function make () {
  // don't do it more than once.
  if (this._made) return

  var pattern = this.pattern
  var options = this.options

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true
    return
  }
  if (!pattern) {
    this.empty = true
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate()

  // step 2: expand braces
  var set = this.globSet = this.braceExpand()

  if (options.debug) this.debug = console.error

  this.debug(this.pattern, set)

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  })

  this.debug(this.pattern, set)

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this)

  this.debug(this.pattern, set)

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1
  })

  this.debug(this.pattern, set)

  this.set = set
}

Minimatch.prototype.parseNegate = parseNegate
function parseNegate () {
  var pattern = this.pattern
  var negate = false
  var options = this.options
  var negateOffset = 0

  if (options.nonegate) return

  for (var i = 0, l = pattern.length
    ; i < l && pattern.charAt(i) === '!'
    ; i++) {
    negate = !negate
    negateOffset++
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset)
  this.negate = negate
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return braceExpand(pattern, options)
}

Minimatch.prototype.braceExpand = braceExpand

function braceExpand (pattern, options) {
  if (!options) {
    if (this instanceof Minimatch) {
      options = this.options
    } else {
      options = {}
    }
  }

  pattern = typeof pattern === 'undefined'
    ? this.pattern : pattern

  if (typeof pattern === 'undefined') {
    throw new TypeError('undefined pattern')
  }

  if (options.nobrace ||
    !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  return expand(pattern)
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse
var SUBPARSE = {}
function parse (pattern, isSub) {
  if (pattern.length > 1024 * 64) {
    throw new TypeError('pattern is too long')
  }

  var options = this.options

  // shortcuts
  if (!options.noglobstar && pattern === '**') return GLOBSTAR
  if (pattern === '') return ''

  var re = ''
  var hasMagic = !!options.nocase
  var escaping = false
  // ? => one single character
  var patternListStack = []
  var negativeLists = []
  var stateChar
  var inClass = false
  var reClassStart = -1
  var classStart = -1
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
  : '(?!\\.)'
  var self = this

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += star
          hasMagic = true
        break
        case '?':
          re += qmark
          hasMagic = true
        break
        default:
          re += '\\' + stateChar
        break
      }
      self.debug('clearStateChar %j %j', stateChar, re)
      stateChar = false
    }
  }

  for (var i = 0, len = pattern.length, c
    ; (i < len) && (c = pattern.charAt(i))
    ; i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c)

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += '\\' + c
      escaping = false
      continue
    }

    switch (c) {
      case '/':
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false

      case '\\':
        clearStateChar()
        escaping = true
      continue

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c)

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class')
          if (c === '!' && i === classStart + 1) c = '^'
          re += c
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar)
        clearStateChar()
        stateChar = c
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar()
      continue

      case '(':
        if (inClass) {
          re += '('
          continue
        }

        if (!stateChar) {
          re += '\\('
          continue
        }

        patternListStack.push({
          type: stateChar,
          start: i - 1,
          reStart: re.length,
          open: plTypes[stateChar].open,
          close: plTypes[stateChar].close
        })
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:'
        this.debug('plType %j %j', stateChar, re)
        stateChar = false
      continue

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)'
          continue
        }

        clearStateChar()
        hasMagic = true
        var pl = patternListStack.pop()
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        re += pl.close
        if (pl.type === '!') {
          negativeLists.push(pl)
        }
        pl.reEnd = re.length
      continue

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|'
          escaping = false
          continue
        }

        clearStateChar()
        re += '|'
      continue

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar()

        if (inClass) {
          re += '\\' + c
          continue
        }

        inClass = true
        classStart = i
        reClassStart = re.length
        re += c
      continue

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c
          escaping = false
          continue
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        if (inClass) {
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i)
          try {
            RegExp('[' + cs + ']')
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, SUBPARSE)
            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]'
            hasMagic = hasMagic || sp[1]
            inClass = false
            continue
          }
        }

        // finish up the class.
        hasMagic = true
        inClass = false
        re += c
      continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar()

        if (escaping) {
          // no need
          escaping = false
        } else if (reSpecials[c]
          && !(c === '^' && inClass)) {
          re += '\\'
        }

        re += c

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1)
    sp = this.parse(cs, SUBPARSE)
    re = re.substr(0, reClassStart) + '\\[' + sp[0]
    hasMagic = hasMagic || sp[1]
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + pl.open.length)
    this.debug('setting tail', re, pl)
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\'
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|'
    })

    this.debug('tail=%j\n   %s', tail, tail, pl, re)
    var t = pl.type === '*' ? star
      : pl.type === '?' ? qmark
      : '\\' + pl.type

    hasMagic = true
    re = re.slice(0, pl.reStart) + t + '\\(' + tail
  }

  // handle trailing things that only matter at the very end.
  clearStateChar()
  if (escaping) {
    // trailing \\
    re += '\\\\'
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false
  switch (re.charAt(0)) {
    case '.':
    case '[':
    case '(': addPatternStart = true
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n]

    var nlBefore = re.slice(0, nl.reStart)
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8)
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd)
    var nlAfter = re.slice(nl.reEnd)

    nlLast += nlAfter

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1
    var cleanAfter = nlAfter
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '')
    }
    nlAfter = cleanAfter

    var dollar = ''
    if (nlAfter === '' && isSub !== SUBPARSE) {
      dollar = '$'
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast
    re = newRe
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re
  }

  if (addPatternStart) {
    re = patternStart + re
  }

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [re, hasMagic]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? 'i' : ''
  try {
    var regExp = new RegExp('^' + re + '$', flags)
  } catch (er) {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.')
  }

  regExp._glob = pattern
  regExp._src = re

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
}

Minimatch.prototype.makeRe = makeRe
function makeRe () {
  if (this.regexp || this.regexp === false) return this.regexp

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set

  if (!set.length) {
    this.regexp = false
    return this.regexp
  }
  var options = this.options

  var twoStar = options.noglobstar ? star
    : options.dot ? twoStarDot
    : twoStarNoDot
  var flags = options.nocase ? 'i' : ''

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
      : (typeof p === 'string') ? regExpEscape(p)
      : p._src
    }).join('\\\/')
  }).join('|')

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$'

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$'

  try {
    this.regexp = new RegExp(re, flags)
  } catch (ex) {
    this.regexp = false
  }
  return this.regexp
}

minimatch.match = function (list, pattern, options) {
  options = options || {}
  var mm = new Minimatch(pattern, options)
  list = list.filter(function (f) {
    return mm.match(f)
  })
  if (mm.options.nonull && !list.length) {
    list.push(pattern)
  }
  return list
}

Minimatch.prototype.match = match
function match (f, partial) {
  this.debug('match', f, this.pattern)
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false
  if (this.empty) return f === ''

  if (f === '/' && partial) return true

  var options = this.options

  // windows: need to use /, not \
  if (path.sep !== '/') {
    f = f.split(path.sep).join('/')
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit)
  this.debug(this.pattern, 'split', f)

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set
  this.debug(this.pattern, 'set', set)

  // Find the basename of the path by looking for the last non-empty segment
  var filename
  var i
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i]
    if (filename) break
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i]
    var file = f
    if (options.matchBase && pattern.length === 1) {
      file = [filename]
    }
    var hit = this.matchOne(file, pattern, partial)
    if (hit) {
      if (options.flipNegate) return true
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options

  this.debug('matchOne',
    { 'this': this, file: file, pattern: pattern })

  this.debug('matchOne', file.length, pattern.length)

  for (var fi = 0,
      pi = 0,
      fl = file.length,
      pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi++, pi++) {
    this.debug('matchOne loop')
    var p = pattern[pi]
    var f = file[fi]

    this.debug(pattern, p, f)

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f])

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi
      var pr = pi + 1
      if (pr === pl) {
        this.debug('** at the end')
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' ||
            (!options.dot && file[fi].charAt(0) === '.')) return false
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr]

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee)

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee)
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' ||
            (!options.dot && swallowee.charAt(0) === '.')) {
            this.debug('dot detected!', file, fr, pattern, pr)
            break
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue')
          fr++
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr)
        if (fr === fl) return true
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit
    if (typeof p === 'string') {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase()
      } else {
        hit = f === p
      }
      this.debug('string match', p, f, hit)
    } else {
      hit = f.match(p)
      this.debug('pattern match', p, f, hit)
    }

    if (!hit) return false
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = (fi === fl - 1) && (file[fi] === '')
    return emptyFileEnd
  }

  // should be unreachable.
  throw new Error('wtf?')
}

// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, '$1')
}

function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var fs = __webpack_require__(0);
var path = __webpack_require__(2);
var os = __webpack_require__(3);
var minimatch = __webpack_require__(11);
var util = __webpack_require__(39);
var tcm = __webpack_require__(13);
var vm = __webpack_require__(40);
var semver = __webpack_require__(15);
var crypto = __webpack_require__(9);
/**
 * Hash table of known variable info. The formatted env var name is the lookup key.
 *
 * The purpose of this hash table is to keep track of known variables. The hash table
 * needs to be maintained for multiple reasons:
 *  1) to distinguish between env vars and job vars
 *  2) to distinguish between secret vars and public
 *  3) to know the real variable name and not just the formatted env var name.
 */
exports._knownVariableMap = {};
//-----------------------------------------------------
// Validation Checks
//-----------------------------------------------------
// async await needs generators in node 4.x+
if (semver.lt(process.versions.node, '4.2.0')) {
    this.warning('Tasks require a new agent.  Upgrade your agent or node to 4.2.0 or later');
}
//-----------------------------------------------------
// String convenience
//-----------------------------------------------------
function _startsWith(str, start) {
    return str.slice(0, start.length) == start;
}
exports._startsWith = _startsWith;
function _endsWith(str, end) {
    return str.slice(-end.length) == end;
}
exports._endsWith = _endsWith;
//-----------------------------------------------------
// General Helpers
//-----------------------------------------------------
var _outStream = process.stdout;
var _errStream = process.stderr;
function _writeLine(str) {
    _outStream.write(str + os.EOL);
}
exports._writeLine = _writeLine;
function _setStdStream(stdStream) {
    _outStream = stdStream;
}
exports._setStdStream = _setStdStream;
function _setErrStream(errStream) {
    _errStream = errStream;
}
exports._setErrStream = _setErrStream;
//-----------------------------------------------------
// Loc Helpers
//-----------------------------------------------------
var _locStringCache = {};
var _resourceFiles = {};
var _libResourceFileLoaded = false;
var _resourceCulture = 'en-US';
function _loadResJson(resjsonFile) {
    var resJson;
    if (_exist(resjsonFile)) {
        var resjsonContent = fs.readFileSync(resjsonFile, 'utf8').toString();
        // remove BOM
        if (resjsonContent.indexOf('\uFEFF') == 0) {
            resjsonContent = resjsonContent.slice(1);
        }
        try {
            resJson = JSON.parse(resjsonContent);
        }
        catch (err) {
            _debug('unable to parse resjson with err: ' + err.message);
        }
    }
    else {
        _debug('.resjson file not found: ' + resjsonFile);
    }
    return resJson;
}
function _loadLocStrings(resourceFile, culture) {
    var locStrings = {};
    if (_exist(resourceFile)) {
        var resourceJson = __webpack_require__(43)(resourceFile);
        if (resourceJson && resourceJson.hasOwnProperty('messages')) {
            var locResourceJson;
            // load up resource resjson for different culture
            var localizedResourceFile = path.join(path.dirname(resourceFile), 'Strings', 'resources.resjson');
            var upperCulture = culture.toUpperCase();
            var cultures = [];
            try {
                cultures = fs.readdirSync(localizedResourceFile);
            }
            catch (ex) { }
            for (var i = 0; i < cultures.length; i++) {
                if (cultures[i].toUpperCase() == upperCulture) {
                    localizedResourceFile = path.join(localizedResourceFile, cultures[i], 'resources.resjson');
                    if (_exist(localizedResourceFile)) {
                        locResourceJson = _loadResJson(localizedResourceFile);
                    }
                    break;
                }
            }
            for (var key in resourceJson.messages) {
                if (locResourceJson && locResourceJson.hasOwnProperty('loc.messages.' + key)) {
                    locStrings[key] = locResourceJson['loc.messages.' + key];
                }
                else {
                    locStrings[key] = resourceJson.messages[key];
                }
            }
        }
    }
    else {
        _warning('LIB_ResourceFile does not exist');
    }
    return locStrings;
}
/**
 * Sets the location of the resources json.  This is typically the task.json file.
 * Call once at the beginning of the script before any calls to loc.
 *
 * @param     path      Full path to the json.
 * @returns   void
 */
function _setResourcePath(path) {
    if (process.env['TASKLIB_INPROC_UNITS']) {
        _resourceFiles = {};
        _libResourceFileLoaded = false;
        _locStringCache = {};
        _resourceCulture = 'en-US';
    }
    if (!_resourceFiles[path]) {
        _checkPath(path, 'resource file path');
        _resourceFiles[path] = path;
        _debug('adding resource file: ' + path);
        _resourceCulture = _getVariable('system.culture') || _resourceCulture;
        var locStrs = _loadLocStrings(path, _resourceCulture);
        for (var key in locStrs) {
            //cache loc string
            _locStringCache[key] = locStrs[key];
        }
    }
    else {
        _warning(_loc('LIB_ResourceFileAlreadySet', path));
    }
}
exports._setResourcePath = _setResourcePath;
/**
 * Gets the localized string from the json resource file.  Optionally formats with additional params.
 *
 * @param     key      key of the resources string in the resource file
 * @param     param    additional params for formatting the string
 * @returns   string
 */
function _loc(key) {
    var param = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        param[_i - 1] = arguments[_i];
    }
    if (!_libResourceFileLoaded) {
        // merge loc strings from azure-pipelines-task-lib.
        var libResourceFile = path.join(__dirname, 'lib.json');
        var libLocStrs = _loadLocStrings(libResourceFile, _resourceCulture);
        for (var libKey in libLocStrs) {
            //cache azure-pipelines-task-lib loc string
            _locStringCache[libKey] = libLocStrs[libKey];
        }
        _libResourceFileLoaded = true;
    }
    var locString;
    ;
    if (_locStringCache.hasOwnProperty(key)) {
        locString = _locStringCache[key];
    }
    else {
        if (Object.keys(_resourceFiles).length <= 0) {
            _warning(_loc('LIB_ResourceFileNotSet', key));
        }
        else {
            _warning(_loc('LIB_LocStringNotFound', key));
        }
        locString = key;
    }
    if (param.length > 0) {
        return util.format.apply(this, [locString].concat(param));
    }
    else {
        return locString;
    }
}
exports._loc = _loc;
//-----------------------------------------------------
// Input Helpers
//-----------------------------------------------------
/**
 * Gets a variable value that is defined on the build/release definition or set at runtime.
 *
 * @param     name     name of the variable to get
 * @returns   string
 */
function _getVariable(name) {
    var varval;
    // get the metadata
    var info;
    var key = _getVariableKey(name);
    if (exports._knownVariableMap.hasOwnProperty(key)) {
        info = exports._knownVariableMap[key];
    }
    if (info && info.secret) {
        // get the secret value
        varval = exports._vault.retrieveSecret('SECRET_' + key);
    }
    else {
        // get the public value
        varval = process.env[key];
        // fallback for pre 2.104.1 agent
        if (!varval && name.toUpperCase() == 'AGENT.JOBSTATUS') {
            varval = process.env['agent.jobstatus'];
        }
    }
    _debug(name + '=' + varval);
    return varval;
}
exports._getVariable = _getVariable;
function _getVariableKey(name) {
    if (!name) {
        throw new Error(_loc('LIB_ParameterIsRequired', 'name'));
    }
    return name.replace(/\./g, '_').replace(/ /g, '_').toUpperCase();
}
exports._getVariableKey = _getVariableKey;
//-----------------------------------------------------
// Cmd Helpers
//-----------------------------------------------------
function _command(command, properties, message) {
    var taskCmd = new tcm.TaskCommand(command, properties, message);
    _writeLine(taskCmd.toString());
}
exports._command = _command;
function _warning(message) {
    _command('task.issue', { 'type': 'warning' }, message);
}
exports._warning = _warning;
function _error(message) {
    _command('task.issue', { 'type': 'error' }, message);
}
exports._error = _error;
function _debug(message) {
    _command('task.debug', null, message);
}
exports._debug = _debug;
// //-----------------------------------------------------
// // Disk Functions
// //-----------------------------------------------------
/**
 * Returns whether a path exists.
 *
 * @param     path      path to check
 * @returns   boolean
 */
function _exist(path) {
    var exist = false;
    try {
        exist = !!(path && fs.statSync(path) != null);
    }
    catch (err) {
        if (err && err.code === 'ENOENT') {
            exist = false;
        }
        else {
            throw err;
        }
    }
    return exist;
}
exports._exist = _exist;
/**
 * Checks whether a path exists.
 * If the path does not exist, it will throw.
 *
 * @param     p         path to check
 * @param     name      name only used in error message to identify the path
 * @returns   void
 */
function _checkPath(p, name) {
    _debug('check path : ' + p);
    if (!_exist(p)) {
        throw new Error(_loc('LIB_PathNotFound', name, p));
    }
}
exports._checkPath = _checkPath;
/**
 * Returns path of a tool had the tool actually been invoked.  Resolves via paths.
 * If you check and the tool does not exist, it will throw.
 *
 * @param     tool       name of the tool
 * @param     check      whether to check if tool exists
 * @returns   string
 */
function _which(tool, check) {
    if (!tool) {
        throw new Error('parameter \'tool\' is required');
    }
    // recursive when check=true
    if (check) {
        var result = _which(tool, false);
        if (result) {
            return result;
        }
        else {
            if (process.platform == 'win32') {
                throw new Error(_loc('LIB_WhichNotFound_Win', tool));
            }
            else {
                throw new Error(_loc('LIB_WhichNotFound_Linux', tool));
            }
        }
    }
    _debug("which '" + tool + "'");
    try {
        // build the list of extensions to try
        var extensions = [];
        if (process.platform == 'win32' && process.env['PATHEXT']) {
            for (var _i = 0, _a = process.env['PATHEXT'].split(path.delimiter); _i < _a.length; _i++) {
                var extension = _a[_i];
                if (extension) {
                    extensions.push(extension);
                }
            }
        }
        // if it's rooted, return it if exists. otherwise return empty.
        if (_isRooted(tool)) {
            var filePath = _tryGetExecutablePath(tool, extensions);
            if (filePath) {
                _debug("found: '" + filePath + "'");
                return filePath;
            }
            _debug('not found');
            return '';
        }
        // if any path separators, return empty
        if (tool.indexOf('/') >= 0 || (process.platform == 'win32' && tool.indexOf('\\') >= 0)) {
            _debug('not found');
            return '';
        }
        // build the list of directories
        //
        // Note, technically "where" checks the current directory on Windows. From a task lib perspective,
        // it feels like we should not do this. Checking the current directory seems like more of a use
        // case of a shell, and the which() function exposed by the task lib should strive for consistency
        // across platforms.
        var directories = [];
        if (process.env['PATH']) {
            for (var _b = 0, _c = process.env['PATH'].split(path.delimiter); _b < _c.length; _b++) {
                var p = _c[_b];
                if (p) {
                    directories.push(p);
                }
            }
        }
        // return the first match
        for (var _d = 0, directories_1 = directories; _d < directories_1.length; _d++) {
            var directory = directories_1[_d];
            var filePath = _tryGetExecutablePath(directory + path.sep + tool, extensions);
            if (filePath) {
                _debug("found: '" + filePath + "'");
                return filePath;
            }
        }
        _debug('not found');
        return '';
    }
    catch (err) {
        throw new Error(_loc('LIB_OperationFailed', 'which', err.message));
    }
}
exports._which = _which;
/**
 * Best effort attempt to determine whether a file exists and is executable.
 * @param filePath    file path to check
 * @param extensions  additional file extensions to try
 * @return if file exists and is executable, returns the file path. otherwise empty string.
 */
function _tryGetExecutablePath(filePath, extensions) {
    try {
        // test file exists
        var stats = fs.statSync(filePath);
        if (stats.isFile()) {
            if (process.platform == 'win32') {
                // on Windows, test for valid extension
                var isExecutable = false;
                var fileName = path.basename(filePath);
                var dotIndex = fileName.lastIndexOf('.');
                if (dotIndex >= 0) {
                    var upperExt_1 = fileName.substr(dotIndex).toUpperCase();
                    if (extensions.some(function (validExt) { return validExt.toUpperCase() == upperExt_1; })) {
                        return filePath;
                    }
                }
            }
            else {
                if (isUnixExecutable(stats)) {
                    return filePath;
                }
            }
        }
    }
    catch (err) {
        if (err.code != 'ENOENT') {
            _debug("Unexpected error attempting to determine if executable file exists '" + filePath + "': " + err);
        }
    }
    // try each extension
    var originalFilePath = filePath;
    for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
        var extension = extensions_1[_i];
        var found = false;
        var filePath_1 = originalFilePath + extension;
        try {
            var stats = fs.statSync(filePath_1);
            if (stats.isFile()) {
                if (process.platform == 'win32') {
                    // preserve the case of the actual file (since an extension was appended)
                    try {
                        var directory = path.dirname(filePath_1);
                        var upperName = path.basename(filePath_1).toUpperCase();
                        for (var _a = 0, _b = fs.readdirSync(directory); _a < _b.length; _a++) {
                            var actualName = _b[_a];
                            if (upperName == actualName.toUpperCase()) {
                                filePath_1 = path.join(directory, actualName);
                                break;
                            }
                        }
                    }
                    catch (err) {
                        _debug("Unexpected error attempting to determine the actual case of the file '" + filePath_1 + "': " + err);
                    }
                    return filePath_1;
                }
                else {
                    if (isUnixExecutable(stats)) {
                        return filePath_1;
                    }
                }
            }
        }
        catch (err) {
            if (err.code != 'ENOENT') {
                _debug("Unexpected error attempting to determine if executable file exists '" + filePath_1 + "': " + err);
            }
        }
    }
    return '';
}
// on Mac/Linux, test the execute bit
//     R   W  X  R  W X R W X
//   256 128 64 32 16 8 4 2 1
function isUnixExecutable(stats) {
    return (stats.mode & 1) > 0 || ((stats.mode & 8) > 0 && stats.gid === process.getgid()) || ((stats.mode & 64) > 0 && stats.uid === process.getuid());
}
function _legacyFindFiles_convertPatternToRegExp(pattern) {
    pattern = (process.platform == 'win32' ? pattern.replace(/\\/g, '/') : pattern) // normalize separator on Windows
        .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') // regex escape - from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
        .replace(/\\\/\\\*\\\*\\\//g, '((\/.+/)|(\/))') // replace directory globstar, e.g. /hello/**/world
        .replace(/\\\*\\\*/g, '.*') // replace remaining globstars with a wildcard that can span directory separators, e.g. /hello/**dll
        .replace(/\\\*/g, '[^\/]*') // replace asterisks with a wildcard that cannot span directory separators, e.g. /hello/*.dll
        .replace(/\\\?/g, '[^\/]'); // replace single character wildcards, e.g. /hello/log?.dll
    pattern = "^" + pattern + "$";
    var flags = process.platform == 'win32' ? 'i' : '';
    return new RegExp(pattern, flags);
}
exports._legacyFindFiles_convertPatternToRegExp = _legacyFindFiles_convertPatternToRegExp;
function _cloneMatchOptions(matchOptions) {
    return {
        debug: matchOptions.debug,
        nobrace: matchOptions.nobrace,
        noglobstar: matchOptions.noglobstar,
        dot: matchOptions.dot,
        noext: matchOptions.noext,
        nocase: matchOptions.nocase,
        nonull: matchOptions.nonull,
        matchBase: matchOptions.matchBase,
        nocomment: matchOptions.nocomment,
        nonegate: matchOptions.nonegate,
        flipNegate: matchOptions.flipNegate
    };
}
exports._cloneMatchOptions = _cloneMatchOptions;
function _getFindInfoFromPattern(defaultRoot, pattern, matchOptions) {
    // parameter validation
    if (!defaultRoot) {
        throw new Error('getFindRootFromPattern() parameter defaultRoot cannot be empty');
    }
    if (!pattern) {
        throw new Error('getFindRootFromPattern() parameter pattern cannot be empty');
    }
    if (!matchOptions.nobrace) {
        throw new Error('getFindRootFromPattern() expected matchOptions.nobrace to be true');
    }
    // for the sake of determining the findPath, pretend nocase=false
    matchOptions = _cloneMatchOptions(matchOptions);
    matchOptions.nocase = false;
    // check if basename only and matchBase=true
    if (matchOptions.matchBase &&
        !_isRooted(pattern) &&
        (process.platform == 'win32' ? pattern.replace(/\\/g, '/') : pattern).indexOf('/') < 0) {
        return {
            adjustedPattern: pattern,
            findPath: defaultRoot,
            statOnly: false,
        };
    }
    // the technique applied by this function is to use the information on the Minimatch object determine
    // the findPath. Minimatch breaks the pattern into path segments, and exposes information about which
    // segments are literal vs patterns.
    //
    // note, the technique currently imposes a limitation for drive-relative paths with a glob in the
    // first segment, e.g. C:hello*/world. it's feasible to overcome this limitation, but is left unsolved
    // for now.
    var minimatchObj = new minimatch.Minimatch(pattern, matchOptions);
    // the "set" property is an array of arrays of parsed path segment info. the outer array should only
    // contain one item, otherwise something went wrong. brace expansion can result in multiple arrays,
    // but that should be turned off by the time this function is reached.
    if (minimatchObj.set.length != 1) {
        throw new Error('getFindRootFromPattern() expected Minimatch(...).set.length to be 1. Actual: ' + minimatchObj.set.length);
    }
    var literalSegments = [];
    for (var _i = 0, _a = minimatchObj.set[0]; _i < _a.length; _i++) {
        var parsedSegment = _a[_i];
        if (typeof parsedSegment == 'string') {
            // the item is a string when the original input for the path segment does not contain any
            // unescaped glob characters.
            //
            // note, the string here is already unescaped (i.e. glob escaping removed), so it is ready
            // to pass to find() as-is. for example, an input string 'hello\\*world' => 'hello*world'.
            literalSegments.push(parsedSegment);
            continue;
        }
        break;
    }
    // join the literal segments back together. Minimatch converts '\' to '/' on Windows, then squashes
    // consequetive slashes, and finally splits on slash. this means that UNC format is lost, but can
    // be detected from the original pattern.
    var joinedSegments = literalSegments.join('/');
    if (joinedSegments && process.platform == 'win32' && _startsWith(pattern.replace(/\\/g, '/'), '//')) {
        joinedSegments = '/' + joinedSegments; // restore UNC format
    }
    // determine the find path
    var findPath;
    if (_isRooted(pattern)) { // the pattern was rooted
        findPath = joinedSegments;
    }
    else if (joinedSegments) { // the pattern was not rooted, and literal segments were found
        findPath = _ensureRooted(defaultRoot, joinedSegments);
    }
    else { // the pattern was not rooted, and no literal segments were found
        findPath = defaultRoot;
    }
    // clean up the path
    if (findPath) {
        findPath = _getDirectoryName(_ensureRooted(findPath, '_')); // hack to remove unnecessary trailing slash
        findPath = _normalizeSeparators(findPath); // normalize slashes
    }
    return {
        adjustedPattern: _ensurePatternRooted(defaultRoot, pattern),
        findPath: findPath,
        statOnly: literalSegments.length == minimatchObj.set[0].length,
    };
}
exports._getFindInfoFromPattern = _getFindInfoFromPattern;
function _ensurePatternRooted(root, p) {
    if (!root) {
        throw new Error('ensurePatternRooted() parameter "root" cannot be empty');
    }
    if (!p) {
        throw new Error('ensurePatternRooted() parameter "p" cannot be empty');
    }
    if (_isRooted(p)) {
        return p;
    }
    // normalize root
    root = _normalizeSeparators(root);
    // escape special glob characters
    root = (process.platform == 'win32' ? root : root.replace(/\\/g, '\\\\')) // escape '\' on OSX/Linux
        .replace(/(\[)(?=[^\/]+\])/g, '[[]') // escape '[' when ']' follows within the path segment
        .replace(/\?/g, '[?]') // escape '?'
        .replace(/\*/g, '[*]') // escape '*'
        .replace(/\+\(/g, '[+](') // escape '+('
        .replace(/@\(/g, '[@](') // escape '@('
        .replace(/!\(/g, '[!]('); // escape '!('
    return _ensureRooted(root, p);
}
exports._ensurePatternRooted = _ensurePatternRooted;
//-------------------------------------------------------------------
// Populate the vault with sensitive data.  Inputs and Endpoints
//-------------------------------------------------------------------
function _loadData() {
    // in agent, prefer TempDirectory then workFolder.
    // In interactive dev mode, it won't be
    var keyPath = _getVariable("agent.TempDirectory") || _getVariable("agent.workFolder") || process.cwd();
    exports._vault = new vm.Vault(keyPath);
    exports._knownVariableMap = {};
    _debug('loading inputs and endpoints');
    var loaded = 0;
    for (var envvar in process.env) {
        if (_startsWith(envvar, 'INPUT_') ||
            _startsWith(envvar, 'ENDPOINT_AUTH_') ||
            _startsWith(envvar, 'SECUREFILE_TICKET_') ||
            _startsWith(envvar, 'SECRET_') ||
            _startsWith(envvar, 'VSTS_TASKVARIABLE_')) {
            // Record the secret variable metadata. This is required by getVariable to know whether
            // to retrieve the value from the vault. In a 2.104.1 agent or higher, this metadata will
            // be overwritten when the VSTS_SECRET_VARIABLES env var is processed below.
            if (_startsWith(envvar, 'SECRET_')) {
                var variableName = envvar.substring('SECRET_'.length);
                if (variableName) {
                    // This is technically not the variable name (has underscores instead of dots),
                    // but it's good enough to make getVariable work in a pre-2.104.1 agent where
                    // the VSTS_SECRET_VARIABLES env var is not defined.
                    exports._knownVariableMap[_getVariableKey(variableName)] = { name: variableName, secret: true };
                }
            }
            // store the secret
            if (process.env[envvar]) {
                ++loaded;
                _debug('loading ' + envvar);
                exports._vault.storeSecret(envvar, process.env[envvar]);
                delete process.env[envvar];
            }
        }
    }
    _debug('loaded ' + loaded);
    // store public variable metadata
    var names;
    try {
        names = JSON.parse(process.env['VSTS_PUBLIC_VARIABLES'] || '[]');
    }
    catch (err) {
        throw new Error('Failed to parse VSTS_PUBLIC_VARIABLES as JSON. ' + err); // may occur during interactive testing
    }
    names.forEach(function (name) {
        exports._knownVariableMap[_getVariableKey(name)] = { name: name, secret: false };
    });
    delete process.env['VSTS_PUBLIC_VARIABLES'];
    // store secret variable metadata
    try {
        names = JSON.parse(process.env['VSTS_SECRET_VARIABLES'] || '[]');
    }
    catch (err) {
        throw new Error('Failed to parse VSTS_SECRET_VARIABLES as JSON. ' + err); // may occur during interactive testing
    }
    names.forEach(function (name) {
        exports._knownVariableMap[_getVariableKey(name)] = { name: name, secret: true };
    });
    delete process.env['VSTS_SECRET_VARIABLES'];
    // avoid loading twice (overwrites .taskkey)
    global['_vsts_task_lib_loaded'] = true;
}
exports._loadData = _loadData;
//--------------------------------------------------------------------------------
// Internal path helpers.
//--------------------------------------------------------------------------------
function _ensureRooted(root, p) {
    if (!root) {
        throw new Error('ensureRooted() parameter "root" cannot be empty');
    }
    if (!p) {
        throw new Error('ensureRooted() parameter "p" cannot be empty');
    }
    if (_isRooted(p)) {
        return p;
    }
    if (process.platform == 'win32' && root.match(/^[A-Z]:$/i)) { // e.g. C:
        return root + p;
    }
    // ensure root ends with a separator
    if (_endsWith(root, '/') || (process.platform == 'win32' && _endsWith(root, '\\'))) {
        // root already ends with a separator
    }
    else {
        root += path.sep; // append separator
    }
    return root + p;
}
exports._ensureRooted = _ensureRooted;
/**
 * Determines the parent path and trims trailing slashes (when safe). Path separators are normalized
 * in the result. This function works similar to the .NET System.IO.Path.GetDirectoryName() method.
 * For example, C:\hello\world\ returns C:\hello\world (trailing slash removed). Returns empty when
 * no higher directory can be determined.
 */
function _getDirectoryName(p) {
    // short-circuit if empty
    if (!p) {
        return '';
    }
    // normalize separators
    p = _normalizeSeparators(p);
    // on Windows, the goal of this function is to match the behavior of
    // [System.IO.Path]::GetDirectoryName(), e.g.
    //      C:/             =>
    //      C:/hello        => C:\
    //      C:/hello/       => C:\hello
    //      C:/hello/world  => C:\hello
    //      C:/hello/world/ => C:\hello\world
    //      C:              =>
    //      C:hello         => C:
    //      C:hello/        => C:hello
    //      /               =>
    //      /hello          => \
    //      /hello/         => \hello
    //      //hello         =>
    //      //hello/        =>
    //      //hello/world   =>
    //      //hello/world/  => \\hello\world
    //
    // unfortunately, path.dirname() can't simply be used. for example, on Windows
    // it yields different results from Path.GetDirectoryName:
    //      C:/             => C:/
    //      C:/hello        => C:/
    //      C:/hello/       => C:/
    //      C:/hello/world  => C:/hello
    //      C:/hello/world/ => C:/hello
    //      C:              => C:
    //      C:hello         => C:
    //      C:hello/        => C:
    //      /               => /
    //      /hello          => /
    //      /hello/         => /
    //      //hello         => /
    //      //hello/        => /
    //      //hello/world   => //hello/world
    //      //hello/world/  => //hello/world/
    //      //hello/world/again => //hello/world/
    //      //hello/world/again/ => //hello/world/
    //      //hello/world/again/again => //hello/world/again
    //      //hello/world/again/again/ => //hello/world/again
    if (process.platform == 'win32') {
        if (/^[A-Z]:\\?[^\\]+$/i.test(p)) { // e.g. C:\hello or C:hello
            return p.charAt(2) == '\\' ? p.substring(0, 3) : p.substring(0, 2);
        }
        else if (/^[A-Z]:\\?$/i.test(p)) { // e.g. C:\ or C:
            return '';
        }
        var lastSlashIndex = p.lastIndexOf('\\');
        if (lastSlashIndex < 0) { // file name only
            return '';
        }
        else if (p == '\\') { // relative root
            return '';
        }
        else if (lastSlashIndex == 0) { // e.g. \\hello
            return '\\';
        }
        else if (/^\\\\[^\\]+(\\[^\\]*)?$/.test(p)) { // UNC root, e.g. \\hello or \\hello\ or \\hello\world
            return '';
        }
        return p.substring(0, lastSlashIndex); // e.g. hello\world => hello or hello\world\ => hello\world
        // note, this means trailing slashes for non-root directories
        // (i.e. not C:\, \, or \\unc\) will simply be removed.
    }
    // OSX/Linux
    if (p.indexOf('/') < 0) { // file name only
        return '';
    }
    else if (p == '/') {
        return '';
    }
    else if (_endsWith(p, '/')) {
        return p.substring(0, p.length - 1);
    }
    return path.dirname(p);
}
exports._getDirectoryName = _getDirectoryName;
/**
 * On OSX/Linux, true if path starts with '/'. On Windows, true for paths like:
 * \, \hello, \\hello\share, C:, and C:\hello (and corresponding alternate separator cases).
 */
function _isRooted(p) {
    p = _normalizeSeparators(p);
    if (!p) {
        throw new Error('isRooted() parameter "p" cannot be empty');
    }
    if (process.platform == 'win32') {
        return _startsWith(p, '\\') || // e.g. \ or \hello or \\hello
            /^[A-Z]:/i.test(p); // e.g. C: or C:\hello
    }
    return _startsWith(p, '/'); // e.g. /hello
}
exports._isRooted = _isRooted;
function _normalizeSeparators(p) {
    p = p || '';
    if (process.platform == 'win32') {
        // convert slashes on Windows
        p = p.replace(/\//g, '\\');
        // remove redundant slashes
        var isUnc = /^\\\\+[^\\]/.test(p); // e.g. \\hello
        return (isUnc ? '\\' : '') + p.replace(/\\\\+/g, '\\'); // preserve leading // for UNC
    }
    // remove redundant slashes
    return p.replace(/\/\/+/g, '/');
}
exports._normalizeSeparators = _normalizeSeparators;
//-----------------------------------------------------
// Expose proxy information to vsts-node-api
//-----------------------------------------------------
function _exposeProxySettings() {
    var proxyUrl = _getVariable('Agent.ProxyUrl');
    if (proxyUrl && proxyUrl.length > 0) {
        var proxyUsername = _getVariable('Agent.ProxyUsername');
        var proxyPassword = _getVariable('Agent.ProxyPassword');
        var proxyBypassHostsJson = _getVariable('Agent.ProxyBypassList');
        global['_vsts_task_lib_proxy_url'] = proxyUrl;
        global['_vsts_task_lib_proxy_username'] = proxyUsername;
        global['_vsts_task_lib_proxy_bypass'] = proxyBypassHostsJson;
        global['_vsts_task_lib_proxy_password'] = _exposeTaskLibSecret('proxy', proxyPassword || '');
        _debug('expose agent proxy configuration.');
        global['_vsts_task_lib_proxy'] = true;
    }
}
exports._exposeProxySettings = _exposeProxySettings;
//-----------------------------------------------------
// Expose certificate information to vsts-node-api
//-----------------------------------------------------
function _exposeCertSettings() {
    var ca = _getVariable('Agent.CAInfo');
    if (ca) {
        global['_vsts_task_lib_cert_ca'] = ca;
    }
    var clientCert = _getVariable('Agent.ClientCert');
    if (clientCert) {
        var clientCertKey = _getVariable('Agent.ClientCertKey');
        var clientCertArchive = _getVariable('Agent.ClientCertArchive');
        var clientCertPassword = _getVariable('Agent.ClientCertPassword');
        global['_vsts_task_lib_cert_clientcert'] = clientCert;
        global['_vsts_task_lib_cert_key'] = clientCertKey;
        global['_vsts_task_lib_cert_archive'] = clientCertArchive;
        global['_vsts_task_lib_cert_passphrase'] = _exposeTaskLibSecret('cert', clientCertPassword || '');
    }
    if (ca || clientCert) {
        _debug('expose agent certificate configuration.');
        global['_vsts_task_lib_cert'] = true;
    }
    var skipCertValidation = _getVariable('Agent.SkipCertValidation') || 'false';
    if (skipCertValidation) {
        global['_vsts_task_lib_skip_cert_validation'] = skipCertValidation.toUpperCase() === 'TRUE';
    }
}
exports._exposeCertSettings = _exposeCertSettings;
// We store the encryption key on disk and hold the encrypted content and key file in memory
// return base64encoded<keyFilePath>:base64encoded<encryptedContent>
// downstream vsts-node-api will retrieve the secret later
function _exposeTaskLibSecret(keyFile, secret) {
    if (secret) {
        var encryptKey = crypto.randomBytes(256);
        var cipher = crypto.createCipher("aes-256-ctr", encryptKey);
        var encryptedContent = cipher.update(secret, "utf8", "hex");
        encryptedContent += cipher.final("hex");
        var storageFile = path.join(_getVariable('Agent.TempDirectory') || _getVariable("agent.workFolder") || process.cwd(), keyFile);
        fs.writeFileSync(storageFile, encryptKey.toString('base64'), { encoding: 'utf8' });
        return new Buffer(storageFile).toString('base64') + ':' + new Buffer(encryptedContent).toString('base64');
    }
}


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//
// Command Format:
//    ##vso[artifact.command key=value;key=value]user message
//    
// Examples:
//    ##vso[task.progress value=58]
//    ##vso[task.issue type=warning;]This is the user warning message
//
var CMD_PREFIX = '##vso[';
var TaskCommand = /** @class */ (function () {
    function TaskCommand(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    TaskCommand.prototype.toString = function () {
        var cmdStr = CMD_PREFIX + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            for (var key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    var val = this.properties[key];
                    if (val) {
                        // safely append the val - avoid blowing up when attempting to
                        // call .replace() if message is not a string for some reason
                        cmdStr += key + '=' + escape('' + (val || '')) + ';';
                    }
                }
            }
        }
        cmdStr += ']';
        // safely append the message - avoid blowing up when attempting to
        // call .replace() if message is not a string for some reason
        var message = '' + (this.message || '');
        cmdStr += escapedata(message);
        return cmdStr;
    };
    return TaskCommand;
}());
exports.TaskCommand = TaskCommand;
function commandFromString(commandLine) {
    var preLen = CMD_PREFIX.length;
    var lbPos = commandLine.indexOf('[');
    var rbPos = commandLine.indexOf(']');
    if (lbPos == -1 || rbPos == -1 || rbPos - lbPos < 3) {
        throw new Error('Invalid command brackets');
    }
    var cmdInfo = commandLine.substring(lbPos + 1, rbPos);
    var spaceIdx = cmdInfo.indexOf(' ');
    var command = cmdInfo;
    var properties = {};
    if (spaceIdx > 0) {
        command = cmdInfo.trim().substring(0, spaceIdx);
        var propSection = cmdInfo.trim().substring(spaceIdx + 1);
        var propLines = propSection.split(';');
        propLines.forEach(function (propLine) {
            propLine = propLine.trim();
            if (propLine.length > 0) {
                var eqIndex = propLine.indexOf('=');
                if (eqIndex == -1) {
                    throw new Error('Invalid property: ' + propLine);
                }
                var key = propLine.substring(0, eqIndex);
                var val = propLine.substring(eqIndex + 1);
                properties[key] = unescape(val);
            }
        });
    }
    var msg = unescapedata(commandLine.substring(rbPos + 1));
    var cmd = new TaskCommand(command, properties, msg);
    return cmd;
}
exports.commandFromString = commandFromString;
function escapedata(s) {
    return s.replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function unescapedata(s) {
    return s.replace(/%0D/g, '\r')
        .replace(/%0A/g, '\n')
        .replace(/%25/g, '%');
}
function escape(s) {
    return s.replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/]/g, '%5D')
        .replace(/;/g, '%3B');
}
function unescape(s) {
    return s.replace(/%0D/g, '\r')
        .replace(/%0A/g, '\n')
        .replace(/%5D/g, ']')
        .replace(/%3B/g, ';')
        .replace(/%25/g, '%');
}


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var rng = __webpack_require__(41);
var bytesToUuid = __webpack_require__(42);

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;


/***/ }),
/* 15 */
/***/ (function(module, exports) {

exports = module.exports = SemVer

var debug
/* istanbul ignore next */
if (typeof process === 'object' &&
    process.env &&
    process.env.NODE_DEBUG &&
    /\bsemver\b/i.test(process.env.NODE_DEBUG)) {
  debug = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    args.unshift('SEMVER')
    console.log.apply(console, args)
  }
} else {
  debug = function () {}
}

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0'

var MAX_LENGTH = 256
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
  /* istanbul ignore next */ 9007199254740991

// Max safe segment length for coercion.
var MAX_SAFE_COMPONENT_LENGTH = 16

// The actual regexps go on exports.re
var re = exports.re = []
var src = exports.src = []
var R = 0

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

var NUMERICIDENTIFIER = R++
src[NUMERICIDENTIFIER] = '0|[1-9]\\d*'
var NUMERICIDENTIFIERLOOSE = R++
src[NUMERICIDENTIFIERLOOSE] = '[0-9]+'

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

var NONNUMERICIDENTIFIER = R++
src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*'

// ## Main Version
// Three dot-separated numeric identifiers.

var MAINVERSION = R++
src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')'

var MAINVERSIONLOOSE = R++
src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')'

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

var PRERELEASEIDENTIFIER = R++
src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
                            '|' + src[NONNUMERICIDENTIFIER] + ')'

var PRERELEASEIDENTIFIERLOOSE = R++
src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[NONNUMERICIDENTIFIER] + ')'

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

var PRERELEASE = R++
src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))'

var PRERELEASELOOSE = R++
src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))'

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

var BUILDIDENTIFIER = R++
src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+'

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

var BUILD = R++
src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))'

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

var FULL = R++
var FULLPLAIN = 'v?' + src[MAINVERSION] +
                src[PRERELEASE] + '?' +
                src[BUILD] + '?'

src[FULL] = '^' + FULLPLAIN + '$'

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
                 src[PRERELEASELOOSE] + '?' +
                 src[BUILD] + '?'

var LOOSE = R++
src[LOOSE] = '^' + LOOSEPLAIN + '$'

var GTLT = R++
src[GTLT] = '((?:<|>)?=?)'

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
var XRANGEIDENTIFIERLOOSE = R++
src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*'
var XRANGEIDENTIFIER = R++
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*'

var XRANGEPLAIN = R++
src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:' + src[PRERELEASE] + ')?' +
                   src[BUILD] + '?' +
                   ')?)?'

var XRANGEPLAINLOOSE = R++
src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:' + src[PRERELEASELOOSE] + ')?' +
                        src[BUILD] + '?' +
                        ')?)?'

var XRANGE = R++
src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$'
var XRANGELOOSE = R++
src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$'

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
var COERCE = R++
src[COERCE] = '(?:^|[^\\d])' +
              '(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '})' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:$|[^\\d])'

// Tilde ranges.
// Meaning is "reasonably at or greater than"
var LONETILDE = R++
src[LONETILDE] = '(?:~>?)'

var TILDETRIM = R++
src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+'
re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g')
var tildeTrimReplace = '$1~'

var TILDE = R++
src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$'
var TILDELOOSE = R++
src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$'

// Caret ranges.
// Meaning is "at least and backwards compatible with"
var LONECARET = R++
src[LONECARET] = '(?:\\^)'

var CARETTRIM = R++
src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+'
re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g')
var caretTrimReplace = '$1^'

var CARET = R++
src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$'
var CARETLOOSE = R++
src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$'

// A simple gt/lt/eq thing, or just "" to indicate "any version"
var COMPARATORLOOSE = R++
src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$'
var COMPARATOR = R++
src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$'

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
var COMPARATORTRIM = R++
src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')'

// this one has to use the /g flag
re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g')
var comparatorTrimReplace = '$1$2$3'

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
var HYPHENRANGE = R++
src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[XRANGEPLAIN] + ')' +
                   '\\s*$'

var HYPHENRANGELOOSE = R++
src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s*$'

// Star ranges basically just allow anything at all.
var STAR = R++
src[STAR] = '(<|>)?=?\\s*\\*'

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  debug(i, src[i])
  if (!re[i]) {
    re[i] = new RegExp(src[i])
  }
}

exports.parse = parse
function parse (version, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  if (version.length > MAX_LENGTH) {
    return null
  }

  var r = options.loose ? re[LOOSE] : re[FULL]
  if (!r.test(version)) {
    return null
  }

  try {
    return new SemVer(version, options)
  } catch (er) {
    return null
  }
}

exports.valid = valid
function valid (version, options) {
  var v = parse(version, options)
  return v ? v.version : null
}

exports.clean = clean
function clean (version, options) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), options)
  return s ? s.version : null
}

exports.SemVer = SemVer

function SemVer (version, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }
  if (version instanceof SemVer) {
    if (version.loose === options.loose) {
      return version
    } else {
      version = version.version
    }
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version)
  }

  if (version.length > MAX_LENGTH) {
    throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters')
  }

  if (!(this instanceof SemVer)) {
    return new SemVer(version, options)
  }

  debug('SemVer', version, options)
  this.options = options
  this.loose = !!options.loose

  var m = version.trim().match(options.loose ? re[LOOSE] : re[FULL])

  if (!m) {
    throw new TypeError('Invalid Version: ' + version)
  }

  this.raw = version

  // these are actually numbers
  this.major = +m[1]
  this.minor = +m[2]
  this.patch = +m[3]

  if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
    throw new TypeError('Invalid major version')
  }

  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
    throw new TypeError('Invalid minor version')
  }

  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
    throw new TypeError('Invalid patch version')
  }

  // numberify any prerelease numeric ids
  if (!m[4]) {
    this.prerelease = []
  } else {
    this.prerelease = m[4].split('.').map(function (id) {
      if (/^[0-9]+$/.test(id)) {
        var num = +id
        if (num >= 0 && num < MAX_SAFE_INTEGER) {
          return num
        }
      }
      return id
    })
  }

  this.build = m[5] ? m[5].split('.') : []
  this.format()
}

SemVer.prototype.format = function () {
  this.version = this.major + '.' + this.minor + '.' + this.patch
  if (this.prerelease.length) {
    this.version += '-' + this.prerelease.join('.')
  }
  return this.version
}

SemVer.prototype.toString = function () {
  return this.version
}

SemVer.prototype.compare = function (other) {
  debug('SemVer.compare', this.version, this.options, other)
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options)
  }

  return this.compareMain(other) || this.comparePre(other)
}

SemVer.prototype.compareMain = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options)
  }

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch)
}

SemVer.prototype.comparePre = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options)
  }

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length) {
    return -1
  } else if (!this.prerelease.length && other.prerelease.length) {
    return 1
  } else if (!this.prerelease.length && !other.prerelease.length) {
    return 0
  }

  var i = 0
  do {
    var a = this.prerelease[i]
    var b = other.prerelease[i]
    debug('prerelease compare', i, a, b)
    if (a === undefined && b === undefined) {
      return 0
    } else if (b === undefined) {
      return 1
    } else if (a === undefined) {
      return -1
    } else if (a === b) {
      continue
    } else {
      return compareIdentifiers(a, b)
    }
  } while (++i)
}

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function (release, identifier) {
  switch (release) {
    case 'premajor':
      this.prerelease.length = 0
      this.patch = 0
      this.minor = 0
      this.major++
      this.inc('pre', identifier)
      break
    case 'preminor':
      this.prerelease.length = 0
      this.patch = 0
      this.minor++
      this.inc('pre', identifier)
      break
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0
      this.inc('patch', identifier)
      this.inc('pre', identifier)
      break
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0) {
        this.inc('patch', identifier)
      }
      this.inc('pre', identifier)
      break

    case 'major':
      // If this is a pre-major version, bump up to the same major version.
      // Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      if (this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0) {
        this.major++
      }
      this.minor = 0
      this.patch = 0
      this.prerelease = []
      break
    case 'minor':
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      if (this.patch !== 0 || this.prerelease.length === 0) {
        this.minor++
      }
      this.patch = 0
      this.prerelease = []
      break
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0) {
        this.patch++
      }
      this.prerelease = []
      break
    // This probably shouldn't be used publicly.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0) {
        this.prerelease = [0]
      } else {
        var i = this.prerelease.length
        while (--i >= 0) {
          if (typeof this.prerelease[i] === 'number') {
            this.prerelease[i]++
            i = -2
          }
        }
        if (i === -1) {
          // didn't increment anything
          this.prerelease.push(0)
        }
      }
      if (identifier) {
        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
        if (this.prerelease[0] === identifier) {
          if (isNaN(this.prerelease[1])) {
            this.prerelease = [identifier, 0]
          }
        } else {
          this.prerelease = [identifier, 0]
        }
      }
      break

    default:
      throw new Error('invalid increment argument: ' + release)
  }
  this.format()
  this.raw = this.version
  return this
}

exports.inc = inc
function inc (version, release, loose, identifier) {
  if (typeof (loose) === 'string') {
    identifier = loose
    loose = undefined
  }

  try {
    return new SemVer(version, loose).inc(release, identifier).version
  } catch (er) {
    return null
  }
}

exports.diff = diff
function diff (version1, version2) {
  if (eq(version1, version2)) {
    return null
  } else {
    var v1 = parse(version1)
    var v2 = parse(version2)
    var prefix = ''
    if (v1.prerelease.length || v2.prerelease.length) {
      prefix = 'pre'
      var defaultResult = 'prerelease'
    }
    for (var key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return prefix + key
        }
      }
    }
    return defaultResult // may be undefined
  }
}

exports.compareIdentifiers = compareIdentifiers

var numeric = /^[0-9]+$/
function compareIdentifiers (a, b) {
  var anum = numeric.test(a)
  var bnum = numeric.test(b)

  if (anum && bnum) {
    a = +a
    b = +b
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

exports.rcompareIdentifiers = rcompareIdentifiers
function rcompareIdentifiers (a, b) {
  return compareIdentifiers(b, a)
}

exports.major = major
function major (a, loose) {
  return new SemVer(a, loose).major
}

exports.minor = minor
function minor (a, loose) {
  return new SemVer(a, loose).minor
}

exports.patch = patch
function patch (a, loose) {
  return new SemVer(a, loose).patch
}

exports.compare = compare
function compare (a, b, loose) {
  return new SemVer(a, loose).compare(new SemVer(b, loose))
}

exports.compareLoose = compareLoose
function compareLoose (a, b) {
  return compare(a, b, true)
}

exports.rcompare = rcompare
function rcompare (a, b, loose) {
  return compare(b, a, loose)
}

exports.sort = sort
function sort (list, loose) {
  return list.sort(function (a, b) {
    return exports.compare(a, b, loose)
  })
}

exports.rsort = rsort
function rsort (list, loose) {
  return list.sort(function (a, b) {
    return exports.rcompare(a, b, loose)
  })
}

exports.gt = gt
function gt (a, b, loose) {
  return compare(a, b, loose) > 0
}

exports.lt = lt
function lt (a, b, loose) {
  return compare(a, b, loose) < 0
}

exports.eq = eq
function eq (a, b, loose) {
  return compare(a, b, loose) === 0
}

exports.neq = neq
function neq (a, b, loose) {
  return compare(a, b, loose) !== 0
}

exports.gte = gte
function gte (a, b, loose) {
  return compare(a, b, loose) >= 0
}

exports.lte = lte
function lte (a, b, loose) {
  return compare(a, b, loose) <= 0
}

exports.cmp = cmp
function cmp (a, op, b, loose) {
  switch (op) {
    case '===':
      if (typeof a === 'object')
        a = a.version
      if (typeof b === 'object')
        b = b.version
      return a === b

    case '!==':
      if (typeof a === 'object')
        a = a.version
      if (typeof b === 'object')
        b = b.version
      return a !== b

    case '':
    case '=':
    case '==':
      return eq(a, b, loose)

    case '!=':
      return neq(a, b, loose)

    case '>':
      return gt(a, b, loose)

    case '>=':
      return gte(a, b, loose)

    case '<':
      return lt(a, b, loose)

    case '<=':
      return lte(a, b, loose)

    default:
      throw new TypeError('Invalid operator: ' + op)
  }
}

exports.Comparator = Comparator
function Comparator (comp, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  if (comp instanceof Comparator) {
    if (comp.loose === !!options.loose) {
      return comp
    } else {
      comp = comp.value
    }
  }

  if (!(this instanceof Comparator)) {
    return new Comparator(comp, options)
  }

  debug('comparator', comp, options)
  this.options = options
  this.loose = !!options.loose
  this.parse(comp)

  if (this.semver === ANY) {
    this.value = ''
  } else {
    this.value = this.operator + this.semver.version
  }

  debug('comp', this)
}

var ANY = {}
Comparator.prototype.parse = function (comp) {
  var r = this.options.loose ? re[COMPARATORLOOSE] : re[COMPARATOR]
  var m = comp.match(r)

  if (!m) {
    throw new TypeError('Invalid comparator: ' + comp)
  }

  this.operator = m[1]
  if (this.operator === '=') {
    this.operator = ''
  }

  // if it literally is just '>' or '' then allow anything.
  if (!m[2]) {
    this.semver = ANY
  } else {
    this.semver = new SemVer(m[2], this.options.loose)
  }
}

Comparator.prototype.toString = function () {
  return this.value
}

Comparator.prototype.test = function (version) {
  debug('Comparator.test', version, this.options.loose)

  if (this.semver === ANY) {
    return true
  }

  if (typeof version === 'string') {
    version = new SemVer(version, this.options)
  }

  return cmp(version, this.operator, this.semver, this.options)
}

Comparator.prototype.intersects = function (comp, options) {
  if (!(comp instanceof Comparator)) {
    throw new TypeError('a Comparator is required')
  }

  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  var rangeTmp

  if (this.operator === '') {
    rangeTmp = new Range(comp.value, options)
    return satisfies(this.value, rangeTmp, options)
  } else if (comp.operator === '') {
    rangeTmp = new Range(this.value, options)
    return satisfies(comp.semver, rangeTmp, options)
  }

  var sameDirectionIncreasing =
    (this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '>=' || comp.operator === '>')
  var sameDirectionDecreasing =
    (this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '<=' || comp.operator === '<')
  var sameSemVer = this.semver.version === comp.semver.version
  var differentDirectionsInclusive =
    (this.operator === '>=' || this.operator === '<=') &&
    (comp.operator === '>=' || comp.operator === '<=')
  var oppositeDirectionsLessThan =
    cmp(this.semver, '<', comp.semver, options) &&
    ((this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '<=' || comp.operator === '<'))
  var oppositeDirectionsGreaterThan =
    cmp(this.semver, '>', comp.semver, options) &&
    ((this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '>=' || comp.operator === '>'))

  return sameDirectionIncreasing || sameDirectionDecreasing ||
    (sameSemVer && differentDirectionsInclusive) ||
    oppositeDirectionsLessThan || oppositeDirectionsGreaterThan
}

exports.Range = Range
function Range (range, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  if (range instanceof Range) {
    if (range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease) {
      return range
    } else {
      return new Range(range.raw, options)
    }
  }

  if (range instanceof Comparator) {
    return new Range(range.value, options)
  }

  if (!(this instanceof Range)) {
    return new Range(range, options)
  }

  this.options = options
  this.loose = !!options.loose
  this.includePrerelease = !!options.includePrerelease

  // First, split based on boolean or ||
  this.raw = range
  this.set = range.split(/\s*\|\|\s*/).map(function (range) {
    return this.parseRange(range.trim())
  }, this).filter(function (c) {
    // throw out any that are not relevant for whatever reason
    return c.length
  })

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + range)
  }

  this.format()
}

Range.prototype.format = function () {
  this.range = this.set.map(function (comps) {
    return comps.join(' ').trim()
  }).join('||').trim()
  return this.range
}

Range.prototype.toString = function () {
  return this.range
}

Range.prototype.parseRange = function (range) {
  var loose = this.options.loose
  range = range.trim()
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE]
  range = range.replace(hr, hyphenReplace)
  debug('hyphen replace', range)
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace)
  debug('comparator trim', range, re[COMPARATORTRIM])

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(re[TILDETRIM], tildeTrimReplace)

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(re[CARETTRIM], caretTrimReplace)

  // normalize spaces
  range = range.split(/\s+/).join(' ')

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR]
  var set = range.split(' ').map(function (comp) {
    return parseComparator(comp, this.options)
  }, this).join(' ').split(/\s+/)
  if (this.options.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function (comp) {
      return !!comp.match(compRe)
    })
  }
  set = set.map(function (comp) {
    return new Comparator(comp, this.options)
  }, this)

  return set
}

Range.prototype.intersects = function (range, options) {
  if (!(range instanceof Range)) {
    throw new TypeError('a Range is required')
  }

  return this.set.some(function (thisComparators) {
    return thisComparators.every(function (thisComparator) {
      return range.set.some(function (rangeComparators) {
        return rangeComparators.every(function (rangeComparator) {
          return thisComparator.intersects(rangeComparator, options)
        })
      })
    })
  })
}

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators
function toComparators (range, options) {
  return new Range(range, options).set.map(function (comp) {
    return comp.map(function (c) {
      return c.value
    }).join(' ').trim().split(' ')
  })
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator (comp, options) {
  debug('comp', comp, options)
  comp = replaceCarets(comp, options)
  debug('caret', comp)
  comp = replaceTildes(comp, options)
  debug('tildes', comp)
  comp = replaceXRanges(comp, options)
  debug('xrange', comp)
  comp = replaceStars(comp, options)
  debug('stars', comp)
  return comp
}

function isX (id) {
  return !id || id.toLowerCase() === 'x' || id === '*'
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    return replaceTilde(comp, options)
  }).join(' ')
}

function replaceTilde (comp, options) {
  var r = options.loose ? re[TILDELOOSE] : re[TILDE]
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr)
    var ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0'
    } else if (isX(p)) {
      // ~1.2 == >=1.2.0 <1.3.0
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0'
    } else if (pr) {
      debug('replaceTilde pr', pr)
      ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
            ' <' + M + '.' + (+m + 1) + '.0'
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0
      ret = '>=' + M + '.' + m + '.' + p +
            ' <' + M + '.' + (+m + 1) + '.0'
    }

    debug('tilde return', ret)
    return ret
  })
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    return replaceCaret(comp, options)
  }).join(' ')
}

function replaceCaret (comp, options) {
  debug('caret', comp, options)
  var r = options.loose ? re[CARETLOOSE] : re[CARET]
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr)
    var ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0'
    } else if (isX(p)) {
      if (M === '0') {
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0'
      } else {
        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0'
      }
    } else if (pr) {
      debug('replaceCaret pr', pr)
      if (M === '0') {
        if (m === '0') {
          ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
                ' <' + M + '.' + m + '.' + (+p + 1)
        } else {
          ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
                ' <' + M + '.' + (+m + 1) + '.0'
        }
      } else {
        ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
              ' <' + (+M + 1) + '.0.0'
      }
    } else {
      debug('no pr')
      if (M === '0') {
        if (m === '0') {
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + m + '.' + (+p + 1)
        } else {
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + (+m + 1) + '.0'
        }
      } else {
        ret = '>=' + M + '.' + m + '.' + p +
              ' <' + (+M + 1) + '.0.0'
      }
    }

    debug('caret return', ret)
    return ret
  })
}

function replaceXRanges (comp, options) {
  debug('replaceXRanges', comp, options)
  return comp.split(/\s+/).map(function (comp) {
    return replaceXRange(comp, options)
  }).join(' ')
}

function replaceXRange (comp, options) {
  comp = comp.trim()
  var r = options.loose ? re[XRANGELOOSE] : re[XRANGE]
  return comp.replace(r, function (ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr)
    var xM = isX(M)
    var xm = xM || isX(m)
    var xp = xm || isX(p)
    var anyX = xp

    if (gtlt === '=' && anyX) {
      gtlt = ''
    }

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0'
      } else {
        // nothing is forbidden
        ret = '*'
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0
      }
      p = 0

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        // >1.2.3 => >= 1.2.4
        gtlt = '>='
        if (xm) {
          M = +M + 1
          m = 0
          p = 0
        } else {
          m = +m + 1
          p = 0
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<'
        if (xm) {
          M = +M + 1
        } else {
          m = +m + 1
        }
      }

      ret = gtlt + M + '.' + m + '.' + p
    } else if (xm) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0'
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0'
    }

    debug('xRange return', ret)

    return ret
  })
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars (comp, options) {
  debug('replaceStars', comp, options)
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[STAR], '')
}

// This function is passed to string.replace(re[HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
function hyphenReplace ($0,
  from, fM, fm, fp, fpr, fb,
  to, tM, tm, tp, tpr, tb) {
  if (isX(fM)) {
    from = ''
  } else if (isX(fm)) {
    from = '>=' + fM + '.0.0'
  } else if (isX(fp)) {
    from = '>=' + fM + '.' + fm + '.0'
  } else {
    from = '>=' + from
  }

  if (isX(tM)) {
    to = ''
  } else if (isX(tm)) {
    to = '<' + (+tM + 1) + '.0.0'
  } else if (isX(tp)) {
    to = '<' + tM + '.' + (+tm + 1) + '.0'
  } else if (tpr) {
    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr
  } else {
    to = '<=' + to
  }

  return (from + ' ' + to).trim()
}

// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function (version) {
  if (!version) {
    return false
  }

  if (typeof version === 'string') {
    version = new SemVer(version, this.options)
  }

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this.set[i], version, this.options)) {
      return true
    }
  }
  return false
}

function testSet (set, version, options) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (i = 0; i < set.length; i++) {
      debug(set[i].semver)
      if (set[i].semver === ANY) {
        continue
      }

      if (set[i].semver.prerelease.length > 0) {
        var allowed = set[i].semver
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
}

exports.satisfies = satisfies
function satisfies (version, range, options) {
  try {
    range = new Range(range, options)
  } catch (er) {
    return false
  }
  return range.test(version)
}

exports.maxSatisfying = maxSatisfying
function maxSatisfying (versions, range, options) {
  var max = null
  var maxSV = null
  try {
    var rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v
        maxSV = new SemVer(max, options)
      }
    }
  })
  return max
}

exports.minSatisfying = minSatisfying
function minSatisfying (versions, range, options) {
  var min = null
  var minSV = null
  try {
    var rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v
        minSV = new SemVer(min, options)
      }
    }
  })
  return min
}

exports.minVersion = minVersion
function minVersion (range, loose) {
  range = new Range(range, loose)

  var minver = new SemVer('0.0.0')
  if (range.test(minver)) {
    return minver
  }

  minver = new SemVer('0.0.0-0')
  if (range.test(minver)) {
    return minver
  }

  minver = null
  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i]

    comparators.forEach(function (comparator) {
      // Clone to avoid manipulating the comparator's semver object.
      var compver = new SemVer(comparator.semver.version)
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++
          } else {
            compver.prerelease.push(0)
          }
          compver.raw = compver.format()
          /* fallthrough */
        case '':
        case '>=':
          if (!minver || gt(minver, compver)) {
            minver = compver
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error('Unexpected operation: ' + comparator.operator)
      }
    })
  }

  if (minver && range.test(minver)) {
    return minver
  }

  return null
}

exports.validRange = validRange
function validRange (range, options) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*'
  } catch (er) {
    return null
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr
function ltr (version, range, options) {
  return outside(version, range, '<', options)
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr
function gtr (version, range, options) {
  return outside(version, range, '>', options)
}

exports.outside = outside
function outside (version, range, hilo, options) {
  version = new SemVer(version, options)
  range = new Range(range, options)

  var gtfn, ltefn, ltfn, comp, ecomp
  switch (hilo) {
    case '>':
      gtfn = gt
      ltefn = lte
      ltfn = lt
      comp = '>'
      ecomp = '>='
      break
    case '<':
      gtfn = lt
      ltefn = gte
      ltfn = gt
      comp = '<'
      ecomp = '<='
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, options)) {
    return false
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i]

    var high = null
    var low = null

    comparators.forEach(function (comparator) {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0')
      }
      high = high || comparator
      low = low || comparator
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator
      }
    })

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false
    }
  }
  return true
}

exports.prerelease = prerelease
function prerelease (version, options) {
  var parsed = parse(version, options)
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}

exports.intersects = intersects
function intersects (r1, r2, options) {
  r1 = new Range(r1, options)
  r2 = new Range(r2, options)
  return r1.intersects(r2)
}

exports.coerce = coerce
function coerce (version) {
  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  var match = version.match(re[COERCE])

  if (match == null) {
    return null
  }

  return parse(match[1] +
    '.' + (match[2] || '0') +
    '.' + (match[3] || '0'))
}


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = __webpack_require__(17);
const fs = __webpack_require__(0);
const os = __webpack_require__(3);
const path = __webpack_require__(2);
const uuidV4 = __webpack_require__(14);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, "task.json"));
            const errorActionPreference = tl.getInput("errorActionPreference", false) || "Stop";
            switch (errorActionPreference.toUpperCase()) {
                case "STOP":
                case "CONTINUE":
                case "SILENTLYCONTINUE":
                    break;
                default:
                    throw new Error(tl.loc("JS_InvalidErrorActionPreference", errorActionPreference));
            }
            const ServiceEndpoint = tl.getInput("sccmcredentials", true);
            const sccmPackageName = tl.getInput("UniquePackageName", true);
            const sccmPackagePath = tl.getInput("PackagePath", true);
            const sccmFolderPath = tl.getInput("SccmFolderPath", true);
            const dpGroupsString = tl.getInput("dpGroups", true);
            if (dpGroupsString !== undefined) {
                const sccmDpGroups = dpGroupsString.split(",");
            }
            const appName = tl.getInput("appName", true);
            const appDescription = tl.getInput("appDescription", true);
            const appIconPath = tl.getInput("appIcon", true);
            const appKeyword = tl.getInput("appKeyword", false);
            const appVersion = tl.getInput("appVersion", true);
            const appPublisher = tl.getInput("appPublisher", false);
            const endpoint = "";
            console.log(ServiceEndpoint);
            console.log(tl.loc("GeneratingScript"));
            const contents = [];
            contents.push("$pwd = ConvertTo-SecureString 'MyP@55w0rd' -AsPlainText -Force");
            contents.push("$credentials = New-Object System.Management.Automation.PSCredential($user,$pwd)");
            contents.push("Enter-PSSession -ComputerName fsdfsf -Credential $credentials –Authentication CredSSP");
            contents.push("Exit-PSSession");
            tl.assertAgent("2.115.0");
            const tempDirectory = tl.getVariable("agent.tempDirectory");
            if (tempDirectory !== undefined) {
                tl.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);
                const filePath = path.join(tempDirectory, uuidV4() + ".ps1");
                yield fs.writeFile(filePath, "\ufeff" + contents.join(os.EOL), callback);
                const powershell = tl.tool(tl.which("pwsh") || tl.which("powershell") || tl.which("pwsh", true))
                    .arg("-NoLogo")
                    .arg("-NoProfile")
                    .arg("-NonInteractive")
                    .arg("-ExecutionPolicy")
                    .arg("Unrestricted")
                    .arg("-Command")
                    .arg(`. '${filePath.replace(/'/g, "''")}'`);
                const options = {
                    cwd: "./",
                    failOnStdErr: false,
                    errStream: process.stdout,
                    outStream: process.stdout,
                    ignoreReturnCode: true
                };
                const stderrFailure = false;
                const exitCode = yield powershell.exec(options);
                if (exitCode !== 0) {
                    tl.setResult(tl.TaskResult.Failed, tl.loc("JS_ExitCode", exitCode));
                }
                if (stderrFailure) {
                    tl.setResult(tl.TaskResult.Failed, tl.loc("JS_Stderr"));
                }
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message || "run() failed");
        }
    });
}
function callback() { }
run();


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var shell = __webpack_require__(18);
var childProcess = __webpack_require__(8);
var fs = __webpack_require__(0);
var path = __webpack_require__(2);
var os = __webpack_require__(3);
var minimatch = __webpack_require__(11);
var im = __webpack_require__(12);
var tcm = __webpack_require__(13);
var trm = __webpack_require__(44);
var semver = __webpack_require__(15);
var TaskResult;
(function (TaskResult) {
    TaskResult[TaskResult["Succeeded"] = 0] = "Succeeded";
    TaskResult[TaskResult["SucceededWithIssues"] = 1] = "SucceededWithIssues";
    TaskResult[TaskResult["Failed"] = 2] = "Failed";
    TaskResult[TaskResult["Cancelled"] = 3] = "Cancelled";
    TaskResult[TaskResult["Skipped"] = 4] = "Skipped";
})(TaskResult = exports.TaskResult || (exports.TaskResult = {}));
var TaskState;
(function (TaskState) {
    TaskState[TaskState["Unknown"] = 0] = "Unknown";
    TaskState[TaskState["Initialized"] = 1] = "Initialized";
    TaskState[TaskState["InProgress"] = 2] = "InProgress";
    TaskState[TaskState["Completed"] = 3] = "Completed";
})(TaskState = exports.TaskState || (exports.TaskState = {}));
var IssueType;
(function (IssueType) {
    IssueType[IssueType["Error"] = 0] = "Error";
    IssueType[IssueType["Warning"] = 1] = "Warning";
})(IssueType = exports.IssueType || (exports.IssueType = {}));
var ArtifactType;
(function (ArtifactType) {
    ArtifactType[ArtifactType["Container"] = 0] = "Container";
    ArtifactType[ArtifactType["FilePath"] = 1] = "FilePath";
    ArtifactType[ArtifactType["VersionControl"] = 2] = "VersionControl";
    ArtifactType[ArtifactType["GitRef"] = 3] = "GitRef";
    ArtifactType[ArtifactType["TfvcLabel"] = 4] = "TfvcLabel";
})(ArtifactType = exports.ArtifactType || (exports.ArtifactType = {}));
var FieldType;
(function (FieldType) {
    FieldType[FieldType["AuthParameter"] = 0] = "AuthParameter";
    FieldType[FieldType["DataParameter"] = 1] = "DataParameter";
    FieldType[FieldType["Url"] = 2] = "Url";
})(FieldType = exports.FieldType || (exports.FieldType = {}));
/** Platforms supported by our build agent */
var Platform;
(function (Platform) {
    Platform[Platform["Windows"] = 0] = "Windows";
    Platform[Platform["MacOS"] = 1] = "MacOS";
    Platform[Platform["Linux"] = 2] = "Linux";
})(Platform = exports.Platform || (exports.Platform = {}));
//-----------------------------------------------------
// General Helpers
//-----------------------------------------------------
exports.setStdStream = im._setStdStream;
exports.setErrStream = im._setErrStream;
//-----------------------------------------------------
// Results
//-----------------------------------------------------
/**
 * Sets the result of the task.
 * Execution will continue.
 * If not set, task will be Succeeded.
 * If multiple calls are made to setResult the most pessimistic call wins (Failed) regardless of the order of calls.
 *
 * @param result    TaskResult enum of Succeeded, SucceededWithIssues, Failed, Cancelled or Skipped.
 * @param message   A message which will be logged as an error issue if the result is Failed.
 * @param done      Optional. Instructs the agent the task is done. This is helpful when child processes
 *                  may still be running and prevent node from fully exiting. This argument is supported
 *                  from agent version 2.142.0 or higher (otherwise will no-op).
 * @returns         void
 */
function setResult(result, message, done) {
    exports.debug('task result: ' + TaskResult[result]);
    // add an error issue
    if (result == TaskResult.Failed && message) {
        exports.error(message);
    }
    else if (result == TaskResult.SucceededWithIssues && message) {
        exports.warning(message);
    }
    // task.complete
    var properties = { 'result': TaskResult[result] };
    if (done) {
        properties['done'] = 'true';
    }
    exports.command('task.complete', properties, message);
}
exports.setResult = setResult;
//
// Catching all exceptions
//
process.on('uncaughtException', function (err) {
    setResult(TaskResult.Failed, exports.loc('LIB_UnhandledEx', err.message));
});
//-----------------------------------------------------
// Loc Helpers
//-----------------------------------------------------
exports.setResourcePath = im._setResourcePath;
exports.loc = im._loc;
//-----------------------------------------------------
// Input Helpers
//-----------------------------------------------------
exports.getVariable = im._getVariable;
/**
 * Asserts the agent version is at least the specified minimum.
 *
 * @param    minimum    minimum version version - must be 2.104.1 or higher
 */
function assertAgent(minimum) {
    if (semver.lt(minimum, '2.104.1')) {
        throw new Error('assertAgent() requires the parameter to be 2.104.1 or higher');
    }
    var agent = exports.getVariable('Agent.Version');
    if (agent && semver.lt(agent, minimum)) {
        throw new Error("Agent version " + minimum + " or higher is required");
    }
}
exports.assertAgent = assertAgent;
/**
 * Gets a snapshot of the current state of all job variables available to the task.
 * Requires a 2.104.1 agent or higher for full functionality.
 *
 * Limitations on an agent prior to 2.104.1:
 *  1) The return value does not include all public variables. Only public variables
 *     that have been added using setVariable are returned.
 *  2) The name returned for each secret variable is the formatted environment variable
 *     name, not the actual variable name (unless it was set explicitly at runtime using
 *     setVariable).
 *
 * @returns VariableInfo[]
 */
function getVariables() {
    return Object.keys(im._knownVariableMap)
        .map(function (key) {
        var info = im._knownVariableMap[key];
        return { name: info.name, value: exports.getVariable(info.name), secret: info.secret };
    });
}
exports.getVariables = getVariables;
/**
 * Sets a variable which will be available to subsequent tasks as well.
 *
 * @param     name    name of the variable to set
 * @param     val     value to set
 * @param     secret  whether variable is secret.  Multi-line secrets are not allowed.  Optional, defaults to false
 * @returns   void
 */
function setVariable(name, val, secret) {
    if (secret === void 0) { secret = false; }
    // once a secret always a secret
    var key = im._getVariableKey(name);
    if (im._knownVariableMap.hasOwnProperty(key)) {
        secret = secret || im._knownVariableMap[key].secret;
    }
    // store the value
    var varValue = val || '';
    exports.debug('set ' + name + '=' + (secret && varValue ? '********' : varValue));
    if (secret) {
        if (varValue && varValue.match(/\r|\n/) && ("" + process.env['SYSTEM_UNSAFEALLOWMULTILINESECRET']).toUpperCase() != 'TRUE') {
            throw new Error(exports.loc('LIB_MultilineSecret'));
        }
        im._vault.storeSecret('SECRET_' + key, varValue);
        delete process.env[key];
    }
    else {
        process.env[key] = varValue;
    }
    // store the metadata
    im._knownVariableMap[key] = { name: name, secret: secret };
    // write the command
    exports.command('task.setvariable', { 'variable': name || '', 'issecret': (secret || false).toString() }, varValue);
}
exports.setVariable = setVariable;
/**
 * Registers a value with the logger, so the value will be masked from the logs.  Multi-line secrets are not allowed.
 *
 * @param val value to register
 */
function setSecret(val) {
    if (val) {
        if (val.match(/\r|\n/) && ("" + process.env['SYSTEM_UNSAFEALLOWMULTILINESECRET']).toUpperCase() !== 'TRUE') {
            throw new Error(exports.loc('LIB_MultilineSecret'));
        }
        exports.command('task.setsecret', {}, val);
    }
}
exports.setSecret = setSecret;
/**
 * Gets the value of an input.  The value is also trimmed.
 * If required is true and the value is not set, it will throw.
 *
 * @param     name     name of the input to get
 * @param     required whether input is required.  optional, defaults to false
 * @returns   string
 */
function getInput(name, required) {
    var inval = im._vault.retrieveSecret('INPUT_' + im._getVariableKey(name));
    if (inval) {
        inval = inval.trim();
    }
    if (required && !inval) {
        throw new Error(exports.loc('LIB_InputRequired', name));
    }
    exports.debug(name + '=' + inval);
    return inval;
}
exports.getInput = getInput;
/**
 * Gets the value of an input and converts to a bool.  Convenience.
 * If required is true and the value is not set, it will throw.
 * If required is false and the value is not set, returns false.
 *
 * @param     name     name of the bool input to get
 * @param     required whether input is required.  optional, defaults to false
 * @returns   boolean
 */
function getBoolInput(name, required) {
    return (getInput(name, required) || '').toUpperCase() == "TRUE";
}
exports.getBoolInput = getBoolInput;
/**
 * Gets the value of an input and splits the value using a delimiter (space, comma, etc).
 * Empty values are removed.  This function is useful for splitting an input containing a simple
 * list of items - such as build targets.
 * IMPORTANT: Do not use this function for splitting additional args!  Instead use argString(), which
 * follows normal argument splitting rules and handles values encapsulated by quotes.
 * If required is true and the value is not set, it will throw.
 *
 * @param     name     name of the input to get
 * @param     delim    delimiter to split on
 * @param     required whether input is required.  optional, defaults to false
 * @returns   string[]
 */
function getDelimitedInput(name, delim, required) {
    var inputVal = getInput(name, required);
    if (!inputVal) {
        return [];
    }
    var result = [];
    inputVal.split(delim).forEach(function (x) {
        if (x) {
            result.push(x);
        }
    });
    return result;
}
exports.getDelimitedInput = getDelimitedInput;
/**
 * Checks whether a path inputs value was supplied by the user
 * File paths are relative with a picker, so an empty path is the root of the repo.
 * Useful if you need to condition work (like append an arg) if a value was supplied
 *
 * @param     name      name of the path input to check
 * @returns   boolean
 */
function filePathSupplied(name) {
    // normalize paths
    var pathValue = this.resolve(this.getPathInput(name) || '');
    var repoRoot = this.resolve(exports.getVariable('build.sourcesDirectory') || exports.getVariable('system.defaultWorkingDirectory') || '');
    var supplied = pathValue !== repoRoot;
    exports.debug(name + 'path supplied :' + supplied);
    return supplied;
}
exports.filePathSupplied = filePathSupplied;
/**
 * Gets the value of a path input
 * It will be quoted for you if it isn't already and contains spaces
 * If required is true and the value is not set, it will throw.
 * If check is true and the path does not exist, it will throw.
 *
 * @param     name      name of the input to get
 * @param     required  whether input is required.  optional, defaults to false
 * @param     check     whether path is checked.  optional, defaults to false
 * @returns   string
 */
function getPathInput(name, required, check) {
    var inval = getInput(name, required);
    if (inval) {
        if (check) {
            exports.checkPath(inval, name);
        }
    }
    return inval;
}
exports.getPathInput = getPathInput;
//-----------------------------------------------------
// Endpoint Helpers
//-----------------------------------------------------
/**
 * Gets the url for a service endpoint
 * If the url was not set and is not optional, it will throw.
 *
 * @param     id        name of the service endpoint
 * @param     optional  whether the url is optional
 * @returns   string
 */
function getEndpointUrl(id, optional) {
    var urlval = process.env['ENDPOINT_URL_' + id];
    if (!optional && !urlval) {
        throw new Error(exports.loc('LIB_EndpointNotExist', id));
    }
    exports.debug(id + '=' + urlval);
    return urlval;
}
exports.getEndpointUrl = getEndpointUrl;
/*
 * Gets the endpoint data parameter value with specified key for a service endpoint
 * If the endpoint data parameter was not set and is not optional, it will throw.
 *
 * @param id name of the service endpoint
 * @param key of the parameter
 * @param optional whether the endpoint data is optional
 * @returns {string} value of the endpoint data parameter
 */
function getEndpointDataParameter(id, key, optional) {
    var dataParamVal = process.env['ENDPOINT_DATA_' + id + '_' + key.toUpperCase()];
    if (!optional && !dataParamVal) {
        throw new Error(exports.loc('LIB_EndpointDataNotExist', id, key));
    }
    exports.debug(id + ' data ' + key + ' = ' + dataParamVal);
    return dataParamVal;
}
exports.getEndpointDataParameter = getEndpointDataParameter;
/**
 * Gets the endpoint authorization scheme for a service endpoint
 * If the endpoint authorization scheme is not set and is not optional, it will throw.
 *
 * @param id name of the service endpoint
 * @param optional whether the endpoint authorization scheme is optional
 * @returns {string} value of the endpoint authorization scheme
 */
function getEndpointAuthorizationScheme(id, optional) {
    var authScheme = im._vault.retrieveSecret('ENDPOINT_AUTH_SCHEME_' + id);
    if (!optional && !authScheme) {
        throw new Error(exports.loc('LIB_EndpointAuthNotExist', id));
    }
    exports.debug(id + ' auth scheme = ' + authScheme);
    return authScheme;
}
exports.getEndpointAuthorizationScheme = getEndpointAuthorizationScheme;
/**
 * Gets the endpoint authorization parameter value for a service endpoint with specified key
 * If the endpoint authorization parameter is not set and is not optional, it will throw.
 *
 * @param id name of the service endpoint
 * @param key key to find the endpoint authorization parameter
 * @param optional optional whether the endpoint authorization scheme is optional
 * @returns {string} value of the endpoint authorization parameter value
 */
function getEndpointAuthorizationParameter(id, key, optional) {
    var authParam = im._vault.retrieveSecret('ENDPOINT_AUTH_PARAMETER_' + id + '_' + key.toUpperCase());
    if (!optional && !authParam) {
        throw new Error(exports.loc('LIB_EndpointAuthNotExist', id));
    }
    exports.debug(id + ' auth param ' + key + ' = ' + authParam);
    return authParam;
}
exports.getEndpointAuthorizationParameter = getEndpointAuthorizationParameter;
/**
 * Gets the authorization details for a service endpoint
 * If the authorization was not set and is not optional, it will throw.
 *
 * @param     id        name of the service endpoint
 * @param     optional  whether the url is optional
 * @returns   string
 */
function getEndpointAuthorization(id, optional) {
    var aval = im._vault.retrieveSecret('ENDPOINT_AUTH_' + id);
    if (!optional && !aval) {
        setResult(TaskResult.Failed, exports.loc('LIB_EndpointAuthNotExist', id));
    }
    exports.debug(id + ' exists ' + (aval !== null));
    var auth;
    try {
        if (aval) {
            auth = JSON.parse(aval);
        }
    }
    catch (err) {
        throw new Error(exports.loc('LIB_InvalidEndpointAuth', aval));
    }
    return auth;
}
exports.getEndpointAuthorization = getEndpointAuthorization;
//-----------------------------------------------------
// SecureFile Helpers
//-----------------------------------------------------
/**
 * Gets the name for a secure file
 *
 * @param     id        secure file id
 * @returns   string
 */
function getSecureFileName(id) {
    var name = process.env['SECUREFILE_NAME_' + id];
    exports.debug('secure file name for id ' + id + ' = ' + name);
    return name;
}
exports.getSecureFileName = getSecureFileName;
/**
  * Gets the secure file ticket that can be used to download the secure file contents
  *
  * @param id name of the secure file
  * @returns {string} secure file ticket
  */
function getSecureFileTicket(id) {
    var ticket = im._vault.retrieveSecret('SECUREFILE_TICKET_' + id);
    exports.debug('secure file ticket for id ' + id + ' = ' + ticket);
    return ticket;
}
exports.getSecureFileTicket = getSecureFileTicket;
//-----------------------------------------------------
// Task Variable Helpers
//-----------------------------------------------------
/**
 * Gets a variable value that is set by previous step from the same wrapper task.
 * Requires a 2.115.0 agent or higher.
 *
 * @param     name     name of the variable to get
 * @returns   string
 */
function getTaskVariable(name) {
    assertAgent('2.115.0');
    var inval = im._vault.retrieveSecret('VSTS_TASKVARIABLE_' + im._getVariableKey(name));
    if (inval) {
        inval = inval.trim();
    }
    exports.debug('task variable: ' + name + '=' + inval);
    return inval;
}
exports.getTaskVariable = getTaskVariable;
/**
 * Sets a task variable which will only be available to subsequent steps belong to the same wrapper task.
 * Requires a 2.115.0 agent or higher.
 *
 * @param     name    name of the variable to set
 * @param     val     value to set
 * @param     secret  whether variable is secret.  optional, defaults to false
 * @returns   void
 */
function setTaskVariable(name, val, secret) {
    if (secret === void 0) { secret = false; }
    assertAgent('2.115.0');
    var key = im._getVariableKey(name);
    // store the value
    var varValue = val || '';
    exports.debug('set task variable: ' + name + '=' + (secret && varValue ? '********' : varValue));
    im._vault.storeSecret('VSTS_TASKVARIABLE_' + key, varValue);
    delete process.env[key];
    // write the command
    exports.command('task.settaskvariable', { 'variable': name || '', 'issecret': (secret || false).toString() }, varValue);
}
exports.setTaskVariable = setTaskVariable;
//-----------------------------------------------------
// Cmd Helpers
//-----------------------------------------------------
exports.command = im._command;
exports.warning = im._warning;
exports.error = im._error;
exports.debug = im._debug;
//-----------------------------------------------------
// Disk Functions
//-----------------------------------------------------
function _checkShell(cmd, continueOnError) {
    var se = shell.error();
    if (se) {
        exports.debug(cmd + ' failed');
        var errMsg = exports.loc('LIB_OperationFailed', cmd, se);
        exports.debug(errMsg);
        if (!continueOnError) {
            throw new Error(errMsg);
        }
    }
}
/**
 * Get's stat on a path.
 * Useful for checking whether a file or directory.  Also getting created, modified and accessed time.
 * see [fs.stat](https://nodejs.org/api/fs.html#fs_class_fs_stats)
 *
 * @param     path      path to check
 * @returns   fsStat
 */
function stats(path) {
    return fs.statSync(path);
}
exports.stats = stats;
exports.exist = im._exist;
function writeFile(file, data, options) {
    if (typeof (options) === 'string') {
        fs.writeFileSync(file, data, { encoding: options });
    }
    else {
        fs.writeFileSync(file, data, options);
    }
}
exports.writeFile = writeFile;
/**
 * @deprecated Use `getPlatform`
 * Useful for determining the host operating system.
 * see [os.type](https://nodejs.org/api/os.html#os_os_type)
 *
 * @return      the name of the operating system
 */
function osType() {
    return os.type();
}
exports.osType = osType;
/**
 * Determine the operating system the build agent is running on.
 * @returns {Platform}
 * @throws {Error} Platform is not supported by our agent
 */
function getPlatform() {
    switch (process.platform) {
        case 'win32': return Platform.Windows;
        case 'darwin': return Platform.MacOS;
        case 'linux': return Platform.Linux;
        default: throw Error(exports.loc('LIB_PlatformNotSupported', process.platform));
    }
}
exports.getPlatform = getPlatform;
/**
 * Returns the process's current working directory.
 * see [process.cwd](https://nodejs.org/api/process.html#process_process_cwd)
 *
 * @return      the path to the current working directory of the process
 */
function cwd() {
    return process.cwd();
}
exports.cwd = cwd;
exports.checkPath = im._checkPath;
/**
 * Change working directory.
 *
 * @param     path      new working directory path
 * @returns   void
 */
function cd(path) {
    if (path) {
        shell.cd(path);
        _checkShell('cd');
    }
}
exports.cd = cd;
/**
 * Change working directory and push it on the stack
 *
 * @param     path      new working directory path
 * @returns   void
 */
function pushd(path) {
    shell.pushd(path);
    _checkShell('pushd');
}
exports.pushd = pushd;
/**
 * Change working directory back to previously pushed directory
 *
 * @returns   void
 */
function popd() {
    shell.popd();
    _checkShell('popd');
}
exports.popd = popd;
/**
 * Make a directory.  Creates the full path with folders in between
 * Will throw if it fails
 *
 * @param     p       path to create
 * @returns   void
 */
function mkdirP(p) {
    if (!p) {
        throw new Error(exports.loc('LIB_ParameterIsRequired', 'p'));
    }
    // build a stack of directories to create
    var stack = [];
    var testDir = p;
    while (true) {
        // validate the loop is not out of control
        if (stack.length >= (process.env['TASKLIB_TEST_MKDIRP_FAILSAFE'] || 1000)) {
            // let the framework throw
            exports.debug('loop is out of control');
            fs.mkdirSync(p);
            return;
        }
        exports.debug("testing directory '" + testDir + "'");
        var stats_1 = void 0;
        try {
            stats_1 = fs.statSync(testDir);
        }
        catch (err) {
            if (err.code == 'ENOENT') {
                // validate the directory is not the drive root
                var parentDir = path.dirname(testDir);
                if (testDir == parentDir) {
                    throw new Error(exports.loc('LIB_MkdirFailedInvalidDriveRoot', p, testDir)); // Unable to create directory '{p}'. Root directory does not exist: '{testDir}'
                }
                // push the dir and test the parent
                stack.push(testDir);
                testDir = parentDir;
                continue;
            }
            else if (err.code == 'UNKNOWN') {
                throw new Error(exports.loc('LIB_MkdirFailedInvalidShare', p, testDir)); // Unable to create directory '{p}'. Unable to verify the directory exists: '{testDir}'. If directory is a file share, please verify the share name is correct, the share is online, and the current process has permission to access the share.
            }
            else {
                throw err;
            }
        }
        if (!stats_1.isDirectory()) {
            throw new Error(exports.loc('LIB_MkdirFailedFileExists', p, testDir)); // Unable to create directory '{p}'. Conflicting file exists: '{testDir}'
        }
        // testDir exists
        break;
    }
    // create each directory
    while (stack.length) {
        var dir = stack.pop(); // non-null because `stack.length` was truthy
        exports.debug("mkdir '" + dir + "'");
        try {
            fs.mkdirSync(dir);
        }
        catch (err) {
            throw new Error(exports.loc('LIB_MkdirFailed', p, err.message)); // Unable to create directory '{p}'. {err.message}
        }
    }
}
exports.mkdirP = mkdirP;
/**
 * Resolves a sequence of paths or path segments into an absolute path.
 * Calls node.js path.resolve()
 * Allows L0 testing with consistent path formats on Mac/Linux and Windows in the mock implementation
 * @param pathSegments
 * @returns {string}
 */
function resolve() {
    var pathSegments = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        pathSegments[_i] = arguments[_i];
    }
    var absolutePath = path.resolve.apply(this, pathSegments);
    exports.debug('Absolute path for pathSegments: ' + pathSegments + ' = ' + absolutePath);
    return absolutePath;
}
exports.resolve = resolve;
exports.which = im._which;
/**
 * Returns array of files in the given path, or in current directory if no path provided.  See shelljs.ls
 * @param  {string}   options  Available options: -R (recursive), -A (all files, include files beginning with ., except for . and ..)
 * @param  {string[]} paths    Paths to search.
 * @return {string[]}          An array of files in the given path(s).
 */
function ls(options, paths) {
    if (options) {
        return shell.ls(options, paths);
    }
    else {
        return shell.ls(paths);
    }
}
exports.ls = ls;
/**
 * Copies a file or folder.
 *
 * @param     source     source path
 * @param     dest       destination path
 * @param     options    string -r, -f or -rf for recursive and force
 * @param     continueOnError optional. whether to continue on error
 */
function cp(source, dest, options, continueOnError) {
    if (options) {
        shell.cp(options, source, dest);
    }
    else {
        shell.cp(source, dest);
    }
    _checkShell('cp', continueOnError);
}
exports.cp = cp;
/**
 * Moves a path.
 *
 * @param     source     source path
 * @param     dest       destination path
 * @param     options    string -f or -n for force and no clobber
 * @param     continueOnError optional. whether to continue on error
 */
function mv(source, dest, options, continueOnError) {
    if (options) {
        shell.mv(options, source, dest);
    }
    else {
        shell.mv(source, dest);
    }
    _checkShell('mv', continueOnError);
}
exports.mv = mv;
/**
 * Recursively finds all paths a given path. Returns an array of paths.
 *
 * @param     findPath  path to search
 * @param     options   optional. defaults to { followSymbolicLinks: true }. following soft links is generally appropriate unless deleting files.
 * @returns   string[]
 */
function find(findPath, options) {
    if (!findPath) {
        exports.debug('no path specified');
        return [];
    }
    // normalize the path, otherwise the first result is inconsistently formatted from the rest of the results
    // because path.join() performs normalization.
    findPath = path.normalize(findPath);
    // debug trace the parameters
    exports.debug("findPath: '" + findPath + "'");
    options = options || _getDefaultFindOptions();
    _debugFindOptions(options);
    // return empty if not exists
    try {
        fs.lstatSync(findPath);
    }
    catch (err) {
        if (err.code == 'ENOENT') {
            exports.debug('0 results');
            return [];
        }
        throw err;
    }
    try {
        var result = [];
        // push the first item
        var stack = [new _FindItem(findPath, 1)];
        var traversalChain = []; // used to detect cycles
        var _loop_1 = function () {
            // pop the next item and push to the result array
            var item = stack.pop(); // non-null because `stack.length` was truthy
            result.push(item.path);
            // stat the item.  the stat info is used further below to determine whether to traverse deeper
            //
            // stat returns info about the target of a symlink (or symlink chain),
            // lstat returns info about a symlink itself
            var stats_2 = void 0;
            if (options.followSymbolicLinks) {
                try {
                    // use stat (following all symlinks)
                    stats_2 = fs.statSync(item.path);
                }
                catch (err) {
                    if (err.code == 'ENOENT' && options.allowBrokenSymbolicLinks) {
                        // fallback to lstat (broken symlinks allowed)
                        stats_2 = fs.lstatSync(item.path);
                        exports.debug("  " + item.path + " (broken symlink)");
                    }
                    else {
                        throw err;
                    }
                }
            }
            else if (options.followSpecifiedSymbolicLink && result.length == 1) {
                try {
                    // use stat (following symlinks for the specified path and this is the specified path)
                    stats_2 = fs.statSync(item.path);
                }
                catch (err) {
                    if (err.code == 'ENOENT' && options.allowBrokenSymbolicLinks) {
                        // fallback to lstat (broken symlinks allowed)
                        stats_2 = fs.lstatSync(item.path);
                        exports.debug("  " + item.path + " (broken symlink)");
                    }
                    else {
                        throw err;
                    }
                }
            }
            else {
                // use lstat (not following symlinks)
                stats_2 = fs.lstatSync(item.path);
            }
            // note, isDirectory() returns false for the lstat of a symlink
            if (stats_2.isDirectory()) {
                exports.debug("  " + item.path + " (directory)");
                if (options.followSymbolicLinks) {
                    // get the realpath
                    var realPath_1 = fs.realpathSync(item.path);
                    // fixup the traversal chain to match the item level
                    while (traversalChain.length >= item.level) {
                        traversalChain.pop();
                    }
                    // test for a cycle
                    if (traversalChain.some(function (x) { return x == realPath_1; })) {
                        exports.debug('    cycle detected');
                        return "continue";
                    }
                    // update the traversal chain
                    traversalChain.push(realPath_1);
                }
                // push the child items in reverse onto the stack
                var childLevel_1 = item.level + 1;
                var childItems = fs.readdirSync(item.path)
                    .map(function (childName) { return new _FindItem(path.join(item.path, childName), childLevel_1); });
                for (var i = childItems.length - 1; i >= 0; i--) {
                    stack.push(childItems[i]);
                }
            }
            else {
                exports.debug("  " + item.path + " (file)");
            }
        };
        while (stack.length) {
            _loop_1();
        }
        exports.debug(result.length + " results");
        return result;
    }
    catch (err) {
        throw new Error(exports.loc('LIB_OperationFailed', 'find', err.message));
    }
}
exports.find = find;
var _FindItem = /** @class */ (function () {
    function _FindItem(path, level) {
        this.path = path;
        this.level = level;
    }
    return _FindItem;
}());
function _debugFindOptions(options) {
    exports.debug("findOptions.allowBrokenSymbolicLinks: '" + options.allowBrokenSymbolicLinks + "'");
    exports.debug("findOptions.followSpecifiedSymbolicLink: '" + options.followSpecifiedSymbolicLink + "'");
    exports.debug("findOptions.followSymbolicLinks: '" + options.followSymbolicLinks + "'");
}
function _getDefaultFindOptions() {
    return {
        allowBrokenSymbolicLinks: false,
        followSpecifiedSymbolicLink: true,
        followSymbolicLinks: true
    };
}
/**
 * Prefer tl.find() and tl.match() instead. This function is for backward compatibility
 * when porting tasks to Node from the PowerShell or PowerShell3 execution handler.
 *
 * @param    rootDirectory      path to root unrooted patterns with
 * @param    pattern            include and exclude patterns
 * @param    includeFiles       whether to include files in the result. defaults to true when includeFiles and includeDirectories are both false
 * @param    includeDirectories whether to include directories in the result
 * @returns  string[]
 */
function legacyFindFiles(rootDirectory, pattern, includeFiles, includeDirectories) {
    if (!pattern) {
        throw new Error('pattern parameter cannot be empty');
    }
    exports.debug("legacyFindFiles rootDirectory: '" + rootDirectory + "'");
    exports.debug("pattern: '" + pattern + "'");
    exports.debug("includeFiles: '" + includeFiles + "'");
    exports.debug("includeDirectories: '" + includeDirectories + "'");
    if (!includeFiles && !includeDirectories) {
        includeFiles = true;
    }
    // organize the patterns into include patterns and exclude patterns
    var includePatterns = [];
    var excludePatterns = [];
    pattern = pattern.replace(/;;/g, '\0');
    for (var _i = 0, _a = pattern.split(';'); _i < _a.length; _i++) {
        var pat = _a[_i];
        if (!pat) {
            continue;
        }
        pat = pat.replace(/\0/g, ';');
        // determine whether include pattern and remove any include/exclude prefix.
        // include patterns start with +: or anything other than -:
        // exclude patterns start with -:
        var isIncludePattern = void 0;
        if (im._startsWith(pat, '+:')) {
            pat = pat.substring(2);
            isIncludePattern = true;
        }
        else if (im._startsWith(pat, '-:')) {
            pat = pat.substring(2);
            isIncludePattern = false;
        }
        else {
            isIncludePattern = true;
        }
        // validate pattern does not end with a slash
        if (im._endsWith(pat, '/') || (process.platform == 'win32' && im._endsWith(pat, '\\'))) {
            throw new Error(exports.loc('LIB_InvalidPattern', pat));
        }
        // root the pattern
        if (rootDirectory && !path.isAbsolute(pat)) {
            pat = path.join(rootDirectory, pat);
            // remove trailing slash sometimes added by path.join() on Windows, e.g.
            //      path.join('\\\\hello', 'world') => '\\\\hello\\world\\'
            //      path.join('//hello', 'world') => '\\\\hello\\world\\'
            if (im._endsWith(pat, '\\')) {
                pat = pat.substring(0, pat.length - 1);
            }
        }
        if (isIncludePattern) {
            includePatterns.push(pat);
        }
        else {
            excludePatterns.push(im._legacyFindFiles_convertPatternToRegExp(pat));
        }
    }
    // find and apply patterns
    var count = 0;
    var result = _legacyFindFiles_getMatchingItems(includePatterns, excludePatterns, !!includeFiles, !!includeDirectories);
    exports.debug('all matches:');
    for (var _b = 0, result_1 = result; _b < result_1.length; _b++) {
        var resultItem = result_1[_b];
        exports.debug(' ' + resultItem);
    }
    exports.debug('total matched: ' + result.length);
    return result;
}
exports.legacyFindFiles = legacyFindFiles;
function _legacyFindFiles_getMatchingItems(includePatterns, excludePatterns, includeFiles, includeDirectories) {
    exports.debug('getMatchingItems()');
    for (var _i = 0, includePatterns_1 = includePatterns; _i < includePatterns_1.length; _i++) {
        var pattern = includePatterns_1[_i];
        exports.debug("includePattern: '" + pattern + "'");
    }
    for (var _a = 0, excludePatterns_1 = excludePatterns; _a < excludePatterns_1.length; _a++) {
        var pattern = excludePatterns_1[_a];
        exports.debug("excludePattern: " + pattern);
    }
    exports.debug('includeFiles: ' + includeFiles);
    exports.debug('includeDirectories: ' + includeDirectories);
    var allFiles = {};
    var _loop_2 = function (pattern) {
        // determine the directory to search
        //
        // note, getDirectoryName removes redundant path separators
        var findPath = void 0;
        var starIndex = pattern.indexOf('*');
        var questionIndex = pattern.indexOf('?');
        if (starIndex < 0 && questionIndex < 0) {
            // if no wildcards are found, use the directory name portion of the path.
            // if there is no directory name (file name only in pattern or drive root),
            // this will return empty string.
            findPath = im._getDirectoryName(pattern);
        }
        else {
            // extract the directory prior to the first wildcard
            var index = Math.min(starIndex >= 0 ? starIndex : questionIndex, questionIndex >= 0 ? questionIndex : starIndex);
            findPath = im._getDirectoryName(pattern.substring(0, index));
        }
        // note, due to this short-circuit and the above usage of getDirectoryName, this
        // function has the same limitations regarding drive roots as the powershell
        // implementation.
        //
        // also note, since getDirectoryName eliminates slash redundancies, some additional
        // work may be required if removal of this limitation is attempted.
        if (!findPath) {
            return "continue";
        }
        var patternRegex = im._legacyFindFiles_convertPatternToRegExp(pattern);
        // find files/directories
        var items = find(findPath, { followSymbolicLinks: true })
            .filter(function (item) {
            if (includeFiles && includeDirectories) {
                return true;
            }
            var isDir = fs.statSync(item).isDirectory();
            return (includeFiles && !isDir) || (includeDirectories && isDir);
        })
            .forEach(function (item) {
            var normalizedPath = process.platform == 'win32' ? item.replace(/\\/g, '/') : item; // normalize separators
            // **/times/** will not match C:/fun/times because there isn't a trailing slash
            // so try both if including directories
            var alternatePath = normalizedPath + "/"; // potential bug: it looks like this will result in a false
            // positive if the item is a regular file and not a directory
            var isMatch = false;
            if (patternRegex.test(normalizedPath) || (includeDirectories && patternRegex.test(alternatePath))) {
                isMatch = true;
                // test whether the path should be excluded
                for (var _i = 0, excludePatterns_2 = excludePatterns; _i < excludePatterns_2.length; _i++) {
                    var regex = excludePatterns_2[_i];
                    if (regex.test(normalizedPath) || (includeDirectories && regex.test(alternatePath))) {
                        isMatch = false;
                        break;
                    }
                }
            }
            if (isMatch) {
                allFiles[item] = item;
            }
        });
    };
    for (var _b = 0, includePatterns_2 = includePatterns; _b < includePatterns_2.length; _b++) {
        var pattern = includePatterns_2[_b];
        _loop_2(pattern);
    }
    return Object.keys(allFiles).sort();
}
/**
 * Remove a path recursively with force
 *
 * @param     inputPath path to remove
 * @throws    when the file or directory exists but could not be deleted.
 */
function rmRF(inputPath) {
    exports.debug('rm -rf ' + inputPath);
    if (getPlatform() == Platform.Windows) {
        // Node doesn't provide a delete operation, only an unlink function. This means that if the file is being used by another
        // program (e.g. antivirus), it won't be deleted. To address this, we shell out the work to rd/del.
        try {
            if (fs.statSync(inputPath).isDirectory()) {
                exports.debug('removing directory ' + inputPath);
                childProcess.execSync("rd /s /q \"" + inputPath + "\"");
            }
            else {
                exports.debug('removing file ' + inputPath);
                childProcess.execSync("del /f /a \"" + inputPath + "\"");
            }
        }
        catch (err) {
            // if you try to delete a file that doesn't exist, desired result is achieved
            // other errors are valid
            if (err.code != 'ENOENT') {
                throw new Error(exports.loc('LIB_OperationFailed', 'rmRF', err.message));
            }
        }
        // Shelling out fails to remove a symlink folder with missing source, this unlink catches that
        try {
            fs.unlinkSync(inputPath);
        }
        catch (err) {
            // if you try to delete a file that doesn't exist, desired result is achieved
            // other errors are valid
            if (err.code != 'ENOENT') {
                throw new Error(exports.loc('LIB_OperationFailed', 'rmRF', err.message));
            }
        }
    }
    else {
        // get the lstats in order to workaround a bug in shelljs@0.3.0 where symlinks
        // with missing targets are not handled correctly by "rm('-rf', path)"
        var lstats = void 0;
        try {
            lstats = fs.lstatSync(inputPath);
        }
        catch (err) {
            // if you try to delete a file that doesn't exist, desired result is achieved
            // other errors are valid
            if (err.code == 'ENOENT') {
                return;
            }
            throw new Error(exports.loc('LIB_OperationFailed', 'rmRF', err.message));
        }
        if (lstats.isDirectory()) {
            exports.debug('removing directory');
            shell.rm('-rf', inputPath);
            var errMsg = shell.error();
            if (errMsg) {
                throw new Error(exports.loc('LIB_OperationFailed', 'rmRF', errMsg));
            }
            return;
        }
        exports.debug('removing file');
        try {
            fs.unlinkSync(inputPath);
        }
        catch (err) {
            throw new Error(exports.loc('LIB_OperationFailed', 'rmRF', err.message));
        }
    }
}
exports.rmRF = rmRF;
/**
 * Exec a tool.  Convenience wrapper over ToolRunner to exec with args in one call.
 * Output will be streamed to the live console.
 * Returns promise with return code
 *
 * @param     tool     path to tool to exec
 * @param     args     an arg string or array of args
 * @param     options  optional exec options.  See IExecOptions
 * @returns   number
 */
function exec(tool, args, options) {
    var tr = this.tool(tool);
    tr.on('debug', function (data) {
        exports.debug(data);
    });
    if (args) {
        if (args instanceof Array) {
            tr.arg(args);
        }
        else if (typeof (args) === 'string') {
            tr.line(args);
        }
    }
    return tr.exec(options);
}
exports.exec = exec;
/**
 * Exec a tool synchronously.  Convenience wrapper over ToolRunner to execSync with args in one call.
 * Output will be *not* be streamed to the live console.  It will be returned after execution is complete.
 * Appropriate for short running tools
 * Returns IExecResult with output and return code
 *
 * @param     tool     path to tool to exec
 * @param     args     an arg string or array of args
 * @param     options  optional exec options.  See IExecSyncOptions
 * @returns   IExecSyncResult
 */
function execSync(tool, args, options) {
    var tr = this.tool(tool);
    tr.on('debug', function (data) {
        exports.debug(data);
    });
    if (args) {
        if (args instanceof Array) {
            tr.arg(args);
        }
        else if (typeof (args) === 'string') {
            tr.line(args);
        }
    }
    return tr.execSync(options);
}
exports.execSync = execSync;
/**
 * Convenience factory to create a ToolRunner.
 *
 * @param     tool     path to tool to exec
 * @returns   ToolRunner
 */
function tool(tool) {
    var tr = new trm.ToolRunner(tool);
    tr.on('debug', function (message) {
        exports.debug(message);
    });
    return tr;
}
exports.tool = tool;
/**
 * Applies glob patterns to a list of paths. Supports interleaved exclude patterns.
 *
 * @param  list         array of paths
 * @param  patterns     patterns to apply. supports interleaved exclude patterns.
 * @param  patternRoot  optional. default root to apply to unrooted patterns. not applied to basename-only patterns when matchBase:true.
 * @param  options      optional. defaults to { dot: true, nobrace: true, nocase: process.platform == 'win32' }.
 */
function match(list, patterns, patternRoot, options) {
    // trace parameters
    exports.debug("patternRoot: '" + patternRoot + "'");
    options = options || _getDefaultMatchOptions(); // default match options
    _debugMatchOptions(options);
    // convert pattern to an array
    if (typeof patterns == 'string') {
        patterns = [patterns];
    }
    // hashtable to keep track of matches
    var map = {};
    var originalOptions = options;
    for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
        var pattern = patterns_1[_i];
        exports.debug("pattern: '" + pattern + "'");
        // trim and skip empty
        pattern = (pattern || '').trim();
        if (!pattern) {
            exports.debug('skipping empty pattern');
            continue;
        }
        // clone match options
        var options_1 = im._cloneMatchOptions(originalOptions);
        // skip comments
        if (!options_1.nocomment && im._startsWith(pattern, '#')) {
            exports.debug('skipping comment');
            continue;
        }
        // set nocomment - brace expansion could result in a leading '#'
        options_1.nocomment = true;
        // determine whether pattern is include or exclude
        var negateCount = 0;
        if (!options_1.nonegate) {
            while (pattern.charAt(negateCount) == '!') {
                negateCount++;
            }
            pattern = pattern.substring(negateCount); // trim leading '!'
            if (negateCount) {
                exports.debug("trimmed leading '!'. pattern: '" + pattern + "'");
            }
        }
        var isIncludePattern = negateCount == 0 ||
            (negateCount % 2 == 0 && !options_1.flipNegate) ||
            (negateCount % 2 == 1 && options_1.flipNegate);
        // set nonegate - brace expansion could result in a leading '!'
        options_1.nonegate = true;
        options_1.flipNegate = false;
        // expand braces - required to accurately root patterns
        var expanded = void 0;
        var preExpanded = pattern;
        if (options_1.nobrace) {
            expanded = [pattern];
        }
        else {
            // convert slashes on Windows before calling braceExpand(). unfortunately this means braces cannot
            // be escaped on Windows, this limitation is consistent with current limitations of minimatch (3.0.3).
            exports.debug('expanding braces');
            var convertedPattern = process.platform == 'win32' ? pattern.replace(/\\/g, '/') : pattern;
            expanded = minimatch.braceExpand(convertedPattern);
        }
        // set nobrace
        options_1.nobrace = true;
        for (var _a = 0, expanded_1 = expanded; _a < expanded_1.length; _a++) {
            var pattern_1 = expanded_1[_a];
            if (expanded.length != 1 || pattern_1 != preExpanded) {
                exports.debug("pattern: '" + pattern_1 + "'");
            }
            // trim and skip empty
            pattern_1 = (pattern_1 || '').trim();
            if (!pattern_1) {
                exports.debug('skipping empty pattern');
                continue;
            }
            // root the pattern when all of the following conditions are true:
            if (patternRoot && // patternRoot supplied
                !im._isRooted(pattern_1) && // AND pattern not rooted
                // AND matchBase:false or not basename only
                (!options_1.matchBase || (process.platform == 'win32' ? pattern_1.replace(/\\/g, '/') : pattern_1).indexOf('/') >= 0)) {
                pattern_1 = im._ensureRooted(patternRoot, pattern_1);
                exports.debug("rooted pattern: '" + pattern_1 + "'");
            }
            if (isIncludePattern) {
                // apply the pattern
                exports.debug('applying include pattern against original list');
                var matchResults = minimatch.match(list, pattern_1, options_1);
                exports.debug(matchResults.length + ' matches');
                // union the results
                for (var _b = 0, matchResults_1 = matchResults; _b < matchResults_1.length; _b++) {
                    var matchResult = matchResults_1[_b];
                    map[matchResult] = true;
                }
            }
            else {
                // apply the pattern
                exports.debug('applying exclude pattern against original list');
                var matchResults = minimatch.match(list, pattern_1, options_1);
                exports.debug(matchResults.length + ' matches');
                // substract the results
                for (var _c = 0, matchResults_2 = matchResults; _c < matchResults_2.length; _c++) {
                    var matchResult = matchResults_2[_c];
                    delete map[matchResult];
                }
            }
        }
    }
    // return a filtered version of the original list (preserves order and prevents duplication)
    var result = list.filter(function (item) { return map.hasOwnProperty(item); });
    exports.debug(result.length + ' final results');
    return result;
}
exports.match = match;
/**
 * Filter to apply glob patterns
 *
 * @param  pattern  pattern to apply
 * @param  options  optional. defaults to { dot: true, nobrace: true, nocase: process.platform == 'win32' }.
 */
function filter(pattern, options) {
    options = options || _getDefaultMatchOptions();
    return minimatch.filter(pattern, options);
}
exports.filter = filter;
function _debugMatchOptions(options) {
    exports.debug("matchOptions.debug: '" + options.debug + "'");
    exports.debug("matchOptions.nobrace: '" + options.nobrace + "'");
    exports.debug("matchOptions.noglobstar: '" + options.noglobstar + "'");
    exports.debug("matchOptions.dot: '" + options.dot + "'");
    exports.debug("matchOptions.noext: '" + options.noext + "'");
    exports.debug("matchOptions.nocase: '" + options.nocase + "'");
    exports.debug("matchOptions.nonull: '" + options.nonull + "'");
    exports.debug("matchOptions.matchBase: '" + options.matchBase + "'");
    exports.debug("matchOptions.nocomment: '" + options.nocomment + "'");
    exports.debug("matchOptions.nonegate: '" + options.nonegate + "'");
    exports.debug("matchOptions.flipNegate: '" + options.flipNegate + "'");
}
function _getDefaultMatchOptions() {
    return {
        debug: false,
        nobrace: true,
        noglobstar: false,
        dot: true,
        noext: false,
        nocase: process.platform == 'win32',
        nonull: false,
        matchBase: false,
        nocomment: false,
        nonegate: false,
        flipNegate: false
    };
}
/**
 * Determines the find root from a list of patterns. Performs the find and then applies the glob patterns.
 * Supports interleaved exclude patterns. Unrooted patterns are rooted using defaultRoot, unless
 * matchOptions.matchBase is specified and the pattern is a basename only. For matchBase cases, the
 * defaultRoot is used as the find root.
 *
 * @param  defaultRoot   default path to root unrooted patterns. falls back to System.DefaultWorkingDirectory or process.cwd().
 * @param  patterns      pattern or array of patterns to apply
 * @param  findOptions   defaults to { followSymbolicLinks: true }. following soft links is generally appropriate unless deleting files.
 * @param  matchOptions  defaults to { dot: true, nobrace: true, nocase: process.platform == 'win32' }
 */
function findMatch(defaultRoot, patterns, findOptions, matchOptions) {
    // apply defaults for parameters and trace
    defaultRoot = defaultRoot || this.getVariable('system.defaultWorkingDirectory') || process.cwd();
    exports.debug("defaultRoot: '" + defaultRoot + "'");
    patterns = patterns || [];
    patterns = typeof patterns == 'string' ? [patterns] : patterns;
    findOptions = findOptions || _getDefaultFindOptions();
    _debugFindOptions(findOptions);
    matchOptions = matchOptions || _getDefaultMatchOptions();
    _debugMatchOptions(matchOptions);
    // normalize slashes for root dir
    defaultRoot = im._normalizeSeparators(defaultRoot);
    var results = {};
    var originalMatchOptions = matchOptions;
    for (var _i = 0, _a = (patterns || []); _i < _a.length; _i++) {
        var pattern = _a[_i];
        exports.debug("pattern: '" + pattern + "'");
        // trim and skip empty
        pattern = (pattern || '').trim();
        if (!pattern) {
            exports.debug('skipping empty pattern');
            continue;
        }
        // clone match options
        var matchOptions_1 = im._cloneMatchOptions(originalMatchOptions);
        // skip comments
        if (!matchOptions_1.nocomment && im._startsWith(pattern, '#')) {
            exports.debug('skipping comment');
            continue;
        }
        // set nocomment - brace expansion could result in a leading '#'
        matchOptions_1.nocomment = true;
        // determine whether pattern is include or exclude
        var negateCount = 0;
        if (!matchOptions_1.nonegate) {
            while (pattern.charAt(negateCount) == '!') {
                negateCount++;
            }
            pattern = pattern.substring(negateCount); // trim leading '!'
            if (negateCount) {
                exports.debug("trimmed leading '!'. pattern: '" + pattern + "'");
            }
        }
        var isIncludePattern = negateCount == 0 ||
            (negateCount % 2 == 0 && !matchOptions_1.flipNegate) ||
            (negateCount % 2 == 1 && matchOptions_1.flipNegate);
        // set nonegate - brace expansion could result in a leading '!'
        matchOptions_1.nonegate = true;
        matchOptions_1.flipNegate = false;
        // expand braces - required to accurately interpret findPath
        var expanded = void 0;
        var preExpanded = pattern;
        if (matchOptions_1.nobrace) {
            expanded = [pattern];
        }
        else {
            // convert slashes on Windows before calling braceExpand(). unfortunately this means braces cannot
            // be escaped on Windows, this limitation is consistent with current limitations of minimatch (3.0.3).
            exports.debug('expanding braces');
            var convertedPattern = process.platform == 'win32' ? pattern.replace(/\\/g, '/') : pattern;
            expanded = minimatch.braceExpand(convertedPattern);
        }
        // set nobrace
        matchOptions_1.nobrace = true;
        for (var _b = 0, expanded_2 = expanded; _b < expanded_2.length; _b++) {
            var pattern_2 = expanded_2[_b];
            if (expanded.length != 1 || pattern_2 != preExpanded) {
                exports.debug("pattern: '" + pattern_2 + "'");
            }
            // trim and skip empty
            pattern_2 = (pattern_2 || '').trim();
            if (!pattern_2) {
                exports.debug('skipping empty pattern');
                continue;
            }
            if (isIncludePattern) {
                // determine the findPath
                var findInfo = im._getFindInfoFromPattern(defaultRoot, pattern_2, matchOptions_1);
                var findPath = findInfo.findPath;
                exports.debug("findPath: '" + findPath + "'");
                if (!findPath) {
                    exports.debug('skipping empty path');
                    continue;
                }
                // perform the find
                exports.debug("statOnly: '" + findInfo.statOnly + "'");
                var findResults = [];
                if (findInfo.statOnly) {
                    // simply stat the path - all path segments were used to build the path
                    try {
                        fs.statSync(findPath);
                        findResults.push(findPath);
                    }
                    catch (err) {
                        if (err.code != 'ENOENT') {
                            throw err;
                        }
                        exports.debug('ENOENT');
                    }
                }
                else {
                    findResults = find(findPath, findOptions);
                }
                exports.debug("found " + findResults.length + " paths");
                // apply the pattern
                exports.debug('applying include pattern');
                if (findInfo.adjustedPattern != pattern_2) {
                    exports.debug("adjustedPattern: '" + findInfo.adjustedPattern + "'");
                    pattern_2 = findInfo.adjustedPattern;
                }
                var matchResults = minimatch.match(findResults, pattern_2, matchOptions_1);
                exports.debug(matchResults.length + ' matches');
                // union the results
                for (var _c = 0, matchResults_3 = matchResults; _c < matchResults_3.length; _c++) {
                    var matchResult = matchResults_3[_c];
                    var key = process.platform == 'win32' ? matchResult.toUpperCase() : matchResult;
                    results[key] = matchResult;
                }
            }
            else {
                // check if basename only and matchBase=true
                if (matchOptions_1.matchBase &&
                    !im._isRooted(pattern_2) &&
                    (process.platform == 'win32' ? pattern_2.replace(/\\/g, '/') : pattern_2).indexOf('/') < 0) {
                    // do not root the pattern
                    exports.debug('matchBase and basename only');
                }
                else {
                    // root the exclude pattern
                    pattern_2 = im._ensurePatternRooted(defaultRoot, pattern_2);
                    exports.debug("after ensurePatternRooted, pattern: '" + pattern_2 + "'");
                }
                // apply the pattern
                exports.debug('applying exclude pattern');
                var matchResults = minimatch.match(Object.keys(results).map(function (key) { return results[key]; }), pattern_2, matchOptions_1);
                exports.debug(matchResults.length + ' matches');
                // substract the results
                for (var _d = 0, matchResults_4 = matchResults; _d < matchResults_4.length; _d++) {
                    var matchResult = matchResults_4[_d];
                    var key = process.platform == 'win32' ? matchResult.toUpperCase() : matchResult;
                    delete results[key];
                }
            }
        }
    }
    var finalResult = Object.keys(results)
        .map(function (key) { return results[key]; })
        .sort();
    exports.debug(finalResult.length + ' final results');
    return finalResult;
}
exports.findMatch = findMatch;
/**
 * Gets http proxy configuration used by Build/Release agent
 *
 * @return  ProxyConfiguration
 */
function getHttpProxyConfiguration(requestUrl) {
    var proxyUrl = exports.getVariable('Agent.ProxyUrl');
    if (proxyUrl && proxyUrl.length > 0) {
        var proxyUsername = exports.getVariable('Agent.ProxyUsername');
        var proxyPassword = exports.getVariable('Agent.ProxyPassword');
        var proxyBypassHosts = JSON.parse(exports.getVariable('Agent.ProxyBypassList') || '[]');
        var bypass_1 = false;
        if (requestUrl) {
            proxyBypassHosts.forEach(function (bypassHost) {
                if (new RegExp(bypassHost, 'i').test(requestUrl)) {
                    bypass_1 = true;
                }
            });
        }
        if (bypass_1) {
            return null;
        }
        else {
            return {
                proxyUrl: proxyUrl,
                proxyUsername: proxyUsername,
                proxyPassword: proxyPassword,
                proxyBypassHosts: proxyBypassHosts
            };
        }
    }
    else {
        return null;
    }
}
exports.getHttpProxyConfiguration = getHttpProxyConfiguration;
/**
 * Gets http certificate configuration used by Build/Release agent
 *
 * @return  CertConfiguration
 */
function getHttpCertConfiguration() {
    var ca = exports.getVariable('Agent.CAInfo');
    var clientCert = exports.getVariable('Agent.ClientCert');
    if (ca || clientCert) {
        var certConfig = {};
        certConfig.caFile = ca;
        certConfig.certFile = clientCert;
        if (clientCert) {
            var clientCertKey = exports.getVariable('Agent.ClientCertKey');
            var clientCertArchive = exports.getVariable('Agent.ClientCertArchive');
            var clientCertPassword = exports.getVariable('Agent.ClientCertPassword');
            certConfig.keyFile = clientCertKey;
            certConfig.certArchiveFile = clientCertArchive;
            certConfig.passphrase = clientCertPassword;
        }
        return certConfig;
    }
    else {
        return null;
    }
}
exports.getHttpCertConfiguration = getHttpCertConfiguration;
//-----------------------------------------------------
// Test Publisher
//-----------------------------------------------------
var TestPublisher = /** @class */ (function () {
    function TestPublisher(testRunner) {
        this.testRunner = testRunner;
    }
    TestPublisher.prototype.publish = function (resultFiles, mergeResults, platform, config, runTitle, publishRunAttachments, testRunSystem) {
        // Could have used an initializer, but wanted to avoid reordering parameters when converting to strict null checks
        // (A parameter cannot both be optional and have an initializer)
        testRunSystem = testRunSystem || "VSTSTask";
        var properties = {};
        properties['type'] = this.testRunner;
        if (mergeResults) {
            properties['mergeResults'] = mergeResults;
        }
        if (platform) {
            properties['platform'] = platform;
        }
        if (config) {
            properties['config'] = config;
        }
        if (runTitle) {
            properties['runTitle'] = runTitle;
        }
        if (publishRunAttachments) {
            properties['publishRunAttachments'] = publishRunAttachments;
        }
        if (resultFiles) {
            properties['resultFiles'] = resultFiles;
        }
        properties['testRunSystem'] = testRunSystem;
        exports.command('results.publish', properties, '');
    };
    return TestPublisher;
}());
exports.TestPublisher = TestPublisher;
//-----------------------------------------------------
// Code coverage Publisher
//-----------------------------------------------------
var CodeCoveragePublisher = /** @class */ (function () {
    function CodeCoveragePublisher() {
    }
    CodeCoveragePublisher.prototype.publish = function (codeCoverageTool, summaryFileLocation, reportDirectory, additionalCodeCoverageFiles) {
        var properties = {};
        if (codeCoverageTool) {
            properties['codecoveragetool'] = codeCoverageTool;
        }
        if (summaryFileLocation) {
            properties['summaryfile'] = summaryFileLocation;
        }
        if (reportDirectory) {
            properties['reportdirectory'] = reportDirectory;
        }
        if (additionalCodeCoverageFiles) {
            properties['additionalcodecoveragefiles'] = additionalCodeCoverageFiles;
        }
        exports.command('codecoverage.publish', properties, "");
    };
    return CodeCoveragePublisher;
}());
exports.CodeCoveragePublisher = CodeCoveragePublisher;
//-----------------------------------------------------
// Code coverage Publisher
//-----------------------------------------------------
var CodeCoverageEnabler = /** @class */ (function () {
    function CodeCoverageEnabler(buildTool, ccTool) {
        this.buildTool = buildTool;
        this.ccTool = ccTool;
    }
    CodeCoverageEnabler.prototype.enableCodeCoverage = function (buildProps) {
        buildProps['buildtool'] = this.buildTool;
        buildProps['codecoveragetool'] = this.ccTool;
        exports.command('codecoverage.enable', buildProps, "");
    };
    return CodeCoverageEnabler;
}());
exports.CodeCoverageEnabler = CodeCoverageEnabler;
//-----------------------------------------------------
// Task Logging Commands
//-----------------------------------------------------
/**
 * Upload user interested file as additional log information
 * to the current timeline record.
 *
 * The file shall be available for download along with task logs.
 *
 * @param path      Path to the file that should be uploaded.
 * @returns         void
 */
function uploadFile(path) {
    exports.command("task.uploadfile", null, path);
}
exports.uploadFile = uploadFile;
/**
 * Instruction for the agent to update the PATH environment variable.
 * The specified directory is prepended to the PATH.
 * The updated environment variable will be reflected in subsequent tasks.
 *
 * @param path      Local directory path.
 * @returns         void
 */
function prependPath(path) {
    assertAgent("2.115.0");
    exports.command("task.prependpath", null, path);
}
exports.prependPath = prependPath;
/**
 * Upload and attach summary markdown to current timeline record.
 * This summary shall be added to the build/release summary and
 * not available for download with logs.
 *
 * @param path      Local directory path.
 * @returns         void
 */
function uploadSummary(path) {
    exports.command("task.uploadsummary", null, path);
}
exports.uploadSummary = uploadSummary;
/**
 * Upload and attach attachment to current timeline record.
 * These files are not available for download with logs.
 * These can only be referred to by extensions using the type or name values.
 *
 * @param type      Attachment type.
 * @param name      Attachment name.
 * @param path      Attachment path.
 * @returns         void
 */
function addAttachment(type, name, path) {
    exports.command("task.addattachment", { "type": type, "name": name }, path);
}
exports.addAttachment = addAttachment;
/**
 * Set an endpoint field with given value.
 * Value updated will be retained in the endpoint for
 * the subsequent tasks that execute within the same job.
 *
 * @param id      Endpoint id.
 * @param field   FieldType enum of AuthParameter, DataParameter or Url.
 * @param key     Key.
 * @param value   Value for key or url.
 * @returns       void
 */
function setEndpoint(id, field, key, value) {
    exports.command("task.setendpoint", { "id": id, "field": FieldType[field].toLowerCase(), "key": key }, value);
}
exports.setEndpoint = setEndpoint;
/**
 * Set progress and current operation for current task.
 *
 * @param percent           Percentage of completion.
 * @param currentOperation  Current pperation.
 * @returns                 void
 */
function setProgress(percent, currentOperation) {
    exports.command("task.setprogress", { "value": "" + percent }, currentOperation);
}
exports.setProgress = setProgress;
/**
 * Indicates whether to write the logging command directly to the host or to the output pipeline.
 *
 * @param id            Timeline record Guid.
 * @param parentId      Parent timeline record Guid.
 * @param recordType    Record type.
 * @param recordName    Record name.
 * @param order         Order of timeline record.
 * @param startTime     Start time.
 * @param finishTime    End time.
 * @param progress      Percentage of completion.
 * @param state         TaskState enum of Unknown, Initialized, InProgress or Completed.
 * @param result        TaskResult enum of Succeeded, SucceededWithIssues, Failed, Cancelled or Skipped.
 * @param message       current operation
 * @returns             void
 */
function logDetail(id, message, parentId, recordType, recordName, order, startTime, finishTime, progress, state, result) {
    var properties = {
        "id": id,
        "parentid": parentId,
        "type": recordType,
        "name": recordName,
        "order": order ? order.toString() : undefined,
        "starttime": startTime,
        "finishtime": finishTime,
        "progress": progress ? progress.toString() : undefined,
        "state": state ? TaskState[state] : undefined,
        "result": result ? TaskResult[result] : undefined
    };
    exports.command("task.logdetail", properties, message);
}
exports.logDetail = logDetail;
/**
 * Log error or warning issue to timeline record of current task.
 *
 * @param type          IssueType enum of Error or Warning.
 * @param sourcePath    Source file location.
 * @param lineNumber    Line number.
 * @param columnNumber  Column number.
 * @param code          Error or warning code.
 * @param message       Error or warning message.
 * @returns             void
 */
function logIssue(type, message, sourcePath, lineNumber, columnNumber, errorCode) {
    var properties = {
        "type": IssueType[type].toLowerCase(),
        "code": errorCode,
        "sourcepath": sourcePath,
        "linenumber": lineNumber ? lineNumber.toString() : undefined,
        "columnnumber": columnNumber ? columnNumber.toString() : undefined,
    };
    exports.command("task.logissue", properties, message);
}
exports.logIssue = logIssue;
//-----------------------------------------------------
// Artifact Logging Commands
//-----------------------------------------------------
/**
 * Upload user interested file as additional log information
 * to the current timeline record.
 *
 * The file shall be available for download along with task logs.
 *
 * @param containerFolder   Folder that the file will upload to, folder will be created if needed.
 * @param path              Path to the file that should be uploaded.
 * @param name              Artifact name.
 * @returns                 void
 */
function uploadArtifact(containerFolder, path, name) {
    exports.command("artifact.upload", { "containerfolder": containerFolder, "artifactname": name }, path);
}
exports.uploadArtifact = uploadArtifact;
/**
 * Create an artifact link, artifact location is required to be
 * a file container path, VC path or UNC share path.
 *
 * The file shall be available for download along with task logs.
 *
 * @param name              Artifact name.
 * @param path              Path to the file that should be associated.
 * @param artifactType      ArtifactType enum of Container, FilePath, VersionControl, GitRef or TfvcLabel.
 * @returns                 void
 */
function associateArtifact(name, path, artifactType) {
    exports.command("artifact.associate", { "type": ArtifactType[artifactType].toLowerCase(), "artifactname": name }, path);
}
exports.associateArtifact = associateArtifact;
//-----------------------------------------------------
// Build Logging Commands
//-----------------------------------------------------
/**
 * Upload user interested log to build’s container “logs\tool” folder.
 *
 * @param path      Path to the file that should be uploaded.
 * @returns         void
 */
function uploadBuildLog(path) {
    exports.command("build.uploadlog", null, path);
}
exports.uploadBuildLog = uploadBuildLog;
/**
 * Update build number for current build.
 *
 * @param value     Value to be assigned as the build number.
 * @returns         void
 */
function updateBuildNumber(value) {
    exports.command("build.updatebuildnumber", null, value);
}
exports.updateBuildNumber = updateBuildNumber;
/**
 * Add a tag for current build.
 *
 * @param value     Tag value.
 * @returns         void
 */
function addBuildTag(value) {
    exports.command("build.addbuildtag", null, value);
}
exports.addBuildTag = addBuildTag;
//-----------------------------------------------------
// Release Logging Commands
//-----------------------------------------------------
/**
 * Update release name for current release.
 *
 * @param value     Value to be assigned as the release name.
 * @returns         void
 */
function updateReleaseName(name) {
    assertAgent("2.132");
    exports.command("release.updatereleasename", null, name);
}
exports.updateReleaseName = updateReleaseName;
//-----------------------------------------------------
// Tools
//-----------------------------------------------------
exports.TaskCommand = tcm.TaskCommand;
exports.commandFromString = tcm.commandFromString;
exports.ToolRunner = trm.ToolRunner;
//-----------------------------------------------------
// Validation Checks
//-----------------------------------------------------
// async await needs generators in node 4.x+
if (semver.lt(process.versions.node, '4.2.0')) {
    this.warning('Tasks require a new agent.  Upgrade your agent or node to 4.2.0 or later');
}
//-------------------------------------------------------------------
// Populate the vault with sensitive data.  Inputs and Endpoints
//-------------------------------------------------------------------
// avoid loading twice (overwrites .taskkey)
if (!global['_vsts_task_lib_loaded']) {
    im._loadData();
    im._exposeProxySettings();
    im._exposeCertSettings();
}


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

//
// ShellJS
// Unix shell commands on top of Node's API
//
// Copyright (c) 2012 Artur Adib
// http://github.com/arturadib/shelljs
//

var common = __webpack_require__(1);


//@
//@ All commands run synchronously, unless otherwise stated.
//@

//@include ./src/cd
var _cd = __webpack_require__(5);
exports.cd = common.wrap('cd', _cd);

//@include ./src/pwd
var _pwd = __webpack_require__(6);
exports.pwd = common.wrap('pwd', _pwd);

//@include ./src/ls
var _ls = __webpack_require__(4);
exports.ls = common.wrap('ls', _ls);

//@include ./src/find
var _find = __webpack_require__(19);
exports.find = common.wrap('find', _find);

//@include ./src/cp
var _cp = __webpack_require__(20);
exports.cp = common.wrap('cp', _cp);

//@include ./src/rm
var _rm = __webpack_require__(21);
exports.rm = common.wrap('rm', _rm);

//@include ./src/mv
var _mv = __webpack_require__(22);
exports.mv = common.wrap('mv', _mv);

//@include ./src/mkdir
var _mkdir = __webpack_require__(23);
exports.mkdir = common.wrap('mkdir', _mkdir);

//@include ./src/test
var _test = __webpack_require__(24);
exports.test = common.wrap('test', _test);

//@include ./src/cat
var _cat = __webpack_require__(25);
exports.cat = common.wrap('cat', _cat);

//@include ./src/to
var _to = __webpack_require__(26);
String.prototype.to = common.wrap('to', _to);

//@include ./src/toEnd
var _toEnd = __webpack_require__(27);
String.prototype.toEnd = common.wrap('toEnd', _toEnd);

//@include ./src/sed
var _sed = __webpack_require__(28);
exports.sed = common.wrap('sed', _sed);

//@include ./src/grep
var _grep = __webpack_require__(29);
exports.grep = common.wrap('grep', _grep);

//@include ./src/which
var _which = __webpack_require__(30);
exports.which = common.wrap('which', _which);

//@include ./src/echo
var _echo = __webpack_require__(31);
exports.echo = _echo; // don't common.wrap() as it could parse '-options'

//@include ./src/dirs
var _dirs = __webpack_require__(7).dirs;
exports.dirs = common.wrap("dirs", _dirs);
var _pushd = __webpack_require__(7).pushd;
exports.pushd = common.wrap('pushd', _pushd);
var _popd = __webpack_require__(7).popd;
exports.popd = common.wrap("popd", _popd);

//@include ./src/ln
var _ln = __webpack_require__(32);
exports.ln = common.wrap('ln', _ln);

//@
//@ ### exit(code)
//@ Exits the current process with the given exit code.
exports.exit = process.exit;

//@
//@ ### env['VAR_NAME']
//@ Object containing environment variables (both getter and setter). Shortcut to process.env.
exports.env = process.env;

//@include ./src/exec
var _exec = __webpack_require__(33);
exports.exec = common.wrap('exec', _exec, {notUnix:true});

//@include ./src/chmod
var _chmod = __webpack_require__(34);
exports.chmod = common.wrap('chmod', _chmod);



//@
//@ ## Non-Unix commands
//@

//@include ./src/tempdir
var _tempDir = __webpack_require__(10);
exports.tempdir = common.wrap('tempdir', _tempDir);


//@include ./src/error
var _error = __webpack_require__(35);
exports.error = _error;



//@
//@ ## Configuration
//@

exports.config = common.config;

//@
//@ ### config.silent
//@ Example:
//@
//@ ```javascript
//@ var silentState = config.silent; // save old silent state
//@ config.silent = true;
//@ /* ... */
//@ config.silent = silentState; // restore old silent state
//@ ```
//@
//@ Suppresses all command output if `true`, except for `echo()` calls.
//@ Default is `false`.

//@
//@ ### config.fatal
//@ Example:
//@
//@ ```javascript
//@ config.fatal = true;
//@ cp('this_file_does_not_exist', '/dev/null'); // dies here
//@ /* more commands... */
//@ ```
//@
//@ If `true` the script will die on errors. Default is `false`.


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var fs = __webpack_require__(0);
var common = __webpack_require__(1);
var _ls = __webpack_require__(4);

//@
//@ ### find(path [,path ...])
//@ ### find(path_array)
//@ Examples:
//@
//@ ```javascript
//@ find('src', 'lib');
//@ find(['src', 'lib']); // same as above
//@ find('.').filter(function(file) { return file.match(/\.js$/); });
//@ ```
//@
//@ Returns array of all files (however deep) in the given paths.
//@
//@ The main difference from `ls('-R', path)` is that the resulting file names
//@ include the base directories, e.g. `lib/resources/file1` instead of just `file1`.
function _find(options, paths) {
  if (!paths)
    common.error('no path specified');
  else if (typeof paths === 'object')
    paths = paths; // assume array
  else if (typeof paths === 'string')
    paths = [].slice.call(arguments, 1);

  var list = [];

  function pushFile(file) {
    if (common.platform === 'win')
      file = file.replace(/\\/g, '/');
    list.push(file);
  }

  // why not simply do ls('-R', paths)? because the output wouldn't give the base dirs
  // to get the base dir in the output, we need instead ls('-R', 'dir/*') for every directory

  paths.forEach(function(file) {
    pushFile(file);

    if (fs.statSync(file).isDirectory()) {
      _ls('-RA', file+'/*').forEach(function(subfile) {
        pushFile(subfile);
      });
    }
  });

  return list;
}
module.exports = _find;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var fs = __webpack_require__(0);
var path = __webpack_require__(2);
var common = __webpack_require__(1);
var os = __webpack_require__(3);

// Buffered file copy, synchronous
// (Using readFileSync() + writeFileSync() could easily cause a memory overflow
//  with large files)
function copyFileSync(srcFile, destFile) {
  if (!fs.existsSync(srcFile))
    common.error('copyFileSync: no such file or directory: ' + srcFile);

  var BUF_LENGTH = 64*1024,
      buf = new Buffer(BUF_LENGTH),
      bytesRead = BUF_LENGTH,
      pos = 0,
      fdr = null,
      fdw = null;

  try {
    fdr = fs.openSync(srcFile, 'r');
  } catch(e) {
    common.error('copyFileSync: could not read src file ('+srcFile+')');
  }

  try {
    fdw = fs.openSync(destFile, 'w');
  } catch(e) {
    common.error('copyFileSync: could not write to dest file (code='+e.code+'):'+destFile);
  }

  while (bytesRead === BUF_LENGTH) {
    bytesRead = fs.readSync(fdr, buf, 0, BUF_LENGTH, pos);
    fs.writeSync(fdw, buf, 0, bytesRead);
    pos += bytesRead;
  }

  fs.closeSync(fdr);
  fs.closeSync(fdw);

  fs.chmodSync(destFile, fs.statSync(srcFile).mode);
}

// Recursively copies 'sourceDir' into 'destDir'
// Adapted from https://github.com/ryanmcgrath/wrench-js
//
// Copyright (c) 2010 Ryan McGrath
// Copyright (c) 2012 Artur Adib
//
// Licensed under the MIT License
// http://www.opensource.org/licenses/mit-license.php
function cpdirSyncRecursive(sourceDir, destDir, opts) {
  if (!opts) opts = {};

  /* Create the directory where all our junk is moving to; read the mode of the source directory and mirror it */
  var checkDir = fs.statSync(sourceDir);
  try {
    fs.mkdirSync(destDir, checkDir.mode);
  } catch (e) {
    //if the directory already exists, that's okay
    if (e.code !== 'EEXIST') throw e;
  }

  var files = fs.readdirSync(sourceDir);

  for (var i = 0; i < files.length; i++) {
    var srcFile = sourceDir + "/" + files[i];
    var destFile = destDir + "/" + files[i];
    var srcFileStat = fs.lstatSync(srcFile);

    if (srcFileStat.isDirectory()) {
      /* recursion this thing right on back. */
      cpdirSyncRecursive(srcFile, destFile, opts);
    } else if (srcFileStat.isSymbolicLink()) {
      var symlinkFull = fs.readlinkSync(srcFile);
      fs.symlinkSync(symlinkFull, destFile, os.platform() === "win32" ? "junction" : null);
    } else {
      /* At this point, we've hit a file actually worth copying... so copy it on over. */
      if (fs.existsSync(destFile) && !opts.force) {
        common.log('skipping existing file: ' + files[i]);
      } else {
        copyFileSync(srcFile, destFile);
      }
    }

  } // for files
} // cpdirSyncRecursive


//@
//@ ### cp([options ,] source [,source ...], dest)
//@ ### cp([options ,] source_array, dest)
//@ Available options:
//@
//@ + `-f`: force
//@ + `-r, -R`: recursive
//@
//@ Examples:
//@
//@ ```javascript
//@ cp('file1', 'dir1');
//@ cp('-Rf', '/tmp/*', '/usr/local/*', '/home/tmp');
//@ cp('-Rf', ['/tmp/*', '/usr/local/*'], '/home/tmp'); // same as above
//@ ```
//@
//@ Copies files. The wildcard `*` is accepted.
function _cp(options, sources, dest) {
  options = common.parseOptions(options, {
    'f': 'force',
    'R': 'recursive',
    'r': 'recursive'
  });

  // Get sources, dest
  if (arguments.length < 3) {
    common.error('missing <source> and/or <dest>');
  } else if (arguments.length > 3) {
    sources = [].slice.call(arguments, 1, arguments.length - 1);
    dest = arguments[arguments.length - 1];
  } else if (typeof sources === 'string') {
    sources = [sources];
  } else if ('length' in sources) {
    sources = sources; // no-op for array
  } else {
    common.error('invalid arguments');
  }

  var exists = fs.existsSync(dest),
      stats = exists && fs.statSync(dest);

  // Dest is not existing dir, but multiple sources given
  if ((!exists || !stats.isDirectory()) && sources.length > 1)
    common.error('dest is not a directory (too many sources)');

  // Dest is an existing file, but no -f given
  if (exists && stats.isFile() && !options.force)
    common.error('dest file already exists: ' + dest);

  if (options.recursive) {
    // Recursive allows the shortcut syntax "sourcedir/" for "sourcedir/*"
    // (see Github issue #15)
    sources.forEach(function(src, i) {
      if (src[src.length - 1] === '/')
        sources[i] += '*';
    });

    // Create dest
    try {
      fs.mkdirSync(dest, parseInt('0777', 8));
    } catch (e) {
      // like Unix's cp, keep going even if we can't create dest dir
    }
  }

  sources = common.expand(sources);

  sources.forEach(function(src) {
    if (!fs.existsSync(src)) {
      common.error('no such file or directory: '+src, true);
      return; // skip file
    }

    // If here, src exists
    if (fs.statSync(src).isDirectory()) {
      if (!options.recursive) {
        // Non-Recursive
        common.log(src + ' is a directory (not copied)');
      } else {
        // Recursive
        // 'cp /a/source dest' should create 'source' in 'dest'
        var newDest = path.join(dest, path.basename(src)),
            checkDir = fs.statSync(src);
        try {
          fs.mkdirSync(newDest, checkDir.mode);
        } catch (e) {
          //if the directory already exists, that's okay
          if (e.code !== 'EEXIST') throw e;
        }

        cpdirSyncRecursive(src, newDest, {force: options.force});
      }
      return; // done with dir
    }

    // If here, src is a file

    // When copying to '/path/dir':
    //    thisDest = '/path/dir/file1'
    var thisDest = dest;
    if (fs.existsSync(dest) && fs.statSync(dest).isDirectory())
      thisDest = path.normalize(dest + '/' + path.basename(src));

    if (fs.existsSync(thisDest) && !options.force) {
      common.error('dest file already exists: ' + thisDest, true);
      return; // skip file
    }

    copyFileSync(src, thisDest);
  }); // forEach(src)
}
module.exports = _cp;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var fs = __webpack_require__(0);

// Recursively removes 'dir'
// Adapted from https://github.com/ryanmcgrath/wrench-js
//
// Copyright (c) 2010 Ryan McGrath
// Copyright (c) 2012 Artur Adib
//
// Licensed under the MIT License
// http://www.opensource.org/licenses/mit-license.php
function rmdirSyncRecursive(dir, force) {
  var files;

  files = fs.readdirSync(dir);

  // Loop through and delete everything in the sub-tree after checking it
  for(var i = 0; i < files.length; i++) {
    var file = dir + "/" + files[i],
        currFile = fs.lstatSync(file);

    if(currFile.isDirectory()) { // Recursive function back to the beginning
      rmdirSyncRecursive(file, force);
    }

    else if(currFile.isSymbolicLink()) { // Unlink symlinks
      if (force || isWriteable(file)) {
        try {
          common.unlinkSync(file);
        } catch (e) {
          common.error('could not remove file (code '+e.code+'): ' + file, true);
        }
      }
    }

    else // Assume it's a file - perhaps a try/catch belongs here?
      if (force || isWriteable(file)) {
        try {
          common.unlinkSync(file);
        } catch (e) {
          common.error('could not remove file (code '+e.code+'): ' + file, true);
        }
      }
  }

  // Now that we know everything in the sub-tree has been deleted, we can delete the main directory.
  // Huzzah for the shopkeep.

  var result;
  try {
    result = fs.rmdirSync(dir);
  } catch(e) {
    common.error('could not remove directory (code '+e.code+'): ' + dir, true);
  }

  return result;
} // rmdirSyncRecursive

// Hack to determine if file has write permissions for current user
// Avoids having to check user, group, etc, but it's probably slow
function isWriteable(file) {
  var writePermission = true;
  try {
    var __fd = fs.openSync(file, 'a');
    fs.closeSync(__fd);
  } catch(e) {
    writePermission = false;
  }

  return writePermission;
}

//@
//@ ### rm([options ,] file [, file ...])
//@ ### rm([options ,] file_array)
//@ Available options:
//@
//@ + `-f`: force
//@ + `-r, -R`: recursive
//@
//@ Examples:
//@
//@ ```javascript
//@ rm('-rf', '/tmp/*');
//@ rm('some_file.txt', 'another_file.txt');
//@ rm(['some_file.txt', 'another_file.txt']); // same as above
//@ ```
//@
//@ Removes files. The wildcard `*` is accepted.
function _rm(options, files) {
  options = common.parseOptions(options, {
    'f': 'force',
    'r': 'recursive',
    'R': 'recursive'
  });
  if (!files)
    common.error('no paths given');

  if (typeof files === 'string')
    files = [].slice.call(arguments, 1);
  // if it's array leave it as it is

  files = common.expand(files);

  files.forEach(function(file) {
    if (!fs.existsSync(file)) {
      // Path does not exist, no force flag given
      if (!options.force)
        common.error('no such file or directory: '+file, true);

      return; // skip file
    }

    // If here, path exists

    var stats = fs.lstatSync(file);
    if (stats.isFile() || stats.isSymbolicLink()) {

      // Do not check for file writing permissions
      if (options.force) {
        common.unlinkSync(file);
        return;
      }

      if (isWriteable(file))
        common.unlinkSync(file);
      else
        common.error('permission denied: '+file, true);

      return;
    } // simple file

    // Path is an existing directory, but no -r flag given
    if (stats.isDirectory() && !options.recursive) {
      common.error('path is a directory', true);
      return; // skip path
    }

    // Recursively remove existing directory
    if (stats.isDirectory() && options.recursive) {
      rmdirSyncRecursive(file, options.force);
    }
  }); // forEach(file)
} // rm
module.exports = _rm;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var fs = __webpack_require__(0);
var path = __webpack_require__(2);
var common = __webpack_require__(1);

//@
//@ ### mv(source [, source ...], dest')
//@ ### mv(source_array, dest')
//@ Available options:
//@
//@ + `f`: force
//@
//@ Examples:
//@
//@ ```javascript
//@ mv('-f', 'file', 'dir/');
//@ mv('file1', 'file2', 'dir/');
//@ mv(['file1', 'file2'], 'dir/'); // same as above
//@ ```
//@
//@ Moves files. The wildcard `*` is accepted.
function _mv(options, sources, dest) {
  options = common.parseOptions(options, {
    'f': 'force'
  });

  // Get sources, dest
  if (arguments.length < 3) {
    common.error('missing <source> and/or <dest>');
  } else if (arguments.length > 3) {
    sources = [].slice.call(arguments, 1, arguments.length - 1);
    dest = arguments[arguments.length - 1];
  } else if (typeof sources === 'string') {
    sources = [sources];
  } else if ('length' in sources) {
    sources = sources; // no-op for array
  } else {
    common.error('invalid arguments');
  }

  sources = common.expand(sources);

  var exists = fs.existsSync(dest),
      stats = exists && fs.statSync(dest);

  // Dest is not existing dir, but multiple sources given
  if ((!exists || !stats.isDirectory()) && sources.length > 1)
    common.error('dest is not a directory (too many sources)');

  // Dest is an existing file, but no -f given
  if (exists && stats.isFile() && !options.force)
    common.error('dest file already exists: ' + dest);

  sources.forEach(function(src) {
    if (!fs.existsSync(src)) {
      common.error('no such file or directory: '+src, true);
      return; // skip file
    }

    // If here, src exists

    // When copying to '/path/dir':
    //    thisDest = '/path/dir/file1'
    var thisDest = dest;
    if (fs.existsSync(dest) && fs.statSync(dest).isDirectory())
      thisDest = path.normalize(dest + '/' + path.basename(src));

    if (fs.existsSync(thisDest) && !options.force) {
      common.error('dest file already exists: ' + thisDest, true);
      return; // skip file
    }

    if (path.resolve(src) === path.dirname(path.resolve(thisDest))) {
      common.error('cannot move to self: '+src, true);
      return; // skip file
    }

    fs.renameSync(src, thisDest);
  }); // forEach(src)
} // mv
module.exports = _mv;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var fs = __webpack_require__(0);
var path = __webpack_require__(2);

// Recursively creates 'dir'
function mkdirSyncRecursive(dir) {
  var baseDir = path.dirname(dir);

  // Base dir exists, no recursion necessary
  if (fs.existsSync(baseDir)) {
    fs.mkdirSync(dir, parseInt('0777', 8));
    return;
  }

  // Base dir does not exist, go recursive
  mkdirSyncRecursive(baseDir);

  // Base dir created, can create dir
  fs.mkdirSync(dir, parseInt('0777', 8));
}

//@
//@ ### mkdir([options ,] dir [, dir ...])
//@ ### mkdir([options ,] dir_array)
//@ Available options:
//@
//@ + `p`: full path (will create intermediate dirs if necessary)
//@
//@ Examples:
//@
//@ ```javascript
//@ mkdir('-p', '/tmp/a/b/c/d', '/tmp/e/f/g');
//@ mkdir('-p', ['/tmp/a/b/c/d', '/tmp/e/f/g']); // same as above
//@ ```
//@
//@ Creates directories.
function _mkdir(options, dirs) {
  options = common.parseOptions(options, {
    'p': 'fullpath'
  });
  if (!dirs)
    common.error('no paths given');

  if (typeof dirs === 'string')
    dirs = [].slice.call(arguments, 1);
  // if it's array leave it as it is

  dirs.forEach(function(dir) {
    if (fs.existsSync(dir)) {
      if (!options.fullpath)
          common.error('path already exists: ' + dir, true);
      return; // skip dir
    }

    // Base dir does not exist, and no -p option given
    var baseDir = path.dirname(dir);
    if (!fs.existsSync(baseDir) && !options.fullpath) {
      common.error('no such file or directory: ' + baseDir, true);
      return; // skip dir
    }

    if (options.fullpath)
      mkdirSyncRecursive(dir);
    else
      fs.mkdirSync(dir, parseInt('0777', 8));
  });
} // mkdir
module.exports = _mkdir;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var fs = __webpack_require__(0);

//@
//@ ### test(expression)
//@ Available expression primaries:
//@
//@ + `'-b', 'path'`: true if path is a block device
//@ + `'-c', 'path'`: true if path is a character device
//@ + `'-d', 'path'`: true if path is a directory
//@ + `'-e', 'path'`: true if path exists
//@ + `'-f', 'path'`: true if path is a regular file
//@ + `'-L', 'path'`: true if path is a symboilc link
//@ + `'-p', 'path'`: true if path is a pipe (FIFO)
//@ + `'-S', 'path'`: true if path is a socket
//@
//@ Examples:
//@
//@ ```javascript
//@ if (test('-d', path)) { /* do something with dir */ };
//@ if (!test('-f', path)) continue; // skip if it's a regular file
//@ ```
//@
//@ Evaluates expression using the available primaries and returns corresponding value.
function _test(options, path) {
  if (!path)
    common.error('no path given');

  // hack - only works with unary primaries
  options = common.parseOptions(options, {
    'b': 'block',
    'c': 'character',
    'd': 'directory',
    'e': 'exists',
    'f': 'file',
    'L': 'link',
    'p': 'pipe',
    'S': 'socket'
  });

  var canInterpret = false;
  for (var key in options)
    if (options[key] === true) {
      canInterpret = true;
      break;
    }

  if (!canInterpret)
    common.error('could not interpret expression');

  if (options.link) {
    try {
      return fs.lstatSync(path).isSymbolicLink();
    } catch(e) {
      return false;
    }
  }

  if (!fs.existsSync(path))
    return false;

  if (options.exists)
    return true;

  var stats = fs.statSync(path);

  if (options.block)
    return stats.isBlockDevice();

  if (options.character)
    return stats.isCharacterDevice();

  if (options.directory)
    return stats.isDirectory();

  if (options.file)
    return stats.isFile();

  if (options.pipe)
    return stats.isFIFO();

  if (options.socket)
    return stats.isSocket();
} // test
module.exports = _test;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var fs = __webpack_require__(0);

//@
//@ ### cat(file [, file ...])
//@ ### cat(file_array)
//@
//@ Examples:
//@
//@ ```javascript
//@ var str = cat('file*.txt');
//@ var str = cat('file1', 'file2');
//@ var str = cat(['file1', 'file2']); // same as above
//@ ```
//@
//@ Returns a string containing the given file, or a concatenated string
//@ containing the files if more than one file is given (a new line character is
//@ introduced between each file). Wildcard `*` accepted.
function _cat(options, files) {
  var cat = '';

  if (!files)
    common.error('no paths given');

  if (typeof files === 'string')
    files = [].slice.call(arguments, 1);
  // if it's array leave it as it is

  files = common.expand(files);

  files.forEach(function(file) {
    if (!fs.existsSync(file))
      common.error('no such file or directory: ' + file);

    cat += fs.readFileSync(file, 'utf8') + '\n';
  });

  if (cat[cat.length-1] === '\n')
    cat = cat.substring(0, cat.length-1);

  return common.ShellString(cat);
}
module.exports = _cat;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var fs = __webpack_require__(0);
var path = __webpack_require__(2);

//@
//@ ### 'string'.to(file)
//@
//@ Examples:
//@
//@ ```javascript
//@ cat('input.txt').to('output.txt');
//@ ```
//@
//@ Analogous to the redirection operator `>` in Unix, but works with JavaScript strings (such as
//@ those returned by `cat`, `grep`, etc). _Like Unix redirections, `to()` will overwrite any existing file!_
function _to(options, file) {
  if (!file)
    common.error('wrong arguments');

  if (!fs.existsSync( path.dirname(file) ))
      common.error('no such file or directory: ' + path.dirname(file));

  try {
    fs.writeFileSync(file, this.toString(), 'utf8');
  } catch(e) {
    common.error('could not write to file (code '+e.code+'): '+file, true);
  }
}
module.exports = _to;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var fs = __webpack_require__(0);
var path = __webpack_require__(2);

//@
//@ ### 'string'.toEnd(file)
//@
//@ Examples:
//@
//@ ```javascript
//@ cat('input.txt').toEnd('output.txt');
//@ ```
//@
//@ Analogous to the redirect-and-append operator `>>` in Unix, but works with JavaScript strings (such as
//@ those returned by `cat`, `grep`, etc).
function _toEnd(options, file) {
  if (!file)
    common.error('wrong arguments');

  if (!fs.existsSync( path.dirname(file) ))
      common.error('no such file or directory: ' + path.dirname(file));

  try {
    fs.appendFileSync(file, this.toString(), 'utf8');
  } catch(e) {
    common.error('could not append to file (code '+e.code+'): '+file, true);
  }
}
module.exports = _toEnd;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var fs = __webpack_require__(0);

//@
//@ ### sed([options ,] search_regex, replacement, file)
//@ Available options:
//@
//@ + `-i`: Replace contents of 'file' in-place. _Note that no backups will be created!_
//@
//@ Examples:
//@
//@ ```javascript
//@ sed('-i', 'PROGRAM_VERSION', 'v0.1.3', 'source.js');
//@ sed(/.*DELETE_THIS_LINE.*\n/, '', 'source.js');
//@ ```
//@
//@ Reads an input string from `file` and performs a JavaScript `replace()` on the input
//@ using the given search regex and replacement string or function. Returns the new string after replacement.
function _sed(options, regex, replacement, file) {
  options = common.parseOptions(options, {
    'i': 'inplace'
  });

  if (typeof replacement === 'string' || typeof replacement === 'function')
    replacement = replacement; // no-op
  else if (typeof replacement === 'number')
    replacement = replacement.toString(); // fallback
  else
    common.error('invalid replacement string');

  if (!file)
    common.error('no file given');

  if (!fs.existsSync(file))
    common.error('no such file or directory: ' + file);

  var result = fs.readFileSync(file, 'utf8').replace(regex, replacement);
  if (options.inplace)
    fs.writeFileSync(file, result, 'utf8');

  return common.ShellString(result);
}
module.exports = _sed;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var fs = __webpack_require__(0);

//@
//@ ### grep([options ,] regex_filter, file [, file ...])
//@ ### grep([options ,] regex_filter, file_array)
//@ Available options:
//@
//@ + `-v`: Inverse the sense of the regex and print the lines not matching the criteria.
//@
//@ Examples:
//@
//@ ```javascript
//@ grep('-v', 'GLOBAL_VARIABLE', '*.js');
//@ grep('GLOBAL_VARIABLE', '*.js');
//@ ```
//@
//@ Reads input string from given files and returns a string containing all lines of the
//@ file that match the given `regex_filter`. Wildcard `*` accepted.
function _grep(options, regex, files) {
  options = common.parseOptions(options, {
    'v': 'inverse'
  });

  if (!files)
    common.error('no paths given');

  if (typeof files === 'string')
    files = [].slice.call(arguments, 2);
  // if it's array leave it as it is

  files = common.expand(files);

  var grep = '';
  files.forEach(function(file) {
    if (!fs.existsSync(file)) {
      common.error('no such file or directory: ' + file, true);
      return;
    }

    var contents = fs.readFileSync(file, 'utf8'),
        lines = contents.split(/\r*\n/);
    lines.forEach(function(line) {
      var matched = line.match(regex);
      if ((options.inverse && !matched) || (!options.inverse && matched))
        grep += line + '\n';
    });
  });

  return common.ShellString(grep);
}
module.exports = _grep;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var fs = __webpack_require__(0);
var path = __webpack_require__(2);

// Cross-platform method for splitting environment PATH variables
function splitPath(p) {
  for (i=1;i<2;i++) {}

  if (!p)
    return [];

  if (common.platform === 'win')
    return p.split(';');
  else
    return p.split(':');
}

function checkPath(path) {
  return fs.existsSync(path) && fs.statSync(path).isDirectory() == false;
}

//@
//@ ### which(command)
//@
//@ Examples:
//@
//@ ```javascript
//@ var nodeExec = which('node');
//@ ```
//@
//@ Searches for `command` in the system's PATH. On Windows looks for `.exe`, `.cmd`, and `.bat` extensions.
//@ Returns string containing the absolute path to the command.
function _which(options, cmd) {
  if (!cmd)
    common.error('must specify command');

  var pathEnv = process.env.path || process.env.Path || process.env.PATH,
      pathArray = splitPath(pathEnv),
      where = null;

  // No relative/absolute paths provided?
  if (cmd.search(/\//) === -1) {
    // Search for command in PATH
    pathArray.forEach(function(dir) {
      if (where)
        return; // already found it

      var attempt = path.resolve(dir + '/' + cmd);
      if (checkPath(attempt)) {
        where = attempt;
        return;
      }

      if (common.platform === 'win') {
        var baseAttempt = attempt;
        attempt = baseAttempt + '.exe';
        if (checkPath(attempt)) {
          where = attempt;
          return;
        }
        attempt = baseAttempt + '.cmd';
        if (checkPath(attempt)) {
          where = attempt;
          return;
        }
        attempt = baseAttempt + '.bat';
        if (checkPath(attempt)) {
          where = attempt;
          return;
        }
      } // if 'win'
    });
  }

  // Command not found anywhere?
  if (!checkPath(cmd) && !where)
    return null;

  where = where || path.resolve(cmd);

  return common.ShellString(where);
}
module.exports = _which;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);

//@
//@ ### echo(string [,string ...])
//@
//@ Examples:
//@
//@ ```javascript
//@ echo('hello world');
//@ var str = echo('hello world');
//@ ```
//@
//@ Prints string to stdout, and returns string with additional utility methods
//@ like `.to()`.
function _echo() {
  var messages = [].slice.call(arguments, 0);
  console.log.apply(this, messages);
  return common.ShellString(messages.join(' '));
}
module.exports = _echo;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var fs = __webpack_require__(0);
var path = __webpack_require__(2);
var common = __webpack_require__(1);
var os = __webpack_require__(3);

//@
//@ ### ln(options, source, dest)
//@ ### ln(source, dest)
//@ Available options:
//@
//@ + `s`: symlink
//@ + `f`: force
//@
//@ Examples:
//@
//@ ```javascript
//@ ln('file', 'newlink');
//@ ln('-sf', 'file', 'existing');
//@ ```
//@
//@ Links source to dest. Use -f to force the link, should dest already exist.
function _ln(options, source, dest) {
  options = common.parseOptions(options, {
    's': 'symlink',
    'f': 'force'
  });

  if (!source || !dest) {
    common.error('Missing <source> and/or <dest>');
  }

  source = path.resolve(process.cwd(), String(source));
  dest = path.resolve(process.cwd(), String(dest));

  if (!fs.existsSync(source)) {
    common.error('Source file does not exist', true);
  }

  if (fs.existsSync(dest)) {
    if (!options.force) {
      common.error('Destination file exists', true);
    }

    fs.unlinkSync(dest);
  }

  if (options.symlink) {
    fs.symlinkSync(source, dest, os.platform() === "win32" ? "junction" : null);
  } else {
    fs.linkSync(source, dest, os.platform() === "win32" ? "junction" : null);
  }
}
module.exports = _ln;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var _tempDir = __webpack_require__(10);
var _pwd = __webpack_require__(6);
var path = __webpack_require__(2);
var fs = __webpack_require__(0);
var child = __webpack_require__(8);

// Hack to run child_process.exec() synchronously (sync avoids callback hell)
// Uses a custom wait loop that checks for a flag file, created when the child process is done.
// (Can't do a wait loop that checks for internal Node variables/messages as
// Node is single-threaded; callbacks and other internal state changes are done in the
// event loop).
function execSync(cmd, opts) {
  var tempDir = _tempDir();
  var stdoutFile = path.resolve(tempDir+'/'+common.randomFileName()),
      codeFile = path.resolve(tempDir+'/'+common.randomFileName()),
      scriptFile = path.resolve(tempDir+'/'+common.randomFileName()),
      sleepFile = path.resolve(tempDir+'/'+common.randomFileName());

  var options = common.extend({
    silent: common.config.silent
  }, opts);

  var previousStdoutContent = '';
  // Echoes stdout changes from running process, if not silent
  function updateStdout() {
    if (options.silent || !fs.existsSync(stdoutFile))
      return;

    var stdoutContent = fs.readFileSync(stdoutFile, 'utf8');
    // No changes since last time?
    if (stdoutContent.length <= previousStdoutContent.length)
      return;

    process.stdout.write(stdoutContent.substr(previousStdoutContent.length));
    previousStdoutContent = stdoutContent;
  }

  function escape(str) {
    return (str+'').replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
  }

  cmd += ' > '+stdoutFile+' 2>&1'; // works on both win/unix

  var script =
   "var child = require('child_process')," +
   "     fs = require('fs');" +
   "child.exec('"+escape(cmd)+"', {env: process.env, maxBuffer: 20*1024*1024}, function(err) {" +
   "  fs.writeFileSync('"+escape(codeFile)+"', err ? err.code.toString() : '0');" +
   "});";

  if (fs.existsSync(scriptFile)) common.unlinkSync(scriptFile);
  if (fs.existsSync(stdoutFile)) common.unlinkSync(stdoutFile);
  if (fs.existsSync(codeFile)) common.unlinkSync(codeFile);

  fs.writeFileSync(scriptFile, script);
  child.exec('"'+process.execPath+'" '+scriptFile, {
    env: process.env,
    cwd: _pwd(),
    maxBuffer: 20*1024*1024
  });

  // The wait loop
  // sleepFile is used as a dummy I/O op to mitigate unnecessary CPU usage
  // (tried many I/O sync ops, writeFileSync() seems to be only one that is effective in reducing
  // CPU usage, though apparently not so much on Windows)
  while (!fs.existsSync(codeFile)) { updateStdout(); fs.writeFileSync(sleepFile, 'a'); }
  while (!fs.existsSync(stdoutFile)) { updateStdout(); fs.writeFileSync(sleepFile, 'a'); }

  // At this point codeFile exists, but it's not necessarily flushed yet.
  // Keep reading it until it is.
  var code = parseInt('', 10);
  while (isNaN(code)) {
    code = parseInt(fs.readFileSync(codeFile, 'utf8'), 10);
  }

  var stdout = fs.readFileSync(stdoutFile, 'utf8');

  // No biggie if we can't erase the files now -- they're in a temp dir anyway
  try { common.unlinkSync(scriptFile); } catch(e) {}
  try { common.unlinkSync(stdoutFile); } catch(e) {}
  try { common.unlinkSync(codeFile); } catch(e) {}
  try { common.unlinkSync(sleepFile); } catch(e) {}

  // some shell return codes are defined as errors, per http://tldp.org/LDP/abs/html/exitcodes.html
  if (code === 1 || code === 2 || code >= 126)  {
      common.error('', true); // unix/shell doesn't really give an error message after non-zero exit codes
  }
  // True if successful, false if not
  var obj = {
    code: code,
    output: stdout
  };
  return obj;
} // execSync()

// Wrapper around exec() to enable echoing output to console in real time
function execAsync(cmd, opts, callback) {
  var output = '';

  var options = common.extend({
    silent: common.config.silent
  }, opts);

  var c = child.exec(cmd, {env: process.env, maxBuffer: 20*1024*1024}, function(err) {
    if (callback)
      callback(err ? err.code : 0, output);
  });

  c.stdout.on('data', function(data) {
    output += data;
    if (!options.silent)
      process.stdout.write(data);
  });

  c.stderr.on('data', function(data) {
    output += data;
    if (!options.silent)
      process.stdout.write(data);
  });

  return c;
}

//@
//@ ### exec(command [, options] [, callback])
//@ Available options (all `false` by default):
//@
//@ + `async`: Asynchronous execution. Defaults to true if a callback is provided.
//@ + `silent`: Do not echo program output to console.
//@
//@ Examples:
//@
//@ ```javascript
//@ var version = exec('node --version', {silent:true}).output;
//@
//@ var child = exec('some_long_running_process', {async:true});
//@ child.stdout.on('data', function(data) {
//@   /* ... do something with data ... */
//@ });
//@
//@ exec('some_long_running_process', function(code, output) {
//@   console.log('Exit code:', code);
//@   console.log('Program output:', output);
//@ });
//@ ```
//@
//@ Executes the given `command` _synchronously_, unless otherwise specified.
//@ When in synchronous mode returns the object `{ code:..., output:... }`, containing the program's
//@ `output` (stdout + stderr)  and its exit `code`. Otherwise returns the child process object, and
//@ the `callback` gets the arguments `(code, output)`.
//@
//@ **Note:** For long-lived processes, it's best to run `exec()` asynchronously as
//@ the current synchronous implementation uses a lot of CPU. This should be getting
//@ fixed soon.
function _exec(command, options, callback) {
  if (!command)
    common.error('must specify command');

  // Callback is defined instead of options.
  if (typeof options === 'function') {
    callback = options;
    options = { async: true };
  }

  // Callback is defined with options.
  if (typeof options === 'object' && typeof callback === 'function') {
    options.async = true;
  }

  options = common.extend({
    silent: common.config.silent,
    async: false
  }, options);

  if (options.async)
    return execAsync(command, options, callback);
  else
    return execSync(command, options);
}
module.exports = _exec;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var fs = __webpack_require__(0);
var path = __webpack_require__(2);

var PERMS = (function (base) {
  return {
    OTHER_EXEC  : base.EXEC,
    OTHER_WRITE : base.WRITE,
    OTHER_READ  : base.READ,

    GROUP_EXEC  : base.EXEC  << 3,
    GROUP_WRITE : base.WRITE << 3,
    GROUP_READ  : base.READ << 3,

    OWNER_EXEC  : base.EXEC << 6,
    OWNER_WRITE : base.WRITE << 6,
    OWNER_READ  : base.READ << 6,

    // Literal octal numbers are apparently not allowed in "strict" javascript.  Using parseInt is
    // the preferred way, else a jshint warning is thrown.
    STICKY      : parseInt('01000', 8),
    SETGID      : parseInt('02000', 8),
    SETUID      : parseInt('04000', 8),

    TYPE_MASK   : parseInt('0770000', 8)
  };
})({
  EXEC  : 1,
  WRITE : 2,
  READ  : 4
});

//@
//@ ### chmod(octal_mode || octal_string, file)
//@ ### chmod(symbolic_mode, file)
//@
//@ Available options:
//@
//@ + `-v`: output a diagnostic for every file processed//@
//@ + `-c`: like verbose but report only when a change is made//@
//@ + `-R`: change files and directories recursively//@
//@
//@ Examples:
//@
//@ ```javascript
//@ chmod(755, '/Users/brandon');
//@ chmod('755', '/Users/brandon'); // same as above
//@ chmod('u+x', '/Users/brandon');
//@ ```
//@
//@ Alters the permissions of a file or directory by either specifying the
//@ absolute permissions in octal form or expressing the changes in symbols.
//@ This command tries to mimic the POSIX behavior as much as possible.
//@ Notable exceptions:
//@
//@ + In symbolic modes, 'a-r' and '-r' are identical.  No consideration is
//@   given to the umask.
//@ + There is no "quiet" option since default behavior is to run silent.
function _chmod(options, mode, filePattern) {
  if (!filePattern) {
    if (options.length > 0 && options.charAt(0) === '-') {
      // Special case where the specified file permissions started with - to subtract perms, which
      // get picked up by the option parser as command flags.
      // If we are down by one argument and options starts with -, shift everything over.
      filePattern = mode;
      mode = options;
      options = '';
    }
    else {
      common.error('You must specify a file.');
    }
  }

  options = common.parseOptions(options, {
    'R': 'recursive',
    'c': 'changes',
    'v': 'verbose'
  });

  if (typeof filePattern === 'string') {
    filePattern = [ filePattern ];
  }

  var files;

  if (options.recursive) {
    files = [];
    common.expand(filePattern).forEach(function addFile(expandedFile) {
      var stat = fs.lstatSync(expandedFile);

      if (!stat.isSymbolicLink()) {
        files.push(expandedFile);

        if (stat.isDirectory()) {  // intentionally does not follow symlinks.
          fs.readdirSync(expandedFile).forEach(function (child) {
            addFile(expandedFile + '/' + child);
          });
        }
      }
    });
  }
  else {
    files = common.expand(filePattern);
  }

  files.forEach(function innerChmod(file) {
    file = path.resolve(file);
    if (!fs.existsSync(file)) {
      common.error('File not found: ' + file);
    }

    // When recursing, don't follow symlinks.
    if (options.recursive && fs.lstatSync(file).isSymbolicLink()) {
      return;
    }

    var perms = fs.statSync(file).mode;
    var type = perms & PERMS.TYPE_MASK;

    var newPerms = perms;

    if (isNaN(parseInt(mode, 8))) {
      // parse options
      mode.split(',').forEach(function (symbolicMode) {
        /*jshint regexdash:true */
        var pattern = /([ugoa]*)([=\+-])([rwxXst]*)/i;
        var matches = pattern.exec(symbolicMode);

        if (matches) {
          var applyTo = matches[1];
          var operator = matches[2];
          var change = matches[3];

          var changeOwner = applyTo.indexOf('u') != -1 || applyTo === 'a' || applyTo === '';
          var changeGroup = applyTo.indexOf('g') != -1 || applyTo === 'a' || applyTo === '';
          var changeOther = applyTo.indexOf('o') != -1 || applyTo === 'a' || applyTo === '';

          var changeRead   = change.indexOf('r') != -1;
          var changeWrite  = change.indexOf('w') != -1;
          var changeExec   = change.indexOf('x') != -1;
          var changeSticky = change.indexOf('t') != -1;
          var changeSetuid = change.indexOf('s') != -1;

          var mask = 0;
          if (changeOwner) {
            mask |= (changeRead ? PERMS.OWNER_READ : 0) + (changeWrite ? PERMS.OWNER_WRITE : 0) + (changeExec ? PERMS.OWNER_EXEC : 0) + (changeSetuid ? PERMS.SETUID : 0);
          }
          if (changeGroup) {
            mask |= (changeRead ? PERMS.GROUP_READ : 0) + (changeWrite ? PERMS.GROUP_WRITE : 0) + (changeExec ? PERMS.GROUP_EXEC : 0) + (changeSetuid ? PERMS.SETGID : 0);
          }
          if (changeOther) {
            mask |= (changeRead ? PERMS.OTHER_READ : 0) + (changeWrite ? PERMS.OTHER_WRITE : 0) + (changeExec ? PERMS.OTHER_EXEC : 0);
          }

          // Sticky bit is special - it's not tied to user, group or other.
          if (changeSticky) {
            mask |= PERMS.STICKY;
          }

          switch (operator) {
            case '+':
              newPerms |= mask;
              break;

            case '-':
              newPerms &= ~mask;
              break;

            case '=':
              newPerms = type + mask;

              // According to POSIX, when using = to explicitly set the permissions, setuid and setgid can never be cleared.
              if (fs.statSync(file).isDirectory()) {
                newPerms |= (PERMS.SETUID + PERMS.SETGID) & perms;
              }
              break;
          }

          if (options.verbose) {
            log(file + ' -> ' + newPerms.toString(8));
          }

          if (perms != newPerms) {
            if (!options.verbose && options.changes) {
              log(file + ' -> ' + newPerms.toString(8));
            }
            fs.chmodSync(file, newPerms);
          }
        }
        else {
          common.error('Invalid symbolic mode change: ' + symbolicMode);
        }
      });
    }
    else {
      // they gave us a full number
      newPerms = type + parseInt(mode, 8);

      // POSIX rules are that setuid and setgid can only be added using numeric form, but not cleared.
      if (fs.statSync(file).isDirectory()) {
        newPerms |= (PERMS.SETUID + PERMS.SETGID) & perms;
      }

      fs.chmodSync(file, newPerms);
    }
  });
}
module.exports = _chmod;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);

//@
//@ ### error()
//@ Tests if error occurred in the last command. Returns `null` if no error occurred,
//@ otherwise returns string explaining the error
function error() {
  return common.state.error;
};
module.exports = error;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var concatMap = __webpack_require__(37);
var balanced = __webpack_require__(38);

module.exports = expandTop;

var escSlash = '\0SLASH'+Math.random()+'\0';
var escOpen = '\0OPEN'+Math.random()+'\0';
var escClose = '\0CLOSE'+Math.random()+'\0';
var escComma = '\0COMMA'+Math.random()+'\0';
var escPeriod = '\0PERIOD'+Math.random()+'\0';

function numeric(str) {
  return parseInt(str, 10) == str
    ? parseInt(str, 10)
    : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.split('\\\\').join(escSlash)
            .split('\\{').join(escOpen)
            .split('\\}').join(escClose)
            .split('\\,').join(escComma)
            .split('\\.').join(escPeriod);
}

function unescapeBraces(str) {
  return str.split(escSlash).join('\\')
            .split(escOpen).join('{')
            .split(escClose).join('}')
            .split(escComma).join(',')
            .split(escPeriod).join('.');
}


// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function parseCommaParts(str) {
  if (!str)
    return [''];

  var parts = [];
  var m = balanced('{', '}', str);

  if (!m)
    return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length-1] += '{' + body + '}';
  var postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length-1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function expandTop(str) {
  if (!str)
    return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function identity(e) {
  return e;
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  var expansions = [];

  var m = balanced('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  var isSequence = isNumericSequence || isAlphaSequence;
  var isOptions = m.body.indexOf(',') >= 0;
  if (!isSequence && !isOptions) {
    // {a},b}
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + escClose + m.post;
      return expand(str);
    }
    return [str];
  }

  var n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = parseCommaParts(m.body);
    if (n.length === 1) {
      // x{{a,b}}y ==> x{a}y x{b}y
      n = expand(n[0], false).map(embrace);
      if (n.length === 1) {
        var post = m.post.length
          ? expand(m.post, false)
          : [''];
        return post.map(function(p) {
          return m.pre + n[0] + p;
        });
      }
    }
  }

  // at this point, n is the parts, and we know it's not a comma set
  // with a single entry.

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length
    ? expand(m.post, false)
    : [''];

  var N;

  if (isSequence) {
    var x = numeric(n[0]);
    var y = numeric(n[1]);
    var width = Math.max(n[0].length, n[1].length)
    var incr = n.length == 3
      ? Math.abs(numeric(n[2]))
      : 1;
    var test = lte;
    var reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = gte;
    }
    var pad = n.some(isPadded);

    N = [];

    for (var i = x; test(i, y); i += incr) {
      var c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\')
          c = '';
      } else {
        c = String(i);
        if (pad) {
          var need = width - c.length;
          if (need > 0) {
            var z = new Array(need + 1).join('0');
            if (i < 0)
              c = '-' + z + c.slice(1);
            else
              c = z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = concatMap(n, function(el) { return expand(el, false) });
  }

  for (var j = 0; j < N.length; j++) {
    for (var k = 0; k < post.length; k++) {
      var expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion)
        expansions.push(expansion);
    }
  }

  return expansions;
}



/***/ }),
/* 37 */
/***/ (function(module, exports) {

module.exports = function (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (isArray(x)) res.push.apply(res, x);
        else res.push(x);
    }
    return res;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = balanced;
function balanced(a, b, str) {
  if (a instanceof RegExp) a = maybeMatch(a, str);
  if (b instanceof RegExp) b = maybeMatch(b, str);

  var r = range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

balanced.range = range;
function range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [ begs.pop(), bi ];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [ left, right ];
    }
  }

  return result;
}


/***/ }),
/* 39 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var fs = __webpack_require__(0);
var path = __webpack_require__(2);
var crypto = __webpack_require__(9);
var uuidV4 = __webpack_require__(14);
var algorithm = "aes-256-ctr";
var encryptEncoding = 'hex';
var unencryptedEncoding = 'utf8';
//
// Store sensitive data in proc.
// Main goal: Protects tasks which would dump envvars from leaking secrets inadvertently
//            the task lib clears after storing.
// Also protects against a dump of a process getting the secrets
// The secret is generated and stored externally for the lifetime of the task.
//
var Vault = /** @class */ (function () {
    function Vault(keyPath) {
        this._keyFile = path.join(keyPath, '.taskkey');
        this._store = {};
        this.genKey();
    }
    Vault.prototype.initialize = function () {
    };
    Vault.prototype.storeSecret = function (name, data) {
        if (!name || name.length == 0) {
            return false;
        }
        name = name.toLowerCase();
        if (!data || data.length == 0) {
            if (this._store.hasOwnProperty(name)) {
                delete this._store[name];
            }
            return false;
        }
        var key = this.getKey();
        var iv = crypto.randomBytes(16);
        var cipher = crypto.createCipheriv(algorithm, key, iv);
        var crypted = cipher.update(data, unencryptedEncoding, encryptEncoding);
        var cryptedFinal = cipher.final(encryptEncoding);
        this._store[name] = iv.toString(encryptEncoding) + crypted + cryptedFinal;
        return true;
    };
    Vault.prototype.retrieveSecret = function (name) {
        var secret;
        name = (name || '').toLowerCase();
        if (this._store.hasOwnProperty(name)) {
            var key = this.getKey();
            var data = this._store[name];
            var ivDataBuffer = Buffer.from(data, encryptEncoding);
            var iv = ivDataBuffer.slice(0, 16);
            var encryptedText = ivDataBuffer.slice(16);
            var decipher = crypto.createDecipheriv(algorithm, key, iv);
            var dec = decipher.update(encryptedText, encryptEncoding, unencryptedEncoding);
            var decFinal = decipher.final(unencryptedEncoding);
            secret = dec + decFinal;
        }
        return secret;
    };
    Vault.prototype.getKey = function () {
        var key = fs.readFileSync(this._keyFile).toString('utf8');
        // Key needs to be hashed to correct length to match algorithm (aes-256-ctr)
        return crypto.createHash('sha256').update(key).digest();
    };
    Vault.prototype.genKey = function () {
        fs.writeFileSync(this._keyFile, uuidV4(), { encoding: 'utf8' });
    };
    return Vault;
}());
exports.Vault = Vault;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

// Unique ID creation requires a high quality random # generator.  In node.js
// this is pretty straight-forward - we use the crypto API.

var crypto = __webpack_require__(9);

module.exports = function nodeRNG() {
  return crypto.randomBytes(16);
};


/***/ }),
/* 42 */
/***/ (function(module, exports) {

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]]
  ]).join('');
}

module.exports = bytesToUuid;


/***/ }),
/* 43 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 43;

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Q = __webpack_require__(45);
var os = __webpack_require__(3);
var events = __webpack_require__(46);
var child = __webpack_require__(8);
var im = __webpack_require__(12);
var fs = __webpack_require__(0);
var ToolRunner = /** @class */ (function (_super) {
    __extends(ToolRunner, _super);
    function ToolRunner(toolPath) {
        var _this = _super.call(this) || this;
        if (!toolPath) {
            throw new Error('Parameter \'toolPath\' cannot be null or empty.');
        }
        _this.toolPath = im._which(toolPath, true);
        _this.args = [];
        _this._debug('toolRunner toolPath: ' + toolPath);
        return _this;
    }
    ToolRunner.prototype._debug = function (message) {
        this.emit('debug', message);
    };
    ToolRunner.prototype._argStringToArray = function (argString) {
        var args = [];
        var inQuotes = false;
        var escaped = false;
        var lastCharWasSpace = true;
        var arg = '';
        var append = function (c) {
            // we only escape double quotes.
            if (escaped && c !== '"') {
                arg += '\\';
            }
            arg += c;
            escaped = false;
        };
        for (var i = 0; i < argString.length; i++) {
            var c = argString.charAt(i);
            if (c === ' ' && !inQuotes) {
                if (!lastCharWasSpace) {
                    args.push(arg);
                    arg = '';
                }
                lastCharWasSpace = true;
                continue;
            }
            else {
                lastCharWasSpace = false;
            }
            if (c === '"') {
                if (!escaped) {
                    inQuotes = !inQuotes;
                }
                else {
                    append(c);
                }
                continue;
            }
            if (c === "\\" && escaped) {
                append(c);
                continue;
            }
            if (c === "\\" && inQuotes) {
                escaped = true;
                continue;
            }
            append(c);
            lastCharWasSpace = false;
        }
        if (!lastCharWasSpace) {
            args.push(arg.trim());
        }
        return args;
    };
    ToolRunner.prototype._getCommandString = function (options, noPrefix) {
        var _this = this;
        var toolPath = this._getSpawnFileName();
        var args = this._getSpawnArgs(options);
        var cmd = noPrefix ? '' : '[command]'; // omit prefix when piped to a second tool
        if (process.platform == 'win32') {
            // Windows + cmd file
            if (this._isCmdFile()) {
                cmd += toolPath;
                args.forEach(function (a) {
                    cmd += " " + a;
                });
            }
            // Windows + verbatim
            else if (options.windowsVerbatimArguments) {
                cmd += "\"" + toolPath + "\"";
                args.forEach(function (a) {
                    cmd += " " + a;
                });
            }
            // Windows (regular)
            else {
                cmd += this._windowsQuoteCmdArg(toolPath);
                args.forEach(function (a) {
                    cmd += " " + _this._windowsQuoteCmdArg(a);
                });
            }
        }
        else {
            // OSX/Linux - this can likely be improved with some form of quoting.
            // creating processes on Unix is fundamentally different than Windows.
            // on Unix, execvp() takes an arg array.
            cmd += toolPath;
            args.forEach(function (a) {
                cmd += " " + a;
            });
        }
        // append second tool
        if (this.pipeOutputToTool) {
            cmd += ' | ' + this.pipeOutputToTool._getCommandString(options, /*noPrefix:*/ true);
        }
        return cmd;
    };
    ToolRunner.prototype._processLineBuffer = function (data, strBuffer, onLine) {
        try {
            var s = strBuffer + data.toString();
            var n = s.indexOf(os.EOL);
            while (n > -1) {
                var line = s.substring(0, n);
                onLine(line);
                // the rest of the string ...
                s = s.substring(n + os.EOL.length);
                n = s.indexOf(os.EOL);
            }
            strBuffer = s;
        }
        catch (err) {
            // streaming lines to console is best effort.  Don't fail a build.
            this._debug('error processing line');
        }
    };
    ToolRunner.prototype._getSpawnFileName = function () {
        if (process.platform == 'win32') {
            if (this._isCmdFile()) {
                return process.env['COMSPEC'] || 'cmd.exe';
            }
        }
        return this.toolPath;
    };
    ToolRunner.prototype._getSpawnArgs = function (options) {
        if (process.platform == 'win32') {
            if (this._isCmdFile()) {
                var argline = "/D /S /C \"" + this._windowsQuoteCmdArg(this.toolPath);
                for (var i = 0; i < this.args.length; i++) {
                    argline += ' ';
                    argline += options.windowsVerbatimArguments ? this.args[i] : this._windowsQuoteCmdArg(this.args[i]);
                }
                argline += '"';
                return [argline];
            }
            if (options.windowsVerbatimArguments) {
                // note, in Node 6.x options.argv0 can be used instead of overriding args.slice and args.unshift.
                // for more details, refer to https://github.com/nodejs/node/blob/v6.x/lib/child_process.js
                var args_1 = this.args.slice(0); // copy the array
                // override slice to prevent Node from creating a copy of the arg array.
                // we need Node to use the "unshift" override below.
                args_1.slice = function () {
                    if (arguments.length != 1 || arguments[0] != 0) {
                        throw new Error('Unexpected arguments passed to args.slice when windowsVerbatimArguments flag is set.');
                    }
                    return args_1;
                };
                // override unshift
                //
                // when using the windowsVerbatimArguments option, Node does not quote the tool path when building
                // the cmdline parameter for the win32 function CreateProcess(). an unquoted space in the tool path
                // causes problems for tools when attempting to parse their own command line args. tools typically
                // assume their arguments begin after arg 0.
                //
                // by hijacking unshift, we can quote the tool path when it pushed onto the args array. Node builds
                // the cmdline parameter from the args array.
                //
                // note, we can't simply pass a quoted tool path to Node for multiple reasons:
                //   1) Node verifies the file exists (calls win32 function GetFileAttributesW) and the check returns
                //      false if the path is quoted.
                //   2) Node passes the tool path as the application parameter to CreateProcess, which expects the
                //      path to be unquoted.
                //
                // also note, in addition to the tool path being embedded within the cmdline parameter, Node also
                // passes the tool path to CreateProcess via the application parameter (optional parameter). when
                // present, Windows uses the application parameter to determine which file to run, instead of
                // interpreting the file from the cmdline parameter.
                args_1.unshift = function () {
                    if (arguments.length != 1) {
                        throw new Error('Unexpected arguments passed to args.unshift when windowsVerbatimArguments flag is set.');
                    }
                    return Array.prototype.unshift.call(args_1, "\"" + arguments[0] + "\""); // quote the file name
                };
                return args_1;
            }
        }
        return this.args;
    };
    ToolRunner.prototype._isCmdFile = function () {
        var upperToolPath = this.toolPath.toUpperCase();
        return im._endsWith(upperToolPath, '.CMD') || im._endsWith(upperToolPath, '.BAT');
    };
    ToolRunner.prototype._windowsQuoteCmdArg = function (arg) {
        // for .exe, apply the normal quoting rules that libuv applies
        if (!this._isCmdFile()) {
            return this._uv_quote_cmd_arg(arg);
        }
        // otherwise apply quoting rules specific to the cmd.exe command line parser.
        // the libuv rules are generic and are not designed specifically for cmd.exe
        // command line parser.
        //
        // for a detailed description of the cmd.exe command line parser, refer to
        // http://stackoverflow.com/questions/4094699/how-does-the-windows-command-interpreter-cmd-exe-parse-scripts/7970912#7970912
        // need quotes for empty arg
        if (!arg) {
            return '""';
        }
        // determine whether the arg needs to be quoted
        var cmdSpecialChars = [' ', '\t', '&', '(', ')', '[', ']', '{', '}', '^', '=', ';', '!', '\'', '+', ',', '`', '~', '|', '<', '>', '"'];
        var needsQuotes = false;
        var _loop_1 = function (char) {
            if (cmdSpecialChars.some(function (x) { return x == char; })) {
                needsQuotes = true;
                return "break";
            }
        };
        for (var _i = 0, arg_1 = arg; _i < arg_1.length; _i++) {
            var char = arg_1[_i];
            var state_1 = _loop_1(char);
            if (state_1 === "break")
                break;
        }
        // short-circuit if quotes not needed
        if (!needsQuotes) {
            return arg;
        }
        // the following quoting rules are very similar to the rules that by libuv applies.
        //
        // 1) wrap the string in quotes
        //
        // 2) double-up quotes - i.e. " => ""
        //
        //    this is different from the libuv quoting rules. libuv replaces " with \", which unfortunately
        //    doesn't work well with a cmd.exe command line.
        //
        //    note, replacing " with "" also works well if the arg is passed to a downstream .NET console app.
        //    for example, the command line:
        //          foo.exe "myarg:""my val"""
        //    is parsed by a .NET console app into an arg array:
        //          [ "myarg:\"my val\"" ]
        //    which is the same end result when applying libuv quoting rules. although the actual
        //    command line from libuv quoting rules would look like:
        //          foo.exe "myarg:\"my val\""
        //
        // 3) double-up slashes that preceed a quote,
        //    e.g.  hello \world    => "hello \world"
        //          hello\"world    => "hello\\""world"
        //          hello\\"world   => "hello\\\\""world"
        //          hello world\    => "hello world\\"
        //
        //    technically this is not required for a cmd.exe command line, or the batch argument parser.
        //    the reasons for including this as a .cmd quoting rule are:
        //
        //    a) this is optimized for the scenario where the argument is passed from the .cmd file to an
        //       external program. many programs (e.g. .NET console apps) rely on the slash-doubling rule.
        //
        //    b) it's what we've been doing previously (by deferring to node default behavior) and we
        //       haven't heard any complaints about that aspect.
        //
        // note, a weakness of the quoting rules chosen here, is that % is not escaped. in fact, % cannot be
        // escaped when used on the command line directly - even though within a .cmd file % can be escaped
        // by using %%.
        //
        // the saving grace is, on the command line, %var% is left as-is if var is not defined. this contrasts
        // the line parsing rules within a .cmd file, where if var is not defined it is replaced with nothing.
        //
        // one option that was explored was replacing % with ^% - i.e. %var% => ^%var^%. this hack would
        // often work, since it is unlikely that var^ would exist, and the ^ character is removed when the
        // variable is used. the problem, however, is that ^ is not removed when %* is used to pass the args
        // to an external program.
        //
        // an unexplored potential solution for the % escaping problem, is to create a wrapper .cmd file.
        // % can be escaped within a .cmd file.
        var reverse = '"';
        var quote_hit = true;
        for (var i = arg.length; i > 0; i--) { // walk the string in reverse
            reverse += arg[i - 1];
            if (quote_hit && arg[i - 1] == '\\') {
                reverse += '\\'; // double the slash
            }
            else if (arg[i - 1] == '"') {
                quote_hit = true;
                reverse += '"'; // double the quote
            }
            else {
                quote_hit = false;
            }
        }
        reverse += '"';
        return reverse.split('').reverse().join('');
    };
    ToolRunner.prototype._uv_quote_cmd_arg = function (arg) {
        // Tool runner wraps child_process.spawn() and needs to apply the same quoting as
        // Node in certain cases where the undocumented spawn option windowsVerbatimArguments
        // is used.
        //
        // Since this function is a port of quote_cmd_arg from Node 4.x (technically, lib UV,
        // see https://github.com/nodejs/node/blob/v4.x/deps/uv/src/win/process.c for details),
        // pasting copyright notice from Node within this function:
        //
        //      Copyright Joyent, Inc. and other Node contributors. All rights reserved.
        //
        //      Permission is hereby granted, free of charge, to any person obtaining a copy
        //      of this software and associated documentation files (the "Software"), to
        //      deal in the Software without restriction, including without limitation the
        //      rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
        //      sell copies of the Software, and to permit persons to whom the Software is
        //      furnished to do so, subject to the following conditions:
        //
        //      The above copyright notice and this permission notice shall be included in
        //      all copies or substantial portions of the Software.
        //
        //      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        //      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        //      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        //      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        //      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
        //      FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
        //      IN THE SOFTWARE.
        if (!arg) {
            // Need double quotation for empty argument
            return '""';
        }
        if (arg.indexOf(' ') < 0 && arg.indexOf('\t') < 0 && arg.indexOf('"') < 0) {
            // No quotation needed
            return arg;
        }
        if (arg.indexOf('"') < 0 && arg.indexOf('\\') < 0) {
            // No embedded double quotes or backslashes, so I can just wrap
            // quote marks around the whole thing.
            return "\"" + arg + "\"";
        }
        // Expected input/output:
        //   input : hello"world
        //   output: "hello\"world"
        //   input : hello""world
        //   output: "hello\"\"world"
        //   input : hello\world
        //   output: hello\world
        //   input : hello\\world
        //   output: hello\\world
        //   input : hello\"world
        //   output: "hello\\\"world"
        //   input : hello\\"world
        //   output: "hello\\\\\"world"
        //   input : hello world\
        //   output: "hello world\\" - note the comment in libuv actually reads "hello world\"
        //                             but it appears the comment is wrong, it should be "hello world\\"
        var reverse = '"';
        var quote_hit = true;
        for (var i = arg.length; i > 0; i--) { // walk the string in reverse
            reverse += arg[i - 1];
            if (quote_hit && arg[i - 1] == '\\') {
                reverse += '\\';
            }
            else if (arg[i - 1] == '"') {
                quote_hit = true;
                reverse += '\\';
            }
            else {
                quote_hit = false;
            }
        }
        reverse += '"';
        return reverse.split('').reverse().join('');
    };
    ToolRunner.prototype._cloneExecOptions = function (options) {
        options = options || {};
        var result = {
            cwd: options.cwd || process.cwd(),
            env: options.env || process.env,
            silent: options.silent || false,
            failOnStdErr: options.failOnStdErr || false,
            ignoreReturnCode: options.ignoreReturnCode || false,
            windowsVerbatimArguments: options.windowsVerbatimArguments || false,
            shell: options.shell || false
        };
        result.outStream = options.outStream || process.stdout;
        result.errStream = options.errStream || process.stderr;
        return result;
    };
    ToolRunner.prototype._getSpawnOptions = function (options) {
        options = options || {};
        var result = {};
        result.cwd = options.cwd;
        result.env = options.env;
        result.shell = options.shell;
        result['windowsVerbatimArguments'] = options.windowsVerbatimArguments || this._isCmdFile();
        return result;
    };
    ToolRunner.prototype._getSpawnSyncOptions = function (options) {
        var result = {};
        result.cwd = options.cwd;
        result.env = options.env;
        result.shell = options.shell;
        result['windowsVerbatimArguments'] = options.windowsVerbatimArguments || this._isCmdFile();
        return result;
    };
    ToolRunner.prototype.execWithPiping = function (pipeOutputToTool, options) {
        var _this = this;
        var defer = Q.defer();
        this._debug('exec tool: ' + this.toolPath);
        this._debug('arguments:');
        this.args.forEach(function (arg) {
            _this._debug('   ' + arg);
        });
        var success = true;
        var optionsNonNull = this._cloneExecOptions(options);
        if (!optionsNonNull.silent) {
            optionsNonNull.outStream.write(this._getCommandString(optionsNonNull) + os.EOL);
        }
        var cp;
        var toolPath = pipeOutputToTool.toolPath;
        var toolPathFirst;
        var successFirst = true;
        var returnCodeFirst;
        var fileStream;
        var waitingEvents = 0; // number of process or stream events we are waiting on to complete
        var returnCode = 0;
        var error;
        toolPathFirst = this.toolPath;
        // Following node documentation example from this link on how to pipe output of one process to another
        // https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
        //start the child process for both tools
        waitingEvents++;
        var cpFirst = child.spawn(this._getSpawnFileName(), this._getSpawnArgs(optionsNonNull), this._getSpawnOptions(optionsNonNull));
        waitingEvents++;
        cp = child.spawn(pipeOutputToTool._getSpawnFileName(), pipeOutputToTool._getSpawnArgs(optionsNonNull), pipeOutputToTool._getSpawnOptions(optionsNonNull));
        fileStream = this.pipeOutputToFile ? fs.createWriteStream(this.pipeOutputToFile) : null;
        if (fileStream) {
            waitingEvents++;
            fileStream.on('finish', function () {
                waitingEvents--; //file write is complete
                fileStream = null;
                if (waitingEvents == 0) {
                    if (error) {
                        defer.reject(error);
                    }
                    else {
                        defer.resolve(returnCode);
                    }
                }
            });
            fileStream.on('error', function (err) {
                waitingEvents--; //there were errors writing to the file, write is done
                _this._debug("Failed to pipe output of " + toolPathFirst + " to file " + _this.pipeOutputToFile + ". Error = " + err);
                fileStream = null;
                if (waitingEvents == 0) {
                    if (error) {
                        defer.reject(error);
                    }
                    else {
                        defer.resolve(returnCode);
                    }
                }
            });
        }
        //pipe stdout of first tool to stdin of second tool
        cpFirst.stdout.on('data', function (data) {
            try {
                if (fileStream) {
                    fileStream.write(data);
                }
                cp.stdin.write(data);
            }
            catch (err) {
                _this._debug('Failed to pipe output of ' + toolPathFirst + ' to ' + toolPath);
                _this._debug(toolPath + ' might have exited due to errors prematurely. Verify the arguments passed are valid.');
            }
        });
        cpFirst.stderr.on('data', function (data) {
            if (fileStream) {
                fileStream.write(data);
            }
            successFirst = !optionsNonNull.failOnStdErr;
            if (!optionsNonNull.silent) {
                var s = optionsNonNull.failOnStdErr ? optionsNonNull.errStream : optionsNonNull.outStream;
                s.write(data);
            }
        });
        cpFirst.on('error', function (err) {
            waitingEvents--; //first process is complete with errors
            if (fileStream) {
                fileStream.end();
            }
            cp.stdin.end();
            error = new Error(toolPathFirst + ' failed. ' + err.message);
            if (waitingEvents == 0) {
                defer.reject(error);
            }
        });
        cpFirst.on('close', function (code, signal) {
            waitingEvents--; //first process is complete
            if (code != 0 && !optionsNonNull.ignoreReturnCode) {
                successFirst = false;
                returnCodeFirst = code;
                returnCode = returnCodeFirst;
            }
            _this._debug('success of first tool:' + successFirst);
            if (fileStream) {
                fileStream.end();
            }
            cp.stdin.end();
            if (waitingEvents == 0) {
                if (error) {
                    defer.reject(error);
                }
                else {
                    defer.resolve(returnCode);
                }
            }
        });
        var stdbuffer = '';
        cp.stdout.on('data', function (data) {
            _this.emit('stdout', data);
            if (!optionsNonNull.silent) {
                optionsNonNull.outStream.write(data);
            }
            _this._processLineBuffer(data, stdbuffer, function (line) {
                _this.emit('stdline', line);
            });
        });
        var errbuffer = '';
        cp.stderr.on('data', function (data) {
            _this.emit('stderr', data);
            success = !optionsNonNull.failOnStdErr;
            if (!optionsNonNull.silent) {
                var s = optionsNonNull.failOnStdErr ? optionsNonNull.errStream : optionsNonNull.outStream;
                s.write(data);
            }
            _this._processLineBuffer(data, errbuffer, function (line) {
                _this.emit('errline', line);
            });
        });
        cp.on('error', function (err) {
            waitingEvents--; //process is done with errors
            error = new Error(toolPath + ' failed. ' + err.message);
            if (waitingEvents == 0) {
                defer.reject(error);
            }
        });
        cp.on('close', function (code, signal) {
            waitingEvents--; //process is complete
            _this._debug('rc:' + code);
            returnCode = code;
            if (stdbuffer.length > 0) {
                _this.emit('stdline', stdbuffer);
            }
            if (errbuffer.length > 0) {
                _this.emit('errline', errbuffer);
            }
            if (code != 0 && !optionsNonNull.ignoreReturnCode) {
                success = false;
            }
            _this._debug('success:' + success);
            if (!successFirst) { //in the case output is piped to another tool, check exit code of both tools
                error = new Error(toolPathFirst + ' failed with return code: ' + returnCodeFirst);
            }
            else if (!success) {
                error = new Error(toolPath + ' failed with return code: ' + code);
            }
            if (waitingEvents == 0) {
                if (error) {
                    defer.reject(error);
                }
                else {
                    defer.resolve(returnCode);
                }
            }
        });
        return defer.promise;
    };
    /**
     * Add argument
     * Append an argument or an array of arguments
     * returns ToolRunner for chaining
     *
     * @param     val        string cmdline or array of strings
     * @returns   ToolRunner
     */
    ToolRunner.prototype.arg = function (val) {
        if (!val) {
            return this;
        }
        if (val instanceof Array) {
            this._debug(this.toolPath + ' arg: ' + JSON.stringify(val));
            this.args = this.args.concat(val);
        }
        else if (typeof (val) === 'string') {
            this._debug(this.toolPath + ' arg: ' + val);
            this.args = this.args.concat(val.trim());
        }
        return this;
    };
    /**
     * Parses an argument line into one or more arguments
     * e.g. .line('"arg one" two -z') is equivalent to .arg(['arg one', 'two', '-z'])
     * returns ToolRunner for chaining
     *
     * @param     val        string argument line
     * @returns   ToolRunner
     */
    ToolRunner.prototype.line = function (val) {
        if (!val) {
            return this;
        }
        this._debug(this.toolPath + ' arg: ' + val);
        this.args = this.args.concat(this._argStringToArray(val));
        return this;
    };
    /**
     * Add argument(s) if a condition is met
     * Wraps arg().  See arg for details
     * returns ToolRunner for chaining
     *
     * @param     condition     boolean condition
     * @param     val     string cmdline or array of strings
     * @returns   ToolRunner
     */
    ToolRunner.prototype.argIf = function (condition, val) {
        if (condition) {
            this.arg(val);
        }
        return this;
    };
    /**
     * Pipe output of exec() to another tool
     * @param tool
     * @param file  optional filename to additionally stream the output to.
     * @returns {ToolRunner}
     */
    ToolRunner.prototype.pipeExecOutputToTool = function (tool, file) {
        this.pipeOutputToTool = tool;
        this.pipeOutputToFile = file;
        return this;
    };
    /**
     * Exec a tool.
     * Output will be streamed to the live console.
     * Returns promise with return code
     *
     * @param     tool     path to tool to exec
     * @param     options  optional exec options.  See IExecOptions
     * @returns   number
     */
    ToolRunner.prototype.exec = function (options) {
        var _this = this;
        if (this.pipeOutputToTool) {
            return this.execWithPiping(this.pipeOutputToTool, options);
        }
        var defer = Q.defer();
        this._debug('exec tool: ' + this.toolPath);
        this._debug('arguments:');
        this.args.forEach(function (arg) {
            _this._debug('   ' + arg);
        });
        var optionsNonNull = this._cloneExecOptions(options);
        if (!optionsNonNull.silent) {
            optionsNonNull.outStream.write(this._getCommandString(optionsNonNull) + os.EOL);
        }
        var state = new ExecState(optionsNonNull, this.toolPath);
        state.on('debug', function (message) {
            _this._debug(message);
        });
        var cp = child.spawn(this._getSpawnFileName(), this._getSpawnArgs(optionsNonNull), this._getSpawnOptions(options));
        // it is possible for the child process to end its last line without a new line.
        // because stdout is buffered, this causes the last line to not get sent to the parent
        // stream. Adding this event forces a flush before the child streams are closed.
        cp.stdout.on('finish', function () {
            if (!optionsNonNull.silent) {
                optionsNonNull.outStream.write(os.EOL);
            }
        });
        var stdbuffer = '';
        cp.stdout.on('data', function (data) {
            _this.emit('stdout', data);
            if (!optionsNonNull.silent) {
                optionsNonNull.outStream.write(data);
            }
            _this._processLineBuffer(data, stdbuffer, function (line) {
                _this.emit('stdline', line);
            });
        });
        var errbuffer = '';
        cp.stderr.on('data', function (data) {
            state.processStderr = true;
            _this.emit('stderr', data);
            if (!optionsNonNull.silent) {
                var s = optionsNonNull.failOnStdErr ? optionsNonNull.errStream : optionsNonNull.outStream;
                s.write(data);
            }
            _this._processLineBuffer(data, errbuffer, function (line) {
                _this.emit('errline', line);
            });
        });
        cp.on('error', function (err) {
            state.processError = err.message;
            state.processExited = true;
            state.processClosed = true;
            state.CheckComplete();
        });
        cp.on('exit', function (code, signal) {
            state.processExitCode = code;
            state.processExited = true;
            _this._debug("Exit code " + code + " received from tool '" + _this.toolPath + "'");
            state.CheckComplete();
        });
        cp.on('close', function (code, signal) {
            state.processExitCode = code;
            state.processExited = true;
            state.processClosed = true;
            _this._debug("STDIO streams have closed for tool '" + _this.toolPath + "'");
            state.CheckComplete();
        });
        state.on('done', function (error, exitCode) {
            if (stdbuffer.length > 0) {
                _this.emit('stdline', stdbuffer);
            }
            if (errbuffer.length > 0) {
                _this.emit('errline', errbuffer);
            }
            cp.removeAllListeners();
            if (error) {
                defer.reject(error);
            }
            else {
                defer.resolve(exitCode);
            }
        });
        return defer.promise;
    };
    /**
     * Exec a tool synchronously.
     * Output will be *not* be streamed to the live console.  It will be returned after execution is complete.
     * Appropriate for short running tools
     * Returns IExecSyncResult with output and return code
     *
     * @param     tool     path to tool to exec
     * @param     options  optional exec options.  See IExecSyncOptions
     * @returns   IExecSyncResult
     */
    ToolRunner.prototype.execSync = function (options) {
        var _this = this;
        this._debug('exec tool: ' + this.toolPath);
        this._debug('arguments:');
        this.args.forEach(function (arg) {
            _this._debug('   ' + arg);
        });
        var success = true;
        options = this._cloneExecOptions(options);
        if (!options.silent) {
            options.outStream.write(this._getCommandString(options) + os.EOL);
        }
        var r = child.spawnSync(this._getSpawnFileName(), this._getSpawnArgs(options), this._getSpawnSyncOptions(options));
        if (!options.silent && r.stdout && r.stdout.length > 0) {
            options.outStream.write(r.stdout);
        }
        if (!options.silent && r.stderr && r.stderr.length > 0) {
            options.errStream.write(r.stderr);
        }
        var res = { code: r.status, error: r.error };
        res.stdout = (r.stdout) ? r.stdout.toString() : '';
        res.stderr = (r.stderr) ? r.stderr.toString() : '';
        return res;
    };
    return ToolRunner;
}(events.EventEmitter));
exports.ToolRunner = ToolRunner;
var ExecState = /** @class */ (function (_super) {
    __extends(ExecState, _super);
    function ExecState(options, toolPath) {
        var _this = _super.call(this) || this;
        _this.delay = 10000; // 10 seconds
        _this.timeout = null;
        if (!toolPath) {
            throw new Error('toolPath must not be empty');
        }
        _this.options = options;
        _this.toolPath = toolPath;
        var delay = process.env['TASKLIB_TEST_TOOLRUNNER_EXITDELAY'];
        if (delay) {
            _this.delay = parseInt(delay);
        }
        return _this;
    }
    ExecState.prototype.CheckComplete = function () {
        if (this.done) {
            return;
        }
        if (this.processClosed) {
            this._setResult();
        }
        else if (this.processExited) {
            this.timeout = setTimeout(ExecState.HandleTimeout, this.delay, this);
        }
    };
    ExecState.prototype._debug = function (message) {
        this.emit('debug', message);
    };
    ExecState.prototype._setResult = function () {
        // determine whether there is an error
        var error;
        if (this.processExited) {
            if (this.processError) {
                error = new Error(im._loc('LIB_ProcessError', this.toolPath, this.processError));
            }
            else if (this.processExitCode != 0 && !this.options.ignoreReturnCode) {
                error = new Error(im._loc('LIB_ProcessExitCode', this.toolPath, this.processExitCode));
            }
            else if (this.processStderr && this.options.failOnStdErr) {
                error = new Error(im._loc('LIB_ProcessStderr', this.toolPath));
            }
        }
        // clear the timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.done = true;
        this.emit('done', error, this.processExitCode);
    };
    ExecState.HandleTimeout = function (state) {
        if (state.done) {
            return;
        }
        if (!state.processClosed && state.processExited) {
            console.log(im._loc('LIB_StdioNotClosed', state.delay / 1000, state.toolPath));
            state._debug(im._loc('LIB_StdioNotClosed', state.delay / 1000, state.toolPath));
        }
        state._setResult();
    };
    return ExecState;
}(events.EventEmitter));


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2017 Kris Kowal under the terms of the MIT
 * license found at https://github.com/kriskowal/q/blob/v1/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    "use strict";

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (true) {
        module.exports = definition();

    // RequireJS
    } else { var previousQ, global; }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;
    // queue for late tasks, used by unhandled rejection tracking
    var laterQueue = [];

    function flush() {
        /* jshint loopfunc: true */
        var task, domain;

        while (head.next) {
            head = head.next;
            task = head.task;
            head.task = void 0;
            domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }
            runSingle(task, domain);

        }
        while (laterQueue.length) {
            task = laterQueue.pop();
            runSingle(task);
        }
        flushing = false;
    }
    // runs a single function in the async queue
    function runSingle(task, domain) {
        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process === "object" &&
        process.toString() === "[object process]" && process.nextTick) {
        // Ensure Q is in a real Node environment, with a `process.nextTick`.
        // To see through fake Node environments:
        // * Mocha test runner - exposes a `process` global without a `nextTick`
        // * Browserify - exposes a `process.nexTick` function that uses
        //   `setTimeout`. In this case `setImmediate` is preferred because
        //    it is faster. Browserify's `process.toString()` yields
        //   "[object Object]", while in a real Node environment
        //   `process.toString()` yields "[object process]".
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }
    // runs a task after all other tasks have been run
    // this is useful for unhandled rejection tracking that needs to happen
    // after all `then`d tasks have been run.
    nextTick.runAfter = function (task) {
        laterQueue.push(task);
        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };
    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_defineProperty = Object.defineProperty || function (obj, prop, descriptor) {
    obj[prop] = descriptor.value;
    return obj;
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack && (!error.__minimumStackCounter__ || error.__minimumStackCounter__ > p.stackCounter)) {
                object_defineProperty(error, "__minimumStackCounter__", {value: p.stackCounter, configurable: true});
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        var stack = filterStackString(concatedStacks);
        object_defineProperty(error, "stack", {value: stack, configurable: true});
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (value instanceof Promise) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * The counter is used to determine the stopping point for building
 * long stack traces. In makeStackTraceLong we walk backwards through
 * the linked list of promises, only stacks which were created before
 * the rejection are concatenated.
 */
var longStackCounter = 1;

// enable long stacks if Q_DEBUG is set
if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
    Q.longStackSupport = true;
}

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            Q.nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
            promise.stackCounter = longStackCounter++;
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;

        if (Q.longStackSupport && hasStacks) {
            // Only hold a reference to the new promise if long stacks
            // are enabled to reduce memory usage
            promise.source = newPromise;
        }

        array_reduce(messages, function (undefined, message) {
            Q.nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            Q.nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Q can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become settled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be settled
 */
Q.race = race;
function race(answerPs) {
    return promise(function (resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function (answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    Q.nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

Q.tap = function (promise, callback) {
    return Q(promise).tap(callback);
};

/**
 * Works almost like "finally", but not called for rejections.
 * Original resolution value is passed through callback unaffected.
 * Callback may return a promise that will be awaited for.
 * @param {Function} callback
 * @returns {Q.Promise}
 * @example
 * doSomething()
 *   .then(...)
 *   .tap(console.log)
 *   .then(...);
 */
Promise.prototype.tap = function (callback) {
    callback = Q(callback);

    return this.then(function (value) {
        return callback.fcall(value).thenResolve(value);
    });
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return object instanceof Promise;
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var reportedUnhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }
    if (typeof process === "object" && typeof process.emit === "function") {
        Q.nextTick.runAfter(function () {
            if (array_indexOf(unhandledRejections, promise) !== -1) {
                process.emit("unhandledRejection", reason, promise);
                reportedUnhandledRejections.push(promise);
            }
        });
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        if (typeof process === "object" && typeof process.emit === "function") {
            Q.nextTick.runAfter(function () {
                var atReport = array_indexOf(reportedUnhandledRejections, promise);
                if (atReport !== -1) {
                    process.emit("rejectionHandled", unhandledReasons[at], promise);
                    reportedUnhandledRejections.splice(atReport, 1);
                }
            });
        }
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    Q.nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return Q(result.value);
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return Q(exception.value);
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    Q.nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var pendingCount = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++pendingCount;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--pendingCount === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (pendingCount === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Returns the first resolved promise of an array. Prior rejected promises are
 * ignored.  Rejects only if all promises are rejected.
 * @param {Array*} an array containing values or promises for values
 * @returns a promise fulfilled with the value of the first resolved promise,
 * or a rejected promise if all promises are rejected.
 */
Q.any = any;

function any(promises) {
    if (promises.length === 0) {
        return Q.resolve();
    }

    var deferred = Q.defer();
    var pendingCount = 0;
    array_reduce(promises, function (prev, current, index) {
        var promise = promises[index];

        pendingCount++;

        when(promise, onFulfilled, onRejected, onProgress);
        function onFulfilled(result) {
            deferred.resolve(result);
        }
        function onRejected(err) {
            pendingCount--;
            if (pendingCount === 0) {
                var rejection = err || new Error("" + err);

                rejection.message = ("Q can't get fulfillment value from any promise, all " +
                    "promises were rejected. Last error message: " + rejection.message);

                deferred.reject(rejection);
            }
        }
        function onProgress(progress) {
            deferred.notify({
                index: index,
                value: progress
            });
        }
    }, undefined);

    return deferred.promise;
}

Promise.prototype.any = function () {
    return any(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    if (!callback || typeof callback.apply !== "function") {
        throw new Error("Q can't apply finally callback");
    }
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        Q.nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {Any*} custom error message or Error object (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, error) {
    return Q(object).timeout(ms, error);
};

Promise.prototype.timeout = function (ms, error) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        if (!error || "string" === typeof error) {
            error = new Error(error || "Timed out after " + ms + " ms");
            error.code = "ETIMEDOUT";
        }
        deferred.reject(error);
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    if (callback === undefined) {
        throw new Error("Q can't wrap an undefined function");
    }
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            Q.nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            Q.nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

Q.noConflict = function() {
    throw new Error("Q.noConflict only works when Q is used as a global");
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});


/***/ }),
/* 46 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZnNcIiIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL25vZGVfbW9kdWxlcy9henVyZS1waXBlbGluZXMtdGFzay1saWIvbm9kZV9tb2R1bGVzL3NoZWxsanMvc3JjL2NvbW1vbi5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJwYXRoXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwib3NcIiIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL25vZGVfbW9kdWxlcy9henVyZS1waXBlbGluZXMtdGFzay1saWIvbm9kZV9tb2R1bGVzL3NoZWxsanMvc3JjL2xzLmpzIiwid2VicGFjazovLy8uL2J1aWxkQW5kUmVsZWFzZVRhc2svbm9kZV9tb2R1bGVzL2F6dXJlLXBpcGVsaW5lcy10YXNrLWxpYi9ub2RlX21vZHVsZXMvc2hlbGxqcy9zcmMvY2QuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvYXp1cmUtcGlwZWxpbmVzLXRhc2stbGliL25vZGVfbW9kdWxlcy9zaGVsbGpzL3NyYy9wd2QuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvYXp1cmUtcGlwZWxpbmVzLXRhc2stbGliL25vZGVfbW9kdWxlcy9zaGVsbGpzL3NyYy9kaXJzLmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcImNoaWxkX3Byb2Nlc3NcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJjcnlwdG9cIiIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL25vZGVfbW9kdWxlcy9henVyZS1waXBlbGluZXMtdGFzay1saWIvbm9kZV9tb2R1bGVzL3NoZWxsanMvc3JjL3RlbXBkaXIuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvbWluaW1hdGNoL21pbmltYXRjaC5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL25vZGVfbW9kdWxlcy9henVyZS1waXBlbGluZXMtdGFzay1saWIvaW50ZXJuYWwuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvYXp1cmUtcGlwZWxpbmVzLXRhc2stbGliL3Rhc2tjb21tYW5kLmpzIiwid2VicGFjazovLy8uL2J1aWxkQW5kUmVsZWFzZVRhc2svbm9kZV9tb2R1bGVzL3V1aWQvdjQuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvc2VtdmVyL3NlbXZlci5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL3NjY21wb3dlcnNoZWxsLnRzIiwid2VicGFjazovLy8uL2J1aWxkQW5kUmVsZWFzZVRhc2svbm9kZV9tb2R1bGVzL2F6dXJlLXBpcGVsaW5lcy10YXNrLWxpYi90YXNrLmpzIiwid2VicGFjazovLy8uL2J1aWxkQW5kUmVsZWFzZVRhc2svbm9kZV9tb2R1bGVzL2F6dXJlLXBpcGVsaW5lcy10YXNrLWxpYi9ub2RlX21vZHVsZXMvc2hlbGxqcy9zaGVsbC5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL25vZGVfbW9kdWxlcy9henVyZS1waXBlbGluZXMtdGFzay1saWIvbm9kZV9tb2R1bGVzL3NoZWxsanMvc3JjL2ZpbmQuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvYXp1cmUtcGlwZWxpbmVzLXRhc2stbGliL25vZGVfbW9kdWxlcy9zaGVsbGpzL3NyYy9jcC5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL25vZGVfbW9kdWxlcy9henVyZS1waXBlbGluZXMtdGFzay1saWIvbm9kZV9tb2R1bGVzL3NoZWxsanMvc3JjL3JtLmpzIiwid2VicGFjazovLy8uL2J1aWxkQW5kUmVsZWFzZVRhc2svbm9kZV9tb2R1bGVzL2F6dXJlLXBpcGVsaW5lcy10YXNrLWxpYi9ub2RlX21vZHVsZXMvc2hlbGxqcy9zcmMvbXYuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvYXp1cmUtcGlwZWxpbmVzLXRhc2stbGliL25vZGVfbW9kdWxlcy9zaGVsbGpzL3NyYy9ta2Rpci5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL25vZGVfbW9kdWxlcy9henVyZS1waXBlbGluZXMtdGFzay1saWIvbm9kZV9tb2R1bGVzL3NoZWxsanMvc3JjL3Rlc3QuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvYXp1cmUtcGlwZWxpbmVzLXRhc2stbGliL25vZGVfbW9kdWxlcy9zaGVsbGpzL3NyYy9jYXQuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvYXp1cmUtcGlwZWxpbmVzLXRhc2stbGliL25vZGVfbW9kdWxlcy9zaGVsbGpzL3NyYy90by5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL25vZGVfbW9kdWxlcy9henVyZS1waXBlbGluZXMtdGFzay1saWIvbm9kZV9tb2R1bGVzL3NoZWxsanMvc3JjL3RvRW5kLmpzIiwid2VicGFjazovLy8uL2J1aWxkQW5kUmVsZWFzZVRhc2svbm9kZV9tb2R1bGVzL2F6dXJlLXBpcGVsaW5lcy10YXNrLWxpYi9ub2RlX21vZHVsZXMvc2hlbGxqcy9zcmMvc2VkLmpzIiwid2VicGFjazovLy8uL2J1aWxkQW5kUmVsZWFzZVRhc2svbm9kZV9tb2R1bGVzL2F6dXJlLXBpcGVsaW5lcy10YXNrLWxpYi9ub2RlX21vZHVsZXMvc2hlbGxqcy9zcmMvZ3JlcC5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL25vZGVfbW9kdWxlcy9henVyZS1waXBlbGluZXMtdGFzay1saWIvbm9kZV9tb2R1bGVzL3NoZWxsanMvc3JjL3doaWNoLmpzIiwid2VicGFjazovLy8uL2J1aWxkQW5kUmVsZWFzZVRhc2svbm9kZV9tb2R1bGVzL2F6dXJlLXBpcGVsaW5lcy10YXNrLWxpYi9ub2RlX21vZHVsZXMvc2hlbGxqcy9zcmMvZWNoby5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL25vZGVfbW9kdWxlcy9henVyZS1waXBlbGluZXMtdGFzay1saWIvbm9kZV9tb2R1bGVzL3NoZWxsanMvc3JjL2xuLmpzIiwid2VicGFjazovLy8uL2J1aWxkQW5kUmVsZWFzZVRhc2svbm9kZV9tb2R1bGVzL2F6dXJlLXBpcGVsaW5lcy10YXNrLWxpYi9ub2RlX21vZHVsZXMvc2hlbGxqcy9zcmMvZXhlYy5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL25vZGVfbW9kdWxlcy9henVyZS1waXBlbGluZXMtdGFzay1saWIvbm9kZV9tb2R1bGVzL3NoZWxsanMvc3JjL2NobW9kLmpzIiwid2VicGFjazovLy8uL2J1aWxkQW5kUmVsZWFzZVRhc2svbm9kZV9tb2R1bGVzL2F6dXJlLXBpcGVsaW5lcy10YXNrLWxpYi9ub2RlX21vZHVsZXMvc2hlbGxqcy9zcmMvZXJyb3IuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvYnJhY2UtZXhwYW5zaW9uL2luZGV4LmpzIiwid2VicGFjazovLy8uL2J1aWxkQW5kUmVsZWFzZVRhc2svbm9kZV9tb2R1bGVzL2NvbmNhdC1tYXAvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvYmFsYW5jZWQtbWF0Y2gvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwidXRpbFwiIiwid2VicGFjazovLy8uL2J1aWxkQW5kUmVsZWFzZVRhc2svbm9kZV9tb2R1bGVzL2F6dXJlLXBpcGVsaW5lcy10YXNrLWxpYi92YXVsdC5qcyIsIndlYnBhY2s6Ly8vLi9idWlsZEFuZFJlbGVhc2VUYXNrL25vZGVfbW9kdWxlcy91dWlkL2xpYi9ybmcuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvdXVpZC9saWIvYnl0ZXNUb1V1aWQuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvYXp1cmUtcGlwZWxpbmVzLXRhc2stbGliIHN5bmMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvYXp1cmUtcGlwZWxpbmVzLXRhc2stbGliL3Rvb2xydW5uZXIuanMiLCJ3ZWJwYWNrOi8vLy4vYnVpbGRBbmRSZWxlYXNlVGFzay9ub2RlX21vZHVsZXMvcS9xLmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcImV2ZW50c1wiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7QUNsRkEsK0I7Ozs7OztBQ0FBLFNBQVMs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QUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxLQUFLO0FBQ0wsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLElBQUk7QUFDdkM7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLEVBQUUsRUFBRSxLQUFLO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxRQUFRO0FBQ2hEOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLHNCQUFzQjtBQUNyQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSw2Q0FBNkM7QUFDN0M7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLHVCQUF1QjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLG9CQUFvQjtBQUNoRDtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsa0JBQWtCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtFQUErRSxnQkFBZ0I7QUFDL0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRFQUE0RSxnQkFBZ0I7QUFDNUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxREFBcUQsMkJBQTJCO0FBQ2hGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RCw2Q0FBNkMsRUFBRTtBQUM1RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQ0FBK0MsMEJBQTBCO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3RUFBd0UsZ0JBQWdCO0FBQ3hGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0E7Ozs7Ozs7QUNyR0EsVUFBVSxtQkFBTyxDQUFDLEVBQVc7QUFDN0Isa0JBQWtCLG1CQUFPLENBQUMsRUFBbUI7O0FBRTdDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9CQUFvQixTQUFTO0FBQzdCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7O0FDNUJBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLG9DQUFvQztBQUN4RCwwQkFBMEIsb0NBQW9DO0FBQzlELDBCQUEwQixvQ0FBb0M7QUFDOUQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQLEtBQUs7QUFDTCxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIscUJBQXFCO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlCQUFpQixnQkFBZ0I7QUFDakM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxnQkFBZ0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpQkFBaUIsc0JBQXNCO0FBQ3ZDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEIsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsZ0JBQWdCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDO0FBQ2pDO0FBQ0EseUNBQXlDLG1FQUFtRTtBQUM1RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLE9BQU87QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsZ0JBQWdCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsbUVBQW1FO0FBQ2hIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQyxnRUFBZ0U7QUFDL0c7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQ7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyx3QkFBd0I7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRDtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQyx3QkFBd0I7QUFDdkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0RBQStELDRCQUE0QjtBQUMzRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtEQUErRCw0QkFBNEI7QUFDM0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsaUNBQWlDLEVBQUU7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxnRUFBZ0U7QUFDM0c7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLDRCQUE0QjtBQUNsRSxzQ0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLGdCQUFnQjtBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscURBQXFEO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQStDLHdCQUF3QjtBQUN2RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrREFBK0QsNEJBQTRCO0FBQzNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0RkFBNEYscUJBQXFCLEVBQUU7QUFDbkg7QUFDQTtBQUNBLCtEQUErRCw0QkFBNEI7QUFDM0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QixxQkFBcUIsRUFBRTtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyw2QkFBNkI7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxnRUFBZ0U7QUFDekc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsd0JBQXdCO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxpQ0FBaUM7QUFDakM7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7Ozs7Ozs7QUMvTUEsYUFBYSxtQkFBTyxDQUFDLENBQVU7O0FBRS9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNUQSxnQkFBZ0IsbUJBQU8sQ0FBQyxFQUFZO0FBQ3BDLGVBQWUsbUJBQU8sQ0FBQyxFQUFnQjs7QUFFdkM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkIsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUNBQW1DO0FBQ25DLG9DQUFvQztBQUNwQztBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQSx3Q0FBd0MsR0FBRyxJQUFJO0FBQy9DO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFCQUFxQixLQUFLOztBQUUxQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHFCQUFxQixhQUFhO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4QkFBOEI7QUFDOUIsdUNBQXVDLEdBQUc7QUFDMUMsWUFBWSxHQUFHLHlCQUF5QjtBQUN4QztBQUNBO0FBQ0EsOEJBQThCO0FBQzlCLGNBQWMsR0FBRztBQUNqQjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFdBQVcsWUFBWTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxxQkFBcUIsS0FBSztBQUMxQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxFQUFFO0FBQ1YsMkJBQTJCO0FBQzNCLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLFlBQVksS0FBSyxRQUFRLEVBQUUsSUFBSSxFQUFFO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxtQkFBbUIsWUFBWTtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsbUNBQW1DLDJCQUEyQjtBQUM5RDs7QUFFQSxpQkFBaUIsY0FBYztBQUMvQixtQkFBbUIsaUJBQWlCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7QUN2TUE7QUFDQTtBQUNBLG1CQUFtQixlQUFlO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDWmE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQzFEQSxpQzs7Ozs7OztBQ0FhO0FBQ2IsOENBQThDLGNBQWM7QUFDNUQsU0FBUyxtQkFBTyxDQUFDLENBQUk7QUFDckIsV0FBVyxtQkFBTyxDQUFDLENBQU07QUFDekIsYUFBYSxtQkFBTyxDQUFDLENBQVE7QUFDN0IsYUFBYSxtQkFBTyxDQUFDLEVBQVM7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxtQkFBbUI7QUFDdEU7QUFDQTtBQUNBLENBQUM7QUFDRDs7Ozs7OztBQ3JFQTtBQUNBOztBQUVBLGFBQWEsbUJBQU8sQ0FBQyxDQUFROztBQUU3QjtBQUNBO0FBQ0E7Ozs7Ozs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxTQUFTO0FBQ3hCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUMsV0FBVztBQUNsRDtBQUNBO0FBQ0EsNEI7Ozs7Ozs7QUNSYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLGNBQWMsZ0JBQWdCLHNDQUFzQyxpQkFBaUIsRUFBRTtBQUN2Riw2QkFBNkIsdURBQXVEO0FBQ3BGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHNCQUFzQjtBQUM3QztBQUNBO0FBQ0EsQ0FBQztBQUNELDhDQUE4QyxjQUFjO0FBQzVELFFBQVEsbUJBQU8sQ0FBQyxFQUFHO0FBQ25CLFNBQVMsbUJBQU8sQ0FBQyxDQUFJO0FBQ3JCLGFBQWEsbUJBQU8sQ0FBQyxFQUFRO0FBQzdCLFlBQVksbUJBQU8sQ0FBQyxDQUFlO0FBQ25DLFNBQVMsbUJBQU8sQ0FBQyxFQUFZO0FBQzdCLFNBQVMsbUJBQU8sQ0FBQyxDQUFJO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLHNCQUFzQjtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0Q7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRGQUE0RjtBQUM1RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUVBQXFFLEtBQUssZUFBZTtBQUN6RjtBQUNBO0FBQ0EsbURBQW1ELGtCQUFrQixFQUFFO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLG1CQUFtQjtBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxPQUFPLE9BQU87QUFDOUM7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBO0FBQ0E7QUFDQSwrQkFBK0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsT0FBTyxPQUFPO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsZ0NBQWdDO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7O0FDdjFCRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLLFVBQVUsSUFBeUQ7QUFDeEU7O0FBRUE7QUFDQSxLQUFLLE1BQU0sMEJBK0JOOztBQUVMLENBQUM7QUFDRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxjQUFjLGdCQUFnQjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixpQkFBaUI7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Es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O0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtDQUFrQyxjQUFjLEVBQUU7QUFDbEQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0NBQWtDLGNBQWMsRUFBRTtBQUNsRDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMLGdCQUFnQjtBQUNoQixLQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLGdCQUFnQjtBQUNoQixLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxXQUFXLFNBQVM7QUFDcEIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsUUFBUTtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBLHlDQUF5QyxnQ0FBZ0M7QUFDekU7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsTUFBTSxzQ0FBc0M7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGtEQUFrRDtBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxTQUFTO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBLENBQUM7Ozs7Ozs7QUMzaEVELG1DIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMTYpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZnNcIik7IiwidmFyIG9zID0gcmVxdWlyZSgnb3MnKTtcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG52YXIgX2xzID0gcmVxdWlyZSgnLi9scycpO1xuXG4vLyBNb2R1bGUgZ2xvYmFsc1xudmFyIGNvbmZpZyA9IHtcbiAgc2lsZW50OiBmYWxzZSxcbiAgZmF0YWw6IGZhbHNlXG59O1xuZXhwb3J0cy5jb25maWcgPSBjb25maWc7XG5cbnZhciBzdGF0ZSA9IHtcbiAgZXJyb3I6IG51bGwsXG4gIGN1cnJlbnRDbWQ6ICdzaGVsbC5qcycsXG4gIHRlbXBEaXI6IG51bGxcbn07XG5leHBvcnRzLnN0YXRlID0gc3RhdGU7XG5cbnZhciBwbGF0Zm9ybSA9IG9zLnR5cGUoKS5tYXRjaCgvXldpbi8pID8gJ3dpbicgOiAndW5peCc7XG5leHBvcnRzLnBsYXRmb3JtID0gcGxhdGZvcm07XG5cbmZ1bmN0aW9uIGxvZygpIHtcbiAgaWYgKCFjb25maWcuc2lsZW50KVxuICAgIGNvbnNvbGUubG9nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5leHBvcnRzLmxvZyA9IGxvZztcblxuLy8gU2hvd3MgZXJyb3IgbWVzc2FnZS4gVGhyb3dzIHVubGVzcyBfY29udGludWUgb3IgY29uZmlnLmZhdGFsIGFyZSB0cnVlXG5mdW5jdGlvbiBlcnJvcihtc2csIF9jb250aW51ZSkge1xuICBpZiAoc3RhdGUuZXJyb3IgPT09IG51bGwpXG4gICAgc3RhdGUuZXJyb3IgPSAnJztcbiAgc3RhdGUuZXJyb3IgKz0gc3RhdGUuY3VycmVudENtZCArICc6ICcgKyBtc2cgKyAnXFxuJztcblxuICBpZiAobXNnLmxlbmd0aCA+IDApXG4gICAgbG9nKHN0YXRlLmVycm9yKTtcblxuICBpZiAoY29uZmlnLmZhdGFsKVxuICAgIHByb2Nlc3MuZXhpdCgxKTtcblxuICBpZiAoIV9jb250aW51ZSlcbiAgICB0aHJvdyAnJztcbn1cbmV4cG9ydHMuZXJyb3IgPSBlcnJvcjtcblxuLy8gSW4gdGhlIGZ1dHVyZSwgd2hlbiBQcm94aWVzIGFyZSBkZWZhdWx0LCB3ZSBjYW4gYWRkIG1ldGhvZHMgbGlrZSBgLnRvKClgIHRvIHByaW1pdGl2ZSBzdHJpbmdzLlxuLy8gRm9yIG5vdywgdGhpcyBpcyBhIGR1bW15IGZ1bmN0aW9uIHRvIGJvb2ttYXJrIHBsYWNlcyB3ZSBuZWVkIHN1Y2ggc3RyaW5nc1xuZnVuY3Rpb24gU2hlbGxTdHJpbmcoc3RyKSB7XG4gIHJldHVybiBzdHI7XG59XG5leHBvcnRzLlNoZWxsU3RyaW5nID0gU2hlbGxTdHJpbmc7XG5cbi8vIFJldHVybnMgeydhbGljZSc6IHRydWUsICdib2InOiBmYWxzZX0gd2hlbiBwYXNzZWQgYSBkaWN0aW9uYXJ5LCBlLmcuOlxuLy8gICBwYXJzZU9wdGlvbnMoJy1hJywgeydhJzonYWxpY2UnLCAnYic6J2JvYid9KTtcbmZ1bmN0aW9uIHBhcnNlT3B0aW9ucyhzdHIsIG1hcCkge1xuICBpZiAoIW1hcClcbiAgICBlcnJvcigncGFyc2VPcHRpb25zKCkgaW50ZXJuYWwgZXJyb3I6IG5vIG1hcCBnaXZlbicpO1xuXG4gIC8vIEFsbCBvcHRpb25zIGFyZSBmYWxzZSBieSBkZWZhdWx0XG4gIHZhciBvcHRpb25zID0ge307XG4gIGZvciAodmFyIGxldHRlciBpbiBtYXApXG4gICAgb3B0aW9uc1ttYXBbbGV0dGVyXV0gPSBmYWxzZTtcblxuICBpZiAoIXN0cilcbiAgICByZXR1cm4gb3B0aW9uczsgLy8gZGVmYXVsdHNcblxuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpXG4gICAgZXJyb3IoJ3BhcnNlT3B0aW9ucygpIGludGVybmFsIGVycm9yOiB3cm9uZyBzdHInKTtcblxuICAvLyBlLmcuIG1hdGNoWzFdID0gJ1JmJyBmb3Igc3RyID0gJy1SZidcbiAgdmFyIG1hdGNoID0gc3RyLm1hdGNoKC9eXFwtKC4rKS8pO1xuICBpZiAoIW1hdGNoKVxuICAgIHJldHVybiBvcHRpb25zO1xuXG4gIC8vIGUuZy4gY2hhcnMgPSBbJ1InLCAnZiddXG4gIHZhciBjaGFycyA9IG1hdGNoWzFdLnNwbGl0KCcnKTtcblxuICBjaGFycy5mb3JFYWNoKGZ1bmN0aW9uKGMpIHtcbiAgICBpZiAoYyBpbiBtYXApXG4gICAgICBvcHRpb25zW21hcFtjXV0gPSB0cnVlO1xuICAgIGVsc2VcbiAgICAgIGVycm9yKCdvcHRpb24gbm90IHJlY29nbml6ZWQ6ICcrYyk7XG4gIH0pO1xuXG4gIHJldHVybiBvcHRpb25zO1xufVxuZXhwb3J0cy5wYXJzZU9wdGlvbnMgPSBwYXJzZU9wdGlvbnM7XG5cbi8vIEV4cGFuZHMgd2lsZGNhcmRzIHdpdGggbWF0Y2hpbmcgKGllLiBleGlzdGluZykgZmlsZSBuYW1lcy5cbi8vIEZvciBleGFtcGxlOlxuLy8gICBleHBhbmQoWydmaWxlKi5qcyddKSA9IFsnZmlsZTEuanMnLCAnZmlsZTIuanMnLCAuLi5dXG4vLyAgIChpZiB0aGUgZmlsZXMgJ2ZpbGUxLmpzJywgJ2ZpbGUyLmpzJywgZXRjLCBleGlzdCBpbiB0aGUgY3VycmVudCBkaXIpXG5mdW5jdGlvbiBleHBhbmQobGlzdCkge1xuICB2YXIgZXhwYW5kZWQgPSBbXTtcbiAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RFbCkge1xuICAgIC8vIFdpbGRjYXJkIHByZXNlbnQgb24gZGlyZWN0b3J5IG5hbWVzID9cbiAgICBpZihsaXN0RWwuc2VhcmNoKC9cXCpbXlxcL10qXFwvLykgPiAtMSB8fCBsaXN0RWwuc2VhcmNoKC9cXCpcXCpbXlxcL10qXFwvLykgPiAtMSkge1xuICAgICAgdmFyIG1hdGNoID0gbGlzdEVsLm1hdGNoKC9eKFteKl0rXFwvfCkoLiopLyk7XG4gICAgICB2YXIgcm9vdCA9IG1hdGNoWzFdO1xuICAgICAgdmFyIHJlc3QgPSBtYXRjaFsyXTtcbiAgICAgIHZhciByZXN0UmVnZXggPSByZXN0LnJlcGxhY2UoL1xcKlxcKi9nLCBcIi4qXCIpLnJlcGxhY2UoL1xcKi9nLCBcIlteXFxcXC9dKlwiKTtcbiAgICAgIHJlc3RSZWdleCA9IG5ldyBSZWdFeHAocmVzdFJlZ2V4KTtcbiAgICAgIFxuICAgICAgX2xzKCctUicsIHJvb3QpLmZpbHRlcihmdW5jdGlvbiAoZSkge1xuICAgICAgICByZXR1cm4gcmVzdFJlZ2V4LnRlc3QoZSk7XG4gICAgICB9KS5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgZXhwYW5kZWQucHVzaChmaWxlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBXaWxkY2FyZCBwcmVzZW50IG9uIGZpbGUgbmFtZXMgP1xuICAgIGVsc2UgaWYgKGxpc3RFbC5zZWFyY2goL1xcKi8pID4gLTEpIHtcbiAgICAgIF9scygnJywgbGlzdEVsKS5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgZXhwYW5kZWQucHVzaChmaWxlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBhbmRlZC5wdXNoKGxpc3RFbCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGV4cGFuZGVkO1xufVxuZXhwb3J0cy5leHBhbmQgPSBleHBhbmQ7XG5cbi8vIE5vcm1hbGl6ZXMgX3VubGlua1N5bmMoKSBhY3Jvc3MgcGxhdGZvcm1zIHRvIG1hdGNoIFVuaXggYmVoYXZpb3IsIGkuZS5cbi8vIGZpbGUgY2FuIGJlIHVubGlua2VkIGV2ZW4gaWYgaXQncyByZWFkLW9ubHksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvaXNzdWVzLzMwMDZcbmZ1bmN0aW9uIHVubGlua1N5bmMoZmlsZSkge1xuICB0cnkge1xuICAgIGZzLnVubGlua1N5bmMoZmlsZSk7XG4gIH0gY2F0Y2goZSkge1xuICAgIC8vIFRyeSB0byBvdmVycmlkZSBmaWxlIHBlcm1pc3Npb25cbiAgICBpZiAoZS5jb2RlID09PSAnRVBFUk0nKSB7XG4gICAgICBmcy5jaG1vZFN5bmMoZmlsZSwgJzA2NjYnKTtcbiAgICAgIGZzLnVubGlua1N5bmMoZmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG59XG5leHBvcnRzLnVubGlua1N5bmMgPSB1bmxpbmtTeW5jO1xuXG4vLyBlLmcuICdzaGVsbGpzX2E1ZjE4NWQwNDQzY2EuLi4nXG5mdW5jdGlvbiByYW5kb21GaWxlTmFtZSgpIHtcbiAgZnVuY3Rpb24gcmFuZG9tSGFzaChjb3VudCkge1xuICAgIGlmIChjb3VudCA9PT0gMSlcbiAgICAgIHJldHVybiBwYXJzZUludCgxNipNYXRoLnJhbmRvbSgpLCAxMCkudG9TdHJpbmcoMTYpO1xuICAgIGVsc2Uge1xuICAgICAgdmFyIGhhc2ggPSAnJztcbiAgICAgIGZvciAodmFyIGk9MDsgaTxjb3VudDsgaSsrKVxuICAgICAgICBoYXNoICs9IHJhbmRvbUhhc2goMSk7XG4gICAgICByZXR1cm4gaGFzaDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gJ3NoZWxsanNfJytyYW5kb21IYXNoKDIwKTtcbn1cbmV4cG9ydHMucmFuZG9tRmlsZU5hbWUgPSByYW5kb21GaWxlTmFtZTtcblxuLy8gZXh0ZW5kKHRhcmdldF9vYmosIHNvdXJjZV9vYmoxIFssIHNvdXJjZV9vYmoyIC4uLl0pXG4vLyBTaGFsbG93IGV4dGVuZCwgZS5nLjpcbi8vICAgIGV4dGVuZCh7QToxfSwge2I6Mn0sIHtjOjN9KSByZXR1cm5zIHtBOjEsIGI6MiwgYzozfVxuZnVuY3Rpb24gZXh0ZW5kKHRhcmdldCkge1xuICB2YXIgc291cmNlcyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpXG4gICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICB9KTtcblxuICByZXR1cm4gdGFyZ2V0O1xufVxuZXhwb3J0cy5leHRlbmQgPSBleHRlbmQ7XG5cbi8vIENvbW1vbiB3cmFwcGVyIGZvciBhbGwgVW5peC1saWtlIGNvbW1hbmRzXG5mdW5jdGlvbiB3cmFwKGNtZCwgZm4sIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXRWYWx1ZSA9IG51bGw7XG5cbiAgICBzdGF0ZS5jdXJyZW50Q21kID0gY21kO1xuICAgIHN0YXRlLmVycm9yID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcblxuICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5ub3RVbml4KSB7XG4gICAgICAgIHJldFZhbHVlID0gZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoYXJncy5sZW5ndGggPT09IDAgfHwgdHlwZW9mIGFyZ3NbMF0gIT09ICdzdHJpbmcnIHx8IGFyZ3NbMF1bMF0gIT09ICctJylcbiAgICAgICAgICBhcmdzLnVuc2hpZnQoJycpOyAvLyBvbmx5IGFkZCBkdW1teSBvcHRpb24gaWYgJy1vcHRpb24nIG5vdCBhbHJlYWR5IHByZXNlbnRcbiAgICAgICAgcmV0VmFsdWUgPSBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoIXN0YXRlLmVycm9yKSB7XG4gICAgICAgIC8vIElmIHN0YXRlLmVycm9yIGhhc24ndCBiZWVuIHNldCBpdCdzIGFuIGVycm9yIHRocm93biBieSBOb2RlLCBub3QgdXMgLSBwcm9iYWJseSBhIGJ1Zy4uLlxuICAgICAgICBjb25zb2xlLmxvZygnc2hlbGwuanM6IGludGVybmFsIGVycm9yJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2sgfHwgZSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb25maWcuZmF0YWwpXG4gICAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgc3RhdGUuY3VycmVudENtZCA9ICdzaGVsbC5qcyc7XG4gICAgcmV0dXJuIHJldFZhbHVlO1xuICB9O1xufSAvLyB3cmFwXG5leHBvcnRzLndyYXAgPSB3cmFwO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGF0aFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJvc1wiKTsiLCJ2YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG52YXIgY29tbW9uID0gcmVxdWlyZSgnLi9jb21tb24nKTtcbnZhciBfY2QgPSByZXF1aXJlKCcuL2NkJyk7XG52YXIgX3B3ZCA9IHJlcXVpcmUoJy4vcHdkJyk7XG5cbi8vQFxuLy9AICMjIyBscyhbb3B0aW9ucyAsXSBwYXRoIFsscGF0aCAuLi5dKVxuLy9AICMjIyBscyhbb3B0aW9ucyAsXSBwYXRoX2FycmF5KVxuLy9AIEF2YWlsYWJsZSBvcHRpb25zOlxuLy9AXG4vL0AgKyBgLVJgOiByZWN1cnNpdmVcbi8vQCArIGAtQWA6IGFsbCBmaWxlcyAoaW5jbHVkZSBmaWxlcyBiZWdpbm5pbmcgd2l0aCBgLmAsIGV4Y2VwdCBmb3IgYC5gIGFuZCBgLi5gKVxuLy9AXG4vL0AgRXhhbXBsZXM6XG4vL0Bcbi8vQCBgYGBqYXZhc2NyaXB0XG4vL0AgbHMoJ3Byb2pzLyouanMnKTtcbi8vQCBscygnLVInLCAnL3VzZXJzL21lJywgJy90bXAnKTtcbi8vQCBscygnLVInLCBbJy91c2Vycy9tZScsICcvdG1wJ10pOyAvLyBzYW1lIGFzIGFib3ZlXG4vL0AgYGBgXG4vL0Bcbi8vQCBSZXR1cm5zIGFycmF5IG9mIGZpbGVzIGluIHRoZSBnaXZlbiBwYXRoLCBvciBpbiBjdXJyZW50IGRpcmVjdG9yeSBpZiBubyBwYXRoIHByb3ZpZGVkLlxuZnVuY3Rpb24gX2xzKG9wdGlvbnMsIHBhdGhzKSB7XG4gIG9wdGlvbnMgPSBjb21tb24ucGFyc2VPcHRpb25zKG9wdGlvbnMsIHtcbiAgICAnUic6ICdyZWN1cnNpdmUnLFxuICAgICdBJzogJ2FsbCcsXG4gICAgJ2EnOiAnYWxsX2RlcHJlY2F0ZWQnXG4gIH0pO1xuXG4gIGlmIChvcHRpb25zLmFsbF9kZXByZWNhdGVkKSB7XG4gICAgLy8gV2Ugd29uJ3Qgc3VwcG9ydCB0aGUgLWEgb3B0aW9uIGFzIGl0J3MgaGFyZCB0byBpbWFnZSB3aHkgaXQncyB1c2VmdWxcbiAgICAvLyAoaXQgaW5jbHVkZXMgJy4nIGFuZCAnLi4nIGluIGFkZGl0aW9uIHRvICcuKicgZmlsZXMpXG4gICAgLy8gRm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHdlJ2xsIGR1bXAgYSBkZXByZWNhdGVkIG1lc3NhZ2UgYW5kIHByb2NlZWQgYXMgYmVmb3JlXG4gICAgY29tbW9uLmxvZygnbHM6IE9wdGlvbiAtYSBpcyBkZXByZWNhdGVkLiBVc2UgLUEgaW5zdGVhZCcpO1xuICAgIG9wdGlvbnMuYWxsID0gdHJ1ZTtcbiAgfVxuXG4gIGlmICghcGF0aHMpXG4gICAgcGF0aHMgPSBbJy4nXTtcbiAgZWxzZSBpZiAodHlwZW9mIHBhdGhzID09PSAnb2JqZWN0JylcbiAgICBwYXRocyA9IHBhdGhzOyAvLyBhc3N1bWUgYXJyYXlcbiAgZWxzZSBpZiAodHlwZW9mIHBhdGhzID09PSAnc3RyaW5nJylcbiAgICBwYXRocyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICB2YXIgbGlzdCA9IFtdO1xuXG4gIC8vIENvbmRpdGlvbmFsbHkgcHVzaGVzIGZpbGUgdG8gbGlzdCAtIHJldHVybnMgdHJ1ZSBpZiBwdXNoZWQsIGZhbHNlIG90aGVyd2lzZVxuICAvLyAoZS5nLiBwcmV2ZW50cyBoaWRkZW4gZmlsZXMgdG8gYmUgaW5jbHVkZWQgdW5sZXNzIGV4cGxpY2l0bHkgdG9sZCBzbylcbiAgZnVuY3Rpb24gcHVzaEZpbGUoZmlsZSwgcXVlcnkpIHtcbiAgICAvLyBoaWRkZW4gZmlsZT9cbiAgICBpZiAocGF0aC5iYXNlbmFtZShmaWxlKVswXSA9PT0gJy4nKSB7XG4gICAgICAvLyBub3QgZXhwbGljaXRseSBhc2tpbmcgZm9yIGhpZGRlbiBmaWxlcz9cbiAgICAgIGlmICghb3B0aW9ucy5hbGwgJiYgIShwYXRoLmJhc2VuYW1lKHF1ZXJ5KVswXSA9PT0gJy4nICYmIHBhdGguYmFzZW5hbWUocXVlcnkpLmxlbmd0aCA+IDEpKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGNvbW1vbi5wbGF0Zm9ybSA9PT0gJ3dpbicpXG4gICAgICBmaWxlID0gZmlsZS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cbiAgICBsaXN0LnB1c2goZmlsZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwYXRocy5mb3JFYWNoKGZ1bmN0aW9uKHApIHtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhwKSkge1xuICAgICAgdmFyIHN0YXRzID0gZnMuc3RhdFN5bmMocCk7XG4gICAgICAvLyBTaW1wbGUgZmlsZT9cbiAgICAgIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICBwdXNoRmlsZShwLCBwKTtcbiAgICAgICAgcmV0dXJuOyAvLyBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyBTaW1wbGUgZGlyP1xuICAgICAgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgLy8gSXRlcmF0ZSBvdmVyIHAgY29udGVudHNcbiAgICAgICAgZnMucmVhZGRpclN5bmMocCkuZm9yRWFjaChmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgICAgaWYgKCFwdXNoRmlsZShmaWxlLCBwKSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgIC8vIFJlY3Vyc2l2ZT9cbiAgICAgICAgICBpZiAob3B0aW9ucy5yZWN1cnNpdmUpIHtcbiAgICAgICAgICAgIHZhciBvbGREaXIgPSBfcHdkKCk7XG4gICAgICAgICAgICBfY2QoJycsIHApO1xuICAgICAgICAgICAgaWYgKGZzLnN0YXRTeW5jKGZpbGUpLmlzRGlyZWN0b3J5KCkpXG4gICAgICAgICAgICAgIGxpc3QgPSBsaXN0LmNvbmNhdChfbHMoJy1SJysob3B0aW9ucy5hbGw/J0EnOicnKSwgZmlsZSsnLyonKSk7XG4gICAgICAgICAgICBfY2QoJycsIG9sZERpcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuOyAvLyBjb250aW51ZVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHAgZG9lcyBub3QgZXhpc3QgLSBwb3NzaWJsZSB3aWxkY2FyZCBwcmVzZW50XG5cbiAgICB2YXIgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKHApO1xuICAgIHZhciBkaXJuYW1lID0gcGF0aC5kaXJuYW1lKHApO1xuICAgIC8vIFdpbGRjYXJkIHByZXNlbnQgb24gYW4gZXhpc3RpbmcgZGlyPyAoZS5nLiAnL3RtcC8qLmpzJylcbiAgICBpZiAoYmFzZW5hbWUuc2VhcmNoKC9cXCovKSA+IC0xICYmIGZzLmV4aXN0c1N5bmMoZGlybmFtZSkgJiYgZnMuc3RhdFN5bmMoZGlybmFtZSkuaXNEaXJlY3RvcnkpIHtcbiAgICAgIC8vIEVzY2FwZSBzcGVjaWFsIHJlZ3VsYXIgZXhwcmVzc2lvbiBjaGFyc1xuICAgICAgdmFyIHJlZ2V4cCA9IGJhc2VuYW1lLnJlcGxhY2UoLyhcXF58XFwkfFxcKHxcXCl8PHw+fFxcW3xcXF18XFx7fFxcfXxcXC58XFwrfFxcPykvZywgJ1xcXFwkMScpO1xuICAgICAgLy8gVHJhbnNsYXRlcyB3aWxkY2FyZCBpbnRvIHJlZ2V4XG4gICAgICByZWdleHAgPSAnXicgKyByZWdleHAucmVwbGFjZSgvXFwqL2csICcuKicpICsgJyQnO1xuICAgICAgLy8gSXRlcmF0ZSBvdmVyIGRpcmVjdG9yeSBjb250ZW50c1xuICAgICAgZnMucmVhZGRpclN5bmMoZGlybmFtZSkuZm9yRWFjaChmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgIGlmIChmaWxlLm1hdGNoKG5ldyBSZWdFeHAocmVnZXhwKSkpIHtcbiAgICAgICAgICBpZiAoIXB1c2hGaWxlKHBhdGgubm9ybWFsaXplKGRpcm5hbWUrJy8nK2ZpbGUpLCBiYXNlbmFtZSkpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAvLyBSZWN1cnNpdmU/XG4gICAgICAgICAgaWYgKG9wdGlvbnMucmVjdXJzaXZlKSB7XG4gICAgICAgICAgICB2YXIgcHAgPSBkaXJuYW1lICsgJy8nICsgZmlsZTtcbiAgICAgICAgICAgIGlmIChmcy5sc3RhdFN5bmMocHApLmlzRGlyZWN0b3J5KCkpXG4gICAgICAgICAgICAgIGxpc3QgPSBsaXN0LmNvbmNhdChfbHMoJy1SJysob3B0aW9ucy5hbGw/J0EnOicnKSwgcHArJy8qJykpO1xuICAgICAgICAgIH0gLy8gcmVjdXJzaXZlXG4gICAgICAgIH0gLy8gaWYgZmlsZSBtYXRjaGVzXG4gICAgICB9KTsgLy8gZm9yRWFjaFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbW1vbi5lcnJvcignbm8gc3VjaCBmaWxlIG9yIGRpcmVjdG9yeTogJyArIHAsIHRydWUpO1xuICB9KTtcblxuICByZXR1cm4gbGlzdDtcbn1cbm1vZHVsZS5leHBvcnRzID0gX2xzO1xuIiwidmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcbnZhciBjb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbicpO1xuXG4vL0Bcbi8vQCAjIyMgY2QoJ2RpcicpXG4vL0AgQ2hhbmdlcyB0byBkaXJlY3RvcnkgYGRpcmAgZm9yIHRoZSBkdXJhdGlvbiBvZiB0aGUgc2NyaXB0XG5mdW5jdGlvbiBfY2Qob3B0aW9ucywgZGlyKSB7XG4gIGlmICghZGlyKVxuICAgIGNvbW1vbi5lcnJvcignZGlyZWN0b3J5IG5vdCBzcGVjaWZpZWQnKTtcblxuICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyKSlcbiAgICBjb21tb24uZXJyb3IoJ25vIHN1Y2ggZmlsZSBvciBkaXJlY3Rvcnk6ICcgKyBkaXIpO1xuXG4gIGlmICghZnMuc3RhdFN5bmMoZGlyKS5pc0RpcmVjdG9yeSgpKVxuICAgIGNvbW1vbi5lcnJvcignbm90IGEgZGlyZWN0b3J5OiAnICsgZGlyKTtcblxuICBwcm9jZXNzLmNoZGlyKGRpcik7XG59XG5tb2R1bGUuZXhwb3J0cyA9IF9jZDtcbiIsInZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJyk7XG5cbi8vQFxuLy9AICMjIyBwd2QoKVxuLy9AIFJldHVybnMgdGhlIGN1cnJlbnQgZGlyZWN0b3J5LlxuZnVuY3Rpb24gX3B3ZChvcHRpb25zKSB7XG4gIHZhciBwd2QgPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSk7XG4gIHJldHVybiBjb21tb24uU2hlbGxTdHJpbmcocHdkKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gX3B3ZDtcbiIsInZhciBjb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbicpO1xudmFyIF9jZCA9IHJlcXVpcmUoJy4vY2QnKTtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vLyBQdXNoZC9wb3BkL2RpcnMgaW50ZXJuYWxzXG52YXIgX2RpclN0YWNrID0gW107XG5cbmZ1bmN0aW9uIF9pc1N0YWNrSW5kZXgoaW5kZXgpIHtcbiAgcmV0dXJuICgvXltcXC0rXVxcZCskLykudGVzdChpbmRleCk7XG59XG5cbmZ1bmN0aW9uIF9wYXJzZVN0YWNrSW5kZXgoaW5kZXgpIHtcbiAgaWYgKF9pc1N0YWNrSW5kZXgoaW5kZXgpKSB7XG4gICAgaWYgKE1hdGguYWJzKGluZGV4KSA8IF9kaXJTdGFjay5sZW5ndGggKyAxKSB7IC8vICsxIGZvciBwd2RcbiAgICAgIHJldHVybiAoL14tLykudGVzdChpbmRleCkgPyBOdW1iZXIoaW5kZXgpIC0gMSA6IE51bWJlcihpbmRleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbW1vbi5lcnJvcihpbmRleCArICc6IGRpcmVjdG9yeSBzdGFjayBpbmRleCBvdXQgb2YgcmFuZ2UnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29tbW9uLmVycm9yKGluZGV4ICsgJzogaW52YWxpZCBudW1iZXInKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfYWN0dWFsRGlyU3RhY2soKSB7XG4gIHJldHVybiBbcHJvY2Vzcy5jd2QoKV0uY29uY2F0KF9kaXJTdGFjayk7XG59XG5cbi8vQFxuLy9AICMjIyBwdXNoZChbb3B0aW9ucyxdIFtkaXIgfCAnLU4nIHwgJytOJ10pXG4vL0Bcbi8vQCBBdmFpbGFibGUgb3B0aW9uczpcbi8vQFxuLy9AICsgYC1uYDogU3VwcHJlc3NlcyB0aGUgbm9ybWFsIGNoYW5nZSBvZiBkaXJlY3Rvcnkgd2hlbiBhZGRpbmcgZGlyZWN0b3JpZXMgdG8gdGhlIHN0YWNrLCBzbyB0aGF0IG9ubHkgdGhlIHN0YWNrIGlzIG1hbmlwdWxhdGVkLlxuLy9AXG4vL0AgQXJndW1lbnRzOlxuLy9AXG4vL0AgKyBgZGlyYDogTWFrZXMgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgYmUgdGhlIHRvcCBvZiB0aGUgc3RhY2ssIGFuZCB0aGVuIGV4ZWN1dGVzIHRoZSBlcXVpdmFsZW50IG9mIGBjZCBkaXJgLlxuLy9AICsgYCtOYDogQnJpbmdzIHRoZSBOdGggZGlyZWN0b3J5IChjb3VudGluZyBmcm9tIHRoZSBsZWZ0IG9mIHRoZSBsaXN0IHByaW50ZWQgYnkgZGlycywgc3RhcnRpbmcgd2l0aCB6ZXJvKSB0byB0aGUgdG9wIG9mIHRoZSBsaXN0IGJ5IHJvdGF0aW5nIHRoZSBzdGFjay5cbi8vQCArIGAtTmA6IEJyaW5ncyB0aGUgTnRoIGRpcmVjdG9yeSAoY291bnRpbmcgZnJvbSB0aGUgcmlnaHQgb2YgdGhlIGxpc3QgcHJpbnRlZCBieSBkaXJzLCBzdGFydGluZyB3aXRoIHplcm8pIHRvIHRoZSB0b3Agb2YgdGhlIGxpc3QgYnkgcm90YXRpbmcgdGhlIHN0YWNrLlxuLy9AXG4vL0AgRXhhbXBsZXM6XG4vL0Bcbi8vQCBgYGBqYXZhc2NyaXB0XG4vL0AgLy8gcHJvY2Vzcy5jd2QoKSA9PT0gJy91c3InXG4vL0AgcHVzaGQoJy9ldGMnKTsgLy8gUmV0dXJucyAvZXRjIC91c3Jcbi8vQCBwdXNoZCgnKzEnKTsgICAvLyBSZXR1cm5zIC91c3IgL2V0Y1xuLy9AIGBgYFxuLy9AXG4vL0AgU2F2ZSB0aGUgY3VycmVudCBkaXJlY3Rvcnkgb24gdGhlIHRvcCBvZiB0aGUgZGlyZWN0b3J5IHN0YWNrIGFuZCB0aGVuIGNkIHRvIGBkaXJgLiBXaXRoIG5vIGFyZ3VtZW50cywgcHVzaGQgZXhjaGFuZ2VzIHRoZSB0b3AgdHdvIGRpcmVjdG9yaWVzLiBSZXR1cm5zIGFuIGFycmF5IG9mIHBhdGhzIGluIHRoZSBzdGFjay5cbmZ1bmN0aW9uIF9wdXNoZChvcHRpb25zLCBkaXIpIHtcbiAgaWYgKF9pc1N0YWNrSW5kZXgob3B0aW9ucykpIHtcbiAgICBkaXIgPSBvcHRpb25zO1xuICAgIG9wdGlvbnMgPSAnJztcbiAgfVxuXG4gIG9wdGlvbnMgPSBjb21tb24ucGFyc2VPcHRpb25zKG9wdGlvbnMsIHtcbiAgICAnbicgOiAnbm8tY2QnXG4gIH0pO1xuXG4gIHZhciBkaXJzID0gX2FjdHVhbERpclN0YWNrKCk7XG5cbiAgaWYgKGRpciA9PT0gJyswJykge1xuICAgIHJldHVybiBkaXJzOyAvLyArMCBpcyBhIG5vb3BcbiAgfSBlbHNlIGlmICghZGlyKSB7XG4gICAgaWYgKGRpcnMubGVuZ3RoID4gMSkge1xuICAgICAgZGlycyA9IGRpcnMuc3BsaWNlKDEsIDEpLmNvbmNhdChkaXJzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbW1vbi5lcnJvcignbm8gb3RoZXIgZGlyZWN0b3J5Jyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKF9pc1N0YWNrSW5kZXgoZGlyKSkge1xuICAgIHZhciBuID0gX3BhcnNlU3RhY2tJbmRleChkaXIpO1xuICAgIGRpcnMgPSBkaXJzLnNsaWNlKG4pLmNvbmNhdChkaXJzLnNsaWNlKDAsIG4pKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAob3B0aW9uc1snbm8tY2QnXSkge1xuICAgICAgZGlycy5zcGxpY2UoMSwgMCwgZGlyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlycy51bnNoaWZ0KGRpcik7XG4gICAgfVxuICB9XG5cbiAgaWYgKG9wdGlvbnNbJ25vLWNkJ10pIHtcbiAgICBkaXJzID0gZGlycy5zbGljZSgxKTtcbiAgfSBlbHNlIHtcbiAgICBkaXIgPSBwYXRoLnJlc29sdmUoZGlycy5zaGlmdCgpKTtcbiAgICBfY2QoJycsIGRpcik7XG4gIH1cblxuICBfZGlyU3RhY2sgPSBkaXJzO1xuICByZXR1cm4gX2RpcnMoJycpO1xufVxuZXhwb3J0cy5wdXNoZCA9IF9wdXNoZDtcblxuLy9AXG4vL0AgIyMjIHBvcGQoW29wdGlvbnMsXSBbJy1OJyB8ICcrTiddKVxuLy9AXG4vL0AgQXZhaWxhYmxlIG9wdGlvbnM6XG4vL0Bcbi8vQCArIGAtbmA6IFN1cHByZXNzZXMgdGhlIG5vcm1hbCBjaGFuZ2Ugb2YgZGlyZWN0b3J5IHdoZW4gcmVtb3ZpbmcgZGlyZWN0b3JpZXMgZnJvbSB0aGUgc3RhY2ssIHNvIHRoYXQgb25seSB0aGUgc3RhY2sgaXMgbWFuaXB1bGF0ZWQuXG4vL0Bcbi8vQCBBcmd1bWVudHM6XG4vL0Bcbi8vQCArIGArTmA6IFJlbW92ZXMgdGhlIE50aCBkaXJlY3RvcnkgKGNvdW50aW5nIGZyb20gdGhlIGxlZnQgb2YgdGhlIGxpc3QgcHJpbnRlZCBieSBkaXJzKSwgc3RhcnRpbmcgd2l0aCB6ZXJvLlxuLy9AICsgYC1OYDogUmVtb3ZlcyB0aGUgTnRoIGRpcmVjdG9yeSAoY291bnRpbmcgZnJvbSB0aGUgcmlnaHQgb2YgdGhlIGxpc3QgcHJpbnRlZCBieSBkaXJzKSwgc3RhcnRpbmcgd2l0aCB6ZXJvLlxuLy9AXG4vL0AgRXhhbXBsZXM6XG4vL0Bcbi8vQCBgYGBqYXZhc2NyaXB0XG4vL0AgZWNobyhwcm9jZXNzLmN3ZCgpKTsgLy8gJy91c3InXG4vL0AgcHVzaGQoJy9ldGMnKTsgICAgICAgLy8gJy9ldGMgL3Vzcidcbi8vQCBlY2hvKHByb2Nlc3MuY3dkKCkpOyAvLyAnL2V0Yydcbi8vQCBwb3BkKCk7ICAgICAgICAgICAgICAvLyAnL3Vzcidcbi8vQCBlY2hvKHByb2Nlc3MuY3dkKCkpOyAvLyAnL3Vzcidcbi8vQCBgYGBcbi8vQFxuLy9AIFdoZW4gbm8gYXJndW1lbnRzIGFyZSBnaXZlbiwgcG9wZCByZW1vdmVzIHRoZSB0b3AgZGlyZWN0b3J5IGZyb20gdGhlIHN0YWNrIGFuZCBwZXJmb3JtcyBhIGNkIHRvIHRoZSBuZXcgdG9wIGRpcmVjdG9yeS4gVGhlIGVsZW1lbnRzIGFyZSBudW1iZXJlZCBmcm9tIDAgc3RhcnRpbmcgYXQgdGhlIGZpcnN0IGRpcmVjdG9yeSBsaXN0ZWQgd2l0aCBkaXJzOyBpLmUuLCBwb3BkIGlzIGVxdWl2YWxlbnQgdG8gcG9wZCArMC4gUmV0dXJucyBhbiBhcnJheSBvZiBwYXRocyBpbiB0aGUgc3RhY2suXG5mdW5jdGlvbiBfcG9wZChvcHRpb25zLCBpbmRleCkge1xuICBpZiAoX2lzU3RhY2tJbmRleChvcHRpb25zKSkge1xuICAgIGluZGV4ID0gb3B0aW9ucztcbiAgICBvcHRpb25zID0gJyc7XG4gIH1cblxuICBvcHRpb25zID0gY29tbW9uLnBhcnNlT3B0aW9ucyhvcHRpb25zLCB7XG4gICAgJ24nIDogJ25vLWNkJ1xuICB9KTtcblxuICBpZiAoIV9kaXJTdGFjay5sZW5ndGgpIHtcbiAgICByZXR1cm4gY29tbW9uLmVycm9yKCdkaXJlY3Rvcnkgc3RhY2sgZW1wdHknKTtcbiAgfVxuXG4gIGluZGV4ID0gX3BhcnNlU3RhY2tJbmRleChpbmRleCB8fCAnKzAnKTtcblxuICBpZiAob3B0aW9uc1snbm8tY2QnXSB8fCBpbmRleCA+IDAgfHwgX2RpclN0YWNrLmxlbmd0aCArIGluZGV4ID09PSAwKSB7XG4gICAgaW5kZXggPSBpbmRleCA+IDAgPyBpbmRleCAtIDEgOiBpbmRleDtcbiAgICBfZGlyU3RhY2suc3BsaWNlKGluZGV4LCAxKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZGlyID0gcGF0aC5yZXNvbHZlKF9kaXJTdGFjay5zaGlmdCgpKTtcbiAgICBfY2QoJycsIGRpcik7XG4gIH1cblxuICByZXR1cm4gX2RpcnMoJycpO1xufVxuZXhwb3J0cy5wb3BkID0gX3BvcGQ7XG5cbi8vQFxuLy9AICMjIyBkaXJzKFtvcHRpb25zIHwgJytOJyB8ICctTiddKVxuLy9AXG4vL0AgQXZhaWxhYmxlIG9wdGlvbnM6XG4vL0Bcbi8vQCArIGAtY2A6IENsZWFycyB0aGUgZGlyZWN0b3J5IHN0YWNrIGJ5IGRlbGV0aW5nIGFsbCBvZiB0aGUgZWxlbWVudHMuXG4vL0Bcbi8vQCBBcmd1bWVudHM6XG4vL0Bcbi8vQCArIGArTmA6IERpc3BsYXlzIHRoZSBOdGggZGlyZWN0b3J5IChjb3VudGluZyBmcm9tIHRoZSBsZWZ0IG9mIHRoZSBsaXN0IHByaW50ZWQgYnkgZGlycyB3aGVuIGludm9rZWQgd2l0aG91dCBvcHRpb25zKSwgc3RhcnRpbmcgd2l0aCB6ZXJvLlxuLy9AICsgYC1OYDogRGlzcGxheXMgdGhlIE50aCBkaXJlY3RvcnkgKGNvdW50aW5nIGZyb20gdGhlIHJpZ2h0IG9mIHRoZSBsaXN0IHByaW50ZWQgYnkgZGlycyB3aGVuIGludm9rZWQgd2l0aG91dCBvcHRpb25zKSwgc3RhcnRpbmcgd2l0aCB6ZXJvLlxuLy9AXG4vL0AgRGlzcGxheSB0aGUgbGlzdCBvZiBjdXJyZW50bHkgcmVtZW1iZXJlZCBkaXJlY3Rvcmllcy4gUmV0dXJucyBhbiBhcnJheSBvZiBwYXRocyBpbiB0aGUgc3RhY2ssIG9yIGEgc2luZ2xlIHBhdGggaWYgK04gb3IgLU4gd2FzIHNwZWNpZmllZC5cbi8vQFxuLy9AIFNlZSBhbHNvOiBwdXNoZCwgcG9wZFxuZnVuY3Rpb24gX2RpcnMob3B0aW9ucywgaW5kZXgpIHtcbiAgaWYgKF9pc1N0YWNrSW5kZXgob3B0aW9ucykpIHtcbiAgICBpbmRleCA9IG9wdGlvbnM7XG4gICAgb3B0aW9ucyA9ICcnO1xuICB9XG5cbiAgb3B0aW9ucyA9IGNvbW1vbi5wYXJzZU9wdGlvbnMob3B0aW9ucywge1xuICAgICdjJyA6ICdjbGVhcidcbiAgfSk7XG5cbiAgaWYgKG9wdGlvbnNbJ2NsZWFyJ10pIHtcbiAgICBfZGlyU3RhY2sgPSBbXTtcbiAgICByZXR1cm4gX2RpclN0YWNrO1xuICB9XG5cbiAgdmFyIHN0YWNrID0gX2FjdHVhbERpclN0YWNrKCk7XG5cbiAgaWYgKGluZGV4KSB7XG4gICAgaW5kZXggPSBfcGFyc2VTdGFja0luZGV4KGluZGV4KTtcblxuICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgIGluZGV4ID0gc3RhY2subGVuZ3RoICsgaW5kZXg7XG4gICAgfVxuXG4gICAgY29tbW9uLmxvZyhzdGFja1tpbmRleF0pO1xuICAgIHJldHVybiBzdGFja1tpbmRleF07XG4gIH1cblxuICBjb21tb24ubG9nKHN0YWNrLmpvaW4oJyAnKSk7XG5cbiAgcmV0dXJuIHN0YWNrO1xufVxuZXhwb3J0cy5kaXJzID0gX2RpcnM7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNyeXB0b1wiKTsiLCJ2YXIgY29tbW9uID0gcmVxdWlyZSgnLi9jb21tb24nKTtcbnZhciBvcyA9IHJlcXVpcmUoJ29zJyk7XG52YXIgZnMgPSByZXF1aXJlKCdmcycpO1xuXG4vLyBSZXR1cm5zIGZhbHNlIGlmICdkaXInIGlzIG5vdCBhIHdyaXRlYWJsZSBkaXJlY3RvcnksICdkaXInIG90aGVyd2lzZVxuZnVuY3Rpb24gd3JpdGVhYmxlRGlyKGRpcikge1xuICBpZiAoIWRpciB8fCAhZnMuZXhpc3RzU3luYyhkaXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoIWZzLnN0YXRTeW5jKGRpcikuaXNEaXJlY3RvcnkoKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIHRlc3RGaWxlID0gZGlyKycvJytjb21tb24ucmFuZG9tRmlsZU5hbWUoKTtcbiAgdHJ5IHtcbiAgICBmcy53cml0ZUZpbGVTeW5jKHRlc3RGaWxlLCAnICcpO1xuICAgIGNvbW1vbi51bmxpbmtTeW5jKHRlc3RGaWxlKTtcbiAgICByZXR1cm4gZGlyO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cblxuLy9AXG4vL0AgIyMjIHRlbXBkaXIoKVxuLy9AXG4vL0AgRXhhbXBsZXM6XG4vL0Bcbi8vQCBgYGBqYXZhc2NyaXB0XG4vL0AgdmFyIHRtcCA9IHRlbXBkaXIoKTsgLy8gXCIvdG1wXCIgZm9yIG1vc3QgKm5peCBwbGF0Zm9ybXNcbi8vQCBgYGBcbi8vQFxuLy9AIFNlYXJjaGVzIGFuZCByZXR1cm5zIHN0cmluZyBjb250YWluaW5nIGEgd3JpdGVhYmxlLCBwbGF0Zm9ybS1kZXBlbmRlbnQgdGVtcG9yYXJ5IGRpcmVjdG9yeS5cbi8vQCBGb2xsb3dzIFB5dGhvbidzIFt0ZW1wZmlsZSBhbGdvcml0aG1dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS90ZW1wZmlsZS5odG1sI3RlbXBmaWxlLnRlbXBkaXIpLlxuZnVuY3Rpb24gX3RlbXBEaXIoKSB7XG4gIHZhciBzdGF0ZSA9IGNvbW1vbi5zdGF0ZTtcbiAgaWYgKHN0YXRlLnRlbXBEaXIpXG4gICAgcmV0dXJuIHN0YXRlLnRlbXBEaXI7IC8vIGZyb20gY2FjaGVcblxuICBzdGF0ZS50ZW1wRGlyID0gd3JpdGVhYmxlRGlyKG9zLnRlbXBEaXIgJiYgb3MudGVtcERpcigpKSB8fCAvLyBub2RlIDAuOCtcbiAgICAgICAgICAgICAgICAgIHdyaXRlYWJsZURpcihwcm9jZXNzLmVudlsnVE1QRElSJ10pIHx8XG4gICAgICAgICAgICAgICAgICB3cml0ZWFibGVEaXIocHJvY2Vzcy5lbnZbJ1RFTVAnXSkgfHxcbiAgICAgICAgICAgICAgICAgIHdyaXRlYWJsZURpcihwcm9jZXNzLmVudlsnVE1QJ10pIHx8XG4gICAgICAgICAgICAgICAgICB3cml0ZWFibGVEaXIocHJvY2Vzcy5lbnZbJ1dpbXAkU2NyYXBEaXInXSkgfHwgLy8gUmlzY09TXG4gICAgICAgICAgICAgICAgICB3cml0ZWFibGVEaXIoJ0M6XFxcXFRFTVAnKSB8fCAvLyBXaW5kb3dzXG4gICAgICAgICAgICAgICAgICB3cml0ZWFibGVEaXIoJ0M6XFxcXFRNUCcpIHx8IC8vIFdpbmRvd3NcbiAgICAgICAgICAgICAgICAgIHdyaXRlYWJsZURpcignXFxcXFRFTVAnKSB8fCAvLyBXaW5kb3dzXG4gICAgICAgICAgICAgICAgICB3cml0ZWFibGVEaXIoJ1xcXFxUTVAnKSB8fCAvLyBXaW5kb3dzXG4gICAgICAgICAgICAgICAgICB3cml0ZWFibGVEaXIoJy90bXAnKSB8fFxuICAgICAgICAgICAgICAgICAgd3JpdGVhYmxlRGlyKCcvdmFyL3RtcCcpIHx8XG4gICAgICAgICAgICAgICAgICB3cml0ZWFibGVEaXIoJy91c3IvdG1wJykgfHxcbiAgICAgICAgICAgICAgICAgIHdyaXRlYWJsZURpcignLicpOyAvLyBsYXN0IHJlc29ydFxuXG4gIHJldHVybiBzdGF0ZS50ZW1wRGlyO1xufVxubW9kdWxlLmV4cG9ydHMgPSBfdGVtcERpcjtcbiIsIm1vZHVsZS5leHBvcnRzID0gbWluaW1hdGNoXG5taW5pbWF0Y2guTWluaW1hdGNoID0gTWluaW1hdGNoXG5cbnZhciBwYXRoID0geyBzZXA6ICcvJyB9XG50cnkge1xuICBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG59IGNhdGNoIChlcikge31cblxudmFyIEdMT0JTVEFSID0gbWluaW1hdGNoLkdMT0JTVEFSID0gTWluaW1hdGNoLkdMT0JTVEFSID0ge31cbnZhciBleHBhbmQgPSByZXF1aXJlKCdicmFjZS1leHBhbnNpb24nKVxuXG52YXIgcGxUeXBlcyA9IHtcbiAgJyEnOiB7IG9wZW46ICcoPzooPyEoPzonLCBjbG9zZTogJykpW14vXSo/KSd9LFxuICAnPyc6IHsgb3BlbjogJyg/OicsIGNsb3NlOiAnKT8nIH0sXG4gICcrJzogeyBvcGVuOiAnKD86JywgY2xvc2U6ICcpKycgfSxcbiAgJyonOiB7IG9wZW46ICcoPzonLCBjbG9zZTogJykqJyB9LFxuICAnQCc6IHsgb3BlbjogJyg/OicsIGNsb3NlOiAnKScgfVxufVxuXG4vLyBhbnkgc2luZ2xlIHRoaW5nIG90aGVyIHRoYW4gL1xuLy8gZG9uJ3QgbmVlZCB0byBlc2NhcGUgLyB3aGVuIHVzaW5nIG5ldyBSZWdFeHAoKVxudmFyIHFtYXJrID0gJ1teL10nXG5cbi8vICogPT4gYW55IG51bWJlciBvZiBjaGFyYWN0ZXJzXG52YXIgc3RhciA9IHFtYXJrICsgJyo/J1xuXG4vLyAqKiB3aGVuIGRvdHMgYXJlIGFsbG93ZWQuICBBbnl0aGluZyBnb2VzLCBleGNlcHQgLi4gYW5kIC5cbi8vIG5vdCAoXiBvciAvIGZvbGxvd2VkIGJ5IG9uZSBvciB0d28gZG90cyBmb2xsb3dlZCBieSAkIG9yIC8pLFxuLy8gZm9sbG93ZWQgYnkgYW55dGhpbmcsIGFueSBudW1iZXIgb2YgdGltZXMuXG52YXIgdHdvU3RhckRvdCA9ICcoPzooPyEoPzpcXFxcXFwvfF4pKD86XFxcXC57MSwyfSkoJHxcXFxcXFwvKSkuKSo/J1xuXG4vLyBub3QgYSBeIG9yIC8gZm9sbG93ZWQgYnkgYSBkb3QsXG4vLyBmb2xsb3dlZCBieSBhbnl0aGluZywgYW55IG51bWJlciBvZiB0aW1lcy5cbnZhciB0d29TdGFyTm9Eb3QgPSAnKD86KD8hKD86XFxcXFxcL3xeKVxcXFwuKS4pKj8nXG5cbi8vIGNoYXJhY3RlcnMgdGhhdCBuZWVkIHRvIGJlIGVzY2FwZWQgaW4gUmVnRXhwLlxudmFyIHJlU3BlY2lhbHMgPSBjaGFyU2V0KCcoKS4qe30rP1tdXiRcXFxcIScpXG5cbi8vIFwiYWJjXCIgLT4geyBhOnRydWUsIGI6dHJ1ZSwgYzp0cnVlIH1cbmZ1bmN0aW9uIGNoYXJTZXQgKHMpIHtcbiAgcmV0dXJuIHMuc3BsaXQoJycpLnJlZHVjZShmdW5jdGlvbiAoc2V0LCBjKSB7XG4gICAgc2V0W2NdID0gdHJ1ZVxuICAgIHJldHVybiBzZXRcbiAgfSwge30pXG59XG5cbi8vIG5vcm1hbGl6ZXMgc2xhc2hlcy5cbnZhciBzbGFzaFNwbGl0ID0gL1xcLysvXG5cbm1pbmltYXRjaC5maWx0ZXIgPSBmaWx0ZXJcbmZ1bmN0aW9uIGZpbHRlciAocGF0dGVybiwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICByZXR1cm4gZnVuY3Rpb24gKHAsIGksIGxpc3QpIHtcbiAgICByZXR1cm4gbWluaW1hdGNoKHAsIHBhdHRlcm4sIG9wdGlvbnMpXG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0IChhLCBiKSB7XG4gIGEgPSBhIHx8IHt9XG4gIGIgPSBiIHx8IHt9XG4gIHZhciB0ID0ge31cbiAgT2JqZWN0LmtleXMoYikuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgIHRba10gPSBiW2tdXG4gIH0pXG4gIE9iamVjdC5rZXlzKGEpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICB0W2tdID0gYVtrXVxuICB9KVxuICByZXR1cm4gdFxufVxuXG5taW5pbWF0Y2guZGVmYXVsdHMgPSBmdW5jdGlvbiAoZGVmKSB7XG4gIGlmICghZGVmIHx8ICFPYmplY3Qua2V5cyhkZWYpLmxlbmd0aCkgcmV0dXJuIG1pbmltYXRjaFxuXG4gIHZhciBvcmlnID0gbWluaW1hdGNoXG5cbiAgdmFyIG0gPSBmdW5jdGlvbiBtaW5pbWF0Y2ggKHAsIHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gb3JpZy5taW5pbWF0Y2gocCwgcGF0dGVybiwgZXh0KGRlZiwgb3B0aW9ucykpXG4gIH1cblxuICBtLk1pbmltYXRjaCA9IGZ1bmN0aW9uIE1pbmltYXRjaCAocGF0dGVybiwgb3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgb3JpZy5NaW5pbWF0Y2gocGF0dGVybiwgZXh0KGRlZiwgb3B0aW9ucykpXG4gIH1cblxuICByZXR1cm4gbVxufVxuXG5NaW5pbWF0Y2guZGVmYXVsdHMgPSBmdW5jdGlvbiAoZGVmKSB7XG4gIGlmICghZGVmIHx8ICFPYmplY3Qua2V5cyhkZWYpLmxlbmd0aCkgcmV0dXJuIE1pbmltYXRjaFxuICByZXR1cm4gbWluaW1hdGNoLmRlZmF1bHRzKGRlZikuTWluaW1hdGNoXG59XG5cbmZ1bmN0aW9uIG1pbmltYXRjaCAocCwgcGF0dGVybiwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIHBhdHRlcm4gIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZ2xvYiBwYXR0ZXJuIHN0cmluZyByZXF1aXJlZCcpXG4gIH1cblxuICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fVxuXG4gIC8vIHNob3J0Y3V0OiBjb21tZW50cyBtYXRjaCBub3RoaW5nLlxuICBpZiAoIW9wdGlvbnMubm9jb21tZW50ICYmIHBhdHRlcm4uY2hhckF0KDApID09PSAnIycpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIFwiXCIgb25seSBtYXRjaGVzIFwiXCJcbiAgaWYgKHBhdHRlcm4udHJpbSgpID09PSAnJykgcmV0dXJuIHAgPT09ICcnXG5cbiAgcmV0dXJuIG5ldyBNaW5pbWF0Y2gocGF0dGVybiwgb3B0aW9ucykubWF0Y2gocClcbn1cblxuZnVuY3Rpb24gTWluaW1hdGNoIChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBNaW5pbWF0Y2gpKSB7XG4gICAgcmV0dXJuIG5ldyBNaW5pbWF0Y2gocGF0dGVybiwgb3B0aW9ucylcbiAgfVxuXG4gIGlmICh0eXBlb2YgcGF0dGVybiAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdnbG9iIHBhdHRlcm4gc3RyaW5nIHJlcXVpcmVkJylcbiAgfVxuXG4gIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9XG4gIHBhdHRlcm4gPSBwYXR0ZXJuLnRyaW0oKVxuXG4gIC8vIHdpbmRvd3Mgc3VwcG9ydDogbmVlZCB0byB1c2UgLywgbm90IFxcXG4gIGlmIChwYXRoLnNlcCAhPT0gJy8nKSB7XG4gICAgcGF0dGVybiA9IHBhdHRlcm4uc3BsaXQocGF0aC5zZXApLmpvaW4oJy8nKVxuICB9XG5cbiAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICB0aGlzLnNldCA9IFtdXG4gIHRoaXMucGF0dGVybiA9IHBhdHRlcm5cbiAgdGhpcy5yZWdleHAgPSBudWxsXG4gIHRoaXMubmVnYXRlID0gZmFsc2VcbiAgdGhpcy5jb21tZW50ID0gZmFsc2VcbiAgdGhpcy5lbXB0eSA9IGZhbHNlXG5cbiAgLy8gbWFrZSB0aGUgc2V0IG9mIHJlZ2V4cHMgZXRjLlxuICB0aGlzLm1ha2UoKVxufVxuXG5NaW5pbWF0Y2gucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24gKCkge31cblxuTWluaW1hdGNoLnByb3RvdHlwZS5tYWtlID0gbWFrZVxuZnVuY3Rpb24gbWFrZSAoKSB7XG4gIC8vIGRvbid0IGRvIGl0IG1vcmUgdGhhbiBvbmNlLlxuICBpZiAodGhpcy5fbWFkZSkgcmV0dXJuXG5cbiAgdmFyIHBhdHRlcm4gPSB0aGlzLnBhdHRlcm5cbiAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcblxuICAvLyBlbXB0eSBwYXR0ZXJucyBhbmQgY29tbWVudHMgbWF0Y2ggbm90aGluZy5cbiAgaWYgKCFvcHRpb25zLm5vY29tbWVudCAmJiBwYXR0ZXJuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgdGhpcy5jb21tZW50ID0gdHJ1ZVxuICAgIHJldHVyblxuICB9XG4gIGlmICghcGF0dGVybikge1xuICAgIHRoaXMuZW1wdHkgPSB0cnVlXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBzdGVwIDE6IGZpZ3VyZSBvdXQgbmVnYXRpb24sIGV0Yy5cbiAgdGhpcy5wYXJzZU5lZ2F0ZSgpXG5cbiAgLy8gc3RlcCAyOiBleHBhbmQgYnJhY2VzXG4gIHZhciBzZXQgPSB0aGlzLmdsb2JTZXQgPSB0aGlzLmJyYWNlRXhwYW5kKClcblxuICBpZiAob3B0aW9ucy5kZWJ1ZykgdGhpcy5kZWJ1ZyA9IGNvbnNvbGUuZXJyb3JcblxuICB0aGlzLmRlYnVnKHRoaXMucGF0dGVybiwgc2V0KVxuXG4gIC8vIHN0ZXAgMzogbm93IHdlIGhhdmUgYSBzZXQsIHNvIHR1cm4gZWFjaCBvbmUgaW50byBhIHNlcmllcyBvZiBwYXRoLXBvcnRpb25cbiAgLy8gbWF0Y2hpbmcgcGF0dGVybnMuXG4gIC8vIFRoZXNlIHdpbGwgYmUgcmVnZXhwcywgZXhjZXB0IGluIHRoZSBjYXNlIG9mIFwiKipcIiwgd2hpY2ggaXNcbiAgLy8gc2V0IHRvIHRoZSBHTE9CU1RBUiBvYmplY3QgZm9yIGdsb2JzdGFyIGJlaGF2aW9yLFxuICAvLyBhbmQgd2lsbCBub3QgY29udGFpbiBhbnkgLyBjaGFyYWN0ZXJzXG4gIHNldCA9IHRoaXMuZ2xvYlBhcnRzID0gc2V0Lm1hcChmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBzLnNwbGl0KHNsYXNoU3BsaXQpXG4gIH0pXG5cbiAgdGhpcy5kZWJ1Zyh0aGlzLnBhdHRlcm4sIHNldClcblxuICAvLyBnbG9iIC0tPiByZWdleHBzXG4gIHNldCA9IHNldC5tYXAoZnVuY3Rpb24gKHMsIHNpLCBzZXQpIHtcbiAgICByZXR1cm4gcy5tYXAodGhpcy5wYXJzZSwgdGhpcylcbiAgfSwgdGhpcylcblxuICB0aGlzLmRlYnVnKHRoaXMucGF0dGVybiwgc2V0KVxuXG4gIC8vIGZpbHRlciBvdXQgZXZlcnl0aGluZyB0aGF0IGRpZG4ndCBjb21waWxlIHByb3Blcmx5LlxuICBzZXQgPSBzZXQuZmlsdGVyKGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHMuaW5kZXhPZihmYWxzZSkgPT09IC0xXG4gIH0pXG5cbiAgdGhpcy5kZWJ1Zyh0aGlzLnBhdHRlcm4sIHNldClcblxuICB0aGlzLnNldCA9IHNldFxufVxuXG5NaW5pbWF0Y2gucHJvdG90eXBlLnBhcnNlTmVnYXRlID0gcGFyc2VOZWdhdGVcbmZ1bmN0aW9uIHBhcnNlTmVnYXRlICgpIHtcbiAgdmFyIHBhdHRlcm4gPSB0aGlzLnBhdHRlcm5cbiAgdmFyIG5lZ2F0ZSA9IGZhbHNlXG4gIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zXG4gIHZhciBuZWdhdGVPZmZzZXQgPSAwXG5cbiAgaWYgKG9wdGlvbnMubm9uZWdhdGUpIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gcGF0dGVybi5sZW5ndGhcbiAgICA7IGkgPCBsICYmIHBhdHRlcm4uY2hhckF0KGkpID09PSAnISdcbiAgICA7IGkrKykge1xuICAgIG5lZ2F0ZSA9ICFuZWdhdGVcbiAgICBuZWdhdGVPZmZzZXQrK1xuICB9XG5cbiAgaWYgKG5lZ2F0ZU9mZnNldCkgdGhpcy5wYXR0ZXJuID0gcGF0dGVybi5zdWJzdHIobmVnYXRlT2Zmc2V0KVxuICB0aGlzLm5lZ2F0ZSA9IG5lZ2F0ZVxufVxuXG4vLyBCcmFjZSBleHBhbnNpb246XG4vLyBhe2IsY31kIC0+IGFiZCBhY2Rcbi8vIGF7Yix9YyAtPiBhYmMgYWNcbi8vIGF7MC4uM31kIC0+IGEwZCBhMWQgYTJkIGEzZFxuLy8gYXtiLGN7ZCxlfWZ9ZyAtPiBhYmcgYWNkZmcgYWNlZmdcbi8vIGF7YixjfWR7ZSxmfWcgLT4gYWJkZWcgYWNkZWcgYWJkZWcgYWJkZmdcbi8vXG4vLyBJbnZhbGlkIHNldHMgYXJlIG5vdCBleHBhbmRlZC5cbi8vIGF7Mi4ufWIgLT4gYXsyLi59YlxuLy8gYXtifWMgLT4gYXtifWNcbm1pbmltYXRjaC5icmFjZUV4cGFuZCA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gIHJldHVybiBicmFjZUV4cGFuZChwYXR0ZXJuLCBvcHRpb25zKVxufVxuXG5NaW5pbWF0Y2gucHJvdG90eXBlLmJyYWNlRXhwYW5kID0gYnJhY2VFeHBhbmRcblxuZnVuY3Rpb24gYnJhY2VFeHBhbmQgKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBNaW5pbWF0Y2gpIHtcbiAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuICB9XG5cbiAgcGF0dGVybiA9IHR5cGVvZiBwYXR0ZXJuID09PSAndW5kZWZpbmVkJ1xuICAgID8gdGhpcy5wYXR0ZXJuIDogcGF0dGVyblxuXG4gIGlmICh0eXBlb2YgcGF0dGVybiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bmRlZmluZWQgcGF0dGVybicpXG4gIH1cblxuICBpZiAob3B0aW9ucy5ub2JyYWNlIHx8XG4gICAgIXBhdHRlcm4ubWF0Y2goL1xcey4qXFx9LykpIHtcbiAgICAvLyBzaG9ydGN1dC4gbm8gbmVlZCB0byBleHBhbmQuXG4gICAgcmV0dXJuIFtwYXR0ZXJuXVxuICB9XG5cbiAgcmV0dXJuIGV4cGFuZChwYXR0ZXJuKVxufVxuXG4vLyBwYXJzZSBhIGNvbXBvbmVudCBvZiB0aGUgZXhwYW5kZWQgc2V0LlxuLy8gQXQgdGhpcyBwb2ludCwgbm8gcGF0dGVybiBtYXkgY29udGFpbiBcIi9cIiBpbiBpdFxuLy8gc28gd2UncmUgZ29pbmcgdG8gcmV0dXJuIGEgMmQgYXJyYXksIHdoZXJlIGVhY2ggZW50cnkgaXMgdGhlIGZ1bGxcbi8vIHBhdHRlcm4sIHNwbGl0IG9uICcvJywgYW5kIHRoZW4gdHVybmVkIGludG8gYSByZWd1bGFyIGV4cHJlc3Npb24uXG4vLyBBIHJlZ2V4cCBpcyBtYWRlIGF0IHRoZSBlbmQgd2hpY2ggam9pbnMgZWFjaCBhcnJheSB3aXRoIGFuXG4vLyBlc2NhcGVkIC8sIGFuZCBhbm90aGVyIGZ1bGwgb25lIHdoaWNoIGpvaW5zIGVhY2ggcmVnZXhwIHdpdGggfC5cbi8vXG4vLyBGb2xsb3dpbmcgdGhlIGxlYWQgb2YgQmFzaCA0LjEsIG5vdGUgdGhhdCBcIioqXCIgb25seSBoYXMgc3BlY2lhbCBtZWFuaW5nXG4vLyB3aGVuIGl0IGlzIHRoZSAqb25seSogdGhpbmcgaW4gYSBwYXRoIHBvcnRpb24uICBPdGhlcndpc2UsIGFueSBzZXJpZXNcbi8vIG9mICogaXMgZXF1aXZhbGVudCB0byBhIHNpbmdsZSAqLiAgR2xvYnN0YXIgYmVoYXZpb3IgaXMgZW5hYmxlZCBieVxuLy8gZGVmYXVsdCwgYW5kIGNhbiBiZSBkaXNhYmxlZCBieSBzZXR0aW5nIG9wdGlvbnMubm9nbG9ic3Rhci5cbk1pbmltYXRjaC5wcm90b3R5cGUucGFyc2UgPSBwYXJzZVxudmFyIFNVQlBBUlNFID0ge31cbmZ1bmN0aW9uIHBhcnNlIChwYXR0ZXJuLCBpc1N1Yikge1xuICBpZiAocGF0dGVybi5sZW5ndGggPiAxMDI0ICogNjQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdwYXR0ZXJuIGlzIHRvbyBsb25nJylcbiAgfVxuXG4gIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zXG5cbiAgLy8gc2hvcnRjdXRzXG4gIGlmICghb3B0aW9ucy5ub2dsb2JzdGFyICYmIHBhdHRlcm4gPT09ICcqKicpIHJldHVybiBHTE9CU1RBUlxuICBpZiAocGF0dGVybiA9PT0gJycpIHJldHVybiAnJ1xuXG4gIHZhciByZSA9ICcnXG4gIHZhciBoYXNNYWdpYyA9ICEhb3B0aW9ucy5ub2Nhc2VcbiAgdmFyIGVzY2FwaW5nID0gZmFsc2VcbiAgLy8gPyA9PiBvbmUgc2luZ2xlIGNoYXJhY3RlclxuICB2YXIgcGF0dGVybkxpc3RTdGFjayA9IFtdXG4gIHZhciBuZWdhdGl2ZUxpc3RzID0gW11cbiAgdmFyIHN0YXRlQ2hhclxuICB2YXIgaW5DbGFzcyA9IGZhbHNlXG4gIHZhciByZUNsYXNzU3RhcnQgPSAtMVxuICB2YXIgY2xhc3NTdGFydCA9IC0xXG4gIC8vIC4gYW5kIC4uIG5ldmVyIG1hdGNoIGFueXRoaW5nIHRoYXQgZG9lc24ndCBzdGFydCB3aXRoIC4sXG4gIC8vIGV2ZW4gd2hlbiBvcHRpb25zLmRvdCBpcyBzZXQuXG4gIHZhciBwYXR0ZXJuU3RhcnQgPSBwYXR0ZXJuLmNoYXJBdCgwKSA9PT0gJy4nID8gJycgLy8gYW55dGhpbmdcbiAgLy8gbm90IChzdGFydCBvciAvIGZvbGxvd2VkIGJ5IC4gb3IgLi4gZm9sbG93ZWQgYnkgLyBvciBlbmQpXG4gIDogb3B0aW9ucy5kb3QgPyAnKD8hKD86XnxcXFxcXFwvKVxcXFwuezEsMn0oPzokfFxcXFxcXC8pKSdcbiAgOiAnKD8hXFxcXC4pJ1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBmdW5jdGlvbiBjbGVhclN0YXRlQ2hhciAoKSB7XG4gICAgaWYgKHN0YXRlQ2hhcikge1xuICAgICAgLy8gd2UgaGFkIHNvbWUgc3RhdGUtdHJhY2tpbmcgY2hhcmFjdGVyXG4gICAgICAvLyB0aGF0IHdhc24ndCBjb25zdW1lZCBieSB0aGlzIHBhc3MuXG4gICAgICBzd2l0Y2ggKHN0YXRlQ2hhcikge1xuICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICByZSArPSBzdGFyXG4gICAgICAgICAgaGFzTWFnaWMgPSB0cnVlXG4gICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJz8nOlxuICAgICAgICAgIHJlICs9IHFtYXJrXG4gICAgICAgICAgaGFzTWFnaWMgPSB0cnVlXG4gICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmUgKz0gJ1xcXFwnICsgc3RhdGVDaGFyXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBzZWxmLmRlYnVnKCdjbGVhclN0YXRlQ2hhciAlaiAlaicsIHN0YXRlQ2hhciwgcmUpXG4gICAgICBzdGF0ZUNoYXIgPSBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYXR0ZXJuLmxlbmd0aCwgY1xuICAgIDsgKGkgPCBsZW4pICYmIChjID0gcGF0dGVybi5jaGFyQXQoaSkpXG4gICAgOyBpKyspIHtcbiAgICB0aGlzLmRlYnVnKCclc1xcdCVzICVzICVqJywgcGF0dGVybiwgaSwgcmUsIGMpXG5cbiAgICAvLyBza2lwIG92ZXIgYW55IHRoYXQgYXJlIGVzY2FwZWQuXG4gICAgaWYgKGVzY2FwaW5nICYmIHJlU3BlY2lhbHNbY10pIHtcbiAgICAgIHJlICs9ICdcXFxcJyArIGNcbiAgICAgIGVzY2FwaW5nID0gZmFsc2VcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgc3dpdGNoIChjKSB7XG4gICAgICBjYXNlICcvJzpcbiAgICAgICAgLy8gY29tcGxldGVseSBub3QgYWxsb3dlZCwgZXZlbiBlc2NhcGVkLlxuICAgICAgICAvLyBTaG91bGQgYWxyZWFkeSBiZSBwYXRoLXNwbGl0IGJ5IG5vdy5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIGNhc2UgJ1xcXFwnOlxuICAgICAgICBjbGVhclN0YXRlQ2hhcigpXG4gICAgICAgIGVzY2FwaW5nID0gdHJ1ZVxuICAgICAgY29udGludWVcblxuICAgICAgLy8gdGhlIHZhcmlvdXMgc3RhdGVDaGFyIHZhbHVlc1xuICAgICAgLy8gZm9yIHRoZSBcImV4dGdsb2JcIiBzdHVmZi5cbiAgICAgIGNhc2UgJz8nOlxuICAgICAgY2FzZSAnKic6XG4gICAgICBjYXNlICcrJzpcbiAgICAgIGNhc2UgJ0AnOlxuICAgICAgY2FzZSAnISc6XG4gICAgICAgIHRoaXMuZGVidWcoJyVzXFx0JXMgJXMgJWogPC0tIHN0YXRlQ2hhcicsIHBhdHRlcm4sIGksIHJlLCBjKVxuXG4gICAgICAgIC8vIGFsbCBvZiB0aG9zZSBhcmUgbGl0ZXJhbHMgaW5zaWRlIGEgY2xhc3MsIGV4Y2VwdCB0aGF0XG4gICAgICAgIC8vIHRoZSBnbG9iIFshYV0gbWVhbnMgW15hXSBpbiByZWdleHBcbiAgICAgICAgaWYgKGluQ2xhc3MpIHtcbiAgICAgICAgICB0aGlzLmRlYnVnKCcgIGluIGNsYXNzJylcbiAgICAgICAgICBpZiAoYyA9PT0gJyEnICYmIGkgPT09IGNsYXNzU3RhcnQgKyAxKSBjID0gJ14nXG4gICAgICAgICAgcmUgKz0gY1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB3ZSBhbHJlYWR5IGhhdmUgYSBzdGF0ZUNoYXIsIHRoZW4gaXQgbWVhbnNcbiAgICAgICAgLy8gdGhhdCB0aGVyZSB3YXMgc29tZXRoaW5nIGxpa2UgKiogb3IgKz8gaW4gdGhlcmUuXG4gICAgICAgIC8vIEhhbmRsZSB0aGUgc3RhdGVDaGFyLCB0aGVuIHByb2NlZWQgd2l0aCB0aGlzIG9uZS5cbiAgICAgICAgc2VsZi5kZWJ1ZygnY2FsbCBjbGVhclN0YXRlQ2hhciAlaicsIHN0YXRlQ2hhcilcbiAgICAgICAgY2xlYXJTdGF0ZUNoYXIoKVxuICAgICAgICBzdGF0ZUNoYXIgPSBjXG4gICAgICAgIC8vIGlmIGV4dGdsb2IgaXMgZGlzYWJsZWQsIHRoZW4gKyhhc2RmfGZvbykgaXNuJ3QgYSB0aGluZy5cbiAgICAgICAgLy8ganVzdCBjbGVhciB0aGUgc3RhdGVjaGFyICpub3cqLCByYXRoZXIgdGhhbiBldmVuIGRpdmluZyBpbnRvXG4gICAgICAgIC8vIHRoZSBwYXR0ZXJuTGlzdCBzdHVmZi5cbiAgICAgICAgaWYgKG9wdGlvbnMubm9leHQpIGNsZWFyU3RhdGVDaGFyKClcbiAgICAgIGNvbnRpbnVlXG5cbiAgICAgIGNhc2UgJygnOlxuICAgICAgICBpZiAoaW5DbGFzcykge1xuICAgICAgICAgIHJlICs9ICcoJ1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXN0YXRlQ2hhcikge1xuICAgICAgICAgIHJlICs9ICdcXFxcKCdcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgcGF0dGVybkxpc3RTdGFjay5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBzdGF0ZUNoYXIsXG4gICAgICAgICAgc3RhcnQ6IGkgLSAxLFxuICAgICAgICAgIHJlU3RhcnQ6IHJlLmxlbmd0aCxcbiAgICAgICAgICBvcGVuOiBwbFR5cGVzW3N0YXRlQ2hhcl0ub3BlbixcbiAgICAgICAgICBjbG9zZTogcGxUeXBlc1tzdGF0ZUNoYXJdLmNsb3NlXG4gICAgICAgIH0pXG4gICAgICAgIC8vIG5lZ2F0aW9uIGlzICg/Oig/IWpzKVteL10qKVxuICAgICAgICByZSArPSBzdGF0ZUNoYXIgPT09ICchJyA/ICcoPzooPyEoPzonIDogJyg/OidcbiAgICAgICAgdGhpcy5kZWJ1ZygncGxUeXBlICVqICVqJywgc3RhdGVDaGFyLCByZSlcbiAgICAgICAgc3RhdGVDaGFyID0gZmFsc2VcbiAgICAgIGNvbnRpbnVlXG5cbiAgICAgIGNhc2UgJyknOlxuICAgICAgICBpZiAoaW5DbGFzcyB8fCAhcGF0dGVybkxpc3RTdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICByZSArPSAnXFxcXCknXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFyU3RhdGVDaGFyKClcbiAgICAgICAgaGFzTWFnaWMgPSB0cnVlXG4gICAgICAgIHZhciBwbCA9IHBhdHRlcm5MaXN0U3RhY2sucG9wKClcbiAgICAgICAgLy8gbmVnYXRpb24gaXMgKD86KD8hanMpW14vXSopXG4gICAgICAgIC8vIFRoZSBvdGhlcnMgYXJlICg/OjxwYXR0ZXJuPik8dHlwZT5cbiAgICAgICAgcmUgKz0gcGwuY2xvc2VcbiAgICAgICAgaWYgKHBsLnR5cGUgPT09ICchJykge1xuICAgICAgICAgIG5lZ2F0aXZlTGlzdHMucHVzaChwbClcbiAgICAgICAgfVxuICAgICAgICBwbC5yZUVuZCA9IHJlLmxlbmd0aFxuICAgICAgY29udGludWVcblxuICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGlmIChpbkNsYXNzIHx8ICFwYXR0ZXJuTGlzdFN0YWNrLmxlbmd0aCB8fCBlc2NhcGluZykge1xuICAgICAgICAgIHJlICs9ICdcXFxcfCdcbiAgICAgICAgICBlc2NhcGluZyA9IGZhbHNlXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFyU3RhdGVDaGFyKClcbiAgICAgICAgcmUgKz0gJ3wnXG4gICAgICBjb250aW51ZVxuXG4gICAgICAvLyB0aGVzZSBhcmUgbW9zdGx5IHRoZSBzYW1lIGluIHJlZ2V4cCBhbmQgZ2xvYlxuICAgICAgY2FzZSAnWyc6XG4gICAgICAgIC8vIHN3YWxsb3cgYW55IHN0YXRlLXRyYWNraW5nIGNoYXIgYmVmb3JlIHRoZSBbXG4gICAgICAgIGNsZWFyU3RhdGVDaGFyKClcblxuICAgICAgICBpZiAoaW5DbGFzcykge1xuICAgICAgICAgIHJlICs9ICdcXFxcJyArIGNcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgaW5DbGFzcyA9IHRydWVcbiAgICAgICAgY2xhc3NTdGFydCA9IGlcbiAgICAgICAgcmVDbGFzc1N0YXJ0ID0gcmUubGVuZ3RoXG4gICAgICAgIHJlICs9IGNcbiAgICAgIGNvbnRpbnVlXG5cbiAgICAgIGNhc2UgJ10nOlxuICAgICAgICAvLyAgYSByaWdodCBicmFja2V0IHNoYWxsIGxvc2UgaXRzIHNwZWNpYWxcbiAgICAgICAgLy8gIG1lYW5pbmcgYW5kIHJlcHJlc2VudCBpdHNlbGYgaW5cbiAgICAgICAgLy8gIGEgYnJhY2tldCBleHByZXNzaW9uIGlmIGl0IG9jY3Vyc1xuICAgICAgICAvLyAgZmlyc3QgaW4gdGhlIGxpc3QuICAtLSBQT1NJWC4yIDIuOC4zLjJcbiAgICAgICAgaWYgKGkgPT09IGNsYXNzU3RhcnQgKyAxIHx8ICFpbkNsYXNzKSB7XG4gICAgICAgICAgcmUgKz0gJ1xcXFwnICsgY1xuICAgICAgICAgIGVzY2FwaW5nID0gZmFsc2VcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gaGFuZGxlIHRoZSBjYXNlIHdoZXJlIHdlIGxlZnQgYSBjbGFzcyBvcGVuLlxuICAgICAgICAvLyBcIlt6LWFdXCIgaXMgdmFsaWQsIGVxdWl2YWxlbnQgdG8gXCJcXFt6LWFcXF1cIlxuICAgICAgICBpZiAoaW5DbGFzcykge1xuICAgICAgICAgIC8vIHNwbGl0IHdoZXJlIHRoZSBsYXN0IFsgd2FzLCBtYWtlIHN1cmUgd2UgZG9uJ3QgaGF2ZVxuICAgICAgICAgIC8vIGFuIGludmFsaWQgcmUuIGlmIHNvLCByZS13YWxrIHRoZSBjb250ZW50cyBvZiB0aGVcbiAgICAgICAgICAvLyB3b3VsZC1iZSBjbGFzcyB0byByZS10cmFuc2xhdGUgYW55IGNoYXJhY3RlcnMgdGhhdFxuICAgICAgICAgIC8vIHdlcmUgcGFzc2VkIHRocm91Z2ggYXMtaXNcbiAgICAgICAgICAvLyBUT0RPOiBJdCB3b3VsZCBwcm9iYWJseSBiZSBmYXN0ZXIgdG8gZGV0ZXJtaW5lIHRoaXNcbiAgICAgICAgICAvLyB3aXRob3V0IGEgdHJ5L2NhdGNoIGFuZCBhIG5ldyBSZWdFeHAsIGJ1dCBpdCdzIHRyaWNreVxuICAgICAgICAgIC8vIHRvIGRvIHNhZmVseS4gIEZvciBub3csIHRoaXMgaXMgc2FmZSBhbmQgd29ya3MuXG4gICAgICAgICAgdmFyIGNzID0gcGF0dGVybi5zdWJzdHJpbmcoY2xhc3NTdGFydCArIDEsIGkpXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIFJlZ0V4cCgnWycgKyBjcyArICddJylcbiAgICAgICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICAgICAgLy8gbm90IGEgdmFsaWQgY2xhc3MhXG4gICAgICAgICAgICB2YXIgc3AgPSB0aGlzLnBhcnNlKGNzLCBTVUJQQVJTRSlcbiAgICAgICAgICAgIHJlID0gcmUuc3Vic3RyKDAsIHJlQ2xhc3NTdGFydCkgKyAnXFxcXFsnICsgc3BbMF0gKyAnXFxcXF0nXG4gICAgICAgICAgICBoYXNNYWdpYyA9IGhhc01hZ2ljIHx8IHNwWzFdXG4gICAgICAgICAgICBpbkNsYXNzID0gZmFsc2VcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmluaXNoIHVwIHRoZSBjbGFzcy5cbiAgICAgICAgaGFzTWFnaWMgPSB0cnVlXG4gICAgICAgIGluQ2xhc3MgPSBmYWxzZVxuICAgICAgICByZSArPSBjXG4gICAgICBjb250aW51ZVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBzd2FsbG93IGFueSBzdGF0ZSBjaGFyIHRoYXQgd2Fzbid0IGNvbnN1bWVkXG4gICAgICAgIGNsZWFyU3RhdGVDaGFyKClcblxuICAgICAgICBpZiAoZXNjYXBpbmcpIHtcbiAgICAgICAgICAvLyBubyBuZWVkXG4gICAgICAgICAgZXNjYXBpbmcgPSBmYWxzZVxuICAgICAgICB9IGVsc2UgaWYgKHJlU3BlY2lhbHNbY11cbiAgICAgICAgICAmJiAhKGMgPT09ICdeJyAmJiBpbkNsYXNzKSkge1xuICAgICAgICAgIHJlICs9ICdcXFxcJ1xuICAgICAgICB9XG5cbiAgICAgICAgcmUgKz0gY1xuXG4gICAgfSAvLyBzd2l0Y2hcbiAgfSAvLyBmb3JcblxuICAvLyBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgd2UgbGVmdCBhIGNsYXNzIG9wZW4uXG4gIC8vIFwiW2FiY1wiIGlzIHZhbGlkLCBlcXVpdmFsZW50IHRvIFwiXFxbYWJjXCJcbiAgaWYgKGluQ2xhc3MpIHtcbiAgICAvLyBzcGxpdCB3aGVyZSB0aGUgbGFzdCBbIHdhcywgYW5kIGVzY2FwZSBpdFxuICAgIC8vIHRoaXMgaXMgYSBodWdlIHBpdGEuICBXZSBub3cgaGF2ZSB0byByZS13YWxrXG4gICAgLy8gdGhlIGNvbnRlbnRzIG9mIHRoZSB3b3VsZC1iZSBjbGFzcyB0byByZS10cmFuc2xhdGVcbiAgICAvLyBhbnkgY2hhcmFjdGVycyB0aGF0IHdlcmUgcGFzc2VkIHRocm91Z2ggYXMtaXNcbiAgICBjcyA9IHBhdHRlcm4uc3Vic3RyKGNsYXNzU3RhcnQgKyAxKVxuICAgIHNwID0gdGhpcy5wYXJzZShjcywgU1VCUEFSU0UpXG4gICAgcmUgPSByZS5zdWJzdHIoMCwgcmVDbGFzc1N0YXJ0KSArICdcXFxcWycgKyBzcFswXVxuICAgIGhhc01hZ2ljID0gaGFzTWFnaWMgfHwgc3BbMV1cbiAgfVxuXG4gIC8vIGhhbmRsZSB0aGUgY2FzZSB3aGVyZSB3ZSBoYWQgYSArKCB0aGluZyBhdCB0aGUgKmVuZCpcbiAgLy8gb2YgdGhlIHBhdHRlcm4uXG4gIC8vIGVhY2ggcGF0dGVybiBsaXN0IHN0YWNrIGFkZHMgMyBjaGFycywgYW5kIHdlIG5lZWQgdG8gZ28gdGhyb3VnaFxuICAvLyBhbmQgZXNjYXBlIGFueSB8IGNoYXJzIHRoYXQgd2VyZSBwYXNzZWQgdGhyb3VnaCBhcy1pcyBmb3IgdGhlIHJlZ2V4cC5cbiAgLy8gR28gdGhyb3VnaCBhbmQgZXNjYXBlIHRoZW0sIHRha2luZyBjYXJlIG5vdCB0byBkb3VibGUtZXNjYXBlIGFueVxuICAvLyB8IGNoYXJzIHRoYXQgd2VyZSBhbHJlYWR5IGVzY2FwZWQuXG4gIGZvciAocGwgPSBwYXR0ZXJuTGlzdFN0YWNrLnBvcCgpOyBwbDsgcGwgPSBwYXR0ZXJuTGlzdFN0YWNrLnBvcCgpKSB7XG4gICAgdmFyIHRhaWwgPSByZS5zbGljZShwbC5yZVN0YXJ0ICsgcGwub3Blbi5sZW5ndGgpXG4gICAgdGhpcy5kZWJ1Zygnc2V0dGluZyB0YWlsJywgcmUsIHBsKVxuICAgIC8vIG1heWJlIHNvbWUgZXZlbiBudW1iZXIgb2YgXFwsIHRoZW4gbWF5YmUgMSBcXCwgZm9sbG93ZWQgYnkgYSB8XG4gICAgdGFpbCA9IHRhaWwucmVwbGFjZSgvKCg/OlxcXFx7Mn0pezAsNjR9KShcXFxcPylcXHwvZywgZnVuY3Rpb24gKF8sICQxLCAkMikge1xuICAgICAgaWYgKCEkMikge1xuICAgICAgICAvLyB0aGUgfCBpc24ndCBhbHJlYWR5IGVzY2FwZWQsIHNvIGVzY2FwZSBpdC5cbiAgICAgICAgJDIgPSAnXFxcXCdcbiAgICAgIH1cblxuICAgICAgLy8gbmVlZCB0byBlc2NhcGUgYWxsIHRob3NlIHNsYXNoZXMgKmFnYWluKiwgd2l0aG91dCBlc2NhcGluZyB0aGVcbiAgICAgIC8vIG9uZSB0aGF0IHdlIG5lZWQgZm9yIGVzY2FwaW5nIHRoZSB8IGNoYXJhY3Rlci4gIEFzIGl0IHdvcmtzIG91dCxcbiAgICAgIC8vIGVzY2FwaW5nIGFuIGV2ZW4gbnVtYmVyIG9mIHNsYXNoZXMgY2FuIGJlIGRvbmUgYnkgc2ltcGx5IHJlcGVhdGluZ1xuICAgICAgLy8gaXQgZXhhY3RseSBhZnRlciBpdHNlbGYuICBUaGF0J3Mgd2h5IHRoaXMgdHJpY2sgd29ya3MuXG4gICAgICAvL1xuICAgICAgLy8gSSBhbSBzb3JyeSB0aGF0IHlvdSBoYXZlIHRvIHNlZSB0aGlzLlxuICAgICAgcmV0dXJuICQxICsgJDEgKyAkMiArICd8J1xuICAgIH0pXG5cbiAgICB0aGlzLmRlYnVnKCd0YWlsPSVqXFxuICAgJXMnLCB0YWlsLCB0YWlsLCBwbCwgcmUpXG4gICAgdmFyIHQgPSBwbC50eXBlID09PSAnKicgPyBzdGFyXG4gICAgICA6IHBsLnR5cGUgPT09ICc/JyA/IHFtYXJrXG4gICAgICA6ICdcXFxcJyArIHBsLnR5cGVcblxuICAgIGhhc01hZ2ljID0gdHJ1ZVxuICAgIHJlID0gcmUuc2xpY2UoMCwgcGwucmVTdGFydCkgKyB0ICsgJ1xcXFwoJyArIHRhaWxcbiAgfVxuXG4gIC8vIGhhbmRsZSB0cmFpbGluZyB0aGluZ3MgdGhhdCBvbmx5IG1hdHRlciBhdCB0aGUgdmVyeSBlbmQuXG4gIGNsZWFyU3RhdGVDaGFyKClcbiAgaWYgKGVzY2FwaW5nKSB7XG4gICAgLy8gdHJhaWxpbmcgXFxcXFxuICAgIHJlICs9ICdcXFxcXFxcXCdcbiAgfVxuXG4gIC8vIG9ubHkgbmVlZCB0byBhcHBseSB0aGUgbm9kb3Qgc3RhcnQgaWYgdGhlIHJlIHN0YXJ0cyB3aXRoXG4gIC8vIHNvbWV0aGluZyB0aGF0IGNvdWxkIGNvbmNlaXZhYmx5IGNhcHR1cmUgYSBkb3RcbiAgdmFyIGFkZFBhdHRlcm5TdGFydCA9IGZhbHNlXG4gIHN3aXRjaCAocmUuY2hhckF0KDApKSB7XG4gICAgY2FzZSAnLic6XG4gICAgY2FzZSAnWyc6XG4gICAgY2FzZSAnKCc6IGFkZFBhdHRlcm5TdGFydCA9IHRydWVcbiAgfVxuXG4gIC8vIEhhY2sgdG8gd29yayBhcm91bmQgbGFjayBvZiBuZWdhdGl2ZSBsb29rYmVoaW5kIGluIEpTXG4gIC8vIEEgcGF0dGVybiBsaWtlOiAqLiEoeCkuISh5fHopIG5lZWRzIHRvIGVuc3VyZSB0aGF0IGEgbmFtZVxuICAvLyBsaWtlICdhLnh5ei55eicgZG9lc24ndCBtYXRjaC4gIFNvLCB0aGUgZmlyc3QgbmVnYXRpdmVcbiAgLy8gbG9va2FoZWFkLCBoYXMgdG8gbG9vayBBTEwgdGhlIHdheSBhaGVhZCwgdG8gdGhlIGVuZCBvZlxuICAvLyB0aGUgcGF0dGVybi5cbiAgZm9yICh2YXIgbiA9IG5lZ2F0aXZlTGlzdHMubGVuZ3RoIC0gMTsgbiA+IC0xOyBuLS0pIHtcbiAgICB2YXIgbmwgPSBuZWdhdGl2ZUxpc3RzW25dXG5cbiAgICB2YXIgbmxCZWZvcmUgPSByZS5zbGljZSgwLCBubC5yZVN0YXJ0KVxuICAgIHZhciBubEZpcnN0ID0gcmUuc2xpY2UobmwucmVTdGFydCwgbmwucmVFbmQgLSA4KVxuICAgIHZhciBubExhc3QgPSByZS5zbGljZShubC5yZUVuZCAtIDgsIG5sLnJlRW5kKVxuICAgIHZhciBubEFmdGVyID0gcmUuc2xpY2UobmwucmVFbmQpXG5cbiAgICBubExhc3QgKz0gbmxBZnRlclxuXG4gICAgLy8gSGFuZGxlIG5lc3RlZCBzdHVmZiBsaWtlICooKi5qc3whKCouanNvbikpLCB3aGVyZSBvcGVuIHBhcmVuc1xuICAgIC8vIG1lYW4gdGhhdCB3ZSBzaG91bGQgKm5vdCogaW5jbHVkZSB0aGUgKSBpbiB0aGUgYml0IHRoYXQgaXMgY29uc2lkZXJlZFxuICAgIC8vIFwiYWZ0ZXJcIiB0aGUgbmVnYXRlZCBzZWN0aW9uLlxuICAgIHZhciBvcGVuUGFyZW5zQmVmb3JlID0gbmxCZWZvcmUuc3BsaXQoJygnKS5sZW5ndGggLSAxXG4gICAgdmFyIGNsZWFuQWZ0ZXIgPSBubEFmdGVyXG4gICAgZm9yIChpID0gMDsgaSA8IG9wZW5QYXJlbnNCZWZvcmU7IGkrKykge1xuICAgICAgY2xlYW5BZnRlciA9IGNsZWFuQWZ0ZXIucmVwbGFjZSgvXFwpWysqP10/LywgJycpXG4gICAgfVxuICAgIG5sQWZ0ZXIgPSBjbGVhbkFmdGVyXG5cbiAgICB2YXIgZG9sbGFyID0gJydcbiAgICBpZiAobmxBZnRlciA9PT0gJycgJiYgaXNTdWIgIT09IFNVQlBBUlNFKSB7XG4gICAgICBkb2xsYXIgPSAnJCdcbiAgICB9XG4gICAgdmFyIG5ld1JlID0gbmxCZWZvcmUgKyBubEZpcnN0ICsgbmxBZnRlciArIGRvbGxhciArIG5sTGFzdFxuICAgIHJlID0gbmV3UmVcbiAgfVxuXG4gIC8vIGlmIHRoZSByZSBpcyBub3QgXCJcIiBhdCB0aGlzIHBvaW50LCB0aGVuIHdlIG5lZWQgdG8gbWFrZSBzdXJlXG4gIC8vIGl0IGRvZXNuJ3QgbWF0Y2ggYWdhaW5zdCBhbiBlbXB0eSBwYXRoIHBhcnQuXG4gIC8vIE90aGVyd2lzZSBhLyogd2lsbCBtYXRjaCBhLywgd2hpY2ggaXQgc2hvdWxkIG5vdC5cbiAgaWYgKHJlICE9PSAnJyAmJiBoYXNNYWdpYykge1xuICAgIHJlID0gJyg/PS4pJyArIHJlXG4gIH1cblxuICBpZiAoYWRkUGF0dGVyblN0YXJ0KSB7XG4gICAgcmUgPSBwYXR0ZXJuU3RhcnQgKyByZVxuICB9XG5cbiAgLy8gcGFyc2luZyBqdXN0IGEgcGllY2Ugb2YgYSBsYXJnZXIgcGF0dGVybi5cbiAgaWYgKGlzU3ViID09PSBTVUJQQVJTRSkge1xuICAgIHJldHVybiBbcmUsIGhhc01hZ2ljXVxuICB9XG5cbiAgLy8gc2tpcCB0aGUgcmVnZXhwIGZvciBub24tbWFnaWNhbCBwYXR0ZXJuc1xuICAvLyB1bmVzY2FwZSBhbnl0aGluZyBpbiBpdCwgdGhvdWdoLCBzbyB0aGF0IGl0J2xsIGJlXG4gIC8vIGFuIGV4YWN0IG1hdGNoIGFnYWluc3QgYSBmaWxlIGV0Yy5cbiAgaWYgKCFoYXNNYWdpYykge1xuICAgIHJldHVybiBnbG9iVW5lc2NhcGUocGF0dGVybilcbiAgfVxuXG4gIHZhciBmbGFncyA9IG9wdGlvbnMubm9jYXNlID8gJ2knIDogJydcbiAgdHJ5IHtcbiAgICB2YXIgcmVnRXhwID0gbmV3IFJlZ0V4cCgnXicgKyByZSArICckJywgZmxhZ3MpXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgLy8gSWYgaXQgd2FzIGFuIGludmFsaWQgcmVndWxhciBleHByZXNzaW9uLCB0aGVuIGl0IGNhbid0IG1hdGNoXG4gICAgLy8gYW55dGhpbmcuICBUaGlzIHRyaWNrIGxvb2tzIGZvciBhIGNoYXJhY3RlciBhZnRlciB0aGUgZW5kIG9mXG4gICAgLy8gdGhlIHN0cmluZywgd2hpY2ggaXMgb2YgY291cnNlIGltcG9zc2libGUsIGV4Y2VwdCBpbiBtdWx0aS1saW5lXG4gICAgLy8gbW9kZSwgYnV0IGl0J3Mgbm90IGEgL20gcmVnZXguXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoJyQuJylcbiAgfVxuXG4gIHJlZ0V4cC5fZ2xvYiA9IHBhdHRlcm5cbiAgcmVnRXhwLl9zcmMgPSByZVxuXG4gIHJldHVybiByZWdFeHBcbn1cblxubWluaW1hdGNoLm1ha2VSZSA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgTWluaW1hdGNoKHBhdHRlcm4sIG9wdGlvbnMgfHwge30pLm1ha2VSZSgpXG59XG5cbk1pbmltYXRjaC5wcm90b3R5cGUubWFrZVJlID0gbWFrZVJlXG5mdW5jdGlvbiBtYWtlUmUgKCkge1xuICBpZiAodGhpcy5yZWdleHAgfHwgdGhpcy5yZWdleHAgPT09IGZhbHNlKSByZXR1cm4gdGhpcy5yZWdleHBcblxuICAvLyBhdCB0aGlzIHBvaW50LCB0aGlzLnNldCBpcyBhIDJkIGFycmF5IG9mIHBhcnRpYWxcbiAgLy8gcGF0dGVybiBzdHJpbmdzLCBvciBcIioqXCIuXG4gIC8vXG4gIC8vIEl0J3MgYmV0dGVyIHRvIHVzZSAubWF0Y2goKS4gIFRoaXMgZnVuY3Rpb24gc2hvdWxkbid0XG4gIC8vIGJlIHVzZWQsIHJlYWxseSwgYnV0IGl0J3MgcHJldHR5IGNvbnZlbmllbnQgc29tZXRpbWVzLFxuICAvLyB3aGVuIHlvdSBqdXN0IHdhbnQgdG8gd29yayB3aXRoIGEgcmVnZXguXG4gIHZhciBzZXQgPSB0aGlzLnNldFxuXG4gIGlmICghc2V0Lmxlbmd0aCkge1xuICAgIHRoaXMucmVnZXhwID0gZmFsc2VcbiAgICByZXR1cm4gdGhpcy5yZWdleHBcbiAgfVxuICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1xuXG4gIHZhciB0d29TdGFyID0gb3B0aW9ucy5ub2dsb2JzdGFyID8gc3RhclxuICAgIDogb3B0aW9ucy5kb3QgPyB0d29TdGFyRG90XG4gICAgOiB0d29TdGFyTm9Eb3RcbiAgdmFyIGZsYWdzID0gb3B0aW9ucy5ub2Nhc2UgPyAnaScgOiAnJ1xuXG4gIHZhciByZSA9IHNldC5tYXAoZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgICByZXR1cm4gcGF0dGVybi5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiAocCA9PT0gR0xPQlNUQVIpID8gdHdvU3RhclxuICAgICAgOiAodHlwZW9mIHAgPT09ICdzdHJpbmcnKSA/IHJlZ0V4cEVzY2FwZShwKVxuICAgICAgOiBwLl9zcmNcbiAgICB9KS5qb2luKCdcXFxcXFwvJylcbiAgfSkuam9pbignfCcpXG5cbiAgLy8gbXVzdCBtYXRjaCBlbnRpcmUgcGF0dGVyblxuICAvLyBlbmRpbmcgaW4gYSAqIG9yICoqIHdpbGwgbWFrZSBpdCBsZXNzIHN0cmljdC5cbiAgcmUgPSAnXig/OicgKyByZSArICcpJCdcblxuICAvLyBjYW4gbWF0Y2ggYW55dGhpbmcsIGFzIGxvbmcgYXMgaXQncyBub3QgdGhpcy5cbiAgaWYgKHRoaXMubmVnYXRlKSByZSA9ICdeKD8hJyArIHJlICsgJykuKiQnXG5cbiAgdHJ5IHtcbiAgICB0aGlzLnJlZ2V4cCA9IG5ldyBSZWdFeHAocmUsIGZsYWdzKVxuICB9IGNhdGNoIChleCkge1xuICAgIHRoaXMucmVnZXhwID0gZmFsc2VcbiAgfVxuICByZXR1cm4gdGhpcy5yZWdleHBcbn1cblxubWluaW1hdGNoLm1hdGNoID0gZnVuY3Rpb24gKGxpc3QsIHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgdmFyIG1tID0gbmV3IE1pbmltYXRjaChwYXR0ZXJuLCBvcHRpb25zKVxuICBsaXN0ID0gbGlzdC5maWx0ZXIoZnVuY3Rpb24gKGYpIHtcbiAgICByZXR1cm4gbW0ubWF0Y2goZilcbiAgfSlcbiAgaWYgKG1tLm9wdGlvbnMubm9udWxsICYmICFsaXN0Lmxlbmd0aCkge1xuICAgIGxpc3QucHVzaChwYXR0ZXJuKVxuICB9XG4gIHJldHVybiBsaXN0XG59XG5cbk1pbmltYXRjaC5wcm90b3R5cGUubWF0Y2ggPSBtYXRjaFxuZnVuY3Rpb24gbWF0Y2ggKGYsIHBhcnRpYWwpIHtcbiAgdGhpcy5kZWJ1ZygnbWF0Y2gnLCBmLCB0aGlzLnBhdHRlcm4pXG4gIC8vIHNob3J0LWNpcmN1aXQgaW4gdGhlIGNhc2Ugb2YgYnVzdGVkIHRoaW5ncy5cbiAgLy8gY29tbWVudHMsIGV0Yy5cbiAgaWYgKHRoaXMuY29tbWVudCkgcmV0dXJuIGZhbHNlXG4gIGlmICh0aGlzLmVtcHR5KSByZXR1cm4gZiA9PT0gJydcblxuICBpZiAoZiA9PT0gJy8nICYmIHBhcnRpYWwpIHJldHVybiB0cnVlXG5cbiAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnNcblxuICAvLyB3aW5kb3dzOiBuZWVkIHRvIHVzZSAvLCBub3QgXFxcbiAgaWYgKHBhdGguc2VwICE9PSAnLycpIHtcbiAgICBmID0gZi5zcGxpdChwYXRoLnNlcCkuam9pbignLycpXG4gIH1cblxuICAvLyB0cmVhdCB0aGUgdGVzdCBwYXRoIGFzIGEgc2V0IG9mIHBhdGhwYXJ0cy5cbiAgZiA9IGYuc3BsaXQoc2xhc2hTcGxpdClcbiAgdGhpcy5kZWJ1Zyh0aGlzLnBhdHRlcm4sICdzcGxpdCcsIGYpXG5cbiAgLy8ganVzdCBPTkUgb2YgdGhlIHBhdHRlcm4gc2V0cyBpbiB0aGlzLnNldCBuZWVkcyB0byBtYXRjaFxuICAvLyBpbiBvcmRlciBmb3IgaXQgdG8gYmUgdmFsaWQuICBJZiBuZWdhdGluZywgdGhlbiBqdXN0IG9uZVxuICAvLyBtYXRjaCBtZWFucyB0aGF0IHdlIGhhdmUgZmFpbGVkLlxuICAvLyBFaXRoZXIgd2F5LCByZXR1cm4gb24gdGhlIGZpcnN0IGhpdC5cblxuICB2YXIgc2V0ID0gdGhpcy5zZXRcbiAgdGhpcy5kZWJ1Zyh0aGlzLnBhdHRlcm4sICdzZXQnLCBzZXQpXG5cbiAgLy8gRmluZCB0aGUgYmFzZW5hbWUgb2YgdGhlIHBhdGggYnkgbG9va2luZyBmb3IgdGhlIGxhc3Qgbm9uLWVtcHR5IHNlZ21lbnRcbiAgdmFyIGZpbGVuYW1lXG4gIHZhciBpXG4gIGZvciAoaSA9IGYubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBmaWxlbmFtZSA9IGZbaV1cbiAgICBpZiAoZmlsZW5hbWUpIGJyZWFrXG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhdHRlcm4gPSBzZXRbaV1cbiAgICB2YXIgZmlsZSA9IGZcbiAgICBpZiAob3B0aW9ucy5tYXRjaEJhc2UgJiYgcGF0dGVybi5sZW5ndGggPT09IDEpIHtcbiAgICAgIGZpbGUgPSBbZmlsZW5hbWVdXG4gICAgfVxuICAgIHZhciBoaXQgPSB0aGlzLm1hdGNoT25lKGZpbGUsIHBhdHRlcm4sIHBhcnRpYWwpXG4gICAgaWYgKGhpdCkge1xuICAgICAgaWYgKG9wdGlvbnMuZmxpcE5lZ2F0ZSkgcmV0dXJuIHRydWVcbiAgICAgIHJldHVybiAhdGhpcy5uZWdhdGVcbiAgICB9XG4gIH1cblxuICAvLyBkaWRuJ3QgZ2V0IGFueSBoaXRzLiAgdGhpcyBpcyBzdWNjZXNzIGlmIGl0J3MgYSBuZWdhdGl2ZVxuICAvLyBwYXR0ZXJuLCBmYWlsdXJlIG90aGVyd2lzZS5cbiAgaWYgKG9wdGlvbnMuZmxpcE5lZ2F0ZSkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiB0aGlzLm5lZ2F0ZVxufVxuXG4vLyBzZXQgcGFydGlhbCB0byB0cnVlIHRvIHRlc3QgaWYsIGZvciBleGFtcGxlLFxuLy8gXCIvYS9iXCIgbWF0Y2hlcyB0aGUgc3RhcnQgb2YgXCIvKi9iLyovZFwiXG4vLyBQYXJ0aWFsIG1lYW5zLCBpZiB5b3UgcnVuIG91dCBvZiBmaWxlIGJlZm9yZSB5b3UgcnVuXG4vLyBvdXQgb2YgcGF0dGVybiwgdGhlbiB0aGF0J3MgZmluZSwgYXMgbG9uZyBhcyBhbGxcbi8vIHRoZSBwYXJ0cyBtYXRjaC5cbk1pbmltYXRjaC5wcm90b3R5cGUubWF0Y2hPbmUgPSBmdW5jdGlvbiAoZmlsZSwgcGF0dGVybiwgcGFydGlhbCkge1xuICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1xuXG4gIHRoaXMuZGVidWcoJ21hdGNoT25lJyxcbiAgICB7ICd0aGlzJzogdGhpcywgZmlsZTogZmlsZSwgcGF0dGVybjogcGF0dGVybiB9KVxuXG4gIHRoaXMuZGVidWcoJ21hdGNoT25lJywgZmlsZS5sZW5ndGgsIHBhdHRlcm4ubGVuZ3RoKVxuXG4gIGZvciAodmFyIGZpID0gMCxcbiAgICAgIHBpID0gMCxcbiAgICAgIGZsID0gZmlsZS5sZW5ndGgsXG4gICAgICBwbCA9IHBhdHRlcm4ubGVuZ3RoXG4gICAgICA7IChmaSA8IGZsKSAmJiAocGkgPCBwbClcbiAgICAgIDsgZmkrKywgcGkrKykge1xuICAgIHRoaXMuZGVidWcoJ21hdGNoT25lIGxvb3AnKVxuICAgIHZhciBwID0gcGF0dGVybltwaV1cbiAgICB2YXIgZiA9IGZpbGVbZmldXG5cbiAgICB0aGlzLmRlYnVnKHBhdHRlcm4sIHAsIGYpXG5cbiAgICAvLyBzaG91bGQgYmUgaW1wb3NzaWJsZS5cbiAgICAvLyBzb21lIGludmFsaWQgcmVnZXhwIHN0dWZmIGluIHRoZSBzZXQuXG4gICAgaWYgKHAgPT09IGZhbHNlKSByZXR1cm4gZmFsc2VcblxuICAgIGlmIChwID09PSBHTE9CU1RBUikge1xuICAgICAgdGhpcy5kZWJ1ZygnR0xPQlNUQVInLCBbcGF0dGVybiwgcCwgZl0pXG5cbiAgICAgIC8vIFwiKipcIlxuICAgICAgLy8gYS8qKi9iLyoqL2Mgd291bGQgbWF0Y2ggdGhlIGZvbGxvd2luZzpcbiAgICAgIC8vIGEvYi94L3kvei9jXG4gICAgICAvLyBhL3gveS96L2IvY1xuICAgICAgLy8gYS9iL3gvYi94L2NcbiAgICAgIC8vIGEvYi9jXG4gICAgICAvLyBUbyBkbyB0aGlzLCB0YWtlIHRoZSByZXN0IG9mIHRoZSBwYXR0ZXJuIGFmdGVyXG4gICAgICAvLyB0aGUgKiosIGFuZCBzZWUgaWYgaXQgd291bGQgbWF0Y2ggdGhlIGZpbGUgcmVtYWluZGVyLlxuICAgICAgLy8gSWYgc28sIHJldHVybiBzdWNjZXNzLlxuICAgICAgLy8gSWYgbm90LCB0aGUgKiogXCJzd2FsbG93c1wiIGEgc2VnbWVudCwgYW5kIHRyeSBhZ2Fpbi5cbiAgICAgIC8vIFRoaXMgaXMgcmVjdXJzaXZlbHkgYXdmdWwuXG4gICAgICAvL1xuICAgICAgLy8gYS8qKi9iLyoqL2MgbWF0Y2hpbmcgYS9iL3gveS96L2NcbiAgICAgIC8vIC0gYSBtYXRjaGVzIGFcbiAgICAgIC8vIC0gZG91Ymxlc3RhclxuICAgICAgLy8gICAtIG1hdGNoT25lKGIveC95L3ovYywgYi8qKi9jKVxuICAgICAgLy8gICAgIC0gYiBtYXRjaGVzIGJcbiAgICAgIC8vICAgICAtIGRvdWJsZXN0YXJcbiAgICAgIC8vICAgICAgIC0gbWF0Y2hPbmUoeC95L3ovYywgYykgLT4gbm9cbiAgICAgIC8vICAgICAgIC0gbWF0Y2hPbmUoeS96L2MsIGMpIC0+IG5vXG4gICAgICAvLyAgICAgICAtIG1hdGNoT25lKHovYywgYykgLT4gbm9cbiAgICAgIC8vICAgICAgIC0gbWF0Y2hPbmUoYywgYykgeWVzLCBoaXRcbiAgICAgIHZhciBmciA9IGZpXG4gICAgICB2YXIgcHIgPSBwaSArIDFcbiAgICAgIGlmIChwciA9PT0gcGwpIHtcbiAgICAgICAgdGhpcy5kZWJ1ZygnKiogYXQgdGhlIGVuZCcpXG4gICAgICAgIC8vIGEgKiogYXQgdGhlIGVuZCB3aWxsIGp1c3Qgc3dhbGxvdyB0aGUgcmVzdC5cbiAgICAgICAgLy8gV2UgaGF2ZSBmb3VuZCBhIG1hdGNoLlxuICAgICAgICAvLyBob3dldmVyLCBpdCB3aWxsIG5vdCBzd2FsbG93IC8ueCwgdW5sZXNzXG4gICAgICAgIC8vIG9wdGlvbnMuZG90IGlzIHNldC5cbiAgICAgICAgLy8gLiBhbmQgLi4gYXJlICpuZXZlciogbWF0Y2hlZCBieSAqKiwgZm9yIGV4cGxvc2l2ZWx5XG4gICAgICAgIC8vIGV4cG9uZW50aWFsIHJlYXNvbnMuXG4gICAgICAgIGZvciAoOyBmaSA8IGZsOyBmaSsrKSB7XG4gICAgICAgICAgaWYgKGZpbGVbZmldID09PSAnLicgfHwgZmlsZVtmaV0gPT09ICcuLicgfHxcbiAgICAgICAgICAgICghb3B0aW9ucy5kb3QgJiYgZmlsZVtmaV0uY2hhckF0KDApID09PSAnLicpKSByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuXG4gICAgICAvLyBvaywgbGV0J3Mgc2VlIGlmIHdlIGNhbiBzd2FsbG93IHdoYXRldmVyIHdlIGNhbi5cbiAgICAgIHdoaWxlIChmciA8IGZsKSB7XG4gICAgICAgIHZhciBzd2FsbG93ZWUgPSBmaWxlW2ZyXVxuXG4gICAgICAgIHRoaXMuZGVidWcoJ1xcbmdsb2JzdGFyIHdoaWxlJywgZmlsZSwgZnIsIHBhdHRlcm4sIHByLCBzd2FsbG93ZWUpXG5cbiAgICAgICAgLy8gWFhYIHJlbW92ZSB0aGlzIHNsaWNlLiAgSnVzdCBwYXNzIHRoZSBzdGFydCBpbmRleC5cbiAgICAgICAgaWYgKHRoaXMubWF0Y2hPbmUoZmlsZS5zbGljZShmciksIHBhdHRlcm4uc2xpY2UocHIpLCBwYXJ0aWFsKSkge1xuICAgICAgICAgIHRoaXMuZGVidWcoJ2dsb2JzdGFyIGZvdW5kIG1hdGNoIScsIGZyLCBmbCwgc3dhbGxvd2VlKVxuICAgICAgICAgIC8vIGZvdW5kIGEgbWF0Y2guXG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBjYW4ndCBzd2FsbG93IFwiLlwiIG9yIFwiLi5cIiBldmVyLlxuICAgICAgICAgIC8vIGNhbiBvbmx5IHN3YWxsb3cgXCIuZm9vXCIgd2hlbiBleHBsaWNpdGx5IGFza2VkLlxuICAgICAgICAgIGlmIChzd2FsbG93ZWUgPT09ICcuJyB8fCBzd2FsbG93ZWUgPT09ICcuLicgfHxcbiAgICAgICAgICAgICghb3B0aW9ucy5kb3QgJiYgc3dhbGxvd2VlLmNoYXJBdCgwKSA9PT0gJy4nKSkge1xuICAgICAgICAgICAgdGhpcy5kZWJ1ZygnZG90IGRldGVjdGVkIScsIGZpbGUsIGZyLCBwYXR0ZXJuLCBwcilcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gKiogc3dhbGxvd3MgYSBzZWdtZW50LCBhbmQgY29udGludWUuXG4gICAgICAgICAgdGhpcy5kZWJ1ZygnZ2xvYnN0YXIgc3dhbGxvdyBhIHNlZ21lbnQsIGFuZCBjb250aW51ZScpXG4gICAgICAgICAgZnIrK1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG5vIG1hdGNoIHdhcyBmb3VuZC5cbiAgICAgIC8vIEhvd2V2ZXIsIGluIHBhcnRpYWwgbW9kZSwgd2UgY2FuJ3Qgc2F5IHRoaXMgaXMgbmVjZXNzYXJpbHkgb3Zlci5cbiAgICAgIC8vIElmIHRoZXJlJ3MgbW9yZSAqcGF0dGVybiogbGVmdCwgdGhlblxuICAgICAgaWYgKHBhcnRpYWwpIHtcbiAgICAgICAgLy8gcmFuIG91dCBvZiBmaWxlXG4gICAgICAgIHRoaXMuZGVidWcoJ1xcbj4+PiBubyBtYXRjaCwgcGFydGlhbD8nLCBmaWxlLCBmciwgcGF0dGVybiwgcHIpXG4gICAgICAgIGlmIChmciA9PT0gZmwpIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBzb21ldGhpbmcgb3RoZXIgdGhhbiAqKlxuICAgIC8vIG5vbi1tYWdpYyBwYXR0ZXJucyBqdXN0IGhhdmUgdG8gbWF0Y2ggZXhhY3RseVxuICAgIC8vIHBhdHRlcm5zIHdpdGggbWFnaWMgaGF2ZSBiZWVuIHR1cm5lZCBpbnRvIHJlZ2V4cHMuXG4gICAgdmFyIGhpdFxuICAgIGlmICh0eXBlb2YgcCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChvcHRpb25zLm5vY2FzZSkge1xuICAgICAgICBoaXQgPSBmLnRvTG93ZXJDYXNlKCkgPT09IHAudG9Mb3dlckNhc2UoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGl0ID0gZiA9PT0gcFxuICAgICAgfVxuICAgICAgdGhpcy5kZWJ1Zygnc3RyaW5nIG1hdGNoJywgcCwgZiwgaGl0KVxuICAgIH0gZWxzZSB7XG4gICAgICBoaXQgPSBmLm1hdGNoKHApXG4gICAgICB0aGlzLmRlYnVnKCdwYXR0ZXJuIG1hdGNoJywgcCwgZiwgaGl0KVxuICAgIH1cblxuICAgIGlmICghaGl0KSByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIE5vdGU6IGVuZGluZyBpbiAvIG1lYW5zIHRoYXQgd2UnbGwgZ2V0IGEgZmluYWwgXCJcIlxuICAvLyBhdCB0aGUgZW5kIG9mIHRoZSBwYXR0ZXJuLiAgVGhpcyBjYW4gb25seSBtYXRjaCBhXG4gIC8vIGNvcnJlc3BvbmRpbmcgXCJcIiBhdCB0aGUgZW5kIG9mIHRoZSBmaWxlLlxuICAvLyBJZiB0aGUgZmlsZSBlbmRzIGluIC8sIHRoZW4gaXQgY2FuIG9ubHkgbWF0Y2ggYVxuICAvLyBhIHBhdHRlcm4gdGhhdCBlbmRzIGluIC8sIHVubGVzcyB0aGUgcGF0dGVybiBqdXN0XG4gIC8vIGRvZXNuJ3QgaGF2ZSBhbnkgbW9yZSBmb3IgaXQuIEJ1dCwgYS9iLyBzaG91bGQgKm5vdCpcbiAgLy8gbWF0Y2ggXCJhL2IvKlwiLCBldmVuIHRob3VnaCBcIlwiIG1hdGNoZXMgYWdhaW5zdCB0aGVcbiAgLy8gW14vXSo/IHBhdHRlcm4sIGV4Y2VwdCBpbiBwYXJ0aWFsIG1vZGUsIHdoZXJlIGl0IG1pZ2h0XG4gIC8vIHNpbXBseSBub3QgYmUgcmVhY2hlZCB5ZXQuXG4gIC8vIEhvd2V2ZXIsIGEvYi8gc2hvdWxkIHN0aWxsIHNhdGlzZnkgYS8qXG5cbiAgLy8gbm93IGVpdGhlciB3ZSBmZWxsIG9mZiB0aGUgZW5kIG9mIHRoZSBwYXR0ZXJuLCBvciB3ZSdyZSBkb25lLlxuICBpZiAoZmkgPT09IGZsICYmIHBpID09PSBwbCkge1xuICAgIC8vIHJhbiBvdXQgb2YgcGF0dGVybiBhbmQgZmlsZW5hbWUgYXQgdGhlIHNhbWUgdGltZS5cbiAgICAvLyBhbiBleGFjdCBoaXQhXG4gICAgcmV0dXJuIHRydWVcbiAgfSBlbHNlIGlmIChmaSA9PT0gZmwpIHtcbiAgICAvLyByYW4gb3V0IG9mIGZpbGUsIGJ1dCBzdGlsbCBoYWQgcGF0dGVybiBsZWZ0LlxuICAgIC8vIHRoaXMgaXMgb2sgaWYgd2UncmUgZG9pbmcgdGhlIG1hdGNoIGFzIHBhcnQgb2ZcbiAgICAvLyBhIGdsb2IgZnMgdHJhdmVyc2FsLlxuICAgIHJldHVybiBwYXJ0aWFsXG4gIH0gZWxzZSBpZiAocGkgPT09IHBsKSB7XG4gICAgLy8gcmFuIG91dCBvZiBwYXR0ZXJuLCBzdGlsbCBoYXZlIGZpbGUgbGVmdC5cbiAgICAvLyB0aGlzIGlzIG9ubHkgYWNjZXB0YWJsZSBpZiB3ZSdyZSBvbiB0aGUgdmVyeSBsYXN0XG4gICAgLy8gZW1wdHkgc2VnbWVudCBvZiBhIGZpbGUgd2l0aCBhIHRyYWlsaW5nIHNsYXNoLlxuICAgIC8vIGEvKiBzaG91bGQgbWF0Y2ggYS9iL1xuICAgIHZhciBlbXB0eUZpbGVFbmQgPSAoZmkgPT09IGZsIC0gMSkgJiYgKGZpbGVbZmldID09PSAnJylcbiAgICByZXR1cm4gZW1wdHlGaWxlRW5kXG4gIH1cblxuICAvLyBzaG91bGQgYmUgdW5yZWFjaGFibGUuXG4gIHRocm93IG5ldyBFcnJvcignd3RmPycpXG59XG5cbi8vIHJlcGxhY2Ugc3R1ZmYgbGlrZSBcXCogd2l0aCAqXG5mdW5jdGlvbiBnbG9iVW5lc2NhcGUgKHMpIHtcbiAgcmV0dXJuIHMucmVwbGFjZSgvXFxcXCguKS9nLCAnJDEnKVxufVxuXG5mdW5jdGlvbiByZWdFeHBFc2NhcGUgKHMpIHtcbiAgcmV0dXJuIHMucmVwbGFjZSgvWy1bXFxde30oKSorPy4sXFxcXF4kfCNcXHNdL2csICdcXFxcJCYnKVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGZzID0gcmVxdWlyZShcImZzXCIpO1xyXG52YXIgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xyXG52YXIgb3MgPSByZXF1aXJlKFwib3NcIik7XHJcbnZhciBtaW5pbWF0Y2ggPSByZXF1aXJlKFwibWluaW1hdGNoXCIpO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xyXG52YXIgdGNtID0gcmVxdWlyZShcIi4vdGFza2NvbW1hbmRcIik7XHJcbnZhciB2bSA9IHJlcXVpcmUoXCIuL3ZhdWx0XCIpO1xyXG52YXIgc2VtdmVyID0gcmVxdWlyZShcInNlbXZlclwiKTtcclxudmFyIGNyeXB0byA9IHJlcXVpcmUoXCJjcnlwdG9cIik7XHJcbi8qKlxyXG4gKiBIYXNoIHRhYmxlIG9mIGtub3duIHZhcmlhYmxlIGluZm8uIFRoZSBmb3JtYXR0ZWQgZW52IHZhciBuYW1lIGlzIHRoZSBsb29rdXAga2V5LlxyXG4gKlxyXG4gKiBUaGUgcHVycG9zZSBvZiB0aGlzIGhhc2ggdGFibGUgaXMgdG8ga2VlcCB0cmFjayBvZiBrbm93biB2YXJpYWJsZXMuIFRoZSBoYXNoIHRhYmxlXHJcbiAqIG5lZWRzIHRvIGJlIG1haW50YWluZWQgZm9yIG11bHRpcGxlIHJlYXNvbnM6XHJcbiAqICAxKSB0byBkaXN0aW5ndWlzaCBiZXR3ZWVuIGVudiB2YXJzIGFuZCBqb2IgdmFyc1xyXG4gKiAgMikgdG8gZGlzdGluZ3Vpc2ggYmV0d2VlbiBzZWNyZXQgdmFycyBhbmQgcHVibGljXHJcbiAqICAzKSB0byBrbm93IHRoZSByZWFsIHZhcmlhYmxlIG5hbWUgYW5kIG5vdCBqdXN0IHRoZSBmb3JtYXR0ZWQgZW52IHZhciBuYW1lLlxyXG4gKi9cclxuZXhwb3J0cy5fa25vd25WYXJpYWJsZU1hcCA9IHt9O1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFZhbGlkYXRpb24gQ2hlY2tzXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gYXN5bmMgYXdhaXQgbmVlZHMgZ2VuZXJhdG9ycyBpbiBub2RlIDQueCtcclxuaWYgKHNlbXZlci5sdChwcm9jZXNzLnZlcnNpb25zLm5vZGUsICc0LjIuMCcpKSB7XHJcbiAgICB0aGlzLndhcm5pbmcoJ1Rhc2tzIHJlcXVpcmUgYSBuZXcgYWdlbnQuICBVcGdyYWRlIHlvdXIgYWdlbnQgb3Igbm9kZSB0byA0LjIuMCBvciBsYXRlcicpO1xyXG59XHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gU3RyaW5nIGNvbnZlbmllbmNlXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuZnVuY3Rpb24gX3N0YXJ0c1dpdGgoc3RyLCBzdGFydCkge1xyXG4gICAgcmV0dXJuIHN0ci5zbGljZSgwLCBzdGFydC5sZW5ndGgpID09IHN0YXJ0O1xyXG59XHJcbmV4cG9ydHMuX3N0YXJ0c1dpdGggPSBfc3RhcnRzV2l0aDtcclxuZnVuY3Rpb24gX2VuZHNXaXRoKHN0ciwgZW5kKSB7XHJcbiAgICByZXR1cm4gc3RyLnNsaWNlKC1lbmQubGVuZ3RoKSA9PSBlbmQ7XHJcbn1cclxuZXhwb3J0cy5fZW5kc1dpdGggPSBfZW5kc1dpdGg7XHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gR2VuZXJhbCBIZWxwZXJzXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxudmFyIF9vdXRTdHJlYW0gPSBwcm9jZXNzLnN0ZG91dDtcclxudmFyIF9lcnJTdHJlYW0gPSBwcm9jZXNzLnN0ZGVycjtcclxuZnVuY3Rpb24gX3dyaXRlTGluZShzdHIpIHtcclxuICAgIF9vdXRTdHJlYW0ud3JpdGUoc3RyICsgb3MuRU9MKTtcclxufVxyXG5leHBvcnRzLl93cml0ZUxpbmUgPSBfd3JpdGVMaW5lO1xyXG5mdW5jdGlvbiBfc2V0U3RkU3RyZWFtKHN0ZFN0cmVhbSkge1xyXG4gICAgX291dFN0cmVhbSA9IHN0ZFN0cmVhbTtcclxufVxyXG5leHBvcnRzLl9zZXRTdGRTdHJlYW0gPSBfc2V0U3RkU3RyZWFtO1xyXG5mdW5jdGlvbiBfc2V0RXJyU3RyZWFtKGVyclN0cmVhbSkge1xyXG4gICAgX2VyclN0cmVhbSA9IGVyclN0cmVhbTtcclxufVxyXG5leHBvcnRzLl9zZXRFcnJTdHJlYW0gPSBfc2V0RXJyU3RyZWFtO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIExvYyBIZWxwZXJzXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxudmFyIF9sb2NTdHJpbmdDYWNoZSA9IHt9O1xyXG52YXIgX3Jlc291cmNlRmlsZXMgPSB7fTtcclxudmFyIF9saWJSZXNvdXJjZUZpbGVMb2FkZWQgPSBmYWxzZTtcclxudmFyIF9yZXNvdXJjZUN1bHR1cmUgPSAnZW4tVVMnO1xyXG5mdW5jdGlvbiBfbG9hZFJlc0pzb24ocmVzanNvbkZpbGUpIHtcclxuICAgIHZhciByZXNKc29uO1xyXG4gICAgaWYgKF9leGlzdChyZXNqc29uRmlsZSkpIHtcclxuICAgICAgICB2YXIgcmVzanNvbkNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMocmVzanNvbkZpbGUsICd1dGY4JykudG9TdHJpbmcoKTtcclxuICAgICAgICAvLyByZW1vdmUgQk9NXHJcbiAgICAgICAgaWYgKHJlc2pzb25Db250ZW50LmluZGV4T2YoJ1xcdUZFRkYnKSA9PSAwKSB7XHJcbiAgICAgICAgICAgIHJlc2pzb25Db250ZW50ID0gcmVzanNvbkNvbnRlbnQuc2xpY2UoMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJlc0pzb24gPSBKU09OLnBhcnNlKHJlc2pzb25Db250ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBfZGVidWcoJ3VuYWJsZSB0byBwYXJzZSByZXNqc29uIHdpdGggZXJyOiAnICsgZXJyLm1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIF9kZWJ1ZygnLnJlc2pzb24gZmlsZSBub3QgZm91bmQ6ICcgKyByZXNqc29uRmlsZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzSnNvbjtcclxufVxyXG5mdW5jdGlvbiBfbG9hZExvY1N0cmluZ3MocmVzb3VyY2VGaWxlLCBjdWx0dXJlKSB7XHJcbiAgICB2YXIgbG9jU3RyaW5ncyA9IHt9O1xyXG4gICAgaWYgKF9leGlzdChyZXNvdXJjZUZpbGUpKSB7XHJcbiAgICAgICAgdmFyIHJlc291cmNlSnNvbiA9IHJlcXVpcmUocmVzb3VyY2VGaWxlKTtcclxuICAgICAgICBpZiAocmVzb3VyY2VKc29uICYmIHJlc291cmNlSnNvbi5oYXNPd25Qcm9wZXJ0eSgnbWVzc2FnZXMnKSkge1xyXG4gICAgICAgICAgICB2YXIgbG9jUmVzb3VyY2VKc29uO1xyXG4gICAgICAgICAgICAvLyBsb2FkIHVwIHJlc291cmNlIHJlc2pzb24gZm9yIGRpZmZlcmVudCBjdWx0dXJlXHJcbiAgICAgICAgICAgIHZhciBsb2NhbGl6ZWRSZXNvdXJjZUZpbGUgPSBwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKHJlc291cmNlRmlsZSksICdTdHJpbmdzJywgJ3Jlc291cmNlcy5yZXNqc29uJyk7XHJcbiAgICAgICAgICAgIHZhciB1cHBlckN1bHR1cmUgPSBjdWx0dXJlLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIHZhciBjdWx0dXJlcyA9IFtdO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3VsdHVyZXMgPSBmcy5yZWFkZGlyU3luYyhsb2NhbGl6ZWRSZXNvdXJjZUZpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkgeyB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3VsdHVyZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChjdWx0dXJlc1tpXS50b1VwcGVyQ2FzZSgpID09IHVwcGVyQ3VsdHVyZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsaXplZFJlc291cmNlRmlsZSA9IHBhdGguam9pbihsb2NhbGl6ZWRSZXNvdXJjZUZpbGUsIGN1bHR1cmVzW2ldLCAncmVzb3VyY2VzLnJlc2pzb24nKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoX2V4aXN0KGxvY2FsaXplZFJlc291cmNlRmlsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jUmVzb3VyY2VKc29uID0gX2xvYWRSZXNKc29uKGxvY2FsaXplZFJlc291cmNlRmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiByZXNvdXJjZUpzb24ubWVzc2FnZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChsb2NSZXNvdXJjZUpzb24gJiYgbG9jUmVzb3VyY2VKc29uLmhhc093blByb3BlcnR5KCdsb2MubWVzc2FnZXMuJyArIGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2NTdHJpbmdzW2tleV0gPSBsb2NSZXNvdXJjZUpzb25bJ2xvYy5tZXNzYWdlcy4nICsga2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY1N0cmluZ3Nba2V5XSA9IHJlc291cmNlSnNvbi5tZXNzYWdlc1trZXldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgX3dhcm5pbmcoJ0xJQl9SZXNvdXJjZUZpbGUgZG9lcyBub3QgZXhpc3QnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBsb2NTdHJpbmdzO1xyXG59XHJcbi8qKlxyXG4gKiBTZXRzIHRoZSBsb2NhdGlvbiBvZiB0aGUgcmVzb3VyY2VzIGpzb24uICBUaGlzIGlzIHR5cGljYWxseSB0aGUgdGFzay5qc29uIGZpbGUuXHJcbiAqIENhbGwgb25jZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzY3JpcHQgYmVmb3JlIGFueSBjYWxscyB0byBsb2MuXHJcbiAqXHJcbiAqIEBwYXJhbSAgICAgcGF0aCAgICAgIEZ1bGwgcGF0aCB0byB0aGUganNvbi5cclxuICogQHJldHVybnMgICB2b2lkXHJcbiAqL1xyXG5mdW5jdGlvbiBfc2V0UmVzb3VyY2VQYXRoKHBhdGgpIHtcclxuICAgIGlmIChwcm9jZXNzLmVudlsnVEFTS0xJQl9JTlBST0NfVU5JVFMnXSkge1xyXG4gICAgICAgIF9yZXNvdXJjZUZpbGVzID0ge307XHJcbiAgICAgICAgX2xpYlJlc291cmNlRmlsZUxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIF9sb2NTdHJpbmdDYWNoZSA9IHt9O1xyXG4gICAgICAgIF9yZXNvdXJjZUN1bHR1cmUgPSAnZW4tVVMnO1xyXG4gICAgfVxyXG4gICAgaWYgKCFfcmVzb3VyY2VGaWxlc1twYXRoXSkge1xyXG4gICAgICAgIF9jaGVja1BhdGgocGF0aCwgJ3Jlc291cmNlIGZpbGUgcGF0aCcpO1xyXG4gICAgICAgIF9yZXNvdXJjZUZpbGVzW3BhdGhdID0gcGF0aDtcclxuICAgICAgICBfZGVidWcoJ2FkZGluZyByZXNvdXJjZSBmaWxlOiAnICsgcGF0aCk7XHJcbiAgICAgICAgX3Jlc291cmNlQ3VsdHVyZSA9IF9nZXRWYXJpYWJsZSgnc3lzdGVtLmN1bHR1cmUnKSB8fCBfcmVzb3VyY2VDdWx0dXJlO1xyXG4gICAgICAgIHZhciBsb2NTdHJzID0gX2xvYWRMb2NTdHJpbmdzKHBhdGgsIF9yZXNvdXJjZUN1bHR1cmUpO1xyXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBsb2NTdHJzKSB7XHJcbiAgICAgICAgICAgIC8vY2FjaGUgbG9jIHN0cmluZ1xyXG4gICAgICAgICAgICBfbG9jU3RyaW5nQ2FjaGVba2V5XSA9IGxvY1N0cnNba2V5XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBfd2FybmluZyhfbG9jKCdMSUJfUmVzb3VyY2VGaWxlQWxyZWFkeVNldCcsIHBhdGgpKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLl9zZXRSZXNvdXJjZVBhdGggPSBfc2V0UmVzb3VyY2VQYXRoO1xyXG4vKipcclxuICogR2V0cyB0aGUgbG9jYWxpemVkIHN0cmluZyBmcm9tIHRoZSBqc29uIHJlc291cmNlIGZpbGUuICBPcHRpb25hbGx5IGZvcm1hdHMgd2l0aCBhZGRpdGlvbmFsIHBhcmFtcy5cclxuICpcclxuICogQHBhcmFtICAgICBrZXkgICAgICBrZXkgb2YgdGhlIHJlc291cmNlcyBzdHJpbmcgaW4gdGhlIHJlc291cmNlIGZpbGVcclxuICogQHBhcmFtICAgICBwYXJhbSAgICBhZGRpdGlvbmFsIHBhcmFtcyBmb3IgZm9ybWF0dGluZyB0aGUgc3RyaW5nXHJcbiAqIEByZXR1cm5zICAgc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfbG9jKGtleSkge1xyXG4gICAgdmFyIHBhcmFtID0gW107XHJcbiAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIHBhcmFtW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgfVxyXG4gICAgaWYgKCFfbGliUmVzb3VyY2VGaWxlTG9hZGVkKSB7XHJcbiAgICAgICAgLy8gbWVyZ2UgbG9jIHN0cmluZ3MgZnJvbSBhenVyZS1waXBlbGluZXMtdGFzay1saWIuXHJcbiAgICAgICAgdmFyIGxpYlJlc291cmNlRmlsZSA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdsaWIuanNvbicpO1xyXG4gICAgICAgIHZhciBsaWJMb2NTdHJzID0gX2xvYWRMb2NTdHJpbmdzKGxpYlJlc291cmNlRmlsZSwgX3Jlc291cmNlQ3VsdHVyZSk7XHJcbiAgICAgICAgZm9yICh2YXIgbGliS2V5IGluIGxpYkxvY1N0cnMpIHtcclxuICAgICAgICAgICAgLy9jYWNoZSBhenVyZS1waXBlbGluZXMtdGFzay1saWIgbG9jIHN0cmluZ1xyXG4gICAgICAgICAgICBfbG9jU3RyaW5nQ2FjaGVbbGliS2V5XSA9IGxpYkxvY1N0cnNbbGliS2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgX2xpYlJlc291cmNlRmlsZUxvYWRlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgbG9jU3RyaW5nO1xyXG4gICAgO1xyXG4gICAgaWYgKF9sb2NTdHJpbmdDYWNoZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgbG9jU3RyaW5nID0gX2xvY1N0cmluZ0NhY2hlW2tleV07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMoX3Jlc291cmNlRmlsZXMpLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIF93YXJuaW5nKF9sb2MoJ0xJQl9SZXNvdXJjZUZpbGVOb3RTZXQnLCBrZXkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIF93YXJuaW5nKF9sb2MoJ0xJQl9Mb2NTdHJpbmdOb3RGb3VuZCcsIGtleSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2NTdHJpbmcgPSBrZXk7XHJcbiAgICB9XHJcbiAgICBpZiAocGFyYW0ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHJldHVybiB1dGlsLmZvcm1hdC5hcHBseSh0aGlzLCBbbG9jU3RyaW5nXS5jb25jYXQocGFyYW0pKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBsb2NTdHJpbmc7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5fbG9jID0gX2xvYztcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBJbnB1dCBIZWxwZXJzXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLyoqXHJcbiAqIEdldHMgYSB2YXJpYWJsZSB2YWx1ZSB0aGF0IGlzIGRlZmluZWQgb24gdGhlIGJ1aWxkL3JlbGVhc2UgZGVmaW5pdGlvbiBvciBzZXQgYXQgcnVudGltZS5cclxuICpcclxuICogQHBhcmFtICAgICBuYW1lICAgICBuYW1lIG9mIHRoZSB2YXJpYWJsZSB0byBnZXRcclxuICogQHJldHVybnMgICBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9nZXRWYXJpYWJsZShuYW1lKSB7XHJcbiAgICB2YXIgdmFydmFsO1xyXG4gICAgLy8gZ2V0IHRoZSBtZXRhZGF0YVxyXG4gICAgdmFyIGluZm87XHJcbiAgICB2YXIga2V5ID0gX2dldFZhcmlhYmxlS2V5KG5hbWUpO1xyXG4gICAgaWYgKGV4cG9ydHMuX2tub3duVmFyaWFibGVNYXAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgIGluZm8gPSBleHBvcnRzLl9rbm93blZhcmlhYmxlTWFwW2tleV07XHJcbiAgICB9XHJcbiAgICBpZiAoaW5mbyAmJiBpbmZvLnNlY3JldCkge1xyXG4gICAgICAgIC8vIGdldCB0aGUgc2VjcmV0IHZhbHVlXHJcbiAgICAgICAgdmFydmFsID0gZXhwb3J0cy5fdmF1bHQucmV0cmlldmVTZWNyZXQoJ1NFQ1JFVF8nICsga2V5KTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIGdldCB0aGUgcHVibGljIHZhbHVlXHJcbiAgICAgICAgdmFydmFsID0gcHJvY2Vzcy5lbnZba2V5XTtcclxuICAgICAgICAvLyBmYWxsYmFjayBmb3IgcHJlIDIuMTA0LjEgYWdlbnRcclxuICAgICAgICBpZiAoIXZhcnZhbCAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT0gJ0FHRU5ULkpPQlNUQVRVUycpIHtcclxuICAgICAgICAgICAgdmFydmFsID0gcHJvY2Vzcy5lbnZbJ2FnZW50LmpvYnN0YXR1cyddO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIF9kZWJ1ZyhuYW1lICsgJz0nICsgdmFydmFsKTtcclxuICAgIHJldHVybiB2YXJ2YWw7XHJcbn1cclxuZXhwb3J0cy5fZ2V0VmFyaWFibGUgPSBfZ2V0VmFyaWFibGU7XHJcbmZ1bmN0aW9uIF9nZXRWYXJpYWJsZUtleShuYW1lKSB7XHJcbiAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoX2xvYygnTElCX1BhcmFtZXRlcklzUmVxdWlyZWQnLCAnbmFtZScpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuYW1lLnJlcGxhY2UoL1xcLi9nLCAnXycpLnJlcGxhY2UoLyAvZywgJ18nKS50b1VwcGVyQ2FzZSgpO1xyXG59XHJcbmV4cG9ydHMuX2dldFZhcmlhYmxlS2V5ID0gX2dldFZhcmlhYmxlS2V5O1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIENtZCBIZWxwZXJzXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuZnVuY3Rpb24gX2NvbW1hbmQoY29tbWFuZCwgcHJvcGVydGllcywgbWVzc2FnZSkge1xyXG4gICAgdmFyIHRhc2tDbWQgPSBuZXcgdGNtLlRhc2tDb21tYW5kKGNvbW1hbmQsIHByb3BlcnRpZXMsIG1lc3NhZ2UpO1xyXG4gICAgX3dyaXRlTGluZSh0YXNrQ21kLnRvU3RyaW5nKCkpO1xyXG59XHJcbmV4cG9ydHMuX2NvbW1hbmQgPSBfY29tbWFuZDtcclxuZnVuY3Rpb24gX3dhcm5pbmcobWVzc2FnZSkge1xyXG4gICAgX2NvbW1hbmQoJ3Rhc2suaXNzdWUnLCB7ICd0eXBlJzogJ3dhcm5pbmcnIH0sIG1lc3NhZ2UpO1xyXG59XHJcbmV4cG9ydHMuX3dhcm5pbmcgPSBfd2FybmluZztcclxuZnVuY3Rpb24gX2Vycm9yKG1lc3NhZ2UpIHtcclxuICAgIF9jb21tYW5kKCd0YXNrLmlzc3VlJywgeyAndHlwZSc6ICdlcnJvcicgfSwgbWVzc2FnZSk7XHJcbn1cclxuZXhwb3J0cy5fZXJyb3IgPSBfZXJyb3I7XHJcbmZ1bmN0aW9uIF9kZWJ1ZyhtZXNzYWdlKSB7XHJcbiAgICBfY29tbWFuZCgndGFzay5kZWJ1ZycsIG51bGwsIG1lc3NhZ2UpO1xyXG59XHJcbmV4cG9ydHMuX2RlYnVnID0gX2RlYnVnO1xyXG4vLyAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIC8vIERpc2sgRnVuY3Rpb25zXHJcbi8vIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBhIHBhdGggZXhpc3RzLlxyXG4gKlxyXG4gKiBAcGFyYW0gICAgIHBhdGggICAgICBwYXRoIHRvIGNoZWNrXHJcbiAqIEByZXR1cm5zICAgYm9vbGVhblxyXG4gKi9cclxuZnVuY3Rpb24gX2V4aXN0KHBhdGgpIHtcclxuICAgIHZhciBleGlzdCA9IGZhbHNlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBleGlzdCA9ICEhKHBhdGggJiYgZnMuc3RhdFN5bmMocGF0aCkgIT0gbnVsbCk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgaWYgKGVyciAmJiBlcnIuY29kZSA9PT0gJ0VOT0VOVCcpIHtcclxuICAgICAgICAgICAgZXhpc3QgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZXhpc3Q7XHJcbn1cclxuZXhwb3J0cy5fZXhpc3QgPSBfZXhpc3Q7XHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBhIHBhdGggZXhpc3RzLlxyXG4gKiBJZiB0aGUgcGF0aCBkb2VzIG5vdCBleGlzdCwgaXQgd2lsbCB0aHJvdy5cclxuICpcclxuICogQHBhcmFtICAgICBwICAgICAgICAgcGF0aCB0byBjaGVja1xyXG4gKiBAcGFyYW0gICAgIG5hbWUgICAgICBuYW1lIG9ubHkgdXNlZCBpbiBlcnJvciBtZXNzYWdlIHRvIGlkZW50aWZ5IHRoZSBwYXRoXHJcbiAqIEByZXR1cm5zICAgdm9pZFxyXG4gKi9cclxuZnVuY3Rpb24gX2NoZWNrUGF0aChwLCBuYW1lKSB7XHJcbiAgICBfZGVidWcoJ2NoZWNrIHBhdGggOiAnICsgcCk7XHJcbiAgICBpZiAoIV9leGlzdChwKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihfbG9jKCdMSUJfUGF0aE5vdEZvdW5kJywgbmFtZSwgcCkpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuX2NoZWNrUGF0aCA9IF9jaGVja1BhdGg7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHBhdGggb2YgYSB0b29sIGhhZCB0aGUgdG9vbCBhY3R1YWxseSBiZWVuIGludm9rZWQuICBSZXNvbHZlcyB2aWEgcGF0aHMuXHJcbiAqIElmIHlvdSBjaGVjayBhbmQgdGhlIHRvb2wgZG9lcyBub3QgZXhpc3QsIGl0IHdpbGwgdGhyb3cuXHJcbiAqXHJcbiAqIEBwYXJhbSAgICAgdG9vbCAgICAgICBuYW1lIG9mIHRoZSB0b29sXHJcbiAqIEBwYXJhbSAgICAgY2hlY2sgICAgICB3aGV0aGVyIHRvIGNoZWNrIGlmIHRvb2wgZXhpc3RzXHJcbiAqIEByZXR1cm5zICAgc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfd2hpY2godG9vbCwgY2hlY2spIHtcclxuICAgIGlmICghdG9vbCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigncGFyYW1ldGVyIFxcJ3Rvb2xcXCcgaXMgcmVxdWlyZWQnKTtcclxuICAgIH1cclxuICAgIC8vIHJlY3Vyc2l2ZSB3aGVuIGNoZWNrPXRydWVcclxuICAgIGlmIChjaGVjaykge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBfd2hpY2godG9vbCwgZmFsc2UpO1xyXG4gICAgICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09ICd3aW4zMicpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihfbG9jKCdMSUJfV2hpY2hOb3RGb3VuZF9XaW4nLCB0b29sKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoX2xvYygnTElCX1doaWNoTm90Rm91bmRfTGludXgnLCB0b29sKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBfZGVidWcoXCJ3aGljaCAnXCIgKyB0b29sICsgXCInXCIpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBidWlsZCB0aGUgbGlzdCBvZiBleHRlbnNpb25zIHRvIHRyeVxyXG4gICAgICAgIHZhciBleHRlbnNpb25zID0gW107XHJcbiAgICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJyAmJiBwcm9jZXNzLmVudlsnUEFUSEVYVCddKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBwcm9jZXNzLmVudlsnUEFUSEVYVCddLnNwbGl0KHBhdGguZGVsaW1pdGVyKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBleHRlbnNpb24gPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5wdXNoKGV4dGVuc2lvbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYgaXQncyByb290ZWQsIHJldHVybiBpdCBpZiBleGlzdHMuIG90aGVyd2lzZSByZXR1cm4gZW1wdHkuXHJcbiAgICAgICAgaWYgKF9pc1Jvb3RlZCh0b29sKSkge1xyXG4gICAgICAgICAgICB2YXIgZmlsZVBhdGggPSBfdHJ5R2V0RXhlY3V0YWJsZVBhdGgodG9vbCwgZXh0ZW5zaW9ucyk7XHJcbiAgICAgICAgICAgIGlmIChmaWxlUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgX2RlYnVnKFwiZm91bmQ6ICdcIiArIGZpbGVQYXRoICsgXCInXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVQYXRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF9kZWJ1Zygnbm90IGZvdW5kJyk7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYgYW55IHBhdGggc2VwYXJhdG9ycywgcmV0dXJuIGVtcHR5XHJcbiAgICAgICAgaWYgKHRvb2wuaW5kZXhPZignLycpID49IDAgfHwgKHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJyAmJiB0b29sLmluZGV4T2YoJ1xcXFwnKSA+PSAwKSkge1xyXG4gICAgICAgICAgICBfZGVidWcoJ25vdCBmb3VuZCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGJ1aWxkIHRoZSBsaXN0IG9mIGRpcmVjdG9yaWVzXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBOb3RlLCB0ZWNobmljYWxseSBcIndoZXJlXCIgY2hlY2tzIHRoZSBjdXJyZW50IGRpcmVjdG9yeSBvbiBXaW5kb3dzLiBGcm9tIGEgdGFzayBsaWIgcGVyc3BlY3RpdmUsXHJcbiAgICAgICAgLy8gaXQgZmVlbHMgbGlrZSB3ZSBzaG91bGQgbm90IGRvIHRoaXMuIENoZWNraW5nIHRoZSBjdXJyZW50IGRpcmVjdG9yeSBzZWVtcyBsaWtlIG1vcmUgb2YgYSB1c2VcclxuICAgICAgICAvLyBjYXNlIG9mIGEgc2hlbGwsIGFuZCB0aGUgd2hpY2goKSBmdW5jdGlvbiBleHBvc2VkIGJ5IHRoZSB0YXNrIGxpYiBzaG91bGQgc3RyaXZlIGZvciBjb25zaXN0ZW5jeVxyXG4gICAgICAgIC8vIGFjcm9zcyBwbGF0Zm9ybXMuXHJcbiAgICAgICAgdmFyIGRpcmVjdG9yaWVzID0gW107XHJcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52WydQQVRIJ10pIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgX2IgPSAwLCBfYyA9IHByb2Nlc3MuZW52WydQQVRIJ10uc3BsaXQocGF0aC5kZWxpbWl0ZXIpOyBfYiA8IF9jLmxlbmd0aDsgX2IrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHAgPSBfY1tfYl07XHJcbiAgICAgICAgICAgICAgICBpZiAocCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yaWVzLnB1c2gocCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmV0dXJuIHRoZSBmaXJzdCBtYXRjaFxyXG4gICAgICAgIGZvciAodmFyIF9kID0gMCwgZGlyZWN0b3JpZXNfMSA9IGRpcmVjdG9yaWVzOyBfZCA8IGRpcmVjdG9yaWVzXzEubGVuZ3RoOyBfZCsrKSB7XHJcbiAgICAgICAgICAgIHZhciBkaXJlY3RvcnkgPSBkaXJlY3Rvcmllc18xW19kXTtcclxuICAgICAgICAgICAgdmFyIGZpbGVQYXRoID0gX3RyeUdldEV4ZWN1dGFibGVQYXRoKGRpcmVjdG9yeSArIHBhdGguc2VwICsgdG9vbCwgZXh0ZW5zaW9ucyk7XHJcbiAgICAgICAgICAgIGlmIChmaWxlUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgX2RlYnVnKFwiZm91bmQ6ICdcIiArIGZpbGVQYXRoICsgXCInXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVQYXRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIF9kZWJ1Zygnbm90IGZvdW5kJyk7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihfbG9jKCdMSUJfT3BlcmF0aW9uRmFpbGVkJywgJ3doaWNoJywgZXJyLm1lc3NhZ2UpKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLl93aGljaCA9IF93aGljaDtcclxuLyoqXHJcbiAqIEJlc3QgZWZmb3J0IGF0dGVtcHQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBmaWxlIGV4aXN0cyBhbmQgaXMgZXhlY3V0YWJsZS5cclxuICogQHBhcmFtIGZpbGVQYXRoICAgIGZpbGUgcGF0aCB0byBjaGVja1xyXG4gKiBAcGFyYW0gZXh0ZW5zaW9ucyAgYWRkaXRpb25hbCBmaWxlIGV4dGVuc2lvbnMgdG8gdHJ5XHJcbiAqIEByZXR1cm4gaWYgZmlsZSBleGlzdHMgYW5kIGlzIGV4ZWN1dGFibGUsIHJldHVybnMgdGhlIGZpbGUgcGF0aC4gb3RoZXJ3aXNlIGVtcHR5IHN0cmluZy5cclxuICovXHJcbmZ1bmN0aW9uIF90cnlHZXRFeGVjdXRhYmxlUGF0aChmaWxlUGF0aCwgZXh0ZW5zaW9ucykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyB0ZXN0IGZpbGUgZXhpc3RzXHJcbiAgICAgICAgdmFyIHN0YXRzID0gZnMuc3RhdFN5bmMoZmlsZVBhdGgpO1xyXG4gICAgICAgIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xyXG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBvbiBXaW5kb3dzLCB0ZXN0IGZvciB2YWxpZCBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgIHZhciBpc0V4ZWN1dGFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHZhciBmaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRvdEluZGV4ID0gZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKTtcclxuICAgICAgICAgICAgICAgIGlmIChkb3RJbmRleCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVwcGVyRXh0XzEgPSBmaWxlTmFtZS5zdWJzdHIoZG90SW5kZXgpLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuc29tZShmdW5jdGlvbiAodmFsaWRFeHQpIHsgcmV0dXJuIHZhbGlkRXh0LnRvVXBwZXJDYXNlKCkgPT0gdXBwZXJFeHRfMTsgfSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVQYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc1VuaXhFeGVjdXRhYmxlKHN0YXRzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWxlUGF0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICBpZiAoZXJyLmNvZGUgIT0gJ0VOT0VOVCcpIHtcclxuICAgICAgICAgICAgX2RlYnVnKFwiVW5leHBlY3RlZCBlcnJvciBhdHRlbXB0aW5nIHRvIGRldGVybWluZSBpZiBleGVjdXRhYmxlIGZpbGUgZXhpc3RzICdcIiArIGZpbGVQYXRoICsgXCInOiBcIiArIGVycik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gdHJ5IGVhY2ggZXh0ZW5zaW9uXHJcbiAgICB2YXIgb3JpZ2luYWxGaWxlUGF0aCA9IGZpbGVQYXRoO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwLCBleHRlbnNpb25zXzEgPSBleHRlbnNpb25zOyBfaSA8IGV4dGVuc2lvbnNfMS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICB2YXIgZXh0ZW5zaW9uID0gZXh0ZW5zaW9uc18xW19pXTtcclxuICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICB2YXIgZmlsZVBhdGhfMSA9IG9yaWdpbmFsRmlsZVBhdGggKyBleHRlbnNpb247XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIHN0YXRzID0gZnMuc3RhdFN5bmMoZmlsZVBhdGhfMSk7XHJcbiAgICAgICAgICAgIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHByZXNlcnZlIHRoZSBjYXNlIG9mIHRoZSBhY3R1YWwgZmlsZSAoc2luY2UgYW4gZXh0ZW5zaW9uIHdhcyBhcHBlbmRlZClcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlyZWN0b3J5ID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoXzEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdXBwZXJOYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlUGF0aF8xKS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYSA9IDAsIF9iID0gZnMucmVhZGRpclN5bmMoZGlyZWN0b3J5KTsgX2EgPCBfYi5sZW5ndGg7IF9hKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY3R1YWxOYW1lID0gX2JbX2FdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwcGVyTmFtZSA9PSBhY3R1YWxOYW1lLnRvVXBwZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aF8xID0gcGF0aC5qb2luKGRpcmVjdG9yeSwgYWN0dWFsTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfZGVidWcoXCJVbmV4cGVjdGVkIGVycm9yIGF0dGVtcHRpbmcgdG8gZGV0ZXJtaW5lIHRoZSBhY3R1YWwgY2FzZSBvZiB0aGUgZmlsZSAnXCIgKyBmaWxlUGF0aF8xICsgXCInOiBcIiArIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWxlUGF0aF8xO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzVW5peEV4ZWN1dGFibGUoc3RhdHMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWxlUGF0aF8xO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIGlmIChlcnIuY29kZSAhPSAnRU5PRU5UJykge1xyXG4gICAgICAgICAgICAgICAgX2RlYnVnKFwiVW5leHBlY3RlZCBlcnJvciBhdHRlbXB0aW5nIHRvIGRldGVybWluZSBpZiBleGVjdXRhYmxlIGZpbGUgZXhpc3RzICdcIiArIGZpbGVQYXRoXzEgKyBcIic6IFwiICsgZXJyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAnJztcclxufVxyXG4vLyBvbiBNYWMvTGludXgsIHRlc3QgdGhlIGV4ZWN1dGUgYml0XHJcbi8vICAgICBSICAgVyAgWCAgUiAgVyBYIFIgVyBYXHJcbi8vICAgMjU2IDEyOCA2NCAzMiAxNiA4IDQgMiAxXHJcbmZ1bmN0aW9uIGlzVW5peEV4ZWN1dGFibGUoc3RhdHMpIHtcclxuICAgIHJldHVybiAoc3RhdHMubW9kZSAmIDEpID4gMCB8fCAoKHN0YXRzLm1vZGUgJiA4KSA+IDAgJiYgc3RhdHMuZ2lkID09PSBwcm9jZXNzLmdldGdpZCgpKSB8fCAoKHN0YXRzLm1vZGUgJiA2NCkgPiAwICYmIHN0YXRzLnVpZCA9PT0gcHJvY2Vzcy5nZXR1aWQoKSk7XHJcbn1cclxuZnVuY3Rpb24gX2xlZ2FjeUZpbmRGaWxlc19jb252ZXJ0UGF0dGVyblRvUmVnRXhwKHBhdHRlcm4pIHtcclxuICAgIHBhdHRlcm4gPSAocHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInID8gcGF0dGVybi5yZXBsYWNlKC9cXFxcL2csICcvJykgOiBwYXR0ZXJuKSAvLyBub3JtYWxpemUgc2VwYXJhdG9yIG9uIFdpbmRvd3NcclxuICAgICAgICAucmVwbGFjZSgvWy1cXC9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCAnXFxcXCQmJykgLy8gcmVnZXggZXNjYXBlIC0gZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM1NjE0OTMvaXMtdGhlcmUtYS1yZWdleHAtZXNjYXBlLWZ1bmN0aW9uLWluLWphdmFzY3JpcHRcclxuICAgICAgICAucmVwbGFjZSgvXFxcXFxcL1xcXFxcXCpcXFxcXFwqXFxcXFxcLy9nLCAnKChcXC8uKy8pfChcXC8pKScpIC8vIHJlcGxhY2UgZGlyZWN0b3J5IGdsb2JzdGFyLCBlLmcuIC9oZWxsby8qKi93b3JsZFxyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcXFwqXFxcXFxcKi9nLCAnLionKSAvLyByZXBsYWNlIHJlbWFpbmluZyBnbG9ic3RhcnMgd2l0aCBhIHdpbGRjYXJkIHRoYXQgY2FuIHNwYW4gZGlyZWN0b3J5IHNlcGFyYXRvcnMsIGUuZy4gL2hlbGxvLyoqZGxsXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXFxcXCovZywgJ1teXFwvXSonKSAvLyByZXBsYWNlIGFzdGVyaXNrcyB3aXRoIGEgd2lsZGNhcmQgdGhhdCBjYW5ub3Qgc3BhbiBkaXJlY3Rvcnkgc2VwYXJhdG9ycywgZS5nLiAvaGVsbG8vKi5kbGxcclxuICAgICAgICAucmVwbGFjZSgvXFxcXFxcPy9nLCAnW15cXC9dJyk7IC8vIHJlcGxhY2Ugc2luZ2xlIGNoYXJhY3RlciB3aWxkY2FyZHMsIGUuZy4gL2hlbGxvL2xvZz8uZGxsXHJcbiAgICBwYXR0ZXJuID0gXCJeXCIgKyBwYXR0ZXJuICsgXCIkXCI7XHJcbiAgICB2YXIgZmxhZ3MgPSBwcm9jZXNzLnBsYXRmb3JtID09ICd3aW4zMicgPyAnaScgOiAnJztcclxuICAgIHJldHVybiBuZXcgUmVnRXhwKHBhdHRlcm4sIGZsYWdzKTtcclxufVxyXG5leHBvcnRzLl9sZWdhY3lGaW5kRmlsZXNfY29udmVydFBhdHRlcm5Ub1JlZ0V4cCA9IF9sZWdhY3lGaW5kRmlsZXNfY29udmVydFBhdHRlcm5Ub1JlZ0V4cDtcclxuZnVuY3Rpb24gX2Nsb25lTWF0Y2hPcHRpb25zKG1hdGNoT3B0aW9ucykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBkZWJ1ZzogbWF0Y2hPcHRpb25zLmRlYnVnLFxyXG4gICAgICAgIG5vYnJhY2U6IG1hdGNoT3B0aW9ucy5ub2JyYWNlLFxyXG4gICAgICAgIG5vZ2xvYnN0YXI6IG1hdGNoT3B0aW9ucy5ub2dsb2JzdGFyLFxyXG4gICAgICAgIGRvdDogbWF0Y2hPcHRpb25zLmRvdCxcclxuICAgICAgICBub2V4dDogbWF0Y2hPcHRpb25zLm5vZXh0LFxyXG4gICAgICAgIG5vY2FzZTogbWF0Y2hPcHRpb25zLm5vY2FzZSxcclxuICAgICAgICBub251bGw6IG1hdGNoT3B0aW9ucy5ub251bGwsXHJcbiAgICAgICAgbWF0Y2hCYXNlOiBtYXRjaE9wdGlvbnMubWF0Y2hCYXNlLFxyXG4gICAgICAgIG5vY29tbWVudDogbWF0Y2hPcHRpb25zLm5vY29tbWVudCxcclxuICAgICAgICBub25lZ2F0ZTogbWF0Y2hPcHRpb25zLm5vbmVnYXRlLFxyXG4gICAgICAgIGZsaXBOZWdhdGU6IG1hdGNoT3B0aW9ucy5mbGlwTmVnYXRlXHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydHMuX2Nsb25lTWF0Y2hPcHRpb25zID0gX2Nsb25lTWF0Y2hPcHRpb25zO1xyXG5mdW5jdGlvbiBfZ2V0RmluZEluZm9Gcm9tUGF0dGVybihkZWZhdWx0Um9vdCwgcGF0dGVybiwgbWF0Y2hPcHRpb25zKSB7XHJcbiAgICAvLyBwYXJhbWV0ZXIgdmFsaWRhdGlvblxyXG4gICAgaWYgKCFkZWZhdWx0Um9vdCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0RmluZFJvb3RGcm9tUGF0dGVybigpIHBhcmFtZXRlciBkZWZhdWx0Um9vdCBjYW5ub3QgYmUgZW1wdHknKTtcclxuICAgIH1cclxuICAgIGlmICghcGF0dGVybikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0RmluZFJvb3RGcm9tUGF0dGVybigpIHBhcmFtZXRlciBwYXR0ZXJuIGNhbm5vdCBiZSBlbXB0eScpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFtYXRjaE9wdGlvbnMubm9icmFjZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0RmluZFJvb3RGcm9tUGF0dGVybigpIGV4cGVjdGVkIG1hdGNoT3B0aW9ucy5ub2JyYWNlIHRvIGJlIHRydWUnKTtcclxuICAgIH1cclxuICAgIC8vIGZvciB0aGUgc2FrZSBvZiBkZXRlcm1pbmluZyB0aGUgZmluZFBhdGgsIHByZXRlbmQgbm9jYXNlPWZhbHNlXHJcbiAgICBtYXRjaE9wdGlvbnMgPSBfY2xvbmVNYXRjaE9wdGlvbnMobWF0Y2hPcHRpb25zKTtcclxuICAgIG1hdGNoT3B0aW9ucy5ub2Nhc2UgPSBmYWxzZTtcclxuICAgIC8vIGNoZWNrIGlmIGJhc2VuYW1lIG9ubHkgYW5kIG1hdGNoQmFzZT10cnVlXHJcbiAgICBpZiAobWF0Y2hPcHRpb25zLm1hdGNoQmFzZSAmJlxyXG4gICAgICAgICFfaXNSb290ZWQocGF0dGVybikgJiZcclxuICAgICAgICAocHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInID8gcGF0dGVybi5yZXBsYWNlKC9cXFxcL2csICcvJykgOiBwYXR0ZXJuKS5pbmRleE9mKCcvJykgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYWRqdXN0ZWRQYXR0ZXJuOiBwYXR0ZXJuLFxyXG4gICAgICAgICAgICBmaW5kUGF0aDogZGVmYXVsdFJvb3QsXHJcbiAgICAgICAgICAgIHN0YXRPbmx5OiBmYWxzZSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgLy8gdGhlIHRlY2huaXF1ZSBhcHBsaWVkIGJ5IHRoaXMgZnVuY3Rpb24gaXMgdG8gdXNlIHRoZSBpbmZvcm1hdGlvbiBvbiB0aGUgTWluaW1hdGNoIG9iamVjdCBkZXRlcm1pbmVcclxuICAgIC8vIHRoZSBmaW5kUGF0aC4gTWluaW1hdGNoIGJyZWFrcyB0aGUgcGF0dGVybiBpbnRvIHBhdGggc2VnbWVudHMsIGFuZCBleHBvc2VzIGluZm9ybWF0aW9uIGFib3V0IHdoaWNoXHJcbiAgICAvLyBzZWdtZW50cyBhcmUgbGl0ZXJhbCB2cyBwYXR0ZXJucy5cclxuICAgIC8vXHJcbiAgICAvLyBub3RlLCB0aGUgdGVjaG5pcXVlIGN1cnJlbnRseSBpbXBvc2VzIGEgbGltaXRhdGlvbiBmb3IgZHJpdmUtcmVsYXRpdmUgcGF0aHMgd2l0aCBhIGdsb2IgaW4gdGhlXHJcbiAgICAvLyBmaXJzdCBzZWdtZW50LCBlLmcuIEM6aGVsbG8qL3dvcmxkLiBpdCdzIGZlYXNpYmxlIHRvIG92ZXJjb21lIHRoaXMgbGltaXRhdGlvbiwgYnV0IGlzIGxlZnQgdW5zb2x2ZWRcclxuICAgIC8vIGZvciBub3cuXHJcbiAgICB2YXIgbWluaW1hdGNoT2JqID0gbmV3IG1pbmltYXRjaC5NaW5pbWF0Y2gocGF0dGVybiwgbWF0Y2hPcHRpb25zKTtcclxuICAgIC8vIHRoZSBcInNldFwiIHByb3BlcnR5IGlzIGFuIGFycmF5IG9mIGFycmF5cyBvZiBwYXJzZWQgcGF0aCBzZWdtZW50IGluZm8uIHRoZSBvdXRlciBhcnJheSBzaG91bGQgb25seVxyXG4gICAgLy8gY29udGFpbiBvbmUgaXRlbSwgb3RoZXJ3aXNlIHNvbWV0aGluZyB3ZW50IHdyb25nLiBicmFjZSBleHBhbnNpb24gY2FuIHJlc3VsdCBpbiBtdWx0aXBsZSBhcnJheXMsXHJcbiAgICAvLyBidXQgdGhhdCBzaG91bGQgYmUgdHVybmVkIG9mZiBieSB0aGUgdGltZSB0aGlzIGZ1bmN0aW9uIGlzIHJlYWNoZWQuXHJcbiAgICBpZiAobWluaW1hdGNoT2JqLnNldC5sZW5ndGggIT0gMSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0RmluZFJvb3RGcm9tUGF0dGVybigpIGV4cGVjdGVkIE1pbmltYXRjaCguLi4pLnNldC5sZW5ndGggdG8gYmUgMS4gQWN0dWFsOiAnICsgbWluaW1hdGNoT2JqLnNldC5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgdmFyIGxpdGVyYWxTZWdtZW50cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IG1pbmltYXRjaE9iai5zZXRbMF07IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgdmFyIHBhcnNlZFNlZ21lbnQgPSBfYVtfaV07XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJzZWRTZWdtZW50ID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIC8vIHRoZSBpdGVtIGlzIGEgc3RyaW5nIHdoZW4gdGhlIG9yaWdpbmFsIGlucHV0IGZvciB0aGUgcGF0aCBzZWdtZW50IGRvZXMgbm90IGNvbnRhaW4gYW55XHJcbiAgICAgICAgICAgIC8vIHVuZXNjYXBlZCBnbG9iIGNoYXJhY3RlcnMuXHJcbiAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgIC8vIG5vdGUsIHRoZSBzdHJpbmcgaGVyZSBpcyBhbHJlYWR5IHVuZXNjYXBlZCAoaS5lLiBnbG9iIGVzY2FwaW5nIHJlbW92ZWQpLCBzbyBpdCBpcyByZWFkeVxyXG4gICAgICAgICAgICAvLyB0byBwYXNzIHRvIGZpbmQoKSBhcy1pcy4gZm9yIGV4YW1wbGUsIGFuIGlucHV0IHN0cmluZyAnaGVsbG9cXFxcKndvcmxkJyA9PiAnaGVsbG8qd29ybGQnLlxyXG4gICAgICAgICAgICBsaXRlcmFsU2VnbWVudHMucHVzaChwYXJzZWRTZWdtZW50KTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgLy8gam9pbiB0aGUgbGl0ZXJhbCBzZWdtZW50cyBiYWNrIHRvZ2V0aGVyLiBNaW5pbWF0Y2ggY29udmVydHMgJ1xcJyB0byAnLycgb24gV2luZG93cywgdGhlbiBzcXVhc2hlc1xyXG4gICAgLy8gY29uc2VxdWV0aXZlIHNsYXNoZXMsIGFuZCBmaW5hbGx5IHNwbGl0cyBvbiBzbGFzaC4gdGhpcyBtZWFucyB0aGF0IFVOQyBmb3JtYXQgaXMgbG9zdCwgYnV0IGNhblxyXG4gICAgLy8gYmUgZGV0ZWN0ZWQgZnJvbSB0aGUgb3JpZ2luYWwgcGF0dGVybi5cclxuICAgIHZhciBqb2luZWRTZWdtZW50cyA9IGxpdGVyYWxTZWdtZW50cy5qb2luKCcvJyk7XHJcbiAgICBpZiAoam9pbmVkU2VnbWVudHMgJiYgcHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInICYmIF9zdGFydHNXaXRoKHBhdHRlcm4ucmVwbGFjZSgvXFxcXC9nLCAnLycpLCAnLy8nKSkge1xyXG4gICAgICAgIGpvaW5lZFNlZ21lbnRzID0gJy8nICsgam9pbmVkU2VnbWVudHM7IC8vIHJlc3RvcmUgVU5DIGZvcm1hdFxyXG4gICAgfVxyXG4gICAgLy8gZGV0ZXJtaW5lIHRoZSBmaW5kIHBhdGhcclxuICAgIHZhciBmaW5kUGF0aDtcclxuICAgIGlmIChfaXNSb290ZWQocGF0dGVybikpIHsgLy8gdGhlIHBhdHRlcm4gd2FzIHJvb3RlZFxyXG4gICAgICAgIGZpbmRQYXRoID0gam9pbmVkU2VnbWVudHM7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChqb2luZWRTZWdtZW50cykgeyAvLyB0aGUgcGF0dGVybiB3YXMgbm90IHJvb3RlZCwgYW5kIGxpdGVyYWwgc2VnbWVudHMgd2VyZSBmb3VuZFxyXG4gICAgICAgIGZpbmRQYXRoID0gX2Vuc3VyZVJvb3RlZChkZWZhdWx0Um9vdCwgam9pbmVkU2VnbWVudHMpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7IC8vIHRoZSBwYXR0ZXJuIHdhcyBub3Qgcm9vdGVkLCBhbmQgbm8gbGl0ZXJhbCBzZWdtZW50cyB3ZXJlIGZvdW5kXHJcbiAgICAgICAgZmluZFBhdGggPSBkZWZhdWx0Um9vdDtcclxuICAgIH1cclxuICAgIC8vIGNsZWFuIHVwIHRoZSBwYXRoXHJcbiAgICBpZiAoZmluZFBhdGgpIHtcclxuICAgICAgICBmaW5kUGF0aCA9IF9nZXREaXJlY3RvcnlOYW1lKF9lbnN1cmVSb290ZWQoZmluZFBhdGgsICdfJykpOyAvLyBoYWNrIHRvIHJlbW92ZSB1bm5lY2Vzc2FyeSB0cmFpbGluZyBzbGFzaFxyXG4gICAgICAgIGZpbmRQYXRoID0gX25vcm1hbGl6ZVNlcGFyYXRvcnMoZmluZFBhdGgpOyAvLyBub3JtYWxpemUgc2xhc2hlc1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBhZGp1c3RlZFBhdHRlcm46IF9lbnN1cmVQYXR0ZXJuUm9vdGVkKGRlZmF1bHRSb290LCBwYXR0ZXJuKSxcclxuICAgICAgICBmaW5kUGF0aDogZmluZFBhdGgsXHJcbiAgICAgICAgc3RhdE9ubHk6IGxpdGVyYWxTZWdtZW50cy5sZW5ndGggPT0gbWluaW1hdGNoT2JqLnNldFswXS5sZW5ndGgsXHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydHMuX2dldEZpbmRJbmZvRnJvbVBhdHRlcm4gPSBfZ2V0RmluZEluZm9Gcm9tUGF0dGVybjtcclxuZnVuY3Rpb24gX2Vuc3VyZVBhdHRlcm5Sb290ZWQocm9vdCwgcCkge1xyXG4gICAgaWYgKCFyb290KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdlbnN1cmVQYXR0ZXJuUm9vdGVkKCkgcGFyYW1ldGVyIFwicm9vdFwiIGNhbm5vdCBiZSBlbXB0eScpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdlbnN1cmVQYXR0ZXJuUm9vdGVkKCkgcGFyYW1ldGVyIFwicFwiIGNhbm5vdCBiZSBlbXB0eScpO1xyXG4gICAgfVxyXG4gICAgaWYgKF9pc1Jvb3RlZChwKSkge1xyXG4gICAgICAgIHJldHVybiBwO1xyXG4gICAgfVxyXG4gICAgLy8gbm9ybWFsaXplIHJvb3RcclxuICAgIHJvb3QgPSBfbm9ybWFsaXplU2VwYXJhdG9ycyhyb290KTtcclxuICAgIC8vIGVzY2FwZSBzcGVjaWFsIGdsb2IgY2hhcmFjdGVyc1xyXG4gICAgcm9vdCA9IChwcm9jZXNzLnBsYXRmb3JtID09ICd3aW4zMicgPyByb290IDogcm9vdC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpKSAvLyBlc2NhcGUgJ1xcJyBvbiBPU1gvTGludXhcclxuICAgICAgICAucmVwbGFjZSgvKFxcWykoPz1bXlxcL10rXFxdKS9nLCAnW1tdJykgLy8gZXNjYXBlICdbJyB3aGVuICddJyBmb2xsb3dzIHdpdGhpbiB0aGUgcGF0aCBzZWdtZW50XHJcbiAgICAgICAgLnJlcGxhY2UoL1xcPy9nLCAnWz9dJykgLy8gZXNjYXBlICc/J1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXCovZywgJ1sqXScpIC8vIGVzY2FwZSAnKidcclxuICAgICAgICAucmVwbGFjZSgvXFwrXFwoL2csICdbK10oJykgLy8gZXNjYXBlICcrKCdcclxuICAgICAgICAucmVwbGFjZSgvQFxcKC9nLCAnW0BdKCcpIC8vIGVzY2FwZSAnQCgnXHJcbiAgICAgICAgLnJlcGxhY2UoLyFcXCgvZywgJ1shXSgnKTsgLy8gZXNjYXBlICchKCdcclxuICAgIHJldHVybiBfZW5zdXJlUm9vdGVkKHJvb3QsIHApO1xyXG59XHJcbmV4cG9ydHMuX2Vuc3VyZVBhdHRlcm5Sb290ZWQgPSBfZW5zdXJlUGF0dGVyblJvb3RlZDtcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFBvcHVsYXRlIHRoZSB2YXVsdCB3aXRoIHNlbnNpdGl2ZSBkYXRhLiAgSW5wdXRzIGFuZCBFbmRwb2ludHNcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIF9sb2FkRGF0YSgpIHtcclxuICAgIC8vIGluIGFnZW50LCBwcmVmZXIgVGVtcERpcmVjdG9yeSB0aGVuIHdvcmtGb2xkZXIuXHJcbiAgICAvLyBJbiBpbnRlcmFjdGl2ZSBkZXYgbW9kZSwgaXQgd29uJ3QgYmVcclxuICAgIHZhciBrZXlQYXRoID0gX2dldFZhcmlhYmxlKFwiYWdlbnQuVGVtcERpcmVjdG9yeVwiKSB8fCBfZ2V0VmFyaWFibGUoXCJhZ2VudC53b3JrRm9sZGVyXCIpIHx8IHByb2Nlc3MuY3dkKCk7XHJcbiAgICBleHBvcnRzLl92YXVsdCA9IG5ldyB2bS5WYXVsdChrZXlQYXRoKTtcclxuICAgIGV4cG9ydHMuX2tub3duVmFyaWFibGVNYXAgPSB7fTtcclxuICAgIF9kZWJ1ZygnbG9hZGluZyBpbnB1dHMgYW5kIGVuZHBvaW50cycpO1xyXG4gICAgdmFyIGxvYWRlZCA9IDA7XHJcbiAgICBmb3IgKHZhciBlbnZ2YXIgaW4gcHJvY2Vzcy5lbnYpIHtcclxuICAgICAgICBpZiAoX3N0YXJ0c1dpdGgoZW52dmFyLCAnSU5QVVRfJykgfHxcclxuICAgICAgICAgICAgX3N0YXJ0c1dpdGgoZW52dmFyLCAnRU5EUE9JTlRfQVVUSF8nKSB8fFxyXG4gICAgICAgICAgICBfc3RhcnRzV2l0aChlbnZ2YXIsICdTRUNVUkVGSUxFX1RJQ0tFVF8nKSB8fFxyXG4gICAgICAgICAgICBfc3RhcnRzV2l0aChlbnZ2YXIsICdTRUNSRVRfJykgfHxcclxuICAgICAgICAgICAgX3N0YXJ0c1dpdGgoZW52dmFyLCAnVlNUU19UQVNLVkFSSUFCTEVfJykpIHtcclxuICAgICAgICAgICAgLy8gUmVjb3JkIHRoZSBzZWNyZXQgdmFyaWFibGUgbWV0YWRhdGEuIFRoaXMgaXMgcmVxdWlyZWQgYnkgZ2V0VmFyaWFibGUgdG8ga25vdyB3aGV0aGVyXHJcbiAgICAgICAgICAgIC8vIHRvIHJldHJpZXZlIHRoZSB2YWx1ZSBmcm9tIHRoZSB2YXVsdC4gSW4gYSAyLjEwNC4xIGFnZW50IG9yIGhpZ2hlciwgdGhpcyBtZXRhZGF0YSB3aWxsXHJcbiAgICAgICAgICAgIC8vIGJlIG92ZXJ3cml0dGVuIHdoZW4gdGhlIFZTVFNfU0VDUkVUX1ZBUklBQkxFUyBlbnYgdmFyIGlzIHByb2Nlc3NlZCBiZWxvdy5cclxuICAgICAgICAgICAgaWYgKF9zdGFydHNXaXRoKGVudnZhciwgJ1NFQ1JFVF8nKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhcmlhYmxlTmFtZSA9IGVudnZhci5zdWJzdHJpbmcoJ1NFQ1JFVF8nLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFyaWFibGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0ZWNobmljYWxseSBub3QgdGhlIHZhcmlhYmxlIG5hbWUgKGhhcyB1bmRlcnNjb3JlcyBpbnN0ZWFkIG9mIGRvdHMpLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1dCBpdCdzIGdvb2QgZW5vdWdoIHRvIG1ha2UgZ2V0VmFyaWFibGUgd29yayBpbiBhIHByZS0yLjEwNC4xIGFnZW50IHdoZXJlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIFZTVFNfU0VDUkVUX1ZBUklBQkxFUyBlbnYgdmFyIGlzIG5vdCBkZWZpbmVkLlxyXG4gICAgICAgICAgICAgICAgICAgIGV4cG9ydHMuX2tub3duVmFyaWFibGVNYXBbX2dldFZhcmlhYmxlS2V5KHZhcmlhYmxlTmFtZSldID0geyBuYW1lOiB2YXJpYWJsZU5hbWUsIHNlY3JldDogdHJ1ZSB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBzZWNyZXRcclxuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52W2VudnZhcl0pIHtcclxuICAgICAgICAgICAgICAgICsrbG9hZGVkO1xyXG4gICAgICAgICAgICAgICAgX2RlYnVnKCdsb2FkaW5nICcgKyBlbnZ2YXIpO1xyXG4gICAgICAgICAgICAgICAgZXhwb3J0cy5fdmF1bHQuc3RvcmVTZWNyZXQoZW52dmFyLCBwcm9jZXNzLmVudltlbnZ2YXJdKTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBwcm9jZXNzLmVudltlbnZ2YXJdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgX2RlYnVnKCdsb2FkZWQgJyArIGxvYWRlZCk7XHJcbiAgICAvLyBzdG9yZSBwdWJsaWMgdmFyaWFibGUgbWV0YWRhdGFcclxuICAgIHZhciBuYW1lcztcclxuICAgIHRyeSB7XHJcbiAgICAgICAgbmFtZXMgPSBKU09OLnBhcnNlKHByb2Nlc3MuZW52WydWU1RTX1BVQkxJQ19WQVJJQUJMRVMnXSB8fCAnW10nKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBwYXJzZSBWU1RTX1BVQkxJQ19WQVJJQUJMRVMgYXMgSlNPTi4gJyArIGVycik7IC8vIG1heSBvY2N1ciBkdXJpbmcgaW50ZXJhY3RpdmUgdGVzdGluZ1xyXG4gICAgfVxyXG4gICAgbmFtZXMuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIGV4cG9ydHMuX2tub3duVmFyaWFibGVNYXBbX2dldFZhcmlhYmxlS2V5KG5hbWUpXSA9IHsgbmFtZTogbmFtZSwgc2VjcmV0OiBmYWxzZSB9O1xyXG4gICAgfSk7XHJcbiAgICBkZWxldGUgcHJvY2Vzcy5lbnZbJ1ZTVFNfUFVCTElDX1ZBUklBQkxFUyddO1xyXG4gICAgLy8gc3RvcmUgc2VjcmV0IHZhcmlhYmxlIG1ldGFkYXRhXHJcbiAgICB0cnkge1xyXG4gICAgICAgIG5hbWVzID0gSlNPTi5wYXJzZShwcm9jZXNzLmVudlsnVlNUU19TRUNSRVRfVkFSSUFCTEVTJ10gfHwgJ1tdJyk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gcGFyc2UgVlNUU19TRUNSRVRfVkFSSUFCTEVTIGFzIEpTT04uICcgKyBlcnIpOyAvLyBtYXkgb2NjdXIgZHVyaW5nIGludGVyYWN0aXZlIHRlc3RpbmdcclxuICAgIH1cclxuICAgIG5hbWVzLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICBleHBvcnRzLl9rbm93blZhcmlhYmxlTWFwW19nZXRWYXJpYWJsZUtleShuYW1lKV0gPSB7IG5hbWU6IG5hbWUsIHNlY3JldDogdHJ1ZSB9O1xyXG4gICAgfSk7XHJcbiAgICBkZWxldGUgcHJvY2Vzcy5lbnZbJ1ZTVFNfU0VDUkVUX1ZBUklBQkxFUyddO1xyXG4gICAgLy8gYXZvaWQgbG9hZGluZyB0d2ljZSAob3ZlcndyaXRlcyAudGFza2tleSlcclxuICAgIGdsb2JhbFsnX3ZzdHNfdGFza19saWJfbG9hZGVkJ10gPSB0cnVlO1xyXG59XHJcbmV4cG9ydHMuX2xvYWREYXRhID0gX2xvYWREYXRhO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIEludGVybmFsIHBhdGggaGVscGVycy5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5mdW5jdGlvbiBfZW5zdXJlUm9vdGVkKHJvb3QsIHApIHtcclxuICAgIGlmICghcm9vdCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZW5zdXJlUm9vdGVkKCkgcGFyYW1ldGVyIFwicm9vdFwiIGNhbm5vdCBiZSBlbXB0eScpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdlbnN1cmVSb290ZWQoKSBwYXJhbWV0ZXIgXCJwXCIgY2Fubm90IGJlIGVtcHR5Jyk7XHJcbiAgICB9XHJcbiAgICBpZiAoX2lzUm9vdGVkKHApKSB7XHJcbiAgICAgICAgcmV0dXJuIHA7XHJcbiAgICB9XHJcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInICYmIHJvb3QubWF0Y2goL15bQS1aXTokL2kpKSB7IC8vIGUuZy4gQzpcclxuICAgICAgICByZXR1cm4gcm9vdCArIHA7XHJcbiAgICB9XHJcbiAgICAvLyBlbnN1cmUgcm9vdCBlbmRzIHdpdGggYSBzZXBhcmF0b3JcclxuICAgIGlmIChfZW5kc1dpdGgocm9vdCwgJy8nKSB8fCAocHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInICYmIF9lbmRzV2l0aChyb290LCAnXFxcXCcpKSkge1xyXG4gICAgICAgIC8vIHJvb3QgYWxyZWFkeSBlbmRzIHdpdGggYSBzZXBhcmF0b3JcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJvb3QgKz0gcGF0aC5zZXA7IC8vIGFwcGVuZCBzZXBhcmF0b3JcclxuICAgIH1cclxuICAgIHJldHVybiByb290ICsgcDtcclxufVxyXG5leHBvcnRzLl9lbnN1cmVSb290ZWQgPSBfZW5zdXJlUm9vdGVkO1xyXG4vKipcclxuICogRGV0ZXJtaW5lcyB0aGUgcGFyZW50IHBhdGggYW5kIHRyaW1zIHRyYWlsaW5nIHNsYXNoZXMgKHdoZW4gc2FmZSkuIFBhdGggc2VwYXJhdG9ycyBhcmUgbm9ybWFsaXplZFxyXG4gKiBpbiB0aGUgcmVzdWx0LiBUaGlzIGZ1bmN0aW9uIHdvcmtzIHNpbWlsYXIgdG8gdGhlIC5ORVQgU3lzdGVtLklPLlBhdGguR2V0RGlyZWN0b3J5TmFtZSgpIG1ldGhvZC5cclxuICogRm9yIGV4YW1wbGUsIEM6XFxoZWxsb1xcd29ybGRcXCByZXR1cm5zIEM6XFxoZWxsb1xcd29ybGQgKHRyYWlsaW5nIHNsYXNoIHJlbW92ZWQpLiBSZXR1cm5zIGVtcHR5IHdoZW5cclxuICogbm8gaGlnaGVyIGRpcmVjdG9yeSBjYW4gYmUgZGV0ZXJtaW5lZC5cclxuICovXHJcbmZ1bmN0aW9uIF9nZXREaXJlY3RvcnlOYW1lKHApIHtcclxuICAgIC8vIHNob3J0LWNpcmN1aXQgaWYgZW1wdHlcclxuICAgIGlmICghcCkge1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuICAgIC8vIG5vcm1hbGl6ZSBzZXBhcmF0b3JzXHJcbiAgICBwID0gX25vcm1hbGl6ZVNlcGFyYXRvcnMocCk7XHJcbiAgICAvLyBvbiBXaW5kb3dzLCB0aGUgZ29hbCBvZiB0aGlzIGZ1bmN0aW9uIGlzIHRvIG1hdGNoIHRoZSBiZWhhdmlvciBvZlxyXG4gICAgLy8gW1N5c3RlbS5JTy5QYXRoXTo6R2V0RGlyZWN0b3J5TmFtZSgpLCBlLmcuXHJcbiAgICAvLyAgICAgIEM6LyAgICAgICAgICAgICA9PlxyXG4gICAgLy8gICAgICBDOi9oZWxsbyAgICAgICAgPT4gQzpcXFxyXG4gICAgLy8gICAgICBDOi9oZWxsby8gICAgICAgPT4gQzpcXGhlbGxvXHJcbiAgICAvLyAgICAgIEM6L2hlbGxvL3dvcmxkICA9PiBDOlxcaGVsbG9cclxuICAgIC8vICAgICAgQzovaGVsbG8vd29ybGQvID0+IEM6XFxoZWxsb1xcd29ybGRcclxuICAgIC8vICAgICAgQzogICAgICAgICAgICAgID0+XHJcbiAgICAvLyAgICAgIEM6aGVsbG8gICAgICAgICA9PiBDOlxyXG4gICAgLy8gICAgICBDOmhlbGxvLyAgICAgICAgPT4gQzpoZWxsb1xyXG4gICAgLy8gICAgICAvICAgICAgICAgICAgICAgPT5cclxuICAgIC8vICAgICAgL2hlbGxvICAgICAgICAgID0+IFxcXHJcbiAgICAvLyAgICAgIC9oZWxsby8gICAgICAgICA9PiBcXGhlbGxvXHJcbiAgICAvLyAgICAgIC8vaGVsbG8gICAgICAgICA9PlxyXG4gICAgLy8gICAgICAvL2hlbGxvLyAgICAgICAgPT5cclxuICAgIC8vICAgICAgLy9oZWxsby93b3JsZCAgID0+XHJcbiAgICAvLyAgICAgIC8vaGVsbG8vd29ybGQvICA9PiBcXFxcaGVsbG9cXHdvcmxkXHJcbiAgICAvL1xyXG4gICAgLy8gdW5mb3J0dW5hdGVseSwgcGF0aC5kaXJuYW1lKCkgY2FuJ3Qgc2ltcGx5IGJlIHVzZWQuIGZvciBleGFtcGxlLCBvbiBXaW5kb3dzXHJcbiAgICAvLyBpdCB5aWVsZHMgZGlmZmVyZW50IHJlc3VsdHMgZnJvbSBQYXRoLkdldERpcmVjdG9yeU5hbWU6XHJcbiAgICAvLyAgICAgIEM6LyAgICAgICAgICAgICA9PiBDOi9cclxuICAgIC8vICAgICAgQzovaGVsbG8gICAgICAgID0+IEM6L1xyXG4gICAgLy8gICAgICBDOi9oZWxsby8gICAgICAgPT4gQzovXHJcbiAgICAvLyAgICAgIEM6L2hlbGxvL3dvcmxkICA9PiBDOi9oZWxsb1xyXG4gICAgLy8gICAgICBDOi9oZWxsby93b3JsZC8gPT4gQzovaGVsbG9cclxuICAgIC8vICAgICAgQzogICAgICAgICAgICAgID0+IEM6XHJcbiAgICAvLyAgICAgIEM6aGVsbG8gICAgICAgICA9PiBDOlxyXG4gICAgLy8gICAgICBDOmhlbGxvLyAgICAgICAgPT4gQzpcclxuICAgIC8vICAgICAgLyAgICAgICAgICAgICAgID0+IC9cclxuICAgIC8vICAgICAgL2hlbGxvICAgICAgICAgID0+IC9cclxuICAgIC8vICAgICAgL2hlbGxvLyAgICAgICAgID0+IC9cclxuICAgIC8vICAgICAgLy9oZWxsbyAgICAgICAgID0+IC9cclxuICAgIC8vICAgICAgLy9oZWxsby8gICAgICAgID0+IC9cclxuICAgIC8vICAgICAgLy9oZWxsby93b3JsZCAgID0+IC8vaGVsbG8vd29ybGRcclxuICAgIC8vICAgICAgLy9oZWxsby93b3JsZC8gID0+IC8vaGVsbG8vd29ybGQvXHJcbiAgICAvLyAgICAgIC8vaGVsbG8vd29ybGQvYWdhaW4gPT4gLy9oZWxsby93b3JsZC9cclxuICAgIC8vICAgICAgLy9oZWxsby93b3JsZC9hZ2Fpbi8gPT4gLy9oZWxsby93b3JsZC9cclxuICAgIC8vICAgICAgLy9oZWxsby93b3JsZC9hZ2Fpbi9hZ2FpbiA9PiAvL2hlbGxvL3dvcmxkL2FnYWluXHJcbiAgICAvLyAgICAgIC8vaGVsbG8vd29ybGQvYWdhaW4vYWdhaW4vID0+IC8vaGVsbG8vd29ybGQvYWdhaW5cclxuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09ICd3aW4zMicpIHtcclxuICAgICAgICBpZiAoL15bQS1aXTpcXFxcP1teXFxcXF0rJC9pLnRlc3QocCkpIHsgLy8gZS5nLiBDOlxcaGVsbG8gb3IgQzpoZWxsb1xyXG4gICAgICAgICAgICByZXR1cm4gcC5jaGFyQXQoMikgPT0gJ1xcXFwnID8gcC5zdWJzdHJpbmcoMCwgMykgOiBwLnN1YnN0cmluZygwLCAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoL15bQS1aXTpcXFxcPyQvaS50ZXN0KHApKSB7IC8vIGUuZy4gQzpcXCBvciBDOlxyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBsYXN0U2xhc2hJbmRleCA9IHAubGFzdEluZGV4T2YoJ1xcXFwnKTtcclxuICAgICAgICBpZiAobGFzdFNsYXNoSW5kZXggPCAwKSB7IC8vIGZpbGUgbmFtZSBvbmx5XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAocCA9PSAnXFxcXCcpIHsgLy8gcmVsYXRpdmUgcm9vdFxyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGxhc3RTbGFzaEluZGV4ID09IDApIHsgLy8gZS5nLiBcXFxcaGVsbG9cclxuICAgICAgICAgICAgcmV0dXJuICdcXFxcJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoL15cXFxcXFxcXFteXFxcXF0rKFxcXFxbXlxcXFxdKik/JC8udGVzdChwKSkgeyAvLyBVTkMgcm9vdCwgZS5nLiBcXFxcaGVsbG8gb3IgXFxcXGhlbGxvXFwgb3IgXFxcXGhlbGxvXFx3b3JsZFxyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwLnN1YnN0cmluZygwLCBsYXN0U2xhc2hJbmRleCk7IC8vIGUuZy4gaGVsbG9cXHdvcmxkID0+IGhlbGxvIG9yIGhlbGxvXFx3b3JsZFxcID0+IGhlbGxvXFx3b3JsZFxyXG4gICAgICAgIC8vIG5vdGUsIHRoaXMgbWVhbnMgdHJhaWxpbmcgc2xhc2hlcyBmb3Igbm9uLXJvb3QgZGlyZWN0b3JpZXNcclxuICAgICAgICAvLyAoaS5lLiBub3QgQzpcXCwgXFwsIG9yIFxcXFx1bmNcXCkgd2lsbCBzaW1wbHkgYmUgcmVtb3ZlZC5cclxuICAgIH1cclxuICAgIC8vIE9TWC9MaW51eFxyXG4gICAgaWYgKHAuaW5kZXhPZignLycpIDwgMCkgeyAvLyBmaWxlIG5hbWUgb25seVxyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHAgPT0gJy8nKSB7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoX2VuZHNXaXRoKHAsICcvJykpIHtcclxuICAgICAgICByZXR1cm4gcC5zdWJzdHJpbmcoMCwgcC5sZW5ndGggLSAxKTtcclxuICAgIH1cclxuICAgIHJldHVybiBwYXRoLmRpcm5hbWUocCk7XHJcbn1cclxuZXhwb3J0cy5fZ2V0RGlyZWN0b3J5TmFtZSA9IF9nZXREaXJlY3RvcnlOYW1lO1xyXG4vKipcclxuICogT24gT1NYL0xpbnV4LCB0cnVlIGlmIHBhdGggc3RhcnRzIHdpdGggJy8nLiBPbiBXaW5kb3dzLCB0cnVlIGZvciBwYXRocyBsaWtlOlxyXG4gKiBcXCwgXFxoZWxsbywgXFxcXGhlbGxvXFxzaGFyZSwgQzosIGFuZCBDOlxcaGVsbG8gKGFuZCBjb3JyZXNwb25kaW5nIGFsdGVybmF0ZSBzZXBhcmF0b3IgY2FzZXMpLlxyXG4gKi9cclxuZnVuY3Rpb24gX2lzUm9vdGVkKHApIHtcclxuICAgIHAgPSBfbm9ybWFsaXplU2VwYXJhdG9ycyhwKTtcclxuICAgIGlmICghcCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaXNSb290ZWQoKSBwYXJhbWV0ZXIgXCJwXCIgY2Fubm90IGJlIGVtcHR5Jyk7XHJcbiAgICB9XHJcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInKSB7XHJcbiAgICAgICAgcmV0dXJuIF9zdGFydHNXaXRoKHAsICdcXFxcJykgfHwgLy8gZS5nLiBcXCBvciBcXGhlbGxvIG9yIFxcXFxoZWxsb1xyXG4gICAgICAgICAgICAvXltBLVpdOi9pLnRlc3QocCk7IC8vIGUuZy4gQzogb3IgQzpcXGhlbGxvXHJcbiAgICB9XHJcbiAgICByZXR1cm4gX3N0YXJ0c1dpdGgocCwgJy8nKTsgLy8gZS5nLiAvaGVsbG9cclxufVxyXG5leHBvcnRzLl9pc1Jvb3RlZCA9IF9pc1Jvb3RlZDtcclxuZnVuY3Rpb24gX25vcm1hbGl6ZVNlcGFyYXRvcnMocCkge1xyXG4gICAgcCA9IHAgfHwgJyc7XHJcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInKSB7XHJcbiAgICAgICAgLy8gY29udmVydCBzbGFzaGVzIG9uIFdpbmRvd3NcclxuICAgICAgICBwID0gcC5yZXBsYWNlKC9cXC8vZywgJ1xcXFwnKTtcclxuICAgICAgICAvLyByZW1vdmUgcmVkdW5kYW50IHNsYXNoZXNcclxuICAgICAgICB2YXIgaXNVbmMgPSAvXlxcXFxcXFxcK1teXFxcXF0vLnRlc3QocCk7IC8vIGUuZy4gXFxcXGhlbGxvXHJcbiAgICAgICAgcmV0dXJuIChpc1VuYyA/ICdcXFxcJyA6ICcnKSArIHAucmVwbGFjZSgvXFxcXFxcXFwrL2csICdcXFxcJyk7IC8vIHByZXNlcnZlIGxlYWRpbmcgLy8gZm9yIFVOQ1xyXG4gICAgfVxyXG4gICAgLy8gcmVtb3ZlIHJlZHVuZGFudCBzbGFzaGVzXHJcbiAgICByZXR1cm4gcC5yZXBsYWNlKC9cXC9cXC8rL2csICcvJyk7XHJcbn1cclxuZXhwb3J0cy5fbm9ybWFsaXplU2VwYXJhdG9ycyA9IF9ub3JtYWxpemVTZXBhcmF0b3JzO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIEV4cG9zZSBwcm94eSBpbmZvcm1hdGlvbiB0byB2c3RzLW5vZGUtYXBpXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuZnVuY3Rpb24gX2V4cG9zZVByb3h5U2V0dGluZ3MoKSB7XHJcbiAgICB2YXIgcHJveHlVcmwgPSBfZ2V0VmFyaWFibGUoJ0FnZW50LlByb3h5VXJsJyk7XHJcbiAgICBpZiAocHJveHlVcmwgJiYgcHJveHlVcmwubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHZhciBwcm94eVVzZXJuYW1lID0gX2dldFZhcmlhYmxlKCdBZ2VudC5Qcm94eVVzZXJuYW1lJyk7XHJcbiAgICAgICAgdmFyIHByb3h5UGFzc3dvcmQgPSBfZ2V0VmFyaWFibGUoJ0FnZW50LlByb3h5UGFzc3dvcmQnKTtcclxuICAgICAgICB2YXIgcHJveHlCeXBhc3NIb3N0c0pzb24gPSBfZ2V0VmFyaWFibGUoJ0FnZW50LlByb3h5QnlwYXNzTGlzdCcpO1xyXG4gICAgICAgIGdsb2JhbFsnX3ZzdHNfdGFza19saWJfcHJveHlfdXJsJ10gPSBwcm94eVVybDtcclxuICAgICAgICBnbG9iYWxbJ192c3RzX3Rhc2tfbGliX3Byb3h5X3VzZXJuYW1lJ10gPSBwcm94eVVzZXJuYW1lO1xyXG4gICAgICAgIGdsb2JhbFsnX3ZzdHNfdGFza19saWJfcHJveHlfYnlwYXNzJ10gPSBwcm94eUJ5cGFzc0hvc3RzSnNvbjtcclxuICAgICAgICBnbG9iYWxbJ192c3RzX3Rhc2tfbGliX3Byb3h5X3Bhc3N3b3JkJ10gPSBfZXhwb3NlVGFza0xpYlNlY3JldCgncHJveHknLCBwcm94eVBhc3N3b3JkIHx8ICcnKTtcclxuICAgICAgICBfZGVidWcoJ2V4cG9zZSBhZ2VudCBwcm94eSBjb25maWd1cmF0aW9uLicpO1xyXG4gICAgICAgIGdsb2JhbFsnX3ZzdHNfdGFza19saWJfcHJveHknXSA9IHRydWU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5fZXhwb3NlUHJveHlTZXR0aW5ncyA9IF9leHBvc2VQcm94eVNldHRpbmdzO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIEV4cG9zZSBjZXJ0aWZpY2F0ZSBpbmZvcm1hdGlvbiB0byB2c3RzLW5vZGUtYXBpXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuZnVuY3Rpb24gX2V4cG9zZUNlcnRTZXR0aW5ncygpIHtcclxuICAgIHZhciBjYSA9IF9nZXRWYXJpYWJsZSgnQWdlbnQuQ0FJbmZvJyk7XHJcbiAgICBpZiAoY2EpIHtcclxuICAgICAgICBnbG9iYWxbJ192c3RzX3Rhc2tfbGliX2NlcnRfY2EnXSA9IGNhO1xyXG4gICAgfVxyXG4gICAgdmFyIGNsaWVudENlcnQgPSBfZ2V0VmFyaWFibGUoJ0FnZW50LkNsaWVudENlcnQnKTtcclxuICAgIGlmIChjbGllbnRDZXJ0KSB7XHJcbiAgICAgICAgdmFyIGNsaWVudENlcnRLZXkgPSBfZ2V0VmFyaWFibGUoJ0FnZW50LkNsaWVudENlcnRLZXknKTtcclxuICAgICAgICB2YXIgY2xpZW50Q2VydEFyY2hpdmUgPSBfZ2V0VmFyaWFibGUoJ0FnZW50LkNsaWVudENlcnRBcmNoaXZlJyk7XHJcbiAgICAgICAgdmFyIGNsaWVudENlcnRQYXNzd29yZCA9IF9nZXRWYXJpYWJsZSgnQWdlbnQuQ2xpZW50Q2VydFBhc3N3b3JkJyk7XHJcbiAgICAgICAgZ2xvYmFsWydfdnN0c190YXNrX2xpYl9jZXJ0X2NsaWVudGNlcnQnXSA9IGNsaWVudENlcnQ7XHJcbiAgICAgICAgZ2xvYmFsWydfdnN0c190YXNrX2xpYl9jZXJ0X2tleSddID0gY2xpZW50Q2VydEtleTtcclxuICAgICAgICBnbG9iYWxbJ192c3RzX3Rhc2tfbGliX2NlcnRfYXJjaGl2ZSddID0gY2xpZW50Q2VydEFyY2hpdmU7XHJcbiAgICAgICAgZ2xvYmFsWydfdnN0c190YXNrX2xpYl9jZXJ0X3Bhc3NwaHJhc2UnXSA9IF9leHBvc2VUYXNrTGliU2VjcmV0KCdjZXJ0JywgY2xpZW50Q2VydFBhc3N3b3JkIHx8ICcnKTtcclxuICAgIH1cclxuICAgIGlmIChjYSB8fCBjbGllbnRDZXJ0KSB7XHJcbiAgICAgICAgX2RlYnVnKCdleHBvc2UgYWdlbnQgY2VydGlmaWNhdGUgY29uZmlndXJhdGlvbi4nKTtcclxuICAgICAgICBnbG9iYWxbJ192c3RzX3Rhc2tfbGliX2NlcnQnXSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgc2tpcENlcnRWYWxpZGF0aW9uID0gX2dldFZhcmlhYmxlKCdBZ2VudC5Ta2lwQ2VydFZhbGlkYXRpb24nKSB8fCAnZmFsc2UnO1xyXG4gICAgaWYgKHNraXBDZXJ0VmFsaWRhdGlvbikge1xyXG4gICAgICAgIGdsb2JhbFsnX3ZzdHNfdGFza19saWJfc2tpcF9jZXJ0X3ZhbGlkYXRpb24nXSA9IHNraXBDZXJ0VmFsaWRhdGlvbi50b1VwcGVyQ2FzZSgpID09PSAnVFJVRSc7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5fZXhwb3NlQ2VydFNldHRpbmdzID0gX2V4cG9zZUNlcnRTZXR0aW5ncztcclxuLy8gV2Ugc3RvcmUgdGhlIGVuY3J5cHRpb24ga2V5IG9uIGRpc2sgYW5kIGhvbGQgdGhlIGVuY3J5cHRlZCBjb250ZW50IGFuZCBrZXkgZmlsZSBpbiBtZW1vcnlcclxuLy8gcmV0dXJuIGJhc2U2NGVuY29kZWQ8a2V5RmlsZVBhdGg+OmJhc2U2NGVuY29kZWQ8ZW5jcnlwdGVkQ29udGVudD5cclxuLy8gZG93bnN0cmVhbSB2c3RzLW5vZGUtYXBpIHdpbGwgcmV0cmlldmUgdGhlIHNlY3JldCBsYXRlclxyXG5mdW5jdGlvbiBfZXhwb3NlVGFza0xpYlNlY3JldChrZXlGaWxlLCBzZWNyZXQpIHtcclxuICAgIGlmIChzZWNyZXQpIHtcclxuICAgICAgICB2YXIgZW5jcnlwdEtleSA9IGNyeXB0by5yYW5kb21CeXRlcygyNTYpO1xyXG4gICAgICAgIHZhciBjaXBoZXIgPSBjcnlwdG8uY3JlYXRlQ2lwaGVyKFwiYWVzLTI1Ni1jdHJcIiwgZW5jcnlwdEtleSk7XHJcbiAgICAgICAgdmFyIGVuY3J5cHRlZENvbnRlbnQgPSBjaXBoZXIudXBkYXRlKHNlY3JldCwgXCJ1dGY4XCIsIFwiaGV4XCIpO1xyXG4gICAgICAgIGVuY3J5cHRlZENvbnRlbnQgKz0gY2lwaGVyLmZpbmFsKFwiaGV4XCIpO1xyXG4gICAgICAgIHZhciBzdG9yYWdlRmlsZSA9IHBhdGguam9pbihfZ2V0VmFyaWFibGUoJ0FnZW50LlRlbXBEaXJlY3RvcnknKSB8fCBfZ2V0VmFyaWFibGUoXCJhZ2VudC53b3JrRm9sZGVyXCIpIHx8IHByb2Nlc3MuY3dkKCksIGtleUZpbGUpO1xyXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoc3RvcmFnZUZpbGUsIGVuY3J5cHRLZXkudG9TdHJpbmcoJ2Jhc2U2NCcpLCB7IGVuY29kaW5nOiAndXRmOCcgfSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCdWZmZXIoc3RvcmFnZUZpbGUpLnRvU3RyaW5nKCdiYXNlNjQnKSArICc6JyArIG5ldyBCdWZmZXIoZW5jcnlwdGVkQ29udGVudCkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xyXG4gICAgfVxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbi8vXHJcbi8vIENvbW1hbmQgRm9ybWF0OlxyXG4vLyAgICAjI3Zzb1thcnRpZmFjdC5jb21tYW5kIGtleT12YWx1ZTtrZXk9dmFsdWVddXNlciBtZXNzYWdlXHJcbi8vICAgIFxyXG4vLyBFeGFtcGxlczpcclxuLy8gICAgIyN2c29bdGFzay5wcm9ncmVzcyB2YWx1ZT01OF1cclxuLy8gICAgIyN2c29bdGFzay5pc3N1ZSB0eXBlPXdhcm5pbmc7XVRoaXMgaXMgdGhlIHVzZXIgd2FybmluZyBtZXNzYWdlXHJcbi8vXHJcbnZhciBDTURfUFJFRklYID0gJyMjdnNvWyc7XHJcbnZhciBUYXNrQ29tbWFuZCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFRhc2tDb21tYW5kKGNvbW1hbmQsIHByb3BlcnRpZXMsIG1lc3NhZ2UpIHtcclxuICAgICAgICBpZiAoIWNvbW1hbmQpIHtcclxuICAgICAgICAgICAgY29tbWFuZCA9ICdtaXNzaW5nLmNvbW1hbmQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xyXG4gICAgICAgIHRoaXMucHJvcGVydGllcyA9IHByb3BlcnRpZXM7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcclxuICAgIH1cclxuICAgIFRhc2tDb21tYW5kLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgY21kU3RyID0gQ01EX1BSRUZJWCArIHRoaXMuY29tbWFuZDtcclxuICAgICAgICBpZiAodGhpcy5wcm9wZXJ0aWVzICYmIE9iamVjdC5rZXlzKHRoaXMucHJvcGVydGllcykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjbWRTdHIgKz0gJyAnO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5wcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsID0gdGhpcy5wcm9wZXJ0aWVzW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzYWZlbHkgYXBwZW5kIHRoZSB2YWwgLSBhdm9pZCBibG93aW5nIHVwIHdoZW4gYXR0ZW1wdGluZyB0b1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxsIC5yZXBsYWNlKCkgaWYgbWVzc2FnZSBpcyBub3QgYSBzdHJpbmcgZm9yIHNvbWUgcmVhc29uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNtZFN0ciArPSBrZXkgKyAnPScgKyBlc2NhcGUoJycgKyAodmFsIHx8ICcnKSkgKyAnOyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNtZFN0ciArPSAnXSc7XHJcbiAgICAgICAgLy8gc2FmZWx5IGFwcGVuZCB0aGUgbWVzc2FnZSAtIGF2b2lkIGJsb3dpbmcgdXAgd2hlbiBhdHRlbXB0aW5nIHRvXHJcbiAgICAgICAgLy8gY2FsbCAucmVwbGFjZSgpIGlmIG1lc3NhZ2UgaXMgbm90IGEgc3RyaW5nIGZvciBzb21lIHJlYXNvblxyXG4gICAgICAgIHZhciBtZXNzYWdlID0gJycgKyAodGhpcy5tZXNzYWdlIHx8ICcnKTtcclxuICAgICAgICBjbWRTdHIgKz0gZXNjYXBlZGF0YShtZXNzYWdlKTtcclxuICAgICAgICByZXR1cm4gY21kU3RyO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBUYXNrQ29tbWFuZDtcclxufSgpKTtcclxuZXhwb3J0cy5UYXNrQ29tbWFuZCA9IFRhc2tDb21tYW5kO1xyXG5mdW5jdGlvbiBjb21tYW5kRnJvbVN0cmluZyhjb21tYW5kTGluZSkge1xyXG4gICAgdmFyIHByZUxlbiA9IENNRF9QUkVGSVgubGVuZ3RoO1xyXG4gICAgdmFyIGxiUG9zID0gY29tbWFuZExpbmUuaW5kZXhPZignWycpO1xyXG4gICAgdmFyIHJiUG9zID0gY29tbWFuZExpbmUuaW5kZXhPZignXScpO1xyXG4gICAgaWYgKGxiUG9zID09IC0xIHx8IHJiUG9zID09IC0xIHx8IHJiUG9zIC0gbGJQb3MgPCAzKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvbW1hbmQgYnJhY2tldHMnKTtcclxuICAgIH1cclxuICAgIHZhciBjbWRJbmZvID0gY29tbWFuZExpbmUuc3Vic3RyaW5nKGxiUG9zICsgMSwgcmJQb3MpO1xyXG4gICAgdmFyIHNwYWNlSWR4ID0gY21kSW5mby5pbmRleE9mKCcgJyk7XHJcbiAgICB2YXIgY29tbWFuZCA9IGNtZEluZm87XHJcbiAgICB2YXIgcHJvcGVydGllcyA9IHt9O1xyXG4gICAgaWYgKHNwYWNlSWR4ID4gMCkge1xyXG4gICAgICAgIGNvbW1hbmQgPSBjbWRJbmZvLnRyaW0oKS5zdWJzdHJpbmcoMCwgc3BhY2VJZHgpO1xyXG4gICAgICAgIHZhciBwcm9wU2VjdGlvbiA9IGNtZEluZm8udHJpbSgpLnN1YnN0cmluZyhzcGFjZUlkeCArIDEpO1xyXG4gICAgICAgIHZhciBwcm9wTGluZXMgPSBwcm9wU2VjdGlvbi5zcGxpdCgnOycpO1xyXG4gICAgICAgIHByb3BMaW5lcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wTGluZSkge1xyXG4gICAgICAgICAgICBwcm9wTGluZSA9IHByb3BMaW5lLnRyaW0oKTtcclxuICAgICAgICAgICAgaWYgKHByb3BMaW5lLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBlcUluZGV4ID0gcHJvcExpbmUuaW5kZXhPZignPScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVxSW5kZXggPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcHJvcGVydHk6ICcgKyBwcm9wTGluZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gcHJvcExpbmUuc3Vic3RyaW5nKDAsIGVxSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IHByb3BMaW5lLnN1YnN0cmluZyhlcUluZGV4ICsgMSk7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzW2tleV0gPSB1bmVzY2FwZSh2YWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICB2YXIgbXNnID0gdW5lc2NhcGVkYXRhKGNvbW1hbmRMaW5lLnN1YnN0cmluZyhyYlBvcyArIDEpKTtcclxuICAgIHZhciBjbWQgPSBuZXcgVGFza0NvbW1hbmQoY29tbWFuZCwgcHJvcGVydGllcywgbXNnKTtcclxuICAgIHJldHVybiBjbWQ7XHJcbn1cclxuZXhwb3J0cy5jb21tYW5kRnJvbVN0cmluZyA9IGNvbW1hbmRGcm9tU3RyaW5nO1xyXG5mdW5jdGlvbiBlc2NhcGVkYXRhKHMpIHtcclxuICAgIHJldHVybiBzLnJlcGxhY2UoLyUvZywgJyUyNScpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAnJTBEJylcclxuICAgICAgICAucmVwbGFjZSgvXFxuL2csICclMEEnKTtcclxufVxyXG5mdW5jdGlvbiB1bmVzY2FwZWRhdGEocykge1xyXG4gICAgcmV0dXJuIHMucmVwbGFjZSgvJTBEL2csICdcXHInKVxyXG4gICAgICAgIC5yZXBsYWNlKC8lMEEvZywgJ1xcbicpXHJcbiAgICAgICAgLnJlcGxhY2UoLyUyNS9nLCAnJScpO1xyXG59XHJcbmZ1bmN0aW9uIGVzY2FwZShzKSB7XHJcbiAgICByZXR1cm4gcy5yZXBsYWNlKC8lL2csICclMjUnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHIvZywgJyUwRCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnJTBBJylcclxuICAgICAgICAucmVwbGFjZSgvXS9nLCAnJTVEJylcclxuICAgICAgICAucmVwbGFjZSgvOy9nLCAnJTNCJyk7XHJcbn1cclxuZnVuY3Rpb24gdW5lc2NhcGUocykge1xyXG4gICAgcmV0dXJuIHMucmVwbGFjZSgvJTBEL2csICdcXHInKVxyXG4gICAgICAgIC5yZXBsYWNlKC8lMEEvZywgJ1xcbicpXHJcbiAgICAgICAgLnJlcGxhY2UoLyU1RC9nLCAnXScpXHJcbiAgICAgICAgLnJlcGxhY2UoLyUzQi9nLCAnOycpXHJcbiAgICAgICAgLnJlcGxhY2UoLyUyNS9nLCAnJScpO1xyXG59XHJcbiIsInZhciBybmcgPSByZXF1aXJlKCcuL2xpYi9ybmcnKTtcbnZhciBieXRlc1RvVXVpZCA9IHJlcXVpcmUoJy4vbGliL2J5dGVzVG9VdWlkJyk7XG5cbmZ1bmN0aW9uIHY0KG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuXG4gIGlmICh0eXBlb2Yob3B0aW9ucykgPT0gJ3N0cmluZycpIHtcbiAgICBidWYgPSBvcHRpb25zID09PSAnYmluYXJ5JyA/IG5ldyBBcnJheSgxNikgOiBudWxsO1xuICAgIG9wdGlvbnMgPSBudWxsO1xuICB9XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IHJuZykoKTtcblxuICAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG4gIHJuZHNbNl0gPSAocm5kc1s2XSAmIDB4MGYpIHwgMHg0MDtcbiAgcm5kc1s4XSA9IChybmRzWzhdICYgMHgzZikgfCAweDgwO1xuXG4gIC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuICBpZiAoYnVmKSB7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDE2OyArK2lpKSB7XG4gICAgICBidWZbaSArIGlpXSA9IHJuZHNbaWldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYgfHwgYnl0ZXNUb1V1aWQocm5kcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdjQ7XG4iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBTZW1WZXJcblxudmFyIGRlYnVnXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuaWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJlxuICAgIHByb2Nlc3MuZW52ICYmXG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyAmJlxuICAgIC9cXGJzZW12ZXJcXGIvaS50ZXN0KHByb2Nlc3MuZW52Lk5PREVfREVCVUcpKSB7XG4gIGRlYnVnID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKVxuICAgIGFyZ3MudW5zaGlmdCgnU0VNVkVSJylcbiAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmdzKVxuICB9XG59IGVsc2Uge1xuICBkZWJ1ZyA9IGZ1bmN0aW9uICgpIHt9XG59XG5cbi8vIE5vdGU6IHRoaXMgaXMgdGhlIHNlbXZlci5vcmcgdmVyc2lvbiBvZiB0aGUgc3BlYyB0aGF0IGl0IGltcGxlbWVudHNcbi8vIE5vdCBuZWNlc3NhcmlseSB0aGUgcGFja2FnZSB2ZXJzaW9uIG9mIHRoaXMgY29kZS5cbmV4cG9ydHMuU0VNVkVSX1NQRUNfVkVSU0lPTiA9ICcyLjAuMCdcblxudmFyIE1BWF9MRU5HVEggPSAyNTZcbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgfHxcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gOTAwNzE5OTI1NDc0MDk5MVxuXG4vLyBNYXggc2FmZSBzZWdtZW50IGxlbmd0aCBmb3IgY29lcmNpb24uXG52YXIgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCA9IDE2XG5cbi8vIFRoZSBhY3R1YWwgcmVnZXhwcyBnbyBvbiBleHBvcnRzLnJlXG52YXIgcmUgPSBleHBvcnRzLnJlID0gW11cbnZhciBzcmMgPSBleHBvcnRzLnNyYyA9IFtdXG52YXIgUiA9IDBcblxuLy8gVGhlIGZvbGxvd2luZyBSZWd1bGFyIEV4cHJlc3Npb25zIGNhbiBiZSB1c2VkIGZvciB0b2tlbml6aW5nLFxuLy8gdmFsaWRhdGluZywgYW5kIHBhcnNpbmcgU2VtVmVyIHZlcnNpb24gc3RyaW5ncy5cblxuLy8gIyMgTnVtZXJpYyBJZGVudGlmaWVyXG4vLyBBIHNpbmdsZSBgMGAsIG9yIGEgbm9uLXplcm8gZGlnaXQgZm9sbG93ZWQgYnkgemVybyBvciBtb3JlIGRpZ2l0cy5cblxudmFyIE5VTUVSSUNJREVOVElGSUVSID0gUisrXG5zcmNbTlVNRVJJQ0lERU5USUZJRVJdID0gJzB8WzEtOV1cXFxcZConXG52YXIgTlVNRVJJQ0lERU5USUZJRVJMT09TRSA9IFIrK1xuc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdID0gJ1swLTldKydcblxuLy8gIyMgTm9uLW51bWVyaWMgSWRlbnRpZmllclxuLy8gWmVybyBvciBtb3JlIGRpZ2l0cywgZm9sbG93ZWQgYnkgYSBsZXR0ZXIgb3IgaHlwaGVuLCBhbmQgdGhlbiB6ZXJvIG9yXG4vLyBtb3JlIGxldHRlcnMsIGRpZ2l0cywgb3IgaHlwaGVucy5cblxudmFyIE5PTk5VTUVSSUNJREVOVElGSUVSID0gUisrXG5zcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdID0gJ1xcXFxkKlthLXpBLVotXVthLXpBLVowLTktXSonXG5cbi8vICMjIE1haW4gVmVyc2lvblxuLy8gVGhyZWUgZG90LXNlcGFyYXRlZCBudW1lcmljIGlkZW50aWZpZXJzLlxuXG52YXIgTUFJTlZFUlNJT04gPSBSKytcbnNyY1tNQUlOVkVSU0lPTl0gPSAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpJ1xuXG52YXIgTUFJTlZFUlNJT05MT09TRSA9IFIrK1xuc3JjW01BSU5WRVJTSU9OTE9PU0VdID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJyknXG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb24gSWRlbnRpZmllclxuLy8gQSBudW1lcmljIGlkZW50aWZpZXIsIG9yIGEgbm9uLW51bWVyaWMgaWRlbnRpZmllci5cblxudmFyIFBSRVJFTEVBU0VJREVOVElGSUVSID0gUisrXG5zcmNbUFJFUkVMRUFTRUlERU5USUZJRVJdID0gJyg/OicgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnfCcgKyBzcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdICsgJyknXG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFID0gUisrXG5zcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gPSAnKD86JyArIHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnfCcgKyBzcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdICsgJyknXG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb25cbi8vIEh5cGhlbiwgZm9sbG93ZWQgYnkgb25lIG9yIG1vcmUgZG90LXNlcGFyYXRlZCBwcmUtcmVsZWFzZSB2ZXJzaW9uXG4vLyBpZGVudGlmaWVycy5cblxudmFyIFBSRVJFTEVBU0UgPSBSKytcbnNyY1tQUkVSRUxFQVNFXSA9ICcoPzotKCcgKyBzcmNbUFJFUkVMRUFTRUlERU5USUZJRVJdICtcbiAgICAgICAgICAgICAgICAgICcoPzpcXFxcLicgKyBzcmNbUFJFUkVMRUFTRUlERU5USUZJRVJdICsgJykqKSknXG5cbnZhciBQUkVSRUxFQVNFTE9PU0UgPSBSKytcbnNyY1tQUkVSRUxFQVNFTE9PU0VdID0gJyg/Oi0/KCcgKyBzcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICsgJykqKSknXG5cbi8vICMjIEJ1aWxkIE1ldGFkYXRhIElkZW50aWZpZXJcbi8vIEFueSBjb21iaW5hdGlvbiBvZiBkaWdpdHMsIGxldHRlcnMsIG9yIGh5cGhlbnMuXG5cbnZhciBCVUlMRElERU5USUZJRVIgPSBSKytcbnNyY1tCVUlMRElERU5USUZJRVJdID0gJ1swLTlBLVphLXotXSsnXG5cbi8vICMjIEJ1aWxkIE1ldGFkYXRhXG4vLyBQbHVzIHNpZ24sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIHBlcmlvZC1zZXBhcmF0ZWQgYnVpbGQgbWV0YWRhdGFcbi8vIGlkZW50aWZpZXJzLlxuXG52YXIgQlVJTEQgPSBSKytcbnNyY1tCVUlMRF0gPSAnKD86XFxcXCsoJyArIHNyY1tCVUlMRElERU5USUZJRVJdICtcbiAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW0JVSUxESURFTlRJRklFUl0gKyAnKSopKSdcblxuLy8gIyMgRnVsbCBWZXJzaW9uIFN0cmluZ1xuLy8gQSBtYWluIHZlcnNpb24sIGZvbGxvd2VkIG9wdGlvbmFsbHkgYnkgYSBwcmUtcmVsZWFzZSB2ZXJzaW9uIGFuZFxuLy8gYnVpbGQgbWV0YWRhdGEuXG5cbi8vIE5vdGUgdGhhdCB0aGUgb25seSBtYWpvciwgbWlub3IsIHBhdGNoLCBhbmQgcHJlLXJlbGVhc2Ugc2VjdGlvbnMgb2Zcbi8vIHRoZSB2ZXJzaW9uIHN0cmluZyBhcmUgY2FwdHVyaW5nIGdyb3Vwcy4gIFRoZSBidWlsZCBtZXRhZGF0YSBpcyBub3QgYVxuLy8gY2FwdHVyaW5nIGdyb3VwLCBiZWNhdXNlIGl0IHNob3VsZCBub3QgZXZlciBiZSB1c2VkIGluIHZlcnNpb25cbi8vIGNvbXBhcmlzb24uXG5cbnZhciBGVUxMID0gUisrXG52YXIgRlVMTFBMQUlOID0gJ3Y/JyArIHNyY1tNQUlOVkVSU0lPTl0gK1xuICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFXSArICc/JyArXG4gICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/J1xuXG5zcmNbRlVMTF0gPSAnXicgKyBGVUxMUExBSU4gKyAnJCdcblxuLy8gbGlrZSBmdWxsLCBidXQgYWxsb3dzIHYxLjIuMyBhbmQgPTEuMi4zLCB3aGljaCBwZW9wbGUgZG8gc29tZXRpbWVzLlxuLy8gYWxzbywgMS4wLjBhbHBoYTEgKHByZXJlbGVhc2Ugd2l0aG91dCB0aGUgaHlwaGVuKSB3aGljaCBpcyBwcmV0dHlcbi8vIGNvbW1vbiBpbiB0aGUgbnBtIHJlZ2lzdHJ5LlxudmFyIExPT1NFUExBSU4gPSAnW3Y9XFxcXHNdKicgKyBzcmNbTUFJTlZFUlNJT05MT09TRV0gK1xuICAgICAgICAgICAgICAgICBzcmNbUFJFUkVMRUFTRUxPT1NFXSArICc/JyArXG4gICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPydcblxudmFyIExPT1NFID0gUisrXG5zcmNbTE9PU0VdID0gJ14nICsgTE9PU0VQTEFJTiArICckJ1xuXG52YXIgR1RMVCA9IFIrK1xuc3JjW0dUTFRdID0gJygoPzo8fD4pPz0/KSdcblxuLy8gU29tZXRoaW5nIGxpa2UgXCIyLipcIiBvciBcIjEuMi54XCIuXG4vLyBOb3RlIHRoYXQgXCJ4LnhcIiBpcyBhIHZhbGlkIHhSYW5nZSBpZGVudGlmZXIsIG1lYW5pbmcgXCJhbnkgdmVyc2lvblwiXG4vLyBPbmx5IHRoZSBmaXJzdCBpdGVtIGlzIHN0cmljdGx5IHJlcXVpcmVkLlxudmFyIFhSQU5HRUlERU5USUZJRVJMT09TRSA9IFIrK1xuc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gPSBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnfHh8WHxcXFxcKidcbnZhciBYUkFOR0VJREVOVElGSUVSID0gUisrXG5zcmNbWFJBTkdFSURFTlRJRklFUl0gPSBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJ3x4fFh8XFxcXConXG5cbnZhciBYUkFOR0VQTEFJTiA9IFIrK1xuc3JjW1hSQU5HRVBMQUlOXSA9ICdbdj1cXFxcc10qKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OicgKyBzcmNbUFJFUkVMRUFTRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAnKT8pPydcblxudmFyIFhSQU5HRVBMQUlOTE9PU0UgPSBSKytcbnNyY1tYUkFOR0VQTEFJTkxPT1NFXSA9ICdbdj1cXFxcc10qKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OicgKyBzcmNbUFJFUkVMRUFTRUxPT1NFXSArICcpPycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKT8pPydcblxudmFyIFhSQU5HRSA9IFIrK1xuc3JjW1hSQU5HRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqJyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCdcbnZhciBYUkFOR0VMT09TRSA9IFIrK1xuc3JjW1hSQU5HRUxPT1NFXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyonICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnXG5cbi8vIENvZXJjaW9uLlxuLy8gRXh0cmFjdCBhbnl0aGluZyB0aGF0IGNvdWxkIGNvbmNlaXZhYmx5IGJlIGEgcGFydCBvZiBhIHZhbGlkIHNlbXZlclxudmFyIENPRVJDRSA9IFIrK1xuc3JjW0NPRVJDRV0gPSAnKD86XnxbXlxcXFxkXSknICtcbiAgICAgICAgICAgICAgJyhcXFxcZHsxLCcgKyBNQVhfU0FGRV9DT01QT05FTlRfTEVOR1RIICsgJ30pJyArXG4gICAgICAgICAgICAgICcoPzpcXFxcLihcXFxcZHsxLCcgKyBNQVhfU0FGRV9DT01QT05FTlRfTEVOR1RIICsgJ30pKT8nICtcbiAgICAgICAgICAgICAgJyg/OlxcXFwuKFxcXFxkezEsJyArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyAnfSkpPycgK1xuICAgICAgICAgICAgICAnKD86JHxbXlxcXFxkXSknXG5cbi8vIFRpbGRlIHJhbmdlcy5cbi8vIE1lYW5pbmcgaXMgXCJyZWFzb25hYmx5IGF0IG9yIGdyZWF0ZXIgdGhhblwiXG52YXIgTE9ORVRJTERFID0gUisrXG5zcmNbTE9ORVRJTERFXSA9ICcoPzp+Pj8pJ1xuXG52YXIgVElMREVUUklNID0gUisrXG5zcmNbVElMREVUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbTE9ORVRJTERFXSArICdcXFxccysnXG5yZVtUSUxERVRSSU1dID0gbmV3IFJlZ0V4cChzcmNbVElMREVUUklNXSwgJ2cnKVxudmFyIHRpbGRlVHJpbVJlcGxhY2UgPSAnJDF+J1xuXG52YXIgVElMREUgPSBSKytcbnNyY1tUSUxERV0gPSAnXicgKyBzcmNbTE9ORVRJTERFXSArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCdcbnZhciBUSUxERUxPT1NFID0gUisrXG5zcmNbVElMREVMT09TRV0gPSAnXicgKyBzcmNbTE9ORVRJTERFXSArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJ1xuXG4vLyBDYXJldCByYW5nZXMuXG4vLyBNZWFuaW5nIGlzIFwiYXQgbGVhc3QgYW5kIGJhY2t3YXJkcyBjb21wYXRpYmxlIHdpdGhcIlxudmFyIExPTkVDQVJFVCA9IFIrK1xuc3JjW0xPTkVDQVJFVF0gPSAnKD86XFxcXF4pJ1xuXG52YXIgQ0FSRVRUUklNID0gUisrXG5zcmNbQ0FSRVRUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbTE9ORUNBUkVUXSArICdcXFxccysnXG5yZVtDQVJFVFRSSU1dID0gbmV3IFJlZ0V4cChzcmNbQ0FSRVRUUklNXSwgJ2cnKVxudmFyIGNhcmV0VHJpbVJlcGxhY2UgPSAnJDFeJ1xuXG52YXIgQ0FSRVQgPSBSKytcbnNyY1tDQVJFVF0gPSAnXicgKyBzcmNbTE9ORUNBUkVUXSArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCdcbnZhciBDQVJFVExPT1NFID0gUisrXG5zcmNbQ0FSRVRMT09TRV0gPSAnXicgKyBzcmNbTE9ORUNBUkVUXSArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJ1xuXG4vLyBBIHNpbXBsZSBndC9sdC9lcSB0aGluZywgb3IganVzdCBcIlwiIHRvIGluZGljYXRlIFwiYW55IHZlcnNpb25cIlxudmFyIENPTVBBUkFUT1JMT09TRSA9IFIrK1xuc3JjW0NPTVBBUkFUT1JMT09TRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqKCcgKyBMT09TRVBMQUlOICsgJykkfF4kJ1xudmFyIENPTVBBUkFUT1IgPSBSKytcbnNyY1tDT01QQVJBVE9SXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyooJyArIEZVTExQTEFJTiArICcpJHxeJCdcblxuLy8gQW4gZXhwcmVzc2lvbiB0byBzdHJpcCBhbnkgd2hpdGVzcGFjZSBiZXR3ZWVuIHRoZSBndGx0IGFuZCB0aGUgdGhpbmdcbi8vIGl0IG1vZGlmaWVzLCBzbyB0aGF0IGA+IDEuMi4zYCA9PT4gYD4xLjIuM2BcbnZhciBDT01QQVJBVE9SVFJJTSA9IFIrK1xuc3JjW0NPTVBBUkFUT1JUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbR1RMVF0gK1xuICAgICAgICAgICAgICAgICAgICAgICdcXFxccyooJyArIExPT1NFUExBSU4gKyAnfCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknXG5cbi8vIHRoaXMgb25lIGhhcyB0byB1c2UgdGhlIC9nIGZsYWdcbnJlW0NPTVBBUkFUT1JUUklNXSA9IG5ldyBSZWdFeHAoc3JjW0NPTVBBUkFUT1JUUklNXSwgJ2cnKVxudmFyIGNvbXBhcmF0b3JUcmltUmVwbGFjZSA9ICckMSQyJDMnXG5cbi8vIFNvbWV0aGluZyBsaWtlIGAxLjIuMyAtIDEuMi40YFxuLy8gTm90ZSB0aGF0IHRoZXNlIGFsbCB1c2UgdGhlIGxvb3NlIGZvcm0sIGJlY2F1c2UgdGhleSdsbCBiZVxuLy8gY2hlY2tlZCBhZ2FpbnN0IGVpdGhlciB0aGUgc3RyaWN0IG9yIGxvb3NlIGNvbXBhcmF0b3IgZm9ybVxuLy8gbGF0ZXIuXG52YXIgSFlQSEVOUkFOR0UgPSBSKytcbnNyY1tIWVBIRU5SQU5HRV0gPSAnXlxcXFxzKignICsgc3JjW1hSQU5HRVBMQUlOXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJ1xcXFxzKy1cXFxccysnICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnXFxcXHMqJCdcblxudmFyIEhZUEhFTlJBTkdFTE9PU0UgPSBSKytcbnNyY1tIWVBIRU5SQU5HRUxPT1NFXSA9ICdeXFxcXHMqKCcgKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1xcXFxzKy1cXFxccysnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxcXHMqJCdcblxuLy8gU3RhciByYW5nZXMgYmFzaWNhbGx5IGp1c3QgYWxsb3cgYW55dGhpbmcgYXQgYWxsLlxudmFyIFNUQVIgPSBSKytcbnNyY1tTVEFSXSA9ICcoPHw+KT89P1xcXFxzKlxcXFwqJ1xuXG4vLyBDb21waWxlIHRvIGFjdHVhbCByZWdleHAgb2JqZWN0cy5cbi8vIEFsbCBhcmUgZmxhZy1mcmVlLCB1bmxlc3MgdGhleSB3ZXJlIGNyZWF0ZWQgYWJvdmUgd2l0aCBhIGZsYWcuXG5mb3IgKHZhciBpID0gMDsgaSA8IFI7IGkrKykge1xuICBkZWJ1ZyhpLCBzcmNbaV0pXG4gIGlmICghcmVbaV0pIHtcbiAgICByZVtpXSA9IG5ldyBSZWdFeHAoc3JjW2ldKVxuICB9XG59XG5cbmV4cG9ydHMucGFyc2UgPSBwYXJzZVxuZnVuY3Rpb24gcGFyc2UgKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0Jykge1xuICAgIG9wdGlvbnMgPSB7XG4gICAgICBsb29zZTogISFvcHRpb25zLFxuICAgICAgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpIHtcbiAgICByZXR1cm4gdmVyc2lvblxuICB9XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBpZiAodmVyc2lvbi5sZW5ndGggPiBNQVhfTEVOR1RIKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW0xPT1NFXSA6IHJlW0ZVTExdXG4gIGlmICghci50ZXN0KHZlcnNpb24pKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucylcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbmV4cG9ydHMudmFsaWQgPSB2YWxpZFxuZnVuY3Rpb24gdmFsaWQgKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHYgPSBwYXJzZSh2ZXJzaW9uLCBvcHRpb25zKVxuICByZXR1cm4gdiA/IHYudmVyc2lvbiA6IG51bGxcbn1cblxuZXhwb3J0cy5jbGVhbiA9IGNsZWFuXG5mdW5jdGlvbiBjbGVhbiAodmVyc2lvbiwgb3B0aW9ucykge1xuICB2YXIgcyA9IHBhcnNlKHZlcnNpb24udHJpbSgpLnJlcGxhY2UoL15bPXZdKy8sICcnKSwgb3B0aW9ucylcbiAgcmV0dXJuIHMgPyBzLnZlcnNpb24gOiBudWxsXG59XG5cbmV4cG9ydHMuU2VtVmVyID0gU2VtVmVyXG5cbmZ1bmN0aW9uIFNlbVZlciAodmVyc2lvbiwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIGxvb3NlOiAhIW9wdGlvbnMsXG4gICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICB9XG4gIH1cbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpIHtcbiAgICBpZiAodmVyc2lvbi5sb29zZSA9PT0gb3B0aW9ucy5sb29zZSkge1xuICAgICAgcmV0dXJuIHZlcnNpb25cbiAgICB9IGVsc2Uge1xuICAgICAgdmVyc2lvbiA9IHZlcnNpb24udmVyc2lvblxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKVxuICB9XG5cbiAgaWYgKHZlcnNpb24ubGVuZ3RoID4gTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZlcnNpb24gaXMgbG9uZ2VyIHRoYW4gJyArIE1BWF9MRU5HVEggKyAnIGNoYXJhY3RlcnMnKVxuICB9XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNlbVZlcikpIHtcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBvcHRpb25zKVxuICB9XG5cbiAgZGVidWcoJ1NlbVZlcicsIHZlcnNpb24sIG9wdGlvbnMpXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgdGhpcy5sb29zZSA9ICEhb3B0aW9ucy5sb29zZVxuXG4gIHZhciBtID0gdmVyc2lvbi50cmltKCkubWF0Y2gob3B0aW9ucy5sb29zZSA/IHJlW0xPT1NFXSA6IHJlW0ZVTExdKVxuXG4gIGlmICghbSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgVmVyc2lvbjogJyArIHZlcnNpb24pXG4gIH1cblxuICB0aGlzLnJhdyA9IHZlcnNpb25cblxuICAvLyB0aGVzZSBhcmUgYWN0dWFsbHkgbnVtYmVyc1xuICB0aGlzLm1ham9yID0gK21bMV1cbiAgdGhpcy5taW5vciA9ICttWzJdXG4gIHRoaXMucGF0Y2ggPSArbVszXVxuXG4gIGlmICh0aGlzLm1ham9yID4gTUFYX1NBRkVfSU5URUdFUiB8fCB0aGlzLm1ham9yIDwgMCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWFqb3IgdmVyc2lvbicpXG4gIH1cblxuICBpZiAodGhpcy5taW5vciA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5taW5vciA8IDApIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG1pbm9yIHZlcnNpb24nKVxuICB9XG5cbiAgaWYgKHRoaXMucGF0Y2ggPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMucGF0Y2ggPCAwKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBwYXRjaCB2ZXJzaW9uJylcbiAgfVxuXG4gIC8vIG51bWJlcmlmeSBhbnkgcHJlcmVsZWFzZSBudW1lcmljIGlkc1xuICBpZiAoIW1bNF0pIHtcbiAgICB0aGlzLnByZXJlbGVhc2UgPSBbXVxuICB9IGVsc2Uge1xuICAgIHRoaXMucHJlcmVsZWFzZSA9IG1bNF0uc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24gKGlkKSB7XG4gICAgICBpZiAoL15bMC05XSskLy50ZXN0KGlkKSkge1xuICAgICAgICB2YXIgbnVtID0gK2lkXG4gICAgICAgIGlmIChudW0gPj0gMCAmJiBudW0gPCBNQVhfU0FGRV9JTlRFR0VSKSB7XG4gICAgICAgICAgcmV0dXJuIG51bVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gaWRcbiAgICB9KVxuICB9XG5cbiAgdGhpcy5idWlsZCA9IG1bNV0gPyBtWzVdLnNwbGl0KCcuJykgOiBbXVxuICB0aGlzLmZvcm1hdCgpXG59XG5cblNlbVZlci5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnZlcnNpb24gPSB0aGlzLm1ham9yICsgJy4nICsgdGhpcy5taW5vciArICcuJyArIHRoaXMucGF0Y2hcbiAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGgpIHtcbiAgICB0aGlzLnZlcnNpb24gKz0gJy0nICsgdGhpcy5wcmVyZWxlYXNlLmpvaW4oJy4nKVxuICB9XG4gIHJldHVybiB0aGlzLnZlcnNpb25cbn1cblxuU2VtVmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudmVyc2lvblxufVxuXG5TZW1WZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgZGVidWcoJ1NlbVZlci5jb21wYXJlJywgdGhpcy52ZXJzaW9uLCB0aGlzLm9wdGlvbnMsIG90aGVyKVxuICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpIHtcbiAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMub3B0aW9ucylcbiAgfVxuXG4gIHJldHVybiB0aGlzLmNvbXBhcmVNYWluKG90aGVyKSB8fCB0aGlzLmNvbXBhcmVQcmUob3RoZXIpXG59XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZU1haW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKSB7XG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLm9wdGlvbnMpXG4gIH1cblxuICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWFqb3IsIG90aGVyLm1ham9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWlub3IsIG90aGVyLm1pbm9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMucGF0Y2gsIG90aGVyLnBhdGNoKVxufVxuXG5TZW1WZXIucHJvdG90eXBlLmNvbXBhcmVQcmUgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKSB7XG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLm9wdGlvbnMpXG4gIH1cblxuICAvLyBOT1QgaGF2aW5nIGEgcHJlcmVsZWFzZSBpcyA+IGhhdmluZyBvbmVcbiAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgcmV0dXJuIC0xXG4gIH0gZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpIHtcbiAgICByZXR1cm4gMVxuICB9IGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmICFvdGhlci5wcmVyZWxlYXNlLmxlbmd0aCkge1xuICAgIHJldHVybiAwXG4gIH1cblxuICB2YXIgaSA9IDBcbiAgZG8ge1xuICAgIHZhciBhID0gdGhpcy5wcmVyZWxlYXNlW2ldXG4gICAgdmFyIGIgPSBvdGhlci5wcmVyZWxlYXNlW2ldXG4gICAgZGVidWcoJ3ByZXJlbGVhc2UgY29tcGFyZScsIGksIGEsIGIpXG4gICAgaWYgKGEgPT09IHVuZGVmaW5lZCAmJiBiID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAwXG4gICAgfSBlbHNlIGlmIChiID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAxXG4gICAgfSBlbHNlIGlmIChhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH0gZWxzZSBpZiAoYSA9PT0gYikge1xuICAgICAgY29udGludWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhhLCBiKVxuICAgIH1cbiAgfSB3aGlsZSAoKytpKVxufVxuXG4vLyBwcmVtaW5vciB3aWxsIGJ1bXAgdGhlIHZlcnNpb24gdXAgdG8gdGhlIG5leHQgbWlub3IgcmVsZWFzZSwgYW5kIGltbWVkaWF0ZWx5XG4vLyBkb3duIHRvIHByZS1yZWxlYXNlLiBwcmVtYWpvciBhbmQgcHJlcGF0Y2ggd29yayB0aGUgc2FtZSB3YXkuXG5TZW1WZXIucHJvdG90eXBlLmluYyA9IGZ1bmN0aW9uIChyZWxlYXNlLCBpZGVudGlmaWVyKSB7XG4gIHN3aXRjaCAocmVsZWFzZSkge1xuICAgIGNhc2UgJ3ByZW1ham9yJzpcbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwXG4gICAgICB0aGlzLnBhdGNoID0gMFxuICAgICAgdGhpcy5taW5vciA9IDBcbiAgICAgIHRoaXMubWFqb3IrK1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3ByZW1pbm9yJzpcbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwXG4gICAgICB0aGlzLnBhdGNoID0gMFxuICAgICAgdGhpcy5taW5vcisrXG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcilcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAncHJlcGF0Y2gnOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhbHJlYWR5IGEgcHJlcmVsZWFzZSwgaXQgd2lsbCBidW1wIHRvIHRoZSBuZXh0IHZlcnNpb25cbiAgICAgIC8vIGRyb3AgYW55IHByZXJlbGVhc2VzIHRoYXQgbWlnaHQgYWxyZWFkeSBleGlzdCwgc2luY2UgdGhleSBhcmUgbm90XG4gICAgICAvLyByZWxldmFudCBhdCB0aGlzIHBvaW50LlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDBcbiAgICAgIHRoaXMuaW5jKCdwYXRjaCcsIGlkZW50aWZpZXIpXG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcilcbiAgICAgIGJyZWFrXG4gICAgLy8gSWYgdGhlIGlucHV0IGlzIGEgbm9uLXByZXJlbGVhc2UgdmVyc2lvbiwgdGhpcyBhY3RzIHRoZSBzYW1lIGFzXG4gICAgLy8gcHJlcGF0Y2guXG4gICAgY2FzZSAncHJlcmVsZWFzZSc6XG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLmluYygncGF0Y2gnLCBpZGVudGlmaWVyKVxuICAgICAgfVxuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpXG4gICAgICBicmVha1xuXG4gICAgY2FzZSAnbWFqb3InOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHByZS1tYWpvciB2ZXJzaW9uLCBidW1wIHVwIHRvIHRoZSBzYW1lIG1ham9yIHZlcnNpb24uXG4gICAgICAvLyBPdGhlcndpc2UgaW5jcmVtZW50IG1ham9yLlxuICAgICAgLy8gMS4wLjAtNSBidW1wcyB0byAxLjAuMFxuICAgICAgLy8gMS4xLjAgYnVtcHMgdG8gMi4wLjBcbiAgICAgIGlmICh0aGlzLm1pbm9yICE9PSAwIHx8XG4gICAgICAgICAgdGhpcy5wYXRjaCAhPT0gMCB8fFxuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5tYWpvcisrXG4gICAgICB9XG4gICAgICB0aGlzLm1pbm9yID0gMFxuICAgICAgdGhpcy5wYXRjaCA9IDBcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdXG4gICAgICBicmVha1xuICAgIGNhc2UgJ21pbm9yJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWlub3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtaW5vciB2ZXJzaW9uLlxuICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtaW5vci5cbiAgICAgIC8vIDEuMi4wLTUgYnVtcHMgdG8gMS4yLjBcbiAgICAgIC8vIDEuMi4xIGJ1bXBzIHRvIDEuMy4wXG4gICAgICBpZiAodGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMubWlub3IrK1xuICAgICAgfVxuICAgICAgdGhpcy5wYXRjaCA9IDBcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3BhdGNoJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgbm90IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiwgaXQgd2lsbCBpbmNyZW1lbnQgdGhlIHBhdGNoLlxuICAgICAgLy8gSWYgaXQgaXMgYSBwcmUtcmVsZWFzZSBpdCB3aWxsIGJ1bXAgdXAgdG8gdGhlIHNhbWUgcGF0Y2ggdmVyc2lvbi5cbiAgICAgIC8vIDEuMi4wLTUgcGF0Y2hlcyB0byAxLjIuMFxuICAgICAgLy8gMS4yLjAgcGF0Y2hlcyB0byAxLjIuMVxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5wYXRjaCsrXG4gICAgICB9XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXVxuICAgICAgYnJlYWtcbiAgICAvLyBUaGlzIHByb2JhYmx5IHNob3VsZG4ndCBiZSB1c2VkIHB1YmxpY2x5LlxuICAgIC8vIDEuMC4wIFwicHJlXCIgd291bGQgYmVjb21lIDEuMC4wLTAgd2hpY2ggaXMgdGhlIHdyb25nIGRpcmVjdGlvbi5cbiAgICBjYXNlICdwcmUnOlxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gWzBdXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaSA9IHRoaXMucHJlcmVsZWFzZS5sZW5ndGhcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnByZXJlbGVhc2VbaV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aGlzLnByZXJlbGVhc2VbaV0rK1xuICAgICAgICAgICAgaSA9IC0yXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpID09PSAtMSkge1xuICAgICAgICAgIC8vIGRpZG4ndCBpbmNyZW1lbnQgYW55dGhpbmdcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UucHVzaCgwKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaWRlbnRpZmllcikge1xuICAgICAgICAvLyAxLjIuMC1iZXRhLjEgYnVtcHMgdG8gMS4yLjAtYmV0YS4yLFxuICAgICAgICAvLyAxLjIuMC1iZXRhLmZvb2JseiBvciAxLjIuMC1iZXRhIGJ1bXBzIHRvIDEuMi4wLWJldGEuMFxuICAgICAgICBpZiAodGhpcy5wcmVyZWxlYXNlWzBdID09PSBpZGVudGlmaWVyKSB7XG4gICAgICAgICAgaWYgKGlzTmFOKHRoaXMucHJlcmVsZWFzZVsxXSkpIHtcbiAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtpZGVudGlmaWVyLCAwXVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbaWRlbnRpZmllciwgMF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgaW5jcmVtZW50IGFyZ3VtZW50OiAnICsgcmVsZWFzZSlcbiAgfVxuICB0aGlzLmZvcm1hdCgpXG4gIHRoaXMucmF3ID0gdGhpcy52ZXJzaW9uXG4gIHJldHVybiB0aGlzXG59XG5cbmV4cG9ydHMuaW5jID0gaW5jXG5mdW5jdGlvbiBpbmMgKHZlcnNpb24sIHJlbGVhc2UsIGxvb3NlLCBpZGVudGlmaWVyKSB7XG4gIGlmICh0eXBlb2YgKGxvb3NlKSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZGVudGlmaWVyID0gbG9vc2VcbiAgICBsb29zZSA9IHVuZGVmaW5lZFxuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBsb29zZSkuaW5jKHJlbGVhc2UsIGlkZW50aWZpZXIpLnZlcnNpb25cbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbmV4cG9ydHMuZGlmZiA9IGRpZmZcbmZ1bmN0aW9uIGRpZmYgKHZlcnNpb24xLCB2ZXJzaW9uMikge1xuICBpZiAoZXEodmVyc2lvbjEsIHZlcnNpb24yKSkge1xuICAgIHJldHVybiBudWxsXG4gIH0gZWxzZSB7XG4gICAgdmFyIHYxID0gcGFyc2UodmVyc2lvbjEpXG4gICAgdmFyIHYyID0gcGFyc2UodmVyc2lvbjIpXG4gICAgdmFyIHByZWZpeCA9ICcnXG4gICAgaWYgKHYxLnByZXJlbGVhc2UubGVuZ3RoIHx8IHYyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICBwcmVmaXggPSAncHJlJ1xuICAgICAgdmFyIGRlZmF1bHRSZXN1bHQgPSAncHJlcmVsZWFzZSdcbiAgICB9XG4gICAgZm9yICh2YXIga2V5IGluIHYxKSB7XG4gICAgICBpZiAoa2V5ID09PSAnbWFqb3InIHx8IGtleSA9PT0gJ21pbm9yJyB8fCBrZXkgPT09ICdwYXRjaCcpIHtcbiAgICAgICAgaWYgKHYxW2tleV0gIT09IHYyW2tleV0pIHtcbiAgICAgICAgICByZXR1cm4gcHJlZml4ICsga2V5XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRSZXN1bHQgLy8gbWF5IGJlIHVuZGVmaW5lZFxuICB9XG59XG5cbmV4cG9ydHMuY29tcGFyZUlkZW50aWZpZXJzID0gY29tcGFyZUlkZW50aWZpZXJzXG5cbnZhciBudW1lcmljID0gL15bMC05XSskL1xuZnVuY3Rpb24gY29tcGFyZUlkZW50aWZpZXJzIChhLCBiKSB7XG4gIHZhciBhbnVtID0gbnVtZXJpYy50ZXN0KGEpXG4gIHZhciBibnVtID0gbnVtZXJpYy50ZXN0KGIpXG5cbiAgaWYgKGFudW0gJiYgYm51bSkge1xuICAgIGEgPSArYVxuICAgIGIgPSArYlxuICB9XG5cbiAgcmV0dXJuIGEgPT09IGIgPyAwXG4gICAgOiAoYW51bSAmJiAhYm51bSkgPyAtMVxuICAgIDogKGJudW0gJiYgIWFudW0pID8gMVxuICAgIDogYSA8IGIgPyAtMVxuICAgIDogMVxufVxuXG5leHBvcnRzLnJjb21wYXJlSWRlbnRpZmllcnMgPSByY29tcGFyZUlkZW50aWZpZXJzXG5mdW5jdGlvbiByY29tcGFyZUlkZW50aWZpZXJzIChhLCBiKSB7XG4gIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnMoYiwgYSlcbn1cblxuZXhwb3J0cy5tYWpvciA9IG1ham9yXG5mdW5jdGlvbiBtYWpvciAoYSwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLm1ham9yXG59XG5cbmV4cG9ydHMubWlub3IgPSBtaW5vclxuZnVuY3Rpb24gbWlub3IgKGEsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5taW5vclxufVxuXG5leHBvcnRzLnBhdGNoID0gcGF0Y2hcbmZ1bmN0aW9uIHBhdGNoIChhLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkucGF0Y2hcbn1cblxuZXhwb3J0cy5jb21wYXJlID0gY29tcGFyZVxuZnVuY3Rpb24gY29tcGFyZSAoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLmNvbXBhcmUobmV3IFNlbVZlcihiLCBsb29zZSkpXG59XG5cbmV4cG9ydHMuY29tcGFyZUxvb3NlID0gY29tcGFyZUxvb3NlXG5mdW5jdGlvbiBjb21wYXJlTG9vc2UgKGEsIGIpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgdHJ1ZSlcbn1cblxuZXhwb3J0cy5yY29tcGFyZSA9IHJjb21wYXJlXG5mdW5jdGlvbiByY29tcGFyZSAoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYiwgYSwgbG9vc2UpXG59XG5cbmV4cG9ydHMuc29ydCA9IHNvcnRcbmZ1bmN0aW9uIHNvcnQgKGxpc3QsIGxvb3NlKSB7XG4gIHJldHVybiBsaXN0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gZXhwb3J0cy5jb21wYXJlKGEsIGIsIGxvb3NlKVxuICB9KVxufVxuXG5leHBvcnRzLnJzb3J0ID0gcnNvcnRcbmZ1bmN0aW9uIHJzb3J0IChsaXN0LCBsb29zZSkge1xuICByZXR1cm4gbGlzdC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGV4cG9ydHMucmNvbXBhcmUoYSwgYiwgbG9vc2UpXG4gIH0pXG59XG5cbmV4cG9ydHMuZ3QgPSBndFxuZnVuY3Rpb24gZ3QgKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA+IDBcbn1cblxuZXhwb3J0cy5sdCA9IGx0XG5mdW5jdGlvbiBsdCAoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpIDwgMFxufVxuXG5leHBvcnRzLmVxID0gZXFcbmZ1bmN0aW9uIGVxIChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPT09IDBcbn1cblxuZXhwb3J0cy5uZXEgPSBuZXFcbmZ1bmN0aW9uIG5lcSAoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpICE9PSAwXG59XG5cbmV4cG9ydHMuZ3RlID0gZ3RlXG5mdW5jdGlvbiBndGUgKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA+PSAwXG59XG5cbmV4cG9ydHMubHRlID0gbHRlXG5mdW5jdGlvbiBsdGUgKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA8PSAwXG59XG5cbmV4cG9ydHMuY21wID0gY21wXG5mdW5jdGlvbiBjbXAgKGEsIG9wLCBiLCBsb29zZSkge1xuICBzd2l0Y2ggKG9wKSB7XG4gICAgY2FzZSAnPT09JzpcbiAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcpXG4gICAgICAgIGEgPSBhLnZlcnNpb25cbiAgICAgIGlmICh0eXBlb2YgYiA9PT0gJ29iamVjdCcpXG4gICAgICAgIGIgPSBiLnZlcnNpb25cbiAgICAgIHJldHVybiBhID09PSBiXG5cbiAgICBjYXNlICchPT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JylcbiAgICAgICAgYSA9IGEudmVyc2lvblxuICAgICAgaWYgKHR5cGVvZiBiID09PSAnb2JqZWN0JylcbiAgICAgICAgYiA9IGIudmVyc2lvblxuICAgICAgcmV0dXJuIGEgIT09IGJcblxuICAgIGNhc2UgJyc6XG4gICAgY2FzZSAnPSc6XG4gICAgY2FzZSAnPT0nOlxuICAgICAgcmV0dXJuIGVxKGEsIGIsIGxvb3NlKVxuXG4gICAgY2FzZSAnIT0nOlxuICAgICAgcmV0dXJuIG5lcShhLCBiLCBsb29zZSlcblxuICAgIGNhc2UgJz4nOlxuICAgICAgcmV0dXJuIGd0KGEsIGIsIGxvb3NlKVxuXG4gICAgY2FzZSAnPj0nOlxuICAgICAgcmV0dXJuIGd0ZShhLCBiLCBsb29zZSlcblxuICAgIGNhc2UgJzwnOlxuICAgICAgcmV0dXJuIGx0KGEsIGIsIGxvb3NlKVxuXG4gICAgY2FzZSAnPD0nOlxuICAgICAgcmV0dXJuIGx0ZShhLCBiLCBsb29zZSlcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG9wZXJhdG9yOiAnICsgb3ApXG4gIH1cbn1cblxuZXhwb3J0cy5Db21wYXJhdG9yID0gQ29tcGFyYXRvclxuZnVuY3Rpb24gQ29tcGFyYXRvciAoY29tcCwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIGxvb3NlOiAhIW9wdGlvbnMsXG4gICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICB9XG4gIH1cblxuICBpZiAoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IpIHtcbiAgICBpZiAoY29tcC5sb29zZSA9PT0gISFvcHRpb25zLmxvb3NlKSB7XG4gICAgICByZXR1cm4gY29tcFxuICAgIH0gZWxzZSB7XG4gICAgICBjb21wID0gY29tcC52YWx1ZVxuICAgIH1cbiAgfVxuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSkge1xuICAgIHJldHVybiBuZXcgQ29tcGFyYXRvcihjb21wLCBvcHRpb25zKVxuICB9XG5cbiAgZGVidWcoJ2NvbXBhcmF0b3InLCBjb21wLCBvcHRpb25zKVxuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2VcbiAgdGhpcy5wYXJzZShjb21wKVxuXG4gIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZKSB7XG4gICAgdGhpcy52YWx1ZSA9ICcnXG4gIH0gZWxzZSB7XG4gICAgdGhpcy52YWx1ZSA9IHRoaXMub3BlcmF0b3IgKyB0aGlzLnNlbXZlci52ZXJzaW9uXG4gIH1cblxuICBkZWJ1ZygnY29tcCcsIHRoaXMpXG59XG5cbnZhciBBTlkgPSB7fVxuQ29tcGFyYXRvci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAoY29tcCkge1xuICB2YXIgciA9IHRoaXMub3B0aW9ucy5sb29zZSA/IHJlW0NPTVBBUkFUT1JMT09TRV0gOiByZVtDT01QQVJBVE9SXVxuICB2YXIgbSA9IGNvbXAubWF0Y2gocilcblxuICBpZiAoIW0pIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNvbXBhcmF0b3I6ICcgKyBjb21wKVxuICB9XG5cbiAgdGhpcy5vcGVyYXRvciA9IG1bMV1cbiAgaWYgKHRoaXMub3BlcmF0b3IgPT09ICc9Jykge1xuICAgIHRoaXMub3BlcmF0b3IgPSAnJ1xuICB9XG5cbiAgLy8gaWYgaXQgbGl0ZXJhbGx5IGlzIGp1c3QgJz4nIG9yICcnIHRoZW4gYWxsb3cgYW55dGhpbmcuXG4gIGlmICghbVsyXSkge1xuICAgIHRoaXMuc2VtdmVyID0gQU5ZXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zZW12ZXIgPSBuZXcgU2VtVmVyKG1bMl0sIHRoaXMub3B0aW9ucy5sb29zZSlcbiAgfVxufVxuXG5Db21wYXJhdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudmFsdWVcbn1cblxuQ29tcGFyYXRvci5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uICh2ZXJzaW9uKSB7XG4gIGRlYnVnKCdDb21wYXJhdG9yLnRlc3QnLCB2ZXJzaW9uLCB0aGlzLm9wdGlvbnMubG9vc2UpXG5cbiAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnc3RyaW5nJykge1xuICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIHRoaXMub3B0aW9ucylcbiAgfVxuXG4gIHJldHVybiBjbXAodmVyc2lvbiwgdGhpcy5vcGVyYXRvciwgdGhpcy5zZW12ZXIsIHRoaXMub3B0aW9ucylcbn1cblxuQ29tcGFyYXRvci5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uIChjb21wLCBvcHRpb25zKSB7XG4gIGlmICghKGNvbXAgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2EgQ29tcGFyYXRvciBpcyByZXF1aXJlZCcpXG4gIH1cblxuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIGxvb3NlOiAhIW9wdGlvbnMsXG4gICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICB9XG4gIH1cblxuICB2YXIgcmFuZ2VUbXBcblxuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJycpIHtcbiAgICByYW5nZVRtcCA9IG5ldyBSYW5nZShjb21wLnZhbHVlLCBvcHRpb25zKVxuICAgIHJldHVybiBzYXRpc2ZpZXModGhpcy52YWx1ZSwgcmFuZ2VUbXAsIG9wdGlvbnMpXG4gIH0gZWxzZSBpZiAoY29tcC5vcGVyYXRvciA9PT0gJycpIHtcbiAgICByYW5nZVRtcCA9IG5ldyBSYW5nZSh0aGlzLnZhbHVlLCBvcHRpb25zKVxuICAgIHJldHVybiBzYXRpc2ZpZXMoY29tcC5zZW12ZXIsIHJhbmdlVG1wLCBvcHRpb25zKVxuICB9XG5cbiAgdmFyIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nID1cbiAgICAodGhpcy5vcGVyYXRvciA9PT0gJz49JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPicpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJz4nKVxuICB2YXIgc2FtZURpcmVjdGlvbkRlY3JlYXNpbmcgPVxuICAgICh0aGlzLm9wZXJhdG9yID09PSAnPD0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc8JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJzw9JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPCcpXG4gIHZhciBzYW1lU2VtVmVyID0gdGhpcy5zZW12ZXIudmVyc2lvbiA9PT0gY29tcC5zZW12ZXIudmVyc2lvblxuICB2YXIgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSA9XG4gICAgKHRoaXMub3BlcmF0b3IgPT09ICc+PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJzw9JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJz49JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPD0nKVxuICB2YXIgb3Bwb3NpdGVEaXJlY3Rpb25zTGVzc1RoYW4gPVxuICAgIGNtcCh0aGlzLnNlbXZlciwgJzwnLCBjb21wLnNlbXZlciwgb3B0aW9ucykgJiZcbiAgICAoKHRoaXMub3BlcmF0b3IgPT09ICc+PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJz4nKSAmJlxuICAgIChjb21wLm9wZXJhdG9yID09PSAnPD0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc8JykpXG4gIHZhciBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhbiA9XG4gICAgY21wKHRoaXMuc2VtdmVyLCAnPicsIGNvbXAuc2VtdmVyLCBvcHRpb25zKSAmJlxuICAgICgodGhpcy5vcGVyYXRvciA9PT0gJzw9JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPCcpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJz4nKSlcblxuICByZXR1cm4gc2FtZURpcmVjdGlvbkluY3JlYXNpbmcgfHwgc2FtZURpcmVjdGlvbkRlY3JlYXNpbmcgfHxcbiAgICAoc2FtZVNlbVZlciAmJiBkaWZmZXJlbnREaXJlY3Rpb25zSW5jbHVzaXZlKSB8fFxuICAgIG9wcG9zaXRlRGlyZWN0aW9uc0xlc3NUaGFuIHx8IG9wcG9zaXRlRGlyZWN0aW9uc0dyZWF0ZXJUaGFuXG59XG5cbmV4cG9ydHMuUmFuZ2UgPSBSYW5nZVxuZnVuY3Rpb24gUmFuZ2UgKHJhbmdlLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICBvcHRpb25zID0ge1xuICAgICAgbG9vc2U6ICEhb3B0aW9ucyxcbiAgICAgIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGlmIChyYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSB7XG4gICAgaWYgKHJhbmdlLmxvb3NlID09PSAhIW9wdGlvbnMubG9vc2UgJiZcbiAgICAgICAgcmFuZ2UuaW5jbHVkZVByZXJlbGVhc2UgPT09ICEhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkge1xuICAgICAgcmV0dXJuIHJhbmdlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UucmF3LCBvcHRpb25zKVxuICAgIH1cbiAgfVxuXG4gIGlmIChyYW5nZSBpbnN0YW5jZW9mIENvbXBhcmF0b3IpIHtcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLnZhbHVlLCBvcHRpb25zKVxuICB9XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJhbmdlKSkge1xuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpXG4gIH1cblxuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2VcbiAgdGhpcy5pbmNsdWRlUHJlcmVsZWFzZSA9ICEhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZVxuXG4gIC8vIEZpcnN0LCBzcGxpdCBiYXNlZCBvbiBib29sZWFuIG9yIHx8XG4gIHRoaXMucmF3ID0gcmFuZ2VcbiAgdGhpcy5zZXQgPSByYW5nZS5zcGxpdCgvXFxzKlxcfFxcfFxccyovKS5tYXAoZnVuY3Rpb24gKHJhbmdlKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VSYW5nZShyYW5nZS50cmltKCkpXG4gIH0sIHRoaXMpLmZpbHRlcihmdW5jdGlvbiAoYykge1xuICAgIC8vIHRocm93IG91dCBhbnkgdGhhdCBhcmUgbm90IHJlbGV2YW50IGZvciB3aGF0ZXZlciByZWFzb25cbiAgICByZXR1cm4gYy5sZW5ndGhcbiAgfSlcblxuICBpZiAoIXRoaXMuc2V0Lmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgU2VtVmVyIFJhbmdlOiAnICsgcmFuZ2UpXG4gIH1cblxuICB0aGlzLmZvcm1hdCgpXG59XG5cblJhbmdlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMucmFuZ2UgPSB0aGlzLnNldC5tYXAoZnVuY3Rpb24gKGNvbXBzKSB7XG4gICAgcmV0dXJuIGNvbXBzLmpvaW4oJyAnKS50cmltKClcbiAgfSkuam9pbignfHwnKS50cmltKClcbiAgcmV0dXJuIHRoaXMucmFuZ2Vcbn1cblxuUmFuZ2UucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5yYW5nZVxufVxuXG5SYW5nZS5wcm90b3R5cGUucGFyc2VSYW5nZSA9IGZ1bmN0aW9uIChyYW5nZSkge1xuICB2YXIgbG9vc2UgPSB0aGlzLm9wdGlvbnMubG9vc2VcbiAgcmFuZ2UgPSByYW5nZS50cmltKClcbiAgLy8gYDEuMi4zIC0gMS4yLjRgID0+IGA+PTEuMi4zIDw9MS4yLjRgXG4gIHZhciBociA9IGxvb3NlID8gcmVbSFlQSEVOUkFOR0VMT09TRV0gOiByZVtIWVBIRU5SQU5HRV1cbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKGhyLCBoeXBoZW5SZXBsYWNlKVxuICBkZWJ1ZygnaHlwaGVuIHJlcGxhY2UnLCByYW5nZSlcbiAgLy8gYD4gMS4yLjMgPCAxLjIuNWAgPT4gYD4xLjIuMyA8MS4yLjVgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtDT01QQVJBVE9SVFJJTV0sIGNvbXBhcmF0b3JUcmltUmVwbGFjZSlcbiAgZGVidWcoJ2NvbXBhcmF0b3IgdHJpbScsIHJhbmdlLCByZVtDT01QQVJBVE9SVFJJTV0pXG5cbiAgLy8gYH4gMS4yLjNgID0+IGB+MS4yLjNgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtUSUxERVRSSU1dLCB0aWxkZVRyaW1SZXBsYWNlKVxuXG4gIC8vIGBeIDEuMi4zYCA9PiBgXjEuMi4zYFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbQ0FSRVRUUklNXSwgY2FyZXRUcmltUmVwbGFjZSlcblxuICAvLyBub3JtYWxpemUgc3BhY2VzXG4gIHJhbmdlID0gcmFuZ2Uuc3BsaXQoL1xccysvKS5qb2luKCcgJylcblxuICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgcmFuZ2UgaXMgY29tcGxldGVseSB0cmltbWVkIGFuZFxuICAvLyByZWFkeSB0byBiZSBzcGxpdCBpbnRvIGNvbXBhcmF0b3JzLlxuXG4gIHZhciBjb21wUmUgPSBsb29zZSA/IHJlW0NPTVBBUkFUT1JMT09TRV0gOiByZVtDT01QQVJBVE9SXVxuICB2YXIgc2V0ID0gcmFuZ2Uuc3BsaXQoJyAnKS5tYXAoZnVuY3Rpb24gKGNvbXApIHtcbiAgICByZXR1cm4gcGFyc2VDb21wYXJhdG9yKGNvbXAsIHRoaXMub3B0aW9ucylcbiAgfSwgdGhpcykuam9pbignICcpLnNwbGl0KC9cXHMrLylcbiAgaWYgKHRoaXMub3B0aW9ucy5sb29zZSkge1xuICAgIC8vIGluIGxvb3NlIG1vZGUsIHRocm93IG91dCBhbnkgdGhhdCBhcmUgbm90IHZhbGlkIGNvbXBhcmF0b3JzXG4gICAgc2V0ID0gc2V0LmZpbHRlcihmdW5jdGlvbiAoY29tcCkge1xuICAgICAgcmV0dXJuICEhY29tcC5tYXRjaChjb21wUmUpXG4gICAgfSlcbiAgfVxuICBzZXQgPSBzZXQubWFwKGZ1bmN0aW9uIChjb21wKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIHRoaXMub3B0aW9ucylcbiAgfSwgdGhpcylcblxuICByZXR1cm4gc2V0XG59XG5cblJhbmdlLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24gKHJhbmdlLCBvcHRpb25zKSB7XG4gIGlmICghKHJhbmdlIGluc3RhbmNlb2YgUmFuZ2UpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYSBSYW5nZSBpcyByZXF1aXJlZCcpXG4gIH1cblxuICByZXR1cm4gdGhpcy5zZXQuc29tZShmdW5jdGlvbiAodGhpc0NvbXBhcmF0b3JzKSB7XG4gICAgcmV0dXJuIHRoaXNDb21wYXJhdG9ycy5ldmVyeShmdW5jdGlvbiAodGhpc0NvbXBhcmF0b3IpIHtcbiAgICAgIHJldHVybiByYW5nZS5zZXQuc29tZShmdW5jdGlvbiAocmFuZ2VDb21wYXJhdG9ycykge1xuICAgICAgICByZXR1cm4gcmFuZ2VDb21wYXJhdG9ycy5ldmVyeShmdW5jdGlvbiAocmFuZ2VDb21wYXJhdG9yKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNDb21wYXJhdG9yLmludGVyc2VjdHMocmFuZ2VDb21wYXJhdG9yLCBvcHRpb25zKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufVxuXG4vLyBNb3N0bHkganVzdCBmb3IgdGVzdGluZyBhbmQgbGVnYWN5IEFQSSByZWFzb25zXG5leHBvcnRzLnRvQ29tcGFyYXRvcnMgPSB0b0NvbXBhcmF0b3JzXG5mdW5jdGlvbiB0b0NvbXBhcmF0b3JzIChyYW5nZSwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKS5zZXQubWFwKGZ1bmN0aW9uIChjb21wKSB7XG4gICAgcmV0dXJuIGNvbXAubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZVxuICAgIH0pLmpvaW4oJyAnKS50cmltKCkuc3BsaXQoJyAnKVxuICB9KVxufVxuXG4vLyBjb21wcmlzZWQgb2YgeHJhbmdlcywgdGlsZGVzLCBzdGFycywgYW5kIGd0bHQncyBhdCB0aGlzIHBvaW50LlxuLy8gYWxyZWFkeSByZXBsYWNlZCB0aGUgaHlwaGVuIHJhbmdlc1xuLy8gdHVybiBpbnRvIGEgc2V0IG9mIEpVU1QgY29tcGFyYXRvcnMuXG5mdW5jdGlvbiBwYXJzZUNvbXBhcmF0b3IgKGNvbXAsIG9wdGlvbnMpIHtcbiAgZGVidWcoJ2NvbXAnLCBjb21wLCBvcHRpb25zKVxuICBjb21wID0gcmVwbGFjZUNhcmV0cyhjb21wLCBvcHRpb25zKVxuICBkZWJ1ZygnY2FyZXQnLCBjb21wKVxuICBjb21wID0gcmVwbGFjZVRpbGRlcyhjb21wLCBvcHRpb25zKVxuICBkZWJ1ZygndGlsZGVzJywgY29tcClcbiAgY29tcCA9IHJlcGxhY2VYUmFuZ2VzKGNvbXAsIG9wdGlvbnMpXG4gIGRlYnVnKCd4cmFuZ2UnLCBjb21wKVxuICBjb21wID0gcmVwbGFjZVN0YXJzKGNvbXAsIG9wdGlvbnMpXG4gIGRlYnVnKCdzdGFycycsIGNvbXApXG4gIHJldHVybiBjb21wXG59XG5cbmZ1bmN0aW9uIGlzWCAoaWQpIHtcbiAgcmV0dXJuICFpZCB8fCBpZC50b0xvd2VyQ2FzZSgpID09PSAneCcgfHwgaWQgPT09ICcqJ1xufVxuXG4vLyB+LCB+PiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIH4yLCB+Mi54LCB+Mi54LngsIH4+Miwgfj4yLnggfj4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIH4yLjAsIH4yLjAueCwgfj4yLjAsIH4+Mi4wLnggLS0+ID49Mi4wLjAgPDIuMS4wXG4vLyB+MS4yLCB+MS4yLngsIH4+MS4yLCB+PjEuMi54IC0tPiA+PTEuMi4wIDwxLjMuMFxuLy8gfjEuMi4zLCB+PjEuMi4zIC0tPiA+PTEuMi4zIDwxLjMuMFxuLy8gfjEuMi4wLCB+PjEuMi4wIC0tPiA+PTEuMi4wIDwxLjMuMFxuZnVuY3Rpb24gcmVwbGFjZVRpbGRlcyAoY29tcCwgb3B0aW9ucykge1xuICByZXR1cm4gY29tcC50cmltKCkuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24gKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZVRpbGRlKGNvbXAsIG9wdGlvbnMpXG4gIH0pLmpvaW4oJyAnKVxufVxuXG5mdW5jdGlvbiByZXBsYWNlVGlsZGUgKGNvbXAsIG9wdGlvbnMpIHtcbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbVElMREVMT09TRV0gOiByZVtUSUxERV1cbiAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCBmdW5jdGlvbiAoXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygndGlsZGUnLCBjb21wLCBfLCBNLCBtLCBwLCBwcilcbiAgICB2YXIgcmV0XG5cbiAgICBpZiAoaXNYKE0pKSB7XG4gICAgICByZXQgPSAnJ1xuICAgIH0gZWxzZSBpZiAoaXNYKG0pKSB7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCdcbiAgICB9IGVsc2UgaWYgKGlzWChwKSkge1xuICAgICAgLy8gfjEuMiA9PSA+PTEuMi4wIDwxLjMuMFxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJ1xuICAgIH0gZWxzZSBpZiAocHIpIHtcbiAgICAgIGRlYnVnKCdyZXBsYWNlVGlsZGUgcHInLCBwcilcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyAnLScgKyBwciArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJ1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB+MS4yLjMgPT0gPj0xLjIuMyA8MS4zLjBcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCdcbiAgICB9XG5cbiAgICBkZWJ1ZygndGlsZGUgcmV0dXJuJywgcmV0KVxuICAgIHJldHVybiByZXRcbiAgfSlcbn1cblxuLy8gXiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIF4yLCBeMi54LCBeMi54LnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyBeMi4wLCBeMi4wLnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyBeMS4yLCBeMS4yLnggLS0+ID49MS4yLjAgPDIuMC4wXG4vLyBeMS4yLjMgLS0+ID49MS4yLjMgPDIuMC4wXG4vLyBeMS4yLjAgLS0+ID49MS4yLjAgPDIuMC4wXG5mdW5jdGlvbiByZXBsYWNlQ2FyZXRzIChjb21wLCBvcHRpb25zKSB7XG4gIHJldHVybiBjb21wLnRyaW0oKS5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbiAoY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlQ2FyZXQoY29tcCwgb3B0aW9ucylcbiAgfSkuam9pbignICcpXG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VDYXJldCAoY29tcCwgb3B0aW9ucykge1xuICBkZWJ1ZygnY2FyZXQnLCBjb21wLCBvcHRpb25zKVxuICB2YXIgciA9IG9wdGlvbnMubG9vc2UgPyByZVtDQVJFVExPT1NFXSA6IHJlW0NBUkVUXVxuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uIChfLCBNLCBtLCBwLCBwcikge1xuICAgIGRlYnVnKCdjYXJldCcsIGNvbXAsIF8sIE0sIG0sIHAsIHByKVxuICAgIHZhciByZXRcblxuICAgIGlmIChpc1goTSkpIHtcbiAgICAgIHJldCA9ICcnXG4gICAgfSBlbHNlIGlmIChpc1gobSkpIHtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4wLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJ1xuICAgIH0gZWxzZSBpZiAoaXNYKHApKSB7XG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCdcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArICgrTSArIDEpICsgJy4wLjAnXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VDYXJldCBwcicsIHByKVxuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKSB7XG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArICctJyArIHByICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArIG0gKyAnLicgKyAoK3AgKyAxKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyAnLScgKyBwciArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCdcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArICctJyArIHByICtcbiAgICAgICAgICAgICAgJyA8JyArICgrTSArIDEpICsgJy4wLjAnXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnKCdubyBwcicpXG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIGlmIChtID09PSAnMCcpIHtcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArIG0gKyAnLicgKyAoK3AgKyAxKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgICAnIDwnICsgKCtNICsgMSkgKyAnLjAuMCdcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkZWJ1ZygnY2FyZXQgcmV0dXJuJywgcmV0KVxuICAgIHJldHVybiByZXRcbiAgfSlcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZXMgKGNvbXAsIG9wdGlvbnMpIHtcbiAgZGVidWcoJ3JlcGxhY2VYUmFuZ2VzJywgY29tcCwgb3B0aW9ucylcbiAgcmV0dXJuIGNvbXAuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24gKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZVhSYW5nZShjb21wLCBvcHRpb25zKVxuICB9KS5qb2luKCcgJylcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZSAoY29tcCwgb3B0aW9ucykge1xuICBjb21wID0gY29tcC50cmltKClcbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbWFJBTkdFTE9PU0VdIDogcmVbWFJBTkdFXVxuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uIChyZXQsIGd0bHQsIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ3hSYW5nZScsIGNvbXAsIHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpXG4gICAgdmFyIHhNID0gaXNYKE0pXG4gICAgdmFyIHhtID0geE0gfHwgaXNYKG0pXG4gICAgdmFyIHhwID0geG0gfHwgaXNYKHApXG4gICAgdmFyIGFueVggPSB4cFxuXG4gICAgaWYgKGd0bHQgPT09ICc9JyAmJiBhbnlYKSB7XG4gICAgICBndGx0ID0gJydcbiAgICB9XG5cbiAgICBpZiAoeE0pIHtcbiAgICAgIGlmIChndGx0ID09PSAnPicgfHwgZ3RsdCA9PT0gJzwnKSB7XG4gICAgICAgIC8vIG5vdGhpbmcgaXMgYWxsb3dlZFxuICAgICAgICByZXQgPSAnPDAuMC4wJ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBmb3JiaWRkZW5cbiAgICAgICAgcmV0ID0gJyonXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChndGx0ICYmIGFueVgpIHtcbiAgICAgIC8vIHdlIGtub3cgcGF0Y2ggaXMgYW4geCwgYmVjYXVzZSB3ZSBoYXZlIGFueSB4IGF0IGFsbC5cbiAgICAgIC8vIHJlcGxhY2UgWCB3aXRoIDBcbiAgICAgIGlmICh4bSkge1xuICAgICAgICBtID0gMFxuICAgICAgfVxuICAgICAgcCA9IDBcblxuICAgICAgaWYgKGd0bHQgPT09ICc+Jykge1xuICAgICAgICAvLyA+MSA9PiA+PTIuMC4wXG4gICAgICAgIC8vID4xLjIgPT4gPj0xLjMuMFxuICAgICAgICAvLyA+MS4yLjMgPT4gPj0gMS4yLjRcbiAgICAgICAgZ3RsdCA9ICc+PSdcbiAgICAgICAgaWYgKHhtKSB7XG4gICAgICAgICAgTSA9ICtNICsgMVxuICAgICAgICAgIG0gPSAwXG4gICAgICAgICAgcCA9IDBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtID0gK20gKyAxXG4gICAgICAgICAgcCA9IDBcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChndGx0ID09PSAnPD0nKSB7XG4gICAgICAgIC8vIDw9MC43LnggaXMgYWN0dWFsbHkgPDAuOC4wLCBzaW5jZSBhbnkgMC43Lnggc2hvdWxkXG4gICAgICAgIC8vIHBhc3MuICBTaW1pbGFybHksIDw9Ny54IGlzIGFjdHVhbGx5IDw4LjAuMCwgZXRjLlxuICAgICAgICBndGx0ID0gJzwnXG4gICAgICAgIGlmICh4bSkge1xuICAgICAgICAgIE0gPSArTSArIDFcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtID0gK20gKyAxXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0ID0gZ3RsdCArIE0gKyAnLicgKyBtICsgJy4nICsgcFxuICAgIH0gZWxzZSBpZiAoeG0pIHtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4wLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJ1xuICAgIH0gZWxzZSBpZiAoeHApIHtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCdcbiAgICB9XG5cbiAgICBkZWJ1ZygneFJhbmdlIHJldHVybicsIHJldClcblxuICAgIHJldHVybiByZXRcbiAgfSlcbn1cblxuLy8gQmVjYXVzZSAqIGlzIEFORC1lZCB3aXRoIGV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgY29tcGFyYXRvcixcbi8vIGFuZCAnJyBtZWFucyBcImFueSB2ZXJzaW9uXCIsIGp1c3QgcmVtb3ZlIHRoZSAqcyBlbnRpcmVseS5cbmZ1bmN0aW9uIHJlcGxhY2VTdGFycyAoY29tcCwgb3B0aW9ucykge1xuICBkZWJ1ZygncmVwbGFjZVN0YXJzJywgY29tcCwgb3B0aW9ucylcbiAgLy8gTG9vc2VuZXNzIGlzIGlnbm9yZWQgaGVyZS4gIHN0YXIgaXMgYWx3YXlzIGFzIGxvb3NlIGFzIGl0IGdldHMhXG4gIHJldHVybiBjb21wLnRyaW0oKS5yZXBsYWNlKHJlW1NUQVJdLCAnJylcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBpcyBwYXNzZWQgdG8gc3RyaW5nLnJlcGxhY2UocmVbSFlQSEVOUkFOR0VdKVxuLy8gTSwgbSwgcGF0Y2gsIHByZXJlbGVhc2UsIGJ1aWxkXG4vLyAxLjIgLSAzLjQuNSA9PiA+PTEuMi4wIDw9My40LjVcbi8vIDEuMi4zIC0gMy40ID0+ID49MS4yLjAgPDMuNS4wIEFueSAzLjQueCB3aWxsIGRvXG4vLyAxLjIgLSAzLjQgPT4gPj0xLjIuMCA8My41LjBcbmZ1bmN0aW9uIGh5cGhlblJlcGxhY2UgKCQwLFxuICBmcm9tLCBmTSwgZm0sIGZwLCBmcHIsIGZiLFxuICB0bywgdE0sIHRtLCB0cCwgdHByLCB0Yikge1xuICBpZiAoaXNYKGZNKSkge1xuICAgIGZyb20gPSAnJ1xuICB9IGVsc2UgaWYgKGlzWChmbSkpIHtcbiAgICBmcm9tID0gJz49JyArIGZNICsgJy4wLjAnXG4gIH0gZWxzZSBpZiAoaXNYKGZwKSkge1xuICAgIGZyb20gPSAnPj0nICsgZk0gKyAnLicgKyBmbSArICcuMCdcbiAgfSBlbHNlIHtcbiAgICBmcm9tID0gJz49JyArIGZyb21cbiAgfVxuXG4gIGlmIChpc1godE0pKSB7XG4gICAgdG8gPSAnJ1xuICB9IGVsc2UgaWYgKGlzWCh0bSkpIHtcbiAgICB0byA9ICc8JyArICgrdE0gKyAxKSArICcuMC4wJ1xuICB9IGVsc2UgaWYgKGlzWCh0cCkpIHtcbiAgICB0byA9ICc8JyArIHRNICsgJy4nICsgKCt0bSArIDEpICsgJy4wJ1xuICB9IGVsc2UgaWYgKHRwcikge1xuICAgIHRvID0gJzw9JyArIHRNICsgJy4nICsgdG0gKyAnLicgKyB0cCArICctJyArIHRwclxuICB9IGVsc2Uge1xuICAgIHRvID0gJzw9JyArIHRvXG4gIH1cblxuICByZXR1cm4gKGZyb20gKyAnICcgKyB0bykudHJpbSgpXG59XG5cbi8vIGlmIEFOWSBvZiB0aGUgc2V0cyBtYXRjaCBBTEwgb2YgaXRzIGNvbXBhcmF0b3JzLCB0aGVuIHBhc3NcblJhbmdlLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24gKHZlcnNpb24pIHtcbiAgaWYgKCF2ZXJzaW9uKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgdGhpcy5vcHRpb25zKVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNldC5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0ZXN0U2V0KHRoaXMuc2V0W2ldLCB2ZXJzaW9uLCB0aGlzLm9wdGlvbnMpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gdGVzdFNldCAoc2V0LCB2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCFzZXRbaV0udGVzdCh2ZXJzaW9uKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgaWYgKHZlcnNpb24ucHJlcmVsZWFzZS5sZW5ndGggJiYgIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UpIHtcbiAgICAvLyBGaW5kIHRoZSBzZXQgb2YgdmVyc2lvbnMgdGhhdCBhcmUgYWxsb3dlZCB0byBoYXZlIHByZXJlbGVhc2VzXG4gICAgLy8gRm9yIGV4YW1wbGUsIF4xLjIuMy1wci4xIGRlc3VnYXJzIHRvID49MS4yLjMtcHIuMSA8Mi4wLjBcbiAgICAvLyBUaGF0IHNob3VsZCBhbGxvdyBgMS4yLjMtcHIuMmAgdG8gcGFzcy5cbiAgICAvLyBIb3dldmVyLCBgMS4yLjQtYWxwaGEubm90cmVhZHlgIHNob3VsZCBOT1QgYmUgYWxsb3dlZCxcbiAgICAvLyBldmVuIHRob3VnaCBpdCdzIHdpdGhpbiB0aGUgcmFuZ2Ugc2V0IGJ5IHRoZSBjb21wYXJhdG9ycy5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBkZWJ1ZyhzZXRbaV0uc2VtdmVyKVxuICAgICAgaWYgKHNldFtpXS5zZW12ZXIgPT09IEFOWSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAoc2V0W2ldLnNlbXZlci5wcmVyZWxlYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGFsbG93ZWQgPSBzZXRbaV0uc2VtdmVyXG4gICAgICAgIGlmIChhbGxvd2VkLm1ham9yID09PSB2ZXJzaW9uLm1ham9yICYmXG4gICAgICAgICAgICBhbGxvd2VkLm1pbm9yID09PSB2ZXJzaW9uLm1pbm9yICYmXG4gICAgICAgICAgICBhbGxvd2VkLnBhdGNoID09PSB2ZXJzaW9uLnBhdGNoKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZlcnNpb24gaGFzIGEgLXByZSwgYnV0IGl0J3Mgbm90IG9uZSBvZiB0aGUgb25lcyB3ZSBsaWtlLlxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZXhwb3J0cy5zYXRpc2ZpZXMgPSBzYXRpc2ZpZXNcbmZ1bmN0aW9uIHNhdGlzZmllcyAodmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICByYW5nZSA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucylcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gcmFuZ2UudGVzdCh2ZXJzaW9uKVxufVxuXG5leHBvcnRzLm1heFNhdGlzZnlpbmcgPSBtYXhTYXRpc2Z5aW5nXG5mdW5jdGlvbiBtYXhTYXRpc2Z5aW5nICh2ZXJzaW9ucywgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgdmFyIG1heCA9IG51bGxcbiAgdmFyIG1heFNWID0gbnVsbFxuICB0cnkge1xuICAgIHZhciByYW5nZU9iaiA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucylcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIHZlcnNpb25zLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICBpZiAocmFuZ2VPYmoudGVzdCh2KSkge1xuICAgICAgLy8gc2F0aXNmaWVzKHYsIHJhbmdlLCBvcHRpb25zKVxuICAgICAgaWYgKCFtYXggfHwgbWF4U1YuY29tcGFyZSh2KSA9PT0gLTEpIHtcbiAgICAgICAgLy8gY29tcGFyZShtYXgsIHYsIHRydWUpXG4gICAgICAgIG1heCA9IHZcbiAgICAgICAgbWF4U1YgPSBuZXcgU2VtVmVyKG1heCwgb3B0aW9ucylcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBtYXhcbn1cblxuZXhwb3J0cy5taW5TYXRpc2Z5aW5nID0gbWluU2F0aXNmeWluZ1xuZnVuY3Rpb24gbWluU2F0aXNmeWluZyAodmVyc2lvbnMsIHJhbmdlLCBvcHRpb25zKSB7XG4gIHZhciBtaW4gPSBudWxsXG4gIHZhciBtaW5TViA9IG51bGxcbiAgdHJ5IHtcbiAgICB2YXIgcmFuZ2VPYmogPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICB2ZXJzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgaWYgKHJhbmdlT2JqLnRlc3QodikpIHtcbiAgICAgIC8vIHNhdGlzZmllcyh2LCByYW5nZSwgb3B0aW9ucylcbiAgICAgIGlmICghbWluIHx8IG1pblNWLmNvbXBhcmUodikgPT09IDEpIHtcbiAgICAgICAgLy8gY29tcGFyZShtaW4sIHYsIHRydWUpXG4gICAgICAgIG1pbiA9IHZcbiAgICAgICAgbWluU1YgPSBuZXcgU2VtVmVyKG1pbiwgb3B0aW9ucylcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBtaW5cbn1cblxuZXhwb3J0cy5taW5WZXJzaW9uID0gbWluVmVyc2lvblxuZnVuY3Rpb24gbWluVmVyc2lvbiAocmFuZ2UsIGxvb3NlKSB7XG4gIHJhbmdlID0gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSlcblxuICB2YXIgbWludmVyID0gbmV3IFNlbVZlcignMC4wLjAnKVxuICBpZiAocmFuZ2UudGVzdChtaW52ZXIpKSB7XG4gICAgcmV0dXJuIG1pbnZlclxuICB9XG5cbiAgbWludmVyID0gbmV3IFNlbVZlcignMC4wLjAtMCcpXG4gIGlmIChyYW5nZS50ZXN0KG1pbnZlcikpIHtcbiAgICByZXR1cm4gbWludmVyXG4gIH1cblxuICBtaW52ZXIgPSBudWxsXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2Uuc2V0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGNvbXBhcmF0b3JzID0gcmFuZ2Uuc2V0W2ldXG5cbiAgICBjb21wYXJhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChjb21wYXJhdG9yKSB7XG4gICAgICAvLyBDbG9uZSB0byBhdm9pZCBtYW5pcHVsYXRpbmcgdGhlIGNvbXBhcmF0b3IncyBzZW12ZXIgb2JqZWN0LlxuICAgICAgdmFyIGNvbXB2ZXIgPSBuZXcgU2VtVmVyKGNvbXBhcmF0b3Iuc2VtdmVyLnZlcnNpb24pXG4gICAgICBzd2l0Y2ggKGNvbXBhcmF0b3Iub3BlcmF0b3IpIHtcbiAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgaWYgKGNvbXB2ZXIucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbXB2ZXIucGF0Y2grK1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wdmVyLnByZXJlbGVhc2UucHVzaCgwKVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb21wdmVyLnJhdyA9IGNvbXB2ZXIuZm9ybWF0KClcbiAgICAgICAgICAvKiBmYWxsdGhyb3VnaCAqL1xuICAgICAgICBjYXNlICcnOlxuICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgaWYgKCFtaW52ZXIgfHwgZ3QobWludmVyLCBjb21wdmVyKSkge1xuICAgICAgICAgICAgbWludmVyID0gY29tcHZlclxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgIC8qIElnbm9yZSBtYXhpbXVtIHZlcnNpb25zICovXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgb3BlcmF0aW9uOiAnICsgY29tcGFyYXRvci5vcGVyYXRvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgaWYgKG1pbnZlciAmJiByYW5nZS50ZXN0KG1pbnZlcikpIHtcbiAgICByZXR1cm4gbWludmVyXG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnRzLnZhbGlkUmFuZ2UgPSB2YWxpZFJhbmdlXG5mdW5jdGlvbiB2YWxpZFJhbmdlIChyYW5nZSwgb3B0aW9ucykge1xuICB0cnkge1xuICAgIC8vIFJldHVybiAnKicgaW5zdGVhZCBvZiAnJyBzbyB0aGF0IHRydXRoaW5lc3Mgd29ya3MuXG4gICAgLy8gVGhpcyB3aWxsIHRocm93IGlmIGl0J3MgaW52YWxpZCBhbnl3YXlcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKS5yYW5nZSB8fCAnKidcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGxlc3MgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZVxuZXhwb3J0cy5sdHIgPSBsdHJcbmZ1bmN0aW9uIGx0ciAodmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsICc8Jywgb3B0aW9ucylcbn1cblxuLy8gRGV0ZXJtaW5lIGlmIHZlcnNpb24gaXMgZ3JlYXRlciB0aGFuIGFsbCB0aGUgdmVyc2lvbnMgcG9zc2libGUgaW4gdGhlIHJhbmdlLlxuZXhwb3J0cy5ndHIgPSBndHJcbmZ1bmN0aW9uIGd0ciAodmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsICc+Jywgb3B0aW9ucylcbn1cblxuZXhwb3J0cy5vdXRzaWRlID0gb3V0c2lkZVxuZnVuY3Rpb24gb3V0c2lkZSAodmVyc2lvbiwgcmFuZ2UsIGhpbG8sIG9wdGlvbnMpIHtcbiAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucylcbiAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpXG5cbiAgdmFyIGd0Zm4sIGx0ZWZuLCBsdGZuLCBjb21wLCBlY29tcFxuICBzd2l0Y2ggKGhpbG8pIHtcbiAgICBjYXNlICc+JzpcbiAgICAgIGd0Zm4gPSBndFxuICAgICAgbHRlZm4gPSBsdGVcbiAgICAgIGx0Zm4gPSBsdFxuICAgICAgY29tcCA9ICc+J1xuICAgICAgZWNvbXAgPSAnPj0nXG4gICAgICBicmVha1xuICAgIGNhc2UgJzwnOlxuICAgICAgZ3RmbiA9IGx0XG4gICAgICBsdGVmbiA9IGd0ZVxuICAgICAgbHRmbiA9IGd0XG4gICAgICBjb21wID0gJzwnXG4gICAgICBlY29tcCA9ICc8PSdcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcHJvdmlkZSBhIGhpbG8gdmFsIG9mIFwiPFwiIG9yIFwiPlwiJylcbiAgfVxuXG4gIC8vIElmIGl0IHNhdGlzaWZlcyB0aGUgcmFuZ2UgaXQgaXMgbm90IG91dHNpZGVcbiAgaWYgKHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIEZyb20gbm93IG9uLCB2YXJpYWJsZSB0ZXJtcyBhcmUgYXMgaWYgd2UncmUgaW4gXCJndHJcIiBtb2RlLlxuICAvLyBidXQgbm90ZSB0aGF0IGV2ZXJ5dGhpbmcgaXMgZmxpcHBlZCBmb3IgdGhlIFwibHRyXCIgZnVuY3Rpb24uXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZS5zZXQubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgY29tcGFyYXRvcnMgPSByYW5nZS5zZXRbaV1cblxuICAgIHZhciBoaWdoID0gbnVsbFxuICAgIHZhciBsb3cgPSBudWxsXG5cbiAgICBjb21wYXJhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChjb21wYXJhdG9yKSB7XG4gICAgICBpZiAoY29tcGFyYXRvci5zZW12ZXIgPT09IEFOWSkge1xuICAgICAgICBjb21wYXJhdG9yID0gbmV3IENvbXBhcmF0b3IoJz49MC4wLjAnKVxuICAgICAgfVxuICAgICAgaGlnaCA9IGhpZ2ggfHwgY29tcGFyYXRvclxuICAgICAgbG93ID0gbG93IHx8IGNvbXBhcmF0b3JcbiAgICAgIGlmIChndGZuKGNvbXBhcmF0b3Iuc2VtdmVyLCBoaWdoLnNlbXZlciwgb3B0aW9ucykpIHtcbiAgICAgICAgaGlnaCA9IGNvbXBhcmF0b3JcbiAgICAgIH0gZWxzZSBpZiAobHRmbihjb21wYXJhdG9yLnNlbXZlciwgbG93LnNlbXZlciwgb3B0aW9ucykpIHtcbiAgICAgICAgbG93ID0gY29tcGFyYXRvclxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBJZiB0aGUgZWRnZSB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGEgb3BlcmF0b3IgdGhlbiBvdXIgdmVyc2lvblxuICAgIC8vIGlzbid0IG91dHNpZGUgaXRcbiAgICBpZiAoaGlnaC5vcGVyYXRvciA9PT0gY29tcCB8fCBoaWdoLm9wZXJhdG9yID09PSBlY29tcCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGxvd2VzdCB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGFuIG9wZXJhdG9yIGFuZCBvdXIgdmVyc2lvblxuICAgIC8vIGlzIGxlc3MgdGhhbiBpdCB0aGVuIGl0IGlzbid0IGhpZ2hlciB0aGFuIHRoZSByYW5nZVxuICAgIGlmICgoIWxvdy5vcGVyYXRvciB8fCBsb3cub3BlcmF0b3IgPT09IGNvbXApICYmXG4gICAgICAgIGx0ZWZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2UgaWYgKGxvdy5vcGVyYXRvciA9PT0gZWNvbXAgJiYgbHRmbih2ZXJzaW9uLCBsb3cuc2VtdmVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbmV4cG9ydHMucHJlcmVsZWFzZSA9IHByZXJlbGVhc2VcbmZ1bmN0aW9uIHByZXJlbGVhc2UgKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHBhcnNlZCA9IHBhcnNlKHZlcnNpb24sIG9wdGlvbnMpXG4gIHJldHVybiAocGFyc2VkICYmIHBhcnNlZC5wcmVyZWxlYXNlLmxlbmd0aCkgPyBwYXJzZWQucHJlcmVsZWFzZSA6IG51bGxcbn1cblxuZXhwb3J0cy5pbnRlcnNlY3RzID0gaW50ZXJzZWN0c1xuZnVuY3Rpb24gaW50ZXJzZWN0cyAocjEsIHIyLCBvcHRpb25zKSB7XG4gIHIxID0gbmV3IFJhbmdlKHIxLCBvcHRpb25zKVxuICByMiA9IG5ldyBSYW5nZShyMiwgb3B0aW9ucylcbiAgcmV0dXJuIHIxLmludGVyc2VjdHMocjIpXG59XG5cbmV4cG9ydHMuY29lcmNlID0gY29lcmNlXG5mdW5jdGlvbiBjb2VyY2UgKHZlcnNpb24pIHtcbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpIHtcbiAgICByZXR1cm4gdmVyc2lvblxuICB9XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICB2YXIgbWF0Y2ggPSB2ZXJzaW9uLm1hdGNoKHJlW0NPRVJDRV0pXG5cbiAgaWYgKG1hdGNoID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgcmV0dXJuIHBhcnNlKG1hdGNoWzFdICtcbiAgICAnLicgKyAobWF0Y2hbMl0gfHwgJzAnKSArXG4gICAgJy4nICsgKG1hdGNoWzNdIHx8ICcwJykpXG59XG4iLCJpbXBvcnQgdGwgPSByZXF1aXJlKFwiYXp1cmUtcGlwZWxpbmVzLXRhc2stbGliL3Rhc2tcIik7XHJcbmltcG9ydCB0ciA9IHJlcXVpcmUoXCJhenVyZS1waXBlbGluZXMtdGFzay1saWIvdG9vbHJ1bm5lclwiKTtcclxuaW1wb3J0IGZzID0gcmVxdWlyZShcImZzXCIpO1xyXG5pbXBvcnQgb3MgPSByZXF1aXJlKFwib3NcIik7XHJcbmltcG9ydCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XHJcbmltcG9ydCB1dWlkVjQgPSByZXF1aXJlKFwidXVpZC92NFwiKTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJ1bigpe1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB0bC5zZXRSZXNvdXJjZVBhdGgocGF0aC5qb2luKF9fZGlybmFtZSwgXCJ0YXNrLmpzb25cIikpO1xyXG5cclxuICAgICAgICAvLyBHZXQgaW5wdXRzLlxyXG4gICAgICAgIGNvbnN0IGVycm9yQWN0aW9uUHJlZmVyZW5jZTogc3RyaW5nID0gdGwuZ2V0SW5wdXQoXCJlcnJvckFjdGlvblByZWZlcmVuY2VcIiwgZmFsc2UpIHx8IFwiU3RvcFwiO1xyXG4gICAgICAgIHN3aXRjaCAoZXJyb3JBY3Rpb25QcmVmZXJlbmNlLnRvVXBwZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgY2FzZSBcIlNUT1BcIjpcclxuICAgICAgICAgICAgY2FzZSBcIkNPTlRJTlVFXCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJTSUxFTlRMWUNPTlRJTlVFXCI6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih0bC5sb2MoXCJKU19JbnZhbGlkRXJyb3JBY3Rpb25QcmVmZXJlbmNlXCIsIGVycm9yQWN0aW9uUHJlZmVyZW5jZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgU2VydmljZUVuZHBvaW50ID0gdGwuZ2V0SW5wdXQoXCJzY2NtY3JlZGVudGlhbHNcIiwgdHJ1ZSk7XHJcbiAgICAgICAgLy8gU0NDTSBDb25maWd1cmF0aW9uXHJcbiAgICAgICAgY29uc3Qgc2NjbVBhY2thZ2VOYW1lID0gdGwuZ2V0SW5wdXQoXCJVbmlxdWVQYWNrYWdlTmFtZVwiLCB0cnVlKTtcclxuICAgICAgICBjb25zdCBzY2NtUGFja2FnZVBhdGggPSB0bC5nZXRJbnB1dChcIlBhY2thZ2VQYXRoXCIsIHRydWUpO1xyXG4gICAgICAgIGNvbnN0IHNjY21Gb2xkZXJQYXRoID0gdGwuZ2V0SW5wdXQoXCJTY2NtRm9sZGVyUGF0aFwiLCB0cnVlKTtcclxuICAgICAgICBjb25zdCBkcEdyb3Vwc1N0cmluZyA9IHRsLmdldElucHV0KFwiZHBHcm91cHNcIiwgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKGRwR3JvdXBzU3RyaW5nICE9PSB1bmRlZmluZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgIGNvbnN0IHNjY21EcEdyb3Vwczogc3RyaW5nW10gPSBkcEdyb3Vwc1N0cmluZy5zcGxpdChcIixcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEFwcGxpY2F0aW9uIENvbmZpZ3VyYXRpb25cclxuICAgICAgICBjb25zdCBhcHBOYW1lID0gdGwuZ2V0SW5wdXQoXCJhcHBOYW1lXCIsIHRydWUpO1xyXG4gICAgICAgIGNvbnN0IGFwcERlc2NyaXB0aW9uID0gdGwuZ2V0SW5wdXQoXCJhcHBEZXNjcmlwdGlvblwiLCB0cnVlKTtcclxuICAgICAgICBjb25zdCBhcHBJY29uUGF0aCA9IHRsLmdldElucHV0KFwiYXBwSWNvblwiLCB0cnVlKTtcclxuICAgICAgICBjb25zdCBhcHBLZXl3b3JkID0gdGwuZ2V0SW5wdXQoXCJhcHBLZXl3b3JkXCIsIGZhbHNlKTtcclxuICAgICAgICBjb25zdCBhcHBWZXJzaW9uID0gdGwuZ2V0SW5wdXQoXCJhcHBWZXJzaW9uXCIsIHRydWUpO1xyXG4gICAgICAgIGNvbnN0IGFwcFB1Ymxpc2hlciA9IHRsLmdldElucHV0KFwiYXBwUHVibGlzaGVyXCIsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgY29uc3QgZW5kcG9pbnQgPSBcIlwiO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFNlcnZpY2VFbmRwb2ludCk7XHJcbiAgICAgICAgLy8gR2VuZXJhdGUgdGhlIHNjcmlwdCBjb250ZW50cy5cclxuICAgICAgICBjb25zb2xlLmxvZyh0bC5sb2MoXCJHZW5lcmF0aW5nU2NyaXB0XCIpKTtcclxuICAgICAgICBjb25zdCBjb250ZW50czogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAgICAgLy8gV2UgZGVmaW5lIGNyZWRlbnRpYWxzIGZvciBzY2NtIHNlcnZlclxyXG4gICAgICAgIGNvbnRlbnRzLnB1c2goXCIkcHdkID0gQ29udmVydFRvLVNlY3VyZVN0cmluZyAnTXlQQDU1dzByZCcgLUFzUGxhaW5UZXh0IC1Gb3JjZVwiKTtcclxuICAgICAgICBjb250ZW50cy5wdXNoKFwiJGNyZWRlbnRpYWxzID0gTmV3LU9iamVjdCBTeXN0ZW0uTWFuYWdlbWVudC5BdXRvbWF0aW9uLlBTQ3JlZGVudGlhbCgkdXNlciwkcHdkKVwiKTtcclxuICAgICAgICAvLyBXZSBzdGFydCByZW1vdGUgc2Vzc2lvbiBDcmVkU1NQIEVuYWJsZWRcclxuICAgICAgICBjb250ZW50cy5wdXNoKFwiRW50ZXItUFNTZXNzaW9uIC1Db21wdXRlck5hbWUgZnNkZnNmIC1DcmVkZW50aWFsICRjcmVkZW50aWFscyDigJNBdXRoZW50aWNhdGlvbiBDcmVkU1NQXCIpO1xyXG5cclxuICAgICAgICAvLyBXZSBjbG9zZSByZW1vdGUgY29ubmVjdGlvblxyXG4gICAgICAgIGNvbnRlbnRzLnB1c2goXCJFeGl0LVBTU2Vzc2lvblwiKTtcclxuICAgICAgICAgICAgLy8gY29udGVudHMucHVzaChzY3JpcHRJbmxpbmUpO1xyXG5cclxuICAgICAgICAvLyBXcml0ZSB0aGUgc2NyaXB0IHRvIGRpc2suXHJcbiAgICAgICAgdGwuYXNzZXJ0QWdlbnQoXCIyLjExNS4wXCIpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBEaXJlY3RvcnkgPSB0bC5nZXRWYXJpYWJsZShcImFnZW50LnRlbXBEaXJlY3RvcnlcIik7XHJcbiAgICAgICAgaWYgKHRlbXBEaXJlY3RvcnkgIT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgdGwuY2hlY2tQYXRoKHRlbXBEaXJlY3RvcnksIGAke3RlbXBEaXJlY3Rvcnl9IChhZ2VudC50ZW1wRGlyZWN0b3J5KWApO1xyXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHRlbXBEaXJlY3RvcnksIHV1aWRWNCgpICsgXCIucHMxXCIpO1xyXG5cclxuICAgICAgICBhd2FpdCBmcy53cml0ZUZpbGUoXHJcbiAgICAgICAgICAgIGZpbGVQYXRoLFxyXG4gICAgICAgICAgICBcIlxcdWZlZmZcIiArIGNvbnRlbnRzLmpvaW4ob3MuRU9MKSwgY2FsbGJhY2spOyAgICAgICAgICAgLy8gU2luY2UgVVRGOCBlbmNvZGluZyBpcyBzcGVjaWZpZWQsIG5vZGUgd2lsbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVuY29kZSB0aGUgQk9NIGludG8gaXRzIFVURjggYmluYXJ5IHNlcXVlbmNlLlxyXG5cclxuICAgICAgICAvLyBSdW4gdGhlIHNjcmlwdC5cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIE5vdGUsIHByZWZlciBcInB3c2hcIiBvdmVyIFwicG93ZXJzaGVsbFwiLiBBdCBzb21lIHBvaW50IHdlIGNhbiByZW1vdmUgc3VwcG9ydCBmb3IgXCJwb3dlcnNoZWxsXCIuXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBOb3RlLCB1c2UgXCItQ29tbWFuZFwiIGluc3RlYWQgb2YgXCItRmlsZVwiIHRvIG1hdGNoIHRoZSBXaW5kb3dzIGltcGxlbWVudGF0aW9uLiBSZWZlciB0b1xyXG4gICAgICAgIC8vIGNvbW1lbnQgb24gV2luZG93cyBpbXBsZW1lbnRhdGlvbiBmb3IgYW4gZXhwbGFuYXRpb24gd2h5IFwiLUNvbW1hbmRcIiBpcyBwcmVmZXJyZWQuXHJcbiAgICAgICAgY29uc3QgcG93ZXJzaGVsbCA9IHRsLnRvb2wodGwud2hpY2goXCJwd3NoXCIpIHx8IHRsLndoaWNoKFwicG93ZXJzaGVsbFwiKSB8fCB0bC53aGljaChcInB3c2hcIiwgdHJ1ZSkpXHJcbiAgICAgICAgICAgIC5hcmcoXCItTm9Mb2dvXCIpXHJcbiAgICAgICAgICAgIC5hcmcoXCItTm9Qcm9maWxlXCIpXHJcbiAgICAgICAgICAgIC5hcmcoXCItTm9uSW50ZXJhY3RpdmVcIilcclxuICAgICAgICAgICAgLmFyZyhcIi1FeGVjdXRpb25Qb2xpY3lcIilcclxuICAgICAgICAgICAgLmFyZyhcIlVucmVzdHJpY3RlZFwiKVxyXG4gICAgICAgICAgICAuYXJnKFwiLUNvbW1hbmRcIilcclxuICAgICAgICAgICAgLmFyZyhgLiAnJHtmaWxlUGF0aC5yZXBsYWNlKC8nL2csIFwiJydcIil9J2ApO1xyXG5cclxuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBjd2Q6IFwiLi9cIixcclxuICAgICAgICAgICAgZmFpbE9uU3RkRXJyOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyU3RyZWFtOiBwcm9jZXNzLnN0ZG91dCwgLy8gRGlyZWN0IGFsbCBvdXRwdXQgdG8gU1RET1VULCBvdGhlcndpc2UgdGhlIG91dHB1dCBtYXkgYXBwZWFyIG91dFxyXG4gICAgICAgICAgICBvdXRTdHJlYW06IHByb2Nlc3Muc3Rkb3V0LCAvLyBvZiBvcmRlciBzaW5jZSBOb2RlIGJ1ZmZlcnMgaXQncyBvd24gU1RET1VUIGJ1dCBub3QgU1RERVJSLlxyXG4gICAgICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXHJcbiAgICAgICAgfSBhcyB0ci5JRXhlY09wdGlvbnM7XHJcblxyXG4gICAgICAgIC8vIExpc3RlbiBmb3Igc3RkZXJyLlxyXG4gICAgICAgIGNvbnN0IHN0ZGVyckZhaWx1cmUgPSBmYWxzZTtcclxuICAgIC8qICAgIGlmIChfdnN0c19pbnB1dF9mYWlsT25TdGFuZGFyZEVycm9yKSB7XHJcbiAgICAgICAgICAgIHBvd2Vyc2hlbGwub24oJ3N0ZGVycicsIChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzdGRlcnJGYWlsdXJlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgICAgIC8vIFJ1biBiYXNoLlxyXG4gICAgICAgIGNvbnN0IGV4aXRDb2RlOiBudW1iZXIgPSBhd2FpdCBwb3dlcnNoZWxsLmV4ZWMob3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIEZhaWwgb24gZXhpdCBjb2RlLlxyXG4gICAgICAgIGlmIChleGl0Q29kZSAhPT0gMCkge1xyXG4gICAgICAgICAgICB0bC5zZXRSZXN1bHQodGwuVGFza1Jlc3VsdC5GYWlsZWQsIHRsLmxvYyhcIkpTX0V4aXRDb2RlXCIsIGV4aXRDb2RlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBGYWlsIG9uIHN0ZGVyci5cclxuICAgICAgICBpZiAoc3RkZXJyRmFpbHVyZSkge1xyXG4gICAgICAgICAgICB0bC5zZXRSZXN1bHQodGwuVGFza1Jlc3VsdC5GYWlsZWQsIHRsLmxvYyhcIkpTX1N0ZGVyclwiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHRsLnNldFJlc3VsdCh0bC5UYXNrUmVzdWx0LkZhaWxlZCwgZXJyLm1lc3NhZ2UgfHwgXCJydW4oKSBmYWlsZWRcIik7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gY2FsbGJhY2soKXt9XHJcblxyXG5ydW4oKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIHNoZWxsID0gcmVxdWlyZShcInNoZWxsanNcIik7XHJcbnZhciBjaGlsZFByb2Nlc3MgPSByZXF1aXJlKFwiY2hpbGRfcHJvY2Vzc1wiKTtcclxudmFyIGZzID0gcmVxdWlyZShcImZzXCIpO1xyXG52YXIgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xyXG52YXIgb3MgPSByZXF1aXJlKFwib3NcIik7XHJcbnZhciBtaW5pbWF0Y2ggPSByZXF1aXJlKFwibWluaW1hdGNoXCIpO1xyXG52YXIgaW0gPSByZXF1aXJlKFwiLi9pbnRlcm5hbFwiKTtcclxudmFyIHRjbSA9IHJlcXVpcmUoXCIuL3Rhc2tjb21tYW5kXCIpO1xyXG52YXIgdHJtID0gcmVxdWlyZShcIi4vdG9vbHJ1bm5lclwiKTtcclxudmFyIHNlbXZlciA9IHJlcXVpcmUoXCJzZW12ZXJcIik7XHJcbnZhciBUYXNrUmVzdWx0O1xyXG4oZnVuY3Rpb24gKFRhc2tSZXN1bHQpIHtcclxuICAgIFRhc2tSZXN1bHRbVGFza1Jlc3VsdFtcIlN1Y2NlZWRlZFwiXSA9IDBdID0gXCJTdWNjZWVkZWRcIjtcclxuICAgIFRhc2tSZXN1bHRbVGFza1Jlc3VsdFtcIlN1Y2NlZWRlZFdpdGhJc3N1ZXNcIl0gPSAxXSA9IFwiU3VjY2VlZGVkV2l0aElzc3Vlc1wiO1xyXG4gICAgVGFza1Jlc3VsdFtUYXNrUmVzdWx0W1wiRmFpbGVkXCJdID0gMl0gPSBcIkZhaWxlZFwiO1xyXG4gICAgVGFza1Jlc3VsdFtUYXNrUmVzdWx0W1wiQ2FuY2VsbGVkXCJdID0gM10gPSBcIkNhbmNlbGxlZFwiO1xyXG4gICAgVGFza1Jlc3VsdFtUYXNrUmVzdWx0W1wiU2tpcHBlZFwiXSA9IDRdID0gXCJTa2lwcGVkXCI7XHJcbn0pKFRhc2tSZXN1bHQgPSBleHBvcnRzLlRhc2tSZXN1bHQgfHwgKGV4cG9ydHMuVGFza1Jlc3VsdCA9IHt9KSk7XHJcbnZhciBUYXNrU3RhdGU7XHJcbihmdW5jdGlvbiAoVGFza1N0YXRlKSB7XHJcbiAgICBUYXNrU3RhdGVbVGFza1N0YXRlW1wiVW5rbm93blwiXSA9IDBdID0gXCJVbmtub3duXCI7XHJcbiAgICBUYXNrU3RhdGVbVGFza1N0YXRlW1wiSW5pdGlhbGl6ZWRcIl0gPSAxXSA9IFwiSW5pdGlhbGl6ZWRcIjtcclxuICAgIFRhc2tTdGF0ZVtUYXNrU3RhdGVbXCJJblByb2dyZXNzXCJdID0gMl0gPSBcIkluUHJvZ3Jlc3NcIjtcclxuICAgIFRhc2tTdGF0ZVtUYXNrU3RhdGVbXCJDb21wbGV0ZWRcIl0gPSAzXSA9IFwiQ29tcGxldGVkXCI7XHJcbn0pKFRhc2tTdGF0ZSA9IGV4cG9ydHMuVGFza1N0YXRlIHx8IChleHBvcnRzLlRhc2tTdGF0ZSA9IHt9KSk7XHJcbnZhciBJc3N1ZVR5cGU7XHJcbihmdW5jdGlvbiAoSXNzdWVUeXBlKSB7XHJcbiAgICBJc3N1ZVR5cGVbSXNzdWVUeXBlW1wiRXJyb3JcIl0gPSAwXSA9IFwiRXJyb3JcIjtcclxuICAgIElzc3VlVHlwZVtJc3N1ZVR5cGVbXCJXYXJuaW5nXCJdID0gMV0gPSBcIldhcm5pbmdcIjtcclxufSkoSXNzdWVUeXBlID0gZXhwb3J0cy5Jc3N1ZVR5cGUgfHwgKGV4cG9ydHMuSXNzdWVUeXBlID0ge30pKTtcclxudmFyIEFydGlmYWN0VHlwZTtcclxuKGZ1bmN0aW9uIChBcnRpZmFjdFR5cGUpIHtcclxuICAgIEFydGlmYWN0VHlwZVtBcnRpZmFjdFR5cGVbXCJDb250YWluZXJcIl0gPSAwXSA9IFwiQ29udGFpbmVyXCI7XHJcbiAgICBBcnRpZmFjdFR5cGVbQXJ0aWZhY3RUeXBlW1wiRmlsZVBhdGhcIl0gPSAxXSA9IFwiRmlsZVBhdGhcIjtcclxuICAgIEFydGlmYWN0VHlwZVtBcnRpZmFjdFR5cGVbXCJWZXJzaW9uQ29udHJvbFwiXSA9IDJdID0gXCJWZXJzaW9uQ29udHJvbFwiO1xyXG4gICAgQXJ0aWZhY3RUeXBlW0FydGlmYWN0VHlwZVtcIkdpdFJlZlwiXSA9IDNdID0gXCJHaXRSZWZcIjtcclxuICAgIEFydGlmYWN0VHlwZVtBcnRpZmFjdFR5cGVbXCJUZnZjTGFiZWxcIl0gPSA0XSA9IFwiVGZ2Y0xhYmVsXCI7XHJcbn0pKEFydGlmYWN0VHlwZSA9IGV4cG9ydHMuQXJ0aWZhY3RUeXBlIHx8IChleHBvcnRzLkFydGlmYWN0VHlwZSA9IHt9KSk7XHJcbnZhciBGaWVsZFR5cGU7XHJcbihmdW5jdGlvbiAoRmllbGRUeXBlKSB7XHJcbiAgICBGaWVsZFR5cGVbRmllbGRUeXBlW1wiQXV0aFBhcmFtZXRlclwiXSA9IDBdID0gXCJBdXRoUGFyYW1ldGVyXCI7XHJcbiAgICBGaWVsZFR5cGVbRmllbGRUeXBlW1wiRGF0YVBhcmFtZXRlclwiXSA9IDFdID0gXCJEYXRhUGFyYW1ldGVyXCI7XHJcbiAgICBGaWVsZFR5cGVbRmllbGRUeXBlW1wiVXJsXCJdID0gMl0gPSBcIlVybFwiO1xyXG59KShGaWVsZFR5cGUgPSBleHBvcnRzLkZpZWxkVHlwZSB8fCAoZXhwb3J0cy5GaWVsZFR5cGUgPSB7fSkpO1xyXG4vKiogUGxhdGZvcm1zIHN1cHBvcnRlZCBieSBvdXIgYnVpbGQgYWdlbnQgKi9cclxudmFyIFBsYXRmb3JtO1xyXG4oZnVuY3Rpb24gKFBsYXRmb3JtKSB7XHJcbiAgICBQbGF0Zm9ybVtQbGF0Zm9ybVtcIldpbmRvd3NcIl0gPSAwXSA9IFwiV2luZG93c1wiO1xyXG4gICAgUGxhdGZvcm1bUGxhdGZvcm1bXCJNYWNPU1wiXSA9IDFdID0gXCJNYWNPU1wiO1xyXG4gICAgUGxhdGZvcm1bUGxhdGZvcm1bXCJMaW51eFwiXSA9IDJdID0gXCJMaW51eFwiO1xyXG59KShQbGF0Zm9ybSA9IGV4cG9ydHMuUGxhdGZvcm0gfHwgKGV4cG9ydHMuUGxhdGZvcm0gPSB7fSkpO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIEdlbmVyYWwgSGVscGVyc1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbmV4cG9ydHMuc2V0U3RkU3RyZWFtID0gaW0uX3NldFN0ZFN0cmVhbTtcclxuZXhwb3J0cy5zZXRFcnJTdHJlYW0gPSBpbS5fc2V0RXJyU3RyZWFtO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFJlc3VsdHNcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vKipcclxuICogU2V0cyB0aGUgcmVzdWx0IG9mIHRoZSB0YXNrLlxyXG4gKiBFeGVjdXRpb24gd2lsbCBjb250aW51ZS5cclxuICogSWYgbm90IHNldCwgdGFzayB3aWxsIGJlIFN1Y2NlZWRlZC5cclxuICogSWYgbXVsdGlwbGUgY2FsbHMgYXJlIG1hZGUgdG8gc2V0UmVzdWx0IHRoZSBtb3N0IHBlc3NpbWlzdGljIGNhbGwgd2lucyAoRmFpbGVkKSByZWdhcmRsZXNzIG9mIHRoZSBvcmRlciBvZiBjYWxscy5cclxuICpcclxuICogQHBhcmFtIHJlc3VsdCAgICBUYXNrUmVzdWx0IGVudW0gb2YgU3VjY2VlZGVkLCBTdWNjZWVkZWRXaXRoSXNzdWVzLCBGYWlsZWQsIENhbmNlbGxlZCBvciBTa2lwcGVkLlxyXG4gKiBAcGFyYW0gbWVzc2FnZSAgIEEgbWVzc2FnZSB3aGljaCB3aWxsIGJlIGxvZ2dlZCBhcyBhbiBlcnJvciBpc3N1ZSBpZiB0aGUgcmVzdWx0IGlzIEZhaWxlZC5cclxuICogQHBhcmFtIGRvbmUgICAgICBPcHRpb25hbC4gSW5zdHJ1Y3RzIHRoZSBhZ2VudCB0aGUgdGFzayBpcyBkb25lLiBUaGlzIGlzIGhlbHBmdWwgd2hlbiBjaGlsZCBwcm9jZXNzZXNcclxuICogICAgICAgICAgICAgICAgICBtYXkgc3RpbGwgYmUgcnVubmluZyBhbmQgcHJldmVudCBub2RlIGZyb20gZnVsbHkgZXhpdGluZy4gVGhpcyBhcmd1bWVudCBpcyBzdXBwb3J0ZWRcclxuICogICAgICAgICAgICAgICAgICBmcm9tIGFnZW50IHZlcnNpb24gMi4xNDIuMCBvciBoaWdoZXIgKG90aGVyd2lzZSB3aWxsIG5vLW9wKS5cclxuICogQHJldHVybnMgICAgICAgICB2b2lkXHJcbiAqL1xyXG5mdW5jdGlvbiBzZXRSZXN1bHQocmVzdWx0LCBtZXNzYWdlLCBkb25lKSB7XHJcbiAgICBleHBvcnRzLmRlYnVnKCd0YXNrIHJlc3VsdDogJyArIFRhc2tSZXN1bHRbcmVzdWx0XSk7XHJcbiAgICAvLyBhZGQgYW4gZXJyb3IgaXNzdWVcclxuICAgIGlmIChyZXN1bHQgPT0gVGFza1Jlc3VsdC5GYWlsZWQgJiYgbWVzc2FnZSkge1xyXG4gICAgICAgIGV4cG9ydHMuZXJyb3IobWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChyZXN1bHQgPT0gVGFza1Jlc3VsdC5TdWNjZWVkZWRXaXRoSXNzdWVzICYmIG1lc3NhZ2UpIHtcclxuICAgICAgICBleHBvcnRzLndhcm5pbmcobWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgICAvLyB0YXNrLmNvbXBsZXRlXHJcbiAgICB2YXIgcHJvcGVydGllcyA9IHsgJ3Jlc3VsdCc6IFRhc2tSZXN1bHRbcmVzdWx0XSB9O1xyXG4gICAgaWYgKGRvbmUpIHtcclxuICAgICAgICBwcm9wZXJ0aWVzWydkb25lJ10gPSAndHJ1ZSc7XHJcbiAgICB9XHJcbiAgICBleHBvcnRzLmNvbW1hbmQoJ3Rhc2suY29tcGxldGUnLCBwcm9wZXJ0aWVzLCBtZXNzYWdlKTtcclxufVxyXG5leHBvcnRzLnNldFJlc3VsdCA9IHNldFJlc3VsdDtcclxuLy9cclxuLy8gQ2F0Y2hpbmcgYWxsIGV4Y2VwdGlvbnNcclxuLy9cclxucHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCBmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICBzZXRSZXN1bHQoVGFza1Jlc3VsdC5GYWlsZWQsIGV4cG9ydHMubG9jKCdMSUJfVW5oYW5kbGVkRXgnLCBlcnIubWVzc2FnZSkpO1xyXG59KTtcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBMb2MgSGVscGVyc1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbmV4cG9ydHMuc2V0UmVzb3VyY2VQYXRoID0gaW0uX3NldFJlc291cmNlUGF0aDtcclxuZXhwb3J0cy5sb2MgPSBpbS5fbG9jO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIElucHV0IEhlbHBlcnNcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5leHBvcnRzLmdldFZhcmlhYmxlID0gaW0uX2dldFZhcmlhYmxlO1xyXG4vKipcclxuICogQXNzZXJ0cyB0aGUgYWdlbnQgdmVyc2lvbiBpcyBhdCBsZWFzdCB0aGUgc3BlY2lmaWVkIG1pbmltdW0uXHJcbiAqXHJcbiAqIEBwYXJhbSAgICBtaW5pbXVtICAgIG1pbmltdW0gdmVyc2lvbiB2ZXJzaW9uIC0gbXVzdCBiZSAyLjEwNC4xIG9yIGhpZ2hlclxyXG4gKi9cclxuZnVuY3Rpb24gYXNzZXJ0QWdlbnQobWluaW11bSkge1xyXG4gICAgaWYgKHNlbXZlci5sdChtaW5pbXVtLCAnMi4xMDQuMScpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhc3NlcnRBZ2VudCgpIHJlcXVpcmVzIHRoZSBwYXJhbWV0ZXIgdG8gYmUgMi4xMDQuMSBvciBoaWdoZXInKTtcclxuICAgIH1cclxuICAgIHZhciBhZ2VudCA9IGV4cG9ydHMuZ2V0VmFyaWFibGUoJ0FnZW50LlZlcnNpb24nKTtcclxuICAgIGlmIChhZ2VudCAmJiBzZW12ZXIubHQoYWdlbnQsIG1pbmltdW0pKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWdlbnQgdmVyc2lvbiBcIiArIG1pbmltdW0gKyBcIiBvciBoaWdoZXIgaXMgcmVxdWlyZWRcIik7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5hc3NlcnRBZ2VudCA9IGFzc2VydEFnZW50O1xyXG4vKipcclxuICogR2V0cyBhIHNuYXBzaG90IG9mIHRoZSBjdXJyZW50IHN0YXRlIG9mIGFsbCBqb2IgdmFyaWFibGVzIGF2YWlsYWJsZSB0byB0aGUgdGFzay5cclxuICogUmVxdWlyZXMgYSAyLjEwNC4xIGFnZW50IG9yIGhpZ2hlciBmb3IgZnVsbCBmdW5jdGlvbmFsaXR5LlxyXG4gKlxyXG4gKiBMaW1pdGF0aW9ucyBvbiBhbiBhZ2VudCBwcmlvciB0byAyLjEwNC4xOlxyXG4gKiAgMSkgVGhlIHJldHVybiB2YWx1ZSBkb2VzIG5vdCBpbmNsdWRlIGFsbCBwdWJsaWMgdmFyaWFibGVzLiBPbmx5IHB1YmxpYyB2YXJpYWJsZXNcclxuICogICAgIHRoYXQgaGF2ZSBiZWVuIGFkZGVkIHVzaW5nIHNldFZhcmlhYmxlIGFyZSByZXR1cm5lZC5cclxuICogIDIpIFRoZSBuYW1lIHJldHVybmVkIGZvciBlYWNoIHNlY3JldCB2YXJpYWJsZSBpcyB0aGUgZm9ybWF0dGVkIGVudmlyb25tZW50IHZhcmlhYmxlXHJcbiAqICAgICBuYW1lLCBub3QgdGhlIGFjdHVhbCB2YXJpYWJsZSBuYW1lICh1bmxlc3MgaXQgd2FzIHNldCBleHBsaWNpdGx5IGF0IHJ1bnRpbWUgdXNpbmdcclxuICogICAgIHNldFZhcmlhYmxlKS5cclxuICpcclxuICogQHJldHVybnMgVmFyaWFibGVJbmZvW11cclxuICovXHJcbmZ1bmN0aW9uIGdldFZhcmlhYmxlcygpIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyhpbS5fa25vd25WYXJpYWJsZU1hcClcclxuICAgICAgICAubWFwKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICB2YXIgaW5mbyA9IGltLl9rbm93blZhcmlhYmxlTWFwW2tleV07XHJcbiAgICAgICAgcmV0dXJuIHsgbmFtZTogaW5mby5uYW1lLCB2YWx1ZTogZXhwb3J0cy5nZXRWYXJpYWJsZShpbmZvLm5hbWUpLCBzZWNyZXQ6IGluZm8uc2VjcmV0IH07XHJcbiAgICB9KTtcclxufVxyXG5leHBvcnRzLmdldFZhcmlhYmxlcyA9IGdldFZhcmlhYmxlcztcclxuLyoqXHJcbiAqIFNldHMgYSB2YXJpYWJsZSB3aGljaCB3aWxsIGJlIGF2YWlsYWJsZSB0byBzdWJzZXF1ZW50IHRhc2tzIGFzIHdlbGwuXHJcbiAqXHJcbiAqIEBwYXJhbSAgICAgbmFtZSAgICBuYW1lIG9mIHRoZSB2YXJpYWJsZSB0byBzZXRcclxuICogQHBhcmFtICAgICB2YWwgICAgIHZhbHVlIHRvIHNldFxyXG4gKiBAcGFyYW0gICAgIHNlY3JldCAgd2hldGhlciB2YXJpYWJsZSBpcyBzZWNyZXQuICBNdWx0aS1saW5lIHNlY3JldHMgYXJlIG5vdCBhbGxvd2VkLiAgT3B0aW9uYWwsIGRlZmF1bHRzIHRvIGZhbHNlXHJcbiAqIEByZXR1cm5zICAgdm9pZFxyXG4gKi9cclxuZnVuY3Rpb24gc2V0VmFyaWFibGUobmFtZSwgdmFsLCBzZWNyZXQpIHtcclxuICAgIGlmIChzZWNyZXQgPT09IHZvaWQgMCkgeyBzZWNyZXQgPSBmYWxzZTsgfVxyXG4gICAgLy8gb25jZSBhIHNlY3JldCBhbHdheXMgYSBzZWNyZXRcclxuICAgIHZhciBrZXkgPSBpbS5fZ2V0VmFyaWFibGVLZXkobmFtZSk7XHJcbiAgICBpZiAoaW0uX2tub3duVmFyaWFibGVNYXAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgIHNlY3JldCA9IHNlY3JldCB8fCBpbS5fa25vd25WYXJpYWJsZU1hcFtrZXldLnNlY3JldDtcclxuICAgIH1cclxuICAgIC8vIHN0b3JlIHRoZSB2YWx1ZVxyXG4gICAgdmFyIHZhclZhbHVlID0gdmFsIHx8ICcnO1xyXG4gICAgZXhwb3J0cy5kZWJ1Zygnc2V0ICcgKyBuYW1lICsgJz0nICsgKHNlY3JldCAmJiB2YXJWYWx1ZSA/ICcqKioqKioqKicgOiB2YXJWYWx1ZSkpO1xyXG4gICAgaWYgKHNlY3JldCkge1xyXG4gICAgICAgIGlmICh2YXJWYWx1ZSAmJiB2YXJWYWx1ZS5tYXRjaCgvXFxyfFxcbi8pICYmIChcIlwiICsgcHJvY2Vzcy5lbnZbJ1NZU1RFTV9VTlNBRkVBTExPV01VTFRJTElORVNFQ1JFVCddKS50b1VwcGVyQ2FzZSgpICE9ICdUUlVFJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXhwb3J0cy5sb2MoJ0xJQl9NdWx0aWxpbmVTZWNyZXQnKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGltLl92YXVsdC5zdG9yZVNlY3JldCgnU0VDUkVUXycgKyBrZXksIHZhclZhbHVlKTtcclxuICAgICAgICBkZWxldGUgcHJvY2Vzcy5lbnZba2V5XTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHByb2Nlc3MuZW52W2tleV0gPSB2YXJWYWx1ZTtcclxuICAgIH1cclxuICAgIC8vIHN0b3JlIHRoZSBtZXRhZGF0YVxyXG4gICAgaW0uX2tub3duVmFyaWFibGVNYXBba2V5XSA9IHsgbmFtZTogbmFtZSwgc2VjcmV0OiBzZWNyZXQgfTtcclxuICAgIC8vIHdyaXRlIHRoZSBjb21tYW5kXHJcbiAgICBleHBvcnRzLmNvbW1hbmQoJ3Rhc2suc2V0dmFyaWFibGUnLCB7ICd2YXJpYWJsZSc6IG5hbWUgfHwgJycsICdpc3NlY3JldCc6IChzZWNyZXQgfHwgZmFsc2UpLnRvU3RyaW5nKCkgfSwgdmFyVmFsdWUpO1xyXG59XHJcbmV4cG9ydHMuc2V0VmFyaWFibGUgPSBzZXRWYXJpYWJsZTtcclxuLyoqXHJcbiAqIFJlZ2lzdGVycyBhIHZhbHVlIHdpdGggdGhlIGxvZ2dlciwgc28gdGhlIHZhbHVlIHdpbGwgYmUgbWFza2VkIGZyb20gdGhlIGxvZ3MuICBNdWx0aS1saW5lIHNlY3JldHMgYXJlIG5vdCBhbGxvd2VkLlxyXG4gKlxyXG4gKiBAcGFyYW0gdmFsIHZhbHVlIHRvIHJlZ2lzdGVyXHJcbiAqL1xyXG5mdW5jdGlvbiBzZXRTZWNyZXQodmFsKSB7XHJcbiAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgaWYgKHZhbC5tYXRjaCgvXFxyfFxcbi8pICYmIChcIlwiICsgcHJvY2Vzcy5lbnZbJ1NZU1RFTV9VTlNBRkVBTExPV01VTFRJTElORVNFQ1JFVCddKS50b1VwcGVyQ2FzZSgpICE9PSAnVFJVRScpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGV4cG9ydHMubG9jKCdMSUJfTXVsdGlsaW5lU2VjcmV0JykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBleHBvcnRzLmNvbW1hbmQoJ3Rhc2suc2V0c2VjcmV0Jywge30sIHZhbCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5zZXRTZWNyZXQgPSBzZXRTZWNyZXQ7XHJcbi8qKlxyXG4gKiBHZXRzIHRoZSB2YWx1ZSBvZiBhbiBpbnB1dC4gIFRoZSB2YWx1ZSBpcyBhbHNvIHRyaW1tZWQuXHJcbiAqIElmIHJlcXVpcmVkIGlzIHRydWUgYW5kIHRoZSB2YWx1ZSBpcyBub3Qgc2V0LCBpdCB3aWxsIHRocm93LlxyXG4gKlxyXG4gKiBAcGFyYW0gICAgIG5hbWUgICAgIG5hbWUgb2YgdGhlIGlucHV0IHRvIGdldFxyXG4gKiBAcGFyYW0gICAgIHJlcXVpcmVkIHdoZXRoZXIgaW5wdXQgaXMgcmVxdWlyZWQuICBvcHRpb25hbCwgZGVmYXVsdHMgdG8gZmFsc2VcclxuICogQHJldHVybnMgICBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIGdldElucHV0KG5hbWUsIHJlcXVpcmVkKSB7XHJcbiAgICB2YXIgaW52YWwgPSBpbS5fdmF1bHQucmV0cmlldmVTZWNyZXQoJ0lOUFVUXycgKyBpbS5fZ2V0VmFyaWFibGVLZXkobmFtZSkpO1xyXG4gICAgaWYgKGludmFsKSB7XHJcbiAgICAgICAgaW52YWwgPSBpbnZhbC50cmltKCk7XHJcbiAgICB9XHJcbiAgICBpZiAocmVxdWlyZWQgJiYgIWludmFsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGV4cG9ydHMubG9jKCdMSUJfSW5wdXRSZXF1aXJlZCcsIG5hbWUpKTtcclxuICAgIH1cclxuICAgIGV4cG9ydHMuZGVidWcobmFtZSArICc9JyArIGludmFsKTtcclxuICAgIHJldHVybiBpbnZhbDtcclxufVxyXG5leHBvcnRzLmdldElucHV0ID0gZ2V0SW5wdXQ7XHJcbi8qKlxyXG4gKiBHZXRzIHRoZSB2YWx1ZSBvZiBhbiBpbnB1dCBhbmQgY29udmVydHMgdG8gYSBib29sLiAgQ29udmVuaWVuY2UuXHJcbiAqIElmIHJlcXVpcmVkIGlzIHRydWUgYW5kIHRoZSB2YWx1ZSBpcyBub3Qgc2V0LCBpdCB3aWxsIHRocm93LlxyXG4gKiBJZiByZXF1aXJlZCBpcyBmYWxzZSBhbmQgdGhlIHZhbHVlIGlzIG5vdCBzZXQsIHJldHVybnMgZmFsc2UuXHJcbiAqXHJcbiAqIEBwYXJhbSAgICAgbmFtZSAgICAgbmFtZSBvZiB0aGUgYm9vbCBpbnB1dCB0byBnZXRcclxuICogQHBhcmFtICAgICByZXF1aXJlZCB3aGV0aGVyIGlucHV0IGlzIHJlcXVpcmVkLiAgb3B0aW9uYWwsIGRlZmF1bHRzIHRvIGZhbHNlXHJcbiAqIEByZXR1cm5zICAgYm9vbGVhblxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0Qm9vbElucHV0KG5hbWUsIHJlcXVpcmVkKSB7XHJcbiAgICByZXR1cm4gKGdldElucHV0KG5hbWUsIHJlcXVpcmVkKSB8fCAnJykudG9VcHBlckNhc2UoKSA9PSBcIlRSVUVcIjtcclxufVxyXG5leHBvcnRzLmdldEJvb2xJbnB1dCA9IGdldEJvb2xJbnB1dDtcclxuLyoqXHJcbiAqIEdldHMgdGhlIHZhbHVlIG9mIGFuIGlucHV0IGFuZCBzcGxpdHMgdGhlIHZhbHVlIHVzaW5nIGEgZGVsaW1pdGVyIChzcGFjZSwgY29tbWEsIGV0YykuXHJcbiAqIEVtcHR5IHZhbHVlcyBhcmUgcmVtb3ZlZC4gIFRoaXMgZnVuY3Rpb24gaXMgdXNlZnVsIGZvciBzcGxpdHRpbmcgYW4gaW5wdXQgY29udGFpbmluZyBhIHNpbXBsZVxyXG4gKiBsaXN0IG9mIGl0ZW1zIC0gc3VjaCBhcyBidWlsZCB0YXJnZXRzLlxyXG4gKiBJTVBPUlRBTlQ6IERvIG5vdCB1c2UgdGhpcyBmdW5jdGlvbiBmb3Igc3BsaXR0aW5nIGFkZGl0aW9uYWwgYXJncyEgIEluc3RlYWQgdXNlIGFyZ1N0cmluZygpLCB3aGljaFxyXG4gKiBmb2xsb3dzIG5vcm1hbCBhcmd1bWVudCBzcGxpdHRpbmcgcnVsZXMgYW5kIGhhbmRsZXMgdmFsdWVzIGVuY2Fwc3VsYXRlZCBieSBxdW90ZXMuXHJcbiAqIElmIHJlcXVpcmVkIGlzIHRydWUgYW5kIHRoZSB2YWx1ZSBpcyBub3Qgc2V0LCBpdCB3aWxsIHRocm93LlxyXG4gKlxyXG4gKiBAcGFyYW0gICAgIG5hbWUgICAgIG5hbWUgb2YgdGhlIGlucHV0IHRvIGdldFxyXG4gKiBAcGFyYW0gICAgIGRlbGltICAgIGRlbGltaXRlciB0byBzcGxpdCBvblxyXG4gKiBAcGFyYW0gICAgIHJlcXVpcmVkIHdoZXRoZXIgaW5wdXQgaXMgcmVxdWlyZWQuICBvcHRpb25hbCwgZGVmYXVsdHMgdG8gZmFsc2VcclxuICogQHJldHVybnMgICBzdHJpbmdbXVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RGVsaW1pdGVkSW5wdXQobmFtZSwgZGVsaW0sIHJlcXVpcmVkKSB7XHJcbiAgICB2YXIgaW5wdXRWYWwgPSBnZXRJbnB1dChuYW1lLCByZXF1aXJlZCk7XHJcbiAgICBpZiAoIWlucHV0VmFsKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgaW5wdXRWYWwuc3BsaXQoZGVsaW0pLmZvckVhY2goZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICBpZiAoeCkge1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaCh4KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuZXhwb3J0cy5nZXREZWxpbWl0ZWRJbnB1dCA9IGdldERlbGltaXRlZElucHV0O1xyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYSBwYXRoIGlucHV0cyB2YWx1ZSB3YXMgc3VwcGxpZWQgYnkgdGhlIHVzZXJcclxuICogRmlsZSBwYXRocyBhcmUgcmVsYXRpdmUgd2l0aCBhIHBpY2tlciwgc28gYW4gZW1wdHkgcGF0aCBpcyB0aGUgcm9vdCBvZiB0aGUgcmVwby5cclxuICogVXNlZnVsIGlmIHlvdSBuZWVkIHRvIGNvbmRpdGlvbiB3b3JrIChsaWtlIGFwcGVuZCBhbiBhcmcpIGlmIGEgdmFsdWUgd2FzIHN1cHBsaWVkXHJcbiAqXHJcbiAqIEBwYXJhbSAgICAgbmFtZSAgICAgIG5hbWUgb2YgdGhlIHBhdGggaW5wdXQgdG8gY2hlY2tcclxuICogQHJldHVybnMgICBib29sZWFuXHJcbiAqL1xyXG5mdW5jdGlvbiBmaWxlUGF0aFN1cHBsaWVkKG5hbWUpIHtcclxuICAgIC8vIG5vcm1hbGl6ZSBwYXRoc1xyXG4gICAgdmFyIHBhdGhWYWx1ZSA9IHRoaXMucmVzb2x2ZSh0aGlzLmdldFBhdGhJbnB1dChuYW1lKSB8fCAnJyk7XHJcbiAgICB2YXIgcmVwb1Jvb3QgPSB0aGlzLnJlc29sdmUoZXhwb3J0cy5nZXRWYXJpYWJsZSgnYnVpbGQuc291cmNlc0RpcmVjdG9yeScpIHx8IGV4cG9ydHMuZ2V0VmFyaWFibGUoJ3N5c3RlbS5kZWZhdWx0V29ya2luZ0RpcmVjdG9yeScpIHx8ICcnKTtcclxuICAgIHZhciBzdXBwbGllZCA9IHBhdGhWYWx1ZSAhPT0gcmVwb1Jvb3Q7XHJcbiAgICBleHBvcnRzLmRlYnVnKG5hbWUgKyAncGF0aCBzdXBwbGllZCA6JyArIHN1cHBsaWVkKTtcclxuICAgIHJldHVybiBzdXBwbGllZDtcclxufVxyXG5leHBvcnRzLmZpbGVQYXRoU3VwcGxpZWQgPSBmaWxlUGF0aFN1cHBsaWVkO1xyXG4vKipcclxuICogR2V0cyB0aGUgdmFsdWUgb2YgYSBwYXRoIGlucHV0XHJcbiAqIEl0IHdpbGwgYmUgcXVvdGVkIGZvciB5b3UgaWYgaXQgaXNuJ3QgYWxyZWFkeSBhbmQgY29udGFpbnMgc3BhY2VzXHJcbiAqIElmIHJlcXVpcmVkIGlzIHRydWUgYW5kIHRoZSB2YWx1ZSBpcyBub3Qgc2V0LCBpdCB3aWxsIHRocm93LlxyXG4gKiBJZiBjaGVjayBpcyB0cnVlIGFuZCB0aGUgcGF0aCBkb2VzIG5vdCBleGlzdCwgaXQgd2lsbCB0aHJvdy5cclxuICpcclxuICogQHBhcmFtICAgICBuYW1lICAgICAgbmFtZSBvZiB0aGUgaW5wdXQgdG8gZ2V0XHJcbiAqIEBwYXJhbSAgICAgcmVxdWlyZWQgIHdoZXRoZXIgaW5wdXQgaXMgcmVxdWlyZWQuICBvcHRpb25hbCwgZGVmYXVsdHMgdG8gZmFsc2VcclxuICogQHBhcmFtICAgICBjaGVjayAgICAgd2hldGhlciBwYXRoIGlzIGNoZWNrZWQuICBvcHRpb25hbCwgZGVmYXVsdHMgdG8gZmFsc2VcclxuICogQHJldHVybnMgICBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIGdldFBhdGhJbnB1dChuYW1lLCByZXF1aXJlZCwgY2hlY2spIHtcclxuICAgIHZhciBpbnZhbCA9IGdldElucHV0KG5hbWUsIHJlcXVpcmVkKTtcclxuICAgIGlmIChpbnZhbCkge1xyXG4gICAgICAgIGlmIChjaGVjaykge1xyXG4gICAgICAgICAgICBleHBvcnRzLmNoZWNrUGF0aChpbnZhbCwgbmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGludmFsO1xyXG59XHJcbmV4cG9ydHMuZ2V0UGF0aElucHV0ID0gZ2V0UGF0aElucHV0O1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIEVuZHBvaW50IEhlbHBlcnNcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vKipcclxuICogR2V0cyB0aGUgdXJsIGZvciBhIHNlcnZpY2UgZW5kcG9pbnRcclxuICogSWYgdGhlIHVybCB3YXMgbm90IHNldCBhbmQgaXMgbm90IG9wdGlvbmFsLCBpdCB3aWxsIHRocm93LlxyXG4gKlxyXG4gKiBAcGFyYW0gICAgIGlkICAgICAgICBuYW1lIG9mIHRoZSBzZXJ2aWNlIGVuZHBvaW50XHJcbiAqIEBwYXJhbSAgICAgb3B0aW9uYWwgIHdoZXRoZXIgdGhlIHVybCBpcyBvcHRpb25hbFxyXG4gKiBAcmV0dXJucyAgIHN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RW5kcG9pbnRVcmwoaWQsIG9wdGlvbmFsKSB7XHJcbiAgICB2YXIgdXJsdmFsID0gcHJvY2Vzcy5lbnZbJ0VORFBPSU5UX1VSTF8nICsgaWRdO1xyXG4gICAgaWYgKCFvcHRpb25hbCAmJiAhdXJsdmFsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGV4cG9ydHMubG9jKCdMSUJfRW5kcG9pbnROb3RFeGlzdCcsIGlkKSk7XHJcbiAgICB9XHJcbiAgICBleHBvcnRzLmRlYnVnKGlkICsgJz0nICsgdXJsdmFsKTtcclxuICAgIHJldHVybiB1cmx2YWw7XHJcbn1cclxuZXhwb3J0cy5nZXRFbmRwb2ludFVybCA9IGdldEVuZHBvaW50VXJsO1xyXG4vKlxyXG4gKiBHZXRzIHRoZSBlbmRwb2ludCBkYXRhIHBhcmFtZXRlciB2YWx1ZSB3aXRoIHNwZWNpZmllZCBrZXkgZm9yIGEgc2VydmljZSBlbmRwb2ludFxyXG4gKiBJZiB0aGUgZW5kcG9pbnQgZGF0YSBwYXJhbWV0ZXIgd2FzIG5vdCBzZXQgYW5kIGlzIG5vdCBvcHRpb25hbCwgaXQgd2lsbCB0aHJvdy5cclxuICpcclxuICogQHBhcmFtIGlkIG5hbWUgb2YgdGhlIHNlcnZpY2UgZW5kcG9pbnRcclxuICogQHBhcmFtIGtleSBvZiB0aGUgcGFyYW1ldGVyXHJcbiAqIEBwYXJhbSBvcHRpb25hbCB3aGV0aGVyIHRoZSBlbmRwb2ludCBkYXRhIGlzIG9wdGlvbmFsXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHZhbHVlIG9mIHRoZSBlbmRwb2ludCBkYXRhIHBhcmFtZXRlclxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RW5kcG9pbnREYXRhUGFyYW1ldGVyKGlkLCBrZXksIG9wdGlvbmFsKSB7XHJcbiAgICB2YXIgZGF0YVBhcmFtVmFsID0gcHJvY2Vzcy5lbnZbJ0VORFBPSU5UX0RBVEFfJyArIGlkICsgJ18nICsga2V5LnRvVXBwZXJDYXNlKCldO1xyXG4gICAgaWYgKCFvcHRpb25hbCAmJiAhZGF0YVBhcmFtVmFsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGV4cG9ydHMubG9jKCdMSUJfRW5kcG9pbnREYXRhTm90RXhpc3QnLCBpZCwga2V5KSk7XHJcbiAgICB9XHJcbiAgICBleHBvcnRzLmRlYnVnKGlkICsgJyBkYXRhICcgKyBrZXkgKyAnID0gJyArIGRhdGFQYXJhbVZhbCk7XHJcbiAgICByZXR1cm4gZGF0YVBhcmFtVmFsO1xyXG59XHJcbmV4cG9ydHMuZ2V0RW5kcG9pbnREYXRhUGFyYW1ldGVyID0gZ2V0RW5kcG9pbnREYXRhUGFyYW1ldGVyO1xyXG4vKipcclxuICogR2V0cyB0aGUgZW5kcG9pbnQgYXV0aG9yaXphdGlvbiBzY2hlbWUgZm9yIGEgc2VydmljZSBlbmRwb2ludFxyXG4gKiBJZiB0aGUgZW5kcG9pbnQgYXV0aG9yaXphdGlvbiBzY2hlbWUgaXMgbm90IHNldCBhbmQgaXMgbm90IG9wdGlvbmFsLCBpdCB3aWxsIHRocm93LlxyXG4gKlxyXG4gKiBAcGFyYW0gaWQgbmFtZSBvZiB0aGUgc2VydmljZSBlbmRwb2ludFxyXG4gKiBAcGFyYW0gb3B0aW9uYWwgd2hldGhlciB0aGUgZW5kcG9pbnQgYXV0aG9yaXphdGlvbiBzY2hlbWUgaXMgb3B0aW9uYWxcclxuICogQHJldHVybnMge3N0cmluZ30gdmFsdWUgb2YgdGhlIGVuZHBvaW50IGF1dGhvcml6YXRpb24gc2NoZW1lXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRFbmRwb2ludEF1dGhvcml6YXRpb25TY2hlbWUoaWQsIG9wdGlvbmFsKSB7XHJcbiAgICB2YXIgYXV0aFNjaGVtZSA9IGltLl92YXVsdC5yZXRyaWV2ZVNlY3JldCgnRU5EUE9JTlRfQVVUSF9TQ0hFTUVfJyArIGlkKTtcclxuICAgIGlmICghb3B0aW9uYWwgJiYgIWF1dGhTY2hlbWUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXhwb3J0cy5sb2MoJ0xJQl9FbmRwb2ludEF1dGhOb3RFeGlzdCcsIGlkKSk7XHJcbiAgICB9XHJcbiAgICBleHBvcnRzLmRlYnVnKGlkICsgJyBhdXRoIHNjaGVtZSA9ICcgKyBhdXRoU2NoZW1lKTtcclxuICAgIHJldHVybiBhdXRoU2NoZW1lO1xyXG59XHJcbmV4cG9ydHMuZ2V0RW5kcG9pbnRBdXRob3JpemF0aW9uU2NoZW1lID0gZ2V0RW5kcG9pbnRBdXRob3JpemF0aW9uU2NoZW1lO1xyXG4vKipcclxuICogR2V0cyB0aGUgZW5kcG9pbnQgYXV0aG9yaXphdGlvbiBwYXJhbWV0ZXIgdmFsdWUgZm9yIGEgc2VydmljZSBlbmRwb2ludCB3aXRoIHNwZWNpZmllZCBrZXlcclxuICogSWYgdGhlIGVuZHBvaW50IGF1dGhvcml6YXRpb24gcGFyYW1ldGVyIGlzIG5vdCBzZXQgYW5kIGlzIG5vdCBvcHRpb25hbCwgaXQgd2lsbCB0aHJvdy5cclxuICpcclxuICogQHBhcmFtIGlkIG5hbWUgb2YgdGhlIHNlcnZpY2UgZW5kcG9pbnRcclxuICogQHBhcmFtIGtleSBrZXkgdG8gZmluZCB0aGUgZW5kcG9pbnQgYXV0aG9yaXphdGlvbiBwYXJhbWV0ZXJcclxuICogQHBhcmFtIG9wdGlvbmFsIG9wdGlvbmFsIHdoZXRoZXIgdGhlIGVuZHBvaW50IGF1dGhvcml6YXRpb24gc2NoZW1lIGlzIG9wdGlvbmFsXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHZhbHVlIG9mIHRoZSBlbmRwb2ludCBhdXRob3JpemF0aW9uIHBhcmFtZXRlciB2YWx1ZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RW5kcG9pbnRBdXRob3JpemF0aW9uUGFyYW1ldGVyKGlkLCBrZXksIG9wdGlvbmFsKSB7XHJcbiAgICB2YXIgYXV0aFBhcmFtID0gaW0uX3ZhdWx0LnJldHJpZXZlU2VjcmV0KCdFTkRQT0lOVF9BVVRIX1BBUkFNRVRFUl8nICsgaWQgKyAnXycgKyBrZXkudG9VcHBlckNhc2UoKSk7XHJcbiAgICBpZiAoIW9wdGlvbmFsICYmICFhdXRoUGFyYW0pIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXhwb3J0cy5sb2MoJ0xJQl9FbmRwb2ludEF1dGhOb3RFeGlzdCcsIGlkKSk7XHJcbiAgICB9XHJcbiAgICBleHBvcnRzLmRlYnVnKGlkICsgJyBhdXRoIHBhcmFtICcgKyBrZXkgKyAnID0gJyArIGF1dGhQYXJhbSk7XHJcbiAgICByZXR1cm4gYXV0aFBhcmFtO1xyXG59XHJcbmV4cG9ydHMuZ2V0RW5kcG9pbnRBdXRob3JpemF0aW9uUGFyYW1ldGVyID0gZ2V0RW5kcG9pbnRBdXRob3JpemF0aW9uUGFyYW1ldGVyO1xyXG4vKipcclxuICogR2V0cyB0aGUgYXV0aG9yaXphdGlvbiBkZXRhaWxzIGZvciBhIHNlcnZpY2UgZW5kcG9pbnRcclxuICogSWYgdGhlIGF1dGhvcml6YXRpb24gd2FzIG5vdCBzZXQgYW5kIGlzIG5vdCBvcHRpb25hbCwgaXQgd2lsbCB0aHJvdy5cclxuICpcclxuICogQHBhcmFtICAgICBpZCAgICAgICAgbmFtZSBvZiB0aGUgc2VydmljZSBlbmRwb2ludFxyXG4gKiBAcGFyYW0gICAgIG9wdGlvbmFsICB3aGV0aGVyIHRoZSB1cmwgaXMgb3B0aW9uYWxcclxuICogQHJldHVybnMgICBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIGdldEVuZHBvaW50QXV0aG9yaXphdGlvbihpZCwgb3B0aW9uYWwpIHtcclxuICAgIHZhciBhdmFsID0gaW0uX3ZhdWx0LnJldHJpZXZlU2VjcmV0KCdFTkRQT0lOVF9BVVRIXycgKyBpZCk7XHJcbiAgICBpZiAoIW9wdGlvbmFsICYmICFhdmFsKSB7XHJcbiAgICAgICAgc2V0UmVzdWx0KFRhc2tSZXN1bHQuRmFpbGVkLCBleHBvcnRzLmxvYygnTElCX0VuZHBvaW50QXV0aE5vdEV4aXN0JywgaWQpKTtcclxuICAgIH1cclxuICAgIGV4cG9ydHMuZGVidWcoaWQgKyAnIGV4aXN0cyAnICsgKGF2YWwgIT09IG51bGwpKTtcclxuICAgIHZhciBhdXRoO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBpZiAoYXZhbCkge1xyXG4gICAgICAgICAgICBhdXRoID0gSlNPTi5wYXJzZShhdmFsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGV4cG9ydHMubG9jKCdMSUJfSW52YWxpZEVuZHBvaW50QXV0aCcsIGF2YWwpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhdXRoO1xyXG59XHJcbmV4cG9ydHMuZ2V0RW5kcG9pbnRBdXRob3JpemF0aW9uID0gZ2V0RW5kcG9pbnRBdXRob3JpemF0aW9uO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFNlY3VyZUZpbGUgSGVscGVyc1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8qKlxyXG4gKiBHZXRzIHRoZSBuYW1lIGZvciBhIHNlY3VyZSBmaWxlXHJcbiAqXHJcbiAqIEBwYXJhbSAgICAgaWQgICAgICAgIHNlY3VyZSBmaWxlIGlkXHJcbiAqIEByZXR1cm5zICAgc3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRTZWN1cmVGaWxlTmFtZShpZCkge1xyXG4gICAgdmFyIG5hbWUgPSBwcm9jZXNzLmVudlsnU0VDVVJFRklMRV9OQU1FXycgKyBpZF07XHJcbiAgICBleHBvcnRzLmRlYnVnKCdzZWN1cmUgZmlsZSBuYW1lIGZvciBpZCAnICsgaWQgKyAnID0gJyArIG5hbWUpO1xyXG4gICAgcmV0dXJuIG5hbWU7XHJcbn1cclxuZXhwb3J0cy5nZXRTZWN1cmVGaWxlTmFtZSA9IGdldFNlY3VyZUZpbGVOYW1lO1xyXG4vKipcclxuICAqIEdldHMgdGhlIHNlY3VyZSBmaWxlIHRpY2tldCB0aGF0IGNhbiBiZSB1c2VkIHRvIGRvd25sb2FkIHRoZSBzZWN1cmUgZmlsZSBjb250ZW50c1xyXG4gICpcclxuICAqIEBwYXJhbSBpZCBuYW1lIG9mIHRoZSBzZWN1cmUgZmlsZVxyXG4gICogQHJldHVybnMge3N0cmluZ30gc2VjdXJlIGZpbGUgdGlja2V0XHJcbiAgKi9cclxuZnVuY3Rpb24gZ2V0U2VjdXJlRmlsZVRpY2tldChpZCkge1xyXG4gICAgdmFyIHRpY2tldCA9IGltLl92YXVsdC5yZXRyaWV2ZVNlY3JldCgnU0VDVVJFRklMRV9USUNLRVRfJyArIGlkKTtcclxuICAgIGV4cG9ydHMuZGVidWcoJ3NlY3VyZSBmaWxlIHRpY2tldCBmb3IgaWQgJyArIGlkICsgJyA9ICcgKyB0aWNrZXQpO1xyXG4gICAgcmV0dXJuIHRpY2tldDtcclxufVxyXG5leHBvcnRzLmdldFNlY3VyZUZpbGVUaWNrZXQgPSBnZXRTZWN1cmVGaWxlVGlja2V0O1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFRhc2sgVmFyaWFibGUgSGVscGVyc1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8qKlxyXG4gKiBHZXRzIGEgdmFyaWFibGUgdmFsdWUgdGhhdCBpcyBzZXQgYnkgcHJldmlvdXMgc3RlcCBmcm9tIHRoZSBzYW1lIHdyYXBwZXIgdGFzay5cclxuICogUmVxdWlyZXMgYSAyLjExNS4wIGFnZW50IG9yIGhpZ2hlci5cclxuICpcclxuICogQHBhcmFtICAgICBuYW1lICAgICBuYW1lIG9mIHRoZSB2YXJpYWJsZSB0byBnZXRcclxuICogQHJldHVybnMgICBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIGdldFRhc2tWYXJpYWJsZShuYW1lKSB7XHJcbiAgICBhc3NlcnRBZ2VudCgnMi4xMTUuMCcpO1xyXG4gICAgdmFyIGludmFsID0gaW0uX3ZhdWx0LnJldHJpZXZlU2VjcmV0KCdWU1RTX1RBU0tWQVJJQUJMRV8nICsgaW0uX2dldFZhcmlhYmxlS2V5KG5hbWUpKTtcclxuICAgIGlmIChpbnZhbCkge1xyXG4gICAgICAgIGludmFsID0gaW52YWwudHJpbSgpO1xyXG4gICAgfVxyXG4gICAgZXhwb3J0cy5kZWJ1ZygndGFzayB2YXJpYWJsZTogJyArIG5hbWUgKyAnPScgKyBpbnZhbCk7XHJcbiAgICByZXR1cm4gaW52YWw7XHJcbn1cclxuZXhwb3J0cy5nZXRUYXNrVmFyaWFibGUgPSBnZXRUYXNrVmFyaWFibGU7XHJcbi8qKlxyXG4gKiBTZXRzIGEgdGFzayB2YXJpYWJsZSB3aGljaCB3aWxsIG9ubHkgYmUgYXZhaWxhYmxlIHRvIHN1YnNlcXVlbnQgc3RlcHMgYmVsb25nIHRvIHRoZSBzYW1lIHdyYXBwZXIgdGFzay5cclxuICogUmVxdWlyZXMgYSAyLjExNS4wIGFnZW50IG9yIGhpZ2hlci5cclxuICpcclxuICogQHBhcmFtICAgICBuYW1lICAgIG5hbWUgb2YgdGhlIHZhcmlhYmxlIHRvIHNldFxyXG4gKiBAcGFyYW0gICAgIHZhbCAgICAgdmFsdWUgdG8gc2V0XHJcbiAqIEBwYXJhbSAgICAgc2VjcmV0ICB3aGV0aGVyIHZhcmlhYmxlIGlzIHNlY3JldC4gIG9wdGlvbmFsLCBkZWZhdWx0cyB0byBmYWxzZVxyXG4gKiBAcmV0dXJucyAgIHZvaWRcclxuICovXHJcbmZ1bmN0aW9uIHNldFRhc2tWYXJpYWJsZShuYW1lLCB2YWwsIHNlY3JldCkge1xyXG4gICAgaWYgKHNlY3JldCA9PT0gdm9pZCAwKSB7IHNlY3JldCA9IGZhbHNlOyB9XHJcbiAgICBhc3NlcnRBZ2VudCgnMi4xMTUuMCcpO1xyXG4gICAgdmFyIGtleSA9IGltLl9nZXRWYXJpYWJsZUtleShuYW1lKTtcclxuICAgIC8vIHN0b3JlIHRoZSB2YWx1ZVxyXG4gICAgdmFyIHZhclZhbHVlID0gdmFsIHx8ICcnO1xyXG4gICAgZXhwb3J0cy5kZWJ1Zygnc2V0IHRhc2sgdmFyaWFibGU6ICcgKyBuYW1lICsgJz0nICsgKHNlY3JldCAmJiB2YXJWYWx1ZSA/ICcqKioqKioqKicgOiB2YXJWYWx1ZSkpO1xyXG4gICAgaW0uX3ZhdWx0LnN0b3JlU2VjcmV0KCdWU1RTX1RBU0tWQVJJQUJMRV8nICsga2V5LCB2YXJWYWx1ZSk7XHJcbiAgICBkZWxldGUgcHJvY2Vzcy5lbnZba2V5XTtcclxuICAgIC8vIHdyaXRlIHRoZSBjb21tYW5kXHJcbiAgICBleHBvcnRzLmNvbW1hbmQoJ3Rhc2suc2V0dGFza3ZhcmlhYmxlJywgeyAndmFyaWFibGUnOiBuYW1lIHx8ICcnLCAnaXNzZWNyZXQnOiAoc2VjcmV0IHx8IGZhbHNlKS50b1N0cmluZygpIH0sIHZhclZhbHVlKTtcclxufVxyXG5leHBvcnRzLnNldFRhc2tWYXJpYWJsZSA9IHNldFRhc2tWYXJpYWJsZTtcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBDbWQgSGVscGVyc1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbmV4cG9ydHMuY29tbWFuZCA9IGltLl9jb21tYW5kO1xyXG5leHBvcnRzLndhcm5pbmcgPSBpbS5fd2FybmluZztcclxuZXhwb3J0cy5lcnJvciA9IGltLl9lcnJvcjtcclxuZXhwb3J0cy5kZWJ1ZyA9IGltLl9kZWJ1ZztcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBEaXNrIEZ1bmN0aW9uc1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIF9jaGVja1NoZWxsKGNtZCwgY29udGludWVPbkVycm9yKSB7XHJcbiAgICB2YXIgc2UgPSBzaGVsbC5lcnJvcigpO1xyXG4gICAgaWYgKHNlKSB7XHJcbiAgICAgICAgZXhwb3J0cy5kZWJ1ZyhjbWQgKyAnIGZhaWxlZCcpO1xyXG4gICAgICAgIHZhciBlcnJNc2cgPSBleHBvcnRzLmxvYygnTElCX09wZXJhdGlvbkZhaWxlZCcsIGNtZCwgc2UpO1xyXG4gICAgICAgIGV4cG9ydHMuZGVidWcoZXJyTXNnKTtcclxuICAgICAgICBpZiAoIWNvbnRpbnVlT25FcnJvcikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEdldCdzIHN0YXQgb24gYSBwYXRoLlxyXG4gKiBVc2VmdWwgZm9yIGNoZWNraW5nIHdoZXRoZXIgYSBmaWxlIG9yIGRpcmVjdG9yeS4gIEFsc28gZ2V0dGluZyBjcmVhdGVkLCBtb2RpZmllZCBhbmQgYWNjZXNzZWQgdGltZS5cclxuICogc2VlIFtmcy5zdGF0XShodHRwczovL25vZGVqcy5vcmcvYXBpL2ZzLmh0bWwjZnNfY2xhc3NfZnNfc3RhdHMpXHJcbiAqXHJcbiAqIEBwYXJhbSAgICAgcGF0aCAgICAgIHBhdGggdG8gY2hlY2tcclxuICogQHJldHVybnMgICBmc1N0YXRcclxuICovXHJcbmZ1bmN0aW9uIHN0YXRzKHBhdGgpIHtcclxuICAgIHJldHVybiBmcy5zdGF0U3luYyhwYXRoKTtcclxufVxyXG5leHBvcnRzLnN0YXRzID0gc3RhdHM7XHJcbmV4cG9ydHMuZXhpc3QgPSBpbS5fZXhpc3Q7XHJcbmZ1bmN0aW9uIHdyaXRlRmlsZShmaWxlLCBkYXRhLCBvcHRpb25zKSB7XHJcbiAgICBpZiAodHlwZW9mIChvcHRpb25zKSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGUsIGRhdGEsIHsgZW5jb2Rpbmc6IG9wdGlvbnMgfSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGUsIGRhdGEsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMud3JpdGVGaWxlID0gd3JpdGVGaWxlO1xyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgVXNlIGBnZXRQbGF0Zm9ybWBcclxuICogVXNlZnVsIGZvciBkZXRlcm1pbmluZyB0aGUgaG9zdCBvcGVyYXRpbmcgc3lzdGVtLlxyXG4gKiBzZWUgW29zLnR5cGVdKGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvb3MuaHRtbCNvc19vc190eXBlKVxyXG4gKlxyXG4gKiBAcmV0dXJuICAgICAgdGhlIG5hbWUgb2YgdGhlIG9wZXJhdGluZyBzeXN0ZW1cclxuICovXHJcbmZ1bmN0aW9uIG9zVHlwZSgpIHtcclxuICAgIHJldHVybiBvcy50eXBlKCk7XHJcbn1cclxuZXhwb3J0cy5vc1R5cGUgPSBvc1R5cGU7XHJcbi8qKlxyXG4gKiBEZXRlcm1pbmUgdGhlIG9wZXJhdGluZyBzeXN0ZW0gdGhlIGJ1aWxkIGFnZW50IGlzIHJ1bm5pbmcgb24uXHJcbiAqIEByZXR1cm5zIHtQbGF0Zm9ybX1cclxuICogQHRocm93cyB7RXJyb3J9IFBsYXRmb3JtIGlzIG5vdCBzdXBwb3J0ZWQgYnkgb3VyIGFnZW50XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRQbGF0Zm9ybSgpIHtcclxuICAgIHN3aXRjaCAocHJvY2Vzcy5wbGF0Zm9ybSkge1xyXG4gICAgICAgIGNhc2UgJ3dpbjMyJzogcmV0dXJuIFBsYXRmb3JtLldpbmRvd3M7XHJcbiAgICAgICAgY2FzZSAnZGFyd2luJzogcmV0dXJuIFBsYXRmb3JtLk1hY09TO1xyXG4gICAgICAgIGNhc2UgJ2xpbnV4JzogcmV0dXJuIFBsYXRmb3JtLkxpbnV4O1xyXG4gICAgICAgIGRlZmF1bHQ6IHRocm93IEVycm9yKGV4cG9ydHMubG9jKCdMSUJfUGxhdGZvcm1Ob3RTdXBwb3J0ZWQnLCBwcm9jZXNzLnBsYXRmb3JtKSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5nZXRQbGF0Zm9ybSA9IGdldFBsYXRmb3JtO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgcHJvY2VzcydzIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXHJcbiAqIHNlZSBbcHJvY2Vzcy5jd2RdKGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvcHJvY2Vzcy5odG1sI3Byb2Nlc3NfcHJvY2Vzc19jd2QpXHJcbiAqXHJcbiAqIEByZXR1cm4gICAgICB0aGUgcGF0aCB0byB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBvZiB0aGUgcHJvY2Vzc1xyXG4gKi9cclxuZnVuY3Rpb24gY3dkKCkge1xyXG4gICAgcmV0dXJuIHByb2Nlc3MuY3dkKCk7XHJcbn1cclxuZXhwb3J0cy5jd2QgPSBjd2Q7XHJcbmV4cG9ydHMuY2hlY2tQYXRoID0gaW0uX2NoZWNrUGF0aDtcclxuLyoqXHJcbiAqIENoYW5nZSB3b3JraW5nIGRpcmVjdG9yeS5cclxuICpcclxuICogQHBhcmFtICAgICBwYXRoICAgICAgbmV3IHdvcmtpbmcgZGlyZWN0b3J5IHBhdGhcclxuICogQHJldHVybnMgICB2b2lkXHJcbiAqL1xyXG5mdW5jdGlvbiBjZChwYXRoKSB7XHJcbiAgICBpZiAocGF0aCkge1xyXG4gICAgICAgIHNoZWxsLmNkKHBhdGgpO1xyXG4gICAgICAgIF9jaGVja1NoZWxsKCdjZCcpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuY2QgPSBjZDtcclxuLyoqXHJcbiAqIENoYW5nZSB3b3JraW5nIGRpcmVjdG9yeSBhbmQgcHVzaCBpdCBvbiB0aGUgc3RhY2tcclxuICpcclxuICogQHBhcmFtICAgICBwYXRoICAgICAgbmV3IHdvcmtpbmcgZGlyZWN0b3J5IHBhdGhcclxuICogQHJldHVybnMgICB2b2lkXHJcbiAqL1xyXG5mdW5jdGlvbiBwdXNoZChwYXRoKSB7XHJcbiAgICBzaGVsbC5wdXNoZChwYXRoKTtcclxuICAgIF9jaGVja1NoZWxsKCdwdXNoZCcpO1xyXG59XHJcbmV4cG9ydHMucHVzaGQgPSBwdXNoZDtcclxuLyoqXHJcbiAqIENoYW5nZSB3b3JraW5nIGRpcmVjdG9yeSBiYWNrIHRvIHByZXZpb3VzbHkgcHVzaGVkIGRpcmVjdG9yeVxyXG4gKlxyXG4gKiBAcmV0dXJucyAgIHZvaWRcclxuICovXHJcbmZ1bmN0aW9uIHBvcGQoKSB7XHJcbiAgICBzaGVsbC5wb3BkKCk7XHJcbiAgICBfY2hlY2tTaGVsbCgncG9wZCcpO1xyXG59XHJcbmV4cG9ydHMucG9wZCA9IHBvcGQ7XHJcbi8qKlxyXG4gKiBNYWtlIGEgZGlyZWN0b3J5LiAgQ3JlYXRlcyB0aGUgZnVsbCBwYXRoIHdpdGggZm9sZGVycyBpbiBiZXR3ZWVuXHJcbiAqIFdpbGwgdGhyb3cgaWYgaXQgZmFpbHNcclxuICpcclxuICogQHBhcmFtICAgICBwICAgICAgIHBhdGggdG8gY3JlYXRlXHJcbiAqIEByZXR1cm5zICAgdm9pZFxyXG4gKi9cclxuZnVuY3Rpb24gbWtkaXJQKHApIHtcclxuICAgIGlmICghcCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihleHBvcnRzLmxvYygnTElCX1BhcmFtZXRlcklzUmVxdWlyZWQnLCAncCcpKTtcclxuICAgIH1cclxuICAgIC8vIGJ1aWxkIGEgc3RhY2sgb2YgZGlyZWN0b3JpZXMgdG8gY3JlYXRlXHJcbiAgICB2YXIgc3RhY2sgPSBbXTtcclxuICAgIHZhciB0ZXN0RGlyID0gcDtcclxuICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgLy8gdmFsaWRhdGUgdGhlIGxvb3AgaXMgbm90IG91dCBvZiBjb250cm9sXHJcbiAgICAgICAgaWYgKHN0YWNrLmxlbmd0aCA+PSAocHJvY2Vzcy5lbnZbJ1RBU0tMSUJfVEVTVF9NS0RJUlBfRkFJTFNBRkUnXSB8fCAxMDAwKSkge1xyXG4gICAgICAgICAgICAvLyBsZXQgdGhlIGZyYW1ld29yayB0aHJvd1xyXG4gICAgICAgICAgICBleHBvcnRzLmRlYnVnKCdsb29wIGlzIG91dCBvZiBjb250cm9sJyk7XHJcbiAgICAgICAgICAgIGZzLm1rZGlyU3luYyhwKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBleHBvcnRzLmRlYnVnKFwidGVzdGluZyBkaXJlY3RvcnkgJ1wiICsgdGVzdERpciArIFwiJ1wiKTtcclxuICAgICAgICB2YXIgc3RhdHNfMSA9IHZvaWQgMDtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBzdGF0c18xID0gZnMuc3RhdFN5bmModGVzdERpcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgaWYgKGVyci5jb2RlID09ICdFTk9FTlQnKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB2YWxpZGF0ZSB0aGUgZGlyZWN0b3J5IGlzIG5vdCB0aGUgZHJpdmUgcm9vdFxyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudERpciA9IHBhdGguZGlybmFtZSh0ZXN0RGlyKTtcclxuICAgICAgICAgICAgICAgIGlmICh0ZXN0RGlyID09IHBhcmVudERpcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihleHBvcnRzLmxvYygnTElCX01rZGlyRmFpbGVkSW52YWxpZERyaXZlUm9vdCcsIHAsIHRlc3REaXIpKTsgLy8gVW5hYmxlIHRvIGNyZWF0ZSBkaXJlY3RvcnkgJ3twfScuIFJvb3QgZGlyZWN0b3J5IGRvZXMgbm90IGV4aXN0OiAne3Rlc3REaXJ9J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gcHVzaCB0aGUgZGlyIGFuZCB0ZXN0IHRoZSBwYXJlbnRcclxuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2godGVzdERpcik7XHJcbiAgICAgICAgICAgICAgICB0ZXN0RGlyID0gcGFyZW50RGlyO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZXJyLmNvZGUgPT0gJ1VOS05PV04nKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXhwb3J0cy5sb2MoJ0xJQl9Na2RpckZhaWxlZEludmFsaWRTaGFyZScsIHAsIHRlc3REaXIpKTsgLy8gVW5hYmxlIHRvIGNyZWF0ZSBkaXJlY3RvcnkgJ3twfScuIFVuYWJsZSB0byB2ZXJpZnkgdGhlIGRpcmVjdG9yeSBleGlzdHM6ICd7dGVzdERpcn0nLiBJZiBkaXJlY3RvcnkgaXMgYSBmaWxlIHNoYXJlLCBwbGVhc2UgdmVyaWZ5IHRoZSBzaGFyZSBuYW1lIGlzIGNvcnJlY3QsIHRoZSBzaGFyZSBpcyBvbmxpbmUsIGFuZCB0aGUgY3VycmVudCBwcm9jZXNzIGhhcyBwZXJtaXNzaW9uIHRvIGFjY2VzcyB0aGUgc2hhcmUuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzdGF0c18xLmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGV4cG9ydHMubG9jKCdMSUJfTWtkaXJGYWlsZWRGaWxlRXhpc3RzJywgcCwgdGVzdERpcikpOyAvLyBVbmFibGUgdG8gY3JlYXRlIGRpcmVjdG9yeSAne3B9Jy4gQ29uZmxpY3RpbmcgZmlsZSBleGlzdHM6ICd7dGVzdERpcn0nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRlc3REaXIgZXhpc3RzXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICAvLyBjcmVhdGUgZWFjaCBkaXJlY3RvcnlcclxuICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIHtcclxuICAgICAgICB2YXIgZGlyID0gc3RhY2sucG9wKCk7IC8vIG5vbi1udWxsIGJlY2F1c2UgYHN0YWNrLmxlbmd0aGAgd2FzIHRydXRoeVxyXG4gICAgICAgIGV4cG9ydHMuZGVidWcoXCJta2RpciAnXCIgKyBkaXIgKyBcIidcIik7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZnMubWtkaXJTeW5jKGRpcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGV4cG9ydHMubG9jKCdMSUJfTWtkaXJGYWlsZWQnLCBwLCBlcnIubWVzc2FnZSkpOyAvLyBVbmFibGUgdG8gY3JlYXRlIGRpcmVjdG9yeSAne3B9Jy4ge2Vyci5tZXNzYWdlfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLm1rZGlyUCA9IG1rZGlyUDtcclxuLyoqXHJcbiAqIFJlc29sdmVzIGEgc2VxdWVuY2Ugb2YgcGF0aHMgb3IgcGF0aCBzZWdtZW50cyBpbnRvIGFuIGFic29sdXRlIHBhdGguXHJcbiAqIENhbGxzIG5vZGUuanMgcGF0aC5yZXNvbHZlKClcclxuICogQWxsb3dzIEwwIHRlc3Rpbmcgd2l0aCBjb25zaXN0ZW50IHBhdGggZm9ybWF0cyBvbiBNYWMvTGludXggYW5kIFdpbmRvd3MgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb25cclxuICogQHBhcmFtIHBhdGhTZWdtZW50c1xyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuZnVuY3Rpb24gcmVzb2x2ZSgpIHtcclxuICAgIHZhciBwYXRoU2VnbWVudHMgPSBbXTtcclxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgcGF0aFNlZ21lbnRzW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICB9XHJcbiAgICB2YXIgYWJzb2x1dGVQYXRoID0gcGF0aC5yZXNvbHZlLmFwcGx5KHRoaXMsIHBhdGhTZWdtZW50cyk7XHJcbiAgICBleHBvcnRzLmRlYnVnKCdBYnNvbHV0ZSBwYXRoIGZvciBwYXRoU2VnbWVudHM6ICcgKyBwYXRoU2VnbWVudHMgKyAnID0gJyArIGFic29sdXRlUGF0aCk7XHJcbiAgICByZXR1cm4gYWJzb2x1dGVQYXRoO1xyXG59XHJcbmV4cG9ydHMucmVzb2x2ZSA9IHJlc29sdmU7XHJcbmV4cG9ydHMud2hpY2ggPSBpbS5fd2hpY2g7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIGFycmF5IG9mIGZpbGVzIGluIHRoZSBnaXZlbiBwYXRoLCBvciBpbiBjdXJyZW50IGRpcmVjdG9yeSBpZiBubyBwYXRoIHByb3ZpZGVkLiAgU2VlIHNoZWxsanMubHNcclxuICogQHBhcmFtICB7c3RyaW5nfSAgIG9wdGlvbnMgIEF2YWlsYWJsZSBvcHRpb25zOiAtUiAocmVjdXJzaXZlKSwgLUEgKGFsbCBmaWxlcywgaW5jbHVkZSBmaWxlcyBiZWdpbm5pbmcgd2l0aCAuLCBleGNlcHQgZm9yIC4gYW5kIC4uKVxyXG4gKiBAcGFyYW0gIHtzdHJpbmdbXX0gcGF0aHMgICAgUGF0aHMgdG8gc2VhcmNoLlxyXG4gKiBAcmV0dXJuIHtzdHJpbmdbXX0gICAgICAgICAgQW4gYXJyYXkgb2YgZmlsZXMgaW4gdGhlIGdpdmVuIHBhdGgocykuXHJcbiAqL1xyXG5mdW5jdGlvbiBscyhvcHRpb25zLCBwYXRocykge1xyXG4gICAgaWYgKG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gc2hlbGwubHMob3B0aW9ucywgcGF0aHMpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHNoZWxsLmxzKHBhdGhzKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLmxzID0gbHM7XHJcbi8qKlxyXG4gKiBDb3BpZXMgYSBmaWxlIG9yIGZvbGRlci5cclxuICpcclxuICogQHBhcmFtICAgICBzb3VyY2UgICAgIHNvdXJjZSBwYXRoXHJcbiAqIEBwYXJhbSAgICAgZGVzdCAgICAgICBkZXN0aW5hdGlvbiBwYXRoXHJcbiAqIEBwYXJhbSAgICAgb3B0aW9ucyAgICBzdHJpbmcgLXIsIC1mIG9yIC1yZiBmb3IgcmVjdXJzaXZlIGFuZCBmb3JjZVxyXG4gKiBAcGFyYW0gICAgIGNvbnRpbnVlT25FcnJvciBvcHRpb25hbC4gd2hldGhlciB0byBjb250aW51ZSBvbiBlcnJvclxyXG4gKi9cclxuZnVuY3Rpb24gY3Aoc291cmNlLCBkZXN0LCBvcHRpb25zLCBjb250aW51ZU9uRXJyb3IpIHtcclxuICAgIGlmIChvcHRpb25zKSB7XHJcbiAgICAgICAgc2hlbGwuY3Aob3B0aW9ucywgc291cmNlLCBkZXN0KTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHNoZWxsLmNwKHNvdXJjZSwgZGVzdCk7XHJcbiAgICB9XHJcbiAgICBfY2hlY2tTaGVsbCgnY3AnLCBjb250aW51ZU9uRXJyb3IpO1xyXG59XHJcbmV4cG9ydHMuY3AgPSBjcDtcclxuLyoqXHJcbiAqIE1vdmVzIGEgcGF0aC5cclxuICpcclxuICogQHBhcmFtICAgICBzb3VyY2UgICAgIHNvdXJjZSBwYXRoXHJcbiAqIEBwYXJhbSAgICAgZGVzdCAgICAgICBkZXN0aW5hdGlvbiBwYXRoXHJcbiAqIEBwYXJhbSAgICAgb3B0aW9ucyAgICBzdHJpbmcgLWYgb3IgLW4gZm9yIGZvcmNlIGFuZCBubyBjbG9iYmVyXHJcbiAqIEBwYXJhbSAgICAgY29udGludWVPbkVycm9yIG9wdGlvbmFsLiB3aGV0aGVyIHRvIGNvbnRpbnVlIG9uIGVycm9yXHJcbiAqL1xyXG5mdW5jdGlvbiBtdihzb3VyY2UsIGRlc3QsIG9wdGlvbnMsIGNvbnRpbnVlT25FcnJvcikge1xyXG4gICAgaWYgKG9wdGlvbnMpIHtcclxuICAgICAgICBzaGVsbC5tdihvcHRpb25zLCBzb3VyY2UsIGRlc3QpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgc2hlbGwubXYoc291cmNlLCBkZXN0KTtcclxuICAgIH1cclxuICAgIF9jaGVja1NoZWxsKCdtdicsIGNvbnRpbnVlT25FcnJvcik7XHJcbn1cclxuZXhwb3J0cy5tdiA9IG12O1xyXG4vKipcclxuICogUmVjdXJzaXZlbHkgZmluZHMgYWxsIHBhdGhzIGEgZ2l2ZW4gcGF0aC4gUmV0dXJucyBhbiBhcnJheSBvZiBwYXRocy5cclxuICpcclxuICogQHBhcmFtICAgICBmaW5kUGF0aCAgcGF0aCB0byBzZWFyY2hcclxuICogQHBhcmFtICAgICBvcHRpb25zICAgb3B0aW9uYWwuIGRlZmF1bHRzIHRvIHsgZm9sbG93U3ltYm9saWNMaW5rczogdHJ1ZSB9LiBmb2xsb3dpbmcgc29mdCBsaW5rcyBpcyBnZW5lcmFsbHkgYXBwcm9wcmlhdGUgdW5sZXNzIGRlbGV0aW5nIGZpbGVzLlxyXG4gKiBAcmV0dXJucyAgIHN0cmluZ1tdXHJcbiAqL1xyXG5mdW5jdGlvbiBmaW5kKGZpbmRQYXRoLCBvcHRpb25zKSB7XHJcbiAgICBpZiAoIWZpbmRQYXRoKSB7XHJcbiAgICAgICAgZXhwb3J0cy5kZWJ1Zygnbm8gcGF0aCBzcGVjaWZpZWQnKTtcclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICAvLyBub3JtYWxpemUgdGhlIHBhdGgsIG90aGVyd2lzZSB0aGUgZmlyc3QgcmVzdWx0IGlzIGluY29uc2lzdGVudGx5IGZvcm1hdHRlZCBmcm9tIHRoZSByZXN0IG9mIHRoZSByZXN1bHRzXHJcbiAgICAvLyBiZWNhdXNlIHBhdGguam9pbigpIHBlcmZvcm1zIG5vcm1hbGl6YXRpb24uXHJcbiAgICBmaW5kUGF0aCA9IHBhdGgubm9ybWFsaXplKGZpbmRQYXRoKTtcclxuICAgIC8vIGRlYnVnIHRyYWNlIHRoZSBwYXJhbWV0ZXJzXHJcbiAgICBleHBvcnRzLmRlYnVnKFwiZmluZFBhdGg6ICdcIiArIGZpbmRQYXRoICsgXCInXCIpO1xyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwgX2dldERlZmF1bHRGaW5kT3B0aW9ucygpO1xyXG4gICAgX2RlYnVnRmluZE9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAvLyByZXR1cm4gZW1wdHkgaWYgbm90IGV4aXN0c1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBmcy5sc3RhdFN5bmMoZmluZFBhdGgpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGlmIChlcnIuY29kZSA9PSAnRU5PRU5UJykge1xyXG4gICAgICAgICAgICBleHBvcnRzLmRlYnVnKCcwIHJlc3VsdHMnKTtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICAvLyBwdXNoIHRoZSBmaXJzdCBpdGVtXHJcbiAgICAgICAgdmFyIHN0YWNrID0gW25ldyBfRmluZEl0ZW0oZmluZFBhdGgsIDEpXTtcclxuICAgICAgICB2YXIgdHJhdmVyc2FsQ2hhaW4gPSBbXTsgLy8gdXNlZCB0byBkZXRlY3QgY3ljbGVzXHJcbiAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIHBvcCB0aGUgbmV4dCBpdGVtIGFuZCBwdXNoIHRvIHRoZSByZXN1bHQgYXJyYXlcclxuICAgICAgICAgICAgdmFyIGl0ZW0gPSBzdGFjay5wb3AoKTsgLy8gbm9uLW51bGwgYmVjYXVzZSBgc3RhY2subGVuZ3RoYCB3YXMgdHJ1dGh5XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0ucGF0aCk7XHJcbiAgICAgICAgICAgIC8vIHN0YXQgdGhlIGl0ZW0uICB0aGUgc3RhdCBpbmZvIGlzIHVzZWQgZnVydGhlciBiZWxvdyB0byBkZXRlcm1pbmUgd2hldGhlciB0byB0cmF2ZXJzZSBkZWVwZXJcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gc3RhdCByZXR1cm5zIGluZm8gYWJvdXQgdGhlIHRhcmdldCBvZiBhIHN5bWxpbmsgKG9yIHN5bWxpbmsgY2hhaW4pLFxyXG4gICAgICAgICAgICAvLyBsc3RhdCByZXR1cm5zIGluZm8gYWJvdXQgYSBzeW1saW5rIGl0c2VsZlxyXG4gICAgICAgICAgICB2YXIgc3RhdHNfMiA9IHZvaWQgMDtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZm9sbG93U3ltYm9saWNMaW5rcykge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyB1c2Ugc3RhdCAoZm9sbG93aW5nIGFsbCBzeW1saW5rcylcclxuICAgICAgICAgICAgICAgICAgICBzdGF0c18yID0gZnMuc3RhdFN5bmMoaXRlbS5wYXRoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLmNvZGUgPT0gJ0VOT0VOVCcgJiYgb3B0aW9ucy5hbGxvd0Jyb2tlblN5bWJvbGljTGlua3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmFsbGJhY2sgdG8gbHN0YXQgKGJyb2tlbiBzeW1saW5rcyBhbGxvd2VkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0c18yID0gZnMubHN0YXRTeW5jKGl0ZW0ucGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydHMuZGVidWcoXCIgIFwiICsgaXRlbS5wYXRoICsgXCIgKGJyb2tlbiBzeW1saW5rKVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5mb2xsb3dTcGVjaWZpZWRTeW1ib2xpY0xpbmsgJiYgcmVzdWx0Lmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZSBzdGF0IChmb2xsb3dpbmcgc3ltbGlua3MgZm9yIHRoZSBzcGVjaWZpZWQgcGF0aCBhbmQgdGhpcyBpcyB0aGUgc3BlY2lmaWVkIHBhdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHNfMiA9IGZzLnN0YXRTeW5jKGl0ZW0ucGF0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5jb2RlID09ICdFTk9FTlQnICYmIG9wdGlvbnMuYWxsb3dCcm9rZW5TeW1ib2xpY0xpbmtzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbGxiYWNrIHRvIGxzdGF0IChicm9rZW4gc3ltbGlua3MgYWxsb3dlZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHNfMiA9IGZzLmxzdGF0U3luYyhpdGVtLnBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBvcnRzLmRlYnVnKFwiICBcIiArIGl0ZW0ucGF0aCArIFwiIChicm9rZW4gc3ltbGluaylcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gdXNlIGxzdGF0IChub3QgZm9sbG93aW5nIHN5bWxpbmtzKVxyXG4gICAgICAgICAgICAgICAgc3RhdHNfMiA9IGZzLmxzdGF0U3luYyhpdGVtLnBhdGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIG5vdGUsIGlzRGlyZWN0b3J5KCkgcmV0dXJucyBmYWxzZSBmb3IgdGhlIGxzdGF0IG9mIGEgc3ltbGlua1xyXG4gICAgICAgICAgICBpZiAoc3RhdHNfMi5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgICAgICAgICBleHBvcnRzLmRlYnVnKFwiICBcIiArIGl0ZW0ucGF0aCArIFwiIChkaXJlY3RvcnkpXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZm9sbG93U3ltYm9saWNMaW5rcykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgcmVhbHBhdGhcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVhbFBhdGhfMSA9IGZzLnJlYWxwYXRoU3luYyhpdGVtLnBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGZpeHVwIHRoZSB0cmF2ZXJzYWwgY2hhaW4gdG8gbWF0Y2ggdGhlIGl0ZW0gbGV2ZWxcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAodHJhdmVyc2FsQ2hhaW4ubGVuZ3RoID49IGl0ZW0ubGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhdmVyc2FsQ2hhaW4ucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRlc3QgZm9yIGEgY3ljbGVcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhdmVyc2FsQ2hhaW4uc29tZShmdW5jdGlvbiAoeCkgeyByZXR1cm4geCA9PSByZWFsUGF0aF8xOyB9KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBvcnRzLmRlYnVnKCcgICAgY3ljbGUgZGV0ZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiY29udGludWVcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSB0cmF2ZXJzYWwgY2hhaW5cclxuICAgICAgICAgICAgICAgICAgICB0cmF2ZXJzYWxDaGFpbi5wdXNoKHJlYWxQYXRoXzEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gcHVzaCB0aGUgY2hpbGQgaXRlbXMgaW4gcmV2ZXJzZSBvbnRvIHRoZSBzdGFja1xyXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkTGV2ZWxfMSA9IGl0ZW0ubGV2ZWwgKyAxO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkSXRlbXMgPSBmcy5yZWFkZGlyU3luYyhpdGVtLnBhdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbiAoY2hpbGROYW1lKSB7IHJldHVybiBuZXcgX0ZpbmRJdGVtKHBhdGguam9pbihpdGVtLnBhdGgsIGNoaWxkTmFtZSksIGNoaWxkTGV2ZWxfMSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IGNoaWxkSXRlbXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGNoaWxkSXRlbXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZyhcIiAgXCIgKyBpdGVtLnBhdGggKyBcIiAoZmlsZSlcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIHtcclxuICAgICAgICAgICAgX2xvb3BfMSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBleHBvcnRzLmRlYnVnKHJlc3VsdC5sZW5ndGggKyBcIiByZXN1bHRzXCIpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGV4cG9ydHMubG9jKCdMSUJfT3BlcmF0aW9uRmFpbGVkJywgJ2ZpbmQnLCBlcnIubWVzc2FnZSkpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuZmluZCA9IGZpbmQ7XHJcbnZhciBfRmluZEl0ZW0gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBfRmluZEl0ZW0ocGF0aCwgbGV2ZWwpIHtcclxuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xyXG4gICAgICAgIHRoaXMubGV2ZWwgPSBsZXZlbDtcclxuICAgIH1cclxuICAgIHJldHVybiBfRmluZEl0ZW07XHJcbn0oKSk7XHJcbmZ1bmN0aW9uIF9kZWJ1Z0ZpbmRPcHRpb25zKG9wdGlvbnMpIHtcclxuICAgIGV4cG9ydHMuZGVidWcoXCJmaW5kT3B0aW9ucy5hbGxvd0Jyb2tlblN5bWJvbGljTGlua3M6ICdcIiArIG9wdGlvbnMuYWxsb3dCcm9rZW5TeW1ib2xpY0xpbmtzICsgXCInXCIpO1xyXG4gICAgZXhwb3J0cy5kZWJ1ZyhcImZpbmRPcHRpb25zLmZvbGxvd1NwZWNpZmllZFN5bWJvbGljTGluazogJ1wiICsgb3B0aW9ucy5mb2xsb3dTcGVjaWZpZWRTeW1ib2xpY0xpbmsgKyBcIidcIik7XHJcbiAgICBleHBvcnRzLmRlYnVnKFwiZmluZE9wdGlvbnMuZm9sbG93U3ltYm9saWNMaW5rczogJ1wiICsgb3B0aW9ucy5mb2xsb3dTeW1ib2xpY0xpbmtzICsgXCInXCIpO1xyXG59XHJcbmZ1bmN0aW9uIF9nZXREZWZhdWx0RmluZE9wdGlvbnMoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGFsbG93QnJva2VuU3ltYm9saWNMaW5rczogZmFsc2UsXHJcbiAgICAgICAgZm9sbG93U3BlY2lmaWVkU3ltYm9saWNMaW5rOiB0cnVlLFxyXG4gICAgICAgIGZvbGxvd1N5bWJvbGljTGlua3M6IHRydWVcclxuICAgIH07XHJcbn1cclxuLyoqXHJcbiAqIFByZWZlciB0bC5maW5kKCkgYW5kIHRsLm1hdGNoKCkgaW5zdGVhZC4gVGhpcyBmdW5jdGlvbiBpcyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxyXG4gKiB3aGVuIHBvcnRpbmcgdGFza3MgdG8gTm9kZSBmcm9tIHRoZSBQb3dlclNoZWxsIG9yIFBvd2VyU2hlbGwzIGV4ZWN1dGlvbiBoYW5kbGVyLlxyXG4gKlxyXG4gKiBAcGFyYW0gICAgcm9vdERpcmVjdG9yeSAgICAgIHBhdGggdG8gcm9vdCB1bnJvb3RlZCBwYXR0ZXJucyB3aXRoXHJcbiAqIEBwYXJhbSAgICBwYXR0ZXJuICAgICAgICAgICAgaW5jbHVkZSBhbmQgZXhjbHVkZSBwYXR0ZXJuc1xyXG4gKiBAcGFyYW0gICAgaW5jbHVkZUZpbGVzICAgICAgIHdoZXRoZXIgdG8gaW5jbHVkZSBmaWxlcyBpbiB0aGUgcmVzdWx0LiBkZWZhdWx0cyB0byB0cnVlIHdoZW4gaW5jbHVkZUZpbGVzIGFuZCBpbmNsdWRlRGlyZWN0b3JpZXMgYXJlIGJvdGggZmFsc2VcclxuICogQHBhcmFtICAgIGluY2x1ZGVEaXJlY3RvcmllcyB3aGV0aGVyIHRvIGluY2x1ZGUgZGlyZWN0b3JpZXMgaW4gdGhlIHJlc3VsdFxyXG4gKiBAcmV0dXJucyAgc3RyaW5nW11cclxuICovXHJcbmZ1bmN0aW9uIGxlZ2FjeUZpbmRGaWxlcyhyb290RGlyZWN0b3J5LCBwYXR0ZXJuLCBpbmNsdWRlRmlsZXMsIGluY2x1ZGVEaXJlY3Rvcmllcykge1xyXG4gICAgaWYgKCFwYXR0ZXJuKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwYXR0ZXJuIHBhcmFtZXRlciBjYW5ub3QgYmUgZW1wdHknKTtcclxuICAgIH1cclxuICAgIGV4cG9ydHMuZGVidWcoXCJsZWdhY3lGaW5kRmlsZXMgcm9vdERpcmVjdG9yeTogJ1wiICsgcm9vdERpcmVjdG9yeSArIFwiJ1wiKTtcclxuICAgIGV4cG9ydHMuZGVidWcoXCJwYXR0ZXJuOiAnXCIgKyBwYXR0ZXJuICsgXCInXCIpO1xyXG4gICAgZXhwb3J0cy5kZWJ1ZyhcImluY2x1ZGVGaWxlczogJ1wiICsgaW5jbHVkZUZpbGVzICsgXCInXCIpO1xyXG4gICAgZXhwb3J0cy5kZWJ1ZyhcImluY2x1ZGVEaXJlY3RvcmllczogJ1wiICsgaW5jbHVkZURpcmVjdG9yaWVzICsgXCInXCIpO1xyXG4gICAgaWYgKCFpbmNsdWRlRmlsZXMgJiYgIWluY2x1ZGVEaXJlY3Rvcmllcykge1xyXG4gICAgICAgIGluY2x1ZGVGaWxlcyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICAvLyBvcmdhbml6ZSB0aGUgcGF0dGVybnMgaW50byBpbmNsdWRlIHBhdHRlcm5zIGFuZCBleGNsdWRlIHBhdHRlcm5zXHJcbiAgICB2YXIgaW5jbHVkZVBhdHRlcm5zID0gW107XHJcbiAgICB2YXIgZXhjbHVkZVBhdHRlcm5zID0gW107XHJcbiAgICBwYXR0ZXJuID0gcGF0dGVybi5yZXBsYWNlKC87Oy9nLCAnXFwwJyk7XHJcbiAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gcGF0dGVybi5zcGxpdCgnOycpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIHZhciBwYXQgPSBfYVtfaV07XHJcbiAgICAgICAgaWYgKCFwYXQpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBhdCA9IHBhdC5yZXBsYWNlKC9cXDAvZywgJzsnKTtcclxuICAgICAgICAvLyBkZXRlcm1pbmUgd2hldGhlciBpbmNsdWRlIHBhdHRlcm4gYW5kIHJlbW92ZSBhbnkgaW5jbHVkZS9leGNsdWRlIHByZWZpeC5cclxuICAgICAgICAvLyBpbmNsdWRlIHBhdHRlcm5zIHN0YXJ0IHdpdGggKzogb3IgYW55dGhpbmcgb3RoZXIgdGhhbiAtOlxyXG4gICAgICAgIC8vIGV4Y2x1ZGUgcGF0dGVybnMgc3RhcnQgd2l0aCAtOlxyXG4gICAgICAgIHZhciBpc0luY2x1ZGVQYXR0ZXJuID0gdm9pZCAwO1xyXG4gICAgICAgIGlmIChpbS5fc3RhcnRzV2l0aChwYXQsICcrOicpKSB7XHJcbiAgICAgICAgICAgIHBhdCA9IHBhdC5zdWJzdHJpbmcoMik7XHJcbiAgICAgICAgICAgIGlzSW5jbHVkZVBhdHRlcm4gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChpbS5fc3RhcnRzV2l0aChwYXQsICctOicpKSB7XHJcbiAgICAgICAgICAgIHBhdCA9IHBhdC5zdWJzdHJpbmcoMik7XHJcbiAgICAgICAgICAgIGlzSW5jbHVkZVBhdHRlcm4gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlzSW5jbHVkZVBhdHRlcm4gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB2YWxpZGF0ZSBwYXR0ZXJuIGRvZXMgbm90IGVuZCB3aXRoIGEgc2xhc2hcclxuICAgICAgICBpZiAoaW0uX2VuZHNXaXRoKHBhdCwgJy8nKSB8fCAocHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInICYmIGltLl9lbmRzV2l0aChwYXQsICdcXFxcJykpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihleHBvcnRzLmxvYygnTElCX0ludmFsaWRQYXR0ZXJuJywgcGF0KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHJvb3QgdGhlIHBhdHRlcm5cclxuICAgICAgICBpZiAocm9vdERpcmVjdG9yeSAmJiAhcGF0aC5pc0Fic29sdXRlKHBhdCkpIHtcclxuICAgICAgICAgICAgcGF0ID0gcGF0aC5qb2luKHJvb3REaXJlY3RvcnksIHBhdCk7XHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSB0cmFpbGluZyBzbGFzaCBzb21ldGltZXMgYWRkZWQgYnkgcGF0aC5qb2luKCkgb24gV2luZG93cywgZS5nLlxyXG4gICAgICAgICAgICAvLyAgICAgIHBhdGguam9pbignXFxcXFxcXFxoZWxsbycsICd3b3JsZCcpID0+ICdcXFxcXFxcXGhlbGxvXFxcXHdvcmxkXFxcXCdcclxuICAgICAgICAgICAgLy8gICAgICBwYXRoLmpvaW4oJy8vaGVsbG8nLCAnd29ybGQnKSA9PiAnXFxcXFxcXFxoZWxsb1xcXFx3b3JsZFxcXFwnXHJcbiAgICAgICAgICAgIGlmIChpbS5fZW5kc1dpdGgocGF0LCAnXFxcXCcpKSB7XHJcbiAgICAgICAgICAgICAgICBwYXQgPSBwYXQuc3Vic3RyaW5nKDAsIHBhdC5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNJbmNsdWRlUGF0dGVybikge1xyXG4gICAgICAgICAgICBpbmNsdWRlUGF0dGVybnMucHVzaChwYXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZXhjbHVkZVBhdHRlcm5zLnB1c2goaW0uX2xlZ2FjeUZpbmRGaWxlc19jb252ZXJ0UGF0dGVyblRvUmVnRXhwKHBhdCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIGZpbmQgYW5kIGFwcGx5IHBhdHRlcm5zXHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIHJlc3VsdCA9IF9sZWdhY3lGaW5kRmlsZXNfZ2V0TWF0Y2hpbmdJdGVtcyhpbmNsdWRlUGF0dGVybnMsIGV4Y2x1ZGVQYXR0ZXJucywgISFpbmNsdWRlRmlsZXMsICEhaW5jbHVkZURpcmVjdG9yaWVzKTtcclxuICAgIGV4cG9ydHMuZGVidWcoJ2FsbCBtYXRjaGVzOicpO1xyXG4gICAgZm9yICh2YXIgX2IgPSAwLCByZXN1bHRfMSA9IHJlc3VsdDsgX2IgPCByZXN1bHRfMS5sZW5ndGg7IF9iKyspIHtcclxuICAgICAgICB2YXIgcmVzdWx0SXRlbSA9IHJlc3VsdF8xW19iXTtcclxuICAgICAgICBleHBvcnRzLmRlYnVnKCcgJyArIHJlc3VsdEl0ZW0pO1xyXG4gICAgfVxyXG4gICAgZXhwb3J0cy5kZWJ1ZygndG90YWwgbWF0Y2hlZDogJyArIHJlc3VsdC5sZW5ndGgpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5leHBvcnRzLmxlZ2FjeUZpbmRGaWxlcyA9IGxlZ2FjeUZpbmRGaWxlcztcclxuZnVuY3Rpb24gX2xlZ2FjeUZpbmRGaWxlc19nZXRNYXRjaGluZ0l0ZW1zKGluY2x1ZGVQYXR0ZXJucywgZXhjbHVkZVBhdHRlcm5zLCBpbmNsdWRlRmlsZXMsIGluY2x1ZGVEaXJlY3Rvcmllcykge1xyXG4gICAgZXhwb3J0cy5kZWJ1ZygnZ2V0TWF0Y2hpbmdJdGVtcygpJyk7XHJcbiAgICBmb3IgKHZhciBfaSA9IDAsIGluY2x1ZGVQYXR0ZXJuc18xID0gaW5jbHVkZVBhdHRlcm5zOyBfaSA8IGluY2x1ZGVQYXR0ZXJuc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIHZhciBwYXR0ZXJuID0gaW5jbHVkZVBhdHRlcm5zXzFbX2ldO1xyXG4gICAgICAgIGV4cG9ydHMuZGVidWcoXCJpbmNsdWRlUGF0dGVybjogJ1wiICsgcGF0dGVybiArIFwiJ1wiKTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIF9hID0gMCwgZXhjbHVkZVBhdHRlcm5zXzEgPSBleGNsdWRlUGF0dGVybnM7IF9hIDwgZXhjbHVkZVBhdHRlcm5zXzEubGVuZ3RoOyBfYSsrKSB7XHJcbiAgICAgICAgdmFyIHBhdHRlcm4gPSBleGNsdWRlUGF0dGVybnNfMVtfYV07XHJcbiAgICAgICAgZXhwb3J0cy5kZWJ1ZyhcImV4Y2x1ZGVQYXR0ZXJuOiBcIiArIHBhdHRlcm4pO1xyXG4gICAgfVxyXG4gICAgZXhwb3J0cy5kZWJ1ZygnaW5jbHVkZUZpbGVzOiAnICsgaW5jbHVkZUZpbGVzKTtcclxuICAgIGV4cG9ydHMuZGVidWcoJ2luY2x1ZGVEaXJlY3RvcmllczogJyArIGluY2x1ZGVEaXJlY3Rvcmllcyk7XHJcbiAgICB2YXIgYWxsRmlsZXMgPSB7fTtcclxuICAgIHZhciBfbG9vcF8yID0gZnVuY3Rpb24gKHBhdHRlcm4pIHtcclxuICAgICAgICAvLyBkZXRlcm1pbmUgdGhlIGRpcmVjdG9yeSB0byBzZWFyY2hcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIG5vdGUsIGdldERpcmVjdG9yeU5hbWUgcmVtb3ZlcyByZWR1bmRhbnQgcGF0aCBzZXBhcmF0b3JzXHJcbiAgICAgICAgdmFyIGZpbmRQYXRoID0gdm9pZCAwO1xyXG4gICAgICAgIHZhciBzdGFySW5kZXggPSBwYXR0ZXJuLmluZGV4T2YoJyonKTtcclxuICAgICAgICB2YXIgcXVlc3Rpb25JbmRleCA9IHBhdHRlcm4uaW5kZXhPZignPycpO1xyXG4gICAgICAgIGlmIChzdGFySW5kZXggPCAwICYmIHF1ZXN0aW9uSW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgIC8vIGlmIG5vIHdpbGRjYXJkcyBhcmUgZm91bmQsIHVzZSB0aGUgZGlyZWN0b3J5IG5hbWUgcG9ydGlvbiBvZiB0aGUgcGF0aC5cclxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gZGlyZWN0b3J5IG5hbWUgKGZpbGUgbmFtZSBvbmx5IGluIHBhdHRlcm4gb3IgZHJpdmUgcm9vdCksXHJcbiAgICAgICAgICAgIC8vIHRoaXMgd2lsbCByZXR1cm4gZW1wdHkgc3RyaW5nLlxyXG4gICAgICAgICAgICBmaW5kUGF0aCA9IGltLl9nZXREaXJlY3RvcnlOYW1lKHBhdHRlcm4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gZXh0cmFjdCB0aGUgZGlyZWN0b3J5IHByaW9yIHRvIHRoZSBmaXJzdCB3aWxkY2FyZFxyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSBNYXRoLm1pbihzdGFySW5kZXggPj0gMCA/IHN0YXJJbmRleCA6IHF1ZXN0aW9uSW5kZXgsIHF1ZXN0aW9uSW5kZXggPj0gMCA/IHF1ZXN0aW9uSW5kZXggOiBzdGFySW5kZXgpO1xyXG4gICAgICAgICAgICBmaW5kUGF0aCA9IGltLl9nZXREaXJlY3RvcnlOYW1lKHBhdHRlcm4uc3Vic3RyaW5nKDAsIGluZGV4KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vdGUsIGR1ZSB0byB0aGlzIHNob3J0LWNpcmN1aXQgYW5kIHRoZSBhYm92ZSB1c2FnZSBvZiBnZXREaXJlY3RvcnlOYW1lLCB0aGlzXHJcbiAgICAgICAgLy8gZnVuY3Rpb24gaGFzIHRoZSBzYW1lIGxpbWl0YXRpb25zIHJlZ2FyZGluZyBkcml2ZSByb290cyBhcyB0aGUgcG93ZXJzaGVsbFxyXG4gICAgICAgIC8vIGltcGxlbWVudGF0aW9uLlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gYWxzbyBub3RlLCBzaW5jZSBnZXREaXJlY3RvcnlOYW1lIGVsaW1pbmF0ZXMgc2xhc2ggcmVkdW5kYW5jaWVzLCBzb21lIGFkZGl0aW9uYWxcclxuICAgICAgICAvLyB3b3JrIG1heSBiZSByZXF1aXJlZCBpZiByZW1vdmFsIG9mIHRoaXMgbGltaXRhdGlvbiBpcyBhdHRlbXB0ZWQuXHJcbiAgICAgICAgaWYgKCFmaW5kUGF0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJjb250aW51ZVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcGF0dGVyblJlZ2V4ID0gaW0uX2xlZ2FjeUZpbmRGaWxlc19jb252ZXJ0UGF0dGVyblRvUmVnRXhwKHBhdHRlcm4pO1xyXG4gICAgICAgIC8vIGZpbmQgZmlsZXMvZGlyZWN0b3JpZXNcclxuICAgICAgICB2YXIgaXRlbXMgPSBmaW5kKGZpbmRQYXRoLCB7IGZvbGxvd1N5bWJvbGljTGlua3M6IHRydWUgfSlcclxuICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoaW5jbHVkZUZpbGVzICYmIGluY2x1ZGVEaXJlY3Rvcmllcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGlzRGlyID0gZnMuc3RhdFN5bmMoaXRlbSkuaXNEaXJlY3RvcnkoKTtcclxuICAgICAgICAgICAgcmV0dXJuIChpbmNsdWRlRmlsZXMgJiYgIWlzRGlyKSB8fCAoaW5jbHVkZURpcmVjdG9yaWVzICYmIGlzRGlyKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICB2YXIgbm9ybWFsaXplZFBhdGggPSBwcm9jZXNzLnBsYXRmb3JtID09ICd3aW4zMicgPyBpdGVtLnJlcGxhY2UoL1xcXFwvZywgJy8nKSA6IGl0ZW07IC8vIG5vcm1hbGl6ZSBzZXBhcmF0b3JzXHJcbiAgICAgICAgICAgIC8vICoqL3RpbWVzLyoqIHdpbGwgbm90IG1hdGNoIEM6L2Z1bi90aW1lcyBiZWNhdXNlIHRoZXJlIGlzbid0IGEgdHJhaWxpbmcgc2xhc2hcclxuICAgICAgICAgICAgLy8gc28gdHJ5IGJvdGggaWYgaW5jbHVkaW5nIGRpcmVjdG9yaWVzXHJcbiAgICAgICAgICAgIHZhciBhbHRlcm5hdGVQYXRoID0gbm9ybWFsaXplZFBhdGggKyBcIi9cIjsgLy8gcG90ZW50aWFsIGJ1ZzogaXQgbG9va3MgbGlrZSB0aGlzIHdpbGwgcmVzdWx0IGluIGEgZmFsc2VcclxuICAgICAgICAgICAgLy8gcG9zaXRpdmUgaWYgdGhlIGl0ZW0gaXMgYSByZWd1bGFyIGZpbGUgYW5kIG5vdCBhIGRpcmVjdG9yeVxyXG4gICAgICAgICAgICB2YXIgaXNNYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAocGF0dGVyblJlZ2V4LnRlc3Qobm9ybWFsaXplZFBhdGgpIHx8IChpbmNsdWRlRGlyZWN0b3JpZXMgJiYgcGF0dGVyblJlZ2V4LnRlc3QoYWx0ZXJuYXRlUGF0aCkpKSB7XHJcbiAgICAgICAgICAgICAgICBpc01hdGNoID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIC8vIHRlc3Qgd2hldGhlciB0aGUgcGF0aCBzaG91bGQgYmUgZXhjbHVkZWRcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgZXhjbHVkZVBhdHRlcm5zXzIgPSBleGNsdWRlUGF0dGVybnM7IF9pIDwgZXhjbHVkZVBhdHRlcm5zXzIubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlZ2V4ID0gZXhjbHVkZVBhdHRlcm5zXzJbX2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWdleC50ZXN0KG5vcm1hbGl6ZWRQYXRoKSB8fCAoaW5jbHVkZURpcmVjdG9yaWVzICYmIHJlZ2V4LnRlc3QoYWx0ZXJuYXRlUGF0aCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc01hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICBhbGxGaWxlc1tpdGVtXSA9IGl0ZW07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBmb3IgKHZhciBfYiA9IDAsIGluY2x1ZGVQYXR0ZXJuc18yID0gaW5jbHVkZVBhdHRlcm5zOyBfYiA8IGluY2x1ZGVQYXR0ZXJuc18yLmxlbmd0aDsgX2IrKykge1xyXG4gICAgICAgIHZhciBwYXR0ZXJuID0gaW5jbHVkZVBhdHRlcm5zXzJbX2JdO1xyXG4gICAgICAgIF9sb29wXzIocGF0dGVybik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoYWxsRmlsZXMpLnNvcnQoKTtcclxufVxyXG4vKipcclxuICogUmVtb3ZlIGEgcGF0aCByZWN1cnNpdmVseSB3aXRoIGZvcmNlXHJcbiAqXHJcbiAqIEBwYXJhbSAgICAgaW5wdXRQYXRoIHBhdGggdG8gcmVtb3ZlXHJcbiAqIEB0aHJvd3MgICAgd2hlbiB0aGUgZmlsZSBvciBkaXJlY3RvcnkgZXhpc3RzIGJ1dCBjb3VsZCBub3QgYmUgZGVsZXRlZC5cclxuICovXHJcbmZ1bmN0aW9uIHJtUkYoaW5wdXRQYXRoKSB7XHJcbiAgICBleHBvcnRzLmRlYnVnKCdybSAtcmYgJyArIGlucHV0UGF0aCk7XHJcbiAgICBpZiAoZ2V0UGxhdGZvcm0oKSA9PSBQbGF0Zm9ybS5XaW5kb3dzKSB7XHJcbiAgICAgICAgLy8gTm9kZSBkb2Vzbid0IHByb3ZpZGUgYSBkZWxldGUgb3BlcmF0aW9uLCBvbmx5IGFuIHVubGluayBmdW5jdGlvbi4gVGhpcyBtZWFucyB0aGF0IGlmIHRoZSBmaWxlIGlzIGJlaW5nIHVzZWQgYnkgYW5vdGhlclxyXG4gICAgICAgIC8vIHByb2dyYW0gKGUuZy4gYW50aXZpcnVzKSwgaXQgd29uJ3QgYmUgZGVsZXRlZC4gVG8gYWRkcmVzcyB0aGlzLCB3ZSBzaGVsbCBvdXQgdGhlIHdvcmsgdG8gcmQvZGVsLlxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChmcy5zdGF0U3luYyhpbnB1dFBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgICAgIGV4cG9ydHMuZGVidWcoJ3JlbW92aW5nIGRpcmVjdG9yeSAnICsgaW5wdXRQYXRoKTtcclxuICAgICAgICAgICAgICAgIGNoaWxkUHJvY2Vzcy5leGVjU3luYyhcInJkIC9zIC9xIFxcXCJcIiArIGlucHV0UGF0aCArIFwiXFxcIlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGV4cG9ydHMuZGVidWcoJ3JlbW92aW5nIGZpbGUgJyArIGlucHV0UGF0aCk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3MuZXhlY1N5bmMoXCJkZWwgL2YgL2EgXFxcIlwiICsgaW5wdXRQYXRoICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgLy8gaWYgeW91IHRyeSB0byBkZWxldGUgYSBmaWxlIHRoYXQgZG9lc24ndCBleGlzdCwgZGVzaXJlZCByZXN1bHQgaXMgYWNoaWV2ZWRcclxuICAgICAgICAgICAgLy8gb3RoZXIgZXJyb3JzIGFyZSB2YWxpZFxyXG4gICAgICAgICAgICBpZiAoZXJyLmNvZGUgIT0gJ0VOT0VOVCcpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihleHBvcnRzLmxvYygnTElCX09wZXJhdGlvbkZhaWxlZCcsICdybVJGJywgZXJyLm1lc3NhZ2UpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBTaGVsbGluZyBvdXQgZmFpbHMgdG8gcmVtb3ZlIGEgc3ltbGluayBmb2xkZXIgd2l0aCBtaXNzaW5nIHNvdXJjZSwgdGhpcyB1bmxpbmsgY2F0Y2hlcyB0aGF0XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZnMudW5saW5rU3luYyhpbnB1dFBhdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIC8vIGlmIHlvdSB0cnkgdG8gZGVsZXRlIGEgZmlsZSB0aGF0IGRvZXNuJ3QgZXhpc3QsIGRlc2lyZWQgcmVzdWx0IGlzIGFjaGlldmVkXHJcbiAgICAgICAgICAgIC8vIG90aGVyIGVycm9ycyBhcmUgdmFsaWRcclxuICAgICAgICAgICAgaWYgKGVyci5jb2RlICE9ICdFTk9FTlQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXhwb3J0cy5sb2MoJ0xJQl9PcGVyYXRpb25GYWlsZWQnLCAncm1SRicsIGVyci5tZXNzYWdlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvLyBnZXQgdGhlIGxzdGF0cyBpbiBvcmRlciB0byB3b3JrYXJvdW5kIGEgYnVnIGluIHNoZWxsanNAMC4zLjAgd2hlcmUgc3ltbGlua3NcclxuICAgICAgICAvLyB3aXRoIG1pc3NpbmcgdGFyZ2V0cyBhcmUgbm90IGhhbmRsZWQgY29ycmVjdGx5IGJ5IFwicm0oJy1yZicsIHBhdGgpXCJcclxuICAgICAgICB2YXIgbHN0YXRzID0gdm9pZCAwO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxzdGF0cyA9IGZzLmxzdGF0U3luYyhpbnB1dFBhdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIC8vIGlmIHlvdSB0cnkgdG8gZGVsZXRlIGEgZmlsZSB0aGF0IGRvZXNuJ3QgZXhpc3QsIGRlc2lyZWQgcmVzdWx0IGlzIGFjaGlldmVkXHJcbiAgICAgICAgICAgIC8vIG90aGVyIGVycm9ycyBhcmUgdmFsaWRcclxuICAgICAgICAgICAgaWYgKGVyci5jb2RlID09ICdFTk9FTlQnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGV4cG9ydHMubG9jKCdMSUJfT3BlcmF0aW9uRmFpbGVkJywgJ3JtUkYnLCBlcnIubWVzc2FnZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZygncmVtb3ZpbmcgZGlyZWN0b3J5Jyk7XHJcbiAgICAgICAgICAgIHNoZWxsLnJtKCctcmYnLCBpbnB1dFBhdGgpO1xyXG4gICAgICAgICAgICB2YXIgZXJyTXNnID0gc2hlbGwuZXJyb3IoKTtcclxuICAgICAgICAgICAgaWYgKGVyck1zZykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGV4cG9ydHMubG9jKCdMSUJfT3BlcmF0aW9uRmFpbGVkJywgJ3JtUkYnLCBlcnJNc2cpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV4cG9ydHMuZGVidWcoJ3JlbW92aW5nIGZpbGUnKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBmcy51bmxpbmtTeW5jKGlucHV0UGF0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGV4cG9ydHMubG9jKCdMSUJfT3BlcmF0aW9uRmFpbGVkJywgJ3JtUkYnLCBlcnIubWVzc2FnZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLnJtUkYgPSBybVJGO1xyXG4vKipcclxuICogRXhlYyBhIHRvb2wuICBDb252ZW5pZW5jZSB3cmFwcGVyIG92ZXIgVG9vbFJ1bm5lciB0byBleGVjIHdpdGggYXJncyBpbiBvbmUgY2FsbC5cclxuICogT3V0cHV0IHdpbGwgYmUgc3RyZWFtZWQgdG8gdGhlIGxpdmUgY29uc29sZS5cclxuICogUmV0dXJucyBwcm9taXNlIHdpdGggcmV0dXJuIGNvZGVcclxuICpcclxuICogQHBhcmFtICAgICB0b29sICAgICBwYXRoIHRvIHRvb2wgdG8gZXhlY1xyXG4gKiBAcGFyYW0gICAgIGFyZ3MgICAgIGFuIGFyZyBzdHJpbmcgb3IgYXJyYXkgb2YgYXJnc1xyXG4gKiBAcGFyYW0gICAgIG9wdGlvbnMgIG9wdGlvbmFsIGV4ZWMgb3B0aW9ucy4gIFNlZSBJRXhlY09wdGlvbnNcclxuICogQHJldHVybnMgICBudW1iZXJcclxuICovXHJcbmZ1bmN0aW9uIGV4ZWModG9vbCwgYXJncywgb3B0aW9ucykge1xyXG4gICAgdmFyIHRyID0gdGhpcy50b29sKHRvb2wpO1xyXG4gICAgdHIub24oJ2RlYnVnJywgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICBleHBvcnRzLmRlYnVnKGRhdGEpO1xyXG4gICAgfSk7XHJcbiAgICBpZiAoYXJncykge1xyXG4gICAgICAgIGlmIChhcmdzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgdHIuYXJnKGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgKGFyZ3MpID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0ci5saW5lKGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0ci5leGVjKG9wdGlvbnMpO1xyXG59XHJcbmV4cG9ydHMuZXhlYyA9IGV4ZWM7XHJcbi8qKlxyXG4gKiBFeGVjIGEgdG9vbCBzeW5jaHJvbm91c2x5LiAgQ29udmVuaWVuY2Ugd3JhcHBlciBvdmVyIFRvb2xSdW5uZXIgdG8gZXhlY1N5bmMgd2l0aCBhcmdzIGluIG9uZSBjYWxsLlxyXG4gKiBPdXRwdXQgd2lsbCBiZSAqbm90KiBiZSBzdHJlYW1lZCB0byB0aGUgbGl2ZSBjb25zb2xlLiAgSXQgd2lsbCBiZSByZXR1cm5lZCBhZnRlciBleGVjdXRpb24gaXMgY29tcGxldGUuXHJcbiAqIEFwcHJvcHJpYXRlIGZvciBzaG9ydCBydW5uaW5nIHRvb2xzXHJcbiAqIFJldHVybnMgSUV4ZWNSZXN1bHQgd2l0aCBvdXRwdXQgYW5kIHJldHVybiBjb2RlXHJcbiAqXHJcbiAqIEBwYXJhbSAgICAgdG9vbCAgICAgcGF0aCB0byB0b29sIHRvIGV4ZWNcclxuICogQHBhcmFtICAgICBhcmdzICAgICBhbiBhcmcgc3RyaW5nIG9yIGFycmF5IG9mIGFyZ3NcclxuICogQHBhcmFtICAgICBvcHRpb25zICBvcHRpb25hbCBleGVjIG9wdGlvbnMuICBTZWUgSUV4ZWNTeW5jT3B0aW9uc1xyXG4gKiBAcmV0dXJucyAgIElFeGVjU3luY1Jlc3VsdFxyXG4gKi9cclxuZnVuY3Rpb24gZXhlY1N5bmModG9vbCwgYXJncywgb3B0aW9ucykge1xyXG4gICAgdmFyIHRyID0gdGhpcy50b29sKHRvb2wpO1xyXG4gICAgdHIub24oJ2RlYnVnJywgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICBleHBvcnRzLmRlYnVnKGRhdGEpO1xyXG4gICAgfSk7XHJcbiAgICBpZiAoYXJncykge1xyXG4gICAgICAgIGlmIChhcmdzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgdHIuYXJnKGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgKGFyZ3MpID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0ci5saW5lKGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0ci5leGVjU3luYyhvcHRpb25zKTtcclxufVxyXG5leHBvcnRzLmV4ZWNTeW5jID0gZXhlY1N5bmM7XHJcbi8qKlxyXG4gKiBDb252ZW5pZW5jZSBmYWN0b3J5IHRvIGNyZWF0ZSBhIFRvb2xSdW5uZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSAgICAgdG9vbCAgICAgcGF0aCB0byB0b29sIHRvIGV4ZWNcclxuICogQHJldHVybnMgICBUb29sUnVubmVyXHJcbiAqL1xyXG5mdW5jdGlvbiB0b29sKHRvb2wpIHtcclxuICAgIHZhciB0ciA9IG5ldyB0cm0uVG9vbFJ1bm5lcih0b29sKTtcclxuICAgIHRyLm9uKCdkZWJ1ZycsIGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICAgICAgZXhwb3J0cy5kZWJ1ZyhtZXNzYWdlKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHRyO1xyXG59XHJcbmV4cG9ydHMudG9vbCA9IHRvb2w7XHJcbi8qKlxyXG4gKiBBcHBsaWVzIGdsb2IgcGF0dGVybnMgdG8gYSBsaXN0IG9mIHBhdGhzLiBTdXBwb3J0cyBpbnRlcmxlYXZlZCBleGNsdWRlIHBhdHRlcm5zLlxyXG4gKlxyXG4gKiBAcGFyYW0gIGxpc3QgICAgICAgICBhcnJheSBvZiBwYXRoc1xyXG4gKiBAcGFyYW0gIHBhdHRlcm5zICAgICBwYXR0ZXJucyB0byBhcHBseS4gc3VwcG9ydHMgaW50ZXJsZWF2ZWQgZXhjbHVkZSBwYXR0ZXJucy5cclxuICogQHBhcmFtICBwYXR0ZXJuUm9vdCAgb3B0aW9uYWwuIGRlZmF1bHQgcm9vdCB0byBhcHBseSB0byB1bnJvb3RlZCBwYXR0ZXJucy4gbm90IGFwcGxpZWQgdG8gYmFzZW5hbWUtb25seSBwYXR0ZXJucyB3aGVuIG1hdGNoQmFzZTp0cnVlLlxyXG4gKiBAcGFyYW0gIG9wdGlvbnMgICAgICBvcHRpb25hbC4gZGVmYXVsdHMgdG8geyBkb3Q6IHRydWUsIG5vYnJhY2U6IHRydWUsIG5vY2FzZTogcHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInIH0uXHJcbiAqL1xyXG5mdW5jdGlvbiBtYXRjaChsaXN0LCBwYXR0ZXJucywgcGF0dGVyblJvb3QsIG9wdGlvbnMpIHtcclxuICAgIC8vIHRyYWNlIHBhcmFtZXRlcnNcclxuICAgIGV4cG9ydHMuZGVidWcoXCJwYXR0ZXJuUm9vdDogJ1wiICsgcGF0dGVyblJvb3QgKyBcIidcIik7XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCBfZ2V0RGVmYXVsdE1hdGNoT3B0aW9ucygpOyAvLyBkZWZhdWx0IG1hdGNoIG9wdGlvbnNcclxuICAgIF9kZWJ1Z01hdGNoT3B0aW9ucyhvcHRpb25zKTtcclxuICAgIC8vIGNvbnZlcnQgcGF0dGVybiB0byBhbiBhcnJheVxyXG4gICAgaWYgKHR5cGVvZiBwYXR0ZXJucyA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgIHBhdHRlcm5zID0gW3BhdHRlcm5zXTtcclxuICAgIH1cclxuICAgIC8vIGhhc2h0YWJsZSB0byBrZWVwIHRyYWNrIG9mIG1hdGNoZXNcclxuICAgIHZhciBtYXAgPSB7fTtcclxuICAgIHZhciBvcmlnaW5hbE9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwLCBwYXR0ZXJuc18xID0gcGF0dGVybnM7IF9pIDwgcGF0dGVybnNfMS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICB2YXIgcGF0dGVybiA9IHBhdHRlcm5zXzFbX2ldO1xyXG4gICAgICAgIGV4cG9ydHMuZGVidWcoXCJwYXR0ZXJuOiAnXCIgKyBwYXR0ZXJuICsgXCInXCIpO1xyXG4gICAgICAgIC8vIHRyaW0gYW5kIHNraXAgZW1wdHlcclxuICAgICAgICBwYXR0ZXJuID0gKHBhdHRlcm4gfHwgJycpLnRyaW0oKTtcclxuICAgICAgICBpZiAoIXBhdHRlcm4pIHtcclxuICAgICAgICAgICAgZXhwb3J0cy5kZWJ1Zygnc2tpcHBpbmcgZW1wdHkgcGF0dGVybicpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2xvbmUgbWF0Y2ggb3B0aW9uc1xyXG4gICAgICAgIHZhciBvcHRpb25zXzEgPSBpbS5fY2xvbmVNYXRjaE9wdGlvbnMob3JpZ2luYWxPcHRpb25zKTtcclxuICAgICAgICAvLyBza2lwIGNvbW1lbnRzXHJcbiAgICAgICAgaWYgKCFvcHRpb25zXzEubm9jb21tZW50ICYmIGltLl9zdGFydHNXaXRoKHBhdHRlcm4sICcjJykpIHtcclxuICAgICAgICAgICAgZXhwb3J0cy5kZWJ1Zygnc2tpcHBpbmcgY29tbWVudCcpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2V0IG5vY29tbWVudCAtIGJyYWNlIGV4cGFuc2lvbiBjb3VsZCByZXN1bHQgaW4gYSBsZWFkaW5nICcjJ1xyXG4gICAgICAgIG9wdGlvbnNfMS5ub2NvbW1lbnQgPSB0cnVlO1xyXG4gICAgICAgIC8vIGRldGVybWluZSB3aGV0aGVyIHBhdHRlcm4gaXMgaW5jbHVkZSBvciBleGNsdWRlXHJcbiAgICAgICAgdmFyIG5lZ2F0ZUNvdW50ID0gMDtcclxuICAgICAgICBpZiAoIW9wdGlvbnNfMS5ub25lZ2F0ZSkge1xyXG4gICAgICAgICAgICB3aGlsZSAocGF0dGVybi5jaGFyQXQobmVnYXRlQ291bnQpID09ICchJykge1xyXG4gICAgICAgICAgICAgICAgbmVnYXRlQ291bnQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHJpbmcobmVnYXRlQ291bnQpOyAvLyB0cmltIGxlYWRpbmcgJyEnXHJcbiAgICAgICAgICAgIGlmIChuZWdhdGVDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZyhcInRyaW1tZWQgbGVhZGluZyAnIScuIHBhdHRlcm46ICdcIiArIHBhdHRlcm4gKyBcIidcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGlzSW5jbHVkZVBhdHRlcm4gPSBuZWdhdGVDb3VudCA9PSAwIHx8XHJcbiAgICAgICAgICAgIChuZWdhdGVDb3VudCAlIDIgPT0gMCAmJiAhb3B0aW9uc18xLmZsaXBOZWdhdGUpIHx8XHJcbiAgICAgICAgICAgIChuZWdhdGVDb3VudCAlIDIgPT0gMSAmJiBvcHRpb25zXzEuZmxpcE5lZ2F0ZSk7XHJcbiAgICAgICAgLy8gc2V0IG5vbmVnYXRlIC0gYnJhY2UgZXhwYW5zaW9uIGNvdWxkIHJlc3VsdCBpbiBhIGxlYWRpbmcgJyEnXHJcbiAgICAgICAgb3B0aW9uc18xLm5vbmVnYXRlID0gdHJ1ZTtcclxuICAgICAgICBvcHRpb25zXzEuZmxpcE5lZ2F0ZSA9IGZhbHNlO1xyXG4gICAgICAgIC8vIGV4cGFuZCBicmFjZXMgLSByZXF1aXJlZCB0byBhY2N1cmF0ZWx5IHJvb3QgcGF0dGVybnNcclxuICAgICAgICB2YXIgZXhwYW5kZWQgPSB2b2lkIDA7XHJcbiAgICAgICAgdmFyIHByZUV4cGFuZGVkID0gcGF0dGVybjtcclxuICAgICAgICBpZiAob3B0aW9uc18xLm5vYnJhY2UpIHtcclxuICAgICAgICAgICAgZXhwYW5kZWQgPSBbcGF0dGVybl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBjb252ZXJ0IHNsYXNoZXMgb24gV2luZG93cyBiZWZvcmUgY2FsbGluZyBicmFjZUV4cGFuZCgpLiB1bmZvcnR1bmF0ZWx5IHRoaXMgbWVhbnMgYnJhY2VzIGNhbm5vdFxyXG4gICAgICAgICAgICAvLyBiZSBlc2NhcGVkIG9uIFdpbmRvd3MsIHRoaXMgbGltaXRhdGlvbiBpcyBjb25zaXN0ZW50IHdpdGggY3VycmVudCBsaW1pdGF0aW9ucyBvZiBtaW5pbWF0Y2ggKDMuMC4zKS5cclxuICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZygnZXhwYW5kaW5nIGJyYWNlcycpO1xyXG4gICAgICAgICAgICB2YXIgY29udmVydGVkUGF0dGVybiA9IHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJyA/IHBhdHRlcm4ucmVwbGFjZSgvXFxcXC9nLCAnLycpIDogcGF0dGVybjtcclxuICAgICAgICAgICAgZXhwYW5kZWQgPSBtaW5pbWF0Y2guYnJhY2VFeHBhbmQoY29udmVydGVkUGF0dGVybik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNldCBub2JyYWNlXHJcbiAgICAgICAgb3B0aW9uc18xLm5vYnJhY2UgPSB0cnVlO1xyXG4gICAgICAgIGZvciAodmFyIF9hID0gMCwgZXhwYW5kZWRfMSA9IGV4cGFuZGVkOyBfYSA8IGV4cGFuZGVkXzEubGVuZ3RoOyBfYSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXR0ZXJuXzEgPSBleHBhbmRlZF8xW19hXTtcclxuICAgICAgICAgICAgaWYgKGV4cGFuZGVkLmxlbmd0aCAhPSAxIHx8IHBhdHRlcm5fMSAhPSBwcmVFeHBhbmRlZCkge1xyXG4gICAgICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZyhcInBhdHRlcm46ICdcIiArIHBhdHRlcm5fMSArIFwiJ1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB0cmltIGFuZCBza2lwIGVtcHR5XHJcbiAgICAgICAgICAgIHBhdHRlcm5fMSA9IChwYXR0ZXJuXzEgfHwgJycpLnRyaW0oKTtcclxuICAgICAgICAgICAgaWYgKCFwYXR0ZXJuXzEpIHtcclxuICAgICAgICAgICAgICAgIGV4cG9ydHMuZGVidWcoJ3NraXBwaW5nIGVtcHR5IHBhdHRlcm4nKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHJvb3QgdGhlIHBhdHRlcm4gd2hlbiBhbGwgb2YgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSB0cnVlOlxyXG4gICAgICAgICAgICBpZiAocGF0dGVyblJvb3QgJiYgLy8gcGF0dGVyblJvb3Qgc3VwcGxpZWRcclxuICAgICAgICAgICAgICAgICFpbS5faXNSb290ZWQocGF0dGVybl8xKSAmJiAvLyBBTkQgcGF0dGVybiBub3Qgcm9vdGVkXHJcbiAgICAgICAgICAgICAgICAvLyBBTkQgbWF0Y2hCYXNlOmZhbHNlIG9yIG5vdCBiYXNlbmFtZSBvbmx5XHJcbiAgICAgICAgICAgICAgICAoIW9wdGlvbnNfMS5tYXRjaEJhc2UgfHwgKHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJyA/IHBhdHRlcm5fMS5yZXBsYWNlKC9cXFxcL2csICcvJykgOiBwYXR0ZXJuXzEpLmluZGV4T2YoJy8nKSA+PSAwKSkge1xyXG4gICAgICAgICAgICAgICAgcGF0dGVybl8xID0gaW0uX2Vuc3VyZVJvb3RlZChwYXR0ZXJuUm9vdCwgcGF0dGVybl8xKTtcclxuICAgICAgICAgICAgICAgIGV4cG9ydHMuZGVidWcoXCJyb290ZWQgcGF0dGVybjogJ1wiICsgcGF0dGVybl8xICsgXCInXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc0luY2x1ZGVQYXR0ZXJuKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhcHBseSB0aGUgcGF0dGVyblxyXG4gICAgICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZygnYXBwbHlpbmcgaW5jbHVkZSBwYXR0ZXJuIGFnYWluc3Qgb3JpZ2luYWwgbGlzdCcpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoUmVzdWx0cyA9IG1pbmltYXRjaC5tYXRjaChsaXN0LCBwYXR0ZXJuXzEsIG9wdGlvbnNfMSk7XHJcbiAgICAgICAgICAgICAgICBleHBvcnRzLmRlYnVnKG1hdGNoUmVzdWx0cy5sZW5ndGggKyAnIG1hdGNoZXMnKTtcclxuICAgICAgICAgICAgICAgIC8vIHVuaW9uIHRoZSByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IDAsIG1hdGNoUmVzdWx0c18xID0gbWF0Y2hSZXN1bHRzOyBfYiA8IG1hdGNoUmVzdWx0c18xLmxlbmd0aDsgX2IrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXRjaFJlc3VsdCA9IG1hdGNoUmVzdWx0c18xW19iXTtcclxuICAgICAgICAgICAgICAgICAgICBtYXBbbWF0Y2hSZXN1bHRdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIGFwcGx5IHRoZSBwYXR0ZXJuXHJcbiAgICAgICAgICAgICAgICBleHBvcnRzLmRlYnVnKCdhcHBseWluZyBleGNsdWRlIHBhdHRlcm4gYWdhaW5zdCBvcmlnaW5hbCBsaXN0Jyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hSZXN1bHRzID0gbWluaW1hdGNoLm1hdGNoKGxpc3QsIHBhdHRlcm5fMSwgb3B0aW9uc18xKTtcclxuICAgICAgICAgICAgICAgIGV4cG9ydHMuZGVidWcobWF0Y2hSZXN1bHRzLmxlbmd0aCArICcgbWF0Y2hlcycpO1xyXG4gICAgICAgICAgICAgICAgLy8gc3Vic3RyYWN0IHRoZSByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfYyA9IDAsIG1hdGNoUmVzdWx0c18yID0gbWF0Y2hSZXN1bHRzOyBfYyA8IG1hdGNoUmVzdWx0c18yLmxlbmd0aDsgX2MrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXRjaFJlc3VsdCA9IG1hdGNoUmVzdWx0c18yW19jXTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgbWFwW21hdGNoUmVzdWx0XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHJldHVybiBhIGZpbHRlcmVkIHZlcnNpb24gb2YgdGhlIG9yaWdpbmFsIGxpc3QgKHByZXNlcnZlcyBvcmRlciBhbmQgcHJldmVudHMgZHVwbGljYXRpb24pXHJcbiAgICB2YXIgcmVzdWx0ID0gbGlzdC5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHsgcmV0dXJuIG1hcC5oYXNPd25Qcm9wZXJ0eShpdGVtKTsgfSk7XHJcbiAgICBleHBvcnRzLmRlYnVnKHJlc3VsdC5sZW5ndGggKyAnIGZpbmFsIHJlc3VsdHMnKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuZXhwb3J0cy5tYXRjaCA9IG1hdGNoO1xyXG4vKipcclxuICogRmlsdGVyIHRvIGFwcGx5IGdsb2IgcGF0dGVybnNcclxuICpcclxuICogQHBhcmFtICBwYXR0ZXJuICBwYXR0ZXJuIHRvIGFwcGx5XHJcbiAqIEBwYXJhbSAgb3B0aW9ucyAgb3B0aW9uYWwuIGRlZmF1bHRzIHRvIHsgZG90OiB0cnVlLCBub2JyYWNlOiB0cnVlLCBub2Nhc2U6IHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJyB9LlxyXG4gKi9cclxuZnVuY3Rpb24gZmlsdGVyKHBhdHRlcm4sIG9wdGlvbnMpIHtcclxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IF9nZXREZWZhdWx0TWF0Y2hPcHRpb25zKCk7XHJcbiAgICByZXR1cm4gbWluaW1hdGNoLmZpbHRlcihwYXR0ZXJuLCBvcHRpb25zKTtcclxufVxyXG5leHBvcnRzLmZpbHRlciA9IGZpbHRlcjtcclxuZnVuY3Rpb24gX2RlYnVnTWF0Y2hPcHRpb25zKG9wdGlvbnMpIHtcclxuICAgIGV4cG9ydHMuZGVidWcoXCJtYXRjaE9wdGlvbnMuZGVidWc6ICdcIiArIG9wdGlvbnMuZGVidWcgKyBcIidcIik7XHJcbiAgICBleHBvcnRzLmRlYnVnKFwibWF0Y2hPcHRpb25zLm5vYnJhY2U6ICdcIiArIG9wdGlvbnMubm9icmFjZSArIFwiJ1wiKTtcclxuICAgIGV4cG9ydHMuZGVidWcoXCJtYXRjaE9wdGlvbnMubm9nbG9ic3RhcjogJ1wiICsgb3B0aW9ucy5ub2dsb2JzdGFyICsgXCInXCIpO1xyXG4gICAgZXhwb3J0cy5kZWJ1ZyhcIm1hdGNoT3B0aW9ucy5kb3Q6ICdcIiArIG9wdGlvbnMuZG90ICsgXCInXCIpO1xyXG4gICAgZXhwb3J0cy5kZWJ1ZyhcIm1hdGNoT3B0aW9ucy5ub2V4dDogJ1wiICsgb3B0aW9ucy5ub2V4dCArIFwiJ1wiKTtcclxuICAgIGV4cG9ydHMuZGVidWcoXCJtYXRjaE9wdGlvbnMubm9jYXNlOiAnXCIgKyBvcHRpb25zLm5vY2FzZSArIFwiJ1wiKTtcclxuICAgIGV4cG9ydHMuZGVidWcoXCJtYXRjaE9wdGlvbnMubm9udWxsOiAnXCIgKyBvcHRpb25zLm5vbnVsbCArIFwiJ1wiKTtcclxuICAgIGV4cG9ydHMuZGVidWcoXCJtYXRjaE9wdGlvbnMubWF0Y2hCYXNlOiAnXCIgKyBvcHRpb25zLm1hdGNoQmFzZSArIFwiJ1wiKTtcclxuICAgIGV4cG9ydHMuZGVidWcoXCJtYXRjaE9wdGlvbnMubm9jb21tZW50OiAnXCIgKyBvcHRpb25zLm5vY29tbWVudCArIFwiJ1wiKTtcclxuICAgIGV4cG9ydHMuZGVidWcoXCJtYXRjaE9wdGlvbnMubm9uZWdhdGU6ICdcIiArIG9wdGlvbnMubm9uZWdhdGUgKyBcIidcIik7XHJcbiAgICBleHBvcnRzLmRlYnVnKFwibWF0Y2hPcHRpb25zLmZsaXBOZWdhdGU6ICdcIiArIG9wdGlvbnMuZmxpcE5lZ2F0ZSArIFwiJ1wiKTtcclxufVxyXG5mdW5jdGlvbiBfZ2V0RGVmYXVsdE1hdGNoT3B0aW9ucygpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZGVidWc6IGZhbHNlLFxyXG4gICAgICAgIG5vYnJhY2U6IHRydWUsXHJcbiAgICAgICAgbm9nbG9ic3RhcjogZmFsc2UsXHJcbiAgICAgICAgZG90OiB0cnVlLFxyXG4gICAgICAgIG5vZXh0OiBmYWxzZSxcclxuICAgICAgICBub2Nhc2U6IHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJyxcclxuICAgICAgICBub251bGw6IGZhbHNlLFxyXG4gICAgICAgIG1hdGNoQmFzZTogZmFsc2UsXHJcbiAgICAgICAgbm9jb21tZW50OiBmYWxzZSxcclxuICAgICAgICBub25lZ2F0ZTogZmFsc2UsXHJcbiAgICAgICAgZmxpcE5lZ2F0ZTogZmFsc2VcclxuICAgIH07XHJcbn1cclxuLyoqXHJcbiAqIERldGVybWluZXMgdGhlIGZpbmQgcm9vdCBmcm9tIGEgbGlzdCBvZiBwYXR0ZXJucy4gUGVyZm9ybXMgdGhlIGZpbmQgYW5kIHRoZW4gYXBwbGllcyB0aGUgZ2xvYiBwYXR0ZXJucy5cclxuICogU3VwcG9ydHMgaW50ZXJsZWF2ZWQgZXhjbHVkZSBwYXR0ZXJucy4gVW5yb290ZWQgcGF0dGVybnMgYXJlIHJvb3RlZCB1c2luZyBkZWZhdWx0Um9vdCwgdW5sZXNzXHJcbiAqIG1hdGNoT3B0aW9ucy5tYXRjaEJhc2UgaXMgc3BlY2lmaWVkIGFuZCB0aGUgcGF0dGVybiBpcyBhIGJhc2VuYW1lIG9ubHkuIEZvciBtYXRjaEJhc2UgY2FzZXMsIHRoZVxyXG4gKiBkZWZhdWx0Um9vdCBpcyB1c2VkIGFzIHRoZSBmaW5kIHJvb3QuXHJcbiAqXHJcbiAqIEBwYXJhbSAgZGVmYXVsdFJvb3QgICBkZWZhdWx0IHBhdGggdG8gcm9vdCB1bnJvb3RlZCBwYXR0ZXJucy4gZmFsbHMgYmFjayB0byBTeXN0ZW0uRGVmYXVsdFdvcmtpbmdEaXJlY3Rvcnkgb3IgcHJvY2Vzcy5jd2QoKS5cclxuICogQHBhcmFtICBwYXR0ZXJucyAgICAgIHBhdHRlcm4gb3IgYXJyYXkgb2YgcGF0dGVybnMgdG8gYXBwbHlcclxuICogQHBhcmFtICBmaW5kT3B0aW9ucyAgIGRlZmF1bHRzIHRvIHsgZm9sbG93U3ltYm9saWNMaW5rczogdHJ1ZSB9LiBmb2xsb3dpbmcgc29mdCBsaW5rcyBpcyBnZW5lcmFsbHkgYXBwcm9wcmlhdGUgdW5sZXNzIGRlbGV0aW5nIGZpbGVzLlxyXG4gKiBAcGFyYW0gIG1hdGNoT3B0aW9ucyAgZGVmYXVsdHMgdG8geyBkb3Q6IHRydWUsIG5vYnJhY2U6IHRydWUsIG5vY2FzZTogcHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInIH1cclxuICovXHJcbmZ1bmN0aW9uIGZpbmRNYXRjaChkZWZhdWx0Um9vdCwgcGF0dGVybnMsIGZpbmRPcHRpb25zLCBtYXRjaE9wdGlvbnMpIHtcclxuICAgIC8vIGFwcGx5IGRlZmF1bHRzIGZvciBwYXJhbWV0ZXJzIGFuZCB0cmFjZVxyXG4gICAgZGVmYXVsdFJvb3QgPSBkZWZhdWx0Um9vdCB8fCB0aGlzLmdldFZhcmlhYmxlKCdzeXN0ZW0uZGVmYXVsdFdvcmtpbmdEaXJlY3RvcnknKSB8fCBwcm9jZXNzLmN3ZCgpO1xyXG4gICAgZXhwb3J0cy5kZWJ1ZyhcImRlZmF1bHRSb290OiAnXCIgKyBkZWZhdWx0Um9vdCArIFwiJ1wiKTtcclxuICAgIHBhdHRlcm5zID0gcGF0dGVybnMgfHwgW107XHJcbiAgICBwYXR0ZXJucyA9IHR5cGVvZiBwYXR0ZXJucyA9PSAnc3RyaW5nJyA/IFtwYXR0ZXJuc10gOiBwYXR0ZXJucztcclxuICAgIGZpbmRPcHRpb25zID0gZmluZE9wdGlvbnMgfHwgX2dldERlZmF1bHRGaW5kT3B0aW9ucygpO1xyXG4gICAgX2RlYnVnRmluZE9wdGlvbnMoZmluZE9wdGlvbnMpO1xyXG4gICAgbWF0Y2hPcHRpb25zID0gbWF0Y2hPcHRpb25zIHx8IF9nZXREZWZhdWx0TWF0Y2hPcHRpb25zKCk7XHJcbiAgICBfZGVidWdNYXRjaE9wdGlvbnMobWF0Y2hPcHRpb25zKTtcclxuICAgIC8vIG5vcm1hbGl6ZSBzbGFzaGVzIGZvciByb290IGRpclxyXG4gICAgZGVmYXVsdFJvb3QgPSBpbS5fbm9ybWFsaXplU2VwYXJhdG9ycyhkZWZhdWx0Um9vdCk7XHJcbiAgICB2YXIgcmVzdWx0cyA9IHt9O1xyXG4gICAgdmFyIG9yaWdpbmFsTWF0Y2hPcHRpb25zID0gbWF0Y2hPcHRpb25zO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IChwYXR0ZXJucyB8fCBbXSk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgdmFyIHBhdHRlcm4gPSBfYVtfaV07XHJcbiAgICAgICAgZXhwb3J0cy5kZWJ1ZyhcInBhdHRlcm46ICdcIiArIHBhdHRlcm4gKyBcIidcIik7XHJcbiAgICAgICAgLy8gdHJpbSBhbmQgc2tpcCBlbXB0eVxyXG4gICAgICAgIHBhdHRlcm4gPSAocGF0dGVybiB8fCAnJykudHJpbSgpO1xyXG4gICAgICAgIGlmICghcGF0dGVybikge1xyXG4gICAgICAgICAgICBleHBvcnRzLmRlYnVnKCdza2lwcGluZyBlbXB0eSBwYXR0ZXJuJyk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBjbG9uZSBtYXRjaCBvcHRpb25zXHJcbiAgICAgICAgdmFyIG1hdGNoT3B0aW9uc18xID0gaW0uX2Nsb25lTWF0Y2hPcHRpb25zKG9yaWdpbmFsTWF0Y2hPcHRpb25zKTtcclxuICAgICAgICAvLyBza2lwIGNvbW1lbnRzXHJcbiAgICAgICAgaWYgKCFtYXRjaE9wdGlvbnNfMS5ub2NvbW1lbnQgJiYgaW0uX3N0YXJ0c1dpdGgocGF0dGVybiwgJyMnKSkge1xyXG4gICAgICAgICAgICBleHBvcnRzLmRlYnVnKCdza2lwcGluZyBjb21tZW50Jyk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZXQgbm9jb21tZW50IC0gYnJhY2UgZXhwYW5zaW9uIGNvdWxkIHJlc3VsdCBpbiBhIGxlYWRpbmcgJyMnXHJcbiAgICAgICAgbWF0Y2hPcHRpb25zXzEubm9jb21tZW50ID0gdHJ1ZTtcclxuICAgICAgICAvLyBkZXRlcm1pbmUgd2hldGhlciBwYXR0ZXJuIGlzIGluY2x1ZGUgb3IgZXhjbHVkZVxyXG4gICAgICAgIHZhciBuZWdhdGVDb3VudCA9IDA7XHJcbiAgICAgICAgaWYgKCFtYXRjaE9wdGlvbnNfMS5ub25lZ2F0ZSkge1xyXG4gICAgICAgICAgICB3aGlsZSAocGF0dGVybi5jaGFyQXQobmVnYXRlQ291bnQpID09ICchJykge1xyXG4gICAgICAgICAgICAgICAgbmVnYXRlQ291bnQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHJpbmcobmVnYXRlQ291bnQpOyAvLyB0cmltIGxlYWRpbmcgJyEnXHJcbiAgICAgICAgICAgIGlmIChuZWdhdGVDb3VudCkge1xyXG4gICAgICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZyhcInRyaW1tZWQgbGVhZGluZyAnIScuIHBhdHRlcm46ICdcIiArIHBhdHRlcm4gKyBcIidcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGlzSW5jbHVkZVBhdHRlcm4gPSBuZWdhdGVDb3VudCA9PSAwIHx8XHJcbiAgICAgICAgICAgIChuZWdhdGVDb3VudCAlIDIgPT0gMCAmJiAhbWF0Y2hPcHRpb25zXzEuZmxpcE5lZ2F0ZSkgfHxcclxuICAgICAgICAgICAgKG5lZ2F0ZUNvdW50ICUgMiA9PSAxICYmIG1hdGNoT3B0aW9uc18xLmZsaXBOZWdhdGUpO1xyXG4gICAgICAgIC8vIHNldCBub25lZ2F0ZSAtIGJyYWNlIGV4cGFuc2lvbiBjb3VsZCByZXN1bHQgaW4gYSBsZWFkaW5nICchJ1xyXG4gICAgICAgIG1hdGNoT3B0aW9uc18xLm5vbmVnYXRlID0gdHJ1ZTtcclxuICAgICAgICBtYXRjaE9wdGlvbnNfMS5mbGlwTmVnYXRlID0gZmFsc2U7XHJcbiAgICAgICAgLy8gZXhwYW5kIGJyYWNlcyAtIHJlcXVpcmVkIHRvIGFjY3VyYXRlbHkgaW50ZXJwcmV0IGZpbmRQYXRoXHJcbiAgICAgICAgdmFyIGV4cGFuZGVkID0gdm9pZCAwO1xyXG4gICAgICAgIHZhciBwcmVFeHBhbmRlZCA9IHBhdHRlcm47XHJcbiAgICAgICAgaWYgKG1hdGNoT3B0aW9uc18xLm5vYnJhY2UpIHtcclxuICAgICAgICAgICAgZXhwYW5kZWQgPSBbcGF0dGVybl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBjb252ZXJ0IHNsYXNoZXMgb24gV2luZG93cyBiZWZvcmUgY2FsbGluZyBicmFjZUV4cGFuZCgpLiB1bmZvcnR1bmF0ZWx5IHRoaXMgbWVhbnMgYnJhY2VzIGNhbm5vdFxyXG4gICAgICAgICAgICAvLyBiZSBlc2NhcGVkIG9uIFdpbmRvd3MsIHRoaXMgbGltaXRhdGlvbiBpcyBjb25zaXN0ZW50IHdpdGggY3VycmVudCBsaW1pdGF0aW9ucyBvZiBtaW5pbWF0Y2ggKDMuMC4zKS5cclxuICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZygnZXhwYW5kaW5nIGJyYWNlcycpO1xyXG4gICAgICAgICAgICB2YXIgY29udmVydGVkUGF0dGVybiA9IHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJyA/IHBhdHRlcm4ucmVwbGFjZSgvXFxcXC9nLCAnLycpIDogcGF0dGVybjtcclxuICAgICAgICAgICAgZXhwYW5kZWQgPSBtaW5pbWF0Y2guYnJhY2VFeHBhbmQoY29udmVydGVkUGF0dGVybik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNldCBub2JyYWNlXHJcbiAgICAgICAgbWF0Y2hPcHRpb25zXzEubm9icmFjZSA9IHRydWU7XHJcbiAgICAgICAgZm9yICh2YXIgX2IgPSAwLCBleHBhbmRlZF8yID0gZXhwYW5kZWQ7IF9iIDwgZXhwYW5kZWRfMi5sZW5ndGg7IF9iKyspIHtcclxuICAgICAgICAgICAgdmFyIHBhdHRlcm5fMiA9IGV4cGFuZGVkXzJbX2JdO1xyXG4gICAgICAgICAgICBpZiAoZXhwYW5kZWQubGVuZ3RoICE9IDEgfHwgcGF0dGVybl8yICE9IHByZUV4cGFuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICBleHBvcnRzLmRlYnVnKFwicGF0dGVybjogJ1wiICsgcGF0dGVybl8yICsgXCInXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHRyaW0gYW5kIHNraXAgZW1wdHlcclxuICAgICAgICAgICAgcGF0dGVybl8yID0gKHBhdHRlcm5fMiB8fCAnJykudHJpbSgpO1xyXG4gICAgICAgICAgICBpZiAoIXBhdHRlcm5fMikge1xyXG4gICAgICAgICAgICAgICAgZXhwb3J0cy5kZWJ1Zygnc2tpcHBpbmcgZW1wdHkgcGF0dGVybicpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzSW5jbHVkZVBhdHRlcm4pIHtcclxuICAgICAgICAgICAgICAgIC8vIGRldGVybWluZSB0aGUgZmluZFBhdGhcclxuICAgICAgICAgICAgICAgIHZhciBmaW5kSW5mbyA9IGltLl9nZXRGaW5kSW5mb0Zyb21QYXR0ZXJuKGRlZmF1bHRSb290LCBwYXR0ZXJuXzIsIG1hdGNoT3B0aW9uc18xKTtcclxuICAgICAgICAgICAgICAgIHZhciBmaW5kUGF0aCA9IGZpbmRJbmZvLmZpbmRQYXRoO1xyXG4gICAgICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZyhcImZpbmRQYXRoOiAnXCIgKyBmaW5kUGF0aCArIFwiJ1wiKTtcclxuICAgICAgICAgICAgICAgIGlmICghZmluZFBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBleHBvcnRzLmRlYnVnKCdza2lwcGluZyBlbXB0eSBwYXRoJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBwZXJmb3JtIHRoZSBmaW5kXHJcbiAgICAgICAgICAgICAgICBleHBvcnRzLmRlYnVnKFwic3RhdE9ubHk6ICdcIiArIGZpbmRJbmZvLnN0YXRPbmx5ICsgXCInXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpbmRSZXN1bHRzID0gW107XHJcbiAgICAgICAgICAgICAgICBpZiAoZmluZEluZm8uc3RhdE9ubHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBzaW1wbHkgc3RhdCB0aGUgcGF0aCAtIGFsbCBwYXRoIHNlZ21lbnRzIHdlcmUgdXNlZCB0byBidWlsZCB0aGUgcGF0aFxyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLnN0YXRTeW5jKGZpbmRQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZFJlc3VsdHMucHVzaChmaW5kUGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5jb2RlICE9ICdFTk9FTlQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZygnRU5PRU5UJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmluZFJlc3VsdHMgPSBmaW5kKGZpbmRQYXRoLCBmaW5kT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBleHBvcnRzLmRlYnVnKFwiZm91bmQgXCIgKyBmaW5kUmVzdWx0cy5sZW5ndGggKyBcIiBwYXRoc1wiKTtcclxuICAgICAgICAgICAgICAgIC8vIGFwcGx5IHRoZSBwYXR0ZXJuXHJcbiAgICAgICAgICAgICAgICBleHBvcnRzLmRlYnVnKCdhcHBseWluZyBpbmNsdWRlIHBhdHRlcm4nKTtcclxuICAgICAgICAgICAgICAgIGlmIChmaW5kSW5mby5hZGp1c3RlZFBhdHRlcm4gIT0gcGF0dGVybl8yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZyhcImFkanVzdGVkUGF0dGVybjogJ1wiICsgZmluZEluZm8uYWRqdXN0ZWRQYXR0ZXJuICsgXCInXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm5fMiA9IGZpbmRJbmZvLmFkanVzdGVkUGF0dGVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBtYXRjaFJlc3VsdHMgPSBtaW5pbWF0Y2gubWF0Y2goZmluZFJlc3VsdHMsIHBhdHRlcm5fMiwgbWF0Y2hPcHRpb25zXzEpO1xyXG4gICAgICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZyhtYXRjaFJlc3VsdHMubGVuZ3RoICsgJyBtYXRjaGVzJyk7XHJcbiAgICAgICAgICAgICAgICAvLyB1bmlvbiB0aGUgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2MgPSAwLCBtYXRjaFJlc3VsdHNfMyA9IG1hdGNoUmVzdWx0czsgX2MgPCBtYXRjaFJlc3VsdHNfMy5sZW5ndGg7IF9jKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWF0Y2hSZXN1bHQgPSBtYXRjaFJlc3VsdHNfM1tfY107XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJyA/IG1hdGNoUmVzdWx0LnRvVXBwZXJDYXNlKCkgOiBtYXRjaFJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2tleV0gPSBtYXRjaFJlc3VsdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIGJhc2VuYW1lIG9ubHkgYW5kIG1hdGNoQmFzZT10cnVlXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hPcHRpb25zXzEubWF0Y2hCYXNlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgIWltLl9pc1Jvb3RlZChwYXR0ZXJuXzIpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgKHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJyA/IHBhdHRlcm5fMi5yZXBsYWNlKC9cXFxcL2csICcvJykgOiBwYXR0ZXJuXzIpLmluZGV4T2YoJy8nKSA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBkbyBub3Qgcm9vdCB0aGUgcGF0dGVyblxyXG4gICAgICAgICAgICAgICAgICAgIGV4cG9ydHMuZGVidWcoJ21hdGNoQmFzZSBhbmQgYmFzZW5hbWUgb25seScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcm9vdCB0aGUgZXhjbHVkZSBwYXR0ZXJuXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybl8yID0gaW0uX2Vuc3VyZVBhdHRlcm5Sb290ZWQoZGVmYXVsdFJvb3QsIHBhdHRlcm5fMik7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZyhcImFmdGVyIGVuc3VyZVBhdHRlcm5Sb290ZWQsIHBhdHRlcm46ICdcIiArIHBhdHRlcm5fMiArIFwiJ1wiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGFwcGx5IHRoZSBwYXR0ZXJuXHJcbiAgICAgICAgICAgICAgICBleHBvcnRzLmRlYnVnKCdhcHBseWluZyBleGNsdWRlIHBhdHRlcm4nKTtcclxuICAgICAgICAgICAgICAgIHZhciBtYXRjaFJlc3VsdHMgPSBtaW5pbWF0Y2gubWF0Y2goT2JqZWN0LmtleXMocmVzdWx0cykubWFwKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIHJlc3VsdHNba2V5XTsgfSksIHBhdHRlcm5fMiwgbWF0Y2hPcHRpb25zXzEpO1xyXG4gICAgICAgICAgICAgICAgZXhwb3J0cy5kZWJ1ZyhtYXRjaFJlc3VsdHMubGVuZ3RoICsgJyBtYXRjaGVzJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBzdWJzdHJhY3QgdGhlIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIF9kID0gMCwgbWF0Y2hSZXN1bHRzXzQgPSBtYXRjaFJlc3VsdHM7IF9kIDwgbWF0Y2hSZXN1bHRzXzQubGVuZ3RoOyBfZCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hdGNoUmVzdWx0ID0gbWF0Y2hSZXN1bHRzXzRbX2RdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBwcm9jZXNzLnBsYXRmb3JtID09ICd3aW4zMicgPyBtYXRjaFJlc3VsdC50b1VwcGVyQ2FzZSgpIDogbWF0Y2hSZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJlc3VsdHNba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHZhciBmaW5hbFJlc3VsdCA9IE9iamVjdC5rZXlzKHJlc3VsdHMpXHJcbiAgICAgICAgLm1hcChmdW5jdGlvbiAoa2V5KSB7IHJldHVybiByZXN1bHRzW2tleV07IH0pXHJcbiAgICAgICAgLnNvcnQoKTtcclxuICAgIGV4cG9ydHMuZGVidWcoZmluYWxSZXN1bHQubGVuZ3RoICsgJyBmaW5hbCByZXN1bHRzJyk7XHJcbiAgICByZXR1cm4gZmluYWxSZXN1bHQ7XHJcbn1cclxuZXhwb3J0cy5maW5kTWF0Y2ggPSBmaW5kTWF0Y2g7XHJcbi8qKlxyXG4gKiBHZXRzIGh0dHAgcHJveHkgY29uZmlndXJhdGlvbiB1c2VkIGJ5IEJ1aWxkL1JlbGVhc2UgYWdlbnRcclxuICpcclxuICogQHJldHVybiAgUHJveHlDb25maWd1cmF0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRIdHRwUHJveHlDb25maWd1cmF0aW9uKHJlcXVlc3RVcmwpIHtcclxuICAgIHZhciBwcm94eVVybCA9IGV4cG9ydHMuZ2V0VmFyaWFibGUoJ0FnZW50LlByb3h5VXJsJyk7XHJcbiAgICBpZiAocHJveHlVcmwgJiYgcHJveHlVcmwubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHZhciBwcm94eVVzZXJuYW1lID0gZXhwb3J0cy5nZXRWYXJpYWJsZSgnQWdlbnQuUHJveHlVc2VybmFtZScpO1xyXG4gICAgICAgIHZhciBwcm94eVBhc3N3b3JkID0gZXhwb3J0cy5nZXRWYXJpYWJsZSgnQWdlbnQuUHJveHlQYXNzd29yZCcpO1xyXG4gICAgICAgIHZhciBwcm94eUJ5cGFzc0hvc3RzID0gSlNPTi5wYXJzZShleHBvcnRzLmdldFZhcmlhYmxlKCdBZ2VudC5Qcm94eUJ5cGFzc0xpc3QnKSB8fCAnW10nKTtcclxuICAgICAgICB2YXIgYnlwYXNzXzEgPSBmYWxzZTtcclxuICAgICAgICBpZiAocmVxdWVzdFVybCkge1xyXG4gICAgICAgICAgICBwcm94eUJ5cGFzc0hvc3RzLmZvckVhY2goZnVuY3Rpb24gKGJ5cGFzc0hvc3QpIHtcclxuICAgICAgICAgICAgICAgIGlmIChuZXcgUmVnRXhwKGJ5cGFzc0hvc3QsICdpJykudGVzdChyZXF1ZXN0VXJsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ5cGFzc18xID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChieXBhc3NfMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBwcm94eVVybDogcHJveHlVcmwsXHJcbiAgICAgICAgICAgICAgICBwcm94eVVzZXJuYW1lOiBwcm94eVVzZXJuYW1lLFxyXG4gICAgICAgICAgICAgICAgcHJveHlQYXNzd29yZDogcHJveHlQYXNzd29yZCxcclxuICAgICAgICAgICAgICAgIHByb3h5QnlwYXNzSG9zdHM6IHByb3h5QnlwYXNzSG9zdHNcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLmdldEh0dHBQcm94eUNvbmZpZ3VyYXRpb24gPSBnZXRIdHRwUHJveHlDb25maWd1cmF0aW9uO1xyXG4vKipcclxuICogR2V0cyBodHRwIGNlcnRpZmljYXRlIGNvbmZpZ3VyYXRpb24gdXNlZCBieSBCdWlsZC9SZWxlYXNlIGFnZW50XHJcbiAqXHJcbiAqIEByZXR1cm4gIENlcnRDb25maWd1cmF0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRIdHRwQ2VydENvbmZpZ3VyYXRpb24oKSB7XHJcbiAgICB2YXIgY2EgPSBleHBvcnRzLmdldFZhcmlhYmxlKCdBZ2VudC5DQUluZm8nKTtcclxuICAgIHZhciBjbGllbnRDZXJ0ID0gZXhwb3J0cy5nZXRWYXJpYWJsZSgnQWdlbnQuQ2xpZW50Q2VydCcpO1xyXG4gICAgaWYgKGNhIHx8IGNsaWVudENlcnQpIHtcclxuICAgICAgICB2YXIgY2VydENvbmZpZyA9IHt9O1xyXG4gICAgICAgIGNlcnRDb25maWcuY2FGaWxlID0gY2E7XHJcbiAgICAgICAgY2VydENvbmZpZy5jZXJ0RmlsZSA9IGNsaWVudENlcnQ7XHJcbiAgICAgICAgaWYgKGNsaWVudENlcnQpIHtcclxuICAgICAgICAgICAgdmFyIGNsaWVudENlcnRLZXkgPSBleHBvcnRzLmdldFZhcmlhYmxlKCdBZ2VudC5DbGllbnRDZXJ0S2V5Jyk7XHJcbiAgICAgICAgICAgIHZhciBjbGllbnRDZXJ0QXJjaGl2ZSA9IGV4cG9ydHMuZ2V0VmFyaWFibGUoJ0FnZW50LkNsaWVudENlcnRBcmNoaXZlJyk7XHJcbiAgICAgICAgICAgIHZhciBjbGllbnRDZXJ0UGFzc3dvcmQgPSBleHBvcnRzLmdldFZhcmlhYmxlKCdBZ2VudC5DbGllbnRDZXJ0UGFzc3dvcmQnKTtcclxuICAgICAgICAgICAgY2VydENvbmZpZy5rZXlGaWxlID0gY2xpZW50Q2VydEtleTtcclxuICAgICAgICAgICAgY2VydENvbmZpZy5jZXJ0QXJjaGl2ZUZpbGUgPSBjbGllbnRDZXJ0QXJjaGl2ZTtcclxuICAgICAgICAgICAgY2VydENvbmZpZy5wYXNzcGhyYXNlID0gY2xpZW50Q2VydFBhc3N3b3JkO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2VydENvbmZpZztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuZ2V0SHR0cENlcnRDb25maWd1cmF0aW9uID0gZ2V0SHR0cENlcnRDb25maWd1cmF0aW9uO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFRlc3QgUHVibGlzaGVyXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxudmFyIFRlc3RQdWJsaXNoZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBUZXN0UHVibGlzaGVyKHRlc3RSdW5uZXIpIHtcclxuICAgICAgICB0aGlzLnRlc3RSdW5uZXIgPSB0ZXN0UnVubmVyO1xyXG4gICAgfVxyXG4gICAgVGVzdFB1Ymxpc2hlci5wcm90b3R5cGUucHVibGlzaCA9IGZ1bmN0aW9uIChyZXN1bHRGaWxlcywgbWVyZ2VSZXN1bHRzLCBwbGF0Zm9ybSwgY29uZmlnLCBydW5UaXRsZSwgcHVibGlzaFJ1bkF0dGFjaG1lbnRzLCB0ZXN0UnVuU3lzdGVtKSB7XHJcbiAgICAgICAgLy8gQ291bGQgaGF2ZSB1c2VkIGFuIGluaXRpYWxpemVyLCBidXQgd2FudGVkIHRvIGF2b2lkIHJlb3JkZXJpbmcgcGFyYW1ldGVycyB3aGVuIGNvbnZlcnRpbmcgdG8gc3RyaWN0IG51bGwgY2hlY2tzXHJcbiAgICAgICAgLy8gKEEgcGFyYW1ldGVyIGNhbm5vdCBib3RoIGJlIG9wdGlvbmFsIGFuZCBoYXZlIGFuIGluaXRpYWxpemVyKVxyXG4gICAgICAgIHRlc3RSdW5TeXN0ZW0gPSB0ZXN0UnVuU3lzdGVtIHx8IFwiVlNUU1Rhc2tcIjtcclxuICAgICAgICB2YXIgcHJvcGVydGllcyA9IHt9O1xyXG4gICAgICAgIHByb3BlcnRpZXNbJ3R5cGUnXSA9IHRoaXMudGVzdFJ1bm5lcjtcclxuICAgICAgICBpZiAobWVyZ2VSZXN1bHRzKSB7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ21lcmdlUmVzdWx0cyddID0gbWVyZ2VSZXN1bHRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGxhdGZvcm0pIHtcclxuICAgICAgICAgICAgcHJvcGVydGllc1sncGxhdGZvcm0nXSA9IHBsYXRmb3JtO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ2NvbmZpZyddID0gY29uZmlnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocnVuVGl0bGUpIHtcclxuICAgICAgICAgICAgcHJvcGVydGllc1sncnVuVGl0bGUnXSA9IHJ1blRpdGxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocHVibGlzaFJ1bkF0dGFjaG1lbnRzKSB7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ3B1Ymxpc2hSdW5BdHRhY2htZW50cyddID0gcHVibGlzaFJ1bkF0dGFjaG1lbnRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVzdWx0RmlsZXMpIHtcclxuICAgICAgICAgICAgcHJvcGVydGllc1sncmVzdWx0RmlsZXMnXSA9IHJlc3VsdEZpbGVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm9wZXJ0aWVzWyd0ZXN0UnVuU3lzdGVtJ10gPSB0ZXN0UnVuU3lzdGVtO1xyXG4gICAgICAgIGV4cG9ydHMuY29tbWFuZCgncmVzdWx0cy5wdWJsaXNoJywgcHJvcGVydGllcywgJycpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBUZXN0UHVibGlzaGVyO1xyXG59KCkpO1xyXG5leHBvcnRzLlRlc3RQdWJsaXNoZXIgPSBUZXN0UHVibGlzaGVyO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIENvZGUgY292ZXJhZ2UgUHVibGlzaGVyXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxudmFyIENvZGVDb3ZlcmFnZVB1Ymxpc2hlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIENvZGVDb3ZlcmFnZVB1Ymxpc2hlcigpIHtcclxuICAgIH1cclxuICAgIENvZGVDb3ZlcmFnZVB1Ymxpc2hlci5wcm90b3R5cGUucHVibGlzaCA9IGZ1bmN0aW9uIChjb2RlQ292ZXJhZ2VUb29sLCBzdW1tYXJ5RmlsZUxvY2F0aW9uLCByZXBvcnREaXJlY3RvcnksIGFkZGl0aW9uYWxDb2RlQ292ZXJhZ2VGaWxlcykge1xyXG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0ge307XHJcbiAgICAgICAgaWYgKGNvZGVDb3ZlcmFnZVRvb2wpIHtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snY29kZWNvdmVyYWdldG9vbCddID0gY29kZUNvdmVyYWdlVG9vbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN1bW1hcnlGaWxlTG9jYXRpb24pIHtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snc3VtbWFyeWZpbGUnXSA9IHN1bW1hcnlGaWxlTG9jYXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZXBvcnREaXJlY3RvcnkpIHtcclxuICAgICAgICAgICAgcHJvcGVydGllc1sncmVwb3J0ZGlyZWN0b3J5J10gPSByZXBvcnREaXJlY3Rvcnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhZGRpdGlvbmFsQ29kZUNvdmVyYWdlRmlsZXMpIHtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snYWRkaXRpb25hbGNvZGVjb3ZlcmFnZWZpbGVzJ10gPSBhZGRpdGlvbmFsQ29kZUNvdmVyYWdlRmlsZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV4cG9ydHMuY29tbWFuZCgnY29kZWNvdmVyYWdlLnB1Ymxpc2gnLCBwcm9wZXJ0aWVzLCBcIlwiKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gQ29kZUNvdmVyYWdlUHVibGlzaGVyO1xyXG59KCkpO1xyXG5leHBvcnRzLkNvZGVDb3ZlcmFnZVB1Ymxpc2hlciA9IENvZGVDb3ZlcmFnZVB1Ymxpc2hlcjtcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBDb2RlIGNvdmVyYWdlIFB1Ymxpc2hlclxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbnZhciBDb2RlQ292ZXJhZ2VFbmFibGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQ29kZUNvdmVyYWdlRW5hYmxlcihidWlsZFRvb2wsIGNjVG9vbCkge1xyXG4gICAgICAgIHRoaXMuYnVpbGRUb29sID0gYnVpbGRUb29sO1xyXG4gICAgICAgIHRoaXMuY2NUb29sID0gY2NUb29sO1xyXG4gICAgfVxyXG4gICAgQ29kZUNvdmVyYWdlRW5hYmxlci5wcm90b3R5cGUuZW5hYmxlQ29kZUNvdmVyYWdlID0gZnVuY3Rpb24gKGJ1aWxkUHJvcHMpIHtcclxuICAgICAgICBidWlsZFByb3BzWydidWlsZHRvb2wnXSA9IHRoaXMuYnVpbGRUb29sO1xyXG4gICAgICAgIGJ1aWxkUHJvcHNbJ2NvZGVjb3ZlcmFnZXRvb2wnXSA9IHRoaXMuY2NUb29sO1xyXG4gICAgICAgIGV4cG9ydHMuY29tbWFuZCgnY29kZWNvdmVyYWdlLmVuYWJsZScsIGJ1aWxkUHJvcHMsIFwiXCIpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBDb2RlQ292ZXJhZ2VFbmFibGVyO1xyXG59KCkpO1xyXG5leHBvcnRzLkNvZGVDb3ZlcmFnZUVuYWJsZXIgPSBDb2RlQ292ZXJhZ2VFbmFibGVyO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFRhc2sgTG9nZ2luZyBDb21tYW5kc1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8qKlxyXG4gKiBVcGxvYWQgdXNlciBpbnRlcmVzdGVkIGZpbGUgYXMgYWRkaXRpb25hbCBsb2cgaW5mb3JtYXRpb25cclxuICogdG8gdGhlIGN1cnJlbnQgdGltZWxpbmUgcmVjb3JkLlxyXG4gKlxyXG4gKiBUaGUgZmlsZSBzaGFsbCBiZSBhdmFpbGFibGUgZm9yIGRvd25sb2FkIGFsb25nIHdpdGggdGFzayBsb2dzLlxyXG4gKlxyXG4gKiBAcGFyYW0gcGF0aCAgICAgIFBhdGggdG8gdGhlIGZpbGUgdGhhdCBzaG91bGQgYmUgdXBsb2FkZWQuXHJcbiAqIEByZXR1cm5zICAgICAgICAgdm9pZFxyXG4gKi9cclxuZnVuY3Rpb24gdXBsb2FkRmlsZShwYXRoKSB7XHJcbiAgICBleHBvcnRzLmNvbW1hbmQoXCJ0YXNrLnVwbG9hZGZpbGVcIiwgbnVsbCwgcGF0aCk7XHJcbn1cclxuZXhwb3J0cy51cGxvYWRGaWxlID0gdXBsb2FkRmlsZTtcclxuLyoqXHJcbiAqIEluc3RydWN0aW9uIGZvciB0aGUgYWdlbnQgdG8gdXBkYXRlIHRoZSBQQVRIIGVudmlyb25tZW50IHZhcmlhYmxlLlxyXG4gKiBUaGUgc3BlY2lmaWVkIGRpcmVjdG9yeSBpcyBwcmVwZW5kZWQgdG8gdGhlIFBBVEguXHJcbiAqIFRoZSB1cGRhdGVkIGVudmlyb25tZW50IHZhcmlhYmxlIHdpbGwgYmUgcmVmbGVjdGVkIGluIHN1YnNlcXVlbnQgdGFza3MuXHJcbiAqXHJcbiAqIEBwYXJhbSBwYXRoICAgICAgTG9jYWwgZGlyZWN0b3J5IHBhdGguXHJcbiAqIEByZXR1cm5zICAgICAgICAgdm9pZFxyXG4gKi9cclxuZnVuY3Rpb24gcHJlcGVuZFBhdGgocGF0aCkge1xyXG4gICAgYXNzZXJ0QWdlbnQoXCIyLjExNS4wXCIpO1xyXG4gICAgZXhwb3J0cy5jb21tYW5kKFwidGFzay5wcmVwZW5kcGF0aFwiLCBudWxsLCBwYXRoKTtcclxufVxyXG5leHBvcnRzLnByZXBlbmRQYXRoID0gcHJlcGVuZFBhdGg7XHJcbi8qKlxyXG4gKiBVcGxvYWQgYW5kIGF0dGFjaCBzdW1tYXJ5IG1hcmtkb3duIHRvIGN1cnJlbnQgdGltZWxpbmUgcmVjb3JkLlxyXG4gKiBUaGlzIHN1bW1hcnkgc2hhbGwgYmUgYWRkZWQgdG8gdGhlIGJ1aWxkL3JlbGVhc2Ugc3VtbWFyeSBhbmRcclxuICogbm90IGF2YWlsYWJsZSBmb3IgZG93bmxvYWQgd2l0aCBsb2dzLlxyXG4gKlxyXG4gKiBAcGFyYW0gcGF0aCAgICAgIExvY2FsIGRpcmVjdG9yeSBwYXRoLlxyXG4gKiBAcmV0dXJucyAgICAgICAgIHZvaWRcclxuICovXHJcbmZ1bmN0aW9uIHVwbG9hZFN1bW1hcnkocGF0aCkge1xyXG4gICAgZXhwb3J0cy5jb21tYW5kKFwidGFzay51cGxvYWRzdW1tYXJ5XCIsIG51bGwsIHBhdGgpO1xyXG59XHJcbmV4cG9ydHMudXBsb2FkU3VtbWFyeSA9IHVwbG9hZFN1bW1hcnk7XHJcbi8qKlxyXG4gKiBVcGxvYWQgYW5kIGF0dGFjaCBhdHRhY2htZW50IHRvIGN1cnJlbnQgdGltZWxpbmUgcmVjb3JkLlxyXG4gKiBUaGVzZSBmaWxlcyBhcmUgbm90IGF2YWlsYWJsZSBmb3IgZG93bmxvYWQgd2l0aCBsb2dzLlxyXG4gKiBUaGVzZSBjYW4gb25seSBiZSByZWZlcnJlZCB0byBieSBleHRlbnNpb25zIHVzaW5nIHRoZSB0eXBlIG9yIG5hbWUgdmFsdWVzLlxyXG4gKlxyXG4gKiBAcGFyYW0gdHlwZSAgICAgIEF0dGFjaG1lbnQgdHlwZS5cclxuICogQHBhcmFtIG5hbWUgICAgICBBdHRhY2htZW50IG5hbWUuXHJcbiAqIEBwYXJhbSBwYXRoICAgICAgQXR0YWNobWVudCBwYXRoLlxyXG4gKiBAcmV0dXJucyAgICAgICAgIHZvaWRcclxuICovXHJcbmZ1bmN0aW9uIGFkZEF0dGFjaG1lbnQodHlwZSwgbmFtZSwgcGF0aCkge1xyXG4gICAgZXhwb3J0cy5jb21tYW5kKFwidGFzay5hZGRhdHRhY2htZW50XCIsIHsgXCJ0eXBlXCI6IHR5cGUsIFwibmFtZVwiOiBuYW1lIH0sIHBhdGgpO1xyXG59XHJcbmV4cG9ydHMuYWRkQXR0YWNobWVudCA9IGFkZEF0dGFjaG1lbnQ7XHJcbi8qKlxyXG4gKiBTZXQgYW4gZW5kcG9pbnQgZmllbGQgd2l0aCBnaXZlbiB2YWx1ZS5cclxuICogVmFsdWUgdXBkYXRlZCB3aWxsIGJlIHJldGFpbmVkIGluIHRoZSBlbmRwb2ludCBmb3JcclxuICogdGhlIHN1YnNlcXVlbnQgdGFza3MgdGhhdCBleGVjdXRlIHdpdGhpbiB0aGUgc2FtZSBqb2IuXHJcbiAqXHJcbiAqIEBwYXJhbSBpZCAgICAgIEVuZHBvaW50IGlkLlxyXG4gKiBAcGFyYW0gZmllbGQgICBGaWVsZFR5cGUgZW51bSBvZiBBdXRoUGFyYW1ldGVyLCBEYXRhUGFyYW1ldGVyIG9yIFVybC5cclxuICogQHBhcmFtIGtleSAgICAgS2V5LlxyXG4gKiBAcGFyYW0gdmFsdWUgICBWYWx1ZSBmb3Iga2V5IG9yIHVybC5cclxuICogQHJldHVybnMgICAgICAgdm9pZFxyXG4gKi9cclxuZnVuY3Rpb24gc2V0RW5kcG9pbnQoaWQsIGZpZWxkLCBrZXksIHZhbHVlKSB7XHJcbiAgICBleHBvcnRzLmNvbW1hbmQoXCJ0YXNrLnNldGVuZHBvaW50XCIsIHsgXCJpZFwiOiBpZCwgXCJmaWVsZFwiOiBGaWVsZFR5cGVbZmllbGRdLnRvTG93ZXJDYXNlKCksIFwia2V5XCI6IGtleSB9LCB2YWx1ZSk7XHJcbn1cclxuZXhwb3J0cy5zZXRFbmRwb2ludCA9IHNldEVuZHBvaW50O1xyXG4vKipcclxuICogU2V0IHByb2dyZXNzIGFuZCBjdXJyZW50IG9wZXJhdGlvbiBmb3IgY3VycmVudCB0YXNrLlxyXG4gKlxyXG4gKiBAcGFyYW0gcGVyY2VudCAgICAgICAgICAgUGVyY2VudGFnZSBvZiBjb21wbGV0aW9uLlxyXG4gKiBAcGFyYW0gY3VycmVudE9wZXJhdGlvbiAgQ3VycmVudCBwcGVyYXRpb24uXHJcbiAqIEByZXR1cm5zICAgICAgICAgICAgICAgICB2b2lkXHJcbiAqL1xyXG5mdW5jdGlvbiBzZXRQcm9ncmVzcyhwZXJjZW50LCBjdXJyZW50T3BlcmF0aW9uKSB7XHJcbiAgICBleHBvcnRzLmNvbW1hbmQoXCJ0YXNrLnNldHByb2dyZXNzXCIsIHsgXCJ2YWx1ZVwiOiBcIlwiICsgcGVyY2VudCB9LCBjdXJyZW50T3BlcmF0aW9uKTtcclxufVxyXG5leHBvcnRzLnNldFByb2dyZXNzID0gc2V0UHJvZ3Jlc3M7XHJcbi8qKlxyXG4gKiBJbmRpY2F0ZXMgd2hldGhlciB0byB3cml0ZSB0aGUgbG9nZ2luZyBjb21tYW5kIGRpcmVjdGx5IHRvIHRoZSBob3N0IG9yIHRvIHRoZSBvdXRwdXQgcGlwZWxpbmUuXHJcbiAqXHJcbiAqIEBwYXJhbSBpZCAgICAgICAgICAgIFRpbWVsaW5lIHJlY29yZCBHdWlkLlxyXG4gKiBAcGFyYW0gcGFyZW50SWQgICAgICBQYXJlbnQgdGltZWxpbmUgcmVjb3JkIEd1aWQuXHJcbiAqIEBwYXJhbSByZWNvcmRUeXBlICAgIFJlY29yZCB0eXBlLlxyXG4gKiBAcGFyYW0gcmVjb3JkTmFtZSAgICBSZWNvcmQgbmFtZS5cclxuICogQHBhcmFtIG9yZGVyICAgICAgICAgT3JkZXIgb2YgdGltZWxpbmUgcmVjb3JkLlxyXG4gKiBAcGFyYW0gc3RhcnRUaW1lICAgICBTdGFydCB0aW1lLlxyXG4gKiBAcGFyYW0gZmluaXNoVGltZSAgICBFbmQgdGltZS5cclxuICogQHBhcmFtIHByb2dyZXNzICAgICAgUGVyY2VudGFnZSBvZiBjb21wbGV0aW9uLlxyXG4gKiBAcGFyYW0gc3RhdGUgICAgICAgICBUYXNrU3RhdGUgZW51bSBvZiBVbmtub3duLCBJbml0aWFsaXplZCwgSW5Qcm9ncmVzcyBvciBDb21wbGV0ZWQuXHJcbiAqIEBwYXJhbSByZXN1bHQgICAgICAgIFRhc2tSZXN1bHQgZW51bSBvZiBTdWNjZWVkZWQsIFN1Y2NlZWRlZFdpdGhJc3N1ZXMsIEZhaWxlZCwgQ2FuY2VsbGVkIG9yIFNraXBwZWQuXHJcbiAqIEBwYXJhbSBtZXNzYWdlICAgICAgIGN1cnJlbnQgb3BlcmF0aW9uXHJcbiAqIEByZXR1cm5zICAgICAgICAgICAgIHZvaWRcclxuICovXHJcbmZ1bmN0aW9uIGxvZ0RldGFpbChpZCwgbWVzc2FnZSwgcGFyZW50SWQsIHJlY29yZFR5cGUsIHJlY29yZE5hbWUsIG9yZGVyLCBzdGFydFRpbWUsIGZpbmlzaFRpbWUsIHByb2dyZXNzLCBzdGF0ZSwgcmVzdWx0KSB7XHJcbiAgICB2YXIgcHJvcGVydGllcyA9IHtcclxuICAgICAgICBcImlkXCI6IGlkLFxyXG4gICAgICAgIFwicGFyZW50aWRcIjogcGFyZW50SWQsXHJcbiAgICAgICAgXCJ0eXBlXCI6IHJlY29yZFR5cGUsXHJcbiAgICAgICAgXCJuYW1lXCI6IHJlY29yZE5hbWUsXHJcbiAgICAgICAgXCJvcmRlclwiOiBvcmRlciA/IG9yZGVyLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgXCJzdGFydHRpbWVcIjogc3RhcnRUaW1lLFxyXG4gICAgICAgIFwiZmluaXNodGltZVwiOiBmaW5pc2hUaW1lLFxyXG4gICAgICAgIFwicHJvZ3Jlc3NcIjogcHJvZ3Jlc3MgPyBwcm9ncmVzcy50b1N0cmluZygpIDogdW5kZWZpbmVkLFxyXG4gICAgICAgIFwic3RhdGVcIjogc3RhdGUgPyBUYXNrU3RhdGVbc3RhdGVdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgIFwicmVzdWx0XCI6IHJlc3VsdCA/IFRhc2tSZXN1bHRbcmVzdWx0XSA6IHVuZGVmaW5lZFxyXG4gICAgfTtcclxuICAgIGV4cG9ydHMuY29tbWFuZChcInRhc2subG9nZGV0YWlsXCIsIHByb3BlcnRpZXMsIG1lc3NhZ2UpO1xyXG59XHJcbmV4cG9ydHMubG9nRGV0YWlsID0gbG9nRGV0YWlsO1xyXG4vKipcclxuICogTG9nIGVycm9yIG9yIHdhcm5pbmcgaXNzdWUgdG8gdGltZWxpbmUgcmVjb3JkIG9mIGN1cnJlbnQgdGFzay5cclxuICpcclxuICogQHBhcmFtIHR5cGUgICAgICAgICAgSXNzdWVUeXBlIGVudW0gb2YgRXJyb3Igb3IgV2FybmluZy5cclxuICogQHBhcmFtIHNvdXJjZVBhdGggICAgU291cmNlIGZpbGUgbG9jYXRpb24uXHJcbiAqIEBwYXJhbSBsaW5lTnVtYmVyICAgIExpbmUgbnVtYmVyLlxyXG4gKiBAcGFyYW0gY29sdW1uTnVtYmVyICBDb2x1bW4gbnVtYmVyLlxyXG4gKiBAcGFyYW0gY29kZSAgICAgICAgICBFcnJvciBvciB3YXJuaW5nIGNvZGUuXHJcbiAqIEBwYXJhbSBtZXNzYWdlICAgICAgIEVycm9yIG9yIHdhcm5pbmcgbWVzc2FnZS5cclxuICogQHJldHVybnMgICAgICAgICAgICAgdm9pZFxyXG4gKi9cclxuZnVuY3Rpb24gbG9nSXNzdWUodHlwZSwgbWVzc2FnZSwgc291cmNlUGF0aCwgbGluZU51bWJlciwgY29sdW1uTnVtYmVyLCBlcnJvckNvZGUpIHtcclxuICAgIHZhciBwcm9wZXJ0aWVzID0ge1xyXG4gICAgICAgIFwidHlwZVwiOiBJc3N1ZVR5cGVbdHlwZV0udG9Mb3dlckNhc2UoKSxcclxuICAgICAgICBcImNvZGVcIjogZXJyb3JDb2RlLFxyXG4gICAgICAgIFwic291cmNlcGF0aFwiOiBzb3VyY2VQYXRoLFxyXG4gICAgICAgIFwibGluZW51bWJlclwiOiBsaW5lTnVtYmVyID8gbGluZU51bWJlci50b1N0cmluZygpIDogdW5kZWZpbmVkLFxyXG4gICAgICAgIFwiY29sdW1ubnVtYmVyXCI6IGNvbHVtbk51bWJlciA/IGNvbHVtbk51bWJlci50b1N0cmluZygpIDogdW5kZWZpbmVkLFxyXG4gICAgfTtcclxuICAgIGV4cG9ydHMuY29tbWFuZChcInRhc2subG9naXNzdWVcIiwgcHJvcGVydGllcywgbWVzc2FnZSk7XHJcbn1cclxuZXhwb3J0cy5sb2dJc3N1ZSA9IGxvZ0lzc3VlO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIEFydGlmYWN0IExvZ2dpbmcgQ29tbWFuZHNcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vKipcclxuICogVXBsb2FkIHVzZXIgaW50ZXJlc3RlZCBmaWxlIGFzIGFkZGl0aW9uYWwgbG9nIGluZm9ybWF0aW9uXHJcbiAqIHRvIHRoZSBjdXJyZW50IHRpbWVsaW5lIHJlY29yZC5cclxuICpcclxuICogVGhlIGZpbGUgc2hhbGwgYmUgYXZhaWxhYmxlIGZvciBkb3dubG9hZCBhbG9uZyB3aXRoIHRhc2sgbG9ncy5cclxuICpcclxuICogQHBhcmFtIGNvbnRhaW5lckZvbGRlciAgIEZvbGRlciB0aGF0IHRoZSBmaWxlIHdpbGwgdXBsb2FkIHRvLCBmb2xkZXIgd2lsbCBiZSBjcmVhdGVkIGlmIG5lZWRlZC5cclxuICogQHBhcmFtIHBhdGggICAgICAgICAgICAgIFBhdGggdG8gdGhlIGZpbGUgdGhhdCBzaG91bGQgYmUgdXBsb2FkZWQuXHJcbiAqIEBwYXJhbSBuYW1lICAgICAgICAgICAgICBBcnRpZmFjdCBuYW1lLlxyXG4gKiBAcmV0dXJucyAgICAgICAgICAgICAgICAgdm9pZFxyXG4gKi9cclxuZnVuY3Rpb24gdXBsb2FkQXJ0aWZhY3QoY29udGFpbmVyRm9sZGVyLCBwYXRoLCBuYW1lKSB7XHJcbiAgICBleHBvcnRzLmNvbW1hbmQoXCJhcnRpZmFjdC51cGxvYWRcIiwgeyBcImNvbnRhaW5lcmZvbGRlclwiOiBjb250YWluZXJGb2xkZXIsIFwiYXJ0aWZhY3RuYW1lXCI6IG5hbWUgfSwgcGF0aCk7XHJcbn1cclxuZXhwb3J0cy51cGxvYWRBcnRpZmFjdCA9IHVwbG9hZEFydGlmYWN0O1xyXG4vKipcclxuICogQ3JlYXRlIGFuIGFydGlmYWN0IGxpbmssIGFydGlmYWN0IGxvY2F0aW9uIGlzIHJlcXVpcmVkIHRvIGJlXHJcbiAqIGEgZmlsZSBjb250YWluZXIgcGF0aCwgVkMgcGF0aCBvciBVTkMgc2hhcmUgcGF0aC5cclxuICpcclxuICogVGhlIGZpbGUgc2hhbGwgYmUgYXZhaWxhYmxlIGZvciBkb3dubG9hZCBhbG9uZyB3aXRoIHRhc2sgbG9ncy5cclxuICpcclxuICogQHBhcmFtIG5hbWUgICAgICAgICAgICAgIEFydGlmYWN0IG5hbWUuXHJcbiAqIEBwYXJhbSBwYXRoICAgICAgICAgICAgICBQYXRoIHRvIHRoZSBmaWxlIHRoYXQgc2hvdWxkIGJlIGFzc29jaWF0ZWQuXHJcbiAqIEBwYXJhbSBhcnRpZmFjdFR5cGUgICAgICBBcnRpZmFjdFR5cGUgZW51bSBvZiBDb250YWluZXIsIEZpbGVQYXRoLCBWZXJzaW9uQ29udHJvbCwgR2l0UmVmIG9yIFRmdmNMYWJlbC5cclxuICogQHJldHVybnMgICAgICAgICAgICAgICAgIHZvaWRcclxuICovXHJcbmZ1bmN0aW9uIGFzc29jaWF0ZUFydGlmYWN0KG5hbWUsIHBhdGgsIGFydGlmYWN0VHlwZSkge1xyXG4gICAgZXhwb3J0cy5jb21tYW5kKFwiYXJ0aWZhY3QuYXNzb2NpYXRlXCIsIHsgXCJ0eXBlXCI6IEFydGlmYWN0VHlwZVthcnRpZmFjdFR5cGVdLnRvTG93ZXJDYXNlKCksIFwiYXJ0aWZhY3RuYW1lXCI6IG5hbWUgfSwgcGF0aCk7XHJcbn1cclxuZXhwb3J0cy5hc3NvY2lhdGVBcnRpZmFjdCA9IGFzc29jaWF0ZUFydGlmYWN0O1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIEJ1aWxkIExvZ2dpbmcgQ29tbWFuZHNcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vKipcclxuICogVXBsb2FkIHVzZXIgaW50ZXJlc3RlZCBsb2cgdG8gYnVpbGTigJlzIGNvbnRhaW5lciDigJxsb2dzXFx0b29s4oCdIGZvbGRlci5cclxuICpcclxuICogQHBhcmFtIHBhdGggICAgICBQYXRoIHRvIHRoZSBmaWxlIHRoYXQgc2hvdWxkIGJlIHVwbG9hZGVkLlxyXG4gKiBAcmV0dXJucyAgICAgICAgIHZvaWRcclxuICovXHJcbmZ1bmN0aW9uIHVwbG9hZEJ1aWxkTG9nKHBhdGgpIHtcclxuICAgIGV4cG9ydHMuY29tbWFuZChcImJ1aWxkLnVwbG9hZGxvZ1wiLCBudWxsLCBwYXRoKTtcclxufVxyXG5leHBvcnRzLnVwbG9hZEJ1aWxkTG9nID0gdXBsb2FkQnVpbGRMb2c7XHJcbi8qKlxyXG4gKiBVcGRhdGUgYnVpbGQgbnVtYmVyIGZvciBjdXJyZW50IGJ1aWxkLlxyXG4gKlxyXG4gKiBAcGFyYW0gdmFsdWUgICAgIFZhbHVlIHRvIGJlIGFzc2lnbmVkIGFzIHRoZSBidWlsZCBudW1iZXIuXHJcbiAqIEByZXR1cm5zICAgICAgICAgdm9pZFxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlQnVpbGROdW1iZXIodmFsdWUpIHtcclxuICAgIGV4cG9ydHMuY29tbWFuZChcImJ1aWxkLnVwZGF0ZWJ1aWxkbnVtYmVyXCIsIG51bGwsIHZhbHVlKTtcclxufVxyXG5leHBvcnRzLnVwZGF0ZUJ1aWxkTnVtYmVyID0gdXBkYXRlQnVpbGROdW1iZXI7XHJcbi8qKlxyXG4gKiBBZGQgYSB0YWcgZm9yIGN1cnJlbnQgYnVpbGQuXHJcbiAqXHJcbiAqIEBwYXJhbSB2YWx1ZSAgICAgVGFnIHZhbHVlLlxyXG4gKiBAcmV0dXJucyAgICAgICAgIHZvaWRcclxuICovXHJcbmZ1bmN0aW9uIGFkZEJ1aWxkVGFnKHZhbHVlKSB7XHJcbiAgICBleHBvcnRzLmNvbW1hbmQoXCJidWlsZC5hZGRidWlsZHRhZ1wiLCBudWxsLCB2YWx1ZSk7XHJcbn1cclxuZXhwb3J0cy5hZGRCdWlsZFRhZyA9IGFkZEJ1aWxkVGFnO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFJlbGVhc2UgTG9nZ2luZyBDb21tYW5kc1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8qKlxyXG4gKiBVcGRhdGUgcmVsZWFzZSBuYW1lIGZvciBjdXJyZW50IHJlbGVhc2UuXHJcbiAqXHJcbiAqIEBwYXJhbSB2YWx1ZSAgICAgVmFsdWUgdG8gYmUgYXNzaWduZWQgYXMgdGhlIHJlbGVhc2UgbmFtZS5cclxuICogQHJldHVybnMgICAgICAgICB2b2lkXHJcbiAqL1xyXG5mdW5jdGlvbiB1cGRhdGVSZWxlYXNlTmFtZShuYW1lKSB7XHJcbiAgICBhc3NlcnRBZ2VudChcIjIuMTMyXCIpO1xyXG4gICAgZXhwb3J0cy5jb21tYW5kKFwicmVsZWFzZS51cGRhdGVyZWxlYXNlbmFtZVwiLCBudWxsLCBuYW1lKTtcclxufVxyXG5leHBvcnRzLnVwZGF0ZVJlbGVhc2VOYW1lID0gdXBkYXRlUmVsZWFzZU5hbWU7XHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gVG9vbHNcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5leHBvcnRzLlRhc2tDb21tYW5kID0gdGNtLlRhc2tDb21tYW5kO1xyXG5leHBvcnRzLmNvbW1hbmRGcm9tU3RyaW5nID0gdGNtLmNvbW1hbmRGcm9tU3RyaW5nO1xyXG5leHBvcnRzLlRvb2xSdW5uZXIgPSB0cm0uVG9vbFJ1bm5lcjtcclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBWYWxpZGF0aW9uIENoZWNrc1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIGFzeW5jIGF3YWl0IG5lZWRzIGdlbmVyYXRvcnMgaW4gbm9kZSA0LngrXHJcbmlmIChzZW12ZXIubHQocHJvY2Vzcy52ZXJzaW9ucy5ub2RlLCAnNC4yLjAnKSkge1xyXG4gICAgdGhpcy53YXJuaW5nKCdUYXNrcyByZXF1aXJlIGEgbmV3IGFnZW50LiAgVXBncmFkZSB5b3VyIGFnZW50IG9yIG5vZGUgdG8gNC4yLjAgb3IgbGF0ZXInKTtcclxufVxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gUG9wdWxhdGUgdGhlIHZhdWx0IHdpdGggc2Vuc2l0aXZlIGRhdGEuICBJbnB1dHMgYW5kIEVuZHBvaW50c1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gYXZvaWQgbG9hZGluZyB0d2ljZSAob3ZlcndyaXRlcyAudGFza2tleSlcclxuaWYgKCFnbG9iYWxbJ192c3RzX3Rhc2tfbGliX2xvYWRlZCddKSB7XHJcbiAgICBpbS5fbG9hZERhdGEoKTtcclxuICAgIGltLl9leHBvc2VQcm94eVNldHRpbmdzKCk7XHJcbiAgICBpbS5fZXhwb3NlQ2VydFNldHRpbmdzKCk7XHJcbn1cclxuIiwiLy9cbi8vIFNoZWxsSlNcbi8vIFVuaXggc2hlbGwgY29tbWFuZHMgb24gdG9wIG9mIE5vZGUncyBBUElcbi8vXG4vLyBDb3B5cmlnaHQgKGMpIDIwMTIgQXJ0dXIgQWRpYlxuLy8gaHR0cDovL2dpdGh1Yi5jb20vYXJ0dXJhZGliL3NoZWxsanNcbi8vXG5cbnZhciBjb21tb24gPSByZXF1aXJlKCcuL3NyYy9jb21tb24nKTtcblxuXG4vL0Bcbi8vQCBBbGwgY29tbWFuZHMgcnVuIHN5bmNocm9ub3VzbHksIHVubGVzcyBvdGhlcndpc2Ugc3RhdGVkLlxuLy9AXG5cbi8vQGluY2x1ZGUgLi9zcmMvY2RcbnZhciBfY2QgPSByZXF1aXJlKCcuL3NyYy9jZCcpO1xuZXhwb3J0cy5jZCA9IGNvbW1vbi53cmFwKCdjZCcsIF9jZCk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvcHdkXG52YXIgX3B3ZCA9IHJlcXVpcmUoJy4vc3JjL3B3ZCcpO1xuZXhwb3J0cy5wd2QgPSBjb21tb24ud3JhcCgncHdkJywgX3B3ZCk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvbHNcbnZhciBfbHMgPSByZXF1aXJlKCcuL3NyYy9scycpO1xuZXhwb3J0cy5scyA9IGNvbW1vbi53cmFwKCdscycsIF9scyk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvZmluZFxudmFyIF9maW5kID0gcmVxdWlyZSgnLi9zcmMvZmluZCcpO1xuZXhwb3J0cy5maW5kID0gY29tbW9uLndyYXAoJ2ZpbmQnLCBfZmluZCk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvY3BcbnZhciBfY3AgPSByZXF1aXJlKCcuL3NyYy9jcCcpO1xuZXhwb3J0cy5jcCA9IGNvbW1vbi53cmFwKCdjcCcsIF9jcCk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvcm1cbnZhciBfcm0gPSByZXF1aXJlKCcuL3NyYy9ybScpO1xuZXhwb3J0cy5ybSA9IGNvbW1vbi53cmFwKCdybScsIF9ybSk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvbXZcbnZhciBfbXYgPSByZXF1aXJlKCcuL3NyYy9tdicpO1xuZXhwb3J0cy5tdiA9IGNvbW1vbi53cmFwKCdtdicsIF9tdik7XG5cbi8vQGluY2x1ZGUgLi9zcmMvbWtkaXJcbnZhciBfbWtkaXIgPSByZXF1aXJlKCcuL3NyYy9ta2RpcicpO1xuZXhwb3J0cy5ta2RpciA9IGNvbW1vbi53cmFwKCdta2RpcicsIF9ta2Rpcik7XG5cbi8vQGluY2x1ZGUgLi9zcmMvdGVzdFxudmFyIF90ZXN0ID0gcmVxdWlyZSgnLi9zcmMvdGVzdCcpO1xuZXhwb3J0cy50ZXN0ID0gY29tbW9uLndyYXAoJ3Rlc3QnLCBfdGVzdCk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvY2F0XG52YXIgX2NhdCA9IHJlcXVpcmUoJy4vc3JjL2NhdCcpO1xuZXhwb3J0cy5jYXQgPSBjb21tb24ud3JhcCgnY2F0JywgX2NhdCk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvdG9cbnZhciBfdG8gPSByZXF1aXJlKCcuL3NyYy90bycpO1xuU3RyaW5nLnByb3RvdHlwZS50byA9IGNvbW1vbi53cmFwKCd0bycsIF90byk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvdG9FbmRcbnZhciBfdG9FbmQgPSByZXF1aXJlKCcuL3NyYy90b0VuZCcpO1xuU3RyaW5nLnByb3RvdHlwZS50b0VuZCA9IGNvbW1vbi53cmFwKCd0b0VuZCcsIF90b0VuZCk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvc2VkXG52YXIgX3NlZCA9IHJlcXVpcmUoJy4vc3JjL3NlZCcpO1xuZXhwb3J0cy5zZWQgPSBjb21tb24ud3JhcCgnc2VkJywgX3NlZCk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvZ3JlcFxudmFyIF9ncmVwID0gcmVxdWlyZSgnLi9zcmMvZ3JlcCcpO1xuZXhwb3J0cy5ncmVwID0gY29tbW9uLndyYXAoJ2dyZXAnLCBfZ3JlcCk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvd2hpY2hcbnZhciBfd2hpY2ggPSByZXF1aXJlKCcuL3NyYy93aGljaCcpO1xuZXhwb3J0cy53aGljaCA9IGNvbW1vbi53cmFwKCd3aGljaCcsIF93aGljaCk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvZWNob1xudmFyIF9lY2hvID0gcmVxdWlyZSgnLi9zcmMvZWNobycpO1xuZXhwb3J0cy5lY2hvID0gX2VjaG87IC8vIGRvbid0IGNvbW1vbi53cmFwKCkgYXMgaXQgY291bGQgcGFyc2UgJy1vcHRpb25zJ1xuXG4vL0BpbmNsdWRlIC4vc3JjL2RpcnNcbnZhciBfZGlycyA9IHJlcXVpcmUoJy4vc3JjL2RpcnMnKS5kaXJzO1xuZXhwb3J0cy5kaXJzID0gY29tbW9uLndyYXAoXCJkaXJzXCIsIF9kaXJzKTtcbnZhciBfcHVzaGQgPSByZXF1aXJlKCcuL3NyYy9kaXJzJykucHVzaGQ7XG5leHBvcnRzLnB1c2hkID0gY29tbW9uLndyYXAoJ3B1c2hkJywgX3B1c2hkKTtcbnZhciBfcG9wZCA9IHJlcXVpcmUoJy4vc3JjL2RpcnMnKS5wb3BkO1xuZXhwb3J0cy5wb3BkID0gY29tbW9uLndyYXAoXCJwb3BkXCIsIF9wb3BkKTtcblxuLy9AaW5jbHVkZSAuL3NyYy9sblxudmFyIF9sbiA9IHJlcXVpcmUoJy4vc3JjL2xuJyk7XG5leHBvcnRzLmxuID0gY29tbW9uLndyYXAoJ2xuJywgX2xuKTtcblxuLy9AXG4vL0AgIyMjIGV4aXQoY29kZSlcbi8vQCBFeGl0cyB0aGUgY3VycmVudCBwcm9jZXNzIHdpdGggdGhlIGdpdmVuIGV4aXQgY29kZS5cbmV4cG9ydHMuZXhpdCA9IHByb2Nlc3MuZXhpdDtcblxuLy9AXG4vL0AgIyMjIGVudlsnVkFSX05BTUUnXVxuLy9AIE9iamVjdCBjb250YWluaW5nIGVudmlyb25tZW50IHZhcmlhYmxlcyAoYm90aCBnZXR0ZXIgYW5kIHNldHRlcikuIFNob3J0Y3V0IHRvIHByb2Nlc3MuZW52LlxuZXhwb3J0cy5lbnYgPSBwcm9jZXNzLmVudjtcblxuLy9AaW5jbHVkZSAuL3NyYy9leGVjXG52YXIgX2V4ZWMgPSByZXF1aXJlKCcuL3NyYy9leGVjJyk7XG5leHBvcnRzLmV4ZWMgPSBjb21tb24ud3JhcCgnZXhlYycsIF9leGVjLCB7bm90VW5peDp0cnVlfSk7XG5cbi8vQGluY2x1ZGUgLi9zcmMvY2htb2RcbnZhciBfY2htb2QgPSByZXF1aXJlKCcuL3NyYy9jaG1vZCcpO1xuZXhwb3J0cy5jaG1vZCA9IGNvbW1vbi53cmFwKCdjaG1vZCcsIF9jaG1vZCk7XG5cblxuXG4vL0Bcbi8vQCAjIyBOb24tVW5peCBjb21tYW5kc1xuLy9AXG5cbi8vQGluY2x1ZGUgLi9zcmMvdGVtcGRpclxudmFyIF90ZW1wRGlyID0gcmVxdWlyZSgnLi9zcmMvdGVtcGRpcicpO1xuZXhwb3J0cy50ZW1wZGlyID0gY29tbW9uLndyYXAoJ3RlbXBkaXInLCBfdGVtcERpcik7XG5cblxuLy9AaW5jbHVkZSAuL3NyYy9lcnJvclxudmFyIF9lcnJvciA9IHJlcXVpcmUoJy4vc3JjL2Vycm9yJyk7XG5leHBvcnRzLmVycm9yID0gX2Vycm9yO1xuXG5cblxuLy9AXG4vL0AgIyMgQ29uZmlndXJhdGlvblxuLy9AXG5cbmV4cG9ydHMuY29uZmlnID0gY29tbW9uLmNvbmZpZztcblxuLy9AXG4vL0AgIyMjIGNvbmZpZy5zaWxlbnRcbi8vQCBFeGFtcGxlOlxuLy9AXG4vL0AgYGBgamF2YXNjcmlwdFxuLy9AIHZhciBzaWxlbnRTdGF0ZSA9IGNvbmZpZy5zaWxlbnQ7IC8vIHNhdmUgb2xkIHNpbGVudCBzdGF0ZVxuLy9AIGNvbmZpZy5zaWxlbnQgPSB0cnVlO1xuLy9AIC8qIC4uLiAqL1xuLy9AIGNvbmZpZy5zaWxlbnQgPSBzaWxlbnRTdGF0ZTsgLy8gcmVzdG9yZSBvbGQgc2lsZW50IHN0YXRlXG4vL0AgYGBgXG4vL0Bcbi8vQCBTdXBwcmVzc2VzIGFsbCBjb21tYW5kIG91dHB1dCBpZiBgdHJ1ZWAsIGV4Y2VwdCBmb3IgYGVjaG8oKWAgY2FsbHMuXG4vL0AgRGVmYXVsdCBpcyBgZmFsc2VgLlxuXG4vL0Bcbi8vQCAjIyMgY29uZmlnLmZhdGFsXG4vL0AgRXhhbXBsZTpcbi8vQFxuLy9AIGBgYGphdmFzY3JpcHRcbi8vQCBjb25maWcuZmF0YWwgPSB0cnVlO1xuLy9AIGNwKCd0aGlzX2ZpbGVfZG9lc19ub3RfZXhpc3QnLCAnL2Rldi9udWxsJyk7IC8vIGRpZXMgaGVyZVxuLy9AIC8qIG1vcmUgY29tbWFuZHMuLi4gKi9cbi8vQCBgYGBcbi8vQFxuLy9AIElmIGB0cnVlYCB0aGUgc2NyaXB0IHdpbGwgZGllIG9uIGVycm9ycy4gRGVmYXVsdCBpcyBgZmFsc2VgLlxuIiwidmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcbnZhciBjb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbicpO1xudmFyIF9scyA9IHJlcXVpcmUoJy4vbHMnKTtcblxuLy9AXG4vL0AgIyMjIGZpbmQocGF0aCBbLHBhdGggLi4uXSlcbi8vQCAjIyMgZmluZChwYXRoX2FycmF5KVxuLy9AIEV4YW1wbGVzOlxuLy9AXG4vL0AgYGBgamF2YXNjcmlwdFxuLy9AIGZpbmQoJ3NyYycsICdsaWInKTtcbi8vQCBmaW5kKFsnc3JjJywgJ2xpYiddKTsgLy8gc2FtZSBhcyBhYm92ZVxuLy9AIGZpbmQoJy4nKS5maWx0ZXIoZnVuY3Rpb24oZmlsZSkgeyByZXR1cm4gZmlsZS5tYXRjaCgvXFwuanMkLyk7IH0pO1xuLy9AIGBgYFxuLy9AXG4vL0AgUmV0dXJucyBhcnJheSBvZiBhbGwgZmlsZXMgKGhvd2V2ZXIgZGVlcCkgaW4gdGhlIGdpdmVuIHBhdGhzLlxuLy9AXG4vL0AgVGhlIG1haW4gZGlmZmVyZW5jZSBmcm9tIGBscygnLVInLCBwYXRoKWAgaXMgdGhhdCB0aGUgcmVzdWx0aW5nIGZpbGUgbmFtZXNcbi8vQCBpbmNsdWRlIHRoZSBiYXNlIGRpcmVjdG9yaWVzLCBlLmcuIGBsaWIvcmVzb3VyY2VzL2ZpbGUxYCBpbnN0ZWFkIG9mIGp1c3QgYGZpbGUxYC5cbmZ1bmN0aW9uIF9maW5kKG9wdGlvbnMsIHBhdGhzKSB7XG4gIGlmICghcGF0aHMpXG4gICAgY29tbW9uLmVycm9yKCdubyBwYXRoIHNwZWNpZmllZCcpO1xuICBlbHNlIGlmICh0eXBlb2YgcGF0aHMgPT09ICdvYmplY3QnKVxuICAgIHBhdGhzID0gcGF0aHM7IC8vIGFzc3VtZSBhcnJheVxuICBlbHNlIGlmICh0eXBlb2YgcGF0aHMgPT09ICdzdHJpbmcnKVxuICAgIHBhdGhzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gIHZhciBsaXN0ID0gW107XG5cbiAgZnVuY3Rpb24gcHVzaEZpbGUoZmlsZSkge1xuICAgIGlmIChjb21tb24ucGxhdGZvcm0gPT09ICd3aW4nKVxuICAgICAgZmlsZSA9IGZpbGUucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgIGxpc3QucHVzaChmaWxlKTtcbiAgfVxuXG4gIC8vIHdoeSBub3Qgc2ltcGx5IGRvIGxzKCctUicsIHBhdGhzKT8gYmVjYXVzZSB0aGUgb3V0cHV0IHdvdWxkbid0IGdpdmUgdGhlIGJhc2UgZGlyc1xuICAvLyB0byBnZXQgdGhlIGJhc2UgZGlyIGluIHRoZSBvdXRwdXQsIHdlIG5lZWQgaW5zdGVhZCBscygnLVInLCAnZGlyLyonKSBmb3IgZXZlcnkgZGlyZWN0b3J5XG5cbiAgcGF0aHMuZm9yRWFjaChmdW5jdGlvbihmaWxlKSB7XG4gICAgcHVzaEZpbGUoZmlsZSk7XG5cbiAgICBpZiAoZnMuc3RhdFN5bmMoZmlsZSkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgX2xzKCctUkEnLCBmaWxlKycvKicpLmZvckVhY2goZnVuY3Rpb24oc3ViZmlsZSkge1xuICAgICAgICBwdXNoRmlsZShzdWJmaWxlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGxpc3Q7XG59XG5tb2R1bGUuZXhwb3J0cyA9IF9maW5kO1xuIiwidmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJyk7XG52YXIgb3MgPSByZXF1aXJlKCdvcycpO1xuXG4vLyBCdWZmZXJlZCBmaWxlIGNvcHksIHN5bmNocm9ub3VzXG4vLyAoVXNpbmcgcmVhZEZpbGVTeW5jKCkgKyB3cml0ZUZpbGVTeW5jKCkgY291bGQgZWFzaWx5IGNhdXNlIGEgbWVtb3J5IG92ZXJmbG93XG4vLyAgd2l0aCBsYXJnZSBmaWxlcylcbmZ1bmN0aW9uIGNvcHlGaWxlU3luYyhzcmNGaWxlLCBkZXN0RmlsZSkge1xuICBpZiAoIWZzLmV4aXN0c1N5bmMoc3JjRmlsZSkpXG4gICAgY29tbW9uLmVycm9yKCdjb3B5RmlsZVN5bmM6IG5vIHN1Y2ggZmlsZSBvciBkaXJlY3Rvcnk6ICcgKyBzcmNGaWxlKTtcblxuICB2YXIgQlVGX0xFTkdUSCA9IDY0KjEwMjQsXG4gICAgICBidWYgPSBuZXcgQnVmZmVyKEJVRl9MRU5HVEgpLFxuICAgICAgYnl0ZXNSZWFkID0gQlVGX0xFTkdUSCxcbiAgICAgIHBvcyA9IDAsXG4gICAgICBmZHIgPSBudWxsLFxuICAgICAgZmR3ID0gbnVsbDtcblxuICB0cnkge1xuICAgIGZkciA9IGZzLm9wZW5TeW5jKHNyY0ZpbGUsICdyJyk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbW1vbi5lcnJvcignY29weUZpbGVTeW5jOiBjb3VsZCBub3QgcmVhZCBzcmMgZmlsZSAoJytzcmNGaWxlKycpJyk7XG4gIH1cblxuICB0cnkge1xuICAgIGZkdyA9IGZzLm9wZW5TeW5jKGRlc3RGaWxlLCAndycpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBjb21tb24uZXJyb3IoJ2NvcHlGaWxlU3luYzogY291bGQgbm90IHdyaXRlIHRvIGRlc3QgZmlsZSAoY29kZT0nK2UuY29kZSsnKTonK2Rlc3RGaWxlKTtcbiAgfVxuXG4gIHdoaWxlIChieXRlc1JlYWQgPT09IEJVRl9MRU5HVEgpIHtcbiAgICBieXRlc1JlYWQgPSBmcy5yZWFkU3luYyhmZHIsIGJ1ZiwgMCwgQlVGX0xFTkdUSCwgcG9zKTtcbiAgICBmcy53cml0ZVN5bmMoZmR3LCBidWYsIDAsIGJ5dGVzUmVhZCk7XG4gICAgcG9zICs9IGJ5dGVzUmVhZDtcbiAgfVxuXG4gIGZzLmNsb3NlU3luYyhmZHIpO1xuICBmcy5jbG9zZVN5bmMoZmR3KTtcblxuICBmcy5jaG1vZFN5bmMoZGVzdEZpbGUsIGZzLnN0YXRTeW5jKHNyY0ZpbGUpLm1vZGUpO1xufVxuXG4vLyBSZWN1cnNpdmVseSBjb3BpZXMgJ3NvdXJjZURpcicgaW50byAnZGVzdERpcidcbi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vcnlhbm1jZ3JhdGgvd3JlbmNoLWpzXG4vL1xuLy8gQ29weXJpZ2h0IChjKSAyMDEwIFJ5YW4gTWNHcmF0aFxuLy8gQ29weXJpZ2h0IChjKSAyMDEyIEFydHVyIEFkaWJcbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2Vcbi8vIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5mdW5jdGlvbiBjcGRpclN5bmNSZWN1cnNpdmUoc291cmNlRGlyLCBkZXN0RGlyLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9O1xuXG4gIC8qIENyZWF0ZSB0aGUgZGlyZWN0b3J5IHdoZXJlIGFsbCBvdXIganVuayBpcyBtb3ZpbmcgdG87IHJlYWQgdGhlIG1vZGUgb2YgdGhlIHNvdXJjZSBkaXJlY3RvcnkgYW5kIG1pcnJvciBpdCAqL1xuICB2YXIgY2hlY2tEaXIgPSBmcy5zdGF0U3luYyhzb3VyY2VEaXIpO1xuICB0cnkge1xuICAgIGZzLm1rZGlyU3luYyhkZXN0RGlyLCBjaGVja0Rpci5tb2RlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vaWYgdGhlIGRpcmVjdG9yeSBhbHJlYWR5IGV4aXN0cywgdGhhdCdzIG9rYXlcbiAgICBpZiAoZS5jb2RlICE9PSAnRUVYSVNUJykgdGhyb3cgZTtcbiAgfVxuXG4gIHZhciBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKHNvdXJjZURpcik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzcmNGaWxlID0gc291cmNlRGlyICsgXCIvXCIgKyBmaWxlc1tpXTtcbiAgICB2YXIgZGVzdEZpbGUgPSBkZXN0RGlyICsgXCIvXCIgKyBmaWxlc1tpXTtcbiAgICB2YXIgc3JjRmlsZVN0YXQgPSBmcy5sc3RhdFN5bmMoc3JjRmlsZSk7XG5cbiAgICBpZiAoc3JjRmlsZVN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgLyogcmVjdXJzaW9uIHRoaXMgdGhpbmcgcmlnaHQgb24gYmFjay4gKi9cbiAgICAgIGNwZGlyU3luY1JlY3Vyc2l2ZShzcmNGaWxlLCBkZXN0RmlsZSwgb3B0cyk7XG4gICAgfSBlbHNlIGlmIChzcmNGaWxlU3RhdC5pc1N5bWJvbGljTGluaygpKSB7XG4gICAgICB2YXIgc3ltbGlua0Z1bGwgPSBmcy5yZWFkbGlua1N5bmMoc3JjRmlsZSk7XG4gICAgICBmcy5zeW1saW5rU3luYyhzeW1saW5rRnVsbCwgZGVzdEZpbGUsIG9zLnBsYXRmb3JtKCkgPT09IFwid2luMzJcIiA/IFwianVuY3Rpb25cIiA6IG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvKiBBdCB0aGlzIHBvaW50LCB3ZSd2ZSBoaXQgYSBmaWxlIGFjdHVhbGx5IHdvcnRoIGNvcHlpbmcuLi4gc28gY29weSBpdCBvbiBvdmVyLiAqL1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZGVzdEZpbGUpICYmICFvcHRzLmZvcmNlKSB7XG4gICAgICAgIGNvbW1vbi5sb2coJ3NraXBwaW5nIGV4aXN0aW5nIGZpbGU6ICcgKyBmaWxlc1tpXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb3B5RmlsZVN5bmMoc3JjRmlsZSwgZGVzdEZpbGUpO1xuICAgICAgfVxuICAgIH1cblxuICB9IC8vIGZvciBmaWxlc1xufSAvLyBjcGRpclN5bmNSZWN1cnNpdmVcblxuXG4vL0Bcbi8vQCAjIyMgY3AoW29wdGlvbnMgLF0gc291cmNlIFssc291cmNlIC4uLl0sIGRlc3QpXG4vL0AgIyMjIGNwKFtvcHRpb25zICxdIHNvdXJjZV9hcnJheSwgZGVzdClcbi8vQCBBdmFpbGFibGUgb3B0aW9uczpcbi8vQFxuLy9AICsgYC1mYDogZm9yY2Vcbi8vQCArIGAtciwgLVJgOiByZWN1cnNpdmVcbi8vQFxuLy9AIEV4YW1wbGVzOlxuLy9AXG4vL0AgYGBgamF2YXNjcmlwdFxuLy9AIGNwKCdmaWxlMScsICdkaXIxJyk7XG4vL0AgY3AoJy1SZicsICcvdG1wLyonLCAnL3Vzci9sb2NhbC8qJywgJy9ob21lL3RtcCcpO1xuLy9AIGNwKCctUmYnLCBbJy90bXAvKicsICcvdXNyL2xvY2FsLyonXSwgJy9ob21lL3RtcCcpOyAvLyBzYW1lIGFzIGFib3ZlXG4vL0AgYGBgXG4vL0Bcbi8vQCBDb3BpZXMgZmlsZXMuIFRoZSB3aWxkY2FyZCBgKmAgaXMgYWNjZXB0ZWQuXG5mdW5jdGlvbiBfY3Aob3B0aW9ucywgc291cmNlcywgZGVzdCkge1xuICBvcHRpb25zID0gY29tbW9uLnBhcnNlT3B0aW9ucyhvcHRpb25zLCB7XG4gICAgJ2YnOiAnZm9yY2UnLFxuICAgICdSJzogJ3JlY3Vyc2l2ZScsXG4gICAgJ3InOiAncmVjdXJzaXZlJ1xuICB9KTtcblxuICAvLyBHZXQgc291cmNlcywgZGVzdFxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICBjb21tb24uZXJyb3IoJ21pc3NpbmcgPHNvdXJjZT4gYW5kL29yIDxkZXN0PicpO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XG4gICAgc291cmNlcyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxLCBhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgZGVzdCA9IGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV07XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNvdXJjZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgc291cmNlcyA9IFtzb3VyY2VzXTtcbiAgfSBlbHNlIGlmICgnbGVuZ3RoJyBpbiBzb3VyY2VzKSB7XG4gICAgc291cmNlcyA9IHNvdXJjZXM7IC8vIG5vLW9wIGZvciBhcnJheVxuICB9IGVsc2Uge1xuICAgIGNvbW1vbi5lcnJvcignaW52YWxpZCBhcmd1bWVudHMnKTtcbiAgfVxuXG4gIHZhciBleGlzdHMgPSBmcy5leGlzdHNTeW5jKGRlc3QpLFxuICAgICAgc3RhdHMgPSBleGlzdHMgJiYgZnMuc3RhdFN5bmMoZGVzdCk7XG5cbiAgLy8gRGVzdCBpcyBub3QgZXhpc3RpbmcgZGlyLCBidXQgbXVsdGlwbGUgc291cmNlcyBnaXZlblxuICBpZiAoKCFleGlzdHMgfHwgIXN0YXRzLmlzRGlyZWN0b3J5KCkpICYmIHNvdXJjZXMubGVuZ3RoID4gMSlcbiAgICBjb21tb24uZXJyb3IoJ2Rlc3QgaXMgbm90IGEgZGlyZWN0b3J5ICh0b28gbWFueSBzb3VyY2VzKScpO1xuXG4gIC8vIERlc3QgaXMgYW4gZXhpc3RpbmcgZmlsZSwgYnV0IG5vIC1mIGdpdmVuXG4gIGlmIChleGlzdHMgJiYgc3RhdHMuaXNGaWxlKCkgJiYgIW9wdGlvbnMuZm9yY2UpXG4gICAgY29tbW9uLmVycm9yKCdkZXN0IGZpbGUgYWxyZWFkeSBleGlzdHM6ICcgKyBkZXN0KTtcblxuICBpZiAob3B0aW9ucy5yZWN1cnNpdmUpIHtcbiAgICAvLyBSZWN1cnNpdmUgYWxsb3dzIHRoZSBzaG9ydGN1dCBzeW50YXggXCJzb3VyY2VkaXIvXCIgZm9yIFwic291cmNlZGlyLypcIlxuICAgIC8vIChzZWUgR2l0aHViIGlzc3VlICMxNSlcbiAgICBzb3VyY2VzLmZvckVhY2goZnVuY3Rpb24oc3JjLCBpKSB7XG4gICAgICBpZiAoc3JjW3NyYy5sZW5ndGggLSAxXSA9PT0gJy8nKVxuICAgICAgICBzb3VyY2VzW2ldICs9ICcqJztcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBkZXN0XG4gICAgdHJ5IHtcbiAgICAgIGZzLm1rZGlyU3luYyhkZXN0LCBwYXJzZUludCgnMDc3NycsIDgpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBsaWtlIFVuaXgncyBjcCwga2VlcCBnb2luZyBldmVuIGlmIHdlIGNhbid0IGNyZWF0ZSBkZXN0IGRpclxuICAgIH1cbiAgfVxuXG4gIHNvdXJjZXMgPSBjb21tb24uZXhwYW5kKHNvdXJjZXMpO1xuXG4gIHNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbihzcmMpIHtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc3JjKSkge1xuICAgICAgY29tbW9uLmVycm9yKCdubyBzdWNoIGZpbGUgb3IgZGlyZWN0b3J5OiAnK3NyYywgdHJ1ZSk7XG4gICAgICByZXR1cm47IC8vIHNraXAgZmlsZVxuICAgIH1cblxuICAgIC8vIElmIGhlcmUsIHNyYyBleGlzdHNcbiAgICBpZiAoZnMuc3RhdFN5bmMoc3JjKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICBpZiAoIW9wdGlvbnMucmVjdXJzaXZlKSB7XG4gICAgICAgIC8vIE5vbi1SZWN1cnNpdmVcbiAgICAgICAgY29tbW9uLmxvZyhzcmMgKyAnIGlzIGEgZGlyZWN0b3J5IChub3QgY29waWVkKScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUmVjdXJzaXZlXG4gICAgICAgIC8vICdjcCAvYS9zb3VyY2UgZGVzdCcgc2hvdWxkIGNyZWF0ZSAnc291cmNlJyBpbiAnZGVzdCdcbiAgICAgICAgdmFyIG5ld0Rlc3QgPSBwYXRoLmpvaW4oZGVzdCwgcGF0aC5iYXNlbmFtZShzcmMpKSxcbiAgICAgICAgICAgIGNoZWNrRGlyID0gZnMuc3RhdFN5bmMoc3JjKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmcy5ta2RpclN5bmMobmV3RGVzdCwgY2hlY2tEaXIubW9kZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvL2lmIHRoZSBkaXJlY3RvcnkgYWxyZWFkeSBleGlzdHMsIHRoYXQncyBva2F5XG4gICAgICAgICAgaWYgKGUuY29kZSAhPT0gJ0VFWElTVCcpIHRocm93IGU7XG4gICAgICAgIH1cblxuICAgICAgICBjcGRpclN5bmNSZWN1cnNpdmUoc3JjLCBuZXdEZXN0LCB7Zm9yY2U6IG9wdGlvbnMuZm9yY2V9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybjsgLy8gZG9uZSB3aXRoIGRpclxuICAgIH1cblxuICAgIC8vIElmIGhlcmUsIHNyYyBpcyBhIGZpbGVcblxuICAgIC8vIFdoZW4gY29weWluZyB0byAnL3BhdGgvZGlyJzpcbiAgICAvLyAgICB0aGlzRGVzdCA9ICcvcGF0aC9kaXIvZmlsZTEnXG4gICAgdmFyIHRoaXNEZXN0ID0gZGVzdDtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhkZXN0KSAmJiBmcy5zdGF0U3luYyhkZXN0KS5pc0RpcmVjdG9yeSgpKVxuICAgICAgdGhpc0Rlc3QgPSBwYXRoLm5vcm1hbGl6ZShkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShzcmMpKTtcblxuICAgIGlmIChmcy5leGlzdHNTeW5jKHRoaXNEZXN0KSAmJiAhb3B0aW9ucy5mb3JjZSkge1xuICAgICAgY29tbW9uLmVycm9yKCdkZXN0IGZpbGUgYWxyZWFkeSBleGlzdHM6ICcgKyB0aGlzRGVzdCwgdHJ1ZSk7XG4gICAgICByZXR1cm47IC8vIHNraXAgZmlsZVxuICAgIH1cblxuICAgIGNvcHlGaWxlU3luYyhzcmMsIHRoaXNEZXN0KTtcbiAgfSk7IC8vIGZvckVhY2goc3JjKVxufVxubW9kdWxlLmV4cG9ydHMgPSBfY3A7XG4iLCJ2YXIgY29tbW9uID0gcmVxdWlyZSgnLi9jb21tb24nKTtcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbi8vIFJlY3Vyc2l2ZWx5IHJlbW92ZXMgJ2Rpcidcbi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vcnlhbm1jZ3JhdGgvd3JlbmNoLWpzXG4vL1xuLy8gQ29weXJpZ2h0IChjKSAyMDEwIFJ5YW4gTWNHcmF0aFxuLy8gQ29weXJpZ2h0IChjKSAyMDEyIEFydHVyIEFkaWJcbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2Vcbi8vIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5mdW5jdGlvbiBybWRpclN5bmNSZWN1cnNpdmUoZGlyLCBmb3JjZSkge1xuICB2YXIgZmlsZXM7XG5cbiAgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIpO1xuXG4gIC8vIExvb3AgdGhyb3VnaCBhbmQgZGVsZXRlIGV2ZXJ5dGhpbmcgaW4gdGhlIHN1Yi10cmVlIGFmdGVyIGNoZWNraW5nIGl0XG4gIGZvcih2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBmaWxlID0gZGlyICsgXCIvXCIgKyBmaWxlc1tpXSxcbiAgICAgICAgY3VyckZpbGUgPSBmcy5sc3RhdFN5bmMoZmlsZSk7XG5cbiAgICBpZihjdXJyRmlsZS5pc0RpcmVjdG9yeSgpKSB7IC8vIFJlY3Vyc2l2ZSBmdW5jdGlvbiBiYWNrIHRvIHRoZSBiZWdpbm5pbmdcbiAgICAgIHJtZGlyU3luY1JlY3Vyc2l2ZShmaWxlLCBmb3JjZSk7XG4gICAgfVxuXG4gICAgZWxzZSBpZihjdXJyRmlsZS5pc1N5bWJvbGljTGluaygpKSB7IC8vIFVubGluayBzeW1saW5rc1xuICAgICAgaWYgKGZvcmNlIHx8IGlzV3JpdGVhYmxlKGZpbGUpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29tbW9uLnVubGlua1N5bmMoZmlsZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb21tb24uZXJyb3IoJ2NvdWxkIG5vdCByZW1vdmUgZmlsZSAoY29kZSAnK2UuY29kZSsnKTogJyArIGZpbGUsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZWxzZSAvLyBBc3N1bWUgaXQncyBhIGZpbGUgLSBwZXJoYXBzIGEgdHJ5L2NhdGNoIGJlbG9uZ3MgaGVyZT9cbiAgICAgIGlmIChmb3JjZSB8fCBpc1dyaXRlYWJsZShmaWxlKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbW1vbi51bmxpbmtTeW5jKGZpbGUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29tbW9uLmVycm9yKCdjb3VsZCBub3QgcmVtb3ZlIGZpbGUgKGNvZGUgJytlLmNvZGUrJyk6ICcgKyBmaWxlLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICB9XG5cbiAgLy8gTm93IHRoYXQgd2Uga25vdyBldmVyeXRoaW5nIGluIHRoZSBzdWItdHJlZSBoYXMgYmVlbiBkZWxldGVkLCB3ZSBjYW4gZGVsZXRlIHRoZSBtYWluIGRpcmVjdG9yeS5cbiAgLy8gSHV6emFoIGZvciB0aGUgc2hvcGtlZXAuXG5cbiAgdmFyIHJlc3VsdDtcbiAgdHJ5IHtcbiAgICByZXN1bHQgPSBmcy5ybWRpclN5bmMoZGlyKTtcbiAgfSBjYXRjaChlKSB7XG4gICAgY29tbW9uLmVycm9yKCdjb3VsZCBub3QgcmVtb3ZlIGRpcmVjdG9yeSAoY29kZSAnK2UuY29kZSsnKTogJyArIGRpciwgdHJ1ZSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufSAvLyBybWRpclN5bmNSZWN1cnNpdmVcblxuLy8gSGFjayB0byBkZXRlcm1pbmUgaWYgZmlsZSBoYXMgd3JpdGUgcGVybWlzc2lvbnMgZm9yIGN1cnJlbnQgdXNlclxuLy8gQXZvaWRzIGhhdmluZyB0byBjaGVjayB1c2VyLCBncm91cCwgZXRjLCBidXQgaXQncyBwcm9iYWJseSBzbG93XG5mdW5jdGlvbiBpc1dyaXRlYWJsZShmaWxlKSB7XG4gIHZhciB3cml0ZVBlcm1pc3Npb24gPSB0cnVlO1xuICB0cnkge1xuICAgIHZhciBfX2ZkID0gZnMub3BlblN5bmMoZmlsZSwgJ2EnKTtcbiAgICBmcy5jbG9zZVN5bmMoX19mZCk7XG4gIH0gY2F0Y2goZSkge1xuICAgIHdyaXRlUGVybWlzc2lvbiA9IGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHdyaXRlUGVybWlzc2lvbjtcbn1cblxuLy9AXG4vL0AgIyMjIHJtKFtvcHRpb25zICxdIGZpbGUgWywgZmlsZSAuLi5dKVxuLy9AICMjIyBybShbb3B0aW9ucyAsXSBmaWxlX2FycmF5KVxuLy9AIEF2YWlsYWJsZSBvcHRpb25zOlxuLy9AXG4vL0AgKyBgLWZgOiBmb3JjZVxuLy9AICsgYC1yLCAtUmA6IHJlY3Vyc2l2ZVxuLy9AXG4vL0AgRXhhbXBsZXM6XG4vL0Bcbi8vQCBgYGBqYXZhc2NyaXB0XG4vL0Agcm0oJy1yZicsICcvdG1wLyonKTtcbi8vQCBybSgnc29tZV9maWxlLnR4dCcsICdhbm90aGVyX2ZpbGUudHh0Jyk7XG4vL0Agcm0oWydzb21lX2ZpbGUudHh0JywgJ2Fub3RoZXJfZmlsZS50eHQnXSk7IC8vIHNhbWUgYXMgYWJvdmVcbi8vQCBgYGBcbi8vQFxuLy9AIFJlbW92ZXMgZmlsZXMuIFRoZSB3aWxkY2FyZCBgKmAgaXMgYWNjZXB0ZWQuXG5mdW5jdGlvbiBfcm0ob3B0aW9ucywgZmlsZXMpIHtcbiAgb3B0aW9ucyA9IGNvbW1vbi5wYXJzZU9wdGlvbnMob3B0aW9ucywge1xuICAgICdmJzogJ2ZvcmNlJyxcbiAgICAncic6ICdyZWN1cnNpdmUnLFxuICAgICdSJzogJ3JlY3Vyc2l2ZSdcbiAgfSk7XG4gIGlmICghZmlsZXMpXG4gICAgY29tbW9uLmVycm9yKCdubyBwYXRocyBnaXZlbicpO1xuXG4gIGlmICh0eXBlb2YgZmlsZXMgPT09ICdzdHJpbmcnKVxuICAgIGZpbGVzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAvLyBpZiBpdCdzIGFycmF5IGxlYXZlIGl0IGFzIGl0IGlzXG5cbiAgZmlsZXMgPSBjb21tb24uZXhwYW5kKGZpbGVzKTtcblxuICBmaWxlcy5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZmlsZSkpIHtcbiAgICAgIC8vIFBhdGggZG9lcyBub3QgZXhpc3QsIG5vIGZvcmNlIGZsYWcgZ2l2ZW5cbiAgICAgIGlmICghb3B0aW9ucy5mb3JjZSlcbiAgICAgICAgY29tbW9uLmVycm9yKCdubyBzdWNoIGZpbGUgb3IgZGlyZWN0b3J5OiAnK2ZpbGUsIHRydWUpO1xuXG4gICAgICByZXR1cm47IC8vIHNraXAgZmlsZVxuICAgIH1cblxuICAgIC8vIElmIGhlcmUsIHBhdGggZXhpc3RzXG5cbiAgICB2YXIgc3RhdHMgPSBmcy5sc3RhdFN5bmMoZmlsZSk7XG4gICAgaWYgKHN0YXRzLmlzRmlsZSgpIHx8IHN0YXRzLmlzU3ltYm9saWNMaW5rKCkpIHtcblxuICAgICAgLy8gRG8gbm90IGNoZWNrIGZvciBmaWxlIHdyaXRpbmcgcGVybWlzc2lvbnNcbiAgICAgIGlmIChvcHRpb25zLmZvcmNlKSB7XG4gICAgICAgIGNvbW1vbi51bmxpbmtTeW5jKGZpbGUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1dyaXRlYWJsZShmaWxlKSlcbiAgICAgICAgY29tbW9uLnVubGlua1N5bmMoZmlsZSk7XG4gICAgICBlbHNlXG4gICAgICAgIGNvbW1vbi5lcnJvcigncGVybWlzc2lvbiBkZW5pZWQ6ICcrZmlsZSwgdHJ1ZSk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9IC8vIHNpbXBsZSBmaWxlXG5cbiAgICAvLyBQYXRoIGlzIGFuIGV4aXN0aW5nIGRpcmVjdG9yeSwgYnV0IG5vIC1yIGZsYWcgZ2l2ZW5cbiAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSAmJiAhb3B0aW9ucy5yZWN1cnNpdmUpIHtcbiAgICAgIGNvbW1vbi5lcnJvcigncGF0aCBpcyBhIGRpcmVjdG9yeScsIHRydWUpO1xuICAgICAgcmV0dXJuOyAvLyBza2lwIHBhdGhcbiAgICB9XG5cbiAgICAvLyBSZWN1cnNpdmVseSByZW1vdmUgZXhpc3RpbmcgZGlyZWN0b3J5XG4gICAgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkgJiYgb3B0aW9ucy5yZWN1cnNpdmUpIHtcbiAgICAgIHJtZGlyU3luY1JlY3Vyc2l2ZShmaWxlLCBvcHRpb25zLmZvcmNlKTtcbiAgICB9XG4gIH0pOyAvLyBmb3JFYWNoKGZpbGUpXG59IC8vIHJtXG5tb2R1bGUuZXhwb3J0cyA9IF9ybTtcbiIsInZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbnZhciBjb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbicpO1xuXG4vL0Bcbi8vQCAjIyMgbXYoc291cmNlIFssIHNvdXJjZSAuLi5dLCBkZXN0Jylcbi8vQCAjIyMgbXYoc291cmNlX2FycmF5LCBkZXN0Jylcbi8vQCBBdmFpbGFibGUgb3B0aW9uczpcbi8vQFxuLy9AICsgYGZgOiBmb3JjZVxuLy9AXG4vL0AgRXhhbXBsZXM6XG4vL0Bcbi8vQCBgYGBqYXZhc2NyaXB0XG4vL0AgbXYoJy1mJywgJ2ZpbGUnLCAnZGlyLycpO1xuLy9AIG12KCdmaWxlMScsICdmaWxlMicsICdkaXIvJyk7XG4vL0AgbXYoWydmaWxlMScsICdmaWxlMiddLCAnZGlyLycpOyAvLyBzYW1lIGFzIGFib3ZlXG4vL0AgYGBgXG4vL0Bcbi8vQCBNb3ZlcyBmaWxlcy4gVGhlIHdpbGRjYXJkIGAqYCBpcyBhY2NlcHRlZC5cbmZ1bmN0aW9uIF9tdihvcHRpb25zLCBzb3VyY2VzLCBkZXN0KSB7XG4gIG9wdGlvbnMgPSBjb21tb24ucGFyc2VPcHRpb25zKG9wdGlvbnMsIHtcbiAgICAnZic6ICdmb3JjZSdcbiAgfSk7XG5cbiAgLy8gR2V0IHNvdXJjZXMsIGRlc3RcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgY29tbW9uLmVycm9yKCdtaXNzaW5nIDxzb3VyY2U+IGFuZC9vciA8ZGVzdD4nKTtcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgIHNvdXJjZXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSwgYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGRlc3QgPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2VzID09PSAnc3RyaW5nJykge1xuICAgIHNvdXJjZXMgPSBbc291cmNlc107XG4gIH0gZWxzZSBpZiAoJ2xlbmd0aCcgaW4gc291cmNlcykge1xuICAgIHNvdXJjZXMgPSBzb3VyY2VzOyAvLyBuby1vcCBmb3IgYXJyYXlcbiAgfSBlbHNlIHtcbiAgICBjb21tb24uZXJyb3IoJ2ludmFsaWQgYXJndW1lbnRzJyk7XG4gIH1cblxuICBzb3VyY2VzID0gY29tbW9uLmV4cGFuZChzb3VyY2VzKTtcblxuICB2YXIgZXhpc3RzID0gZnMuZXhpc3RzU3luYyhkZXN0KSxcbiAgICAgIHN0YXRzID0gZXhpc3RzICYmIGZzLnN0YXRTeW5jKGRlc3QpO1xuXG4gIC8vIERlc3QgaXMgbm90IGV4aXN0aW5nIGRpciwgYnV0IG11bHRpcGxlIHNvdXJjZXMgZ2l2ZW5cbiAgaWYgKCghZXhpc3RzIHx8ICFzdGF0cy5pc0RpcmVjdG9yeSgpKSAmJiBzb3VyY2VzLmxlbmd0aCA+IDEpXG4gICAgY29tbW9uLmVycm9yKCdkZXN0IGlzIG5vdCBhIGRpcmVjdG9yeSAodG9vIG1hbnkgc291cmNlcyknKTtcblxuICAvLyBEZXN0IGlzIGFuIGV4aXN0aW5nIGZpbGUsIGJ1dCBubyAtZiBnaXZlblxuICBpZiAoZXhpc3RzICYmIHN0YXRzLmlzRmlsZSgpICYmICFvcHRpb25zLmZvcmNlKVxuICAgIGNvbW1vbi5lcnJvcignZGVzdCBmaWxlIGFscmVhZHkgZXhpc3RzOiAnICsgZGVzdCk7XG5cbiAgc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uKHNyYykge1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhzcmMpKSB7XG4gICAgICBjb21tb24uZXJyb3IoJ25vIHN1Y2ggZmlsZSBvciBkaXJlY3Rvcnk6ICcrc3JjLCB0cnVlKTtcbiAgICAgIHJldHVybjsgLy8gc2tpcCBmaWxlXG4gICAgfVxuXG4gICAgLy8gSWYgaGVyZSwgc3JjIGV4aXN0c1xuXG4gICAgLy8gV2hlbiBjb3B5aW5nIHRvICcvcGF0aC9kaXInOlxuICAgIC8vICAgIHRoaXNEZXN0ID0gJy9wYXRoL2Rpci9maWxlMSdcbiAgICB2YXIgdGhpc0Rlc3QgPSBkZXN0O1xuICAgIGlmIChmcy5leGlzdHNTeW5jKGRlc3QpICYmIGZzLnN0YXRTeW5jKGRlc3QpLmlzRGlyZWN0b3J5KCkpXG4gICAgICB0aGlzRGVzdCA9IHBhdGgubm9ybWFsaXplKGRlc3QgKyAnLycgKyBwYXRoLmJhc2VuYW1lKHNyYykpO1xuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmModGhpc0Rlc3QpICYmICFvcHRpb25zLmZvcmNlKSB7XG4gICAgICBjb21tb24uZXJyb3IoJ2Rlc3QgZmlsZSBhbHJlYWR5IGV4aXN0czogJyArIHRoaXNEZXN0LCB0cnVlKTtcbiAgICAgIHJldHVybjsgLy8gc2tpcCBmaWxlXG4gICAgfVxuXG4gICAgaWYgKHBhdGgucmVzb2x2ZShzcmMpID09PSBwYXRoLmRpcm5hbWUocGF0aC5yZXNvbHZlKHRoaXNEZXN0KSkpIHtcbiAgICAgIGNvbW1vbi5lcnJvcignY2Fubm90IG1vdmUgdG8gc2VsZjogJytzcmMsIHRydWUpO1xuICAgICAgcmV0dXJuOyAvLyBza2lwIGZpbGVcbiAgICB9XG5cbiAgICBmcy5yZW5hbWVTeW5jKHNyYywgdGhpc0Rlc3QpO1xuICB9KTsgLy8gZm9yRWFjaChzcmMpXG59IC8vIG12XG5tb2R1bGUuZXhwb3J0cyA9IF9tdjtcbiIsInZhciBjb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbicpO1xudmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vLyBSZWN1cnNpdmVseSBjcmVhdGVzICdkaXInXG5mdW5jdGlvbiBta2RpclN5bmNSZWN1cnNpdmUoZGlyKSB7XG4gIHZhciBiYXNlRGlyID0gcGF0aC5kaXJuYW1lKGRpcik7XG5cbiAgLy8gQmFzZSBkaXIgZXhpc3RzLCBubyByZWN1cnNpb24gbmVjZXNzYXJ5XG4gIGlmIChmcy5leGlzdHNTeW5jKGJhc2VEaXIpKSB7XG4gICAgZnMubWtkaXJTeW5jKGRpciwgcGFyc2VJbnQoJzA3NzcnLCA4KSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gQmFzZSBkaXIgZG9lcyBub3QgZXhpc3QsIGdvIHJlY3Vyc2l2ZVxuICBta2RpclN5bmNSZWN1cnNpdmUoYmFzZURpcik7XG5cbiAgLy8gQmFzZSBkaXIgY3JlYXRlZCwgY2FuIGNyZWF0ZSBkaXJcbiAgZnMubWtkaXJTeW5jKGRpciwgcGFyc2VJbnQoJzA3NzcnLCA4KSk7XG59XG5cbi8vQFxuLy9AICMjIyBta2Rpcihbb3B0aW9ucyAsXSBkaXIgWywgZGlyIC4uLl0pXG4vL0AgIyMjIG1rZGlyKFtvcHRpb25zICxdIGRpcl9hcnJheSlcbi8vQCBBdmFpbGFibGUgb3B0aW9uczpcbi8vQFxuLy9AICsgYHBgOiBmdWxsIHBhdGggKHdpbGwgY3JlYXRlIGludGVybWVkaWF0ZSBkaXJzIGlmIG5lY2Vzc2FyeSlcbi8vQFxuLy9AIEV4YW1wbGVzOlxuLy9AXG4vL0AgYGBgamF2YXNjcmlwdFxuLy9AIG1rZGlyKCctcCcsICcvdG1wL2EvYi9jL2QnLCAnL3RtcC9lL2YvZycpO1xuLy9AIG1rZGlyKCctcCcsIFsnL3RtcC9hL2IvYy9kJywgJy90bXAvZS9mL2cnXSk7IC8vIHNhbWUgYXMgYWJvdmVcbi8vQCBgYGBcbi8vQFxuLy9AIENyZWF0ZXMgZGlyZWN0b3JpZXMuXG5mdW5jdGlvbiBfbWtkaXIob3B0aW9ucywgZGlycykge1xuICBvcHRpb25zID0gY29tbW9uLnBhcnNlT3B0aW9ucyhvcHRpb25zLCB7XG4gICAgJ3AnOiAnZnVsbHBhdGgnXG4gIH0pO1xuICBpZiAoIWRpcnMpXG4gICAgY29tbW9uLmVycm9yKCdubyBwYXRocyBnaXZlbicpO1xuXG4gIGlmICh0eXBlb2YgZGlycyA9PT0gJ3N0cmluZycpXG4gICAgZGlycyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgLy8gaWYgaXQncyBhcnJheSBsZWF2ZSBpdCBhcyBpdCBpc1xuXG4gIGRpcnMuZm9yRWFjaChmdW5jdGlvbihkaXIpIHtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhkaXIpKSB7XG4gICAgICBpZiAoIW9wdGlvbnMuZnVsbHBhdGgpXG4gICAgICAgICAgY29tbW9uLmVycm9yKCdwYXRoIGFscmVhZHkgZXhpc3RzOiAnICsgZGlyLCB0cnVlKTtcbiAgICAgIHJldHVybjsgLy8gc2tpcCBkaXJcbiAgICB9XG5cbiAgICAvLyBCYXNlIGRpciBkb2VzIG5vdCBleGlzdCwgYW5kIG5vIC1wIG9wdGlvbiBnaXZlblxuICAgIHZhciBiYXNlRGlyID0gcGF0aC5kaXJuYW1lKGRpcik7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGJhc2VEaXIpICYmICFvcHRpb25zLmZ1bGxwYXRoKSB7XG4gICAgICBjb21tb24uZXJyb3IoJ25vIHN1Y2ggZmlsZSBvciBkaXJlY3Rvcnk6ICcgKyBiYXNlRGlyLCB0cnVlKTtcbiAgICAgIHJldHVybjsgLy8gc2tpcCBkaXJcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5mdWxscGF0aClcbiAgICAgIG1rZGlyU3luY1JlY3Vyc2l2ZShkaXIpO1xuICAgIGVsc2VcbiAgICAgIGZzLm1rZGlyU3luYyhkaXIsIHBhcnNlSW50KCcwNzc3JywgOCkpO1xuICB9KTtcbn0gLy8gbWtkaXJcbm1vZHVsZS5leHBvcnRzID0gX21rZGlyO1xuIiwidmFyIGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJyk7XG52YXIgZnMgPSByZXF1aXJlKCdmcycpO1xuXG4vL0Bcbi8vQCAjIyMgdGVzdChleHByZXNzaW9uKVxuLy9AIEF2YWlsYWJsZSBleHByZXNzaW9uIHByaW1hcmllczpcbi8vQFxuLy9AICsgYCctYicsICdwYXRoJ2A6IHRydWUgaWYgcGF0aCBpcyBhIGJsb2NrIGRldmljZVxuLy9AICsgYCctYycsICdwYXRoJ2A6IHRydWUgaWYgcGF0aCBpcyBhIGNoYXJhY3RlciBkZXZpY2Vcbi8vQCArIGAnLWQnLCAncGF0aCdgOiB0cnVlIGlmIHBhdGggaXMgYSBkaXJlY3Rvcnlcbi8vQCArIGAnLWUnLCAncGF0aCdgOiB0cnVlIGlmIHBhdGggZXhpc3RzXG4vL0AgKyBgJy1mJywgJ3BhdGgnYDogdHJ1ZSBpZiBwYXRoIGlzIGEgcmVndWxhciBmaWxlXG4vL0AgKyBgJy1MJywgJ3BhdGgnYDogdHJ1ZSBpZiBwYXRoIGlzIGEgc3ltYm9pbGMgbGlua1xuLy9AICsgYCctcCcsICdwYXRoJ2A6IHRydWUgaWYgcGF0aCBpcyBhIHBpcGUgKEZJRk8pXG4vL0AgKyBgJy1TJywgJ3BhdGgnYDogdHJ1ZSBpZiBwYXRoIGlzIGEgc29ja2V0XG4vL0Bcbi8vQCBFeGFtcGxlczpcbi8vQFxuLy9AIGBgYGphdmFzY3JpcHRcbi8vQCBpZiAodGVzdCgnLWQnLCBwYXRoKSkgeyAvKiBkbyBzb21ldGhpbmcgd2l0aCBkaXIgKi8gfTtcbi8vQCBpZiAoIXRlc3QoJy1mJywgcGF0aCkpIGNvbnRpbnVlOyAvLyBza2lwIGlmIGl0J3MgYSByZWd1bGFyIGZpbGVcbi8vQCBgYGBcbi8vQFxuLy9AIEV2YWx1YXRlcyBleHByZXNzaW9uIHVzaW5nIHRoZSBhdmFpbGFibGUgcHJpbWFyaWVzIGFuZCByZXR1cm5zIGNvcnJlc3BvbmRpbmcgdmFsdWUuXG5mdW5jdGlvbiBfdGVzdChvcHRpb25zLCBwYXRoKSB7XG4gIGlmICghcGF0aClcbiAgICBjb21tb24uZXJyb3IoJ25vIHBhdGggZ2l2ZW4nKTtcblxuICAvLyBoYWNrIC0gb25seSB3b3JrcyB3aXRoIHVuYXJ5IHByaW1hcmllc1xuICBvcHRpb25zID0gY29tbW9uLnBhcnNlT3B0aW9ucyhvcHRpb25zLCB7XG4gICAgJ2InOiAnYmxvY2snLFxuICAgICdjJzogJ2NoYXJhY3RlcicsXG4gICAgJ2QnOiAnZGlyZWN0b3J5JyxcbiAgICAnZSc6ICdleGlzdHMnLFxuICAgICdmJzogJ2ZpbGUnLFxuICAgICdMJzogJ2xpbmsnLFxuICAgICdwJzogJ3BpcGUnLFxuICAgICdTJzogJ3NvY2tldCdcbiAgfSk7XG5cbiAgdmFyIGNhbkludGVycHJldCA9IGZhbHNlO1xuICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucylcbiAgICBpZiAob3B0aW9uc1trZXldID09PSB0cnVlKSB7XG4gICAgICBjYW5JbnRlcnByZXQgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gIGlmICghY2FuSW50ZXJwcmV0KVxuICAgIGNvbW1vbi5lcnJvcignY291bGQgbm90IGludGVycHJldCBleHByZXNzaW9uJyk7XG5cbiAgaWYgKG9wdGlvbnMubGluaykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnMubHN0YXRTeW5jKHBhdGgpLmlzU3ltYm9saWNMaW5rKCk7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFmcy5leGlzdHNTeW5jKHBhdGgpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAob3B0aW9ucy5leGlzdHMpXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgdmFyIHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCk7XG5cbiAgaWYgKG9wdGlvbnMuYmxvY2spXG4gICAgcmV0dXJuIHN0YXRzLmlzQmxvY2tEZXZpY2UoKTtcblxuICBpZiAob3B0aW9ucy5jaGFyYWN0ZXIpXG4gICAgcmV0dXJuIHN0YXRzLmlzQ2hhcmFjdGVyRGV2aWNlKCk7XG5cbiAgaWYgKG9wdGlvbnMuZGlyZWN0b3J5KVxuICAgIHJldHVybiBzdGF0cy5pc0RpcmVjdG9yeSgpO1xuXG4gIGlmIChvcHRpb25zLmZpbGUpXG4gICAgcmV0dXJuIHN0YXRzLmlzRmlsZSgpO1xuXG4gIGlmIChvcHRpb25zLnBpcGUpXG4gICAgcmV0dXJuIHN0YXRzLmlzRklGTygpO1xuXG4gIGlmIChvcHRpb25zLnNvY2tldClcbiAgICByZXR1cm4gc3RhdHMuaXNTb2NrZXQoKTtcbn0gLy8gdGVzdFxubW9kdWxlLmV4cG9ydHMgPSBfdGVzdDtcbiIsInZhciBjb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbicpO1xudmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcblxuLy9AXG4vL0AgIyMjIGNhdChmaWxlIFssIGZpbGUgLi4uXSlcbi8vQCAjIyMgY2F0KGZpbGVfYXJyYXkpXG4vL0Bcbi8vQCBFeGFtcGxlczpcbi8vQFxuLy9AIGBgYGphdmFzY3JpcHRcbi8vQCB2YXIgc3RyID0gY2F0KCdmaWxlKi50eHQnKTtcbi8vQCB2YXIgc3RyID0gY2F0KCdmaWxlMScsICdmaWxlMicpO1xuLy9AIHZhciBzdHIgPSBjYXQoWydmaWxlMScsICdmaWxlMiddKTsgLy8gc2FtZSBhcyBhYm92ZVxuLy9AIGBgYFxuLy9AXG4vL0AgUmV0dXJucyBhIHN0cmluZyBjb250YWluaW5nIHRoZSBnaXZlbiBmaWxlLCBvciBhIGNvbmNhdGVuYXRlZCBzdHJpbmdcbi8vQCBjb250YWluaW5nIHRoZSBmaWxlcyBpZiBtb3JlIHRoYW4gb25lIGZpbGUgaXMgZ2l2ZW4gKGEgbmV3IGxpbmUgY2hhcmFjdGVyIGlzXG4vL0AgaW50cm9kdWNlZCBiZXR3ZWVuIGVhY2ggZmlsZSkuIFdpbGRjYXJkIGAqYCBhY2NlcHRlZC5cbmZ1bmN0aW9uIF9jYXQob3B0aW9ucywgZmlsZXMpIHtcbiAgdmFyIGNhdCA9ICcnO1xuXG4gIGlmICghZmlsZXMpXG4gICAgY29tbW9uLmVycm9yKCdubyBwYXRocyBnaXZlbicpO1xuXG4gIGlmICh0eXBlb2YgZmlsZXMgPT09ICdzdHJpbmcnKVxuICAgIGZpbGVzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAvLyBpZiBpdCdzIGFycmF5IGxlYXZlIGl0IGFzIGl0IGlzXG5cbiAgZmlsZXMgPSBjb21tb24uZXhwYW5kKGZpbGVzKTtcblxuICBmaWxlcy5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZmlsZSkpXG4gICAgICBjb21tb24uZXJyb3IoJ25vIHN1Y2ggZmlsZSBvciBkaXJlY3Rvcnk6ICcgKyBmaWxlKTtcblxuICAgIGNhdCArPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSwgJ3V0ZjgnKSArICdcXG4nO1xuICB9KTtcblxuICBpZiAoY2F0W2NhdC5sZW5ndGgtMV0gPT09ICdcXG4nKVxuICAgIGNhdCA9IGNhdC5zdWJzdHJpbmcoMCwgY2F0Lmxlbmd0aC0xKTtcblxuICByZXR1cm4gY29tbW9uLlNoZWxsU3RyaW5nKGNhdCk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IF9jYXQ7XG4iLCJ2YXIgY29tbW9uID0gcmVxdWlyZSgnLi9jb21tb24nKTtcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLy9AXG4vL0AgIyMjICdzdHJpbmcnLnRvKGZpbGUpXG4vL0Bcbi8vQCBFeGFtcGxlczpcbi8vQFxuLy9AIGBgYGphdmFzY3JpcHRcbi8vQCBjYXQoJ2lucHV0LnR4dCcpLnRvKCdvdXRwdXQudHh0Jyk7XG4vL0AgYGBgXG4vL0Bcbi8vQCBBbmFsb2dvdXMgdG8gdGhlIHJlZGlyZWN0aW9uIG9wZXJhdG9yIGA+YCBpbiBVbml4LCBidXQgd29ya3Mgd2l0aCBKYXZhU2NyaXB0IHN0cmluZ3MgKHN1Y2ggYXNcbi8vQCB0aG9zZSByZXR1cm5lZCBieSBgY2F0YCwgYGdyZXBgLCBldGMpLiBfTGlrZSBVbml4IHJlZGlyZWN0aW9ucywgYHRvKClgIHdpbGwgb3ZlcndyaXRlIGFueSBleGlzdGluZyBmaWxlIV9cbmZ1bmN0aW9uIF90byhvcHRpb25zLCBmaWxlKSB7XG4gIGlmICghZmlsZSlcbiAgICBjb21tb24uZXJyb3IoJ3dyb25nIGFyZ3VtZW50cycpO1xuXG4gIGlmICghZnMuZXhpc3RzU3luYyggcGF0aC5kaXJuYW1lKGZpbGUpICkpXG4gICAgICBjb21tb24uZXJyb3IoJ25vIHN1Y2ggZmlsZSBvciBkaXJlY3Rvcnk6ICcgKyBwYXRoLmRpcm5hbWUoZmlsZSkpO1xuXG4gIHRyeSB7XG4gICAgZnMud3JpdGVGaWxlU3luYyhmaWxlLCB0aGlzLnRvU3RyaW5nKCksICd1dGY4Jyk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGNvbW1vbi5lcnJvcignY291bGQgbm90IHdyaXRlIHRvIGZpbGUgKGNvZGUgJytlLmNvZGUrJyk6ICcrZmlsZSwgdHJ1ZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gX3RvO1xuIiwidmFyIGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJyk7XG52YXIgZnMgPSByZXF1aXJlKCdmcycpO1xudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbi8vQFxuLy9AICMjIyAnc3RyaW5nJy50b0VuZChmaWxlKVxuLy9AXG4vL0AgRXhhbXBsZXM6XG4vL0Bcbi8vQCBgYGBqYXZhc2NyaXB0XG4vL0AgY2F0KCdpbnB1dC50eHQnKS50b0VuZCgnb3V0cHV0LnR4dCcpO1xuLy9AIGBgYFxuLy9AXG4vL0AgQW5hbG9nb3VzIHRvIHRoZSByZWRpcmVjdC1hbmQtYXBwZW5kIG9wZXJhdG9yIGA+PmAgaW4gVW5peCwgYnV0IHdvcmtzIHdpdGggSmF2YVNjcmlwdCBzdHJpbmdzIChzdWNoIGFzXG4vL0AgdGhvc2UgcmV0dXJuZWQgYnkgYGNhdGAsIGBncmVwYCwgZXRjKS5cbmZ1bmN0aW9uIF90b0VuZChvcHRpb25zLCBmaWxlKSB7XG4gIGlmICghZmlsZSlcbiAgICBjb21tb24uZXJyb3IoJ3dyb25nIGFyZ3VtZW50cycpO1xuXG4gIGlmICghZnMuZXhpc3RzU3luYyggcGF0aC5kaXJuYW1lKGZpbGUpICkpXG4gICAgICBjb21tb24uZXJyb3IoJ25vIHN1Y2ggZmlsZSBvciBkaXJlY3Rvcnk6ICcgKyBwYXRoLmRpcm5hbWUoZmlsZSkpO1xuXG4gIHRyeSB7XG4gICAgZnMuYXBwZW5kRmlsZVN5bmMoZmlsZSwgdGhpcy50b1N0cmluZygpLCAndXRmOCcpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBjb21tb24uZXJyb3IoJ2NvdWxkIG5vdCBhcHBlbmQgdG8gZmlsZSAoY29kZSAnK2UuY29kZSsnKTogJytmaWxlLCB0cnVlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBfdG9FbmQ7XG4iLCJ2YXIgY29tbW9uID0gcmVxdWlyZSgnLi9jb21tb24nKTtcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5cbi8vQFxuLy9AICMjIyBzZWQoW29wdGlvbnMgLF0gc2VhcmNoX3JlZ2V4LCByZXBsYWNlbWVudCwgZmlsZSlcbi8vQCBBdmFpbGFibGUgb3B0aW9uczpcbi8vQFxuLy9AICsgYC1pYDogUmVwbGFjZSBjb250ZW50cyBvZiAnZmlsZScgaW4tcGxhY2UuIF9Ob3RlIHRoYXQgbm8gYmFja3VwcyB3aWxsIGJlIGNyZWF0ZWQhX1xuLy9AXG4vL0AgRXhhbXBsZXM6XG4vL0Bcbi8vQCBgYGBqYXZhc2NyaXB0XG4vL0Agc2VkKCctaScsICdQUk9HUkFNX1ZFUlNJT04nLCAndjAuMS4zJywgJ3NvdXJjZS5qcycpO1xuLy9AIHNlZCgvLipERUxFVEVfVEhJU19MSU5FLipcXG4vLCAnJywgJ3NvdXJjZS5qcycpO1xuLy9AIGBgYFxuLy9AXG4vL0AgUmVhZHMgYW4gaW5wdXQgc3RyaW5nIGZyb20gYGZpbGVgIGFuZCBwZXJmb3JtcyBhIEphdmFTY3JpcHQgYHJlcGxhY2UoKWAgb24gdGhlIGlucHV0XG4vL0AgdXNpbmcgdGhlIGdpdmVuIHNlYXJjaCByZWdleCBhbmQgcmVwbGFjZW1lbnQgc3RyaW5nIG9yIGZ1bmN0aW9uLiBSZXR1cm5zIHRoZSBuZXcgc3RyaW5nIGFmdGVyIHJlcGxhY2VtZW50LlxuZnVuY3Rpb24gX3NlZChvcHRpb25zLCByZWdleCwgcmVwbGFjZW1lbnQsIGZpbGUpIHtcbiAgb3B0aW9ucyA9IGNvbW1vbi5wYXJzZU9wdGlvbnMob3B0aW9ucywge1xuICAgICdpJzogJ2lucGxhY2UnXG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgcmVwbGFjZW1lbnQgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiByZXBsYWNlbWVudCA9PT0gJ2Z1bmN0aW9uJylcbiAgICByZXBsYWNlbWVudCA9IHJlcGxhY2VtZW50OyAvLyBuby1vcFxuICBlbHNlIGlmICh0eXBlb2YgcmVwbGFjZW1lbnQgPT09ICdudW1iZXInKVxuICAgIHJlcGxhY2VtZW50ID0gcmVwbGFjZW1lbnQudG9TdHJpbmcoKTsgLy8gZmFsbGJhY2tcbiAgZWxzZVxuICAgIGNvbW1vbi5lcnJvcignaW52YWxpZCByZXBsYWNlbWVudCBzdHJpbmcnKTtcblxuICBpZiAoIWZpbGUpXG4gICAgY29tbW9uLmVycm9yKCdubyBmaWxlIGdpdmVuJyk7XG5cbiAgaWYgKCFmcy5leGlzdHNTeW5jKGZpbGUpKVxuICAgIGNvbW1vbi5lcnJvcignbm8gc3VjaCBmaWxlIG9yIGRpcmVjdG9yeTogJyArIGZpbGUpO1xuXG4gIHZhciByZXN1bHQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSwgJ3V0ZjgnKS5yZXBsYWNlKHJlZ2V4LCByZXBsYWNlbWVudCk7XG4gIGlmIChvcHRpb25zLmlucGxhY2UpXG4gICAgZnMud3JpdGVGaWxlU3luYyhmaWxlLCByZXN1bHQsICd1dGY4Jyk7XG5cbiAgcmV0dXJuIGNvbW1vbi5TaGVsbFN0cmluZyhyZXN1bHQpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBfc2VkO1xuIiwidmFyIGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJyk7XG52YXIgZnMgPSByZXF1aXJlKCdmcycpO1xuXG4vL0Bcbi8vQCAjIyMgZ3JlcChbb3B0aW9ucyAsXSByZWdleF9maWx0ZXIsIGZpbGUgWywgZmlsZSAuLi5dKVxuLy9AICMjIyBncmVwKFtvcHRpb25zICxdIHJlZ2V4X2ZpbHRlciwgZmlsZV9hcnJheSlcbi8vQCBBdmFpbGFibGUgb3B0aW9uczpcbi8vQFxuLy9AICsgYC12YDogSW52ZXJzZSB0aGUgc2Vuc2Ugb2YgdGhlIHJlZ2V4IGFuZCBwcmludCB0aGUgbGluZXMgbm90IG1hdGNoaW5nIHRoZSBjcml0ZXJpYS5cbi8vQFxuLy9AIEV4YW1wbGVzOlxuLy9AXG4vL0AgYGBgamF2YXNjcmlwdFxuLy9AIGdyZXAoJy12JywgJ0dMT0JBTF9WQVJJQUJMRScsICcqLmpzJyk7XG4vL0AgZ3JlcCgnR0xPQkFMX1ZBUklBQkxFJywgJyouanMnKTtcbi8vQCBgYGBcbi8vQFxuLy9AIFJlYWRzIGlucHV0IHN0cmluZyBmcm9tIGdpdmVuIGZpbGVzIGFuZCByZXR1cm5zIGEgc3RyaW5nIGNvbnRhaW5pbmcgYWxsIGxpbmVzIG9mIHRoZVxuLy9AIGZpbGUgdGhhdCBtYXRjaCB0aGUgZ2l2ZW4gYHJlZ2V4X2ZpbHRlcmAuIFdpbGRjYXJkIGAqYCBhY2NlcHRlZC5cbmZ1bmN0aW9uIF9ncmVwKG9wdGlvbnMsIHJlZ2V4LCBmaWxlcykge1xuICBvcHRpb25zID0gY29tbW9uLnBhcnNlT3B0aW9ucyhvcHRpb25zLCB7XG4gICAgJ3YnOiAnaW52ZXJzZSdcbiAgfSk7XG5cbiAgaWYgKCFmaWxlcylcbiAgICBjb21tb24uZXJyb3IoJ25vIHBhdGhzIGdpdmVuJyk7XG5cbiAgaWYgKHR5cGVvZiBmaWxlcyA9PT0gJ3N0cmluZycpXG4gICAgZmlsZXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gIC8vIGlmIGl0J3MgYXJyYXkgbGVhdmUgaXQgYXMgaXQgaXNcblxuICBmaWxlcyA9IGNvbW1vbi5leHBhbmQoZmlsZXMpO1xuXG4gIHZhciBncmVwID0gJyc7XG4gIGZpbGVzLmZvckVhY2goZnVuY3Rpb24oZmlsZSkge1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhmaWxlKSkge1xuICAgICAgY29tbW9uLmVycm9yKCdubyBzdWNoIGZpbGUgb3IgZGlyZWN0b3J5OiAnICsgZmlsZSwgdHJ1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKGZpbGUsICd1dGY4JyksXG4gICAgICAgIGxpbmVzID0gY29udGVudHMuc3BsaXQoL1xccipcXG4vKTtcbiAgICBsaW5lcy5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBtYXRjaGVkID0gbGluZS5tYXRjaChyZWdleCk7XG4gICAgICBpZiAoKG9wdGlvbnMuaW52ZXJzZSAmJiAhbWF0Y2hlZCkgfHwgKCFvcHRpb25zLmludmVyc2UgJiYgbWF0Y2hlZCkpXG4gICAgICAgIGdyZXAgKz0gbGluZSArICdcXG4nO1xuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gY29tbW9uLlNoZWxsU3RyaW5nKGdyZXApO1xufVxubW9kdWxlLmV4cG9ydHMgPSBfZ3JlcDtcbiIsInZhciBjb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbicpO1xudmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4vLyBDcm9zcy1wbGF0Zm9ybSBtZXRob2QgZm9yIHNwbGl0dGluZyBlbnZpcm9ubWVudCBQQVRIIHZhcmlhYmxlc1xuZnVuY3Rpb24gc3BsaXRQYXRoKHApIHtcbiAgZm9yIChpPTE7aTwyO2krKykge31cblxuICBpZiAoIXApXG4gICAgcmV0dXJuIFtdO1xuXG4gIGlmIChjb21tb24ucGxhdGZvcm0gPT09ICd3aW4nKVxuICAgIHJldHVybiBwLnNwbGl0KCc7Jyk7XG4gIGVsc2VcbiAgICByZXR1cm4gcC5zcGxpdCgnOicpO1xufVxuXG5mdW5jdGlvbiBjaGVja1BhdGgocGF0aCkge1xuICByZXR1cm4gZnMuZXhpc3RzU3luYyhwYXRoKSAmJiBmcy5zdGF0U3luYyhwYXRoKS5pc0RpcmVjdG9yeSgpID09IGZhbHNlO1xufVxuXG4vL0Bcbi8vQCAjIyMgd2hpY2goY29tbWFuZClcbi8vQFxuLy9AIEV4YW1wbGVzOlxuLy9AXG4vL0AgYGBgamF2YXNjcmlwdFxuLy9AIHZhciBub2RlRXhlYyA9IHdoaWNoKCdub2RlJyk7XG4vL0AgYGBgXG4vL0Bcbi8vQCBTZWFyY2hlcyBmb3IgYGNvbW1hbmRgIGluIHRoZSBzeXN0ZW0ncyBQQVRILiBPbiBXaW5kb3dzIGxvb2tzIGZvciBgLmV4ZWAsIGAuY21kYCwgYW5kIGAuYmF0YCBleHRlbnNpb25zLlxuLy9AIFJldHVybnMgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGFic29sdXRlIHBhdGggdG8gdGhlIGNvbW1hbmQuXG5mdW5jdGlvbiBfd2hpY2gob3B0aW9ucywgY21kKSB7XG4gIGlmICghY21kKVxuICAgIGNvbW1vbi5lcnJvcignbXVzdCBzcGVjaWZ5IGNvbW1hbmQnKTtcblxuICB2YXIgcGF0aEVudiA9IHByb2Nlc3MuZW52LnBhdGggfHwgcHJvY2Vzcy5lbnYuUGF0aCB8fCBwcm9jZXNzLmVudi5QQVRILFxuICAgICAgcGF0aEFycmF5ID0gc3BsaXRQYXRoKHBhdGhFbnYpLFxuICAgICAgd2hlcmUgPSBudWxsO1xuXG4gIC8vIE5vIHJlbGF0aXZlL2Fic29sdXRlIHBhdGhzIHByb3ZpZGVkP1xuICBpZiAoY21kLnNlYXJjaCgvXFwvLykgPT09IC0xKSB7XG4gICAgLy8gU2VhcmNoIGZvciBjb21tYW5kIGluIFBBVEhcbiAgICBwYXRoQXJyYXkuZm9yRWFjaChmdW5jdGlvbihkaXIpIHtcbiAgICAgIGlmICh3aGVyZSlcbiAgICAgICAgcmV0dXJuOyAvLyBhbHJlYWR5IGZvdW5kIGl0XG5cbiAgICAgIHZhciBhdHRlbXB0ID0gcGF0aC5yZXNvbHZlKGRpciArICcvJyArIGNtZCk7XG4gICAgICBpZiAoY2hlY2tQYXRoKGF0dGVtcHQpKSB7XG4gICAgICAgIHdoZXJlID0gYXR0ZW1wdDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29tbW9uLnBsYXRmb3JtID09PSAnd2luJykge1xuICAgICAgICB2YXIgYmFzZUF0dGVtcHQgPSBhdHRlbXB0O1xuICAgICAgICBhdHRlbXB0ID0gYmFzZUF0dGVtcHQgKyAnLmV4ZSc7XG4gICAgICAgIGlmIChjaGVja1BhdGgoYXR0ZW1wdCkpIHtcbiAgICAgICAgICB3aGVyZSA9IGF0dGVtcHQ7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGF0dGVtcHQgPSBiYXNlQXR0ZW1wdCArICcuY21kJztcbiAgICAgICAgaWYgKGNoZWNrUGF0aChhdHRlbXB0KSkge1xuICAgICAgICAgIHdoZXJlID0gYXR0ZW1wdDtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYXR0ZW1wdCA9IGJhc2VBdHRlbXB0ICsgJy5iYXQnO1xuICAgICAgICBpZiAoY2hlY2tQYXRoKGF0dGVtcHQpKSB7XG4gICAgICAgICAgd2hlcmUgPSBhdHRlbXB0O1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSAvLyBpZiAnd2luJ1xuICAgIH0pO1xuICB9XG5cbiAgLy8gQ29tbWFuZCBub3QgZm91bmQgYW55d2hlcmU/XG4gIGlmICghY2hlY2tQYXRoKGNtZCkgJiYgIXdoZXJlKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHdoZXJlID0gd2hlcmUgfHwgcGF0aC5yZXNvbHZlKGNtZCk7XG5cbiAgcmV0dXJuIGNvbW1vbi5TaGVsbFN0cmluZyh3aGVyZSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IF93aGljaDtcbiIsInZhciBjb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbicpO1xuXG4vL0Bcbi8vQCAjIyMgZWNobyhzdHJpbmcgWyxzdHJpbmcgLi4uXSlcbi8vQFxuLy9AIEV4YW1wbGVzOlxuLy9AXG4vL0AgYGBgamF2YXNjcmlwdFxuLy9AIGVjaG8oJ2hlbGxvIHdvcmxkJyk7XG4vL0AgdmFyIHN0ciA9IGVjaG8oJ2hlbGxvIHdvcmxkJyk7XG4vL0AgYGBgXG4vL0Bcbi8vQCBQcmludHMgc3RyaW5nIHRvIHN0ZG91dCwgYW5kIHJldHVybnMgc3RyaW5nIHdpdGggYWRkaXRpb25hbCB1dGlsaXR5IG1ldGhvZHNcbi8vQCBsaWtlIGAudG8oKWAuXG5mdW5jdGlvbiBfZWNobygpIHtcbiAgdmFyIG1lc3NhZ2VzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICBjb25zb2xlLmxvZy5hcHBseSh0aGlzLCBtZXNzYWdlcyk7XG4gIHJldHVybiBjb21tb24uU2hlbGxTdHJpbmcobWVzc2FnZXMuam9pbignICcpKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gX2VjaG87XG4iLCJ2YXIgZnMgPSByZXF1aXJlKCdmcycpO1xudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG52YXIgY29tbW9uID0gcmVxdWlyZSgnLi9jb21tb24nKTtcbnZhciBvcyA9IHJlcXVpcmUoJ29zJyk7XG5cbi8vQFxuLy9AICMjIyBsbihvcHRpb25zLCBzb3VyY2UsIGRlc3QpXG4vL0AgIyMjIGxuKHNvdXJjZSwgZGVzdClcbi8vQCBBdmFpbGFibGUgb3B0aW9uczpcbi8vQFxuLy9AICsgYHNgOiBzeW1saW5rXG4vL0AgKyBgZmA6IGZvcmNlXG4vL0Bcbi8vQCBFeGFtcGxlczpcbi8vQFxuLy9AIGBgYGphdmFzY3JpcHRcbi8vQCBsbignZmlsZScsICduZXdsaW5rJyk7XG4vL0AgbG4oJy1zZicsICdmaWxlJywgJ2V4aXN0aW5nJyk7XG4vL0AgYGBgXG4vL0Bcbi8vQCBMaW5rcyBzb3VyY2UgdG8gZGVzdC4gVXNlIC1mIHRvIGZvcmNlIHRoZSBsaW5rLCBzaG91bGQgZGVzdCBhbHJlYWR5IGV4aXN0LlxuZnVuY3Rpb24gX2xuKG9wdGlvbnMsIHNvdXJjZSwgZGVzdCkge1xuICBvcHRpb25zID0gY29tbW9uLnBhcnNlT3B0aW9ucyhvcHRpb25zLCB7XG4gICAgJ3MnOiAnc3ltbGluaycsXG4gICAgJ2YnOiAnZm9yY2UnXG4gIH0pO1xuXG4gIGlmICghc291cmNlIHx8ICFkZXN0KSB7XG4gICAgY29tbW9uLmVycm9yKCdNaXNzaW5nIDxzb3VyY2U+IGFuZC9vciA8ZGVzdD4nKTtcbiAgfVxuXG4gIHNvdXJjZSA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBTdHJpbmcoc291cmNlKSk7XG4gIGRlc3QgPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgU3RyaW5nKGRlc3QpKTtcblxuICBpZiAoIWZzLmV4aXN0c1N5bmMoc291cmNlKSkge1xuICAgIGNvbW1vbi5lcnJvcignU291cmNlIGZpbGUgZG9lcyBub3QgZXhpc3QnLCB0cnVlKTtcbiAgfVxuXG4gIGlmIChmcy5leGlzdHNTeW5jKGRlc3QpKSB7XG4gICAgaWYgKCFvcHRpb25zLmZvcmNlKSB7XG4gICAgICBjb21tb24uZXJyb3IoJ0Rlc3RpbmF0aW9uIGZpbGUgZXhpc3RzJywgdHJ1ZSk7XG4gICAgfVxuXG4gICAgZnMudW5saW5rU3luYyhkZXN0KTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLnN5bWxpbmspIHtcbiAgICBmcy5zeW1saW5rU3luYyhzb3VyY2UsIGRlc3QsIG9zLnBsYXRmb3JtKCkgPT09IFwid2luMzJcIiA/IFwianVuY3Rpb25cIiA6IG51bGwpO1xuICB9IGVsc2Uge1xuICAgIGZzLmxpbmtTeW5jKHNvdXJjZSwgZGVzdCwgb3MucGxhdGZvcm0oKSA9PT0gXCJ3aW4zMlwiID8gXCJqdW5jdGlvblwiIDogbnVsbCk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gX2xuO1xuIiwidmFyIGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJyk7XG52YXIgX3RlbXBEaXIgPSByZXF1aXJlKCcuL3RlbXBkaXInKTtcbnZhciBfcHdkID0gcmVxdWlyZSgnLi9wd2QnKTtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcbnZhciBjaGlsZCA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcblxuLy8gSGFjayB0byBydW4gY2hpbGRfcHJvY2Vzcy5leGVjKCkgc3luY2hyb25vdXNseSAoc3luYyBhdm9pZHMgY2FsbGJhY2sgaGVsbClcbi8vIFVzZXMgYSBjdXN0b20gd2FpdCBsb29wIHRoYXQgY2hlY2tzIGZvciBhIGZsYWcgZmlsZSwgY3JlYXRlZCB3aGVuIHRoZSBjaGlsZCBwcm9jZXNzIGlzIGRvbmUuXG4vLyAoQ2FuJ3QgZG8gYSB3YWl0IGxvb3AgdGhhdCBjaGVja3MgZm9yIGludGVybmFsIE5vZGUgdmFyaWFibGVzL21lc3NhZ2VzIGFzXG4vLyBOb2RlIGlzIHNpbmdsZS10aHJlYWRlZDsgY2FsbGJhY2tzIGFuZCBvdGhlciBpbnRlcm5hbCBzdGF0ZSBjaGFuZ2VzIGFyZSBkb25lIGluIHRoZVxuLy8gZXZlbnQgbG9vcCkuXG5mdW5jdGlvbiBleGVjU3luYyhjbWQsIG9wdHMpIHtcbiAgdmFyIHRlbXBEaXIgPSBfdGVtcERpcigpO1xuICB2YXIgc3Rkb3V0RmlsZSA9IHBhdGgucmVzb2x2ZSh0ZW1wRGlyKycvJytjb21tb24ucmFuZG9tRmlsZU5hbWUoKSksXG4gICAgICBjb2RlRmlsZSA9IHBhdGgucmVzb2x2ZSh0ZW1wRGlyKycvJytjb21tb24ucmFuZG9tRmlsZU5hbWUoKSksXG4gICAgICBzY3JpcHRGaWxlID0gcGF0aC5yZXNvbHZlKHRlbXBEaXIrJy8nK2NvbW1vbi5yYW5kb21GaWxlTmFtZSgpKSxcbiAgICAgIHNsZWVwRmlsZSA9IHBhdGgucmVzb2x2ZSh0ZW1wRGlyKycvJytjb21tb24ucmFuZG9tRmlsZU5hbWUoKSk7XG5cbiAgdmFyIG9wdGlvbnMgPSBjb21tb24uZXh0ZW5kKHtcbiAgICBzaWxlbnQ6IGNvbW1vbi5jb25maWcuc2lsZW50XG4gIH0sIG9wdHMpO1xuXG4gIHZhciBwcmV2aW91c1N0ZG91dENvbnRlbnQgPSAnJztcbiAgLy8gRWNob2VzIHN0ZG91dCBjaGFuZ2VzIGZyb20gcnVubmluZyBwcm9jZXNzLCBpZiBub3Qgc2lsZW50XG4gIGZ1bmN0aW9uIHVwZGF0ZVN0ZG91dCgpIHtcbiAgICBpZiAob3B0aW9ucy5zaWxlbnQgfHwgIWZzLmV4aXN0c1N5bmMoc3Rkb3V0RmlsZSkpXG4gICAgICByZXR1cm47XG5cbiAgICB2YXIgc3Rkb3V0Q29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhzdGRvdXRGaWxlLCAndXRmOCcpO1xuICAgIC8vIE5vIGNoYW5nZXMgc2luY2UgbGFzdCB0aW1lP1xuICAgIGlmIChzdGRvdXRDb250ZW50Lmxlbmd0aCA8PSBwcmV2aW91c1N0ZG91dENvbnRlbnQubGVuZ3RoKVxuICAgICAgcmV0dXJuO1xuXG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoc3Rkb3V0Q29udGVudC5zdWJzdHIocHJldmlvdXNTdGRvdXRDb250ZW50Lmxlbmd0aCkpO1xuICAgIHByZXZpb3VzU3Rkb3V0Q29udGVudCA9IHN0ZG91dENvbnRlbnQ7XG4gIH1cblxuICBmdW5jdGlvbiBlc2NhcGUoc3RyKSB7XG4gICAgcmV0dXJuIChzdHIrJycpLnJlcGxhY2UoLyhbXFxcXFwiJ10pL2csIFwiXFxcXCQxXCIpLnJlcGxhY2UoL1xcMC9nLCBcIlxcXFwwXCIpO1xuICB9XG5cbiAgY21kICs9ICcgPiAnK3N0ZG91dEZpbGUrJyAyPiYxJzsgLy8gd29ya3Mgb24gYm90aCB3aW4vdW5peFxuXG4gIHZhciBzY3JpcHQgPVxuICAgXCJ2YXIgY2hpbGQgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyksXCIgK1xuICAgXCIgICAgIGZzID0gcmVxdWlyZSgnZnMnKTtcIiArXG4gICBcImNoaWxkLmV4ZWMoJ1wiK2VzY2FwZShjbWQpK1wiJywge2VudjogcHJvY2Vzcy5lbnYsIG1heEJ1ZmZlcjogMjAqMTAyNCoxMDI0fSwgZnVuY3Rpb24oZXJyKSB7XCIgK1xuICAgXCIgIGZzLndyaXRlRmlsZVN5bmMoJ1wiK2VzY2FwZShjb2RlRmlsZSkrXCInLCBlcnIgPyBlcnIuY29kZS50b1N0cmluZygpIDogJzAnKTtcIiArXG4gICBcIn0pO1wiO1xuXG4gIGlmIChmcy5leGlzdHNTeW5jKHNjcmlwdEZpbGUpKSBjb21tb24udW5saW5rU3luYyhzY3JpcHRGaWxlKTtcbiAgaWYgKGZzLmV4aXN0c1N5bmMoc3Rkb3V0RmlsZSkpIGNvbW1vbi51bmxpbmtTeW5jKHN0ZG91dEZpbGUpO1xuICBpZiAoZnMuZXhpc3RzU3luYyhjb2RlRmlsZSkpIGNvbW1vbi51bmxpbmtTeW5jKGNvZGVGaWxlKTtcblxuICBmcy53cml0ZUZpbGVTeW5jKHNjcmlwdEZpbGUsIHNjcmlwdCk7XG4gIGNoaWxkLmV4ZWMoJ1wiJytwcm9jZXNzLmV4ZWNQYXRoKydcIiAnK3NjcmlwdEZpbGUsIHtcbiAgICBlbnY6IHByb2Nlc3MuZW52LFxuICAgIGN3ZDogX3B3ZCgpLFxuICAgIG1heEJ1ZmZlcjogMjAqMTAyNCoxMDI0XG4gIH0pO1xuXG4gIC8vIFRoZSB3YWl0IGxvb3BcbiAgLy8gc2xlZXBGaWxlIGlzIHVzZWQgYXMgYSBkdW1teSBJL08gb3AgdG8gbWl0aWdhdGUgdW5uZWNlc3NhcnkgQ1BVIHVzYWdlXG4gIC8vICh0cmllZCBtYW55IEkvTyBzeW5jIG9wcywgd3JpdGVGaWxlU3luYygpIHNlZW1zIHRvIGJlIG9ubHkgb25lIHRoYXQgaXMgZWZmZWN0aXZlIGluIHJlZHVjaW5nXG4gIC8vIENQVSB1c2FnZSwgdGhvdWdoIGFwcGFyZW50bHkgbm90IHNvIG11Y2ggb24gV2luZG93cylcbiAgd2hpbGUgKCFmcy5leGlzdHNTeW5jKGNvZGVGaWxlKSkgeyB1cGRhdGVTdGRvdXQoKTsgZnMud3JpdGVGaWxlU3luYyhzbGVlcEZpbGUsICdhJyk7IH1cbiAgd2hpbGUgKCFmcy5leGlzdHNTeW5jKHN0ZG91dEZpbGUpKSB7IHVwZGF0ZVN0ZG91dCgpOyBmcy53cml0ZUZpbGVTeW5jKHNsZWVwRmlsZSwgJ2EnKTsgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQgY29kZUZpbGUgZXhpc3RzLCBidXQgaXQncyBub3QgbmVjZXNzYXJpbHkgZmx1c2hlZCB5ZXQuXG4gIC8vIEtlZXAgcmVhZGluZyBpdCB1bnRpbCBpdCBpcy5cbiAgdmFyIGNvZGUgPSBwYXJzZUludCgnJywgMTApO1xuICB3aGlsZSAoaXNOYU4oY29kZSkpIHtcbiAgICBjb2RlID0gcGFyc2VJbnQoZnMucmVhZEZpbGVTeW5jKGNvZGVGaWxlLCAndXRmOCcpLCAxMCk7XG4gIH1cblxuICB2YXIgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKHN0ZG91dEZpbGUsICd1dGY4Jyk7XG5cbiAgLy8gTm8gYmlnZ2llIGlmIHdlIGNhbid0IGVyYXNlIHRoZSBmaWxlcyBub3cgLS0gdGhleSdyZSBpbiBhIHRlbXAgZGlyIGFueXdheVxuICB0cnkgeyBjb21tb24udW5saW5rU3luYyhzY3JpcHRGaWxlKTsgfSBjYXRjaChlKSB7fVxuICB0cnkgeyBjb21tb24udW5saW5rU3luYyhzdGRvdXRGaWxlKTsgfSBjYXRjaChlKSB7fVxuICB0cnkgeyBjb21tb24udW5saW5rU3luYyhjb2RlRmlsZSk7IH0gY2F0Y2goZSkge31cbiAgdHJ5IHsgY29tbW9uLnVubGlua1N5bmMoc2xlZXBGaWxlKTsgfSBjYXRjaChlKSB7fVxuXG4gIC8vIHNvbWUgc2hlbGwgcmV0dXJuIGNvZGVzIGFyZSBkZWZpbmVkIGFzIGVycm9ycywgcGVyIGh0dHA6Ly90bGRwLm9yZy9MRFAvYWJzL2h0bWwvZXhpdGNvZGVzLmh0bWxcbiAgaWYgKGNvZGUgPT09IDEgfHwgY29kZSA9PT0gMiB8fCBjb2RlID49IDEyNikgIHtcbiAgICAgIGNvbW1vbi5lcnJvcignJywgdHJ1ZSk7IC8vIHVuaXgvc2hlbGwgZG9lc24ndCByZWFsbHkgZ2l2ZSBhbiBlcnJvciBtZXNzYWdlIGFmdGVyIG5vbi16ZXJvIGV4aXQgY29kZXNcbiAgfVxuICAvLyBUcnVlIGlmIHN1Y2Nlc3NmdWwsIGZhbHNlIGlmIG5vdFxuICB2YXIgb2JqID0ge1xuICAgIGNvZGU6IGNvZGUsXG4gICAgb3V0cHV0OiBzdGRvdXRcbiAgfTtcbiAgcmV0dXJuIG9iajtcbn0gLy8gZXhlY1N5bmMoKVxuXG4vLyBXcmFwcGVyIGFyb3VuZCBleGVjKCkgdG8gZW5hYmxlIGVjaG9pbmcgb3V0cHV0IHRvIGNvbnNvbGUgaW4gcmVhbCB0aW1lXG5mdW5jdGlvbiBleGVjQXN5bmMoY21kLCBvcHRzLCBjYWxsYmFjaykge1xuICB2YXIgb3V0cHV0ID0gJyc7XG5cbiAgdmFyIG9wdGlvbnMgPSBjb21tb24uZXh0ZW5kKHtcbiAgICBzaWxlbnQ6IGNvbW1vbi5jb25maWcuc2lsZW50XG4gIH0sIG9wdHMpO1xuXG4gIHZhciBjID0gY2hpbGQuZXhlYyhjbWQsIHtlbnY6IHByb2Nlc3MuZW52LCBtYXhCdWZmZXI6IDIwKjEwMjQqMTAyNH0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChjYWxsYmFjaylcbiAgICAgIGNhbGxiYWNrKGVyciA/IGVyci5jb2RlIDogMCwgb3V0cHV0KTtcbiAgfSk7XG5cbiAgYy5zdGRvdXQub24oJ2RhdGEnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgb3V0cHV0ICs9IGRhdGE7XG4gICAgaWYgKCFvcHRpb25zLnNpbGVudClcbiAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGRhdGEpO1xuICB9KTtcblxuICBjLnN0ZGVyci5vbignZGF0YScsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBvdXRwdXQgKz0gZGF0YTtcbiAgICBpZiAoIW9wdGlvbnMuc2lsZW50KVxuICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoZGF0YSk7XG4gIH0pO1xuXG4gIHJldHVybiBjO1xufVxuXG4vL0Bcbi8vQCAjIyMgZXhlYyhjb21tYW5kIFssIG9wdGlvbnNdIFssIGNhbGxiYWNrXSlcbi8vQCBBdmFpbGFibGUgb3B0aW9ucyAoYWxsIGBmYWxzZWAgYnkgZGVmYXVsdCk6XG4vL0Bcbi8vQCArIGBhc3luY2A6IEFzeW5jaHJvbm91cyBleGVjdXRpb24uIERlZmF1bHRzIHRvIHRydWUgaWYgYSBjYWxsYmFjayBpcyBwcm92aWRlZC5cbi8vQCArIGBzaWxlbnRgOiBEbyBub3QgZWNobyBwcm9ncmFtIG91dHB1dCB0byBjb25zb2xlLlxuLy9AXG4vL0AgRXhhbXBsZXM6XG4vL0Bcbi8vQCBgYGBqYXZhc2NyaXB0XG4vL0AgdmFyIHZlcnNpb24gPSBleGVjKCdub2RlIC0tdmVyc2lvbicsIHtzaWxlbnQ6dHJ1ZX0pLm91dHB1dDtcbi8vQFxuLy9AIHZhciBjaGlsZCA9IGV4ZWMoJ3NvbWVfbG9uZ19ydW5uaW5nX3Byb2Nlc3MnLCB7YXN5bmM6dHJ1ZX0pO1xuLy9AIGNoaWxkLnN0ZG91dC5vbignZGF0YScsIGZ1bmN0aW9uKGRhdGEpIHtcbi8vQCAgIC8qIC4uLiBkbyBzb21ldGhpbmcgd2l0aCBkYXRhIC4uLiAqL1xuLy9AIH0pO1xuLy9AXG4vL0AgZXhlYygnc29tZV9sb25nX3J1bm5pbmdfcHJvY2VzcycsIGZ1bmN0aW9uKGNvZGUsIG91dHB1dCkge1xuLy9AICAgY29uc29sZS5sb2coJ0V4aXQgY29kZTonLCBjb2RlKTtcbi8vQCAgIGNvbnNvbGUubG9nKCdQcm9ncmFtIG91dHB1dDonLCBvdXRwdXQpO1xuLy9AIH0pO1xuLy9AIGBgYFxuLy9AXG4vL0AgRXhlY3V0ZXMgdGhlIGdpdmVuIGBjb21tYW5kYCBfc3luY2hyb25vdXNseV8sIHVubGVzcyBvdGhlcndpc2Ugc3BlY2lmaWVkLlxuLy9AIFdoZW4gaW4gc3luY2hyb25vdXMgbW9kZSByZXR1cm5zIHRoZSBvYmplY3QgYHsgY29kZTouLi4sIG91dHB1dDouLi4gfWAsIGNvbnRhaW5pbmcgdGhlIHByb2dyYW0nc1xuLy9AIGBvdXRwdXRgIChzdGRvdXQgKyBzdGRlcnIpICBhbmQgaXRzIGV4aXQgYGNvZGVgLiBPdGhlcndpc2UgcmV0dXJucyB0aGUgY2hpbGQgcHJvY2VzcyBvYmplY3QsIGFuZFxuLy9AIHRoZSBgY2FsbGJhY2tgIGdldHMgdGhlIGFyZ3VtZW50cyBgKGNvZGUsIG91dHB1dClgLlxuLy9AXG4vL0AgKipOb3RlOioqIEZvciBsb25nLWxpdmVkIHByb2Nlc3NlcywgaXQncyBiZXN0IHRvIHJ1biBgZXhlYygpYCBhc3luY2hyb25vdXNseSBhc1xuLy9AIHRoZSBjdXJyZW50IHN5bmNocm9ub3VzIGltcGxlbWVudGF0aW9uIHVzZXMgYSBsb3Qgb2YgQ1BVLiBUaGlzIHNob3VsZCBiZSBnZXR0aW5nXG4vL0AgZml4ZWQgc29vbi5cbmZ1bmN0aW9uIF9leGVjKGNvbW1hbmQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIGlmICghY29tbWFuZClcbiAgICBjb21tb24uZXJyb3IoJ211c3Qgc3BlY2lmeSBjb21tYW5kJyk7XG5cbiAgLy8gQ2FsbGJhY2sgaXMgZGVmaW5lZCBpbnN0ZWFkIG9mIG9wdGlvbnMuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICBvcHRpb25zID0geyBhc3luYzogdHJ1ZSB9O1xuICB9XG5cbiAgLy8gQ2FsbGJhY2sgaXMgZGVmaW5lZCB3aXRoIG9wdGlvbnMuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgb3B0aW9ucy5hc3luYyA9IHRydWU7XG4gIH1cblxuICBvcHRpb25zID0gY29tbW9uLmV4dGVuZCh7XG4gICAgc2lsZW50OiBjb21tb24uY29uZmlnLnNpbGVudCxcbiAgICBhc3luYzogZmFsc2VcbiAgfSwgb3B0aW9ucyk7XG5cbiAgaWYgKG9wdGlvbnMuYXN5bmMpXG4gICAgcmV0dXJuIGV4ZWNBc3luYyhjb21tYW5kLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gIGVsc2VcbiAgICByZXR1cm4gZXhlY1N5bmMoY29tbWFuZCwgb3B0aW9ucyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IF9leGVjO1xuIiwidmFyIGNvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uJyk7XG52YXIgZnMgPSByZXF1aXJlKCdmcycpO1xudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbnZhciBQRVJNUyA9IChmdW5jdGlvbiAoYmFzZSkge1xuICByZXR1cm4ge1xuICAgIE9USEVSX0VYRUMgIDogYmFzZS5FWEVDLFxuICAgIE9USEVSX1dSSVRFIDogYmFzZS5XUklURSxcbiAgICBPVEhFUl9SRUFEICA6IGJhc2UuUkVBRCxcblxuICAgIEdST1VQX0VYRUMgIDogYmFzZS5FWEVDICA8PCAzLFxuICAgIEdST1VQX1dSSVRFIDogYmFzZS5XUklURSA8PCAzLFxuICAgIEdST1VQX1JFQUQgIDogYmFzZS5SRUFEIDw8IDMsXG5cbiAgICBPV05FUl9FWEVDICA6IGJhc2UuRVhFQyA8PCA2LFxuICAgIE9XTkVSX1dSSVRFIDogYmFzZS5XUklURSA8PCA2LFxuICAgIE9XTkVSX1JFQUQgIDogYmFzZS5SRUFEIDw8IDYsXG5cbiAgICAvLyBMaXRlcmFsIG9jdGFsIG51bWJlcnMgYXJlIGFwcGFyZW50bHkgbm90IGFsbG93ZWQgaW4gXCJzdHJpY3RcIiBqYXZhc2NyaXB0LiAgVXNpbmcgcGFyc2VJbnQgaXNcbiAgICAvLyB0aGUgcHJlZmVycmVkIHdheSwgZWxzZSBhIGpzaGludCB3YXJuaW5nIGlzIHRocm93bi5cbiAgICBTVElDS1kgICAgICA6IHBhcnNlSW50KCcwMTAwMCcsIDgpLFxuICAgIFNFVEdJRCAgICAgIDogcGFyc2VJbnQoJzAyMDAwJywgOCksXG4gICAgU0VUVUlEICAgICAgOiBwYXJzZUludCgnMDQwMDAnLCA4KSxcblxuICAgIFRZUEVfTUFTSyAgIDogcGFyc2VJbnQoJzA3NzAwMDAnLCA4KVxuICB9O1xufSkoe1xuICBFWEVDICA6IDEsXG4gIFdSSVRFIDogMixcbiAgUkVBRCAgOiA0XG59KTtcblxuLy9AXG4vL0AgIyMjIGNobW9kKG9jdGFsX21vZGUgfHwgb2N0YWxfc3RyaW5nLCBmaWxlKVxuLy9AICMjIyBjaG1vZChzeW1ib2xpY19tb2RlLCBmaWxlKVxuLy9AXG4vL0AgQXZhaWxhYmxlIG9wdGlvbnM6XG4vL0Bcbi8vQCArIGAtdmA6IG91dHB1dCBhIGRpYWdub3N0aWMgZm9yIGV2ZXJ5IGZpbGUgcHJvY2Vzc2VkLy9AXG4vL0AgKyBgLWNgOiBsaWtlIHZlcmJvc2UgYnV0IHJlcG9ydCBvbmx5IHdoZW4gYSBjaGFuZ2UgaXMgbWFkZS8vQFxuLy9AICsgYC1SYDogY2hhbmdlIGZpbGVzIGFuZCBkaXJlY3RvcmllcyByZWN1cnNpdmVseS8vQFxuLy9AXG4vL0AgRXhhbXBsZXM6XG4vL0Bcbi8vQCBgYGBqYXZhc2NyaXB0XG4vL0AgY2htb2QoNzU1LCAnL1VzZXJzL2JyYW5kb24nKTtcbi8vQCBjaG1vZCgnNzU1JywgJy9Vc2Vycy9icmFuZG9uJyk7IC8vIHNhbWUgYXMgYWJvdmVcbi8vQCBjaG1vZCgndSt4JywgJy9Vc2Vycy9icmFuZG9uJyk7XG4vL0AgYGBgXG4vL0Bcbi8vQCBBbHRlcnMgdGhlIHBlcm1pc3Npb25zIG9mIGEgZmlsZSBvciBkaXJlY3RvcnkgYnkgZWl0aGVyIHNwZWNpZnlpbmcgdGhlXG4vL0AgYWJzb2x1dGUgcGVybWlzc2lvbnMgaW4gb2N0YWwgZm9ybSBvciBleHByZXNzaW5nIHRoZSBjaGFuZ2VzIGluIHN5bWJvbHMuXG4vL0AgVGhpcyBjb21tYW5kIHRyaWVzIHRvIG1pbWljIHRoZSBQT1NJWCBiZWhhdmlvciBhcyBtdWNoIGFzIHBvc3NpYmxlLlxuLy9AIE5vdGFibGUgZXhjZXB0aW9uczpcbi8vQFxuLy9AICsgSW4gc3ltYm9saWMgbW9kZXMsICdhLXInIGFuZCAnLXInIGFyZSBpZGVudGljYWwuICBObyBjb25zaWRlcmF0aW9uIGlzXG4vL0AgICBnaXZlbiB0byB0aGUgdW1hc2suXG4vL0AgKyBUaGVyZSBpcyBubyBcInF1aWV0XCIgb3B0aW9uIHNpbmNlIGRlZmF1bHQgYmVoYXZpb3IgaXMgdG8gcnVuIHNpbGVudC5cbmZ1bmN0aW9uIF9jaG1vZChvcHRpb25zLCBtb2RlLCBmaWxlUGF0dGVybikge1xuICBpZiAoIWZpbGVQYXR0ZXJuKSB7XG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoID4gMCAmJiBvcHRpb25zLmNoYXJBdCgwKSA9PT0gJy0nKSB7XG4gICAgICAvLyBTcGVjaWFsIGNhc2Ugd2hlcmUgdGhlIHNwZWNpZmllZCBmaWxlIHBlcm1pc3Npb25zIHN0YXJ0ZWQgd2l0aCAtIHRvIHN1YnRyYWN0IHBlcm1zLCB3aGljaFxuICAgICAgLy8gZ2V0IHBpY2tlZCB1cCBieSB0aGUgb3B0aW9uIHBhcnNlciBhcyBjb21tYW5kIGZsYWdzLlxuICAgICAgLy8gSWYgd2UgYXJlIGRvd24gYnkgb25lIGFyZ3VtZW50IGFuZCBvcHRpb25zIHN0YXJ0cyB3aXRoIC0sIHNoaWZ0IGV2ZXJ5dGhpbmcgb3Zlci5cbiAgICAgIGZpbGVQYXR0ZXJuID0gbW9kZTtcbiAgICAgIG1vZGUgPSBvcHRpb25zO1xuICAgICAgb3B0aW9ucyA9ICcnO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbW1vbi5lcnJvcignWW91IG11c3Qgc3BlY2lmeSBhIGZpbGUuJyk7XG4gICAgfVxuICB9XG5cbiAgb3B0aW9ucyA9IGNvbW1vbi5wYXJzZU9wdGlvbnMob3B0aW9ucywge1xuICAgICdSJzogJ3JlY3Vyc2l2ZScsXG4gICAgJ2MnOiAnY2hhbmdlcycsXG4gICAgJ3YnOiAndmVyYm9zZSdcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBmaWxlUGF0dGVybiA9PT0gJ3N0cmluZycpIHtcbiAgICBmaWxlUGF0dGVybiA9IFsgZmlsZVBhdHRlcm4gXTtcbiAgfVxuXG4gIHZhciBmaWxlcztcblxuICBpZiAob3B0aW9ucy5yZWN1cnNpdmUpIHtcbiAgICBmaWxlcyA9IFtdO1xuICAgIGNvbW1vbi5leHBhbmQoZmlsZVBhdHRlcm4pLmZvckVhY2goZnVuY3Rpb24gYWRkRmlsZShleHBhbmRlZEZpbGUpIHtcbiAgICAgIHZhciBzdGF0ID0gZnMubHN0YXRTeW5jKGV4cGFuZGVkRmlsZSk7XG5cbiAgICAgIGlmICghc3RhdC5pc1N5bWJvbGljTGluaygpKSB7XG4gICAgICAgIGZpbGVzLnB1c2goZXhwYW5kZWRGaWxlKTtcblxuICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7ICAvLyBpbnRlbnRpb25hbGx5IGRvZXMgbm90IGZvbGxvdyBzeW1saW5rcy5cbiAgICAgICAgICBmcy5yZWFkZGlyU3luYyhleHBhbmRlZEZpbGUpLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICBhZGRGaWxlKGV4cGFuZGVkRmlsZSArICcvJyArIGNoaWxkKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGVsc2Uge1xuICAgIGZpbGVzID0gY29tbW9uLmV4cGFuZChmaWxlUGF0dGVybik7XG4gIH1cblxuICBmaWxlcy5mb3JFYWNoKGZ1bmN0aW9uIGlubmVyQ2htb2QoZmlsZSkge1xuICAgIGZpbGUgPSBwYXRoLnJlc29sdmUoZmlsZSk7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGZpbGUpKSB7XG4gICAgICBjb21tb24uZXJyb3IoJ0ZpbGUgbm90IGZvdW5kOiAnICsgZmlsZSk7XG4gICAgfVxuXG4gICAgLy8gV2hlbiByZWN1cnNpbmcsIGRvbid0IGZvbGxvdyBzeW1saW5rcy5cbiAgICBpZiAob3B0aW9ucy5yZWN1cnNpdmUgJiYgZnMubHN0YXRTeW5jKGZpbGUpLmlzU3ltYm9saWNMaW5rKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgcGVybXMgPSBmcy5zdGF0U3luYyhmaWxlKS5tb2RlO1xuICAgIHZhciB0eXBlID0gcGVybXMgJiBQRVJNUy5UWVBFX01BU0s7XG5cbiAgICB2YXIgbmV3UGVybXMgPSBwZXJtcztcblxuICAgIGlmIChpc05hTihwYXJzZUludChtb2RlLCA4KSkpIHtcbiAgICAgIC8vIHBhcnNlIG9wdGlvbnNcbiAgICAgIG1vZGUuc3BsaXQoJywnKS5mb3JFYWNoKGZ1bmN0aW9uIChzeW1ib2xpY01vZGUpIHtcbiAgICAgICAgLypqc2hpbnQgcmVnZXhkYXNoOnRydWUgKi9cbiAgICAgICAgdmFyIHBhdHRlcm4gPSAvKFt1Z29hXSopKFs9XFwrLV0pKFtyd3hYc3RdKikvaTtcbiAgICAgICAgdmFyIG1hdGNoZXMgPSBwYXR0ZXJuLmV4ZWMoc3ltYm9saWNNb2RlKTtcblxuICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgIHZhciBhcHBseVRvID0gbWF0Y2hlc1sxXTtcbiAgICAgICAgICB2YXIgb3BlcmF0b3IgPSBtYXRjaGVzWzJdO1xuICAgICAgICAgIHZhciBjaGFuZ2UgPSBtYXRjaGVzWzNdO1xuXG4gICAgICAgICAgdmFyIGNoYW5nZU93bmVyID0gYXBwbHlUby5pbmRleE9mKCd1JykgIT0gLTEgfHwgYXBwbHlUbyA9PT0gJ2EnIHx8IGFwcGx5VG8gPT09ICcnO1xuICAgICAgICAgIHZhciBjaGFuZ2VHcm91cCA9IGFwcGx5VG8uaW5kZXhPZignZycpICE9IC0xIHx8IGFwcGx5VG8gPT09ICdhJyB8fCBhcHBseVRvID09PSAnJztcbiAgICAgICAgICB2YXIgY2hhbmdlT3RoZXIgPSBhcHBseVRvLmluZGV4T2YoJ28nKSAhPSAtMSB8fCBhcHBseVRvID09PSAnYScgfHwgYXBwbHlUbyA9PT0gJyc7XG5cbiAgICAgICAgICB2YXIgY2hhbmdlUmVhZCAgID0gY2hhbmdlLmluZGV4T2YoJ3InKSAhPSAtMTtcbiAgICAgICAgICB2YXIgY2hhbmdlV3JpdGUgID0gY2hhbmdlLmluZGV4T2YoJ3cnKSAhPSAtMTtcbiAgICAgICAgICB2YXIgY2hhbmdlRXhlYyAgID0gY2hhbmdlLmluZGV4T2YoJ3gnKSAhPSAtMTtcbiAgICAgICAgICB2YXIgY2hhbmdlU3RpY2t5ID0gY2hhbmdlLmluZGV4T2YoJ3QnKSAhPSAtMTtcbiAgICAgICAgICB2YXIgY2hhbmdlU2V0dWlkID0gY2hhbmdlLmluZGV4T2YoJ3MnKSAhPSAtMTtcblxuICAgICAgICAgIHZhciBtYXNrID0gMDtcbiAgICAgICAgICBpZiAoY2hhbmdlT3duZXIpIHtcbiAgICAgICAgICAgIG1hc2sgfD0gKGNoYW5nZVJlYWQgPyBQRVJNUy5PV05FUl9SRUFEIDogMCkgKyAoY2hhbmdlV3JpdGUgPyBQRVJNUy5PV05FUl9XUklURSA6IDApICsgKGNoYW5nZUV4ZWMgPyBQRVJNUy5PV05FUl9FWEVDIDogMCkgKyAoY2hhbmdlU2V0dWlkID8gUEVSTVMuU0VUVUlEIDogMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjaGFuZ2VHcm91cCkge1xuICAgICAgICAgICAgbWFzayB8PSAoY2hhbmdlUmVhZCA/IFBFUk1TLkdST1VQX1JFQUQgOiAwKSArIChjaGFuZ2VXcml0ZSA/IFBFUk1TLkdST1VQX1dSSVRFIDogMCkgKyAoY2hhbmdlRXhlYyA/IFBFUk1TLkdST1VQX0VYRUMgOiAwKSArIChjaGFuZ2VTZXR1aWQgPyBQRVJNUy5TRVRHSUQgOiAwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGNoYW5nZU90aGVyKSB7XG4gICAgICAgICAgICBtYXNrIHw9IChjaGFuZ2VSZWFkID8gUEVSTVMuT1RIRVJfUkVBRCA6IDApICsgKGNoYW5nZVdyaXRlID8gUEVSTVMuT1RIRVJfV1JJVEUgOiAwKSArIChjaGFuZ2VFeGVjID8gUEVSTVMuT1RIRVJfRVhFQyA6IDApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFN0aWNreSBiaXQgaXMgc3BlY2lhbCAtIGl0J3Mgbm90IHRpZWQgdG8gdXNlciwgZ3JvdXAgb3Igb3RoZXIuXG4gICAgICAgICAgaWYgKGNoYW5nZVN0aWNreSkge1xuICAgICAgICAgICAgbWFzayB8PSBQRVJNUy5TVElDS1k7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc3dpdGNoIChvcGVyYXRvcikge1xuICAgICAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICAgIG5ld1Blcm1zIHw9IG1hc2s7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgICAgbmV3UGVybXMgJj0gfm1hc2s7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgICAgbmV3UGVybXMgPSB0eXBlICsgbWFzaztcblxuICAgICAgICAgICAgICAvLyBBY2NvcmRpbmcgdG8gUE9TSVgsIHdoZW4gdXNpbmcgPSB0byBleHBsaWNpdGx5IHNldCB0aGUgcGVybWlzc2lvbnMsIHNldHVpZCBhbmQgc2V0Z2lkIGNhbiBuZXZlciBiZSBjbGVhcmVkLlxuICAgICAgICAgICAgICBpZiAoZnMuc3RhdFN5bmMoZmlsZSkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIG5ld1Blcm1zIHw9IChQRVJNUy5TRVRVSUQgKyBQRVJNUy5TRVRHSUQpICYgcGVybXM7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG9wdGlvbnMudmVyYm9zZSkge1xuICAgICAgICAgICAgbG9nKGZpbGUgKyAnIC0+ICcgKyBuZXdQZXJtcy50b1N0cmluZyg4KSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHBlcm1zICE9IG5ld1Blcm1zKSB7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMudmVyYm9zZSAmJiBvcHRpb25zLmNoYW5nZXMpIHtcbiAgICAgICAgICAgICAgbG9nKGZpbGUgKyAnIC0+ICcgKyBuZXdQZXJtcy50b1N0cmluZyg4KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmcy5jaG1vZFN5bmMoZmlsZSwgbmV3UGVybXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjb21tb24uZXJyb3IoJ0ludmFsaWQgc3ltYm9saWMgbW9kZSBjaGFuZ2U6ICcgKyBzeW1ib2xpY01vZGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyB0aGV5IGdhdmUgdXMgYSBmdWxsIG51bWJlclxuICAgICAgbmV3UGVybXMgPSB0eXBlICsgcGFyc2VJbnQobW9kZSwgOCk7XG5cbiAgICAgIC8vIFBPU0lYIHJ1bGVzIGFyZSB0aGF0IHNldHVpZCBhbmQgc2V0Z2lkIGNhbiBvbmx5IGJlIGFkZGVkIHVzaW5nIG51bWVyaWMgZm9ybSwgYnV0IG5vdCBjbGVhcmVkLlxuICAgICAgaWYgKGZzLnN0YXRTeW5jKGZpbGUpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgbmV3UGVybXMgfD0gKFBFUk1TLlNFVFVJRCArIFBFUk1TLlNFVEdJRCkgJiBwZXJtcztcbiAgICAgIH1cblxuICAgICAgZnMuY2htb2RTeW5jKGZpbGUsIG5ld1Blcm1zKTtcbiAgICB9XG4gIH0pO1xufVxubW9kdWxlLmV4cG9ydHMgPSBfY2htb2Q7XG4iLCJ2YXIgY29tbW9uID0gcmVxdWlyZSgnLi9jb21tb24nKTtcblxuLy9AXG4vL0AgIyMjIGVycm9yKClcbi8vQCBUZXN0cyBpZiBlcnJvciBvY2N1cnJlZCBpbiB0aGUgbGFzdCBjb21tYW5kLiBSZXR1cm5zIGBudWxsYCBpZiBubyBlcnJvciBvY2N1cnJlZCxcbi8vQCBvdGhlcndpc2UgcmV0dXJucyBzdHJpbmcgZXhwbGFpbmluZyB0aGUgZXJyb3JcbmZ1bmN0aW9uIGVycm9yKCkge1xuICByZXR1cm4gY29tbW9uLnN0YXRlLmVycm9yO1xufTtcbm1vZHVsZS5leHBvcnRzID0gZXJyb3I7XG4iLCJ2YXIgY29uY2F0TWFwID0gcmVxdWlyZSgnY29uY2F0LW1hcCcpO1xudmFyIGJhbGFuY2VkID0gcmVxdWlyZSgnYmFsYW5jZWQtbWF0Y2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBhbmRUb3A7XG5cbnZhciBlc2NTbGFzaCA9ICdcXDBTTEFTSCcrTWF0aC5yYW5kb20oKSsnXFwwJztcbnZhciBlc2NPcGVuID0gJ1xcME9QRU4nK01hdGgucmFuZG9tKCkrJ1xcMCc7XG52YXIgZXNjQ2xvc2UgPSAnXFwwQ0xPU0UnK01hdGgucmFuZG9tKCkrJ1xcMCc7XG52YXIgZXNjQ29tbWEgPSAnXFwwQ09NTUEnK01hdGgucmFuZG9tKCkrJ1xcMCc7XG52YXIgZXNjUGVyaW9kID0gJ1xcMFBFUklPRCcrTWF0aC5yYW5kb20oKSsnXFwwJztcblxuZnVuY3Rpb24gbnVtZXJpYyhzdHIpIHtcbiAgcmV0dXJuIHBhcnNlSW50KHN0ciwgMTApID09IHN0clxuICAgID8gcGFyc2VJbnQoc3RyLCAxMClcbiAgICA6IHN0ci5jaGFyQ29kZUF0KDApO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVCcmFjZXMoc3RyKSB7XG4gIHJldHVybiBzdHIuc3BsaXQoJ1xcXFxcXFxcJykuam9pbihlc2NTbGFzaClcbiAgICAgICAgICAgIC5zcGxpdCgnXFxcXHsnKS5qb2luKGVzY09wZW4pXG4gICAgICAgICAgICAuc3BsaXQoJ1xcXFx9Jykuam9pbihlc2NDbG9zZSlcbiAgICAgICAgICAgIC5zcGxpdCgnXFxcXCwnKS5qb2luKGVzY0NvbW1hKVxuICAgICAgICAgICAgLnNwbGl0KCdcXFxcLicpLmpvaW4oZXNjUGVyaW9kKTtcbn1cblxuZnVuY3Rpb24gdW5lc2NhcGVCcmFjZXMoc3RyKSB7XG4gIHJldHVybiBzdHIuc3BsaXQoZXNjU2xhc2gpLmpvaW4oJ1xcXFwnKVxuICAgICAgICAgICAgLnNwbGl0KGVzY09wZW4pLmpvaW4oJ3snKVxuICAgICAgICAgICAgLnNwbGl0KGVzY0Nsb3NlKS5qb2luKCd9JylcbiAgICAgICAgICAgIC5zcGxpdChlc2NDb21tYSkuam9pbignLCcpXG4gICAgICAgICAgICAuc3BsaXQoZXNjUGVyaW9kKS5qb2luKCcuJyk7XG59XG5cblxuLy8gQmFzaWNhbGx5IGp1c3Qgc3RyLnNwbGl0KFwiLFwiKSwgYnV0IGhhbmRsaW5nIGNhc2VzXG4vLyB3aGVyZSB3ZSBoYXZlIG5lc3RlZCBicmFjZWQgc2VjdGlvbnMsIHdoaWNoIHNob3VsZCBiZVxuLy8gdHJlYXRlZCBhcyBpbmRpdmlkdWFsIG1lbWJlcnMsIGxpa2Uge2Ese2IsY30sZH1cbmZ1bmN0aW9uIHBhcnNlQ29tbWFQYXJ0cyhzdHIpIHtcbiAgaWYgKCFzdHIpXG4gICAgcmV0dXJuIFsnJ107XG5cbiAgdmFyIHBhcnRzID0gW107XG4gIHZhciBtID0gYmFsYW5jZWQoJ3snLCAnfScsIHN0cik7XG5cbiAgaWYgKCFtKVxuICAgIHJldHVybiBzdHIuc3BsaXQoJywnKTtcblxuICB2YXIgcHJlID0gbS5wcmU7XG4gIHZhciBib2R5ID0gbS5ib2R5O1xuICB2YXIgcG9zdCA9IG0ucG9zdDtcbiAgdmFyIHAgPSBwcmUuc3BsaXQoJywnKTtcblxuICBwW3AubGVuZ3RoLTFdICs9ICd7JyArIGJvZHkgKyAnfSc7XG4gIHZhciBwb3N0UGFydHMgPSBwYXJzZUNvbW1hUGFydHMocG9zdCk7XG4gIGlmIChwb3N0Lmxlbmd0aCkge1xuICAgIHBbcC5sZW5ndGgtMV0gKz0gcG9zdFBhcnRzLnNoaWZ0KCk7XG4gICAgcC5wdXNoLmFwcGx5KHAsIHBvc3RQYXJ0cyk7XG4gIH1cblxuICBwYXJ0cy5wdXNoLmFwcGx5KHBhcnRzLCBwKTtcblxuICByZXR1cm4gcGFydHM7XG59XG5cbmZ1bmN0aW9uIGV4cGFuZFRvcChzdHIpIHtcbiAgaWYgKCFzdHIpXG4gICAgcmV0dXJuIFtdO1xuXG4gIC8vIEkgZG9uJ3Qga25vdyB3aHkgQmFzaCA0LjMgZG9lcyB0aGlzLCBidXQgaXQgZG9lcy5cbiAgLy8gQW55dGhpbmcgc3RhcnRpbmcgd2l0aCB7fSB3aWxsIGhhdmUgdGhlIGZpcnN0IHR3byBieXRlcyBwcmVzZXJ2ZWRcbiAgLy8gYnV0ICpvbmx5KiBhdCB0aGUgdG9wIGxldmVsLCBzbyB7fSxhfWIgd2lsbCBub3QgZXhwYW5kIHRvIGFueXRoaW5nLFxuICAvLyBidXQgYXt9LGJ9YyB3aWxsIGJlIGV4cGFuZGVkIHRvIFthfWMsYWJjXS5cbiAgLy8gT25lIGNvdWxkIGFyZ3VlIHRoYXQgdGhpcyBpcyBhIGJ1ZyBpbiBCYXNoLCBidXQgc2luY2UgdGhlIGdvYWwgb2ZcbiAgLy8gdGhpcyBtb2R1bGUgaXMgdG8gbWF0Y2ggQmFzaCdzIHJ1bGVzLCB3ZSBlc2NhcGUgYSBsZWFkaW5nIHt9XG4gIGlmIChzdHIuc3Vic3RyKDAsIDIpID09PSAne30nKSB7XG4gICAgc3RyID0gJ1xcXFx7XFxcXH0nICsgc3RyLnN1YnN0cigyKTtcbiAgfVxuXG4gIHJldHVybiBleHBhbmQoZXNjYXBlQnJhY2VzKHN0ciksIHRydWUpLm1hcCh1bmVzY2FwZUJyYWNlcyk7XG59XG5cbmZ1bmN0aW9uIGlkZW50aXR5KGUpIHtcbiAgcmV0dXJuIGU7XG59XG5cbmZ1bmN0aW9uIGVtYnJhY2Uoc3RyKSB7XG4gIHJldHVybiAneycgKyBzdHIgKyAnfSc7XG59XG5mdW5jdGlvbiBpc1BhZGRlZChlbCkge1xuICByZXR1cm4gL14tPzBcXGQvLnRlc3QoZWwpO1xufVxuXG5mdW5jdGlvbiBsdGUoaSwgeSkge1xuICByZXR1cm4gaSA8PSB5O1xufVxuZnVuY3Rpb24gZ3RlKGksIHkpIHtcbiAgcmV0dXJuIGkgPj0geTtcbn1cblxuZnVuY3Rpb24gZXhwYW5kKHN0ciwgaXNUb3ApIHtcbiAgdmFyIGV4cGFuc2lvbnMgPSBbXTtcblxuICB2YXIgbSA9IGJhbGFuY2VkKCd7JywgJ30nLCBzdHIpO1xuICBpZiAoIW0gfHwgL1xcJCQvLnRlc3QobS5wcmUpKSByZXR1cm4gW3N0cl07XG5cbiAgdmFyIGlzTnVtZXJpY1NlcXVlbmNlID0gL14tP1xcZCtcXC5cXC4tP1xcZCsoPzpcXC5cXC4tP1xcZCspPyQvLnRlc3QobS5ib2R5KTtcbiAgdmFyIGlzQWxwaGFTZXF1ZW5jZSA9IC9eW2EtekEtWl1cXC5cXC5bYS16QS1aXSg/OlxcLlxcLi0/XFxkKyk/JC8udGVzdChtLmJvZHkpO1xuICB2YXIgaXNTZXF1ZW5jZSA9IGlzTnVtZXJpY1NlcXVlbmNlIHx8IGlzQWxwaGFTZXF1ZW5jZTtcbiAgdmFyIGlzT3B0aW9ucyA9IG0uYm9keS5pbmRleE9mKCcsJykgPj0gMDtcbiAgaWYgKCFpc1NlcXVlbmNlICYmICFpc09wdGlvbnMpIHtcbiAgICAvLyB7YX0sYn1cbiAgICBpZiAobS5wb3N0Lm1hdGNoKC8sLipcXH0vKSkge1xuICAgICAgc3RyID0gbS5wcmUgKyAneycgKyBtLmJvZHkgKyBlc2NDbG9zZSArIG0ucG9zdDtcbiAgICAgIHJldHVybiBleHBhbmQoc3RyKTtcbiAgICB9XG4gICAgcmV0dXJuIFtzdHJdO1xuICB9XG5cbiAgdmFyIG47XG4gIGlmIChpc1NlcXVlbmNlKSB7XG4gICAgbiA9IG0uYm9keS5zcGxpdCgvXFwuXFwuLyk7XG4gIH0gZWxzZSB7XG4gICAgbiA9IHBhcnNlQ29tbWFQYXJ0cyhtLmJvZHkpO1xuICAgIGlmIChuLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8geHt7YSxifX15ID09PiB4e2F9eSB4e2J9eVxuICAgICAgbiA9IGV4cGFuZChuWzBdLCBmYWxzZSkubWFwKGVtYnJhY2UpO1xuICAgICAgaWYgKG4ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHZhciBwb3N0ID0gbS5wb3N0Lmxlbmd0aFxuICAgICAgICAgID8gZXhwYW5kKG0ucG9zdCwgZmFsc2UpXG4gICAgICAgICAgOiBbJyddO1xuICAgICAgICByZXR1cm4gcG9zdC5tYXAoZnVuY3Rpb24ocCkge1xuICAgICAgICAgIHJldHVybiBtLnByZSArIG5bMF0gKyBwO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBhdCB0aGlzIHBvaW50LCBuIGlzIHRoZSBwYXJ0cywgYW5kIHdlIGtub3cgaXQncyBub3QgYSBjb21tYSBzZXRcbiAgLy8gd2l0aCBhIHNpbmdsZSBlbnRyeS5cblxuICAvLyBubyBuZWVkIHRvIGV4cGFuZCBwcmUsIHNpbmNlIGl0IGlzIGd1YXJhbnRlZWQgdG8gYmUgZnJlZSBvZiBicmFjZS1zZXRzXG4gIHZhciBwcmUgPSBtLnByZTtcbiAgdmFyIHBvc3QgPSBtLnBvc3QubGVuZ3RoXG4gICAgPyBleHBhbmQobS5wb3N0LCBmYWxzZSlcbiAgICA6IFsnJ107XG5cbiAgdmFyIE47XG5cbiAgaWYgKGlzU2VxdWVuY2UpIHtcbiAgICB2YXIgeCA9IG51bWVyaWMoblswXSk7XG4gICAgdmFyIHkgPSBudW1lcmljKG5bMV0pO1xuICAgIHZhciB3aWR0aCA9IE1hdGgubWF4KG5bMF0ubGVuZ3RoLCBuWzFdLmxlbmd0aClcbiAgICB2YXIgaW5jciA9IG4ubGVuZ3RoID09IDNcbiAgICAgID8gTWF0aC5hYnMobnVtZXJpYyhuWzJdKSlcbiAgICAgIDogMTtcbiAgICB2YXIgdGVzdCA9IGx0ZTtcbiAgICB2YXIgcmV2ZXJzZSA9IHkgPCB4O1xuICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICBpbmNyICo9IC0xO1xuICAgICAgdGVzdCA9IGd0ZTtcbiAgICB9XG4gICAgdmFyIHBhZCA9IG4uc29tZShpc1BhZGRlZCk7XG5cbiAgICBOID0gW107XG5cbiAgICBmb3IgKHZhciBpID0geDsgdGVzdChpLCB5KTsgaSArPSBpbmNyKSB7XG4gICAgICB2YXIgYztcbiAgICAgIGlmIChpc0FscGhhU2VxdWVuY2UpIHtcbiAgICAgICAgYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoaSk7XG4gICAgICAgIGlmIChjID09PSAnXFxcXCcpXG4gICAgICAgICAgYyA9ICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYyA9IFN0cmluZyhpKTtcbiAgICAgICAgaWYgKHBhZCkge1xuICAgICAgICAgIHZhciBuZWVkID0gd2lkdGggLSBjLmxlbmd0aDtcbiAgICAgICAgICBpZiAobmVlZCA+IDApIHtcbiAgICAgICAgICAgIHZhciB6ID0gbmV3IEFycmF5KG5lZWQgKyAxKS5qb2luKCcwJyk7XG4gICAgICAgICAgICBpZiAoaSA8IDApXG4gICAgICAgICAgICAgIGMgPSAnLScgKyB6ICsgYy5zbGljZSgxKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgYyA9IHogKyBjO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgTi5wdXNoKGMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBOID0gY29uY2F0TWFwKG4sIGZ1bmN0aW9uKGVsKSB7IHJldHVybiBleHBhbmQoZWwsIGZhbHNlKSB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGogPSAwOyBqIDwgTi5sZW5ndGg7IGorKykge1xuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgcG9zdC5sZW5ndGg7IGsrKykge1xuICAgICAgdmFyIGV4cGFuc2lvbiA9IHByZSArIE5bal0gKyBwb3N0W2tdO1xuICAgICAgaWYgKCFpc1RvcCB8fCBpc1NlcXVlbmNlIHx8IGV4cGFuc2lvbilcbiAgICAgICAgZXhwYW5zaW9ucy5wdXNoKGV4cGFuc2lvbik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGV4cGFuc2lvbnM7XG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHhzLCBmbikge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB4ID0gZm4oeHNbaV0sIGkpO1xuICAgICAgICBpZiAoaXNBcnJheSh4KSkgcmVzLnB1c2guYXBwbHkocmVzLCB4KTtcbiAgICAgICAgZWxzZSByZXMucHVzaCh4KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGJhbGFuY2VkO1xuZnVuY3Rpb24gYmFsYW5jZWQoYSwgYiwgc3RyKSB7XG4gIGlmIChhIGluc3RhbmNlb2YgUmVnRXhwKSBhID0gbWF5YmVNYXRjaChhLCBzdHIpO1xuICBpZiAoYiBpbnN0YW5jZW9mIFJlZ0V4cCkgYiA9IG1heWJlTWF0Y2goYiwgc3RyKTtcblxuICB2YXIgciA9IHJhbmdlKGEsIGIsIHN0cik7XG5cbiAgcmV0dXJuIHIgJiYge1xuICAgIHN0YXJ0OiByWzBdLFxuICAgIGVuZDogclsxXSxcbiAgICBwcmU6IHN0ci5zbGljZSgwLCByWzBdKSxcbiAgICBib2R5OiBzdHIuc2xpY2UoclswXSArIGEubGVuZ3RoLCByWzFdKSxcbiAgICBwb3N0OiBzdHIuc2xpY2UoclsxXSArIGIubGVuZ3RoKVxuICB9O1xufVxuXG5mdW5jdGlvbiBtYXliZU1hdGNoKHJlZywgc3RyKSB7XG4gIHZhciBtID0gc3RyLm1hdGNoKHJlZyk7XG4gIHJldHVybiBtID8gbVswXSA6IG51bGw7XG59XG5cbmJhbGFuY2VkLnJhbmdlID0gcmFuZ2U7XG5mdW5jdGlvbiByYW5nZShhLCBiLCBzdHIpIHtcbiAgdmFyIGJlZ3MsIGJlZywgbGVmdCwgcmlnaHQsIHJlc3VsdDtcbiAgdmFyIGFpID0gc3RyLmluZGV4T2YoYSk7XG4gIHZhciBiaSA9IHN0ci5pbmRleE9mKGIsIGFpICsgMSk7XG4gIHZhciBpID0gYWk7XG5cbiAgaWYgKGFpID49IDAgJiYgYmkgPiAwKSB7XG4gICAgYmVncyA9IFtdO1xuICAgIGxlZnQgPSBzdHIubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGkgPj0gMCAmJiAhcmVzdWx0KSB7XG4gICAgICBpZiAoaSA9PSBhaSkge1xuICAgICAgICBiZWdzLnB1c2goaSk7XG4gICAgICAgIGFpID0gc3RyLmluZGV4T2YoYSwgaSArIDEpO1xuICAgICAgfSBlbHNlIGlmIChiZWdzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIHJlc3VsdCA9IFsgYmVncy5wb3AoKSwgYmkgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJlZyA9IGJlZ3MucG9wKCk7XG4gICAgICAgIGlmIChiZWcgPCBsZWZ0KSB7XG4gICAgICAgICAgbGVmdCA9IGJlZztcbiAgICAgICAgICByaWdodCA9IGJpO1xuICAgICAgICB9XG5cbiAgICAgICAgYmkgPSBzdHIuaW5kZXhPZihiLCBpICsgMSk7XG4gICAgICB9XG5cbiAgICAgIGkgPSBhaSA8IGJpICYmIGFpID49IDAgPyBhaSA6IGJpO1xuICAgIH1cblxuICAgIGlmIChiZWdzLmxlbmd0aCkge1xuICAgICAgcmVzdWx0ID0gWyBsZWZ0LCByaWdodCBdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ1dGlsXCIpOyIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBmcyA9IHJlcXVpcmUoXCJmc1wiKTtcclxudmFyIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcclxudmFyIGNyeXB0byA9IHJlcXVpcmUoXCJjcnlwdG9cIik7XHJcbnZhciB1dWlkVjQgPSByZXF1aXJlKCd1dWlkL3Y0Jyk7XHJcbnZhciBhbGdvcml0aG0gPSBcImFlcy0yNTYtY3RyXCI7XHJcbnZhciBlbmNyeXB0RW5jb2RpbmcgPSAnaGV4JztcclxudmFyIHVuZW5jcnlwdGVkRW5jb2RpbmcgPSAndXRmOCc7XHJcbi8vXHJcbi8vIFN0b3JlIHNlbnNpdGl2ZSBkYXRhIGluIHByb2MuXHJcbi8vIE1haW4gZ29hbDogUHJvdGVjdHMgdGFza3Mgd2hpY2ggd291bGQgZHVtcCBlbnZ2YXJzIGZyb20gbGVha2luZyBzZWNyZXRzIGluYWR2ZXJ0ZW50bHlcclxuLy8gICAgICAgICAgICB0aGUgdGFzayBsaWIgY2xlYXJzIGFmdGVyIHN0b3JpbmcuXHJcbi8vIEFsc28gcHJvdGVjdHMgYWdhaW5zdCBhIGR1bXAgb2YgYSBwcm9jZXNzIGdldHRpbmcgdGhlIHNlY3JldHNcclxuLy8gVGhlIHNlY3JldCBpcyBnZW5lcmF0ZWQgYW5kIHN0b3JlZCBleHRlcm5hbGx5IGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHRhc2suXHJcbi8vXHJcbnZhciBWYXVsdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFZhdWx0KGtleVBhdGgpIHtcclxuICAgICAgICB0aGlzLl9rZXlGaWxlID0gcGF0aC5qb2luKGtleVBhdGgsICcudGFza2tleScpO1xyXG4gICAgICAgIHRoaXMuX3N0b3JlID0ge307XHJcbiAgICAgICAgdGhpcy5nZW5LZXkoKTtcclxuICAgIH1cclxuICAgIFZhdWx0LnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gKCkge1xyXG4gICAgfTtcclxuICAgIFZhdWx0LnByb3RvdHlwZS5zdG9yZVNlY3JldCA9IGZ1bmN0aW9uIChuYW1lLCBkYXRhKSB7XHJcbiAgICAgICAgaWYgKCFuYW1lIHx8IG5hbWUubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmICghZGF0YSB8fCBkYXRhLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdG9yZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3N0b3JlW25hbWVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGtleSA9IHRoaXMuZ2V0S2V5KCk7XHJcbiAgICAgICAgdmFyIGl2ID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDE2KTtcclxuICAgICAgICB2YXIgY2lwaGVyID0gY3J5cHRvLmNyZWF0ZUNpcGhlcml2KGFsZ29yaXRobSwga2V5LCBpdik7XHJcbiAgICAgICAgdmFyIGNyeXB0ZWQgPSBjaXBoZXIudXBkYXRlKGRhdGEsIHVuZW5jcnlwdGVkRW5jb2RpbmcsIGVuY3J5cHRFbmNvZGluZyk7XHJcbiAgICAgICAgdmFyIGNyeXB0ZWRGaW5hbCA9IGNpcGhlci5maW5hbChlbmNyeXB0RW5jb2RpbmcpO1xyXG4gICAgICAgIHRoaXMuX3N0b3JlW25hbWVdID0gaXYudG9TdHJpbmcoZW5jcnlwdEVuY29kaW5nKSArIGNyeXB0ZWQgKyBjcnlwdGVkRmluYWw7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG4gICAgVmF1bHQucHJvdG90eXBlLnJldHJpZXZlU2VjcmV0ID0gZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICB2YXIgc2VjcmV0O1xyXG4gICAgICAgIG5hbWUgPSAobmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAodGhpcy5fc3RvcmUuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcclxuICAgICAgICAgICAgdmFyIGtleSA9IHRoaXMuZ2V0S2V5KCk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5fc3RvcmVbbmFtZV07XHJcbiAgICAgICAgICAgIHZhciBpdkRhdGFCdWZmZXIgPSBCdWZmZXIuZnJvbShkYXRhLCBlbmNyeXB0RW5jb2RpbmcpO1xyXG4gICAgICAgICAgICB2YXIgaXYgPSBpdkRhdGFCdWZmZXIuc2xpY2UoMCwgMTYpO1xyXG4gICAgICAgICAgICB2YXIgZW5jcnlwdGVkVGV4dCA9IGl2RGF0YUJ1ZmZlci5zbGljZSgxNik7XHJcbiAgICAgICAgICAgIHZhciBkZWNpcGhlciA9IGNyeXB0by5jcmVhdGVEZWNpcGhlcml2KGFsZ29yaXRobSwga2V5LCBpdik7XHJcbiAgICAgICAgICAgIHZhciBkZWMgPSBkZWNpcGhlci51cGRhdGUoZW5jcnlwdGVkVGV4dCwgZW5jcnlwdEVuY29kaW5nLCB1bmVuY3J5cHRlZEVuY29kaW5nKTtcclxuICAgICAgICAgICAgdmFyIGRlY0ZpbmFsID0gZGVjaXBoZXIuZmluYWwodW5lbmNyeXB0ZWRFbmNvZGluZyk7XHJcbiAgICAgICAgICAgIHNlY3JldCA9IGRlYyArIGRlY0ZpbmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2VjcmV0O1xyXG4gICAgfTtcclxuICAgIFZhdWx0LnByb3RvdHlwZS5nZXRLZXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLl9rZXlGaWxlKS50b1N0cmluZygndXRmOCcpO1xyXG4gICAgICAgIC8vIEtleSBuZWVkcyB0byBiZSBoYXNoZWQgdG8gY29ycmVjdCBsZW5ndGggdG8gbWF0Y2ggYWxnb3JpdGhtIChhZXMtMjU2LWN0cilcclxuICAgICAgICByZXR1cm4gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZShrZXkpLmRpZ2VzdCgpO1xyXG4gICAgfTtcclxuICAgIFZhdWx0LnByb3RvdHlwZS5nZW5LZXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLl9rZXlGaWxlLCB1dWlkVjQoKSwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBWYXVsdDtcclxufSgpKTtcclxuZXhwb3J0cy5WYXVsdCA9IFZhdWx0O1xyXG4iLCIvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiAgSW4gbm9kZS5qc1xuLy8gdGhpcyBpcyBwcmV0dHkgc3RyYWlnaHQtZm9yd2FyZCAtIHdlIHVzZSB0aGUgY3J5cHRvIEFQSS5cblxudmFyIGNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vZGVSTkcoKSB7XG4gIHJldHVybiBjcnlwdG8ucmFuZG9tQnl0ZXMoMTYpO1xufTtcbiIsIi8qKlxuICogQ29udmVydCBhcnJheSBvZiAxNiBieXRlIHZhbHVlcyB0byBVVUlEIHN0cmluZyBmb3JtYXQgb2YgdGhlIGZvcm06XG4gKiBYWFhYWFhYWC1YWFhYLVhYWFgtWFhYWC1YWFhYWFhYWFhYWFhcbiAqL1xudmFyIGJ5dGVUb0hleCA9IFtdO1xuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xufVxuXG5mdW5jdGlvbiBieXRlc1RvVXVpZChidWYsIG9mZnNldCkge1xuICB2YXIgaSA9IG9mZnNldCB8fCAwO1xuICB2YXIgYnRoID0gYnl0ZVRvSGV4O1xuICAvLyBqb2luIHVzZWQgdG8gZml4IG1lbW9yeSBpc3N1ZSBjYXVzZWQgYnkgY29uY2F0ZW5hdGlvbjogaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzE3NSNjNFxuICByZXR1cm4gKFtcbiAgICBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLFxuICAgIGJ0aFtidWZbaSsrXV0sIGJ0aFtidWZbaSsrXV0sICctJyxcbiAgICBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCAnLScsXG4gICAgYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgJy0nLFxuICAgIGJ0aFtidWZbaSsrXV0sIGJ0aFtidWZbaSsrXV0sICctJyxcbiAgICBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLFxuICAgIGJ0aFtidWZbaSsrXV0sIGJ0aFtidWZbaSsrXV0sXG4gICAgYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXVxuICBdKS5qb2luKCcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBieXRlc1RvVXVpZDtcbiIsImZ1bmN0aW9uIHdlYnBhY2tFbXB0eUNvbnRleHQocmVxKSB7XG5cdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIHJlcSArIFwiJ1wiKTtcblx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHR0aHJvdyBlO1xufVxud2VicGFja0VtcHR5Q29udGV4dC5rZXlzID0gZnVuY3Rpb24oKSB7IHJldHVybiBbXTsgfTtcbndlYnBhY2tFbXB0eUNvbnRleHQucmVzb2x2ZSA9IHdlYnBhY2tFbXB0eUNvbnRleHQ7XG5tb2R1bGUuZXhwb3J0cyA9IHdlYnBhY2tFbXB0eUNvbnRleHQ7XG53ZWJwYWNrRW1wdHlDb250ZXh0LmlkID0gNDM7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIFEgPSByZXF1aXJlKFwicVwiKTtcclxudmFyIG9zID0gcmVxdWlyZShcIm9zXCIpO1xyXG52YXIgZXZlbnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTtcclxudmFyIGNoaWxkID0gcmVxdWlyZShcImNoaWxkX3Byb2Nlc3NcIik7XHJcbnZhciBpbSA9IHJlcXVpcmUoXCIuL2ludGVybmFsXCIpO1xyXG52YXIgZnMgPSByZXF1aXJlKFwiZnNcIik7XHJcbnZhciBUb29sUnVubmVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKFRvb2xSdW5uZXIsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBUb29sUnVubmVyKHRvb2xQYXRoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcclxuICAgICAgICBpZiAoIXRvb2xQYXRoKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUGFyYW1ldGVyIFxcJ3Rvb2xQYXRoXFwnIGNhbm5vdCBiZSBudWxsIG9yIGVtcHR5LicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBfdGhpcy50b29sUGF0aCA9IGltLl93aGljaCh0b29sUGF0aCwgdHJ1ZSk7XHJcbiAgICAgICAgX3RoaXMuYXJncyA9IFtdO1xyXG4gICAgICAgIF90aGlzLl9kZWJ1ZygndG9vbFJ1bm5lciB0b29sUGF0aDogJyArIHRvb2xQYXRoKTtcclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBUb29sUnVubmVyLnByb3RvdHlwZS5fZGVidWcgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgIHRoaXMuZW1pdCgnZGVidWcnLCBtZXNzYWdlKTtcclxuICAgIH07XHJcbiAgICBUb29sUnVubmVyLnByb3RvdHlwZS5fYXJnU3RyaW5nVG9BcnJheSA9IGZ1bmN0aW9uIChhcmdTdHJpbmcpIHtcclxuICAgICAgICB2YXIgYXJncyA9IFtdO1xyXG4gICAgICAgIHZhciBpblF1b3RlcyA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBlc2NhcGVkID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGxhc3RDaGFyV2FzU3BhY2UgPSB0cnVlO1xyXG4gICAgICAgIHZhciBhcmcgPSAnJztcclxuICAgICAgICB2YXIgYXBwZW5kID0gZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICAgICAgLy8gd2Ugb25seSBlc2NhcGUgZG91YmxlIHF1b3Rlcy5cclxuICAgICAgICAgICAgaWYgKGVzY2FwZWQgJiYgYyAhPT0gJ1wiJykge1xyXG4gICAgICAgICAgICAgICAgYXJnICs9ICdcXFxcJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhcmcgKz0gYztcclxuICAgICAgICAgICAgZXNjYXBlZCA9IGZhbHNlO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdTdHJpbmcubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGMgPSBhcmdTdHJpbmcuY2hhckF0KGkpO1xyXG4gICAgICAgICAgICBpZiAoYyA9PT0gJyAnICYmICFpblF1b3Rlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFsYXN0Q2hhcldhc1NwYWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKGFyZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsYXN0Q2hhcldhc1NwYWNlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFzdENoYXJXYXNTcGFjZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjID09PSAnXCInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWVzY2FwZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpblF1b3RlcyA9ICFpblF1b3RlcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcGVuZChjKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjID09PSBcIlxcXFxcIiAmJiBlc2NhcGVkKSB7XHJcbiAgICAgICAgICAgICAgICBhcHBlbmQoYyk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYyA9PT0gXCJcXFxcXCIgJiYgaW5RdW90ZXMpIHtcclxuICAgICAgICAgICAgICAgIGVzY2FwZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXBwZW5kKGMpO1xyXG4gICAgICAgICAgICBsYXN0Q2hhcldhc1NwYWNlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghbGFzdENoYXJXYXNTcGFjZSkge1xyXG4gICAgICAgICAgICBhcmdzLnB1c2goYXJnLnRyaW0oKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhcmdzO1xyXG4gICAgfTtcclxuICAgIFRvb2xSdW5uZXIucHJvdG90eXBlLl9nZXRDb21tYW5kU3RyaW5nID0gZnVuY3Rpb24gKG9wdGlvbnMsIG5vUHJlZml4KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgdG9vbFBhdGggPSB0aGlzLl9nZXRTcGF3bkZpbGVOYW1lKCk7XHJcbiAgICAgICAgdmFyIGFyZ3MgPSB0aGlzLl9nZXRTcGF3bkFyZ3Mob3B0aW9ucyk7XHJcbiAgICAgICAgdmFyIGNtZCA9IG5vUHJlZml4ID8gJycgOiAnW2NvbW1hbmRdJzsgLy8gb21pdCBwcmVmaXggd2hlbiBwaXBlZCB0byBhIHNlY29uZCB0b29sXHJcbiAgICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJykge1xyXG4gICAgICAgICAgICAvLyBXaW5kb3dzICsgY21kIGZpbGVcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQ21kRmlsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBjbWQgKz0gdG9vbFBhdGg7XHJcbiAgICAgICAgICAgICAgICBhcmdzLmZvckVhY2goZnVuY3Rpb24gKGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbWQgKz0gXCIgXCIgKyBhO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gV2luZG93cyArIHZlcmJhdGltXHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMud2luZG93c1ZlcmJhdGltQXJndW1lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBjbWQgKz0gXCJcXFwiXCIgKyB0b29sUGF0aCArIFwiXFxcIlwiO1xyXG4gICAgICAgICAgICAgICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY21kICs9IFwiIFwiICsgYTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFdpbmRvd3MgKHJlZ3VsYXIpXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY21kICs9IHRoaXMuX3dpbmRvd3NRdW90ZUNtZEFyZyh0b29sUGF0aCk7XHJcbiAgICAgICAgICAgICAgICBhcmdzLmZvckVhY2goZnVuY3Rpb24gKGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbWQgKz0gXCIgXCIgKyBfdGhpcy5fd2luZG93c1F1b3RlQ21kQXJnKGEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIE9TWC9MaW51eCAtIHRoaXMgY2FuIGxpa2VseSBiZSBpbXByb3ZlZCB3aXRoIHNvbWUgZm9ybSBvZiBxdW90aW5nLlxyXG4gICAgICAgICAgICAvLyBjcmVhdGluZyBwcm9jZXNzZXMgb24gVW5peCBpcyBmdW5kYW1lbnRhbGx5IGRpZmZlcmVudCB0aGFuIFdpbmRvd3MuXHJcbiAgICAgICAgICAgIC8vIG9uIFVuaXgsIGV4ZWN2cCgpIHRha2VzIGFuIGFyZyBhcnJheS5cclxuICAgICAgICAgICAgY21kICs9IHRvb2xQYXRoO1xyXG4gICAgICAgICAgICBhcmdzLmZvckVhY2goZnVuY3Rpb24gKGEpIHtcclxuICAgICAgICAgICAgICAgIGNtZCArPSBcIiBcIiArIGE7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBhcHBlbmQgc2Vjb25kIHRvb2xcclxuICAgICAgICBpZiAodGhpcy5waXBlT3V0cHV0VG9Ub29sKSB7XHJcbiAgICAgICAgICAgIGNtZCArPSAnIHwgJyArIHRoaXMucGlwZU91dHB1dFRvVG9vbC5fZ2V0Q29tbWFuZFN0cmluZyhvcHRpb25zLCAvKm5vUHJlZml4OiovIHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY21kO1xyXG4gICAgfTtcclxuICAgIFRvb2xSdW5uZXIucHJvdG90eXBlLl9wcm9jZXNzTGluZUJ1ZmZlciA9IGZ1bmN0aW9uIChkYXRhLCBzdHJCdWZmZXIsIG9uTGluZSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHZhciBzID0gc3RyQnVmZmVyICsgZGF0YS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB2YXIgbiA9IHMuaW5kZXhPZihvcy5FT0wpO1xyXG4gICAgICAgICAgICB3aGlsZSAobiA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGluZSA9IHMuc3Vic3RyaW5nKDAsIG4pO1xyXG4gICAgICAgICAgICAgICAgb25MaW5lKGxpbmUpO1xyXG4gICAgICAgICAgICAgICAgLy8gdGhlIHJlc3Qgb2YgdGhlIHN0cmluZyAuLi5cclxuICAgICAgICAgICAgICAgIHMgPSBzLnN1YnN0cmluZyhuICsgb3MuRU9MLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBuID0gcy5pbmRleE9mKG9zLkVPTCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RyQnVmZmVyID0gcztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAvLyBzdHJlYW1pbmcgbGluZXMgdG8gY29uc29sZSBpcyBiZXN0IGVmZm9ydC4gIERvbid0IGZhaWwgYSBidWlsZC5cclxuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ2Vycm9yIHByb2Nlc3NpbmcgbGluZScpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBUb29sUnVubmVyLnByb3RvdHlwZS5fZ2V0U3Bhd25GaWxlTmFtZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0NtZEZpbGUoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3MuZW52WydDT01TUEVDJ10gfHwgJ2NtZC5leGUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnRvb2xQYXRoO1xyXG4gICAgfTtcclxuICAgIFRvb2xSdW5uZXIucHJvdG90eXBlLl9nZXRTcGF3bkFyZ3MgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09ICd3aW4zMicpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzQ21kRmlsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYXJnbGluZSA9IFwiL0QgL1MgL0MgXFxcIlwiICsgdGhpcy5fd2luZG93c1F1b3RlQ21kQXJnKHRoaXMudG9vbFBhdGgpO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFyZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBhcmdsaW5lICs9ICcgJztcclxuICAgICAgICAgICAgICAgICAgICBhcmdsaW5lICs9IG9wdGlvbnMud2luZG93c1ZlcmJhdGltQXJndW1lbnRzID8gdGhpcy5hcmdzW2ldIDogdGhpcy5fd2luZG93c1F1b3RlQ21kQXJnKHRoaXMuYXJnc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhcmdsaW5lICs9ICdcIic7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2FyZ2xpbmVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpbmRvd3NWZXJiYXRpbUFyZ3VtZW50cykge1xyXG4gICAgICAgICAgICAgICAgLy8gbm90ZSwgaW4gTm9kZSA2Lnggb3B0aW9ucy5hcmd2MCBjYW4gYmUgdXNlZCBpbnN0ZWFkIG9mIG92ZXJyaWRpbmcgYXJncy5zbGljZSBhbmQgYXJncy51bnNoaWZ0LlxyXG4gICAgICAgICAgICAgICAgLy8gZm9yIG1vcmUgZGV0YWlscywgcmVmZXIgdG8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvdjYueC9saWIvY2hpbGRfcHJvY2Vzcy5qc1xyXG4gICAgICAgICAgICAgICAgdmFyIGFyZ3NfMSA9IHRoaXMuYXJncy5zbGljZSgwKTsgLy8gY29weSB0aGUgYXJyYXlcclxuICAgICAgICAgICAgICAgIC8vIG92ZXJyaWRlIHNsaWNlIHRvIHByZXZlbnQgTm9kZSBmcm9tIGNyZWF0aW5nIGEgY29weSBvZiB0aGUgYXJnIGFycmF5LlxyXG4gICAgICAgICAgICAgICAgLy8gd2UgbmVlZCBOb2RlIHRvIHVzZSB0aGUgXCJ1bnNoaWZ0XCIgb3ZlcnJpZGUgYmVsb3cuXHJcbiAgICAgICAgICAgICAgICBhcmdzXzEuc2xpY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggIT0gMSB8fCBhcmd1bWVudHNbMF0gIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgYXJndW1lbnRzIHBhc3NlZCB0byBhcmdzLnNsaWNlIHdoZW4gd2luZG93c1ZlcmJhdGltQXJndW1lbnRzIGZsYWcgaXMgc2V0LicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJnc18xO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8vIG92ZXJyaWRlIHVuc2hpZnRcclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICAvLyB3aGVuIHVzaW5nIHRoZSB3aW5kb3dzVmVyYmF0aW1Bcmd1bWVudHMgb3B0aW9uLCBOb2RlIGRvZXMgbm90IHF1b3RlIHRoZSB0b29sIHBhdGggd2hlbiBidWlsZGluZ1xyXG4gICAgICAgICAgICAgICAgLy8gdGhlIGNtZGxpbmUgcGFyYW1ldGVyIGZvciB0aGUgd2luMzIgZnVuY3Rpb24gQ3JlYXRlUHJvY2VzcygpLiBhbiB1bnF1b3RlZCBzcGFjZSBpbiB0aGUgdG9vbCBwYXRoXHJcbiAgICAgICAgICAgICAgICAvLyBjYXVzZXMgcHJvYmxlbXMgZm9yIHRvb2xzIHdoZW4gYXR0ZW1wdGluZyB0byBwYXJzZSB0aGVpciBvd24gY29tbWFuZCBsaW5lIGFyZ3MuIHRvb2xzIHR5cGljYWxseVxyXG4gICAgICAgICAgICAgICAgLy8gYXNzdW1lIHRoZWlyIGFyZ3VtZW50cyBiZWdpbiBhZnRlciBhcmcgMC5cclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICAvLyBieSBoaWphY2tpbmcgdW5zaGlmdCwgd2UgY2FuIHF1b3RlIHRoZSB0b29sIHBhdGggd2hlbiBpdCBwdXNoZWQgb250byB0aGUgYXJncyBhcnJheS4gTm9kZSBidWlsZHNcclxuICAgICAgICAgICAgICAgIC8vIHRoZSBjbWRsaW5lIHBhcmFtZXRlciBmcm9tIHRoZSBhcmdzIGFycmF5LlxyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIC8vIG5vdGUsIHdlIGNhbid0IHNpbXBseSBwYXNzIGEgcXVvdGVkIHRvb2wgcGF0aCB0byBOb2RlIGZvciBtdWx0aXBsZSByZWFzb25zOlxyXG4gICAgICAgICAgICAgICAgLy8gICAxKSBOb2RlIHZlcmlmaWVzIHRoZSBmaWxlIGV4aXN0cyAoY2FsbHMgd2luMzIgZnVuY3Rpb24gR2V0RmlsZUF0dHJpYnV0ZXNXKSBhbmQgdGhlIGNoZWNrIHJldHVybnNcclxuICAgICAgICAgICAgICAgIC8vICAgICAgZmFsc2UgaWYgdGhlIHBhdGggaXMgcXVvdGVkLlxyXG4gICAgICAgICAgICAgICAgLy8gICAyKSBOb2RlIHBhc3NlcyB0aGUgdG9vbCBwYXRoIGFzIHRoZSBhcHBsaWNhdGlvbiBwYXJhbWV0ZXIgdG8gQ3JlYXRlUHJvY2Vzcywgd2hpY2ggZXhwZWN0cyB0aGVcclxuICAgICAgICAgICAgICAgIC8vICAgICAgcGF0aCB0byBiZSB1bnF1b3RlZC5cclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICAvLyBhbHNvIG5vdGUsIGluIGFkZGl0aW9uIHRvIHRoZSB0b29sIHBhdGggYmVpbmcgZW1iZWRkZWQgd2l0aGluIHRoZSBjbWRsaW5lIHBhcmFtZXRlciwgTm9kZSBhbHNvXHJcbiAgICAgICAgICAgICAgICAvLyBwYXNzZXMgdGhlIHRvb2wgcGF0aCB0byBDcmVhdGVQcm9jZXNzIHZpYSB0aGUgYXBwbGljYXRpb24gcGFyYW1ldGVyIChvcHRpb25hbCBwYXJhbWV0ZXIpLiB3aGVuXHJcbiAgICAgICAgICAgICAgICAvLyBwcmVzZW50LCBXaW5kb3dzIHVzZXMgdGhlIGFwcGxpY2F0aW9uIHBhcmFtZXRlciB0byBkZXRlcm1pbmUgd2hpY2ggZmlsZSB0byBydW4sIGluc3RlYWQgb2ZcclxuICAgICAgICAgICAgICAgIC8vIGludGVycHJldGluZyB0aGUgZmlsZSBmcm9tIHRoZSBjbWRsaW5lIHBhcmFtZXRlci5cclxuICAgICAgICAgICAgICAgIGFyZ3NfMS51bnNoaWZ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICE9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGFyZ3VtZW50cyBwYXNzZWQgdG8gYXJncy51bnNoaWZ0IHdoZW4gd2luZG93c1ZlcmJhdGltQXJndW1lbnRzIGZsYWcgaXMgc2V0LicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuY2FsbChhcmdzXzEsIFwiXFxcIlwiICsgYXJndW1lbnRzWzBdICsgXCJcXFwiXCIpOyAvLyBxdW90ZSB0aGUgZmlsZSBuYW1lXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3NfMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5hcmdzO1xyXG4gICAgfTtcclxuICAgIFRvb2xSdW5uZXIucHJvdG90eXBlLl9pc0NtZEZpbGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHVwcGVyVG9vbFBhdGggPSB0aGlzLnRvb2xQYXRoLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgcmV0dXJuIGltLl9lbmRzV2l0aCh1cHBlclRvb2xQYXRoLCAnLkNNRCcpIHx8IGltLl9lbmRzV2l0aCh1cHBlclRvb2xQYXRoLCAnLkJBVCcpO1xyXG4gICAgfTtcclxuICAgIFRvb2xSdW5uZXIucHJvdG90eXBlLl93aW5kb3dzUXVvdGVDbWRBcmcgPSBmdW5jdGlvbiAoYXJnKSB7XHJcbiAgICAgICAgLy8gZm9yIC5leGUsIGFwcGx5IHRoZSBub3JtYWwgcXVvdGluZyBydWxlcyB0aGF0IGxpYnV2IGFwcGxpZXNcclxuICAgICAgICBpZiAoIXRoaXMuX2lzQ21kRmlsZSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl91dl9xdW90ZV9jbWRfYXJnKGFyZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG90aGVyd2lzZSBhcHBseSBxdW90aW5nIHJ1bGVzIHNwZWNpZmljIHRvIHRoZSBjbWQuZXhlIGNvbW1hbmQgbGluZSBwYXJzZXIuXHJcbiAgICAgICAgLy8gdGhlIGxpYnV2IHJ1bGVzIGFyZSBnZW5lcmljIGFuZCBhcmUgbm90IGRlc2lnbmVkIHNwZWNpZmljYWxseSBmb3IgY21kLmV4ZVxyXG4gICAgICAgIC8vIGNvbW1hbmQgbGluZSBwYXJzZXIuXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBmb3IgYSBkZXRhaWxlZCBkZXNjcmlwdGlvbiBvZiB0aGUgY21kLmV4ZSBjb21tYW5kIGxpbmUgcGFyc2VyLCByZWZlciB0b1xyXG4gICAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNDA5NDY5OS9ob3ctZG9lcy10aGUtd2luZG93cy1jb21tYW5kLWludGVycHJldGVyLWNtZC1leGUtcGFyc2Utc2NyaXB0cy83OTcwOTEyIzc5NzA5MTJcclxuICAgICAgICAvLyBuZWVkIHF1b3RlcyBmb3IgZW1wdHkgYXJnXHJcbiAgICAgICAgaWYgKCFhcmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdcIlwiJztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGFyZyBuZWVkcyB0byBiZSBxdW90ZWRcclxuICAgICAgICB2YXIgY21kU3BlY2lhbENoYXJzID0gWycgJywgJ1xcdCcsICcmJywgJygnLCAnKScsICdbJywgJ10nLCAneycsICd9JywgJ14nLCAnPScsICc7JywgJyEnLCAnXFwnJywgJysnLCAnLCcsICdgJywgJ34nLCAnfCcsICc8JywgJz4nLCAnXCInXTtcclxuICAgICAgICB2YXIgbmVlZHNRdW90ZXMgPSBmYWxzZTtcclxuICAgICAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uIChjaGFyKSB7XHJcbiAgICAgICAgICAgIGlmIChjbWRTcGVjaWFsQ2hhcnMuc29tZShmdW5jdGlvbiAoeCkgeyByZXR1cm4geCA9PSBjaGFyOyB9KSkge1xyXG4gICAgICAgICAgICAgICAgbmVlZHNRdW90ZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiYnJlYWtcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBhcmdfMSA9IGFyZzsgX2kgPCBhcmdfMS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgdmFyIGNoYXIgPSBhcmdfMVtfaV07XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZV8xID0gX2xvb3BfMShjaGFyKTtcclxuICAgICAgICAgICAgaWYgKHN0YXRlXzEgPT09IFwiYnJlYWtcIilcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzaG9ydC1jaXJjdWl0IGlmIHF1b3RlcyBub3QgbmVlZGVkXHJcbiAgICAgICAgaWYgKCFuZWVkc1F1b3Rlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gYXJnO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0aGUgZm9sbG93aW5nIHF1b3RpbmcgcnVsZXMgYXJlIHZlcnkgc2ltaWxhciB0byB0aGUgcnVsZXMgdGhhdCBieSBsaWJ1diBhcHBsaWVzLlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gMSkgd3JhcCB0aGUgc3RyaW5nIGluIHF1b3Rlc1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gMikgZG91YmxlLXVwIHF1b3RlcyAtIGkuZS4gXCIgPT4gXCJcIlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgdGhpcyBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgbGlidXYgcXVvdGluZyBydWxlcy4gbGlidXYgcmVwbGFjZXMgXCIgd2l0aCBcXFwiLCB3aGljaCB1bmZvcnR1bmF0ZWx5XHJcbiAgICAgICAgLy8gICAgZG9lc24ndCB3b3JrIHdlbGwgd2l0aCBhIGNtZC5leGUgY29tbWFuZCBsaW5lLlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgbm90ZSwgcmVwbGFjaW5nIFwiIHdpdGggXCJcIiBhbHNvIHdvcmtzIHdlbGwgaWYgdGhlIGFyZyBpcyBwYXNzZWQgdG8gYSBkb3duc3RyZWFtIC5ORVQgY29uc29sZSBhcHAuXHJcbiAgICAgICAgLy8gICAgZm9yIGV4YW1wbGUsIHRoZSBjb21tYW5kIGxpbmU6XHJcbiAgICAgICAgLy8gICAgICAgICAgZm9vLmV4ZSBcIm15YXJnOlwiXCJteSB2YWxcIlwiXCJcclxuICAgICAgICAvLyAgICBpcyBwYXJzZWQgYnkgYSAuTkVUIGNvbnNvbGUgYXBwIGludG8gYW4gYXJnIGFycmF5OlxyXG4gICAgICAgIC8vICAgICAgICAgIFsgXCJteWFyZzpcXFwibXkgdmFsXFxcIlwiIF1cclxuICAgICAgICAvLyAgICB3aGljaCBpcyB0aGUgc2FtZSBlbmQgcmVzdWx0IHdoZW4gYXBwbHlpbmcgbGlidXYgcXVvdGluZyBydWxlcy4gYWx0aG91Z2ggdGhlIGFjdHVhbFxyXG4gICAgICAgIC8vICAgIGNvbW1hbmQgbGluZSBmcm9tIGxpYnV2IHF1b3RpbmcgcnVsZXMgd291bGQgbG9vayBsaWtlOlxyXG4gICAgICAgIC8vICAgICAgICAgIGZvby5leGUgXCJteWFyZzpcXFwibXkgdmFsXFxcIlwiXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAzKSBkb3VibGUtdXAgc2xhc2hlcyB0aGF0IHByZWNlZWQgYSBxdW90ZSxcclxuICAgICAgICAvLyAgICBlLmcuICBoZWxsbyBcXHdvcmxkICAgID0+IFwiaGVsbG8gXFx3b3JsZFwiXHJcbiAgICAgICAgLy8gICAgICAgICAgaGVsbG9cXFwid29ybGQgICAgPT4gXCJoZWxsb1xcXFxcIlwid29ybGRcIlxyXG4gICAgICAgIC8vICAgICAgICAgIGhlbGxvXFxcXFwid29ybGQgICA9PiBcImhlbGxvXFxcXFxcXFxcIlwid29ybGRcIlxyXG4gICAgICAgIC8vICAgICAgICAgIGhlbGxvIHdvcmxkXFwgICAgPT4gXCJoZWxsbyB3b3JsZFxcXFxcIlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgdGVjaG5pY2FsbHkgdGhpcyBpcyBub3QgcmVxdWlyZWQgZm9yIGEgY21kLmV4ZSBjb21tYW5kIGxpbmUsIG9yIHRoZSBiYXRjaCBhcmd1bWVudCBwYXJzZXIuXHJcbiAgICAgICAgLy8gICAgdGhlIHJlYXNvbnMgZm9yIGluY2x1ZGluZyB0aGlzIGFzIGEgLmNtZCBxdW90aW5nIHJ1bGUgYXJlOlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgYSkgdGhpcyBpcyBvcHRpbWl6ZWQgZm9yIHRoZSBzY2VuYXJpbyB3aGVyZSB0aGUgYXJndW1lbnQgaXMgcGFzc2VkIGZyb20gdGhlIC5jbWQgZmlsZSB0byBhblxyXG4gICAgICAgIC8vICAgICAgIGV4dGVybmFsIHByb2dyYW0uIG1hbnkgcHJvZ3JhbXMgKGUuZy4gLk5FVCBjb25zb2xlIGFwcHMpIHJlbHkgb24gdGhlIHNsYXNoLWRvdWJsaW5nIHJ1bGUuXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgICBiKSBpdCdzIHdoYXQgd2UndmUgYmVlbiBkb2luZyBwcmV2aW91c2x5IChieSBkZWZlcnJpbmcgdG8gbm9kZSBkZWZhdWx0IGJlaGF2aW9yKSBhbmQgd2VcclxuICAgICAgICAvLyAgICAgICBoYXZlbid0IGhlYXJkIGFueSBjb21wbGFpbnRzIGFib3V0IHRoYXQgYXNwZWN0LlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gbm90ZSwgYSB3ZWFrbmVzcyBvZiB0aGUgcXVvdGluZyBydWxlcyBjaG9zZW4gaGVyZSwgaXMgdGhhdCAlIGlzIG5vdCBlc2NhcGVkLiBpbiBmYWN0LCAlIGNhbm5vdCBiZVxyXG4gICAgICAgIC8vIGVzY2FwZWQgd2hlbiB1c2VkIG9uIHRoZSBjb21tYW5kIGxpbmUgZGlyZWN0bHkgLSBldmVuIHRob3VnaCB3aXRoaW4gYSAuY21kIGZpbGUgJSBjYW4gYmUgZXNjYXBlZFxyXG4gICAgICAgIC8vIGJ5IHVzaW5nICUlLlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gdGhlIHNhdmluZyBncmFjZSBpcywgb24gdGhlIGNvbW1hbmQgbGluZSwgJXZhciUgaXMgbGVmdCBhcy1pcyBpZiB2YXIgaXMgbm90IGRlZmluZWQuIHRoaXMgY29udHJhc3RzXHJcbiAgICAgICAgLy8gdGhlIGxpbmUgcGFyc2luZyBydWxlcyB3aXRoaW4gYSAuY21kIGZpbGUsIHdoZXJlIGlmIHZhciBpcyBub3QgZGVmaW5lZCBpdCBpcyByZXBsYWNlZCB3aXRoIG5vdGhpbmcuXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBvbmUgb3B0aW9uIHRoYXQgd2FzIGV4cGxvcmVkIHdhcyByZXBsYWNpbmcgJSB3aXRoIF4lIC0gaS5lLiAldmFyJSA9PiBeJXZhcl4lLiB0aGlzIGhhY2sgd291bGRcclxuICAgICAgICAvLyBvZnRlbiB3b3JrLCBzaW5jZSBpdCBpcyB1bmxpa2VseSB0aGF0IHZhcl4gd291bGQgZXhpc3QsIGFuZCB0aGUgXiBjaGFyYWN0ZXIgaXMgcmVtb3ZlZCB3aGVuIHRoZVxyXG4gICAgICAgIC8vIHZhcmlhYmxlIGlzIHVzZWQuIHRoZSBwcm9ibGVtLCBob3dldmVyLCBpcyB0aGF0IF4gaXMgbm90IHJlbW92ZWQgd2hlbiAlKiBpcyB1c2VkIHRvIHBhc3MgdGhlIGFyZ3NcclxuICAgICAgICAvLyB0byBhbiBleHRlcm5hbCBwcm9ncmFtLlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gYW4gdW5leHBsb3JlZCBwb3RlbnRpYWwgc29sdXRpb24gZm9yIHRoZSAlIGVzY2FwaW5nIHByb2JsZW0sIGlzIHRvIGNyZWF0ZSBhIHdyYXBwZXIgLmNtZCBmaWxlLlxyXG4gICAgICAgIC8vICUgY2FuIGJlIGVzY2FwZWQgd2l0aGluIGEgLmNtZCBmaWxlLlxyXG4gICAgICAgIHZhciByZXZlcnNlID0gJ1wiJztcclxuICAgICAgICB2YXIgcXVvdGVfaGl0ID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gYXJnLmxlbmd0aDsgaSA+IDA7IGktLSkgeyAvLyB3YWxrIHRoZSBzdHJpbmcgaW4gcmV2ZXJzZVxyXG4gICAgICAgICAgICByZXZlcnNlICs9IGFyZ1tpIC0gMV07XHJcbiAgICAgICAgICAgIGlmIChxdW90ZV9oaXQgJiYgYXJnW2kgLSAxXSA9PSAnXFxcXCcpIHtcclxuICAgICAgICAgICAgICAgIHJldmVyc2UgKz0gJ1xcXFwnOyAvLyBkb3VibGUgdGhlIHNsYXNoXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoYXJnW2kgLSAxXSA9PSAnXCInKSB7XHJcbiAgICAgICAgICAgICAgICBxdW90ZV9oaXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV2ZXJzZSArPSAnXCInOyAvLyBkb3VibGUgdGhlIHF1b3RlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBxdW90ZV9oaXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXZlcnNlICs9ICdcIic7XHJcbiAgICAgICAgcmV0dXJuIHJldmVyc2Uuc3BsaXQoJycpLnJldmVyc2UoKS5qb2luKCcnKTtcclxuICAgIH07XHJcbiAgICBUb29sUnVubmVyLnByb3RvdHlwZS5fdXZfcXVvdGVfY21kX2FyZyA9IGZ1bmN0aW9uIChhcmcpIHtcclxuICAgICAgICAvLyBUb29sIHJ1bm5lciB3cmFwcyBjaGlsZF9wcm9jZXNzLnNwYXduKCkgYW5kIG5lZWRzIHRvIGFwcGx5IHRoZSBzYW1lIHF1b3RpbmcgYXNcclxuICAgICAgICAvLyBOb2RlIGluIGNlcnRhaW4gY2FzZXMgd2hlcmUgdGhlIHVuZG9jdW1lbnRlZCBzcGF3biBvcHRpb24gd2luZG93c1ZlcmJhdGltQXJndW1lbnRzXHJcbiAgICAgICAgLy8gaXMgdXNlZC5cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIFNpbmNlIHRoaXMgZnVuY3Rpb24gaXMgYSBwb3J0IG9mIHF1b3RlX2NtZF9hcmcgZnJvbSBOb2RlIDQueCAodGVjaG5pY2FsbHksIGxpYiBVVixcclxuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvdjQueC9kZXBzL3V2L3NyYy93aW4vcHJvY2Vzcy5jIGZvciBkZXRhaWxzKSxcclxuICAgICAgICAvLyBwYXN0aW5nIGNvcHlyaWdodCBub3RpY2UgZnJvbSBOb2RlIHdpdGhpbiB0aGlzIGZ1bmN0aW9uOlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgICBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vICAgICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gICAgICAgIC8vICAgICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG9cclxuICAgICAgICAvLyAgICAgIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlXHJcbiAgICAgICAgLy8gICAgICByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3JcclxuICAgICAgICAvLyAgICAgIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbiAgICAgICAgLy8gICAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gICAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxyXG4gICAgICAgIC8vICAgICAgYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICAgICAgICAvLyAgICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gICAgICAgIC8vICAgICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAgICAgICAgLy8gICAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAgICAgICAgLy8gICAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xyXG4gICAgICAgIC8vICAgICAgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HU1xyXG4gICAgICAgIC8vICAgICAgSU4gVEhFIFNPRlRXQVJFLlxyXG4gICAgICAgIGlmICghYXJnKSB7XHJcbiAgICAgICAgICAgIC8vIE5lZWQgZG91YmxlIHF1b3RhdGlvbiBmb3IgZW1wdHkgYXJndW1lbnRcclxuICAgICAgICAgICAgcmV0dXJuICdcIlwiJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGFyZy5pbmRleE9mKCcgJykgPCAwICYmIGFyZy5pbmRleE9mKCdcXHQnKSA8IDAgJiYgYXJnLmluZGV4T2YoJ1wiJykgPCAwKSB7XHJcbiAgICAgICAgICAgIC8vIE5vIHF1b3RhdGlvbiBuZWVkZWRcclxuICAgICAgICAgICAgcmV0dXJuIGFyZztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGFyZy5pbmRleE9mKCdcIicpIDwgMCAmJiBhcmcuaW5kZXhPZignXFxcXCcpIDwgMCkge1xyXG4gICAgICAgICAgICAvLyBObyBlbWJlZGRlZCBkb3VibGUgcXVvdGVzIG9yIGJhY2tzbGFzaGVzLCBzbyBJIGNhbiBqdXN0IHdyYXBcclxuICAgICAgICAgICAgLy8gcXVvdGUgbWFya3MgYXJvdW5kIHRoZSB3aG9sZSB0aGluZy5cclxuICAgICAgICAgICAgcmV0dXJuIFwiXFxcIlwiICsgYXJnICsgXCJcXFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEV4cGVjdGVkIGlucHV0L291dHB1dDpcclxuICAgICAgICAvLyAgIGlucHV0IDogaGVsbG9cIndvcmxkXHJcbiAgICAgICAgLy8gICBvdXRwdXQ6IFwiaGVsbG9cXFwid29ybGRcIlxyXG4gICAgICAgIC8vICAgaW5wdXQgOiBoZWxsb1wiXCJ3b3JsZFxyXG4gICAgICAgIC8vICAgb3V0cHV0OiBcImhlbGxvXFxcIlxcXCJ3b3JsZFwiXHJcbiAgICAgICAgLy8gICBpbnB1dCA6IGhlbGxvXFx3b3JsZFxyXG4gICAgICAgIC8vICAgb3V0cHV0OiBoZWxsb1xcd29ybGRcclxuICAgICAgICAvLyAgIGlucHV0IDogaGVsbG9cXFxcd29ybGRcclxuICAgICAgICAvLyAgIG91dHB1dDogaGVsbG9cXFxcd29ybGRcclxuICAgICAgICAvLyAgIGlucHV0IDogaGVsbG9cXFwid29ybGRcclxuICAgICAgICAvLyAgIG91dHB1dDogXCJoZWxsb1xcXFxcXFwid29ybGRcIlxyXG4gICAgICAgIC8vICAgaW5wdXQgOiBoZWxsb1xcXFxcIndvcmxkXHJcbiAgICAgICAgLy8gICBvdXRwdXQ6IFwiaGVsbG9cXFxcXFxcXFxcXCJ3b3JsZFwiXHJcbiAgICAgICAgLy8gICBpbnB1dCA6IGhlbGxvIHdvcmxkXFxcclxuICAgICAgICAvLyAgIG91dHB1dDogXCJoZWxsbyB3b3JsZFxcXFxcIiAtIG5vdGUgdGhlIGNvbW1lbnQgaW4gbGlidXYgYWN0dWFsbHkgcmVhZHMgXCJoZWxsbyB3b3JsZFxcXCJcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnV0IGl0IGFwcGVhcnMgdGhlIGNvbW1lbnQgaXMgd3JvbmcsIGl0IHNob3VsZCBiZSBcImhlbGxvIHdvcmxkXFxcXFwiXHJcbiAgICAgICAgdmFyIHJldmVyc2UgPSAnXCInO1xyXG4gICAgICAgIHZhciBxdW90ZV9oaXQgPSB0cnVlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSBhcmcubGVuZ3RoOyBpID4gMDsgaS0tKSB7IC8vIHdhbGsgdGhlIHN0cmluZyBpbiByZXZlcnNlXHJcbiAgICAgICAgICAgIHJldmVyc2UgKz0gYXJnW2kgLSAxXTtcclxuICAgICAgICAgICAgaWYgKHF1b3RlX2hpdCAmJiBhcmdbaSAtIDFdID09ICdcXFxcJykge1xyXG4gICAgICAgICAgICAgICAgcmV2ZXJzZSArPSAnXFxcXCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoYXJnW2kgLSAxXSA9PSAnXCInKSB7XHJcbiAgICAgICAgICAgICAgICBxdW90ZV9oaXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV2ZXJzZSArPSAnXFxcXCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBxdW90ZV9oaXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXZlcnNlICs9ICdcIic7XHJcbiAgICAgICAgcmV0dXJuIHJldmVyc2Uuc3BsaXQoJycpLnJldmVyc2UoKS5qb2luKCcnKTtcclxuICAgIH07XHJcbiAgICBUb29sUnVubmVyLnByb3RvdHlwZS5fY2xvbmVFeGVjT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgICAgICAgY3dkOiBvcHRpb25zLmN3ZCB8fCBwcm9jZXNzLmN3ZCgpLFxyXG4gICAgICAgICAgICBlbnY6IG9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52LFxyXG4gICAgICAgICAgICBzaWxlbnQ6IG9wdGlvbnMuc2lsZW50IHx8IGZhbHNlLFxyXG4gICAgICAgICAgICBmYWlsT25TdGRFcnI6IG9wdGlvbnMuZmFpbE9uU3RkRXJyIHx8IGZhbHNlLFxyXG4gICAgICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiBvcHRpb25zLmlnbm9yZVJldHVybkNvZGUgfHwgZmFsc2UsXHJcbiAgICAgICAgICAgIHdpbmRvd3NWZXJiYXRpbUFyZ3VtZW50czogb3B0aW9ucy53aW5kb3dzVmVyYmF0aW1Bcmd1bWVudHMgfHwgZmFsc2UsXHJcbiAgICAgICAgICAgIHNoZWxsOiBvcHRpb25zLnNoZWxsIHx8IGZhbHNlXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXN1bHQub3V0U3RyZWFtID0gb3B0aW9ucy5vdXRTdHJlYW0gfHwgcHJvY2Vzcy5zdGRvdXQ7XHJcbiAgICAgICAgcmVzdWx0LmVyclN0cmVhbSA9IG9wdGlvbnMuZXJyU3RyZWFtIHx8IHByb2Nlc3Muc3RkZXJyO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgVG9vbFJ1bm5lci5wcm90b3R5cGUuX2dldFNwYXduT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICAgIHJlc3VsdC5jd2QgPSBvcHRpb25zLmN3ZDtcclxuICAgICAgICByZXN1bHQuZW52ID0gb3B0aW9ucy5lbnY7XHJcbiAgICAgICAgcmVzdWx0LnNoZWxsID0gb3B0aW9ucy5zaGVsbDtcclxuICAgICAgICByZXN1bHRbJ3dpbmRvd3NWZXJiYXRpbUFyZ3VtZW50cyddID0gb3B0aW9ucy53aW5kb3dzVmVyYmF0aW1Bcmd1bWVudHMgfHwgdGhpcy5faXNDbWRGaWxlKCk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICBUb29sUnVubmVyLnByb3RvdHlwZS5fZ2V0U3Bhd25TeW5jT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICAgIHJlc3VsdC5jd2QgPSBvcHRpb25zLmN3ZDtcclxuICAgICAgICByZXN1bHQuZW52ID0gb3B0aW9ucy5lbnY7XHJcbiAgICAgICAgcmVzdWx0LnNoZWxsID0gb3B0aW9ucy5zaGVsbDtcclxuICAgICAgICByZXN1bHRbJ3dpbmRvd3NWZXJiYXRpbUFyZ3VtZW50cyddID0gb3B0aW9ucy53aW5kb3dzVmVyYmF0aW1Bcmd1bWVudHMgfHwgdGhpcy5faXNDbWRGaWxlKCk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICBUb29sUnVubmVyLnByb3RvdHlwZS5leGVjV2l0aFBpcGluZyA9IGZ1bmN0aW9uIChwaXBlT3V0cHV0VG9Ub29sLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgZGVmZXIgPSBRLmRlZmVyKCk7XHJcbiAgICAgICAgdGhpcy5fZGVidWcoJ2V4ZWMgdG9vbDogJyArIHRoaXMudG9vbFBhdGgpO1xyXG4gICAgICAgIHRoaXMuX2RlYnVnKCdhcmd1bWVudHM6Jyk7XHJcbiAgICAgICAgdGhpcy5hcmdzLmZvckVhY2goZnVuY3Rpb24gKGFyZykge1xyXG4gICAgICAgICAgICBfdGhpcy5fZGVidWcoJyAgICcgKyBhcmcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICB2YXIgb3B0aW9uc05vbk51bGwgPSB0aGlzLl9jbG9uZUV4ZWNPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIGlmICghb3B0aW9uc05vbk51bGwuc2lsZW50KSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnNOb25OdWxsLm91dFN0cmVhbS53cml0ZSh0aGlzLl9nZXRDb21tYW5kU3RyaW5nKG9wdGlvbnNOb25OdWxsKSArIG9zLkVPTCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjcDtcclxuICAgICAgICB2YXIgdG9vbFBhdGggPSBwaXBlT3V0cHV0VG9Ub29sLnRvb2xQYXRoO1xyXG4gICAgICAgIHZhciB0b29sUGF0aEZpcnN0O1xyXG4gICAgICAgIHZhciBzdWNjZXNzRmlyc3QgPSB0cnVlO1xyXG4gICAgICAgIHZhciByZXR1cm5Db2RlRmlyc3Q7XHJcbiAgICAgICAgdmFyIGZpbGVTdHJlYW07XHJcbiAgICAgICAgdmFyIHdhaXRpbmdFdmVudHMgPSAwOyAvLyBudW1iZXIgb2YgcHJvY2VzcyBvciBzdHJlYW0gZXZlbnRzIHdlIGFyZSB3YWl0aW5nIG9uIHRvIGNvbXBsZXRlXHJcbiAgICAgICAgdmFyIHJldHVybkNvZGUgPSAwO1xyXG4gICAgICAgIHZhciBlcnJvcjtcclxuICAgICAgICB0b29sUGF0aEZpcnN0ID0gdGhpcy50b29sUGF0aDtcclxuICAgICAgICAvLyBGb2xsb3dpbmcgbm9kZSBkb2N1bWVudGF0aW9uIGV4YW1wbGUgZnJvbSB0aGlzIGxpbmsgb24gaG93IHRvIHBpcGUgb3V0cHV0IG9mIG9uZSBwcm9jZXNzIHRvIGFub3RoZXJcclxuICAgICAgICAvLyBodHRwczovL25vZGVqcy5vcmcvYXBpL2NoaWxkX3Byb2Nlc3MuaHRtbCNjaGlsZF9wcm9jZXNzX2NoaWxkX3Byb2Nlc3Nfc3Bhd25fY29tbWFuZF9hcmdzX29wdGlvbnNcclxuICAgICAgICAvL3N0YXJ0IHRoZSBjaGlsZCBwcm9jZXNzIGZvciBib3RoIHRvb2xzXHJcbiAgICAgICAgd2FpdGluZ0V2ZW50cysrO1xyXG4gICAgICAgIHZhciBjcEZpcnN0ID0gY2hpbGQuc3Bhd24odGhpcy5fZ2V0U3Bhd25GaWxlTmFtZSgpLCB0aGlzLl9nZXRTcGF3bkFyZ3Mob3B0aW9uc05vbk51bGwpLCB0aGlzLl9nZXRTcGF3bk9wdGlvbnMob3B0aW9uc05vbk51bGwpKTtcclxuICAgICAgICB3YWl0aW5nRXZlbnRzKys7XHJcbiAgICAgICAgY3AgPSBjaGlsZC5zcGF3bihwaXBlT3V0cHV0VG9Ub29sLl9nZXRTcGF3bkZpbGVOYW1lKCksIHBpcGVPdXRwdXRUb1Rvb2wuX2dldFNwYXduQXJncyhvcHRpb25zTm9uTnVsbCksIHBpcGVPdXRwdXRUb1Rvb2wuX2dldFNwYXduT3B0aW9ucyhvcHRpb25zTm9uTnVsbCkpO1xyXG4gICAgICAgIGZpbGVTdHJlYW0gPSB0aGlzLnBpcGVPdXRwdXRUb0ZpbGUgPyBmcy5jcmVhdGVXcml0ZVN0cmVhbSh0aGlzLnBpcGVPdXRwdXRUb0ZpbGUpIDogbnVsbDtcclxuICAgICAgICBpZiAoZmlsZVN0cmVhbSkge1xyXG4gICAgICAgICAgICB3YWl0aW5nRXZlbnRzKys7XHJcbiAgICAgICAgICAgIGZpbGVTdHJlYW0ub24oJ2ZpbmlzaCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHdhaXRpbmdFdmVudHMtLTsgLy9maWxlIHdyaXRlIGlzIGNvbXBsZXRlXHJcbiAgICAgICAgICAgICAgICBmaWxlU3RyZWFtID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGlmICh3YWl0aW5nRXZlbnRzID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmUocmV0dXJuQ29kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZmlsZVN0cmVhbS5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICB3YWl0aW5nRXZlbnRzLS07IC8vdGhlcmUgd2VyZSBlcnJvcnMgd3JpdGluZyB0byB0aGUgZmlsZSwgd3JpdGUgaXMgZG9uZVxyXG4gICAgICAgICAgICAgICAgX3RoaXMuX2RlYnVnKFwiRmFpbGVkIHRvIHBpcGUgb3V0cHV0IG9mIFwiICsgdG9vbFBhdGhGaXJzdCArIFwiIHRvIGZpbGUgXCIgKyBfdGhpcy5waXBlT3V0cHV0VG9GaWxlICsgXCIuIEVycm9yID0gXCIgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgZmlsZVN0cmVhbSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBpZiAod2FpdGluZ0V2ZW50cyA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKHJldHVybkNvZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vcGlwZSBzdGRvdXQgb2YgZmlyc3QgdG9vbCB0byBzdGRpbiBvZiBzZWNvbmQgdG9vbFxyXG4gICAgICAgIGNwRmlyc3Quc3Rkb3V0Lm9uKCdkYXRhJywgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmIChmaWxlU3RyZWFtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZVN0cmVhbS53cml0ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNwLnN0ZGluLndyaXRlKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLl9kZWJ1ZygnRmFpbGVkIHRvIHBpcGUgb3V0cHV0IG9mICcgKyB0b29sUGF0aEZpcnN0ICsgJyB0byAnICsgdG9vbFBhdGgpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuX2RlYnVnKHRvb2xQYXRoICsgJyBtaWdodCBoYXZlIGV4aXRlZCBkdWUgdG8gZXJyb3JzIHByZW1hdHVyZWx5LiBWZXJpZnkgdGhlIGFyZ3VtZW50cyBwYXNzZWQgYXJlIHZhbGlkLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY3BGaXJzdC5zdGRlcnIub24oJ2RhdGEnLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoZmlsZVN0cmVhbSkge1xyXG4gICAgICAgICAgICAgICAgZmlsZVN0cmVhbS53cml0ZShkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdWNjZXNzRmlyc3QgPSAhb3B0aW9uc05vbk51bGwuZmFpbE9uU3RkRXJyO1xyXG4gICAgICAgICAgICBpZiAoIW9wdGlvbnNOb25OdWxsLnNpbGVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHMgPSBvcHRpb25zTm9uTnVsbC5mYWlsT25TdGRFcnIgPyBvcHRpb25zTm9uTnVsbC5lcnJTdHJlYW0gOiBvcHRpb25zTm9uTnVsbC5vdXRTdHJlYW07XHJcbiAgICAgICAgICAgICAgICBzLndyaXRlKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY3BGaXJzdC5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgIHdhaXRpbmdFdmVudHMtLTsgLy9maXJzdCBwcm9jZXNzIGlzIGNvbXBsZXRlIHdpdGggZXJyb3JzXHJcbiAgICAgICAgICAgIGlmIChmaWxlU3RyZWFtKSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlU3RyZWFtLmVuZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNwLnN0ZGluLmVuZCgpO1xyXG4gICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcih0b29sUGF0aEZpcnN0ICsgJyBmYWlsZWQuICcgKyBlcnIubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIGlmICh3YWl0aW5nRXZlbnRzID09IDApIHtcclxuICAgICAgICAgICAgICAgIGRlZmVyLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBjcEZpcnN0Lm9uKCdjbG9zZScsIGZ1bmN0aW9uIChjb2RlLCBzaWduYWwpIHtcclxuICAgICAgICAgICAgd2FpdGluZ0V2ZW50cy0tOyAvL2ZpcnN0IHByb2Nlc3MgaXMgY29tcGxldGVcclxuICAgICAgICAgICAgaWYgKGNvZGUgIT0gMCAmJiAhb3B0aW9uc05vbk51bGwuaWdub3JlUmV0dXJuQ29kZSkge1xyXG4gICAgICAgICAgICAgICAgc3VjY2Vzc0ZpcnN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5Db2RlRmlyc3QgPSBjb2RlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuQ29kZSA9IHJldHVybkNvZGVGaXJzdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfdGhpcy5fZGVidWcoJ3N1Y2Nlc3Mgb2YgZmlyc3QgdG9vbDonICsgc3VjY2Vzc0ZpcnN0KTtcclxuICAgICAgICAgICAgaWYgKGZpbGVTdHJlYW0pIHtcclxuICAgICAgICAgICAgICAgIGZpbGVTdHJlYW0uZW5kKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3Auc3RkaW4uZW5kKCk7XHJcbiAgICAgICAgICAgIGlmICh3YWl0aW5nRXZlbnRzID09IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKHJldHVybkNvZGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHN0ZGJ1ZmZlciA9ICcnO1xyXG4gICAgICAgIGNwLnN0ZG91dC5vbignZGF0YScsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIF90aGlzLmVtaXQoJ3N0ZG91dCcsIGRhdGEpO1xyXG4gICAgICAgICAgICBpZiAoIW9wdGlvbnNOb25OdWxsLnNpbGVudCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uc05vbk51bGwub3V0U3RyZWFtLndyaXRlKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLl9wcm9jZXNzTGluZUJ1ZmZlcihkYXRhLCBzdGRidWZmZXIsIGZ1bmN0aW9uIChsaW5lKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5lbWl0KCdzdGRsaW5lJywgbGluZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBlcnJidWZmZXIgPSAnJztcclxuICAgICAgICBjcC5zdGRlcnIub24oJ2RhdGEnLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICBfdGhpcy5lbWl0KCdzdGRlcnInLCBkYXRhKTtcclxuICAgICAgICAgICAgc3VjY2VzcyA9ICFvcHRpb25zTm9uTnVsbC5mYWlsT25TdGRFcnI7XHJcbiAgICAgICAgICAgIGlmICghb3B0aW9uc05vbk51bGwuc2lsZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcyA9IG9wdGlvbnNOb25OdWxsLmZhaWxPblN0ZEVyciA/IG9wdGlvbnNOb25OdWxsLmVyclN0cmVhbSA6IG9wdGlvbnNOb25OdWxsLm91dFN0cmVhbTtcclxuICAgICAgICAgICAgICAgIHMud3JpdGUoZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuX3Byb2Nlc3NMaW5lQnVmZmVyKGRhdGEsIGVycmJ1ZmZlciwgZnVuY3Rpb24gKGxpbmUpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLmVtaXQoJ2VycmxpbmUnLCBsaW5lKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY3Aub24oJ2Vycm9yJywgZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICB3YWl0aW5nRXZlbnRzLS07IC8vcHJvY2VzcyBpcyBkb25lIHdpdGggZXJyb3JzXHJcbiAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKHRvb2xQYXRoICsgJyBmYWlsZWQuICcgKyBlcnIubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIGlmICh3YWl0aW5nRXZlbnRzID09IDApIHtcclxuICAgICAgICAgICAgICAgIGRlZmVyLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBjcC5vbignY2xvc2UnLCBmdW5jdGlvbiAoY29kZSwgc2lnbmFsKSB7XHJcbiAgICAgICAgICAgIHdhaXRpbmdFdmVudHMtLTsgLy9wcm9jZXNzIGlzIGNvbXBsZXRlXHJcbiAgICAgICAgICAgIF90aGlzLl9kZWJ1ZygncmM6JyArIGNvZGUpO1xyXG4gICAgICAgICAgICByZXR1cm5Db2RlID0gY29kZTtcclxuICAgICAgICAgICAgaWYgKHN0ZGJ1ZmZlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5lbWl0KCdzdGRsaW5lJywgc3RkYnVmZmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZXJyYnVmZmVyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLmVtaXQoJ2VycmxpbmUnLCBlcnJidWZmZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb2RlICE9IDAgJiYgIW9wdGlvbnNOb25OdWxsLmlnbm9yZVJldHVybkNvZGUpIHtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfdGhpcy5fZGVidWcoJ3N1Y2Nlc3M6JyArIHN1Y2Nlc3MpO1xyXG4gICAgICAgICAgICBpZiAoIXN1Y2Nlc3NGaXJzdCkgeyAvL2luIHRoZSBjYXNlIG91dHB1dCBpcyBwaXBlZCB0byBhbm90aGVyIHRvb2wsIGNoZWNrIGV4aXQgY29kZSBvZiBib3RoIHRvb2xzXHJcbiAgICAgICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcih0b29sUGF0aEZpcnN0ICsgJyBmYWlsZWQgd2l0aCByZXR1cm4gY29kZTogJyArIHJldHVybkNvZGVGaXJzdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIXN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKHRvb2xQYXRoICsgJyBmYWlsZWQgd2l0aCByZXR1cm4gY29kZTogJyArIGNvZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh3YWl0aW5nRXZlbnRzID09IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKHJldHVybkNvZGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2U7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYXJndW1lbnRcclxuICAgICAqIEFwcGVuZCBhbiBhcmd1bWVudCBvciBhbiBhcnJheSBvZiBhcmd1bWVudHNcclxuICAgICAqIHJldHVybnMgVG9vbFJ1bm5lciBmb3IgY2hhaW5pbmdcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gICAgIHZhbCAgICAgICAgc3RyaW5nIGNtZGxpbmUgb3IgYXJyYXkgb2Ygc3RyaW5nc1xyXG4gICAgICogQHJldHVybnMgICBUb29sUnVubmVyXHJcbiAgICAgKi9cclxuICAgIFRvb2xSdW5uZXIucHJvdG90eXBlLmFyZyA9IGZ1bmN0aW9uICh2YWwpIHtcclxuICAgICAgICBpZiAoIXZhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbCBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKHRoaXMudG9vbFBhdGggKyAnIGFyZzogJyArIEpTT04uc3RyaW5naWZ5KHZhbCkpO1xyXG4gICAgICAgICAgICB0aGlzLmFyZ3MgPSB0aGlzLmFyZ3MuY29uY2F0KHZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiAodmFsKSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVidWcodGhpcy50b29sUGF0aCArICcgYXJnOiAnICsgdmFsKTtcclxuICAgICAgICAgICAgdGhpcy5hcmdzID0gdGhpcy5hcmdzLmNvbmNhdCh2YWwudHJpbSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZXMgYW4gYXJndW1lbnQgbGluZSBpbnRvIG9uZSBvciBtb3JlIGFyZ3VtZW50c1xyXG4gICAgICogZS5nLiAubGluZSgnXCJhcmcgb25lXCIgdHdvIC16JykgaXMgZXF1aXZhbGVudCB0byAuYXJnKFsnYXJnIG9uZScsICd0d28nLCAnLXonXSlcclxuICAgICAqIHJldHVybnMgVG9vbFJ1bm5lciBmb3IgY2hhaW5pbmdcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gICAgIHZhbCAgICAgICAgc3RyaW5nIGFyZ3VtZW50IGxpbmVcclxuICAgICAqIEByZXR1cm5zICAgVG9vbFJ1bm5lclxyXG4gICAgICovXHJcbiAgICBUb29sUnVubmVyLnByb3RvdHlwZS5saW5lID0gZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICAgIGlmICghdmFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9kZWJ1Zyh0aGlzLnRvb2xQYXRoICsgJyBhcmc6ICcgKyB2YWwpO1xyXG4gICAgICAgIHRoaXMuYXJncyA9IHRoaXMuYXJncy5jb25jYXQodGhpcy5fYXJnU3RyaW5nVG9BcnJheSh2YWwpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhcmd1bWVudChzKSBpZiBhIGNvbmRpdGlvbiBpcyBtZXRcclxuICAgICAqIFdyYXBzIGFyZygpLiAgU2VlIGFyZyBmb3IgZGV0YWlsc1xyXG4gICAgICogcmV0dXJucyBUb29sUnVubmVyIGZvciBjaGFpbmluZ1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAgICAgY29uZGl0aW9uICAgICBib29sZWFuIGNvbmRpdGlvblxyXG4gICAgICogQHBhcmFtICAgICB2YWwgICAgIHN0cmluZyBjbWRsaW5lIG9yIGFycmF5IG9mIHN0cmluZ3NcclxuICAgICAqIEByZXR1cm5zICAgVG9vbFJ1bm5lclxyXG4gICAgICovXHJcbiAgICBUb29sUnVubmVyLnByb3RvdHlwZS5hcmdJZiA9IGZ1bmN0aW9uIChjb25kaXRpb24sIHZhbCkge1xyXG4gICAgICAgIGlmIChjb25kaXRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5hcmcodmFsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQaXBlIG91dHB1dCBvZiBleGVjKCkgdG8gYW5vdGhlciB0b29sXHJcbiAgICAgKiBAcGFyYW0gdG9vbFxyXG4gICAgICogQHBhcmFtIGZpbGUgIG9wdGlvbmFsIGZpbGVuYW1lIHRvIGFkZGl0aW9uYWxseSBzdHJlYW0gdGhlIG91dHB1dCB0by5cclxuICAgICAqIEByZXR1cm5zIHtUb29sUnVubmVyfVxyXG4gICAgICovXHJcbiAgICBUb29sUnVubmVyLnByb3RvdHlwZS5waXBlRXhlY091dHB1dFRvVG9vbCA9IGZ1bmN0aW9uICh0b29sLCBmaWxlKSB7XHJcbiAgICAgICAgdGhpcy5waXBlT3V0cHV0VG9Ub29sID0gdG9vbDtcclxuICAgICAgICB0aGlzLnBpcGVPdXRwdXRUb0ZpbGUgPSBmaWxlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogRXhlYyBhIHRvb2wuXHJcbiAgICAgKiBPdXRwdXQgd2lsbCBiZSBzdHJlYW1lZCB0byB0aGUgbGl2ZSBjb25zb2xlLlxyXG4gICAgICogUmV0dXJucyBwcm9taXNlIHdpdGggcmV0dXJuIGNvZGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gICAgIHRvb2wgICAgIHBhdGggdG8gdG9vbCB0byBleGVjXHJcbiAgICAgKiBAcGFyYW0gICAgIG9wdGlvbnMgIG9wdGlvbmFsIGV4ZWMgb3B0aW9ucy4gIFNlZSBJRXhlY09wdGlvbnNcclxuICAgICAqIEByZXR1cm5zICAgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIFRvb2xSdW5uZXIucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHRoaXMucGlwZU91dHB1dFRvVG9vbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5leGVjV2l0aFBpcGluZyh0aGlzLnBpcGVPdXRwdXRUb1Rvb2wsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZGVmZXIgPSBRLmRlZmVyKCk7XHJcbiAgICAgICAgdGhpcy5fZGVidWcoJ2V4ZWMgdG9vbDogJyArIHRoaXMudG9vbFBhdGgpO1xyXG4gICAgICAgIHRoaXMuX2RlYnVnKCdhcmd1bWVudHM6Jyk7XHJcbiAgICAgICAgdGhpcy5hcmdzLmZvckVhY2goZnVuY3Rpb24gKGFyZykge1xyXG4gICAgICAgICAgICBfdGhpcy5fZGVidWcoJyAgICcgKyBhcmcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBvcHRpb25zTm9uTnVsbCA9IHRoaXMuX2Nsb25lRXhlY09wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zTm9uTnVsbC5zaWxlbnQpIHtcclxuICAgICAgICAgICAgb3B0aW9uc05vbk51bGwub3V0U3RyZWFtLndyaXRlKHRoaXMuX2dldENvbW1hbmRTdHJpbmcob3B0aW9uc05vbk51bGwpICsgb3MuRU9MKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0YXRlID0gbmV3IEV4ZWNTdGF0ZShvcHRpb25zTm9uTnVsbCwgdGhpcy50b29sUGF0aCk7XHJcbiAgICAgICAgc3RhdGUub24oJ2RlYnVnJywgZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgX3RoaXMuX2RlYnVnKG1lc3NhZ2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBjcCA9IGNoaWxkLnNwYXduKHRoaXMuX2dldFNwYXduRmlsZU5hbWUoKSwgdGhpcy5fZ2V0U3Bhd25BcmdzKG9wdGlvbnNOb25OdWxsKSwgdGhpcy5fZ2V0U3Bhd25PcHRpb25zKG9wdGlvbnMpKTtcclxuICAgICAgICAvLyBpdCBpcyBwb3NzaWJsZSBmb3IgdGhlIGNoaWxkIHByb2Nlc3MgdG8gZW5kIGl0cyBsYXN0IGxpbmUgd2l0aG91dCBhIG5ldyBsaW5lLlxyXG4gICAgICAgIC8vIGJlY2F1c2Ugc3Rkb3V0IGlzIGJ1ZmZlcmVkLCB0aGlzIGNhdXNlcyB0aGUgbGFzdCBsaW5lIHRvIG5vdCBnZXQgc2VudCB0byB0aGUgcGFyZW50XHJcbiAgICAgICAgLy8gc3RyZWFtLiBBZGRpbmcgdGhpcyBldmVudCBmb3JjZXMgYSBmbHVzaCBiZWZvcmUgdGhlIGNoaWxkIHN0cmVhbXMgYXJlIGNsb3NlZC5cclxuICAgICAgICBjcC5zdGRvdXQub24oJ2ZpbmlzaCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCFvcHRpb25zTm9uTnVsbC5zaWxlbnQpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnNOb25OdWxsLm91dFN0cmVhbS53cml0ZShvcy5FT0wpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHN0ZGJ1ZmZlciA9ICcnO1xyXG4gICAgICAgIGNwLnN0ZG91dC5vbignZGF0YScsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIF90aGlzLmVtaXQoJ3N0ZG91dCcsIGRhdGEpO1xyXG4gICAgICAgICAgICBpZiAoIW9wdGlvbnNOb25OdWxsLnNpbGVudCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uc05vbk51bGwub3V0U3RyZWFtLndyaXRlKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLl9wcm9jZXNzTGluZUJ1ZmZlcihkYXRhLCBzdGRidWZmZXIsIGZ1bmN0aW9uIChsaW5lKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5lbWl0KCdzdGRsaW5lJywgbGluZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBlcnJidWZmZXIgPSAnJztcclxuICAgICAgICBjcC5zdGRlcnIub24oJ2RhdGEnLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICBzdGF0ZS5wcm9jZXNzU3RkZXJyID0gdHJ1ZTtcclxuICAgICAgICAgICAgX3RoaXMuZW1pdCgnc3RkZXJyJywgZGF0YSk7XHJcbiAgICAgICAgICAgIGlmICghb3B0aW9uc05vbk51bGwuc2lsZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcyA9IG9wdGlvbnNOb25OdWxsLmZhaWxPblN0ZEVyciA/IG9wdGlvbnNOb25OdWxsLmVyclN0cmVhbSA6IG9wdGlvbnNOb25OdWxsLm91dFN0cmVhbTtcclxuICAgICAgICAgICAgICAgIHMud3JpdGUoZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3RoaXMuX3Byb2Nlc3NMaW5lQnVmZmVyKGRhdGEsIGVycmJ1ZmZlciwgZnVuY3Rpb24gKGxpbmUpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLmVtaXQoJ2VycmxpbmUnLCBsaW5lKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY3Aub24oJ2Vycm9yJywgZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICBzdGF0ZS5wcm9jZXNzRXJyb3IgPSBlcnIubWVzc2FnZTtcclxuICAgICAgICAgICAgc3RhdGUucHJvY2Vzc0V4aXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHN0YXRlLnByb2Nlc3NDbG9zZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBzdGF0ZS5DaGVja0NvbXBsZXRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY3Aub24oJ2V4aXQnLCBmdW5jdGlvbiAoY29kZSwgc2lnbmFsKSB7XHJcbiAgICAgICAgICAgIHN0YXRlLnByb2Nlc3NFeGl0Q29kZSA9IGNvZGU7XHJcbiAgICAgICAgICAgIHN0YXRlLnByb2Nlc3NFeGl0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBfdGhpcy5fZGVidWcoXCJFeGl0IGNvZGUgXCIgKyBjb2RlICsgXCIgcmVjZWl2ZWQgZnJvbSB0b29sICdcIiArIF90aGlzLnRvb2xQYXRoICsgXCInXCIpO1xyXG4gICAgICAgICAgICBzdGF0ZS5DaGVja0NvbXBsZXRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY3Aub24oJ2Nsb3NlJywgZnVuY3Rpb24gKGNvZGUsIHNpZ25hbCkge1xyXG4gICAgICAgICAgICBzdGF0ZS5wcm9jZXNzRXhpdENvZGUgPSBjb2RlO1xyXG4gICAgICAgICAgICBzdGF0ZS5wcm9jZXNzRXhpdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgc3RhdGUucHJvY2Vzc0Nsb3NlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIF90aGlzLl9kZWJ1ZyhcIlNURElPIHN0cmVhbXMgaGF2ZSBjbG9zZWQgZm9yIHRvb2wgJ1wiICsgX3RoaXMudG9vbFBhdGggKyBcIidcIik7XHJcbiAgICAgICAgICAgIHN0YXRlLkNoZWNrQ29tcGxldGUoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzdGF0ZS5vbignZG9uZScsIGZ1bmN0aW9uIChlcnJvciwgZXhpdENvZGUpIHtcclxuICAgICAgICAgICAgaWYgKHN0ZGJ1ZmZlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5lbWl0KCdzdGRsaW5lJywgc3RkYnVmZmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZXJyYnVmZmVyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLmVtaXQoJ2VycmxpbmUnLCBlcnJidWZmZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNwLnJlbW92ZUFsbExpc3RlbmVycygpO1xyXG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGRlZmVyLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKGV4aXRDb2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogRXhlYyBhIHRvb2wgc3luY2hyb25vdXNseS5cclxuICAgICAqIE91dHB1dCB3aWxsIGJlICpub3QqIGJlIHN0cmVhbWVkIHRvIHRoZSBsaXZlIGNvbnNvbGUuICBJdCB3aWxsIGJlIHJldHVybmVkIGFmdGVyIGV4ZWN1dGlvbiBpcyBjb21wbGV0ZS5cclxuICAgICAqIEFwcHJvcHJpYXRlIGZvciBzaG9ydCBydW5uaW5nIHRvb2xzXHJcbiAgICAgKiBSZXR1cm5zIElFeGVjU3luY1Jlc3VsdCB3aXRoIG91dHB1dCBhbmQgcmV0dXJuIGNvZGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gICAgIHRvb2wgICAgIHBhdGggdG8gdG9vbCB0byBleGVjXHJcbiAgICAgKiBAcGFyYW0gICAgIG9wdGlvbnMgIG9wdGlvbmFsIGV4ZWMgb3B0aW9ucy4gIFNlZSBJRXhlY1N5bmNPcHRpb25zXHJcbiAgICAgKiBAcmV0dXJucyAgIElFeGVjU3luY1Jlc3VsdFxyXG4gICAgICovXHJcbiAgICBUb29sUnVubmVyLnByb3RvdHlwZS5leGVjU3luYyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLl9kZWJ1ZygnZXhlYyB0b29sOiAnICsgdGhpcy50b29sUGF0aCk7XHJcbiAgICAgICAgdGhpcy5fZGVidWcoJ2FyZ3VtZW50czonKTtcclxuICAgICAgICB0aGlzLmFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoYXJnKSB7XHJcbiAgICAgICAgICAgIF90aGlzLl9kZWJ1ZygnICAgJyArIGFyZyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgIG9wdGlvbnMgPSB0aGlzLl9jbG9uZUV4ZWNPcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICAgIGlmICghb3B0aW9ucy5zaWxlbnQpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5vdXRTdHJlYW0ud3JpdGUodGhpcy5fZ2V0Q29tbWFuZFN0cmluZyhvcHRpb25zKSArIG9zLkVPTCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByID0gY2hpbGQuc3Bhd25TeW5jKHRoaXMuX2dldFNwYXduRmlsZU5hbWUoKSwgdGhpcy5fZ2V0U3Bhd25BcmdzKG9wdGlvbnMpLCB0aGlzLl9nZXRTcGF3blN5bmNPcHRpb25zKG9wdGlvbnMpKTtcclxuICAgICAgICBpZiAoIW9wdGlvbnMuc2lsZW50ICYmIHIuc3Rkb3V0ICYmIHIuc3Rkb3V0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5vdXRTdHJlYW0ud3JpdGUoci5zdGRvdXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW9wdGlvbnMuc2lsZW50ICYmIHIuc3RkZXJyICYmIHIuc3RkZXJyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5lcnJTdHJlYW0ud3JpdGUoci5zdGRlcnIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVzID0geyBjb2RlOiByLnN0YXR1cywgZXJyb3I6IHIuZXJyb3IgfTtcclxuICAgICAgICByZXMuc3Rkb3V0ID0gKHIuc3Rkb3V0KSA/IHIuc3Rkb3V0LnRvU3RyaW5nKCkgOiAnJztcclxuICAgICAgICByZXMuc3RkZXJyID0gKHIuc3RkZXJyKSA/IHIuc3RkZXJyLnRvU3RyaW5nKCkgOiAnJztcclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBUb29sUnVubmVyO1xyXG59KGV2ZW50cy5FdmVudEVtaXR0ZXIpKTtcclxuZXhwb3J0cy5Ub29sUnVubmVyID0gVG9vbFJ1bm5lcjtcclxudmFyIEV4ZWNTdGF0ZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhFeGVjU3RhdGUsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBFeGVjU3RhdGUob3B0aW9ucywgdG9vbFBhdGgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xyXG4gICAgICAgIF90aGlzLmRlbGF5ID0gMTAwMDA7IC8vIDEwIHNlY29uZHNcclxuICAgICAgICBfdGhpcy50aW1lb3V0ID0gbnVsbDtcclxuICAgICAgICBpZiAoIXRvb2xQYXRoKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndG9vbFBhdGggbXVzdCBub3QgYmUgZW1wdHknKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgX3RoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgX3RoaXMudG9vbFBhdGggPSB0b29sUGF0aDtcclxuICAgICAgICB2YXIgZGVsYXkgPSBwcm9jZXNzLmVudlsnVEFTS0xJQl9URVNUX1RPT0xSVU5ORVJfRVhJVERFTEFZJ107XHJcbiAgICAgICAgaWYgKGRlbGF5KSB7XHJcbiAgICAgICAgICAgIF90aGlzLmRlbGF5ID0gcGFyc2VJbnQoZGVsYXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBFeGVjU3RhdGUucHJvdG90eXBlLkNoZWNrQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZG9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnByb2Nlc3NDbG9zZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0UmVzdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMucHJvY2Vzc0V4aXRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KEV4ZWNTdGF0ZS5IYW5kbGVUaW1lb3V0LCB0aGlzLmRlbGF5LCB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRXhlY1N0YXRlLnByb3RvdHlwZS5fZGVidWcgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgIHRoaXMuZW1pdCgnZGVidWcnLCBtZXNzYWdlKTtcclxuICAgIH07XHJcbiAgICBFeGVjU3RhdGUucHJvdG90eXBlLl9zZXRSZXN1bHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlcmUgaXMgYW4gZXJyb3JcclxuICAgICAgICB2YXIgZXJyb3I7XHJcbiAgICAgICAgaWYgKHRoaXMucHJvY2Vzc0V4aXRlZCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9jZXNzRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKGltLl9sb2MoJ0xJQl9Qcm9jZXNzRXJyb3InLCB0aGlzLnRvb2xQYXRoLCB0aGlzLnByb2Nlc3NFcnJvcikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMucHJvY2Vzc0V4aXRDb2RlICE9IDAgJiYgIXRoaXMub3B0aW9ucy5pZ25vcmVSZXR1cm5Db2RlKSB7XHJcbiAgICAgICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihpbS5fbG9jKCdMSUJfUHJvY2Vzc0V4aXRDb2RlJywgdGhpcy50b29sUGF0aCwgdGhpcy5wcm9jZXNzRXhpdENvZGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLnByb2Nlc3NTdGRlcnIgJiYgdGhpcy5vcHRpb25zLmZhaWxPblN0ZEVycikge1xyXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoaW0uX2xvYygnTElCX1Byb2Nlc3NTdGRlcnInLCB0aGlzLnRvb2xQYXRoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2xlYXIgdGhlIHRpbWVvdXRcclxuICAgICAgICBpZiAodGhpcy50aW1lb3V0KSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuZW1pdCgnZG9uZScsIGVycm9yLCB0aGlzLnByb2Nlc3NFeGl0Q29kZSk7XHJcbiAgICB9O1xyXG4gICAgRXhlY1N0YXRlLkhhbmRsZVRpbWVvdXQgPSBmdW5jdGlvbiAoc3RhdGUpIHtcclxuICAgICAgICBpZiAoc3RhdGUuZG9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc3RhdGUucHJvY2Vzc0Nsb3NlZCAmJiBzdGF0ZS5wcm9jZXNzRXhpdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGltLl9sb2MoJ0xJQl9TdGRpb05vdENsb3NlZCcsIHN0YXRlLmRlbGF5IC8gMTAwMCwgc3RhdGUudG9vbFBhdGgpKTtcclxuICAgICAgICAgICAgc3RhdGUuX2RlYnVnKGltLl9sb2MoJ0xJQl9TdGRpb05vdENsb3NlZCcsIHN0YXRlLmRlbGF5IC8gMTAwMCwgc3RhdGUudG9vbFBhdGgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGUuX3NldFJlc3VsdCgpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBFeGVjU3RhdGU7XHJcbn0oZXZlbnRzLkV2ZW50RW1pdHRlcikpO1xyXG4iLCIvLyB2aW06dHM9NDpzdHM9NDpzdz00OlxuLyohXG4gKlxuICogQ29weXJpZ2h0IDIwMDktMjAxNyBLcmlzIEtvd2FsIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUXG4gKiBsaWNlbnNlIGZvdW5kIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9rcmlza293YWwvcS9ibG9iL3YxL0xJQ0VOU0VcbiAqXG4gKiBXaXRoIHBhcnRzIGJ5IFR5bGVyIENsb3NlXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDA5IFR5bGVyIENsb3NlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUIFggbGljZW5zZSBmb3VuZFxuICogYXQgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5odG1sXG4gKiBGb3JrZWQgYXQgcmVmX3NlbmQuanMgdmVyc2lvbjogMjAwOS0wNS0xMVxuICpcbiAqIFdpdGggcGFydHMgYnkgTWFyayBNaWxsZXJcbiAqIENvcHlyaWdodCAoQykgMjAxMSBHb29nbGUgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIFRoaXMgZmlsZSB3aWxsIGZ1bmN0aW9uIHByb3Blcmx5IGFzIGEgPHNjcmlwdD4gdGFnLCBvciBhIG1vZHVsZVxuICAgIC8vIHVzaW5nIENvbW1vbkpTIGFuZCBOb2RlSlMgb3IgUmVxdWlyZUpTIG1vZHVsZSBmb3JtYXRzLiAgSW5cbiAgICAvLyBDb21tb24vTm9kZS9SZXF1aXJlSlMsIHRoZSBtb2R1bGUgZXhwb3J0cyB0aGUgUSBBUEkgYW5kIHdoZW5cbiAgICAvLyBleGVjdXRlZCBhcyBhIHNpbXBsZSA8c2NyaXB0PiwgaXQgY3JlYXRlcyBhIFEgZ2xvYmFsIGluc3RlYWQuXG5cbiAgICAvLyBNb250YWdlIFJlcXVpcmVcbiAgICBpZiAodHlwZW9mIGJvb3RzdHJhcCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGJvb3RzdHJhcChcInByb21pc2VcIiwgZGVmaW5pdGlvbik7XG5cbiAgICAvLyBDb21tb25KU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcblxuICAgIC8vIFJlcXVpcmVKU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGRlZmluaXRpb24pO1xuXG4gICAgLy8gU0VTIChTZWN1cmUgRWNtYVNjcmlwdClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKCFzZXMub2soKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VzLm1ha2VRID0gZGVmaW5pdGlvbjtcbiAgICAgICAgfVxuXG4gICAgLy8gPHNjcmlwdD5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLy8gUHJlZmVyIHdpbmRvdyBvdmVyIHNlbGYgZm9yIGFkZC1vbiBzY3JpcHRzLiBVc2Ugc2VsZiBmb3JcbiAgICAgICAgLy8gbm9uLXdpbmRvd2VkIGNvbnRleHRzLlxuICAgICAgICB2YXIgZ2xvYmFsID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHNlbGY7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBgd2luZG93YCBvYmplY3QsIHNhdmUgdGhlIHByZXZpb3VzIFEgZ2xvYmFsXG4gICAgICAgIC8vIGFuZCBpbml0aWFsaXplIFEgYXMgYSBnbG9iYWwuXG4gICAgICAgIHZhciBwcmV2aW91c1EgPSBnbG9iYWwuUTtcbiAgICAgICAgZ2xvYmFsLlEgPSBkZWZpbml0aW9uKCk7XG5cbiAgICAgICAgLy8gQWRkIGEgbm9Db25mbGljdCBmdW5jdGlvbiBzbyBRIGNhbiBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICAgIC8vIGdsb2JhbCBuYW1lc3BhY2UuXG4gICAgICAgIGdsb2JhbC5RLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBnbG9iYWwuUSA9IHByZXZpb3VzUTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBlbnZpcm9ubWVudCB3YXMgbm90IGFudGljaXBhdGVkIGJ5IFEuIFBsZWFzZSBmaWxlIGEgYnVnLlwiKTtcbiAgICB9XG5cbn0pKGZ1bmN0aW9uICgpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgaGFzU3RhY2tzID0gZmFsc2U7XG50cnkge1xuICAgIHRocm93IG5ldyBFcnJvcigpO1xufSBjYXRjaCAoZSkge1xuICAgIGhhc1N0YWNrcyA9ICEhZS5zdGFjaztcbn1cblxuLy8gQWxsIGNvZGUgYWZ0ZXIgdGhpcyBwb2ludCB3aWxsIGJlIGZpbHRlcmVkIGZyb20gc3RhY2sgdHJhY2VzIHJlcG9ydGVkXG4vLyBieSBRLlxudmFyIHFTdGFydGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xudmFyIHFGaWxlTmFtZTtcblxuLy8gc2hpbXNcblxuLy8gdXNlZCBmb3IgZmFsbGJhY2sgaW4gXCJhbGxSZXNvbHZlZFwiXG52YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vLyBVc2UgdGhlIGZhc3Rlc3QgcG9zc2libGUgbWVhbnMgdG8gZXhlY3V0ZSBhIHRhc2sgaW4gYSBmdXR1cmUgdHVyblxuLy8gb2YgdGhlIGV2ZW50IGxvb3AuXG52YXIgbmV4dFRpY2sgPShmdW5jdGlvbiAoKSB7XG4gICAgLy8gbGlua2VkIGxpc3Qgb2YgdGFza3MgKHNpbmdsZSwgd2l0aCBoZWFkIG5vZGUpXG4gICAgdmFyIGhlYWQgPSB7dGFzazogdm9pZCAwLCBuZXh0OiBudWxsfTtcbiAgICB2YXIgdGFpbCA9IGhlYWQ7XG4gICAgdmFyIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgdmFyIHJlcXVlc3RUaWNrID0gdm9pZCAwO1xuICAgIHZhciBpc05vZGVKUyA9IGZhbHNlO1xuICAgIC8vIHF1ZXVlIGZvciBsYXRlIHRhc2tzLCB1c2VkIGJ5IHVuaGFuZGxlZCByZWplY3Rpb24gdHJhY2tpbmdcbiAgICB2YXIgbGF0ZXJRdWV1ZSA9IFtdO1xuXG4gICAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgICAgIC8qIGpzaGludCBsb29wZnVuYzogdHJ1ZSAqL1xuICAgICAgICB2YXIgdGFzaywgZG9tYWluO1xuXG4gICAgICAgIHdoaWxlIChoZWFkLm5leHQpIHtcbiAgICAgICAgICAgIGhlYWQgPSBoZWFkLm5leHQ7XG4gICAgICAgICAgICB0YXNrID0gaGVhZC50YXNrO1xuICAgICAgICAgICAgaGVhZC50YXNrID0gdm9pZCAwO1xuICAgICAgICAgICAgZG9tYWluID0gaGVhZC5kb21haW47XG5cbiAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICBoZWFkLmRvbWFpbiA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJ1blNpbmdsZSh0YXNrLCBkb21haW4pO1xuXG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGxhdGVyUXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0YXNrID0gbGF0ZXJRdWV1ZS5wb3AoKTtcbiAgICAgICAgICAgIHJ1blNpbmdsZSh0YXNrKTtcbiAgICAgICAgfVxuICAgICAgICBmbHVzaGluZyA9IGZhbHNlO1xuICAgIH1cbiAgICAvLyBydW5zIGEgc2luZ2xlIGZ1bmN0aW9uIGluIHRoZSBhc3luYyBxdWV1ZVxuICAgIGZ1bmN0aW9uIHJ1blNpbmdsZSh0YXNrLCBkb21haW4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRhc2soKTtcblxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoaXNOb2RlSlMpIHtcbiAgICAgICAgICAgICAgICAvLyBJbiBub2RlLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBjb25zaWRlcmVkIGZhdGFsIGVycm9ycy5cbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIHN5bmNocm9ub3VzbHkgdG8gaW50ZXJydXB0IGZsdXNoaW5nIVxuXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIGNvbnRpbnVhdGlvbiBpZiB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIGlzIHN1cHByZXNzZWRcbiAgICAgICAgICAgICAgICAvLyBsaXN0ZW5pbmcgXCJ1bmNhdWdodEV4Y2VwdGlvblwiIGV2ZW50cyAoYXMgZG9tYWlucyBkb2VzKS5cbiAgICAgICAgICAgICAgICAvLyBDb250aW51ZSBpbiBuZXh0IGV2ZW50IHRvIGF2b2lkIHRpY2sgcmVjdXJzaW9uLlxuICAgICAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEluIGJyb3dzZXJzLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBub3QgZmF0YWwuXG4gICAgICAgICAgICAgICAgLy8gUmUtdGhyb3cgdGhlbSBhc3luY2hyb25vdXNseSB0byBhdm9pZCBzbG93LWRvd25zLlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5leHRUaWNrID0gZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgdGFpbCA9IHRhaWwubmV4dCA9IHtcbiAgICAgICAgICAgIHRhc2s6IHRhc2ssXG4gICAgICAgICAgICBkb21haW46IGlzTm9kZUpTICYmIHByb2Nlc3MuZG9tYWluLFxuICAgICAgICAgICAgbmV4dDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghZmx1c2hpbmcpIHtcbiAgICAgICAgICAgIGZsdXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIHByb2Nlc3MudG9TdHJpbmcoKSA9PT0gXCJbb2JqZWN0IHByb2Nlc3NdXCIgJiYgcHJvY2Vzcy5uZXh0VGljaykge1xuICAgICAgICAvLyBFbnN1cmUgUSBpcyBpbiBhIHJlYWwgTm9kZSBlbnZpcm9ubWVudCwgd2l0aCBhIGBwcm9jZXNzLm5leHRUaWNrYC5cbiAgICAgICAgLy8gVG8gc2VlIHRocm91Z2ggZmFrZSBOb2RlIGVudmlyb25tZW50czpcbiAgICAgICAgLy8gKiBNb2NoYSB0ZXN0IHJ1bm5lciAtIGV4cG9zZXMgYSBgcHJvY2Vzc2AgZ2xvYmFsIHdpdGhvdXQgYSBgbmV4dFRpY2tgXG4gICAgICAgIC8vICogQnJvd3NlcmlmeSAtIGV4cG9zZXMgYSBgcHJvY2Vzcy5uZXhUaWNrYCBmdW5jdGlvbiB0aGF0IHVzZXNcbiAgICAgICAgLy8gICBgc2V0VGltZW91dGAuIEluIHRoaXMgY2FzZSBgc2V0SW1tZWRpYXRlYCBpcyBwcmVmZXJyZWQgYmVjYXVzZVxuICAgICAgICAvLyAgICBpdCBpcyBmYXN0ZXIuIEJyb3dzZXJpZnkncyBgcHJvY2Vzcy50b1N0cmluZygpYCB5aWVsZHNcbiAgICAgICAgLy8gICBcIltvYmplY3QgT2JqZWN0XVwiLCB3aGlsZSBpbiBhIHJlYWwgTm9kZSBlbnZpcm9ubWVudFxuICAgICAgICAvLyAgIGBwcm9jZXNzLnRvU3RyaW5nKClgIHlpZWxkcyBcIltvYmplY3QgcHJvY2Vzc11cIi5cbiAgICAgICAgaXNOb2RlSlMgPSB0cnVlO1xuXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gICAgICAgIH07XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAvLyBJbiBJRTEwLCBOb2RlLmpzIDAuOSssIG9yIGh0dHBzOi8vZ2l0aHViLmNvbS9Ob2JsZUpTL3NldEltbWVkaWF0ZVxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSBzZXRJbW1lZGlhdGUuYmluZCh3aW5kb3csIGZsdXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZShmbHVzaCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAvLyBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgLy8gaHR0cDovL3d3dy5ub25ibG9ja2luZy5pby8yMDExLzA2L3dpbmRvd25leHR0aWNrLmh0bWxcbiAgICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgICAgLy8gQXQgbGVhc3QgU2FmYXJpIFZlcnNpb24gNi4wLjUgKDg1MzYuMzAuMSkgaW50ZXJtaXR0ZW50bHkgY2Fubm90IGNyZWF0ZVxuICAgICAgICAvLyB3b3JraW5nIG1lc3NhZ2UgcG9ydHMgdGhlIGZpcnN0IHRpbWUgYSBwYWdlIGxvYWRzLlxuICAgICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gcmVxdWVzdFBvcnRUaWNrO1xuICAgICAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgICAgICAgICAgIGZsdXNoKCk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXF1ZXN0UG9ydFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBPcGVyYSByZXF1aXJlcyB1cyB0byBwcm92aWRlIGEgbWVzc2FnZSBwYXlsb2FkLCByZWdhcmRsZXNzIG9mXG4gICAgICAgICAgICAvLyB3aGV0aGVyIHdlIHVzZSBpdC5cbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICByZXF1ZXN0UG9ydFRpY2soKTtcbiAgICAgICAgfTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG9sZCBicm93c2Vyc1xuICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBydW5zIGEgdGFzayBhZnRlciBhbGwgb3RoZXIgdGFza3MgaGF2ZSBiZWVuIHJ1blxuICAgIC8vIHRoaXMgaXMgdXNlZnVsIGZvciB1bmhhbmRsZWQgcmVqZWN0aW9uIHRyYWNraW5nIHRoYXQgbmVlZHMgdG8gaGFwcGVuXG4gICAgLy8gYWZ0ZXIgYWxsIGB0aGVuYGQgdGFza3MgaGF2ZSBiZWVuIHJ1bi5cbiAgICBuZXh0VGljay5ydW5BZnRlciA9IGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgIGxhdGVyUXVldWUucHVzaCh0YXNrKTtcbiAgICAgICAgaWYgKCFmbHVzaGluZykge1xuICAgICAgICAgICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmVxdWVzdFRpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIG5leHRUaWNrO1xufSkoKTtcblxuLy8gQXR0ZW1wdCB0byBtYWtlIGdlbmVyaWNzIHNhZmUgaW4gdGhlIGZhY2Ugb2YgZG93bnN0cmVhbVxuLy8gbW9kaWZpY2F0aW9ucy5cbi8vIFRoZXJlIGlzIG5vIHNpdHVhdGlvbiB3aGVyZSB0aGlzIGlzIG5lY2Vzc2FyeS5cbi8vIElmIHlvdSBuZWVkIGEgc2VjdXJpdHkgZ3VhcmFudGVlLCB0aGVzZSBwcmltb3JkaWFscyBuZWVkIHRvIGJlXG4vLyBkZWVwbHkgZnJvemVuIGFueXdheSwgYW5kIGlmIHlvdSBkb27igJl0IG5lZWQgYSBzZWN1cml0eSBndWFyYW50ZWUsXG4vLyB0aGlzIGlzIGp1c3QgcGxhaW4gcGFyYW5vaWQuXG4vLyBIb3dldmVyLCB0aGlzICoqbWlnaHQqKiBoYXZlIHRoZSBuaWNlIHNpZGUtZWZmZWN0IG9mIHJlZHVjaW5nIHRoZSBzaXplIG9mXG4vLyB0aGUgbWluaWZpZWQgY29kZSBieSByZWR1Y2luZyB4LmNhbGwoKSB0byBtZXJlbHkgeCgpXG4vLyBTZWUgTWFyayBNaWxsZXLigJlzIGV4cGxhbmF0aW9uIG9mIHdoYXQgdGhpcyBkb2VzLlxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9Y29udmVudGlvbnM6c2FmZV9tZXRhX3Byb2dyYW1taW5nXG52YXIgY2FsbCA9IEZ1bmN0aW9uLmNhbGw7XG5mdW5jdGlvbiB1bmN1cnJ5VGhpcyhmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNhbGwuYXBwbHkoZiwgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuLy8gVGhpcyBpcyBlcXVpdmFsZW50LCBidXQgc2xvd2VyOlxuLy8gdW5jdXJyeVRoaXMgPSBGdW5jdGlvbl9iaW5kLmJpbmQoRnVuY3Rpb25fYmluZC5jYWxsKTtcbi8vIGh0dHA6Ly9qc3BlcmYuY29tL3VuY3Vycnl0aGlzXG5cbnZhciBhcnJheV9zbGljZSA9IHVuY3VycnlUaGlzKEFycmF5LnByb3RvdHlwZS5zbGljZSk7XG5cbnZhciBhcnJheV9yZWR1Y2UgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUucmVkdWNlIHx8IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICAvLyBjb25jZXJuaW5nIHRoZSBpbml0aWFsIHZhbHVlLCBpZiBvbmUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvLyBzZWVrIHRvIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgYXJyYXksIGFjY291bnRpbmdcbiAgICAgICAgICAgIC8vIGZvciB0aGUgcG9zc2liaWxpdHkgdGhhdCBpcyBpcyBhIHNwYXJzZSBhcnJheVxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2lzID0gdGhpc1tpbmRleCsrXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgrK2luZGV4ID49IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAoMSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVkdWNlXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgLy8gYWNjb3VudCBmb3IgdGhlIHBvc3NpYmlsaXR5IHRoYXQgdGhlIGFycmF5IGlzIHNwYXJzZVxuICAgICAgICAgICAgaWYgKGluZGV4IGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICBiYXNpcyA9IGNhbGxiYWNrKGJhc2lzLCB0aGlzW2luZGV4XSwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNpcztcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfaW5kZXhPZiA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mIHx8IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBub3QgYSB2ZXJ5IGdvb2Qgc2hpbSwgYnV0IGdvb2QgZW5vdWdoIGZvciBvdXIgb25lIHVzZSBvZiBpdFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzW2ldID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfbWFwID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLm1hcCB8fCBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNwKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNvbGxlY3QgPSBbXTtcbiAgICAgICAgYXJyYXlfcmVkdWNlKHNlbGYsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgY29sbGVjdC5wdXNoKGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBpbmRleCwgc2VsZikpO1xuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICByZXR1cm4gY29sbGVjdDtcbiAgICB9XG4pO1xuXG52YXIgb2JqZWN0X2NyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvdHlwZSkge1xuICAgIGZ1bmN0aW9uIFR5cGUoKSB7IH1cbiAgICBUeXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICByZXR1cm4gbmV3IFR5cGUoKTtcbn07XG5cbnZhciBvYmplY3RfZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkgfHwgZnVuY3Rpb24gKG9iaiwgcHJvcCwgZGVzY3JpcHRvcikge1xuICAgIG9ialtwcm9wXSA9IGRlc2NyaXB0b3IudmFsdWU7XG4gICAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBvYmplY3RfaGFzT3duUHJvcGVydHkgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcblxudmFyIG9iamVjdF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0X2hhc093blByb3BlcnR5KG9iamVjdCwga2V5KSkge1xuICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59O1xuXG52YXIgb2JqZWN0X3RvU3RyaW5nID0gdW5jdXJyeVRoaXMoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyk7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBPYmplY3QodmFsdWUpO1xufVxuXG4vLyBnZW5lcmF0b3IgcmVsYXRlZCBzaGltc1xuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgZnVuY3Rpb24gb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuZnVuY3Rpb24gaXNTdG9wSXRlcmF0aW9uKGV4Y2VwdGlvbikge1xuICAgIHJldHVybiAoXG4gICAgICAgIG9iamVjdF90b1N0cmluZyhleGNlcHRpb24pID09PSBcIltvYmplY3QgU3RvcEl0ZXJhdGlvbl1cIiB8fFxuICAgICAgICBleGNlcHRpb24gaW5zdGFuY2VvZiBRUmV0dXJuVmFsdWVcbiAgICApO1xufVxuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgaGVscGVyIGFuZCBRLnJldHVybiBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpblxuLy8gU3BpZGVyTW9ua2V5LlxudmFyIFFSZXR1cm5WYWx1ZTtcbmlmICh0eXBlb2YgUmV0dXJuVmFsdWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBRUmV0dXJuVmFsdWUgPSBSZXR1cm5WYWx1ZTtcbn0gZWxzZSB7XG4gICAgUVJldHVyblZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9O1xufVxuXG4vLyBsb25nIHN0YWNrIHRyYWNlc1xuXG52YXIgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgPSBcIkZyb20gcHJldmlvdXMgZXZlbnQ6XCI7XG5cbmZ1bmN0aW9uIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSkge1xuICAgIC8vIElmIHBvc3NpYmxlLCB0cmFuc2Zvcm0gdGhlIGVycm9yIHN0YWNrIHRyYWNlIGJ5IHJlbW92aW5nIE5vZGUgYW5kIFFcbiAgICAvLyBjcnVmdCwgdGhlbiBjb25jYXRlbmF0aW5nIHdpdGggdGhlIHN0YWNrIHRyYWNlIG9mIGBwcm9taXNlYC4gU2VlICM1Ny5cbiAgICBpZiAoaGFzU3RhY2tzICYmXG4gICAgICAgIHByb21pc2Uuc3RhY2sgJiZcbiAgICAgICAgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIGVycm9yICE9PSBudWxsICYmXG4gICAgICAgIGVycm9yLnN0YWNrXG4gICAgKSB7XG4gICAgICAgIHZhciBzdGFja3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgcCA9IHByb21pc2U7ICEhcDsgcCA9IHAuc291cmNlKSB7XG4gICAgICAgICAgICBpZiAocC5zdGFjayAmJiAoIWVycm9yLl9fbWluaW11bVN0YWNrQ291bnRlcl9fIHx8IGVycm9yLl9fbWluaW11bVN0YWNrQ291bnRlcl9fID4gcC5zdGFja0NvdW50ZXIpKSB7XG4gICAgICAgICAgICAgICAgb2JqZWN0X2RlZmluZVByb3BlcnR5KGVycm9yLCBcIl9fbWluaW11bVN0YWNrQ291bnRlcl9fXCIsIHt2YWx1ZTogcC5zdGFja0NvdW50ZXIsIGNvbmZpZ3VyYWJsZTogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgIHN0YWNrcy51bnNoaWZ0KHAuc3RhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YWNrcy51bnNoaWZ0KGVycm9yLnN0YWNrKTtcblxuICAgICAgICB2YXIgY29uY2F0ZWRTdGFja3MgPSBzdGFja3Muam9pbihcIlxcblwiICsgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgKyBcIlxcblwiKTtcbiAgICAgICAgdmFyIHN0YWNrID0gZmlsdGVyU3RhY2tTdHJpbmcoY29uY2F0ZWRTdGFja3MpO1xuICAgICAgICBvYmplY3RfZGVmaW5lUHJvcGVydHkoZXJyb3IsIFwic3RhY2tcIiwge3ZhbHVlOiBzdGFjaywgY29uZmlndXJhYmxlOiB0cnVlfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmaWx0ZXJTdGFja1N0cmluZyhzdGFja1N0cmluZykge1xuICAgIHZhciBsaW5lcyA9IHN0YWNrU3RyaW5nLnNwbGl0KFwiXFxuXCIpO1xuICAgIHZhciBkZXNpcmVkTGluZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbaV07XG5cbiAgICAgICAgaWYgKCFpc0ludGVybmFsRnJhbWUobGluZSkgJiYgIWlzTm9kZUZyYW1lKGxpbmUpICYmIGxpbmUpIHtcbiAgICAgICAgICAgIGRlc2lyZWRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZXNpcmVkTGluZXMuam9pbihcIlxcblwiKTtcbn1cblxuZnVuY3Rpb24gaXNOb2RlRnJhbWUoc3RhY2tMaW5lKSB7XG4gICAgcmV0dXJuIHN0YWNrTGluZS5pbmRleE9mKFwiKG1vZHVsZS5qczpcIikgIT09IC0xIHx8XG4gICAgICAgICAgIHN0YWNrTGluZS5pbmRleE9mKFwiKG5vZGUuanM6XCIpICE9PSAtMTtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSkge1xuICAgIC8vIE5hbWVkIGZ1bmN0aW9uczogXCJhdCBmdW5jdGlvbk5hbWUgKGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyKVwiXG4gICAgLy8gSW4gSUUxMCBmdW5jdGlvbiBuYW1lIGNhbiBoYXZlIHNwYWNlcyAoXCJBbm9ueW1vdXMgZnVuY3Rpb25cIikgT19vXG4gICAgdmFyIGF0dGVtcHQxID0gL2F0IC4rIFxcKCguKyk6KFxcZCspOig/OlxcZCspXFwpJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0MSkge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQxWzFdLCBOdW1iZXIoYXR0ZW1wdDFbMl0pXTtcbiAgICB9XG5cbiAgICAvLyBBbm9ueW1vdXMgZnVuY3Rpb25zOiBcImF0IGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyXCJcbiAgICB2YXIgYXR0ZW1wdDIgPSAvYXQgKFteIF0rKTooXFxkKyk6KD86XFxkKykkLy5leGVjKHN0YWNrTGluZSk7XG4gICAgaWYgKGF0dGVtcHQyKSB7XG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDJbMV0sIE51bWJlcihhdHRlbXB0MlsyXSldO1xuICAgIH1cblxuICAgIC8vIEZpcmVmb3ggc3R5bGU6IFwiZnVuY3Rpb25AZmlsZW5hbWU6bGluZU51bWJlciBvciBAZmlsZW5hbWU6bGluZU51bWJlclwiXG4gICAgdmFyIGF0dGVtcHQzID0gLy4qQCguKyk6KFxcZCspJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0Mykge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQzWzFdLCBOdW1iZXIoYXR0ZW1wdDNbMl0pXTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzSW50ZXJuYWxGcmFtZShzdGFja0xpbmUpIHtcbiAgICB2YXIgZmlsZU5hbWVBbmRMaW5lTnVtYmVyID0gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSk7XG5cbiAgICBpZiAoIWZpbGVOYW1lQW5kTGluZU51bWJlcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGZpbGVOYW1lID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzBdO1xuICAgIHZhciBsaW5lTnVtYmVyID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzFdO1xuXG4gICAgcmV0dXJuIGZpbGVOYW1lID09PSBxRmlsZU5hbWUgJiZcbiAgICAgICAgbGluZU51bWJlciA+PSBxU3RhcnRpbmdMaW5lICYmXG4gICAgICAgIGxpbmVOdW1iZXIgPD0gcUVuZGluZ0xpbmU7XG59XG5cbi8vIGRpc2NvdmVyIG93biBmaWxlIG5hbWUgYW5kIGxpbmUgbnVtYmVyIHJhbmdlIGZvciBmaWx0ZXJpbmcgc3RhY2tcbi8vIHRyYWNlc1xuZnVuY3Rpb24gY2FwdHVyZUxpbmUoKSB7XG4gICAgaWYgKCFoYXNTdGFja3MpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdmFyIGxpbmVzID0gZS5zdGFjay5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgdmFyIGZpcnN0TGluZSA9IGxpbmVzWzBdLmluZGV4T2YoXCJAXCIpID4gMCA/IGxpbmVzWzFdIDogbGluZXNbMl07XG4gICAgICAgIHZhciBmaWxlTmFtZUFuZExpbmVOdW1iZXIgPSBnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIoZmlyc3RMaW5lKTtcbiAgICAgICAgaWYgKCFmaWxlTmFtZUFuZExpbmVOdW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHFGaWxlTmFtZSA9IGZpbGVOYW1lQW5kTGluZU51bWJlclswXTtcbiAgICAgICAgcmV0dXJuIGZpbGVOYW1lQW5kTGluZU51bWJlclsxXTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRlcHJlY2F0ZShjYWxsYmFjaywgbmFtZSwgYWx0ZXJuYXRpdmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZiBjb25zb2xlLndhcm4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKG5hbWUgKyBcIiBpcyBkZXByZWNhdGVkLCB1c2UgXCIgKyBhbHRlcm5hdGl2ZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgXCIgaW5zdGVhZC5cIiwgbmV3IEVycm9yKFwiXCIpLnN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoY2FsbGJhY2ssIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxuLy8gZW5kIG9mIHNoaW1zXG4vLyBiZWdpbm5pbmcgb2YgcmVhbCB3b3JrXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHByb21pc2UgZm9yIGFuIGltbWVkaWF0ZSByZWZlcmVuY2UsIHBhc3NlcyBwcm9taXNlcyB0aHJvdWdoLCBvclxuICogY29lcmNlcyBwcm9taXNlcyBmcm9tIGRpZmZlcmVudCBzeXN0ZW1zLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2Ugb3IgcHJvbWlzZVxuICovXG5mdW5jdGlvbiBRKHZhbHVlKSB7XG4gICAgLy8gSWYgdGhlIG9iamVjdCBpcyBhbHJlYWR5IGEgUHJvbWlzZSwgcmV0dXJuIGl0IGRpcmVjdGx5LiAgVGhpcyBlbmFibGVzXG4gICAgLy8gdGhlIHJlc29sdmUgZnVuY3Rpb24gdG8gYm90aCBiZSB1c2VkIHRvIGNyZWF0ZWQgcmVmZXJlbmNlcyBmcm9tIG9iamVjdHMsXG4gICAgLy8gYnV0IHRvIHRvbGVyYWJseSBjb2VyY2Ugbm9uLXByb21pc2VzIHRvIHByb21pc2VzLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8vIGFzc2ltaWxhdGUgdGhlbmFibGVzXG4gICAgaWYgKGlzUHJvbWlzZUFsaWtlKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gY29lcmNlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVsZmlsbCh2YWx1ZSk7XG4gICAgfVxufVxuUS5yZXNvbHZlID0gUTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIHRhc2sgaW4gYSBmdXR1cmUgdHVybiBvZiB0aGUgZXZlbnQgbG9vcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRhc2tcbiAqL1xuUS5uZXh0VGljayA9IG5leHRUaWNrO1xuXG4vKipcbiAqIENvbnRyb2xzIHdoZXRoZXIgb3Igbm90IGxvbmcgc3RhY2sgdHJhY2VzIHdpbGwgYmUgb25cbiAqL1xuUS5sb25nU3RhY2tTdXBwb3J0ID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGNvdW50ZXIgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHN0b3BwaW5nIHBvaW50IGZvciBidWlsZGluZ1xuICogbG9uZyBzdGFjayB0cmFjZXMuIEluIG1ha2VTdGFja1RyYWNlTG9uZyB3ZSB3YWxrIGJhY2t3YXJkcyB0aHJvdWdoXG4gKiB0aGUgbGlua2VkIGxpc3Qgb2YgcHJvbWlzZXMsIG9ubHkgc3RhY2tzIHdoaWNoIHdlcmUgY3JlYXRlZCBiZWZvcmVcbiAqIHRoZSByZWplY3Rpb24gYXJlIGNvbmNhdGVuYXRlZC5cbiAqL1xudmFyIGxvbmdTdGFja0NvdW50ZXIgPSAxO1xuXG4vLyBlbmFibGUgbG9uZyBzdGFja3MgaWYgUV9ERUJVRyBpcyBzZXRcbmlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzICYmIHByb2Nlc3MuZW52ICYmIHByb2Nlc3MuZW52LlFfREVCVUcpIHtcbiAgICBRLmxvbmdTdGFja1N1cHBvcnQgPSB0cnVlO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSB7cHJvbWlzZSwgcmVzb2x2ZSwgcmVqZWN0fSBvYmplY3QuXG4gKlxuICogYHJlc29sdmVgIGlzIGEgY2FsbGJhY2sgdG8gaW52b2tlIHdpdGggYSBtb3JlIHJlc29sdmVkIHZhbHVlIGZvciB0aGVcbiAqIHByb21pc2UuIFRvIGZ1bGZpbGwgdGhlIHByb21pc2UsIGludm9rZSBgcmVzb2x2ZWAgd2l0aCBhbnkgdmFsdWUgdGhhdCBpc1xuICogbm90IGEgdGhlbmFibGUuIFRvIHJlamVjdCB0aGUgcHJvbWlzZSwgaW52b2tlIGByZXNvbHZlYCB3aXRoIGEgcmVqZWN0ZWRcbiAqIHRoZW5hYmxlLCBvciBpbnZva2UgYHJlamVjdGAgd2l0aCB0aGUgcmVhc29uIGRpcmVjdGx5LiBUbyByZXNvbHZlIHRoZVxuICogcHJvbWlzZSB0byBhbm90aGVyIHRoZW5hYmxlLCB0aHVzIHB1dHRpbmcgaXQgaW4gdGhlIHNhbWUgc3RhdGUsIGludm9rZVxuICogYHJlc29sdmVgIHdpdGggdGhhdCBvdGhlciB0aGVuYWJsZS5cbiAqL1xuUS5kZWZlciA9IGRlZmVyO1xuZnVuY3Rpb24gZGVmZXIoKSB7XG4gICAgLy8gaWYgXCJtZXNzYWdlc1wiIGlzIGFuIFwiQXJyYXlcIiwgdGhhdCBpbmRpY2F0ZXMgdGhhdCB0aGUgcHJvbWlzZSBoYXMgbm90IHlldFxuICAgIC8vIGJlZW4gcmVzb2x2ZWQuICBJZiBpdCBpcyBcInVuZGVmaW5lZFwiLCBpdCBoYXMgYmVlbiByZXNvbHZlZC4gIEVhY2hcbiAgICAvLyBlbGVtZW50IG9mIHRoZSBtZXNzYWdlcyBhcnJheSBpcyBpdHNlbGYgYW4gYXJyYXkgb2YgY29tcGxldGUgYXJndW1lbnRzIHRvXG4gICAgLy8gZm9yd2FyZCB0byB0aGUgcmVzb2x2ZWQgcHJvbWlzZS4gIFdlIGNvZXJjZSB0aGUgcmVzb2x1dGlvbiB2YWx1ZSB0byBhXG4gICAgLy8gcHJvbWlzZSB1c2luZyB0aGUgYHJlc29sdmVgIGZ1bmN0aW9uIGJlY2F1c2UgaXQgaGFuZGxlcyBib3RoIGZ1bGx5XG4gICAgLy8gbm9uLXRoZW5hYmxlIHZhbHVlcyBhbmQgb3RoZXIgdGhlbmFibGVzIGdyYWNlZnVsbHkuXG4gICAgdmFyIG1lc3NhZ2VzID0gW10sIHByb2dyZXNzTGlzdGVuZXJzID0gW10sIHJlc29sdmVkUHJvbWlzZTtcblxuICAgIHZhciBkZWZlcnJlZCA9IG9iamVjdF9jcmVhdGUoZGVmZXIucHJvdG90eXBlKTtcbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIG9wZXJhbmRzKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKG9wID09PSBcIndoZW5cIiAmJiBvcGVyYW5kc1sxXSkgeyAvLyBwcm9ncmVzcyBvcGVyYW5kXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcnMucHVzaChvcGVyYW5kc1sxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlZFByb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KHJlc29sdmVkUHJvbWlzZSwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZFxuICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmVhcmVyVmFsdWUgPSBuZWFyZXIocmVzb2x2ZWRQcm9taXNlKTtcbiAgICAgICAgaWYgKGlzUHJvbWlzZShuZWFyZXJWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJlc29sdmVkUHJvbWlzZSA9IG5lYXJlclZhbHVlOyAvLyBzaG9ydGVuIGNoYWluXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5lYXJlclZhbHVlO1xuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghcmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJwZW5kaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZWRQcm9taXNlLmluc3BlY3QoKTtcbiAgICB9O1xuXG4gICAgaWYgKFEubG9uZ1N0YWNrU3VwcG9ydCAmJiBoYXNTdGFja3MpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBkb24ndCB0cnkgdG8gdXNlIGBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZWAgb3IgdHJhbnNmZXIgdGhlXG4gICAgICAgICAgICAvLyBhY2Nlc3NvciBhcm91bmQ7IHRoYXQgY2F1c2VzIG1lbW9yeSBsZWFrcyBhcyBwZXIgR0gtMTExLiBKdXN0XG4gICAgICAgICAgICAvLyByZWlmeSB0aGUgc3RhY2sgdHJhY2UgYXMgYSBzdHJpbmcgQVNBUC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBBdCB0aGUgc2FtZSB0aW1lLCBjdXQgb2ZmIHRoZSBmaXJzdCBsaW5lOyBpdCdzIGFsd2F5cyBqdXN0XG4gICAgICAgICAgICAvLyBcIltvYmplY3QgUHJvbWlzZV1cXG5cIiwgYXMgcGVyIHRoZSBgdG9TdHJpbmdgLlxuICAgICAgICAgICAgcHJvbWlzZS5zdGFjayA9IGUuc3RhY2suc3Vic3RyaW5nKGUuc3RhY2suaW5kZXhPZihcIlxcblwiKSArIDEpO1xuICAgICAgICAgICAgcHJvbWlzZS5zdGFja0NvdW50ZXIgPSBsb25nU3RhY2tDb3VudGVyKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOT1RFOiB3ZSBkbyB0aGUgY2hlY2tzIGZvciBgcmVzb2x2ZWRQcm9taXNlYCBpbiBlYWNoIG1ldGhvZCwgaW5zdGVhZCBvZlxuICAgIC8vIGNvbnNvbGlkYXRpbmcgdGhlbSBpbnRvIGBiZWNvbWVgLCBzaW5jZSBvdGhlcndpc2Ugd2UnZCBjcmVhdGUgbmV3XG4gICAgLy8gcHJvbWlzZXMgd2l0aCB0aGUgbGluZXMgYGJlY29tZSh3aGF0ZXZlcih2YWx1ZSkpYC4gU2VlIGUuZy4gR0gtMjUyLlxuXG4gICAgZnVuY3Rpb24gYmVjb21lKG5ld1Byb21pc2UpIHtcbiAgICAgICAgcmVzb2x2ZWRQcm9taXNlID0gbmV3UHJvbWlzZTtcblxuICAgICAgICBpZiAoUS5sb25nU3RhY2tTdXBwb3J0ICYmIGhhc1N0YWNrcykge1xuICAgICAgICAgICAgLy8gT25seSBob2xkIGEgcmVmZXJlbmNlIHRvIHRoZSBuZXcgcHJvbWlzZSBpZiBsb25nIHN0YWNrc1xuICAgICAgICAgICAgLy8gYXJlIGVuYWJsZWQgdG8gcmVkdWNlIG1lbW9yeSB1c2FnZVxuICAgICAgICAgICAgcHJvbWlzZS5zb3VyY2UgPSBuZXdQcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJyYXlfcmVkdWNlKG1lc3NhZ2VzLCBmdW5jdGlvbiAodW5kZWZpbmVkLCBtZXNzYWdlKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXdQcm9taXNlLnByb21pc2VEaXNwYXRjaC5hcHBseShuZXdQcm9taXNlLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB2b2lkIDApO1xuXG4gICAgICAgIG1lc3NhZ2VzID0gdm9pZCAwO1xuICAgICAgICBwcm9ncmVzc0xpc3RlbmVycyA9IHZvaWQgMDtcbiAgICB9XG5cbiAgICBkZWZlcnJlZC5wcm9taXNlID0gcHJvbWlzZTtcbiAgICBkZWZlcnJlZC5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJlY29tZShRKHZhbHVlKSk7XG4gICAgfTtcblxuICAgIGRlZmVycmVkLmZ1bGZpbGwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKGZ1bGZpbGwodmFsdWUpKTtcbiAgICB9O1xuICAgIGRlZmVycmVkLnJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKHJlamVjdChyZWFzb24pKTtcbiAgICB9O1xuICAgIGRlZmVycmVkLm5vdGlmeSA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhcnJheV9yZWR1Y2UocHJvZ3Jlc3NMaXN0ZW5lcnMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb2dyZXNzTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzTGlzdGVuZXIocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgfTtcblxuICAgIHJldHVybiBkZWZlcnJlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgTm9kZS1zdHlsZSBjYWxsYmFjayB0aGF0IHdpbGwgcmVzb2x2ZSBvciByZWplY3QgdGhlIGRlZmVycmVkXG4gKiBwcm9taXNlLlxuICogQHJldHVybnMgYSBub2RlYmFja1xuICovXG5kZWZlci5wcm90b3R5cGUubWFrZU5vZGVSZXNvbHZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlcnJvciwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBzZWxmLnJlamVjdChlcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZShhcnJheV9zbGljZShhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuLyoqXG4gKiBAcGFyYW0gcmVzb2x2ZXIge0Z1bmN0aW9ufSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBub3RoaW5nIGFuZCBhY2NlcHRzXG4gKiB0aGUgcmVzb2x2ZSwgcmVqZWN0LCBhbmQgbm90aWZ5IGZ1bmN0aW9ucyBmb3IgYSBkZWZlcnJlZC5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IG1heSBiZSByZXNvbHZlZCB3aXRoIHRoZSBnaXZlbiByZXNvbHZlIGFuZCByZWplY3RcbiAqIGZ1bmN0aW9ucywgb3IgcmVqZWN0ZWQgYnkgYSB0aHJvd24gZXhjZXB0aW9uIGluIHJlc29sdmVyXG4gKi9cblEuUHJvbWlzZSA9IHByb21pc2U7IC8vIEVTNlxuUS5wcm9taXNlID0gcHJvbWlzZTtcbmZ1bmN0aW9uIHByb21pc2UocmVzb2x2ZXIpIHtcbiAgICBpZiAodHlwZW9mIHJlc29sdmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcInJlc29sdmVyIG11c3QgYmUgYSBmdW5jdGlvbi5cIik7XG4gICAgfVxuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0LCBkZWZlcnJlZC5ub3RpZnkpO1xuICAgIH0gY2F0Y2ggKHJlYXNvbikge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbnByb21pc2UucmFjZSA9IHJhY2U7IC8vIEVTNlxucHJvbWlzZS5hbGwgPSBhbGw7IC8vIEVTNlxucHJvbWlzZS5yZWplY3QgPSByZWplY3Q7IC8vIEVTNlxucHJvbWlzZS5yZXNvbHZlID0gUTsgLy8gRVM2XG5cbi8vIFhYWCBleHBlcmltZW50YWwuICBUaGlzIG1ldGhvZCBpcyBhIHdheSB0byBkZW5vdGUgdGhhdCBhIGxvY2FsIHZhbHVlIGlzXG4vLyBzZXJpYWxpemFibGUgYW5kIHNob3VsZCBiZSBpbW1lZGlhdGVseSBkaXNwYXRjaGVkIHRvIGEgcmVtb3RlIHVwb24gcmVxdWVzdCxcbi8vIGluc3RlYWQgb2YgcGFzc2luZyBhIHJlZmVyZW5jZS5cblEucGFzc0J5Q29weSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAvL2ZyZWV6ZShvYmplY3QpO1xuICAgIC8vcGFzc0J5Q29waWVzLnNldChvYmplY3QsIHRydWUpO1xuICAgIHJldHVybiBvYmplY3Q7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5wYXNzQnlDb3B5ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vZnJlZXplKG9iamVjdCk7XG4gICAgLy9wYXNzQnlDb3BpZXMuc2V0KG9iamVjdCwgdHJ1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIElmIHR3byBwcm9taXNlcyBldmVudHVhbGx5IGZ1bGZpbGwgdG8gdGhlIHNhbWUgdmFsdWUsIHByb21pc2VzIHRoYXQgdmFsdWUsXG4gKiBidXQgb3RoZXJ3aXNlIHJlamVjdHMuXG4gKiBAcGFyYW0geCB7QW55Kn1cbiAqIEBwYXJhbSB5IHtBbnkqfVxuICogQHJldHVybnMge0FueSp9IGEgcHJvbWlzZSBmb3IgeCBhbmQgeSBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgYnV0IGEgcmVqZWN0aW9uXG4gKiBvdGhlcndpc2UuXG4gKlxuICovXG5RLmpvaW4gPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgIHJldHVybiBRKHgpLmpvaW4oeSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24gKHRoYXQpIHtcbiAgICByZXR1cm4gUShbdGhpcywgdGhhdF0pLnNwcmVhZChmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICBpZiAoeCA9PT0geSkge1xuICAgICAgICAgICAgLy8gVE9ETzogXCI9PT1cIiBzaG91bGQgYmUgT2JqZWN0LmlzIG9yIGVxdWl2XG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlEgY2FuJ3Qgam9pbjogbm90IHRoZSBzYW1lOiBcIiArIHggKyBcIiBcIiArIHkpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgZmlyc3Qgb2YgYW4gYXJyYXkgb2YgcHJvbWlzZXMgdG8gYmVjb21lIHNldHRsZWQuXG4gKiBAcGFyYW0gYW5zd2VycyB7QXJyYXlbQW55Kl19IHByb21pc2VzIHRvIHJhY2VcbiAqIEByZXR1cm5zIHtBbnkqfSB0aGUgZmlyc3QgcHJvbWlzZSB0byBiZSBzZXR0bGVkXG4gKi9cblEucmFjZSA9IHJhY2U7XG5mdW5jdGlvbiByYWNlKGFuc3dlclBzKSB7XG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAvLyBTd2l0Y2ggdG8gdGhpcyBvbmNlIHdlIGNhbiBhc3N1bWUgYXQgbGVhc3QgRVM1XG4gICAgICAgIC8vIGFuc3dlclBzLmZvckVhY2goZnVuY3Rpb24gKGFuc3dlclApIHtcbiAgICAgICAgLy8gICAgIFEoYW5zd2VyUCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gVXNlIHRoaXMgaW4gdGhlIG1lYW50aW1lXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhbnN3ZXJQcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgUShhbnN3ZXJQc1tpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnJhY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihRLnJhY2UpO1xufTtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgUHJvbWlzZSB3aXRoIGEgcHJvbWlzZSBkZXNjcmlwdG9yIG9iamVjdCBhbmQgb3B0aW9uYWwgZmFsbGJhY2tcbiAqIGZ1bmN0aW9uLiAgVGhlIGRlc2NyaXB0b3IgY29udGFpbnMgbWV0aG9kcyBsaWtlIHdoZW4ocmVqZWN0ZWQpLCBnZXQobmFtZSksXG4gKiBzZXQobmFtZSwgdmFsdWUpLCBwb3N0KG5hbWUsIGFyZ3MpLCBhbmQgZGVsZXRlKG5hbWUpLCB3aGljaCBhbGxcbiAqIHJldHVybiBlaXRoZXIgYSB2YWx1ZSwgYSBwcm9taXNlIGZvciBhIHZhbHVlLCBvciBhIHJlamVjdGlvbi4gIFRoZSBmYWxsYmFja1xuICogYWNjZXB0cyB0aGUgb3BlcmF0aW9uIG5hbWUsIGEgcmVzb2x2ZXIsIGFuZCBhbnkgZnVydGhlciBhcmd1bWVudHMgdGhhdCB3b3VsZFxuICogaGF2ZSBiZWVuIGZvcndhcmRlZCB0byB0aGUgYXBwcm9wcmlhdGUgbWV0aG9kIGFib3ZlIGhhZCBhIG1ldGhvZCBiZWVuXG4gKiBwcm92aWRlZCB3aXRoIHRoZSBwcm9wZXIgbmFtZS4gIFRoZSBBUEkgbWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCB0aGUgbmF0dXJlXG4gKiBvZiB0aGUgcmV0dXJuZWQgb2JqZWN0LCBhcGFydCBmcm9tIHRoYXQgaXQgaXMgdXNhYmxlIHdoZXJlZXZlciBwcm9taXNlcyBhcmVcbiAqIGJvdWdodCBhbmQgc29sZC5cbiAqL1xuUS5tYWtlUHJvbWlzZSA9IFByb21pc2U7XG5mdW5jdGlvbiBQcm9taXNlKGRlc2NyaXB0b3IsIGZhbGxiYWNrLCBpbnNwZWN0KSB7XG4gICAgaWYgKGZhbGxiYWNrID09PSB2b2lkIDApIHtcbiAgICAgICAgZmFsbGJhY2sgPSBmdW5jdGlvbiAob3ApIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIFwiUHJvbWlzZSBkb2VzIG5vdCBzdXBwb3J0IG9wZXJhdGlvbjogXCIgKyBvcFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChpbnNwZWN0ID09PSB2b2lkIDApIHtcbiAgICAgICAgaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7c3RhdGU6IFwidW5rbm93blwifTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIGFyZ3MpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChkZXNjcmlwdG9yW29wXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGRlc2NyaXB0b3Jbb3BdLmFwcGx5KHByb21pc2UsIGFyZ3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxsYmFjay5jYWxsKHByb21pc2UsIG9wLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByb21pc2UuaW5zcGVjdCA9IGluc3BlY3Q7XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZCBgdmFsdWVPZmAgYW5kIGBleGNlcHRpb25gIHN1cHBvcnRcbiAgICBpZiAoaW5zcGVjdCkge1xuICAgICAgICB2YXIgaW5zcGVjdGVkID0gaW5zcGVjdCgpO1xuICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcInJlamVjdGVkXCIpIHtcbiAgICAgICAgICAgIHByb21pc2UuZXhjZXB0aW9uID0gaW5zcGVjdGVkLnJlYXNvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnNwZWN0ZWQgPSBpbnNwZWN0KCk7XG4gICAgICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcInBlbmRpbmdcIiB8fFxuICAgICAgICAgICAgICAgIGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5zcGVjdGVkLnZhbHVlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IFByb21pc2VdXCI7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgZG9uZSA9IGZhbHNlOyAgIC8vIGVuc3VyZSB0aGUgdW50cnVzdGVkIHByb21pc2UgbWFrZXMgYXQgbW9zdCBhXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5nbGUgY2FsbCB0byBvbmUgb2YgdGhlIGNhbGxiYWNrc1xuXG4gICAgZnVuY3Rpb24gX2Z1bGZpbGxlZCh2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBmdWxmaWxsZWQgPT09IFwiZnVuY3Rpb25cIiA/IGZ1bGZpbGxlZCh2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVqZWN0ZWQoZXhjZXB0aW9uKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVqZWN0ZWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgbWFrZVN0YWNrVHJhY2VMb25nKGV4Y2VwdGlvbiwgc2VsZik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3RlZChleGNlcHRpb24pO1xuICAgICAgICAgICAgfSBjYXRjaCAobmV3RXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXdFeGNlcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcHJvZ3Jlc3NlZCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHByb2dyZXNzZWQgPT09IFwiZnVuY3Rpb25cIiA/IHByb2dyZXNzZWQodmFsdWUpIDogdmFsdWU7XG4gICAgfVxuXG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfZnVsZmlsbGVkKHZhbHVlKSk7XG4gICAgICAgIH0sIFwid2hlblwiLCBbZnVuY3Rpb24gKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfcmVqZWN0ZWQoZXhjZXB0aW9uKSk7XG4gICAgICAgIH1dKTtcbiAgICB9KTtcblxuICAgIC8vIFByb2dyZXNzIHByb3BhZ2F0b3IgbmVlZCB0byBiZSBhdHRhY2hlZCBpbiB0aGUgY3VycmVudCB0aWNrLlxuICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKHZvaWQgMCwgXCJ3aGVuXCIsIFt2b2lkIDAsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgbmV3VmFsdWU7XG4gICAgICAgIHZhciB0aHJldyA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbmV3VmFsdWUgPSBfcHJvZ3Jlc3NlZCh2YWx1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocmV3ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChRLm9uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBRLm9uZXJyb3IoZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRocmV3KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG5RLnRhcCA9IGZ1bmN0aW9uIChwcm9taXNlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRhcChjYWxsYmFjayk7XG59O1xuXG4vKipcbiAqIFdvcmtzIGFsbW9zdCBsaWtlIFwiZmluYWxseVwiLCBidXQgbm90IGNhbGxlZCBmb3IgcmVqZWN0aW9ucy5cbiAqIE9yaWdpbmFsIHJlc29sdXRpb24gdmFsdWUgaXMgcGFzc2VkIHRocm91Z2ggY2FsbGJhY2sgdW5hZmZlY3RlZC5cbiAqIENhbGxiYWNrIG1heSByZXR1cm4gYSBwcm9taXNlIHRoYXQgd2lsbCBiZSBhd2FpdGVkIGZvci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7US5Qcm9taXNlfVxuICogQGV4YW1wbGVcbiAqIGRvU29tZXRoaW5nKClcbiAqICAgLnRoZW4oLi4uKVxuICogICAudGFwKGNvbnNvbGUubG9nKVxuICogICAudGhlbiguLi4pO1xuICovXG5Qcm9taXNlLnByb3RvdHlwZS50YXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKHZhbHVlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVycyBhbiBvYnNlcnZlciBvbiBhIHByb21pc2UuXG4gKlxuICogR3VhcmFudGVlczpcbiAqXG4gKiAxLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlLlxuICogMi4gdGhhdCBlaXRoZXIgdGhlIGZ1bGZpbGxlZCBjYWxsYmFjayBvciB0aGUgcmVqZWN0ZWQgY2FsbGJhY2sgd2lsbCBiZVxuICogICAgY2FsbGVkLCBidXQgbm90IGJvdGguXG4gKiAzLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBub3QgYmUgY2FsbGVkIGluIHRoaXMgdHVybi5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgICAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgdG8gb2JzZXJ2ZVxuICogQHBhcmFtIGZ1bGZpbGxlZCAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIGZ1bGZpbGxlZCB2YWx1ZVxuICogQHBhcmFtIHJlamVjdGVkICAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIHJlamVjdGlvbiBleGNlcHRpb25cbiAqIEBwYXJhbSBwcm9ncmVzc2VkIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBhbnkgcHJvZ3Jlc3Mgbm90aWZpY2F0aW9uc1xuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIGZyb20gdGhlIGludm9rZWQgY2FsbGJhY2tcbiAqL1xuUS53aGVuID0gd2hlbjtcbmZ1bmN0aW9uIHdoZW4odmFsdWUsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gUSh2YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUudGhlblJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbHVlOyB9KTtcbn07XG5cblEudGhlblJlc29sdmUgPSBmdW5jdGlvbiAocHJvbWlzZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gUShwcm9taXNlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKCkgeyB0aHJvdyByZWFzb247IH0pO1xufTtcblxuUS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHByb21pc2UsIHJlYXNvbikge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRoZW5SZWplY3QocmVhc29uKTtcbn07XG5cbi8qKlxuICogSWYgYW4gb2JqZWN0IGlzIG5vdCBhIHByb21pc2UsIGl0IGlzIGFzIFwibmVhclwiIGFzIHBvc3NpYmxlLlxuICogSWYgYSBwcm9taXNlIGlzIHJlamVjdGVkLCBpdCBpcyBhcyBcIm5lYXJcIiBhcyBwb3NzaWJsZSB0b28uXG4gKiBJZiBpdOKAmXMgYSBmdWxmaWxsZWQgcHJvbWlzZSwgdGhlIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5lYXJlci5cbiAqIElmIGl04oCZcyBhIGRlZmVycmVkIHByb21pc2UgYW5kIHRoZSBkZWZlcnJlZCBoYXMgYmVlbiByZXNvbHZlZCwgdGhlXG4gKiByZXNvbHV0aW9uIGlzIFwibmVhcmVyXCIuXG4gKiBAcGFyYW0gb2JqZWN0XG4gKiBAcmV0dXJucyBtb3N0IHJlc29sdmVkIChuZWFyZXN0KSBmb3JtIG9mIHRoZSBvYmplY3RcbiAqL1xuXG4vLyBYWFggc2hvdWxkIHdlIHJlLWRvIHRoaXM/XG5RLm5lYXJlciA9IG5lYXJlcjtcbmZ1bmN0aW9uIG5lYXJlcih2YWx1ZSkge1xuICAgIGlmIChpc1Byb21pc2UodmFsdWUpKSB7XG4gICAgICAgIHZhciBpbnNwZWN0ZWQgPSB2YWx1ZS5pbnNwZWN0KCk7XG4gICAgICAgIGlmIChpbnNwZWN0ZWQuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnNwZWN0ZWQudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHByb21pc2UuXG4gKiBPdGhlcndpc2UgaXQgaXMgYSBmdWxmaWxsZWQgdmFsdWUuXG4gKi9cblEuaXNQcm9taXNlID0gaXNQcm9taXNlO1xuZnVuY3Rpb24gaXNQcm9taXNlKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgaW5zdGFuY2VvZiBQcm9taXNlO1xufVxuXG5RLmlzUHJvbWlzZUFsaWtlID0gaXNQcm9taXNlQWxpa2U7XG5mdW5jdGlvbiBpc1Byb21pc2VBbGlrZShvYmplY3QpIHtcbiAgICByZXR1cm4gaXNPYmplY3Qob2JqZWN0KSAmJiB0eXBlb2Ygb2JqZWN0LnRoZW4gPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSBwZW5kaW5nIHByb21pc2UsIG1lYW5pbmcgbm90XG4gKiBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG4gKi9cblEuaXNQZW5kaW5nID0gaXNQZW5kaW5nO1xuZnVuY3Rpb24gaXNQZW5kaW5nKG9iamVjdCkge1xuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInBlbmRpbmdcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNQZW5kaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHZhbHVlIG9yIGZ1bGZpbGxlZFxuICogcHJvbWlzZS5cbiAqL1xuUS5pc0Z1bGZpbGxlZCA9IGlzRnVsZmlsbGVkO1xuZnVuY3Rpb24gaXNGdWxmaWxsZWQob2JqZWN0KSB7XG4gICAgcmV0dXJuICFpc1Byb21pc2Uob2JqZWN0KSB8fCBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc0Z1bGZpbGxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCI7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHJlamVjdGVkIHByb21pc2UuXG4gKi9cblEuaXNSZWplY3RlZCA9IGlzUmVqZWN0ZWQ7XG5mdW5jdGlvbiBpc1JlamVjdGVkKG9iamVjdCkge1xuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzUmVqZWN0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XG59O1xuXG4vLy8vIEJFR0lOIFVOSEFORExFRCBSRUpFQ1RJT04gVFJBQ0tJTkdcblxuLy8gVGhpcyBwcm9taXNlIGxpYnJhcnkgY29uc3VtZXMgZXhjZXB0aW9ucyB0aHJvd24gaW4gaGFuZGxlcnMgc28gdGhleSBjYW4gYmVcbi8vIGhhbmRsZWQgYnkgYSBzdWJzZXF1ZW50IHByb21pc2UuICBUaGUgZXhjZXB0aW9ucyBnZXQgYWRkZWQgdG8gdGhpcyBhcnJheSB3aGVuXG4vLyB0aGV5IGFyZSBjcmVhdGVkLCBhbmQgcmVtb3ZlZCB3aGVuIHRoZXkgYXJlIGhhbmRsZWQuICBOb3RlIHRoYXQgaW4gRVM2IG9yXG4vLyBzaGltbWVkIGVudmlyb25tZW50cywgdGhpcyB3b3VsZCBuYXR1cmFsbHkgYmUgYSBgU2V0YC5cbnZhciB1bmhhbmRsZWRSZWFzb25zID0gW107XG52YXIgdW5oYW5kbGVkUmVqZWN0aW9ucyA9IFtdO1xudmFyIHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucyA9IFtdO1xudmFyIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IHRydWU7XG5cbmZ1bmN0aW9uIHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpIHtcbiAgICB1bmhhbmRsZWRSZWFzb25zLmxlbmd0aCA9IDA7XG4gICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5sZW5ndGggPSAwO1xuXG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gdHJ1ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRyYWNrUmVqZWN0aW9uKHByb21pc2UsIHJlYXNvbikge1xuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBwcm9jZXNzLmVtaXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBRLm5leHRUaWNrLnJ1bkFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChhcnJheV9pbmRleE9mKHVuaGFuZGxlZFJlamVjdGlvbnMsIHByb21pc2UpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZW1pdChcInVuaGFuZGxlZFJlamVjdGlvblwiLCByZWFzb24sIHByb21pc2UpO1xuICAgICAgICAgICAgICAgIHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucy5wdXNoKHByb21pc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1bmhhbmRsZWRSZWplY3Rpb25zLnB1c2gocHJvbWlzZSk7XG4gICAgaWYgKHJlYXNvbiAmJiB0eXBlb2YgcmVhc29uLnN0YWNrICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChyZWFzb24uc3RhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChcIihubyBzdGFjaykgXCIgKyByZWFzb24pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdW50cmFja1JlamVjdGlvbihwcm9taXNlKSB7XG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBhdCA9IGFycmF5X2luZGV4T2YodW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XG4gICAgaWYgKGF0ICE9PSAtMSkge1xuICAgICAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrLnJ1bkFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXRSZXBvcnQgPSBhcnJheV9pbmRleE9mKHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgaWYgKGF0UmVwb3J0ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmVtaXQoXCJyZWplY3Rpb25IYW5kbGVkXCIsIHVuaGFuZGxlZFJlYXNvbnNbYXRdLCBwcm9taXNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0ZWRVbmhhbmRsZWRSZWplY3Rpb25zLnNwbGljZShhdFJlcG9ydCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5zcGxpY2UoYXQsIDEpO1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnNwbGljZShhdCwgMSk7XG4gICAgfVxufVxuXG5RLnJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucyA9IHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucztcblxuUS5nZXRVbmhhbmRsZWRSZWFzb25zID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIE1ha2UgYSBjb3B5IHNvIHRoYXQgY29uc3VtZXJzIGNhbid0IGludGVyZmVyZSB3aXRoIG91ciBpbnRlcm5hbCBzdGF0ZS5cbiAgICByZXR1cm4gdW5oYW5kbGVkUmVhc29ucy5zbGljZSgpO1xufTtcblxuUS5zdG9wVW5oYW5kbGVkUmVqZWN0aW9uVHJhY2tpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zKCk7XG4gICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gZmFsc2U7XG59O1xuXG5yZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcblxuLy8vLyBFTkQgVU5IQU5ETEVEIFJFSkVDVElPTiBUUkFDS0lOR1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSByZWplY3RlZCBwcm9taXNlLlxuICogQHBhcmFtIHJlYXNvbiB2YWx1ZSBkZXNjcmliaW5nIHRoZSBmYWlsdXJlXG4gKi9cblEucmVqZWN0ID0gcmVqZWN0O1xuZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgIHZhciByZWplY3Rpb24gPSBQcm9taXNlKHtcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgICAgICAgICAgLy8gbm90ZSB0aGF0IHRoZSBlcnJvciBoYXMgYmVlbiBoYW5kbGVkXG4gICAgICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB1bnRyYWNrUmVqZWN0aW9uKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQocmVhc29uKSA6IHRoaXM7XG4gICAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwicmVqZWN0ZWRcIiwgcmVhc29uOiByZWFzb24gfTtcbiAgICB9KTtcblxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcmVhc29uIGhhcyBub3QgYmVlbiBoYW5kbGVkLlxuICAgIHRyYWNrUmVqZWN0aW9uKHJlamVjdGlvbiwgcmVhc29uKTtcblxuICAgIHJldHVybiByZWplY3Rpb247XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGZ1bGZpbGxlZCBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2VcbiAqL1xuUS5mdWxmaWxsID0gZnVsZmlsbDtcbmZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHtcbiAgICByZXR1cm4gUHJvbWlzZSh7XG4gICAgICAgIFwid2hlblwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uIChuYW1lLCByaHMpIHtcbiAgICAgICAgICAgIHZhbHVlW25hbWVdID0gcmhzO1xuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZVwiOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBcInBvc3RcIjogZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICAgICAgICAgIC8vIE1hcmsgTWlsbGVyIHByb3Bvc2VzIHRoYXQgcG9zdCB3aXRoIG5vIG5hbWUgc2hvdWxkIGFwcGx5IGFcbiAgICAgICAgICAgIC8vIHByb21pc2VkIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKG5hbWUgPT09IG51bGwgfHwgbmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmFwcGx5KHZvaWQgMCwgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVtuYW1lXS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXBwbHlcIjogZnVuY3Rpb24gKHRoaXNwLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpc3AsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBcImtleXNcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdF9rZXlzKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sIHZvaWQgMCwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwiZnVsZmlsbGVkXCIsIHZhbHVlOiB2YWx1ZSB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZW5hYmxlcyB0byBRIHByb21pc2VzLlxuICogQHBhcmFtIHByb21pc2UgdGhlbmFibGUgcHJvbWlzZVxuICogQHJldHVybnMgYSBRIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gY29lcmNlKHByb21pc2UpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvbWlzZS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG4vKipcbiAqIEFubm90YXRlcyBhbiBvYmplY3Qgc3VjaCB0aGF0IGl0IHdpbGwgbmV2ZXIgYmVcbiAqIHRyYW5zZmVycmVkIGF3YXkgZnJvbSB0aGlzIHByb2Nlc3Mgb3ZlciBhbnkgcHJvbWlzZVxuICogY29tbXVuaWNhdGlvbiBjaGFubmVsLlxuICogQHBhcmFtIG9iamVjdFxuICogQHJldHVybnMgcHJvbWlzZSBhIHdyYXBwaW5nIG9mIHRoYXQgb2JqZWN0IHRoYXRcbiAqIGFkZGl0aW9uYWxseSByZXNwb25kcyB0byB0aGUgXCJpc0RlZlwiIG1lc3NhZ2VcbiAqIHdpdGhvdXQgYSByZWplY3Rpb24uXG4gKi9cblEubWFzdGVyID0gbWFzdGVyO1xuZnVuY3Rpb24gbWFzdGVyKG9iamVjdCkge1xuICAgIHJldHVybiBQcm9taXNlKHtcbiAgICAgICAgXCJpc0RlZlwiOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sIGZ1bmN0aW9uIGZhbGxiYWNrKG9wLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBkaXNwYXRjaChvYmplY3QsIG9wLCBhcmdzKTtcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBRKG9iamVjdCkuaW5zcGVjdCgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFNwcmVhZHMgdGhlIHZhbHVlcyBvZiBhIHByb21pc2VkIGFycmF5IG9mIGFyZ3VtZW50cyBpbnRvIHRoZVxuICogZnVsZmlsbG1lbnQgY2FsbGJhY2suXG4gKiBAcGFyYW0gZnVsZmlsbGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdmFyaWFkaWMgYXJndW1lbnRzIGZyb20gdGhlXG4gKiBwcm9taXNlZCBhcnJheVxuICogQHBhcmFtIHJlamVjdGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdGhlIGV4Y2VwdGlvbiBpZiB0aGUgcHJvbWlzZVxuICogaXMgcmVqZWN0ZWQuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgb3IgdGhyb3duIGV4Y2VwdGlvbiBvZlxuICogZWl0aGVyIGNhbGxiYWNrLlxuICovXG5RLnNwcmVhZCA9IHNwcmVhZDtcbmZ1bmN0aW9uIHNwcmVhZCh2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICAgIHJldHVybiBRKHZhbHVlKS5zcHJlYWQoZnVsZmlsbGVkLCByZWplY3RlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnNwcmVhZCA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsKCkudGhlbihmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGZpbGxlZC5hcHBseSh2b2lkIDAsIGFycmF5KTtcbiAgICB9LCByZWplY3RlZCk7XG59O1xuXG4vKipcbiAqIFRoZSBhc3luYyBmdW5jdGlvbiBpcyBhIGRlY29yYXRvciBmb3IgZ2VuZXJhdG9yIGZ1bmN0aW9ucywgdHVybmluZ1xuICogdGhlbSBpbnRvIGFzeW5jaHJvbm91cyBnZW5lcmF0b3JzLiAgQWx0aG91Z2ggZ2VuZXJhdG9ycyBhcmUgb25seSBwYXJ0XG4gKiBvZiB0aGUgbmV3ZXN0IEVDTUFTY3JpcHQgNiBkcmFmdHMsIHRoaXMgY29kZSBkb2VzIG5vdCBjYXVzZSBzeW50YXhcbiAqIGVycm9ycyBpbiBvbGRlciBlbmdpbmVzLiAgVGhpcyBjb2RlIHNob3VsZCBjb250aW51ZSB0byB3b3JrIGFuZCB3aWxsXG4gKiBpbiBmYWN0IGltcHJvdmUgb3ZlciB0aW1lIGFzIHRoZSBsYW5ndWFnZSBpbXByb3Zlcy5cbiAqXG4gKiBFUzYgZ2VuZXJhdG9ycyBhcmUgY3VycmVudGx5IHBhcnQgb2YgVjggdmVyc2lvbiAzLjE5IHdpdGggdGhlXG4gKiAtLWhhcm1vbnktZ2VuZXJhdG9ycyBydW50aW1lIGZsYWcgZW5hYmxlZC4gIFNwaWRlck1vbmtleSBoYXMgaGFkIHRoZW1cbiAqIGZvciBsb25nZXIsIGJ1dCB1bmRlciBhbiBvbGRlciBQeXRob24taW5zcGlyZWQgZm9ybS4gIFRoaXMgZnVuY3Rpb25cbiAqIHdvcmtzIG9uIGJvdGgga2luZHMgb2YgZ2VuZXJhdG9ycy5cbiAqXG4gKiBEZWNvcmF0ZXMgYSBnZW5lcmF0b3IgZnVuY3Rpb24gc3VjaCB0aGF0OlxuICogIC0gaXQgbWF5IHlpZWxkIHByb21pc2VzXG4gKiAgLSBleGVjdXRpb24gd2lsbCBjb250aW51ZSB3aGVuIHRoYXQgcHJvbWlzZSBpcyBmdWxmaWxsZWRcbiAqICAtIHRoZSB2YWx1ZSBvZiB0aGUgeWllbGQgZXhwcmVzc2lvbiB3aWxsIGJlIHRoZSBmdWxmaWxsZWQgdmFsdWVcbiAqICAtIGl0IHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlICh3aGVuIHRoZSBnZW5lcmF0b3JcbiAqICAgIHN0b3BzIGl0ZXJhdGluZylcbiAqICAtIHRoZSBkZWNvcmF0ZWQgZnVuY3Rpb24gcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqICAgIG9mIHRoZSBnZW5lcmF0b3Igb3IgdGhlIGZpcnN0IHJlamVjdGVkIHByb21pc2UgYW1vbmcgdGhvc2VcbiAqICAgIHlpZWxkZWQuXG4gKiAgLSBpZiBhbiBlcnJvciBpcyB0aHJvd24gaW4gdGhlIGdlbmVyYXRvciwgaXQgcHJvcGFnYXRlcyB0aHJvdWdoXG4gKiAgICBldmVyeSBmb2xsb3dpbmcgeWllbGQgdW50aWwgaXQgaXMgY2F1Z2h0LCBvciB1bnRpbCBpdCBlc2NhcGVzXG4gKiAgICB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGFsdG9nZXRoZXIsIGFuZCBpcyB0cmFuc2xhdGVkIGludG8gYVxuICogICAgcmVqZWN0aW9uIGZvciB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSB0aGUgZGVjb3JhdGVkIGdlbmVyYXRvci5cbiAqL1xuUS5hc3luYyA9IGFzeW5jO1xuZnVuY3Rpb24gYXN5bmMobWFrZUdlbmVyYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHdoZW4gdmVyYiBpcyBcInNlbmRcIiwgYXJnIGlzIGEgdmFsdWVcbiAgICAgICAgLy8gd2hlbiB2ZXJiIGlzIFwidGhyb3dcIiwgYXJnIGlzIGFuIGV4Y2VwdGlvblxuICAgICAgICBmdW5jdGlvbiBjb250aW51ZXIodmVyYiwgYXJnKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICAvLyBVbnRpbCBWOCAzLjE5IC8gQ2hyb21pdW0gMjkgaXMgcmVsZWFzZWQsIFNwaWRlck1vbmtleSBpcyB0aGUgb25seVxuICAgICAgICAgICAgLy8gZW5naW5lIHRoYXQgaGFzIGEgZGVwbG95ZWQgYmFzZSBvZiBicm93c2VycyB0aGF0IHN1cHBvcnQgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgIC8vIEhvd2V2ZXIsIFNNJ3MgZ2VuZXJhdG9ycyB1c2UgdGhlIFB5dGhvbi1pbnNwaXJlZCBzZW1hbnRpY3Mgb2ZcbiAgICAgICAgICAgIC8vIG91dGRhdGVkIEVTNiBkcmFmdHMuICBXZSB3b3VsZCBsaWtlIHRvIHN1cHBvcnQgRVM2LCBidXQgd2UnZCBhbHNvXG4gICAgICAgICAgICAvLyBsaWtlIHRvIG1ha2UgaXQgcG9zc2libGUgdG8gdXNlIGdlbmVyYXRvcnMgaW4gZGVwbG95ZWQgYnJvd3NlcnMsIHNvXG4gICAgICAgICAgICAvLyB3ZSBhbHNvIHN1cHBvcnQgUHl0aG9uLXN0eWxlIGdlbmVyYXRvcnMuICBBdCBzb21lIHBvaW50IHdlIGNhbiByZW1vdmVcbiAgICAgICAgICAgIC8vIHRoaXMgYmxvY2suXG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgU3RvcEl0ZXJhdGlvbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIC8vIEVTNiBHZW5lcmF0b3JzXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2VuZXJhdG9yW3ZlcmJdKGFyZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBRKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVzdWx0LnZhbHVlLCBjYWxsYmFjaywgZXJyYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcGlkZXJNb25rZXkgR2VuZXJhdG9yc1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBSZW1vdmUgdGhpcyBjYXNlIHdoZW4gU00gZG9lcyBFUzYgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBnZW5lcmF0b3JbdmVyYl0oYXJnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3RvcEl0ZXJhdGlvbihleGNlcHRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUShleGNlcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB3aGVuKHJlc3VsdCwgY2FsbGJhY2ssIGVycmJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBnZW5lcmF0b3IgPSBtYWtlR2VuZXJhdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJuZXh0XCIpO1xuICAgICAgICB2YXIgZXJyYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJ0aHJvd1wiKTtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBUaGUgc3Bhd24gZnVuY3Rpb24gaXMgYSBzbWFsbCB3cmFwcGVyIGFyb3VuZCBhc3luYyB0aGF0IGltbWVkaWF0ZWx5XG4gKiBjYWxscyB0aGUgZ2VuZXJhdG9yIGFuZCBhbHNvIGVuZHMgdGhlIHByb21pc2UgY2hhaW4sIHNvIHRoYXQgYW55XG4gKiB1bmhhbmRsZWQgZXJyb3JzIGFyZSB0aHJvd24gaW5zdGVhZCBvZiBmb3J3YXJkZWQgdG8gdGhlIGVycm9yXG4gKiBoYW5kbGVyLiBUaGlzIGlzIHVzZWZ1bCBiZWNhdXNlIGl0J3MgZXh0cmVtZWx5IGNvbW1vbiB0byBydW5cbiAqIGdlbmVyYXRvcnMgYXQgdGhlIHRvcC1sZXZlbCB0byB3b3JrIHdpdGggbGlicmFyaWVzLlxuICovXG5RLnNwYXduID0gc3Bhd247XG5mdW5jdGlvbiBzcGF3bihtYWtlR2VuZXJhdG9yKSB7XG4gICAgUS5kb25lKFEuYXN5bmMobWFrZUdlbmVyYXRvcikoKSk7XG59XG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBpbnRlcmZhY2Ugb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuLyoqXG4gKiBUaHJvd3MgYSBSZXR1cm5WYWx1ZSBleGNlcHRpb24gdG8gc3RvcCBhbiBhc3luY2hyb25vdXMgZ2VuZXJhdG9yLlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGlzIGEgc3RvcC1nYXAgbWVhc3VyZSB0byBzdXBwb3J0IGdlbmVyYXRvciByZXR1cm5cbiAqIHZhbHVlcyBpbiBvbGRlciBGaXJlZm94L1NwaWRlck1vbmtleS4gIEluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBFUzZcbiAqIGdlbmVyYXRvcnMgbGlrZSBDaHJvbWl1bSAyOSwganVzdCB1c2UgXCJyZXR1cm5cIiBpbiB5b3VyIGdlbmVyYXRvclxuICogZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgcmV0dXJuIHZhbHVlIGZvciB0aGUgc3Vycm91bmRpbmcgZ2VuZXJhdG9yXG4gKiBAdGhyb3dzIFJldHVyblZhbHVlIGV4Y2VwdGlvbiB3aXRoIHRoZSB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKiAvLyBFUzYgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24qICgpIHtcbiAqICAgICAgdmFyIGZvbyA9IHlpZWxkIGdldEZvb1Byb21pc2UoKTtcbiAqICAgICAgdmFyIGJhciA9IHlpZWxkIGdldEJhclByb21pc2UoKTtcbiAqICAgICAgcmV0dXJuIGZvbyArIGJhcjtcbiAqIH0pXG4gKiAvLyBPbGRlciBTcGlkZXJNb25rZXkgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24gKCkge1xuICogICAgICB2YXIgZm9vID0geWllbGQgZ2V0Rm9vUHJvbWlzZSgpO1xuICogICAgICB2YXIgYmFyID0geWllbGQgZ2V0QmFyUHJvbWlzZSgpO1xuICogICAgICBRLnJldHVybihmb28gKyBiYXIpO1xuICogfSlcbiAqL1xuUVtcInJldHVyblwiXSA9IF9yZXR1cm47XG5mdW5jdGlvbiBfcmV0dXJuKHZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IFFSZXR1cm5WYWx1ZSh2YWx1ZSk7XG59XG5cbi8qKlxuICogVGhlIHByb21pc2VkIGZ1bmN0aW9uIGRlY29yYXRvciBlbnN1cmVzIHRoYXQgYW55IHByb21pc2UgYXJndW1lbnRzXG4gKiBhcmUgc2V0dGxlZCBhbmQgcGFzc2VkIGFzIHZhbHVlcyAoYHRoaXNgIGlzIGFsc28gc2V0dGxlZCBhbmQgcGFzc2VkXG4gKiBhcyBhIHZhbHVlKS4gIEl0IHdpbGwgYWxzbyBlbnN1cmUgdGhhdCB0aGUgcmVzdWx0IG9mIGEgZnVuY3Rpb24gaXNcbiAqIGFsd2F5cyBhIHByb21pc2UuXG4gKlxuICogQGV4YW1wbGVcbiAqIHZhciBhZGQgPSBRLnByb21pc2VkKGZ1bmN0aW9uIChhLCBiKSB7XG4gKiAgICAgcmV0dXJuIGEgKyBiO1xuICogfSk7XG4gKiBhZGQoUShhKSwgUShCKSk7XG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGRlY29yYXRlXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCBoYXMgYmVlbiBkZWNvcmF0ZWQuXG4gKi9cblEucHJvbWlzZWQgPSBwcm9taXNlZDtcbmZ1bmN0aW9uIHByb21pc2VkKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHNwcmVhZChbdGhpcywgYWxsKGFyZ3VtZW50cyldLCBmdW5jdGlvbiAoc2VsZiwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vKipcbiAqIHNlbmRzIGEgbWVzc2FnZSB0byBhIHZhbHVlIGluIGEgZnV0dXJlIHR1cm5cbiAqIEBwYXJhbSBvYmplY3QqIHRoZSByZWNpcGllbnRcbiAqIEBwYXJhbSBvcCB0aGUgbmFtZSBvZiB0aGUgbWVzc2FnZSBvcGVyYXRpb24sIGUuZy4sIFwid2hlblwiLFxuICogQHBhcmFtIGFyZ3MgZnVydGhlciBhcmd1bWVudHMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBvcGVyYXRpb25cbiAqIEByZXR1cm5zIHJlc3VsdCB7UHJvbWlzZX0gYSBwcm9taXNlIGZvciB0aGUgcmVzdWx0IG9mIHRoZSBvcGVyYXRpb25cbiAqL1xuUS5kaXNwYXRjaCA9IGRpc3BhdGNoO1xuZnVuY3Rpb24gZGlzcGF0Y2gob2JqZWN0LCBvcCwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2gob3AsIGFyZ3MpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5kaXNwYXRjaCA9IGZ1bmN0aW9uIChvcCwgYXJncykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnByb21pc2VEaXNwYXRjaChkZWZlcnJlZC5yZXNvbHZlLCBvcCwgYXJncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZ2V0XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBwcm9wZXJ0eSB2YWx1ZVxuICovXG5RLmdldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiZ2V0XCIsIFtrZXldKTtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIG9iamVjdCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBzZXRcbiAqIEBwYXJhbSB2YWx1ZSAgICAgbmV3IHZhbHVlIG9mIHByb3BlcnR5XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5zZXQgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuLyoqXG4gKiBEZWxldGVzIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZGVsZXRlXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5kZWwgPSAvLyBYWFggbGVnYWN5XG5RW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kZWwgPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG4vKipcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICogQHBhcmFtIHZhbHVlICAgICBhIHZhbHVlIHRvIHBvc3QsIHR5cGljYWxseSBhbiBhcnJheSBvZlxuICogICAgICAgICAgICAgICAgICBpbnZvY2F0aW9uIGFyZ3VtZW50cyBmb3IgcHJvbWlzZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICBhcmUgdWx0aW1hdGVseSBiYWNrZWQgd2l0aCBgcmVzb2x2ZWAgdmFsdWVzLFxuICogICAgICAgICAgICAgICAgICBhcyBvcHBvc2VkIHRvIHRob3NlIGJhY2tlZCB3aXRoIFVSTHNcbiAqICAgICAgICAgICAgICAgICAgd2hlcmVpbiB0aGUgcG9zdGVkIHZhbHVlIGNhbiBiZSBhbnlcbiAqICAgICAgICAgICAgICAgICAgSlNPTiBzZXJpYWxpemFibGUgb2JqZWN0LlxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cbi8vIGJvdW5kIGxvY2FsbHkgYmVjYXVzZSBpdCBpcyB1c2VkIGJ5IG90aGVyIG1ldGhvZHNcblEubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEucG9zdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuLyoqXG4gKiBJbnZva2VzIGEgbWV0aG9kIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIG1ldGhvZCB0byBpbnZva2VcbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgaW52b2NhdGlvbiBhcmd1bWVudHNcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLnNlbmQgPSAvLyBYWFggTWFyayBNaWxsZXIncyBwcm9wb3NlZCBwYXJsYW5jZVxuUS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5RLmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2VuZCA9IC8vIFhYWCBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIHBhcmxhbmNlXG5Qcm9taXNlLnByb3RvdHlwZS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5pbnZva2UgPSBmdW5jdGlvbiAobmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIGFyZ3MgICAgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUS5mYXBwbHkgPSBmdW5jdGlvbiAob2JqZWN0LCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFyZ3NdKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZhcHBseSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcmdzXSk7XG59O1xuXG4vKipcbiAqIENhbGxzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUVtcInRyeVwiXSA9XG5RLmZjYWxsID0gZnVuY3Rpb24gKG9iamVjdCAvKiAuLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmNhbGwgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFycmF5X3NsaWNlKGFyZ3VtZW50cyldKTtcbn07XG5cbi8qKlxuICogQmluZHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uLCB0cmFuc2Zvcm1pbmcgcmV0dXJuIHZhbHVlcyBpbnRvIGEgZnVsZmlsbGVkXG4gKiBwcm9taXNlIGFuZCB0aHJvd24gZXJyb3JzIGludG8gYSByZWplY3RlZCBvbmUuXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RLmZiaW5kID0gZnVuY3Rpb24gKG9iamVjdCAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBwcm9taXNlID0gUShvYmplY3QpO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblByb21pc2UucHJvdG90eXBlLmZiaW5kID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBSZXF1ZXN0cyB0aGUgbmFtZXMgb2YgdGhlIG93bmVkIHByb3BlcnRpZXMgb2YgYSBwcm9taXNlZFxuICogb2JqZWN0IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUga2V5cyBvZiB0aGUgZXZlbnR1YWxseSBzZXR0bGVkIG9iamVjdFxuICovXG5RLmtleXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuLyoqXG4gKiBUdXJucyBhbiBhcnJheSBvZiBwcm9taXNlcyBpbnRvIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkuICBJZiBhbnkgb2ZcbiAqIHRoZSBwcm9taXNlcyBnZXRzIHJlamVjdGVkLCB0aGUgd2hvbGUgYXJyYXkgaXMgcmVqZWN0ZWQgaW1tZWRpYXRlbHkuXG4gKiBAcGFyYW0ge0FycmF5Kn0gYW4gYXJyYXkgKG9yIHByb21pc2UgZm9yIGFuIGFycmF5KSBvZiB2YWx1ZXMgKG9yXG4gKiBwcm9taXNlcyBmb3IgdmFsdWVzKVxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcbiAqL1xuLy8gQnkgTWFyayBNaWxsZXJcbi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPXN0cmF3bWFuOmNvbmN1cnJlbmN5JnJldj0xMzA4Nzc2NTIxI2FsbGZ1bGZpbGxlZFxuUS5hbGwgPSBhbGw7XG5mdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHZhciBwZW5kaW5nQ291bnQgPSAwO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb21pc2UsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc25hcHNob3Q7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgaXNQcm9taXNlKHByb21pc2UpICYmXG4gICAgICAgICAgICAgICAgKHNuYXBzaG90ID0gcHJvbWlzZS5pbnNwZWN0KCkpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSBzbmFwc2hvdC52YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKytwZW5kaW5nQ291bnQ7XG4gICAgICAgICAgICAgICAgd2hlbihcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgtLXBlbmRpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KHsgaW5kZXg6IGluZGV4LCB2YWx1ZTogcHJvZ3Jlc3MgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICBpZiAocGVuZGluZ0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYWxsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbGwodGhpcyk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IHJlc29sdmVkIHByb21pc2Ugb2YgYW4gYXJyYXkuIFByaW9yIHJlamVjdGVkIHByb21pc2VzIGFyZVxuICogaWdub3JlZC4gIFJlamVjdHMgb25seSBpZiBhbGwgcHJvbWlzZXMgYXJlIHJlamVjdGVkLlxuICogQHBhcmFtIHtBcnJheSp9IGFuIGFycmF5IGNvbnRhaW5pbmcgdmFsdWVzIG9yIHByb21pc2VzIGZvciB2YWx1ZXNcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmdWxmaWxsZWQgd2l0aCB0aGUgdmFsdWUgb2YgdGhlIGZpcnN0IHJlc29sdmVkIHByb21pc2UsXG4gKiBvciBhIHJlamVjdGVkIHByb21pc2UgaWYgYWxsIHByb21pc2VzIGFyZSByZWplY3RlZC5cbiAqL1xuUS5hbnkgPSBhbnk7XG5cbmZ1bmN0aW9uIGFueShwcm9taXNlcykge1xuICAgIGlmIChwcm9taXNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFEucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICB2YXIgcGVuZGluZ0NvdW50ID0gMDtcbiAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uIChwcmV2LCBjdXJyZW50LCBpbmRleCkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHByb21pc2VzW2luZGV4XTtcblxuICAgICAgICBwZW5kaW5nQ291bnQrKztcblxuICAgICAgICB3aGVuKHByb21pc2UsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBvblByb2dyZXNzKTtcbiAgICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQocmVzdWx0KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChlcnIpIHtcbiAgICAgICAgICAgIHBlbmRpbmdDb3VudC0tO1xuICAgICAgICAgICAgaWYgKHBlbmRpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciByZWplY3Rpb24gPSBlcnIgfHwgbmV3IEVycm9yKFwiXCIgKyBlcnIpO1xuXG4gICAgICAgICAgICAgICAgcmVqZWN0aW9uLm1lc3NhZ2UgPSAoXCJRIGNhbid0IGdldCBmdWxmaWxsbWVudCB2YWx1ZSBmcm9tIGFueSBwcm9taXNlLCBhbGwgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInByb21pc2VzIHdlcmUgcmVqZWN0ZWQuIExhc3QgZXJyb3IgbWVzc2FnZTogXCIgKyByZWplY3Rpb24ubWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVqZWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBvblByb2dyZXNzKHByb2dyZXNzKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoe1xuICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvZ3Jlc3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgdW5kZWZpbmVkKTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5hbnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFueSh0aGlzKTtcbn07XG5cbi8qKlxuICogV2FpdHMgZm9yIGFsbCBwcm9taXNlcyB0byBiZSBzZXR0bGVkLCBlaXRoZXIgZnVsZmlsbGVkIG9yXG4gKiByZWplY3RlZC4gIFRoaXMgaXMgZGlzdGluY3QgZnJvbSBgYWxsYCBzaW5jZSB0aGF0IHdvdWxkIHN0b3BcbiAqIHdhaXRpbmcgYXQgdGhlIGZpcnN0IHJlamVjdGlvbi4gIFRoZSBwcm9taXNlIHJldHVybmVkIGJ5XG4gKiBgYWxsUmVzb2x2ZWRgIHdpbGwgbmV2ZXIgYmUgcmVqZWN0ZWQuXG4gKiBAcGFyYW0gcHJvbWlzZXMgYSBwcm9taXNlIGZvciBhbiBhcnJheSAob3IgYW4gYXJyYXkpIG9mIHByb21pc2VzXG4gKiAob3IgdmFsdWVzKVxuICogQHJldHVybiBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHByb21pc2VzXG4gKi9cblEuYWxsUmVzb2x2ZWQgPSBkZXByZWNhdGUoYWxsUmVzb2x2ZWQsIFwiYWxsUmVzb2x2ZWRcIiwgXCJhbGxTZXR0bGVkXCIpO1xuZnVuY3Rpb24gYWxsUmVzb2x2ZWQocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHByb21pc2VzID0gYXJyYXlfbWFwKHByb21pc2VzLCBRKTtcbiAgICAgICAgcmV0dXJuIHdoZW4oYWxsKGFycmF5X21hcChwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB3aGVuKHByb21pc2UsIG5vb3AsIG5vb3ApO1xuICAgICAgICB9KSksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlcztcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cblByb21pc2UucHJvdG90eXBlLmFsbFJlc29sdmVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbGxSZXNvbHZlZCh0aGlzKTtcbn07XG5cbi8qKlxuICogQHNlZSBQcm9taXNlI2FsbFNldHRsZWRcbiAqL1xuUS5hbGxTZXR0bGVkID0gYWxsU2V0dGxlZDtcbmZ1bmN0aW9uIGFsbFNldHRsZWQocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gUShwcm9taXNlcykuYWxsU2V0dGxlZCgpO1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIGFycmF5IG9mIHByb21pc2VzIGludG8gYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGVpciBzdGF0ZXMgKGFzXG4gKiByZXR1cm5lZCBieSBgaW5zcGVjdGApIHdoZW4gdGhleSBoYXZlIGFsbCBzZXR0bGVkLlxuICogQHBhcmFtIHtBcnJheVtBbnkqXX0gdmFsdWVzIGFuIGFycmF5IChvciBwcm9taXNlIGZvciBhbiBhcnJheSkgb2YgdmFsdWVzIChvclxuICogcHJvbWlzZXMgZm9yIHZhbHVlcylcbiAqIEByZXR1cm5zIHtBcnJheVtTdGF0ZV19IGFuIGFycmF5IG9mIHN0YXRlcyBmb3IgdGhlIHJlc3BlY3RpdmUgdmFsdWVzLlxuICovXG5Qcm9taXNlLnByb3RvdHlwZS5hbGxTZXR0bGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHJldHVybiBhbGwoYXJyYXlfbWFwKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICAgICAgcHJvbWlzZSA9IFEocHJvbWlzZSk7XG4gICAgICAgICAgICBmdW5jdGlvbiByZWdhcmRsZXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlLmluc3BlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlLnRoZW4ocmVnYXJkbGVzcywgcmVnYXJkbGVzcyk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ2FwdHVyZXMgdGhlIGZhaWx1cmUgb2YgYSBwcm9taXNlLCBnaXZpbmcgYW4gb3BvcnR1bml0eSB0byByZWNvdmVyXG4gKiB3aXRoIGEgY2FsbGJhY2suICBJZiB0aGUgZ2l2ZW4gcHJvbWlzZSBpcyBmdWxmaWxsZWQsIHRoZSByZXR1cm5lZFxuICogcHJvbWlzZSBpcyBmdWxmaWxsZWQuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgZm9yIHNvbWV0aGluZ1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gZnVsZmlsbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpZiB0aGVcbiAqIGdpdmVuIHByb21pc2UgaXMgcmVqZWN0ZWRcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgY2FsbGJhY2tcbiAqL1xuUS5mYWlsID0gLy8gWFhYIGxlZ2FjeVxuUVtcImNhdGNoXCJdID0gZnVuY3Rpb24gKG9iamVjdCwgcmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRoZW4odm9pZCAwLCByZWplY3RlZCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5mYWlsID0gLy8gWFhYIGxlZ2FjeVxuUHJvbWlzZS5wcm90b3R5cGVbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCByZWplY3RlZCk7XG59O1xuXG4vKipcbiAqIEF0dGFjaGVzIGEgbGlzdGVuZXIgdGhhdCBjYW4gcmVzcG9uZCB0byBwcm9ncmVzcyBub3RpZmljYXRpb25zIGZyb20gYVxuICogcHJvbWlzZSdzIG9yaWdpbmF0aW5nIGRlZmVycmVkLiBUaGlzIGxpc3RlbmVyIHJlY2VpdmVzIHRoZSBleGFjdCBhcmd1bWVudHNcbiAqIHBhc3NlZCB0byBgYGRlZmVycmVkLm5vdGlmeWBgLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGZvciBzb21ldGhpbmdcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIHJlY2VpdmUgYW55IHByb2dyZXNzIG5vdGlmaWNhdGlvbnNcbiAqIEByZXR1cm5zIHRoZSBnaXZlbiBwcm9taXNlLCB1bmNoYW5nZWRcbiAqL1xuUS5wcm9ncmVzcyA9IHByb2dyZXNzO1xuZnVuY3Rpb24gcHJvZ3Jlc3Mob2JqZWN0LCBwcm9ncmVzc2VkKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS50aGVuKHZvaWQgMCwgdm9pZCAwLCBwcm9ncmVzc2VkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUucHJvZ3Jlc3MgPSBmdW5jdGlvbiAocHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCB2b2lkIDAsIHByb2dyZXNzZWQpO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBvcHBvcnR1bml0eSB0byBvYnNlcnZlIHRoZSBzZXR0bGluZyBvZiBhIHByb21pc2UsXG4gKiByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHByb21pc2UgaXMgZnVsZmlsbGVkIG9yIHJlamVjdGVkLiAgRm9yd2FyZHNcbiAqIHRoZSByZXNvbHV0aW9uIHRvIHRoZSByZXR1cm5lZCBwcm9taXNlIHdoZW4gdGhlIGNhbGxiYWNrIGlzIGRvbmUuXG4gKiBUaGUgY2FsbGJhY2sgY2FuIHJldHVybiBhIHByb21pc2UgdG8gZGVmZXIgY29tcGxldGlvbi5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gb2JzZXJ2ZSB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW5cbiAqIHByb21pc2UsIHRha2VzIG5vIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2Ugd2hlblxuICogYGBmaW5gYCBpcyBkb25lLlxuICovXG5RLmZpbiA9IC8vIFhYWCBsZWdhY3lcblFbXCJmaW5hbGx5XCJdID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gUShvYmplY3QpW1wiZmluYWxseVwiXShjYWxsYmFjayk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5maW4gPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImZpbmFsbHlcIl0gPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBpZiAoIWNhbGxiYWNrIHx8IHR5cGVvZiBjYWxsYmFjay5hcHBseSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlEgY2FuJ3QgYXBwbHkgZmluYWxseSBjYWxsYmFja1wiKTtcbiAgICB9XG4gICAgY2FsbGJhY2sgPSBRKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suZmNhbGwoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBUT0RPIGF0dGVtcHQgdG8gcmVjeWNsZSB0aGUgcmVqZWN0aW9uIHdpdGggXCJ0aGlzXCIuXG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogVGVybWluYXRlcyBhIGNoYWluIG9mIHByb21pc2VzLCBmb3JjaW5nIHJlamVjdGlvbnMgdG8gYmVcbiAqIHRocm93biBhcyBleGNlcHRpb25zLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGF0IHRoZSBlbmQgb2YgYSBjaGFpbiBvZiBwcm9taXNlc1xuICogQHJldHVybnMgbm90aGluZ1xuICovXG5RLmRvbmUgPSBmdW5jdGlvbiAob2JqZWN0LCBmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZG9uZShmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kb25lID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSB7XG4gICAgdmFyIG9uVW5oYW5kbGVkRXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgLy8gZm9yd2FyZCB0byBhIGZ1dHVyZSB0dXJuIHNvIHRoYXQgYGB3aGVuYGBcbiAgICAgICAgLy8gZG9lcyBub3QgY2F0Y2ggaXQgYW5kIHR1cm4gaXQgaW50byBhIHJlamVjdGlvbi5cbiAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBtYWtlU3RhY2tUcmFjZUxvbmcoZXJyb3IsIHByb21pc2UpO1xuICAgICAgICAgICAgaWYgKFEub25lcnJvcikge1xuICAgICAgICAgICAgICAgIFEub25lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gQXZvaWQgdW5uZWNlc3NhcnkgYG5leHRUaWNrYGluZyB2aWEgYW4gdW5uZWNlc3NhcnkgYHdoZW5gLlxuICAgIHZhciBwcm9taXNlID0gZnVsZmlsbGVkIHx8IHJlamVjdGVkIHx8IHByb2dyZXNzID9cbiAgICAgICAgdGhpcy50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSA6XG4gICAgICAgIHRoaXM7XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgcHJvY2VzcyAmJiBwcm9jZXNzLmRvbWFpbikge1xuICAgICAgICBvblVuaGFuZGxlZEVycm9yID0gcHJvY2Vzcy5kb21haW4uYmluZChvblVuaGFuZGxlZEVycm9yKTtcbiAgICB9XG5cbiAgICBwcm9taXNlLnRoZW4odm9pZCAwLCBvblVuaGFuZGxlZEVycm9yKTtcbn07XG5cbi8qKlxuICogQ2F1c2VzIGEgcHJvbWlzZSB0byBiZSByZWplY3RlZCBpZiBpdCBkb2VzIG5vdCBnZXQgZnVsZmlsbGVkIGJlZm9yZVxuICogc29tZSBtaWxsaXNlY29uZHMgdGltZSBvdXQuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaWxsaXNlY29uZHMgdGltZW91dFxuICogQHBhcmFtIHtBbnkqfSBjdXN0b20gZXJyb3IgbWVzc2FnZSBvciBFcnJvciBvYmplY3QgKG9wdGlvbmFsKVxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZSBpZiBpdCBpc1xuICogZnVsZmlsbGVkIGJlZm9yZSB0aGUgdGltZW91dCwgb3RoZXJ3aXNlIHJlamVjdGVkLlxuICovXG5RLnRpbWVvdXQgPSBmdW5jdGlvbiAob2JqZWN0LCBtcywgZXJyb3IpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRpbWVvdXQobXMsIGVycm9yKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbiAobXMsIGVycm9yKSB7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghZXJyb3IgfHwgXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGVycm9yKSB7XG4gICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihlcnJvciB8fCBcIlRpbWVkIG91dCBhZnRlciBcIiArIG1zICsgXCIgbXNcIik7XG4gICAgICAgICAgICBlcnJvci5jb2RlID0gXCJFVElNRURPVVRcIjtcbiAgICAgICAgfVxuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgIH0sIG1zKTtcblxuICAgIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUodmFsdWUpO1xuICAgIH0sIGZ1bmN0aW9uIChleGNlcHRpb24pIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChleGNlcHRpb24pO1xuICAgIH0sIGRlZmVycmVkLm5vdGlmeSk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBnaXZlbiB2YWx1ZSAob3IgcHJvbWlzZWQgdmFsdWUpLCBzb21lXG4gKiBtaWxsaXNlY29uZHMgYWZ0ZXIgaXQgcmVzb2x2ZWQuIFBhc3NlcyByZWplY3Rpb25zIGltbWVkaWF0ZWx5LlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlXG4gKiBAcGFyYW0ge051bWJlcn0gbWlsbGlzZWNvbmRzXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIGFmdGVyIG1pbGxpc2Vjb25kc1xuICogdGltZSBoYXMgZWxhcHNlZCBzaW5jZSB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZS5cbiAqIElmIHRoZSBnaXZlbiBwcm9taXNlIHJlamVjdHMsIHRoYXQgaXMgcGFzc2VkIGltbWVkaWF0ZWx5LlxuICovXG5RLmRlbGF5ID0gZnVuY3Rpb24gKG9iamVjdCwgdGltZW91dCkge1xuICAgIGlmICh0aW1lb3V0ID09PSB2b2lkIDApIHtcbiAgICAgICAgdGltZW91dCA9IG9iamVjdDtcbiAgICAgICAgb2JqZWN0ID0gdm9pZCAwO1xuICAgIH1cbiAgICByZXR1cm4gUShvYmplY3QpLmRlbGF5KHRpbWVvdXQpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbiAodGltZW91dCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogUGFzc2VzIGEgY29udGludWF0aW9uIHRvIGEgTm9kZSBmdW5jdGlvbiwgd2hpY2ggaXMgY2FsbGVkIHdpdGggdGhlIGdpdmVuXG4gKiBhcmd1bWVudHMgcHJvdmlkZWQgYXMgYW4gYXJyYXksIGFuZCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqXG4gKiAgICAgIFEubmZhcHBseShGUy5yZWFkRmlsZSwgW19fZmlsZW5hbWVdKVxuICogICAgICAudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xuICogICAgICB9KVxuICpcbiAqL1xuUS5uZmFwcGx5ID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBhcmdzKSB7XG4gICAgcmV0dXJuIFEoY2FsbGJhY2spLm5mYXBwbHkoYXJncyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uZmFwcGx5ID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3MpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBQYXNzZXMgYSBjb250aW51YXRpb24gdG8gYSBOb2RlIGZ1bmN0aW9uLCB3aGljaCBpcyBjYWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAqIGFyZ3VtZW50cyBwcm92aWRlZCBpbmRpdmlkdWFsbHksIGFuZCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqIEBleGFtcGxlXG4gKiBRLm5mY2FsbChGUy5yZWFkRmlsZSwgX19maWxlbmFtZSlcbiAqIC50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XG4gKiB9KVxuICpcbiAqL1xuUS5uZmNhbGwgPSBmdW5jdGlvbiAoY2FsbGJhY2sgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIFEoY2FsbGJhY2spLm5mYXBwbHkoYXJncyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uZmNhbGwgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFdyYXBzIGEgTm9kZUpTIGNvbnRpbnVhdGlvbiBwYXNzaW5nIGZ1bmN0aW9uIGFuZCByZXR1cm5zIGFuIGVxdWl2YWxlbnRcbiAqIHZlcnNpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqIEBleGFtcGxlXG4gKiBRLm5mYmluZChGUy5yZWFkRmlsZSwgX19maWxlbmFtZSkoXCJ1dGYtOFwiKVxuICogLnRoZW4oY29uc29sZS5sb2cpXG4gKiAuZG9uZSgpXG4gKi9cblEubmZiaW5kID1cblEuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLi4uYXJncyovKSB7XG4gICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUSBjYW4ndCB3cmFwIGFuIHVuZGVmaW5lZCBmdW5jdGlvblwiKTtcbiAgICB9XG4gICAgdmFyIGJhc2VBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbm9kZUFyZ3MgPSBiYXNlQXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICAgICAgUShjYWxsYmFjaykuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uZmJpbmQgPVxuUHJvbWlzZS5wcm90b3R5cGUuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICByZXR1cm4gUS5kZW5vZGVpZnkuYXBwbHkodm9pZCAwLCBhcmdzKTtcbn07XG5cblEubmJpbmQgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNwIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGJhc2VBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbm9kZUFyZ3MgPSBiYXNlQXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICAgICAgZnVuY3Rpb24gYm91bmQoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpc3AsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgUShib3VuZCkuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uYmluZCA9IGZ1bmN0aW9uICgvKnRoaXNwLCAuLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMCk7XG4gICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuICAgIHJldHVybiBRLm5iaW5kLmFwcGx5KHZvaWQgMCwgYXJncyk7XG59O1xuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9mIGEgTm9kZS1zdHlsZSBvYmplY3QgdGhhdCBhY2NlcHRzIGEgTm9kZS1zdHlsZVxuICogY2FsbGJhY2sgd2l0aCBhIGdpdmVuIGFycmF5IG9mIGFyZ3VtZW50cywgcGx1cyBhIHByb3ZpZGVkIGNhbGxiYWNrLlxuICogQHBhcmFtIG9iamVjdCBhbiBvYmplY3QgdGhhdCBoYXMgdGhlIG5hbWVkIG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgbWV0aG9kIG9mIG9iamVjdFxuICogQHBhcmFtIHtBcnJheX0gYXJncyBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kOyB0aGUgY2FsbGJhY2tcbiAqIHdpbGwgYmUgcHJvdmlkZWQgYnkgUSBhbmQgYXBwZW5kZWQgdG8gdGhlc2UgYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgdmFsdWUgb3IgZXJyb3JcbiAqL1xuUS5ubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEubnBvc3QgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5ucG9zdChuYW1lLCBhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUHJvbWlzZS5wcm90b3R5cGUubnBvc3QgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3MgfHwgW10pO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb2YgYSBOb2RlLXN0eWxlIG9iamVjdCB0aGF0IGFjY2VwdHMgYSBOb2RlLXN0eWxlXG4gKiBjYWxsYmFjaywgZm9yd2FyZGluZyB0aGUgZ2l2ZW4gdmFyaWFkaWMgYXJndW1lbnRzLCBwbHVzIGEgcHJvdmlkZWRcbiAqIGNhbGxiYWNrIGFyZ3VtZW50LlxuICogQHBhcmFtIG9iamVjdCBhbiBvYmplY3QgdGhhdCBoYXMgdGhlIG5hbWVkIG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgbWV0aG9kIG9mIG9iamVjdFxuICogQHBhcmFtIC4uLmFyZ3MgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZDsgdGhlIGNhbGxiYWNrIHdpbGxcbiAqIGJlIHByb3ZpZGVkIGJ5IFEgYW5kIGFwcGVuZGVkIHRvIHRoZXNlIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9yIGVycm9yXG4gKi9cblEubnNlbmQgPSAvLyBYWFggQmFzZWQgb24gTWFyayBNaWxsZXIncyBwcm9wb3NlZCBcInNlbmRcIlxuUS5ubWNhbGwgPSAvLyBYWFggQmFzZWQgb24gXCJSZWRzYW5kcm8nc1wiIHByb3Bvc2FsXG5RLm5pbnZva2UgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5zZW5kID0gLy8gWFhYIEJhc2VkIG9uIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgXCJzZW5kXCJcblByb21pc2UucHJvdG90eXBlLm5tY2FsbCA9IC8vIFhYWCBCYXNlZCBvbiBcIlJlZHNhbmRybydzXCIgcHJvcG9zYWxcblByb21pc2UucHJvdG90eXBlLm5pbnZva2UgPSBmdW5jdGlvbiAobmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBJZiBhIGZ1bmN0aW9uIHdvdWxkIGxpa2UgdG8gc3VwcG9ydCBib3RoIE5vZGUgY29udGludWF0aW9uLXBhc3Npbmctc3R5bGUgYW5kXG4gKiBwcm9taXNlLXJldHVybmluZy1zdHlsZSwgaXQgY2FuIGVuZCBpdHMgaW50ZXJuYWwgcHJvbWlzZSBjaGFpbiB3aXRoXG4gKiBgbm9kZWlmeShub2RlYmFjaylgLCBmb3J3YXJkaW5nIHRoZSBvcHRpb25hbCBub2RlYmFjayBhcmd1bWVudC4gIElmIHRoZSB1c2VyXG4gKiBlbGVjdHMgdG8gdXNlIGEgbm9kZWJhY2ssIHRoZSByZXN1bHQgd2lsbCBiZSBzZW50IHRoZXJlLiAgSWYgdGhleSBkbyBub3RcbiAqIHBhc3MgYSBub2RlYmFjaywgdGhleSB3aWxsIHJlY2VpdmUgdGhlIHJlc3VsdCBwcm9taXNlLlxuICogQHBhcmFtIG9iamVjdCBhIHJlc3VsdCAob3IgYSBwcm9taXNlIGZvciBhIHJlc3VsdClcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG5vZGViYWNrIGEgTm9kZS5qcy1zdHlsZSBjYWxsYmFja1xuICogQHJldHVybnMgZWl0aGVyIHRoZSBwcm9taXNlIG9yIG5vdGhpbmdcbiAqL1xuUS5ub2RlaWZ5ID0gbm9kZWlmeTtcbmZ1bmN0aW9uIG5vZGVpZnkob2JqZWN0LCBub2RlYmFjaykge1xuICAgIHJldHVybiBRKG9iamVjdCkubm9kZWlmeShub2RlYmFjayk7XG59XG5cblByb21pc2UucHJvdG90eXBlLm5vZGVpZnkgPSBmdW5jdGlvbiAobm9kZWJhY2spIHtcbiAgICBpZiAobm9kZWJhY2spIHtcbiAgICAgICAgdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbm9kZWJhY2sobnVsbCwgdmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbm9kZWJhY2soZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn07XG5cblEubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlEubm9Db25mbGljdCBvbmx5IHdvcmtzIHdoZW4gUSBpcyB1c2VkIGFzIGEgZ2xvYmFsXCIpO1xufTtcblxuLy8gQWxsIGNvZGUgYmVmb3JlIHRoaXMgcG9pbnQgd2lsbCBiZSBmaWx0ZXJlZCBmcm9tIHN0YWNrIHRyYWNlcy5cbnZhciBxRW5kaW5nTGluZSA9IGNhcHR1cmVMaW5lKCk7XG5cbnJldHVybiBRO1xuXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTsiXSwic291cmNlUm9vdCI6IiJ9