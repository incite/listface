(function($) {
  $.listface = function(textFieldId, options) {
    verify(options);
    this.fields = {};
    this.fields[textFieldId] = options
  }
  
  
  // Ensures the options object has all the necessary properties
  function verify(options) {
    if (!options.url) { throw "You need to supply an URL argument to listface" }
    // add further validation here
  }
})(jQuery);