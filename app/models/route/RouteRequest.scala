package models.route

import models._

import play.api.libs.ws.WS
import scala.concurrent.ExecutionContext.Implicits.global

import play.api.libs.json._
import play.api.libs.functional.syntax._

import uritemplate._
import Syntax._

class RouteRequest(from: String, to: String) {  
  val routeTemplate = URITemplate("http://www.mapquestapi.com/directions/v1/route{?key,from,to,shapeFormat,generalize,ambiguities}")

  implicit val maneuverReads: Reads[Maneuver] = (
    (__ \ "distance").read[Float] and
    (__ \ "narrative").read[String]
  )(Maneuver)

  implicit val legReads: Reads[Leg] = (
    (__ \ "index").read[Int] and
    (__ \ "origNarrative").read[String] and
    (__ \ "destNarrative").read[String] and
    (__ \ "hasHighway").read[Boolean] and
    (__ \ "maneuvers").read[List[Maneuver]]
  )(Leg)

  implicit val addressReads: Reads[Address] = (
    (__ \ "adminArea1").read[String] and
    (__ \ "adminArea3").read[String] and
    (__ \ "adminArea5").read[String] and
    (__ \ "postalCode").readNullable[String] and
    (__ \ "street").readNullable[String]    
  )(Address)

  implicit val placeReads: Reads[Place] = (
    (__ \ "id").readNullable[String] and
    (__ \ "name").readNullable[String] and
    (__ \ "phone").readNullable[String] and
    (__).read[Address] and
    (__ \ "latLng").read(
        (__ \ "lat").read[Double] and
        (__ \ "lng").read[Double]
        tupled
      )
  )(Place)

  implicit val routeReads: Reads[Route] = (
    (__ \ "sessionId").read[String] and
    (__ \ "distance").read[Float] and
    (__ \ "shape" \ "shapePoints").read[List[Float]] and
    (__ \ "locations").read[List[Place]] and
    (__ \ "legs").read[List[Leg]]
  )(Route)

  def run() = {
    val routeURL = routeTemplate expand ("key" := "mjtd|luu72h6t29,a5=o5-h625", "from" := this.from, "to" := this.to, "shapeFormat" := "raw", "generalize" := "0", "ambiguities" := "ignore")
    WS.url(routeURL).get().map { response  => (response.json \ "route").as[Route] }
  }
}