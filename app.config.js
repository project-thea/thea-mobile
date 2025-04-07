const IS_PREVIEW = process.env.APP_VARIANT === 'preview'

export default {
  name: IS_PREVIEW ? "THEAMobile(Preview)" : "THEAMobile",
  slug: "THEAMobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: IS_PREVIEW ? "./assets/images/icon_thea_mobile_dev.png" : "./assets/images/icon_thea_mobile.png",
  scheme: "theamobile",
  userInterfaceStyle: "automatic",
  splash: {
    image: IS_PREVIEW ? "./assets/images/splash_thea_mobile_dev.png" : "./assets/images/splash_thea_mobile.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    permissions: [
      "FOREGROUND_SERVICE",
      "FOREGROUND_SERVICE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_LOCATION",
    ],
    package: IS_PREVIEW ? "com.bodastage.thea.preview" : "com.bodastage.thea",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-location",
      {
        isAndroidForegroundServiceEnabled: true,
      },
    ],
    "./plugins/withAndroidForegroundService.js",
    "./plugins/withInjectProjectGradleBuildConfig.js"
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "adf6cd09-c75e-4178-94d8-1e9e9d04bba9",
    },
  },
};
