export default class {
  private count: number = 0;

  public check(): boolean {
    if (this.count > 50) {
      console.error("Fetch Count > 50");
    }
    return this.count <= 50;
  }

  public add(): void {
    this.count++;
    if (!this.check()) {
      throw new Error("Fetch Count > 50");
    }
  }
};
