package models.route

import models._

case class Leg(
  index: Int,
  origNarrative: String,
  destnNarrative: String,
  hasHighways: Boolean,
  maneuvers: List[Maneuver]
)

case class Maneuver(
  distance: Float,
  narrative: String
)