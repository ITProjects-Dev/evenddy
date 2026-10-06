const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=85`;

export const images = {
  hero: photo("1519225421980-715cb0215aed"),
  food: photo("1515003197210-e0cd71810b5f"),
  decor: photo("1511578314322-379afb476865"),
  wedding: photo("1519741497674-611481863552"),
  party: photo("1492684223066-81342ee5ff30"),
  flowers: photo("1523438885200-e635ba2c371e"),
  dinner: photo("1519167758481-83f550bb49b3"),
  rings: photo("1511285560929-80b456fea0bc"),
  event: photo("1464366400600-7168b8af9bc3")
};

export const services = [
  { number:"01", title:"Catering", slug:"catering", image:images.food, description:"From intimate tables to grand feasts, delicious food is part of every great celebration." },
  { number:"02", title:"Decor", slug:"decor", image:images.decor, description:"Thoughtful styling, florals, lighting and beautiful details that transform your venue." },
  { number:"03", title:"Event Management", slug:"event-management", image:images.wedding, description:"From planning to execution, our team keeps your celebration moving smoothly." }
];

export const events = [
  { title:"A Garden Wedding", slug:"garden-wedding", category:"Wedding", image:images.wedding, description:"A warm, elegant celebration surrounded by florals and thoughtful details." },
  { title:"An Evening Celebration", slug:"evening-celebration", category:"Private Event", image:images.event, description:"An intimate evening designed around food, music and beautiful ambience." },
  { title:"Modern Birthday", slug:"modern-birthday", category:"Birthday", image:images.party, description:"A vibrant celebration with personalized styling and entertainment." },
  { title:"The Corporate Table", slug:"corporate-table", category:"Corporate", image:images.dinner, description:"A polished event experience built around connection and hospitality." }
];

export const stories = [
  { title:"How to bring your wedding vision to life", slug:"wedding-vision", category:"Weddings", image:images.rings },
  { title:"Fresh ideas that make an event feel uniquely yours", slug:"unique-event-ideas", category:"Décor", image:images.decor },
  { title:"Creating memorable menus for every celebration", slug:"memorable-menus", category:"Catering", image:images.food }
];

export const testimonials = [
  { text:"Evenddy made our wedding feel effortless. From the first conversation to the final detail, everything was beautifully handled.", name:"Ananya & Rohan", meta:"Wedding • Hyderabad" },
  { text:"The décor was exactly what we had imagined and the team was incredibly responsive throughout the process.", name:"Meghana Rao", meta:"Birthday • Bengaluru" },
  { text:"Our corporate event came together perfectly. Professional, thoughtful and very easy to work with.", name:"The Ivy Family", meta:"Corporate • Hyderabad" }
];

export const faqs = [
  { question:"What services does Evenddy offer?", answer:"Evenddy brings event planning, décor, catering, venue coordination and celebration experiences together in one place." },
  { question:"What kind of events do you plan?", answer:"We support weddings, birthdays, corporate events, private celebrations, dinners and other special occasions." },
  { question:"How early should I book?", answer:"For the smoothest planning experience, we recommend starting as early as possible, especially for larger events and peak dates." },
  { question:"How does pricing work?", answer:"Pricing depends on the event type, guest count, location, services and level of customization." },
  { question:"Can I customize the event?", answer:"Yes. Your event can be customized around your preferred style, colours, menu, décor, venue and experience." },
  { question:"Do you handle vendors?", answer:"Our planning workflow can coordinate the different teams involved in delivering your event." },
  { question:"How do I get started?", answer:"Choose Plan My Event, tell us about your celebration, and our team can help shape the next steps." }
];