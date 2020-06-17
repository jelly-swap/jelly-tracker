import { AnyRecord } from 'dns';

export const pick = (...props: any[]) => (o: any) => props.reduce((a: any, e: any) => ({ ...a, [e]: o[e] }), {});
