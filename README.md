### How To Run
Install latest Node.js. Refer [here](https://nodesource.com/blog/installing-nodejs-tutorial-mac-os-x/) or [here](https://dev.to/bettercodingacademy/here-s-how-to-install-node-js-in-under-5-minutes-3igi)

Open terminal/shell and navigate to the root directory of the project (hs-mt).
Install npm packages.
```
$ npm install
```

Run the CLI application like this
```
$ ./bin/hs-mt --m ./mixtape.json --c ./changes.json --o ./output.json
```
Use the following switches to provide inputs to the application

`--m` Path to the mixtape json file. If not provided, defaults to mixtape.json file in project root directory.

`--c` Path to the changes json file. If not provided, defaults to changes.json file in project root directory.

`--o` Path for the output json file. If not provided, defaults to output.json file in project root directory.



>Note: If there is a permission error in running the command, run the following to grant execute permission to the `cli` file:
```
$ chmod +x ./src/cli.js
```

>If you want to run the application with defaults (mixtape.json, changes.json and output.json files in the project root directory), just run
```
$ ./bin/hs-mt
```

### Assumptions
- Input files are valid. Their schema is consistent with the implementation. Checks can be implemented on schema consistency.
- The IDs of each entity in the mixtape.json file are unique.
- The IDs for new items are provided by the changes file. This might be acceptable when UUIDs are used as identifiers in a large scale system.


### Design
#### Changes file schema
In changes file schema each change is a discrete object of the format:
```
{
    "action": "add",
    "data": {
        "id": "4",
        "user_id": "1",
        "song_ids": ["1", "2"]
    }
}
``` 
The idea was to have these discrete so that if required, for large input, these changes can be read as a stream and processed as such. Practically, these changes would be events coming through an event bus or message queue that are processed by workers so each each event(object in the array) represents one change that is to be applied.

#### Processing
The input is broken into chunks and processed in parallel executing worker threads. The result of each thread's processing is combined to generate the final output for each change. Node's worker threads have been used for parallel processing in this application. 
In a large scale system, the workers could be subscribed to an event stream or queue and process events as they come. The workers can be scaled independently based on load.

#### Storage and Validation
Practically, the contents of mixtape.json, which is the current state of the system, could be in a persistent storage like a database. All validations of whether a song or user exists, or playlist already exist could be done by the workers against this storage. In the current implementation, these have been converted to in memory maps to quickly validate against the current state.

#### Alternate design considered
For the exercise, instead of using Node worker threads to create workers, there was an option to use an in memory queue (like `better-queue`) and have workers subscribe to it. In hindsight, might have been a little cleaner but the idea was similar.
