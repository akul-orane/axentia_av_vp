using my.app as app from '../db/schema';

@path: 'auth'
service AuthService {
  /** Public login — call via POST .../login */
  action login(username: String, password: String) returns {
    authenticated : Boolean;
    username      : String;
    role          : String;
    token         : String;
    message       : String;
  };

  /** User directory without secrets (for admin UIs); passwordHash never projected */
  @readonly
  entity Users as projection on app.AuthUser {
    key username,
        role,
        lastLogin,
        active
  };
}
