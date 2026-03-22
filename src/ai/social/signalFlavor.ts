import { Signal } from './types';

type Variants = Record<string, Record<string, string[]>>;

const FLAVOR: Variants = {
  'Honest Broker': {
    'lead': [
      "I've found solid evidence on {X}. I think we should all focus here.",
      "Listen up — I've got strong proof on {X}. Let's rally.",
      "I'm going all in on {X}. The evidence is there. Trust me.",
    ],
    'join': [
      "I've got something on {X}. Not much, but I'll pitch in.",
      "{X} looks promising. I'm willing to support it.",
      "I could help on {X} if others are heading that way.",
    ],
    'avoid': [
      "I'm still looking through my evidence. Nothing stands out yet.",
      "I don't have a strong lead right now. Staying flexible.",
      "Let's see what everyone else is thinking first.",
    ],
  },
  'Sociopath': {
    'lead': [
      "Trust me on {X}. I've got this locked down. Don't waste your time elsewhere.",
      "{X} is mine. Get on board or get left behind.",
      "I've got the goods on {X}. You'd be a fool not to follow.",
    ],
    'join': [
      "Yeah, I might look at {X}. Maybe. If I feel like it.",
      "I could swing by {X}. Don't read too much into it.",
      "{X} is... interesting. We'll see what happens.",
    ],
    'avoid': [
      "Mind your own business. I know what I'm doing.",
      "I don't need to tell you anything. Figure it out yourself.",
      "Why would I tip my hand? Play your own game.",
    ],
  },
  'Hustler': {
    'lead': [
      "I've been poking around {X}. Could be something big.",
      "{X} caught my eye. I might make a move. Or not.",
      "There's a play on {X}. Smart money's paying attention.",
    ],
    'join': [
      "I might drift toward {X}. No promises though.",
      "{X}? Sure, I could work with that. Maybe.",
      "I'll keep {X} in mind. Let's see how the wind blows.",
    ],
    'avoid': [
      "I'm keeping my options open. That's all I'll say.",
      "Not tipping my hand yet. Patience pays.",
      "Ask me later. I'm still reading the room.",
    ],
  },
  'Diplomat': {
    'lead': [
      "I'd like to propose we coordinate on {X}. I have evidence to share.",
      "Can we come together on {X}? I think there's a consensus opportunity.",
      "I've prepared a case for {X}. I hope we can find common ground.",
    ],
    'join': [
      "I see potential in {X}. I'm open to supporting the group there.",
      "If others are moving toward {X}, I'll lend my support.",
      "{X} seems reasonable. I'm inclined to cooperate.",
    ],
    'avoid': [
      "I'm weighing all options carefully. I want what's best for everyone.",
      "Let's hear from others before I commit to a direction.",
      "I'd rather listen than speak too soon. What do others think?",
    ],
  },
  'Paranoid': {
    'lead': [
      "I'm not saying where I'm going. Too many liars in this room.",
      "You want to know my plans? That's exactly what THEY would ask.",
      "I've seen things. I know things. That's all you need to know about {X}.",
    ],
    'join': [
      "I might follow someone... if I can trust them. Which I can't.",
      "Maybe {X}. Or maybe that's what they WANT me to say.",
      "I'll consider {X}, but I'm watching all of you.",
    ],
    'avoid': [
      "I don't trust any of you. I'm keeping my plans to myself.",
      "Everyone in this room is suspect. I'll play it safe.",
      "No comment. Last time I talked, I got burned.",
    ],
  },
  'Chameleon': {
    'lead': [
      "I like the energy around {X}. I'm heading that way.",
      "I've got a good feeling about {X}. Let's do this together.",
      "Seems like {X} is where the smart play is. I'm in.",
    ],
    'join': [
      "I'll follow the group's lead. {X} works for me.",
      "Wherever the momentum goes, I'll be there. {X} looks good.",
      "I'm flexible. {X} sounds like a solid plan.",
    ],
    'avoid': [
      "I'm waiting to see which way everyone leans first.",
      "Still deciding. I'll adapt to whatever makes sense.",
      "I go with the flow. Let me see where the flow goes.",
    ],
  },
};

export function signalToFlavor(
  signal: Signal,
  personalityName: string,
  conspiracyName: string
): string {
  const persona = FLAVOR[personalityName] ?? FLAVOR['Diplomat'];
  const variants = persona[signal.intent] ?? persona['avoid'];
  const template = variants[Math.floor(Math.random() * variants.length)];
  return template.replace(/\{X\}/g, conspiracyName);
}

export function formatSignalDisplay(
  signal: Signal,
  personalityName: string,
  conspiracyName: string
): string {
  const flavor = signalToFlavor(signal, personalityName, conspiracyName);
  return `The ${personalityName}: "${flavor}"`;
}
