const { PLAYLIST_ACTIONS } = require('./utils/common');

//Parses changes into buckets of actions.
//In a large distributed system, thise changes would 
//probably be individual events passing through an event stream 
//or message queue that need to be processed. 
export class ChangesParser {
  static Parse(changes) {
    const additions = new Array();
    const removals = new Array();
    const tags = new Array();
    changes.forEach((item) => {
      switch (item.action) {
        case PLAYLIST_ACTIONS.ADD:
          additions.push(item);
          break;
        case PLAYLIST_ACTIONS.REMOVE:
          removals.push(item);
          break;
        case PLAYLIST_ACTIONS.TAG:
          tags.push(item);
          break;
      }
    });

    return {
      additions,
      removals,
      tags,
    };
  }
}
