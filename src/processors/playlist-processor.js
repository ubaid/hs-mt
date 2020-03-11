const {
  spawn,
  Pool,
  Worker,
} = require('threads');
const os = require('os');
const { PLAYLIST_ACTIONS } = require('../utils/common');

const WORKERS = new Map([
  [PLAYLIST_ACTIONS.ADD, './workers/playlists/add'],
  [PLAYLIST_ACTIONS.REMOVE, './workers/playlists/remove'],
  [PLAYLIST_ACTIONS.TAG, './workers/playlists/tag'],
]);
const CPU_COUNT = os.cpus().length;

/*
This class is responsible for dividing inputs into chunks, passing these chunks
to appropriate workers for processing, and aggregating the result of these workers 
for the final output. All the models are immutable and that makes distributing 
and processing chunks of data consistent.
"threads" package has been used to dispatch processing to worker threads so that the 
main thread remains free.
*/
export class PlaylistProcessor {
  constructor(userIds, songIds, playlistIds) {
    this.userIds = userIds;
    this.songIds = songIds;
    this.playlistIds = playlistIds;
  }

  async processAdd(playlists, changeset) {
    const newPlaylists = await this._process(changeset, [], WORKERS.get(PLAYLIST_ACTIONS.ADD),
      {
        songIds: this.songIds,
        userIds: this.userIds,
        playlistIds: this.playlistIds,
      });

    return [...playlists, ...newPlaylists];
  }

  async processRemove(playlists, changeset) {
    return this._process(playlists, changeset, WORKERS.get(PLAYLIST_ACTIONS.REMOVE), {});
  }

  async processTag(playlists, changeset) {
    return this._process(playlists, changeset, WORKERS.get(PLAYLIST_ACTIONS.TAG), { songIds: this.songIds });
  }

  async _process(workItems, changeset, worker, metadata) {
    const pool = Pool(() => spawn(new Worker(worker)));
    const tasks = new Set();
    //Just using number of CPUs to divide the workload for now.
    const range = Math.ceil((workItems.length) / CPU_COUNT);
    const partitions = workItems.length < CPU_COUNT ? workItems.length : CPU_COUNT;
    let start = 0;
    for (let i = 0; i < partitions; i++) {
      const s = start;
      tasks.add(pool.queue(async (worker) => await worker(workItems.slice(s, s + range), changeset, metadata)));
      start += range;
    }

    //Wait for all threads to process and combine these results.
    let result = await Promise.all(tasks);
    result = result.flat();
    await pool.completed(true);
    await pool.terminate();
    return result;
  }
}
