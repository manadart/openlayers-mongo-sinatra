olBlogPost.Views.PoiView = Backbone.View.extend({
  render: function() {
    var html = _.template( $('#poi-template').html(), this.model.toJSON() );
    this.$el.html(html).appendTo('body');
    if (!this.model.id) $('#btn-delete').hide();
    $('#poi-modal').modal();
    return this;
  },
  events: {
    'click button[id=btn-close]': 'closePoi',
    'click button[id=btn-delete]': 'deletePoi',
    'click button[id=btn-save]': 'savePoi'
  },
  closePoi: function(e) {
    $('#poi-modal').modal('hide');
    this.trigger('closed');
    this.remove();
  },
  deletePoi: function(e) {
    this.model.destroy();
    this.trigger('deleted');
    this.closePoi();
  },
  savePoi: function(e) {
    this.model.set({
      name: $('#poi-name').val(),
      desc: $('#poi-desc').val()
    });

    var self = this;
    this.model.save(null, { 
      success: function(model, response) { 
        modelId = model.get('id');
        if (modelId) self.trigger('added', modelId);
      }
    });

    this.closePoi();
  }
});
