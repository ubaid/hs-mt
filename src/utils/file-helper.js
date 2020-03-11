const fs = require('fs');

export class FileHelper {
  static Read(path) {
    const jsonString = fs.readFileSync(path);
    return JSON.parse(jsonString);
  }

  static Write(content, path) {
    fs.writeFileSync(path, JSON.stringify(content));
  }

  static FileExists(filePath) {
    return fs.existsSync(filePath);
  }
}
