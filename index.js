let fs = require('fs');
let sha1 = require('sha1');

const FONT = "font.ttf";
const ID = "urn:uuid:C5C9DF64-F8CB-4E65-90C4-4585F5DED9A0";
const hash = sha1(ID);

console.log("hash", hash);

let reader = new Promise((res, rej) => {

    fs.open(FONT, 'r', (err, fd) => {
        if (err) {
            rej('Error!');
        } else {
            const stat = fs.statSync(FONT);
            let chunk = Buffer.alloc(1040);
            let rest = Buffer.alloc(stat.size - 1040);
            fs.read(fd, chunk, 0, 1040, 0, (err, num) => {
                chunk.toString('utf8', 0, num);
            });
            fs.read(fd, rest, 0, stat.size - 1040, 1040, (err, num) => {
                rest.toString('utf8', 0, num);
            });
            res([chunk, rest]);
        }
    });
});

reader.then(data => { 

    const [ chunk, rest ] = data;
    const h = Buffer.from(hash, 'hex');

    let op = Buffer.alloc(0);
    let k = 0;

    for (let i = 0; i < 52; i++) {
        for (let j = 0; j < 20; j++) {
            const bitwise = (chunk[k] ^ h[j]);
            const r = Buffer.from([bitwise], 'hex');
            op = Buffer.concat([op, r])
            k += 1;
        }
    }

    console.log(">>>", op.length);
    console.log(op);

    const final = Buffer.concat([op, rest])

    fs.writeFile('out.ttf', final, (err) => {
        if (err) throw err;
        console.log('Hecho!');
      });

 });