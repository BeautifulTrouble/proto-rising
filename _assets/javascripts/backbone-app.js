//= require backbone.js
//= require backbone.layoutmanager.js
//= require backbone.stickit.js
//= require backbone-forms.js

//= require header
//= require footer
//= require module-list
//= require module-detail

// Main
// ===================================================================
window.App = {};

App.main = function() {
    // Use sessionStorage for state because most of this state should
    // be specific to the session and not long-term persisted.
    App.state = JSONStorage(typeof sessionStorage !== 'undefined' ? sessionStorage : {}, 'state-');
    App.router = new App.Router();
    Backbone.history.start({
        pushState: false // TODO
    });
};


// Models
// ===================================================================
App.Module = Backbone.Model.extend({
    initialize: function() {
    }
});


// Views
// ===================================================================
App.View = Backbone.View.extend({
    // Extend the standard view with useful things
    constructor: function() {
        // Add some common event handlers to all views
        this.events = _.extend({
            // Handle <button data-route="about/authors">Authors</button>
            'click button': function(ev) {
                var route = ev.target.dataset.route;
                route && App.router.navigate(route, {trigger: true});
            }
        }, this.events || {});

        // Button group handling
        this.groupSelect = function(groupSelector, selectedClass, activeElement) {
            // groupSelector: selector that will capture each item in the group
            // selectedClass: class(es) which the selected item should have
            // activeElement: selector or $el to be assigned selected class(es)
            this.$(groupSelector).removeClass(selectedClass); 
            this.$(activeElement).addClass(selectedClass);
        };

        // Get element with matching data attribute
        this.dataEl = function(key, value) {
            return this.$('[data-' + key + '="' + value + '"]')
        };

        Backbone.View.apply(this, arguments);
    }
});

App.HeaderView = App.View.extend({
    template: "header",
});

App.FooterView = App.View.extend({
    template: "footer",
});

App.ModuleListView = App.View.extend({
    template: "module-list",
    afterRender: function() {
        var category = App.state('category');
        var sorting = App.state('sorting');
        this.groupSelect('.category', 'selected btn-info', this.dataEl('category', category));
        this.groupSelect('.sorting', 'selected', this.dataEl('sorting', sorting));
        App.router.navigate('category/' + category + '/' + sorting);    // Not triggering the route
    },
    events: {
        'click .category': function(ev) {
            App.state('category', ev.target.dataset.category);
            this.render();
        },
        'click .sorting': function(ev) {
            App.state('sorting', ev.target.dataset.sorting);
            this.render();
        }
    }
});

App.ModuleDetailView = App.View.extend({
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
        // TODO: Allow passing a mapping of nested views
        this.render();
    }
});

App.layout = new Backbone.Layout({
    el: 'body',
    views: {
        '#header': new App.HeaderView(),
        '#footer': new App.FooterView()
    }
});


// Routes
// ===================================================================
App.Router = Backbone.Router.extend({
    routes: {
        'module/:slug': 'displayModule',
        'category/:category(/:sorting)': 'displayList',
        '*default': 'default'
    },
    displayModule: function(slug) {
        App.layout.renderView(App.ModuleDetailView);
    },
    displayList: function(category, sorting) {
        // Set these from the route or saved state with default fallback
        App.state('category', category, 'all');
        App.state('sorting', sorting, 'alpha');
        App.layout.renderView(App.ModuleListView);
    },
    'default': function() { this.displayList(); }
});


