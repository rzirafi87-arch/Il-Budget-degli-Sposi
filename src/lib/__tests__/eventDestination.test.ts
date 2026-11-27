import { eventDestination } from '../eventDestination';
it('opens the selected baptism by identity and preserves the locale',()=>{
 expect(eventDestination('fr',{eventType:'baptism',eventId:'event-b'})).toBe('/fr/battesimo?eventId=event-b');
});
it('keeps wedding on the shared dashboard',()=>{
 expect(eventDestination('it',{eventType:'wedding',eventId:'event-w'})).toBe('/it/dashboard');
});
