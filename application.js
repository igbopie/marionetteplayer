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






/* MAIN */

MyApp.addInitializer(function(options){
    var songsView = new SongsView({
        collection: options.songs
    });
    MyApp.songsRegion.show(songsView);

    var playlistsView = new PlaylistsView({
        collection: options.playlists
    });

    playlistsView.on('childview:clickPlaylist', function(event){
        //console.log();
        console.log("Read clickPlaylist");
        var playlistId = event.model.get("id");
        $.ajax({
            url: "json/playlist/" + playlistId + "/songs.json",
            success: function (songsData) {
                var songs = new Songs(songsData);
                songsView.collection = songs;
                songsView.render();
                console.log("refresh");
            }
        });

    });

    MyApp.playlistRegion.show(playlistsView);


});

$(document).ready(function(){

    console.log("READY!");
    $.ajax({
        url:"json/playlist/1/songs.json",
        success:function(songsData){
            var songs = new Songs(songsData);
            $.ajax({
                    url: "json/playlist.json",
                    success: function (playlistData) {
                        var playlists = new Playlists(playlistData);
                        MyApp.start(
                            {
                                songs: songs,
                                playlists: playlists
                            }
                        );
                    }
            });
        },
        error:function( jqXHR, textStatus, errorThrown){
            alert("Error: "+textStatus+" "+errorThrown);
            console.log(jqXHR);
        }
    });
});