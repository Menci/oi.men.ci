const tape = require('tape');
const mjpage = require('../lib/main.js').mjpage;

tape('Callback function should be called if last equation fails rendering', function(t) {
    t.plan(2);

    const input1 = `
        $$\\Menci$$
        $$\\mathrm{Menci}$$
    `;
    mjpage(input1, {}, {
        svg: true
    }, function(output) {
        t.ok(true, 'Reached callback function when last equation succeeds');
    });

    const input2 = `
        $$\\mathrm{Menci}$$
        $$\\Menci$$
    `;
    let finished = false;
    const timer = setTimeout(() => {
        if (!finished) t.ok(false, 'Not reached callback function after 2000ms when last equation fails')
    }, 2000);
    mjpage(input2, {}, {
        svg: true
    }, function(output) {
        if (finished) return;
        clearTimeout(timer);
        t.ok(true, 'Reached callback function when last equation fails');
    });
});
