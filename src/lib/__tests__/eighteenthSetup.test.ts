import {parseEighteenthSetup} from '../eighteenthSetup';
const setup={name:' Sofia ',date:'2028-02-29',budget:1200.25};
it('accepts a real leap day, trims the name and keeps cents',()=>expect(parseEighteenthSetup(setup)).toEqual({name:'Sofia',event_date:'2028-02-29',total_budget:1200.25}));
it.each([-1,Infinity,NaN,1000000000,0.001])('rejects invalid budget %s',budget=>expect(parseEighteenthSetup({...setup,budget})).toBeNull());
it.each(['2027-02-29','2028-02-30','2028-13-01','invalid'])('rejects impossible date %s',date=>expect(parseEighteenthSetup({...setup,date})).toBeNull());
it('requires a name',()=>expect(parseEighteenthSetup({...setup,name:' '})).toBeNull());
