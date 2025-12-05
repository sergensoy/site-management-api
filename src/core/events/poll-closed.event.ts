export class PollClosedEvent {
  constructor(
    public readonly pollId: number,
    public readonly title: string,
    public readonly closedAt: Date,
  ) {}
}

