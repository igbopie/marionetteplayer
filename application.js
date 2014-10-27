/**
 * Created by igbopie on 10/26/14.
 */
MyApp = new Backbone.Marionette.Application();

MyApp.addRegions({
    songsRegion: "#songs",
    playlistRegion: "#playlists",
    searchRegion: "#search",
    playerRegion: "#player"
});

/* ------------------------ SONGS ----------------- */
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
    model: Song,
    search: function(text) {
        var filtered = this.filter(function (song) {
            if (!song) return false;
            return song.get("title").toLowerCase().indexOf(text.toLowerCase()) > -1;
        });

        return new Songs(filtered);
    }
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
    className: "table table-striped  table-hover",
    template: "#songs-template",
    childView: SongView,
    childViewContainer:"tbody"
});

/* ------------------------ PLAYLIST ----------------- */
/* MODEL */

Playlist = Backbone.Model.extend({

});

Playlists = Backbone.Collection.extend({
    url:"json/playlist.json",
    model: Playlist
});


/* VIEWS */

PlaylistView = Backbone.Marionette.ItemView.extend({
    template: "#playlist-template",
    tagName: 'tr',
    className: 'playlist',
    events: {
        'click': 'clickPlaylist'
    },

    clickPlaylist: function(){
        console.log("Raised clickPlaylist");
        this.trigger("clickPlaylist", {playlistId:this.model.get("playlistId")});
    }
});

PlaylistsView = Backbone.Marionette.CompositeView.extend({
    tagName: "table",
    id: "playlists",
    className: "table table-striped  table-hover",
    template: "#playlists-template",
    childView: PlaylistView,
    childViewContainer:"tbody"
});

/* ------------------------ SEARCH ----------------- */

SearchView = Backbone.Marionette.ItemView.extend({
    template: "#search-template",
    tagName: 'div',
    className: 'search',
    events: {
        'keyup .search-input': 'keyInput'
    },
    keyInput: function(event){
        var textInput = $(event.target).val();
        this.trigger("newSearch", textInput);
    }

});

/* ------------------------ MAIN ----------------- */

MyApp.addInitializer(function(options){

    //SONGS
    var songs = new Songs([]);
    var songsView = new SongsView({
        collection: songs
    });
    MyApp.songsRegion.show(songsView);

    //PLAYLIST
    var playlists = new Playlists();

    playlists.fetch();

    var playlistsView = new PlaylistsView({
        collection: playlists
    });

    playlistsView.on('childview:clickPlaylist', function(event){
        console.log("Read clickPlaylist");
        var playlistId = event.model.get("id");

        songs.url="json/playlist/" + playlistId + "/songs.json";
        songs.fetch();

        songsView.collection = songs;
    });

    MyApp.playlistRegion.show(playlistsView);

    //SEARCH
    var searchView = new SearchView();

    searchView.on('newSearch', function(text) {

        songs.url = "json/songs.json";
        songs.fetch().done(function() {
            songsView.collection = songs.search(text);
            songsView.render();
        });
    });


    MyApp.searchRegion.show(searchView);
});

$(document).ready(function(){
    MyApp.start();
});