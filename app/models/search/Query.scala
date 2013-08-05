package models.search

import play.api.libs.ws.WS
import scala.concurrent.ExecutionContext.Implicits.global

import play.api.libs.json._
import play.api.libs.functional.syntax._

import uritemplate._
import Syntax._

import models._

class Query(query: String, center: Option[Tuple2[Float, Float]] = None, radius: Option[Int] = None) {  
  val searchTemplate = URITemplate("http://search-controller.iweb.mapquest.com/search/v2/map{?query}&clientid=9013&center=(40.0378,-76.305801)&radius=10&clip=force&outFormat=json")
  
  implicit val addressReads: Reads[Address] = (
      (__ \ "AdminArea1").read[String] and
      (__ \ "AdminArea3").read[String] and
      (__ \ "AdminArea5").read[String] and
      (__ \ "PostalCode").readNullable[String] and
      (__ \ "Street").readNullable[String]
    )(Address)

  implicit val placeReads: Reads[Place] = (
    (__ \ "id").readNullable[String] and
    (__ \ "name").readNullable[String] and
    (__ \ "phone").readNullable[String] and
    (__ \ "GeoAddress").read[Address] and
    (__ \ "GeoAddress" \ "LatLng").read(
        (__ \ "Lat").read[Double] and
        (__ \ "Lng").read[Double]
        tupled
      )
  )(Place)

  def run() = {
    val searchURL = searchTemplate expand ("query" := this.query)
    WS.url(searchURL).get().map { response => (response.json \\ "results")(0).as[List[JsObject]].map(_.as[Place]) }
  }
}