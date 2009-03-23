== Listface

A plugin for text field / text area auto-completion, a la Facebook's "send a message" auto complete, or Facelist (http://blog.iantearle.com/javascript-goodness/facelist).

== How it works

The plugin adds a listface() method onto jQuery, which sets up a text field for using it. Said text field *must* have
an assigned DOM ID, or else it won't work.

== Example

$.listface('users', { url: 'users.json', min: 2, param: 'query', attribute: { value: "id", name: "name" } })

Sets up listface on a field with ID "users". The other parameters translate as follows:

- url: the URL which the plugin will try to retrieve it's users from. Response MUST be a valid JSON
array of either objects or simply strings.
- min: the minimum number of characters before the plugin will actually try to request a list.
- param: a parameter to be supplied with the query. In the above example, the URL would look 
like "users.json?query=foobar". The parameter receives the value currently present in the text field.
- attribute: If you're retrieving objects, this parameter is mandatory. This object needs to have
2 attributes: "value", with the attribute that will actually be submitted, and "name" for the textual
representation that will be given to the user.

For further reference, check test.html.