require 'sinatra/base'
require 'mongoid'
require_relative 'poi'

class App < Sinatra::Base
  configure do
    set :show_exceptions, false
    enable :logging 
    set :public_folder, ENV['RACK_ENV'] == 'production' ? 'dist' : 'app'
    Mongoid.load!('mongoid.yml')
  end

  get '/' do
    send_file File.join(settings.public_folder, 'index.html')
  end

  ### API Routes
  
  before '/poi*' do
    content_type :json
  end

  get '/poi' do
    Poi.all.to_json
  end

  get '/poi/:id' do
    Poi.find(params[:id]).to_json
  end

  post '/poi' do
    data = JSON.parse request.body.read.to_s
    new_poi = Poi.create name: data['name'], desc: data['desc'], pos: data['pos']
    id = new_poi.id
    response['Location'] = "/poi/#{id}"
    status 201
    "{\"id\": \"#{id.to_s}\"}"
  end

  put '/poi/:id' do
    data = JSON.parse request.body.read.to_s
    Poi.find(params[:id]).update_attributes name: data['name'], desc: data['desc'], pos: data['pos']
  end

  delete '/poi/:id' do
    Poi.find(params[:id]).delete
  end
end
