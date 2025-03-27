const { withAndroidManifest } = require('@expo/config-plugins');

function addForegroundServiceToManifest(androidManifest) {
  if (!androidManifest?.manifest?.application?.[0]) {
    androidManifest = {
      manifest: {
        application: [{}]
      }
    };
  }

  const mainApplication = androidManifest.manifest.application[0];
  
  if (!mainApplication.service) {
    mainApplication.service = [];
  }
  
  mainApplication.service.push({
    $: {
      'android:name': 'com.voximplant.foregroundservice.VIForegroundService',
      'android:foregroundServiceType': "dataSync|location",
      'android:exported': 'false'
    }
  });

  androidManifest?.manifest['uses-permission'].push({
    $: {
      'android:name': 'android.permission.POST_NOTIFICATIONS'
    },
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