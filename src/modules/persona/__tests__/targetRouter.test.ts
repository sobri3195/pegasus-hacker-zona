import {describe,expect,it} from 'vitest';
import {classifyTarget} from '../targetRouter';

describe('target-type router',()=>{
 it('never classifies a normal multi-word human name as an organization',()=>expect(classifyTarget('Muhammad Sobri Maulana').type).toBe('person'));
 it('honors explicit commands over automatic detection',()=>expect(classifyTarget('example.com','person')).toMatchObject({type:'person',explicit:true}));
 it.each([['user@gmail.com','email'],['+628123456789','phone'],['example.org','domain'],['https://example.org/a','url'],['203.0.113.24','ip'],['@sobri3195','username']])('classifies %s as %s',(input,type)=>expect(classifyTarget(input).type).toBe(type));
 it('requires confirmation for an ambiguous organization-like name',()=>expect(classifyTarget('Universitas Indonesia')).toMatchObject({type:'ambiguous',candidates:['person','organization']}));
});
