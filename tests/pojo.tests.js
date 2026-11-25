import { recordTable } from '../src/index.js';

export const pojoTests = [
    {
        name: 'recordTable renders semantic rows for evaluate() POJO values',
        fn: () => {
            const html = recordTable({
                name: '<b>Alice</b>',
                ok: true,
                age: 34,
                tags: ['a', 'b'],
                nested: { x: 1 },
                when: new Date('2024-01-02T00:00:00Z'),
                empty: null
            });

            for (const part of [
                '<th scope="row">name</th>',
                '&#60;b&#62;Alice&#60;/b&#62;',
                '>true</td>',
                '>34</td>',
                '<ul><li>a</li><li>b</li></ul>',
                '<th scope="row">x</th><td>1</td>',
                '<time datetime="2024-01-02T00:00:00.000Z"',
                '<i>—</i>'
            ]) {
                if (!html.includes(part)) throw new Error(`missing ${part}`);
            }
        }
    },
    {
        name: 'recordTable uses own keys only',
        fn: () => {
            const html = recordTable({ constructor: 'ctor', toString: 7 });
            for (const part of ['<th scope="row">constructor</th>', '<th scope="row">toString</th>']) {
                if (!html.includes(part)) throw new Error(`missing ${part}`);
            }
            if (html.includes('[object Object]')) throw new Error('prototype member leaked');
        }
    },
    {
        name: 'recordTable handles empty containers, bigint and invalid dates',
        fn: () => {
            const html = recordTable({ list: [], obj: {}, big: 1n, when: new Date('bad') });
            for (const part of ['<i>empty</i>', '<i>invalid date</i>', '>1</td>']) {
                if (!html.includes(part)) throw new Error(`missing ${part}`);
            }
        }
    }
];
