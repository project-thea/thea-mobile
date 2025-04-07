// const { withProjectBuildGradle } = require("@expo/config-plugins");

// // TODO; correct this to make it work!
// module.exports = function withAndroidStrategiesPlugin(config) {
//   return withProjectBuildGradle(config, (config) => {
//     config.modResults.contents += `plugins {
//       id 'io.realm.kotlin' version '1.16.0' apply false
//     }`;
//     return config;
//   });
// };


const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = function withAndroidStrategiesPlugin(config) {
  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    
    // Check if plugins block already exists
    if (contents.includes("plugins {")) {
      // Insert our plugin within the existing plugins block
      config.modResults.contents = contents.replace(
        /plugins\s*\{/,
        'plugins {\n    id \'io.realm.kotlin\' version \'1.16.0\' apply false'
      );
    } else {
      // Insert after the buildscript block closes with proper detection of the closing bracket
      const buildscriptPattern = /(buildscript\s*\{[\s\S]*?\n\})/;
      
      if (buildscriptPattern.test(contents)) {
        config.modResults.contents = contents.replace(
          buildscriptPattern,
          '$1\n\nplugins {\n    id \'io.realm.kotlin\' version \'1.16.0\' apply false\n}'
        );
      } else {
        // If no buildscript block, add at the beginning of the file
        config.modResults.contents = `plugins {\n    id 'io.realm.kotlin' version '1.16.0' apply false\n}\n\n` + contents;
      }
    }
    
    return config;
  });
};