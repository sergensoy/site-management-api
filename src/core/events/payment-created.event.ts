export class PaymentCreatedEvent {
  constructor(
    public readonly paymentId: number,
    public readonly userId: number,
    public readonly debtId: number,
    public readonly amount: number,
  ) {}
}

