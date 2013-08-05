package models

case class Address(
  addressCountry: String,
  addressLocality: String,
  addressRegion: String,
  postalCode: Option[String] = None,
  streetAddress: Option[String] = None
)