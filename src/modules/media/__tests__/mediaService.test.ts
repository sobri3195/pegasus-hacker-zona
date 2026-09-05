import {describe,expect,it} from 'vitest';
import {createPerceptualHashes,extractEntities} from '../mediaService';

describe('media intelligence helpers',()=>{
 it('creates stable 64-bit perceptual hashes',()=>{const pixels=new Uint8ClampedArray(32*32*4).fill(128);const hashes=createPerceptualHashes(pixels,32,32);expect(hashes.ahash).toHaveLength(16);expect(hashes.dhash).toHaveLength(16);expect(hashes.phash).toBe(hashes.ahash)});
 it('extracts typed OCR entities without identity inference',()=>{const entities=extractEntities('Contact +62 812 3456 7890, ops@example.org on 05/09/2026 at https://example.org/help');expect(entities).toEqual(expect.arrayContaining([{kind:'EMAIL',value:'ops@example.org'},{kind:'DOMAIN',value:'example.org'},{kind:'URL',value:'https://example.org/help'},{kind:'DATE',value:'05/09/2026'}]))});
});
