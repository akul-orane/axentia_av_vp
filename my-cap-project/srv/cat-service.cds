using my.app from '../db/schema';

service CatalogService {
  entity Products as projection on my.app.Products;
}
