# biojs-vis-gprofiler

[![NPM version](http://img.shields.io/npm/v/biojs-vis-gprofiler.svg)](https://www.npmjs.org/package/biojs-vis-gprofiler)
[![Build Status](https://travis-ci.org/tambeta/biojs-vis-gprofiler.svg?branch=master)](https://travis-ci.org/tambeta/biojs-vis-gprofiler)

Retrieve most relevant GO terms from g:Profiler and render these as a string
cloud.

## Getting Started

Install the module with: `npm install biojs-vis-gprofiler`. Copy the minified
module `build/biojsvisgprofiler.min.js` to your scripts directory.

Usage without a module loader:

```html
<script src="/path/to/biojsvisgprofiler.min.js"></script>
<script type="text/javascript">

document.addEventListener("DOMContentLoaded", function(e) {
  gp = new biojsVisGprofiler({
    container : "#myContainer",
    width     : 600,
    height    : 600,
  });

  gp.on("onrender", function() {
    console.log("caught render event");
  });

  gp.render({
    query     : ["swi4", "swi6", "mbp1", "mcm1", "fkh1", "fkh2"],
    organism  : "scerevisiae",
  });
});

</script>
```

If using a module loader such as [require.js](http://requirejs.org/docs/start.html)
`require` the module from within your application or directly, such as:

```html
<script src="require.js"></script>
<script>

require(['/path/to/biojsvisgprofiler.min.js'], function(biojsVisGprofiler) {
	...
});

</script>
```

## Documentation

###Index

**Classes**

* [class: BioJSVisGProfiler](#BioJSVisGProfiler)
  * [new BioJSVisGProfiler(attrs)](#new_BioJSVisGProfiler)
  * [bioJSVisGProfiler.render(attrs)](#BioJSVisGProfiler#render)
  * [bioJSVisGProfiler.renderStored(data)](#BioJSVisGProfiler#renderStored)
  * [bioJSVisGProfiler.getGProfiler()](#BioJSVisGProfiler#getGProfiler)
  * [event: "onrender"](#BioJSVisGProfiler#event_onrender)

**Typedefs**

* [callback: renderCb](#renderCb)
* [callback: distillerCb](#distillerCb)
 
<a name="BioJSVisGProfiler"></a>
###class: BioJSVisGProfiler
**Members**

* [class: BioJSVisGProfiler](#BioJSVisGProfiler)
  * [new BioJSVisGProfiler(attrs)](#new_BioJSVisGProfiler)
  * [bioJSVisGProfiler.render(attrs)](#BioJSVisGProfiler#render)
  * [bioJSVisGProfiler.renderStored(data)](#BioJSVisGProfiler#renderStored)
  * [bioJSVisGProfiler.getGProfiler()](#BioJSVisGProfiler#getGProfiler)
  * [event: "onrender"](#BioJSVisGProfiler#event_onrender)

<a name="new_BioJSVisGProfiler"></a>
####new BioJSVisGProfiler(attrs)
Construct a BioJSVisGProfiler object.

**Params**

- attrs `Object` - Pass properties to the constructor via this object.  

**Properties**

- container `string` - Container wherein the cloud will be rendered,
 in selector format. _required_  
- width `int` - Width of the rendered cloud, in pixels.
_default_: 300  
- height `int` - Height of the rendered cloud, in pixels.
_default_: 300  
- maxN `int` - Max number of strings to display.  
- maxTermLen `int` - Max length of a term description, keep this at a
 reasonable value to ensure all terms are displayed. No effect if useTerms
 is false.  
- useTerms `boolean` - Display whole functional terms instead of
 single words.  
- warnings `boolean` - Log rendering warnings to the console.  
- showLogo `boolean` - Set to false to suppress displaying the
 g:Profiler logo at the bottom right.  
- sizer <code>[renderCb](#renderCb)</code> - Callback function returning the point size of a
 string.  
- colorer <code>[renderCb](#renderCb)</code> - Callback function returning the color of a
 string.  
- distiller <code>[distillerCb](#distillerCb)</code> - Callback function returning an array of
 strings to be rendered.  

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

<a name="BioJSVisGProfiler#renderStored"></a>
####bioJSVisGProfiler.renderStored(data)
Render cloud based on an object previously returned by an instance of
GProfiler.

**Params**

- data `Object` - Object returned by GProfiler.query.  

<a name="BioJSVisGProfiler#getGProfiler"></a>
####bioJSVisGProfiler.getGProfiler()
Return an instance of GProfiler.

<a name="BioJSVisGProfiler#event_onrender"></a>
####event: "onrender"
Fired when cloud rendering has completed.

<a name="renderCb"></a>
###callback: renderCb
**Params**

- score `int` - A score for the string (sum of all scores == 1)  
- scaling `int` - A constant scaling value proportional to the size of
 the container  
- str `string` - The string being rendered  
- termdata `Object` - The data structure returned from g:Profiler for
 the functional category associated with the current string  

**Type**: `function`  
<a name="distillerCb"></a>
###callback: distillerCb
**Params**

- termdata `Object` - The data structure returned from g:Profiler for
 a functional category  

**Type**: `function`  
**Returns**: `Array` | `null` - - An array of strings associated with the current term.
 Return `null` to discard the term.  


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
