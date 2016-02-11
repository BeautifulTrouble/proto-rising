//= require backbone.js
//= require backbone.layoutmanager.js
//= require backbone.stickit.js
//= require backbone-forms.js

//= require header
//= require footer
//= require module-list
//= require module-list-item
//= require module-detail

// Main
// ===================================================================
window.App = {};

App.main = function() {
    // Wait for the App.ready flag
    if (!App.ready) 
        return setTimeout(App.main, 100);
    App.state = JSONStorage(typeof localStorage !== 'undefined' ? localStorage : {}, 'state-');
    App.router = new App.Router();
    Backbone.history.start({
        pushState: false // TODO
    });
};


// Models
// ===================================================================
App.Module = Backbone.Model.extend({
});


// Collections
// ===================================================================
// Use App.Collection over Backbone.Collection for added functionality
App.Collection = Backbone.Collection.extend({
    comparator: function(a, b) {
        // Collections should define a sorting attribute as an optionally
        // "-"-prefixed string name of the model attribute by which to
        // sort. You may also use a string from the comparatorMapping.
        var key = this.comparatorMapping[this.sorting] || this.sorting;
        var attr = key.replace(/^-/, '');
        if (!/^-/.test(key)) {
            var A = a.get(attr), B = b.get(attr);
        } else {
            var A = b.get(attr), B = a.get(attr);
        }
        return A > B ? 1 : (A < B ? -1 : 0);
    },
    // Map normal words (for cleaner urls) to attribute sorting keys
    comparatorMapping: {
        'alpha':    'title',
        'omega':    '-title',
        'newest':   '-timestamp',
        'oldest':   'timestamp'
    },
    model: App.Module,
    sorting: 'title'
});

App.apiPrefix = 'https://api.beautifulrising.org/api/v1/';
App.modules = new App.Collection();

// Use config data to add all the content types
(new (Backbone.Collection.extend({url: App.apiPrefix + 'config'}))).fetch({
    success: function(collection) { 
        // Get the simple object from the collection
        App.config = collection.models[0].attributes; 
        _.each(App.config['module-types'], function(type) {
            var moduleType = new App.Collection();
            moduleType.url = App.apiPrefix + type['many']
            moduleType.fetch({
                success: function() { App.modules.add(moduleType.models); }
            });
        });
        App.ready = true;
    }
});


// Views
// ===================================================================
// Use App.View over Backbone.View for added functionality
App.View = Backbone.View.extend({
    // Add some common event handlers to all views
    constructor: function() {
        this.events = _.extend({
            'click button': 'navigateToRoute',
        }, this.events || {});
        Backbone.View.apply(this, arguments);
    },
    // Get element with matching data attribute
    dataEl: function(key, value) {
        return this.$('[data-' + key + '="' + value + '"]')
    },
    // Button group handling
    groupSelect: function(groupSelector, selectedClass, activeElement) {
        // groupSelector: selector that will capture each item in the group
        // selectedClass: class(es) which the selected item should have
        // activeElement: selector or $el to be assigned selected class(es)
        this.$(groupSelector).removeClass(selectedClass); 
        this.$(activeElement).addClass(selectedClass);
    },
    // Automatically handle this: <button data-route="about/authors">Authors</button>
    navigateToRoute: function(ev) {
        var route = ev.target.dataset.route;
        route && App.router.navigate(route, {trigger: true});
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
    beforeRender: function() {
        this.category = App.state('category');
        this.sorting = App.state('sorting');
        this.collection = App.modules;
        if (this.category != 'all') {
            // Make sure the array returned by where is an App.collection
            this.collection = new App.Collection(this.collection.where({'type': this.category}));
        }
        this.collection.sorting = this.sorting;
        this.collection.sort();
        this.collection.each(function(module) {
            this.insertView('#modules-list', new App.ModuleListItemView({model: module}));
        }, this);
        App.router.navigate('category/' + this.category + '/' + this.sorting);
    },
    afterRender: function() {
        this.groupSelect('.category', 'selected btn-info', this.dataEl('category', this.category));
        this.groupSelect('.sorting', 'selected', this.dataEl('sorting', this.sorting));
    },
    events: {
        'click .category': function(ev) {
            App.state('category', ev.target.dataset.category);
            this.render();
        },
        'click .sorting': function(ev) {
            App.state('sorting', ev.target.dataset.sorting);
            this.render();
        },
        'click #modules-list h3': 'navigateToRoute'
    },
    initialize: function() {
        this.listenTo(App.modules, 'add remove change', this.render);
    }
});

App.ModuleListItemView = App.View.extend({
    template: "module-list-item",
    serialize: function() {
        return _.extend(this.model.attributes, {
            get: _.bind(getter, this)
        });
    }
});

App.ModuleDetailView = App.View.extend({
    template: "module-detail",
    beforeRender: function() {
        this.model = _.first(App.modules.where({slug: App.state('slug')})) || {};
    },
    serialize: function() {
        return _.extend(this.model.attributes, {
            get: _.bind(getter, this)
        });
    },
    initialize: function() {
        this.listenTo(App.modules, 'add remove change', this.render);
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
    renderView: function(view, options, nestedViews) {
        view = new view(options || {});
        this.setView(this.renderViewEl, view);
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
        App.state('slug', slug);
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


