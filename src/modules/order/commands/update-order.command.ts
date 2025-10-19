export class UpdateOrderCommand {
  constructor(
    public readonly id: string,
    public readonly status: string,
  ) {}
}
