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
  $.listface = function(selector, options) {
    if (!$(selector).length) throw "Couldn't find a text field with the ID specified";
    
    $.extend($.listface, {
      reset: function(selector) { reset(selector) }
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

  	var options, textField, originalTextField, form, items, timeout, usesObject, list;
  	var mapping = [];

    verify(options);
    init(selector, options)  	
  	preloadDefaults()
	
  	function init(selector, opts) {
  	  originalTextField = $(selector);
  	  options = opts;
  	  form = originalTextField.parents('form');
  	  form.submit(function() { list.remove(); originalTextField.show() })
  	  if (opts.attribute) usesObject = true;
      replaceWithList();
      loadAutoComplete()
  	}
  	
    // Replaces the text field with the necessary list element that
    // will contain the results, etc.
    function replaceWithList() {
      list = $([
        '<ul id="listface-', originalTextField.attr('id'), '" class="listface">',
          '<li class="listface-input">',
            '<input type="text" />',
            '<ul class="items"></ul>',
          '</li>',
        '</ul>'
      ].join(''));
      originalTextField.hide();
      originalTextField.data('listfaceopts', options);
      originalTextField.before(list);
      textField = $('#listface-' + originalTextField.attr('id') + ' :input');
      items = $('#listface-' + originalTextField.attr('id') + ' ul.items');
    }
    
    function reset(selector) {
      $(selector).prev('ul.listface').remove();
      $.listface(selector, $(selector).data('listfaceopts'))
    }

    function loadAutoComplete() {
      textField.focus(function() {
        items
          .find('li')
            .remove()
            .end()
          .append('<li class="hint">' + (options.hint ? options.hint : 'Start typing...') + '</li>')
          .show('slow')
      })
      textField.blur(function() { setTimeout(function() { clearFocus(); items.hide('slow', function() { $(this).empty() }) }, 100) })
      textField.keydown(function(event) {
        switch(event.keyCode) {
          case KEY.UP:
            stepUp();
            break;
          case KEY.DOWN:
            stepDown();
            break;
          case KEY.TAB:
            if (textField.val() == "") break;
          case KEY.RETURN:
            event.preventDefault();
            if (textField.val() == "") form.trigger('submit');
            if (items.focused) {
              add(items.focused);
              items.hide();
              clearFocus()
            }
            return false;
          case KEY.ESC:
            clearFocus();
            items.hide('slow', function() { $(this).empty() });
            break;
          case KEY.BACKSPACE:
            if (textField.val() == '') {
              if (!list.find('.selected').length) return false;
              if (items.focused && items.focused.hasClass('selected')) {
                remove(items.focused);
                clearFocus()
              } else {
                setFocus(list.find('.selected:last'));
              }
            }
            break;
          default:
            clearFocus();
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
      $.getJSON(url, function(results) {
        buildItemsList(excludeExistingEntries(results))
      })
    }

    function excludeExistingEntries(results) {
      results = $.grep(results, function(result) {
        var id = (usesObject ? result[options.attribute.value] : result);
        return $.inArray(id.toString(), $.map(mapping, function(item) { return $(item.find('span')[ (usesObject ? 1 : 0) ]).text() })) < 0
      })
      return results;
    }

    // Adds an item to the "selected" items list
    function add(item) {
      item.unbind('click');
      mapping.push(item);
      syncMapping();
      item.append('<a href="#">X</a>');
      item.find('a').click(function(event) { event.preventDefault(); remove(item) });
      list.find('.listface-input').before(item.addClass('selected'));
      textField.val('');
      if (options.maxEntries && list.find('li.selected').length >= options.maxEntries) {
        textField.addClass('disabled');
        textField.attr('disabled', 'disabled')
      }
    }

    function remove(item) {
      mapping = $.grep(mapping, function(i) { return i[0] != item[0] });
      item.remove();
      syncMapping()
      if (options.maxEntries && list.find('li.selected').length < options.maxEntries) {
        textField.removeClass('disabled');
        textField.removeAttr('disabled')
      }
    }

    // Syncs what's in the mapping variable with the values in the originalTextField
    function syncMapping() {
      var values = $.map(mapping, function(item) { return $(item.find('span')[ (usesObject ? 1 : 0) ]).text() }).join(', ');
      originalTextField.val(values)
    }

    // Executed when the user presses the up arrow
    function stepUp() {
      if (!items.focused) return false;
      if (items.focused.prev()[0] == undefined || items.focused.hasClass('selected')) {
        clearFocus();
        return false;
      } else {
        setFocus(items.focused.prev())
      }
    }

    // Executed when the uses presses the down arrow
    function stepDown() {
      if (items.find('li:first-child').is('.hint') || items.find('li:first-child').is('.no_results')) return false;
      if (!items.focused || items.focused.hasClass('selected')) {
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
      items.find('li').removeClass('focused');
      list.find('li').removeClass('focused')
    }

    function buildItemsList(data) {
      items.empty();
      var li;
      if ($(data).length) {
        $(data).each(function() {
          if (usesObject) {
            li = $([
              '<li>',
                '<span>', this[options.attribute.name], '</span>',
                '<span style="display: none">', this[options.attribute.value], '</span>',
              '</li>'
            ].join(''))
          } else {
            li = $('<li><span>' + this + '</span></li>');
          }
          li.hover(function() { $(this).addClass('focused') }, function() { $(this).removeClass('focused') } );
          li.click(function() { add($(this)) } )
        })
      } else {
        li = $('<li class="no_results">' + (options.no_results ? options.no_results : 'No results found') + '</li>');
      }
      items.append(li)
    }

    // loads a string or an object as a list item
    function load(item) {
      // expect object if we're talking objects here
      var li;
      if (options.attribute) {
        li = $([
          '<li>',
            '<span>', item[options.attribute.name], '</span>',
            '<span style="display: none">', this[options.attribute.value], '</span>',
          '</li>'
        ].join(''))
      } else {
        li = $('<li></span>' + item + '</span></li>')
      }
      window.lo = li;
      add(li);
    }

    function preloadDefaults() {
      if (!options.defaults) return false;
      $(options.defaults).each(function() {
        load(this);
      });
    }

    // Ensures the options object has all the necessary properties
    function verify(options) {
      if (!options || options == undefined)                                   { throw "You need to specify a set of options for listface" }
      if (!options.url || options.url == undefined)                           { throw "You need to supply an URL argument to listface" }
      if (options.attribute && typeof options.attribute != 'object')          { throw "attribute needs to be an object" }
      if (options.defaults && options.defaults.constructor != Array)          { throw "defaults needs to be an array" }
      if (options.attribute &&
        (!("value" in options.attribute) || !("name" in options.attribute)))  { throw "attribute needs to have value and name" }
      // add further validation here
    }
}
})(jQuery);
