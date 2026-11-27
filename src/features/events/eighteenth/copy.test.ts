import {partyLanguages,partyText,translations} from './copy';
import {emptyPartyPlan,partyInvitation,partyTasks} from './plan';
it('has every new field, error and task in each supported language',()=>{
 for(const [source,values] of Object.entries(translations)){expect(values).toHaveLength(4);for(const value of values)expect(value.trim()).not.toBe('');expect(partyText('it',source)).toBe(source);}
 for(const locale of partyLanguages)for(const task of partyTasks)expect(partyText(locale,task[2])).toBeTruthy();
});
it.each(partyLanguages)('localizes both invitation roles in %s without private notes',locale=>{
 const p={...emptyPartyPlan(),celebrant:'Sofia',venue:'Sala',address:'Via QA',startTime:'19:00',replyBy:'2030-05-01',replyContact:'RSVP',notes:'PRIVATE-NOTE'};
 const self=partyInvitation(p,'2030-05-18','Festa',locale);const organizer=partyInvitation({...p,role:'organizer'},'2030-05-18','Festa',locale);
 expect(self.ready).toBe(true);expect(organizer.ready).toBe(true);expect(self.text).not.toBe(organizer.text);expect(self.text).not.toContain(p.notes);expect(organizer.text).not.toContain(p.notes);
});
