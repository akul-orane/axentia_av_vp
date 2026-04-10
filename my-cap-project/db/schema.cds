namespace my.app;

entity Products {
  key ID   : UUID;
  name     : String(100);
  price    : Decimal(10, 2);
  stock    : Integer;
}

/** Application users (custom auth). passwordHash is bcrypt; never expose via OData. */
entity AuthUser {
  key username     : String(255);
      passwordHash : String(255) @mandatory;
      role         : String(64) @mandatory;
      lastLogin    : DateTime;
      active       : Boolean default true;
}