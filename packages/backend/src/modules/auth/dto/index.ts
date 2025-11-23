export class CreateUserDto {
  email: string
  password: string
  username: string
  displayName: string
}

export class LoginDto {
  email: string
  password: string
}
