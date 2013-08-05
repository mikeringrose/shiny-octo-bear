package models

case class Place(
  id: Option[String] = None,
  name: Option[String] = None,
  phone: Option[String] = None,
  address: Address,
  geo: (Double, Double)
)
