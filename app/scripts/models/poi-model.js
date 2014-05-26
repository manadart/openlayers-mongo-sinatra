olBlogPost.Models.PoiModel = Backbone.Model.extend({
  idAttribute: '_id',

  defaults: {
    name: '',
    desc: '',
    pos: []
  },

  url: function() {
    return this.id ? '/poi/' + this.id : '/poi'; 
  }
});