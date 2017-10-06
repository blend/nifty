class Invocation {
  Label: string;
  // Tx??
  // Conn??

  public Exec(statement: string) {}
  public Query(statement: string): Query {}

  public Get<T>(id: any) {}
  public GetAll<T>() {}
  public Create<T>(obj: T) {}
  public CreateMany<T>(objs: T[]) {}
  public Update<T>(obj: T) {}
  public Upsert<T>(obj: T) {}
  public Delete<T>(obj: T) {}
}
