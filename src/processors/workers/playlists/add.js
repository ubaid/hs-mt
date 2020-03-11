const { expose } = require('threads/worker');
/*
Worker that validates whether a playlist can be added and returns an array
of valid playlists.
*/
expose((playlistsToAdd, changeset, { userIds, songIds, playlistIds }) => {
  const validPlaylists = new Array();
  for (let i = 0; i < playlistsToAdd.length; i++) {
    const playlist = playlistsToAdd[i].data;
    // Check user exists and playlist doesn't exist.
    if (!userIds.has(playlist.user_id) || playlistIds.has(playlist.id)) {
      continue;
    }
    //Filter songs that don't exist.
    const songs = playlist.song_ids.filter((id) => songIds.has(id));
    if (!songs || songs.length < 1) {
      continue;
    }
    playlist.song_ids = songs;
    validPlaylists.push(playlist);
  }

  return validPlaylists;
});
