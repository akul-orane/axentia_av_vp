using my.app as app from '../db/schema';

service CatalogService {
  entity Products as projection on app.Products;
}
