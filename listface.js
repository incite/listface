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
    if (!($('#' + textFieldId).length)) throw "Couldn't find a text field with the ID specified";
    verify(options);
    init(textFieldId, options)
  }
  
  // Public
  
  $.extend($.listface, {
    fields: {}
  })
  
  // Private
  
  var KEY = {
		UP: 38,
		DOWN: 40,
		DEL: 46,
		TAB: 9,
		RETURN: 13,
		ESC: 27,
		COMMA: 188,
		PAGEUP: 33,
		PAGEDOWN: 34,
		BACKSPACE: 8
	};
	
	var options, textField, list;
	
	function init(textFieldId, opts) {
	  textField = $('#' + textFieldId);
	  options = opts;
    replaceWithList();
    loadAutoComplete();
	}
  
  // Replaces the text field with the necessary list element that 
  // will contain the results, etc.
  function replaceWithList() {
    textField.wrap([
      '<ul id="listface-', textField.attr('id'), '" class="listface">',
        '<li id="listface-input">',
        '</li>',
      '</ul>'
    ].join(''));
    // textField.swap(list);
    $('#listface-' + textField.attr('id')).after('<ul id="listface-items-' + textField.attr('id') + '" class="listface-items"></ul>');
    list = $('#listface-items-' + textField.attr('id'));
  }
  
  function loadAutoComplete() {
    textField.focus(function() {
      list.append('<li class="listface-hint">Start typing...</li>');
      list.show('slow');
    })
    textField.blur(function() { clearFocus(); list.hide('slow', function() { $(this).empty() }) })
    textField.keydown(function(event) {
      // Now here's where it gets sneaky
      switch(event.keyCode) {
        case KEY.UP:
          stepUp();
          break;
        case KEY.DOWN:
          stepDown();
          break;
        case KEY.TAB:
          event.preventDefault();
          break;
        case KEY.RETURN:
          event.preventDefault();
          if (list.focused) {
            add(list.focused);
            clearFocus();
          }
          return false;
        default:
          search()
          break;
      }
    })
  }
  
  function search() {
    $.getJSON(options.url, function(data) {
      buildItemsList(data)
    })
  }
  
  function add(item) {
    item.append('<a href="#">X</a>');
    $('#listface-input').before(item.addClass('selected'));
    textField.val('');
  }
  
  function stepUp() {
    if (!list.focused) return false;
    if (list.focused.prev()[0] == undefined) {
      clearFocus();
      return false;
    } else {
      setFocus(list.focused.prev());      
    }
  }
  
  function stepDown() {
    if (!list.focused) {
      setFocus(list.find('li:first-child'));
    } else {
      if (list.focused.next()[0] == undefined) return false;
      setFocus(list.focused.next());
    }
  }
  
  function setFocus(item) {
    if (list.focused) list.focused.removeClass('focused');
    $(item).addClass('focused');
    list.focused = item;
  }
  
  function clearFocus() {
    list.focused = undefined;
    list.find('li').removeClass('focused');
  }
  
  function buildItemsList(data) {
    list.empty();
    $(data).each(function() {
      list.append('<li>' + this + '</li>');
    })
  }
    
  // Ensures the options object has all the necessary properties
  function verify(options) {
    if (!options || options == undefined)         { throw "You need to specify a set of options for listface" }
    if (!options.url || options.url == undefined) { throw "You need to supply an URL argument to listface" }
    // add further validation here
  }
})(jQuery);