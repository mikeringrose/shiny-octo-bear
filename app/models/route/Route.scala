package models.route

import models._

case class Route(
  sessionId: String,
  distance: Float,
  hasHighway: Boolean = false,
  shapePoints: List[Float],
  locations: List[Place],
  legs: List[Leg]
)