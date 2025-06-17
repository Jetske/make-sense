var r,t={exports:{}};
/*!
  Copyright (c) 2018 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/r=t,function(){var t={}.hasOwnProperty;function e(){for(var r=[],o=0;o<arguments.length;o++){var s=arguments[o];if(s){var n=typeof s;if("string"===n||"number"===n)r.push(s);else if(Array.isArray(s)){if(s.length){var a=e.apply(null,s);a&&r.push(a)}}else if("object"===n)if(s.toString===Object.prototype.toString)for(var i in s)t.call(s,i)&&s[i]&&r.push(i);else r.push(s.toString())}}return r.join(" ")}r.exports?(e.default=e,r.exports=e):window.classNames=e}();const e=t.exports;export{e as c};
