//= require backbone.js
//= require backbone.layoutmanager.js
//= require backbone.stickit.js
//= require backbone-forms.js

//= require module-list
//= require module-detail

// Main
// ===================================================================
window.App = {};

App.main = function() {
    App.router = new App.Router();
    Backbone.history.start({
        pushState: false // TODO
    });
};

// Models
// ===================================================================

// Views
// ===================================================================
App.ModuleListView = Backbone.View.extend({
    template: "module-list",
    initialize: function(options) {
    },
    serialize: function() {
        return {
        };
    },
    events: {
    }
});

App.ModuleDetailView = Backbone.View.extend({
    template: "module-detail",
    initialize: function(options) {
    },
    serialize: function() {
        return {
        };
    },
    events: {
    }
});

// Layouts
// ===================================================================
Backbone.Layout.configure({
    manage: true,

    // Templates should be embedded (require them at top of this file)
    fetchTemplate: function(path) {
        var JST = window.JST || {};
        if (JST[path]) {
            return JST[path];
        }
    },

    // Shortcut for instantiating and rendering views
    renderViewEl: '#content',
    renderView: function(view, options) {
        view = new view(options || {});
        this.setView(this.renderViewEl, view);
        this.render();
    }
});

App.layout = new Backbone.Layout({
    el: 'body',
    views: {
    }
});

// Routes
// ===================================================================
App.Router = Backbone.Router.extend({
    initialize: function() {
    },
    routes: {
        'module/:name': 'displayModule',
        '*default': 'default'
    },
    displayModule: function(name) {
        App.layout.renderView(App.ModuleDetailView);
    },
    'default': function() {
        App.layout.renderView(App.ModuleListView);
    }
});

