require 'rubygems'
require 'sinatra'
require 'json'
require 'faker'

set :public, File.dirname(__FILE__)

get '/' do
  haml :home
end

get '/users' do
  names = Array.new(100) { Faker::Name.name }
  content_type :json
  ['foo', 'bar'].to_json
end

post '/showme' do
end

__END__

@@ layout
!!! XML
!!! STRICT
%html{'xml:lang' => 'en', :lang => 'en', :xmlns => 'http://www.w3.org/1999/xhtml'}
  %head
    %title facelist test server
    %link{:rel => 'stylesheet', :type => 'text/css', :href => '/screen.css'}
    %script{:type => 'text/javascript', :src => '/jquery-1.3.2.min.js'}
    %script{:type => 'text/javascript', :src => '/listface.js'}
    :javascript
      $(document).ready(function() { $.listface('users', { url: '/users', min: 2, param: 'query' }) })
  %body
    #wrap
      = yield
    
@@ home
%form{:action => '/showme', :method => 'post'}
  %p
    %input{:type => 'text', :name => 'users', :id => 'users'}
  %p
    %button{:type => 'submit'} Submit