# biojs-vis-gprofiler

[![NPM version](http://img.shields.io/npm/v/biojs-vis-gprofiler.svg)](https://www.npmjs.org/package/biojs-vis-gprofiler)
[![Build Status](https://travis-ci.org/tambeta/biojs-vis-gprofiler.svg?branch=master)](https://travis-ci.org/tambeta/biojs-vis-gprofiler)

Retrieve most relevant GO terms from g:Profiler and render these as a string 
cloud.

## Getting Started

Install the module with: `npm install biojs-vis-gprofiler`

```javascript
var gp = require('biojs-vis-gprofiler');

gp = new gp({
  container  : "#myContainer",
  width      : 600,
  height     : 600,	
});

gp.on("onrender", function() {
  console.log("caught render event");
});

gp.render({
  query    : ["swi4", "swi6", "mbp1"],
  organism : "scerevisiae",
});
```

## Documentation

###Index

**Classes**

* [class: BioJSVisGProfiler](#BioJSVisGProfiler)
  * [new BioJSVisGProfiler(attrs)](#new_BioJSVisGProfiler)
  * [bioJSVisGProfiler.render(attrs)](#BioJSVisGProfiler#render)
  * [event: "onrender"](#BioJSVisGProfiler#event_onrender)

**Typedefs**

* [callback: sizerCb](#sizerCb)
 
<a name="BioJSVisGProfiler"></a>
###class: BioJSVisGProfiler
**Members**

* [class: BioJSVisGProfiler](#BioJSVisGProfiler)
  * [new BioJSVisGProfiler(attrs)](#new_BioJSVisGProfiler)
  * [bioJSVisGProfiler.render(attrs)](#BioJSVisGProfiler#render)
  * [event: "onrender"](#BioJSVisGProfiler#event_onrender)

<a name="new_BioJSVisGProfiler"></a>
####new BioJSVisGProfiler(attrs)
Construct a BioJSVisGProfiler object.

**Params**

- attrs `Object` - Pass properties to the constructor via this object.  

**Properties**

- container `string` - Container wherein the cloud will be rendered,
 in selector format _required_  
- width `int` - Width of the rendered cloud, in pixels
_default_: 300  
- height `int` - Height of the rendered cloud, in pixels
_default_: 300  
- maxN `int` - Max number of strings to display  
- maxTermLen `int` - Max length of a term description, keep this at a
 reasonable value to ensure all terms are displayed. No effect in useTerms
 is false.  
- useTerms `boolean` - Display whole functional terms instead of
 single words  
- sizer <code>[sizerCb](#sizerCb)</code> - Callback function for computing
 the point size of a string based on passed score of the string and a scaling
 value dependent on the cloud dimensions.  

**Example**  
```
var gp = require('biojs-vis-gprofiler');

gp = new gp({
  container  : "#myContainer",
  width      : 600,
  height     : 600,
});

gp.on("onrender", function() {
  console.log("caught render event");
});

gp.render({
  query    : ["swi4", "swi6", "mbp1"],
  organism : "scerevisiae",
});
```

<a name="BioJSVisGProfiler#render"></a>
####bioJSVisGProfiler.render(attrs)
Query g:Profiler and render a cloud.

**Params**

- attrs `Object` - Pass properties to the method via this object.  

**Properties**

- organism `string` - The organism name in g:Profiler format,
 generally the first character of the genus + species in lowercase. E.g.
 "Mus musculus" -> "mmusculus".  
- query `string` | `Array` - a query symbol or a list thereof.  

<a name="BioJSVisGProfiler#event_onrender"></a>
####event: "onrender"
Fired when cloud rendering has completed.

<a name="sizerCb"></a>
###callback: sizerCb
**Params**

- score `int` - A score for the string (sum of all scores == 1)  
- scaling `int` - A constant scaling value proportional to the size of
 the rendering area  

**Type**: `function`  


## Contributing

Please submit all issues and pull requests to the
[tambeta/biojs-vis-gprofiler](http://github.com/tambeta/biojs-vis-gprofiler) repository!

## Support

If you have any problems or a suggestion please open an issue
[here](https://github.com/tambeta/biojs-vis-gprofiler/issues).

## License 

The BSD License

Copyright (c) 2014, Tambet Arak

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

* Neither the name of the Tambet Arak nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
