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
      return this.pushStack(stack)
    },
  })
  
  // $.listface()
  $.listface = function(textFieldId, options) {
    if (!($('#' + textFieldId).length)) throw "Couldn't find a text field with the ID specified";
    verify(options);
    init(textFieldId, options)
  }
  
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
	
	var options, textField, originalTextField, form, items, timeout, usesObject;
	var mapping = [];
	
	function init(textFieldId, opts) {
	  originalTextField = $('#' + textFieldId);
	  options = opts;
	  form = originalTextField.parents('form');
	  form.submit(function() { list.remove() })
	  if (opts.attribute) usesObject = true;
    replaceWithList();
    loadAutoComplete()
	}
  
  // Replaces the text field with the necessary list element that 
  // will contain the results, etc.
  function replaceWithList() {
    list = $([
      '<ul id="listface-', originalTextField.attr('id'), '" class="listface">',
        '<li id="listface-input">',
          '<input type="text" />',
        '</li>',
      '</ul>'
    ].join(''));
    originalTextField.hide();
    originalTextField.before(list);
    textField = $('#listface-' + originalTextField.attr('id') + ' :input');
    $('#listface-' + originalTextField.attr('id')).after('<ul id="listface-items-' + originalTextField.attr('id') + '" class="listface-items"></ul>');
    items = $('#listface-items-' + originalTextField.attr('id'))
  }
  
  function loadAutoComplete() {
    textField.focus(function() {
      items.append('<li class="listface-hint">Start typing...</li>');
      items.show('slow')
    })
    textField.blur(function() { clearFocus(); items.hide('slow', function() { $(this).empty() }) })
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
          if (textField.val() == "") form.trigger('submit');
          if (items.focused) {
            add(items.focused);
            clearFocus()
          }
          return false;
        case KEY.ESC:
          clearFocus();
          items.hide('slow', function() { $(this).empty() });
          break;
        default:
          clearTimeout(timeout);
          timeout = setTimeout(search, 500);
          break;
      }
    })
  }
  
  function search() {
    if (options.min && textField.val().length < (options.min - 1)) return false;
    items.show('slow');
    var url;
    if (options.param) {
      url = options.url + ['?', options.param, '=', textField.val().toLowerCase()].join('')
    } else {
      url = options.url
    }
    $.getJSON(url, function(data) {
      buildItemsList(data)
    })
  }
  
  // Adds an item to the "selected" items list
  function add(item) {
    mapping.push(item);
    syncMapping();
    item.append('<a href="#">X</a>');
    item.find('a').click(function() { 
      mapping = $.grep(mapping, function(i) { return i != item });
      item.remove();
      syncMapping()
    });
    $('#listface-input').before(item.addClass('selected'));
    textField.val('');
    items.hide()
  }
  
  // Syncs what's in the mapping variable with the values in the originalTextField
  function syncMapping() {
    var values = $.map(mapping, function(item) { return $(item.find('span')[ (usesObject ? 1 : 0) ]).text() }).join(', ');
    originalTextField.val(values)
  }
  
  // Executed when the user presses the up arrow
  function stepUp() {
    if (!items.focused) return false;
    if (items.focused.prev()[0] == undefined) {
      clearFocus();
      return false;
    } else {
      setFocus(items.focused.prev())
    }
  }
  
  // Executed when the uses presses the down arrow
  function stepDown() {
    if (items.find('li:first-child').is('.listface-hint')) return false;
    if (!items.focused) {
      setFocus(items.find('li:first-child'));
    } else {
      if (items.focused.next()[0] == undefined) return false;
      setFocus(items.focused.next());
    }
  }
  
  // Focus on an element of the list
  function setFocus(item) {
    if (items.focused) items.focused.removeClass('focused');
    $(item).addClass('focused');
    items.focused = item
  }
  
  // Clears the current focus
  function clearFocus() {
    items.focused = undefined;
    items.find('li').removeClass('focused')
  }
  
  function buildItemsList(data) {
    items.empty();
    $(data).each(function() {
      var li;
      if (usesObject) {
        li = $([
          '<li>',
            '<span>', this[options.attribute.name], '<span>',
            '<span style="display: none">', this[options.attribute.value], '</span>',
          '</li>'
        ].join(''))
      } else {
        li = $('<li><span>' + this + '</span></li>');
      }
      // li.hover(function() { $(this).addClass('focused') }, function() { $(this).removeClass('focused') } );
      // li.click(function() { add($(this)) } )
      items.append(li)
    })
  }
    
  // Ensures the options object has all the necessary properties
  function verify(options) {
    if (!options || options == undefined)                                   { throw "You need to specify a set of options for listface" }
    if (!options.url || options.url == undefined)                           { throw "You need to supply an URL argument to listface" }
    if (options.attribute && typeof options.attribute != 'object')          { throw "attribute needs to be an object" }
    if (options.attribute &&
      (!("value" in options.attribute) || !("name" in options.attribute)))  { throw "attribute needs to have value and name" }
    // add further validation here
  }
})(jQuery);