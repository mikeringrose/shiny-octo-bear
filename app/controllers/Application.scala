package controllers

import play.api._
import play.api.mvc._

import models._

import models.search.{Query => MapQuery}

import models.route._

import scala.concurrent._
import scala.concurrent.ExecutionContext.Implicits.global

import play.api.libs.ws.WS

import uritemplate._
import Syntax._

import play.api.libs.json._

object Application extends Controller {

  def index = Action {
    Ok(views.html.index())
  }

  def search = Action { request =>
    val query = request queryString("query")

    Async {
      new MapQuery(query(0)).run().map { results => Ok(views.html.search(results)) }
    } 
  }

  def route = Action { request =>
    val from = request queryString("from")
    val to = request queryString("to")
    
    Async {
      new RouteRequest(from(0), to(0)).run().map { route => Ok(views.html.route(route)) }
    }
  }

  val exitTemplate = URITemplate("http://ps.web-integration.mapquest.com/exit/v1/exitpois{?key,inFormat,outFormat,maxDriveTime,routeSessionId}")

  def exits(id: String) = Action {
    var exitURL = exitTemplate expand ("key" := "Cmjtd|luu72h6t29,a5=o5-h625", "inFormat" := "kvp", "outFormat" := "4", "maxDriveTime" := "4", "routeSessionId" := id)

    Async {
      WS.url(exitURL).get().map { response  => Ok((response.json \ "ExitResponse" \ "exitPoisMap" \\ "exit").foldLeft(new JsArray()) { (accum, exit) => 
        val lodgingCount = (exit \ "lodgingCount").as[Option[Int]]
        if (lodgingCount == None) accum else accum:+exit 
      }.toString) }
    }
  }

  def map(id: Long) = Action {
    Ok(views.html.map(Place(Option("123"), Option("Hot Z's"), Option("717-451-7095"), Address("US", "PA", "Lancaster", Option("17601"), Option("Fruitville Pike")), (-39.0, -39.0))))
  }
}