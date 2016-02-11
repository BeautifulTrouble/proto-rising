//= require jquery.js
//= require modernizr.js
//= require underscore.js
//= require bootstrap.js

//= require backbone-app.js

// Start
// ===================================================================
$(function() {
    console.log('Running...');
    App.main();
});


// Utilities
// ===================================================================
var JSONStorage = function(store, prefix) {
    // Local = JSONStorage(typeof localStorage !== "undefined" ? localStorage : {});
    // Local('x');                                  /* get */
    // Local('x', [1,2,3,4]);                       /* set */
    // Local('x', null);                            /* delete */
    // Local('x', possiblyUndefined, [1,2,3,4]);    /* set w/smart default */
    prefix = prefix || '';
    return function (key, value, fallbackValue) {
        // With a fallbackValue, you can be lazy about checking whether it
        // makes sense to store a default fallback value. When a fallbackValue
        // is specified but the given value is undefined, the fallbackValue is
        // stored in the JSONStorage object. This is true UNLESS a stored value 
        // already exists, which will always take precedence over a fallback.
        //
        // This can be thought of as an update-if-given-better-information 
        // operation.
        //
        //  someRoute: function(username) {
        //      /* Notice no argument checking is needed */
        //      StorageObject('username', username, 'anonymous');
        //      ...
        //
        if (value == null) {
            var existingValue = JSON.parse(store[prefix + key] || 'null');
            if (value === void 0 && fallbackValue === void 0) {
                return existingValue;                   // get
            } else if (fallbackValue !== void 0) {
                value = existingValue || fallbackValue; // set w/smart default
            }
        }
        store[prefix + key] = JSON.stringify(value);    // set or delete
        return value;
    };
};

var getter = function(name, fallbackValue) {
    // Get model property, falling back to an empty string or specified value
    var attr = this.model.attributes[name];
    return attr ? attr : (fallbackValue || '');
};

var capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// "Footer scripts"
// ===================================================================
(function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
e=o.createElement(i);r=o.getElementsByTagName(i)[0];
e.src='https://www.google-analytics.com/analytics.js';
r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
ga('create','UA-XXXXX-X','auto');ga('send','pageview');

