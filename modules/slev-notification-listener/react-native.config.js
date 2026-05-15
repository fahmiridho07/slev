module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: "./android",
        packageImportPath: "import com.slev.notification.SlevNotificationListenerPackage;",
        packageInstance: "new SlevNotificationListenerPackage()"
      }
    }
  }
};
