import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

  val appName         = "map-results"
  val appVersion      = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    // Add your project dependencies here,
    jdbc,
    anorm,
    "no.arktekk" %% "uri-template" % "1.0.1"
  )


  val main = play.Project(appName, appVersion, appDependencies).settings (
    lessEntryPoints <<= baseDirectory(_ / "app" / "assets" / "stylesheets" ** "main.less"),
    requireJs += "main.js"
  )
}
