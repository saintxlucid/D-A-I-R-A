import { validateOrReject } from 'class-validator';

export async function validateDto(dto: object) {
  await validateOrReject(dto);
}
