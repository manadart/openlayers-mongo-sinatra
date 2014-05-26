require 'mongoid'

class Poi
  include Mongoid::Document

  field :name, type: String
  field :desc, type: String
  field :pos,  type: Array
end