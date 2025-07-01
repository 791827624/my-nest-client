export class JdyPayloadDto {
  op: string;
  data: Record<string, any>; // 任意JSON对象
  opTime: number;
}
