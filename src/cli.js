const minimist = require('minimist');
const chalk = require('chalk');
const { PlaylistProcessor } = require('./processors/playlist-processor');
const { ChangesParser } = require('./changes-parser');
const { FileHelper } = require('./utils/file-helper');

const FILE_DEFAULTS = {
  m: './mixtape.json',
  c: './changes.json',
  o: './output.json',
};
/*
Entry point to the application.
*/
export async function cli() {
  try {
    //Read and validate CLI input
    const args = minimist(process.argv.slice(2), {
      default: FILE_DEFAULTS,
    });
    const mixtapeFilePath = args.m;
    const changesFilePath = args.c;
    const outputPath = args.o;
    validateInput(mixtapeFilePath, changesFilePath);

    //Load JSON files in memory
    const mixtape = loadFile(mixtapeFilePath);
    const changes = loadFile(changesFilePath);

    //Create maps for user ids, song ids and playlist ids.
    // These will be used for validations.
    // In a large system these validations would be done against a 
    // persistent store.
    const userIds = new Set(mixtape.users.map((x) => x.id));
    const songIds = new Set(mixtape.songs.map((x) => x.id));
    const playlistIds = new Set(mixtape.playlists.map((x) => x.id));

    //Parse the changes to be applied.
    const {
      additions,
      removals,
      tags,
    } = ChangesParser.Parse(changes.playlists);

    let { playlists } = mixtape;

    //Processor takes care of dispatching processing jobs to workers.
    //The order of the processing matters here to avoid unnecessary processing.
    const processor = new PlaylistProcessor(userIds, songIds, playlistIds);
    playlists = await processor.processRemove(playlists, removals);
    playlists = await processor.processAdd(playlists, additions);
    playlists = await processor.processTag(playlists, tags);
    mixtape.playlists = playlists;

    //Write output to file.
    FileHelper.Write(mixtape, outputPath);
  } catch (err) {
    console.log(chalk.red(`Error in processing: ${err}`));
  }
}

function validateInput(mixtapePath, changesPath) {
  if (!FileHelper.FileExists(mixtapePath)) {
    console.log(chalk.red(`Incorrect mixtape.json file path: ${mixtapePath}`));
    process.exit();
  }
  if (!FileHelper.FileExists(changesPath)) {
    console.log(chalk.red(`Incorrect changes.json file path: ${changesPath}`));
    process.exit();
  }
}

function loadFile(filePath) {
  try {
    return FileHelper.Read(filePath);
  } catch (err) {
    console.log(chalk.red(`Error in loading file: ${filePath}`));
    process.exit();
  }
}
