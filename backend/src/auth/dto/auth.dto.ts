// Authentication DTOs

export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  email: string;
  password: string;
}

export class JwtPayload {
  sub: string; // user ID
  email: string;
}

export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
  };
}