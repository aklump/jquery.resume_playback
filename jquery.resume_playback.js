/**
 * Resume Playback jQuery JavaScript Plugin v0.1
 * http://www.intheloftstudios.com/packages/jquery/jquery.resume_playback
 *
 * HTML5 Media Resume Playback (Playhead Position Memory)
 *
 * Copyright 2013, Aaron Klump
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Wed Jul 23 18:28:15 PDT 2014
 */
;(function($, window, document, undefined) {
"use strict";

// The actual plugin constructor
function ResumePlayback(element, id, options) {
  this.element = element;

  // jQuery has an extend method that merges the 
  // contents of two or more objects, storing the 
  // result in the first object. The first object 
  // is generally empty because we don't want to alter 
  // the default options for future instances of the plugin
  this.options = $.extend( {}, defaults, options) ;
  
  this._defaults = $.fn.resumePlayback.defaults;
  // this._name = 'resumePlayback';
  
  this.init();

  var nonceStorage = null;

  // // Create some defaults, extending them with any options that were provided
  // var settings = $.extend( {
  //   'refresh'         : 1000,
  //   'resuming'        : null,
  //   'resumed'         : null,
  //   'dataStore'       : dataStoreCookies,
  //   'dataStoreKey'    : 'resumePlayback',
  //   'dataLifetime'    : 365
  // }, options);

  /**
   * Event handler for various video events: captures playhead position.
   *
   * @param  {object} e The event object.
   */
  this.element.bind('play seeked pause abort timeupdate', function (e) {
    var nonce = e.target.currentTime;
    if (nonce !== nonceStorage && nonce > 0) {
      settings.dataStore.set(id, nonce);
      nonceStorage = nonce;
    };
  });    
}

ResumePlayback.prototype.init = function () {
  if ((var resumeAt = this.options.dataStore.get(id))) {

    // Pre-resume callback.
    if (this.options.resuming) {
      this.options.resuming(this.element, resumeAt);
    }

    var bindEvents = 'canplaythrough play';

    // When the page loads, depending on the device the canplay event may
    // fire.  If it does then we set the playhead position.  If it doesn't
    // we set the playhead position the first time it plays.  In either
    // case we immediately unbind this event, as this is a one time thing.
    var initialResumePlayhead = function (e) {
      var time = e.target.currentTime;
      e.target.currentTime = resumeAt;
      this.element.unbind(bindEvents, initialResumePlayhead);
      
      // Post resume callback.
      if (this.options.resumed) {
        this.options.resumed(this.element, resumeAt);
      }
    };
    
    this.element.bind(bindEvents, initialResumePlayhead);
  }
};

$.fn.resumePlayback = function(id, options) {
  return this.each(function () {
    if (!$.data(this, 'plugin_resumePlayback')) {
      $.data(this, 'plugin_resumePlayback', 
      new ResumePlayback(this, id, options));
    }
  });
};

$.fn.resumePlayback.defaults = {
  'refresh'           : 1000,
  'resuming'          : null,
  'resumed'           : null,
  'dataStore'         : dataStoreCookies,
  'dataStoreKey'      : 'resumePlayback',
  'dataLifetime'      : 365
  
  // A prefix for all css classes
  "cssPrefix"         : 'resume-playback'  
};

$.fn.resumePlayback.global = {};

$.fn.resumePlayback.somePublicMethod  = function () {

};

/**
 * Default data storage uses native browser cookies.
 *
 * We use a single cooked with the name settings.dataStoreKey to store
 * a json object.
 *
 * @type {Object}
 */
var dataStoreCookies = {

  /**
   * Sets the value of name in persistent storage
   *
   * @param {string} name
   * @param {mixed} value
   */
  set: function(name, value) {

    // Merge this time value into our cookies array of all storage keys.
    var stored = this.get();
    stored[name] = value;
    stored = JSON.stringify(stored);

    // No set just one cookies.
    var name = settings.dataStoreKey;
    var days = settings.dataLifetime;
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+stored+expires+"; path=/";    
  },

  /**
   * Gets the value by key
   *
   * @param  {string} name The unique key for this storage data.  Omit this
   * value and the entire data store will be returned.
   *
   * @return {mixed}
   */
  get: function(name) {
    var value = 0;
    var nameEQ = settings.dataStoreKey + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) {
        value = c.substring(nameEQ.length,c.length);
      } 
    }

    var raw = JSON.parse(value) || {};
    if (!name) {
      return raw;
    };

    var value = typeof raw[name] === 'undefined' ? 0 : raw[name];

    return value;
  },
}   

$.fn.resumePlayback.version = function() { return '0.0.1'; };

})(jQuery, window, document);