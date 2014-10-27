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
    },
    getSeconds: function(){
        var length = this.get("length");
        var lengthArray = length.split(":");
        return Number(lengthArray[1])+Number(lengthArray[0])*60;
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
    },
    events: {
        'click': 'clickSong'
    },
    clickSong: function(){
        this.trigger("clickSong");
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

/* ------------------------ PLAYER ----------------- */
Player = Backbone.Model.extend({
    defaults:{
        elapsed:0,
        elapsedPercent:0,
        elapsedFormatted:"00:00",
        status:0,
        song: new Song({title:"No Song",image:"0.png"})
    },
    setElapsedSeconds: function(seconds){
        this.set("elapsed",seconds);

        var total = this.get("seconds");
        var elapsed = this.get("elapsed");
        var percent = elapsed /total *100;
        this.set("elapsedPercent",percent);

        var fSeconds = String(elapsed % 60);
        while(fSeconds.length < 2){
            fSeconds = "0"+fSeconds;
        }

        var fMinutes = String(Math.round(elapsed / 60));
        while(fMinutes.length < 2){
            fMinutes = "0"+fMinutes;
        }

        this.set("elapsedFormatted",fMinutes+":"+fSeconds);
    },
    incElapsedSeconds: function(){
        this.setElapsedSeconds(this.get("elapsed")+1);
    }
});

PlayerView = Backbone.Marionette.ItemView.extend({
    template: "#player-template",
    tagName: 'div',
    className: 'player',
    model: new Player(),
    events: {
        'click .pause': 'pause',
        'click .play': 'resume',
        'click .stop': 'stop'
    },
    pause: function(){

        this.clearInterval();

        this.model.set("status",0);
        this.render();
    },
    resume: function(){
        this.clearInterval();

        this.model.set("status",1);
        this.render();

        this.startInterval();
    },
    stop: function(){
        this.clearInterval();

        this.model.set("status",0);
        this.model.setElapsedSeconds(0);

        this.render();
    }
    ,
    play: function(song){
        this.clearInterval();

        var player = new Player();
        player.set("song",song);
        player.set("seconds",song.getSeconds());
        player.set("status",1);

        this.model = player;

        this.render();

        this.startInterval();
    },
    clearInterval:function(){
        var interval = this.model.get("interval");
        if(interval){
            clearInterval(interval);
        }
    }
    ,
    startInterval:function(){
        var view = this;
        this.model.set("interval",setInterval(
            function(){
                view.secondElapsed();
            }, 1000));
    }
    ,
    secondElapsed:function(){
        this.model.incElapsedSeconds();
        this.render();
    }

});

/* ------------------------ MAIN ----------------- */

MyApp.addInitializer(function(options){
    //PLAYER
    var playerView = new PlayerView();
    MyApp.playerRegion.show(playerView);

    //SONGS
    var songs = new Songs([]);
    var songsView = new SongsView({
        collection: songs
    });
    MyApp.songsRegion.show(songsView);
    songsView.on('childview:clickSong', function(event) {
        console.log("Read clickSong");
        var song = event.model;
        playerView.play(song);
    });

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