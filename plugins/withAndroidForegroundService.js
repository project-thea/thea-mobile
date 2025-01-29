const { withAndroidManifest } = require('@expo/config-plugins');

function addForegroundServiceToManifest(androidManifest) {
  // Make sure we have the required structure
  if (!androidManifest?.manifest?.application?.[0]) {
    androidManifest = {
      manifest: {
        application: [{}]
      }
    };
  }

  const mainApplication = androidManifest.manifest.application[0];
  
  // Add the service
  if (!mainApplication.service) {
    mainApplication.service = [];
  }
  
  mainApplication.service.push({
    $: {
      'android:name': 'com.voximplant.foregroundservice.VIForegroundService',
      'android:foregroundServiceType': "dataSync",
      'android:exported': 'false'
    }
  });

  androidManifest?.manifest['uses-permission'].push({
    $: {
      'android:name': 'android.permission.FOREGROUND_SERVICE_DATA_SYNC'
    }
  });

  return androidManifest;
}

module.exports = function withAndroidForegroundService(config) {
  return withAndroidManifest(config, (config) => {
    // Initialize modResults if it doesn't exist
    if (!config.modResults) {
      config.modResults = {
        manifest: {
          application: [{}]
        }
      };
    }

    // Add the service
    config.modResults = addForegroundServiceToManifest(config.modResults);
    
    return config;
  });
};