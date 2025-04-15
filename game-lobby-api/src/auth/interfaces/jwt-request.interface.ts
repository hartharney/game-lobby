export interface JwtRequest extends Request {
  user: {
    userId: string;
    username: string;
  };
}
