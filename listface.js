$.fn.swap = function(b) {
  var b = jQuery(b)[0];
  var a = this[0];
  var a2 = a.cloneNode(true);
  var b2 = b.cloneNode(true);
  var stack = this;
  a.parentNode.replaceChild(b2, a); 
  b.parentNode.replaceChild(a2, b); 
  stack[0] = a2; 
  return this.pushStack( stack );
};

(function($) {
  $.listface = function(textFieldId, options) {
    verify(options);
    if (!($('#' + textFieldId).length)) throw "Couldn't find a text field with the ID specified";
    $.listface.fields = {};
    $.listface.fields[textFieldId] = { options: options }
    replaceWithList($('#' + textFieldId));
    loadAutoComplete(textFieldId);
  }
  
  // Public
  
  $.extend($.listface, {
    fields: {}
  })
  
  // Private
  
  // Replaces the text field with the necessary list element that 
  // will contain the results, etc.
  function replaceWithList(textField) {
    textField.wrap([
      '<ul id="listface-', textField.attr('id'), '" class="listface">',
        '<li id="listface-input">',
          // '<input type="text" name="listface_input" autocomplete="off" />',
        '</li>',
      '</ul>'
    ].join(''));
    // textField.swap(list);
    $('#listface-' + textField.attr('id')).after('<ul id="listface-items-' + textField.attr('id') + '" class="listface-items"></ul>');
  }
  
  function loadAutoComplete(textFieldId) {
    $('#' + textFieldId).autocomplete("./users.json", {
      // minChars: 3,
      formatMatch: function(row, i, total) {
        console.log(row);
      }
    });
    // var textField = $('#listface-' + textFieldId + ' :text');
    // textField.focus(function() {
    //   $('#listface-items-' + textFieldId).append('<li class="listface-hint">Start typing...</li>');
    //   $('#listface-items-' + textFieldId).show('slow');
    // })
    // textField.blur(function() { $('#listface-items-' + textFieldId).hide('slow', function() { $(this).empty() }) })
    // textField.keydown(function(event) {
    //   // Now here's where it gets sneaky
    //   switch(event.keyCode) {
    //     default:
    //       
    //       break;
    //   }
    // })
  }
    
    
  // Ensures the options object has all the necessary properties
  function verify(options) {
    if (!options || options == undefined)         { throw "You need to specify a set of options for listface" }
    if (!options.url || options.url == undefined) { throw "You need to supply an URL argument to listface" }
    // add further validation here
  }
})(jQuery);