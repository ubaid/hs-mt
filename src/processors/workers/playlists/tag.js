const { expose } = require('threads/worker');
/*
Worker that adds songs to a playlist.
*/
expose((playlists, changeset, { songIds }) => {
  for (let j = 0; j < changeset.length; j++) {
    const change = changeset[j];
    const playlist = playlists.find((item) => item.id === change.data.id);
    if (!playlist) {
      continue;
    }

    for (let i = 0; i < change.data.song_ids.length; i++) {
      const songId = change.data.song_ids[i];
      if (songIds.has(songId) && !playlist.song_ids.includes(songId)) {
        playlist.song_ids.push(songId);
      }
    }
  }
  return playlists;
});
