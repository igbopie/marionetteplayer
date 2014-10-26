/**
 * Created by igbopie on 10/26/14.
 */
MyApp = new Backbone.Marionette.Application();

MyApp.addRegions({
    mainRegion: "#content"
});


/* MODEL */

Song = Backbone.Model.extend({
    defaults: {
        votes: 0
    },
    addVote: function(){
        this.set('votes', this.get('votes') + 1);
    }
});

Songs = Backbone.Collection.extend({
    model: Song
});

/* VIEWS */

SongView = Backbone.Marionette.ItemView.extend({
    template: "#song-template",
    tagName: 'tr',
    className: 'song',
    events: {
        'click .vote-song': 'vote'
    },

    vote: function(){
        this.model.addVote();
    },
    modelEvents: {
        "change": "render"
    }
});

SongsView = Backbone.Marionette.CompositeView.extend({
    tagName: "table",
    id: "songs",
    className: "table-striped table-bordered",
    template: "#songs-template",
    childView: SongView,
    childViewContainer:"tbody"
});






/* MAIN */

MyApp.addInitializer(function(options){
    var songsView = new SongsView({
        collection: options.songs
    });
    MyApp.mainRegion.show(songsView);
});

$(document).ready(function(){

    console.log("READY!");
    $.ajax({
        url:"songs.json",
        success:function(data){
            var songs = new Songs(data);
            MyApp.start({songs: songs});
        },
        error:function( jqXHR, textStatus, errorThrown){
            alert("Error: "+textStatus+" "+errorThrown);
            console.log(jqXHR);
        }
    });
});