(function($) {
  
  // Utility methods
  jQuery.fn.extend({
    swap: function(b) {
      var b = jQuery(b)[0];
      var a = this[0];
      var a2 = a.cloneNode(true);
      var b2 = b.cloneNode(true);
      var stack = this;
      a.parentNode.replaceChild(b2, a); 
      b.parentNode.replaceChild(a2, b); 
      stack[0] = a2; 
      return this.pushStack( stack );    
    },
  })
  
  // $.listface()
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
	
	var options, textField, list, lastTyped, timeout;
	
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
      switch(event.keyCode) {
        case KEY.UP:
          stepUp();
          break;
        case KEY.DOWN:
          stepDown();
          break;
        case KEY.TAB:
        case KEY.RETURN:
          event.preventDefault();
          if (list.focused) {
            add(list.focused);
            clearFocus();
          }
          return false;
        default:
          // lastTyped = Math.round(new Date().getTime()/1000.0);
          clearTimeout(timeout);
          timeout = setTimeout(search, 500)
          break;
      }
    })
  }
  
  function search() {
    if (options.min && textField.val().length < (options.min - 1)) return false;
    list.show('slow');
    var url;
    if (options.param) {
      url = options.url + ['?', options.param, '=', textField.val().toLowerCase()].join('');
    } else {
      url = options.url
    }
    $.getJSON(url, function(data) {
      buildItemsList(data)
    })
  }
  
  // Adds an item to the "selected" items list
  function add(item) {
    item.append('<a href="#">X</a>');
    item.find('a').click(function() { item.remove() } );
    $('#listface-input').before(item.addClass('selected'));
    textField.val('');
    list.hide();
  }
  
  // Executed when the user presses the up arrow
  function stepUp() {
    if (!list.focused) return false;
    if (list.focused.prev()[0] == undefined) {
      clearFocus();
      return false;
    } else {
      setFocus(list.focused.prev());      
    }
  }
  
  // Executed when the uses presses the down arrow
  function stepDown() {
    if (!list.focused) {
      setFocus(list.find('li:first-child'));
    } else {
      if (list.focused.next()[0] == undefined) return false;
      setFocus(list.focused.next());
    }
  }
  
  // Focus on an element of the list
  function setFocus(item) {
    if (list.focused) list.focused.removeClass('focused');
    $(item).addClass('focused');
    list.focused = item;
  }
  
  // Clears the current focus
  function clearFocus() {
    list.focused = undefined;
    list.find('li').removeClass('focused');
  }
  
  function buildItemsList(data) {
    list.empty();
    $(data).each(function() {
      li = $('<li>' + this + '</li>');
      // li.hover(function() { $(this).addClass('focused') }, function() { $(this).removeClass('focused') } );
      // li.click(function() { add($(this)) } )
      list.append(li);
    })
  }
    
  // Ensures the options object has all the necessary properties
  function verify(options) {
    if (!options || options == undefined)         { throw "You need to specify a set of options for listface" }
    if (!options.url || options.url == undefined) { throw "You need to supply an URL argument to listface" }
    // add further validation here
  }
})(jQuery);