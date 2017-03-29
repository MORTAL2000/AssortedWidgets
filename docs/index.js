var Module;
if (typeof Module === "undefined") Module = {};
if (!Module.expectedDataFileDownloads) {
 Module.expectedDataFileDownloads = 0;
 Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
((function() {
 var loadPackage = (function(metadata) {
  var PACKAGE_PATH;
  if (typeof window === "object") {
   PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/");
  } else if (typeof location !== "undefined") {
   PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/");
  } else {
   throw "using preloaded data can only be done on a web page or in a web worker";
  }
  var PACKAGE_NAME = "index.data";
  var REMOTE_PACKAGE_BASE = "index.data";
  if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
   Module["locateFile"] = Module["locateFilePackage"];
   Module.printErr("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)");
  }
  var REMOTE_PACKAGE_NAME = typeof Module["locateFile"] === "function" ? Module["locateFile"](REMOTE_PACKAGE_BASE) : (Module["filePackagePrefixURL"] || "") + REMOTE_PACKAGE_BASE;
  var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
  var PACKAGE_UUID = metadata.package_uuid;
  function fetchRemotePackage(packageName, packageSize, callback, errback) {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", packageName, true);
   xhr.responseType = "arraybuffer";
   xhr.onprogress = (function(event) {
    var url = packageName;
    var size = packageSize;
    if (event.total) size = event.total;
    if (event.loaded) {
     if (!xhr.addedTotal) {
      xhr.addedTotal = true;
      if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
      Module.dataFileDownloads[url] = {
       loaded: event.loaded,
       total: size
      };
     } else {
      Module.dataFileDownloads[url].loaded = event.loaded;
     }
     var total = 0;
     var loaded = 0;
     var num = 0;
     for (var download in Module.dataFileDownloads) {
      var data = Module.dataFileDownloads[download];
      total += data.total;
      loaded += data.loaded;
      num++;
     }
     total = Math.ceil(total * Module.expectedDataFileDownloads / num);
     if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + loaded + "/" + total + ")");
    } else if (!Module.dataFileDownloads) {
     if (Module["setStatus"]) Module["setStatus"]("Downloading data...");
    }
   });
   xhr.onerror = (function(event) {
    throw new Error("NetworkError for: " + packageName);
   });
   xhr.onload = (function(event) {
    if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || xhr.status == 0 && xhr.response) {
     var packageData = xhr.response;
     callback(packageData);
    } else {
     throw new Error(xhr.statusText + " : " + xhr.responseURL);
    }
   });
   xhr.send(null);
  }
  function handleError(error) {
   console.error("package error:", error);
  }
  var fetchedCallback = null;
  var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
  if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, (function(data) {
   if (fetchedCallback) {
    fetchedCallback(data);
    fetchedCallback = null;
   } else {
    fetched = data;
   }
  }), handleError);
  function runWithFS() {
   function assert(check, msg) {
    if (!check) throw msg + (new Error).stack;
   }
   Module["FS_createPath"]("/", "assets", true, true);
   function DataRequest(start, end, crunched, audio) {
    this.start = start;
    this.end = end;
    this.crunched = crunched;
    this.audio = audio;
   }
   DataRequest.prototype = {
    requests: {},
    open: (function(mode, name) {
     this.name = name;
     this.requests[name] = this;
     Module["addRunDependency"]("fp " + this.name);
    }),
    send: (function() {}),
    onload: (function() {
     var byteArray = this.byteArray.subarray(this.start, this.end);
     this.finish(byteArray);
    }),
    finish: (function(byteArray) {
     var that = this;
     Module["FS_createDataFile"](this.name, null, byteArray, true, true, true);
     Module["removeRunDependency"]("fp " + that.name);
     this.requests[this.name] = null;
    })
   };
   var files = metadata.files;
   for (i = 0; i < files.length; ++i) {
    (new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio)).open("GET", files[i].filename);
   }
   function processPackageData(arrayBuffer) {
    Module.finishedDataFileDownloads++;
    assert(arrayBuffer, "Loading data file failed.");
    assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
    var byteArray = new Uint8Array(arrayBuffer);
    if (Module["SPLIT_MEMORY"]) Module.printErr("warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting");
    var ptr = Module["getMemory"](byteArray.length);
    Module["HEAPU8"].set(byteArray, ptr);
    DataRequest.prototype.byteArray = Module["HEAPU8"].subarray(ptr, ptr + byteArray.length);
    var files = metadata.files;
    for (i = 0; i < files.length; ++i) {
     DataRequest.prototype.requests[files[i].filename].onload();
    }
    Module["removeRunDependency"]("datafile_index.data");
   }
   Module["addRunDependency"]("datafile_index.data");
   if (!Module.preloadResults) Module.preloadResults = {};
   Module.preloadResults[PACKAGE_NAME] = {
    fromCache: false
   };
   if (fetched) {
    processPackageData(fetched);
    fetched = null;
   } else {
    fetchedCallback = processPackageData;
   }
  }
  if (Module["calledRun"]) {
   runWithFS();
  } else {
   if (!Module["preRun"]) Module["preRun"] = [];
   Module["preRun"].push(runWithFS);
  }
 });
 loadPackage({
  "files": [ {
   "audio": 0,
   "start": 0,
   "crunched": 0,
   "end": 17978,
   "filename": "/assets/aw.png"
  }, {
   "audio": 0,
   "start": 17978,
   "crunched": 0,
   "end": 385090,
   "filename": "/assets/arial.ttf"
  } ],
  "remote_package_size": 385090,
  "package_uuid": "8f2d44ef-94ca-4959-a0eb-c106d0b94b6e"
 });
}))();
var Module;
if (!Module) Module = (typeof Module !== "undefined" ? Module : null) || {};
var moduleOverrides = {};
for (var key in Module) {
 if (Module.hasOwnProperty(key)) {
  moduleOverrides[key] = Module[key];
 }
}
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
if (Module["ENVIRONMENT"]) {
 if (Module["ENVIRONMENT"] === "WEB") {
  ENVIRONMENT_IS_WEB = true;
 } else if (Module["ENVIRONMENT"] === "WORKER") {
  ENVIRONMENT_IS_WORKER = true;
 } else if (Module["ENVIRONMENT"] === "NODE") {
  ENVIRONMENT_IS_NODE = true;
 } else if (Module["ENVIRONMENT"] === "SHELL") {
  ENVIRONMENT_IS_SHELL = true;
 } else {
  throw new Error("The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.");
 }
} else {
 ENVIRONMENT_IS_WEB = typeof window === "object";
 ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
 ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
 ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
}
if (ENVIRONMENT_IS_NODE) {
 if (!Module["print"]) Module["print"] = console.log;
 if (!Module["printErr"]) Module["printErr"] = console.warn;
 var nodeFS;
 var nodePath;
 Module["read"] = function read(filename, binary) {
  if (!nodeFS) nodeFS = require("fs");
  if (!nodePath) nodePath = require("path");
  filename = nodePath["normalize"](filename);
  var ret = nodeFS["readFileSync"](filename);
  return binary ? ret : ret.toString();
 };
 Module["readBinary"] = function readBinary(filename) {
  var ret = Module["read"](filename, true);
  if (!ret.buffer) {
   ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
 };
 Module["load"] = function load(f) {
  globalEval(read(f));
 };
 if (!Module["thisProgram"]) {
  if (process["argv"].length > 1) {
   Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/");
  } else {
   Module["thisProgram"] = "unknown-program";
  }
 }
 Module["arguments"] = process["argv"].slice(2);
 if (typeof module !== "undefined") {
  module["exports"] = Module;
 }
 process["on"]("uncaughtException", (function(ex) {
  if (!(ex instanceof ExitStatus)) {
   throw ex;
  }
 }));
 Module["inspect"] = (function() {
  return "[Emscripten Module object]";
 });
} else if (ENVIRONMENT_IS_SHELL) {
 if (!Module["print"]) Module["print"] = print;
 if (typeof printErr != "undefined") Module["printErr"] = printErr;
 if (typeof read != "undefined") {
  Module["read"] = read;
 } else {
  Module["read"] = function read() {
   throw "no read() available";
  };
 }
 Module["readBinary"] = function readBinary(f) {
  if (typeof readbuffer === "function") {
   return new Uint8Array(readbuffer(f));
  }
  var data = read(f, "binary");
  assert(typeof data === "object");
  return data;
 };
 if (typeof scriptArgs != "undefined") {
  Module["arguments"] = scriptArgs;
 } else if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
 if (typeof quit === "function") {
  Module["quit"] = (function(status, toThrow) {
   quit(status);
  });
 }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 Module["read"] = function read(url) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", url, false);
  xhr.send(null);
  return xhr.responseText;
 };
 if (ENVIRONMENT_IS_WORKER) {
  Module["readBinary"] = function read(url) {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", url, false);
   xhr.responseType = "arraybuffer";
   xhr.send(null);
   return xhr.response;
  };
 }
 Module["readAsync"] = function readAsync(url, onload, onerror) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function xhr_onload() {
   if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
    onload(xhr.response);
   } else {
    onerror();
   }
  };
  xhr.onerror = onerror;
  xhr.send(null);
 };
 if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
 if (typeof console !== "undefined") {
  if (!Module["print"]) Module["print"] = function print(x) {
   console.log(x);
  };
  if (!Module["printErr"]) Module["printErr"] = function printErr(x) {
   console.warn(x);
  };
 } else {
  var TRY_USE_DUMP = false;
  if (!Module["print"]) Module["print"] = TRY_USE_DUMP && typeof dump !== "undefined" ? (function(x) {
   dump(x);
  }) : (function(x) {});
 }
 if (ENVIRONMENT_IS_WORKER) {
  Module["load"] = importScripts;
 }
 if (typeof Module["setWindowTitle"] === "undefined") {
  Module["setWindowTitle"] = (function(title) {
   document.title = title;
  });
 }
} else {
 throw "Unknown runtime environment. Where are we?";
}
function globalEval(x) {
 eval.call(null, x);
}
if (!Module["load"] && Module["read"]) {
 Module["load"] = function load(f) {
  globalEval(Module["read"](f));
 };
}
if (!Module["print"]) {
 Module["print"] = (function() {});
}
if (!Module["printErr"]) {
 Module["printErr"] = Module["print"];
}
if (!Module["arguments"]) {
 Module["arguments"] = [];
}
if (!Module["thisProgram"]) {
 Module["thisProgram"] = "./this.program";
}
if (!Module["quit"]) {
 Module["quit"] = (function(status, toThrow) {
  throw toThrow;
 });
}
Module.print = Module["print"];
Module.printErr = Module["printErr"];
Module["preRun"] = [];
Module["postRun"] = [];
for (var key in moduleOverrides) {
 if (moduleOverrides.hasOwnProperty(key)) {
  Module[key] = moduleOverrides[key];
 }
}
moduleOverrides = undefined;
var Runtime = {
 setTempRet0: (function(value) {
  tempRet0 = value;
  return value;
 }),
 getTempRet0: (function() {
  return tempRet0;
 }),
 stackSave: (function() {
  return STACKTOP;
 }),
 stackRestore: (function(stackTop) {
  STACKTOP = stackTop;
 }),
 getNativeTypeSize: (function(type) {
  switch (type) {
  case "i1":
  case "i8":
   return 1;
  case "i16":
   return 2;
  case "i32":
   return 4;
  case "i64":
   return 8;
  case "float":
   return 4;
  case "double":
   return 8;
  default:
   {
    if (type[type.length - 1] === "*") {
     return Runtime.QUANTUM_SIZE;
    } else if (type[0] === "i") {
     var bits = parseInt(type.substr(1));
     assert(bits % 8 === 0);
     return bits / 8;
    } else {
     return 0;
    }
   }
  }
 }),
 getNativeFieldSize: (function(type) {
  return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
 }),
 STACK_ALIGN: 16,
 prepVararg: (function(ptr, type) {
  if (type === "double" || type === "i64") {
   if (ptr & 7) {
    assert((ptr & 7) === 4);
    ptr += 4;
   }
  } else {
   assert((ptr & 3) === 0);
  }
  return ptr;
 }),
 getAlignSize: (function(type, size, vararg) {
  if (!vararg && (type == "i64" || type == "double")) return 8;
  if (!type) return Math.min(size, 8);
  return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
 }),
 dynCall: (function(sig, ptr, args) {
  if (args && args.length) {
   return Module["dynCall_" + sig].apply(null, [ ptr ].concat(args));
  } else {
   return Module["dynCall_" + sig].call(null, ptr);
  }
 }),
 functionPointers: [],
 addFunction: (function(func) {
  for (var i = 0; i < Runtime.functionPointers.length; i++) {
   if (!Runtime.functionPointers[i]) {
    Runtime.functionPointers[i] = func;
    return 2 * (1 + i);
   }
  }
  throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.";
 }),
 removeFunction: (function(index) {
  Runtime.functionPointers[(index - 2) / 2] = null;
 }),
 warnOnce: (function(text) {
  if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
  if (!Runtime.warnOnce.shown[text]) {
   Runtime.warnOnce.shown[text] = 1;
   Module.printErr(text);
  }
 }),
 funcWrappers: {},
 getFuncWrapper: (function(func, sig) {
  assert(sig);
  if (!Runtime.funcWrappers[sig]) {
   Runtime.funcWrappers[sig] = {};
  }
  var sigCache = Runtime.funcWrappers[sig];
  if (!sigCache[func]) {
   if (sig.length === 1) {
    sigCache[func] = function dynCall_wrapper() {
     return Runtime.dynCall(sig, func);
    };
   } else if (sig.length === 2) {
    sigCache[func] = function dynCall_wrapper(arg) {
     return Runtime.dynCall(sig, func, [ arg ]);
    };
   } else {
    sigCache[func] = function dynCall_wrapper() {
     return Runtime.dynCall(sig, func, Array.prototype.slice.call(arguments));
    };
   }
  }
  return sigCache[func];
 }),
 getCompilerSetting: (function(name) {
  throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work";
 }),
 stackAlloc: (function(size) {
  var ret = STACKTOP;
  STACKTOP = STACKTOP + size | 0;
  STACKTOP = STACKTOP + 15 & -16;
  return ret;
 }),
 staticAlloc: (function(size) {
  var ret = STATICTOP;
  STATICTOP = STATICTOP + size | 0;
  STATICTOP = STATICTOP + 15 & -16;
  return ret;
 }),
 dynamicAlloc: (function(size) {
  var ret = HEAP32[DYNAMICTOP_PTR >> 2];
  var end = (ret + size + 15 | 0) & -16;
  HEAP32[DYNAMICTOP_PTR >> 2] = end;
  if (end >= TOTAL_MEMORY) {
   var success = enlargeMemory();
   if (!success) {
    HEAP32[DYNAMICTOP_PTR >> 2] = ret;
    return 0;
   }
  }
  return ret;
 }),
 alignMemory: (function(size, quantum) {
  var ret = size = Math.ceil(size / (quantum ? quantum : 16)) * (quantum ? quantum : 16);
  return ret;
 }),
 makeBigInt: (function(low, high, unsigned) {
  var ret = unsigned ? +(low >>> 0) + +(high >>> 0) * 4294967296 : +(low >>> 0) + +(high | 0) * 4294967296;
  return ret;
 }),
 GLOBAL_BASE: 1024,
 QUANTUM_SIZE: 4,
 __dummy__: 0
};
Module["Runtime"] = Runtime;
var ABORT = 0;
var EXITSTATUS = 0;
function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed: " + text);
 }
}
function getCFunc(ident) {
 var func = Module["_" + ident];
 if (!func) {
  try {
   func = eval("_" + ident);
  } catch (e) {}
 }
 assert(func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)");
 return func;
}
var cwrap, ccall;
((function() {
 var JSfuncs = {
  "stackSave": (function() {
   Runtime.stackSave();
  }),
  "stackRestore": (function() {
   Runtime.stackRestore();
  }),
  "arrayToC": (function(arr) {
   var ret = Runtime.stackAlloc(arr.length);
   writeArrayToMemory(arr, ret);
   return ret;
  }),
  "stringToC": (function(str) {
   var ret = 0;
   if (str !== null && str !== undefined && str !== 0) {
    var len = (str.length << 2) + 1;
    ret = Runtime.stackAlloc(len);
    stringToUTF8(str, ret, len);
   }
   return ret;
  })
 };
 var toC = {
  "string": JSfuncs["stringToC"],
  "array": JSfuncs["arrayToC"]
 };
 ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
   for (var i = 0; i < args.length; i++) {
    var converter = toC[argTypes[i]];
    if (converter) {
     if (stack === 0) stack = Runtime.stackSave();
     cArgs[i] = converter(args[i]);
    } else {
     cArgs[i] = args[i];
    }
   }
  }
  var ret = func.apply(null, cArgs);
  if (returnType === "string") ret = Pointer_stringify(ret);
  if (stack !== 0) {
   if (opts && opts.async) {
    EmterpreterAsync.asyncFinalizers.push((function() {
     Runtime.stackRestore(stack);
    }));
    return;
   }
   Runtime.stackRestore(stack);
  }
  return ret;
 };
 var sourceRegex = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
 function parseJSFunc(jsfunc) {
  var parsed = jsfunc.toString().match(sourceRegex).slice(1);
  return {
   arguments: parsed[0],
   body: parsed[1],
   returnValue: parsed[2]
  };
 }
 var JSsource = null;
 function ensureJSsource() {
  if (!JSsource) {
   JSsource = {};
   for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
     JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
   }
  }
 }
 cwrap = function cwrap(ident, returnType, argTypes) {
  argTypes = argTypes || [];
  var cfunc = getCFunc(ident);
  var numericArgs = argTypes.every((function(type) {
   return type === "number";
  }));
  var numericRet = returnType !== "string";
  if (numericRet && numericArgs) {
   return cfunc;
  }
  var argNames = argTypes.map((function(x, i) {
   return "$" + i;
  }));
  var funcstr = "(function(" + argNames.join(",") + ") {";
  var nargs = argTypes.length;
  if (!numericArgs) {
   ensureJSsource();
   funcstr += "var stack = " + JSsource["stackSave"].body + ";";
   for (var i = 0; i < nargs; i++) {
    var arg = argNames[i], type = argTypes[i];
    if (type === "number") continue;
    var convertCode = JSsource[type + "ToC"];
    funcstr += "var " + convertCode.arguments + " = " + arg + ";";
    funcstr += convertCode.body + ";";
    funcstr += arg + "=(" + convertCode.returnValue + ");";
   }
  }
  var cfuncname = parseJSFunc((function() {
   return cfunc;
  })).returnValue;
  funcstr += "var ret = " + cfuncname + "(" + argNames.join(",") + ");";
  if (!numericRet) {
   var strgfy = parseJSFunc((function() {
    return Pointer_stringify;
   })).returnValue;
   funcstr += "ret = " + strgfy + "(ret);";
  }
  if (!numericArgs) {
   ensureJSsource();
   funcstr += JSsource["stackRestore"].body.replace("()", "(stack)") + ";";
  }
  funcstr += "return ret})";
  return eval(funcstr);
 };
}))();
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
function setValue(ptr, value, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  HEAP8[ptr >> 0] = value;
  break;
 case "i8":
  HEAP8[ptr >> 0] = value;
  break;
 case "i16":
  HEAP16[ptr >> 1] = value;
  break;
 case "i32":
  HEAP32[ptr >> 2] = value;
  break;
 case "i64":
  tempI64 = [ value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
  break;
 case "float":
  HEAPF32[ptr >> 2] = value;
  break;
 case "double":
  HEAPF64[ptr >> 3] = value;
  break;
 default:
  abort("invalid type for setValue: " + type);
 }
}
Module["setValue"] = setValue;
function getValue(ptr, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  return HEAP8[ptr >> 0];
 case "i8":
  return HEAP8[ptr >> 0];
 case "i16":
  return HEAP16[ptr >> 1];
 case "i32":
  return HEAP32[ptr >> 2];
 case "i64":
  return HEAP32[ptr >> 2];
 case "float":
  return HEAPF32[ptr >> 2];
 case "double":
  return HEAPF64[ptr >> 3];
 default:
  abort("invalid type for setValue: " + type);
 }
 return null;
}
Module["getValue"] = getValue;
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
var ALLOC_STATIC = 2;
var ALLOC_DYNAMIC = 3;
var ALLOC_NONE = 4;
Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
Module["ALLOC_STACK"] = ALLOC_STACK;
Module["ALLOC_STATIC"] = ALLOC_STATIC;
Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
Module["ALLOC_NONE"] = ALLOC_NONE;
function allocate(slab, types, allocator, ptr) {
 var zeroinit, size;
 if (typeof slab === "number") {
  zeroinit = true;
  size = slab;
 } else {
  zeroinit = false;
  size = slab.length;
 }
 var singleType = typeof types === "string" ? types : null;
 var ret;
 if (allocator == ALLOC_NONE) {
  ret = ptr;
 } else {
  ret = [ typeof _malloc === "function" ? _malloc : Runtime.staticAlloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc ][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
 }
 if (zeroinit) {
  var ptr = ret, stop;
  assert((ret & 3) == 0);
  stop = ret + (size & ~3);
  for (; ptr < stop; ptr += 4) {
   HEAP32[ptr >> 2] = 0;
  }
  stop = ret + size;
  while (ptr < stop) {
   HEAP8[ptr++ >> 0] = 0;
  }
  return ret;
 }
 if (singleType === "i8") {
  if (slab.subarray || slab.slice) {
   HEAPU8.set(slab, ret);
  } else {
   HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
 }
 var i = 0, type, typeSize, previousType;
 while (i < size) {
  var curr = slab[i];
  if (typeof curr === "function") {
   curr = Runtime.getFunctionIndex(curr);
  }
  type = singleType || types[i];
  if (type === 0) {
   i++;
   continue;
  }
  if (type == "i64") type = "i32";
  setValue(ret + i, curr, type);
  if (previousType !== type) {
   typeSize = Runtime.getNativeTypeSize(type);
   previousType = type;
  }
  i += typeSize;
 }
 return ret;
}
Module["allocate"] = allocate;
function getMemory(size) {
 if (!staticSealed) return Runtime.staticAlloc(size);
 if (!runtimeInitialized) return Runtime.dynamicAlloc(size);
 return _malloc(size);
}
Module["getMemory"] = getMemory;
function Pointer_stringify(ptr, length) {
 if (length === 0 || !ptr) return "";
 var hasUtf = 0;
 var t;
 var i = 0;
 while (1) {
  t = HEAPU8[ptr + i >> 0];
  hasUtf |= t;
  if (t == 0 && !length) break;
  i++;
  if (length && i == length) break;
 }
 if (!length) length = i;
 var ret = "";
 if (hasUtf < 128) {
  var MAX_CHUNK = 1024;
  var curr;
  while (length > 0) {
   curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
   ret = ret ? ret + curr : curr;
   ptr += MAX_CHUNK;
   length -= MAX_CHUNK;
  }
  return ret;
 }
 return Module["UTF8ToString"](ptr);
}
Module["Pointer_stringify"] = Pointer_stringify;
function AsciiToString(ptr) {
 var str = "";
 while (1) {
  var ch = HEAP8[ptr++ >> 0];
  if (!ch) return str;
  str += String.fromCharCode(ch);
 }
}
Module["AsciiToString"] = AsciiToString;
function stringToAscii(str, outPtr) {
 return writeAsciiToMemory(str, outPtr, false);
}
Module["stringToAscii"] = stringToAscii;
var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;
function UTF8ArrayToString(u8Array, idx) {
 var endPtr = idx;
 while (u8Array[endPtr]) ++endPtr;
 if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
  return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
 } else {
  var u0, u1, u2, u3, u4, u5;
  var str = "";
  while (1) {
   u0 = u8Array[idx++];
   if (!u0) return str;
   if (!(u0 & 128)) {
    str += String.fromCharCode(u0);
    continue;
   }
   u1 = u8Array[idx++] & 63;
   if ((u0 & 224) == 192) {
    str += String.fromCharCode((u0 & 31) << 6 | u1);
    continue;
   }
   u2 = u8Array[idx++] & 63;
   if ((u0 & 240) == 224) {
    u0 = (u0 & 15) << 12 | u1 << 6 | u2;
   } else {
    u3 = u8Array[idx++] & 63;
    if ((u0 & 248) == 240) {
     u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3;
    } else {
     u4 = u8Array[idx++] & 63;
     if ((u0 & 252) == 248) {
      u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4;
     } else {
      u5 = u8Array[idx++] & 63;
      u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5;
     }
    }
   }
   if (u0 < 65536) {
    str += String.fromCharCode(u0);
   } else {
    var ch = u0 - 65536;
    str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
   }
  }
 }
}
Module["UTF8ArrayToString"] = UTF8ArrayToString;
function UTF8ToString(ptr) {
 return UTF8ArrayToString(HEAPU8, ptr);
}
Module["UTF8ToString"] = UTF8ToString;
function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   outU8Array[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   outU8Array[outIdx++] = 192 | u >> 6;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   outU8Array[outIdx++] = 224 | u >> 12;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 2097151) {
   if (outIdx + 3 >= endIdx) break;
   outU8Array[outIdx++] = 240 | u >> 18;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 67108863) {
   if (outIdx + 4 >= endIdx) break;
   outU8Array[outIdx++] = 248 | u >> 24;
   outU8Array[outIdx++] = 128 | u >> 18 & 63;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else {
   if (outIdx + 5 >= endIdx) break;
   outU8Array[outIdx++] = 252 | u >> 30;
   outU8Array[outIdx++] = 128 | u >> 24 & 63;
   outU8Array[outIdx++] = 128 | u >> 18 & 63;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  }
 }
 outU8Array[outIdx] = 0;
 return outIdx - startIdx;
}
Module["stringToUTF8Array"] = stringToUTF8Array;
function stringToUTF8(str, outPtr, maxBytesToWrite) {
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
Module["stringToUTF8"] = stringToUTF8;
function lengthBytesUTF8(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) {
   ++len;
  } else if (u <= 2047) {
   len += 2;
  } else if (u <= 65535) {
   len += 3;
  } else if (u <= 2097151) {
   len += 4;
  } else if (u <= 67108863) {
   len += 5;
  } else {
   len += 6;
  }
 }
 return len;
}
Module["lengthBytesUTF8"] = lengthBytesUTF8;
var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;
function demangle(func) {
 var __cxa_demangle_func = Module["___cxa_demangle"] || Module["__cxa_demangle"];
 if (__cxa_demangle_func) {
  try {
   var s = func.substr(1);
   var len = lengthBytesUTF8(s) + 1;
   var buf = _malloc(len);
   stringToUTF8(s, buf, len);
   var status = _malloc(4);
   var ret = __cxa_demangle_func(buf, 0, 0, status);
   if (getValue(status, "i32") === 0 && ret) {
    return Pointer_stringify(ret);
   }
  } catch (e) {} finally {
   if (buf) _free(buf);
   if (status) _free(status);
   if (ret) _free(ret);
  }
  return func;
 }
 Runtime.warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
 return func;
}
function demangleAll(text) {
 var regex = /__Z[\w\d_]+/g;
 return text.replace(regex, (function(x) {
  var y = demangle(x);
  return x === y ? x : x + " [" + y + "]";
 }));
}
function jsStackTrace() {
 var err = new Error;
 if (!err.stack) {
  try {
   throw new Error(0);
  } catch (e) {
   err = e;
  }
  if (!err.stack) {
   return "(no stack trace available)";
  }
 }
 return err.stack.toString();
}
function stackTrace() {
 var js = jsStackTrace();
 if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
 return demangleAll(js);
}
Module["stackTrace"] = stackTrace;
var WASM_PAGE_SIZE = 65536;
var ASMJS_PAGE_SIZE = 16777216;
function alignUp(x, multiple) {
 if (x % multiple > 0) {
  x += multiple - x % multiple;
 }
 return x;
}
var HEAP;
var buffer;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBuffer(buf) {
 Module["buffer"] = buffer = buf;
}
function updateGlobalBufferViews() {
 Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
 Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
 Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer);
}
var STATIC_BASE, STATICTOP, staticSealed;
var STACK_BASE, STACKTOP, STACK_MAX;
var DYNAMIC_BASE, DYNAMICTOP_PTR;
STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
staticSealed = false;
function abortOnCannotGrowMemory() {
 abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ");
}
function enlargeMemory() {
 abortOnCannotGrowMemory();
}
var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;
var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
if (TOTAL_MEMORY < TOTAL_STACK) Module.printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
if (Module["buffer"]) {
 buffer = Module["buffer"];
} else {
 if (typeof WebAssembly === "object" && typeof WebAssembly.Memory === "function") {
  Module["wasmMemory"] = new WebAssembly.Memory({
   "initial": TOTAL_MEMORY / WASM_PAGE_SIZE,
   "maximum": TOTAL_MEMORY / WASM_PAGE_SIZE
  });
  buffer = Module["wasmMemory"].buffer;
 } else {
  buffer = new ArrayBuffer(TOTAL_MEMORY);
 }
}
updateGlobalBufferViews();
function getTotalMemory() {
 return TOTAL_MEMORY;
}
HEAP32[0] = 1668509029;
HEAP16[1] = 25459;
if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99) throw "Runtime error: expected the system to be little-endian!";
Module["HEAP"] = HEAP;
Module["buffer"] = buffer;
Module["HEAP8"] = HEAP8;
Module["HEAP16"] = HEAP16;
Module["HEAP32"] = HEAP32;
Module["HEAPU8"] = HEAPU8;
Module["HEAPU16"] = HEAPU16;
Module["HEAPU32"] = HEAPU32;
Module["HEAPF32"] = HEAPF32;
Module["HEAPF64"] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
 while (callbacks.length > 0) {
  var callback = callbacks.shift();
  if (typeof callback == "function") {
   callback();
   continue;
  }
  var func = callback.func;
  if (typeof func === "number") {
   if (callback.arg === undefined) {
    Module["dynCall_v"](func);
   } else {
    Module["dynCall_vi"](func, callback.arg);
   }
  } else {
   func(callback.arg === undefined ? null : callback.arg);
  }
 }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
 if (runtimeInitialized) return;
 runtimeInitialized = true;
 callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
 callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
 callRuntimeCallbacks(__ATEXIT__);
 runtimeExited = true;
}
function postRun() {
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}
Module["addOnPreRun"] = addOnPreRun;
function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}
Module["addOnInit"] = addOnInit;
function addOnPreMain(cb) {
 __ATMAIN__.unshift(cb);
}
Module["addOnPreMain"] = addOnPreMain;
function addOnExit(cb) {
 __ATEXIT__.unshift(cb);
}
Module["addOnExit"] = addOnExit;
function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}
Module["addOnPostRun"] = addOnPostRun;
function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}
Module["intArrayFromString"] = intArrayFromString;
function intArrayToString(array) {
 var ret = [];
 for (var i = 0; i < array.length; i++) {
  var chr = array[i];
  if (chr > 255) {
   chr &= 255;
  }
  ret.push(String.fromCharCode(chr));
 }
 return ret.join("");
}
Module["intArrayToString"] = intArrayToString;
function writeStringToMemory(string, buffer, dontAddNull) {
 Runtime.warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");
 var lastChar, end;
 if (dontAddNull) {
  end = buffer + lengthBytesUTF8(string);
  lastChar = HEAP8[end];
 }
 stringToUTF8(string, buffer, Infinity);
 if (dontAddNull) HEAP8[end] = lastChar;
}
Module["writeStringToMemory"] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
 HEAP8.set(array, buffer);
}
Module["writeArrayToMemory"] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
 for (var i = 0; i < str.length; ++i) {
  HEAP8[buffer++ >> 0] = str.charCodeAt(i);
 }
 if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}
Module["writeAsciiToMemory"] = writeAsciiToMemory;
if (!Math["imul"] || Math["imul"](4294967295, 5) !== -5) Math["imul"] = function imul(a, b) {
 var ah = a >>> 16;
 var al = a & 65535;
 var bh = b >>> 16;
 var bl = b & 65535;
 return al * bl + (ah * bl + al * bh << 16) | 0;
};
Math.imul = Math["imul"];
if (!Math["fround"]) {
 var froundBuffer = new Float32Array(1);
 Math["fround"] = (function(x) {
  froundBuffer[0] = x;
  return froundBuffer[0];
 });
}
Math.fround = Math["fround"];
if (!Math["clz32"]) Math["clz32"] = (function(x) {
 x = x >>> 0;
 for (var i = 0; i < 32; i++) {
  if (x & 1 << 31 - i) return i;
 }
 return 32;
});
Math.clz32 = Math["clz32"];
if (!Math["trunc"]) Math["trunc"] = (function(x) {
 return x < 0 ? Math.ceil(x) : Math.floor(x);
});
Math.trunc = Math["trunc"];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_round = Math.round;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;
var Math_trunc = Math.trunc;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function getUniqueRunDependency(id) {
 return id;
}
function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
}
Module["addRunDependency"] = addRunDependency;
function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}
Module["removeRunDependency"] = removeRunDependency;
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var memoryInitializer = null;
function integrateWasmJS(Module) {
 var method = Module["wasmJSMethod"] || "native-wasm";
 Module["wasmJSMethod"] = method;
 var wasmTextFile = Module["wasmTextFile"] || "index.wast";
 var wasmBinaryFile = Module["wasmBinaryFile"] || "index.wasm";
 var asmjsCodeFile = Module["asmjsCodeFile"] || "index.temp.asm.js";
 var wasmPageSize = 64 * 1024;
 var asm2wasmImports = {
  "f64-rem": (function(x, y) {
   return x % y;
  }),
  "f64-to-int": (function(x) {
   return x | 0;
  }),
  "i32s-div": (function(x, y) {
   return (x | 0) / (y | 0) | 0;
  }),
  "i32u-div": (function(x, y) {
   return (x >>> 0) / (y >>> 0) >>> 0;
  }),
  "i32s-rem": (function(x, y) {
   return (x | 0) % (y | 0) | 0;
  }),
  "i32u-rem": (function(x, y) {
   return (x >>> 0) % (y >>> 0) >>> 0;
  }),
  "debugger": (function() {
   debugger;
  })
 };
 var info = {
  "global": null,
  "env": null,
  "asm2wasm": asm2wasmImports,
  "parent": Module
 };
 var exports = null;
 function lookupImport(mod, base) {
  var lookup = info;
  if (mod.indexOf(".") < 0) {
   lookup = (lookup || {})[mod];
  } else {
   var parts = mod.split(".");
   lookup = (lookup || {})[parts[0]];
   lookup = (lookup || {})[parts[1]];
  }
  if (base) {
   lookup = (lookup || {})[base];
  }
  if (lookup === undefined) {
   abort("bad lookupImport to (" + mod + ")." + base);
  }
  return lookup;
 }
 function mergeMemory(newBuffer) {
  var oldBuffer = Module["buffer"];
  if (newBuffer.byteLength < oldBuffer.byteLength) {
   Module["printErr"]("the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here");
  }
  var oldView = new Int8Array(oldBuffer);
  var newView = new Int8Array(newBuffer);
  if (!memoryInitializer) {
   oldView.set(newView.subarray(Module["STATIC_BASE"], Module["STATIC_BASE"] + Module["STATIC_BUMP"]), Module["STATIC_BASE"]);
  }
  newView.set(oldView);
  updateGlobalBuffer(newBuffer);
  updateGlobalBufferViews();
 }
 var WasmTypes = {
  none: 0,
  i32: 1,
  i64: 2,
  f32: 3,
  f64: 4
 };
 function fixImports(imports) {
  if (!0) return imports;
  var ret = {};
  for (var i in imports) {
   var fixed = i;
   if (fixed[0] == "_") fixed = fixed.substr(1);
   ret[fixed] = imports[i];
  }
  return ret;
 }
 function getBinary() {
  var binary;
  if (Module["wasmBinary"]) {
   binary = Module["wasmBinary"];
   binary = new Uint8Array(binary);
  } else if (Module["readBinary"]) {
   binary = Module["readBinary"](wasmBinaryFile);
  } else {
   throw "on the web, we need the wasm binary to be preloaded and set on Module['wasmBinary']. emcc.py will do that for you when generating HTML (but not JS)";
  }
  return binary;
 }
 function getBinaryPromise() {
  if (!Module["wasmBinary"] && typeof fetch === "function") {
   return fetch(wasmBinaryFile).then((function(response) {
    return response.arrayBuffer();
   }));
  }
  return new Promise((function(resolve, reject) {
   resolve(getBinary());
  }));
 }
 function doJustAsm(global, env, providedBuffer) {
  if (typeof Module["asm"] !== "function" || Module["asm"] === methodHandler) {
   if (!Module["asmPreload"]) {
    eval(Module["read"](asmjsCodeFile));
   } else {
    Module["asm"] = Module["asmPreload"];
   }
  }
  if (typeof Module["asm"] !== "function") {
   Module["printErr"]("asm evalling did not set the module properly");
   return false;
  }
  return Module["asm"](global, env, providedBuffer);
 }
 function doNativeWasm(global, env, providedBuffer) {
  if (typeof WebAssembly !== "object") {
   Module["printErr"]("no native wasm support detected");
   return false;
  }
  if (!(Module["wasmMemory"] instanceof WebAssembly.Memory)) {
   Module["printErr"]("no native wasm Memory in use");
   return false;
  }
  env["memory"] = Module["wasmMemory"];
  info["global"] = {
   "NaN": NaN,
   "Infinity": Infinity
  };
  info["global.Math"] = global.Math;
  info["env"] = env;
  function receiveInstance(instance) {
   exports = instance.exports;
   if (exports.memory) mergeMemory(exports.memory);
   Module["asm"] = exports;
   Module["usingWasm"] = true;
   removeRunDependency("wasm-instantiate");
  }
  addRunDependency("wasm-instantiate");
  if (Module["instantiateWasm"]) {
   try {
    return Module["instantiateWasm"](info, receiveInstance);
   } catch (e) {
    Module["printErr"]("Module.instantiateWasm callback failed with error: " + e);
    return false;
   }
  }
  Module["printErr"]("asynchronously preparing wasm");
  getBinaryPromise().then((function(binary) {
   return WebAssembly.instantiate(binary, info);
  })).then((function(output) {
   receiveInstance(output.instance);
  })).catch((function(reason) {
   Module["printErr"]("failed to asynchronously prepare wasm: " + reason);
   Module["quit"](1, reason);
  }));
  return {};
 }
 function doWasmPolyfill(global, env, providedBuffer, method) {
  if (typeof WasmJS !== "function") {
   Module["printErr"]("WasmJS not detected - polyfill not bundled?");
   return false;
  }
  var wasmJS = WasmJS({});
  wasmJS["outside"] = Module;
  wasmJS["info"] = info;
  wasmJS["lookupImport"] = lookupImport;
  assert(providedBuffer === Module["buffer"]);
  info.global = global;
  info.env = env;
  assert(providedBuffer === Module["buffer"]);
  env["memory"] = providedBuffer;
  assert(env["memory"] instanceof ArrayBuffer);
  wasmJS["providedTotalMemory"] = Module["buffer"].byteLength;
  var code;
  if (method === "interpret-binary") {
   code = getBinary();
  } else {
   code = Module["read"](method == "interpret-asm2wasm" ? asmjsCodeFile : wasmTextFile);
  }
  var temp;
  if (method == "interpret-asm2wasm") {
   temp = wasmJS["_malloc"](code.length + 1);
   wasmJS["writeAsciiToMemory"](code, temp);
   wasmJS["_load_asm2wasm"](temp);
  } else if (method === "interpret-s-expr") {
   temp = wasmJS["_malloc"](code.length + 1);
   wasmJS["writeAsciiToMemory"](code, temp);
   wasmJS["_load_s_expr2wasm"](temp);
  } else if (method === "interpret-binary") {
   temp = wasmJS["_malloc"](code.length);
   wasmJS["HEAPU8"].set(code, temp);
   wasmJS["_load_binary2wasm"](temp, code.length);
  } else {
   throw "what? " + method;
  }
  wasmJS["_free"](temp);
  wasmJS["_instantiate"](temp);
  if (Module["newBuffer"]) {
   mergeMemory(Module["newBuffer"]);
   Module["newBuffer"] = null;
  }
  exports = wasmJS["asmExports"];
  return exports;
 }
 Module["asmPreload"] = Module["asm"];
 Module["reallocBuffer"] = (function(size) {
  var PAGE_MULTIPLE = Module["usingWasm"] ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE;
  size = alignUp(size, PAGE_MULTIPLE);
  var old = Module["buffer"];
  var oldSize = old.byteLength;
  if (Module["usingWasm"]) {
   try {
    var result = Module["wasmMemory"].grow((size - oldSize) / wasmPageSize);
    if (result !== (-1 | 0)) {
     return Module["buffer"] = Module["wasmMemory"].buffer;
    } else {
     return null;
    }
   } catch (e) {
    return null;
   }
  } else {
   exports["__growWasmMemory"]((size - oldSize) / wasmPageSize);
   return Module["buffer"] !== old ? Module["buffer"] : null;
  }
 });
 Module["asm"] = (function(global, env, providedBuffer) {
  global = fixImports(global);
  env = fixImports(env);
  if (!env["table"]) {
   var TABLE_SIZE = Module["wasmTableSize"];
   if (TABLE_SIZE === undefined) TABLE_SIZE = 1024;
   var MAX_TABLE_SIZE = Module["wasmMaxTableSize"];
   if (typeof WebAssembly === "object" && typeof WebAssembly.Table === "function") {
    if (MAX_TABLE_SIZE !== undefined) {
     env["table"] = new WebAssembly.Table({
      "initial": TABLE_SIZE,
      "maximum": MAX_TABLE_SIZE,
      "element": "anyfunc"
     });
    } else {
     env["table"] = new WebAssembly.Table({
      "initial": TABLE_SIZE,
      element: "anyfunc"
     });
    }
   } else {
    env["table"] = new Array(TABLE_SIZE);
   }
   Module["wasmTable"] = env["table"];
  }
  if (!env["memoryBase"]) {
   env["memoryBase"] = Module["STATIC_BASE"];
  }
  if (!env["tableBase"]) {
   env["tableBase"] = 0;
  }
  var exports;
  var methods = method.split(",");
  for (var i = 0; i < methods.length; i++) {
   var curr = methods[i];
   Module["printErr"]("trying binaryen method: " + curr);
   if (curr === "native-wasm") {
    if (exports = doNativeWasm(global, env, providedBuffer)) break;
   } else if (curr === "asmjs") {
    if (exports = doJustAsm(global, env, providedBuffer)) break;
   } else if (curr === "interpret-asm2wasm" || curr === "interpret-s-expr" || curr === "interpret-binary") {
    if (exports = doWasmPolyfill(global, env, providedBuffer, curr)) break;
   } else {
    throw "bad method: " + curr;
   }
  }
  if (!exports) throw "no binaryen method succeeded. consider enabling more options, like interpreting, if you want that: https://github.com/kripken/emscripten/wiki/WebAssembly#binaryen-methods";
  Module["printErr"]("binaryen method succeeded.");
  return exports;
 });
 var methodHandler = Module["asm"];
}
integrateWasmJS(Module);
var ASM_CONSTS = [ (function() {
 {
  return screen.width;
 }
}), (function() {
 {
  return screen.height;
 }
}), (function($0) {
 {
  if (typeof Module["setWindowTitle"] !== "undefined") {
   Module["setWindowTitle"](Module["Pointer_stringify"]($0));
  }
  return 0;
 }
}), (function($0, $1, $2) {
 {
  var w = $0;
  var h = $1;
  var pixels = $2;
  if (!Module["SDL2"]) Module["SDL2"] = {};
  var SDL2 = Module["SDL2"];
  if (SDL2.ctxCanvas !== Module["canvas"]) {
   SDL2.ctx = Module["createContext"](Module["canvas"], false, true);
   SDL2.ctxCanvas = Module["canvas"];
  }
  if (SDL2.w !== w || SDL2.h !== h || SDL2.imageCtx !== SDL2.ctx) {
   SDL2.image = SDL2.ctx.createImageData(w, h);
   SDL2.w = w;
   SDL2.h = h;
   SDL2.imageCtx = SDL2.ctx;
  }
  var data = SDL2.image.data;
  var src = pixels >> 2;
  var dst = 0;
  var num;
  if (typeof CanvasPixelArray !== "undefined" && data instanceof CanvasPixelArray) {
   num = data.length;
   while (dst < num) {
    var val = HEAP32[src];
    data[dst] = val & 255;
    data[dst + 1] = val >> 8 & 255;
    data[dst + 2] = val >> 16 & 255;
    data[dst + 3] = 255;
    src++;
    dst += 4;
   }
  } else {
   if (SDL2.data32Data !== data) {
    SDL2.data32 = new Int32Array(data.buffer);
    SDL2.data8 = new Uint8Array(data.buffer);
   }
   var data32 = SDL2.data32;
   num = data32.length;
   data32.set(HEAP32.subarray(src, src + num));
   var data8 = SDL2.data8;
   var i = 3;
   var j = i + 4 * num;
   if (num % 8 == 0) {
    while (i < j) {
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
     data8[i] = 255;
     i = i + 4 | 0;
    }
   } else {
    while (i < j) {
     data8[i] = 255;
     i = i + 4 | 0;
    }
   }
  }
  SDL2.ctx.putImageData(SDL2.image, 0, 0);
  return 0;
 }
}), (function($0, $1, $2) {
 {
  var w = $0;
  var h = $1;
  var pixels = $2;
  var canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext("2d");
  var image = ctx.createImageData(w, h);
  var data = image.data;
  var src = pixels >> 2;
  var dst = 0;
  var num;
  if (typeof CanvasPixelArray !== "undefined" && data instanceof CanvasPixelArray) {
   num = data.length;
   while (dst < num) {
    var val = HEAP32[src];
    data[dst] = val & 255;
    data[dst + 1] = val >> 8 & 255;
    data[dst + 2] = val >> 16 & 255;
    data[dst + 3] = val >> 24 & 255;
    src++;
    dst += 4;
   }
  } else {
   var data32 = new Int32Array(data.buffer);
   num = data32.length;
   data32.set(HEAP32.subarray(src, src + num));
  }
  ctx.putImageData(image, 0, 0);
  var url = "url(" + canvas.toDataURL() + "), auto";
  var urlBuf = _malloc(url.length + 1);
  stringToUTF8(url, urlBuf, url.length + 1);
  return urlBuf;
 }
}), (function($0) {
 {
  if (Module["canvas"]) {
   Module["canvas"].style["cursor"] = Module["Pointer_stringify"]($0);
  }
  return 0;
 }
}), (function() {
 if (Module["canvas"]) {
  Module["canvas"].style["cursor"] = "none";
 }
}), (function() {
 {
  if (typeof AudioContext !== "undefined") {
   return 1;
  } else if (typeof webkitAudioContext !== "undefined") {
   return 1;
  }
  return 0;
 }
}), (function() {
 {
  if (typeof navigator.mediaDevices !== "undefined" && typeof navigator.mediaDevices.getUserMedia !== "undefined") {
   return 1;
  } else if (typeof navigator.webkitGetUserMedia !== "undefined") {
   return 1;
  }
  return 0;
 }
}), (function($0) {
 {
  if (typeof SDL2 === "undefined") {
   SDL2 = {};
  }
  if (!$0) {
   SDL2.audio = {};
  } else {
   SDL2.capture = {};
  }
  if (!SDL2.audioContext) {
   if (typeof AudioContext !== "undefined") {
    SDL2.audioContext = new AudioContext;
   } else if (typeof webkitAudioContext !== "undefined") {
    SDL2.audioContext = new webkitAudioContext;
   }
  }
  return SDL2.audioContext === undefined ? -1 : 0;
 }
}), (function() {
 {
  return SDL2.audioContext.sampleRate;
 }
}), (function($0, $1, $2, $3) {
 {
  var have_microphone = (function(stream) {
   if (SDL2.capture.silenceTimer !== undefined) {
    clearTimeout(SDL2.capture.silenceTimer);
    SDL2.capture.silenceTimer = undefined;
   }
   SDL2.capture.mediaStreamNode = SDL2.audioContext.createMediaStreamSource(stream);
   SDL2.capture.scriptProcessorNode = SDL2.audioContext.createScriptProcessor($1, $0, 1);
   SDL2.capture.scriptProcessorNode.onaudioprocess = (function(audioProcessingEvent) {
    if (SDL2 === undefined || SDL2.capture === undefined) {
     return;
    }
    audioProcessingEvent.outputBuffer.getChannelData(0).fill(0);
    SDL2.capture.currentCaptureBuffer = audioProcessingEvent.inputBuffer;
    Runtime.dynCall("vi", $2, [ $3 ]);
   });
   SDL2.capture.mediaStreamNode.connect(SDL2.capture.scriptProcessorNode);
   SDL2.capture.scriptProcessorNode.connect(SDL2.audioContext.destination);
   SDL2.capture.stream = stream;
  });
  var no_microphone = (function(error) {});
  SDL2.capture.silenceBuffer = SDL2.audioContext.createBuffer($0, $1, SDL2.audioContext.sampleRate);
  SDL2.capture.silenceBuffer.getChannelData(0).fill(0);
  var silence_callback = (function() {
   SDL2.capture.currentCaptureBuffer = SDL2.capture.silenceBuffer;
   Runtime.dynCall("vi", $2, [ $3 ]);
  });
  SDL2.capture.silenceTimer = setTimeout(silence_callback, $1 / SDL2.audioContext.sampleRate * 1e3);
  if (navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined) {
   navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
   }).then(have_microphone).catch(no_microphone);
  } else if (navigator.webkitGetUserMedia !== undefined) {
   navigator.webkitGetUserMedia({
    audio: true,
    video: false
   }, have_microphone, no_microphone);
  }
 }
}), (function($0, $1, $2, $3) {
 {
  SDL2.audio.scriptProcessorNode = SDL2.audioContext["createScriptProcessor"]($1, 0, $0);
  SDL2.audio.scriptProcessorNode["onaudioprocess"] = (function(e) {
   if (SDL2 === undefined || SDL2.audio === undefined) {
    return;
   }
   SDL2.audio.currentOutputBuffer = e["outputBuffer"];
   Runtime.dynCall("vi", $2, [ $3 ]);
  });
  SDL2.audio.scriptProcessorNode["connect"](SDL2.audioContext["destination"]);
 }
}), (function($0) {
 {
  if ($0) {
   if (SDL2.capture.silenceTimer !== undefined) {
    clearTimeout(SDL2.capture.silenceTimer);
   }
   if (SDL2.capture.stream !== undefined) {
    var tracks = SDL2.capture.stream.getAudioTracks();
    for (var i = 0; i < tracks.length; i++) {
     SDL2.capture.stream.removeTrack(tracks[i]);
    }
    SDL2.capture.stream = undefined;
   }
   if (SDL2.capture.scriptProcessorNode !== undefined) {
    SDL2.capture.scriptProcessorNode.onaudioprocess = (function(audioProcessingEvent) {});
    SDL2.capture.scriptProcessorNode.disconnect();
    SDL2.capture.scriptProcessorNode = undefined;
   }
   if (SDL2.capture.mediaStreamNode !== undefined) {
    SDL2.capture.mediaStreamNode.disconnect();
    SDL2.capture.mediaStreamNode = undefined;
   }
   if (SDL2.capture.silenceBuffer !== undefined) {
    SDL2.capture.silenceBuffer = undefined;
   }
   SDL2.capture = undefined;
  } else {
   if (SDL2.audio.scriptProcessorNode != undefined) {
    SDL2.audio.scriptProcessorNode.disconnect();
    SDL2.audio.scriptProcessorNode = undefined;
   }
   SDL2.audio = undefined;
  }
  if (SDL2.audioContext !== undefined && SDL2.audio === undefined && SDL2.capture === undefined) {
   SDL2.audioContext.close();
   SDL2.audioContext = undefined;
  }
 }
}), (function($0, $1) {
 {
  var numChannels = SDL2.capture.currentCaptureBuffer.numberOfChannels;
  if (numChannels == 1) {
   var channelData = SDL2.capture.currentCaptureBuffer.getChannelData(0);
   if (channelData.length != $1) {
    throw "Web Audio capture buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
   }
   for (var j = 0; j < $1; ++j) {
    setValue($0 + j * 4, channelData[j], "float");
   }
  } else {
   for (var c = 0; c < numChannels; ++c) {
    var channelData = SDL2.capture.currentCaptureBuffer.getChannelData(c);
    if (channelData.length != $1) {
     throw "Web Audio capture buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
    }
    for (var j = 0; j < $1; ++j) {
     setValue($0 + (j * numChannels + c) * 4, channelData[j], "float");
    }
   }
  }
 }
}), (function($0, $1) {
 {
  var numChannels = SDL2.audio.currentOutputBuffer["numberOfChannels"];
  for (var c = 0; c < numChannels; ++c) {
   var channelData = SDL2.audio.currentOutputBuffer["getChannelData"](c);
   if (channelData.length != $1) {
    throw "Web Audio output buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
   }
   for (var j = 0; j < $1; ++j) {
    channelData[j] = HEAPF32[$0 + (j * numChannels + c << 2) >> 2];
   }
  }
 }
}), (function($0, $1) {
 {
  Module.printErr("bad name in getProcAddress: " + [ Pointer_stringify($0), Pointer_stringify($1) ]);
 }
}) ];
function _emscripten_asm_const_ii(code, a0) {
 return ASM_CONSTS[code](a0);
}
function _emscripten_asm_const_i(code) {
 return ASM_CONSTS[code]();
}
function _emscripten_asm_const_iiiii(code, a0, a1, a2, a3) {
 return ASM_CONSTS[code](a0, a1, a2, a3);
}
function _emscripten_asm_const_iiii(code, a0, a1, a2) {
 return ASM_CONSTS[code](a0, a1, a2);
}
function _emscripten_asm_const_v(code) {
 return ASM_CONSTS[code]();
}
function _emscripten_asm_const_iii(code, a0, a1) {
 return ASM_CONSTS[code](a0, a1);
}
STATIC_BASE = 1024;
STATICTOP = STATIC_BASE + 116464;
__ATINIT__.push();
memoryInitializer = Module["wasmJSMethod"].indexOf("asmjs") >= 0 || Module["wasmJSMethod"].indexOf("interpret-asm2wasm") >= 0 ? "index.html.mem" : null;
var STATIC_BUMP = 116464;
Module["STATIC_BASE"] = STATIC_BASE;
Module["STATIC_BUMP"] = STATIC_BUMP;
var tempDoublePtr = STATICTOP;
STATICTOP += 16;
var JSEvents = {
 keyEvent: 0,
 mouseEvent: 0,
 wheelEvent: 0,
 uiEvent: 0,
 focusEvent: 0,
 deviceOrientationEvent: 0,
 deviceMotionEvent: 0,
 fullscreenChangeEvent: 0,
 pointerlockChangeEvent: 0,
 visibilityChangeEvent: 0,
 touchEvent: 0,
 lastGamepadState: null,
 lastGamepadStateFrame: null,
 numGamepadsConnected: 0,
 previousFullscreenElement: null,
 previousScreenX: null,
 previousScreenY: null,
 removeEventListenersRegistered: false,
 staticInit: (function() {
  if (typeof window !== "undefined") {
   window.addEventListener("gamepadconnected", (function() {
    ++JSEvents.numGamepadsConnected;
   }));
   window.addEventListener("gamepaddisconnected", (function() {
    --JSEvents.numGamepadsConnected;
   }));
  }
 }),
 registerRemoveEventListeners: (function() {
  if (!JSEvents.removeEventListenersRegistered) {
   __ATEXIT__.push((function() {
    for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
     JSEvents._removeHandler(i);
    }
   }));
   JSEvents.removeEventListenersRegistered = true;
  }
 }),
 findEventTarget: (function(target) {
  if (target) {
   if (typeof target == "number") {
    target = Pointer_stringify(target);
   }
   if (target == "#window") return window; else if (target == "#document") return document; else if (target == "#screen") return window.screen; else if (target == "#canvas") return Module["canvas"];
   if (typeof target == "string") return document.getElementById(target); else return target;
  } else {
   return window;
  }
 }),
 deferredCalls: [],
 deferCall: (function(targetFunction, precedence, argsList) {
  function arraysHaveEqualContent(arrA, arrB) {
   if (arrA.length != arrB.length) return false;
   for (var i in arrA) {
    if (arrA[i] != arrB[i]) return false;
   }
   return true;
  }
  for (var i in JSEvents.deferredCalls) {
   var call = JSEvents.deferredCalls[i];
   if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
    return;
   }
  }
  JSEvents.deferredCalls.push({
   targetFunction: targetFunction,
   precedence: precedence,
   argsList: argsList
  });
  JSEvents.deferredCalls.sort((function(x, y) {
   return x.precedence < y.precedence;
  }));
 }),
 removeDeferredCalls: (function(targetFunction) {
  for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
   if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
    JSEvents.deferredCalls.splice(i, 1);
    --i;
   }
  }
 }),
 canPerformEventHandlerRequests: (function() {
  return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
 }),
 runDeferredCalls: (function() {
  if (!JSEvents.canPerformEventHandlerRequests()) {
   return;
  }
  for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
   var call = JSEvents.deferredCalls[i];
   JSEvents.deferredCalls.splice(i, 1);
   --i;
   call.targetFunction.apply(this, call.argsList);
  }
 }),
 inEventHandler: 0,
 currentEventHandler: null,
 eventHandlers: [],
 isInternetExplorer: (function() {
  return navigator.userAgent.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident/") > 0;
 }),
 removeAllHandlersOnTarget: (function(target, eventTypeString) {
  for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
   if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
    JSEvents._removeHandler(i--);
   }
  }
 }),
 _removeHandler: (function(i) {
  var h = JSEvents.eventHandlers[i];
  h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
  JSEvents.eventHandlers.splice(i, 1);
 }),
 registerOrRemoveHandler: (function(eventHandler) {
  var jsEventHandler = function jsEventHandler(event) {
   ++JSEvents.inEventHandler;
   JSEvents.currentEventHandler = eventHandler;
   JSEvents.runDeferredCalls();
   eventHandler.handlerFunc(event);
   JSEvents.runDeferredCalls();
   --JSEvents.inEventHandler;
  };
  if (eventHandler.callbackfunc) {
   eventHandler.eventListenerFunc = jsEventHandler;
   eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
   JSEvents.eventHandlers.push(eventHandler);
   JSEvents.registerRemoveEventListeners();
  } else {
   for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
    if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
     JSEvents._removeHandler(i--);
    }
   }
  }
 }),
 registerKeyEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.keyEvent) {
   JSEvents.keyEvent = _malloc(164);
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   stringToUTF8(e.key ? e.key : "", JSEvents.keyEvent + 0, 32);
   stringToUTF8(e.code ? e.code : "", JSEvents.keyEvent + 32, 32);
   HEAP32[JSEvents.keyEvent + 64 >> 2] = e.location;
   HEAP32[JSEvents.keyEvent + 68 >> 2] = e.ctrlKey;
   HEAP32[JSEvents.keyEvent + 72 >> 2] = e.shiftKey;
   HEAP32[JSEvents.keyEvent + 76 >> 2] = e.altKey;
   HEAP32[JSEvents.keyEvent + 80 >> 2] = e.metaKey;
   HEAP32[JSEvents.keyEvent + 84 >> 2] = e.repeat;
   stringToUTF8(e.locale ? e.locale : "", JSEvents.keyEvent + 88, 32);
   stringToUTF8(e.char ? e.char : "", JSEvents.keyEvent + 120, 32);
   HEAP32[JSEvents.keyEvent + 152 >> 2] = e.charCode;
   HEAP32[JSEvents.keyEvent + 156 >> 2] = e.keyCode;
   HEAP32[JSEvents.keyEvent + 160 >> 2] = e.which;
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.keyEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: JSEvents.findEventTarget(target),
   allowsDeferredCalls: JSEvents.isInternetExplorer() ? false : true,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 getBoundingClientRectOrZeros: (function(target) {
  return target.getBoundingClientRect ? target.getBoundingClientRect() : {
   left: 0,
   top: 0
  };
 }),
 fillMouseEventData: (function(eventStruct, e, target) {
  HEAPF64[eventStruct >> 3] = JSEvents.tick();
  HEAP32[eventStruct + 8 >> 2] = e.screenX;
  HEAP32[eventStruct + 12 >> 2] = e.screenY;
  HEAP32[eventStruct + 16 >> 2] = e.clientX;
  HEAP32[eventStruct + 20 >> 2] = e.clientY;
  HEAP32[eventStruct + 24 >> 2] = e.ctrlKey;
  HEAP32[eventStruct + 28 >> 2] = e.shiftKey;
  HEAP32[eventStruct + 32 >> 2] = e.altKey;
  HEAP32[eventStruct + 36 >> 2] = e.metaKey;
  HEAP16[eventStruct + 40 >> 1] = e.button;
  HEAP16[eventStruct + 42 >> 1] = e.buttons;
  HEAP32[eventStruct + 44 >> 2] = e["movementX"] || e["mozMovementX"] || e["webkitMovementX"] || e.screenX - JSEvents.previousScreenX;
  HEAP32[eventStruct + 48 >> 2] = e["movementY"] || e["mozMovementY"] || e["webkitMovementY"] || e.screenY - JSEvents.previousScreenY;
  if (Module["canvas"]) {
   var rect = Module["canvas"].getBoundingClientRect();
   HEAP32[eventStruct + 60 >> 2] = e.clientX - rect.left;
   HEAP32[eventStruct + 64 >> 2] = e.clientY - rect.top;
  } else {
   HEAP32[eventStruct + 60 >> 2] = 0;
   HEAP32[eventStruct + 64 >> 2] = 0;
  }
  if (target) {
   var rect = JSEvents.getBoundingClientRectOrZeros(target);
   HEAP32[eventStruct + 52 >> 2] = e.clientX - rect.left;
   HEAP32[eventStruct + 56 >> 2] = e.clientY - rect.top;
  } else {
   HEAP32[eventStruct + 52 >> 2] = 0;
   HEAP32[eventStruct + 56 >> 2] = 0;
  }
  if (e.type !== "wheel" && e.type !== "mousewheel") {
   JSEvents.previousScreenX = e.screenX;
   JSEvents.previousScreenY = e.screenY;
  }
 }),
 registerMouseEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.mouseEvent) {
   JSEvents.mouseEvent = _malloc(72);
  }
  target = JSEvents.findEventTarget(target);
  var handlerFunc = (function(event) {
   var e = event || window.event;
   JSEvents.fillMouseEventData(JSEvents.mouseEvent, e, target);
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.mouseEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: target,
   allowsDeferredCalls: eventTypeString != "mousemove" && eventTypeString != "mouseenter" && eventTypeString != "mouseleave",
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  if (JSEvents.isInternetExplorer() && eventTypeString == "mousedown") eventHandler.allowsDeferredCalls = false;
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 registerWheelEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.wheelEvent) {
   JSEvents.wheelEvent = _malloc(104);
  }
  target = JSEvents.findEventTarget(target);
  var wheelHandlerFunc = (function(event) {
   var e = event || window.event;
   JSEvents.fillMouseEventData(JSEvents.wheelEvent, e, target);
   HEAPF64[JSEvents.wheelEvent + 72 >> 3] = e["deltaX"];
   HEAPF64[JSEvents.wheelEvent + 80 >> 3] = e["deltaY"];
   HEAPF64[JSEvents.wheelEvent + 88 >> 3] = e["deltaZ"];
   HEAP32[JSEvents.wheelEvent + 96 >> 2] = e["deltaMode"];
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.wheelEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var mouseWheelHandlerFunc = (function(event) {
   var e = event || window.event;
   JSEvents.fillMouseEventData(JSEvents.wheelEvent, e, target);
   HEAPF64[JSEvents.wheelEvent + 72 >> 3] = e["wheelDeltaX"] || 0;
   HEAPF64[JSEvents.wheelEvent + 80 >> 3] = -(e["wheelDeltaY"] ? e["wheelDeltaY"] : e["wheelDelta"]);
   HEAPF64[JSEvents.wheelEvent + 88 >> 3] = 0;
   HEAP32[JSEvents.wheelEvent + 96 >> 2] = 0;
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.wheelEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: target,
   allowsDeferredCalls: true,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: eventTypeString == "wheel" ? wheelHandlerFunc : mouseWheelHandlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 pageScrollPos: (function() {
  if (window.pageXOffset > 0 || window.pageYOffset > 0) {
   return [ window.pageXOffset, window.pageYOffset ];
  }
  if (typeof document.documentElement.scrollLeft !== "undefined" || typeof document.documentElement.scrollTop !== "undefined") {
   return [ document.documentElement.scrollLeft, document.documentElement.scrollTop ];
  }
  return [ document.body.scrollLeft | 0, document.body.scrollTop | 0 ];
 }),
 registerUiEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.uiEvent) {
   JSEvents.uiEvent = _malloc(36);
  }
  if (eventTypeString == "scroll" && !target) {
   target = document;
  } else {
   target = JSEvents.findEventTarget(target);
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   if (e.target != target) {
    return;
   }
   var scrollPos = JSEvents.pageScrollPos();
   HEAP32[JSEvents.uiEvent >> 2] = e.detail;
   HEAP32[JSEvents.uiEvent + 4 >> 2] = document.body.clientWidth;
   HEAP32[JSEvents.uiEvent + 8 >> 2] = document.body.clientHeight;
   HEAP32[JSEvents.uiEvent + 12 >> 2] = window.innerWidth;
   HEAP32[JSEvents.uiEvent + 16 >> 2] = window.innerHeight;
   HEAP32[JSEvents.uiEvent + 20 >> 2] = window.outerWidth;
   HEAP32[JSEvents.uiEvent + 24 >> 2] = window.outerHeight;
   HEAP32[JSEvents.uiEvent + 28 >> 2] = scrollPos[0];
   HEAP32[JSEvents.uiEvent + 32 >> 2] = scrollPos[1];
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.uiEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: target,
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 getNodeNameForTarget: (function(target) {
  if (!target) return "";
  if (target == window) return "#window";
  if (target == window.screen) return "#screen";
  return target && target.nodeName ? target.nodeName : "";
 }),
 registerFocusEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.focusEvent) {
   JSEvents.focusEvent = _malloc(256);
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   var nodeName = JSEvents.getNodeNameForTarget(e.target);
   var id = e.target.id ? e.target.id : "";
   stringToUTF8(nodeName, JSEvents.focusEvent + 0, 128);
   stringToUTF8(id, JSEvents.focusEvent + 128, 128);
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.focusEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: JSEvents.findEventTarget(target),
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 tick: (function() {
  if (window["performance"] && window["performance"]["now"]) return window["performance"]["now"](); else return Date.now();
 }),
 registerDeviceOrientationEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.deviceOrientationEvent) {
   JSEvents.deviceOrientationEvent = _malloc(40);
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   HEAPF64[JSEvents.deviceOrientationEvent >> 3] = JSEvents.tick();
   HEAPF64[JSEvents.deviceOrientationEvent + 8 >> 3] = e.alpha;
   HEAPF64[JSEvents.deviceOrientationEvent + 16 >> 3] = e.beta;
   HEAPF64[JSEvents.deviceOrientationEvent + 24 >> 3] = e.gamma;
   HEAP32[JSEvents.deviceOrientationEvent + 32 >> 2] = e.absolute;
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.deviceOrientationEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: JSEvents.findEventTarget(target),
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 registerDeviceMotionEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.deviceMotionEvent) {
   JSEvents.deviceMotionEvent = _malloc(80);
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   HEAPF64[JSEvents.deviceOrientationEvent >> 3] = JSEvents.tick();
   HEAPF64[JSEvents.deviceMotionEvent + 8 >> 3] = e.acceleration.x;
   HEAPF64[JSEvents.deviceMotionEvent + 16 >> 3] = e.acceleration.y;
   HEAPF64[JSEvents.deviceMotionEvent + 24 >> 3] = e.acceleration.z;
   HEAPF64[JSEvents.deviceMotionEvent + 32 >> 3] = e.accelerationIncludingGravity.x;
   HEAPF64[JSEvents.deviceMotionEvent + 40 >> 3] = e.accelerationIncludingGravity.y;
   HEAPF64[JSEvents.deviceMotionEvent + 48 >> 3] = e.accelerationIncludingGravity.z;
   HEAPF64[JSEvents.deviceMotionEvent + 56 >> 3] = e.rotationRate.alpha;
   HEAPF64[JSEvents.deviceMotionEvent + 64 >> 3] = e.rotationRate.beta;
   HEAPF64[JSEvents.deviceMotionEvent + 72 >> 3] = e.rotationRate.gamma;
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.deviceMotionEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: JSEvents.findEventTarget(target),
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 screenOrientation: (function() {
  if (!window.screen) return undefined;
  return window.screen.orientation || window.screen.mozOrientation || window.screen.webkitOrientation || window.screen.msOrientation;
 }),
 fillOrientationChangeEventData: (function(eventStruct, e) {
  var orientations = [ "portrait-primary", "portrait-secondary", "landscape-primary", "landscape-secondary" ];
  var orientations2 = [ "portrait", "portrait", "landscape", "landscape" ];
  var orientationString = JSEvents.screenOrientation();
  var orientation = orientations.indexOf(orientationString);
  if (orientation == -1) {
   orientation = orientations2.indexOf(orientationString);
  }
  HEAP32[eventStruct >> 2] = 1 << orientation;
  HEAP32[eventStruct + 4 >> 2] = window.orientation;
 }),
 registerOrientationChangeEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.orientationChangeEvent) {
   JSEvents.orientationChangeEvent = _malloc(8);
  }
  if (!target) {
   target = window.screen;
  } else {
   target = JSEvents.findEventTarget(target);
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   JSEvents.fillOrientationChangeEventData(JSEvents.orientationChangeEvent, e);
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.orientationChangeEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  if (eventTypeString == "orientationchange" && window.screen.mozOrientation !== undefined) {
   eventTypeString = "mozorientationchange";
  }
  var eventHandler = {
   target: target,
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 fullscreenEnabled: (function() {
  return document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;
 }),
 fillFullscreenChangeEventData: (function(eventStruct, e) {
  var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
  var isFullscreen = !!fullscreenElement;
  HEAP32[eventStruct >> 2] = isFullscreen;
  HEAP32[eventStruct + 4 >> 2] = JSEvents.fullscreenEnabled();
  var reportedElement = isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement;
  var nodeName = JSEvents.getNodeNameForTarget(reportedElement);
  var id = reportedElement && reportedElement.id ? reportedElement.id : "";
  stringToUTF8(nodeName, eventStruct + 8, 128);
  stringToUTF8(id, eventStruct + 136, 128);
  HEAP32[eventStruct + 264 >> 2] = reportedElement ? reportedElement.clientWidth : 0;
  HEAP32[eventStruct + 268 >> 2] = reportedElement ? reportedElement.clientHeight : 0;
  HEAP32[eventStruct + 272 >> 2] = screen.width;
  HEAP32[eventStruct + 276 >> 2] = screen.height;
  if (isFullscreen) {
   JSEvents.previousFullscreenElement = fullscreenElement;
  }
 }),
 registerFullscreenChangeEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.fullscreenChangeEvent) {
   JSEvents.fullscreenChangeEvent = _malloc(280);
  }
  if (!target) {
   target = document;
  } else {
   target = JSEvents.findEventTarget(target);
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   JSEvents.fillFullscreenChangeEventData(JSEvents.fullscreenChangeEvent, e);
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.fullscreenChangeEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: target,
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 resizeCanvasForFullscreen: (function(target, strategy) {
  var restoreOldStyle = __registerRestoreOldStyle(target);
  var cssWidth = strategy.softFullscreen ? window.innerWidth : screen.width;
  var cssHeight = strategy.softFullscreen ? window.innerHeight : screen.height;
  var rect = target.getBoundingClientRect();
  var windowedCssWidth = rect.right - rect.left;
  var windowedCssHeight = rect.bottom - rect.top;
  var windowedRttWidth = target.width;
  var windowedRttHeight = target.height;
  if (strategy.scaleMode == 3) {
   __setLetterbox(target, (cssHeight - windowedCssHeight) / 2, (cssWidth - windowedCssWidth) / 2);
   cssWidth = windowedCssWidth;
   cssHeight = windowedCssHeight;
  } else if (strategy.scaleMode == 2) {
   if (cssWidth * windowedRttHeight < windowedRttWidth * cssHeight) {
    var desiredCssHeight = windowedRttHeight * cssWidth / windowedRttWidth;
    __setLetterbox(target, (cssHeight - desiredCssHeight) / 2, 0);
    cssHeight = desiredCssHeight;
   } else {
    var desiredCssWidth = windowedRttWidth * cssHeight / windowedRttHeight;
    __setLetterbox(target, 0, (cssWidth - desiredCssWidth) / 2);
    cssWidth = desiredCssWidth;
   }
  }
  if (!target.style.backgroundColor) target.style.backgroundColor = "black";
  if (!document.body.style.backgroundColor) document.body.style.backgroundColor = "black";
  target.style.width = cssWidth + "px";
  target.style.height = cssHeight + "px";
  if (strategy.filteringMode == 1) {
   target.style.imageRendering = "optimizeSpeed";
   target.style.imageRendering = "-moz-crisp-edges";
   target.style.imageRendering = "-o-crisp-edges";
   target.style.imageRendering = "-webkit-optimize-contrast";
   target.style.imageRendering = "optimize-contrast";
   target.style.imageRendering = "crisp-edges";
   target.style.imageRendering = "pixelated";
  }
  var dpiScale = strategy.canvasResolutionScaleMode == 2 ? window.devicePixelRatio : 1;
  if (strategy.canvasResolutionScaleMode != 0) {
   target.width = cssWidth * dpiScale;
   target.height = cssHeight * dpiScale;
   if (target.GLctxObject) target.GLctxObject.GLctx.viewport(0, 0, target.width, target.height);
  }
  return restoreOldStyle;
 }),
 requestFullscreen: (function(target, strategy) {
  if (strategy.scaleMode != 0 || strategy.canvasResolutionScaleMode != 0) {
   JSEvents.resizeCanvasForFullscreen(target, strategy);
  }
  if (target.requestFullscreen) {
   target.requestFullscreen();
  } else if (target.msRequestFullscreen) {
   target.msRequestFullscreen();
  } else if (target.mozRequestFullScreen) {
   target.mozRequestFullScreen();
  } else if (target.mozRequestFullscreen) {
   target.mozRequestFullscreen();
  } else if (target.webkitRequestFullscreen) {
   target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else {
   if (typeof JSEvents.fullscreenEnabled() === "undefined") {
    return -1;
   } else {
    return -3;
   }
  }
  if (strategy.canvasResizedCallback) {
   Module["dynCall_iiii"](strategy.canvasResizedCallback, 37, 0, strategy.canvasResizedCallbackUserData);
  }
  return 0;
 }),
 fillPointerlockChangeEventData: (function(eventStruct, e) {
  var pointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement;
  var isPointerlocked = !!pointerLockElement;
  HEAP32[eventStruct >> 2] = isPointerlocked;
  var nodeName = JSEvents.getNodeNameForTarget(pointerLockElement);
  var id = pointerLockElement && pointerLockElement.id ? pointerLockElement.id : "";
  stringToUTF8(nodeName, eventStruct + 4, 128);
  stringToUTF8(id, eventStruct + 132, 128);
 }),
 registerPointerlockChangeEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.pointerlockChangeEvent) {
   JSEvents.pointerlockChangeEvent = _malloc(260);
  }
  if (!target) {
   target = document;
  } else {
   target = JSEvents.findEventTarget(target);
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   JSEvents.fillPointerlockChangeEventData(JSEvents.pointerlockChangeEvent, e);
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.pointerlockChangeEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: target,
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 registerPointerlockErrorEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!target) {
   target = document;
  } else {
   target = JSEvents.findEventTarget(target);
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, 0, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: target,
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 requestPointerLock: (function(target) {
  if (target.requestPointerLock) {
   target.requestPointerLock();
  } else if (target.mozRequestPointerLock) {
   target.mozRequestPointerLock();
  } else if (target.webkitRequestPointerLock) {
   target.webkitRequestPointerLock();
  } else if (target.msRequestPointerLock) {
   target.msRequestPointerLock();
  } else {
   if (document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock || document.body.msRequestPointerLock) {
    return -3;
   } else {
    return -1;
   }
  }
  return 0;
 }),
 fillVisibilityChangeEventData: (function(eventStruct, e) {
  var visibilityStates = [ "hidden", "visible", "prerender", "unloaded" ];
  var visibilityState = visibilityStates.indexOf(document.visibilityState);
  HEAP32[eventStruct >> 2] = document.hidden;
  HEAP32[eventStruct + 4 >> 2] = visibilityState;
 }),
 registerVisibilityChangeEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.visibilityChangeEvent) {
   JSEvents.visibilityChangeEvent = _malloc(8);
  }
  if (!target) {
   target = document;
  } else {
   target = JSEvents.findEventTarget(target);
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   JSEvents.fillVisibilityChangeEventData(JSEvents.visibilityChangeEvent, e);
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.visibilityChangeEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: target,
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 registerTouchEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.touchEvent) {
   JSEvents.touchEvent = _malloc(1684);
  }
  target = JSEvents.findEventTarget(target);
  var handlerFunc = (function(event) {
   var e = event || window.event;
   var touches = {};
   for (var i = 0; i < e.touches.length; ++i) {
    var touch = e.touches[i];
    touches[touch.identifier] = touch;
   }
   for (var i = 0; i < e.changedTouches.length; ++i) {
    var touch = e.changedTouches[i];
    touches[touch.identifier] = touch;
    touch.changed = true;
   }
   for (var i = 0; i < e.targetTouches.length; ++i) {
    var touch = e.targetTouches[i];
    touches[touch.identifier].onTarget = true;
   }
   var ptr = JSEvents.touchEvent;
   HEAP32[ptr + 4 >> 2] = e.ctrlKey;
   HEAP32[ptr + 8 >> 2] = e.shiftKey;
   HEAP32[ptr + 12 >> 2] = e.altKey;
   HEAP32[ptr + 16 >> 2] = e.metaKey;
   ptr += 20;
   var canvasRect = Module["canvas"] ? Module["canvas"].getBoundingClientRect() : undefined;
   var targetRect = JSEvents.getBoundingClientRectOrZeros(target);
   var numTouches = 0;
   for (var i in touches) {
    var t = touches[i];
    HEAP32[ptr >> 2] = t.identifier;
    HEAP32[ptr + 4 >> 2] = t.screenX;
    HEAP32[ptr + 8 >> 2] = t.screenY;
    HEAP32[ptr + 12 >> 2] = t.clientX;
    HEAP32[ptr + 16 >> 2] = t.clientY;
    HEAP32[ptr + 20 >> 2] = t.pageX;
    HEAP32[ptr + 24 >> 2] = t.pageY;
    HEAP32[ptr + 28 >> 2] = t.changed;
    HEAP32[ptr + 32 >> 2] = t.onTarget;
    if (canvasRect) {
     HEAP32[ptr + 44 >> 2] = t.clientX - canvasRect.left;
     HEAP32[ptr + 48 >> 2] = t.clientY - canvasRect.top;
    } else {
     HEAP32[ptr + 44 >> 2] = 0;
     HEAP32[ptr + 48 >> 2] = 0;
    }
    HEAP32[ptr + 36 >> 2] = t.clientX - targetRect.left;
    HEAP32[ptr + 40 >> 2] = t.clientY - targetRect.top;
    ptr += 52;
    if (++numTouches >= 32) {
     break;
    }
   }
   HEAP32[JSEvents.touchEvent >> 2] = numTouches;
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.touchEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: target,
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 fillGamepadEventData: (function(eventStruct, e) {
  HEAPF64[eventStruct >> 3] = e.timestamp;
  for (var i = 0; i < e.axes.length; ++i) {
   HEAPF64[eventStruct + i * 8 + 16 >> 3] = e.axes[i];
  }
  for (var i = 0; i < e.buttons.length; ++i) {
   if (typeof e.buttons[i] === "object") {
    HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i].value;
   } else {
    HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i];
   }
  }
  for (var i = 0; i < e.buttons.length; ++i) {
   if (typeof e.buttons[i] === "object") {
    HEAP32[eventStruct + i * 4 + 1040 >> 2] = e.buttons[i].pressed;
   } else {
    HEAP32[eventStruct + i * 4 + 1040 >> 2] = e.buttons[i] == 1;
   }
  }
  HEAP32[eventStruct + 1296 >> 2] = e.connected;
  HEAP32[eventStruct + 1300 >> 2] = e.index;
  HEAP32[eventStruct + 8 >> 2] = e.axes.length;
  HEAP32[eventStruct + 12 >> 2] = e.buttons.length;
  stringToUTF8(e.id, eventStruct + 1304, 64);
  stringToUTF8(e.mapping, eventStruct + 1368, 64);
 }),
 registerGamepadEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.gamepadEvent) {
   JSEvents.gamepadEvent = _malloc(1432);
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   JSEvents.fillGamepadEventData(JSEvents.gamepadEvent, e.gamepad);
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.gamepadEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: JSEvents.findEventTarget(target),
   allowsDeferredCalls: true,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 registerBeforeUnloadEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  var handlerFunc = (function(event) {
   var e = event || window.event;
   var confirmationMessage = Module["dynCall_iiii"](callbackfunc, eventTypeId, 0, userData);
   if (confirmationMessage) {
    confirmationMessage = Pointer_stringify(confirmationMessage);
   }
   if (confirmationMessage) {
    e.preventDefault();
    e.returnValue = confirmationMessage;
    return confirmationMessage;
   }
  });
  var eventHandler = {
   target: JSEvents.findEventTarget(target),
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 battery: (function() {
  return navigator.battery || navigator.mozBattery || navigator.webkitBattery;
 }),
 fillBatteryEventData: (function(eventStruct, e) {
  HEAPF64[eventStruct >> 3] = e.chargingTime;
  HEAPF64[eventStruct + 8 >> 3] = e.dischargingTime;
  HEAPF64[eventStruct + 16 >> 3] = e.level;
  HEAP32[eventStruct + 24 >> 2] = e.charging;
 }),
 registerBatteryEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!JSEvents.batteryEvent) {
   JSEvents.batteryEvent = _malloc(32);
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   JSEvents.fillBatteryEventData(JSEvents.batteryEvent, JSEvents.battery());
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, JSEvents.batteryEvent, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: JSEvents.findEventTarget(target),
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 }),
 registerWebGlEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
  if (!target) {
   target = Module["canvas"];
  }
  var handlerFunc = (function(event) {
   var e = event || window.event;
   var shouldCancel = Module["dynCall_iiii"](callbackfunc, eventTypeId, 0, userData);
   if (shouldCancel) {
    e.preventDefault();
   }
  });
  var eventHandler = {
   target: JSEvents.findEventTarget(target),
   allowsDeferredCalls: false,
   eventTypeString: eventTypeString,
   callbackfunc: callbackfunc,
   handlerFunc: handlerFunc,
   useCapture: useCapture
  };
  JSEvents.registerOrRemoveHandler(eventHandler);
 })
};
function _emscripten_set_visibilitychange_callback(userData, useCapture, callbackfunc) {
 JSEvents.registerVisibilityChangeEventCallback(document, userData, useCapture, callbackfunc, 21, "visibilitychange");
 return 0;
}
var GL = {
 counter: 1,
 lastError: 0,
 buffers: [],
 mappedBuffers: {},
 programs: [],
 framebuffers: [],
 renderbuffers: [],
 textures: [],
 uniforms: [],
 shaders: [],
 vaos: [],
 contexts: [],
 currentContext: null,
 offscreenCanvases: {},
 timerQueriesEXT: [],
 currArrayBuffer: 0,
 currElementArrayBuffer: 0,
 byteSizeByTypeRoot: 5120,
 byteSizeByType: [ 1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8 ],
 programInfos: {},
 stringCache: {},
 tempFixedLengthArray: [],
 packAlignment: 4,
 unpackAlignment: 4,
 init: (function() {
  GL.createLog2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
  GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
  for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
   GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i + 1);
  }
  for (var i = 0; i < 32; i++) {
   GL.tempFixedLengthArray.push(new Array(i));
  }
 }),
 recordError: function recordError(errorCode) {
  if (!GL.lastError) {
   GL.lastError = errorCode;
  }
 },
 getNewId: (function(table) {
  var ret = GL.counter++;
  for (var i = table.length; i < ret; i++) {
   table[i] = null;
  }
  return ret;
 }),
 MINI_TEMP_BUFFER_SIZE: 256,
 miniTempBuffer: null,
 miniTempBufferViews: [ 0 ],
 MAX_TEMP_BUFFER_SIZE: 2097152,
 numTempVertexBuffersPerSize: 64,
 log2ceilLookup: null,
 createLog2ceilLookup: (function(maxValue) {
  GL.log2ceilLookup = new Uint8Array(maxValue + 1);
  var log2 = 0;
  var pow2 = 1;
  GL.log2ceilLookup[0] = 0;
  for (var i = 1; i <= maxValue; ++i) {
   if (i > pow2) {
    pow2 <<= 1;
    ++log2;
   }
   GL.log2ceilLookup[i] = log2;
  }
 }),
 generateTempBuffers: (function(quads, context) {
  var largestIndex = GL.log2ceilLookup[GL.MAX_TEMP_BUFFER_SIZE];
  context.tempVertexBufferCounters1 = [];
  context.tempVertexBufferCounters2 = [];
  context.tempVertexBufferCounters1.length = context.tempVertexBufferCounters2.length = largestIndex + 1;
  context.tempVertexBuffers1 = [];
  context.tempVertexBuffers2 = [];
  context.tempVertexBuffers1.length = context.tempVertexBuffers2.length = largestIndex + 1;
  context.tempIndexBuffers = [];
  context.tempIndexBuffers.length = largestIndex + 1;
  for (var i = 0; i <= largestIndex; ++i) {
   context.tempIndexBuffers[i] = null;
   context.tempVertexBufferCounters1[i] = context.tempVertexBufferCounters2[i] = 0;
   var ringbufferLength = GL.numTempVertexBuffersPerSize;
   context.tempVertexBuffers1[i] = [];
   context.tempVertexBuffers2[i] = [];
   var ringbuffer1 = context.tempVertexBuffers1[i];
   var ringbuffer2 = context.tempVertexBuffers2[i];
   ringbuffer1.length = ringbuffer2.length = ringbufferLength;
   for (var j = 0; j < ringbufferLength; ++j) {
    ringbuffer1[j] = ringbuffer2[j] = null;
   }
  }
  if (quads) {
   context.tempQuadIndexBuffer = GLctx.createBuffer();
   context.GLctx.bindBuffer(context.GLctx.ELEMENT_ARRAY_BUFFER, context.tempQuadIndexBuffer);
   var numIndexes = GL.MAX_TEMP_BUFFER_SIZE >> 1;
   var quadIndexes = new Uint16Array(numIndexes);
   var i = 0, v = 0;
   while (1) {
    quadIndexes[i++] = v;
    if (i >= numIndexes) break;
    quadIndexes[i++] = v + 1;
    if (i >= numIndexes) break;
    quadIndexes[i++] = v + 2;
    if (i >= numIndexes) break;
    quadIndexes[i++] = v;
    if (i >= numIndexes) break;
    quadIndexes[i++] = v + 2;
    if (i >= numIndexes) break;
    quadIndexes[i++] = v + 3;
    if (i >= numIndexes) break;
    v += 4;
   }
   context.GLctx.bufferData(context.GLctx.ELEMENT_ARRAY_BUFFER, quadIndexes, context.GLctx.STATIC_DRAW);
   context.GLctx.bindBuffer(context.GLctx.ELEMENT_ARRAY_BUFFER, null);
  }
 }),
 getTempVertexBuffer: function getTempVertexBuffer(sizeBytes) {
  var idx = GL.log2ceilLookup[sizeBytes];
  var ringbuffer = GL.currentContext.tempVertexBuffers1[idx];
  var nextFreeBufferIndex = GL.currentContext.tempVertexBufferCounters1[idx];
  GL.currentContext.tempVertexBufferCounters1[idx] = GL.currentContext.tempVertexBufferCounters1[idx] + 1 & GL.numTempVertexBuffersPerSize - 1;
  var vbo = ringbuffer[nextFreeBufferIndex];
  if (vbo) {
   return vbo;
  }
  var prevVBO = GLctx.getParameter(GLctx.ARRAY_BUFFER_BINDING);
  ringbuffer[nextFreeBufferIndex] = GLctx.createBuffer();
  GLctx.bindBuffer(GLctx.ARRAY_BUFFER, ringbuffer[nextFreeBufferIndex]);
  GLctx.bufferData(GLctx.ARRAY_BUFFER, 1 << idx, GLctx.DYNAMIC_DRAW);
  GLctx.bindBuffer(GLctx.ARRAY_BUFFER, prevVBO);
  return ringbuffer[nextFreeBufferIndex];
 },
 getTempIndexBuffer: function getTempIndexBuffer(sizeBytes) {
  var idx = GL.log2ceilLookup[sizeBytes];
  var ibo = GL.currentContext.tempIndexBuffers[idx];
  if (ibo) {
   return ibo;
  }
  var prevIBO = GLctx.getParameter(GLctx.ELEMENT_ARRAY_BUFFER_BINDING);
  GL.currentContext.tempIndexBuffers[idx] = GLctx.createBuffer();
  GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.currentContext.tempIndexBuffers[idx]);
  GLctx.bufferData(GLctx.ELEMENT_ARRAY_BUFFER, 1 << idx, GLctx.DYNAMIC_DRAW);
  GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, prevIBO);
  return GL.currentContext.tempIndexBuffers[idx];
 },
 newRenderingFrameStarted: function newRenderingFrameStarted() {
  if (!GL.currentContext) {
   return;
  }
  var vb = GL.currentContext.tempVertexBuffers1;
  GL.currentContext.tempVertexBuffers1 = GL.currentContext.tempVertexBuffers2;
  GL.currentContext.tempVertexBuffers2 = vb;
  vb = GL.currentContext.tempVertexBufferCounters1;
  GL.currentContext.tempVertexBufferCounters1 = GL.currentContext.tempVertexBufferCounters2;
  GL.currentContext.tempVertexBufferCounters2 = vb;
  var largestIndex = GL.log2ceilLookup[GL.MAX_TEMP_BUFFER_SIZE];
  for (var i = 0; i <= largestIndex; ++i) {
   GL.currentContext.tempVertexBufferCounters1[i] = 0;
  }
 },
 findToken: (function(source, token) {
  function isIdentChar(ch) {
   if (ch >= 48 && ch <= 57) return true;
   if (ch >= 65 && ch <= 90) return true;
   if (ch >= 97 && ch <= 122) return true;
   return false;
  }
  var i = -1;
  do {
   i = source.indexOf(token, i + 1);
   if (i < 0) {
    break;
   }
   if (i > 0 && isIdentChar(source[i - 1])) {
    continue;
   }
   i += token.length;
   if (i < source.length - 1 && isIdentChar(source[i + 1])) {
    continue;
   }
   return true;
  } while (true);
  return false;
 }),
 getSource: (function(shader, count, string, length) {
  var source = "";
  for (var i = 0; i < count; ++i) {
   var frag;
   if (length) {
    var len = HEAP32[length + i * 4 >> 2];
    if (len < 0) {
     frag = Pointer_stringify(HEAP32[string + i * 4 >> 2]);
    } else {
     frag = Pointer_stringify(HEAP32[string + i * 4 >> 2], len);
    }
   } else {
    frag = Pointer_stringify(HEAP32[string + i * 4 >> 2]);
   }
   source += frag;
  }
  type = GLctx.getShaderParameter(GL.shaders[shader], 35663);
  if (type == 35632) {
   if (GL.findToken(source, "dFdx") || GL.findToken(source, "dFdy") || GL.findToken(source, "fwidth")) {
    source = "#extension GL_OES_standard_derivatives : enable\n" + source;
    var extension = GLctx.getExtension("OES_standard_derivatives");
   }
  }
  return source;
 }),
 createContext: (function(canvas, webGLContextAttributes) {
  if (typeof webGLContextAttributes["majorVersion"] === "undefined" && typeof webGLContextAttributes["minorVersion"] === "undefined") {
   webGLContextAttributes["majorVersion"] = 1;
   webGLContextAttributes["minorVersion"] = 0;
  }
  var ctx;
  var errorInfo = "?";
  function onContextCreationError(event) {
   errorInfo = event.statusMessage || errorInfo;
  }
  try {
   canvas.addEventListener("webglcontextcreationerror", onContextCreationError, false);
   try {
    if (webGLContextAttributes["majorVersion"] == 1 && webGLContextAttributes["minorVersion"] == 0) {
     ctx = canvas.getContext("webgl", webGLContextAttributes) || canvas.getContext("experimental-webgl", webGLContextAttributes);
    } else if (webGLContextAttributes["majorVersion"] == 2 && webGLContextAttributes["minorVersion"] == 0) {
     ctx = canvas.getContext("webgl2", webGLContextAttributes) || canvas.getContext("experimental-webgl2", webGLContextAttributes);
    } else {
     throw "Unsupported WebGL context version " + majorVersion + "." + minorVersion + "!";
    }
   } finally {
    canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, false);
   }
   if (!ctx) throw ":(";
  } catch (e) {
   Module.print("Could not create canvas: " + [ errorInfo, e, JSON.stringify(webGLContextAttributes) ]);
   return 0;
  }
  if (!ctx) return 0;
  return GL.registerContext(ctx, webGLContextAttributes);
 }),
 registerContext: (function(ctx, webGLContextAttributes) {
  var handle = GL.getNewId(GL.contexts);
  var context = {
   handle: handle,
   attributes: webGLContextAttributes,
   version: webGLContextAttributes["majorVersion"],
   GLctx: ctx
  };
  if (ctx.canvas) ctx.canvas.GLctxObject = context;
  GL.contexts[handle] = context;
  if (typeof webGLContextAttributes["enableExtensionsByDefault"] === "undefined" || webGLContextAttributes["enableExtensionsByDefault"]) {
   GL.initExtensions(context);
  }
  return handle;
 }),
 makeContextCurrent: (function(contextHandle) {
  var context = GL.contexts[contextHandle];
  if (!context) return false;
  GLctx = Module.ctx = context.GLctx;
  GL.currentContext = context;
  return true;
 }),
 getContext: (function(contextHandle) {
  return GL.contexts[contextHandle];
 }),
 deleteContext: (function(contextHandle) {
  if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
  if (typeof JSEvents === "object") JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
  if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
  GL.contexts[contextHandle] = null;
 }),
 initExtensions: (function(context) {
  if (!context) context = GL.currentContext;
  if (context.initExtensionsDone) return;
  context.initExtensionsDone = true;
  var GLctx = context.GLctx;
  context.maxVertexAttribs = GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);
  context.compressionExt = GLctx.getExtension("WEBGL_compressed_texture_s3tc");
  context.anisotropicExt = GLctx.getExtension("EXT_texture_filter_anisotropic");
  if (context.version < 2) {
   var instancedArraysExt = GLctx.getExtension("ANGLE_instanced_arrays");
   if (instancedArraysExt) {
    GLctx["vertexAttribDivisor"] = (function(index, divisor) {
     instancedArraysExt["vertexAttribDivisorANGLE"](index, divisor);
    });
    GLctx["drawArraysInstanced"] = (function(mode, first, count, primcount) {
     instancedArraysExt["drawArraysInstancedANGLE"](mode, first, count, primcount);
    });
    GLctx["drawElementsInstanced"] = (function(mode, count, type, indices, primcount) {
     instancedArraysExt["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
    });
   }
   var vaoExt = GLctx.getExtension("OES_vertex_array_object");
   if (vaoExt) {
    GLctx["createVertexArray"] = (function() {
     return vaoExt["createVertexArrayOES"]();
    });
    GLctx["deleteVertexArray"] = (function(vao) {
     vaoExt["deleteVertexArrayOES"](vao);
    });
    GLctx["bindVertexArray"] = (function(vao) {
     vaoExt["bindVertexArrayOES"](vao);
    });
    GLctx["isVertexArray"] = (function(vao) {
     return vaoExt["isVertexArrayOES"](vao);
    });
   }
   var drawBuffersExt = GLctx.getExtension("WEBGL_draw_buffers");
   if (drawBuffersExt) {
    GLctx["drawBuffers"] = (function(n, bufs) {
     drawBuffersExt["drawBuffersWEBGL"](n, bufs);
    });
   }
  }
  GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
  var automaticallyEnabledExtensions = [ "OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives", "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture", "OES_element_index_uint", "EXT_texture_filter_anisotropic", "ANGLE_instanced_arrays", "OES_texture_float_linear", "OES_texture_half_float_linear", "WEBGL_compressed_texture_atc", "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float", "EXT_frag_depth", "EXT_sRGB", "WEBGL_draw_buffers", "WEBGL_shared_resources", "EXT_shader_texture_lod", "EXT_color_buffer_float" ];
  var exts = GLctx.getSupportedExtensions();
  if (exts && exts.length > 0) {
   GLctx.getSupportedExtensions().forEach((function(ext) {
    if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
     GLctx.getExtension(ext);
    }
   }));
  }
 }),
 populateUniformTable: (function(program) {
  var p = GL.programs[program];
  GL.programInfos[program] = {
   uniforms: {},
   maxUniformLength: 0,
   maxAttributeLength: -1,
   maxUniformBlockNameLength: -1
  };
  var ptable = GL.programInfos[program];
  var utable = ptable.uniforms;
  var numUniforms = GLctx.getProgramParameter(p, GLctx.ACTIVE_UNIFORMS);
  for (var i = 0; i < numUniforms; ++i) {
   var u = GLctx.getActiveUniform(p, i);
   var name = u.name;
   ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1);
   if (name.indexOf("]", name.length - 1) !== -1) {
    var ls = name.lastIndexOf("[");
    name = name.slice(0, ls);
   }
   var loc = GLctx.getUniformLocation(p, name);
   if (loc != null) {
    var id = GL.getNewId(GL.uniforms);
    utable[name] = [ u.size, id ];
    GL.uniforms[id] = loc;
    for (var j = 1; j < u.size; ++j) {
     var n = name + "[" + j + "]";
     loc = GLctx.getUniformLocation(p, n);
     id = GL.getNewId(GL.uniforms);
     GL.uniforms[id] = loc;
    }
   }
  }
 })
};
function _emscripten_glIsRenderbuffer(renderbuffer) {
 var rb = GL.renderbuffers[renderbuffer];
 if (!rb) return 0;
 return GLctx.isRenderbuffer(rb);
}
function _emscripten_glStencilMaskSeparate(x0, x1) {
 GLctx["stencilMaskSeparate"](x0, x1);
}
function _emscripten_set_main_loop_timing(mode, value) {
 Browser.mainLoop.timingMode = mode;
 Browser.mainLoop.timingValue = value;
 if (!Browser.mainLoop.func) {
  return 1;
 }
 if (mode == 0) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
   var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
   setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
  };
  Browser.mainLoop.method = "timeout";
 } else if (mode == 1) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
   Browser.requestAnimationFrame(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "rAF";
 } else if (mode == 2) {
  if (!window["setImmediate"]) {
   var setImmediates = [];
   var emscriptenMainLoopMessageId = "setimmediate";
   function Browser_setImmediate_messageHandler(event) {
    if (event.source === window && event.data === emscriptenMainLoopMessageId) {
     event.stopPropagation();
     setImmediates.shift()();
    }
   }
   window.addEventListener("message", Browser_setImmediate_messageHandler, true);
   window["setImmediate"] = function Browser_emulated_setImmediate(func) {
    setImmediates.push(func);
    if (ENVIRONMENT_IS_WORKER) {
     if (Module["setImmediates"] === undefined) Module["setImmediates"] = [];
     Module["setImmediates"].push(func);
     window.postMessage({
      target: emscriptenMainLoopMessageId
     });
    } else window.postMessage(emscriptenMainLoopMessageId, "*");
   };
  }
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
   window["setImmediate"](Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "immediate";
 }
 return 0;
}
function _emscripten_get_now() {
 abort();
}
function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
 Module["noExitRuntime"] = true;
 assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
 Browser.mainLoop.func = func;
 Browser.mainLoop.arg = arg;
 var browserIterationFunc;
 if (typeof arg !== "undefined") {
  browserIterationFunc = (function() {
   Module["dynCall_vi"](func, arg);
  });
 } else {
  browserIterationFunc = (function() {
   Module["dynCall_v"](func);
  });
 }
 var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
 Browser.mainLoop.runner = function Browser_mainLoop_runner() {
  if (ABORT) return;
  if (Browser.mainLoop.queue.length > 0) {
   var start = Date.now();
   var blocker = Browser.mainLoop.queue.shift();
   blocker.func(blocker.arg);
   if (Browser.mainLoop.remainingBlockers) {
    var remaining = Browser.mainLoop.remainingBlockers;
    var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
    if (blocker.counted) {
     Browser.mainLoop.remainingBlockers = next;
    } else {
     next = next + .5;
     Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
    }
   }
   console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
   Browser.mainLoop.updateStatus();
   if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
   setTimeout(Browser.mainLoop.runner, 0);
   return;
  }
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
  if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
   Browser.mainLoop.scheduler();
   return;
  } else if (Browser.mainLoop.timingMode == 0) {
   Browser.mainLoop.tickStartTime = _emscripten_get_now();
  }
  GL.newRenderingFrameStarted();
  if (Browser.mainLoop.method === "timeout" && Module.ctx) {
   Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
   Browser.mainLoop.method = "";
  }
  Browser.mainLoop.runIter(browserIterationFunc);
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  Browser.mainLoop.scheduler();
 };
 if (!noSetTiming) {
  if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps); else _emscripten_set_main_loop_timing(1, 1);
  Browser.mainLoop.scheduler();
 }
 if (simulateInfiniteLoop) {
  throw "SimulateInfiniteLoop";
 }
}
var Browser = {
 mainLoop: {
  scheduler: null,
  method: "",
  currentlyRunningMainloop: 0,
  func: null,
  arg: 0,
  timingMode: 0,
  timingValue: 0,
  currentFrameNumber: 0,
  queue: [],
  pause: (function() {
   Browser.mainLoop.scheduler = null;
   Browser.mainLoop.currentlyRunningMainloop++;
  }),
  resume: (function() {
   Browser.mainLoop.currentlyRunningMainloop++;
   var timingMode = Browser.mainLoop.timingMode;
   var timingValue = Browser.mainLoop.timingValue;
   var func = Browser.mainLoop.func;
   Browser.mainLoop.func = null;
   _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);
   _emscripten_set_main_loop_timing(timingMode, timingValue);
   Browser.mainLoop.scheduler();
  }),
  updateStatus: (function() {
   if (Module["setStatus"]) {
    var message = Module["statusMessage"] || "Please wait...";
    var remaining = Browser.mainLoop.remainingBlockers;
    var expected = Browser.mainLoop.expectedBlockers;
    if (remaining) {
     if (remaining < expected) {
      Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")");
     } else {
      Module["setStatus"](message);
     }
    } else {
     Module["setStatus"]("");
    }
   }
  }),
  runIter: (function(func) {
   if (ABORT) return;
   if (Module["preMainLoop"]) {
    var preRet = Module["preMainLoop"]();
    if (preRet === false) {
     return;
    }
   }
   try {
    func();
   } catch (e) {
    if (e instanceof ExitStatus) {
     return;
    } else {
     if (e && typeof e === "object" && e.stack) Module.printErr("exception thrown: " + [ e, e.stack ]);
     throw e;
    }
   }
   if (Module["postMainLoop"]) Module["postMainLoop"]();
  })
 },
 isFullscreen: false,
 pointerLock: false,
 moduleContextCreatedCallbacks: [],
 workers: [],
 init: (function() {
  if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
  if (Browser.initted) return;
  Browser.initted = true;
  try {
   new Blob;
   Browser.hasBlobConstructor = true;
  } catch (e) {
   Browser.hasBlobConstructor = false;
   console.log("warning: no blob constructor, cannot create blobs with mimetypes");
  }
  Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;
  Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
  if (!Module.noImageDecoding && typeof Browser.URLObject === "undefined") {
   console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
   Module.noImageDecoding = true;
  }
  var imagePlugin = {};
  imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
   return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
  };
  imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
   var b = null;
   if (Browser.hasBlobConstructor) {
    try {
     b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
     if (b.size !== byteArray.length) {
      b = new Blob([ (new Uint8Array(byteArray)).buffer ], {
       type: Browser.getMimetype(name)
      });
     }
    } catch (e) {
     Runtime.warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder");
    }
   }
   if (!b) {
    var bb = new Browser.BlobBuilder;
    bb.append((new Uint8Array(byteArray)).buffer);
    b = bb.getBlob();
   }
   var url = Browser.URLObject.createObjectURL(b);
   var img = new Image;
   img.onload = function img_onload() {
    assert(img.complete, "Image " + name + " could not be decoded");
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    Module["preloadedImages"][name] = canvas;
    Browser.URLObject.revokeObjectURL(url);
    if (onload) onload(byteArray);
   };
   img.onerror = function img_onerror(event) {
    console.log("Image " + url + " could not be decoded");
    if (onerror) onerror();
   };
   img.src = url;
  };
  Module["preloadPlugins"].push(imagePlugin);
  var audioPlugin = {};
  audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
   return !Module.noAudioDecoding && name.substr(-4) in {
    ".ogg": 1,
    ".wav": 1,
    ".mp3": 1
   };
  };
  audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
   var done = false;
   function finish(audio) {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = audio;
    if (onload) onload(byteArray);
   }
   function fail() {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = new Audio;
    if (onerror) onerror();
   }
   if (Browser.hasBlobConstructor) {
    try {
     var b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
    } catch (e) {
     return fail();
    }
    var url = Browser.URLObject.createObjectURL(b);
    var audio = new Audio;
    audio.addEventListener("canplaythrough", (function() {
     finish(audio);
    }), false);
    audio.onerror = function audio_onerror(event) {
     if (done) return;
     console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");
     function encode64(data) {
      var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var PAD = "=";
      var ret = "";
      var leftchar = 0;
      var leftbits = 0;
      for (var i = 0; i < data.length; i++) {
       leftchar = leftchar << 8 | data[i];
       leftbits += 8;
       while (leftbits >= 6) {
        var curr = leftchar >> leftbits - 6 & 63;
        leftbits -= 6;
        ret += BASE[curr];
       }
      }
      if (leftbits == 2) {
       ret += BASE[(leftchar & 3) << 4];
       ret += PAD + PAD;
      } else if (leftbits == 4) {
       ret += BASE[(leftchar & 15) << 2];
       ret += PAD;
      }
      return ret;
     }
     audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
     finish(audio);
    };
    audio.src = url;
    Browser.safeSetTimeout((function() {
     finish(audio);
    }), 1e4);
   } else {
    return fail();
   }
  };
  Module["preloadPlugins"].push(audioPlugin);
  function pointerLockChange() {
   Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"];
  }
  var canvas = Module["canvas"];
  if (canvas) {
   canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || (function() {});
   canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || (function() {});
   canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
   document.addEventListener("pointerlockchange", pointerLockChange, false);
   document.addEventListener("mozpointerlockchange", pointerLockChange, false);
   document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
   document.addEventListener("mspointerlockchange", pointerLockChange, false);
   if (Module["elementPointerLock"]) {
    canvas.addEventListener("click", (function(ev) {
     if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
      Module["canvas"].requestPointerLock();
      ev.preventDefault();
     }
    }), false);
   }
  }
 }),
 createContext: (function(canvas, useWebGL, setInModule, webGLContextAttributes) {
  if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
  var ctx;
  var contextHandle;
  if (useWebGL) {
   var contextAttributes = {
    antialias: false,
    alpha: false
   };
   if (webGLContextAttributes) {
    for (var attribute in webGLContextAttributes) {
     contextAttributes[attribute] = webGLContextAttributes[attribute];
    }
   }
   contextHandle = GL.createContext(canvas, contextAttributes);
   if (contextHandle) {
    ctx = GL.getContext(contextHandle).GLctx;
   }
  } else {
   ctx = canvas.getContext("2d");
  }
  if (!ctx) return null;
  if (setInModule) {
   if (!useWebGL) assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
   Module.ctx = ctx;
   if (useWebGL) GL.makeContextCurrent(contextHandle);
   Module.useWebGL = useWebGL;
   Browser.moduleContextCreatedCallbacks.forEach((function(callback) {
    callback();
   }));
   Browser.init();
  }
  return ctx;
 }),
 destroyContext: (function(canvas, useWebGL, setInModule) {}),
 fullscreenHandlersInstalled: false,
 lockPointer: undefined,
 resizeCanvas: undefined,
 requestFullscreen: (function(lockPointer, resizeCanvas, vrDevice) {
  Browser.lockPointer = lockPointer;
  Browser.resizeCanvas = resizeCanvas;
  Browser.vrDevice = vrDevice;
  if (typeof Browser.lockPointer === "undefined") Browser.lockPointer = true;
  if (typeof Browser.resizeCanvas === "undefined") Browser.resizeCanvas = false;
  if (typeof Browser.vrDevice === "undefined") Browser.vrDevice = null;
  var canvas = Module["canvas"];
  function fullscreenChange() {
   Browser.isFullscreen = false;
   var canvasContainer = canvas.parentNode;
   if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
    canvas.exitFullscreen = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || (function() {});
    canvas.exitFullscreen = canvas.exitFullscreen.bind(document);
    if (Browser.lockPointer) canvas.requestPointerLock();
    Browser.isFullscreen = true;
    if (Browser.resizeCanvas) Browser.setFullscreenCanvasSize();
   } else {
    canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
    canvasContainer.parentNode.removeChild(canvasContainer);
    if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
   }
   if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullscreen);
   if (Module["onFullscreen"]) Module["onFullscreen"](Browser.isFullscreen);
   Browser.updateCanvasDimensions(canvas);
  }
  if (!Browser.fullscreenHandlersInstalled) {
   Browser.fullscreenHandlersInstalled = true;
   document.addEventListener("fullscreenchange", fullscreenChange, false);
   document.addEventListener("mozfullscreenchange", fullscreenChange, false);
   document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
   document.addEventListener("MSFullscreenChange", fullscreenChange, false);
  }
  var canvasContainer = document.createElement("div");
  canvas.parentNode.insertBefore(canvasContainer, canvas);
  canvasContainer.appendChild(canvas);
  canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? (function() {
   canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  }) : null) || (canvasContainer["webkitRequestFullScreen"] ? (function() {
   canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  }) : null);
  if (vrDevice) {
   canvasContainer.requestFullscreen({
    vrDisplay: vrDevice
   });
  } else {
   canvasContainer.requestFullscreen();
  }
 }),
 requestFullScreen: (function(lockPointer, resizeCanvas, vrDevice) {
  Module.printErr("Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.");
  Browser.requestFullScreen = (function(lockPointer, resizeCanvas, vrDevice) {
   return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
  });
  return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
 }),
 nextRAF: 0,
 fakeRequestAnimationFrame: (function(func) {
  var now = Date.now();
  if (Browser.nextRAF === 0) {
   Browser.nextRAF = now + 1e3 / 60;
  } else {
   while (now + 2 >= Browser.nextRAF) {
    Browser.nextRAF += 1e3 / 60;
   }
  }
  var delay = Math.max(Browser.nextRAF - now, 0);
  setTimeout(func, delay);
 }),
 requestAnimationFrame: function requestAnimationFrame(func) {
  if (typeof window === "undefined") {
   Browser.fakeRequestAnimationFrame(func);
  } else {
   if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window["requestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"] || window["oRequestAnimationFrame"] || Browser.fakeRequestAnimationFrame;
   }
   window.requestAnimationFrame(func);
  }
 },
 safeCallback: (function(func) {
  return (function() {
   if (!ABORT) return func.apply(null, arguments);
  });
 }),
 allowAsyncCallbacks: true,
 queuedAsyncCallbacks: [],
 pauseAsyncCallbacks: (function() {
  Browser.allowAsyncCallbacks = false;
 }),
 resumeAsyncCallbacks: (function() {
  Browser.allowAsyncCallbacks = true;
  if (Browser.queuedAsyncCallbacks.length > 0) {
   var callbacks = Browser.queuedAsyncCallbacks;
   Browser.queuedAsyncCallbacks = [];
   callbacks.forEach((function(func) {
    func();
   }));
  }
 }),
 safeRequestAnimationFrame: (function(func) {
  return Browser.requestAnimationFrame((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  }));
 }),
 safeSetTimeout: (function(func, timeout) {
  Module["noExitRuntime"] = true;
  return setTimeout((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  }), timeout);
 }),
 safeSetInterval: (function(func, timeout) {
  Module["noExitRuntime"] = true;
  return setInterval((function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   }
  }), timeout);
 }),
 getMimetype: (function(name) {
  return {
   "jpg": "image/jpeg",
   "jpeg": "image/jpeg",
   "png": "image/png",
   "bmp": "image/bmp",
   "ogg": "audio/ogg",
   "wav": "audio/wav",
   "mp3": "audio/mpeg"
  }[name.substr(name.lastIndexOf(".") + 1)];
 }),
 getUserMedia: (function(func) {
  if (!window.getUserMedia) {
   window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"];
  }
  window.getUserMedia(func);
 }),
 getMovementX: (function(event) {
  return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
 }),
 getMovementY: (function(event) {
  return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
 }),
 getMouseWheelDelta: (function(event) {
  var delta = 0;
  switch (event.type) {
  case "DOMMouseScroll":
   delta = event.detail;
   break;
  case "mousewheel":
   delta = event.wheelDelta;
   break;
  case "wheel":
   delta = event["deltaY"];
   break;
  default:
   throw "unrecognized mouse wheel event: " + event.type;
  }
  return delta;
 }),
 mouseX: 0,
 mouseY: 0,
 mouseMovementX: 0,
 mouseMovementY: 0,
 touches: {},
 lastTouches: {},
 calculateMouseEvent: (function(event) {
  if (Browser.pointerLock) {
   if (event.type != "mousemove" && "mozMovementX" in event) {
    Browser.mouseMovementX = Browser.mouseMovementY = 0;
   } else {
    Browser.mouseMovementX = Browser.getMovementX(event);
    Browser.mouseMovementY = Browser.getMovementY(event);
   }
   if (typeof SDL != "undefined") {
    Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
    Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
   } else {
    Browser.mouseX += Browser.mouseMovementX;
    Browser.mouseY += Browser.mouseMovementY;
   }
  } else {
   var rect = Module["canvas"].getBoundingClientRect();
   var cw = Module["canvas"].width;
   var ch = Module["canvas"].height;
   var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
   var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
   if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
    var touch = event.touch;
    if (touch === undefined) {
     return;
    }
    var adjustedX = touch.pageX - (scrollX + rect.left);
    var adjustedY = touch.pageY - (scrollY + rect.top);
    adjustedX = adjustedX * (cw / rect.width);
    adjustedY = adjustedY * (ch / rect.height);
    var coords = {
     x: adjustedX,
     y: adjustedY
    };
    if (event.type === "touchstart") {
     Browser.lastTouches[touch.identifier] = coords;
     Browser.touches[touch.identifier] = coords;
    } else if (event.type === "touchend" || event.type === "touchmove") {
     var last = Browser.touches[touch.identifier];
     if (!last) last = coords;
     Browser.lastTouches[touch.identifier] = last;
     Browser.touches[touch.identifier] = coords;
    }
    return;
   }
   var x = event.pageX - (scrollX + rect.left);
   var y = event.pageY - (scrollY + rect.top);
   x = x * (cw / rect.width);
   y = y * (ch / rect.height);
   Browser.mouseMovementX = x - Browser.mouseX;
   Browser.mouseMovementY = y - Browser.mouseY;
   Browser.mouseX = x;
   Browser.mouseY = y;
  }
 }),
 asyncLoad: (function(url, onload, onerror, noRunDep) {
  var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
  Module["readAsync"](url, (function(arrayBuffer) {
   assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
   onload(new Uint8Array(arrayBuffer));
   if (dep) removeRunDependency(dep);
  }), (function(event) {
   if (onerror) {
    onerror();
   } else {
    throw 'Loading data file "' + url + '" failed.';
   }
  }));
  if (dep) addRunDependency(dep);
 }),
 resizeListeners: [],
 updateResizeListeners: (function() {
  var canvas = Module["canvas"];
  Browser.resizeListeners.forEach((function(listener) {
   listener(canvas.width, canvas.height);
  }));
 }),
 setCanvasSize: (function(width, height, noUpdates) {
  var canvas = Module["canvas"];
  Browser.updateCanvasDimensions(canvas, width, height);
  if (!noUpdates) Browser.updateResizeListeners();
 }),
 windowedWidth: 0,
 windowedHeight: 0,
 setFullscreenCanvasSize: (function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];
   flags = flags | 8388608;
   HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags;
  }
  Browser.updateResizeListeners();
 }),
 setWindowedCanvasSize: (function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];
   flags = flags & ~8388608;
   HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags;
  }
  Browser.updateResizeListeners();
 }),
 updateCanvasDimensions: (function(canvas, wNative, hNative) {
  if (wNative && hNative) {
   canvas.widthNative = wNative;
   canvas.heightNative = hNative;
  } else {
   wNative = canvas.widthNative;
   hNative = canvas.heightNative;
  }
  var w = wNative;
  var h = hNative;
  if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
   if (w / h < Module["forcedAspectRatio"]) {
    w = Math.round(h * Module["forcedAspectRatio"]);
   } else {
    h = Math.round(w / Module["forcedAspectRatio"]);
   }
  }
  if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
   var factor = Math.min(screen.width / w, screen.height / h);
   w = Math.round(w * factor);
   h = Math.round(h * factor);
  }
  if (Browser.resizeCanvas) {
   if (canvas.width != w) canvas.width = w;
   if (canvas.height != h) canvas.height = h;
   if (typeof canvas.style != "undefined") {
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
   }
  } else {
   if (canvas.width != wNative) canvas.width = wNative;
   if (canvas.height != hNative) canvas.height = hNative;
   if (typeof canvas.style != "undefined") {
    if (w != wNative || h != hNative) {
     canvas.style.setProperty("width", w + "px", "important");
     canvas.style.setProperty("height", h + "px", "important");
    } else {
     canvas.style.removeProperty("width");
     canvas.style.removeProperty("height");
    }
   }
  }
 }),
 wgetRequests: {},
 nextWgetRequestHandle: 0,
 getNextWgetRequestHandle: (function() {
  var handle = Browser.nextWgetRequestHandle;
  Browser.nextWgetRequestHandle++;
  return handle;
 })
};
var EGL = {
 errorCode: 12288,
 defaultDisplayInitialized: false,
 currentContext: 0,
 currentReadSurface: 0,
 currentDrawSurface: 0,
 stringCache: {},
 setErrorCode: (function(code) {
  EGL.errorCode = code;
 }),
 chooseConfig: (function(display, attribList, config, config_size, numConfigs) {
  if (display != 62e3) {
   EGL.setErrorCode(12296);
   return 0;
  }
  if ((!config || !config_size) && !numConfigs) {
   EGL.setErrorCode(12300);
   return 0;
  }
  if (numConfigs) {
   HEAP32[numConfigs >> 2] = 1;
  }
  if (config && config_size > 0) {
   HEAP32[config >> 2] = 62002;
  }
  EGL.setErrorCode(12288);
  return 1;
 })
};
function _eglWaitClient() {
 EGL.setErrorCode(12288);
 return 1;
}
function _eglTerminate(display) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 EGL.currentContext = 0;
 EGL.currentReadSurface = 0;
 EGL.currentDrawSurface = 0;
 EGL.defaultDisplayInitialized = false;
 EGL.setErrorCode(12288);
 return 1;
}
function _emscripten_glStencilMask(x0) {
 GLctx["stencilMask"](x0);
}
Module["_pthread_mutex_lock"] = _pthread_mutex_lock;
function _glHint(x0, x1) {
 GLctx["hint"](x0, x1);
}
function _emscripten_glStencilFunc(x0, x1, x2) {
 GLctx["stencilFunc"](x0, x1, x2);
}
var __currentFullscreenStrategy = {};
function _emscripten_exit_fullscreen() {
 if (typeof JSEvents.fullscreenEnabled() === "undefined") return -1;
 JSEvents.removeDeferredCalls(JSEvents.requestFullscreen);
 if (document.exitFullscreen) {
  document.exitFullscreen();
 } else if (document.msExitFullscreen) {
  document.msExitFullscreen();
 } else if (document.mozCancelFullScreen) {
  document.mozCancelFullScreen();
 } else if (document.webkitExitFullscreen) {
  document.webkitExitFullscreen();
 } else {
  return -1;
 }
 if (__currentFullscreenStrategy.canvasResizedCallback) {
  Module["dynCall_iiii"](__currentFullscreenStrategy.canvasResizedCallback, 37, 0, __currentFullscreenStrategy.canvasResizedCallbackUserData);
 }
 return 0;
}
var GLImmediate = {
 MapTreeLib: null,
 spawnMapTreeLib: (function() {
  function CNaiveListMap() {
   var list = [];
   this.insert = function CNaiveListMap_insert(key, val) {
    if (this.contains(key | 0)) return false;
    list.push([ key, val ]);
    return true;
   };
   var __contains_i;
   this.contains = function CNaiveListMap_contains(key) {
    for (__contains_i = 0; __contains_i < list.length; ++__contains_i) {
     if (list[__contains_i][0] === key) return true;
    }
    return false;
   };
   var __get_i;
   this.get = function CNaiveListMap_get(key) {
    for (__get_i = 0; __get_i < list.length; ++__get_i) {
     if (list[__get_i][0] === key) return list[__get_i][1];
    }
    return undefined;
   };
  }
  function CMapTree() {
   function CNLNode() {
    var map = new CNaiveListMap;
    this.child = function CNLNode_child(keyFrag) {
     if (!map.contains(keyFrag | 0)) {
      map.insert(keyFrag | 0, new CNLNode);
     }
     return map.get(keyFrag | 0);
    };
    this.value = undefined;
    this.get = function CNLNode_get() {
     return this.value;
    };
    this.set = function CNLNode_set(val) {
     this.value = val;
    };
   }
   function CKeyView(root) {
    var cur;
    this.reset = function CKeyView_reset() {
     cur = root;
     return this;
    };
    this.reset();
    this.next = function CKeyView_next(keyFrag) {
     cur = cur.child(keyFrag);
     return this;
    };
    this.get = function CKeyView_get() {
     return cur.get();
    };
    this.set = function CKeyView_set(val) {
     cur.set(val);
    };
   }
   var root;
   var staticKeyView;
   this.createKeyView = function CNLNode_createKeyView() {
    return new CKeyView(root);
   };
   this.clear = function CNLNode_clear() {
    root = new CNLNode;
    staticKeyView = this.createKeyView();
   };
   this.clear();
   this.getStaticKeyView = function CNLNode_getStaticKeyView() {
    staticKeyView.reset();
    return staticKeyView;
   };
  }
  return {
   create: (function() {
    return new CMapTree;
   })
  };
 }),
 TexEnvJIT: null,
 spawnTexEnvJIT: (function() {
  var GL_TEXTURE0 = 33984;
  var GL_TEXTURE_1D = 3552;
  var GL_TEXTURE_2D = 3553;
  var GL_TEXTURE_3D = 32879;
  var GL_TEXTURE_CUBE_MAP = 34067;
  var GL_TEXTURE_ENV = 8960;
  var GL_TEXTURE_ENV_MODE = 8704;
  var GL_TEXTURE_ENV_COLOR = 8705;
  var GL_SRC0_RGB = 34176;
  var GL_SRC1_RGB = 34177;
  var GL_SRC2_RGB = 34178;
  var GL_SRC0_ALPHA = 34184;
  var GL_SRC1_ALPHA = 34185;
  var GL_SRC2_ALPHA = 34186;
  var GL_OPERAND0_RGB = 34192;
  var GL_OPERAND1_RGB = 34193;
  var GL_OPERAND2_RGB = 34194;
  var GL_OPERAND0_ALPHA = 34200;
  var GL_OPERAND1_ALPHA = 34201;
  var GL_OPERAND2_ALPHA = 34202;
  var GL_COMBINE_RGB = 34161;
  var GL_COMBINE_ALPHA = 34162;
  var GL_RGB_SCALE = 34163;
  var GL_ALPHA_SCALE = 3356;
  var GL_ADD = 260;
  var GL_BLEND = 3042;
  var GL_REPLACE = 7681;
  var GL_MODULATE = 8448;
  var GL_DECAL = 8449;
  var GL_COMBINE = 34160;
  var GL_SUBTRACT = 34023;
  var GL_INTERPOLATE = 34165;
  var GL_TEXTURE = 5890;
  var GL_CONSTANT = 34166;
  var GL_PRIMARY_COLOR = 34167;
  var GL_PREVIOUS = 34168;
  var GL_SRC_COLOR = 768;
  var GL_ONE_MINUS_SRC_COLOR = 769;
  var GL_SRC_ALPHA = 770;
  var GL_ONE_MINUS_SRC_ALPHA = 771;
  var TEXENVJIT_NAMESPACE_PREFIX = "tej_";
  var TEX_UNIT_UNIFORM_PREFIX = "uTexUnit";
  var TEX_COORD_VARYING_PREFIX = "vTexCoord";
  var PRIM_COLOR_VARYING = "vPrimColor";
  var TEX_MATRIX_UNIFORM_PREFIX = "uTexMatrix";
  var s_texUnits = null;
  var s_activeTexture = 0;
  var s_requiredTexUnitsForPass = [];
  function abort(info) {
   assert(false, "[TexEnvJIT] ABORT: " + info);
  }
  function abort_noSupport(info) {
   abort("No support: " + info);
  }
  function abort_sanity(info) {
   abort("Sanity failure: " + info);
  }
  function genTexUnitSampleExpr(texUnitID) {
   var texUnit = s_texUnits[texUnitID];
   var texType = texUnit.getTexType();
   var func = null;
   switch (texType) {
   case GL_TEXTURE_1D:
    func = "texture2D";
    break;
   case GL_TEXTURE_2D:
    func = "texture2D";
    break;
   case GL_TEXTURE_3D:
    return abort_noSupport("No support for 3D textures.");
   case GL_TEXTURE_CUBE_MAP:
    func = "textureCube";
    break;
   default:
    return abort_sanity("Unknown texType: 0x" + texType.toString(16));
   }
   var texCoordExpr = TEX_COORD_VARYING_PREFIX + texUnitID;
   if (TEX_MATRIX_UNIFORM_PREFIX != null) {
    texCoordExpr = "(" + TEX_MATRIX_UNIFORM_PREFIX + texUnitID + " * " + texCoordExpr + ")";
   }
   return func + "(" + TEX_UNIT_UNIFORM_PREFIX + texUnitID + ", " + texCoordExpr + ".xy)";
  }
  function getTypeFromCombineOp(op) {
   switch (op) {
   case GL_SRC_COLOR:
   case GL_ONE_MINUS_SRC_COLOR:
    return "vec3";
   case GL_SRC_ALPHA:
   case GL_ONE_MINUS_SRC_ALPHA:
    return "float";
   }
   return abort_noSupport("Unsupported combiner op: 0x" + op.toString(16));
  }
  function getCurTexUnit() {
   return s_texUnits[s_activeTexture];
  }
  function genCombinerSourceExpr(texUnitID, constantExpr, previousVar, src, op) {
   var srcExpr = null;
   switch (src) {
   case GL_TEXTURE:
    srcExpr = genTexUnitSampleExpr(texUnitID);
    break;
   case GL_CONSTANT:
    srcExpr = constantExpr;
    break;
   case GL_PRIMARY_COLOR:
    srcExpr = PRIM_COLOR_VARYING;
    break;
   case GL_PREVIOUS:
    srcExpr = previousVar;
    break;
   default:
    return abort_noSupport("Unsupported combiner src: 0x" + src.toString(16));
   }
   var expr = null;
   switch (op) {
   case GL_SRC_COLOR:
    expr = srcExpr + ".rgb";
    break;
   case GL_ONE_MINUS_SRC_COLOR:
    expr = "(vec3(1.0) - " + srcExpr + ".rgb)";
    break;
   case GL_SRC_ALPHA:
    expr = srcExpr + ".a";
    break;
   case GL_ONE_MINUS_SRC_ALPHA:
    expr = "(1.0 - " + srcExpr + ".a)";
    break;
   default:
    return abort_noSupport("Unsupported combiner op: 0x" + op.toString(16));
   }
   return expr;
  }
  function valToFloatLiteral(val) {
   if (val == Math.round(val)) return val + ".0";
   return val;
  }
  function CTexEnv() {
   this.mode = GL_MODULATE;
   this.colorCombiner = GL_MODULATE;
   this.alphaCombiner = GL_MODULATE;
   this.colorScale = 1;
   this.alphaScale = 1;
   this.envColor = [ 0, 0, 0, 0 ];
   this.colorSrc = [ GL_TEXTURE, GL_PREVIOUS, GL_CONSTANT ];
   this.alphaSrc = [ GL_TEXTURE, GL_PREVIOUS, GL_CONSTANT ];
   this.colorOp = [ GL_SRC_COLOR, GL_SRC_COLOR, GL_SRC_ALPHA ];
   this.alphaOp = [ GL_SRC_ALPHA, GL_SRC_ALPHA, GL_SRC_ALPHA ];
   this.traverseKey = {
    7681: 0,
    8448: 1,
    260: 2,
    3042: 3,
    8449: 4,
    34160: 5,
    34023: 3,
    34165: 4,
    5890: 0,
    34166: 1,
    34167: 2,
    34168: 3,
    768: 0,
    769: 1,
    770: 2,
    768: 3
   };
   this.key0 = -1;
   this.key1 = 0;
   this.key2 = 0;
   this.computeKey0 = (function() {
    var k = this.traverseKey;
    var key = k[this.mode] * 1638400;
    key += k[this.colorCombiner] * 327680;
    key += k[this.alphaCombiner] * 65536;
    key += (this.colorScale - 1) * 16384;
    key += (this.alphaScale - 1) * 4096;
    key += k[this.colorSrc[0]] * 1024;
    key += k[this.colorSrc[1]] * 256;
    key += k[this.colorSrc[2]] * 64;
    key += k[this.alphaSrc[0]] * 16;
    key += k[this.alphaSrc[1]] * 4;
    key += k[this.alphaSrc[2]];
    return key;
   });
   this.computeKey1 = (function() {
    var k = this.traverseKey;
    key = k[this.colorOp[0]] * 4096;
    key += k[this.colorOp[1]] * 1024;
    key += k[this.colorOp[2]] * 256;
    key += k[this.alphaOp[0]] * 16;
    key += k[this.alphaOp[1]] * 4;
    key += k[this.alphaOp[2]];
    return key;
   });
   this.computeKey2 = (function() {
    return this.envColor[0] * 16777216 + this.envColor[1] * 65536 + this.envColor[2] * 256 + 1 + this.envColor[3];
   });
   this.recomputeKey = (function() {
    this.key0 = this.computeKey0();
    this.key1 = this.computeKey1();
    this.key2 = this.computeKey2();
   });
   this.invalidateKey = (function() {
    this.key0 = -1;
    GLImmediate.currentRenderer = null;
   });
  }
  function CTexUnit() {
   this.env = new CTexEnv;
   this.enabled_tex1D = false;
   this.enabled_tex2D = false;
   this.enabled_tex3D = false;
   this.enabled_texCube = false;
   this.texTypesEnabled = 0;
   this.traverseState = function CTexUnit_traverseState(keyView) {
    if (this.texTypesEnabled) {
     if (this.env.key0 == -1) {
      this.env.recomputeKey();
     }
     keyView.next(this.texTypesEnabled | this.env.key0 << 4);
     keyView.next(this.env.key1);
     keyView.next(this.env.key2);
    } else {
     keyView.next(0);
    }
   };
  }
  CTexUnit.prototype.enabled = function CTexUnit_enabled() {
   return this.texTypesEnabled;
  };
  CTexUnit.prototype.genPassLines = function CTexUnit_genPassLines(passOutputVar, passInputVar, texUnitID) {
   if (!this.enabled()) {
    return [ "vec4 " + passOutputVar + " = " + passInputVar + ";" ];
   }
   var lines = this.env.genPassLines(passOutputVar, passInputVar, texUnitID).join("\n");
   var texLoadLines = "";
   var texLoadRegex = /(texture.*?\(.*?\))/g;
   var loadCounter = 0;
   var load;
   while (load = texLoadRegex.exec(lines)) {
    var texLoadExpr = load[1];
    var secondOccurrence = lines.slice(load.index + 1).indexOf(texLoadExpr);
    if (secondOccurrence != -1) {
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
     var texLoadVar = prefix + "texload" + loadCounter++;
     var texLoadLine = "vec4 " + texLoadVar + " = " + texLoadExpr + ";\n";
     texLoadLines += texLoadLine + "\n";
     lines = lines.split(texLoadExpr).join(texLoadVar);
     texLoadRegex = /(texture.*\(.*\))/g;
    }
   }
   return [ texLoadLines + lines ];
  };
  CTexUnit.prototype.getTexType = function CTexUnit_getTexType() {
   if (this.enabled_texCube) {
    return GL_TEXTURE_CUBE_MAP;
   } else if (this.enabled_tex3D) {
    return GL_TEXTURE_3D;
   } else if (this.enabled_tex2D) {
    return GL_TEXTURE_2D;
   } else if (this.enabled_tex1D) {
    return GL_TEXTURE_1D;
   }
   return 0;
  };
  CTexEnv.prototype.genPassLines = function CTexEnv_genPassLines(passOutputVar, passInputVar, texUnitID) {
   switch (this.mode) {
   case GL_REPLACE:
    {
     return [ "vec4 " + passOutputVar + " = " + genTexUnitSampleExpr(texUnitID) + ";" ];
    }
   case GL_ADD:
    {
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
     var texVar = prefix + "tex";
     var colorVar = prefix + "color";
     var alphaVar = prefix + "alpha";
     return [ "vec4 " + texVar + " = " + genTexUnitSampleExpr(texUnitID) + ";", "vec3 " + colorVar + " = " + passInputVar + ".rgb + " + texVar + ".rgb;", "float " + alphaVar + " = " + passInputVar + ".a * " + texVar + ".a;", "vec4 " + passOutputVar + " = vec4(" + colorVar + ", " + alphaVar + ");" ];
    }
   case GL_MODULATE:
    {
     var line = [ "vec4 " + passOutputVar, " = ", passInputVar, " * ", genTexUnitSampleExpr(texUnitID), ";" ];
     return [ line.join("") ];
    }
   case GL_DECAL:
    {
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
     var texVar = prefix + "tex";
     var colorVar = prefix + "color";
     var alphaVar = prefix + "alpha";
     return [ "vec4 " + texVar + " = " + genTexUnitSampleExpr(texUnitID) + ";", [ "vec3 " + colorVar + " = ", passInputVar + ".rgb * (1.0 - " + texVar + ".a)", " + ", texVar + ".rgb * " + texVar + ".a", ";" ].join(""), "float " + alphaVar + " = " + passInputVar + ".a;", "vec4 " + passOutputVar + " = vec4(" + colorVar + ", " + alphaVar + ");" ];
    }
   case GL_BLEND:
    {
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
     var texVar = prefix + "tex";
     var colorVar = prefix + "color";
     var alphaVar = prefix + "alpha";
     return [ "vec4 " + texVar + " = " + genTexUnitSampleExpr(texUnitID) + ";", [ "vec3 " + colorVar + " = ", passInputVar + ".rgb * (1.0 - " + texVar + ".rgb)", " + ", PRIM_COLOR_VARYING + ".rgb * " + texVar + ".rgb", ";" ].join(""), "float " + alphaVar + " = " + texVar + ".a;", "vec4 " + passOutputVar + " = vec4(" + colorVar + ", " + alphaVar + ");" ];
    }
   case GL_COMBINE:
    {
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
     var colorVar = prefix + "color";
     var alphaVar = prefix + "alpha";
     var colorLines = this.genCombinerLines(true, colorVar, passInputVar, texUnitID, this.colorCombiner, this.colorSrc, this.colorOp);
     var alphaLines = this.genCombinerLines(false, alphaVar, passInputVar, texUnitID, this.alphaCombiner, this.alphaSrc, this.alphaOp);
     var scaledColor = this.colorScale == 1 ? colorVar : colorVar + " * " + valToFloatLiteral(this.colorScale);
     var scaledAlpha = this.alphaScale == 1 ? alphaVar : alphaVar + " * " + valToFloatLiteral(this.alphaScale);
     var line = [ "vec4 " + passOutputVar, " = ", "vec4(", scaledColor, ", ", scaledAlpha, ")", ";" ].join("");
     return [].concat(colorLines, alphaLines, [ line ]);
    }
   }
   return abort_noSupport("Unsupported TexEnv mode: 0x" + this.mode.toString(16));
  };
  CTexEnv.prototype.genCombinerLines = function CTexEnv_getCombinerLines(isColor, outputVar, passInputVar, texUnitID, combiner, srcArr, opArr) {
   var argsNeeded = null;
   switch (combiner) {
   case GL_REPLACE:
    argsNeeded = 1;
    break;
   case GL_MODULATE:
   case GL_ADD:
   case GL_SUBTRACT:
    argsNeeded = 2;
    break;
   case GL_INTERPOLATE:
    argsNeeded = 3;
    break;
   default:
    return abort_noSupport("Unsupported combiner: 0x" + combiner.toString(16));
   }
   var constantExpr = [ "vec4(", valToFloatLiteral(this.envColor[0]), ", ", valToFloatLiteral(this.envColor[1]), ", ", valToFloatLiteral(this.envColor[2]), ", ", valToFloatLiteral(this.envColor[3]), ")" ].join("");
   var src0Expr = argsNeeded >= 1 ? genCombinerSourceExpr(texUnitID, constantExpr, passInputVar, srcArr[0], opArr[0]) : null;
   var src1Expr = argsNeeded >= 2 ? genCombinerSourceExpr(texUnitID, constantExpr, passInputVar, srcArr[1], opArr[1]) : null;
   var src2Expr = argsNeeded >= 3 ? genCombinerSourceExpr(texUnitID, constantExpr, passInputVar, srcArr[2], opArr[2]) : null;
   var outputType = isColor ? "vec3" : "float";
   var lines = null;
   switch (combiner) {
   case GL_REPLACE:
    {
     var line = [ outputType + " " + outputVar, " = ", src0Expr, ";" ];
     lines = [ line.join("") ];
     break;
    }
   case GL_MODULATE:
    {
     var line = [ outputType + " " + outputVar + " = ", src0Expr + " * " + src1Expr, ";" ];
     lines = [ line.join("") ];
     break;
    }
   case GL_ADD:
    {
     var line = [ outputType + " " + outputVar + " = ", src0Expr + " + " + src1Expr, ";" ];
     lines = [ line.join("") ];
     break;
    }
   case GL_SUBTRACT:
    {
     var line = [ outputType + " " + outputVar + " = ", src0Expr + " - " + src1Expr, ";" ];
     lines = [ line.join("") ];
     break;
    }
   case GL_INTERPOLATE:
    {
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
     var arg2Var = prefix + "colorSrc2";
     var arg2Line = getTypeFromCombineOp(this.colorOp[2]) + " " + arg2Var + " = " + src2Expr + ";";
     var line = [ outputType + " " + outputVar, " = ", src0Expr + " * " + arg2Var, " + ", src1Expr + " * (1.0 - " + arg2Var + ")", ";" ];
     lines = [ arg2Line, line.join("") ];
     break;
    }
   default:
    return abort_sanity("Unmatched TexEnv.colorCombiner?");
   }
   return lines;
  };
  return {
   init: (function(gl, specifiedMaxTextureImageUnits) {
    var maxTexUnits = 0;
    if (specifiedMaxTextureImageUnits) {
     maxTexUnits = specifiedMaxTextureImageUnits;
    } else if (gl) {
     maxTexUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    }
    s_texUnits = [];
    for (var i = 0; i < maxTexUnits; i++) {
     s_texUnits.push(new CTexUnit);
    }
   }),
   setGLSLVars: (function(uTexUnitPrefix, vTexCoordPrefix, vPrimColor, uTexMatrixPrefix) {
    TEX_UNIT_UNIFORM_PREFIX = uTexUnitPrefix;
    TEX_COORD_VARYING_PREFIX = vTexCoordPrefix;
    PRIM_COLOR_VARYING = vPrimColor;
    TEX_MATRIX_UNIFORM_PREFIX = uTexMatrixPrefix;
   }),
   genAllPassLines: (function(resultDest, indentSize) {
    indentSize = indentSize || 0;
    s_requiredTexUnitsForPass.length = 0;
    var lines = [];
    var lastPassVar = PRIM_COLOR_VARYING;
    for (var i = 0; i < s_texUnits.length; i++) {
     if (!s_texUnits[i].enabled()) continue;
     s_requiredTexUnitsForPass.push(i);
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + i + "_";
     var passOutputVar = prefix + "result";
     var newLines = s_texUnits[i].genPassLines(passOutputVar, lastPassVar, i);
     lines = lines.concat(newLines, [ "" ]);
     lastPassVar = passOutputVar;
    }
    lines.push(resultDest + " = " + lastPassVar + ";");
    var indent = "";
    for (var i = 0; i < indentSize; i++) indent += " ";
    var output = indent + lines.join("\n" + indent);
    return output;
   }),
   getUsedTexUnitList: (function() {
    return s_requiredTexUnitsForPass;
   }),
   traverseState: (function(keyView) {
    for (var i = 0; i < s_texUnits.length; i++) {
     s_texUnits[i].traverseState(keyView);
    }
   }),
   getTexUnitType: (function(texUnitID) {
    return s_texUnits[texUnitID].getTexType();
   }),
   hook_activeTexture: (function(texture) {
    s_activeTexture = texture - GL_TEXTURE0;
   }),
   hook_enable: (function(cap) {
    var cur = getCurTexUnit();
    switch (cap) {
    case GL_TEXTURE_1D:
     if (!cur.enabled_tex1D) {
      GLImmediate.currentRenderer = null;
      cur.enabled_tex1D = true;
      cur.texTypesEnabled |= 1;
     }
     break;
    case GL_TEXTURE_2D:
     if (!cur.enabled_tex2D) {
      GLImmediate.currentRenderer = null;
      cur.enabled_tex2D = true;
      cur.texTypesEnabled |= 2;
     }
     break;
    case GL_TEXTURE_3D:
     if (!cur.enabled_tex3D) {
      GLImmediate.currentRenderer = null;
      cur.enabled_tex3D = true;
      cur.texTypesEnabled |= 4;
     }
     break;
    case GL_TEXTURE_CUBE_MAP:
     if (!cur.enabled_texCube) {
      GLImmediate.currentRenderer = null;
      cur.enabled_texCube = true;
      cur.texTypesEnabled |= 8;
     }
     break;
    }
   }),
   hook_disable: (function(cap) {
    var cur = getCurTexUnit();
    switch (cap) {
    case GL_TEXTURE_1D:
     if (cur.enabled_tex1D) {
      GLImmediate.currentRenderer = null;
      cur.enabled_tex1D = false;
      cur.texTypesEnabled &= ~1;
     }
     break;
    case GL_TEXTURE_2D:
     if (cur.enabled_tex2D) {
      GLImmediate.currentRenderer = null;
      cur.enabled_tex2D = false;
      cur.texTypesEnabled &= ~2;
     }
     break;
    case GL_TEXTURE_3D:
     if (cur.enabled_tex3D) {
      GLImmediate.currentRenderer = null;
      cur.enabled_tex3D = false;
      cur.texTypesEnabled &= ~4;
     }
     break;
    case GL_TEXTURE_CUBE_MAP:
     if (cur.enabled_texCube) {
      GLImmediate.currentRenderer = null;
      cur.enabled_texCube = false;
      cur.texTypesEnabled &= ~8;
     }
     break;
    }
   }),
   hook_texEnvf: (function(target, pname, param) {
    if (target != GL_TEXTURE_ENV) return;
    var env = getCurTexUnit().env;
    switch (pname) {
    case GL_RGB_SCALE:
     if (env.colorScale != param) {
      env.invalidateKey();
      env.colorScale = param;
     }
     break;
    case GL_ALPHA_SCALE:
     if (env.alphaScale != param) {
      env.invalidateKey();
      env.alphaScale = param;
     }
     break;
    default:
     Module.printErr("WARNING: Unhandled `pname` in call to `glTexEnvf`.");
    }
   }),
   hook_texEnvi: (function(target, pname, param) {
    if (target != GL_TEXTURE_ENV) return;
    var env = getCurTexUnit().env;
    switch (pname) {
    case GL_TEXTURE_ENV_MODE:
     if (env.mode != param) {
      env.invalidateKey();
      env.mode = param;
     }
     break;
    case GL_COMBINE_RGB:
     if (env.colorCombiner != param) {
      env.invalidateKey();
      env.colorCombiner = param;
     }
     break;
    case GL_COMBINE_ALPHA:
     if (env.alphaCombiner != param) {
      env.invalidateKey();
      env.alphaCombiner = param;
     }
     break;
    case GL_SRC0_RGB:
     if (env.colorSrc[0] != param) {
      env.invalidateKey();
      env.colorSrc[0] = param;
     }
     break;
    case GL_SRC1_RGB:
     if (env.colorSrc[1] != param) {
      env.invalidateKey();
      env.colorSrc[1] = param;
     }
     break;
    case GL_SRC2_RGB:
     if (env.colorSrc[2] != param) {
      env.invalidateKey();
      env.colorSrc[2] = param;
     }
     break;
    case GL_SRC0_ALPHA:
     if (env.alphaSrc[0] != param) {
      env.invalidateKey();
      env.alphaSrc[0] = param;
     }
     break;
    case GL_SRC1_ALPHA:
     if (env.alphaSrc[1] != param) {
      env.invalidateKey();
      env.alphaSrc[1] = param;
     }
     break;
    case GL_SRC2_ALPHA:
     if (env.alphaSrc[2] != param) {
      env.invalidateKey();
      env.alphaSrc[2] = param;
     }
     break;
    case GL_OPERAND0_RGB:
     if (env.colorOp[0] != param) {
      env.invalidateKey();
      env.colorOp[0] = param;
     }
     break;
    case GL_OPERAND1_RGB:
     if (env.colorOp[1] != param) {
      env.invalidateKey();
      env.colorOp[1] = param;
     }
     break;
    case GL_OPERAND2_RGB:
     if (env.colorOp[2] != param) {
      env.invalidateKey();
      env.colorOp[2] = param;
     }
     break;
    case GL_OPERAND0_ALPHA:
     if (env.alphaOp[0] != param) {
      env.invalidateKey();
      env.alphaOp[0] = param;
     }
     break;
    case GL_OPERAND1_ALPHA:
     if (env.alphaOp[1] != param) {
      env.invalidateKey();
      env.alphaOp[1] = param;
     }
     break;
    case GL_OPERAND2_ALPHA:
     if (env.alphaOp[2] != param) {
      env.invalidateKey();
      env.alphaOp[2] = param;
     }
     break;
    case GL_RGB_SCALE:
     if (env.colorScale != param) {
      env.invalidateKey();
      env.colorScale = param;
     }
     break;
    case GL_ALPHA_SCALE:
     if (env.alphaScale != param) {
      env.invalidateKey();
      env.alphaScale = param;
     }
     break;
    default:
     Module.printErr("WARNING: Unhandled `pname` in call to `glTexEnvi`.");
    }
   }),
   hook_texEnvfv: (function(target, pname, params) {
    if (target != GL_TEXTURE_ENV) return;
    var env = getCurTexUnit().env;
    switch (pname) {
    case GL_TEXTURE_ENV_COLOR:
     {
      for (var i = 0; i < 4; i++) {
       var param = HEAPF32[params + i * 4 >> 2];
       if (env.envColor[i] != param) {
        env.invalidateKey();
        env.envColor[i] = param;
       }
      }
      break;
     }
    default:
     Module.printErr("WARNING: Unhandled `pname` in call to `glTexEnvfv`.");
    }
   }),
   hook_getTexEnviv: (function(target, pname, param) {
    if (target != GL_TEXTURE_ENV) return;
    var env = getCurTexUnit().env;
    switch (pname) {
    case GL_TEXTURE_ENV_MODE:
     HEAP32[param >> 2] = env.mode;
     return;
    case GL_TEXTURE_ENV_COLOR:
     HEAP32[param >> 2] = Math.max(Math.min(env.envColor[0] * 255, 255, -255));
     HEAP32[param + 1 >> 2] = Math.max(Math.min(env.envColor[1] * 255, 255, -255));
     HEAP32[param + 2 >> 2] = Math.max(Math.min(env.envColor[2] * 255, 255, -255));
     HEAP32[param + 3 >> 2] = Math.max(Math.min(env.envColor[3] * 255, 255, -255));
     return;
    case GL_COMBINE_RGB:
     HEAP32[param >> 2] = env.colorCombiner;
     return;
    case GL_COMBINE_ALPHA:
     HEAP32[param >> 2] = env.alphaCombiner;
     return;
    case GL_SRC0_RGB:
     HEAP32[param >> 2] = env.colorSrc[0];
     return;
    case GL_SRC1_RGB:
     HEAP32[param >> 2] = env.colorSrc[1];
     return;
    case GL_SRC2_RGB:
     HEAP32[param >> 2] = env.colorSrc[2];
     return;
    case GL_SRC0_ALPHA:
     HEAP32[param >> 2] = env.alphaSrc[0];
     return;
    case GL_SRC1_ALPHA:
     HEAP32[param >> 2] = env.alphaSrc[1];
     return;
    case GL_SRC2_ALPHA:
     HEAP32[param >> 2] = env.alphaSrc[2];
     return;
    case GL_OPERAND0_RGB:
     HEAP32[param >> 2] = env.colorOp[0];
     return;
    case GL_OPERAND1_RGB:
     HEAP32[param >> 2] = env.colorOp[1];
     return;
    case GL_OPERAND2_RGB:
     HEAP32[param >> 2] = env.colorOp[2];
     return;
    case GL_OPERAND0_ALPHA:
     HEAP32[param >> 2] = env.alphaOp[0];
     return;
    case GL_OPERAND1_ALPHA:
     HEAP32[param >> 2] = env.alphaOp[1];
     return;
    case GL_OPERAND2_ALPHA:
     HEAP32[param >> 2] = env.alphaOp[2];
     return;
    case GL_RGB_SCALE:
     HEAP32[param >> 2] = env.colorScale;
     return;
    case GL_ALPHA_SCALE:
     HEAP32[param >> 2] = env.alphaScale;
     return;
    default:
     Module.printErr("WARNING: Unhandled `pname` in call to `glGetTexEnvi`.");
    }
   }),
   hook_getTexEnvfv: (function(target, pname, param) {
    if (target != GL_TEXTURE_ENV) return;
    var env = getCurTexUnit().env;
    switch (pname) {
    case GL_TEXTURE_ENV_COLOR:
     HEAPF32[param >> 2] = env.envColor[0];
     HEAPF32[param + 4 >> 2] = env.envColor[1];
     HEAPF32[param + 8 >> 2] = env.envColor[2];
     HEAPF32[param + 12 >> 2] = env.envColor[3];
     return;
    }
   })
  };
 }),
 vertexData: null,
 vertexDataU8: null,
 tempData: null,
 indexData: null,
 vertexCounter: 0,
 mode: -1,
 rendererCache: null,
 rendererComponents: [],
 rendererComponentPointer: 0,
 lastRenderer: null,
 lastArrayBuffer: null,
 lastProgram: null,
 lastStride: -1,
 matrix: [],
 matrixStack: [],
 currentMatrix: 0,
 tempMatrix: null,
 matricesModified: false,
 useTextureMatrix: false,
 VERTEX: 0,
 NORMAL: 1,
 COLOR: 2,
 TEXTURE0: 3,
 NUM_ATTRIBUTES: -1,
 MAX_TEXTURES: -1,
 totalEnabledClientAttributes: 0,
 enabledClientAttributes: [ 0, 0 ],
 clientAttributes: [],
 liveClientAttributes: [],
 currentRenderer: null,
 modifiedClientAttributes: false,
 clientActiveTexture: 0,
 clientColor: null,
 usedTexUnitList: [],
 fixedFunctionProgram: null,
 setClientAttribute: function setClientAttribute(name, size, type, stride, pointer) {
  var attrib = GLImmediate.clientAttributes[name];
  if (!attrib) {
   for (var i = 0; i <= name; i++) {
    if (!GLImmediate.clientAttributes[i]) {
     GLImmediate.clientAttributes[i] = {
      name: name,
      size: size,
      type: type,
      stride: stride,
      pointer: pointer,
      offset: 0
     };
    }
   }
  } else {
   attrib.name = name;
   attrib.size = size;
   attrib.type = type;
   attrib.stride = stride;
   attrib.pointer = pointer;
   attrib.offset = 0;
  }
  GLImmediate.modifiedClientAttributes = true;
 },
 addRendererComponent: function addRendererComponent(name, size, type) {
  if (!GLImmediate.rendererComponents[name]) {
   GLImmediate.rendererComponents[name] = 1;
   GLImmediate.enabledClientAttributes[name] = true;
   GLImmediate.setClientAttribute(name, size, type, 0, GLImmediate.rendererComponentPointer);
   GLImmediate.rendererComponentPointer += size * GL.byteSizeByType[type - GL.byteSizeByTypeRoot];
  } else {
   GLImmediate.rendererComponents[name]++;
  }
 },
 disableBeginEndClientAttributes: function disableBeginEndClientAttributes() {
  for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
   if (GLImmediate.rendererComponents[i]) GLImmediate.enabledClientAttributes[i] = false;
  }
 },
 getRenderer: function getRenderer() {
  if (GLImmediate.currentRenderer) {
   return GLImmediate.currentRenderer;
  }
  var attributes = GLImmediate.liveClientAttributes;
  var cacheMap = GLImmediate.rendererCache;
  var keyView = cacheMap.getStaticKeyView().reset();
  var enabledAttributesKey = 0;
  for (var i = 0; i < attributes.length; i++) {
   enabledAttributesKey |= 1 << attributes[i].name;
  }
  var fogParam = 0;
  if (GLEmulation.fogEnabled) {
   switch (GLEmulation.fogMode) {
   case 2049:
    fogParam = 1;
    break;
   case 9729:
    fogParam = 2;
    break;
   default:
    fogParam = 3;
    break;
   }
  }
  keyView.next(enabledAttributesKey << 2 | fogParam);
  keyView.next(GL.currProgram);
  if (!GL.currProgram) {
   GLImmediate.TexEnvJIT.traverseState(keyView);
  }
  var renderer = keyView.get();
  if (!renderer) {
   renderer = GLImmediate.createRenderer();
   GLImmediate.currentRenderer = renderer;
   keyView.set(renderer);
   return renderer;
  }
  GLImmediate.currentRenderer = renderer;
  return renderer;
 },
 createRenderer: function createRenderer(renderer) {
  var useCurrProgram = !!GL.currProgram;
  var hasTextures = false;
  for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
   var texAttribName = GLImmediate.TEXTURE0 + i;
   if (!GLImmediate.enabledClientAttributes[texAttribName]) continue;
   hasTextures = true;
  }
  var ret = {
   init: function init() {
    var uTexUnitPrefix = "u_texUnit";
    var aTexCoordPrefix = "a_texCoord";
    var vTexCoordPrefix = "v_texCoord";
    var vPrimColor = "v_color";
    var uTexMatrixPrefix = GLImmediate.useTextureMatrix ? "u_textureMatrix" : null;
    if (useCurrProgram) {
     if (GL.shaderInfos[GL.programShaders[GL.currProgram][0]].type == GLctx.VERTEX_SHADER) {
      this.vertexShader = GL.shaders[GL.programShaders[GL.currProgram][0]];
      this.fragmentShader = GL.shaders[GL.programShaders[GL.currProgram][1]];
     } else {
      this.vertexShader = GL.shaders[GL.programShaders[GL.currProgram][1]];
      this.fragmentShader = GL.shaders[GL.programShaders[GL.currProgram][0]];
     }
     this.program = GL.programs[GL.currProgram];
     this.usedTexUnitList = [];
    } else {
     if (GLEmulation.fogEnabled) {
      switch (GLEmulation.fogMode) {
      case 2049:
       var fogFormula = "  float fog = exp(-u_fogDensity * u_fogDensity * ecDistance * ecDistance); \n";
       break;
      case 9729:
       var fogFormula = "  float fog = (u_fogEnd - ecDistance) * u_fogScale; \n";
       break;
      default:
       var fogFormula = "  float fog = exp(-u_fogDensity * ecDistance); \n";
       break;
      }
     }
     GLImmediate.TexEnvJIT.setGLSLVars(uTexUnitPrefix, vTexCoordPrefix, vPrimColor, uTexMatrixPrefix);
     var fsTexEnvPass = GLImmediate.TexEnvJIT.genAllPassLines("gl_FragColor", 2);
     var texUnitAttribList = "";
     var texUnitVaryingList = "";
     var texUnitUniformList = "";
     var vsTexCoordInits = "";
     this.usedTexUnitList = GLImmediate.TexEnvJIT.getUsedTexUnitList();
     for (var i = 0; i < this.usedTexUnitList.length; i++) {
      var texUnit = this.usedTexUnitList[i];
      texUnitAttribList += "attribute vec4 " + aTexCoordPrefix + texUnit + ";\n";
      texUnitVaryingList += "varying vec4 " + vTexCoordPrefix + texUnit + ";\n";
      texUnitUniformList += "uniform sampler2D " + uTexUnitPrefix + texUnit + ";\n";
      vsTexCoordInits += "  " + vTexCoordPrefix + texUnit + " = " + aTexCoordPrefix + texUnit + ";\n";
      if (GLImmediate.useTextureMatrix) {
       texUnitUniformList += "uniform mat4 " + uTexMatrixPrefix + texUnit + ";\n";
      }
     }
     var vsFogVaryingInit = null;
     if (GLEmulation.fogEnabled) {
      vsFogVaryingInit = "  v_fogFragCoord = abs(ecPosition.z);\n";
     }
     var vsSource = [ "attribute vec4 a_position;", "attribute vec4 a_color;", "varying vec4 v_color;", texUnitAttribList, texUnitVaryingList, GLEmulation.fogEnabled ? "varying float v_fogFragCoord;" : null, "uniform mat4 u_modelView;", "uniform mat4 u_projection;", "void main()", "{", "  vec4 ecPosition = u_modelView * a_position;", "  gl_Position = u_projection * ecPosition;", "  v_color = a_color;", vsTexCoordInits, vsFogVaryingInit, "}", "" ].join("\n").replace(/\n\n+/g, "\n");
     this.vertexShader = GLctx.createShader(GLctx.VERTEX_SHADER);
     GLctx.shaderSource(this.vertexShader, vsSource);
     GLctx.compileShader(this.vertexShader);
     var fogHeaderIfNeeded = null;
     if (GLEmulation.fogEnabled) {
      fogHeaderIfNeeded = [ "", "varying float v_fogFragCoord; ", "uniform vec4 u_fogColor;      ", "uniform float u_fogEnd;       ", "uniform float u_fogScale;     ", "uniform float u_fogDensity;   ", "float ffog(in float ecDistance) { ", fogFormula, "  fog = clamp(fog, 0.0, 1.0); ", "  return fog;                 ", "}", "" ].join("\n");
     }
     var fogPass = null;
     if (GLEmulation.fogEnabled) {
      fogPass = "gl_FragColor = vec4(mix(u_fogColor.rgb, gl_FragColor.rgb, ffog(v_fogFragCoord)), gl_FragColor.a);\n";
     }
     var fsSource = [ "precision mediump float;", texUnitVaryingList, texUnitUniformList, "varying vec4 v_color;", fogHeaderIfNeeded, "void main()", "{", fsTexEnvPass, fogPass, "}", "" ].join("\n").replace(/\n\n+/g, "\n");
     this.fragmentShader = GLctx.createShader(GLctx.FRAGMENT_SHADER);
     GLctx.shaderSource(this.fragmentShader, fsSource);
     GLctx.compileShader(this.fragmentShader);
     this.program = GLctx.createProgram();
     GLctx.attachShader(this.program, this.vertexShader);
     GLctx.attachShader(this.program, this.fragmentShader);
     GLctx.bindAttribLocation(this.program, GLImmediate.VERTEX, "a_position");
     GLctx.bindAttribLocation(this.program, GLImmediate.COLOR, "a_color");
     GLctx.bindAttribLocation(this.program, GLImmediate.NORMAL, "a_normal");
     var maxVertexAttribs = GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);
     for (var i = 0; i < GLImmediate.MAX_TEXTURES && GLImmediate.TEXTURE0 + i < maxVertexAttribs; i++) {
      GLctx.bindAttribLocation(this.program, GLImmediate.TEXTURE0 + i, "a_texCoord" + i);
      GLctx.bindAttribLocation(this.program, GLImmediate.TEXTURE0 + i, aTexCoordPrefix + i);
     }
     GLctx.linkProgram(this.program);
    }
    this.textureMatrixVersion = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    this.positionLocation = GLctx.getAttribLocation(this.program, "a_position");
    this.texCoordLocations = [];
    for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
     if (!GLImmediate.enabledClientAttributes[GLImmediate.TEXTURE0 + i]) {
      this.texCoordLocations[i] = -1;
      continue;
     }
     if (useCurrProgram) {
      this.texCoordLocations[i] = GLctx.getAttribLocation(this.program, "a_texCoord" + i);
     } else {
      this.texCoordLocations[i] = GLctx.getAttribLocation(this.program, aTexCoordPrefix + i);
     }
    }
    this.colorLocation = GLctx.getAttribLocation(this.program, "a_color");
    if (!useCurrProgram) {
     var prevBoundProg = GLctx.getParameter(GLctx.CURRENT_PROGRAM);
     GLctx.useProgram(this.program);
     {
      for (var i = 0; i < this.usedTexUnitList.length; i++) {
       var texUnitID = this.usedTexUnitList[i];
       var texSamplerLoc = GLctx.getUniformLocation(this.program, uTexUnitPrefix + texUnitID);
       GLctx.uniform1i(texSamplerLoc, texUnitID);
      }
     }
     GLctx.vertexAttrib4fv(this.colorLocation, [ 1, 1, 1, 1 ]);
     GLctx.useProgram(prevBoundProg);
    }
    this.textureMatrixLocations = [];
    for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
     this.textureMatrixLocations[i] = GLctx.getUniformLocation(this.program, "u_textureMatrix" + i);
    }
    this.normalLocation = GLctx.getAttribLocation(this.program, "a_normal");
    this.modelViewLocation = GLctx.getUniformLocation(this.program, "u_modelView");
    this.projectionLocation = GLctx.getUniformLocation(this.program, "u_projection");
    this.hasTextures = hasTextures;
    this.hasNormal = GLImmediate.enabledClientAttributes[GLImmediate.NORMAL] && GLImmediate.clientAttributes[GLImmediate.NORMAL].size > 0 && this.normalLocation >= 0;
    this.hasColor = this.colorLocation === 0 || this.colorLocation > 0;
    this.floatType = GLctx.FLOAT;
    this.fogColorLocation = GLctx.getUniformLocation(this.program, "u_fogColor");
    this.fogEndLocation = GLctx.getUniformLocation(this.program, "u_fogEnd");
    this.fogScaleLocation = GLctx.getUniformLocation(this.program, "u_fogScale");
    this.fogDensityLocation = GLctx.getUniformLocation(this.program, "u_fogDensity");
    this.hasFog = !!(this.fogColorLocation || this.fogEndLocation || this.fogScaleLocation || this.fogDensityLocation);
   },
   prepare: function prepare() {
    var arrayBuffer;
    if (!GL.currArrayBuffer) {
     var start = GLImmediate.firstVertex * GLImmediate.stride;
     var end = GLImmediate.lastVertex * GLImmediate.stride;
     arrayBuffer = GL.getTempVertexBuffer(end);
    } else {
     arrayBuffer = GL.currArrayBuffer;
    }
    var lastRenderer = GLImmediate.lastRenderer;
    var canSkip = this == lastRenderer && arrayBuffer == GLImmediate.lastArrayBuffer && (GL.currProgram || this.program) == GLImmediate.lastProgram && GLImmediate.stride == GLImmediate.lastStride && !GLImmediate.matricesModified;
    if (!canSkip && lastRenderer) lastRenderer.cleanup();
    if (!GL.currArrayBuffer) {
     if (arrayBuffer != GLImmediate.lastArrayBuffer) {
      GLctx.bindBuffer(GLctx.ARRAY_BUFFER, arrayBuffer);
      GLImmediate.lastArrayBuffer = arrayBuffer;
     }
     GLctx.bufferSubData(GLctx.ARRAY_BUFFER, start, GLImmediate.vertexData.subarray(start >> 2, end >> 2));
    }
    if (canSkip) return;
    GLImmediate.lastRenderer = this;
    GLImmediate.lastProgram = GL.currProgram || this.program;
    GLImmediate.lastStride == GLImmediate.stride;
    GLImmediate.matricesModified = false;
    if (!GL.currProgram) {
     if (GLImmediate.fixedFunctionProgram != this.program) {
      GLctx.useProgram(this.program);
      GLImmediate.fixedFunctionProgram = this.program;
     }
    }
    if (this.modelViewLocation && this.modelViewMatrixVersion != GLImmediate.matrixVersion[0]) {
     this.modelViewMatrixVersion = GLImmediate.matrixVersion[0];
     GLctx.uniformMatrix4fv(this.modelViewLocation, false, GLImmediate.matrix[0]);
    }
    if (this.projectionLocation && this.projectionMatrixVersion != GLImmediate.matrixVersion[1]) {
     this.projectionMatrixVersion = GLImmediate.matrixVersion[1];
     GLctx.uniformMatrix4fv(this.projectionLocation, false, GLImmediate.matrix[1]);
    }
    var clientAttributes = GLImmediate.clientAttributes;
    var posAttr = clientAttributes[GLImmediate.VERTEX];
    GLctx.vertexAttribPointer(this.positionLocation, posAttr.size, posAttr.type, false, GLImmediate.stride, posAttr.offset);
    GLctx.enableVertexAttribArray(this.positionLocation);
    if (this.hasNormal) {
     var normalAttr = clientAttributes[GLImmediate.NORMAL];
     GLctx.vertexAttribPointer(this.normalLocation, normalAttr.size, normalAttr.type, true, GLImmediate.stride, normalAttr.offset);
     GLctx.enableVertexAttribArray(this.normalLocation);
    }
    if (this.hasTextures) {
     for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
      var attribLoc = this.texCoordLocations[i];
      if (attribLoc === undefined || attribLoc < 0) continue;
      var texAttr = clientAttributes[GLImmediate.TEXTURE0 + i];
      if (texAttr.size) {
       GLctx.vertexAttribPointer(attribLoc, texAttr.size, texAttr.type, false, GLImmediate.stride, texAttr.offset);
       GLctx.enableVertexAttribArray(attribLoc);
      } else {
       GLctx.vertexAttrib4f(attribLoc, 0, 0, 0, 1);
       GLctx.disableVertexAttribArray(attribLoc);
      }
      var t = 2 + i;
      if (this.textureMatrixLocations[i] && this.textureMatrixVersion[t] != GLImmediate.matrixVersion[t]) {
       this.textureMatrixVersion[t] = GLImmediate.matrixVersion[t];
       GLctx.uniformMatrix4fv(this.textureMatrixLocations[i], false, GLImmediate.matrix[t]);
      }
     }
    }
    if (GLImmediate.enabledClientAttributes[GLImmediate.COLOR]) {
     var colorAttr = clientAttributes[GLImmediate.COLOR];
     GLctx.vertexAttribPointer(this.colorLocation, colorAttr.size, colorAttr.type, true, GLImmediate.stride, colorAttr.offset);
     GLctx.enableVertexAttribArray(this.colorLocation);
    } else if (this.hasColor) {
     GLctx.disableVertexAttribArray(this.colorLocation);
     GLctx.vertexAttrib4fv(this.colorLocation, GLImmediate.clientColor);
    }
    if (this.hasFog) {
     if (this.fogColorLocation) GLctx.uniform4fv(this.fogColorLocation, GLEmulation.fogColor);
     if (this.fogEndLocation) GLctx.uniform1f(this.fogEndLocation, GLEmulation.fogEnd);
     if (this.fogScaleLocation) GLctx.uniform1f(this.fogScaleLocation, 1 / (GLEmulation.fogEnd - GLEmulation.fogStart));
     if (this.fogDensityLocation) GLctx.uniform1f(this.fogDensityLocation, GLEmulation.fogDensity);
    }
   },
   cleanup: function cleanup() {
    GLctx.disableVertexAttribArray(this.positionLocation);
    if (this.hasTextures) {
     for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
      if (GLImmediate.enabledClientAttributes[GLImmediate.TEXTURE0 + i] && this.texCoordLocations[i] >= 0) {
       GLctx.disableVertexAttribArray(this.texCoordLocations[i]);
      }
     }
    }
    if (this.hasColor) {
     GLctx.disableVertexAttribArray(this.colorLocation);
    }
    if (this.hasNormal) {
     GLctx.disableVertexAttribArray(this.normalLocation);
    }
    if (!GL.currProgram) {
     GLctx.useProgram(null);
     GLImmediate.fixedFunctionProgram = 0;
    }
    if (!GL.currArrayBuffer) {
     GLctx.bindBuffer(GLctx.ARRAY_BUFFER, null);
     GLImmediate.lastArrayBuffer = null;
    }
    GLImmediate.lastRenderer = null;
    GLImmediate.lastProgram = null;
    GLImmediate.matricesModified = true;
   }
  };
  ret.init();
  return ret;
 },
 setupFuncs: (function() {
  _glDrawArrays = _emscripten_glDrawArrays = function _glDrawArrays(mode, first, count) {
   if (GLImmediate.totalEnabledClientAttributes == 0 && mode <= 6) {
    GLctx.drawArrays(mode, first, count);
    return;
   }
   GLImmediate.prepareClientAttributes(count, false);
   GLImmediate.mode = mode;
   if (!GL.currArrayBuffer) {
    GLImmediate.vertexData = HEAPF32.subarray(GLImmediate.vertexPointer >> 2, GLImmediate.vertexPointer + (first + count) * GLImmediate.stride >> 2);
    GLImmediate.firstVertex = first;
    GLImmediate.lastVertex = first + count;
   }
   GLImmediate.flush(null, first);
   GLImmediate.mode = -1;
  };
  _glDrawElements = _emscripten_glDrawElements = function _glDrawElements(mode, count, type, indices, start, end) {
   if (GLImmediate.totalEnabledClientAttributes == 0 && mode <= 6 && GL.currElementArrayBuffer) {
    GLctx.drawElements(mode, count, type, indices);
    return;
   }
   GLImmediate.prepareClientAttributes(count, false);
   GLImmediate.mode = mode;
   if (!GL.currArrayBuffer) {
    GLImmediate.firstVertex = end ? start : TOTAL_MEMORY;
    GLImmediate.lastVertex = end ? end + 1 : 0;
    GLImmediate.vertexData = HEAPF32.subarray(GLImmediate.vertexPointer >> 2, end ? GLImmediate.vertexPointer + (end + 1) * GLImmediate.stride >> 2 : undefined);
   }
   GLImmediate.flush(count, 0, indices);
   GLImmediate.mode = -1;
  };
  GLImmediate.MapTreeLib = GLImmediate.spawnMapTreeLib();
  GLImmediate.spawnMapTreeLib = null;
  GLImmediate.TexEnvJIT = GLImmediate.spawnTexEnvJIT();
  GLImmediate.spawnTexEnvJIT = null;
  GLImmediate.setupHooks();
 }),
 setupHooks: (function() {
  if (!GLEmulation.hasRunInit) {
   GLEmulation.init();
  }
  var glActiveTexture = _glActiveTexture;
  _glActiveTexture = _emscripten_glActiveTexture = function _glActiveTexture(texture) {
   GLImmediate.TexEnvJIT.hook_activeTexture(texture);
   glActiveTexture(texture);
  };
  var glEnable = _glEnable;
  _glEnable = _emscripten_glEnable = function _glEnable(cap) {
   GLImmediate.TexEnvJIT.hook_enable(cap);
   glEnable(cap);
  };
  var glDisable = _glDisable;
  _glDisable = _emscripten_glDisable = function _glDisable(cap) {
   GLImmediate.TexEnvJIT.hook_disable(cap);
   glDisable(cap);
  };
  var glTexEnvf = typeof _glTexEnvf != "undefined" ? _glTexEnvf : (function() {});
  _glTexEnvf = _emscripten_glTexEnvf = function _glTexEnvf(target, pname, param) {
   GLImmediate.TexEnvJIT.hook_texEnvf(target, pname, param);
  };
  var glTexEnvi = typeof _glTexEnvi != "undefined" ? _glTexEnvi : (function() {});
  _glTexEnvi = _emscripten_glTexEnvi = function _glTexEnvi(target, pname, param) {
   GLImmediate.TexEnvJIT.hook_texEnvi(target, pname, param);
  };
  var glTexEnvfv = typeof _glTexEnvfv != "undefined" ? _glTexEnvfv : (function() {});
  _glTexEnvfv = _emscripten_glTexEnvfv = function _glTexEnvfv(target, pname, param) {
   GLImmediate.TexEnvJIT.hook_texEnvfv(target, pname, param);
  };
  _glGetTexEnviv = function _glGetTexEnviv(target, pname, param) {
   GLImmediate.TexEnvJIT.hook_getTexEnviv(target, pname, param);
  };
  _glGetTexEnvfv = function _glGetTexEnvfv(target, pname, param) {
   GLImmediate.TexEnvJIT.hook_getTexEnvfv(target, pname, param);
  };
  var glGetIntegerv = _glGetIntegerv;
  _glGetIntegerv = _emscripten_glGetIntegerv = function _glGetIntegerv(pname, params) {
   switch (pname) {
   case 35725:
    {
     var cur = GLctx.getParameter(GLctx.CURRENT_PROGRAM);
     if (cur == GLImmediate.fixedFunctionProgram) {
      HEAP32[params >> 2] = 0;
      return;
     }
     break;
    }
   }
   glGetIntegerv(pname, params);
  };
 }),
 initted: false,
 init: (function() {
  Module.printErr("WARNING: using emscripten GL immediate mode emulation. This is very limited in what it supports");
  GLImmediate.initted = true;
  if (!Module.useWebGL) return;
  GLImmediate.MAX_TEXTURES = Module["GL_MAX_TEXTURE_IMAGE_UNITS"] || GLctx.getParameter(GLctx.MAX_TEXTURE_IMAGE_UNITS);
  GLImmediate.TexEnvJIT.init(GLctx, GLImmediate.MAX_TEXTURES);
  GLImmediate.NUM_ATTRIBUTES = 3 + GLImmediate.MAX_TEXTURES;
  GLImmediate.clientAttributes = [];
  GLEmulation.enabledClientAttribIndices = [];
  for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
   GLImmediate.clientAttributes.push({});
   GLEmulation.enabledClientAttribIndices.push(false);
  }
  GLImmediate.matrix = [];
  GLImmediate.matrixStack = [];
  GLImmediate.matrixVersion = [];
  for (var i = 0; i < 2 + GLImmediate.MAX_TEXTURES; i++) {
   GLImmediate.matrixStack.push([]);
   GLImmediate.matrixVersion.push(0);
   GLImmediate.matrix.push(GLImmediate.matrixLib.mat4.create());
   GLImmediate.matrixLib.mat4.identity(GLImmediate.matrix[i]);
  }
  GLImmediate.rendererCache = GLImmediate.MapTreeLib.create();
  GLImmediate.tempData = new Float32Array(GL.MAX_TEMP_BUFFER_SIZE >> 2);
  GLImmediate.indexData = new Uint16Array(GL.MAX_TEMP_BUFFER_SIZE >> 1);
  GLImmediate.vertexDataU8 = new Uint8Array(GLImmediate.tempData.buffer);
  GL.generateTempBuffers(true, GL.currentContext);
  GLImmediate.clientColor = new Float32Array([ 1, 1, 1, 1 ]);
 }),
 prepareClientAttributes: function prepareClientAttributes(count, beginEnd) {
  if (!GLImmediate.modifiedClientAttributes) {
   GLImmediate.vertexCounter = GLImmediate.stride * count / 4;
   return;
  }
  GLImmediate.modifiedClientAttributes = false;
  var clientStartPointer = 2147483647;
  var bytes = 0;
  var minStride = 2147483647;
  var maxStride = 0;
  var attributes = GLImmediate.liveClientAttributes;
  attributes.length = 0;
  for (var i = 0; i < 3 + GLImmediate.MAX_TEXTURES; i++) {
   if (GLImmediate.enabledClientAttributes[i]) {
    var attr = GLImmediate.clientAttributes[i];
    attributes.push(attr);
    clientStartPointer = Math.min(clientStartPointer, attr.pointer);
    attr.sizeBytes = attr.size * GL.byteSizeByType[attr.type - GL.byteSizeByTypeRoot];
    bytes += attr.sizeBytes;
    minStride = Math.min(minStride, attr.stride);
    maxStride = Math.max(maxStride, attr.stride);
   }
  }
  if ((minStride != maxStride || maxStride < bytes) && !beginEnd) {
   if (!GLImmediate.restrideBuffer) GLImmediate.restrideBuffer = _malloc(GL.MAX_TEMP_BUFFER_SIZE);
   var start = GLImmediate.restrideBuffer;
   bytes = 0;
   for (var i = 0; i < attributes.length; i++) {
    var attr = attributes[i];
    var size = attr.sizeBytes;
    if (size % 4 != 0) size += 4 - size % 4;
    attr.offset = bytes;
    bytes += size;
   }
   for (var i = 0; i < attributes.length; i++) {
    var attr = attributes[i];
    var srcStride = Math.max(attr.sizeBytes, attr.stride);
    if ((srcStride & 3) == 0 && (attr.sizeBytes & 3) == 0) {
     var size4 = attr.sizeBytes >> 2;
     var srcStride4 = Math.max(attr.sizeBytes, attr.stride) >> 2;
     for (var j = 0; j < count; j++) {
      for (var k = 0; k < size4; k++) {
       HEAP32[(start + attr.offset + bytes * j >> 2) + k] = HEAP32[(attr.pointer >> 2) + j * srcStride4 + k];
      }
     }
    } else {
     for (var j = 0; j < count; j++) {
      for (var k = 0; k < attr.sizeBytes; k++) {
       HEAP8[start + attr.offset + bytes * j + k] = HEAP8[attr.pointer + j * srcStride + k];
      }
     }
    }
    attr.pointer = start + attr.offset;
   }
   GLImmediate.stride = bytes;
   GLImmediate.vertexPointer = start;
  } else {
   if (GL.currArrayBuffer) {
    GLImmediate.vertexPointer = 0;
   } else {
    GLImmediate.vertexPointer = clientStartPointer;
   }
   for (var i = 0; i < attributes.length; i++) {
    var attr = attributes[i];
    attr.offset = attr.pointer - GLImmediate.vertexPointer;
   }
   GLImmediate.stride = Math.max(maxStride, bytes);
  }
  if (!beginEnd) {
   GLImmediate.vertexCounter = GLImmediate.stride * count / 4;
  }
 },
 flush: function flush(numProvidedIndexes, startIndex, ptr) {
  startIndex = startIndex || 0;
  ptr = ptr || 0;
  var renderer = GLImmediate.getRenderer();
  var numVertexes = 4 * GLImmediate.vertexCounter / GLImmediate.stride;
  if (!numVertexes) return;
  var emulatedElementArrayBuffer = false;
  var numIndexes = 0;
  if (numProvidedIndexes) {
   numIndexes = numProvidedIndexes;
   if (!GL.currArrayBuffer && GLImmediate.firstVertex > GLImmediate.lastVertex) {
    for (var i = 0; i < numProvidedIndexes; i++) {
     var currIndex = HEAPU16[ptr + i * 2 >> 1];
     GLImmediate.firstVertex = Math.min(GLImmediate.firstVertex, currIndex);
     GLImmediate.lastVertex = Math.max(GLImmediate.lastVertex, currIndex + 1);
    }
   }
   if (!GL.currElementArrayBuffer) {
    var indexBuffer = GL.getTempIndexBuffer(numProvidedIndexes << 1);
    GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, indexBuffer);
    GLctx.bufferSubData(GLctx.ELEMENT_ARRAY_BUFFER, 0, HEAPU16.subarray(ptr >> 1, ptr + (numProvidedIndexes << 1) >> 1));
    ptr = 0;
    emulatedElementArrayBuffer = true;
   }
  } else if (GLImmediate.mode > 6) {
   if (GLImmediate.mode != 7) throw "unsupported immediate mode " + GLImmediate.mode;
   ptr = GLImmediate.firstVertex * 3;
   var numQuads = numVertexes / 4;
   numIndexes = numQuads * 6;
   GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.currentContext.tempQuadIndexBuffer);
   emulatedElementArrayBuffer = true;
  }
  renderer.prepare();
  if (numIndexes) {
   GLctx.drawElements(GLctx.TRIANGLES, numIndexes, GLctx.UNSIGNED_SHORT, ptr);
  } else {
   GLctx.drawArrays(GLImmediate.mode, startIndex, numVertexes);
  }
  if (emulatedElementArrayBuffer) {
   GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.buffers[GL.currElementArrayBuffer] || null);
  }
 }
};
GLImmediate.matrixLib = (function() {
 var vec3 = {};
 var mat3 = {};
 var mat4 = {};
 var quat4 = {};
 var MatrixArray = Float32Array;
 vec3.create = (function(vec) {
  var dest = new MatrixArray(3);
  if (vec) {
   dest[0] = vec[0];
   dest[1] = vec[1];
   dest[2] = vec[2];
  } else {
   dest[0] = dest[1] = dest[2] = 0;
  }
  return dest;
 });
 vec3.set = (function(vec, dest) {
  dest[0] = vec[0];
  dest[1] = vec[1];
  dest[2] = vec[2];
  return dest;
 });
 vec3.add = (function(vec, vec2, dest) {
  if (!dest || vec === dest) {
   vec[0] += vec2[0];
   vec[1] += vec2[1];
   vec[2] += vec2[2];
   return vec;
  }
  dest[0] = vec[0] + vec2[0];
  dest[1] = vec[1] + vec2[1];
  dest[2] = vec[2] + vec2[2];
  return dest;
 });
 vec3.subtract = (function(vec, vec2, dest) {
  if (!dest || vec === dest) {
   vec[0] -= vec2[0];
   vec[1] -= vec2[1];
   vec[2] -= vec2[2];
   return vec;
  }
  dest[0] = vec[0] - vec2[0];
  dest[1] = vec[1] - vec2[1];
  dest[2] = vec[2] - vec2[2];
  return dest;
 });
 vec3.multiply = (function(vec, vec2, dest) {
  if (!dest || vec === dest) {
   vec[0] *= vec2[0];
   vec[1] *= vec2[1];
   vec[2] *= vec2[2];
   return vec;
  }
  dest[0] = vec[0] * vec2[0];
  dest[1] = vec[1] * vec2[1];
  dest[2] = vec[2] * vec2[2];
  return dest;
 });
 vec3.negate = (function(vec, dest) {
  if (!dest) {
   dest = vec;
  }
  dest[0] = -vec[0];
  dest[1] = -vec[1];
  dest[2] = -vec[2];
  return dest;
 });
 vec3.scale = (function(vec, val, dest) {
  if (!dest || vec === dest) {
   vec[0] *= val;
   vec[1] *= val;
   vec[2] *= val;
   return vec;
  }
  dest[0] = vec[0] * val;
  dest[1] = vec[1] * val;
  dest[2] = vec[2] * val;
  return dest;
 });
 vec3.normalize = (function(vec, dest) {
  if (!dest) {
   dest = vec;
  }
  var x = vec[0], y = vec[1], z = vec[2], len = Math.sqrt(x * x + y * y + z * z);
  if (!len) {
   dest[0] = 0;
   dest[1] = 0;
   dest[2] = 0;
   return dest;
  } else if (len === 1) {
   dest[0] = x;
   dest[1] = y;
   dest[2] = z;
   return dest;
  }
  len = 1 / len;
  dest[0] = x * len;
  dest[1] = y * len;
  dest[2] = z * len;
  return dest;
 });
 vec3.cross = (function(vec, vec2, dest) {
  if (!dest) {
   dest = vec;
  }
  var x = vec[0], y = vec[1], z = vec[2], x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];
  dest[0] = y * z2 - z * y2;
  dest[1] = z * x2 - x * z2;
  dest[2] = x * y2 - y * x2;
  return dest;
 });
 vec3.length = (function(vec) {
  var x = vec[0], y = vec[1], z = vec[2];
  return Math.sqrt(x * x + y * y + z * z);
 });
 vec3.dot = (function(vec, vec2) {
  return vec[0] * vec2[0] + vec[1] * vec2[1] + vec[2] * vec2[2];
 });
 vec3.direction = (function(vec, vec2, dest) {
  if (!dest) {
   dest = vec;
  }
  var x = vec[0] - vec2[0], y = vec[1] - vec2[1], z = vec[2] - vec2[2], len = Math.sqrt(x * x + y * y + z * z);
  if (!len) {
   dest[0] = 0;
   dest[1] = 0;
   dest[2] = 0;
   return dest;
  }
  len = 1 / len;
  dest[0] = x * len;
  dest[1] = y * len;
  dest[2] = z * len;
  return dest;
 });
 vec3.lerp = (function(vec, vec2, lerp, dest) {
  if (!dest) {
   dest = vec;
  }
  dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
  dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
  dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);
  return dest;
 });
 vec3.dist = (function(vec, vec2) {
  var x = vec2[0] - vec[0], y = vec2[1] - vec[1], z = vec2[2] - vec[2];
  return Math.sqrt(x * x + y * y + z * z);
 });
 vec3.unproject = (function(vec, view, proj, viewport, dest) {
  if (!dest) {
   dest = vec;
  }
  var m = mat4.create();
  var v = new MatrixArray(4);
  v[0] = (vec[0] - viewport[0]) * 2 / viewport[2] - 1;
  v[1] = (vec[1] - viewport[1]) * 2 / viewport[3] - 1;
  v[2] = 2 * vec[2] - 1;
  v[3] = 1;
  mat4.multiply(proj, view, m);
  if (!mat4.inverse(m)) {
   return null;
  }
  mat4.multiplyVec4(m, v);
  if (v[3] === 0) {
   return null;
  }
  dest[0] = v[0] / v[3];
  dest[1] = v[1] / v[3];
  dest[2] = v[2] / v[3];
  return dest;
 });
 vec3.str = (function(vec) {
  return "[" + vec[0] + ", " + vec[1] + ", " + vec[2] + "]";
 });
 mat3.create = (function(mat) {
  var dest = new MatrixArray(9);
  if (mat) {
   dest[0] = mat[0];
   dest[1] = mat[1];
   dest[2] = mat[2];
   dest[3] = mat[3];
   dest[4] = mat[4];
   dest[5] = mat[5];
   dest[6] = mat[6];
   dest[7] = mat[7];
   dest[8] = mat[8];
  }
  return dest;
 });
 mat3.set = (function(mat, dest) {
  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[3];
  dest[4] = mat[4];
  dest[5] = mat[5];
  dest[6] = mat[6];
  dest[7] = mat[7];
  dest[8] = mat[8];
  return dest;
 });
 mat3.identity = (function(dest) {
  if (!dest) {
   dest = mat3.create();
  }
  dest[0] = 1;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;
  dest[4] = 1;
  dest[5] = 0;
  dest[6] = 0;
  dest[7] = 0;
  dest[8] = 1;
  return dest;
 });
 mat3.transpose = (function(mat, dest) {
  if (!dest || mat === dest) {
   var a01 = mat[1], a02 = mat[2], a12 = mat[5];
   mat[1] = mat[3];
   mat[2] = mat[6];
   mat[3] = a01;
   mat[5] = mat[7];
   mat[6] = a02;
   mat[7] = a12;
   return mat;
  }
  dest[0] = mat[0];
  dest[1] = mat[3];
  dest[2] = mat[6];
  dest[3] = mat[1];
  dest[4] = mat[4];
  dest[5] = mat[7];
  dest[6] = mat[2];
  dest[7] = mat[5];
  dest[8] = mat[8];
  return dest;
 });
 mat3.toMat4 = (function(mat, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  dest[15] = 1;
  dest[14] = 0;
  dest[13] = 0;
  dest[12] = 0;
  dest[11] = 0;
  dest[10] = mat[8];
  dest[9] = mat[7];
  dest[8] = mat[6];
  dest[7] = 0;
  dest[6] = mat[5];
  dest[5] = mat[4];
  dest[4] = mat[3];
  dest[3] = 0;
  dest[2] = mat[2];
  dest[1] = mat[1];
  dest[0] = mat[0];
  return dest;
 });
 mat3.str = (function(mat) {
  return "[" + mat[0] + ", " + mat[1] + ", " + mat[2] + ", " + mat[3] + ", " + mat[4] + ", " + mat[5] + ", " + mat[6] + ", " + mat[7] + ", " + mat[8] + "]";
 });
 mat4.create = (function(mat) {
  var dest = new MatrixArray(16);
  if (mat) {
   dest[0] = mat[0];
   dest[1] = mat[1];
   dest[2] = mat[2];
   dest[3] = mat[3];
   dest[4] = mat[4];
   dest[5] = mat[5];
   dest[6] = mat[6];
   dest[7] = mat[7];
   dest[8] = mat[8];
   dest[9] = mat[9];
   dest[10] = mat[10];
   dest[11] = mat[11];
   dest[12] = mat[12];
   dest[13] = mat[13];
   dest[14] = mat[14];
   dest[15] = mat[15];
  }
  return dest;
 });
 mat4.set = (function(mat, dest) {
  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[3];
  dest[4] = mat[4];
  dest[5] = mat[5];
  dest[6] = mat[6];
  dest[7] = mat[7];
  dest[8] = mat[8];
  dest[9] = mat[9];
  dest[10] = mat[10];
  dest[11] = mat[11];
  dest[12] = mat[12];
  dest[13] = mat[13];
  dest[14] = mat[14];
  dest[15] = mat[15];
  return dest;
 });
 mat4.identity = (function(dest) {
  if (!dest) {
   dest = mat4.create();
  }
  dest[0] = 1;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;
  dest[4] = 0;
  dest[5] = 1;
  dest[6] = 0;
  dest[7] = 0;
  dest[8] = 0;
  dest[9] = 0;
  dest[10] = 1;
  dest[11] = 0;
  dest[12] = 0;
  dest[13] = 0;
  dest[14] = 0;
  dest[15] = 1;
  return dest;
 });
 mat4.transpose = (function(mat, dest) {
  if (!dest || mat === dest) {
   var a01 = mat[1], a02 = mat[2], a03 = mat[3], a12 = mat[6], a13 = mat[7], a23 = mat[11];
   mat[1] = mat[4];
   mat[2] = mat[8];
   mat[3] = mat[12];
   mat[4] = a01;
   mat[6] = mat[9];
   mat[7] = mat[13];
   mat[8] = a02;
   mat[9] = a12;
   mat[11] = mat[14];
   mat[12] = a03;
   mat[13] = a13;
   mat[14] = a23;
   return mat;
  }
  dest[0] = mat[0];
  dest[1] = mat[4];
  dest[2] = mat[8];
  dest[3] = mat[12];
  dest[4] = mat[1];
  dest[5] = mat[5];
  dest[6] = mat[9];
  dest[7] = mat[13];
  dest[8] = mat[2];
  dest[9] = mat[6];
  dest[10] = mat[10];
  dest[11] = mat[14];
  dest[12] = mat[3];
  dest[13] = mat[7];
  dest[14] = mat[11];
  dest[15] = mat[15];
  return dest;
 });
 mat4.determinant = (function(mat) {
  var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11], a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
  return a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 + a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 + a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 + a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 + a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 + a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33;
 });
 mat4.inverse = (function(mat, dest) {
  if (!dest) {
   dest = mat;
  }
  var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11], a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06, invDet;
  if (!d) {
   return null;
  }
  invDet = 1 / d;
  dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
  dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
  dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
  dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
  dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
  dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
  dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
  dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
  dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
  dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
  dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
  dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
  dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
  dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
  dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
  dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
  return dest;
 });
 mat4.toRotationMat = (function(mat, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[3];
  dest[4] = mat[4];
  dest[5] = mat[5];
  dest[6] = mat[6];
  dest[7] = mat[7];
  dest[8] = mat[8];
  dest[9] = mat[9];
  dest[10] = mat[10];
  dest[11] = mat[11];
  dest[12] = 0;
  dest[13] = 0;
  dest[14] = 0;
  dest[15] = 1;
  return dest;
 });
 mat4.toMat3 = (function(mat, dest) {
  if (!dest) {
   dest = mat3.create();
  }
  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[4];
  dest[4] = mat[5];
  dest[5] = mat[6];
  dest[6] = mat[8];
  dest[7] = mat[9];
  dest[8] = mat[10];
  return dest;
 });
 mat4.toInverseMat3 = (function(mat, dest) {
  var a00 = mat[0], a01 = mat[1], a02 = mat[2], a10 = mat[4], a11 = mat[5], a12 = mat[6], a20 = mat[8], a21 = mat[9], a22 = mat[10], b01 = a22 * a11 - a12 * a21, b11 = -a22 * a10 + a12 * a20, b21 = a21 * a10 - a11 * a20, d = a00 * b01 + a01 * b11 + a02 * b21, id;
  if (!d) {
   return null;
  }
  id = 1 / d;
  if (!dest) {
   dest = mat3.create();
  }
  dest[0] = b01 * id;
  dest[1] = (-a22 * a01 + a02 * a21) * id;
  dest[2] = (a12 * a01 - a02 * a11) * id;
  dest[3] = b11 * id;
  dest[4] = (a22 * a00 - a02 * a20) * id;
  dest[5] = (-a12 * a00 + a02 * a10) * id;
  dest[6] = b21 * id;
  dest[7] = (-a21 * a00 + a01 * a20) * id;
  dest[8] = (a11 * a00 - a01 * a10) * id;
  return dest;
 });
 mat4.multiply = (function(mat, mat2, dest) {
  if (!dest) {
   dest = mat;
  }
  var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11], a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15], b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3], b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7], b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11], b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];
  dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
  dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
  dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
  dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
  dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
  dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
  dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
  dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
  dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
  dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
  dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
  dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
  dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
  dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
  dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
  dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
  return dest;
 });
 mat4.multiplyVec3 = (function(mat, vec, dest) {
  if (!dest) {
   dest = vec;
  }
  var x = vec[0], y = vec[1], z = vec[2];
  dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
  dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
  dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
  return dest;
 });
 mat4.multiplyVec4 = (function(mat, vec, dest) {
  if (!dest) {
   dest = vec;
  }
  var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
  dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
  dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
  dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
  dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;
  return dest;
 });
 mat4.translate = (function(mat, vec, dest) {
  var x = vec[0], y = vec[1], z = vec[2], a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23;
  if (!dest || mat === dest) {
   mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
   mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
   mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
   mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
   return mat;
  }
  a00 = mat[0];
  a01 = mat[1];
  a02 = mat[2];
  a03 = mat[3];
  a10 = mat[4];
  a11 = mat[5];
  a12 = mat[6];
  a13 = mat[7];
  a20 = mat[8];
  a21 = mat[9];
  a22 = mat[10];
  a23 = mat[11];
  dest[0] = a00;
  dest[1] = a01;
  dest[2] = a02;
  dest[3] = a03;
  dest[4] = a10;
  dest[5] = a11;
  dest[6] = a12;
  dest[7] = a13;
  dest[8] = a20;
  dest[9] = a21;
  dest[10] = a22;
  dest[11] = a23;
  dest[12] = a00 * x + a10 * y + a20 * z + mat[12];
  dest[13] = a01 * x + a11 * y + a21 * z + mat[13];
  dest[14] = a02 * x + a12 * y + a22 * z + mat[14];
  dest[15] = a03 * x + a13 * y + a23 * z + mat[15];
  return dest;
 });
 mat4.scale = (function(mat, vec, dest) {
  var x = vec[0], y = vec[1], z = vec[2];
  if (!dest || mat === dest) {
   mat[0] *= x;
   mat[1] *= x;
   mat[2] *= x;
   mat[3] *= x;
   mat[4] *= y;
   mat[5] *= y;
   mat[6] *= y;
   mat[7] *= y;
   mat[8] *= z;
   mat[9] *= z;
   mat[10] *= z;
   mat[11] *= z;
   return mat;
  }
  dest[0] = mat[0] * x;
  dest[1] = mat[1] * x;
  dest[2] = mat[2] * x;
  dest[3] = mat[3] * x;
  dest[4] = mat[4] * y;
  dest[5] = mat[5] * y;
  dest[6] = mat[6] * y;
  dest[7] = mat[7] * y;
  dest[8] = mat[8] * z;
  dest[9] = mat[9] * z;
  dest[10] = mat[10] * z;
  dest[11] = mat[11] * z;
  dest[12] = mat[12];
  dest[13] = mat[13];
  dest[14] = mat[14];
  dest[15] = mat[15];
  return dest;
 });
 mat4.rotate = (function(mat, angle, axis, dest) {
  var x = axis[0], y = axis[1], z = axis[2], len = Math.sqrt(x * x + y * y + z * z), s, c, t, a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, b00, b01, b02, b10, b11, b12, b20, b21, b22;
  if (!len) {
   return null;
  }
  if (len !== 1) {
   len = 1 / len;
   x *= len;
   y *= len;
   z *= len;
  }
  s = Math.sin(angle);
  c = Math.cos(angle);
  t = 1 - c;
  a00 = mat[0];
  a01 = mat[1];
  a02 = mat[2];
  a03 = mat[3];
  a10 = mat[4];
  a11 = mat[5];
  a12 = mat[6];
  a13 = mat[7];
  a20 = mat[8];
  a21 = mat[9];
  a22 = mat[10];
  a23 = mat[11];
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;
  if (!dest) {
   dest = mat;
  } else if (mat !== dest) {
   dest[12] = mat[12];
   dest[13] = mat[13];
   dest[14] = mat[14];
   dest[15] = mat[15];
  }
  dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
  dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
  dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
  dest[3] = a03 * b00 + a13 * b01 + a23 * b02;
  dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
  dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
  dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
  dest[7] = a03 * b10 + a13 * b11 + a23 * b12;
  dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
  dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
  dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
  dest[11] = a03 * b20 + a13 * b21 + a23 * b22;
  return dest;
 });
 mat4.rotateX = (function(mat, angle, dest) {
  var s = Math.sin(angle), c = Math.cos(angle), a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
  if (!dest) {
   dest = mat;
  } else if (mat !== dest) {
   dest[0] = mat[0];
   dest[1] = mat[1];
   dest[2] = mat[2];
   dest[3] = mat[3];
   dest[12] = mat[12];
   dest[13] = mat[13];
   dest[14] = mat[14];
   dest[15] = mat[15];
  }
  dest[4] = a10 * c + a20 * s;
  dest[5] = a11 * c + a21 * s;
  dest[6] = a12 * c + a22 * s;
  dest[7] = a13 * c + a23 * s;
  dest[8] = a10 * -s + a20 * c;
  dest[9] = a11 * -s + a21 * c;
  dest[10] = a12 * -s + a22 * c;
  dest[11] = a13 * -s + a23 * c;
  return dest;
 });
 mat4.rotateY = (function(mat, angle, dest) {
  var s = Math.sin(angle), c = Math.cos(angle), a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
  if (!dest) {
   dest = mat;
  } else if (mat !== dest) {
   dest[4] = mat[4];
   dest[5] = mat[5];
   dest[6] = mat[6];
   dest[7] = mat[7];
   dest[12] = mat[12];
   dest[13] = mat[13];
   dest[14] = mat[14];
   dest[15] = mat[15];
  }
  dest[0] = a00 * c + a20 * -s;
  dest[1] = a01 * c + a21 * -s;
  dest[2] = a02 * c + a22 * -s;
  dest[3] = a03 * c + a23 * -s;
  dest[8] = a00 * s + a20 * c;
  dest[9] = a01 * s + a21 * c;
  dest[10] = a02 * s + a22 * c;
  dest[11] = a03 * s + a23 * c;
  return dest;
 });
 mat4.rotateZ = (function(mat, angle, dest) {
  var s = Math.sin(angle), c = Math.cos(angle), a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
  if (!dest) {
   dest = mat;
  } else if (mat !== dest) {
   dest[8] = mat[8];
   dest[9] = mat[9];
   dest[10] = mat[10];
   dest[11] = mat[11];
   dest[12] = mat[12];
   dest[13] = mat[13];
   dest[14] = mat[14];
   dest[15] = mat[15];
  }
  dest[0] = a00 * c + a10 * s;
  dest[1] = a01 * c + a11 * s;
  dest[2] = a02 * c + a12 * s;
  dest[3] = a03 * c + a13 * s;
  dest[4] = a00 * -s + a10 * c;
  dest[5] = a01 * -s + a11 * c;
  dest[6] = a02 * -s + a12 * c;
  dest[7] = a03 * -s + a13 * c;
  return dest;
 });
 mat4.frustum = (function(left, right, bottom, top, near, far, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  var rl = right - left, tb = top - bottom, fn = far - near;
  dest[0] = near * 2 / rl;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;
  dest[4] = 0;
  dest[5] = near * 2 / tb;
  dest[6] = 0;
  dest[7] = 0;
  dest[8] = (right + left) / rl;
  dest[9] = (top + bottom) / tb;
  dest[10] = -(far + near) / fn;
  dest[11] = -1;
  dest[12] = 0;
  dest[13] = 0;
  dest[14] = -(far * near * 2) / fn;
  dest[15] = 0;
  return dest;
 });
 mat4.perspective = (function(fovy, aspect, near, far, dest) {
  var top = near * Math.tan(fovy * Math.PI / 360), right = top * aspect;
  return mat4.frustum(-right, right, -top, top, near, far, dest);
 });
 mat4.ortho = (function(left, right, bottom, top, near, far, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  var rl = right - left, tb = top - bottom, fn = far - near;
  dest[0] = 2 / rl;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;
  dest[4] = 0;
  dest[5] = 2 / tb;
  dest[6] = 0;
  dest[7] = 0;
  dest[8] = 0;
  dest[9] = 0;
  dest[10] = -2 / fn;
  dest[11] = 0;
  dest[12] = -(left + right) / rl;
  dest[13] = -(top + bottom) / tb;
  dest[14] = -(far + near) / fn;
  dest[15] = 1;
  return dest;
 });
 mat4.lookAt = (function(eye, center, up, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len, eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2], centerx = center[0], centery = center[1], centerz = center[2];
  if (eyex === centerx && eyey === centery && eyez === centerz) {
   return mat4.identity(dest);
  }
  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  if (!len) {
   x0 = 0;
   x1 = 0;
   x2 = 0;
  } else {
   len = 1 / len;
   x0 *= len;
   x1 *= len;
   x2 *= len;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
  if (!len) {
   y0 = 0;
   y1 = 0;
   y2 = 0;
  } else {
   len = 1 / len;
   y0 *= len;
   y1 *= len;
   y2 *= len;
  }
  dest[0] = x0;
  dest[1] = y0;
  dest[2] = z0;
  dest[3] = 0;
  dest[4] = x1;
  dest[5] = y1;
  dest[6] = z1;
  dest[7] = 0;
  dest[8] = x2;
  dest[9] = y2;
  dest[10] = z2;
  dest[11] = 0;
  dest[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  dest[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  dest[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  dest[15] = 1;
  return dest;
 });
 mat4.fromRotationTranslation = (function(quat, vec, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  var x = quat[0], y = quat[1], z = quat[2], w = quat[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
  dest[0] = 1 - (yy + zz);
  dest[1] = xy + wz;
  dest[2] = xz - wy;
  dest[3] = 0;
  dest[4] = xy - wz;
  dest[5] = 1 - (xx + zz);
  dest[6] = yz + wx;
  dest[7] = 0;
  dest[8] = xz + wy;
  dest[9] = yz - wx;
  dest[10] = 1 - (xx + yy);
  dest[11] = 0;
  dest[12] = vec[0];
  dest[13] = vec[1];
  dest[14] = vec[2];
  dest[15] = 1;
  return dest;
 });
 mat4.str = (function(mat) {
  return "[" + mat[0] + ", " + mat[1] + ", " + mat[2] + ", " + mat[3] + ", " + mat[4] + ", " + mat[5] + ", " + mat[6] + ", " + mat[7] + ", " + mat[8] + ", " + mat[9] + ", " + mat[10] + ", " + mat[11] + ", " + mat[12] + ", " + mat[13] + ", " + mat[14] + ", " + mat[15] + "]";
 });
 quat4.create = (function(quat) {
  var dest = new MatrixArray(4);
  if (quat) {
   dest[0] = quat[0];
   dest[1] = quat[1];
   dest[2] = quat[2];
   dest[3] = quat[3];
  }
  return dest;
 });
 quat4.set = (function(quat, dest) {
  dest[0] = quat[0];
  dest[1] = quat[1];
  dest[2] = quat[2];
  dest[3] = quat[3];
  return dest;
 });
 quat4.calculateW = (function(quat, dest) {
  var x = quat[0], y = quat[1], z = quat[2];
  if (!dest || quat === dest) {
   quat[3] = -Math.sqrt(Math.abs(1 - x * x - y * y - z * z));
   return quat;
  }
  dest[0] = x;
  dest[1] = y;
  dest[2] = z;
  dest[3] = -Math.sqrt(Math.abs(1 - x * x - y * y - z * z));
  return dest;
 });
 quat4.dot = (function(quat, quat2) {
  return quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3];
 });
 quat4.inverse = (function(quat, dest) {
  var q0 = quat[0], q1 = quat[1], q2 = quat[2], q3 = quat[3], dot = q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3, invDot = dot ? 1 / dot : 0;
  if (!dest || quat === dest) {
   quat[0] *= -invDot;
   quat[1] *= -invDot;
   quat[2] *= -invDot;
   quat[3] *= invDot;
   return quat;
  }
  dest[0] = -quat[0] * invDot;
  dest[1] = -quat[1] * invDot;
  dest[2] = -quat[2] * invDot;
  dest[3] = quat[3] * invDot;
  return dest;
 });
 quat4.conjugate = (function(quat, dest) {
  if (!dest || quat === dest) {
   quat[0] *= -1;
   quat[1] *= -1;
   quat[2] *= -1;
   return quat;
  }
  dest[0] = -quat[0];
  dest[1] = -quat[1];
  dest[2] = -quat[2];
  dest[3] = quat[3];
  return dest;
 });
 quat4.length = (function(quat) {
  var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
 });
 quat4.normalize = (function(quat, dest) {
  if (!dest) {
   dest = quat;
  }
  var x = quat[0], y = quat[1], z = quat[2], w = quat[3], len = Math.sqrt(x * x + y * y + z * z + w * w);
  if (len === 0) {
   dest[0] = 0;
   dest[1] = 0;
   dest[2] = 0;
   dest[3] = 0;
   return dest;
  }
  len = 1 / len;
  dest[0] = x * len;
  dest[1] = y * len;
  dest[2] = z * len;
  dest[3] = w * len;
  return dest;
 });
 quat4.add = (function(quat, quat2, dest) {
  if (!dest || quat === dest) {
   quat[0] += quat2[0];
   quat[1] += quat2[1];
   quat[2] += quat2[2];
   quat[3] += quat2[3];
   return quat;
  }
  dest[0] = quat[0] + quat2[0];
  dest[1] = quat[1] + quat2[1];
  dest[2] = quat[2] + quat2[2];
  dest[3] = quat[3] + quat2[3];
  return dest;
 });
 quat4.multiply = (function(quat, quat2, dest) {
  if (!dest) {
   dest = quat;
  }
  var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3], qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];
  dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
  dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
  dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
  dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
  return dest;
 });
 quat4.multiplyVec3 = (function(quat, vec, dest) {
  if (!dest) {
   dest = vec;
  }
  var x = vec[0], y = vec[1], z = vec[2], qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3], ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
  dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  return dest;
 });
 quat4.scale = (function(quat, val, dest) {
  if (!dest || quat === dest) {
   quat[0] *= val;
   quat[1] *= val;
   quat[2] *= val;
   quat[3] *= val;
   return quat;
  }
  dest[0] = quat[0] * val;
  dest[1] = quat[1] * val;
  dest[2] = quat[2] * val;
  dest[3] = quat[3] * val;
  return dest;
 });
 quat4.toMat3 = (function(quat, dest) {
  if (!dest) {
   dest = mat3.create();
  }
  var x = quat[0], y = quat[1], z = quat[2], w = quat[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
  dest[0] = 1 - (yy + zz);
  dest[1] = xy + wz;
  dest[2] = xz - wy;
  dest[3] = xy - wz;
  dest[4] = 1 - (xx + zz);
  dest[5] = yz + wx;
  dest[6] = xz + wy;
  dest[7] = yz - wx;
  dest[8] = 1 - (xx + yy);
  return dest;
 });
 quat4.toMat4 = (function(quat, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  var x = quat[0], y = quat[1], z = quat[2], w = quat[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
  dest[0] = 1 - (yy + zz);
  dest[1] = xy + wz;
  dest[2] = xz - wy;
  dest[3] = 0;
  dest[4] = xy - wz;
  dest[5] = 1 - (xx + zz);
  dest[6] = yz + wx;
  dest[7] = 0;
  dest[8] = xz + wy;
  dest[9] = yz - wx;
  dest[10] = 1 - (xx + yy);
  dest[11] = 0;
  dest[12] = 0;
  dest[13] = 0;
  dest[14] = 0;
  dest[15] = 1;
  return dest;
 });
 quat4.slerp = (function(quat, quat2, slerp, dest) {
  if (!dest) {
   dest = quat;
  }
  var cosHalfTheta = quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3], halfTheta, sinHalfTheta, ratioA, ratioB;
  if (Math.abs(cosHalfTheta) >= 1) {
   if (dest !== quat) {
    dest[0] = quat[0];
    dest[1] = quat[1];
    dest[2] = quat[2];
    dest[3] = quat[3];
   }
   return dest;
  }
  halfTheta = Math.acos(cosHalfTheta);
  sinHalfTheta = Math.sqrt(1 - cosHalfTheta * cosHalfTheta);
  if (Math.abs(sinHalfTheta) < .001) {
   dest[0] = quat[0] * .5 + quat2[0] * .5;
   dest[1] = quat[1] * .5 + quat2[1] * .5;
   dest[2] = quat[2] * .5 + quat2[2] * .5;
   dest[3] = quat[3] * .5 + quat2[3] * .5;
   return dest;
  }
  ratioA = Math.sin((1 - slerp) * halfTheta) / sinHalfTheta;
  ratioB = Math.sin(slerp * halfTheta) / sinHalfTheta;
  dest[0] = quat[0] * ratioA + quat2[0] * ratioB;
  dest[1] = quat[1] * ratioA + quat2[1] * ratioB;
  dest[2] = quat[2] * ratioA + quat2[2] * ratioB;
  dest[3] = quat[3] * ratioA + quat2[3] * ratioB;
  return dest;
 });
 quat4.str = (function(quat) {
  return "[" + quat[0] + ", " + quat[1] + ", " + quat[2] + ", " + quat[3] + "]";
 });
 return {
  vec3: vec3,
  mat3: mat3,
  mat4: mat4,
  quat4: quat4
 };
})();
var GLImmediateSetup = {};
function _glEnable(x0) {
 GLctx["enable"](x0);
}
function _glDisable(x0) {
 GLctx["disable"](x0);
}
function _glIsEnabled(x0) {
 return GLctx["isEnabled"](x0);
}
function emscriptenWebGLGet(name_, p, type) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 var ret = undefined;
 switch (name_) {
 case 36346:
  ret = 1;
  break;
 case 36344:
  if (type !== "Integer" && type !== "Integer64") {
   GL.recordError(1280);
  }
  return;
 case 36345:
  ret = 0;
  break;
 case 34466:
  var formats = GLctx.getParameter(34467);
  ret = formats.length;
  break;
 }
 if (ret === undefined) {
  var result = GLctx.getParameter(name_);
  switch (typeof result) {
  case "number":
   ret = result;
   break;
  case "boolean":
   ret = result ? 1 : 0;
   break;
  case "string":
   GL.recordError(1280);
   return;
  case "object":
   if (result === null) {
    switch (name_) {
    case 34964:
    case 35725:
    case 34965:
    case 36006:
    case 36007:
    case 32873:
    case 34068:
     {
      ret = 0;
      break;
     }
    default:
     {
      GL.recordError(1280);
      return;
     }
    }
   } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
    for (var i = 0; i < result.length; ++i) {
     switch (type) {
     case "Integer":
      HEAP32[p + i * 4 >> 2] = result[i];
      break;
     case "Float":
      HEAPF32[p + i * 4 >> 2] = result[i];
      break;
     case "Boolean":
      HEAP8[p + i >> 0] = result[i] ? 1 : 0;
      break;
     default:
      throw "internal glGet error, bad type: " + type;
     }
    }
    return;
   } else if (result instanceof WebGLBuffer || result instanceof WebGLProgram || result instanceof WebGLFramebuffer || result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
    ret = result.name | 0;
   } else {
    GL.recordError(1280);
    return;
   }
   break;
  default:
   GL.recordError(1280);
   return;
  }
 }
 switch (type) {
 case "Integer64":
  tempI64 = [ ret >>> 0, (tempDouble = ret, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], HEAP32[p >> 2] = tempI64[0], HEAP32[p + 4 >> 2] = tempI64[1];
  break;
 case "Integer":
  HEAP32[p >> 2] = ret;
  break;
 case "Float":
  HEAPF32[p >> 2] = ret;
  break;
 case "Boolean":
  HEAP8[p >> 0] = ret ? 1 : 0;
  break;
 default:
  throw "internal glGet error, bad type: " + type;
 }
}
function _glGetBooleanv(name_, p) {
 emscriptenWebGLGet(name_, p, "Boolean");
}
function _glGetIntegerv(name_, p) {
 emscriptenWebGLGet(name_, p, "Integer");
}
function _glGetString(name_) {
 if (GL.stringCache[name_]) return GL.stringCache[name_];
 var ret;
 switch (name_) {
 case 7936:
 case 7937:
 case 37445:
 case 37446:
  ret = allocate(intArrayFromString(GLctx.getParameter(name_)), "i8", ALLOC_NORMAL);
  break;
 case 7938:
  var glVersion = GLctx.getParameter(GLctx.VERSION);
  {
   glVersion = "OpenGL ES 2.0 (" + glVersion + ")";
  }
  ret = allocate(intArrayFromString(glVersion), "i8", ALLOC_NORMAL);
  break;
 case 7939:
  var exts = GLctx.getSupportedExtensions();
  var gl_exts = [];
  for (var i = 0; i < exts.length; ++i) {
   gl_exts.push(exts[i]);
   gl_exts.push("GL_" + exts[i]);
  }
  ret = allocate(intArrayFromString(gl_exts.join(" ")), "i8", ALLOC_NORMAL);
  break;
 case 35724:
  var glslVersion = GLctx.getParameter(GLctx.SHADING_LANGUAGE_VERSION);
  var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
  var ver_num = glslVersion.match(ver_re);
  if (ver_num !== null) {
   if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
   glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")";
  }
  ret = allocate(intArrayFromString(glslVersion), "i8", ALLOC_NORMAL);
  break;
 default:
  GL.recordError(1280);
  return 0;
 }
 GL.stringCache[name_] = ret;
 return ret;
}
function _glCreateShader(shaderType) {
 var id = GL.getNewId(GL.shaders);
 GL.shaders[id] = GLctx.createShader(shaderType);
 return id;
}
function _glShaderSource(shader, count, string, length) {
 var source = GL.getSource(shader, count, string, length);
 GLctx.shaderSource(GL.shaders[shader], source);
}
function _glCompileShader(shader) {
 GLctx.compileShader(GL.shaders[shader]);
}
function _glAttachShader(program, shader) {
 GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
}
function _glDetachShader(program, shader) {
 GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
}
function _glUseProgram(program) {
 GLctx.useProgram(program ? GL.programs[program] : null);
}
function _glDeleteProgram(id) {
 if (!id) return;
 var program = GL.programs[id];
 if (!program) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteProgram(program);
 program.name = 0;
 GL.programs[id] = null;
 GL.programInfos[id] = null;
}
function _glBindAttribLocation(program, index, name) {
 name = Pointer_stringify(name);
 GLctx.bindAttribLocation(GL.programs[program], index, name);
}
function _glLinkProgram(program) {
 GLctx.linkProgram(GL.programs[program]);
 GL.programInfos[program] = null;
 GL.populateUniformTable(program);
}
function _glBindBuffer(target, buffer) {
 var bufferObj = buffer ? GL.buffers[buffer] : null;
 if (target == GLctx.ARRAY_BUFFER) {
  GL.currArrayBuffer = buffer;
  GLImmediate.lastArrayBuffer = buffer;
 } else if (target == GLctx.ELEMENT_ARRAY_BUFFER) {
  GL.currElementArrayBuffer = buffer;
 }
 GLctx.bindBuffer(target, bufferObj);
}
function _glGetFloatv(name_, p) {
 emscriptenWebGLGet(name_, p, "Float");
}
function _glEnableVertexAttribArray(index) {
 GLctx.enableVertexAttribArray(index);
}
function _glDisableVertexAttribArray(index) {
 GLctx.disableVertexAttribArray(index);
}
function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
 GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
}
function _glActiveTexture(x0) {
 GLctx["activeTexture"](x0);
}
var GLEmulation = {
 fogStart: 0,
 fogEnd: 1,
 fogDensity: 1,
 fogColor: null,
 fogMode: 2048,
 fogEnabled: false,
 vaos: [],
 currentVao: null,
 enabledVertexAttribArrays: {},
 hasRunInit: false,
 init: (function() {
  if (GLEmulation.hasRunInit) {
   return;
  }
  GLEmulation.hasRunInit = true;
  GLEmulation.fogColor = new Float32Array(4);
  Module.printErr("WARNING: using emscripten GL emulation. This is a collection of limited workarounds, do not expect it to work.");
  Module.printErr("WARNING: using emscripten GL emulation unsafe opts. If weirdness happens, try -s GL_UNSAFE_OPTS=0");
  var validCapabilities = {
   2884: 1,
   3042: 1,
   3024: 1,
   2960: 1,
   2929: 1,
   3089: 1,
   32823: 1,
   32926: 1,
   32928: 1
  };
  var glEnable = _glEnable;
  _glEnable = _emscripten_glEnable = function _glEnable(cap) {
   if (GLImmediate.lastRenderer) GLImmediate.lastRenderer.cleanup();
   if (cap == 2912) {
    if (GLEmulation.fogEnabled != true) {
     GLImmediate.currentRenderer = null;
     GLEmulation.fogEnabled = true;
    }
    return;
   } else if (cap == 3553) {
    return;
   } else if (!(cap in validCapabilities)) {
    return;
   }
   glEnable(cap);
  };
  var glDisable = _glDisable;
  _glDisable = _emscripten_glDisable = function _glDisable(cap) {
   if (GLImmediate.lastRenderer) GLImmediate.lastRenderer.cleanup();
   if (cap == 2912) {
    if (GLEmulation.fogEnabled != false) {
     GLImmediate.currentRenderer = null;
     GLEmulation.fogEnabled = false;
    }
    return;
   } else if (cap == 3553) {
    return;
   } else if (!(cap in validCapabilities)) {
    return;
   }
   glDisable(cap);
  };
  _glIsEnabled = _emscripten_glIsEnabled = function _glIsEnabled(cap) {
   if (cap == 2912) {
    return GLEmulation.fogEnabled ? 1 : 0;
   } else if (!(cap in validCapabilities)) {
    return 0;
   }
   return GLctx.isEnabled(cap);
  };
  var glGetBooleanv = _glGetBooleanv;
  _glGetBooleanv = _emscripten_glGetBooleanv = function _glGetBooleanv(pname, p) {
   var attrib = GLEmulation.getAttributeFromCapability(pname);
   if (attrib !== null) {
    var result = GLImmediate.enabledClientAttributes[attrib];
    HEAP8[p >> 0] = result === true ? 1 : 0;
    return;
   }
   glGetBooleanv(pname, p);
  };
  var glGetIntegerv = _glGetIntegerv;
  _glGetIntegerv = _emscripten_glGetIntegerv = function _glGetIntegerv(pname, params) {
   switch (pname) {
   case 34018:
    pname = GLctx.MAX_TEXTURE_IMAGE_UNITS;
    break;
   case 35658:
    {
     var result = GLctx.getParameter(GLctx.MAX_VERTEX_UNIFORM_VECTORS);
     HEAP32[params >> 2] = result * 4;
     return;
    }
   case 35657:
    {
     var result = GLctx.getParameter(GLctx.MAX_FRAGMENT_UNIFORM_VECTORS);
     HEAP32[params >> 2] = result * 4;
     return;
    }
   case 35659:
    {
     var result = GLctx.getParameter(GLctx.MAX_VARYING_VECTORS);
     HEAP32[params >> 2] = result * 4;
     return;
    }
   case 34929:
    pname = GLctx.MAX_COMBINED_TEXTURE_IMAGE_UNITS;
    break;
   case 32890:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
     HEAP32[params >> 2] = attribute ? attribute.size : 0;
     return;
    }
   case 32891:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
     HEAP32[params >> 2] = attribute ? attribute.type : 0;
     return;
    }
   case 32892:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
     HEAP32[params >> 2] = attribute ? attribute.stride : 0;
     return;
    }
   case 32897:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
     HEAP32[params >> 2] = attribute ? attribute.size : 0;
     return;
    }
   case 32898:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
     HEAP32[params >> 2] = attribute ? attribute.type : 0;
     return;
    }
   case 32899:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
     HEAP32[params >> 2] = attribute ? attribute.stride : 0;
     return;
    }
   case 32904:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
     HEAP32[params >> 2] = attribute ? attribute.size : 0;
     return;
    }
   case 32905:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
     HEAP32[params >> 2] = attribute ? attribute.type : 0;
     return;
    }
   case 32906:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
     HEAP32[params >> 2] = attribute ? attribute.stride : 0;
     return;
    }
   }
   glGetIntegerv(pname, params);
  };
  var glGetString = _glGetString;
  _glGetString = _emscripten_glGetString = function _glGetString(name_) {
   if (GL.stringCache[name_]) return GL.stringCache[name_];
   switch (name_) {
   case 7939:
    var ret = allocate(intArrayFromString(GLctx.getSupportedExtensions().join(" ") + " GL_EXT_texture_env_combine GL_ARB_texture_env_crossbar GL_ATI_texture_env_combine3 GL_NV_texture_env_combine4 GL_EXT_texture_env_dot3 GL_ARB_multitexture GL_ARB_vertex_buffer_object GL_EXT_framebuffer_object GL_ARB_vertex_program GL_ARB_fragment_program GL_ARB_shading_language_100 GL_ARB_shader_objects GL_ARB_vertex_shader GL_ARB_fragment_shader GL_ARB_texture_cube_map GL_EXT_draw_range_elements" + (GL.currentContext.compressionExt ? " GL_ARB_texture_compression GL_EXT_texture_compression_s3tc" : "") + (GL.currentContext.anisotropicExt ? " GL_EXT_texture_filter_anisotropic" : "")), "i8", ALLOC_NORMAL);
    GL.stringCache[name_] = ret;
    return ret;
   }
   return glGetString(name_);
  };
  GL.shaderInfos = {};
  var glCreateShader = _glCreateShader;
  _glCreateShader = _emscripten_glCreateShader = function _glCreateShader(shaderType) {
   var id = glCreateShader(shaderType);
   GL.shaderInfos[id] = {
    type: shaderType,
    ftransform: false
   };
   return id;
  };
  function ensurePrecision(source) {
   if (!/precision +(low|medium|high)p +float *;/.test(source)) {
    source = "precision mediump float;\n" + source;
   }
   return source;
  }
  _glShaderSource = _emscripten_glShaderSource = function _glShaderSource(shader, count, string, length) {
   var source = GL.getSource(shader, count, string, length);
   if (GL.shaderInfos[shader].type == GLctx.VERTEX_SHADER) {
    var has_pm = source.search(/u_projection/) >= 0;
    var has_mm = source.search(/u_modelView/) >= 0;
    var has_pv = source.search(/a_position/) >= 0;
    var need_pm = 0, need_mm = 0, need_pv = 0;
    var old = source;
    source = source.replace(/ftransform\(\)/g, "(u_projection * u_modelView * a_position)");
    if (old != source) need_pm = need_mm = need_pv = 1;
    old = source;
    source = source.replace(/gl_ProjectionMatrix/g, "u_projection");
    if (old != source) need_pm = 1;
    old = source;
    source = source.replace(/gl_ModelViewMatrixTranspose\[2\]/g, "vec4(u_modelView[0][2], u_modelView[1][2], u_modelView[2][2], u_modelView[3][2])");
    if (old != source) need_mm = 1;
    old = source;
    source = source.replace(/gl_ModelViewMatrix/g, "u_modelView");
    if (old != source) need_mm = 1;
    old = source;
    source = source.replace(/gl_Vertex/g, "a_position");
    if (old != source) need_pv = 1;
    old = source;
    source = source.replace(/gl_ModelViewProjectionMatrix/g, "(u_projection * u_modelView)");
    if (old != source) need_pm = need_mm = 1;
    if (need_pv && !has_pv) source = "attribute vec4 a_position; \n" + source;
    if (need_mm && !has_mm) source = "uniform mat4 u_modelView; \n" + source;
    if (need_pm && !has_pm) source = "uniform mat4 u_projection; \n" + source;
    GL.shaderInfos[shader].ftransform = need_pm || need_mm || need_pv;
    for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
     var old = source;
     var need_vtc = source.search("v_texCoord" + i) == -1;
     source = source.replace(new RegExp("gl_TexCoord\\[" + i + "\\]", "g"), "v_texCoord" + i).replace(new RegExp("gl_MultiTexCoord" + i, "g"), "a_texCoord" + i);
     if (source != old) {
      source = "attribute vec4 a_texCoord" + i + "; \n" + source;
      if (need_vtc) {
       source = "varying vec4 v_texCoord" + i + ";   \n" + source;
      }
     }
     old = source;
     source = source.replace(new RegExp("gl_TextureMatrix\\[" + i + "\\]", "g"), "u_textureMatrix" + i);
     if (source != old) {
      source = "uniform mat4 u_textureMatrix" + i + "; \n" + source;
     }
    }
    if (source.indexOf("gl_FrontColor") >= 0) {
     source = "varying vec4 v_color; \n" + source.replace(/gl_FrontColor/g, "v_color");
    }
    if (source.indexOf("gl_Color") >= 0) {
     source = "attribute vec4 a_color; \n" + source.replace(/gl_Color/g, "a_color");
    }
    if (source.indexOf("gl_Normal") >= 0) {
     source = "attribute vec3 a_normal; \n" + source.replace(/gl_Normal/g, "a_normal");
    }
    if (source.indexOf("gl_FogFragCoord") >= 0) {
     source = "varying float v_fogFragCoord;   \n" + source.replace(/gl_FogFragCoord/g, "v_fogFragCoord");
    }
    source = ensurePrecision(source);
   } else {
    for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
     var old = source;
     source = source.replace(new RegExp("gl_TexCoord\\[" + i + "\\]", "g"), "v_texCoord" + i);
     if (source != old) {
      source = "varying vec4 v_texCoord" + i + ";   \n" + source;
     }
    }
    if (source.indexOf("gl_Color") >= 0) {
     source = "varying vec4 v_color; \n" + source.replace(/gl_Color/g, "v_color");
    }
    if (source.indexOf("gl_Fog.color") >= 0) {
     source = "uniform vec4 u_fogColor;   \n" + source.replace(/gl_Fog.color/g, "u_fogColor");
    }
    if (source.indexOf("gl_Fog.end") >= 0) {
     source = "uniform float u_fogEnd;   \n" + source.replace(/gl_Fog.end/g, "u_fogEnd");
    }
    if (source.indexOf("gl_Fog.scale") >= 0) {
     source = "uniform float u_fogScale;   \n" + source.replace(/gl_Fog.scale/g, "u_fogScale");
    }
    if (source.indexOf("gl_Fog.density") >= 0) {
     source = "uniform float u_fogDensity;   \n" + source.replace(/gl_Fog.density/g, "u_fogDensity");
    }
    if (source.indexOf("gl_FogFragCoord") >= 0) {
     source = "varying float v_fogFragCoord;   \n" + source.replace(/gl_FogFragCoord/g, "v_fogFragCoord");
    }
    source = ensurePrecision(source);
   }
   GLctx.shaderSource(GL.shaders[shader], source);
  };
  _glCompileShader = _emscripten_glCompileShader = function _glCompileShader(shader) {
   GLctx.compileShader(GL.shaders[shader]);
  };
  GL.programShaders = {};
  var glAttachShader = _glAttachShader;
  _glAttachShader = _emscripten_glAttachShader = function _glAttachShader(program, shader) {
   if (!GL.programShaders[program]) GL.programShaders[program] = [];
   GL.programShaders[program].push(shader);
   glAttachShader(program, shader);
  };
  var glDetachShader = _glDetachShader;
  _glDetachShader = _emscripten_glDetachShader = function _glDetachShader(program, shader) {
   var programShader = GL.programShaders[program];
   if (!programShader) {
    Module.printErr("WARNING: _glDetachShader received invalid program: " + program);
    return;
   }
   var index = programShader.indexOf(shader);
   programShader.splice(index, 1);
   glDetachShader(program, shader);
  };
  var glUseProgram = _glUseProgram;
  _glUseProgram = _emscripten_glUseProgram = function _glUseProgram(program) {
   if (GL.currProgram != program) {
    GLImmediate.currentRenderer = null;
    GL.currProgram = program;
    GLImmediate.fixedFunctionProgram = 0;
    glUseProgram(program);
   }
  };
  var glDeleteProgram = _glDeleteProgram;
  _glDeleteProgram = _emscripten_glDeleteProgram = function _glDeleteProgram(program) {
   glDeleteProgram(program);
   if (program == GL.currProgram) {
    GLImmediate.currentRenderer = null;
    GL.currProgram = 0;
   }
  };
  var zeroUsedPrograms = {};
  var glBindAttribLocation = _glBindAttribLocation;
  _glBindAttribLocation = _emscripten_glBindAttribLocation = function _glBindAttribLocation(program, index, name) {
   if (index == 0) zeroUsedPrograms[program] = true;
   glBindAttribLocation(program, index, name);
  };
  var glLinkProgram = _glLinkProgram;
  _glLinkProgram = _emscripten_glLinkProgram = function _glLinkProgram(program) {
   if (!(program in zeroUsedPrograms)) {
    GLctx.bindAttribLocation(GL.programs[program], 0, "a_position");
   }
   glLinkProgram(program);
  };
  var glBindBuffer = _glBindBuffer;
  _glBindBuffer = _emscripten_glBindBuffer = function _glBindBuffer(target, buffer) {
   glBindBuffer(target, buffer);
   if (target == GLctx.ARRAY_BUFFER) {
    if (GLEmulation.currentVao) {
     GLEmulation.currentVao.arrayBuffer = buffer;
    }
   } else if (target == GLctx.ELEMENT_ARRAY_BUFFER) {
    if (GLEmulation.currentVao) GLEmulation.currentVao.elementArrayBuffer = buffer;
   }
  };
  var glGetFloatv = _glGetFloatv;
  _glGetFloatv = _emscripten_glGetFloatv = function _glGetFloatv(pname, params) {
   if (pname == 2982) {
    HEAPF32.set(GLImmediate.matrix[0], params >> 2);
   } else if (pname == 2983) {
    HEAPF32.set(GLImmediate.matrix[1], params >> 2);
   } else if (pname == 2984) {
    HEAPF32.set(GLImmediate.matrix[2 + GLImmediate.clientActiveTexture], params >> 2);
   } else if (pname == 2918) {
    HEAPF32.set(GLEmulation.fogColor, params >> 2);
   } else if (pname == 2915) {
    HEAPF32[params >> 2] = GLEmulation.fogStart;
   } else if (pname == 2916) {
    HEAPF32[params >> 2] = GLEmulation.fogEnd;
   } else if (pname == 2914) {
    HEAPF32[params >> 2] = GLEmulation.fogDensity;
   } else if (pname == 2917) {
    HEAPF32[params >> 2] = GLEmulation.fogMode;
   } else {
    glGetFloatv(pname, params);
   }
  };
  var glHint = _glHint;
  _glHint = _emscripten_glHint = function _glHint(target, mode) {
   if (target == 34031) {
    return;
   }
   glHint(target, mode);
  };
  var glEnableVertexAttribArray = _glEnableVertexAttribArray;
  _glEnableVertexAttribArray = _emscripten_glEnableVertexAttribArray = function _glEnableVertexAttribArray(index) {
   glEnableVertexAttribArray(index);
   GLEmulation.enabledVertexAttribArrays[index] = 1;
   if (GLEmulation.currentVao) GLEmulation.currentVao.enabledVertexAttribArrays[index] = 1;
  };
  var glDisableVertexAttribArray = _glDisableVertexAttribArray;
  _glDisableVertexAttribArray = _emscripten_glDisableVertexAttribArray = function _glDisableVertexAttribArray(index) {
   glDisableVertexAttribArray(index);
   delete GLEmulation.enabledVertexAttribArrays[index];
   if (GLEmulation.currentVao) delete GLEmulation.currentVao.enabledVertexAttribArrays[index];
  };
  var glVertexAttribPointer = _glVertexAttribPointer;
  _glVertexAttribPointer = _emscripten_glVertexAttribPointer = function _glVertexAttribPointer(index, size, type, normalized, stride, pointer) {
   glVertexAttribPointer(index, size, type, normalized, stride, pointer);
   if (GLEmulation.currentVao) {
    GLEmulation.currentVao.vertexAttribPointers[index] = [ index, size, type, normalized, stride, pointer ];
   }
  };
 }),
 getAttributeFromCapability: (function(cap) {
  var attrib = null;
  switch (cap) {
  case 3553:
  case 32888:
   attrib = GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture;
   break;
  case 32884:
   attrib = GLImmediate.VERTEX;
   break;
  case 32885:
   attrib = GLImmediate.NORMAL;
   break;
  case 32886:
   attrib = GLImmediate.COLOR;
   break;
  }
  return attrib;
 })
};
function _emscripten_glVertexPointer(size, type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.VERTEX, size, type, stride, pointer);
}
function _emscripten_glUniform3iv(location, count, value) {
 GLctx.uniform3iv(GL.uniforms[location], HEAP32.subarray(value >> 2, value + count * 12 >> 2));
}
function _emscripten_glShaderSource(shader, count, string, length) {
 var source = GL.getSource(shader, count, string, length);
 GLctx.shaderSource(GL.shaders[shader], source);
}
function _realloc() {
 throw "bad";
}
Module["_realloc"] = _realloc;
Module["_saveSetjmp"] = _saveSetjmp;
function _emscripten_glReleaseShaderCompiler() {}
function _emscripten_glIsTexture(texture) {
 var texture = GL.textures[texture];
 if (!texture) return 0;
 return GLctx.isTexture(texture);
}
function _emscripten_glTexParameterf(x0, x1, x2) {
 GLctx["texParameterf"](x0, x1, x2);
}
var DLFCN = {
 error: null,
 errorMsg: null,
 loadedLibs: {},
 loadedLibNames: {}
};
function _dlerror() {
 if (DLFCN.errorMsg === null) {
  return 0;
 } else {
  if (DLFCN.error) _free(DLFCN.error);
  var msgArr = intArrayFromString(DLFCN.errorMsg);
  DLFCN.error = allocate(msgArr, "i8", ALLOC_NORMAL);
  DLFCN.errorMsg = null;
  return DLFCN.error;
 }
}
function _eglWaitGL() {
 return _eglWaitClient.apply(null, arguments);
}
var ERRNO_CODES = {
 EPERM: 1,
 ENOENT: 2,
 ESRCH: 3,
 EINTR: 4,
 EIO: 5,
 ENXIO: 6,
 E2BIG: 7,
 ENOEXEC: 8,
 EBADF: 9,
 ECHILD: 10,
 EAGAIN: 11,
 EWOULDBLOCK: 11,
 ENOMEM: 12,
 EACCES: 13,
 EFAULT: 14,
 ENOTBLK: 15,
 EBUSY: 16,
 EEXIST: 17,
 EXDEV: 18,
 ENODEV: 19,
 ENOTDIR: 20,
 EISDIR: 21,
 EINVAL: 22,
 ENFILE: 23,
 EMFILE: 24,
 ENOTTY: 25,
 ETXTBSY: 26,
 EFBIG: 27,
 ENOSPC: 28,
 ESPIPE: 29,
 EROFS: 30,
 EMLINK: 31,
 EPIPE: 32,
 EDOM: 33,
 ERANGE: 34,
 ENOMSG: 42,
 EIDRM: 43,
 ECHRNG: 44,
 EL2NSYNC: 45,
 EL3HLT: 46,
 EL3RST: 47,
 ELNRNG: 48,
 EUNATCH: 49,
 ENOCSI: 50,
 EL2HLT: 51,
 EDEADLK: 35,
 ENOLCK: 37,
 EBADE: 52,
 EBADR: 53,
 EXFULL: 54,
 ENOANO: 55,
 EBADRQC: 56,
 EBADSLT: 57,
 EDEADLOCK: 35,
 EBFONT: 59,
 ENOSTR: 60,
 ENODATA: 61,
 ETIME: 62,
 ENOSR: 63,
 ENONET: 64,
 ENOPKG: 65,
 EREMOTE: 66,
 ENOLINK: 67,
 EADV: 68,
 ESRMNT: 69,
 ECOMM: 70,
 EPROTO: 71,
 EMULTIHOP: 72,
 EDOTDOT: 73,
 EBADMSG: 74,
 ENOTUNIQ: 76,
 EBADFD: 77,
 EREMCHG: 78,
 ELIBACC: 79,
 ELIBBAD: 80,
 ELIBSCN: 81,
 ELIBMAX: 82,
 ELIBEXEC: 83,
 ENOSYS: 38,
 ENOTEMPTY: 39,
 ENAMETOOLONG: 36,
 ELOOP: 40,
 EOPNOTSUPP: 95,
 EPFNOSUPPORT: 96,
 ECONNRESET: 104,
 ENOBUFS: 105,
 EAFNOSUPPORT: 97,
 EPROTOTYPE: 91,
 ENOTSOCK: 88,
 ENOPROTOOPT: 92,
 ESHUTDOWN: 108,
 ECONNREFUSED: 111,
 EADDRINUSE: 98,
 ECONNABORTED: 103,
 ENETUNREACH: 101,
 ENETDOWN: 100,
 ETIMEDOUT: 110,
 EHOSTDOWN: 112,
 EHOSTUNREACH: 113,
 EINPROGRESS: 115,
 EALREADY: 114,
 EDESTADDRREQ: 89,
 EMSGSIZE: 90,
 EPROTONOSUPPORT: 93,
 ESOCKTNOSUPPORT: 94,
 EADDRNOTAVAIL: 99,
 ENETRESET: 102,
 EISCONN: 106,
 ENOTCONN: 107,
 ETOOMANYREFS: 109,
 EUSERS: 87,
 EDQUOT: 122,
 ESTALE: 116,
 ENOTSUP: 95,
 ENOMEDIUM: 123,
 EILSEQ: 84,
 EOVERFLOW: 75,
 ECANCELED: 125,
 ENOTRECOVERABLE: 131,
 EOWNERDEAD: 130,
 ESTRPIPE: 86
};
var ERRNO_MESSAGES = {
 0: "Success",
 1: "Not super-user",
 2: "No such file or directory",
 3: "No such process",
 4: "Interrupted system call",
 5: "I/O error",
 6: "No such device or address",
 7: "Arg list too long",
 8: "Exec format error",
 9: "Bad file number",
 10: "No children",
 11: "No more processes",
 12: "Not enough core",
 13: "Permission denied",
 14: "Bad address",
 15: "Block device required",
 16: "Mount device busy",
 17: "File exists",
 18: "Cross-device link",
 19: "No such device",
 20: "Not a directory",
 21: "Is a directory",
 22: "Invalid argument",
 23: "Too many open files in system",
 24: "Too many open files",
 25: "Not a typewriter",
 26: "Text file busy",
 27: "File too large",
 28: "No space left on device",
 29: "Illegal seek",
 30: "Read only file system",
 31: "Too many links",
 32: "Broken pipe",
 33: "Math arg out of domain of func",
 34: "Math result not representable",
 35: "File locking deadlock error",
 36: "File or path name too long",
 37: "No record locks available",
 38: "Function not implemented",
 39: "Directory not empty",
 40: "Too many symbolic links",
 42: "No message of desired type",
 43: "Identifier removed",
 44: "Channel number out of range",
 45: "Level 2 not synchronized",
 46: "Level 3 halted",
 47: "Level 3 reset",
 48: "Link number out of range",
 49: "Protocol driver not attached",
 50: "No CSI structure available",
 51: "Level 2 halted",
 52: "Invalid exchange",
 53: "Invalid request descriptor",
 54: "Exchange full",
 55: "No anode",
 56: "Invalid request code",
 57: "Invalid slot",
 59: "Bad font file fmt",
 60: "Device not a stream",
 61: "No data (for no delay io)",
 62: "Timer expired",
 63: "Out of streams resources",
 64: "Machine is not on the network",
 65: "Package not installed",
 66: "The object is remote",
 67: "The link has been severed",
 68: "Advertise error",
 69: "Srmount error",
 70: "Communication error on send",
 71: "Protocol error",
 72: "Multihop attempted",
 73: "Cross mount point (not really error)",
 74: "Trying to read unreadable message",
 75: "Value too large for defined data type",
 76: "Given log. name not unique",
 77: "f.d. invalid for this operation",
 78: "Remote address changed",
 79: "Can   access a needed shared lib",
 80: "Accessing a corrupted shared lib",
 81: ".lib section in a.out corrupted",
 82: "Attempting to link in too many libs",
 83: "Attempting to exec a shared library",
 84: "Illegal byte sequence",
 86: "Streams pipe error",
 87: "Too many users",
 88: "Socket operation on non-socket",
 89: "Destination address required",
 90: "Message too long",
 91: "Protocol wrong type for socket",
 92: "Protocol not available",
 93: "Unknown protocol",
 94: "Socket type not supported",
 95: "Not supported",
 96: "Protocol family not supported",
 97: "Address family not supported by protocol family",
 98: "Address already in use",
 99: "Address not available",
 100: "Network interface is not configured",
 101: "Network is unreachable",
 102: "Connection reset by network",
 103: "Connection aborted",
 104: "Connection reset by peer",
 105: "No buffer space available",
 106: "Socket is already connected",
 107: "Socket is not connected",
 108: "Can't send after socket shutdown",
 109: "Too many references",
 110: "Connection timed out",
 111: "Connection refused",
 112: "Host is down",
 113: "Host is unreachable",
 114: "Socket already connected",
 115: "Connection already in progress",
 116: "Stale file handle",
 122: "Quota exceeded",
 123: "No medium (in tape drive)",
 125: "Operation canceled",
 130: "Previous owner died",
 131: "State not recoverable"
};
function ___setErrNo(value) {
 if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value;
 return value;
}
var PATH = {
 splitPath: (function(filename) {
  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  return splitPathRe.exec(filename).slice(1);
 }),
 normalizeArray: (function(parts, allowAboveRoot) {
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
   var last = parts[i];
   if (last === ".") {
    parts.splice(i, 1);
   } else if (last === "..") {
    parts.splice(i, 1);
    up++;
   } else if (up) {
    parts.splice(i, 1);
    up--;
   }
  }
  if (allowAboveRoot) {
   for (; up--; up) {
    parts.unshift("..");
   }
  }
  return parts;
 }),
 normalize: (function(path) {
  var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
  path = PATH.normalizeArray(path.split("/").filter((function(p) {
   return !!p;
  })), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
   path = ".";
  }
  if (path && trailingSlash) {
   path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
 }),
 dirname: (function(path) {
  var result = PATH.splitPath(path), root = result[0], dir = result[1];
  if (!root && !dir) {
   return ".";
  }
  if (dir) {
   dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
 }),
 basename: (function(path) {
  if (path === "/") return "/";
  var lastSlash = path.lastIndexOf("/");
  if (lastSlash === -1) return path;
  return path.substr(lastSlash + 1);
 }),
 extname: (function(path) {
  return PATH.splitPath(path)[3];
 }),
 join: (function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return PATH.normalize(paths.join("/"));
 }),
 join2: (function(l, r) {
  return PATH.normalize(l + "/" + r);
 }),
 resolve: (function() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
   var path = i >= 0 ? arguments[i] : FS.cwd();
   if (typeof path !== "string") {
    throw new TypeError("Arguments to path.resolve must be strings");
   } else if (!path) {
    return "";
   }
   resolvedPath = path + "/" + resolvedPath;
   resolvedAbsolute = path.charAt(0) === "/";
  }
  resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter((function(p) {
   return !!p;
  })), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
 }),
 relative: (function(from, to) {
  from = PATH.resolve(from).substr(1);
  to = PATH.resolve(to).substr(1);
  function trim(arr) {
   var start = 0;
   for (; start < arr.length; start++) {
    if (arr[start] !== "") break;
   }
   var end = arr.length - 1;
   for (; end >= 0; end--) {
    if (arr[end] !== "") break;
   }
   if (start > end) return [];
   return arr.slice(start, end - start + 1);
  }
  var fromParts = trim(from.split("/"));
  var toParts = trim(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
   if (fromParts[i] !== toParts[i]) {
    samePartsLength = i;
    break;
   }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
   outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
 })
};
var TTY = {
 ttys: [],
 init: (function() {}),
 shutdown: (function() {}),
 register: (function(dev, ops) {
  TTY.ttys[dev] = {
   input: [],
   output: [],
   ops: ops
  };
  FS.registerDevice(dev, TTY.stream_ops);
 }),
 stream_ops: {
  open: (function(stream) {
   var tty = TTY.ttys[stream.node.rdev];
   if (!tty) {
    throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
   }
   stream.tty = tty;
   stream.seekable = false;
  }),
  close: (function(stream) {
   stream.tty.ops.flush(stream.tty);
  }),
  flush: (function(stream) {
   stream.tty.ops.flush(stream.tty);
  }),
  read: (function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.get_char) {
    throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
   }
   var bytesRead = 0;
   for (var i = 0; i < length; i++) {
    var result;
    try {
     result = stream.tty.ops.get_char(stream.tty);
    } catch (e) {
     throw new FS.ErrnoError(ERRNO_CODES.EIO);
    }
    if (result === undefined && bytesRead === 0) {
     throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
    }
    if (result === null || result === undefined) break;
    bytesRead++;
    buffer[offset + i] = result;
   }
   if (bytesRead) {
    stream.node.timestamp = Date.now();
   }
   return bytesRead;
  }),
  write: (function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.put_char) {
    throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
   }
   for (var i = 0; i < length; i++) {
    try {
     stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
    } catch (e) {
     throw new FS.ErrnoError(ERRNO_CODES.EIO);
    }
   }
   if (length) {
    stream.node.timestamp = Date.now();
   }
   return i;
  })
 },
 default_tty_ops: {
  get_char: (function(tty) {
   if (!tty.input.length) {
    var result = null;
    if (ENVIRONMENT_IS_NODE) {
     var BUFSIZE = 256;
     var buf = new Buffer(BUFSIZE);
     var bytesRead = 0;
     var isPosixPlatform = process.platform != "win32";
     var fd = process.stdin.fd;
     if (isPosixPlatform) {
      var usingDevice = false;
      try {
       fd = fs.openSync("/dev/stdin", "r");
       usingDevice = true;
      } catch (e) {}
     }
     try {
      bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
     } catch (e) {
      if (e.toString().indexOf("EOF") != -1) bytesRead = 0; else throw e;
     }
     if (usingDevice) {
      fs.closeSync(fd);
     }
     if (bytesRead > 0) {
      result = buf.slice(0, bytesRead).toString("utf-8");
     } else {
      result = null;
     }
    } else if (typeof window != "undefined" && typeof window.prompt == "function") {
     result = window.prompt("Input: ");
     if (result !== null) {
      result += "\n";
     }
    } else if (typeof readline == "function") {
     result = readline();
     if (result !== null) {
      result += "\n";
     }
    }
    if (!result) {
     return null;
    }
    tty.input = intArrayFromString(result, true);
   }
   return tty.input.shift();
  }),
  put_char: (function(tty, val) {
   if (val === null || val === 10) {
    Module["print"](UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  }),
  flush: (function(tty) {
   if (tty.output && tty.output.length > 0) {
    Module["print"](UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  })
 },
 default_tty1_ops: {
  put_char: (function(tty, val) {
   if (val === null || val === 10) {
    Module["printErr"](UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  }),
  flush: (function(tty) {
   if (tty.output && tty.output.length > 0) {
    Module["printErr"](UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  })
 }
};
var MEMFS = {
 ops_table: null,
 mount: (function(mount) {
  return MEMFS.createNode(null, "/", 16384 | 511, 0);
 }),
 createNode: (function(parent, name, mode, dev) {
  if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (!MEMFS.ops_table) {
   MEMFS.ops_table = {
    dir: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      lookup: MEMFS.node_ops.lookup,
      mknod: MEMFS.node_ops.mknod,
      rename: MEMFS.node_ops.rename,
      unlink: MEMFS.node_ops.unlink,
      rmdir: MEMFS.node_ops.rmdir,
      readdir: MEMFS.node_ops.readdir,
      symlink: MEMFS.node_ops.symlink
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek
     }
    },
    file: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek,
      read: MEMFS.stream_ops.read,
      write: MEMFS.stream_ops.write,
      allocate: MEMFS.stream_ops.allocate,
      mmap: MEMFS.stream_ops.mmap,
      msync: MEMFS.stream_ops.msync
     }
    },
    link: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      readlink: MEMFS.node_ops.readlink
     },
     stream: {}
    },
    chrdev: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: FS.chrdev_stream_ops
    }
   };
  }
  var node = FS.createNode(parent, name, mode, dev);
  if (FS.isDir(node.mode)) {
   node.node_ops = MEMFS.ops_table.dir.node;
   node.stream_ops = MEMFS.ops_table.dir.stream;
   node.contents = {};
  } else if (FS.isFile(node.mode)) {
   node.node_ops = MEMFS.ops_table.file.node;
   node.stream_ops = MEMFS.ops_table.file.stream;
   node.usedBytes = 0;
   node.contents = null;
  } else if (FS.isLink(node.mode)) {
   node.node_ops = MEMFS.ops_table.link.node;
   node.stream_ops = MEMFS.ops_table.link.stream;
  } else if (FS.isChrdev(node.mode)) {
   node.node_ops = MEMFS.ops_table.chrdev.node;
   node.stream_ops = MEMFS.ops_table.chrdev.stream;
  }
  node.timestamp = Date.now();
  if (parent) {
   parent.contents[name] = node;
  }
  return node;
 }),
 getFileDataAsRegularArray: (function(node) {
  if (node.contents && node.contents.subarray) {
   var arr = [];
   for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
   return arr;
  }
  return node.contents;
 }),
 getFileDataAsTypedArray: (function(node) {
  if (!node.contents) return new Uint8Array;
  if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
  return new Uint8Array(node.contents);
 }),
 expandFileStorage: (function(node, newCapacity) {
  if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
   node.contents = MEMFS.getFileDataAsRegularArray(node);
   node.usedBytes = node.contents.length;
  }
  if (!node.contents || node.contents.subarray) {
   var prevCapacity = node.contents ? node.contents.length : 0;
   if (prevCapacity >= newCapacity) return;
   var CAPACITY_DOUBLING_MAX = 1024 * 1024;
   newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) | 0);
   if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
   var oldContents = node.contents;
   node.contents = new Uint8Array(newCapacity);
   if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
   return;
  }
  if (!node.contents && newCapacity > 0) node.contents = [];
  while (node.contents.length < newCapacity) node.contents.push(0);
 }),
 resizeFileStorage: (function(node, newSize) {
  if (node.usedBytes == newSize) return;
  if (newSize == 0) {
   node.contents = null;
   node.usedBytes = 0;
   return;
  }
  if (!node.contents || node.contents.subarray) {
   var oldContents = node.contents;
   node.contents = new Uint8Array(new ArrayBuffer(newSize));
   if (oldContents) {
    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
   }
   node.usedBytes = newSize;
   return;
  }
  if (!node.contents) node.contents = [];
  if (node.contents.length > newSize) node.contents.length = newSize; else while (node.contents.length < newSize) node.contents.push(0);
  node.usedBytes = newSize;
 }),
 node_ops: {
  getattr: (function(node) {
   var attr = {};
   attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
   attr.ino = node.id;
   attr.mode = node.mode;
   attr.nlink = 1;
   attr.uid = 0;
   attr.gid = 0;
   attr.rdev = node.rdev;
   if (FS.isDir(node.mode)) {
    attr.size = 4096;
   } else if (FS.isFile(node.mode)) {
    attr.size = node.usedBytes;
   } else if (FS.isLink(node.mode)) {
    attr.size = node.link.length;
   } else {
    attr.size = 0;
   }
   attr.atime = new Date(node.timestamp);
   attr.mtime = new Date(node.timestamp);
   attr.ctime = new Date(node.timestamp);
   attr.blksize = 4096;
   attr.blocks = Math.ceil(attr.size / attr.blksize);
   return attr;
  }),
  setattr: (function(node, attr) {
   if (attr.mode !== undefined) {
    node.mode = attr.mode;
   }
   if (attr.timestamp !== undefined) {
    node.timestamp = attr.timestamp;
   }
   if (attr.size !== undefined) {
    MEMFS.resizeFileStorage(node, attr.size);
   }
  }),
  lookup: (function(parent, name) {
   throw FS.genericErrors[ERRNO_CODES.ENOENT];
  }),
  mknod: (function(parent, name, mode, dev) {
   return MEMFS.createNode(parent, name, mode, dev);
  }),
  rename: (function(old_node, new_dir, new_name) {
   if (FS.isDir(old_node.mode)) {
    var new_node;
    try {
     new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (new_node) {
     for (var i in new_node.contents) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
     }
    }
   }
   delete old_node.parent.contents[old_node.name];
   old_node.name = new_name;
   new_dir.contents[new_name] = old_node;
   old_node.parent = new_dir;
  }),
  unlink: (function(parent, name) {
   delete parent.contents[name];
  }),
  rmdir: (function(parent, name) {
   var node = FS.lookupNode(parent, name);
   for (var i in node.contents) {
    throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
   }
   delete parent.contents[name];
  }),
  readdir: (function(node) {
   var entries = [ ".", ".." ];
   for (var key in node.contents) {
    if (!node.contents.hasOwnProperty(key)) {
     continue;
    }
    entries.push(key);
   }
   return entries;
  }),
  symlink: (function(parent, newname, oldpath) {
   var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
   node.link = oldpath;
   return node;
  }),
  readlink: (function(node) {
   if (!FS.isLink(node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return node.link;
  })
 },
 stream_ops: {
  read: (function(stream, buffer, offset, length, position) {
   var contents = stream.node.contents;
   if (position >= stream.node.usedBytes) return 0;
   var size = Math.min(stream.node.usedBytes - position, length);
   assert(size >= 0);
   if (size > 8 && contents.subarray) {
    buffer.set(contents.subarray(position, position + size), offset);
   } else {
    for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
   }
   return size;
  }),
  write: (function(stream, buffer, offset, length, position, canOwn) {
   if (!length) return 0;
   var node = stream.node;
   node.timestamp = Date.now();
   if (buffer.subarray && (!node.contents || node.contents.subarray)) {
    if (canOwn) {
     node.contents = buffer.subarray(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (node.usedBytes === 0 && position === 0) {
     node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
     node.usedBytes = length;
     return length;
    } else if (position + length <= node.usedBytes) {
     node.contents.set(buffer.subarray(offset, offset + length), position);
     return length;
    }
   }
   MEMFS.expandFileStorage(node, position + length);
   if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); else {
    for (var i = 0; i < length; i++) {
     node.contents[position + i] = buffer[offset + i];
    }
   }
   node.usedBytes = Math.max(node.usedBytes, position + length);
   return length;
  }),
  llseek: (function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     position += stream.node.usedBytes;
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return position;
  }),
  allocate: (function(stream, offset, length) {
   MEMFS.expandFileStorage(stream.node, offset + length);
   stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
  }),
  mmap: (function(stream, buffer, offset, length, position, prot, flags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
   }
   var ptr;
   var allocated;
   var contents = stream.node.contents;
   if (!(flags & 2) && (contents.buffer === buffer || contents.buffer === buffer.buffer)) {
    allocated = false;
    ptr = contents.byteOffset;
   } else {
    if (position > 0 || position + length < stream.node.usedBytes) {
     if (contents.subarray) {
      contents = contents.subarray(position, position + length);
     } else {
      contents = Array.prototype.slice.call(contents, position, position + length);
     }
    }
    allocated = true;
    ptr = _malloc(length);
    if (!ptr) {
     throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
    }
    buffer.set(contents, ptr);
   }
   return {
    ptr: ptr,
    allocated: allocated
   };
  }),
  msync: (function(stream, buffer, offset, length, mmapFlags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
   }
   if (mmapFlags & 2) {
    return 0;
   }
   var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
   return 0;
  })
 }
};
var IDBFS = {
 dbs: {},
 indexedDB: (function() {
  if (typeof indexedDB !== "undefined") return indexedDB;
  var ret = null;
  if (typeof window === "object") ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  assert(ret, "IDBFS used, but indexedDB not supported");
  return ret;
 }),
 DB_VERSION: 21,
 DB_STORE_NAME: "FILE_DATA",
 mount: (function(mount) {
  return MEMFS.mount.apply(null, arguments);
 }),
 syncfs: (function(mount, populate, callback) {
  IDBFS.getLocalSet(mount, (function(err, local) {
   if (err) return callback(err);
   IDBFS.getRemoteSet(mount, (function(err, remote) {
    if (err) return callback(err);
    var src = populate ? remote : local;
    var dst = populate ? local : remote;
    IDBFS.reconcile(src, dst, callback);
   }));
  }));
 }),
 getDB: (function(name, callback) {
  var db = IDBFS.dbs[name];
  if (db) {
   return callback(null, db);
  }
  var req;
  try {
   req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
  } catch (e) {
   return callback(e);
  }
  if (!req) {
   return callback("Unable to connect to IndexedDB");
  }
  req.onupgradeneeded = (function(e) {
   var db = e.target.result;
   var transaction = e.target.transaction;
   var fileStore;
   if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
    fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
   } else {
    fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
   }
   if (!fileStore.indexNames.contains("timestamp")) {
    fileStore.createIndex("timestamp", "timestamp", {
     unique: false
    });
   }
  });
  req.onsuccess = (function() {
   db = req.result;
   IDBFS.dbs[name] = db;
   callback(null, db);
  });
  req.onerror = (function(e) {
   callback(this.error);
   e.preventDefault();
  });
 }),
 getLocalSet: (function(mount, callback) {
  var entries = {};
  function isRealDir(p) {
   return p !== "." && p !== "..";
  }
  function toAbsolute(root) {
   return (function(p) {
    return PATH.join2(root, p);
   });
  }
  var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  while (check.length) {
   var path = check.pop();
   var stat;
   try {
    stat = FS.stat(path);
   } catch (e) {
    return callback(e);
   }
   if (FS.isDir(stat.mode)) {
    check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
   }
   entries[path] = {
    timestamp: stat.mtime
   };
  }
  return callback(null, {
   type: "local",
   entries: entries
  });
 }),
 getRemoteSet: (function(mount, callback) {
  var entries = {};
  IDBFS.getDB(mount.mountpoint, (function(err, db) {
   if (err) return callback(err);
   var transaction = db.transaction([ IDBFS.DB_STORE_NAME ], "readonly");
   transaction.onerror = (function(e) {
    callback(this.error);
    e.preventDefault();
   });
   var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
   var index = store.index("timestamp");
   index.openKeyCursor().onsuccess = (function(event) {
    var cursor = event.target.result;
    if (!cursor) {
     return callback(null, {
      type: "remote",
      db: db,
      entries: entries
     });
    }
    entries[cursor.primaryKey] = {
     timestamp: cursor.key
    };
    cursor.continue();
   });
  }));
 }),
 loadLocalEntry: (function(path, callback) {
  var stat, node;
  try {
   var lookup = FS.lookupPath(path);
   node = lookup.node;
   stat = FS.stat(path);
  } catch (e) {
   return callback(e);
  }
  if (FS.isDir(stat.mode)) {
   return callback(null, {
    timestamp: stat.mtime,
    mode: stat.mode
   });
  } else if (FS.isFile(stat.mode)) {
   node.contents = MEMFS.getFileDataAsTypedArray(node);
   return callback(null, {
    timestamp: stat.mtime,
    mode: stat.mode,
    contents: node.contents
   });
  } else {
   return callback(new Error("node type not supported"));
  }
 }),
 storeLocalEntry: (function(path, entry, callback) {
  try {
   if (FS.isDir(entry.mode)) {
    FS.mkdir(path, entry.mode);
   } else if (FS.isFile(entry.mode)) {
    FS.writeFile(path, entry.contents, {
     encoding: "binary",
     canOwn: true
    });
   } else {
    return callback(new Error("node type not supported"));
   }
   FS.chmod(path, entry.mode);
   FS.utime(path, entry.timestamp, entry.timestamp);
  } catch (e) {
   return callback(e);
  }
  callback(null);
 }),
 removeLocalEntry: (function(path, callback) {
  try {
   var lookup = FS.lookupPath(path);
   var stat = FS.stat(path);
   if (FS.isDir(stat.mode)) {
    FS.rmdir(path);
   } else if (FS.isFile(stat.mode)) {
    FS.unlink(path);
   }
  } catch (e) {
   return callback(e);
  }
  callback(null);
 }),
 loadRemoteEntry: (function(store, path, callback) {
  var req = store.get(path);
  req.onsuccess = (function(event) {
   callback(null, event.target.result);
  });
  req.onerror = (function(e) {
   callback(this.error);
   e.preventDefault();
  });
 }),
 storeRemoteEntry: (function(store, path, entry, callback) {
  var req = store.put(entry, path);
  req.onsuccess = (function() {
   callback(null);
  });
  req.onerror = (function(e) {
   callback(this.error);
   e.preventDefault();
  });
 }),
 removeRemoteEntry: (function(store, path, callback) {
  var req = store.delete(path);
  req.onsuccess = (function() {
   callback(null);
  });
  req.onerror = (function(e) {
   callback(this.error);
   e.preventDefault();
  });
 }),
 reconcile: (function(src, dst, callback) {
  var total = 0;
  var create = [];
  Object.keys(src.entries).forEach((function(key) {
   var e = src.entries[key];
   var e2 = dst.entries[key];
   if (!e2 || e.timestamp > e2.timestamp) {
    create.push(key);
    total++;
   }
  }));
  var remove = [];
  Object.keys(dst.entries).forEach((function(key) {
   var e = dst.entries[key];
   var e2 = src.entries[key];
   if (!e2) {
    remove.push(key);
    total++;
   }
  }));
  if (!total) {
   return callback(null);
  }
  var completed = 0;
  var db = src.type === "remote" ? src.db : dst.db;
  var transaction = db.transaction([ IDBFS.DB_STORE_NAME ], "readwrite");
  var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  function done(err) {
   if (err) {
    if (!done.errored) {
     done.errored = true;
     return callback(err);
    }
    return;
   }
   if (++completed >= total) {
    return callback(null);
   }
  }
  transaction.onerror = (function(e) {
   done(this.error);
   e.preventDefault();
  });
  create.sort().forEach((function(path) {
   if (dst.type === "local") {
    IDBFS.loadRemoteEntry(store, path, (function(err, entry) {
     if (err) return done(err);
     IDBFS.storeLocalEntry(path, entry, done);
    }));
   } else {
    IDBFS.loadLocalEntry(path, (function(err, entry) {
     if (err) return done(err);
     IDBFS.storeRemoteEntry(store, path, entry, done);
    }));
   }
  }));
  remove.sort().reverse().forEach((function(path) {
   if (dst.type === "local") {
    IDBFS.removeLocalEntry(path, done);
   } else {
    IDBFS.removeRemoteEntry(store, path, done);
   }
  }));
 })
};
var NODEFS = {
 isWindows: false,
 staticInit: (function() {
  NODEFS.isWindows = !!process.platform.match(/^win/);
 }),
 mount: (function(mount) {
  assert(ENVIRONMENT_IS_NODE);
  return NODEFS.createNode(null, "/", NODEFS.getMode(mount.opts.root), 0);
 }),
 createNode: (function(parent, name, mode, dev) {
  if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var node = FS.createNode(parent, name, mode);
  node.node_ops = NODEFS.node_ops;
  node.stream_ops = NODEFS.stream_ops;
  return node;
 }),
 getMode: (function(path) {
  var stat;
  try {
   stat = fs.lstatSync(path);
   if (NODEFS.isWindows) {
    stat.mode = stat.mode | (stat.mode & 146) >> 1;
   }
  } catch (e) {
   if (!e.code) throw e;
   throw new FS.ErrnoError(ERRNO_CODES[e.code]);
  }
  return stat.mode;
 }),
 realPath: (function(node) {
  var parts = [];
  while (node.parent !== node) {
   parts.push(node.name);
   node = node.parent;
  }
  parts.push(node.mount.opts.root);
  parts.reverse();
  return PATH.join.apply(null, parts);
 }),
 flagsToPermissionStringMap: {
  0: "r",
  1: "r+",
  2: "r+",
  64: "r",
  65: "r+",
  66: "r+",
  129: "rx+",
  193: "rx+",
  514: "w+",
  577: "w",
  578: "w+",
  705: "wx",
  706: "wx+",
  1024: "a",
  1025: "a",
  1026: "a+",
  1089: "a",
  1090: "a+",
  1153: "ax",
  1154: "ax+",
  1217: "ax",
  1218: "ax+",
  4096: "rs",
  4098: "rs+"
 },
 flagsToPermissionString: (function(flags) {
  flags &= ~2097152;
  flags &= ~2048;
  flags &= ~32768;
  flags &= ~524288;
  if (flags in NODEFS.flagsToPermissionStringMap) {
   return NODEFS.flagsToPermissionStringMap[flags];
  } else {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
 }),
 node_ops: {
  getattr: (function(node) {
   var path = NODEFS.realPath(node);
   var stat;
   try {
    stat = fs.lstatSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   if (NODEFS.isWindows && !stat.blksize) {
    stat.blksize = 4096;
   }
   if (NODEFS.isWindows && !stat.blocks) {
    stat.blocks = (stat.size + stat.blksize - 1) / stat.blksize | 0;
   }
   return {
    dev: stat.dev,
    ino: stat.ino,
    mode: stat.mode,
    nlink: stat.nlink,
    uid: stat.uid,
    gid: stat.gid,
    rdev: stat.rdev,
    size: stat.size,
    atime: stat.atime,
    mtime: stat.mtime,
    ctime: stat.ctime,
    blksize: stat.blksize,
    blocks: stat.blocks
   };
  }),
  setattr: (function(node, attr) {
   var path = NODEFS.realPath(node);
   try {
    if (attr.mode !== undefined) {
     fs.chmodSync(path, attr.mode);
     node.mode = attr.mode;
    }
    if (attr.timestamp !== undefined) {
     var date = new Date(attr.timestamp);
     fs.utimesSync(path, date, date);
    }
    if (attr.size !== undefined) {
     fs.truncateSync(path, attr.size);
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  lookup: (function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   var mode = NODEFS.getMode(path);
   return NODEFS.createNode(parent, name, mode);
  }),
  mknod: (function(parent, name, mode, dev) {
   var node = NODEFS.createNode(parent, name, mode, dev);
   var path = NODEFS.realPath(node);
   try {
    if (FS.isDir(node.mode)) {
     fs.mkdirSync(path, node.mode);
    } else {
     fs.writeFileSync(path, "", {
      mode: node.mode
     });
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   return node;
  }),
  rename: (function(oldNode, newDir, newName) {
   var oldPath = NODEFS.realPath(oldNode);
   var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
   try {
    fs.renameSync(oldPath, newPath);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  unlink: (function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   try {
    fs.unlinkSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  rmdir: (function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   try {
    fs.rmdirSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  readdir: (function(node) {
   var path = NODEFS.realPath(node);
   try {
    return fs.readdirSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  symlink: (function(parent, newName, oldPath) {
   var newPath = PATH.join2(NODEFS.realPath(parent), newName);
   try {
    fs.symlinkSync(oldPath, newPath);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  readlink: (function(node) {
   var path = NODEFS.realPath(node);
   try {
    path = fs.readlinkSync(path);
    path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
    return path;
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  })
 },
 stream_ops: {
  open: (function(stream) {
   var path = NODEFS.realPath(stream.node);
   try {
    if (FS.isFile(stream.node.mode)) {
     stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  close: (function(stream) {
   try {
    if (FS.isFile(stream.node.mode) && stream.nfd) {
     fs.closeSync(stream.nfd);
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }),
  read: (function(stream, buffer, offset, length, position) {
   if (length === 0) return 0;
   var nbuffer = new Buffer(length);
   var res;
   try {
    res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
   } catch (e) {
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   if (res > 0) {
    for (var i = 0; i < res; i++) {
     buffer[offset + i] = nbuffer[i];
    }
   }
   return res;
  }),
  write: (function(stream, buffer, offset, length, position) {
   var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
   var res;
   try {
    res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
   } catch (e) {
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   return res;
  }),
  llseek: (function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     try {
      var stat = fs.fstatSync(stream.nfd);
      position += stat.size;
     } catch (e) {
      throw new FS.ErrnoError(ERRNO_CODES[e.code]);
     }
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return position;
  })
 }
};
var WORKERFS = {
 DIR_MODE: 16895,
 FILE_MODE: 33279,
 reader: null,
 mount: (function(mount) {
  assert(ENVIRONMENT_IS_WORKER);
  if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync;
  var root = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0);
  var createdParents = {};
  function ensureParent(path) {
   var parts = path.split("/");
   var parent = root;
   for (var i = 0; i < parts.length - 1; i++) {
    var curr = parts.slice(0, i + 1).join("/");
    if (!createdParents[curr]) {
     createdParents[curr] = WORKERFS.createNode(parent, parts[i], WORKERFS.DIR_MODE, 0);
    }
    parent = createdParents[curr];
   }
   return parent;
  }
  function base(path) {
   var parts = path.split("/");
   return parts[parts.length - 1];
  }
  Array.prototype.forEach.call(mount.opts["files"] || [], (function(file) {
   WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate);
  }));
  (mount.opts["blobs"] || []).forEach((function(obj) {
   WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"]);
  }));
  (mount.opts["packages"] || []).forEach((function(pack) {
   pack["metadata"].files.forEach((function(file) {
    var name = file.filename.substr(1);
    WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack["blob"].slice(file.start, file.end));
   }));
  }));
  return root;
 }),
 createNode: (function(parent, name, mode, dev, contents, mtime) {
  var node = FS.createNode(parent, name, mode);
  node.mode = mode;
  node.node_ops = WORKERFS.node_ops;
  node.stream_ops = WORKERFS.stream_ops;
  node.timestamp = (mtime || new Date).getTime();
  assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
  if (mode === WORKERFS.FILE_MODE) {
   node.size = contents.size;
   node.contents = contents;
  } else {
   node.size = 4096;
   node.contents = {};
  }
  if (parent) {
   parent.contents[name] = node;
  }
  return node;
 }),
 node_ops: {
  getattr: (function(node) {
   return {
    dev: 1,
    ino: undefined,
    mode: node.mode,
    nlink: 1,
    uid: 0,
    gid: 0,
    rdev: undefined,
    size: node.size,
    atime: new Date(node.timestamp),
    mtime: new Date(node.timestamp),
    ctime: new Date(node.timestamp),
    blksize: 4096,
    blocks: Math.ceil(node.size / 4096)
   };
  }),
  setattr: (function(node, attr) {
   if (attr.mode !== undefined) {
    node.mode = attr.mode;
   }
   if (attr.timestamp !== undefined) {
    node.timestamp = attr.timestamp;
   }
  }),
  lookup: (function(parent, name) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }),
  mknod: (function(parent, name, mode, dev) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }),
  rename: (function(oldNode, newDir, newName) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }),
  unlink: (function(parent, name) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }),
  rmdir: (function(parent, name) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }),
  readdir: (function(node) {
   var entries = [ ".", ".." ];
   for (var key in node.contents) {
    if (!node.contents.hasOwnProperty(key)) {
     continue;
    }
    entries.push(key);
   }
   return entries;
  }),
  symlink: (function(parent, newName, oldPath) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }),
  readlink: (function(node) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  })
 },
 stream_ops: {
  read: (function(stream, buffer, offset, length, position) {
   if (position >= stream.node.size) return 0;
   var chunk = stream.node.contents.slice(position, position + length);
   var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
   buffer.set(new Uint8Array(ab), offset);
   return chunk.size;
  }),
  write: (function(stream, buffer, offset, length, position) {
   throw new FS.ErrnoError(ERRNO_CODES.EIO);
  }),
  llseek: (function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     position += stream.node.size;
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return position;
  })
 }
};
STATICTOP += 16;
STATICTOP += 16;
STATICTOP += 16;
var FS = {
 root: null,
 mounts: [],
 devices: [ null ],
 streams: [],
 nextInode: 1,
 nameTable: null,
 currentPath: "/",
 initialized: false,
 ignorePermissions: true,
 trackingDelegate: {},
 tracking: {
  openFlags: {
   READ: 1,
   WRITE: 2
  }
 },
 ErrnoError: null,
 genericErrors: {},
 filesystems: null,
 syncFSRequests: 0,
 handleFSError: (function(e) {
  if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
  return ___setErrNo(e.errno);
 }),
 lookupPath: (function(path, opts) {
  path = PATH.resolve(FS.cwd(), path);
  opts = opts || {};
  if (!path) return {
   path: "",
   node: null
  };
  var defaults = {
   follow_mount: true,
   recurse_count: 0
  };
  for (var key in defaults) {
   if (opts[key] === undefined) {
    opts[key] = defaults[key];
   }
  }
  if (opts.recurse_count > 8) {
   throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
  }
  var parts = PATH.normalizeArray(path.split("/").filter((function(p) {
   return !!p;
  })), false);
  var current = FS.root;
  var current_path = "/";
  for (var i = 0; i < parts.length; i++) {
   var islast = i === parts.length - 1;
   if (islast && opts.parent) {
    break;
   }
   current = FS.lookupNode(current, parts[i]);
   current_path = PATH.join2(current_path, parts[i]);
   if (FS.isMountpoint(current)) {
    if (!islast || islast && opts.follow_mount) {
     current = current.mounted.root;
    }
   }
   if (!islast || opts.follow) {
    var count = 0;
    while (FS.isLink(current.mode)) {
     var link = FS.readlink(current_path);
     current_path = PATH.resolve(PATH.dirname(current_path), link);
     var lookup = FS.lookupPath(current_path, {
      recurse_count: opts.recurse_count
     });
     current = lookup.node;
     if (count++ > 40) {
      throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
     }
    }
   }
  }
  return {
   path: current_path,
   node: current
  };
 }),
 getPath: (function(node) {
  var path;
  while (true) {
   if (FS.isRoot(node)) {
    var mount = node.mount.mountpoint;
    if (!path) return mount;
    return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
   }
   path = path ? node.name + "/" + path : node.name;
   node = node.parent;
  }
 }),
 hashName: (function(parentid, name) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
   hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
  }
  return (parentid + hash >>> 0) % FS.nameTable.length;
 }),
 hashAddNode: (function(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  node.name_next = FS.nameTable[hash];
  FS.nameTable[hash] = node;
 }),
 hashRemoveNode: (function(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  if (FS.nameTable[hash] === node) {
   FS.nameTable[hash] = node.name_next;
  } else {
   var current = FS.nameTable[hash];
   while (current) {
    if (current.name_next === node) {
     current.name_next = node.name_next;
     break;
    }
    current = current.name_next;
   }
  }
 }),
 lookupNode: (function(parent, name) {
  var err = FS.mayLookup(parent);
  if (err) {
   throw new FS.ErrnoError(err, parent);
  }
  var hash = FS.hashName(parent.id, name);
  for (var node = FS.nameTable[hash]; node; node = node.name_next) {
   var nodeName = node.name;
   if (node.parent.id === parent.id && nodeName === name) {
    return node;
   }
  }
  return FS.lookup(parent, name);
 }),
 createNode: (function(parent, name, mode, rdev) {
  if (!FS.FSNode) {
   FS.FSNode = (function(parent, name, mode, rdev) {
    if (!parent) {
     parent = this;
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
   });
   FS.FSNode.prototype = {};
   var readMode = 292 | 73;
   var writeMode = 146;
   Object.defineProperties(FS.FSNode.prototype, {
    read: {
     get: (function() {
      return (this.mode & readMode) === readMode;
     }),
     set: (function(val) {
      val ? this.mode |= readMode : this.mode &= ~readMode;
     })
    },
    write: {
     get: (function() {
      return (this.mode & writeMode) === writeMode;
     }),
     set: (function(val) {
      val ? this.mode |= writeMode : this.mode &= ~writeMode;
     })
    },
    isFolder: {
     get: (function() {
      return FS.isDir(this.mode);
     })
    },
    isDevice: {
     get: (function() {
      return FS.isChrdev(this.mode);
     })
    }
   });
  }
  var node = new FS.FSNode(parent, name, mode, rdev);
  FS.hashAddNode(node);
  return node;
 }),
 destroyNode: (function(node) {
  FS.hashRemoveNode(node);
 }),
 isRoot: (function(node) {
  return node === node.parent;
 }),
 isMountpoint: (function(node) {
  return !!node.mounted;
 }),
 isFile: (function(mode) {
  return (mode & 61440) === 32768;
 }),
 isDir: (function(mode) {
  return (mode & 61440) === 16384;
 }),
 isLink: (function(mode) {
  return (mode & 61440) === 40960;
 }),
 isChrdev: (function(mode) {
  return (mode & 61440) === 8192;
 }),
 isBlkdev: (function(mode) {
  return (mode & 61440) === 24576;
 }),
 isFIFO: (function(mode) {
  return (mode & 61440) === 4096;
 }),
 isSocket: (function(mode) {
  return (mode & 49152) === 49152;
 }),
 flagModes: {
  "r": 0,
  "rs": 1052672,
  "r+": 2,
  "w": 577,
  "wx": 705,
  "xw": 705,
  "w+": 578,
  "wx+": 706,
  "xw+": 706,
  "a": 1089,
  "ax": 1217,
  "xa": 1217,
  "a+": 1090,
  "ax+": 1218,
  "xa+": 1218
 },
 modeStringToFlags: (function(str) {
  var flags = FS.flagModes[str];
  if (typeof flags === "undefined") {
   throw new Error("Unknown file open mode: " + str);
  }
  return flags;
 }),
 flagsToPermissionString: (function(flag) {
  var perms = [ "r", "w", "rw" ][flag & 3];
  if (flag & 512) {
   perms += "w";
  }
  return perms;
 }),
 nodePermissions: (function(node, perms) {
  if (FS.ignorePermissions) {
   return 0;
  }
  if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
   return ERRNO_CODES.EACCES;
  } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
   return ERRNO_CODES.EACCES;
  } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
   return ERRNO_CODES.EACCES;
  }
  return 0;
 }),
 mayLookup: (function(dir) {
  var err = FS.nodePermissions(dir, "x");
  if (err) return err;
  if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
  return 0;
 }),
 mayCreate: (function(dir, name) {
  try {
   var node = FS.lookupNode(dir, name);
   return ERRNO_CODES.EEXIST;
  } catch (e) {}
  return FS.nodePermissions(dir, "wx");
 }),
 mayDelete: (function(dir, name, isdir) {
  var node;
  try {
   node = FS.lookupNode(dir, name);
  } catch (e) {
   return e.errno;
  }
  var err = FS.nodePermissions(dir, "wx");
  if (err) {
   return err;
  }
  if (isdir) {
   if (!FS.isDir(node.mode)) {
    return ERRNO_CODES.ENOTDIR;
   }
   if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
    return ERRNO_CODES.EBUSY;
   }
  } else {
   if (FS.isDir(node.mode)) {
    return ERRNO_CODES.EISDIR;
   }
  }
  return 0;
 }),
 mayOpen: (function(node, flags) {
  if (!node) {
   return ERRNO_CODES.ENOENT;
  }
  if (FS.isLink(node.mode)) {
   return ERRNO_CODES.ELOOP;
  } else if (FS.isDir(node.mode)) {
   if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
    return ERRNO_CODES.EISDIR;
   }
  }
  return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
 }),
 MAX_OPEN_FDS: 4096,
 nextfd: (function(fd_start, fd_end) {
  fd_start = fd_start || 0;
  fd_end = fd_end || FS.MAX_OPEN_FDS;
  for (var fd = fd_start; fd <= fd_end; fd++) {
   if (!FS.streams[fd]) {
    return fd;
   }
  }
  throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
 }),
 getStream: (function(fd) {
  return FS.streams[fd];
 }),
 createStream: (function(stream, fd_start, fd_end) {
  if (!FS.FSStream) {
   FS.FSStream = (function() {});
   FS.FSStream.prototype = {};
   Object.defineProperties(FS.FSStream.prototype, {
    object: {
     get: (function() {
      return this.node;
     }),
     set: (function(val) {
      this.node = val;
     })
    },
    isRead: {
     get: (function() {
      return (this.flags & 2097155) !== 1;
     })
    },
    isWrite: {
     get: (function() {
      return (this.flags & 2097155) !== 0;
     })
    },
    isAppend: {
     get: (function() {
      return this.flags & 1024;
     })
    }
   });
  }
  var newStream = new FS.FSStream;
  for (var p in stream) {
   newStream[p] = stream[p];
  }
  stream = newStream;
  var fd = FS.nextfd(fd_start, fd_end);
  stream.fd = fd;
  FS.streams[fd] = stream;
  return stream;
 }),
 closeStream: (function(fd) {
  FS.streams[fd] = null;
 }),
 chrdev_stream_ops: {
  open: (function(stream) {
   var device = FS.getDevice(stream.node.rdev);
   stream.stream_ops = device.stream_ops;
   if (stream.stream_ops.open) {
    stream.stream_ops.open(stream);
   }
  }),
  llseek: (function() {
   throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
  })
 },
 major: (function(dev) {
  return dev >> 8;
 }),
 minor: (function(dev) {
  return dev & 255;
 }),
 makedev: (function(ma, mi) {
  return ma << 8 | mi;
 }),
 registerDevice: (function(dev, ops) {
  FS.devices[dev] = {
   stream_ops: ops
  };
 }),
 getDevice: (function(dev) {
  return FS.devices[dev];
 }),
 getMounts: (function(mount) {
  var mounts = [];
  var check = [ mount ];
  while (check.length) {
   var m = check.pop();
   mounts.push(m);
   check.push.apply(check, m.mounts);
  }
  return mounts;
 }),
 syncfs: (function(populate, callback) {
  if (typeof populate === "function") {
   callback = populate;
   populate = false;
  }
  FS.syncFSRequests++;
  if (FS.syncFSRequests > 1) {
   console.log("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
  }
  var mounts = FS.getMounts(FS.root.mount);
  var completed = 0;
  function doCallback(err) {
   assert(FS.syncFSRequests > 0);
   FS.syncFSRequests--;
   return callback(err);
  }
  function done(err) {
   if (err) {
    if (!done.errored) {
     done.errored = true;
     return doCallback(err);
    }
    return;
   }
   if (++completed >= mounts.length) {
    doCallback(null);
   }
  }
  mounts.forEach((function(mount) {
   if (!mount.type.syncfs) {
    return done(null);
   }
   mount.type.syncfs(mount, populate, done);
  }));
 }),
 mount: (function(type, opts, mountpoint) {
  var root = mountpoint === "/";
  var pseudo = !mountpoint;
  var node;
  if (root && FS.root) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  } else if (!root && !pseudo) {
   var lookup = FS.lookupPath(mountpoint, {
    follow_mount: false
   });
   mountpoint = lookup.path;
   node = lookup.node;
   if (FS.isMountpoint(node)) {
    throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
   }
   if (!FS.isDir(node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
   }
  }
  var mount = {
   type: type,
   opts: opts,
   mountpoint: mountpoint,
   mounts: []
  };
  var mountRoot = type.mount(mount);
  mountRoot.mount = mount;
  mount.root = mountRoot;
  if (root) {
   FS.root = mountRoot;
  } else if (node) {
   node.mounted = mount;
   if (node.mount) {
    node.mount.mounts.push(mount);
   }
  }
  return mountRoot;
 }),
 unmount: (function(mountpoint) {
  var lookup = FS.lookupPath(mountpoint, {
   follow_mount: false
  });
  if (!FS.isMountpoint(lookup.node)) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var node = lookup.node;
  var mount = node.mounted;
  var mounts = FS.getMounts(mount);
  Object.keys(FS.nameTable).forEach((function(hash) {
   var current = FS.nameTable[hash];
   while (current) {
    var next = current.name_next;
    if (mounts.indexOf(current.mount) !== -1) {
     FS.destroyNode(current);
    }
    current = next;
   }
  }));
  node.mounted = null;
  var idx = node.mount.mounts.indexOf(mount);
  assert(idx !== -1);
  node.mount.mounts.splice(idx, 1);
 }),
 lookup: (function(parent, name) {
  return parent.node_ops.lookup(parent, name);
 }),
 mknod: (function(path, mode, dev) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  if (!name || name === "." || name === "..") {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var err = FS.mayCreate(parent, name);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.mknod) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  return parent.node_ops.mknod(parent, name, mode, dev);
 }),
 create: (function(path, mode) {
  mode = mode !== undefined ? mode : 438;
  mode &= 4095;
  mode |= 32768;
  return FS.mknod(path, mode, 0);
 }),
 mkdir: (function(path, mode) {
  mode = mode !== undefined ? mode : 511;
  mode &= 511 | 512;
  mode |= 16384;
  return FS.mknod(path, mode, 0);
 }),
 mkdirTree: (function(path, mode) {
  var dirs = path.split("/");
  var d = "";
  for (var i = 0; i < dirs.length; ++i) {
   if (!dirs[i]) continue;
   d += "/" + dirs[i];
   try {
    FS.mkdir(d, mode);
   } catch (e) {
    if (e.errno != ERRNO_CODES.EEXIST) throw e;
   }
  }
 }),
 mkdev: (function(path, mode, dev) {
  if (typeof dev === "undefined") {
   dev = mode;
   mode = 438;
  }
  mode |= 8192;
  return FS.mknod(path, mode, dev);
 }),
 symlink: (function(oldpath, newpath) {
  if (!PATH.resolve(oldpath)) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  var lookup = FS.lookupPath(newpath, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  var newname = PATH.basename(newpath);
  var err = FS.mayCreate(parent, newname);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.symlink) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  return parent.node_ops.symlink(parent, newname, oldpath);
 }),
 rename: (function(old_path, new_path) {
  var old_dirname = PATH.dirname(old_path);
  var new_dirname = PATH.dirname(new_path);
  var old_name = PATH.basename(old_path);
  var new_name = PATH.basename(new_path);
  var lookup, old_dir, new_dir;
  try {
   lookup = FS.lookupPath(old_path, {
    parent: true
   });
   old_dir = lookup.node;
   lookup = FS.lookupPath(new_path, {
    parent: true
   });
   new_dir = lookup.node;
  } catch (e) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  }
  if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  if (old_dir.mount !== new_dir.mount) {
   throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
  }
  var old_node = FS.lookupNode(old_dir, old_name);
  var relative = PATH.relative(old_path, new_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  relative = PATH.relative(new_path, old_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
  }
  var new_node;
  try {
   new_node = FS.lookupNode(new_dir, new_name);
  } catch (e) {}
  if (old_node === new_node) {
   return;
  }
  var isdir = FS.isDir(old_node.mode);
  var err = FS.mayDelete(old_dir, old_name, isdir);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  err = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!old_dir.node_ops.rename) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  }
  if (new_dir !== old_dir) {
   err = FS.nodePermissions(old_dir, "w");
   if (err) {
    throw new FS.ErrnoError(err);
   }
  }
  try {
   if (FS.trackingDelegate["willMovePath"]) {
    FS.trackingDelegate["willMovePath"](old_path, new_path);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
  }
  FS.hashRemoveNode(old_node);
  try {
   old_dir.node_ops.rename(old_node, new_dir, new_name);
  } catch (e) {
   throw e;
  } finally {
   FS.hashAddNode(old_node);
  }
  try {
   if (FS.trackingDelegate["onMovePath"]) FS.trackingDelegate["onMovePath"](old_path, new_path);
  } catch (e) {
   console.log("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
  }
 }),
 rmdir: (function(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var err = FS.mayDelete(parent, name, true);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.rmdir) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  }
  try {
   if (FS.trackingDelegate["willDeletePath"]) {
    FS.trackingDelegate["willDeletePath"](path);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
  }
  parent.node_ops.rmdir(parent, name);
  FS.destroyNode(node);
  try {
   if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path);
  } catch (e) {
   console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
  }
 }),
 readdir: (function(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node.node_ops.readdir) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
  }
  return node.node_ops.readdir(node);
 }),
 unlink: (function(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var err = FS.mayDelete(parent, name, false);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.unlink) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
  }
  try {
   if (FS.trackingDelegate["willDeletePath"]) {
    FS.trackingDelegate["willDeletePath"](path);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
  }
  parent.node_ops.unlink(parent, name);
  FS.destroyNode(node);
  try {
   if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path);
  } catch (e) {
   console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
  }
 }),
 readlink: (function(path) {
  var lookup = FS.lookupPath(path);
  var link = lookup.node;
  if (!link) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  if (!link.node_ops.readlink) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  return PATH.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
 }),
 stat: (function(path, dontFollow) {
  var lookup = FS.lookupPath(path, {
   follow: !dontFollow
  });
  var node = lookup.node;
  if (!node) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  if (!node.node_ops.getattr) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  return node.node_ops.getattr(node);
 }),
 lstat: (function(path) {
  return FS.stat(path, true);
 }),
 chmod: (function(path, mode, dontFollow) {
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  node.node_ops.setattr(node, {
   mode: mode & 4095 | node.mode & ~4095,
   timestamp: Date.now()
  });
 }),
 lchmod: (function(path, mode) {
  FS.chmod(path, mode, true);
 }),
 fchmod: (function(fd, mode) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  FS.chmod(stream.node, mode);
 }),
 chown: (function(path, uid, gid, dontFollow) {
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  node.node_ops.setattr(node, {
   timestamp: Date.now()
  });
 }),
 lchown: (function(path, uid, gid) {
  FS.chown(path, uid, gid, true);
 }),
 fchown: (function(fd, uid, gid) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  FS.chown(stream.node, uid, gid);
 }),
 truncate: (function(path, len) {
  if (len < 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (FS.isDir(node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
  }
  if (!FS.isFile(node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var err = FS.nodePermissions(node, "w");
  if (err) {
   throw new FS.ErrnoError(err);
  }
  node.node_ops.setattr(node, {
   size: len,
   timestamp: Date.now()
  });
 }),
 ftruncate: (function(fd, len) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  FS.truncate(stream.node, len);
 }),
 utime: (function(path, atime, mtime) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  node.node_ops.setattr(node, {
   timestamp: Math.max(atime, mtime)
  });
 }),
 open: (function(path, flags, mode, fd_start, fd_end) {
  if (path === "") {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
  mode = typeof mode === "undefined" ? 438 : mode;
  if (flags & 64) {
   mode = mode & 4095 | 32768;
  } else {
   mode = 0;
  }
  var node;
  if (typeof path === "object") {
   node = path;
  } else {
   path = PATH.normalize(path);
   try {
    var lookup = FS.lookupPath(path, {
     follow: !(flags & 131072)
    });
    node = lookup.node;
   } catch (e) {}
  }
  var created = false;
  if (flags & 64) {
   if (node) {
    if (flags & 128) {
     throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
    }
   } else {
    node = FS.mknod(path, mode, 0);
    created = true;
   }
  }
  if (!node) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  if (FS.isChrdev(node.mode)) {
   flags &= ~512;
  }
  if (flags & 65536 && !FS.isDir(node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
  }
  if (!created) {
   var err = FS.mayOpen(node, flags);
   if (err) {
    throw new FS.ErrnoError(err);
   }
  }
  if (flags & 512) {
   FS.truncate(node, 0);
  }
  flags &= ~(128 | 512);
  var stream = FS.createStream({
   node: node,
   path: FS.getPath(node),
   flags: flags,
   seekable: true,
   position: 0,
   stream_ops: node.stream_ops,
   ungotten: [],
   error: false
  }, fd_start, fd_end);
  if (stream.stream_ops.open) {
   stream.stream_ops.open(stream);
  }
  if (Module["logReadFiles"] && !(flags & 1)) {
   if (!FS.readFiles) FS.readFiles = {};
   if (!(path in FS.readFiles)) {
    FS.readFiles[path] = 1;
    Module["printErr"]("read file: " + path);
   }
  }
  try {
   if (FS.trackingDelegate["onOpenFile"]) {
    var trackingFlags = 0;
    if ((flags & 2097155) !== 1) {
     trackingFlags |= FS.tracking.openFlags.READ;
    }
    if ((flags & 2097155) !== 0) {
     trackingFlags |= FS.tracking.openFlags.WRITE;
    }
    FS.trackingDelegate["onOpenFile"](path, trackingFlags);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message);
  }
  return stream;
 }),
 close: (function(stream) {
  if (stream.getdents) stream.getdents = null;
  try {
   if (stream.stream_ops.close) {
    stream.stream_ops.close(stream);
   }
  } catch (e) {
   throw e;
  } finally {
   FS.closeStream(stream.fd);
  }
 }),
 llseek: (function(stream, offset, whence) {
  if (!stream.seekable || !stream.stream_ops.llseek) {
   throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
  }
  stream.position = stream.stream_ops.llseek(stream, offset, whence);
  stream.ungotten = [];
  return stream.position;
 }),
 read: (function(stream, buffer, offset, length, position) {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
  }
  if (!stream.stream_ops.read) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var seeking = true;
  if (typeof position === "undefined") {
   position = stream.position;
   seeking = false;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
  }
  var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
  if (!seeking) stream.position += bytesRead;
  return bytesRead;
 }),
 write: (function(stream, buffer, offset, length, position, canOwn) {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
  }
  if (!stream.stream_ops.write) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  if (stream.flags & 1024) {
   FS.llseek(stream, 0, 2);
  }
  var seeking = true;
  if (typeof position === "undefined") {
   position = stream.position;
   seeking = false;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
  }
  var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
  if (!seeking) stream.position += bytesWritten;
  try {
   if (stream.path && FS.trackingDelegate["onWriteToFile"]) FS.trackingDelegate["onWriteToFile"](stream.path);
  } catch (e) {
   console.log("FS.trackingDelegate['onWriteToFile']('" + path + "') threw an exception: " + e.message);
  }
  return bytesWritten;
 }),
 allocate: (function(stream, offset, length) {
  if (offset < 0 || length <= 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  }
  if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
  }
  if (!stream.stream_ops.allocate) {
   throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
  }
  stream.stream_ops.allocate(stream, offset, length);
 }),
 mmap: (function(stream, buffer, offset, length, position, prot, flags) {
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(ERRNO_CODES.EACCES);
  }
  if (!stream.stream_ops.mmap) {
   throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
  }
  return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
 }),
 msync: (function(stream, buffer, offset, length, mmapFlags) {
  if (!stream || !stream.stream_ops.msync) {
   return 0;
  }
  return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
 }),
 munmap: (function(stream) {
  return 0;
 }),
 ioctl: (function(stream, cmd, arg) {
  if (!stream.stream_ops.ioctl) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
  }
  return stream.stream_ops.ioctl(stream, cmd, arg);
 }),
 readFile: (function(path, opts) {
  opts = opts || {};
  opts.flags = opts.flags || "r";
  opts.encoding = opts.encoding || "binary";
  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
   throw new Error('Invalid encoding type "' + opts.encoding + '"');
  }
  var ret;
  var stream = FS.open(path, opts.flags);
  var stat = FS.stat(path);
  var length = stat.size;
  var buf = new Uint8Array(length);
  FS.read(stream, buf, 0, length, 0);
  if (opts.encoding === "utf8") {
   ret = UTF8ArrayToString(buf, 0);
  } else if (opts.encoding === "binary") {
   ret = buf;
  }
  FS.close(stream);
  return ret;
 }),
 writeFile: (function(path, data, opts) {
  opts = opts || {};
  opts.flags = opts.flags || "w";
  opts.encoding = opts.encoding || "utf8";
  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
   throw new Error('Invalid encoding type "' + opts.encoding + '"');
  }
  var stream = FS.open(path, opts.flags, opts.mode);
  if (opts.encoding === "utf8") {
   var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
   var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
   FS.write(stream, buf, 0, actualNumBytes, 0, opts.canOwn);
  } else if (opts.encoding === "binary") {
   FS.write(stream, data, 0, data.length, 0, opts.canOwn);
  }
  FS.close(stream);
 }),
 cwd: (function() {
  return FS.currentPath;
 }),
 chdir: (function(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  if (lookup.node === null) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  }
  if (!FS.isDir(lookup.node.mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
  }
  var err = FS.nodePermissions(lookup.node, "x");
  if (err) {
   throw new FS.ErrnoError(err);
  }
  FS.currentPath = lookup.path;
 }),
 createDefaultDirectories: (function() {
  FS.mkdir("/tmp");
  FS.mkdir("/home");
  FS.mkdir("/home/web_user");
 }),
 createDefaultDevices: (function() {
  FS.mkdir("/dev");
  FS.registerDevice(FS.makedev(1, 3), {
   read: (function() {
    return 0;
   }),
   write: (function(stream, buffer, offset, length, pos) {
    return length;
   })
  });
  FS.mkdev("/dev/null", FS.makedev(1, 3));
  TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
  TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
  FS.mkdev("/dev/tty", FS.makedev(5, 0));
  FS.mkdev("/dev/tty1", FS.makedev(6, 0));
  var random_device;
  if (typeof crypto !== "undefined") {
   var randomBuffer = new Uint8Array(1);
   random_device = (function() {
    crypto.getRandomValues(randomBuffer);
    return randomBuffer[0];
   });
  } else if (ENVIRONMENT_IS_NODE) {
   random_device = (function() {
    return require("crypto").randomBytes(1)[0];
   });
  } else {
   random_device = (function() {
    return Math.random() * 256 | 0;
   });
  }
  FS.createDevice("/dev", "random", random_device);
  FS.createDevice("/dev", "urandom", random_device);
  FS.mkdir("/dev/shm");
  FS.mkdir("/dev/shm/tmp");
 }),
 createSpecialDirectories: (function() {
  FS.mkdir("/proc");
  FS.mkdir("/proc/self");
  FS.mkdir("/proc/self/fd");
  FS.mount({
   mount: (function() {
    var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73);
    node.node_ops = {
     lookup: (function(parent, name) {
      var fd = +name;
      var stream = FS.getStream(fd);
      if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
      var ret = {
       parent: null,
       mount: {
        mountpoint: "fake"
       },
       node_ops: {
        readlink: (function() {
         return stream.path;
        })
       }
      };
      ret.parent = ret;
      return ret;
     })
    };
    return node;
   })
  }, {}, "/proc/self/fd");
 }),
 createStandardStreams: (function() {
  if (Module["stdin"]) {
   FS.createDevice("/dev", "stdin", Module["stdin"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdin");
  }
  if (Module["stdout"]) {
   FS.createDevice("/dev", "stdout", null, Module["stdout"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdout");
  }
  if (Module["stderr"]) {
   FS.createDevice("/dev", "stderr", null, Module["stderr"]);
  } else {
   FS.symlink("/dev/tty1", "/dev/stderr");
  }
  var stdin = FS.open("/dev/stdin", "r");
  assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");
  var stdout = FS.open("/dev/stdout", "w");
  assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")");
  var stderr = FS.open("/dev/stderr", "w");
  assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")");
 }),
 ensureErrnoError: (function() {
  if (FS.ErrnoError) return;
  FS.ErrnoError = function ErrnoError(errno, node) {
   this.node = node;
   this.setErrno = (function(errno) {
    this.errno = errno;
    for (var key in ERRNO_CODES) {
     if (ERRNO_CODES[key] === errno) {
      this.code = key;
      break;
     }
    }
   });
   this.setErrno(errno);
   this.message = ERRNO_MESSAGES[errno];
  };
  FS.ErrnoError.prototype = new Error;
  FS.ErrnoError.prototype.constructor = FS.ErrnoError;
  [ ERRNO_CODES.ENOENT ].forEach((function(code) {
   FS.genericErrors[code] = new FS.ErrnoError(code);
   FS.genericErrors[code].stack = "<generic error, no stack>";
  }));
 }),
 staticInit: (function() {
  FS.ensureErrnoError();
  FS.nameTable = new Array(4096);
  FS.mount(MEMFS, {}, "/");
  FS.createDefaultDirectories();
  FS.createDefaultDevices();
  FS.createSpecialDirectories();
  FS.filesystems = {
   "MEMFS": MEMFS,
   "IDBFS": IDBFS,
   "NODEFS": NODEFS,
   "WORKERFS": WORKERFS
  };
 }),
 init: (function(input, output, error) {
  assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
  FS.init.initialized = true;
  FS.ensureErrnoError();
  Module["stdin"] = input || Module["stdin"];
  Module["stdout"] = output || Module["stdout"];
  Module["stderr"] = error || Module["stderr"];
  FS.createStandardStreams();
 }),
 quit: (function() {
  FS.init.initialized = false;
  var fflush = Module["_fflush"];
  if (fflush) fflush(0);
  for (var i = 0; i < FS.streams.length; i++) {
   var stream = FS.streams[i];
   if (!stream) {
    continue;
   }
   FS.close(stream);
  }
 }),
 getMode: (function(canRead, canWrite) {
  var mode = 0;
  if (canRead) mode |= 292 | 73;
  if (canWrite) mode |= 146;
  return mode;
 }),
 joinPath: (function(parts, forceRelative) {
  var path = PATH.join.apply(null, parts);
  if (forceRelative && path[0] == "/") path = path.substr(1);
  return path;
 }),
 absolutePath: (function(relative, base) {
  return PATH.resolve(base, relative);
 }),
 standardizePath: (function(path) {
  return PATH.normalize(path);
 }),
 findObject: (function(path, dontResolveLastLink) {
  var ret = FS.analyzePath(path, dontResolveLastLink);
  if (ret.exists) {
   return ret.object;
  } else {
   ___setErrNo(ret.error);
   return null;
  }
 }),
 analyzePath: (function(path, dontResolveLastLink) {
  try {
   var lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   path = lookup.path;
  } catch (e) {}
  var ret = {
   isRoot: false,
   exists: false,
   error: 0,
   name: null,
   path: null,
   object: null,
   parentExists: false,
   parentPath: null,
   parentObject: null
  };
  try {
   var lookup = FS.lookupPath(path, {
    parent: true
   });
   ret.parentExists = true;
   ret.parentPath = lookup.path;
   ret.parentObject = lookup.node;
   ret.name = PATH.basename(path);
   lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   ret.exists = true;
   ret.path = lookup.path;
   ret.object = lookup.node;
   ret.name = lookup.node.name;
   ret.isRoot = lookup.path === "/";
  } catch (e) {
   ret.error = e.errno;
  }
  return ret;
 }),
 createFolder: (function(parent, name, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(canRead, canWrite);
  return FS.mkdir(path, mode);
 }),
 createPath: (function(parent, path, canRead, canWrite) {
  parent = typeof parent === "string" ? parent : FS.getPath(parent);
  var parts = path.split("/").reverse();
  while (parts.length) {
   var part = parts.pop();
   if (!part) continue;
   var current = PATH.join2(parent, part);
   try {
    FS.mkdir(current);
   } catch (e) {}
   parent = current;
  }
  return current;
 }),
 createFile: (function(parent, name, properties, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(canRead, canWrite);
  return FS.create(path, mode);
 }),
 createDataFile: (function(parent, name, data, canRead, canWrite, canOwn) {
  var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
  var mode = FS.getMode(canRead, canWrite);
  var node = FS.create(path, mode);
  if (data) {
   if (typeof data === "string") {
    var arr = new Array(data.length);
    for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
    data = arr;
   }
   FS.chmod(node, mode | 146);
   var stream = FS.open(node, "w");
   FS.write(stream, data, 0, data.length, 0, canOwn);
   FS.close(stream);
   FS.chmod(node, mode);
  }
  return node;
 }),
 createDevice: (function(parent, name, input, output) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(!!input, !!output);
  if (!FS.createDevice.major) FS.createDevice.major = 64;
  var dev = FS.makedev(FS.createDevice.major++, 0);
  FS.registerDevice(dev, {
   open: (function(stream) {
    stream.seekable = false;
   }),
   close: (function(stream) {
    if (output && output.buffer && output.buffer.length) {
     output(10);
    }
   }),
   read: (function(stream, buffer, offset, length, pos) {
    var bytesRead = 0;
    for (var i = 0; i < length; i++) {
     var result;
     try {
      result = input();
     } catch (e) {
      throw new FS.ErrnoError(ERRNO_CODES.EIO);
     }
     if (result === undefined && bytesRead === 0) {
      throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
     }
     if (result === null || result === undefined) break;
     bytesRead++;
     buffer[offset + i] = result;
    }
    if (bytesRead) {
     stream.node.timestamp = Date.now();
    }
    return bytesRead;
   }),
   write: (function(stream, buffer, offset, length, pos) {
    for (var i = 0; i < length; i++) {
     try {
      output(buffer[offset + i]);
     } catch (e) {
      throw new FS.ErrnoError(ERRNO_CODES.EIO);
     }
    }
    if (length) {
     stream.node.timestamp = Date.now();
    }
    return i;
   })
  });
  return FS.mkdev(path, mode, dev);
 }),
 createLink: (function(parent, name, target, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  return FS.symlink(target, path);
 }),
 forceLoadFile: (function(obj) {
  if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
  var success = true;
  if (typeof XMLHttpRequest !== "undefined") {
   throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
  } else if (Module["read"]) {
   try {
    obj.contents = intArrayFromString(Module["read"](obj.url), true);
    obj.usedBytes = obj.contents.length;
   } catch (e) {
    success = false;
   }
  } else {
   throw new Error("Cannot load without read() or XMLHttpRequest.");
  }
  if (!success) ___setErrNo(ERRNO_CODES.EIO);
  return success;
 }),
 createLazyFile: (function(parent, name, url, canRead, canWrite) {
  function LazyUint8Array() {
   this.lengthKnown = false;
   this.chunks = [];
  }
  LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
   if (idx > this.length - 1 || idx < 0) {
    return undefined;
   }
   var chunkOffset = idx % this.chunkSize;
   var chunkNum = idx / this.chunkSize | 0;
   return this.getter(chunkNum)[chunkOffset];
  };
  LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
   this.getter = getter;
  };
  LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
   var xhr = new XMLHttpRequest;
   xhr.open("HEAD", url, false);
   xhr.send(null);
   if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
   var datalength = Number(xhr.getResponseHeader("Content-length"));
   var header;
   var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
   var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
   var chunkSize = 1024 * 1024;
   if (!hasByteServing) chunkSize = datalength;
   var doXHR = (function(from, to) {
    if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
    if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url, false);
    if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
    if (typeof Uint8Array != "undefined") xhr.responseType = "arraybuffer";
    if (xhr.overrideMimeType) {
     xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.send(null);
    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
    if (xhr.response !== undefined) {
     return new Uint8Array(xhr.response || []);
    } else {
     return intArrayFromString(xhr.responseText || "", true);
    }
   });
   var lazyArray = this;
   lazyArray.setDataGetter((function(chunkNum) {
    var start = chunkNum * chunkSize;
    var end = (chunkNum + 1) * chunkSize - 1;
    end = Math.min(end, datalength - 1);
    if (typeof lazyArray.chunks[chunkNum] === "undefined") {
     lazyArray.chunks[chunkNum] = doXHR(start, end);
    }
    if (typeof lazyArray.chunks[chunkNum] === "undefined") throw new Error("doXHR failed!");
    return lazyArray.chunks[chunkNum];
   }));
   if (usesGzip || !datalength) {
    chunkSize = datalength = 1;
    datalength = this.getter(0).length;
    chunkSize = datalength;
    console.log("LazyFiles on gzip forces download of the whole file when length is accessed");
   }
   this._length = datalength;
   this._chunkSize = chunkSize;
   this.lengthKnown = true;
  };
  if (typeof XMLHttpRequest !== "undefined") {
   if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
   var lazyArray = new LazyUint8Array;
   Object.defineProperties(lazyArray, {
    length: {
     get: (function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._length;
     })
    },
    chunkSize: {
     get: (function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._chunkSize;
     })
    }
   });
   var properties = {
    isDevice: false,
    contents: lazyArray
   };
  } else {
   var properties = {
    isDevice: false,
    url: url
   };
  }
  var node = FS.createFile(parent, name, properties, canRead, canWrite);
  if (properties.contents) {
   node.contents = properties.contents;
  } else if (properties.url) {
   node.contents = null;
   node.url = properties.url;
  }
  Object.defineProperties(node, {
   usedBytes: {
    get: (function() {
     return this.contents.length;
    })
   }
  });
  var stream_ops = {};
  var keys = Object.keys(node.stream_ops);
  keys.forEach((function(key) {
   var fn = node.stream_ops[key];
   stream_ops[key] = function forceLoadLazyFile() {
    if (!FS.forceLoadFile(node)) {
     throw new FS.ErrnoError(ERRNO_CODES.EIO);
    }
    return fn.apply(null, arguments);
   };
  }));
  stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
   if (!FS.forceLoadFile(node)) {
    throw new FS.ErrnoError(ERRNO_CODES.EIO);
   }
   var contents = stream.node.contents;
   if (position >= contents.length) return 0;
   var size = Math.min(contents.length - position, length);
   assert(size >= 0);
   if (contents.slice) {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents[position + i];
    }
   } else {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents.get(position + i);
    }
   }
   return size;
  };
  node.stream_ops = stream_ops;
  return node;
 }),
 createPreloadedFile: (function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
  Browser.init();
  var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
  var dep = getUniqueRunDependency("cp " + fullname);
  function processData(byteArray) {
   function finish(byteArray) {
    if (preFinish) preFinish();
    if (!dontCreateFile) {
     FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
    }
    if (onload) onload();
    removeRunDependency(dep);
   }
   var handled = false;
   Module["preloadPlugins"].forEach((function(plugin) {
    if (handled) return;
    if (plugin["canHandle"](fullname)) {
     plugin["handle"](byteArray, fullname, finish, (function() {
      if (onerror) onerror();
      removeRunDependency(dep);
     }));
     handled = true;
    }
   }));
   if (!handled) finish(byteArray);
  }
  addRunDependency(dep);
  if (typeof url == "string") {
   Browser.asyncLoad(url, (function(byteArray) {
    processData(byteArray);
   }), onerror);
  } else {
   processData(url);
  }
 }),
 indexedDB: (function() {
  return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 }),
 DB_NAME: (function() {
  return "EM_FS_" + window.location.pathname;
 }),
 DB_VERSION: 20,
 DB_STORE_NAME: "FILE_DATA",
 saveFilesToDB: (function(paths, onload, onerror) {
  onload = onload || (function() {});
  onerror = onerror || (function() {});
  var indexedDB = FS.indexedDB();
  try {
   var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
  } catch (e) {
   return onerror(e);
  }
  openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
   console.log("creating db");
   var db = openRequest.result;
   db.createObjectStore(FS.DB_STORE_NAME);
  };
  openRequest.onsuccess = function openRequest_onsuccess() {
   var db = openRequest.result;
   var transaction = db.transaction([ FS.DB_STORE_NAME ], "readwrite");
   var files = transaction.objectStore(FS.DB_STORE_NAME);
   var ok = 0, fail = 0, total = paths.length;
   function finish() {
    if (fail == 0) onload(); else onerror();
   }
   paths.forEach((function(path) {
    var putRequest = files.put(FS.analyzePath(path).object.contents, path);
    putRequest.onsuccess = function putRequest_onsuccess() {
     ok++;
     if (ok + fail == total) finish();
    };
    putRequest.onerror = function putRequest_onerror() {
     fail++;
     if (ok + fail == total) finish();
    };
   }));
   transaction.onerror = onerror;
  };
  openRequest.onerror = onerror;
 }),
 loadFilesFromDB: (function(paths, onload, onerror) {
  onload = onload || (function() {});
  onerror = onerror || (function() {});
  var indexedDB = FS.indexedDB();
  try {
   var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
  } catch (e) {
   return onerror(e);
  }
  openRequest.onupgradeneeded = onerror;
  openRequest.onsuccess = function openRequest_onsuccess() {
   var db = openRequest.result;
   try {
    var transaction = db.transaction([ FS.DB_STORE_NAME ], "readonly");
   } catch (e) {
    onerror(e);
    return;
   }
   var files = transaction.objectStore(FS.DB_STORE_NAME);
   var ok = 0, fail = 0, total = paths.length;
   function finish() {
    if (fail == 0) onload(); else onerror();
   }
   paths.forEach((function(path) {
    var getRequest = files.get(path);
    getRequest.onsuccess = function getRequest_onsuccess() {
     if (FS.analyzePath(path).exists) {
      FS.unlink(path);
     }
     FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
     ok++;
     if (ok + fail == total) finish();
    };
    getRequest.onerror = function getRequest_onerror() {
     fail++;
     if (ok + fail == total) finish();
    };
   }));
   transaction.onerror = onerror;
  };
  openRequest.onerror = onerror;
 })
};
var SYSCALLS = {
 DEFAULT_POLLMASK: 5,
 mappings: {},
 umask: 511,
 calculateAt: (function(dirfd, path) {
  if (path[0] !== "/") {
   var dir;
   if (dirfd === -100) {
    dir = FS.cwd();
   } else {
    var dirstream = FS.getStream(dirfd);
    if (!dirstream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    dir = dirstream.path;
   }
   path = PATH.join2(dir, path);
  }
  return path;
 }),
 doStat: (function(func, path, buf) {
  try {
   var stat = func(path);
  } catch (e) {
   if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
    return -ERRNO_CODES.ENOTDIR;
   }
   throw e;
  }
  HEAP32[buf >> 2] = stat.dev;
  HEAP32[buf + 4 >> 2] = 0;
  HEAP32[buf + 8 >> 2] = stat.ino;
  HEAP32[buf + 12 >> 2] = stat.mode;
  HEAP32[buf + 16 >> 2] = stat.nlink;
  HEAP32[buf + 20 >> 2] = stat.uid;
  HEAP32[buf + 24 >> 2] = stat.gid;
  HEAP32[buf + 28 >> 2] = stat.rdev;
  HEAP32[buf + 32 >> 2] = 0;
  HEAP32[buf + 36 >> 2] = stat.size;
  HEAP32[buf + 40 >> 2] = 4096;
  HEAP32[buf + 44 >> 2] = stat.blocks;
  HEAP32[buf + 48 >> 2] = stat.atime.getTime() / 1e3 | 0;
  HEAP32[buf + 52 >> 2] = 0;
  HEAP32[buf + 56 >> 2] = stat.mtime.getTime() / 1e3 | 0;
  HEAP32[buf + 60 >> 2] = 0;
  HEAP32[buf + 64 >> 2] = stat.ctime.getTime() / 1e3 | 0;
  HEAP32[buf + 68 >> 2] = 0;
  HEAP32[buf + 72 >> 2] = stat.ino;
  return 0;
 }),
 doMsync: (function(addr, stream, len, flags) {
  var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
  FS.msync(stream, buffer, 0, len, flags);
 }),
 doMkdir: (function(path, mode) {
  path = PATH.normalize(path);
  if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
  FS.mkdir(path, mode, 0);
  return 0;
 }),
 doMknod: (function(path, mode, dev) {
  switch (mode & 61440) {
  case 32768:
  case 8192:
  case 24576:
  case 4096:
  case 49152:
   break;
  default:
   return -ERRNO_CODES.EINVAL;
  }
  FS.mknod(path, mode, dev);
  return 0;
 }),
 doReadlink: (function(path, buf, bufsize) {
  if (bufsize <= 0) return -ERRNO_CODES.EINVAL;
  var ret = FS.readlink(path);
  var len = Math.min(bufsize, lengthBytesUTF8(ret));
  var endChar = HEAP8[buf + len];
  stringToUTF8(ret, buf, bufsize + 1);
  HEAP8[buf + len] = endChar;
  return len;
 }),
 doAccess: (function(path, amode) {
  if (amode & ~7) {
   return -ERRNO_CODES.EINVAL;
  }
  var node;
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  node = lookup.node;
  var perms = "";
  if (amode & 4) perms += "r";
  if (amode & 2) perms += "w";
  if (amode & 1) perms += "x";
  if (perms && FS.nodePermissions(node, perms)) {
   return -ERRNO_CODES.EACCES;
  }
  return 0;
 }),
 doDup: (function(path, flags, suggestFD) {
  var suggest = FS.getStream(suggestFD);
  if (suggest) FS.close(suggest);
  return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
 }),
 doReadv: (function(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   var curr = FS.read(stream, HEAP8, ptr, len, offset);
   if (curr < 0) return -1;
   ret += curr;
   if (curr < len) break;
  }
  return ret;
 }),
 doWritev: (function(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   var curr = FS.write(stream, HEAP8, ptr, len, offset);
   if (curr < 0) return -1;
   ret += curr;
  }
  return ret;
 }),
 varargs: 0,
 get: (function(varargs) {
  SYSCALLS.varargs += 4;
  var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
  return ret;
 }),
 getStr: (function() {
  var ret = Pointer_stringify(SYSCALLS.get());
  return ret;
 }),
 getStreamFromFD: (function() {
  var stream = FS.getStream(SYSCALLS.get());
  if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  return stream;
 }),
 getSocketFromFD: (function() {
  var socket = SOCKFS.getSocket(SYSCALLS.get());
  if (!socket) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  return socket;
 }),
 getSocketAddress: (function(allowNull) {
  var addrp = SYSCALLS.get(), addrlen = SYSCALLS.get();
  if (allowNull && addrp === 0) return null;
  var info = __read_sockaddr(addrp, addrlen);
  if (info.errno) throw new FS.ErrnoError(info.errno);
  info.addr = DNS.lookup_addr(info.addr) || info.addr;
  return info;
 }),
 get64: (function() {
  var low = SYSCALLS.get(), high = SYSCALLS.get();
  if (low >= 0) assert(high === 0); else assert(high === -1);
  return low;
 }),
 getZero: (function() {
  assert(SYSCALLS.get() === 0);
 })
};
function ___syscall54(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), op = SYSCALLS.get();
  switch (op) {
  case 21505:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return 0;
   }
  case 21506:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return 0;
   }
  case 21519:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    var argp = SYSCALLS.get();
    HEAP32[argp >> 2] = 0;
    return 0;
   }
  case 21520:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return -ERRNO_CODES.EINVAL;
   }
  case 21531:
   {
    var argp = SYSCALLS.get();
    return FS.ioctl(stream, op, argp);
   }
  case 21523:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return 0;
   }
  default:
   abort("bad ioctl syscall " + op);
  }
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function _emscripten_glSampleCoverage(value, invert) {
 GLctx.sampleCoverage(value, !!invert);
}
function _emscripten_glUniform4f(location, v0, v1, v2, v3) {
 GLctx.uniform4f(GL.uniforms[location], v0, v1, v2, v3);
}
function _emscripten_glFrustum(left, right, bottom, top_, nearVal, farVal) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.multiply(GLImmediate.matrix[GLImmediate.currentMatrix], GLImmediate.matrixLib.mat4.frustum(left, right, bottom, top_, nearVal, farVal));
}
function _emscripten_glGetTexParameterfv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAPF32[params >> 2] = GLctx.getTexParameter(target, pname);
}
function _emscripten_glUniform4i(location, v0, v1, v2, v3) {
 GLctx.uniform4i(GL.uniforms[location], v0, v1, v2, v3);
}
function _emscripten_glBindRenderbuffer(target, renderbuffer) {
 GLctx.bindRenderbuffer(target, renderbuffer ? GL.renderbuffers[renderbuffer] : null);
}
function _emscripten_glViewport(x0, x1, x2, x3) {
 GLctx["viewport"](x0, x1, x2, x3);
}
function _dlclose(handle) {
 if (!DLFCN.loadedLibs[handle]) {
  DLFCN.errorMsg = "Tried to dlclose() unopened handle: " + handle;
  return 1;
 } else {
  var lib_record = DLFCN.loadedLibs[handle];
  if (--lib_record.refcount == 0) {
   if (lib_record.module.cleanups) {
    lib_record.module.cleanups.forEach((function(cleanup) {
     cleanup();
    }));
   }
   delete DLFCN.loadedLibNames[lib_record.name];
   delete DLFCN.loadedLibs[handle];
  }
  return 0;
 }
}
function __emscripten_sample_gamepad_data() {
 if (!JSEvents.numGamepadsConnected) return;
 if (Browser.mainLoop.currentFrameNumber !== JSEvents.lastGamepadStateFrame || !Browser.mainLoop.currentFrameNumber) {
  JSEvents.lastGamepadState = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads : null;
  JSEvents.lastGamepadStateFrame = Browser.mainLoop.currentFrameNumber;
 }
}
function _emscripten_get_gamepad_status(index, gamepadState) {
 __emscripten_sample_gamepad_data();
 if (!JSEvents.lastGamepadState) return -1;
 if (index < 0 || index >= JSEvents.lastGamepadState.length) return -5;
 if (!JSEvents.lastGamepadState[index]) return -7;
 JSEvents.fillGamepadEventData(gamepadState, JSEvents.lastGamepadState[index]);
 return 0;
}
var _llvm_pow_f64 = Math_pow;
function _emscripten_glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx["copyTexImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
}
function _emscripten_glTexParameterfv(target, pname, params) {
 var param = HEAPF32[params >> 2];
 GLctx.texParameterf(target, pname, param);
}
function _emscripten_glLinkProgram(program) {
 GLctx.linkProgram(GL.programs[program]);
 GL.programInfos[program] = null;
 GL.populateUniformTable(program);
}
function _emscripten_glUniform3f(location, v0, v1, v2) {
 GLctx.uniform3f(GL.uniforms[location], v0, v1, v2);
}
function _emscripten_glGetProgramiv(program, pname, p) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 if (program >= GL.counter) {
  GL.recordError(1281);
  return;
 }
 var ptable = GL.programInfos[program];
 if (!ptable) {
  GL.recordError(1282);
  return;
 }
 if (pname == 35716) {
  var log = GLctx.getProgramInfoLog(GL.programs[program]);
  if (log === null) log = "(unknown error)";
  HEAP32[p >> 2] = log.length + 1;
 } else if (pname == 35719) {
  HEAP32[p >> 2] = ptable.maxUniformLength;
 } else if (pname == 35722) {
  if (ptable.maxAttributeLength == -1) {
   var program = GL.programs[program];
   var numAttribs = GLctx.getProgramParameter(program, GLctx.ACTIVE_ATTRIBUTES);
   ptable.maxAttributeLength = 0;
   for (var i = 0; i < numAttribs; ++i) {
    var activeAttrib = GLctx.getActiveAttrib(program, i);
    ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length + 1);
   }
  }
  HEAP32[p >> 2] = ptable.maxAttributeLength;
 } else if (pname == 35381) {
  if (ptable.maxUniformBlockNameLength == -1) {
   var program = GL.programs[program];
   var numBlocks = GLctx.getProgramParameter(program, GLctx.ACTIVE_UNIFORM_BLOCKS);
   ptable.maxUniformBlockNameLength = 0;
   for (var i = 0; i < numBlocks; ++i) {
    var activeBlockName = GLctx.getActiveUniformBlockName(program, i);
    ptable.maxUniformBlockNameLength = Math.max(ptable.maxUniformBlockNameLength, activeBlockName.length + 1);
   }
  }
  HEAP32[p >> 2] = ptable.maxUniformBlockNameLength;
 } else {
  HEAP32[p >> 2] = GLctx.getProgramParameter(GL.programs[program], pname);
 }
}
function _emscripten_glGetShaderiv(shader, pname, p) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 if (pname == 35716) {
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  HEAP32[p >> 2] = log.length + 1;
 } else {
  HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
 }
}
function _emscripten_glGetObjectParameterivARB(id, type, result) {
 if (GL.programs[id]) {
  if (type == 35716) {
   var log = GLctx.getProgramInfoLog(GL.programs[id]);
   if (log === null) log = "(unknown error)";
   HEAP32[result >> 2] = log.length;
   return;
  }
  _emscripten_glGetProgramiv(id, type, result);
 } else if (GL.shaders[id]) {
  if (type == 35716) {
   var log = GLctx.getShaderInfoLog(GL.shaders[id]);
   if (log === null) log = "(unknown error)";
   HEAP32[result >> 2] = log.length;
   return;
  } else if (type == 35720) {
   var source = GLctx.getShaderSource(GL.shaders[id]);
   if (source === null) return;
   HEAP32[result >> 2] = source.length;
   return;
  }
  _emscripten_glGetShaderiv(id, type, result);
 } else {
  Module.printErr("WARNING: getObjectParameteriv received invalid id: " + id);
 }
}
function _emscripten_glBlendFunc(x0, x1) {
 GLctx["blendFunc"](x0, x1);
}
function _emscripten_glUniform3i(location, v0, v1, v2) {
 GLctx.uniform3i(GL.uniforms[location], v0, v1, v2);
}
function _emscripten_glStencilOp(x0, x1, x2) {
 GLctx["stencilOp"](x0, x1, x2);
}
function _emscripten_glBindAttribLocation(program, index, name) {
 name = Pointer_stringify(name);
 GLctx.bindAttribLocation(GL.programs[program], index, name);
}
function emscriptenWebGLComputeImageSize(width, height, sizePerPixel, alignment) {
 function roundedToNextMultipleOf(x, y) {
  return Math.floor((x + y - 1) / y) * y;
 }
 var plainRowSize = width * sizePerPixel;
 var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
 return height <= 0 ? 0 : (height - 1) * alignedRowSize + plainRowSize;
}
function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
 var sizePerPixel;
 var numChannels;
 switch (format) {
 case 6406:
 case 6409:
 case 6402:
  numChannels = 1;
  break;
 case 6410:
  numChannels = 2;
  break;
 case 6407:
 case 35904:
  numChannels = 3;
  break;
 case 6408:
 case 35906:
  numChannels = 4;
  break;
 default:
  GL.recordError(1280);
  return null;
 }
 switch (type) {
 case 5121:
  sizePerPixel = numChannels * 1;
  break;
 case 5123:
 case 36193:
  sizePerPixel = numChannels * 2;
  break;
 case 5125:
 case 5126:
  sizePerPixel = numChannels * 4;
  break;
 case 34042:
  sizePerPixel = 4;
  break;
 case 33635:
 case 32819:
 case 32820:
  sizePerPixel = 2;
  break;
 default:
  GL.recordError(1280);
  return null;
 }
 var bytes = emscriptenWebGLComputeImageSize(width, height, sizePerPixel, GL.unpackAlignment);
 switch (type) {
 case 5121:
  return HEAPU8.subarray(pixels, pixels + bytes);
 case 5126:
  return HEAPF32.subarray(pixels >> 2, pixels + bytes >> 2);
 case 5125:
 case 34042:
  return HEAPU32.subarray(pixels >> 2, pixels + bytes >> 2);
 case 5123:
 case 33635:
 case 32819:
 case 32820:
 case 36193:
  return HEAPU16.subarray(pixels >> 1, pixels + bytes >> 1);
 default:
  GL.recordError(1280);
  return null;
 }
}
function _glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
 var pixelData = null;
 if (pixels) pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0);
 GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
}
function _emscripten_glEnableVertexAttribArray(index) {
 GLctx.enableVertexAttribArray(index);
}
Module["_memset"] = _memset;
function _emscripten_set_mouseleave_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerMouseEventCallback(target, userData, useCapture, callbackfunc, 34, "mouseleave");
 return 0;
}
function _emscripten_set_touchcancel_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerTouchEventCallback(target, userData, useCapture, callbackfunc, 25, "touchcancel");
 return 0;
}
function ___lock() {}
function _emscripten_glBlendFuncSeparate(x0, x1, x2, x3) {
 GLctx["blendFuncSeparate"](x0, x1, x2, x3);
}
function _emscripten_glGetVertexAttribPointerv(index, pname, pointer) {
 if (!pointer) {
  GL.recordError(1281);
  return;
 }
 HEAP32[pointer >> 2] = GLctx.getVertexAttribOffset(index, pname);
}
function _emscripten_glVertexAttrib3f(x0, x1, x2, x3) {
 GLctx["vertexAttrib3f"](x0, x1, x2, x3);
}
function _emscripten_set_mousemove_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove");
 return 0;
}
function _emscripten_glNormalPointer(type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.NORMAL, 3, type, stride, pointer);
}
var _emscripten_GetProcAddress = undefined;
Module["_emscripten_GetProcAddress"] = _emscripten_GetProcAddress;
function _eglGetProcAddress(name_) {
 return _emscripten_GetProcAddress(name_);
}
function _emscripten_get_pointerlock_status(pointerlockStatus) {
 if (pointerlockStatus) JSEvents.fillPointerlockChangeEventData(pointerlockStatus);
 if (!document.body || !document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock) {
  return -1;
 }
 return 0;
}
function _glLoadIdentity() {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.identity(GLImmediate.matrix[GLImmediate.currentMatrix]);
}
function _eglSwapInterval(display, interval) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (interval == 0) _emscripten_set_main_loop_timing(0, 0); else _emscripten_set_main_loop_timing(1, interval);
 EGL.setErrorCode(12288);
 return 1;
}
function emscriptenWebGLGetVertexAttrib(index, pname, params, type) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var data = GLctx.getVertexAttrib(index, pname);
 if (pname == 34975) {
  HEAP32[params >> 2] = data["name"];
 } else if (typeof data == "number" || typeof data == "boolean") {
  switch (type) {
  case "Integer":
   HEAP32[params >> 2] = data;
   break;
  case "Float":
   HEAPF32[params >> 2] = data;
   break;
  case "FloatToInteger":
   HEAP32[params >> 2] = Math.fround(data);
   break;
  default:
   throw "internal emscriptenWebGLGetVertexAttrib() error, bad type: " + type;
  }
 } else {
  for (var i = 0; i < data.length; i++) {
   switch (type) {
   case "Integer":
    HEAP32[params + i >> 2] = data[i];
    break;
   case "Float":
    HEAPF32[params + i >> 2] = data[i];
    break;
   case "FloatToInteger":
    HEAP32[params + i >> 2] = Math.fround(data[i]);
    break;
   default:
    throw "internal emscriptenWebGLGetVertexAttrib() error, bad type: " + type;
   }
  }
 }
}
function _emscripten_glGetVertexAttribfv(index, pname, params) {
 emscriptenWebGLGetVertexAttrib(index, pname, params, "Float");
}
function _glVertex3f(x, y, z) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = z || 0;
 GLImmediate.addRendererComponent(GLImmediate.VERTEX, 3, GLctx.FLOAT);
}
function _emscripten_set_keyup_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerKeyEventCallback(target, userData, useCapture, callbackfunc, 3, "keyup");
 return 0;
}
function _emscripten_glDeleteShader(id) {
 if (!id) return;
 var shader = GL.shaders[id];
 if (!shader) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteShader(shader);
 GL.shaders[id] = null;
}
function _emscripten_glDrawArraysInstanced(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}
function _emscripten_glDeleteBuffers(n, buffers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[buffers + i * 4 >> 2];
  var buffer = GL.buffers[id];
  if (!buffer) continue;
  GLctx.deleteBuffer(buffer);
  buffer.name = 0;
  GL.buffers[id] = null;
  if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
  if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0;
 }
}
function _emscripten_glTexParameteriv(target, pname, params) {
 var param = HEAP32[params >> 2];
 GLctx.texParameteri(target, pname, param);
}
function _emscripten_glUniformMatrix2fv(location, count, transpose, value) {
 var view;
 if (4 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  view = GL.miniTempBufferViews[4 * count - 1];
  for (var i = 0; i < 4 * count; i += 4) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
  }
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
 }
 GLctx.uniformMatrix2fv(GL.uniforms[location], !!transpose, view);
}
function _sigaction(signum, act, oldact) {
 return 0;
}
function ___syscall6(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD();
  FS.close(stream);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function _emscripten_glGetVertexAttribiv(index, pname, params) {
 emscriptenWebGLGetVertexAttrib(index, pname, params, "FloatToInteger");
}
function _emscripten_glUniformMatrix4fv(location, count, transpose, value) {
 var view;
 if (16 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  view = GL.miniTempBufferViews[16 * count - 1];
  for (var i = 0; i < 16 * count; i += 16) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
   view[i + 4] = HEAPF32[value + (4 * i + 16) >> 2];
   view[i + 5] = HEAPF32[value + (4 * i + 20) >> 2];
   view[i + 6] = HEAPF32[value + (4 * i + 24) >> 2];
   view[i + 7] = HEAPF32[value + (4 * i + 28) >> 2];
   view[i + 8] = HEAPF32[value + (4 * i + 32) >> 2];
   view[i + 9] = HEAPF32[value + (4 * i + 36) >> 2];
   view[i + 10] = HEAPF32[value + (4 * i + 40) >> 2];
   view[i + 11] = HEAPF32[value + (4 * i + 44) >> 2];
   view[i + 12] = HEAPF32[value + (4 * i + 48) >> 2];
   view[i + 13] = HEAPF32[value + (4 * i + 52) >> 2];
   view[i + 14] = HEAPF32[value + (4 * i + 56) >> 2];
   view[i + 15] = HEAPF32[value + (4 * i + 60) >> 2];
  }
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2);
 }
 GLctx.uniformMatrix4fv(GL.uniforms[location], !!transpose, view);
}
function _emscripten_glEnableClientState(cap) {
 var attrib = GLEmulation.getAttributeFromCapability(cap);
 if (attrib === null) {
  return;
 }
 if (!GLImmediate.enabledClientAttributes[attrib]) {
  GLImmediate.enabledClientAttributes[attrib] = true;
  GLImmediate.totalEnabledClientAttributes++;
  GLImmediate.currentRenderer = null;
  if (GLEmulation.currentVao) GLEmulation.currentVao.enabledClientStates[cap] = 1;
  GLImmediate.modifiedClientAttributes = true;
 }
}
function _emscripten_glGetPointerv(name, p) {
 var attribute;
 switch (name) {
 case 32910:
  attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
  break;
 case 32912:
  attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
  break;
 case 32914:
  attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
  break;
 default:
  GL.recordError(1280);
  return;
 }
 HEAP32[p >> 2] = attribute ? attribute.pointer : 0;
}
function ___syscall140(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
  var offset = offset_low;
  assert(offset_high === 0);
  FS.llseek(stream, offset, whence);
  HEAP32[result >> 2] = stream.position;
  if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function ___syscall146(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
  return SYSCALLS.doWritev(stream, iov, iovcnt);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function ___syscall145(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
  return SYSCALLS.doReadv(stream, iov, iovcnt);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function _atexit(func, arg) {
 __ATEXIT__.unshift({
  func: func,
  arg: arg
 });
}
function ___cxa_atexit() {
 return _atexit.apply(null, arguments);
}
function _emscripten_glStencilFuncSeparate(x0, x1, x2, x3) {
 GLctx["stencilFuncSeparate"](x0, x1, x2, x3);
}
function _glPopMatrix() {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrix[GLImmediate.currentMatrix] = GLImmediate.matrixStack[GLImmediate.currentMatrix].pop();
}
function _glTexCoord2f(u, v) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = u;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = v;
 GLImmediate.addRendererComponent(GLImmediate.TEXTURE0, 2, GLctx.FLOAT);
}
function _eglGetConfigAttrib(display, config, attribute, value) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (config != 62002) {
  EGL.setErrorCode(12293);
  return 0;
 }
 if (!value) {
  EGL.setErrorCode(12300);
  return 0;
 }
 EGL.setErrorCode(12288);
 switch (attribute) {
 case 12320:
  HEAP32[value >> 2] = 32;
  return 1;
 case 12321:
  HEAP32[value >> 2] = 8;
  return 1;
 case 12322:
  HEAP32[value >> 2] = 8;
  return 1;
 case 12323:
  HEAP32[value >> 2] = 8;
  return 1;
 case 12324:
  HEAP32[value >> 2] = 8;
  return 1;
 case 12325:
  HEAP32[value >> 2] = 24;
  return 1;
 case 12326:
  HEAP32[value >> 2] = 8;
  return 1;
 case 12327:
  HEAP32[value >> 2] = 12344;
  return 1;
 case 12328:
  HEAP32[value >> 2] = 62002;
  return 1;
 case 12329:
  HEAP32[value >> 2] = 0;
  return 1;
 case 12330:
  HEAP32[value >> 2] = 4096;
  return 1;
 case 12331:
  HEAP32[value >> 2] = 16777216;
  return 1;
 case 12332:
  HEAP32[value >> 2] = 4096;
  return 1;
 case 12333:
  HEAP32[value >> 2] = 0;
  return 1;
 case 12334:
  HEAP32[value >> 2] = 0;
  return 1;
 case 12335:
  HEAP32[value >> 2] = 12344;
  return 1;
 case 12337:
  HEAP32[value >> 2] = 4;
  return 1;
 case 12338:
  HEAP32[value >> 2] = 1;
  return 1;
 case 12339:
  HEAP32[value >> 2] = 4;
  return 1;
 case 12340:
  HEAP32[value >> 2] = 12344;
  return 1;
 case 12341:
 case 12342:
 case 12343:
  HEAP32[value >> 2] = -1;
  return 1;
 case 12345:
 case 12346:
  HEAP32[value >> 2] = 0;
  return 1;
 case 12347:
 case 12348:
  HEAP32[value >> 2] = 1;
  return 1;
 case 12349:
 case 12350:
  HEAP32[value >> 2] = 0;
  return 1;
 case 12351:
  HEAP32[value >> 2] = 12430;
  return 1;
 case 12352:
  HEAP32[value >> 2] = 4;
  return 1;
 case 12354:
  HEAP32[value >> 2] = 0;
  return 1;
 default:
  EGL.setErrorCode(12292);
  return 0;
 }
}
function __ZSt18uncaught_exceptionv() {
 return !!__ZSt18uncaught_exceptionv.uncaught_exception;
}
var EXCEPTIONS = {
 last: 0,
 caught: [],
 infos: {},
 deAdjust: (function(adjusted) {
  if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
  for (var ptr in EXCEPTIONS.infos) {
   var info = EXCEPTIONS.infos[ptr];
   if (info.adjusted === adjusted) {
    return ptr;
   }
  }
  return adjusted;
 }),
 addRef: (function(ptr) {
  if (!ptr) return;
  var info = EXCEPTIONS.infos[ptr];
  info.refcount++;
 }),
 decRef: (function(ptr) {
  if (!ptr) return;
  var info = EXCEPTIONS.infos[ptr];
  assert(info.refcount > 0);
  info.refcount--;
  if (info.refcount === 0 && !info.rethrown) {
   if (info.destructor) {
    Module["dynCall_vi"](info.destructor, ptr);
   }
   delete EXCEPTIONS.infos[ptr];
   ___cxa_free_exception(ptr);
  }
 }),
 clearRef: (function(ptr) {
  if (!ptr) return;
  var info = EXCEPTIONS.infos[ptr];
  info.refcount = 0;
 })
};
function ___resumeException(ptr) {
 if (!EXCEPTIONS.last) {
  EXCEPTIONS.last = ptr;
 }
 throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
}
function ___cxa_find_matching_catch() {
 var thrown = EXCEPTIONS.last;
 if (!thrown) {
  return (Runtime.setTempRet0(0), 0) | 0;
 }
 var info = EXCEPTIONS.infos[thrown];
 var throwntype = info.type;
 if (!throwntype) {
  return (Runtime.setTempRet0(0), thrown) | 0;
 }
 var typeArray = Array.prototype.slice.call(arguments);
 var pointer = Module["___cxa_is_pointer_type"](throwntype);
 if (!___cxa_find_matching_catch.buffer) ___cxa_find_matching_catch.buffer = _malloc(4);
 HEAP32[___cxa_find_matching_catch.buffer >> 2] = thrown;
 thrown = ___cxa_find_matching_catch.buffer;
 for (var i = 0; i < typeArray.length; i++) {
  if (typeArray[i] && Module["___cxa_can_catch"](typeArray[i], throwntype, thrown)) {
   thrown = HEAP32[thrown >> 2];
   info.adjusted = thrown;
   return (Runtime.setTempRet0(typeArray[i]), thrown) | 0;
  }
 }
 thrown = HEAP32[thrown >> 2];
 return (Runtime.setTempRet0(throwntype), thrown) | 0;
}
function ___cxa_throw(ptr, type, destructor) {
 EXCEPTIONS.infos[ptr] = {
  ptr: ptr,
  adjusted: ptr,
  type: type,
  destructor: destructor,
  refcount: 0,
  caught: false,
  rethrown: false
 };
 EXCEPTIONS.last = ptr;
 if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
  __ZSt18uncaught_exceptionv.uncaught_exception = 1;
 } else {
  __ZSt18uncaught_exceptionv.uncaught_exception++;
 }
 throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
}
function _emscripten_set_touchend_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerTouchEventCallback(target, userData, useCapture, callbackfunc, 23, "touchend");
 return 0;
}
function __setLetterbox(element, topBottom, leftRight) {
 if (JSEvents.isInternetExplorer()) {
  element.style.marginLeft = element.style.marginRight = leftRight + "px";
  element.style.marginTop = element.style.marginBottom = topBottom + "px";
 } else {
  element.style.paddingLeft = element.style.paddingRight = leftRight + "px";
  element.style.paddingTop = element.style.paddingBottom = topBottom + "px";
 }
}
function _emscripten_do_request_fullscreen(target, strategy) {
 if (typeof JSEvents.fullscreenEnabled() === "undefined") return -1;
 if (!JSEvents.fullscreenEnabled()) return -3;
 if (!target) target = "#canvas";
 target = JSEvents.findEventTarget(target);
 if (!target) return -4;
 if (!target.requestFullscreen && !target.msRequestFullscreen && !target.mozRequestFullScreen && !target.mozRequestFullscreen && !target.webkitRequestFullscreen) {
  return -3;
 }
 var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
 if (!canPerformRequests) {
  if (strategy.deferUntilInEventHandler) {
   JSEvents.deferCall(JSEvents.requestFullscreen, 1, [ target, strategy ]);
   return 1;
  } else {
   return -2;
  }
 }
 return JSEvents.requestFullscreen(target, strategy);
}
function __registerRestoreOldStyle(canvas) {
 var oldWidth = canvas.width;
 var oldHeight = canvas.height;
 var oldCssWidth = canvas.style.width;
 var oldCssHeight = canvas.style.height;
 var oldBackgroundColor = canvas.style.backgroundColor;
 var oldDocumentBackgroundColor = document.body.style.backgroundColor;
 var oldPaddingLeft = canvas.style.paddingLeft;
 var oldPaddingRight = canvas.style.paddingRight;
 var oldPaddingTop = canvas.style.paddingTop;
 var oldPaddingBottom = canvas.style.paddingBottom;
 var oldMarginLeft = canvas.style.marginLeft;
 var oldMarginRight = canvas.style.marginRight;
 var oldMarginTop = canvas.style.marginTop;
 var oldMarginBottom = canvas.style.marginBottom;
 var oldDocumentBodyMargin = document.body.style.margin;
 var oldDocumentOverflow = document.documentElement.style.overflow;
 var oldDocumentScroll = document.body.scroll;
 var oldImageRendering = canvas.style.imageRendering;
 function restoreOldStyle() {
  var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
  if (!fullscreenElement) {
   document.removeEventListener("fullscreenchange", restoreOldStyle);
   document.removeEventListener("mozfullscreenchange", restoreOldStyle);
   document.removeEventListener("webkitfullscreenchange", restoreOldStyle);
   document.removeEventListener("MSFullscreenChange", restoreOldStyle);
   canvas.width = oldWidth;
   canvas.height = oldHeight;
   canvas.style.width = oldCssWidth;
   canvas.style.height = oldCssHeight;
   canvas.style.backgroundColor = oldBackgroundColor;
   if (!oldDocumentBackgroundColor) document.body.style.backgroundColor = "white";
   document.body.style.backgroundColor = oldDocumentBackgroundColor;
   canvas.style.paddingLeft = oldPaddingLeft;
   canvas.style.paddingRight = oldPaddingRight;
   canvas.style.paddingTop = oldPaddingTop;
   canvas.style.paddingBottom = oldPaddingBottom;
   canvas.style.marginLeft = oldMarginLeft;
   canvas.style.marginRight = oldMarginRight;
   canvas.style.marginTop = oldMarginTop;
   canvas.style.marginBottom = oldMarginBottom;
   document.body.style.margin = oldDocumentBodyMargin;
   document.documentElement.style.overflow = oldDocumentOverflow;
   document.body.scroll = oldDocumentScroll;
   canvas.style.imageRendering = oldImageRendering;
   if (canvas.GLctxObject) canvas.GLctxObject.GLctx.viewport(0, 0, oldWidth, oldHeight);
   if (__currentFullscreenStrategy.canvasResizedCallback) {
    Module["dynCall_iiii"](__currentFullscreenStrategy.canvasResizedCallback, 37, 0, __currentFullscreenStrategy.canvasResizedCallbackUserData);
   }
  }
 }
 document.addEventListener("fullscreenchange", restoreOldStyle);
 document.addEventListener("mozfullscreenchange", restoreOldStyle);
 document.addEventListener("webkitfullscreenchange", restoreOldStyle);
 document.addEventListener("MSFullscreenChange", restoreOldStyle);
 return restoreOldStyle;
}
function _emscripten_request_fullscreen_strategy(target, deferUntilInEventHandler, fullscreenStrategy) {
 var strategy = {};
 strategy.scaleMode = HEAP32[fullscreenStrategy >> 2];
 strategy.canvasResolutionScaleMode = HEAP32[fullscreenStrategy + 4 >> 2];
 strategy.filteringMode = HEAP32[fullscreenStrategy + 8 >> 2];
 strategy.deferUntilInEventHandler = deferUntilInEventHandler;
 strategy.canvasResizedCallback = HEAP32[fullscreenStrategy + 12 >> 2];
 strategy.canvasResizedCallbackUserData = HEAP32[fullscreenStrategy + 16 >> 2];
 __currentFullscreenStrategy = strategy;
 return _emscripten_do_request_fullscreen(target, strategy);
}
function _glBegin(mode) {
 GLImmediate.enabledClientAttributes_preBegin = GLImmediate.enabledClientAttributes;
 GLImmediate.enabledClientAttributes = [];
 GLImmediate.clientAttributes_preBegin = GLImmediate.clientAttributes;
 GLImmediate.clientAttributes = [];
 for (var i = 0; i < GLImmediate.clientAttributes_preBegin.length; i++) {
  GLImmediate.clientAttributes.push({});
 }
 GLImmediate.mode = mode;
 GLImmediate.vertexCounter = 0;
 var components = GLImmediate.rendererComponents = [];
 for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
  components[i] = 0;
 }
 GLImmediate.rendererComponentPointer = 0;
 GLImmediate.vertexData = GLImmediate.tempData;
}
function _emscripten_glDisableVertexAttribArray(index) {
 GLctx.disableVertexAttribArray(index);
}
function _emscripten_glVertexAttrib1f(x0, x1) {
 GLctx["vertexAttrib1f"](x0, x1);
}
function _glVertexPointer(size, type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.VERTEX, size, type, stride, pointer);
}
function _emscripten_glFinish() {
 GLctx["finish"]();
}
function _glDrawArrays(mode, first, count) {
 GLctx.drawArrays(mode, first, count);
}
function _emscripten_set_touchstart_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerTouchEventCallback(target, userData, useCapture, callbackfunc, 22, "touchstart");
 return 0;
}
function _emscripten_glDepthFunc(x0) {
 GLctx["depthFunc"](x0);
}
function _emscripten_get_num_gamepads() {
 if (!JSEvents.numGamepadsConnected) return 0;
 __emscripten_sample_gamepad_data();
 if (!JSEvents.lastGamepadState) return -1;
 return JSEvents.lastGamepadState.length;
}
function _emscripten_set_blur_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerFocusEventCallback(target, userData, useCapture, callbackfunc, 12, "blur");
 return 0;
}
function ___syscall5(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var pathname = SYSCALLS.getStr(), flags = SYSCALLS.get(), mode = SYSCALLS.get();
  var stream = FS.open(pathname, flags, mode);
  return stream.fd;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function _emscripten_glUniform4iv(location, count, value) {
 GLctx.uniform4iv(GL.uniforms[location], HEAP32.subarray(value >> 2, value + count * 16 >> 2));
}
function _glClear(x0) {
 GLctx["clear"](x0);
}
function emscriptenWebGLGetUniform(program, location, params, type) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var data = GLctx.getUniform(GL.programs[program], GL.uniforms[location]);
 if (typeof data == "number" || typeof data == "boolean") {
  switch (type) {
  case "Integer":
   HEAP32[params >> 2] = data;
   break;
  case "Float":
   HEAPF32[params >> 2] = data;
   break;
  default:
   throw "internal emscriptenWebGLGetUniform() error, bad type: " + type;
  }
 } else {
  for (var i = 0; i < data.length; i++) {
   switch (type) {
   case "Integer":
    HEAP32[params + i >> 2] = data[i];
    break;
   case "Float":
    HEAPF32[params + i >> 2] = data[i];
    break;
   default:
    throw "internal emscriptenWebGLGetUniform() error, bad type: " + type;
   }
  }
 }
}
function _emscripten_glGetUniformiv(program, location, params) {
 emscriptenWebGLGetUniform(program, location, params, "Integer");
}
function _emscripten_set_resize_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerUiEventCallback(target, userData, useCapture, callbackfunc, 10, "resize");
 return 0;
}
function _emscripten_glLoadIdentity() {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.identity(GLImmediate.matrix[GLImmediate.currentMatrix]);
}
function _emscripten_set_element_css_size(target, width, height) {
 if (!target) {
  target = Module["canvas"];
 } else {
  target = JSEvents.findEventTarget(target);
 }
 if (!target) return -4;
 target.style.setProperty("width", width + "px");
 target.style.setProperty("height", height + "px");
 return 0;
}
function ___syscall91(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var addr = SYSCALLS.get(), len = SYSCALLS.get();
  var info = SYSCALLS.mappings[addr];
  if (!info) return 0;
  if (len === info.len) {
   var stream = FS.getStream(info.fd);
   SYSCALLS.doMsync(addr, stream, len, info.flags);
   FS.munmap(stream);
   SYSCALLS.mappings[addr] = null;
   if (info.allocated) {
    _free(info.malloc);
   }
  }
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function _emscripten_glAttachShader(program, shader) {
 GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
}
function _glBindTexture(target, texture) {
 GLctx.bindTexture(target, texture ? GL.textures[texture] : null);
}
function _emscripten_glGetRenderbufferParameteriv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.getRenderbufferParameter(target, pname);
}
function _emscripten_request_pointerlock(target, deferUntilInEventHandler) {
 if (!target) target = "#canvas";
 target = JSEvents.findEventTarget(target);
 if (!target) return -4;
 if (!target.requestPointerLock && !target.mozRequestPointerLock && !target.webkitRequestPointerLock && !target.msRequestPointerLock) {
  return -1;
 }
 var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
 if (!canPerformRequests) {
  if (deferUntilInEventHandler) {
   JSEvents.deferCall(JSEvents.requestPointerLock, 2, [ target ]);
   return 1;
  } else {
   return -2;
  }
 }
 return JSEvents.requestPointerLock(target);
}
function _glShadeModel() {
 Runtime.warnOnce("TODO: glShadeModel");
}
function _eglSwapBuffers() {
 if (!EGL.defaultDisplayInitialized) {
  EGL.setErrorCode(12289);
 } else if (!Module.ctx) {
  EGL.setErrorCode(12290);
 } else if (Module.ctx.isContextLost()) {
  EGL.setErrorCode(12302);
 } else {
  EGL.setErrorCode(12288);
  return 1;
 }
 return 0;
}
function _emscripten_glColorPointer(size, type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.COLOR, size, type, stride, pointer);
}
function _glDisableClientState(cap) {
 var attrib = GLEmulation.getAttributeFromCapability(cap);
 if (attrib === null) {
  return;
 }
 if (GLImmediate.enabledClientAttributes[attrib]) {
  GLImmediate.enabledClientAttributes[attrib] = false;
  GLImmediate.totalEnabledClientAttributes--;
  GLImmediate.currentRenderer = null;
  if (GLEmulation.currentVao) delete GLEmulation.currentVao.enabledClientStates[cap];
  GLImmediate.modifiedClientAttributes = true;
 }
}
function _gettimeofday(ptr) {
 var now = Date.now();
 HEAP32[ptr >> 2] = now / 1e3 | 0;
 HEAP32[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0;
 return 0;
}
function _emscripten_glClearStencil(x0) {
 GLctx["clearStencil"](x0);
}
function _emscripten_glDetachShader(program, shader) {
 GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
}
function _emscripten_get_device_pixel_ratio() {
 return window.devicePixelRatio || 1;
}
function _emulGlDeleteVertexArrays(n, vaos) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[vaos + i * 4 >> 2];
  GLEmulation.vaos[id] = null;
  if (GLEmulation.currentVao && GLEmulation.currentVao.id == id) GLEmulation.currentVao = null;
 }
}
function _emscripten_glDeleteVertexArrays(n, vaos) {
 _emulGlDeleteVertexArrays(n, vaos);
}
function _emscripten_glTexParameteri(x0, x1, x2) {
 GLctx["texParameteri"](x0, x1, x2);
}
function _emscripten_get_element_css_size(target, width, height) {
 if (!target) {
  target = Module["canvas"];
 } else {
  target = JSEvents.findEventTarget(target);
 }
 if (!target) return -4;
 if (target.getBoundingClientRect) {
  var rect = target.getBoundingClientRect();
  HEAPF64[width >> 3] = rect.right - rect.left;
  HEAPF64[height >> 3] = rect.bottom - rect.top;
 } else {
  HEAPF64[width >> 3] = target.clientWidth;
  HEAPF64[height >> 3] = target.clientHeight;
 }
 return 0;
}
function _emscripten_glMatrixMode(mode) {
 if (mode == 5888) {
  GLImmediate.currentMatrix = 0;
 } else if (mode == 5889) {
  GLImmediate.currentMatrix = 1;
 } else if (mode == 5890) {
  GLImmediate.useTextureMatrix = true;
  GLImmediate.currentMatrix = 2 + GLImmediate.clientActiveTexture;
 } else {
  throw "Wrong mode " + mode + " passed to glMatrixMode";
 }
}
function _emscripten_glGetTexParameteriv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.getTexParameter(target, pname);
}
function _emscripten_get_now_is_monotonic() {
 return ENVIRONMENT_IS_NODE || typeof dateNow !== "undefined" || (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self["performance"] && self["performance"]["now"];
}
function _clock_gettime(clk_id, tp) {
 var now;
 if (clk_id === 0) {
  now = Date.now();
 } else if (clk_id === 1 && _emscripten_get_now_is_monotonic()) {
  now = _emscripten_get_now();
 } else {
  ___setErrNo(ERRNO_CODES.EINVAL);
  return -1;
 }
 HEAP32[tp >> 2] = now / 1e3 | 0;
 HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
 return 0;
}
function _emscripten_glGenerateMipmap(x0) {
 GLctx["generateMipmap"](x0);
}
function _glTexCoordPointer(size, type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture, size, type, stride, pointer);
}
function _emscripten_glCullFace(x0) {
 GLctx["cullFace"](x0);
}
function _glDeleteTextures(n, textures) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[textures + i * 4 >> 2];
  var texture = GL.textures[id];
  if (!texture) continue;
  GLctx.deleteTexture(texture);
  texture.name = 0;
  GL.textures[id] = null;
 }
}
function _emscripten_glUseProgram(program) {
 GLctx.useProgram(program ? GL.programs[program] : null);
}
function _emscripten_glHint(x0, x1) {
 GLctx["hint"](x0, x1);
}
function _emscripten_glFramebufferTexture2D(target, attachment, textarget, texture, level) {
 GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
}
function _dlsym(handle, symbol) {
 symbol = Pointer_stringify(symbol);
 if (!DLFCN.loadedLibs[handle]) {
  DLFCN.errorMsg = "Tried to dlsym() from an unopened handle: " + handle;
  return 0;
 } else {
  var lib = DLFCN.loadedLibs[handle];
  symbol = "_" + symbol;
  if (lib.cached_functions.hasOwnProperty(symbol)) {
   return lib.cached_functions[symbol];
  }
  if (!lib.module.hasOwnProperty(symbol)) {
   DLFCN.errorMsg = 'Tried to lookup unknown symbol "' + symbol + '" in dynamic lib: ' + lib.name;
   return 0;
  } else {
   var result = lib.module[symbol];
   if (typeof result == "function") {
    result = Runtime.addFunction(result);
    lib.cached_functions = result;
   }
   return result;
  }
 }
}
function _emscripten_glUniform2fv(location, count, value) {
 var view;
 if (2 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  view = GL.miniTempBufferViews[2 * count - 1];
  for (var i = 0; i < 2 * count; i += 2) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
  }
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 8 >> 2);
 }
 GLctx.uniform2fv(GL.uniforms[location], view);
}
function __isLeapYear(year) {
 return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function __arraySum(array, index) {
 var sum = 0;
 for (var i = 0; i <= index; sum += array[i++]) ;
 return sum;
}
var __MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
var __MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
function __addDays(date, days) {
 var newDate = new Date(date.getTime());
 while (days > 0) {
  var leap = __isLeapYear(newDate.getFullYear());
  var currentMonth = newDate.getMonth();
  var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  if (days > daysInCurrentMonth - newDate.getDate()) {
   days -= daysInCurrentMonth - newDate.getDate() + 1;
   newDate.setDate(1);
   if (currentMonth < 11) {
    newDate.setMonth(currentMonth + 1);
   } else {
    newDate.setMonth(0);
    newDate.setFullYear(newDate.getFullYear() + 1);
   }
  } else {
   newDate.setDate(newDate.getDate() + days);
   return newDate;
  }
 }
 return newDate;
}
function _strftime(s, maxsize, format, tm) {
 var tm_zone = HEAP32[tm + 40 >> 2];
 var date = {
  tm_sec: HEAP32[tm >> 2],
  tm_min: HEAP32[tm + 4 >> 2],
  tm_hour: HEAP32[tm + 8 >> 2],
  tm_mday: HEAP32[tm + 12 >> 2],
  tm_mon: HEAP32[tm + 16 >> 2],
  tm_year: HEAP32[tm + 20 >> 2],
  tm_wday: HEAP32[tm + 24 >> 2],
  tm_yday: HEAP32[tm + 28 >> 2],
  tm_isdst: HEAP32[tm + 32 >> 2],
  tm_gmtoff: HEAP32[tm + 36 >> 2],
  tm_zone: tm_zone ? Pointer_stringify(tm_zone) : ""
 };
 var pattern = Pointer_stringify(format);
 var EXPANSION_RULES_1 = {
  "%c": "%a %b %d %H:%M:%S %Y",
  "%D": "%m/%d/%y",
  "%F": "%Y-%m-%d",
  "%h": "%b",
  "%r": "%I:%M:%S %p",
  "%R": "%H:%M",
  "%T": "%H:%M:%S",
  "%x": "%m/%d/%y",
  "%X": "%H:%M:%S"
 };
 for (var rule in EXPANSION_RULES_1) {
  pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
 }
 var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
 var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
 function leadingSomething(value, digits, character) {
  var str = typeof value === "number" ? value.toString() : value || "";
  while (str.length < digits) {
   str = character[0] + str;
  }
  return str;
 }
 function leadingNulls(value, digits) {
  return leadingSomething(value, digits, "0");
 }
 function compareByDay(date1, date2) {
  function sgn(value) {
   return value < 0 ? -1 : value > 0 ? 1 : 0;
  }
  var compare;
  if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
   if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
    compare = sgn(date1.getDate() - date2.getDate());
   }
  }
  return compare;
 }
 function getFirstWeekStartDate(janFourth) {
  switch (janFourth.getDay()) {
  case 0:
   return new Date(janFourth.getFullYear() - 1, 11, 29);
  case 1:
   return janFourth;
  case 2:
   return new Date(janFourth.getFullYear(), 0, 3);
  case 3:
   return new Date(janFourth.getFullYear(), 0, 2);
  case 4:
   return new Date(janFourth.getFullYear(), 0, 1);
  case 5:
   return new Date(janFourth.getFullYear() - 1, 11, 31);
  case 6:
   return new Date(janFourth.getFullYear() - 1, 11, 30);
  }
 }
 function getWeekBasedYear(date) {
  var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
  var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
  var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
  var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
  var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
   if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
    return thisDate.getFullYear() + 1;
   } else {
    return thisDate.getFullYear();
   }
  } else {
   return thisDate.getFullYear() - 1;
  }
 }
 var EXPANSION_RULES_2 = {
  "%a": (function(date) {
   return WEEKDAYS[date.tm_wday].substring(0, 3);
  }),
  "%A": (function(date) {
   return WEEKDAYS[date.tm_wday];
  }),
  "%b": (function(date) {
   return MONTHS[date.tm_mon].substring(0, 3);
  }),
  "%B": (function(date) {
   return MONTHS[date.tm_mon];
  }),
  "%C": (function(date) {
   var year = date.tm_year + 1900;
   return leadingNulls(year / 100 | 0, 2);
  }),
  "%d": (function(date) {
   return leadingNulls(date.tm_mday, 2);
  }),
  "%e": (function(date) {
   return leadingSomething(date.tm_mday, 2, " ");
  }),
  "%g": (function(date) {
   return getWeekBasedYear(date).toString().substring(2);
  }),
  "%G": (function(date) {
   return getWeekBasedYear(date);
  }),
  "%H": (function(date) {
   return leadingNulls(date.tm_hour, 2);
  }),
  "%I": (function(date) {
   var twelveHour = date.tm_hour;
   if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
   return leadingNulls(twelveHour, 2);
  }),
  "%j": (function(date) {
   return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3);
  }),
  "%m": (function(date) {
   return leadingNulls(date.tm_mon + 1, 2);
  }),
  "%M": (function(date) {
   return leadingNulls(date.tm_min, 2);
  }),
  "%n": (function() {
   return "\n";
  }),
  "%p": (function(date) {
   if (date.tm_hour >= 0 && date.tm_hour < 12) {
    return "AM";
   } else {
    return "PM";
   }
  }),
  "%S": (function(date) {
   return leadingNulls(date.tm_sec, 2);
  }),
  "%t": (function() {
   return "\t";
  }),
  "%u": (function(date) {
   var day = new Date(date.tm_year + 1900, date.tm_mon + 1, date.tm_mday, 0, 0, 0, 0);
   return day.getDay() || 7;
  }),
  "%U": (function(date) {
   var janFirst = new Date(date.tm_year + 1900, 0, 1);
   var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
   var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
   if (compareByDay(firstSunday, endDate) < 0) {
    var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
    var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
    var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
    return leadingNulls(Math.ceil(days / 7), 2);
   }
   return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00";
  }),
  "%V": (function(date) {
   var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
   var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
   var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
   var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
   var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
   if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
    return "53";
   }
   if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
    return "01";
   }
   var daysDifference;
   if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
    daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate();
   } else {
    daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate();
   }
   return leadingNulls(Math.ceil(daysDifference / 7), 2);
  }),
  "%w": (function(date) {
   var day = new Date(date.tm_year + 1900, date.tm_mon + 1, date.tm_mday, 0, 0, 0, 0);
   return day.getDay();
  }),
  "%W": (function(date) {
   var janFirst = new Date(date.tm_year, 0, 1);
   var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
   var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
   if (compareByDay(firstMonday, endDate) < 0) {
    var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
    var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
    var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
    return leadingNulls(Math.ceil(days / 7), 2);
   }
   return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00";
  }),
  "%y": (function(date) {
   return (date.tm_year + 1900).toString().substring(2);
  }),
  "%Y": (function(date) {
   return date.tm_year + 1900;
  }),
  "%z": (function(date) {
   var off = date.tm_gmtoff;
   var ahead = off >= 0;
   off = Math.abs(off) / 60;
   off = off / 60 * 100 + off % 60;
   return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
  }),
  "%Z": (function(date) {
   return date.tm_zone;
  }),
  "%%": (function() {
   return "%";
  })
 };
 for (var rule in EXPANSION_RULES_2) {
  if (pattern.indexOf(rule) >= 0) {
   pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
  }
 }
 var bytes = intArrayFromString(pattern, false);
 if (bytes.length > maxsize) {
  return 0;
 }
 writeArrayToMemory(bytes, s);
 return bytes.length - 1;
}
function _strftime_l(s, maxsize, format, tm) {
 return _strftime(s, maxsize, format, tm);
}
function _abort() {
 Module["abort"]();
}
function _emscripten_glVertexAttribDivisor(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}
function _emscripten_glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
 GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
}
function _emscripten_glDeleteFramebuffers(n, framebuffers) {
 for (var i = 0; i < n; ++i) {
  var id = HEAP32[framebuffers + i * 4 >> 2];
  var framebuffer = GL.framebuffers[id];
  if (!framebuffer) continue;
  GLctx.deleteFramebuffer(framebuffer);
  framebuffer.name = 0;
  GL.framebuffers[id] = null;
 }
}
function _emscripten_glIsBuffer(buffer) {
 var b = GL.buffers[buffer];
 if (!b) return 0;
 return GLctx.isBuffer(b);
}
function _emscripten_glUniform2iv(location, count, value) {
 GLctx.uniform2iv(GL.uniforms[location], HEAP32.subarray(value >> 2, value + count * 8 >> 2));
}
function _emscripten_glVertexAttrib1fv(index, v) {
 GLctx.vertexAttrib1f(index, HEAPF32[v >> 2]);
}
function _emscripten_glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
 var pixelData = null;
 if (pixels) pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0);
 GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
}
function _emscripten_glPolygonOffset(x0, x1) {
 GLctx["polygonOffset"](x0, x1);
}
function _emscripten_glUniform2f(location, v0, v1) {
 GLctx.uniform2f(GL.uniforms[location], v0, v1);
}
function ___unlock() {}
function _emscripten_glUniform2i(location, v0, v1) {
 GLctx.uniform2i(GL.uniforms[location], v0, v1);
}
function _glBlendFunc(x0, x1) {
 GLctx["blendFunc"](x0, x1);
}
function _emscripten_glDeleteRenderbuffers(n, renderbuffers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[renderbuffers + i * 4 >> 2];
  var renderbuffer = GL.renderbuffers[id];
  if (!renderbuffer) continue;
  GLctx.deleteRenderbuffer(renderbuffer);
  renderbuffer.name = 0;
  GL.renderbuffers[id] = null;
 }
}
function _emscripten_glGetBufferParameteriv(target, value, data) {
 if (!data) {
  GL.recordError(1281);
  return;
 }
 HEAP32[data >> 2] = GLctx.getBufferParameter(target, value);
}
Module["_testSetjmp"] = _testSetjmp;
function _longjmp(env, value) {
 Module["setThrew"](env, value || 1);
 throw "longjmp";
}
function _emscripten_glDepthMask(flag) {
 GLctx.depthMask(!!flag);
}
function _emscripten_set_mousedown_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerMouseEventCallback(target, userData, useCapture, callbackfunc, 5, "mousedown");
 return 0;
}
function _emscripten_glDepthRangef(x0, x1) {
 GLctx["depthRange"](x0, x1);
}
var PTHREAD_SPECIFIC = {};
function _pthread_getspecific(key) {
 return PTHREAD_SPECIFIC[key] || 0;
}
function _emscripten_set_fullscreenchange_callback(target, userData, useCapture, callbackfunc) {
 if (typeof JSEvents.fullscreenEnabled() === "undefined") return -1;
 if (!target) target = document; else {
  target = JSEvents.findEventTarget(target);
  if (!target) return -4;
 }
 JSEvents.registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "fullscreenchange");
 JSEvents.registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "mozfullscreenchange");
 JSEvents.registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "webkitfullscreenchange");
 JSEvents.registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "msfullscreenchange");
 return 0;
}
function _emscripten_glOrtho(left, right, bottom, top_, nearVal, farVal) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.multiply(GLImmediate.matrix[GLImmediate.currentMatrix], GLImmediate.matrixLib.mat4.ortho(left, right, bottom, top_, nearVal, farVal));
}
function _gluOrtho2D(left, right, bottom, top) {
 _emscripten_glOrtho(left, right, bottom, top, -1, 1);
}
function _eglChooseConfig(display, attrib_list, configs, config_size, numConfigs) {
 return EGL.chooseConfig(display, attrib_list, configs, config_size, numConfigs);
}
function _emscripten_glGetShaderPrecisionFormat() {
 throw "glGetShaderPrecisionFormat: TODO";
}
function _emscripten_glUniform1fv(location, count, value) {
 var view;
 if (count <= GL.MINI_TEMP_BUFFER_SIZE) {
  view = GL.miniTempBufferViews[count - 1];
  for (var i = 0; i < count; ++i) {
   view[i] = HEAPF32[value + 4 * i >> 2];
  }
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 4 >> 2);
 }
 GLctx.uniform1fv(GL.uniforms[location], view);
}
function _glEnd() {
 GLImmediate.prepareClientAttributes(GLImmediate.rendererComponents[GLImmediate.VERTEX], true);
 GLImmediate.firstVertex = 0;
 GLImmediate.lastVertex = GLImmediate.vertexCounter / (GLImmediate.stride >> 2);
 GLImmediate.flush();
 GLImmediate.disableBeginEndClientAttributes();
 GLImmediate.mode = -1;
 GLImmediate.enabledClientAttributes = GLImmediate.enabledClientAttributes_preBegin;
 GLImmediate.clientAttributes = GLImmediate.clientAttributes_preBegin;
 GLImmediate.currentRenderer = null;
 GLImmediate.modifiedClientAttributes = true;
}
function _emscripten_set_wheel_callback(target, userData, useCapture, callbackfunc) {
 target = JSEvents.findEventTarget(target);
 if (typeof target.onwheel !== "undefined") {
  JSEvents.registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "wheel");
  return 0;
 } else if (typeof target.onmousewheel !== "undefined") {
  JSEvents.registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "mousewheel");
  return 0;
 } else {
  return -1;
 }
}
function _emscripten_set_gamepaddisconnected_callback(userData, useCapture, callbackfunc) {
 if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
 JSEvents.registerGamepadEventCallback(window, userData, useCapture, callbackfunc, 27, "gamepaddisconnected");
 return 0;
}
function _glScissor(x0, x1, x2, x3) {
 GLctx["scissor"](x0, x1, x2, x3);
}
function _emscripten_glBindProgramARB(type, id) {}
function _emscripten_glCheckFramebufferStatus(x0) {
 return GLctx["checkFramebufferStatus"](x0);
}
function _emscripten_glDeleteProgram(id) {
 if (!id) return;
 var program = GL.programs[id];
 if (!program) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteProgram(program);
 program.name = 0;
 GL.programs[id] = null;
 GL.programInfos[id] = null;
}
function _emscripten_glDisable(x0) {
 GLctx["disable"](x0);
}
function _emscripten_glVertexAttrib3fv(index, v) {
 GLctx.vertexAttrib3f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2]);
}
function _glClearColor(x0, x1, x2, x3) {
 GLctx["clearColor"](x0, x1, x2, x3);
}
function _emscripten_glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
 program = GL.programs[program];
 var info = GLctx.getActiveAttrib(program, index);
 if (!info) return;
 if (bufSize > 0 && name) {
  var numBytesWrittenExclNull = stringToUTF8(info.name, name, bufSize);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
 if (size) HEAP32[size >> 2] = info.size;
 if (type) HEAP32[type >> 2] = info.type;
}
function _emscripten_glIsFramebuffer(framebuffer) {
 var fb = GL.framebuffers[framebuffer];
 if (!fb) return 0;
 return GLctx.isFramebuffer(fb);
}
function _emscripten_glLineWidth(x0) {
 GLctx["lineWidth"](x0);
}
function _emscripten_glGetString(name_) {
 if (GL.stringCache[name_]) return GL.stringCache[name_];
 var ret;
 switch (name_) {
 case 7936:
 case 7937:
 case 37445:
 case 37446:
  ret = allocate(intArrayFromString(GLctx.getParameter(name_)), "i8", ALLOC_NORMAL);
  break;
 case 7938:
  var glVersion = GLctx.getParameter(GLctx.VERSION);
  {
   glVersion = "OpenGL ES 2.0 (" + glVersion + ")";
  }
  ret = allocate(intArrayFromString(glVersion), "i8", ALLOC_NORMAL);
  break;
 case 7939:
  var exts = GLctx.getSupportedExtensions();
  var gl_exts = [];
  for (var i = 0; i < exts.length; ++i) {
   gl_exts.push(exts[i]);
   gl_exts.push("GL_" + exts[i]);
  }
  ret = allocate(intArrayFromString(gl_exts.join(" ")), "i8", ALLOC_NORMAL);
  break;
 case 35724:
  var glslVersion = GLctx.getParameter(GLctx.SHADING_LANGUAGE_VERSION);
  var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
  var ver_num = glslVersion.match(ver_re);
  if (ver_num !== null) {
   if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
   glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")";
  }
  ret = allocate(intArrayFromString(glslVersion), "i8", ALLOC_NORMAL);
  break;
 default:
  GL.recordError(1280);
  return 0;
 }
 GL.stringCache[name_] = ret;
 return ret;
}
function _eglDestroySurface(display, surface) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (surface != 62006) {
  EGL.setErrorCode(12301);
  return 1;
 }
 if (EGL.currentReadSurface == surface) {
  EGL.currentReadSurface = 0;
 }
 if (EGL.currentDrawSurface == surface) {
  EGL.currentDrawSurface = 0;
 }
 EGL.setErrorCode(12288);
 return 1;
}
function _emscripten_glGetAttribLocation(program, name) {
 program = GL.programs[program];
 name = Pointer_stringify(name);
 return GLctx.getAttribLocation(program, name);
}
function _emscripten_glRotatef(angle, x, y, z) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.rotate(GLImmediate.matrix[GLImmediate.currentMatrix], angle * Math.PI / 180, [ x, y, z ]);
}
function _emscripten_glGetIntegerv(name_, p) {
 emscriptenWebGLGet(name_, p, "Integer");
}
function _emscripten_glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
 var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
 HEAP32[params >> 2] = result;
}
function _emscripten_glClientActiveTexture(texture) {
 GLImmediate.clientActiveTexture = texture - 33984;
}
function _emscripten_set_focus_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerFocusEventCallback(target, userData, useCapture, callbackfunc, 13, "focus");
 return 0;
}
function _emscripten_memcpy_big(dest, src, num) {
 HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
 return dest;
}
Module["_memcpy"] = _memcpy;
function _emscripten_glGetShaderInfoLog(shader, maxLength, length, infoLog) {
 var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
 if (log === null) log = "(unknown error)";
 if (maxLength > 0 && infoLog) {
  var numBytesWrittenExclNull = stringToUTF8(log, infoLog, maxLength);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
}
function _emscripten_set_mouseup_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerMouseEventCallback(target, userData, useCapture, callbackfunc, 6, "mouseup");
 return 0;
}
function _emscripten_glStencilOpSeparate(x0, x1, x2, x3) {
 GLctx["stencilOpSeparate"](x0, x1, x2, x3);
}
var GLUT = {
 initTime: null,
 idleFunc: null,
 displayFunc: null,
 keyboardFunc: null,
 keyboardUpFunc: null,
 specialFunc: null,
 specialUpFunc: null,
 reshapeFunc: null,
 motionFunc: null,
 passiveMotionFunc: null,
 mouseFunc: null,
 buttons: 0,
 modifiers: 0,
 initWindowWidth: 256,
 initWindowHeight: 256,
 initDisplayMode: 18,
 windowX: 0,
 windowY: 0,
 windowWidth: 0,
 windowHeight: 0,
 requestedAnimationFrame: false,
 saveModifiers: (function(event) {
  GLUT.modifiers = 0;
  if (event["shiftKey"]) GLUT.modifiers += 1;
  if (event["ctrlKey"]) GLUT.modifiers += 2;
  if (event["altKey"]) GLUT.modifiers += 4;
 }),
 onMousemove: (function(event) {
  var lastX = Browser.mouseX;
  var lastY = Browser.mouseY;
  Browser.calculateMouseEvent(event);
  var newX = Browser.mouseX;
  var newY = Browser.mouseY;
  if (newX == lastX && newY == lastY) return;
  if (GLUT.buttons == 0 && event.target == Module["canvas"] && GLUT.passiveMotionFunc) {
   event.preventDefault();
   GLUT.saveModifiers(event);
   Module["dynCall_vii"](GLUT.passiveMotionFunc, lastX, lastY);
  } else if (GLUT.buttons != 0 && GLUT.motionFunc) {
   event.preventDefault();
   GLUT.saveModifiers(event);
   Module["dynCall_vii"](GLUT.motionFunc, lastX, lastY);
  }
 }),
 getSpecialKey: (function(keycode) {
  var key = null;
  switch (keycode) {
  case 8:
   key = 120;
   break;
  case 46:
   key = 111;
   break;
  case 112:
   key = 1;
   break;
  case 113:
   key = 2;
   break;
  case 114:
   key = 3;
   break;
  case 115:
   key = 4;
   break;
  case 116:
   key = 5;
   break;
  case 117:
   key = 6;
   break;
  case 118:
   key = 7;
   break;
  case 119:
   key = 8;
   break;
  case 120:
   key = 9;
   break;
  case 121:
   key = 10;
   break;
  case 122:
   key = 11;
   break;
  case 123:
   key = 12;
   break;
  case 37:
   key = 100;
   break;
  case 38:
   key = 101;
   break;
  case 39:
   key = 102;
   break;
  case 40:
   key = 103;
   break;
  case 33:
   key = 104;
   break;
  case 34:
   key = 105;
   break;
  case 36:
   key = 106;
   break;
  case 35:
   key = 107;
   break;
  case 45:
   key = 108;
   break;
  case 16:
  case 5:
   key = 112;
   break;
  case 6:
   key = 113;
   break;
  case 17:
  case 3:
   key = 114;
   break;
  case 4:
   key = 115;
   break;
  case 18:
  case 2:
   key = 116;
   break;
  case 1:
   key = 117;
   break;
  }
  return key;
 }),
 getASCIIKey: (function(event) {
  if (event["ctrlKey"] || event["altKey"] || event["metaKey"]) return null;
  var keycode = event["keyCode"];
  if (48 <= keycode && keycode <= 57) return keycode;
  if (65 <= keycode && keycode <= 90) return event["shiftKey"] ? keycode : keycode + 32;
  if (96 <= keycode && keycode <= 105) return keycode - 48;
  if (106 <= keycode && keycode <= 111) return keycode - 106 + 42;
  switch (keycode) {
  case 9:
  case 13:
  case 27:
  case 32:
  case 61:
   return keycode;
  }
  var s = event["shiftKey"];
  switch (keycode) {
  case 186:
   return s ? 58 : 59;
  case 187:
   return s ? 43 : 61;
  case 188:
   return s ? 60 : 44;
  case 189:
   return s ? 95 : 45;
  case 190:
   return s ? 62 : 46;
  case 191:
   return s ? 63 : 47;
  case 219:
   return s ? 123 : 91;
  case 220:
   return s ? 124 : 47;
  case 221:
   return s ? 125 : 93;
  case 222:
   return s ? 34 : 39;
  }
  return null;
 }),
 onKeydown: (function(event) {
  if (GLUT.specialFunc || GLUT.keyboardFunc) {
   var key = GLUT.getSpecialKey(event["keyCode"]);
   if (key !== null) {
    if (GLUT.specialFunc) {
     event.preventDefault();
     GLUT.saveModifiers(event);
     Module["dynCall_viii"](GLUT.specialFunc, key, Browser.mouseX, Browser.mouseY);
    }
   } else {
    key = GLUT.getASCIIKey(event);
    if (key !== null && GLUT.keyboardFunc) {
     event.preventDefault();
     GLUT.saveModifiers(event);
     Module["dynCall_viii"](GLUT.keyboardFunc, key, Browser.mouseX, Browser.mouseY);
    }
   }
  }
 }),
 onKeyup: (function(event) {
  if (GLUT.specialUpFunc || GLUT.keyboardUpFunc) {
   var key = GLUT.getSpecialKey(event["keyCode"]);
   if (key !== null) {
    if (GLUT.specialUpFunc) {
     event.preventDefault();
     GLUT.saveModifiers(event);
     Module["dynCall_viii"](GLUT.specialUpFunc, key, Browser.mouseX, Browser.mouseY);
    }
   } else {
    key = GLUT.getASCIIKey(event);
    if (key !== null && GLUT.keyboardUpFunc) {
     event.preventDefault();
     GLUT.saveModifiers(event);
     Module["dynCall_viii"](GLUT.keyboardUpFunc, key, Browser.mouseX, Browser.mouseY);
    }
   }
  }
 }),
 touchHandler: (function(event) {
  if (event.target != Module["canvas"]) {
   return;
  }
  var touches = event.changedTouches, main = touches[0], type = "";
  switch (event.type) {
  case "touchstart":
   type = "mousedown";
   break;
  case "touchmove":
   type = "mousemove";
   break;
  case "touchend":
   type = "mouseup";
   break;
  default:
   return;
  }
  var simulatedEvent = document.createEvent("MouseEvent");
  simulatedEvent.initMouseEvent(type, true, true, window, 1, main.screenX, main.screenY, main.clientX, main.clientY, false, false, false, false, 0, null);
  main.target.dispatchEvent(simulatedEvent);
  event.preventDefault();
 }),
 onMouseButtonDown: (function(event) {
  Browser.calculateMouseEvent(event);
  GLUT.buttons |= 1 << event["button"];
  if (event.target == Module["canvas"] && GLUT.mouseFunc) {
   try {
    event.target.setCapture();
   } catch (e) {}
   event.preventDefault();
   GLUT.saveModifiers(event);
   Module["dynCall_viiii"](GLUT.mouseFunc, event["button"], 0, Browser.mouseX, Browser.mouseY);
  }
 }),
 onMouseButtonUp: (function(event) {
  Browser.calculateMouseEvent(event);
  GLUT.buttons &= ~(1 << event["button"]);
  if (GLUT.mouseFunc) {
   event.preventDefault();
   GLUT.saveModifiers(event);
   Module["dynCall_viiii"](GLUT.mouseFunc, event["button"], 1, Browser.mouseX, Browser.mouseY);
  }
 }),
 onMouseWheel: (function(event) {
  Browser.calculateMouseEvent(event);
  var e = window.event || event;
  var delta = -Browser.getMouseWheelDelta(event);
  delta = delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1);
  var button = 3;
  if (delta < 0) {
   button = 4;
  }
  if (GLUT.mouseFunc) {
   event.preventDefault();
   GLUT.saveModifiers(event);
   Module["dynCall_viiii"](GLUT.mouseFunc, button, 0, Browser.mouseX, Browser.mouseY);
  }
 }),
 onFullscreenEventChange: (function(event) {
  var width;
  var height;
  if (document["fullscreen"] || document["fullScreen"] || document["mozFullScreen"] || document["webkitIsFullScreen"]) {
   width = screen["width"];
   height = screen["height"];
  } else {
   width = GLUT.windowWidth;
   height = GLUT.windowHeight;
   document.removeEventListener("fullscreenchange", GLUT.onFullscreenEventChange, true);
   document.removeEventListener("mozfullscreenchange", GLUT.onFullscreenEventChange, true);
   document.removeEventListener("webkitfullscreenchange", GLUT.onFullscreenEventChange, true);
  }
  Browser.setCanvasSize(width, height);
  if (GLUT.reshapeFunc) {
   Module["dynCall_vii"](GLUT.reshapeFunc, width, height);
  }
  _glutPostRedisplay();
 }),
 requestFullscreen: (function() {
  Browser.requestFullscreen(false, false);
 }),
 requestFullScreen: (function() {
  Module.printErr("GLUT.requestFullScreen() is deprecated. Please call GLUT.requestFullscreen instead.");
  GLUT.requestFullScreen = (function() {
   return GLUT.requestFullscreen();
  });
  return GLUT.requestFullscreen();
 }),
 exitFullscreen: (function() {
  var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["webkitCancelFullScreen"] || (function() {});
  CFS.apply(document, []);
 }),
 cancelFullScreen: (function() {
  Module.printErr("GLUT.cancelFullScreen() is deprecated. Please call GLUT.exitFullscreen instead.");
  GLUT.cancelFullScreen = (function() {
   return GLUT.exitFullscreen();
  });
  return GLUT.exitFullscreen();
 })
};
function _glutInitDisplayMode(mode) {
 GLUT.initDisplayMode = mode;
}
function _glutCreateWindow(name) {
 var contextAttributes = {
  antialias: (GLUT.initDisplayMode & 128) != 0,
  depth: (GLUT.initDisplayMode & 16) != 0,
  stencil: (GLUT.initDisplayMode & 32) != 0,
  alpha: (GLUT.initDisplayMode & 8) != 0
 };
 Module.ctx = Browser.createContext(Module["canvas"], true, true, contextAttributes);
 return Module.ctx ? 1 : 0;
}
function _eglCreateContext(display, config, hmm, contextAttribs) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 var glesContextVersion = 1;
 for (;;) {
  var param = HEAP32[contextAttribs >> 2];
  if (param == 12440) {
   glesContextVersion = HEAP32[contextAttribs + 4 >> 2];
  } else if (param == 12344) {
   break;
  } else {
   EGL.setErrorCode(12292);
   return 0;
  }
  contextAttribs += 8;
 }
 if (glesContextVersion != 2) {
  EGL.setErrorCode(12293);
  return 0;
 }
 _glutInitDisplayMode(178);
 EGL.windowID = _glutCreateWindow();
 if (EGL.windowID != 0) {
  EGL.setErrorCode(12288);
  return 62004;
 } else {
  EGL.setErrorCode(12297);
  return 0;
 }
}
function _emscripten_glReadPixels(x, y, width, height, format, type, pixels) {
 var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
 if (!pixelData) {
  GL.recordError(1280);
  return;
 }
 GLctx.readPixels(x, y, width, height, format, type, pixelData);
}
function _emscripten_glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data) {
 GLctx["compressedTexSubImage2D"](target, level, xoffset, yoffset, width, height, format, data ? HEAPU8.subarray(data, data + imageSize) : null);
}
function _emscripten_glGetError() {
 if (GL.lastError) {
  var error = GL.lastError;
  GL.lastError = 0;
  return error;
 } else {
  return GLctx.getError();
 }
}
function _eglBindAPI(api) {
 if (api == 12448) {
  EGL.setErrorCode(12288);
  return 1;
 } else {
  EGL.setErrorCode(12300);
  return 0;
 }
}
function _emscripten_glIsEnabled(x0) {
 return GLctx["isEnabled"](x0);
}
Module["_memmove"] = _memmove;
function _glGenTextures(n, textures) {
 for (var i = 0; i < n; i++) {
  var texture = GLctx.createTexture();
  if (!texture) {
   GL.recordError(1282);
   while (i < n) HEAP32[textures + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.textures);
  texture.name = id;
  GL.textures[id] = texture;
  HEAP32[textures + i * 4 >> 2] = id;
 }
}
var __sigalrm_handler = 0;
function _signal(sig, func) {
 if (sig == 14) {
  __sigalrm_handler = func;
 } else {}
 return 0;
}
function _emscripten_glVertexAttrib4f(x0, x1, x2, x3, x4) {
 GLctx["vertexAttrib4f"](x0, x1, x2, x3, x4);
}
function _glDepthFunc(x0) {
 GLctx["depthFunc"](x0);
}
function _emscripten_glClearDepthf(x0) {
 GLctx["clearDepth"](x0);
}
function _emscripten_glColor4f(r, g, b, a) {
 r = Math.max(Math.min(r, 1), 0);
 g = Math.max(Math.min(g, 1), 0);
 b = Math.max(Math.min(b, 1), 0);
 a = Math.max(Math.min(a, 1), 0);
 if (GLImmediate.mode >= 0) {
  var start = GLImmediate.vertexCounter << 2;
  GLImmediate.vertexDataU8[start + 0] = r * 255;
  GLImmediate.vertexDataU8[start + 1] = g * 255;
  GLImmediate.vertexDataU8[start + 2] = b * 255;
  GLImmediate.vertexDataU8[start + 3] = a * 255;
  GLImmediate.vertexCounter++;
  GLImmediate.addRendererComponent(GLImmediate.COLOR, 4, GLctx.UNSIGNED_BYTE);
 } else {
  GLImmediate.clientColor[0] = r;
  GLImmediate.clientColor[1] = g;
  GLImmediate.clientColor[2] = b;
  GLImmediate.clientColor[3] = a;
 }
}
function _emscripten_glColor4ub(r, g, b, a) {
 _emscripten_glColor4f((r & 255) / 255, (g & 255) / 255, (b & 255) / 255, (a & 255) / 255);
}
function _glColor3ub(r, g, b) {
 _emscripten_glColor4ub(r, g, b, 255);
}
function _emscripten_glClear(x0) {
 GLctx["clear"](x0);
}
function _glVertex2f(x, y, z) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = z || 0;
 GLImmediate.addRendererComponent(GLImmediate.VERTEX, 3, GLctx.FLOAT);
}
function _emscripten_glBindBuffer(target, buffer) {
 var bufferObj = buffer ? GL.buffers[buffer] : null;
 if (target == GLctx.ARRAY_BUFFER) {
  GL.currArrayBuffer = buffer;
  GLImmediate.lastArrayBuffer = buffer;
 } else if (target == GLctx.ELEMENT_ARRAY_BUFFER) {
  GL.currElementArrayBuffer = buffer;
 }
 GLctx.bindBuffer(target, bufferObj);
}
function _emscripten_glCompileShader(shader) {
 GLctx.compileShader(GL.shaders[shader]);
}
function _emscripten_glGetUniformfv(program, location, params) {
 emscriptenWebGLGetUniform(program, location, params, "Float");
}
function ___gxx_personality_v0() {}
function ___cxa_pure_virtual() {
 ABORT = true;
 throw "Pure virtual function called!";
}
function _emscripten_glDrawElements(mode, count, type, indices) {
 GLctx.drawElements(mode, count, type, indices);
}
function _emscripten_glDrawRangeElements(mode, start, end, count, type, indices) {
 _emscripten_glDrawElements(mode, count, type, indices, start, end);
}
function _emscripten_glGetAttachedShaders(program, maxCount, count, shaders) {
 var result = GLctx.getAttachedShaders(GL.programs[program]);
 var len = result.length;
 if (len > maxCount) {
  len = maxCount;
 }
 HEAP32[count >> 2] = len;
 for (var i = 0; i < len; ++i) {
  var id = GL.shaders.indexOf(result[i]);
  HEAP32[shaders + i * 4 >> 2] = id;
 }
}
function _emscripten_glGenRenderbuffers(n, renderbuffers) {
 for (var i = 0; i < n; i++) {
  var renderbuffer = GLctx.createRenderbuffer();
  if (!renderbuffer) {
   GL.recordError(1282);
   while (i < n) HEAP32[renderbuffers + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.renderbuffers);
  renderbuffer.name = id;
  GL.renderbuffers[id] = renderbuffer;
  HEAP32[renderbuffers + i * 4 >> 2] = id;
 }
}
function _emscripten_glFrontFace(x0) {
 GLctx["frontFace"](x0);
}
function _pthread_cond_wait() {
 return 0;
}
function _emscripten_glUniform1iv(location, count, value) {
 GLctx.uniform1iv(GL.uniforms[location], HEAP32.subarray(value >> 2, value + count * 4 >> 2));
}
function _emscripten_glTexCoordPointer(size, type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture, size, type, stride, pointer);
}
function _emscripten_glGetProgramInfoLog(program, maxLength, length, infoLog) {
 var log = GLctx.getProgramInfoLog(GL.programs[program]);
 if (log === null) log = "(unknown error)";
 if (maxLength > 0 && infoLog) {
  var numBytesWrittenExclNull = stringToUTF8(log, infoLog, maxLength);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
}
function _emscripten_glGetInfoLogARB(id, maxLength, length, infoLog) {
 if (GL.programs[id]) {
  _emscripten_glGetProgramInfoLog(id, maxLength, length, infoLog);
 } else if (GL.shaders[id]) {
  _emscripten_glGetShaderInfoLog(id, maxLength, length, infoLog);
 } else {
  Module.printErr("WARNING: glGetInfoLog received invalid id: " + id);
 }
}
function _pthread_setspecific(key, value) {
 if (!(key in PTHREAD_SPECIFIC)) {
  return ERRNO_CODES.EINVAL;
 }
 PTHREAD_SPECIFIC[key] = value;
 return 0;
}
function _emscripten_glRenderbufferStorage(x0, x1, x2, x3) {
 GLctx["renderbufferStorage"](x0, x1, x2, x3);
}
function _emscripten_glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx["copyTexSubImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
}
function _glEnableClientState(cap) {
 var attrib = GLEmulation.getAttributeFromCapability(cap);
 if (attrib === null) {
  return;
 }
 if (!GLImmediate.enabledClientAttributes[attrib]) {
  GLImmediate.enabledClientAttributes[attrib] = true;
  GLImmediate.totalEnabledClientAttributes++;
  GLImmediate.currentRenderer = null;
  if (GLEmulation.currentVao) GLEmulation.currentVao.enabledClientStates[cap] = 1;
  GLImmediate.modifiedClientAttributes = true;
 }
}
function _emscripten_glShaderBinary() {
 GL.recordError(1280);
}
function _emscripten_glIsProgram(program) {
 var program = GL.programs[program];
 if (!program) return 0;
 return GLctx.isProgram(program);
}
function ___cxa_begin_catch(ptr) {
 var info = EXCEPTIONS.infos[ptr];
 if (info && !info.caught) {
  info.caught = true;
  __ZSt18uncaught_exceptionv.uncaught_exception--;
 }
 if (info) info.rethrown = false;
 EXCEPTIONS.caught.push(ptr);
 EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));
 return ptr;
}
function _emscripten_glDepthRange(x0, x1) {
 GLctx["depthRange"](x0, x1);
}
function _eglInitialize(display, majorVersion, minorVersion) {
 if (display == 62e3) {
  if (majorVersion) {
   HEAP32[majorVersion >> 2] = 1;
  }
  if (minorVersion) {
   HEAP32[minorVersion >> 2] = 4;
  }
  EGL.defaultDisplayInitialized = true;
  EGL.setErrorCode(12288);
  return 1;
 } else {
  EGL.setErrorCode(12296);
  return 0;
 }
}
function _emscripten_glBlendColor(x0, x1, x2, x3) {
 GLctx["blendColor"](x0, x1, x2, x3);
}
function _emscripten_glUniformMatrix3fv(location, count, transpose, value) {
 var view;
 if (9 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  view = GL.miniTempBufferViews[9 * count - 1];
  for (var i = 0; i < 9 * count; i += 9) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
   view[i + 4] = HEAPF32[value + (4 * i + 16) >> 2];
   view[i + 5] = HEAPF32[value + (4 * i + 20) >> 2];
   view[i + 6] = HEAPF32[value + (4 * i + 24) >> 2];
   view[i + 7] = HEAPF32[value + (4 * i + 28) >> 2];
   view[i + 8] = HEAPF32[value + (4 * i + 32) >> 2];
  }
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 36 >> 2);
 }
 GLctx.uniformMatrix3fv(GL.uniforms[location], !!transpose, view);
}
function _emscripten_glVertexAttrib2f(x0, x1, x2) {
 GLctx["vertexAttrib2f"](x0, x1, x2);
}
function _emscripten_glUniform4fv(location, count, value) {
 var view;
 if (4 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  view = GL.miniTempBufferViews[4 * count - 1];
  for (var i = 0; i < 4 * count; i += 4) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
  }
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
 }
 GLctx.uniform4fv(GL.uniforms[location], view);
}
function _glMatrixMode(mode) {
 if (mode == 5888) {
  GLImmediate.currentMatrix = 0;
 } else if (mode == 5889) {
  GLImmediate.currentMatrix = 1;
 } else if (mode == 5890) {
  GLImmediate.useTextureMatrix = true;
  GLImmediate.currentMatrix = 2 + GLImmediate.clientActiveTexture;
 } else {
  throw "Wrong mode " + mode + " passed to glMatrixMode";
 }
}
function _emscripten_glGenFramebuffers(n, ids) {
 for (var i = 0; i < n; ++i) {
  var framebuffer = GLctx.createFramebuffer();
  if (!framebuffer) {
   GL.recordError(1282);
   while (i < n) HEAP32[ids + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.framebuffers);
  framebuffer.name = id;
  GL.framebuffers[id] = framebuffer;
  HEAP32[ids + i * 4 >> 2] = id;
 }
}
function _emscripten_glBlendEquationSeparate(x0, x1) {
 GLctx["blendEquationSeparate"](x0, x1);
}
function _eglWaitNative(nativeEngineId) {
 EGL.setErrorCode(12288);
 return 1;
}
function _usleep(useconds) {
 var msec = useconds / 1e3;
 if ((ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self["performance"] && self["performance"]["now"]) {
  var start = self["performance"]["now"]();
  while (self["performance"]["now"]() - start < msec) {}
 } else {
  var start = Date.now();
  while (Date.now() - start < msec) {}
 }
 return 0;
}
function _nanosleep(rqtp, rmtp) {
 var seconds = HEAP32[rqtp >> 2];
 var nanoseconds = HEAP32[rqtp + 4 >> 2];
 if (rmtp !== 0) {
  HEAP32[rmtp >> 2] = 0;
  HEAP32[rmtp + 4 >> 2] = 0;
 }
 return _usleep(seconds * 1e6 + nanoseconds / 1e3);
}
function _emscripten_glBindTexture(target, texture) {
 GLctx.bindTexture(target, texture ? GL.textures[texture] : null);
}
function _emscripten_glUniform1i(location, v0) {
 GLctx.uniform1i(GL.uniforms[location], v0);
}
function _emscripten_glGenTextures(n, textures) {
 for (var i = 0; i < n; i++) {
  var texture = GLctx.createTexture();
  if (!texture) {
   GL.recordError(1282);
   while (i < n) HEAP32[textures + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.textures);
  texture.name = id;
  GL.textures[id] = texture;
  HEAP32[textures + i * 4 >> 2] = id;
 }
}
function _emscripten_glVertexAttrib2fv(index, v) {
 GLctx.vertexAttrib2f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2]);
}
function _emscripten_glGetActiveUniform(program, index, bufSize, length, size, type, name) {
 program = GL.programs[program];
 var info = GLctx.getActiveUniform(program, index);
 if (!info) return;
 if (bufSize > 0 && name) {
  var numBytesWrittenExclNull = stringToUTF8(info.name, name, bufSize);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
 if (size) HEAP32[size >> 2] = info.size;
 if (type) HEAP32[type >> 2] = info.type;
}
function _emscripten_glDeleteObjectARB(id) {
 if (GL.programs[id]) {
  _emscripten_glDeleteProgram(id);
 } else if (GL.shaders[id]) {
  _emscripten_glDeleteShader(id);
 } else {
  Module.printErr("WARNING: deleteObject received invalid id: " + id);
 }
}
function _emscripten_set_touchmove_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerTouchEventCallback(target, userData, useCapture, callbackfunc, 24, "touchmove");
 return 0;
}
function _emscripten_glUniform1f(location, v0) {
 GLctx.uniform1f(GL.uniforms[location], v0);
}
function _emscripten_glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
 GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
}
function _emscripten_glDrawArrays(mode, first, count) {
 GLctx.drawArrays(mode, first, count);
}
function _emscripten_glGenBuffers(n, buffers) {
 for (var i = 0; i < n; i++) {
  var buffer = GLctx.createBuffer();
  if (!buffer) {
   GL.recordError(1282);
   while (i < n) HEAP32[buffers + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.buffers);
  buffer.name = id;
  GL.buffers[id] = buffer;
  HEAP32[buffers + i * 4 >> 2] = id;
 }
}
function _emscripten_glClearDepth(x0) {
 GLctx["clearDepth"](x0);
}
function _emscripten_set_keypress_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerKeyEventCallback(target, userData, useCapture, callbackfunc, 1, "keypress");
 return 0;
}
var PTHREAD_SPECIFIC_NEXT_KEY = 1;
function _pthread_key_create(key, destructor) {
 if (key == 0) {
  return ERRNO_CODES.EINVAL;
 }
 HEAP32[key >> 2] = PTHREAD_SPECIFIC_NEXT_KEY;
 PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY] = 0;
 PTHREAD_SPECIFIC_NEXT_KEY++;
 return 0;
}
function _glutDestroyWindow(name) {
 Module.ctx = Browser.destroyContext(Module["canvas"], true, true);
 return 1;
}
function _eglDestroyContext(display, context) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (context != 62004) {
  EGL.setErrorCode(12294);
  return 0;
 }
 EGL.setErrorCode(12288);
 return 1;
}
function _emscripten_glGetUniformLocation(program, name) {
 name = Pointer_stringify(name);
 var arrayOffset = 0;
 if (name.indexOf("]", name.length - 1) !== -1) {
  var ls = name.lastIndexOf("[");
  var arrayIndex = name.slice(ls + 1, -1);
  if (arrayIndex.length > 0) {
   arrayOffset = parseInt(arrayIndex);
   if (arrayOffset < 0) {
    return -1;
   }
  }
  name = name.slice(0, ls);
 }
 var ptable = GL.programInfos[program];
 if (!ptable) {
  return -1;
 }
 var utable = ptable.uniforms;
 var uniformInfo = utable[name];
 if (uniformInfo && arrayOffset < uniformInfo[0]) {
  return uniformInfo[1] + arrayOffset;
 } else {
  return -1;
 }
}
function _emscripten_glVertexAttrib4fv(index, v) {
 GLctx.vertexAttrib4f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2], HEAPF32[v + 12 >> 2]);
}
function _emscripten_glScissor(x0, x1, x2, x3) {
 GLctx["scissor"](x0, x1, x2, x3);
}
function _emscripten_glIsShader(shader) {
 var s = GL.shaders[shader];
 if (!s) return 0;
 return GLctx.isShader(s);
}
function _emscripten_longjmp(env, value) {
 _longjmp(env, value);
}
var _environ = STATICTOP;
STATICTOP += 16;
function ___buildEnvironment(env) {
 var MAX_ENV_VALUES = 64;
 var TOTAL_ENV_SIZE = 1024;
 var poolPtr;
 var envPtr;
 if (!___buildEnvironment.called) {
  ___buildEnvironment.called = true;
  ENV["USER"] = ENV["LOGNAME"] = "web_user";
  ENV["PATH"] = "/";
  ENV["PWD"] = "/";
  ENV["HOME"] = "/home/web_user";
  ENV["LANG"] = "C";
  ENV["_"] = Module["thisProgram"];
  poolPtr = allocate(TOTAL_ENV_SIZE, "i8", ALLOC_STATIC);
  envPtr = allocate(MAX_ENV_VALUES * 4, "i8*", ALLOC_STATIC);
  HEAP32[envPtr >> 2] = poolPtr;
  HEAP32[_environ >> 2] = envPtr;
 } else {
  envPtr = HEAP32[_environ >> 2];
  poolPtr = HEAP32[envPtr >> 2];
 }
 var strings = [];
 var totalSize = 0;
 for (var key in env) {
  if (typeof env[key] === "string") {
   var line = key + "=" + env[key];
   strings.push(line);
   totalSize += line.length;
  }
 }
 if (totalSize > TOTAL_ENV_SIZE) {
  throw new Error("Environment size exceeded TOTAL_ENV_SIZE!");
 }
 var ptrSize = 4;
 for (var i = 0; i < strings.length; i++) {
  var line = strings[i];
  writeAsciiToMemory(line, poolPtr);
  HEAP32[envPtr + i * ptrSize >> 2] = poolPtr;
  poolPtr += line.length + 1;
 }
 HEAP32[envPtr + strings.length * ptrSize >> 2] = 0;
}
var ENV = {};
function _getenv(name) {
 if (name === 0) return 0;
 name = Pointer_stringify(name);
 if (!ENV.hasOwnProperty(name)) return 0;
 if (_getenv.ret) _free(_getenv.ret);
 _getenv.ret = allocate(intArrayFromString(ENV[name]), "i8", ALLOC_NORMAL);
 return _getenv.ret;
}
function ___map_file(pathname, size) {
 ___setErrNo(ERRNO_CODES.EPERM);
 return -1;
}
Module["_pthread_mutex_unlock"] = _pthread_mutex_unlock;
function _emscripten_glBindFramebuffer(target, framebuffer) {
 GLctx.bindFramebuffer(target, framebuffer ? GL.framebuffers[framebuffer] : null);
}
function _emscripten_glBlendEquation(x0) {
 GLctx["blendEquation"](x0);
}
function _emscripten_glBufferSubData(target, offset, size, data) {
 GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size));
}
function _emscripten_set_keydown_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerKeyEventCallback(target, userData, useCapture, callbackfunc, 2, "keydown");
 return 0;
}
function _emscripten_glBufferData(target, size, data, usage) {
 switch (usage) {
 case 35041:
 case 35042:
  usage = 35040;
  break;
 case 35045:
 case 35046:
  usage = 35044;
  break;
 case 35049:
 case 35050:
  usage = 35048;
  break;
 }
 if (!data) {
  GLctx.bufferData(target, size, usage);
 } else {
  GLctx.bufferData(target, HEAPU8.subarray(data, data + size), usage);
 }
}
Module["_sbrk"] = _sbrk;
function _emscripten_exit_pointerlock() {
 JSEvents.removeDeferredCalls(JSEvents.requestPointerLock);
 if (document.exitPointerLock) {
  document.exitPointerLock();
 } else if (document.msExitPointerLock) {
  document.msExitPointerLock();
 } else if (document.mozExitPointerLock) {
  document.mozExitPointerLock();
 } else if (document.webkitExitPointerLock) {
  document.webkitExitPointerLock();
 } else {
  return -1;
 }
 return 0;
}
function _emscripten_glGetShaderSource(shader, bufSize, length, source) {
 var result = GLctx.getShaderSource(GL.shaders[shader]);
 if (!result) return;
 if (bufSize > 0 && source) {
  var numBytesWrittenExclNull = stringToUTF8(result, source, bufSize);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
}
Module["_llvm_bswap_i32"] = _llvm_bswap_i32;
function _glPushMatrix() {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixStack[GLImmediate.currentMatrix].push(Array.prototype.slice.call(GLImmediate.matrix[GLImmediate.currentMatrix]));
}
function _emscripten_set_gamepadconnected_callback(userData, useCapture, callbackfunc) {
 if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
 JSEvents.registerGamepadEventCallback(window, userData, useCapture, callbackfunc, 26, "gamepadconnected");
 return 0;
}
function _emscripten_glGetFloatv(name_, p) {
 emscriptenWebGLGet(name_, p, "Float");
}
function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
 var pixelData = null;
 if (pixels) pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat);
 GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData);
}
function ___assert_fail(condition, filename, line, func) {
 ABORT = true;
 throw "Assertion failed: " + Pointer_stringify(condition) + ", at: " + [ filename ? Pointer_stringify(filename) : "unknown filename", line, func ? Pointer_stringify(func) : "unknown function" ] + " at " + stackTrace();
}
function _emscripten_glUniform3fv(location, count, value) {
 var view;
 if (3 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  view = GL.miniTempBufferViews[3 * count - 1];
  for (var i = 0; i < 3 * count; i += 3) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
  }
 } else {
  view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2);
 }
 GLctx.uniform3fv(GL.uniforms[location], view);
}
function _emscripten_glDrawElementsInstanced(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}
function _eglMakeCurrent(display, draw, read, context) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (context != 0 && context != 62004) {
  EGL.setErrorCode(12294);
  return 0;
 }
 if (read != 0 && read != 62006 || draw != 0 && draw != 62006) {
  EGL.setErrorCode(12301);
  return 0;
 }
 EGL.currentContext = context;
 EGL.currentDrawSurface = draw;
 EGL.currentReadSurface = read;
 EGL.setErrorCode(12288);
 return 1;
}
function _eglCreateWindowSurface(display, config, win, attrib_list) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (config != 62002) {
  EGL.setErrorCode(12293);
  return 0;
 }
 EGL.setErrorCode(12288);
 return 62006;
}
function _emscripten_glCreateProgram() {
 var id = GL.getNewId(GL.programs);
 var program = GLctx.createProgram();
 program.name = id;
 GL.programs[id] = program;
 return id;
}
function _pthread_once(ptr, func) {
 if (!_pthread_once.seen) _pthread_once.seen = {};
 if (ptr in _pthread_once.seen) return;
 Module["dynCall_v"](func);
 _pthread_once.seen[ptr] = 1;
}
function _emscripten_glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
 GLctx["compressedTexImage2D"](target, level, internalFormat, width, height, border, data ? HEAPU8.subarray(data, data + imageSize) : null);
}
function _emscripten_glClearColor(x0, x1, x2, x3) {
 GLctx["clearColor"](x0, x1, x2, x3);
}
function _emulGlBindVertexArray(vao) {
 GLEmulation.currentVao = null;
 if (GLImmediate.lastRenderer) GLImmediate.lastRenderer.cleanup();
 _glBindBuffer(GLctx.ARRAY_BUFFER, 0);
 _glBindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, 0);
 for (var vaa in GLEmulation.enabledVertexAttribArrays) {
  GLctx.disableVertexAttribArray(vaa);
 }
 GLEmulation.enabledVertexAttribArrays = {};
 GLImmediate.enabledClientAttributes = [ 0, 0 ];
 GLImmediate.totalEnabledClientAttributes = 0;
 GLImmediate.modifiedClientAttributes = true;
 if (vao) {
  var info = GLEmulation.vaos[vao];
  _glBindBuffer(GLctx.ARRAY_BUFFER, info.arrayBuffer);
  _glBindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, info.elementArrayBuffer);
  for (var vaa in info.enabledVertexAttribArrays) {
   _glEnableVertexAttribArray(vaa);
  }
  for (var vaa in info.vertexAttribPointers) {
   _glVertexAttribPointer.apply(null, info.vertexAttribPointers[vaa]);
  }
  for (var attrib in info.enabledClientStates) {
   _glEnableClientState(attrib | 0);
  }
  GLEmulation.currentVao = info;
 }
}
function _emscripten_glBindVertexArray(vao) {
 _emulGlBindVertexArray(vao);
}
function _emscripten_set_mouseenter_callback(target, userData, useCapture, callbackfunc) {
 JSEvents.registerMouseEventCallback(target, userData, useCapture, callbackfunc, 33, "mouseenter");
 return 0;
}
function _emscripten_glLoadMatrixf(matrix) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.set(HEAPF32.subarray(matrix >> 2, matrix + 64 >> 2), GLImmediate.matrix[GLImmediate.currentMatrix]);
}
function _emscripten_glEnable(x0) {
 GLctx["enable"](x0);
}
function _malloc(bytes) {
 var ptr = Runtime.dynamicAlloc(bytes + 8);
 return ptr + 8 & 4294967288;
}
Module["_malloc"] = _malloc;
function ___cxa_allocate_exception(size) {
 return _malloc(size);
}
function _emscripten_glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
 var pixelData = null;
 if (pixels) pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat);
 GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData);
}
function _glPixelStorei(pname, param) {
 if (pname == 3333) {
  GL.packAlignment = param;
 } else if (pname == 3317) {
  GL.unpackAlignment = param;
 }
 GLctx.pixelStorei(pname, param);
}
function _emscripten_glActiveTexture(x0) {
 GLctx["activeTexture"](x0);
}
function _glViewport(x0, x1, x2, x3) {
 GLctx["viewport"](x0, x1, x2, x3);
}
Module["_pthread_cond_broadcast"] = _pthread_cond_broadcast;
function _emscripten_glFlush() {
 GLctx["flush"]();
}
function _emscripten_glCreateShader(shaderType) {
 var id = GL.getNewId(GL.shaders);
 GL.shaders[id] = GLctx.createShader(shaderType);
 return id;
}
function _glClearDepth(x0) {
 GLctx["clearDepth"](x0);
}
function _emscripten_glValidateProgram(program) {
 GLctx.validateProgram(GL.programs[program]);
}
function _glTexParameterf(x0, x1, x2) {
 GLctx["texParameterf"](x0, x1, x2);
}
function _glTexParameteri(x0, x1, x2) {
 GLctx["texParameteri"](x0, x1, x2);
}
function _emscripten_glColorMask(red, green, blue, alpha) {
 GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
}
function _emscripten_glPixelStorei(pname, param) {
 if (pname == 3333) {
  GL.packAlignment = param;
 } else if (pname == 3317) {
  GL.unpackAlignment = param;
 }
 GLctx.pixelStorei(pname, param);
}
function _emscripten_glDeleteTextures(n, textures) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[textures + i * 4 >> 2];
  var texture = GL.textures[id];
  if (!texture) continue;
  GLctx.deleteTexture(texture);
  texture.name = 0;
  GL.textures[id] = null;
 }
}
function _eglGetDisplay(nativeDisplayType) {
 EGL.setErrorCode(12288);
 return 62e3;
}
function _emscripten_set_canvas_size(width, height) {
 Browser.setCanvasSize(width, height);
}
function _emscripten_glDrawBuffers(n, bufs) {
 var bufArray = GL.tempFixedLengthArray[n];
 for (var i = 0; i < n; i++) {
  bufArray[i] = HEAP32[bufs + i * 4 >> 2];
 }
 GLctx["drawBuffers"](bufArray);
}
function ___syscall221(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), cmd = SYSCALLS.get();
  switch (cmd) {
  case 0:
   {
    var arg = SYSCALLS.get();
    if (arg < 0) {
     return -ERRNO_CODES.EINVAL;
    }
    var newStream;
    newStream = FS.open(stream.path, stream.flags, 0, arg);
    return newStream.fd;
   }
  case 1:
  case 2:
   return 0;
  case 3:
   return stream.flags;
  case 4:
   {
    var arg = SYSCALLS.get();
    stream.flags |= arg;
    return 0;
   }
  case 12:
  case 12:
   {
    var arg = SYSCALLS.get();
    var offset = 0;
    HEAP16[arg + offset >> 1] = 2;
    return 0;
   }
  case 13:
  case 14:
  case 13:
  case 14:
   return 0;
  case 16:
  case 8:
   return -ERRNO_CODES.EINVAL;
  case 9:
   ___setErrNo(ERRNO_CODES.EINVAL);
   return -1;
  default:
   {
    return -ERRNO_CODES.EINVAL;
   }
  }
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}
function _emulGlGenVertexArrays(n, vaos) {
 for (var i = 0; i < n; i++) {
  var id = GL.getNewId(GLEmulation.vaos);
  GLEmulation.vaos[id] = {
   id: id,
   arrayBuffer: 0,
   elementArrayBuffer: 0,
   enabledVertexAttribArrays: {},
   vertexAttribPointers: {},
   enabledClientStates: {}
  };
  HEAP32[vaos + i * 4 >> 2] = id;
 }
}
function _emscripten_glGenVertexArrays(n, arrays) {
 _emulGlGenVertexArrays(n, arrays);
}
function _emscripten_glGetBooleanv(name_, p) {
 emscriptenWebGLGet(name_, p, "Boolean");
}
var ___dso_handle = STATICTOP;
STATICTOP += 16;
JSEvents.staticInit();
var GLctx;
GL.init();
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) {
 Module.printErr("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.");
 Module["requestFullScreen"] = Module["requestFullscreen"];
 Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice);
};
Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas, vrDevice) {
 Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
};
Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
 Browser.requestAnimationFrame(func);
};
Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
 Browser.setCanvasSize(width, height, noUpdates);
};
Module["pauseMainLoop"] = function Module_pauseMainLoop() {
 Browser.mainLoop.pause();
};
Module["resumeMainLoop"] = function Module_resumeMainLoop() {
 Browser.mainLoop.resume();
};
Module["getUserMedia"] = function Module_getUserMedia() {
 Browser.getUserMedia();
};
Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
 return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes);
};
if (ENVIRONMENT_IS_NODE) {
 _emscripten_get_now = function _emscripten_get_now_actual() {
  var t = process["hrtime"]();
  return t[0] * 1e3 + t[1] / 1e6;
 };
} else if (typeof dateNow !== "undefined") {
 _emscripten_get_now = dateNow;
} else if (typeof self === "object" && self["performance"] && typeof self["performance"]["now"] === "function") {
 _emscripten_get_now = (function() {
  return self["performance"]["now"]();
 });
} else if (typeof performance === "object" && typeof performance["now"] === "function") {
 _emscripten_get_now = (function() {
  return performance["now"]();
 });
} else {
 _emscripten_get_now = Date.now;
}
GLEmulation.init();
GLImmediate.setupFuncs();
Browser.moduleContextCreatedCallbacks.push((function() {
 GLImmediate.init();
}));
FS.staticInit();
__ATINIT__.unshift((function() {
 if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
}));
__ATMAIN__.push((function() {
 FS.ignorePermissions = false;
}));
__ATEXIT__.push((function() {
 FS.quit();
}));
Module["FS_createFolder"] = FS.createFolder;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createLink"] = FS.createLink;
Module["FS_createDevice"] = FS.createDevice;
Module["FS_unlink"] = FS.unlink;
__ATINIT__.unshift((function() {
 TTY.init();
}));
__ATEXIT__.push((function() {
 TTY.shutdown();
}));
if (ENVIRONMENT_IS_NODE) {
 var fs = require("fs");
 var NODEJS_PATH = require("path");
 NODEFS.staticInit();
}
___buildEnvironment(ENV);
DYNAMICTOP_PTR = allocate(1, "i32", ALLOC_STATIC);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
STACK_MAX = STACK_BASE + TOTAL_STACK;
DYNAMIC_BASE = Runtime.alignMemory(STACK_MAX);
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
staticSealed = true;
Module["wasmTableSize"] = 2542;
Module["wasmMaxTableSize"] = 2542;
function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
 try {
  return Module["dynCall_iiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iiiiiid(index, a1, a2, a3, a4, a5, a6) {
 try {
  return Module["dynCall_iiiiiid"](index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vd(index, a1) {
 try {
  Module["dynCall_vd"](index, a1);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vf(index, a1) {
 try {
  Module["dynCall_vf"](index, a1);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viiiii(index, a1, a2, a3, a4, a5) {
 try {
  Module["dynCall_viiiii"](index, a1, a2, a3, a4, a5);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vi(index, a1) {
 try {
  Module["dynCall_vi"](index, a1);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
 try {
  Module["dynCall_viiiiiii"](index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vii(index, a1, a2) {
 try {
  Module["dynCall_vii"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
 try {
  return Module["dynCall_iiiiiii"](index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_ii(index, a1) {
 try {
  return Module["dynCall_ii"](index, a1);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viijii(index, a1, a2, a3, a4, a5, a6) {
 try {
  Module["dynCall_viijii"](index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
 try {
  Module["dynCall_viiiiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vif(index, a1, a2) {
 try {
  Module["dynCall_vif"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viffff(index, a1, a2, a3, a4, a5) {
 try {
  Module["dynCall_viffff"](index, a1, a2, a3, a4, a5);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_jiji(index, a1, a2, a3, a4) {
 try {
  return Module["dynCall_jiji"](index, a1, a2, a3, a4);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iiiii(index, a1, a2, a3, a4) {
 try {
  return Module["dynCall_iiiii"](index, a1, a2, a3, a4);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iiii(index, a1, a2, a3) {
 try {
  return Module["dynCall_iiii"](index, a1, a2, a3);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viff(index, a1, a2, a3) {
 try {
  Module["dynCall_viff"](index, a1, a2, a3);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vifff(index, a1, a2, a3, a4) {
 try {
  Module["dynCall_vifff"](index, a1, a2, a3, a4);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
 try {
  Module["dynCall_viiiiii"](index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viii(index, a1, a2, a3) {
 try {
  Module["dynCall_viii"](index, a1, a2, a3);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 try {
  Module["dynCall_viiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_v(index) {
 try {
  Module["dynCall_v"](index);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_ji(index, a1) {
 try {
  return Module["dynCall_ji"](index, a1);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 try {
  Module["dynCall_viiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iii(index, a1, a2) {
 try {
  return Module["dynCall_iii"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
 try {
  return Module["dynCall_iiiiii"](index, a1, a2, a3, a4, a5);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vfi(index, a1, a2) {
 try {
  Module["dynCall_vfi"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_i(index) {
 try {
  return Module["dynCall_i"](index);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vff(index, a1, a2) {
 try {
  Module["dynCall_vff"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vffff(index, a1, a2, a3, a4) {
 try {
  Module["dynCall_vffff"](index, a1, a2, a3, a4);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 try {
  return Module["dynCall_iiiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vdddddd(index, a1, a2, a3, a4, a5, a6) {
 try {
  Module["dynCall_vdddddd"](index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iiiiij(index, a1, a2, a3, a4, a5, a6) {
 try {
  return Module["dynCall_iiiiij"](index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_vdd(index, a1, a2) {
 try {
  Module["dynCall_vdd"](index, a1, a2);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iiiiidii(index, a1, a2, a3, a4, a5, a6, a7) {
 try {
  return Module["dynCall_iiiiidii"](index, a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 try {
  return Module["dynCall_iiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viif(index, a1, a2, a3) {
 try {
  Module["dynCall_viif"](index, a1, a2, a3);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
 try {
  return Module["dynCall_iiiiid"](index, a1, a2, a3, a4, a5);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
function invoke_viiii(index, a1, a2, a3, a4) {
 try {
  Module["dynCall_viiii"](index, a1, a2, a3, a4);
 } catch (e) {
  if (typeof e !== "number" && e !== "longjmp") throw e;
  Module["setThrew"](1, 0);
 }
}
Module.asmGlobalArg = {
 "Math": Math,
 "Int8Array": Int8Array,
 "Int16Array": Int16Array,
 "Int32Array": Int32Array,
 "Uint8Array": Uint8Array,
 "Uint16Array": Uint16Array,
 "Uint32Array": Uint32Array,
 "Float32Array": Float32Array,
 "Float64Array": Float64Array,
 "NaN": NaN,
 "Infinity": Infinity
};
Module.asmLibraryArg = {
 "abort": abort,
 "assert": assert,
 "enlargeMemory": enlargeMemory,
 "getTotalMemory": getTotalMemory,
 "abortOnCannotGrowMemory": abortOnCannotGrowMemory,
 "invoke_iiiiiiii": invoke_iiiiiiii,
 "invoke_iiiiiid": invoke_iiiiiid,
 "invoke_vd": invoke_vd,
 "invoke_vf": invoke_vf,
 "invoke_viiiii": invoke_viiiii,
 "invoke_vi": invoke_vi,
 "invoke_viiiiiii": invoke_viiiiiii,
 "invoke_vii": invoke_vii,
 "invoke_iiiiiii": invoke_iiiiiii,
 "invoke_ii": invoke_ii,
 "invoke_viijii": invoke_viijii,
 "invoke_viiiiiiiiiii": invoke_viiiiiiiiiii,
 "invoke_vif": invoke_vif,
 "invoke_viffff": invoke_viffff,
 "invoke_jiji": invoke_jiji,
 "invoke_iiiii": invoke_iiiii,
 "invoke_iiii": invoke_iiii,
 "invoke_viff": invoke_viff,
 "invoke_vifff": invoke_vifff,
 "invoke_viiiiii": invoke_viiiiii,
 "invoke_viii": invoke_viii,
 "invoke_viiiiiiii": invoke_viiiiiiii,
 "invoke_v": invoke_v,
 "invoke_ji": invoke_ji,
 "invoke_viiiiiiiii": invoke_viiiiiiiii,
 "invoke_iii": invoke_iii,
 "invoke_iiiiii": invoke_iiiiii,
 "invoke_vfi": invoke_vfi,
 "invoke_i": invoke_i,
 "invoke_vff": invoke_vff,
 "invoke_vffff": invoke_vffff,
 "invoke_iiiiiiiiii": invoke_iiiiiiiiii,
 "invoke_vdddddd": invoke_vdddddd,
 "invoke_iiiiij": invoke_iiiiij,
 "invoke_vdd": invoke_vdd,
 "invoke_iiiiidii": invoke_iiiiidii,
 "invoke_iiiiiiiii": invoke_iiiiiiiii,
 "invoke_viif": invoke_viif,
 "invoke_iiiiid": invoke_iiiiid,
 "invoke_viiii": invoke_viiii,
 "_emscripten_glGetTexParameterfv": _emscripten_glGetTexParameterfv,
 "___syscall221": ___syscall221,
 "_emscripten_glBlendFuncSeparate": _emscripten_glBlendFuncSeparate,
 "_emscripten_glGetIntegerv": _emscripten_glGetIntegerv,
 "___assert_fail": ___assert_fail,
 "_emscripten_glDepthFunc": _emscripten_glDepthFunc,
 "_glDisableVertexAttribArray": _glDisableVertexAttribArray,
 "_emscripten_memcpy_big": _emscripten_memcpy_big,
 "_emscripten_glUniform1f": _emscripten_glUniform1f,
 "emscriptenWebGLComputeImageSize": emscriptenWebGLComputeImageSize,
 "_emscripten_glUniform1i": _emscripten_glUniform1i,
 "_emscripten_glIsProgram": _emscripten_glIsProgram,
 "_emscripten_glTexParameteriv": _emscripten_glTexParameteriv,
 "___syscall140": ___syscall140,
 "___syscall145": ___syscall145,
 "___syscall146": ___syscall146,
 "_emscripten_glAttachShader": _emscripten_glAttachShader,
 "_emscripten_get_now_is_monotonic": _emscripten_get_now_is_monotonic,
 "_emscripten_glTexParameterfv": _emscripten_glTexParameterfv,
 "_emscripten_glUniformMatrix2fv": _emscripten_glUniformMatrix2fv,
 "_emscripten_glDrawArraysInstanced": _emscripten_glDrawArraysInstanced,
 "_emscripten_glVertexAttrib2fv": _emscripten_glVertexAttrib2fv,
 "_glViewport": _glViewport,
 "_emscripten_glFlush": _emscripten_glFlush,
 "_nanosleep": _nanosleep,
 "___syscall91": ___syscall91,
 "_pthread_once": _pthread_once,
 "_eglWaitClient": _eglWaitClient,
 "_glAttachShader": _glAttachShader,
 "_emscripten_glTexCoordPointer": _emscripten_glTexCoordPointer,
 "_clock_gettime": _clock_gettime,
 "_glGenTextures": _glGenTextures,
 "_emscripten_glStencilFuncSeparate": _emscripten_glStencilFuncSeparate,
 "_emscripten_glVertexAttrib3f": _emscripten_glVertexAttrib3f,
 "_dlerror": _dlerror,
 "_emscripten_get_gamepad_status": _emscripten_get_gamepad_status,
 "_emscripten_glUniform1iv": _emscripten_glUniform1iv,
 "emscriptenWebGLGetUniform": emscriptenWebGLGetUniform,
 "_emscripten_glOrtho": _emscripten_glOrtho,
 "_glClearColor": _glClearColor,
 "_emscripten_glGetBufferParameteriv": _emscripten_glGetBufferParameteriv,
 "_emscripten_set_gamepadconnected_callback": _emscripten_set_gamepadconnected_callback,
 "_pthread_getspecific": _pthread_getspecific,
 "_glDrawArrays": _glDrawArrays,
 "_emscripten_glDepthRange": _emscripten_glDepthRange,
 "_glActiveTexture": _glActiveTexture,
 "_emscripten_request_pointerlock": _emscripten_request_pointerlock,
 "_emscripten_asm_const_iii": _emscripten_asm_const_iii,
 "_eglMakeCurrent": _eglMakeCurrent,
 "_emscripten_glCopyTexImage2D": _emscripten_glCopyTexImage2D,
 "_emscripten_glFramebufferTexture2D": _emscripten_glFramebufferTexture2D,
 "_glEnableVertexAttribArray": _glEnableVertexAttribArray,
 "_emscripten_glStencilFunc": _emscripten_glStencilFunc,
 "_emscripten_glRenderbufferStorage": _emscripten_glRenderbufferStorage,
 "_emscripten_set_keydown_callback": _emscripten_set_keydown_callback,
 "_emscripten_glVertexPointer": _emscripten_glVertexPointer,
 "_eglInitialize": _eglInitialize,
 "_glLinkProgram": _glLinkProgram,
 "_emscripten_glGetUniformfv": _emscripten_glGetUniformfv,
 "___gxx_personality_v0": ___gxx_personality_v0,
 "_glMatrixMode": _glMatrixMode,
 "_emscripten_glStencilOp": _emscripten_glStencilOp,
 "_emscripten_glBlendEquation": _emscripten_glBlendEquation,
 "_glVertex3f": _glVertex3f,
 "_glClearDepth": _glClearDepth,
 "_dlclose": _dlclose,
 "_gluOrtho2D": _gluOrtho2D,
 "_emscripten_glUniform4fv": _emscripten_glUniform4fv,
 "___cxa_throw": ___cxa_throw,
 "_emscripten_glUniform2fv": _emscripten_glUniform2fv,
 "_emscripten_glBindBuffer": _emscripten_glBindBuffer,
 "_emscripten_glGetFloatv": _emscripten_glGetFloatv,
 "_glTexSubImage2D": _glTexSubImage2D,
 "_glUseProgram": _glUseProgram,
 "_eglGetDisplay": _eglGetDisplay,
 "_emscripten_glCullFace": _emscripten_glCullFace,
 "_emscripten_glStencilMaskSeparate": _emscripten_glStencilMaskSeparate,
 "_emscripten_glUniform3fv": _emscripten_glUniform3fv,
 "_emscripten_asm_const_ii": _emscripten_asm_const_ii,
 "_glBindBuffer": _glBindBuffer,
 "_emscripten_glDisableVertexAttribArray": _emscripten_glDisableVertexAttribArray,
 "_eglBindAPI": _eglBindAPI,
 "_eglCreateContext": _eglCreateContext,
 "_emscripten_set_touchstart_callback": _emscripten_set_touchstart_callback,
 "_emscripten_glGetBooleanv": _emscripten_glGetBooleanv,
 "_emscripten_glVertexAttribDivisor": _emscripten_glVertexAttribDivisor,
 "_emscripten_glGenBuffers": _emscripten_glGenBuffers,
 "_emscripten_glDeleteObjectARB": _emscripten_glDeleteObjectARB,
 "_emscripten_glGetShaderPrecisionFormat": _emscripten_glGetShaderPrecisionFormat,
 "_emscripten_request_fullscreen_strategy": _emscripten_request_fullscreen_strategy,
 "_emscripten_glIsEnabled": _emscripten_glIsEnabled,
 "_emscripten_glStencilOpSeparate": _emscripten_glStencilOpSeparate,
 "_emulGlDeleteVertexArrays": _emulGlDeleteVertexArrays,
 "_emscripten_glColor4ub": _emscripten_glColor4ub,
 "_emscripten_glGetActiveAttrib": _emscripten_glGetActiveAttrib,
 "_glHint": _glHint,
 "_glVertexPointer": _glVertexPointer,
 "___cxa_find_matching_catch": ___cxa_find_matching_catch,
 "_emscripten_glClear": _emscripten_glClear,
 "_emscripten_glValidateProgram": _emscripten_glValidateProgram,
 "_emscripten_glUniform4iv": _emscripten_glUniform4iv,
 "___setErrNo": ___setErrNo,
 "_eglSwapBuffers": _eglSwapBuffers,
 "_emscripten_glVertexAttrib2f": _emscripten_glVertexAttrib2f,
 "___resumeException": ___resumeException,
 "_emscripten_glGetError": _emscripten_glGetError,
 "_emscripten_glBufferData": _emscripten_glBufferData,
 "_emscripten_glVertexAttrib1fv": _emscripten_glVertexAttrib1fv,
 "_emscripten_glReadPixels": _emscripten_glReadPixels,
 "_glGetIntegerv": _glGetIntegerv,
 "_eglCreateWindowSurface": _eglCreateWindowSurface,
 "_emscripten_glClearStencil": _emscripten_glClearStencil,
 "emscriptenWebGLGet": emscriptenWebGLGet,
 "_emscripten_get_device_pixel_ratio": _emscripten_get_device_pixel_ratio,
 "_emscripten_set_mouseup_callback": _emscripten_set_mouseup_callback,
 "_emscripten_glFinish": _emscripten_glFinish,
 "_emscripten_glClearDepth": _emscripten_glClearDepth,
 "_emscripten_glUniform1fv": _emscripten_glUniform1fv,
 "_emscripten_set_resize_callback": _emscripten_set_resize_callback,
 "_emscripten_glUniform4i": _emscripten_glUniform4i,
 "_llvm_pow_f64": _llvm_pow_f64,
 "_emscripten_glUniform4f": _emscripten_glUniform4f,
 "_emscripten_glBlendFunc": _emscripten_glBlendFunc,
 "_emscripten_glStencilMask": _emscripten_glStencilMask,
 "__emscripten_sample_gamepad_data": __emscripten_sample_gamepad_data,
 "_glBindTexture": _glBindTexture,
 "_emscripten_glGetProgramInfoLog": _emscripten_glGetProgramInfoLog,
 "_glGetFloatv": _glGetFloatv,
 "_strftime": _strftime,
 "_emscripten_glGetVertexAttribiv": _emscripten_glGetVertexAttribiv,
 "_emulGlGenVertexArrays": _emulGlGenVertexArrays,
 "_emscripten_glUniformMatrix3fv": _emscripten_glUniformMatrix3fv,
 "___map_file": ___map_file,
 "_pthread_key_create": _pthread_key_create,
 "_emscripten_glDeleteFramebuffers": _emscripten_glDeleteFramebuffers,
 "__setLetterbox": __setLetterbox,
 "_emscripten_glGetObjectParameterivARB": _emscripten_glGetObjectParameterivARB,
 "_emscripten_glGetUniformiv": _emscripten_glGetUniformiv,
 "_glScissor": _glScissor,
 "_eglDestroySurface": _eglDestroySurface,
 "_sigaction": _sigaction,
 "_emscripten_glTexSubImage2D": _emscripten_glTexSubImage2D,
 "_emscripten_glDeleteTextures": _emscripten_glDeleteTextures,
 "_eglDestroyContext": _eglDestroyContext,
 "_emscripten_exit_fullscreen": _emscripten_exit_fullscreen,
 "_strftime_l": _strftime_l,
 "_glTexParameteri": _glTexParameteri,
 "_glBindAttribLocation": _glBindAttribLocation,
 "_emscripten_glColor4f": _emscripten_glColor4f,
 "_emscripten_glBufferSubData": _emscripten_glBufferSubData,
 "_emscripten_glBindTexture": _emscripten_glBindTexture,
 "_emscripten_glGenRenderbuffers": _emscripten_glGenRenderbuffers,
 "_glEnd": _glEnd,
 "_emscripten_set_main_loop": _emscripten_set_main_loop,
 "_emscripten_glIsShader": _emscripten_glIsShader,
 "_emscripten_asm_const_iiii": _emscripten_asm_const_iiii,
 "_glColor3ub": _glColor3ub,
 "_emscripten_glCompressedTexImage2D": _emscripten_glCompressedTexImage2D,
 "_glDisable": _glDisable,
 "_emscripten_glGetInfoLogARB": _emscripten_glGetInfoLogARB,
 "_emscripten_longjmp": _emscripten_longjmp,
 "_atexit": _atexit,
 "_emscripten_glDeleteVertexArrays": _emscripten_glDeleteVertexArrays,
 "_emscripten_glReleaseShaderCompiler": _emscripten_glReleaseShaderCompiler,
 "_dlsym": _dlsym,
 "_emscripten_glFrontFace": _emscripten_glFrontFace,
 "_glDeleteProgram": _glDeleteProgram,
 "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv,
 "_emscripten_glUseProgram": _emscripten_glUseProgram,
 "__addDays": __addDays,
 "_emscripten_set_touchmove_callback": _emscripten_set_touchmove_callback,
 "_glBlendFunc": _glBlendFunc,
 "_emscripten_glUniform3iv": _emscripten_glUniform3iv,
 "_glCreateShader": _glCreateShader,
 "_glTexCoord2f": _glTexCoord2f,
 "_glShaderSource": _glShaderSource,
 "___cxa_atexit": ___cxa_atexit,
 "_emscripten_glScissor": _emscripten_glScissor,
 "_emscripten_set_element_css_size": _emscripten_set_element_css_size,
 "_glGetBooleanv": _glGetBooleanv,
 "_emscripten_glIsBuffer": _emscripten_glIsBuffer,
 "_emscripten_glVertexAttrib1f": _emscripten_glVertexAttrib1f,
 "_glVertexAttribPointer": _glVertexAttribPointer,
 "_emscripten_glCompressedTexSubImage2D": _emscripten_glCompressedTexSubImage2D,
 "_emscripten_glGetAttachedShaders": _emscripten_glGetAttachedShaders,
 "_emscripten_glGenTextures": _emscripten_glGenTextures,
 "_eglGetConfigAttrib": _eglGetConfigAttrib,
 "_emscripten_glGetTexParameteriv": _emscripten_glGetTexParameteriv,
 "_glDeleteTextures": _glDeleteTextures,
 "_emscripten_set_mousedown_callback": _emscripten_set_mousedown_callback,
 "_emscripten_glClientActiveTexture": _emscripten_glClientActiveTexture,
 "_emscripten_glCheckFramebufferStatus": _emscripten_glCheckFramebufferStatus,
 "_eglWaitGL": _eglWaitGL,
 "_emscripten_glUniform3f": _emscripten_glUniform3f,
 "_emscripten_glUniform3i": _emscripten_glUniform3i,
 "_emscripten_glDeleteShader": _emscripten_glDeleteShader,
 "_glEnable": _glEnable,
 "_glGetString": _glGetString,
 "_emscripten_glGetUniformLocation": _emscripten_glGetUniformLocation,
 "_glPushMatrix": _glPushMatrix,
 "_emscripten_glEnableVertexAttribArray": _emscripten_glEnableVertexAttribArray,
 "_emscripten_get_now": _emscripten_get_now,
 "__registerRestoreOldStyle": __registerRestoreOldStyle,
 "emscriptenWebGLGetTexPixelData": emscriptenWebGLGetTexPixelData,
 "_glDetachShader": _glDetachShader,
 "_gettimeofday": _gettimeofday,
 "_eglWaitNative": _eglWaitNative,
 "_emscripten_glEnableClientState": _emscripten_glEnableClientState,
 "_eglChooseConfig": _eglChooseConfig,
 "_emscripten_glDrawElements": _emscripten_glDrawElements,
 "_emscripten_get_num_gamepads": _emscripten_get_num_gamepads,
 "___buildEnvironment": ___buildEnvironment,
 "_glEnableClientState": _glEnableClientState,
 "_emscripten_glGetAttribLocation": _emscripten_glGetAttribLocation,
 "_glIsEnabled": _glIsEnabled,
 "_emscripten_glDisable": _emscripten_glDisable,
 "_emscripten_glDeleteRenderbuffers": _emscripten_glDeleteRenderbuffers,
 "_emscripten_glDrawElementsInstanced": _emscripten_glDrawElementsInstanced,
 "_emscripten_glVertexAttrib4f": _emscripten_glVertexAttrib4f,
 "_emscripten_glPixelStorei": _emscripten_glPixelStorei,
 "_getenv": _getenv,
 "_emscripten_set_gamepaddisconnected_callback": _emscripten_set_gamepaddisconnected_callback,
 "_glTexCoordPointer": _glTexCoordPointer,
 "_emscripten_glFramebufferRenderbuffer": _emscripten_glFramebufferRenderbuffer,
 "_emscripten_glRotatef": _emscripten_glRotatef,
 "_emscripten_glGetShaderiv": _emscripten_glGetShaderiv,
 "___cxa_pure_virtual": ___cxa_pure_virtual,
 "_emscripten_glUniformMatrix4fv": _emscripten_glUniformMatrix4fv,
 "_emscripten_glGetPointerv": _emscripten_glGetPointerv,
 "_pthread_cond_wait": _pthread_cond_wait,
 "_emscripten_set_blur_callback": _emscripten_set_blur_callback,
 "_emscripten_glIsRenderbuffer": _emscripten_glIsRenderbuffer,
 "_emscripten_glLoadMatrixf": _emscripten_glLoadMatrixf,
 "_emscripten_set_mousemove_callback": _emscripten_set_mousemove_callback,
 "_emscripten_set_touchcancel_callback": _emscripten_set_touchcancel_callback,
 "_emscripten_set_focus_callback": _emscripten_set_focus_callback,
 "_emscripten_glGetVertexAttribfv": _emscripten_glGetVertexAttribfv,
 "_emscripten_glVertexAttrib3fv": _emscripten_glVertexAttrib3fv,
 "_emscripten_glCompileShader": _emscripten_glCompileShader,
 "_glClear": _glClear,
 "_glPopMatrix": _glPopMatrix,
 "__arraySum": __arraySum,
 "_emscripten_glLinkProgram": _emscripten_glLinkProgram,
 "_emscripten_get_pointerlock_status": _emscripten_get_pointerlock_status,
 "_emscripten_glDrawRangeElements": _emscripten_glDrawRangeElements,
 "___unlock": ___unlock,
 "_pthread_setspecific": _pthread_setspecific,
 "_emscripten_glClearColor": _emscripten_glClearColor,
 "_emscripten_glCreateProgram": _emscripten_glCreateProgram,
 "_glLoadIdentity": _glLoadIdentity,
 "_emscripten_glDetachShader": _emscripten_glDetachShader,
 "_glTexParameterf": _glTexParameterf,
 "_emscripten_do_request_fullscreen": _emscripten_do_request_fullscreen,
 "_emscripten_set_mouseleave_callback": _emscripten_set_mouseleave_callback,
 "_emscripten_get_element_css_size": _emscripten_get_element_css_size,
 "_emscripten_set_fullscreenchange_callback": _emscripten_set_fullscreenchange_callback,
 "_emscripten_glVertexAttribPointer": _emscripten_glVertexAttribPointer,
 "_emscripten_set_keyup_callback": _emscripten_set_keyup_callback,
 "_emscripten_glDrawArrays": _emscripten_glDrawArrays,
 "_emscripten_glPolygonOffset": _emscripten_glPolygonOffset,
 "_longjmp": _longjmp,
 "_emscripten_glBlendColor": _emscripten_glBlendColor,
 "_signal": _signal,
 "_emscripten_set_main_loop_timing": _emscripten_set_main_loop_timing,
 "___cxa_begin_catch": ___cxa_begin_catch,
 "_emscripten_glGetProgramiv": _emscripten_glGetProgramiv,
 "_emscripten_glGetShaderSource": _emscripten_glGetShaderSource,
 "_emscripten_glTexImage2D": _emscripten_glTexImage2D,
 "__isLeapYear": __isLeapYear,
 "_emscripten_glBlendEquationSeparate": _emscripten_glBlendEquationSeparate,
 "_emscripten_glGetString": _emscripten_glGetString,
 "_emscripten_glIsFramebuffer": _emscripten_glIsFramebuffer,
 "_emscripten_glBindProgramARB": _emscripten_glBindProgramARB,
 "_glutCreateWindow": _glutCreateWindow,
 "_emscripten_glUniform2i": _emscripten_glUniform2i,
 "_emscripten_glUniform2f": _emscripten_glUniform2f,
 "_glBegin": _glBegin,
 "_emscripten_glTexParameterf": _emscripten_glTexParameterf,
 "_emscripten_glGenerateMipmap": _emscripten_glGenerateMipmap,
 "_emscripten_glColorMask": _emscripten_glColorMask,
 "_glutInitDisplayMode": _glutInitDisplayMode,
 "_emscripten_glGenVertexArrays": _emscripten_glGenVertexArrays,
 "_emscripten_set_visibilitychange_callback": _emscripten_set_visibilitychange_callback,
 "_eglGetProcAddress": _eglGetProcAddress,
 "_emscripten_glBindAttribLocation": _emscripten_glBindAttribLocation,
 "_glDepthFunc": _glDepthFunc,
 "___cxa_allocate_exception": ___cxa_allocate_exception,
 "_emscripten_set_canvas_size": _emscripten_set_canvas_size,
 "_emscripten_asm_const_v": _emscripten_asm_const_v,
 "_emscripten_glClearDepthf": _emscripten_glClearDepthf,
 "_emscripten_set_mouseenter_callback": _emscripten_set_mouseenter_callback,
 "_emscripten_glMatrixMode": _emscripten_glMatrixMode,
 "_emulGlBindVertexArray": _emulGlBindVertexArray,
 "_emscripten_glNormalPointer": _emscripten_glNormalPointer,
 "_emscripten_glBindVertexArray": _emscripten_glBindVertexArray,
 "_emscripten_glEnable": _emscripten_glEnable,
 "___lock": ___lock,
 "_emscripten_glBindFramebuffer": _emscripten_glBindFramebuffer,
 "___syscall6": ___syscall6,
 "___syscall5": ___syscall5,
 "_emscripten_glBindRenderbuffer": _emscripten_glBindRenderbuffer,
 "_emscripten_glGetFramebufferAttachmentParameteriv": _emscripten_glGetFramebufferAttachmentParameteriv,
 "_emscripten_set_keypress_callback": _emscripten_set_keypress_callback,
 "_glVertex2f": _glVertex2f,
 "_emscripten_glShaderBinary": _emscripten_glShaderBinary,
 "_emscripten_glGetShaderInfoLog": _emscripten_glGetShaderInfoLog,
 "_emscripten_asm_const_iiiii": _emscripten_asm_const_iiiii,
 "_emscripten_glGetVertexAttribPointerv": _emscripten_glGetVertexAttribPointerv,
 "_emscripten_glGetActiveUniform": _emscripten_glGetActiveUniform,
 "emscriptenWebGLGetVertexAttrib": emscriptenWebGLGetVertexAttrib,
 "_eglSwapInterval": _eglSwapInterval,
 "_emscripten_glDeleteProgram": _emscripten_glDeleteProgram,
 "_glutDestroyWindow": _glutDestroyWindow,
 "_emscripten_glCreateShader": _emscripten_glCreateShader,
 "_emscripten_glColorPointer": _emscripten_glColorPointer,
 "_emscripten_glViewport": _emscripten_glViewport,
 "_emscripten_glDepthMask": _emscripten_glDepthMask,
 "_emscripten_glDrawBuffers": _emscripten_glDrawBuffers,
 "_emscripten_glLineWidth": _emscripten_glLineWidth,
 "_glCompileShader": _glCompileShader,
 "_emscripten_exit_pointerlock": _emscripten_exit_pointerlock,
 "_emscripten_glVertexAttrib4fv": _emscripten_glVertexAttrib4fv,
 "_abort": _abort,
 "_glTexImage2D": _glTexImage2D,
 "_emscripten_glGenFramebuffers": _emscripten_glGenFramebuffers,
 "_glDisableClientState": _glDisableClientState,
 "_emscripten_glLoadIdentity": _emscripten_glLoadIdentity,
 "_emscripten_glShaderSource": _emscripten_glShaderSource,
 "_emscripten_glTexParameteri": _emscripten_glTexParameteri,
 "_usleep": _usleep,
 "_emscripten_set_touchend_callback": _emscripten_set_touchend_callback,
 "_emscripten_glGetRenderbufferParameteriv": _emscripten_glGetRenderbufferParameteriv,
 "_eglTerminate": _eglTerminate,
 "_emscripten_glSampleCoverage": _emscripten_glSampleCoverage,
 "_emscripten_glFrustum": _emscripten_glFrustum,
 "_emscripten_glDepthRangef": _emscripten_glDepthRangef,
 "_glPixelStorei": _glPixelStorei,
 "_emscripten_glIsTexture": _emscripten_glIsTexture,
 "_emscripten_glHint": _emscripten_glHint,
 "_glShadeModel": _glShadeModel,
 "_emscripten_glActiveTexture": _emscripten_glActiveTexture,
 "_emscripten_set_wheel_callback": _emscripten_set_wheel_callback,
 "_emscripten_glDeleteBuffers": _emscripten_glDeleteBuffers,
 "___syscall54": ___syscall54,
 "_emscripten_glUniform2iv": _emscripten_glUniform2iv,
 "_emscripten_asm_const_i": _emscripten_asm_const_i,
 "_emscripten_glCopyTexSubImage2D": _emscripten_glCopyTexSubImage2D,
 "DYNAMICTOP_PTR": DYNAMICTOP_PTR,
 "tempDoublePtr": tempDoublePtr,
 "ABORT": ABORT,
 "STACKTOP": STACKTOP,
 "STACK_MAX": STACK_MAX,
 "___dso_handle": ___dso_handle
};
var asm = Module["asm"](Module.asmGlobalArg, Module.asmLibraryArg, buffer);
Module["asm"] = asm;
var _main = Module["_main"] = (function() {
 return Module["asm"]["_main"].apply(null, arguments);
});
var stackSave = Module["stackSave"] = (function() {
 return Module["asm"]["stackSave"].apply(null, arguments);
});
var setThrew = Module["setThrew"] = (function() {
 return Module["asm"]["setThrew"].apply(null, arguments);
});
var _fflush = Module["_fflush"] = (function() {
 return Module["asm"]["_fflush"].apply(null, arguments);
});
var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = (function() {
 return Module["asm"]["___cxa_is_pointer_type"].apply(null, arguments);
});
var _memset = Module["_memset"] = (function() {
 return Module["asm"]["_memset"].apply(null, arguments);
});
var _sbrk = Module["_sbrk"] = (function() {
 return Module["asm"]["_sbrk"].apply(null, arguments);
});
var _memcpy = Module["_memcpy"] = (function() {
 return Module["asm"]["_memcpy"].apply(null, arguments);
});
var ___errno_location = Module["___errno_location"] = (function() {
 return Module["asm"]["___errno_location"].apply(null, arguments);
});
var _fileno = Module["_fileno"] = (function() {
 return Module["asm"]["_fileno"].apply(null, arguments);
});
var stackAlloc = Module["stackAlloc"] = (function() {
 return Module["asm"]["stackAlloc"].apply(null, arguments);
});
var getTempRet0 = Module["getTempRet0"] = (function() {
 return Module["asm"]["getTempRet0"].apply(null, arguments);
});
var setTempRet0 = Module["setTempRet0"] = (function() {
 return Module["asm"]["setTempRet0"].apply(null, arguments);
});
var _realloc = Module["_realloc"] = (function() {
 return Module["asm"]["_realloc"].apply(null, arguments);
});
var _pthread_mutex_unlock = Module["_pthread_mutex_unlock"] = (function() {
 return Module["asm"]["_pthread_mutex_unlock"].apply(null, arguments);
});
var _emscripten_get_global_libc = Module["_emscripten_get_global_libc"] = (function() {
 return Module["asm"]["_emscripten_get_global_libc"].apply(null, arguments);
});
var _emscripten_GetProcAddress = Module["_emscripten_GetProcAddress"] = (function() {
 return Module["asm"]["_emscripten_GetProcAddress"].apply(null, arguments);
});
var _pthread_cond_broadcast = Module["_pthread_cond_broadcast"] = (function() {
 return Module["asm"]["_pthread_cond_broadcast"].apply(null, arguments);
});
var _llvm_bswap_i32 = Module["_llvm_bswap_i32"] = (function() {
 return Module["asm"]["_llvm_bswap_i32"].apply(null, arguments);
});
var runPostSets = Module["runPostSets"] = (function() {
 return Module["asm"]["runPostSets"].apply(null, arguments);
});
var _testSetjmp = Module["_testSetjmp"] = (function() {
 return Module["asm"]["_testSetjmp"].apply(null, arguments);
});
var _saveSetjmp = Module["_saveSetjmp"] = (function() {
 return Module["asm"]["_saveSetjmp"].apply(null, arguments);
});
var _free = Module["_free"] = (function() {
 return Module["asm"]["_free"].apply(null, arguments);
});
var ___cxa_can_catch = Module["___cxa_can_catch"] = (function() {
 return Module["asm"]["___cxa_can_catch"].apply(null, arguments);
});
var establishStackSpace = Module["establishStackSpace"] = (function() {
 return Module["asm"]["establishStackSpace"].apply(null, arguments);
});
var _memmove = Module["_memmove"] = (function() {
 return Module["asm"]["_memmove"].apply(null, arguments);
});
var _strstr = Module["_strstr"] = (function() {
 return Module["asm"]["_strstr"].apply(null, arguments);
});
var stackRestore = Module["stackRestore"] = (function() {
 return Module["asm"]["stackRestore"].apply(null, arguments);
});
var _malloc = Module["_malloc"] = (function() {
 return Module["asm"]["_malloc"].apply(null, arguments);
});
var _pthread_mutex_lock = Module["_pthread_mutex_lock"] = (function() {
 return Module["asm"]["_pthread_mutex_lock"].apply(null, arguments);
});
var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = (function() {
 return Module["asm"]["dynCall_iiiiiiii"].apply(null, arguments);
});
var dynCall_iiiiiid = Module["dynCall_iiiiiid"] = (function() {
 return Module["asm"]["dynCall_iiiiiid"].apply(null, arguments);
});
var dynCall_vd = Module["dynCall_vd"] = (function() {
 return Module["asm"]["dynCall_vd"].apply(null, arguments);
});
var dynCall_vf = Module["dynCall_vf"] = (function() {
 return Module["asm"]["dynCall_vf"].apply(null, arguments);
});
var dynCall_viiiii = Module["dynCall_viiiii"] = (function() {
 return Module["asm"]["dynCall_viiiii"].apply(null, arguments);
});
var dynCall_vi = Module["dynCall_vi"] = (function() {
 return Module["asm"]["dynCall_vi"].apply(null, arguments);
});
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = (function() {
 return Module["asm"]["dynCall_viiiiiii"].apply(null, arguments);
});
var dynCall_vii = Module["dynCall_vii"] = (function() {
 return Module["asm"]["dynCall_vii"].apply(null, arguments);
});
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = (function() {
 return Module["asm"]["dynCall_iiiiiii"].apply(null, arguments);
});
var dynCall_ii = Module["dynCall_ii"] = (function() {
 return Module["asm"]["dynCall_ii"].apply(null, arguments);
});
var dynCall_viijii = Module["dynCall_viijii"] = (function() {
 return Module["asm"]["dynCall_viijii"].apply(null, arguments);
});
var dynCall_viiiiiiiiiii = Module["dynCall_viiiiiiiiiii"] = (function() {
 return Module["asm"]["dynCall_viiiiiiiiiii"].apply(null, arguments);
});
var dynCall_vif = Module["dynCall_vif"] = (function() {
 return Module["asm"]["dynCall_vif"].apply(null, arguments);
});
var dynCall_viffff = Module["dynCall_viffff"] = (function() {
 return Module["asm"]["dynCall_viffff"].apply(null, arguments);
});
var dynCall_jiji = Module["dynCall_jiji"] = (function() {
 return Module["asm"]["dynCall_jiji"].apply(null, arguments);
});
var dynCall_iiiii = Module["dynCall_iiiii"] = (function() {
 return Module["asm"]["dynCall_iiiii"].apply(null, arguments);
});
var dynCall_iiii = Module["dynCall_iiii"] = (function() {
 return Module["asm"]["dynCall_iiii"].apply(null, arguments);
});
var dynCall_viff = Module["dynCall_viff"] = (function() {
 return Module["asm"]["dynCall_viff"].apply(null, arguments);
});
var dynCall_vifff = Module["dynCall_vifff"] = (function() {
 return Module["asm"]["dynCall_vifff"].apply(null, arguments);
});
var dynCall_viiiiii = Module["dynCall_viiiiii"] = (function() {
 return Module["asm"]["dynCall_viiiiii"].apply(null, arguments);
});
var dynCall_viii = Module["dynCall_viii"] = (function() {
 return Module["asm"]["dynCall_viii"].apply(null, arguments);
});
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = (function() {
 return Module["asm"]["dynCall_viiiiiiii"].apply(null, arguments);
});
var dynCall_v = Module["dynCall_v"] = (function() {
 return Module["asm"]["dynCall_v"].apply(null, arguments);
});
var dynCall_ji = Module["dynCall_ji"] = (function() {
 return Module["asm"]["dynCall_ji"].apply(null, arguments);
});
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = (function() {
 return Module["asm"]["dynCall_viiiiiiiii"].apply(null, arguments);
});
var dynCall_iii = Module["dynCall_iii"] = (function() {
 return Module["asm"]["dynCall_iii"].apply(null, arguments);
});
var dynCall_iiiiii = Module["dynCall_iiiiii"] = (function() {
 return Module["asm"]["dynCall_iiiiii"].apply(null, arguments);
});
var dynCall_vfi = Module["dynCall_vfi"] = (function() {
 return Module["asm"]["dynCall_vfi"].apply(null, arguments);
});
var dynCall_i = Module["dynCall_i"] = (function() {
 return Module["asm"]["dynCall_i"].apply(null, arguments);
});
var dynCall_vff = Module["dynCall_vff"] = (function() {
 return Module["asm"]["dynCall_vff"].apply(null, arguments);
});
var dynCall_vffff = Module["dynCall_vffff"] = (function() {
 return Module["asm"]["dynCall_vffff"].apply(null, arguments);
});
var dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = (function() {
 return Module["asm"]["dynCall_iiiiiiiiii"].apply(null, arguments);
});
var dynCall_vdddddd = Module["dynCall_vdddddd"] = (function() {
 return Module["asm"]["dynCall_vdddddd"].apply(null, arguments);
});
var dynCall_iiiiij = Module["dynCall_iiiiij"] = (function() {
 return Module["asm"]["dynCall_iiiiij"].apply(null, arguments);
});
var dynCall_vdd = Module["dynCall_vdd"] = (function() {
 return Module["asm"]["dynCall_vdd"].apply(null, arguments);
});
var dynCall_iiiiidii = Module["dynCall_iiiiidii"] = (function() {
 return Module["asm"]["dynCall_iiiiidii"].apply(null, arguments);
});
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = (function() {
 return Module["asm"]["dynCall_iiiiiiiii"].apply(null, arguments);
});
var dynCall_viif = Module["dynCall_viif"] = (function() {
 return Module["asm"]["dynCall_viif"].apply(null, arguments);
});
var dynCall_iiiiid = Module["dynCall_iiiiid"] = (function() {
 return Module["asm"]["dynCall_iiiiid"].apply(null, arguments);
});
var dynCall_viiii = Module["dynCall_viiii"] = (function() {
 return Module["asm"]["dynCall_viiii"].apply(null, arguments);
});
Runtime.stackAlloc = Module["stackAlloc"];
Runtime.stackSave = Module["stackSave"];
Runtime.stackRestore = Module["stackRestore"];
Runtime.establishStackSpace = Module["establishStackSpace"];
Runtime.setTempRet0 = Module["setTempRet0"];
Runtime.getTempRet0 = Module["getTempRet0"];
Module["asm"] = asm;
if (memoryInitializer) {
 if (typeof Module["locateFile"] === "function") {
  memoryInitializer = Module["locateFile"](memoryInitializer);
 } else if (Module["memoryInitializerPrefixURL"]) {
  memoryInitializer = Module["memoryInitializerPrefixURL"] + memoryInitializer;
 }
 if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
  var data = Module["readBinary"](memoryInitializer);
  HEAPU8.set(data, Runtime.GLOBAL_BASE);
 } else {
  addRunDependency("memory initializer");
  var applyMemoryInitializer = (function(data) {
   if (data.byteLength) data = new Uint8Array(data);
   HEAPU8.set(data, Runtime.GLOBAL_BASE);
   if (Module["memoryInitializerRequest"]) delete Module["memoryInitializerRequest"].response;
   removeRunDependency("memory initializer");
  });
  function doBrowserLoad() {
   Module["readAsync"](memoryInitializer, applyMemoryInitializer, (function() {
    throw "could not load memory initializer " + memoryInitializer;
   }));
  }
  if (Module["memoryInitializerRequest"]) {
   function useRequest() {
    var request = Module["memoryInitializerRequest"];
    if (request.status !== 200 && request.status !== 0) {
     console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: " + request.status + ", retrying " + memoryInitializer);
     doBrowserLoad();
     return;
    }
    applyMemoryInitializer(request.response);
   }
   if (Module["memoryInitializerRequest"].response) {
    setTimeout(useRequest, 0);
   } else {
    Module["memoryInitializerRequest"].addEventListener("load", useRequest);
   }
  } else {
   doBrowserLoad();
  }
 }
}
function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = "Program terminated with exit(" + status + ")";
 this.status = status;
}
ExitStatus.prototype = new Error;
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
 if (!Module["calledRun"]) run();
 if (!Module["calledRun"]) dependenciesFulfilled = runCaller;
};
Module["callMain"] = Module.callMain = function callMain(args) {
 args = args || [];
 ensureInitRuntime();
 var argc = args.length + 1;
 function pad() {
  for (var i = 0; i < 4 - 1; i++) {
   argv.push(0);
  }
 }
 var argv = [ allocate(intArrayFromString(Module["thisProgram"]), "i8", ALLOC_NORMAL) ];
 pad();
 for (var i = 0; i < argc - 1; i = i + 1) {
  argv.push(allocate(intArrayFromString(args[i]), "i8", ALLOC_NORMAL));
  pad();
 }
 argv.push(0);
 argv = allocate(argv, "i32", ALLOC_NORMAL);
 try {
  var ret = Module["_main"](argc, argv, 0);
  exit(ret, true);
 } catch (e) {
  if (e instanceof ExitStatus) {
   return;
  } else if (e == "SimulateInfiniteLoop") {
   Module["noExitRuntime"] = true;
   return;
  } else {
   var toLog = e;
   if (e && typeof e === "object" && e.stack) {
    toLog = [ e, e.stack ];
   }
   Module.printErr("exception thrown: " + toLog);
   Module["quit"](1, e);
  }
 } finally {
  calledMain = true;
 }
};
function run(args) {
 args = args || Module["arguments"];
 if (preloadStartTime === null) preloadStartTime = Date.now();
 if (runDependencies > 0) {
  return;
 }
 preRun();
 if (runDependencies > 0) return;
 if (Module["calledRun"]) return;
 function doRun() {
  if (Module["calledRun"]) return;
  Module["calledRun"] = true;
  if (ABORT) return;
  ensureInitRuntime();
  preMain();
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  if (Module["_main"] && shouldRunNow) Module["callMain"](args);
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout((function() {
   setTimeout((function() {
    Module["setStatus"]("");
   }), 1);
   doRun();
  }), 1);
 } else {
  doRun();
 }
}
Module["run"] = Module.run = run;
function exit(status, implicit) {
 if (implicit && Module["noExitRuntime"]) {
  return;
 }
 if (Module["noExitRuntime"]) {} else {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  exitRuntime();
  if (Module["onExit"]) Module["onExit"](status);
 }
 if (ENVIRONMENT_IS_NODE) {
  process["exit"](status);
 }
 Module["quit"](status, new ExitStatus(status));
}
Module["exit"] = Module.exit = exit;
var abortDecorators = [];
function abort(what) {
 if (what !== undefined) {
  Module.print(what);
  Module.printErr(what);
  what = JSON.stringify(what);
 } else {
  what = "";
 }
 ABORT = true;
 EXITSTATUS = 1;
 var extra = "\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";
 var output = "abort(" + what + ") at " + stackTrace() + extra;
 if (abortDecorators) {
  abortDecorators.forEach((function(decorator) {
   output = decorator(output, what);
  }));
 }
 throw output;
}
Module["abort"] = Module.abort = abort;
if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}
var shouldRunNow = true;
if (Module["noInitialRun"]) {
 shouldRunNow = false;
}
run();



