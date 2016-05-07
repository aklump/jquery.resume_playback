/**
 * Resume Playback jQuery JavaScript Plugin v0.1.4
 * http://www.intheloftstudios.com/packages/jquery/jquery.resume_playback
 *
 * HTML5 Media Resume Playback (Playhead Position Memory)
 *
 * Copyright 2013, Aaron Klump
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Fri May  6 17:19:08 PDT 2016
 */
;(function ($, window, document, undefined) {
  "use strict";

  /**
   * Default data storage uses native browser cookies.
   *
   * We use a single cooked with the name this.options.cookie to store
   * a json object.
   *
   * @type {Object}
   */
  var DataStoreCookies = {
    cookie: {
      name: 'resumePlayback',
      days: 365
    },

    /**
     * Sets the value of name in persistent storage
     *
     * @param {string} name
     * @param {mixed} value
     */
    set: function (name, value) {

      // Merge this time value into our cookies array of all storage keys.
      var stored = this.get();
      stored[name] = value;
      stored = JSON.stringify(stored);

      // No set just one cookies.
      if (this.cookie.days) {
        var date = new Date();
        date.setTime(date.getTime() + (this.cookie.days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
      }
      else var expires = "";
      document.cookie = this.cookie.name + "=" + stored + expires + "; path=/";
    },

    /**
     * Gets the value by key
     *
     * @param  {string} name The unique key for this storage data.  Omit this
     * value and the entire data store will be returned.
     *
     * @return {mixed}
     */
    get: function (name) {
      var value = 0;
      var nameEQ = this.cookie.name + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) {
          value = c.substring(nameEQ.length, c.length);
        }
      }

      var raw = JSON.parse(value) || {};
      if (!name) {
        return raw;
      }
      ;

      var value = typeof raw[name] === 'undefined' ? 0 : raw[name];
      return value;
    }
  }

  function ResumePlayback(element, id, options) {
    var _ = this;
    _.element = $(element);
    _.id = id;
    _.options = $.extend({}, $.fn.resumePlayback.defaults, options);

    // Localize the name and days of our data store
    _.options.dataStore.cookie.name = _.options.cookie.name;
    _.options.dataStore.cookie.days = _.options.cookie.days;

    _.init();

    var nonceStorage = null;
    var dataStore = _.options.dataStore;

    /**
     * Event handler for various video events: captures playhead position.
     *
     * @param  {object} e The event object.
     */
    _.element.bind('play seeked pause abort timeupdate', function (e) {
      var nonce = e.target.currentTime;
      if (nonce !== nonceStorage && nonce > 0) {
        dataStore.set(id, nonce);
        nonceStorage = nonce;
      };
    });

    return _;
  }

  ResumePlayback.prototype.init = function () {
    var _          = this,
        bindEvents = 'canplaythrough play',
        $player    = this.element,
        options    = this.options,
        resumeAt   = this.options.dataStore.get(this.id);
    if (resumeAt) {

      // Pre-resume callback.
      if (_.options.resuming) {
        _.options.resuming(_.element, resumeAt);
      }

      // When the page loads, depending on the device the canplay event may
      // fire.  If it does then we set the playhead position.  If it doesn't
      // we set the playhead position the first time it plays.  In either
      // case we immediately unbind _ event, as _ is a one time thing.
      var initialResumePlayhead = function (e) {
        var time = e.target.currentTime;
        e.target.currentTime = resumeAt;
        $player.unbind(bindEvents, initialResumePlayhead);

        // Post resume callback.
        if (options.resumed) {
          options.resumed(_.element, resumeAt);
        }
      };

      $player.bind(bindEvents, initialResumePlayhead);
    }

    return _;
  };

  $.fn.resumePlayback = function (id, options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_resumePlayback')) {
        $.data(this, 'plugin_resumePlayback',
          new ResumePlayback(this, id, options));
      }
    });
  };

  $.fn.resumePlayback.defaults = {
    'resuming' : null,
    'resumed'  : null,
    'cookie'   : {name: 'resumePlayback', days: 365},
    'dataStore': DataStoreCookies,

    // A prefix for all css classes
    "cssPrefix": 'resume-playback'
  };

  $.fn.resumePlayback.version = function () {
    return '0.1.3';
  };

})(jQuery, window, document);
