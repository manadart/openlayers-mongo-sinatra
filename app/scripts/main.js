;(function(root) {
  root.olBlogPost = {};
  root.olBlogPost.Models = {};
  root.olBlogPost.Collections = {};
  root.olBlogPost.Views = {};

  var mappingModule = function(ol) {
    var fromProj = new ol.Projection('EPSG:4326'); // WGS 1984
    var toProj = new ol.Projection('EPSG:900913'); // Spherical Mercator
    var map;
    var poiLayer;
    var poiCollection;
    var selectCtrl;
    var addCtrl;

    init = function(divId) {
      map = new ol.Map(divId);
      map.addLayer(new ol.Layer.OSM());
      map.setCenter(new ol.LonLat(145, -37.8).transform(fromProj, toProj), 12);

      var styleMap = new ol.StyleMap({
        default: { 
          pointRadius: 7,
          fillColor: 'blue',
          strokeWidth: 1
        },
        select: { 
          fillColor: 'green' 
        }
      });

      poiLayer = new ol.Layer.Vector('Poi', { styleMap: styleMap });  
      map.addLayer(poiLayer);

      setupControls(); 
    };
  
    var addPois = function(pois) {
      poiCollection = pois;
      poiLayer.addFeatures(pois.map(getFeatureFromPoi));
    };

    var getFeatureFromPoi = function(poi) {
      var pos = poi.get('pos');
      return new ol.Feature.Vector(
        new ol.Geometry.Point(pos[0], pos[1]).transform(fromProj, toProj),
        { modelId: poi.id }
      );
    }

    var setupControls = function() {
      var highlightCtrl = new ol.Control.SelectFeature(poiLayer, {
        hover: true,
        highlightOnly: true,
        renderIntent: 'select',
        eventListeners: {
          featurehighlighted: onPoiHighlighted,
          featureunhighlighted: onPoiUnhighlighted
        }
      });

      selectCtrl = new ol.Control.SelectFeature(poiLayer, { 
        renderIntent: 'select',
        onSelect: onPoiSelected
      });

      addCtrl = new ol.Control.DrawFeature(poiLayer, ol.Handler.Point);
      addCtrl.events.register('featureadded', addCtrl, onPoiAdded);

      map.addControl(highlightCtrl);
      map.addControl(selectCtrl);
      map.addControl(addCtrl);

      highlightCtrl.activate(); 
      selectCtrl.activate();
    };

    var onPoiHighlighted = function(e) {
      var feature = e.feature;
      name = poiCollection.get(feature.attributes.modelId).get('name');
      anchor = feature.geometry.getBounds().getCenterLonLat();
      var popup = new ol.Popup.Anchored('poiPopup', anchor, new ol.Size(100,20), name, null, false, null);
      feature.popup = popup;
      popup.feature = feature;
      map.addPopup(popup, true);
    };

    var onPoiUnhighlighted = function(e) {
      removeOlPopup(e.feature);
    };

    var removeOlPopup = function(feature) {
      if (!feature.popup) return;
      map.removePopup(feature.popup);
      feature.popup.destroy();
      feature.popup = null;
    };

    var onPoiSelected = function(e) {
      removeOlPopup(e);
      var poiView = new root.olBlogPost.Views.PoiView({ model: poiCollection.get(e.attributes.modelId) });
      poiView.on('closed', function() { selectCtrl.unselectAll(); });
      poiView.on('deleted', function() { poiLayer.removeFeatures([e]); });
      poiView.render();
    };

    var onPoiAdded = function(e) {
      var point = e.feature.geometry.getVertices()[0].transform(toProj, fromProj);
      var poi = new olBlogPost.Models.PoiModel({ 
        name: 'New POI',
        pos: [point.x, point.y] 
      });

      poiView = new root.olBlogPost.Views.PoiView({ model: poi });
      
      poiView.on('added', function(modelId) { 
        poi.id = modelId;
        poiCollection.push(poi);
        poiLayer.removeFeatures([e.feature]);
        poiLayer.addFeatures([getFeatureFromPoi(poi)]);
      })
      
      poiView.on('closed', function() { poiLayer.removeFeatures([e.feature]); });
      poiView.render(); 
    };

    var togglePoiMode = function(adding) {
      if (adding) {
        selectCtrl.deactivate();
        addCtrl.activate();
      } else {
        selectCtrl.activate();
        addCtrl.deactivate();
      }
    };

    return {
      init: init,
      addPois: addPois,
      togglePoiMode: togglePoiMode  
    };
  };

  $(function() {
    var mapping = mappingModule(OpenLayers);
    mapping.init('mapdiv');
    
    var pois = new olBlogPost.Collections.PoiCollection();  
    pois.fetch({ success: function(coll, resp) { mapping.addPois(coll); } });

    $('#activate-new').click(function() {
      $(this).addClass('active');
      $('#activate-select').removeClass('active');
      mapping.togglePoiMode(true);
    });

    $('#activate-select').click(function() {
      $(this).addClass('active');
      $('#activate-new').removeClass('active');
      mapping.togglePoiMode(false);
    });
  }); 
})(window);