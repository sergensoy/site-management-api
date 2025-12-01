export class DebtCreatedEvent {
  constructor(
    public readonly debtId: number,
    public readonly userId: number,
    public readonly amount: number,
    public readonly dueDate: Date,
  ) {}
}

