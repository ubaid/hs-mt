const { expose } = require('threads/worker');
/*
Worker that removes playlists that are supposed to be removed.
*/
expose((playlists, changeset) => {
  const playlistsToDelete = changeset.map((item) => item.data.id);
  return playlists.filter((playlist) => !playlistsToDelete.includes(playlist.id));
});
