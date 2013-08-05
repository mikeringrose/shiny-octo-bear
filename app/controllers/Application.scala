package controllers

import play.api._
import play.api.mvc._

import models._

import models.search.{Query => MapQuery}

import models.route._

import scala.concurrent._
import scala.concurrent.ExecutionContext.Implicits.global

import play.api.libs.ws.WS

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

  def map(id: Long) = Action {
    Ok(views.html.map(Place(Option("123"), Option("Hot Z's"), Option("717-451-7095"), Address("US", "PA", "Lancaster", Option("17601"), Option("Fruitville Pike")), (-39.0, -39.0))))
  }
}